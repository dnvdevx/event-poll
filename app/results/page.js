"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const COLORS = ["#eab676", "#f5d98a", "#c2410c", "#facc15"];
const TIGER_FRAMES = [
  "/start.png",
  "/2nd.png",
  "/3rd.png",
  "/4th.png",
  "/5th.png",
  "/end.png"
];

export default function Results() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [winnerFrame, setWinnerFrame] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/results", { cache: "no-store" });
    const json = await res.json();
    setData(json.active);
    setLoading(false);

    const nameRes = await fetch("/api/event-name", { cache: "no-store" });
    const nameData = await nameRes.json();
    setEventName(nameData.eventName || "");
  }, []);

  useEffect(() => {
    const start = window.setTimeout(() => {
      void load();
    }, 0);

    const interval = window.setInterval(() => {
      void load();
    }, 1500);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWinnerFrame((current) => (current + 1) % TIGER_FRAMES.length);
    }, 110);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3d0a0a] to-[#7a1414] text-white flex flex-col items-center p-6">
      <div className="w-full max-w-3xl px-2">
        <div className="flex justify-between items-center mb-6 mt-4">
          <img src="/logo.png" alt="Thanima" className="h-14 md:h-20 lg:h-24" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#f5d98a]/30 bg-[#f5d98a]/10 px-4 py-2 text-sm text-[#f5d98a] transition hover:bg-[#f5d98a]/20"
          >
            <span>Back to Vote</span>
            <img src="/left_arrow.png" alt="Back to vote" className="h-5 w-auto md:h-6" />
          </Link>
        </div>

        {eventName && (
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-center mb-8 md:mb-12 text-[#f5d98a]">
            {eventName}
          </h1>
        )}

        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f5d98a] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f5d98a]"></span>
          </span>
          <span className="text-sm uppercase tracking-widest text-[#f5d98a]/80">Live</span>
        </div>

        {loading && (
          <p className="text-gray-400 text-center animate-pulse">Loading...</p>
        )}

        {!loading && !data && (
          <div className="text-center py-20">
            <p className="text-gray-400">No poll is live right now.</p>
          </div>
        )}

        {!loading && data && (() => {
          const winnerIndex = data.total > 0
            ? data.choices.reduce((bestIndex, choice, index) => {
                if (!choice) return bestIndex;
                const currentCount = data.counts[index] ?? 0;
                const bestCount = data.counts[bestIndex] ?? 0;
                return currentCount > bestCount ? index : bestIndex;
              }, 0)
            : -1;

          return (
            <div>
              {data.eventName && (
                <p className="text-center text-sm uppercase tracking-widest text-gray-400 mb-2">
                  {data.eventName}
                </p>
              )}

              <h2 className="text-2xl md:text-4xl font-semibold mb-2 text-center leading-snug">
                {data.text}
              </h2>

              <p className="text-center text-gray-500 text-sm md:text-base mb-8 md:mb-12">
                {data.total} vote{data.total !== 1 ? "s" : ""}
              </p>

              <div className="rounded-[28px] border border-[#f5d98a]/20 bg-[#2a0909]/50 p-4 md:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm">
                <div className="flex min-h-[290px] items-end justify-center gap-3 md:gap-5">
                  {data.choices.map((choice, i) => {
                    if (!choice) return null;

                    const count = data.counts[i];
                    const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
                    const barHeight = Math.max(pct, count > 0 ? 12 : 0);
                    const isWinner = i === winnerIndex && data.total > 0 && count > 0;

                    return (
                      <div
                        key={i}
                        className="relative flex flex-1 flex-col items-center justify-end gap-3"
                      >
                        <div className="relative flex h-56 w-full items-end justify-center md:h-64">
                          {isWinner && (
                            <div
                              className="pointer-events-none absolute left-1/2 z-20 flex -translate-x-1/2 items-center justify-center"
                              style={{ bottom: `calc(${barHeight}% + 27px)` }}
                            >
                              <img
                                src={TIGER_FRAMES[winnerFrame]}
                                alt="Winner tiger celebration"
                                className="h-20 w-auto object-contain drop-shadow-[0_0_6px_rgba(245,217,138,0.22)] md:h-24"
                              />
                            </div>
                          )}

                          <div
                            className="relative flex w-[72%] min-w-[42px] items-start justify-center rounded-t-[18px] border border-[#f5d98a]/20 shadow-[0_10px_26px_rgba(0,0,0,0.2)] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{
                              height: `${barHeight}%`,
                              background: `linear-gradient(180deg, ${COLORS[i % COLORS.length]} 0%, ${COLORS[i % COLORS.length]}cc 100%)`,
                              boxShadow: isWinner
                                ? `0 0 10px ${COLORS[i % COLORS.length]}55, 0 10px 18px rgba(0,0,0,0.18)`
                                : `0 0 8px ${COLORS[i % COLORS.length]}44`,
                              transition: 'height 1.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease, transform 0.5s ease',
                              transform: isWinner ? 'translateY(-1px)' : 'translateY(0)',
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-[#f5d98a]/20 bg-[#3d0a0a]/80 px-2 py-1 text-[11px] font-bold text-[#f5d98a] md:text-xs">
                              <span>{pct}%</span>
                              {isWinner && (
                                <span className="rounded-full border border-[#f5d98a]/30 bg-[#3d0a0a]/90 px-1 py-0.5 text-[8px] font-bold uppercase tracking-[0.15em] text-[#f5d98a]">
                                  LEAD
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f5d98a]/80 md:text-xs">
                            {count}
                          </div>
                          <div className="mt-1 max-w-[110px] text-xs font-medium text-[#f8f1d7] md:text-sm">
                            {choice}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}