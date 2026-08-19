"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [votedChoice, setVotedChoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [eventName, setEventName] = useState("");

  async function load() {
    const res = await fetch("/api/vote", { cache: "no-store" });
    const data = await res.json();
    setActive(data.active);
    setVotedChoice(data.votedChoice);
    setLoading(false);

    const nameRes = await fetch("/api/event-name", { cache: "no-store" });
    const nameData = await nameRes.json();
    setEventName(nameData.eventName || "");
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, []);

  async function vote(choiceNum) {
    if (!active || votedChoice || submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: active.id, choice: choiceNum }),
    });
    if (res.ok) {
      setVotedChoice(String(choiceNum));
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3d0a0a] to-[#7a1414] text-white flex flex-col items-center justify-start p-4 md:p-10 pt-6 md:pt-10">
      <div className="w-full max-w-3xl px-2">
        <div className="flex justify-between items-center mb-8 md:mb-12">
          <img src="/logo.png" alt="Thanima" className="h-14 md:h-20 lg:h-24" />
          <Link
            href="/results"
            className="inline-flex items-center gap-2 rounded-full border border-[#f5d98a]/30 bg-[#f5d98a]/10 px-4 py-2 text-sm text-[#f5d98a] transition hover:bg-[#f5d98a]/20 md:text-base"
          >
            <span>Live Results</span>
            <img src="/right_arrow.png" alt="Live results" className="h-5 w-auto md:h-6" />
          </Link>
        </div>

        {eventName && (
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-center mb-8 md:mb-14 text-[#f5d98a]">
            {eventName}
          </h1>
        )}

        {loading && (
          <p className="text-gray-400 text-center animate-pulse">Loading...</p>
        )}

        {!loading && !active && (
          <div className="text-center py-20">
            <p className="text-[#f5d98a]/70">No poll is live right now.</p>
            <p className="text-gray-600 text-sm mt-1">Check back soon!</p>
          </div>
        )}

        {!loading && active && (
          <div className="animate-fade-in">

            <h2 className="text-2xl md:text-4xl font-semibold mb-8 md:mb-12 text-center leading-snug">
              {active.text}
            </h2>

            <div className="flex flex-col gap-3 md:gap-4">
              {active.choices.map((choice, i) => {
                if (!choice) return null;
                const num = i + 1;
                const isSelected = votedChoice === String(num);
                return (
                  <button
                    key={i}
                    onClick={() => vote(num)}
                    disabled={!!votedChoice || submitting}
                    className={`text-left px-5 py-4 md:px-8 md:py-6 rounded-xl md:rounded-2xl border text-base md:text-xl transition-all duration-200
                      ${
                        isSelected
                          ? "bg-[#eab676] border-[#f5d98a] text-[#3d0a0a] font-semibold scale-[1.02]"
                          : votedChoice
                          ? "bg-black/20 border-white/10 opacity-50"
                          : "bg-black/20 border-white/10 hover:border-[#f5d98a] hover:bg-black/30 active:scale-[0.98]"
                      }`}
                  >
                    {choice}
                    {isSelected && <span className="ml-2">✓</span>}
                  </button>
                );
              })}
            </div>

            {votedChoice && (
              <p className="text-center text-[#f5d98a]/70 text-sm mt-6 animate-fade-in">
              Thanks for voting!{" "}
              <Link href="/results" className="text-[#f5d98a] underline">
                See live results
              </Link>
            </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}