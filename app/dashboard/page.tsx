
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
      <main className="flex min-h-screen items-center justify-center bg-[#050b18] text-sm text-white">
        Loading your dashboard...
      </main>
    );
  }

  const quickLinks = [
    {
      title: "POJAX PROFILE",
      description: "Manage your member information.",
      action: "Open Profile",
      path: "/profile",
    },
    {
      title: "POJAX SECURITY",
      description: "Manage your account security.",
      action: "Open Security",
      path: "/security",
    },
    {
      title: "POJAX GROUPS",
      description: "Explore and manage your groups.",
      action: "Open Groups",
      path: "/groups",
    },
    {
      title: "POJAX SEARCH",
      description: "Find people and platform content.",
      action: "Search Now",
      path: "/search",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050b18] px-3 py-4 text-white sm:px-5 sm:py-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/30 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-wide text-cyan-400 sm:text-3xl">
              POJAX T-N
            </h1>
            <p className="mt-1 text-xs text-gray-400 sm:text-sm">
              Your world of connections and opportunities.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-md bg-cyan-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-cyan-400 sm:px-4"
          >
            Sign Out
          </button>
        </header>

        <section className="mt-5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-[#0b1b35] to-[#0b1628] p-4 sm:mt-7 sm:p-6">
          <p className="text-xs font-semibold tracking-widest text-cyan-400">
            MEMBER DASHBOARD
          </p>

          <h2 className="mt-3 text-2xl font-black sm:text-3xl md:text-4xl">
            Welcome to PojaX T-N.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
            Connect with people, share ideas, learn, discover opportunities
            and contribute to a growing global platform.
          </p>

          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="text-xs text-gray-400">Your signed-in email</p>
            <p className="mt-1 break-all text-sm font-semibold text-cyan-300">
              {email}
            </p>
          </div>
        </section>

        <section className="mt-7">
          <p className="text-xs font-bold tracking-widest text-cyan-400">
            MEMBER QUICK ACCESS
          </p>

          <h2 className="mt-1 text-xl font-black sm:text-2xl">
            Your account and community
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <button
                key={link.title}
                onClick={() => router.push(link.path)}
                className="min-w-0 rounded-lg border border-cyan-800 bg-[#0b1628] p-3 text-left transition hover:border-cyan-400 hover:bg-[#10213a] sm:p-4"
              >
                <h3 className="text-xs font-bold text-cyan-400 sm:text-sm">
                  {link.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-400">
                  {link.description}
                </p>

                <span className="mt-3 inline-block text-xs font-semibold text-cyan-300">
                  {link.action} →
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-9">
          <div>
            <p className="text-xs font-bold tracking-widest text-cyan-400">
              YOUR PLATFORM
            </p>

            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              Explore PojaX T-N
            </h2>

            <p className="mt-1 text-xs text-gray-400 sm:text-sm">
              Different opportunities. One connected platform.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <article
                key={section.number}
                className="min-w-0 rounded-lg border border-gray-700 bg-[#0b1628] p-4 transition hover:border-cyan-400/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl text-cyan-400">
                    {section.icon}
                  </span>

                  <span className="text-xs text-gray-600">
                    {section.number}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-cyan-400">
                  {section.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  {section.description}
                </p>

                {section.title === "POJAX SOCIAL" ? (
                  <button
                    onClick={() => router.push("/social")}
                    className="mt-4 rounded-md bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
                  >
                    OPEN SOCIAL →
                  </button>
                ) : (
                  <p className="mt-4 text-xs font-bold tracking-widest text-cyan-400">
                    IN DEVELOPMENT
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-9 border-t border-white/10 py-5 text-center text-xs text-gray-500">
          © 2026 PojaX T-N. Connect the world. Empower expertise. Protect the future.
        </footer>

      </div>
    </main>
  );
}
