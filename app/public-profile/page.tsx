
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function PublicProfileEditor() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("member_public_profiles")
        .select("display_name, bio, is_private")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Public profile error:", error);
        setMessage("Unable to load your public profile.");
        setLoading(false);
        return;
      }

      if (data) {
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setIsPrivate(data.is_private ?? false);
      } else {
        setMessage("Your public profile has not been created yet.");
      }

      setLoading(false);
    }

    loadProfile();
  }, [router, supabase]);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!userId) return;

    if (!displayName.trim()) {
      setMessage("Please enter a display name.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("member_public_profiles")
      .upsert(
        {
          user_id: userId,
          display_name: displayName.trim(),
          bio: bio.trim(),
          is_private: isPrivate,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Public profile save error:", error);
      setMessage("Unable to save your profile. Please try again.");
    } else {
      setMessage("Your public profile and privacy settings have been saved!");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050b18] text-white flex items-center justify-center">
        Loading your profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050b18] text-white px-4 py-10">
      <div className="max-w-2xl mx-auto">

        <a href="/dashboard" className="text-cyan-400">
          ← Back to Dashboard
        </a>

        <section className="mt-6 rounded-2xl border border-cyan-900 bg-[#0b1528] p-6">

          <h1 className="text-2xl font-bold text-cyan-300">
            Edit Public Profile
          </h1>

          <p className="text-gray-400 mt-2 mb-6">
            Introduce yourself to the POJAX SOCIAL community.
          </p>

          <form onSubmit={saveProfile} className="space-y-5">

            <div>
              <label className="block text-sm mb-2">
                Public Display Name
              </label>

              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                placeholder="Enter your display name"
                className="w-full rounded-lg bg-[#050b18] border border-gray-700 p-3 text-white outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Your Biography
              </label>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={6}
                placeholder="Tell other members about yourself, your interests and what you do..."
                className="w-full rounded-lg bg-[#050b18] border border-gray-700 p-3 text-white outline-none focus:border-cyan-400"
              />

              <p className="text-gray-500 text-xs mt-2">
                Maximum 500 characters.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-900 bg-[#050b18] p-4">
              <h2 className="font-semibold text-cyan-300 mb-3">
                Account Privacy
              </h2>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-5 w-5 accent-cyan-500"
                />

                <span className="font-medium">
                  Make my account private
                </span>
              </label>

              <p className="text-sm text-gray-400 mt-3">
                {isPrivate
                  ? "Private account: only you and members with approved follow requests can view protected profile information and posts."
                  : "Public account: other logged-in members can view your public profile and posts."}
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#050b18] font-bold p-3 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile Settings"}
            </button>

          </form>

          {message && (
            <p className="mt-5 text-sm text-cyan-300">
              {message}
            </p>
          )}

          <button
            onClick={() => router.push(`/member/${userId}`)}
            disabled={!userId}
            className="mt-5 text-cyan-400 hover:text-cyan-300"
          >
            View My Public Profile →
          </button>

        </section>
      </div>
    </main>
  );
}
