"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const settingsSections = [
  {
    heading: "Account",
    items: [
      {
        icon: "👤",
        title: "Profile",
        description: "Manage your name and profile information.",
        path: "/profile",
      },
      {
        icon: "🔒",
        title: "Security",
        description: "Manage account security.",
        path: "/security",
      },
      {
        icon: "🛡️",
        title: "Privacy",
        description: "Manage your privacy preferences.",
        path: "/privacy",
      },
    ],
  },
  {
    heading: "POJAX",
    items: [
      {
        icon: "👥",
        title: "Connections",
        description: "View your connections.",
        path: "/connections",
      },
      {
        icon: "🎬",
        title: "Reels",
        description: "Explore video content.",
        path: "/reels",
      },
      {
        icon: "🌐",
        title: "Social feed",
        description: "View posts and share content.",
        path: "/social",
      },
      {
        icon: "🔍",
        title: "Search",
        description: "Find people and content.",
        path: "/search",
      },
      {
        icon: "👥",
        title: "Groups",
        description: "Access your groups.",
        path: "/groups",
      },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setLoading(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    setSigningOut(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setSigningOut(false);
      alert("We couldn't sign you out. Please try again.");
      return;
    }

    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07182d] text-cyan-300">
        Checking your account...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07182d] px-3 py-5 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-7 flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-900 text-xl hover:bg-cyan-950"
          >
            ←
          </Link>

          <div>
            <h1 className="text-2xl font-black text-cyan-300">Settings</h1>
            <p className="text-xs text-slate-400">
              Manage your POJAX SOCIAL experience
            </p>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-cyan-900 bg-[#0b2340] p-4 sm:p-5">
          <h2 className="font-bold">Your POJAX account</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Manage your account information, privacy and security.
          </p>
        </section>

        {settingsSections.map((section) => (
          <section key={section.heading} className="mb-7">
            <h2 className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-400">
              {section.heading}
            </h2>

            <div className="overflow-hidden rounded-2xl border border-cyan-900/80 bg-[#0b2340]">
              {section.items.map((item, index) => (
                <Link
                  key={item.title}
                  href={item.path}
                  className={`flex items-center gap-3 p-4 transition hover:bg-[#103052] ${
                    index !== section.items.length - 1
                      ? "border-b border-cyan-950"
                      : ""
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#12395c] text-xl">
                    {item.icon}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {item.description}
                    </span>
                  </span>

                  <span className="text-lg text-cyan-500">›</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="mb-7">
          <h2 className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-cyan-400">
            Appearance
          </h2>

          <div className="rounded-2xl border border-cyan-900 bg-[#0b2340] p-4">
            <h3 className="text-sm font-bold">Choose your appearance</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Dark blue is the current default. Dark and White appearance
              choices are planned for a later update.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border-2 border-cyan-400 bg-[#07182d] p-3 text-center">
                <div className="mx-auto mb-2 h-7 w-7 rounded-full border border-cyan-300 bg-[#12395c]" />
                <p className="text-xs font-bold">Dark blue</p>
                <p className="mt-1 text-[10px] text-cyan-300">Current</p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-[#101827] p-3 text-center opacity-60">
                <div className="mx-auto mb-2 h-7 w-7 rounded-full border border-slate-500 bg-[#020617]" />
                <p className="text-xs font-bold">Dark</p>
                <p className="mt-1 text-[10px] text-slate-400">Planned</p>
              </div>

              <div className="rounded-xl border border-slate-700 bg-white p-3 text-center text-slate-900 opacity-60">
                <div className="mx-auto mb-2 h-7 w-7 rounded-full border border-slate-300 bg-white" />
                <p className="text-xs font-bold">White</p>
                <p className="mt-1 text-[10px] text-slate-500">Planned</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-red-900/60 bg-[#251624] p-4">
          <h2 className="font-bold text-red-300">Sign out</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Sign out of your POJAX account on this device.
          </p>

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </section>

        <footer className="py-7 text-center text-xs text-slate-500">
          © 2026 POJAX SOCIAL
        </footer>
      </div>
    </main>
  );
}