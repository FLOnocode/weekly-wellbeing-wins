const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface Profile {
  id: string;
  user_id: string;
  nickname: string;
  email?: string;
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
    console.log("🚀 Starting challenge reminder function...")

    // Vérifier les variables d'environnement nécessaires
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
    const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "noreply@challengewellnessweekly.com"
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    console.log("🔧 Environment check:", {
      hasResendKey: !!RESEND_API_KEY,
      hasSenderEmail: !!SENDER_EMAIL,
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
    })

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured")
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing")
    }

    // Créer le client Supabase avec la clé de service
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    console.log("📊 Fetching user profiles...")

    // Récupérer tous les profils utilisateurs avec leurs emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        nickname,
        auth.users!inner(email)
      `)

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError)
      throw profilesError
    }

    console.log(`✅ Found ${profiles?.length || 0} user profiles`)

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No users found to send reminders to",
          emailsSent: 0 
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

    // Préparer les emails
    const emailPromises = profiles.map(async (profile: any) => {
      const userEmail = profile.auth?.users?.email
      
      if (!userEmail) {
        console.warn(`⚠️ No email found for user ${profile.nickname || profile.user_id}`)
        return { success: false, email: 'unknown', error: 'No email found' }
      }

      console.log(`📧 Preparing email for ${profile.nickname || 'User'} (${userEmail})`)

      const emailData = {
        from: SENDER_EMAIL,
        to: [userEmail],
        subject: "🏆 Challenge Wellness Weekly - C'est lundi, c'est parti !",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Challenge Wellness Weekly</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; color: #ffffff;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #22c55e, #3b82f6); padding: 20px; border-radius: 16px; margin-bottom: 20px;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: white;">
                    🏆 Challenge Wellness Weekly
                  </h1>
                  <p style="margin: 10px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.9);">
                    SSM 2K25 Challenge
                  </p>
                </div>
              </div>

              <!-- Greeting -->
              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #22c55e;">
                  Salut ${profile.nickname || 'Champion'} ! 👋
                </h2>
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                  C'est lundi et une nouvelle semaine de défis commence ! Es-tu prêt(e) à donner le meilleur de toi-même ?
                </p>
              </div>

              <!-- Weekly Challenges -->
              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 20px 0; font-size: 20px; color: #3b82f6;">
                  🎯 Tes défis de la semaine
                </h3>
                
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">🚶‍♀️</span>
                    <span style="color: rgba(255,255,255,0.9);">10 000 pas par jour</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">💧</span>
                    <span style="color: rgba(255,255,255,0.9);">1,5L d'eau quotidien</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">🥗</span>
                    <span style="color: rgba(255,255,255,0.9);">Repas équilibrés</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">💪</span>
                    <span style="color: rgba(255,255,255,0.9);">10 min d'exercice</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">🚫</span>
                    <span style="color: rgba(255,255,255,0.9);">Journée sans sucre</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">🍎</span>
                    <span style="color: rgba(255,255,255,0.9);">5 fruits & légumes</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="margin-right: 12px; font-size: 20px;">😴</span>
                    <span style="color: rgba(255,255,255,0.9);">8h de sommeil</span>
                  </div>
                </div>
              </div>

              <!-- Motivation -->
              <div style="background: linear-gradient(135deg, #22c55e, #3b82f6); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <h3 style="margin: 0 0 12px 0; font-size: 20px; color: white;">
                  💪 Ta discipline est ta plus grande force
                </h3>
                <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9); line-height: 1.6;">
                  Chaque petit effort compte. Chaque défi complété te rapproche de tes objectifs !
                </p>
              </div>

              <!-- Weigh-in Reminder -->
              <div style="background: rgba(251, 146, 60, 0.1); border: 1px solid rgba(251, 146, 60, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #fb923c;">
                  ⚖️ N'oublie pas ta pesée !
                </h3>
                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.8);">
                  Pense à enregistrer ton poids aujourd'hui pour suivre tes progrès et gagner des points !
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="https://challengewellnessweekly.netlify.app" 
                   style="display: inline-block; background: linear-gradient(135deg, #22c55e, #3b82f6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
                  🚀 Commencer mes défis
                </a>
              </div>

              <!-- Footer -->
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.6);">
                  Challenge Wellness Weekly - SSM 2K25<br>
                  Transforme-toi sans effort, un défi à la fois
                </p>
                <p style="margin: 16px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.5);">
                  Tu reçois cet email car tu participes au Challenge Wellness Weekly
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      }

      try {
        console.log(`📤 Sending email to ${userEmail}...`)
        
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        })

        const result = await response.json()

        if (!response.ok) {
          console.error(`❌ Failed to send email to ${userEmail}:`, result)
          return { 
            success: false, 
            email: userEmail, 
            error: result.message || 'Unknown error' 
          }
        }

        console.log(`✅ Email sent successfully to ${userEmail}`)
        return { 
          success: true, 
          email: userEmail, 
          messageId: result.id 
        }

      } catch (error) {
        console.error(`💥 Exception sending email to ${userEmail}:`, error)
        return { 
          success: false, 
          email: userEmail, 
          error: error.message 
        }
      }
    })

    // Attendre que tous les emails soient envoyés
    console.log("📬 Sending all emails...")
    const results = await Promise.all(emailPromises)

    // Compter les succès et échecs
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    console.log(`📊 Email sending results:`)
    console.log(`✅ Successful: ${successful.length}`)
    console.log(`❌ Failed: ${failed.length}`)

    if (failed.length > 0) {
      console.log("❌ Failed emails:", failed)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Challenge reminders sent successfully`,
        emailsSent: successful.length,
        emailsFailed: failed.length,
        totalUsers: profiles.length,
        results: {
          successful: successful.map(r => ({ email: r.email, messageId: r.messageId })),
          failed: failed.map(r => ({ email: r.email, error: r.error }))
        }
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
    console.error("💥 Error in challenge reminder function:", error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: "Check the function logs for more information"
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