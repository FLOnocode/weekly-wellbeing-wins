import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      )
    }

    // Get environment variables
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL")
    const N8N_SECRET_KEY = Deno.env.get("N8N_SECRET_KEY")

    if (!N8N_WEBHOOK_URL || !N8N_SECRET_KEY) {
      console.error("Missing environment variables:", {
        hasWebhookUrl: !!N8N_WEBHOOK_URL,
        hasSecretKey: !!N8N_SECRET_KEY,
      })
      
      return new Response(
        JSON.stringify({ 
          error: "Configuration error: Missing webhook URL or secret key" 
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      )
    }

    // Parse the incoming request body
    const requestData = await req.json()
    
    console.log("Relaying request to n8n:", {
      url: N8N_WEBHOOK_URL,
      hasData: !!requestData,
      messageLength: requestData?.message?.length || 0,
    })

    // Forward the request to n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": N8N_SECRET_KEY,
      },
      body: JSON.stringify(requestData),
    })

    // Get the response from n8n
    const responseText = await n8nResponse.text()
    
    console.log("n8n response:", {
      status: n8nResponse.status,
      hasResponse: !!responseText,
      responseLength: responseText.length,
    })

    // Parse the response as JSON if possible, otherwise return as text
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { message: responseText }
    }

    // Return the n8n response to the client
    return new Response(
      JSON.stringify(responseData),
      {
        status: n8nResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error("Error in relay-to-n8n function:", error)
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: "Une erreur s'est produite lors du traitement de votre demande. Veuillez réessayer."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    )
  }
})