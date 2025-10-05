"use client"

import { useState } from "react"
import { Smile, Frown, Meh, Heart, Cloud, Zap, X } from "lucide-react"

interface MoodEntryProps {
  onStartConversation: (prompt: string) => void
  onSelectEmotion: (emotion: string) => void
  className?: string
}

const moodPrompts = {
  "Stressed": {
    supportive: "Thanks for sharing. When stress is high, slowing down to listen to your body can help you choose with care.",
    prompts: [
      "What usually helps you unwind that doesn't involve food?",
      "What thoughts show up right before you reach for a snack when stressed?",
      "Where do you feel stress in your body right now?",
      "What's one tiny step that would lower your stress by 10%?",
      "What do you most need from yourself in this moment—rest, reassurance, or relief?"
    ]
  },
  "Sad": {
    supportive: "I'm here with you. Sadness and loneliness deserve gentleness. Let's find a caring next step.",
    prompts: [
      "What's the feeling behind the craving right now?",
      "If a friend felt this way, what comfort would you offer them?",
      "What kind of connection would feel nourishing today—message, call, or quiet time?",
      "What memory does this craving remind you of?",
      "What's one small kindness you can give yourself instead of food right now?"
    ]
  },
  "Happy": {
    supportive: "Beautiful. Let's channel that energy into small, sustainable steps that serve you.",
    prompts: [
      "What's a small intention you want to carry into your next meal?",
      "Which daily ritual would help you feel grounded—breath, stretch, or a short walk?",
      "What food or habit do you want a more peaceful relationship with?",
      "How will you know you're satisfied during a meal?",
      "What would 'eating with freedom, not control' look like this week?"
    ]
  },
  "Grateful": {
    supportive: "Curiosity is powerful. Let's explore your inner signals and patterns with kindness.",
    prompts: [
      "What are you noticing in your body right now?",
      "How do you know you're truly hungry?",
      "What emotion tends to show up before you eat?",
      "What would it be like to pause halfway through your next meal?",
      "What's one insight you've learned about your eating patterns lately?"
    ]
  },
  "Neutral": {
    supportive: "Not knowing is okay. We can start simple and see what emerges.",
    prompts: [
      "What's been feeling hardest about food lately?",
      "What's one small win around eating or self-care this week?",
      "What do you notice happens right before you reach for food?",
      "What's one gentle thing you can do for yourself instead of eating right now?",
      "What would it look like to move from judgment to curiosity today?"
    ]
  },
  "Anxious": {
    supportive: "Feeling stuck is a sign of awareness, not failure. Let's map the pattern together, gently.",
    prompts: [
      "Walk me through the last time this happened—what led up to it?",
      "What time of day do urges usually appear for you?",
      "What thought tends to show up right before the urge?",
      "What happens after you eat—relief, calm, guilt, something else?",
      "What would a tiny pause between urge and action look like for you?"
    ]
  }
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
  const [showPrompts, setShowPrompts] = useState(false)

  // Prevent unused variable warning
  console.log("MoodEntry component loaded");

  const handleMoodClick = (mood: (typeof moods)[0]) => {
    setSelectedMood(mood.label)
    onSelectEmotion(mood.label)
    setShowPrompts(true)
  }

  const handlePromptClick = (prompt: string) => {
    const fullPrompt = `${prompt}\n\n`
    onStartConversation(fullPrompt)
    setShowPrompts(false)
  }

  const closeMoodPrompts = () => {
    setShowPrompts(false)
    setSelectedMood(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-sm text-teal-600 mb-4">Select how you&apos;re feeling to start a conversation with Alia</p>

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

      {/* Mood-specific prompts popup */}
      {showPrompts && selectedMood && moodPrompts[selectedMood as keyof typeof moodPrompts] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-teal-900">Feeling {selectedMood}</h3>
                <button
                  onClick={closeMoodPrompts}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <p className="text-sm text-teal-700 mb-6 italic">
                {moodPrompts[selectedMood as keyof typeof moodPrompts].supportive}
              </p>
              
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-teal-900 mb-3">Reflection Questions:</h4>
                {moodPrompts[selectedMood as keyof typeof moodPrompts].prompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="w-full text-left p-3 rounded-lg border border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition-all"
                  >
                    <span className="text-sm text-teal-800">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-200">
        <h4 className="text-sm font-bold text-teal-900 mb-2">Reflection Prompts</h4>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onStartConversation("What am I grateful for today?")}
              className="text-sm text-teal-700 hover:text-teal-900 hover:underline text-left w-full"
            >
              • What am I grateful for today (moments, feelings, etc)?
            </button>
          </li>
          <li>
            <button
              onClick={() => onStartConversation("How did my meals make me feel?")}
              className="text-sm text-teal-700 hover:text-teal-900 hover:underline text-left w-full"
            >
              • How did my meals make me feel - physically and emotionally?
            </button>
          </li>
          <li>
            <button
              onClick={() => onStartConversation("What challenges did I face today?")}
              className="text-sm text-teal-700 hover:text-teal-900 hover:underline text-left w-full"
            >
              • What challenges did I face today? What have they brought up for me? What did I learn from them?
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
