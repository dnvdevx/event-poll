"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [saving, setSaving] = useState(false);
  const [globalEventName, setGlobalEventName] = useState("");
  const [savingEventName, setSavingEventName] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setLoggedIn(true);
      loadQuestions();
      loadEventName();
    } else {
      setError("Wrong password");
    }
  }

  async function loadQuestions() {
    const res = await fetch("/api/questions");
    if (res.ok) {
      const data = await res.json();
      setQuestions(data.questions.reverse());
    }
  }

  async function handleCreate(e) {
    e.preventDefault();

    const filledChoices = choices.filter((c) => c.trim() !== "");

    if (!text || filledChoices.length < 2) {
      alert("Please enter a question and at least 2 choices.");
      return;
    }

    if (filledChoices.length < 4) {
      const confirmed = window.confirm(
        `You only entered ${filledChoices.length} choices. Continue anyway?`
      );
      if (!confirmed) return;
    }

    setSaving(true);
    await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, choices: filledChoices }),
    });
    setText("");
    setChoices(["", "", "", ""]);
    setSaving(false);
    loadQuestions();
  }

  async function loadEventName() {
    const res = await fetch("/api/event-name");
    const data = await res.json();
    setGlobalEventName(data.eventName || "");
  }

  async function handleSaveEventName(e) {
    e.preventDefault();
    setSavingEventName(true);
    await fetch("/api/event-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName: globalEventName }),
    });
    setSavingEventName(false);
  }

  async function handleRelease(id) {
    await fetch("/api/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadQuestions();
  }

  async function handleEnd(id) {
    await fetch("/api/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: null }),
    });
    loadQuestions();
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this question? This can't be undone.");
    if (!confirmed) return;

    const res = await fetch("/api/questions/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete");
      return;
    }

    loadQuestions();
  }

  useEffect(() => {
    fetch("/api/questions").then((res) => {
      if (res.ok) {
        setLoggedIn(true);
        loadQuestions();
        loadEventName();
      }
    });
  }, []);

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2a0808] to-[#4a0e0e]">
        <form
          onSubmit={handleLogin}
          className="bg-[#1a0505]/80 border border-[#f5d98a]/10 p-6 rounded-2xl flex flex-col gap-3 mb-6 max-w-xl w-80"
        >
          <h1 className="text-xl font-bold text-white">Admin Login</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black/30 border border-white/10 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 ring-[#f5d98a] placeholder-gray-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="bg-[#c2410c] hover:bg-[#a8380e] text-white py-2 rounded-lg transition">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a0808] to-[#4a0e0e] text-white p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-6 text-[#f5d98a]">Poll Admin</h1>

      <form
        onSubmit={handleSaveEventName}
        className="bg-[#1a0505]/80 border border-[#f5d98a]/10 p-6 rounded-2xl flex flex-col gap-3 mb-6 max-w-xl"
      >
        <h2 className="font-semibold text-lg mb-2">Event Name</h2>
        <input
          placeholder="e.g. SARGAM '26"
          value={globalEventName}
          onChange={(e) => setGlobalEventName(e.target.value)}
          className="bg-black/30 border border-white/10 px-4 py-2 rounded-lg outline-none focus:ring-2 ring-[#f5d98a] text-white placeholder-gray-500 w-full"
        />
        <button
          disabled={savingEventName}
          className="bg-[#c2410c] hover:bg-[#a8380e] disabled:opacity-50 text-white py-2 rounded-lg mt-2 transition"
        >
          {savingEventName ? "Saving..." : "Save Event Name"}
        </button>
      </form>

      <form
        onSubmit={handleCreate}
        className="bg-[#1a0505]/80 border border-[#f5d98a]/10 p-6 rounded-2xl flex flex-col gap-3 mb-10 max-w-xl"
      >
        <h2 className="font-semibold text-lg mb-2">New Question</h2>
        <input
          placeholder="Question text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="bg-black/30 border border-white/10 px-4 py-2 rounded-lg outline-none focus:ring-2 ring-[#f5d98a] text-white placeholder-gray-500"
        />
        {choices.map((c, i) => (
          <input
            key={i}
            placeholder={`Choice ${i + 1}`}
            value={c}
            onChange={(e) => {
              const next = [...choices];
              next[i] = e.target.value;
              setChoices(next);
            }}
            className="bg-black/30 border border-white/10 px-4 py-2 rounded-lg outline-none focus:ring-2 ring-[#f5d98a] text-white placeholder-gray-500"
          />
        ))}
        <button
          disabled={saving}
          className="bg-[#c2410c] hover:bg-[#a8380e] disabled:opacity-50 text-white py-2 rounded-lg mt-2 transition"
        >
          {saving ? "Saving..." : "Add to Queue"}
        </button>
      </form>

      <h2 className="font-semibold text-lg mb-4 text-[#f5d98a]">Questions</h2>
      <div className="flex flex-col gap-3 max-w-xl">
        {questions.map((q) => (
          <div
            key={q.id}
            className="bg-[#1a0505]/80 border border-[#f5d98a]/10 p-4 rounded-xl flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{q.text}</p>
              <p className="text-sm text-gray-400 capitalize">{q.status}</p>
            </div>
            <div className="flex gap-2">
              {q.status !== "active" ? (
                <button
                  onClick={() => handleRelease(q.id)}
                  className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm transition"
                >
                  Release
                </button>
              ) : (
                <button
                  onClick={() => handleEnd(q.id)}
                  className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm transition"
                >
                  End
                </button>
              )}
              {q.status !== "active" && (
                <button
                  onClick={() => handleDelete(q.id)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <p className="text-gray-500">No questions yet.</p>
        )}
      </div>
    </div>
  );
}