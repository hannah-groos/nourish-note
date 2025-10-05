"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/supa_components/button"
import { Card, CardContent, CardHeader } from "@/components/supa_components/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, Clock, Flame, BookOpen, Trash2, UserCircle, Sparkles, Menu, Send, MessageCircle } from "lucide-react"

interface Entry {
    id: string
    content: string
    word_count: number
    mood?: string | null
    created_at: string
}

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    created_at: string
}

interface EntriesChatSplitProps {
    userEmail: string
    userId: string
    entries: Entry[]
    streakData: {
        current_streak: number
        longest_streak: number
        total_entries: number
    } | null
    initialMessages: Message[]
}

export default function EntriesChatSplit({ userEmail, userId, entries, streakData, initialMessages }: EntriesChatSplitProps) {
    const [localEntries, setLocalEntries] = useState(entries)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

    const handleDelete = async (entryId: string) => {
        if (!confirm("Delete this entry? This cannot be undone.")) return
        setDeletingId(entryId)
        const supabase = createClient()
        try {
            const { error } = await supabase.from("entries").delete().eq("id", entryId)
            if (error) throw error
            setLocalEntries((prev) => prev.filter((e) => e.id !== entryId))
            router.refresh()
        } catch (err) {
            console.error("Delete error:", err)
            alert("Failed to delete entry")
        } finally {
            setDeletingId(null)
        }
    }

    const handleChatSubmit = async (e: React.FormEvent) => {
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
            // Call RAG API (same as ChatModal)
            const response = await fetch("/api/rag", {
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
                content: data.answer || "No reply",
                created_at: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, assistantMessage])

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        })
    }

    const entriesByDate = localEntries.reduce((acc, entry) => {
        const date = new Date(entry.created_at).toDateString()
        if (!acc[date]) acc[date] = []
        acc[date].push(entry)
        return acc
    }, {} as Record<string, Entry[]>)

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-amber-50/30 to-white">
            {/* Integrated Navigation Header */}
            <header className="bg-white/90 backdrop-blur-sm border-b border-teal-100 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 sm:py-4 max-w-7xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        {/* Left: Logo + Current Page */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            <Link
                                href="/"
                                className="text-xl font-bold text-teal-900 hover:text-teal-700 transition-colors"
                            >
                                NourishNote
                            </Link>
                            <div className="hidden sm:block w-px h-6 bg-teal-200"></div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-md shadow-teal-200">
                                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-teal-900">
                                        Entries & Chat
                                    </h1>
                                    <p className="text-xs text-teal-600 hidden sm:block">
                                        Your journal entries with personalized AI support
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Navigation + User */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Desktop Navigation Links */}
                            <div className="hidden md:flex items-center gap-1 sm:gap-2">
                                <Link
                                    href="/journal_alia"
                                    className="px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                                >
                                    Journal
                                </Link>
                                <Link
                                    href="/chat"
                                    className="px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                                >
                                    Chat
                                </Link>
                                <span className="px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg">
                                    Entries
                                </span>
                            </div>

                            {/* User Menu */}
                            <div className="hidden sm:flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-teal-700 hover:text-teal-900 px-1" aria-label="Profile (click to sign out)">
                                    <UserCircle className="h-5 w-5" />
                                </Button>
                                <span className="text-sm text-teal-700 font-medium truncate max-w-[150px]">{userEmail}</span>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-teal-100 bg-white/95 backdrop-blur-sm">
                            <div className="px-4 py-3 space-y-1">
                                <Link
                                    href="/journal_alia"
                                    className="block px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Journal
                                </Link>
                                <Link
                                    href="/chat"
                                    className="block px-3 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-all"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Chat
                                </Link>
                                <span className="block px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg">
                                    Entries
                                </span>
                                <div className="border-t border-teal-100 pt-2 mt-2">
                                    <div className="flex items-center gap-2 px-3 py-2">
                                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-teal-700 hover:text-teal-900 px-1" aria-label="Profile (click to sign out)">
                                            <UserCircle className="h-5 w-5" />
                                        </Button>
                                        <span className="text-sm text-teal-700 truncate">
                                            {userEmail}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-10 max-w-7xl">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
                    <Card className="border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-xl shadow-teal-200/50 sm:col-span-1 lg:col-span-1">
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                                    <Flame className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-teal-50 font-medium">Current Streak</p>
                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{streakData?.current_streak || 0}</p>
                                    <p className="text-xs text-teal-100">days in a row</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-200/50 sm:col-span-1 lg:col-span-1">
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-amber-50 font-medium">Longest Streak</p>
                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{streakData?.longest_streak || 0}</p>
                                    <p className="text-xs text-amber-100">days achieved</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-xl shadow-teal-200/50 sm:col-span-2 lg:col-span-1">
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-teal-50 font-medium">Total Entries</p>
                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{streakData?.total_entries || 0}</p>
                                    <p className="text-xs text-teal-100">reflections</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Split Layout: Entries on Left, Chat on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Left Side: Journal Entries */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-md">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-teal-900">Your Journal Entries</h2>
                        </div>

                        {localEntries.length === 0 ? (
                            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
                                <CardContent className="py-16 text-center">
                                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 mb-6 shadow-lg">
                                        <BookOpen className="h-12 w-12 text-teal-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-teal-900 mb-3">No entries yet</h3>
                                    <p className="text-teal-600 mb-6 max-w-md mx-auto leading-relaxed">Your journaling journey starts here. Take a moment to reflect and write your first entry.</p>
                                    <Button asChild size="lg" className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800">
                                        <Link href="/journal_alia">
                                            <Sparkles className="h-4 w-4 mr-2" /> Write Your First Entry
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6 sm:space-y-8">
                                {Object.entries(entriesByDate).map(([date, dateEntries]) => (
                                    <div key={date} className="space-y-3 sm:space-y-4">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-md">
                                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent">
                                                {formatDate(dateEntries[0].created_at)}
                                            </h3>
                                            <div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent" />
                                        </div>

                                        <div className="space-y-3 sm:space-y-4">
                                            {dateEntries.map((entry) => (
                                                <Card key={entry.id} className="border-0 bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden">
                                                    <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-r from-teal-50/50 to-amber-50/30 border-b border-teal-100/50">
                                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
                                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-teal-700">
                                                                <span className="flex items-center gap-1.5 sm:gap-2 font-medium">
                                                                    <div className="p-1 sm:p-1.5 bg-teal-100 rounded-lg">
                                                                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-teal-700" />
                                                                    </div>
                                                                    {formatTime(entry.created_at)}
                                                                </span>
                                                                <span className="px-2 sm:px-3 py-1 bg-teal-100 rounded-full text-xs font-semibold text-teal-700">
                                                                    {entry.word_count} words
                                                                </span>
                                                                <span className="px-2 sm:px-3 py-1 bg-purple-100 rounded-full text-xs font-semibold text-purple-700">
                                                                    {entry.mood?.trim() || "Neutral"}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 self-end sm:self-start"
                                                                onClick={() => handleDelete(entry.id)}
                                                                disabled={deletingId === entry.id}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="pt-4 sm:pt-6">
                                                        <p className="text-teal-900 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{entry.content}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Chat Interface */}
                    <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                                <MessageCircle className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-teal-900">Chat with Alia</h2>
                            <div className="px-3 py-1 bg-purple-100 rounded-full">
                                <span className="text-xs font-semibold text-purple-700">Trained on your entries</span>
                            </div>
                        </div>

                        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl h-full lg:h-[calc(100vh-12rem)] flex flex-col">
                            <CardHeader className="border-b border-teal-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    <h3 className="text-lg font-semibold text-teal-900">Your Personal AI Companion</h3>
                                </div>
                                <p className="text-sm text-teal-600">
                                    Alia has context about your journal entries and can provide personalized insights and support.
                                </p>
                            </CardHeader>

                            {/* Messages */}
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                                            <Sparkles className="h-8 w-8 text-purple-600" />
                                        </div>
                                        <p className="text-teal-900 font-semibold mb-2">Hi, I'm Alia</p>
                                        <p className="text-sm text-teal-600 max-w-md mx-auto">
                                            I've read your journal entries and I'm here to provide personalized support and insights. 
                                            What would you like to talk about?
                                        </p>
                                    </div>
                                )}

                                {messages.map((message) => (
                                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`max-w-[85%] rounded-lg px-4 py-3 ${
                                                message.role === "user" 
                                                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white" 
                                                    : "bg-white border border-teal-100 text-teal-900 shadow-sm"
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] rounded-lg px-4 py-3 bg-white border border-teal-100 shadow-sm">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </CardContent>

                            {/* Input */}
                            <div className="border-t border-teal-100 p-4">
                                <form onSubmit={handleChatSubmit} className="flex gap-2">
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask Alia about your entries, patterns, or get personalized insights..."
                                        className="resize-none border-teal-200 focus:border-purple-400"
                                        rows={2}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault()
                                                handleChatSubmit(e)
                                            }
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!input.trim() || isLoading}
                                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 self-end"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}