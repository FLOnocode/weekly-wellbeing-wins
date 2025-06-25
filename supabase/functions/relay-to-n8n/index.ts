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

    // Get environment variables
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL")
    const N8N_SECRET_KEY = Deno.env.get("N8N_SECRET_KEY")

    // If n8n is not configured, provide fallback nutrition advice
    if (!N8N_WEBHOOK_URL || !N8N_SECRET_KEY) {
      console.log("N8N not configured, providing fallback nutrition advice")
      
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

    console.log("Relaying request to n8n:", {
      url: N8N_WEBHOOK_URL,
      hasData: !!requestData,
      messageLength: userMessage.length,
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

    // If n8n request fails, provide fallback
    if (!n8nResponse.ok) {
      console.log("n8n request failed, providing fallback")
      const fallbackResponse = generateContextualResponse(userMessage)
      
      return new Response(
        JSON.stringify({ 
          message: fallbackResponse,
          source: "fallback_after_error",
          note: "Service temporairement indisponible, conseil nutrition de base fourni."
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
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error("Error in relay-to-n8n function:", error)
    
    // Provide fallback nutrition advice even on error
    const fallbackResponse = getRandomNutritionAdvice()
    
    return new Response(
      JSON.stringify({ 
        message: fallbackResponse,
        source: "error_fallback",
        note: "Une erreur s'est produite, mais voici un conseil nutrition utile !"
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