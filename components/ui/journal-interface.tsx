"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/supa_components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/supa_components/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Clock, Flame, BookOpen, MessageCircle, LogOut } from "lucide-react"

interface JournalInterfaceProps {
    userId: string
    userEmail: string
    entriesRemaining: number
    streakData: {
        current_streak: number
        longest_streak: number
        total_entries: number
    } | null
}

export default function JournalInterface({ userId, userEmail, entriesRemaining, streakData }: JournalInterfaceProps) {
    const [content, setContent] = useState("")
    const [timeLeft, setTimeLeft] = useState(60)
    const [isActive, setIsActive] = useState(false)
    const [hasExtended, setHasExtended] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const router = useRouter()

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length
    const isOverLimit = wordCount > 400

    useEffect(() => {
        let interval: number | null = null

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1)
            }, 1000)
        } else if (timeLeft === 0 && !hasExtended) {
            // Timer ended, offer extension
            setIsActive(false)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isActive, timeLeft, hasExtended])

    const startTimer = () => {
        setIsActive(true)
        if (textareaRef.current) {
            textareaRef.current.focus()
        }
    }

    const extendTimer = () => {
        setTimeLeft(30)
        setHasExtended(true)
        setIsActive(true)
    }

    const handleSubmit = async () => {
        if (isOverLimit) {
            setError("Please reduce your entry to 400 words or less")
            return
        }

        if (wordCount === 0) {
            setError("Please write something before submitting")
            return
        }

        if (entriesRemaining <= 0) {
            setError("You've reached your limit of 2 entries per 24 hours")
            return
        }

        setIsSubmitting(true)
        setError(null)

        const supabase = createClient()
        const totalTime = hasExtended ? 90 : 60
        const timeSpent = totalTime - timeLeft

        try {
            const { error: insertError } = await supabase.from("journal_entries").insert({
                user_id: userId,
                content: content.trim(),
                word_count: wordCount,
                duration_seconds: timeSpent,
            })

            if (insertError) throw insertError

            setSuccess(true)
            setContent("")
            setTimeLeft(60)
            setIsActive(false)
            setHasExtended(false)

            // Refresh to update entries remaining
            setTimeout(() => {
                router.refresh()
                setSuccess(false)
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save entry")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/auth/login")
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50">
            {/* Header */}
            <header className="border-b border-teal-100 bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-teal-900">NourishNote</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-teal-700">{userEmail}</span>
                        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-teal-700 hover:text-teal-900">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="border-teal-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-100 rounded-lg">
                                    <Flame className="h-5 w-5 text-teal-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-teal-600">Current Streak</p>
                                    <p className="text-2xl font-bold text-teal-900">{streakData?.current_streak || 0} days</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-amber-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-amber-600">Total Entries</p>
                                    <p className="text-2xl font-bold text-amber-900">{streakData?.total_entries || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-teal-100">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-teal-700" />
                                </div>
                                <div>
                                    <p className="text-sm text-teal-600">Entries Today</p>
                                    <p className="text-2xl font-bold text-teal-900">{2 - entriesRemaining} / 2</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Journal Card */}
                <Card className="border-teal-100 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-teal-900">How are you feeling?</CardTitle>
                        <CardDescription className="text-teal-600">
                            Take a moment to reflect. You have {entriesRemaining} {entriesRemaining === 1 ? "entry" : "entries"}{" "}
                            remaining today.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Timer Display */}
                        {!isActive && timeLeft === 60 && !success && (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-teal-100 mb-4">
                                    <span className="text-4xl font-bold text-teal-900">{formatTime(timeLeft)}</span>
                                </div>
                                <p className="text-teal-700 mb-4">Ready to begin? You&apos;ll have 60 seconds to write.</p>
                                <Button
                                    onClick={startTimer}
                                    size="lg"
                                    className="bg-teal-600 hover:bg-teal-700"
                                    disabled={entriesRemaining <= 0}
                                >
                                    Start Writing
                                </Button>
                                {entriesRemaining <= 0 && (
                                    <p className="text-sm text-amber-700 mt-2">
                                        You&apos;ve reached your daily limit. Come back tomorrow!
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Active Timer */}
                        {isActive && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-teal-700" />
                                        <span className="text-2xl font-bold text-teal-900">{formatTime(timeLeft)}</span>
                                    </div>
                                    <div className="text-sm text-teal-700">
                                        {wordCount} / 400 words {isOverLimit && <span className="text-red-600">(over limit)</span>}
                                    </div>
                                </div>
                                <Progress value={(timeLeft / (hasExtended ? 30 : 60)) * 100} className="h-2" />
                                <Textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write freely about your thoughts and feelings..."
                                    className="min-h-[300px] resize-none border-teal-200 focus:border-teal-400"
                                />
                            </div>
                        )}

                        {/* Timer Ended - Extension Offer */}
                        {!isActive && timeLeft === 0 && !hasExtended && !success && (
                            <div className="text-center py-8">
                                <p className="text-teal-900 font-semibold mb-4">Time&apos;s up! Would you like 30 more seconds?</p>
                                <div className="flex gap-4 justify-center">
                                    <Button onClick={extendTimer} className="bg-teal-600 hover:bg-teal-700">
                                        Yes, extend time
                                    </Button>
                                    <Button onClick={handleSubmit} variant="outline" disabled={isSubmitting || isOverLimit}>
                                        {isSubmitting ? "Saving..." : "Submit now"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Extended Timer Ended */}
                        {!isActive && timeLeft === 0 && hasExtended && !success && (
                            <div className="text-center py-8">
                                <p className="text-teal-900 font-semibold mb-4">Time to wrap up your thoughts.</p>
                                <Button
                                    onClick={handleSubmit}
                                    className="bg-teal-600 hover:bg-teal-700"
                                    disabled={isSubmitting || isOverLimit}
                                >
                                    {isSubmitting ? "Saving..." : "Submit Entry"}
                                </Button>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-4">
                                    <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-teal-900 font-semibold">Entry saved successfully!</p>
                                <p className="text-sm text-teal-600 mt-2">Great job taking time for yourself today.</p>
                            </div>
                        )}

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="mt-8 flex gap-4 justify-center">
                    <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 bg-transparent">
                        <Link href="/chat">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat with Alia
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 bg-transparent">
                        <Link href="/dashboard">
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Past Entries
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
