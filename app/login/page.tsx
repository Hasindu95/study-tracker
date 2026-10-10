"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Authentication() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    async function handleLogin() {
        
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
            return;
        }

        router.push("/");
    }

    async function handleSignup() {
        
        const { error } = await supabase.auth.signUp({ 
            email, 
            password 
        });

        if (error) {
            alert(error.message);
            return;
        }

        router.push("/");
    }

    return (
        <main className="p-2">
            <h1 className="text-4xl font-bold">Login</h1>
            <div className="mt-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                />
                <button
                    onClick={handleLogin}
                    className="bg-blue-500 text-white p-2 rounded w-full"
                >
                    Login
                </button>
                <button
                    onClick={handleSignup}
                    className="bg-green-500 text-white p-2 rounded w-full mt-2"
                >
                    Sign Up
                </button>
            </div>
        </main>
    );
}