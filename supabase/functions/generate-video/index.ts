import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Generating video with prompt:', prompt)

    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!hfToken) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN not configured')
    }

    // Use Hugging Face Router endpoint for text-to-video
    const endpoint = 'https://router.huggingface.co/hf-inference/models/ali-vilab/text-to-video-ms-1.7b'

    // Simple retry loop to handle model cold starts (503 / loading)
    const maxAttempts = 8
    let attempt = 0
    let response: Response | null = null

    while (attempt < maxAttempts) {
      attempt++
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
          'Accept': 'video/mp4'
        },
        body: JSON.stringify({ inputs: prompt })
      })

      const contentType = response.headers.get('content-type') || ''

      if (response.ok && contentType.includes('video')) {
        break // success
      }

      // Read body for error details
      const text = await response.text()
      let shouldRetry = response.status === 503 || response.status === 202
      try {
        const parsed = JSON.parse(text)
        if (/loading/i.test(parsed?.error || '')) {
          shouldRetry = true
        }
      } catch { /* not JSON, keep default */ }

      if (!shouldRetry || attempt >= maxAttempts) {
        console.error('Hugging Face API error:', response.status, text)
        throw new Error(`Video generation failed: ${text}`)
      }

      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000)
      console.log(`Model loading (status ${response.status}). Retrying in ${delay}ms... [${attempt}/${maxAttempts}]`)
      await new Promise((r) => setTimeout(r, delay))
    }

    if (!response || !response.ok) {
      throw new Error('Video generation failed: unknown error')
    }

    // Get the video blob and convert to base64 in chunks
    const videoBlob = await response.blob()
    const arrayBuffer = await videoBlob.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    const chunkSize = 0x8000 // Process 32KB at a time
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length))
      binary += String.fromCharCode(...chunk)
    }
    const base64 = btoa(binary)

    console.log('Video generated successfully')

    return new Response(
      JSON.stringify({ video: `data:video/mp4;base64,${base64}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating video:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate video', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
