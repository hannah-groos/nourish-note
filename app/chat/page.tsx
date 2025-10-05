// app/chat/page.tsx
"use client";

import Link from "next/link";
import Chatbot from "@/components/ui/chatbot";

export default function ChatPage() {
    return (
        <main className="min-h-screen p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Chat with Alia</h1>
                <div />
            </div>
            <Chatbot />
        </main>
    );
}