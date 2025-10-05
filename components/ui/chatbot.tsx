"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/supa_components/button"
import { Input } from "@/components/supa_components/input"
import Link from "next/link"
import { Send, ArrowLeft } from "lucide-react"

interface Message {
    id: string
    content: string
    role: "user" | "assistant"
    timestamp: Date
}

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "Hi! I'm Alia, your supportive companion. How are you feeling today?",
            role: "assistant",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input.trim(),
            role: "user",
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        // TODO: Replace this with your Gemini RAG bot API call
        // Example:
        // const response = await fetch('/api/chat', {
        //   method: 'POST',
        //   body: JSON.stringify({ message: input }),
        // })
        // const data = await response.json()

        // Simulated response - replace with your actual API call
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "I'm here to listen and support you. (Connect your Gemini RAG bot here)",
                role: "assistant",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, assistantMessage])
            setIsLoading(false)
        }, 1000)
    }

    return (
        <div className="flex h-screen flex-col bg-background-light dark:bg-[var(--teal-950)]">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-teal-100/70 dark:border-teal-900/60 bg-white/80 dark:bg-black/20 backdrop-blur-sm">
                <Link
                    href="/journal_alia"
                    className="flex items-center gap-2 text-teal-700 dark:text-teal-200 hover:text-teal-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-semibold">Back to Journal</span>
                </Link>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-teal-900 dark:text-white">Chat with Alia</h1>
                    <p className="text-sm text-teal-600 dark:text-teal-300">Your AI companion for mindful eating</p>
                </div>
                <div className="w-16" />
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto max-w-3xl space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex items-end gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            {message.role === "assistant" && (
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
                                    A
                                </div>
                            )}
                            <div
                                className={`group relative max-w-[70%] rounded-2xl px-4 py-2.5 ${message.role === "user"
                                        ? "bg-teal-600 text-white"
                                        : "bg-white text-teal-900 shadow-sm border border-teal-100"
                                    }`}
                            >
                                <div className="mb-1 text-xs font-medium opacity-70">{message.role === "user" ? "You" : "Alia"}</div>
                                <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                            {message.role === "user" && (
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-white">
                                    Y
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
                                A
                            </div>
                            <div className="rounded-2xl border border-teal-100 bg-white px-4 py-2.5 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-teal-400"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            <footer className="px-4 py-4 border-t border-teal-100/70 dark:border-teal-900/60 bg-white dark:bg-black/20">
                <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
                    <div className="flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isLoading}
                            className="flex-1 rounded-full border-transparent bg-teal-50/70 dark:bg-teal-900/30 px-5 py-3 text-teal-900 dark:text-teal-50 placeholder:text-teal-400 focus:border-teal-400 focus:ring-teal-400"
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="h-11 w-11 rounded-full bg-[var(--teal-500)] hover:bg-[var(--teal-600)] p-0 disabled:opacity-50"
                        >
                            <Send className="h-5 w-5 text-white" />
                        </Button>
                    </div>
                </form>
            </footer>
        </div>
    )
}
//components/ui/chatbot.tsx