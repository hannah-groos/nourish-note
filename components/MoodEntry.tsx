"use client"

import { useState } from "react"
import { Smile, Frown, Meh, Heart, Cloud, Zap } from "lucide-react"

interface MoodEntryProps {
  onStartConversation: (prompt: string) => void
  onSelectEmotion: (emotion: string) => void
  className?: string
}

const moods = [
  { icon: Smile, label: "Happy", color: "from-amber-400 to-amber-500", prompt: "I'm feeling happy today" },
  { icon: Heart, label: "Grateful", color: "from-pink-400 to-pink-500", prompt: "I'm feeling grateful" },
  { icon: Meh, label: "Neutral", color: "from-gray-400 to-gray-500", prompt: "I'm feeling neutral" },
  { icon: Cloud, label: "Anxious", color: "from-blue-400 to-blue-500", prompt: "I'm feeling anxious" },
  { icon: Frown, label: "Sad", color: "from-indigo-400 to-indigo-500", prompt: "I'm feeling sad" },
  { icon: Zap, label: "Stressed", color: "from-red-400 to-red-500", prompt: "I'm feeling stressed" },
]

export default function MoodEntry({ onStartConversation, onSelectEmotion, className = "" }: MoodEntryProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  const handleMoodClick = (mood: (typeof moods)[0]) => {
    setSelectedMood(mood.label)
    onSelectEmotion(mood.label)
    onStartConversation(mood.prompt)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-sm text-teal-600 mb-4">Select how you're feeling to start a conversation with Alia</p>

      <div className="grid grid-cols-2 gap-3">
        {moods.map((mood) => {
          const Icon = mood.icon
          const isSelected = selectedMood === mood.label

          return (
            <button
              key={mood.label}
              onClick={() => handleMoodClick(mood)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-teal-500 bg-teal-50 shadow-lg"
                  : "border-teal-100 bg-white hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
              }`}
            >
              <div className={`p-3 rounded-full bg-gradient-to-br ${mood.color} shadow-md`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-teal-900">{mood.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-200">
        <h4 className="text-sm font-bold text-teal-900 mb-2">Reflection Prompts</h4>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onStartConversation("What am I grateful for today?")}
              className="text-sm text-teal-700 hover:text-teal-900 hover:underline text-left w-full"
            >
              • What am I grateful for today?
            </button>
          </li>
          <li>
            <button
              onClick={() => onStartConversation("How did my meals make me feel?")}
              className="text-sm text-teal-700 hover:text-teal-900 hover:underline text-left w-full"
            >
              • How did my meals make me feel?
            </button>
          </li>
          <li>
            <button
              onClick={() => onStartConversation("What challenges did I face today?")}
              className="text-sm text-teal-700 hover:text-teal-900 hover:underline text-left w-full"
            >
              • What challenges did I face today?
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
