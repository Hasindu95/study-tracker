"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { minutesToHours } from "@/lib/format";

type Session = {
  id: number;
  subject: string;
  minutes: number;
};

type WeeklyTotal = {
  subject: string;
  total_minutes: number;
};

export default function Home() {
  const [subject, setSubject] = useState("");
  const [minutes, setMinutes] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [weeklyTotals, setWeeklyTotals] = useState<WeeklyTotal[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadSessions() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }
      setUserEmail(userData.user.email ?? "");

      const { data, error } = await supabase.from("study_sessions").select("*");

      if (error) {
        console.log(error);
        return;
      }

      setSessions(data);

      await loadWeeklyTotals();
    }

    loadSessions();
  }, []);

  async function loadWeeklyTotals() {
    const { data: totalsData } = await supabase
      .from("weekly_totals")
      .select("*")
      .order("total_minutes", { ascending: false });

    setWeeklyTotals(totalsData || []);
  }

  async function handleLog() {
    if (!subject || !minutes) return;

    const { data, error } = await supabase
      .from("study_sessions")
      .insert({ subject: subject, minutes: Number(minutes) })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setSessions([...sessions, data]);
    setSubject("");
    setMinutes("");

    await loadWeeklyTotals();
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/login");
  }


  let total = 0;
  for (const s of sessions) {
    total += s.minutes;
  }

  return (
    <main className="p-2">
      <p className="text-sm text-gray-500">Logged in as: {userEmail}</p>
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

        <p className="mt-4 font-bold">Total: {minutesToHours(total)} hours</p>

        <h2 className="mt-4 font-bold">This Week:</h2>
        <ul>
          {weeklyTotals.map((totals) => (
            <li key={totals.subject} className="list-disc ml-6">
              {totals.subject} - {minutesToHours(totals.total_minutes)} hours
            </li>
          ))}
        </ul>

        <p className="mt-4 font-bold">Hours: {minutesToHours(weeklyTotals.reduce((acc, curr) => acc + curr.total_minutes, 0))} hours</p>

        <button className="bg-red-500 text-white rounded p-2 mt-4"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>
    </main>
  );
}