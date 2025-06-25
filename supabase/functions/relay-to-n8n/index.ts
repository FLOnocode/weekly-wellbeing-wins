const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Fallback nutrition responses when n8n is not configured
const nutritionFallbacks = [
  "Pour une alimentation équilibrée, je recommande de privilégier les légumes verts, les protéines maigres et les céréales complètes. Essayez d'inclure 5 portions de fruits et légumes par jour ! 🥬🍎",
  "Conseil nutrition : Buvez beaucoup d'eau (au moins 8 verres par jour) et limitez les aliments transformés. Les aliments riches en fibres comme les légumineuses sont excellents pour la satiété ! 💧🫘",
  "Pour maintenir un poids santé, privilégiez les repas faits maison avec des ingrédients frais. N'oubliez pas les bonnes graisses comme l'avocat, les noix et l'huile d'olive ! 🥑🌰",
  "Astuce nutrition : Mangez lentement et écoutez vos signaux de satiété. Ajoutez des épices et herbes fraîches pour rehausser le goût sans calories supplémentaires ! 🌿✨",
  "Pour une énergie stable, combinez protéines et glucides complexes à chaque repas. Pensez quinoa + légumes + protéines, c'est parfait ! 🍽️⚡"
]

function getRandomNutritionAdvice(): string {
  return nutritionFallbacks[Math.floor(Math.random() * nutritionFallbacks.length)]
}

function generateContextualResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('photo') || lowerMessage.includes('image') || lowerMessage.includes('repas')) {
    return "Merci pour cette photo ! Pour analyser votre repas, je recommande de vérifier l'équilibre : 1/2 de légumes, 1/4 de protéines maigres, 1/4 de glucides complexes. Les couleurs variées dans l'assiette sont un bon indicateur de diversité nutritionnelle ! 📸🥗"
  }
  
  if (lowerMessage.includes('poids') || lowerMessage.includes('maigrir') || lowerMessage.includes('perdre')) {
    return "Pour une perte de poids saine, créez un déficit calorique modéré en privilégiant les aliments nutritifs et rassasiants. Combinez alimentation équilibrée et activité physique régulière. Patience et constance sont clés ! ⚖️💪"
  }
  
  if (lowerMessage.includes('recette') || lowerMessage.includes('cuisine') || lowerMessage.includes('préparer')) {
    return "Voici une idée de repas équilibré : Saumon grillé avec quinoa et légumes rôtis, assaisonnés à l'huile d'olive et aux herbes. Simple, savoureux et nutritif ! Pour le dessert, optez pour des fruits frais avec un yaourt grec. 🐟🥬"
  }
  
  if (lowerMessage.includes('petit-déjeuner') || lowerMessage.includes('matin')) {
    return "Un petit-déjeuner équilibré pourrait inclure : flocons d'avoine avec fruits frais et noix, ou œufs brouillés avec avocat sur pain complet. N'oubliez pas de vous hydrater dès le réveil ! 🥣🥚"
  }
  
  if (lowerMessage.includes('sport') || lowerMessage.includes('exercice') || lowerMessage.includes('entraînement')) {
    return "Avant l'exercice, privilégiez des glucides facilement digestibles (banane, dattes). Après l'entraînement, combinez protéines et glucides pour la récupération (smoothie protéiné avec fruits). Hydratez-vous bien ! 🏃‍♀️🍌"
  }
  
  if (lowerMessage.includes('eau') || lowerMessage.includes('hydrat')) {
    return "L'hydratation est cruciale ! Visez 8-10 verres d'eau par jour. Vous pouvez varier avec des tisanes, eau infusée aux fruits, ou eau pétillante. Les fruits et légumes riches en eau comptent aussi ! 💧🍉"
  }
  
  // Default response
  return getRandomNutritionAdvice()
}

