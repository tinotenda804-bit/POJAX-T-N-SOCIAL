
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = "/dashboard";
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#050b18] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0b1628] p-8">
        <h1 className="text-3xl font-bold text-cyan-400">
          Welcome Back
        </h1>

        <p className="mt-2 text-gray-300">
          Sign in to your PojaX T-N account.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block">Email address</label>
            <input
              type="email" autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-[#050b18] p-3 outline-none focus:border-cyan-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block">Password</label>
            <input
              type="password"autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-[#050b18] p-3 outline-none focus:border-cyan-400"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 p-3 font-bold text-black hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {message && (
          <p className="mt-5 text-center text-sm text-cyan-300">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
