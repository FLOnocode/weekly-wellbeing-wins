"use client"

import { useState, FormEvent } from "react"
import { Send, Bot, Paperclip, Mic, CornerDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import { ChatMessageList } from "@/components/ui/chat-message-list"

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
}

export function NutriBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Bonjour ! Je suis votre conseiller nutrition personnalisé. 🥗 Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur votre alimentation, m'envoyer des photos de vos repas pour des conseils, ou demander des suggestions de recettes saines !",
      sender: "ai",
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const sendMessageToN8n = async (message: string): Promise<string> => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/relay-to-n8n`
      
      console.log("🚀 Sending message to n8n via Edge Function:", {
        url: apiUrl,
        messageLength: message.length,
        messagePreview: message.substring(0, 50) + (message.length > 50 ? "..." : "")
      })
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: message,
          timestamp: new Date().toISOString(),
          context: "nutrition_advice",
        }),
      })

      console.log("📥 Edge Function response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      
      console.log("📋 Parsed response data:", {
        hasMessage: !!data.message,
        messageLength: data.message?.length || 0,
        source: data.source,
        hasNote: !!data.note,
        hasError: !!data.error
      })

      // The Edge Function now guarantees a message field
      if (data && data.message && typeof data.message === "string" && data.message.trim()) {
        console.log("✅ Successfully received message from n8n")
        return data.message.trim()
      } else {
        console.warn("⚠️ No valid message in response:", data)
        throw new Error("No valid message received from nutrition service")
      }
      
    } catch (error) {
      console.error("❌ Error communicating with nutrition service:", error)
      throw error
    }
  }

  const getContextualFallback = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('photo') || lowerMessage.includes('image')) {
      return "Merci pour cette photo ! Pour analyser votre repas, je recommande de vérifier l'équilibre : 1/2 de légumes, 1/4 de protéines maigres, 1/4 de glucides complexes. Les couleurs variées sont un bon indicateur ! 📸🥗"
    }
    
    if (lowerMessage.includes('poids') || lowerMessage.includes('maigrir')) {
      return "Pour une perte de poids saine, privilégiez les aliments nutritifs et rassasiants. Combinez alimentation équilibrée et activité physique régulière. La patience est clé ! ⚖️💪"
    }
    
    if (lowerMessage.includes('recette') || lowerMessage.includes('cuisine')) {
      return "Voici une idée équilibrée : Saumon grillé avec quinoa et légumes rôtis, assaisonnés à l'huile d'olive et aux herbes. Simple et nutritif ! 🐟🥬"
    }
    
    // Default fallback
    const fallbacks = [
      "Pour une alimentation équilibrée, privilégiez les légumes verts, les protéines maigres et les céréales complètes. Essayez d'inclure 5 portions de fruits et légumes par jour ! 🥬🍎",
      "Conseil nutrition : Buvez beaucoup d'eau et limitez les aliments transformés. Les aliments riches en fibres sont excellents pour la satiété ! 💧🫘",
      "Pour maintenir un poids santé, privilégiez les repas faits maison avec des ingrédients frais. N'oubliez pas les bonnes graisses ! 🥑🌰"
    ]
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      console.log("🎯 Handling user message:", currentInput)
      
      // Send message to nutrition service
      const aiResponse = await sendMessageToN8n(currentInput)
      
      console.log("✅ Received AI response:", {
        length: aiResponse.length,
        preview: aiResponse.substring(0, 100) + (aiResponse.length > 100 ? "..." : "")
      })
      
      const aiMessage: Message = {
        id: messages.length + 2,
        content: aiResponse,
        sender: "ai",
      }

      setMessages((prev) => [...prev, aiMessage])
      
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error)
      
      // Add error message with helpful advice
      const errorMessage: Message = {
        id: messages.length + 2,
        content: getContextualFallback(currentInput),
        sender: "ai",
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAttachFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const userMessage: Message = {
          id: messages.length + 1,
          content: `📸 Photo envoyée : ${file.name}`,
          sender: "user",
        }
        
        setMessages((prev) => [...prev, userMessage])
        setIsLoading(true)

        try {
          // Send photo analysis request
          const aiResponse = await sendMessageToN8n(`Analyse cette photo de repas : ${file.name}. Peux-tu me donner des conseils nutritionnels ?`)
          
          const aiMessage: Message = {
            id: messages.length + 2,
            content: aiResponse,
            sender: "ai",
          }

          setMessages((prev) => [...prev, aiMessage])
        } catch (error) {
          console.error("❌ Error analyzing photo:", error)
          
          const errorMessage: Message = {
            id: messages.length + 2,
            content: "Merci pour cette photo ! Pour l'analyser, je recommande de vérifier l'équilibre : 1/2 de légumes, 1/4 de protéines maigres, 1/4 de glucides complexes. Les couleurs variées dans votre assiette sont importantes pour la variété nutritionnelle ! 🥗✨",
            sender: "ai",
          }
          
          setMessages((prev) => [...prev, errorMessage])
        } finally {
          setIsLoading(false)
        }
      }
    }
    input.click()
  }

  const handleMicrophoneClick = async () => {
    const userMessage: Message = {
      id: messages.length + 1,
      content: "🎤 Message vocal reçu",
      sender: "user",
    }
    
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const aiResponse = await sendMessageToN8n("L'utilisateur a envoyé un message vocal concernant la nutrition. Peux-tu lui donner des conseils généraux ?")
      
      const aiMessage: Message = {
        id: messages.length + 2,
        content: aiResponse,
        sender: "ai",
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("❌ Error processing voice message:", error)
      
      const errorMessage: Message = {
        id: messages.length + 2,
        content: "J'ai bien reçu votre message vocal ! Pour une réponse personnalisée, n'hésitez pas à me donner plus de détails sur vos habitudes alimentaires et vos objectifs. En attendant, privilégiez une alimentation variée et colorée ! 🎯🌈",
        sender: "ai",
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      icon={<Bot className="h-6 w-6 text-white" />}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center bg-motivation-500 text-white">
        <h1 className="text-xl font-semibold">NutriBot 🤖</h1>
        <p className="text-sm text-white/80">
          Votre conseiller nutrition personnalisé
        </p>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                src={
                  message.sender === "user"
                    ? "/placeholder.svg"
                    : undefined
                }
                fallback={message.sender === "user" ? "U" : "🤖"}
              />
              <ChatBubbleMessage
                variant={message.sender === "user" ? "sent" : "received"}
              >
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                className="h-8 w-8 shrink-0"
                fallback="🤖"
              />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form
          onSubmit={handleSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question nutrition..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            disabled={isLoading}
          />
          <div className="flex items-center p-3 pt-0 justify-between">
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleAttachFile}
                title="Envoyer une photo"
                disabled={isLoading}
              >
                <Paperclip className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleMicrophoneClick}
                title="Message vocal"
                disabled={isLoading}
              >
                <Mic className="size-4" />
              </Button>
            </div>
            <Button 
              type="submit" 
              size="sm" 
              className="ml-auto gap-1.5 bg-motivation-500 hover:bg-motivation-600" 
              disabled={isLoading || !input.trim()}
            >
              Envoyer
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  )
}