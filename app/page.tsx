"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Session = {
  id: number;
  subject: string;
  minutes: number;
};

export default function Home() {
  const [subject, setSubject] = useState("");
  const [minutes, setMinutes] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    async function loadSessions() {
      const { data, error } = await supabase.from("study_sessions").select("*");

      if (error) {
        console.log(error);
        return;
      }

      setSessions(data);
    }

    loadSessions();
  }, []);

  async function handleLog() {
    if (!subject || !minutes) return;

    const { data, error } = await supabase
      .from("study_sessions")
      .insert({ subject, minutes: Number(minutes) })
      .select()
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setSessions([...sessions, data]);
    setSubject("");
    setMinutes("");
  }


  let total = 0;
  for (const s of sessions) {
    total += s.minutes;
  }

  return (
    <main className="p-2">
      <h1 className="text-4xl font-bold">Study Tracker</h1>
      <p className="text-gray-500 mt-2">Track your A/L study hours.</p>

      <div className="mt-6 flex flex-col gap-3 max-w-sm">
        <input
          className="border rounded p-2"
          placeholder="Subject (e.g. Combined Maths)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          className="border rounded p-2"
          placeholder="Minutes"
          value={minutes}
          type="number"
          onChange={(e) => setMinutes(e.target.value)}
        />

        <p>
          You're logging {minutes || "0"} minutes of {subject || "a subject"}
        </p>

        <button className="bg-black text-white rounded p-2"
          onClick={handleLog}
        >
          Log session
        </button>

        <ul>
          {sessions.map((session) => (
            <li key={session.id} className="list-disc ml-6">
              {session.subject} - {session.minutes} minutes
            </li>
          ))}
        </ul>

        <p className="mt-4 font-bold">Total: {(total / 60).toFixed(1)} hours</p>

      </div>
    </main>
  );
}