"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/supa_components/button"
import { Card, CardContent, CardHeader } from "@/components/supa_components/card"
import { ArrowLeft, Calendar, Clock, Flame, BookOpen, Trash2, LogOut, Sparkles } from "lucide-react"

interface Entry {
    id: string
    content: string
    word_count: number
    mood?: string | null
    created_at: string
}

interface DashboardViewProps {
    userEmail: string
    entries: Entry[]
    streakData: {
        current_streak: number
        longest_streak: number
        total_entries: number
    } | null
}

export default function DashboardView({ userEmail, entries, streakData }: DashboardViewProps) {
    const [localEntries, setLocalEntries] = useState(entries)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const router = useRouter()

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

    // duration removed; showing mood chip instead

    const entriesByDate = localEntries.reduce((acc, entry) => {
        const date = new Date(entry.created_at).toDateString()
        if (!acc[date]) acc[date] = []
        acc[date].push(entry)
        return acc
    }, {} as Record<string, Entry[]>)

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-amber-50/30 to-white">
            <header className="sticky top-0 z-40 border-b border-teal-100/50 bg-white/90 backdrop-blur-xl shadow-sm">
                <div className="container mx-auto px-4 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="sm" className="text-teal-700 hover:text-teal-900">
                            <Link href="/journal_alia">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-200">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent">Your Journal</h1>
                                <p className="text-xs text-teal-600">Reflecting on your journey</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-teal-700 font-medium hidden sm:block">{userEmail}</span>
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-teal-700 hover:text-teal-900">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-10 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-xl shadow-teal-200/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                    <Flame className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-teal-50 font-medium">Current Streak</p>
                                    <p className="text-4xl font-bold">{streakData?.current_streak || 0}</p>
                                    <p className="text-xs text-teal-100">days in a row</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-200/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                    <Sparkles className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-amber-50 font-medium">Longest Streak</p>
                                    <p className="text-4xl font-bold">{streakData?.longest_streak || 0}</p>
                                    <p className="text-xs text-amber-100">days achieved</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-xl shadow-teal-200/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                    <BookOpen className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-teal-50 font-medium">Total Entries</p>
                                    <p className="text-4xl font-bold">{streakData?.total_entries || 0}</p>
                                    <p className="text-xs text-teal-100">reflections</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                    <div className="space-y-8">
                        {Object.entries(entriesByDate).map(([date, dateEntries]) => (
                            <div key={date} className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-md">
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent">
                                        {formatDate(dateEntries[0].created_at)}
                                    </h2>
                                    <div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent" />
                                </div>

                                <div className="space-y-4">
                                    {dateEntries.map((entry) => (
                                        <Card key={entry.id} className="border-0 bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden">
                                            <CardHeader className="pb-4 bg-gradient-to-r from-teal-50/50 to-amber-50/30 border-b border-teal-100/50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-6 text-sm text-teal-700">
                                                        <span className="flex items-center gap-2 font-medium">
                                                            <div className="p-1.5 bg-teal-100 rounded-lg">
                                                                <Clock className="h-3.5 w-3.5 text-teal-700" />
                                                            </div>
                                                            {formatTime(entry.created_at)}
                                                        </span>
                                                        <span className="px-3 py-1 bg-teal-100 rounded-full text-xs font-semibold text-teal-700">
                                                            {entry.word_count} words
                                                        </span>
                                                        <span className="px-3 py-1 bg-purple-100 rounded-full text-xs font-semibold text-purple-700">
                                                            {entry.mood?.trim() || "Neutral"}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(entry.id)}
                                                        disabled={deletingId === entry.id}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-6">
                                                <p className="text-teal-900 whitespace-pre-wrap leading-relaxed text-base">{entry.content}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