function extractMessageFromN8nResponse(responseText: string): string {
  console.log("🔍 Raw n8n response text:", responseText)
  console.log("🔍 Response text length:", responseText.length)
  console.log("🔍 Response text type:", typeof responseText)

  // If the response is empty or just whitespace, return fallback
  if (!responseText || responseText.trim().length === 0) {
    console.log("⚠️ Empty response from n8n, using fallback")
    return getRandomNutritionAdvice()
  }

  // Try to parse as JSON first
  try {
    const jsonResponse = JSON.parse(responseText)
    console.log("✅ Successfully parsed n8n response as JSON:", jsonResponse)
    console.log("🔍 JSON response type:", typeof jsonResponse)
    console.log("🔍 JSON response keys:", Object.keys(jsonResponse || {}))

    // Try different common message keys
    const possibleMessageKeys = ['message', 'response', 'text', 'output', 'result', 'content', 'data']
    
    for (const key of possibleMessageKeys) {
      if (jsonResponse && typeof jsonResponse === 'object' && jsonResponse[key]) {
        const messageValue = jsonResponse[key]
        if (typeof messageValue === 'string' && messageValue.trim().length > 0) {
          console.log(`✅ Found message in key '${key}':`, messageValue)
          return messageValue.trim()
        }
      }
    }

    // If it's a simple string value in JSON
    if (typeof jsonResponse === 'string' && jsonResponse.trim().length > 0) {
      console.log("✅ n8n response is a JSON string:", jsonResponse)
      return jsonResponse.trim()
    }

    // If it's an object but no message found, stringify it
    if (jsonResponse && typeof jsonResponse === 'object') {
      console.log("⚠️ JSON object found but no message key, stringifying")
      return JSON.stringify(jsonResponse)
    }

  } catch (parseError) {
    console.log("⚠️ Failed to parse n8n response as JSON:", parseError)
    console.log("🔄 Treating as plain text response")
  }

  // If not JSON or JSON parsing failed, treat as plain text
  const trimmedText = responseText.trim()
  if (trimmedText.length > 0) {
    console.log("✅ Using n8n response as plain text:", trimmedText)
    return trimmedText
  }

  // Final fallback
  console.log("❌ No valid content found in n8n response, using fallback")
  return getRandomNutritionAdvice()
}

Deno.serve(async (req: Request) => {
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

    // Parse the incoming request body
    const requestData = await req.json()
    const userMessage = requestData?.message || ""

    console.log("📨 Received request:", {
      hasData: !!requestData,
      messageLength: userMessage.length,
      message: userMessage.substring(0, 100) + (userMessage.length > 100 ? "..." : "")
    })

    // Get environment variables - check for the correct secret name
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL") || Deno.env.get("N8N_RELAY_SSM_2K_CHALLENGE")
    const N8N_SECRET_KEY = Deno.env.get("N8N_SECRET_KEY")

    console.log("🔧 Environment check:", {
      hasWebhookUrl: !!N8N_WEBHOOK_URL,
      hasSecretKey: !!N8N_SECRET_KEY,
      webhookUrlLength: N8N_WEBHOOK_URL?.length || 0
    })

    // If n8n is not configured, provide fallback nutrition advice
    if (!N8N_WEBHOOK_URL) {
      console.log("⚠️ N8N not configured (no webhook URL), providing fallback nutrition advice")
      
      const fallbackResponse = generateContextualResponse(userMessage)
      
      return new Response(
        JSON.stringify({ 
          message: fallbackResponse,
          source: "fallback",
          note: "Service de conseil nutrition en mode local. Pour des conseils personnalisés avancés, configurez l'intégration n8n."
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      )
    }

    console.log("🚀 Relaying request to n8n:", {
      url: N8N_WEBHOOK_URL.substring(0, 50) + "...",
      hasData: !!requestData,
      messageLength: userMessage.length,
    })

    // Prepare headers for n8n request
    const n8nHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Add secret key if available
    if (N8N_SECRET_KEY) {
      n8nHeaders["x-secret-key"] = N8N_SECRET_KEY
      console.log("🔐 Added secret key to n8n request")
    }

    // Forward the request to n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: n8nHeaders,
      body: JSON.stringify(requestData),
    })

    // Get the response from n8n
    const responseText = await n8nResponse.text()
    
    console.log("📥 n8n response received:", {
      status: n8nResponse.status,
      statusText: n8nResponse.statusText,
      hasResponse: !!responseText,
      responseLength: responseText.length,
      contentType: n8nResponse.headers.get("content-type")
    })

    // If n8n request fails, provide fallback
    if (!n8nResponse.ok) {
      console.log("❌ n8n request failed, providing fallback")
      console.log("❌ n8n error details:", {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        response: responseText.substring(0, 200)
      })
      
      const fallbackResponse = generateContextualResponse(userMessage)
      
      return new Response(
        JSON.stringify({ 
          message: fallbackResponse,
          source: "fallback_after_error",
          note: "Service temporairement indisponible, conseil nutrition de base fourni.",
          error: `n8n responded with ${n8nResponse.status}: ${n8nResponse.statusText}`
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      )
    }

    // Extract the message from n8n response
    const extractedMessage = extractMessageFromN8nResponse(responseText)

    console.log("✅ Successfully extracted message from n8n:", {
      messageLength: extractedMessage.length,
      messagePreview: extractedMessage.substring(0, 100) + (extractedMessage.length > 100 ? "..." : "")
    })

    // Always return a consistent format with the message
    return new Response(
      JSON.stringify({
        message: extractedMessage,
        source: "n8n",
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error("💥 Error in relay-to-n8n function:", error)
    console.error("💥 Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    
    // Provide fallback nutrition advice even on error
    const fallbackResponse = getRandomNutritionAdvice()
    
    return new Response(
      JSON.stringify({ 
        message: fallbackResponse,
        source: "error_fallback",
        note: "Une erreur s'est produite, mais voici un conseil nutrition utile !",
        error: error.message
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    )
  }
})