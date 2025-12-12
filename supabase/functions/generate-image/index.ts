import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageRequest {
  prompt: string;
  model?: string;
  size?: string;
  quality?: string;
  negative_prompt?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model = "flux", size = "1024x1024", quality = "hd", negative_prompt }: ImageRequest = await req.json();
    
    console.log(`Generating image with model: ${model}`, { prompt, size, quality });

    if (model === "gemini") {
      return await generateWithGemini(prompt);
    } else {
      return await generateWithHuggingFace(prompt, negative_prompt);
    }
  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function generateWithGemini(prompt: string) {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!apiKey) {
    throw new Error('Lovable API key not configured');
  }

  console.log('Calling Gemini image generation model');
  
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [
        {
          role: "user",
          content: `Generate a high-quality, detailed image based on this description: ${prompt}`
        }
      ],
      modalities: ["image", "text"]
    })
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (response.status === 402) {
      throw new Error("Usage limit reached. Please add credits to continue.");
    }
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${errorText}`);
  }

  const result = await response.json();
  const imageData = result?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (!imageData) {
    console.error('No image in response:', JSON.stringify(result));
    throw new Error('No image data received from Gemini');
  }

  console.log('Successfully generated image with Gemini');

  return new Response(JSON.stringify({
    image_url: imageData,
    model: 'Gemini Flash',
    prompt: prompt
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateWithHuggingFace(prompt: string, negative_prompt?: string) {
  try {
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    
    if (!hfToken) {
      throw new Error('Hugging Face access token not configured');
    }

    console.log('Calling Hugging Face FLUX model');
    
    const fullPrompt = negative_prompt 
      ? `${prompt}, avoiding: ${negative_prompt}`
      : prompt;

    const endpoint = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';

    const maxAttempts = 8;
    let attempt = 0;
    let response: Response | null = null;

    while (attempt < maxAttempts) {
      attempt++;
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
          'Accept': 'image/png'
        },
        body: JSON.stringify({ inputs: fullPrompt })
      });

      const contentType = response.headers.get('content-type') || '';

      if (response.ok && contentType.includes('image')) {
        break;
      }

      const text = await response.text();
      let shouldRetry = response.status === 503 || response.status === 202;
      try {
        const parsed = JSON.parse(text);
        if (/loading/i.test(parsed?.error || '')) {
          shouldRetry = true;
        }
      } catch { /* not JSON */ }

      if (!shouldRetry || attempt >= maxAttempts) {
        console.error('Hugging Face API error:', response.status, text);
        throw new Error(`Image generation failed: ${text}`);
      }

      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
      console.log(`Model loading (status ${response.status}). Retrying in ${delay}ms... [${attempt}/${maxAttempts}]`);
      await new Promise((r) => setTimeout(r, delay));
    }

    if (!response || !response.ok) {
      throw new Error('Image generation failed: unknown error');
    }

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log('Successfully generated image with Hugging Face FLUX');

    return new Response(JSON.stringify({
      image_url: dataUrl,
      model: 'FLUX.1-schnell',
      prompt: prompt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Hugging Face image generation error:', error);
    throw error;
  }
}
