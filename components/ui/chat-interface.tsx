"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/supa_components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/supa_components/card"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send, Sparkles, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    created_at: string
}

interface ChatInterfaceProps {
    userId: string
    userEmail: string
    initialMessages: Message[]
}

export default function ChatInterface({ userId, userEmail, initialMessages }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/auth/login")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput("")
        setIsLoading(true)

        // Add user message to UI immediately
        const tempUserMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: userMessage,
            created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, tempUserMessage])

        try {
            // Save user message to database
            const supabase = createClient()
            await supabase.from("chat_messages").insert({
                user_id: userId,
                role: "user",
                content: userMessage,
            })

            // Call AI API
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, tempUserMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            })

            if (!response.ok) throw new Error("Failed to get response")

            const data = await response.json()

            // Add assistant message
            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.message,
                created_at: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, assistantMessage])

            // Save assistant message to database
            await supabase.from("chat_messages").insert({
                user_id: userId,
                role: "assistant",
                content: data.message,
            })
        } catch (error) {
            console.error("Chat error:", error)
            // Add error message
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
                created_at: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex flex-col">
            {/* Header */}
            <header className="border-b border-teal-100 bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="sm" className="text-teal-700">
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-teal-600" />
                            <h1 className="text-2xl font-bold text-teal-900">Chat with Alia</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-teal-700">{userEmail}</span>
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-teal-700 hover:text-teal-900">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Chat Container */}
            <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col">
                <Card className="flex-1 flex flex-col border-teal-100 shadow-lg">
                    <CardHeader className="border-b border-teal-100">
                        <CardTitle className="text-teal-900 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-teal-600" />
                            Alia - Your Supportive Companion
                        </CardTitle>
                        <CardDescription className="text-teal-600">
                            A safe space to talk about your feelings and experiences
                        </CardDescription>
                    </CardHeader>

                    {/* Messages */}
                    <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-4">
                                    <Sparkles className="h-8 w-8 text-teal-600" />
                                </div>
                                <p className="text-teal-900 font-semibold mb-2">Hi, I&apos;m Alia</p>
                                <p className="text-sm text-teal-600 max-w-md mx-auto">
                                    I&apos;m here to listen and support you. Feel free to share what&apos;s on your mind, ask questions,
                                    or just chat about your day.
                                </p>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-3 ${message.role === "user" ? "bg-teal-600 text-white" : "bg-white border border-teal-100 text-teal-900"
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-white border border-teal-100">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Input */}
                    <div className="border-t border-teal-100 p-4">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                className="resize-none border-teal-200 focus:border-teal-400"
                                rows={2}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmit(e)
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="bg-teal-600 hover:bg-teal-700 self-end"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    )
}
