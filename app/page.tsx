"use client";

import { useState } from "react";

type Reply = {
  message: string;
  poetry: {
    included: boolean;
    type: "recommendation" | "quote" | null;
    poet: string | null;
    title: string | null;
    reason: string | null;
  };
};

export default function Home() {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [reply, setReply] = useState<Reply | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong");
      }

      setSubmitted(data.received ?? trimmed);
      setReply(data.reply ?? null);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 p-6 font-sans dark:bg-black">
      <h1 className="font-mukta text-3xl font-light">सरमाया</h1>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xl flex-col gap-3"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write something…"
          rows={6}
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white p-4 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="self-end rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40 dark:bg-white dark:text-black"
        >
          {sending ? "Sending…" : "Submit"}
        </button>
      </form>

      {error && (
        <p className="w-full max-w-xl rounded-lg bg-red-100 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {submitted && (
        <div className="flex w-full max-w-xl flex-col gap-2">
          <p className="whitespace-pre-wrap rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-900">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
              You
            </span>
            {submitted}
          </p>
          {reply && (
            <div className="flex flex-col gap-2 rounded-lg bg-zinc-200 p-4 dark:bg-zinc-800">
              <span className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
                Sarmaya
              </span>
              <p className="whitespace-pre-wrap text-sm">{reply.message}</p>
              {/* {reply.poetry?.included && (
                <div className="mt-1 flex flex-col gap-1 border-t border-zinc-300 pt-3 text-sm dark:border-zinc-700">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {reply.poetry.type === "quote" ? "Quote" : "Recommendation"}
                  </span>
                  {(reply.poetry.poet || reply.poetry.title) && (
                    <p className="font-medium">
                      {[reply.poetry.title, reply.poetry.poet]
                        .filter(Boolean)
                        .join(" — ")}
                    </p>
                  )}
                  {reply.poetry.reason && (
                    <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                      {reply.poetry.reason}
                    </p>
                  )}
                </div>
              )} */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
