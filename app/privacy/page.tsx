
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Permission = "everyone" | "followers" | "nobody";

type Settings = {
  is_private: boolean;
  post_visibility: "public" | "followers" | "only_me";
  allow_follow_requests: boolean;
  reaction_permission: Permission;
  message_permission: Permission;
  comment_permission: Permission;
  online_status_visibility: Permission;
  maximum_privacy: boolean;
};

const defaultSettings: Settings = {
  is_private: false,
  post_visibility: "public",
  allow_follow_requests: true,
  reaction_permission: "everyone",
  message_permission: "everyone",
  comment_permission: "everyone",
  online_status_visibility: "everyone",
  maximum_privacy: false,
};

export default function PrivacyPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("member_public_profiles")
        .select(
          "is_private, post_visibility, allow_follow_requests, reaction_permission, message_permission, comment_permission, online_status_visibility, maximum_privacy"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setMessage("Could not load your privacy settings.");
      } else if (data) {
        setSettings({
          ...defaultSettings,
          ...data,
        });
      } else {
        setMessage("Your public profile could not be found.");
      }

      setLoading(false);
    }

    loadSettings();
  }, []);

  function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
      ...(key === "is_private" && value === false
        ? { maximum_privacy: false }
        : {}),
    }));
  }

  function enableMaximumPrivacy() {
    setSettings((previous) => ({
      ...previous,
      is_private: true,
      post_visibility: "followers",
      allow_follow_requests: false,
      reaction_permission: "nobody",
      message_permission: "nobody",
      comment_permission: "nobody",
      online_status_visibility: "nobody",
      maximum_privacy: true,
    }));
  }

  function disableMaximumPrivacy() {
    setSettings((previous) => ({
      ...previous,
      maximum_privacy: false,
    }));
  }

  async function saveSettings() {
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please log in again.");
        return;
      }

      const { error } = await supabase
        .from("member_public_profiles")
        .update(settings)
        .eq("user_id", user.id);

      if (error) {
        console.error("Privacy save error:", error);
        setMessage("Could not save settings: " + error.message);
        return;
      }

      setMessage("Your privacy settings have been saved!");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function permissionSelect(
    label: string,
    description: string,
    value: Permission,
    key: "reaction_permission" | "message_permission" |
      "comment_permission" | "online_status_visibility"
  ) {
    return (
      <div className="bg-[#07111f] border border-gray-700 rounded-xl p-4">
        <label className="font-semibold block">{label}</label>
        <p className="text-gray-400 text-xs mt-1 mb-3">
          {description}
        </p>

        <select
          value={value}
          disabled={settings.maximum_privacy}
          onChange={(e) =>
            updateSetting(key, e.target.value as Permission)
          }
          className="w-full bg-[#12233a] border border-gray-700 rounded-lg p-3 outline-none disabled:opacity-50"
        >
          <option value="everyone">Everyone</option>
          <option value="followers">Approved followers</option>
          <option value="nobody">Nobody</option>
        </select>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">

        <Link
          href="/dashboard"
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          ← Back to Dashboard
        </Link>

        <header className="mt-10 mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">
            POJAX ADVANCED PRIVACY
          </h1>
          <p className="text-gray-400 mt-2">
            You decide who can access and interact with your account.
          </p>
        </header>

        {loading ? (
          <p className="text-gray-400">Loading privacy settings...</p>
        ) : (
          <div className="space-y-6">

            {/* Maximum privacy */}
            <section className="bg-[#12233a] border border-cyan-800 rounded-2xl p-5">
              <h2 className="text-xl font-bold text-cyan-300">
                Maximum Privacy
              </h2>

              <p className="text-sm text-gray-400 mt-2">
                Apply the most restrictive available settings
                to your account.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={enableMaximumPrivacy}
                  className="bg-cyan-500 text-black font-bold px-4 py-3 rounded-lg"
                >
                  Enable Maximum Privacy
                </button>

                <button
                  type="button"
                  onClick={disableMaximumPrivacy}
                  className="border border-gray-600 px-4 py-3 rounded-lg"
                >
                  Customise Settings
                </button>
              </div>

              {settings.maximum_privacy && (
                <p className="text-cyan-300 text-sm mt-4">
                  Maximum Privacy is selected. Save your settings
                  to apply your choices.
                </p>
              )}
            </section>

            {/* Account visibility */}
            <section className="bg-[#12233a] border border-gray-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-xl font-bold">Account Visibility</h2>

              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block font-semibold">Private account</span>
                  <span className="block text-xs text-gray-400 mt-1">
                    Restrict profile and post visibility.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.is_private}
                  disabled={settings.maximum_privacy}
                  onChange={(e) =>
                    updateSetting("is_private", e.target.checked)
                  }
                  className="w-5 h-5 accent-cyan-400"
                />
              </label>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Who can see your posts?
                </label>
                <select
                  value={settings.post_visibility}
                  disabled={settings.maximum_privacy}
                  onChange={(e) =>
                    updateSetting(
                      "post_visibility",
                      e.target.value as Settings["post_visibility"]
                    )
                  }
                  className="w-full bg-[#07111f] border border-gray-700 rounded-lg p-3 disabled:opacity-50"
                >
                  <option value="public">Everyone</option>
                  <option value="followers">Approved followers</option>
                  <option value="only_me">Only me</option>
                </select>
              </div>
            </section>

            {/* Follow requests */}
            <section className="bg-[#12233a] border border-gray-800 rounded-2xl p-5">
              <h2 className="font-bold text-lg mb-3">Follow Requests</h2>

              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="font-semibold block">
                    Allow follow requests
                  </span>
                  <span className="text-xs text-gray-400">
                    Let people request to follow you.
                  </span>
                </span>

                <input
                  type="checkbox"
                  checked={settings.allow_follow_requests}
                  disabled={settings.maximum_privacy}
                  onChange={(e) =>
                    updateSetting(
                      "allow_follow_requests",
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 accent-cyan-400"
                />
              </label>
            </section>

            {/* Interaction permissions */}
            <section className="bg-[#12233a] border border-gray-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-xl font-bold mb-2">
                Interaction Permissions
              </h2>

              {permissionSelect(
                "Who can react to your posts?",
                "Control who can react to your content.",
                settings.reaction_permission,
                "reaction_permission"
              )}

              {permissionSelect(
                "Who can comment on your posts?",
                "Control who can comment on your content.",
                settings.comment_permission,
                "comment_permission"
              )}

              {permissionSelect(
                "Who can send you messages?",
                "Control who can contact you privately.",
                settings.message_permission,
                "message_permission"
              )}

              {permissionSelect(
                "Who can see your online status?",
                "Control the visibility of your online presence.",
                settings.online_status_visibility,
                "online_status_visibility"
              )}
            </section>

            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl"
            >
              {saving ? "Saving..." : "Save All Privacy Settings"}
            </button>

            {message && (
              <p className="text-center text-sm text-cyan-300">
                {message}
              </p>
            )}

            <p className="text-xs text-gray-500 text-center">
              Some permissions still need their corresponding
              database and application enforcement before they
              are fully active.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
