"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const COLORS = ["#eab676", "#f5d98a", "#c2410c", "#facc15"];

export default function Results() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/results", { cache: "no-store" });
    const json = await res.json();
    setData(json.active);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 1500);
    return () => clearInterval(interval);
  }, []);

return (
    <div className="min-h-screen bg-gradient-to-b from-[#3d0a0a] to-[#7a1414] text-white flex flex-col items-center p-6">
      <div className="w-full max-w-3xl px-2">
        <div className="flex justify-between items-center mb-10 mt-4">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-[#f5d98a]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f5d98a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f5d98a]"></span>
            </span>
            Live Results
          </h1>
          <Link
            href="/"
            className="text-sm bg-[#f5d98a]/10 hover:bg-[#f5d98a]/20 border border-[#f5d98a]/30 px-4 py-2 rounded-full transition text-[#f5d98a]"
          >
            ← Back to Vote
          </Link>
        </div>

        {loading && (
          <p className="text-gray-400 text-center animate-pulse">Loading...</p>
        )}

        {!loading && !data && (
          <div className="text-center py-20">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-gray-400">No poll is live right now.</p>
          </div>
        )}

        {!loading && data && (
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

            <div className="flex flex-col gap-5 md:gap-8">
              {data.choices.map((choice, i) => {
                if (!choice) return null;
                const count = data.counts[i];
                const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5 text-sm md:text-lg">
                      <span className="font-medium">{choice}</span>
                      <span className="text-gray-400">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-8 md:h-12 overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-3 text-xs md:text-base font-semibold transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[i],
                        }}
                      >
                        {pct > 8 && `${pct}%`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}