
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem(
      "pojax_pending_verification_email"
    );

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: "email",
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      sessionStorage.removeItem("pojax_pending_verification_email");
      router.replace("/dashboard");
    } catch {
      setMessage("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050914] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0b1628] p-8 shadow-2xl shadow-cyan-950/30">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-400">POJAX T-N</h1>
          <h2 className="mt-5 text-xl font-semibold">Verify Your Email</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Enter the verification code sent to your email address to
            complete your registration.
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-700 bg-[#050914] p-3 outline-none focus:border-cyan-400"
              placeholder="Your registered email"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              required
              minLength={6}
              maxLength={10}
              className="w-full rounded-lg border border-slate-700 bg-[#050914] p-3 text-center text-xl tracking-[0.35em] outline-none focus:border-cyan-400"
              placeholder="Enter your code"
            />
            <p className="mt-2 text-xs text-slate-400">
              Enter the numeric code exactly as it appears in your email.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 p-3 font-bold text-[#050914] transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          {message && (
            <p className="break-words text-center text-sm text-rose-300">
              {message}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already verified?{" "}
          <Link href="/login" className="font-semibold text-cyan-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
