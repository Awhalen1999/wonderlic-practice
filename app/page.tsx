"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { getAccuracyPercent } from "@/lib/utils";
import NamePromptModal from "@/components/NamePromptModal";
import { Trash2 } from "lucide-react";
import questions from "@/data/questions.json";

const HOLD_DURATION = 1500;

const TOTAL_QUESTIONS = questions.length;

export default function HomePage() {
  const router = useRouter();
  const { progress, setName, clearAllData } = useStore();
  const [showNameModal, setShowNameModal] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef<number | null>(null);

  const startHold = () => {
    // eslint-disable-next-line react-hooks/purity
    holdStart.current = Date.now();
    holdInterval.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current!;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        stopHold();
        clearAllData();
      }
    }, 16);
  };

  const stopHold = () => {
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdInterval.current = null;
    holdStart.current = null;
    setHoldProgress(0);
  };

  const handleName = (name: string) => {
    if (name) setName(name);
    setShowNameModal(false);
  };

  const accuracy = getAccuracyPercent(
    progress.totalCorrect,
    progress.totalAnswered,
  );
  const hasPractice = progress.practiceIndex > 0;
  const lastTest = progress.testHistory[0];

  return (
    <>
      {showNameModal && (
        <NamePromptModal onSubmit={handleName} currentName={progress.name} />
      )}

      <main className="h-full overflow-y-auto flex flex-col items-center justify-center px-4 py-12">
        {/* Brain + name bubble */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-3">
            <button
              onClick={() => setShowNameModal(true)}
              className="hover:scale-110 transition-transform duration-150 active:scale-95 inline-flex items-center justify-center w-14 h-14"
              title="Set your name"
            >
              {progress.name?.toLowerCase() === "ericaa" ? (
                <Image
                  src="/img-1.png"
                  alt=""
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-4xl leading-none w-14 h-14 flex items-center justify-center">🧠</span>
              )}
            </button>
          </div>
          {progress.name && (
            <p className="text-zinc-600 text-md mb-4">
              Hey, {progress.name}! {progress.name?.toLowerCase() === "ericaa" ? "🦴" : "👋"}
            </p>
          )}
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Wonderlic Practice
          </h1>
          <p className="text-zinc-600 text-sm mt-1">
            {progress.totalAnswered > 0
              ? `${progress.totalAnswered} answered · ${accuracy}% accuracy`
              : progress.name?.toLowerCase() === "ericaa"
                ? `${TOTAL_QUESTIONS} questions. Time to get some ridges on that marble brain.`
                : `${TOTAL_QUESTIONS} questions. Time to get smart.`}
          </p>
        </div>

        {/* Mode buttons */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          {/* Stats */}
          {progress.totalAnswered > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Answered", value: progress.totalAnswered },
                { label: "Correct", value: `${accuracy}%` },
                { label: "Tests", value: progress.sessionsCompleted },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white border border-sky-100 rounded-xl py-3 text-center"
                >
                  <div className="text-base font-bold text-zinc-900">
                    {value}
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Practice */}
          <button
            onClick={() => router.push("/practice")}
            className="relative w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-2xl px-6 py-5 text-left transition-all duration-150 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-base">Practice</div>
                <div className="text-indigo-100 text-xs mt-0.5 font-medium">
                  {hasPractice
                    ? `Resume · Q${progress.practiceIndex + 1}`
                    : "Untimed · with explanations"}
                </div>
              </div>
              <span className="text-2xl">📖</span>
            </div>

            {hasPractice && (
              <div className="mt-3 w-full bg-indigo-500/40 rounded-full h-1">
                <div
                  className="bg-white/70 h-1 rounded-full transition-all"
                  style={{
                    width: `${Math.min((progress.practiceIndex / TOTAL_QUESTIONS) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </button>

          {/* Test */}
          <button
            onClick={() => router.push("/test")}
            className="relative w-full bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-white rounded-2xl px-6 py-5 text-left transition-all duration-150 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-base">Test Mode</div>
                <div className="text-zinc-500 text-xs mt-0.5">
                  {lastTest
                    ? `Last score: ${lastTest.score}/${lastTest.total}`
                    : "50 questions · 12 minutes"}
                </div>
              </div>
              <span className="text-2xl">⏱️</span>
            </div>
          </button>
        </div>

        {/* Clear data — hold to delete */}
        <div className="mt-10">
          <button
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            className="flex flex-col items-center gap-1 text-xs text-zinc-400 hover:text-red-400 transition-colors select-none"
          >
            <span className="flex items-center gap-1">
              <Trash2 size={11} />
              Hold to clear data
            </span>
            {holdProgress > 0 && (
              <span className="w-full h-0.5 bg-zinc-200 rounded-full overflow-hidden">
                <span
                  className="block h-full bg-red-400 rounded-full"
                  style={{ width: `${holdProgress}%`, transition: "none" }}
                />
              </span>
            )}
          </button>
        </div>
      </main>
    </>
  );
}
