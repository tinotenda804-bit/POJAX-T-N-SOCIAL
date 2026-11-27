
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const navigation = [
  { icon: "✉", label: "Messages", path: "/connections", note: "Connections area" },
  { icon: "🎬", label: "Reels", path: "/reels" },
  { icon: "📰", label: "News", path: "", note: "Coming soon" },
  { icon: "👥", label: "Friends", path: "/connections" },
  { icon: "💰", label: "Market", path: "", note: "Coming soon" },
  { icon: "📚", label: "Academy", path: "", note: "Coming soon" },
  { icon: "💼", label: "Jobs", path: "", note: "Coming soon" },
  { icon: "⚽", label: "Games", path: "", note: "Coming soon" },
];

const extraFeatures = [
  { icon: "📡", title: "POJAX LIVE", description: "Watch and create live broadcasts.", status: "Coming soon" },
  { icon: "🏆", title: "POJAX REWARDS", description: "Recognition for valuable contributions.", status: "Coming soon" },
  { icon: "🔐", title: "POJAX VAULT", description: "A private space for your digital files.", status: "Coming soon" },
  { icon: "⭐", title: "POJAX PRO", description: "Discover professional services and expertise.", status: "Coming soon" },
];

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [displayName, setDisplayName] = useState("POJAX User");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      const user = data.user;
      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.display_name ||
        "POJAX User";

      setDisplayName(name);
      setEmail(user.email ?? "");
      setLoading(false);
    }

    loadUser();

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
        Loading POJAX...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07182d] text-white">
      <header className="sticky top-0 z-40 border-b border-cyan-900 bg-[#081b33]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:px-6">
          <Link href="/dashboard" className="shrink-0 text-xl font-black tracking-wide text-cyan-300 sm:text-2xl">
            POJAX <span className="text-white">T-N</span>
          </Link>

          <Link
            href="/search"
            aria-label="Search POJAX"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-cyan-800 text-xl hover:bg-cyan-950"
          >
            ⌕
          </Link>

          <button
            type="button"
            aria-label="Notifications"
            title="Notifications are coming soon"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-800 text-lg hover:bg-cyan-950"
            onClick={() => alert("POJAX Notifications are coming soon.")}
          >
            ♧
          </button>

          <details className="relative">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-cyan-800 text-xl hover:bg-cyan-950">
              ☰
            </summary>
            <div className="absolute right-0 mt-3 w-56 rounded-xl border border-cyan-800 bg-[#0b2340] p-2 shadow-xl">
              <Link className="block rounded-lg px-3 py-3 text-sm hover:bg-cyan-950" href="/profile">
                My Profile
              </Link>
              <Link className="block rounded-lg px-3 py-3 text-sm hover:bg-cyan-950" href="/security">
                Account Security
              </Link>
              <Link className="block rounded-lg px-3 py-3 text-sm hover:bg-cyan-950" href="/groups">
                My Groups
              </Link>
              <Link className="block rounded-lg px-3 py-3 text-sm hover:bg-cyan-950" href="/privacy">
                Privacy
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="mt-1 w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-300 hover:bg-red-950/40 disabled:opacity-50"
              >
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </details>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-7">
        <section className="overflow-hidden rounded-2xl border border-cyan-800 bg-gradient-to-br from-[#174b7c] via-[#17639b] to-[#287fbd] p-5 shadow-lg sm:p-7">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/70 bg-[#0b2b4c] text-4xl shadow-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-[0.2em] text-cyan-100">
                YOUR POJAX ACCOUNT
              </p>
              <h1 className="mt-1 break-words text-2xl font-black sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 break-all text-sm text-blue-100">{email}</p>
              <Link
                href="/profile"
                className="mt-3 inline-flex rounded-full border border-white/60 px-4 py-2 text-xs font-bold hover:bg-white/10"
              >
                VIEW PROFILE →
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-3">
            <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
              EXPLORE POJAX
            </p>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              Everything in one place
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8">
            {navigation.map((item) => (
              <div key={item.label}>
                {item.path ? (
                  <Link
                    href={item.path}
                    className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-cyan-900 bg-[#0c2340] p-2 text-center transition hover:border-cyan-400 hover:bg-[#103052]"
                  >
                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                    <span className="text-[10px] font-bold sm:text-xs">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    title={item.note}
                    onClick={() => alert(`${item.label} is coming soon.`)}
                    className="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#0a1c32] p-2 text-center opacity-70"
                  >
                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                    <span className="text-[10px] font-bold sm:text-xs">{item.label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
                YOUR WORLD
              </p>
              <h2 className="mt-1 text-xl font-black sm:text-2xl">
                POJAX SOCIAL
              </h2>
            </div>
            <Link href="/social" className="text-xs font-bold text-cyan-300 hover:text-white">
              OPEN SOCIAL →
            </Link>
          </div>

          <Link
            href="/social"
            className="block rounded-2xl border border-cyan-900 bg-[#0c2340] p-5 transition hover:border-cyan-500 sm:p-7"
          >
            <div className="text-3xl">🌐</div>
            <h3 className="mt-3 text-lg font-bold">Discover what's happening</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Explore posts, share your ideas and discover content from people across POJAX.
            </p>
            <span className="mt-4 inline-block text-sm font-bold text-cyan-300">
              EXPLORE THE FEED →
            </span>
          </Link>
        </section>

        <section className="mt-8">
          <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">
            MORE FROM POJAX
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {extraFeatures.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-cyan-950 bg-[#0c1f37] p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-cyan-300">{feature.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[10px] font-bold tracking-widest text-slate-500">
                  {feature.status.toUpperCase()}
                </p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-cyan-950 py-6 text-center text-xs text-slate-500">
          © 2026 POJAX T-N. Connect. Share. Create. Learn. Grow.
        </footer>
      </div>
    </main>
  );
}
