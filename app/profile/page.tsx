
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type MemberProfile = {
  full_name: string;
  phone: string | null;
  country: string | null;
  location: string | null;
  join_reason: string | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login");
        return;
      }

      setEmail(authData.user.email ?? "");

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, country, location, join_reason")
        .eq("id", authData.user.id)
        .single();

      if (error) {
        setMessage("We couldn't load your profile. Please try again later.");
      } else {
        setProfile(data as MemberProfile);
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  function updateField(field: keyof MemberProfile, value: string) {
    setProfile((current) =>
      current ? { ...current, [field]: value } : current
    );
  }

  async function saveProfile() {
    if (!profile) return;

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setSaving(false);
      router.replace("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        country: profile.country,
        location: profile.location,
      })
      .eq("id", authData.user.id);

    setSaving(false);

    if (error) {
      setMessage("We couldn't save your changes. Please try again.");
      return;
    }

    setEditing(false);
    setMessage("Your profile information was updated successfully.");
  }

  async function changeEmail() {
    setEmailMessage("");

    if (!newEmail.trim() || !currentPassword) {
      setEmailMessage("Enter your new email and current password.");
      return;
    }

    if (newEmail.trim().toLowerCase() === email.toLowerCase()) {
      setEmailMessage("This is already your current email address.");
      return;
    }

    setEmailSaving(true);

    const supabase = createClient();

    // Verify the current password against the signed-in account.
    const { error: passwordError } =
      await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

    if (passwordError) {
      setEmailSaving(false);
      setEmailMessage("Your current password is incorrect.");
      return;
    }

    // Request an email change through Supabase Authentication.
    const { error } = await supabase.auth.updateUser({
      email: newEmail.trim(),
    });

    setEmailSaving(false);

    if (error) {
      setEmailMessage(
        "We couldn't request the email change. Please try again."
      );
      return;
    }

    setCurrentPassword("");
    setNewEmail("");

    setEmailMessage(
      "Email change requested. Check your email inboxes and follow the Supabase confirmation instructions."
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading your profile...
      </main>
    );
  }

  const fields = [
    { key: "full_name" as const, label: "Full Name" },
    { key: "country" as const, label: "Country" },
    { key: "location" as const, label: "Location" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-cyan-400">
            POJAX T-N
          </h1>
          <p className="mt-2 text-slate-400">
            Member Information
          </p>
        </header>

        <section className="rounded-2xl border border-cyan-900 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-semibold">
            Account Information
          </h2>

          {message && (
            <p className="mb-5 text-sm text-cyan-300">{message}</p>
          )}

          {profile && (
            <div className="space-y-5">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm text-slate-400">
                    {field.label}
                  </label>

                  {editing ? (
                    <input
                      value={profile[field.key] ?? ""}
                      onChange={(event) =>
                        updateField(field.key, event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
                    />
                  ) : (
                    <p className="mt-1">
                      {profile[field.key] || "Not provided"}
                    </p>
                  )}
                </div>
              ))}

              <div>
                <p className="text-sm text-slate-400">Email Address</p>
                <p className="mt-1 break-all">{email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Phone Number</p>
                <p className="mt-1">
                  {profile.phone || "Not provided"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Phone changes require separate verification.
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Reason for Joining
                </p>
                <p className="mt-1 whitespace-pre-wrap">
                  {profile.join_reason || "Not provided"}
                </p>
              </div>
            </div>
          )}

          {profile && (
            <div className="mt-8 flex flex-wrap gap-3">
              {editing ? (
                <>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="rounded-lg bg-cyan-500 px-5 py-3 font-bold text-slate-950 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={() => {
                      setEditing(false);
                      setMessage("");
                    }}
                    className="rounded-lg border border-slate-600 px-5 py-3"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setEditing(true);
                    setMessage("");
                  }}
                  className="rounded-lg bg-cyan-500 px-5 py-3 font-bold text-slate-950"
                >
                  Edit Information
                </button>
              )}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-cyan-900 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Change Email Address
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Confirm your current password before requesting an email change.
            Supabase will handle the email verification.
          </p>

          {emailMessage && (
            <p className="mt-4 text-sm text-cyan-300">
              {emailMessage}
            </p>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm text-slate-400">
                New Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                placeholder="Enter your new email"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                placeholder="Enter your current password"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={changeEmail}
              disabled={emailSaving}
              className="w-full rounded-lg bg-cyan-500 p-3 font-bold text-slate-950 disabled:opacity-50"
            >
              {emailSaving ? "Processing..." : "Verify and Change Email"}
            </button>
          </div>
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
