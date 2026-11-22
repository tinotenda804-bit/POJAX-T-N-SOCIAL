
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const sections = [
  {
    number: "01",
    title: "POJAX CONNECT",
    description: "Discover people, build connections and explore opportunities.",
    icon: "◈",
  },
  {
    number: "02",
    title: "POJAX SOCIAL",
    description: "Share ideas, publish posts and join discussions.",
    icon: "◎",
  },
  {
    number: "03",
    title: "POJAX ACADEMY",
    description: "Learn new skills and share your knowledge.",
    icon: "⌬",
  },
  {
    number: "04",
    title: "POJAX MARKET",
    description: "Explore products, hardware and digital services.",
    icon: "▣",
  },
  {
    number: "05",
    title: "POJAX PRO",
    description: "Discover professional services and expertise.",
    icon: "⌘",
  },
  {
    number: "06",
    title: "POJAX VAULT",
    description: "Your private space for personal digital files.",
    icon: "▤",
  },
  {
    number: "07",
    title: "POJAX REWARDS",
    description: "Get recognition for valuable contributions.",
    icon: "✧",
  },
  {
    number: "08",
    title: "POJAX BILL ME POINTS",
    description: "Explore member reward points and benefits.",
    icon: "◉",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setEmail(data.user.email ?? "");
      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050b18] text-white">
        Loading your dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050b18] p-5 text-white md:p-8">
      <div className="mx-auto max-w-7xl">

        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/30 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-wide text-cyan-400">
              POJAX T-N
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Your world of connections and opportunities.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400"
          >
            Sign Out
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#0b1b35] to-[#0b1628] p-7">
          <p className="text-sm font-semibold tracking-widest text-cyan-400">
            MEMBER DASHBOARD
          </p>

          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            Welcome to PojaX T-N.
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-gray-300">
            Connect with people, share ideas, learn, discover opportunities
            and contribute to a growing global platform.
          </p>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-sm text-gray-400">Your signed-in email</p>
            <p className="mt-1 break-all font-semibold text-cyan-300">
              {email}
            </p>
          </div>
        </section>

        {/* MEMBER QUICK ACCESS */}
        <section className="mt-8">
          <p className="text-sm font-bold tracking-widest text-cyan-400">
            MEMBER QUICK ACCESS
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Your account and community
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <button
              onClick={() => router.push("/profile")}
              className="rounded-xl border border-cyan-800 bg-[#0b1628] p-5 text-left transition hover:border-cyan-400"
            >
              <h3 className="font-bold text-cyan-400">POJAX PROFILE</h3>
              <p className="mt-2 text-sm text-gray-400">
                View and manage your member information.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-cyan-300">
                Open Profile →
              </span>
            </button>

            <button
              onClick={() => router.push("/security")}
              className="rounded-xl border border-cyan-800 bg-[#0b1628] p-5 text-left transition hover:border-cyan-400"
            >
              <h3 className="font-bold text-cyan-400">POJAX SECURITY</h3>
              <p className="mt-2 text-sm text-gray-400">
                Manage your password and account security.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-cyan-300">
                Open Security →
              </span>
            </button>

            <button
              onClick={() => router.push("/groups")}
              className="rounded-xl border border-cyan-800 bg-[#0b1628] p-5 text-left transition hover:border-cyan-400"
            >
              <h3 className="font-bold text-cyan-400">POJAX GROUPS</h3>
              <p className="mt-2 text-sm text-gray-400">
                Discover communities, manage your groups and connect with members.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-cyan-300">
                Open Groups →
              </span>
            </button>

            <button
              onClick={() => router.push("/search")}
              className="rounded-xl border border-cyan-800 bg-[#0b1628] p-5 text-left transition hover:border-cyan-400"
            >
              <h3 className="font-bold text-cyan-400">POJAX SEARCH</h3>
              <p className="mt-2 text-sm text-gray-400">
                Find people and explore available platform content.
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-cyan-300">
                Search Now →
              </span>
            </button>

          </div>
        </section>

        {/* PLATFORM SECTIONS */}
        <section className="mt-12">
          <div>
            <p className="text-sm font-bold tracking-widest text-cyan-400">
              YOUR PLATFORM
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Explore PojaX T-N
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Different opportunities. One connected platform.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <article
                key={section.number}
                className="rounded-xl border border-gray-700 bg-[#0b1628] p-6 transition hover:-translate-y-1 hover:border-cyan-400/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl text-cyan-400">
                    {section.icon}
                  </span>
                  <span className="text-xs text-gray-600">
                    {section.number}
                  </span>
                </div>

                <h3 className="mt-6 text-base font-bold text-cyan-400">
                  {section.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {section.description}
                </p>

                {section.title === "POJAX SOCIAL" ? (
                  <button
                    onClick={() => router.push("/social")}
                    className="mt-5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    OPEN POJAX SOCIAL →
                  </button>
                ) : (
                  <p className="mt-5 text-xs font-bold tracking-widest text-cyan-400">
                    IN DEVELOPMENT
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-white/10 py-6 text-center text-xs text-gray-500">
          © 2026 PojaX T-N. Connect the world. Empower expertise. Protect the future.
        </footer>

      </div>
    </main>
  );
}
