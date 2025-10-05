import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus } from "lucide-react";

/**
 * MoodEntry
 * ------------------------------------------------------------
 * A mood-based onboarding/entry UI for your Flourish chatbot.
 *
 * UX flow:
 * 1) User selects a mood bubble (e.g., Stressed, Sad/Lonely, Stuck, Motivated, Curious).
 * 2) We show an empathetic intro + 3–5 related conversation starters.
 * 3) Clicking a starter triggers `onStartConversation(prompt)` so you can
 *    prefill/send the message to your chat system.
 *
 * Props you provide:
 * - onStartConversation: (text: string) => void    // send prompt to chat
 * - onSelectEmotion?: (moodId: string) => void     // optional analytics hook
 * - className?: string                             // layout/styling wrapper
 * - initialMoodId?: string                         // preselect a mood
 */

export type Mood = {
  id: string;
  label: string;
  emoji: string;
  colorFrom: string; // tailwind from-* color (e.g., from-rose-500)
  colorTo: string;   // tailwind to-* color (e.g., to-pink-500)
  prompts: string[];
  supportiveText: string; // empathetic line shown after selection
};

export type MoodEntryProps = {
  onStartConversation: (text: string) => void;
  onSelectEmotion?: (moodId: string) => void;
  className?: string;
  initialMoodId?: string;
  customMoods?: Mood[]; // override default mood set
};

const DEFAULT_MOODS: Mood[] = [
  {
    id: "stressed",
    label: "Stressed",
    emoji: "🌀",
    colorFrom: "from-sky-100",
    colorTo: "to-sky-200",
    supportiveText:
      "Thanks for sharing. When stress is high, slowing down to listen to your body can help you choose with care.",
    prompts: [
      "What usually helps you unwind that doesn’t involve food?",
      "What thoughts show up right before you reach for a snack when stressed?",
      "Where do you feel stress in your body right now?",
      "What’s one tiny step that would lower your stress by 10%?",
      "What do you most need from yourself in this moment—rest, reassurance, or relief?",
    ],
  },
  {
    id: "sad",
    label: "Sad / Lonely",
    emoji: "💔",
    colorFrom: "from-rose-100",
    colorTo: "to-rose-200",
    supportiveText:
      "I’m here with you. Sadness and loneliness deserve gentleness. Let’s find a caring next step.",
    prompts: [
      "What’s the feeling behind the craving right now?",
      "If a friend felt this way, what comfort would you offer them?",
      "What kind of connection would feel nourishing today—message, call, or quiet time?",
      "What memory does this craving remind you of?",
      "What’s one small kindness you can give yourself instead of food right now?",
    ],
  },
  {
    id: "stuck",
    label: "Stuck in a Cycle",
    emoji: "🔄",
    colorFrom: "from-amber-100",
    colorTo: "to-amber-200",
    supportiveText:
      "Feeling stuck is a sign of awareness, not failure. Let’s map the pattern together, gently.",
    prompts: [
      "Walk me through the last time this happened—what led up to it?",
      "What time of day do urges usually appear for you?",
      "What thought tends to show up right before the urge?",
      "What happens after you eat—relief, calm, guilt, something else?",
      "What would a tiny pause between urge and action look like for you?",
    ],
  },
  {
    id: "motivated",
    label: "Motivated",
    emoji: "☀️",
    colorFrom: "from-emerald-100",
    colorTo: "to-emerald-200",
    supportiveText:
      "Beautiful. Let’s channel that energy into small, sustainable steps that serve you.",
    prompts: [
      "What’s a small intention you want to carry into your next meal?",
      "Which daily ritual would help you feel grounded—breath, stretch, or a short walk?",
      "What food or habit do you want a more peaceful relationship with?",
      "How will you know you’re satisfied during a meal?",
      "What would ‘eating with freedom, not control’ look like this week?",
    ],
  },
  {
    id: "curious",
    label: "Curious",
    emoji: "🕊️",
    colorFrom: "from-purple-100",
    colorTo: "to-purple-200",
    supportiveText:
      "Curiosity is powerful. Let’s explore your inner signals and patterns with kindness.",
    prompts: [
      "What are you noticing in your body right now?",
      "How do you know you’re truly hungry?",
      "What emotion tends to show up before you eat?",
      "What would it be like to pause halfway through your next meal?",
      "What’s one insight you’ve learned about your eating patterns lately?",
    ],
  },
  {
    id: "idk",
    label: "I’m not sure",
    emoji: "🌫️",
    colorFrom: "from-zinc-100",
    colorTo: "to-slate-200",
    supportiveText:
      "Not knowing is okay. We can start simple and see what emerges.",
    prompts: [
      "What’s been feeling hardest about food lately?",
      "What’s one small win around eating or self-care this week?",
      "What do you notice happens right before you reach for food?",
      "What’s one gentle thing you can do for yourself instead of eating right now?",
      "What would it look like to move from judgment to curiosity today?",
    ],
  },
];

