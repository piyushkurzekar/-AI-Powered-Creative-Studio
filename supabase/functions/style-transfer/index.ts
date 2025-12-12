import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { image, style, customPrompt } = await req.json()

    if (!image || !style) {
      return new Response(
        JSON.stringify({ error: 'Image and style are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Style prompts mapping - strong explicit style transformation commands
    const stylePrompts: Record<string, string> = {
      'van_gogh': 'COMPLETELY TRANSFORM this image into Van Gogh painting style. Use thick swirling brushstrokes like Starry Night. Apply vibrant yellows, deep blues, and visible paint texture. Make it look like an actual Van Gogh oil painting, NOT a photo.',
      'picasso': 'COMPLETELY TRANSFORM this image into Pablo Picasso cubist style. Break down the subject into geometric angular shapes. Use bold flat colors. Make faces and objects fragmented and abstract like Guernica or Les Demoiselles d\'Avignon. NOT realistic.',
      'monet': 'COMPLETELY TRANSFORM this image into Claude Monet impressionist painting. Use soft dappled brushstrokes, dreamy light effects, pastel colors blending together. Make it look like a Water Lilies painting. NOT a photograph.',
      'anime': 'COMPLETELY TRANSFORM this image into Japanese anime style. Use clean bold outlines, flat cel-shaded colors, large expressive eyes, simplified features. Make it look like a Studio anime screenshot. NOT realistic.',
      'oil_painting': 'COMPLETELY TRANSFORM this image into classical Renaissance oil painting style. Add rich textures, dramatic chiaroscuro lighting, visible brushwork like Rembrandt or Vermeer. Make it look like an old master painting.',
      'watercolor': 'COMPLETELY TRANSFORM this image into watercolor painting. Use translucent washes of color that bleed and blend, soft edges, paper texture showing through. Make it look hand-painted with watercolors, NOT digital.',
      'pixel_art': 'COMPLETELY TRANSFORM this image into retro pixel art style. Use visible chunky pixels, limited 8-bit color palette, no anti-aliasing. Make it look like classic Nintendo or arcade game graphics.',
      'disney': 'COMPLETELY TRANSFORM this image into classic Disney 2D animation style. Use smooth clean outlines, exaggerated expressions, vibrant saturated colors. Make it look like a frame from a Disney animated movie.',
      'ghibli': 'COMPLETELY TRANSFORM this image into Studio Ghibli anime style. Use soft hand-painted watercolor backgrounds, gentle colors, whimsical dreamy atmosphere like Spirited Away or Totoro.',
      'simpsons': 'COMPLETELY TRANSFORM this image into The Simpsons cartoon style. Make skin yellow, use thick black outlines, overbite on characters, simplified cartoon features, bright flat colors. Make it look like a Simpsons episode frame.',
      '3d_render': 'COMPLETELY TRANSFORM this image into Pixar/Disney 3D animation style. Use smooth plastic-like textures, exaggerated proportions, dramatic cinematic lighting like a modern animated movie.',
    }

    const stylePrompt = customPrompt || stylePrompts[style] || 'COMPLETELY TRANSFORM this image into an artistic masterpiece with a distinctive style.'
    const prompt = `${stylePrompt} Keep the same subject and composition but COMPLETELY change the visual style. This must look like art, NOT like the original photo.`

    console.log('Processing style transfer with prompt:', prompt)

    // Call Lovable AI Gateway with Gemini image model
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ],
        modalities: ['image', 'text']
      })
    })

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        )
      }
      const errorText = await response.text()
      console.error('Lovable AI error:', response.status, errorText)
      throw new Error(`AI gateway error: ${response.status}`)
    }

    const result = await response.json()
    const styledImageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url

    if (!styledImageUrl) {
      console.error('No image in response:', JSON.stringify(result))
      throw new Error('AI failed to generate styled image')
    }

    console.log('Style transfer completed successfully')

    return new Response(
      JSON.stringify({ 
        styledImage: styledImageUrl,
        style: style 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Style transfer error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Style transfer failed', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
