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

export function NutriBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Bonjour ! Je suis votre conseiller nutrition personnalisé. 🥗 Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur votre alimentation, m'envoyer des photos de vos repas pour des conseils, ou demander des suggestions de recettes saines !",
      sender: "ai",
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const nutritionResponses = [
    "Excellente question ! Pour une alimentation équilibrée, je recommande de privilégier les légumes verts, les protéines maigres et les céréales complètes. 🥬",
    "C'est formidable que vous vous intéressiez à votre nutrition ! Boire beaucoup d'eau et limiter les aliments transformés sont des étapes importantes. 💧",
    "Pour vos objectifs de bien-être, essayez d'inclure 5 portions de fruits et légumes par jour. Chaque couleur apporte des nutriments différents ! 🌈",
    "Une collation saine pourrait être des noix avec un fruit, ou du yaourt grec avec des baies. Cela vous donnera de l'énergie durable ! 🥜",
    "Si vous voulez perdre du poids sainement, concentrez-vous sur des portions modérées et des aliments riches en fibres qui vous rassasient plus longtemps. 🎯",
    "Pour prendre du muscle, assurez-vous d'avoir suffisamment de protéines à chaque repas : poisson, œufs, légumineuses ou viande maigre. 💪",
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: input,
        sender: "user",
      },
    ])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      const randomResponse = nutritionResponses[Math.floor(Math.random() * nutritionResponses.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: randomResponse,
          sender: "ai",
        },
      ])
      setIsLoading(false)
    }, 1500)
  }

  const handleAttachFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            content: `📸 Photo envoyée : ${file.name}`,
            sender: "user",
          },
          {
            id: prev.length + 2,
            content: "Merci pour cette photo ! Je vois un repas intéressant. Pour l'améliorer, je suggère d'ajouter plus de légumes verts et peut-être une source de protéines maigres. Les couleurs dans votre assiette sont importantes pour la variété nutritionnelle ! 🥗✨",
            sender: "ai",
          },
        ])
      }
    };
    input.click();
  }

  const handleMicrophoneClick = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: "🎤 Message vocal reçu",
        sender: "user",
      },
      {
        id: prev.length + 2,
        content: "J'ai bien reçu votre message vocal ! Pour une réponse plus précise, n'hésitez pas à me donner plus de détails sur vos habitudes alimentaires actuelles et vos objectifs. 🎯",
        sender: "ai",
      },
    ])
  }

  return (
    <ExpandableChat
      size="lg"
      position="bottom-right"
      icon={<Bot className="h-6 w-6" />}
    >
      <ExpandableChatHeader className="flex-col text-center justify-center bg-gradient-wellness text-white">
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
          />
          <div className="flex items-center p-3 pt-0 justify-between">
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleAttachFile}
                title="Envoyer une photo"
              >
                <Paperclip className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleMicrophoneClick}
                title="Message vocal"
              >
                <Mic className="size-4" />
              </Button>
            </div>
            <Button type="submit" size="sm" className="ml-auto gap-1.5" disabled={isLoading}>
              Envoyer
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  )
}