export default function MoodEntry({
  onStartConversation,
  onSelectEmotion,
  className,
  initialMoodId,
  customMoods,
}: MoodEntryProps) {
  const moods = customMoods?.length ? customMoods : DEFAULT_MOODS;
  const [selected, setSelected] = useState<string | null>(initialMoodId ?? null);

  const selectedMood = useMemo(
    () => moods.find((m) => m.id === selected) ?? null,
    [selected, moods]
  );

  const handleSelect = (moodId: string) => {
    setSelected(moodId);
    onSelectEmotion?.(moodId);
  };

  return (
    <section
      className={
        "w-full max-w-3xl mx-auto flex flex-col gap-6 " + (className ?? "")
      }
      aria-label="Mood-based conversation starters"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">How are you feeling right now?</h2>
        <p className="text-sm text-muted-foreground">
          Pick the option that fits best. We’ll suggest a few gentle prompts to get you started.
        </p>
      </div>

      {/* Mood Bubbles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleSelect(mood.id)}
            className={[
              "group relative overflow-hidden rounded-2xl p-4 text-left transition",
              "bg-gradient-to-br text-teal-900/95 shadow-sm focus:outline-none focus-visible:ring-2",
              "ring-offset-2 ring-offset-white/5",
              selected === mood.id
                ? "ring-1 ring-teal-200 bg-white/60"
                : "hover:shadow rounded-2xl",
              mood.colorFrom,
              mood.colorTo,
            ].join(" ")}
            aria-pressed={selected === mood.id}
            aria-label={`I feel ${mood.label}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>
                {mood.emoji}
              </span>
              <div className="flex flex-col">
                <span className="font-medium">{mood.label}</span>
                <span className="text-xs text-teal-700/80">Tap to see ideas</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Prompt Suggestions */}
      <AnimatePresence mode="wait">
        {selectedMood && (
          <motion.div
            key={selectedMood.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl border bg-white/70 backdrop-blur-sm p-4 sm:p-5 shadow-sm"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl" aria-hidden>
                {selectedMood.emoji}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  {selectedMood.supportiveText}
                </p>
                <div className="mt-3 grid gap-2">
                  {selectedMood.prompts.slice(0, 5).map((p, idx) => (
                    <SuggestionRow
                      key={`${selectedMood.id}-${idx}`}
                      text={p}
                      onUse={() => onStartConversation(p)}
                    />)
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function SuggestionRow({
  text,
  onUse,
}: { text: string; onUse: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm">
      <p className="text-sm text-gray-700">{text}</p>
        <div className="flex items-center gap-2">
        <button
          onClick={onUse}
          className="inline-flex items-center justify-center rounded-md border border-transparent p-2 text-xs font-medium bg-white hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200"
          aria-label="Discuss with Alia"
          title="Discuss with Alia"
        >
          <MessageSquarePlus className="h-4 w-4 text-teal-600" />
        </button>
      </div>
    </div>
  );
}



/**
 * Example usage in a page / component:
 *
 * <MoodEntry
 *   onStartConversation={(text) => {
 *     // Option A: Prefill chat input
 *     setChatInput(text);
 *     // Option B: Immediately send a message to your chat backend
 *     sendMessage({ role: "user", content: text });
 *   }}
 *   onSelectEmotion={(id) => posthog.capture('mood_selected', { id })}
 * />
 *
 * Tailwind classes used assume your project is configured.
 * Install framer-motion if not present:
 *   npm i framer-motion
 */
