
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function SecurityPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAccount() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setEmail(data.user.email ?? "");
      setLoading(false);
    }

    checkAccount();
  }, [router]);

  async function changePassword() {
    if (saving) return;

    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Your new passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setMessage("Choose a password different from your current one.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const { error: verifyError } =
        await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });

      if (verifyError) {
        setMessage("Your current password is incorrect.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage("Password change failed. Please try again.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage("Your password has been changed successfully.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Checking account security...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl">

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-black text-cyan-400">
            POJAX SECURITY
          </h1>
          <p className="mt-2 text-slate-400">
            Protect your account and personal information.
          </p>
        </header>

        <section className="rounded-2xl border border-cyan-900 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">
            Account Security
          </h2>

          <p className="mt-3 text-sm text-slate-400">
            Signed in as:
          </p>

          <p className="mt-1 break-all font-semibold text-cyan-400">
            {email}
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-cyan-900 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">
            Change Password
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Verify your current password before choosing a new one.
            Use at least 8 characters.
          </p>

          {message && (
            <p className="mt-5 rounded-lg bg-slate-800 p-3 text-sm text-cyan-300">
              {message}
            </p>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-slate-400">
                Current Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Confirm New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={changePassword}
              disabled={saving}
              className="w-full rounded-lg bg-cyan-500 p-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {saving ? "Updating..." : "Change Password"}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-red-900/60 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">
            Account Session
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Sign out of this account on this device.
          </p>

          <button
            onClick={signOut}
            className="mt-5 rounded-lg bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-500"
          >
            Sign Out
          </button>
        </section>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 w-full rounded-lg bg-slate-700 p-3 font-bold hover:bg-slate-600"
        >
          Back to Dashboard
        </button>

      </div>
    </main>
  );
}
