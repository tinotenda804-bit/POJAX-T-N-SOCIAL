"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase";

type DashboardUser = {
  id: string;
  email: string;
  displayName: string;
};

const navigation = [
  { icon: "✉️", label: "Messages", path: "/connections" },
  { icon: "🎬", label: "Reels", path: "/reels" },
  { icon: "📰", label: "News", path: "" },
  { icon: "👥", label: "Friends", path: "/connections" },
  { icon: "🛍️", label: "Market", path: "" },
  { icon: "📚", label: "Academy", path: "" },
  { icon: "💼", label: "Jobs", path: "" },
  { icon: "⚽", label: "Games", path: "" },
];

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [headerVisible, setHeaderVisible] = useState(true);

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

      const authUser = data.user;
      const metadataName =
        authUser.user_metadata?.display_name ||
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name;

      const emailName = authUser.email?.split("@")[0] || "POJAX account";

      setUser({
        id: authUser.id,
        email: authUser.email ?? "",
        displayName:
          typeof metadataName === "string" && metadataName.trim()
            ? metadataName.trim()
            : emailName,
      });

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

  useEffect(() => {
    let previousY = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;
      const difference = currentY - previousY;

      if (currentY < 40) {
        setHeaderVisible(true);
      } else if (difference > 5) {
        setHeaderVisible(false);
      } else if (difference < -5) {
        setHeaderVisible(true);
      }

      previousY = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-900 border-t-cyan-300" />
          <p className="mt-4 text-sm">Preparing your dashboard...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#07182d] pb-20 text-white">
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b border-cyan-900/70 bg-[#07182d]/95 backdrop-blur-xl transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-6">
          <Link href="/dashboard" aria-label="POJAX SOCIAL dashboard">
            <Logo size={32} showText={false} />
          </Link>

          <span className="hidden text-xs font-black tracking-[0.18em] text-cyan-300 sm:inline">
            POJAX SOCIAL
          </span>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/search"
              aria-label="Search POJAX"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-900 text-xl hover:bg-cyan-950"
            >
              ⌕
            </Link>

            <Link
              href="/settings"
              aria-label="Settings"
              title="Settings"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-900 text-xl hover:bg-cyan-950"
            >
              ☰
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 pt-20 sm:px-6">
        <section className="mb-5 flex items-center gap-3 rounded-2xl border border-cyan-900/70 bg-[#0b2340] p-4 sm:p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-400/60 bg-[#12395c] text-lg font-black text-cyan-200">
            {user.displayName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-black sm:text-xl">
              {user.displayName}
            </h1>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
            <Link
              href="/profile"
              className="mt-1 inline-block text-xs font-bold text-cyan-300 hover:text-white"
            >
              View profile
            </Link>
          </div>

          <Link
            href="/settings"
            className="rounded-full border border-cyan-800 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-950"
          >
            Settings
          </Link>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">SEE MI</h2>
              <p className="text-xs text-slate-400">
                Status updates from people on POJAX
              </p>
            </div>
            <span className="rounded-full border border-cyan-900 px-3 py-1 text-[10px] font-bold tracking-wider text-cyan-300">
              SEE MI
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto rounded-2xl border border-cyan-900/70 bg-[#0a203a] p-4">
            <div className="flex min-w-24 flex-col items-center gap-2">
              <Link
                href="/social"
                aria-label="Open SEE MI"
                className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-[3px] border-cyan-400 bg-[#102f4d] text-2xl shadow-[0_0_14px_rgba(34,211,238,0.18)]"
              >
                +
              </Link>
              <span className="text-center text-[11px] font-semibold text-slate-300">
                Your update
              </span>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-center rounded-xl border border-dashed border-cyan-900/80 px-4 py-3 text-center">
              <p className="text-xs leading-5 text-slate-500">
                SEE MI updates will appear here when the status feature is
                connected.
              </p>
            </div>
          </div>

          <p className="mt-2 text-[10px] text-slate-500">
            Blue ring: unseen updates. Cream-white ring: updates you have
            viewed.
          </p>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">Explore POJAX</h2>
            <span className="text-[10px] font-bold tracking-widest text-cyan-500">
              YOUR PLATFORM
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8">
            {navigation.map((item) => (
              <div key={item.label}>
                {item.path ? (
                  <Link
                    href={item.path}
                    className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-cyan-900/80 bg-[#0c2340] p-2 text-center transition hover:border-cyan-400 hover:bg-[#103052]"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[10px] font-bold sm:text-xs">
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert(`${item.label} is planned but not available yet.`)}
                    className="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#0a1c32] p-2 text-center opacity-60"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[10px] font-bold sm:text-xs">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-slate-500">Planned</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">Your feed</h2>
              <p className="text-xs text-slate-400">
                Posts, photos and videos from POJAX
              </p>
            </div>

            <Link
              href="/social"
              className="rounded-full border border-cyan-500/70 px-3 py-2 text-xs font-black text-cyan-300 hover:bg-cyan-950"
            >
              FEEDS
            </Link>
          </div>

          <div className="rounded-2xl border border-cyan-900/70 bg-[#0b2340] p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#12395c] text-lg font-bold text-cyan-200">
                {user.displayName.charAt(0).toUpperCase()}
              </div>

              <Link
                href="/social"
                className="flex-1 rounded-full border border-cyan-900 bg-[#07182d] px-4 py-3 text-sm text-slate-400 hover:border-cyan-500"
              >
                Share something...
              </Link>

              <Link
                href="/social"
                aria-label="Create a post"
                title="Create a post"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xl font-black text-[#041426] hover:bg-cyan-300"
              >
                +
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-cyan-950 pt-3">
              <Link
                href="/social"
                className="rounded-lg py-2 text-center text-xs font-bold text-slate-300 hover:bg-cyan-950"
              >
                📷 Photo
              </Link>
              <Link
                href="/social"
                className="rounded-lg py-2 text-center text-xs font-bold text-slate-300 hover:bg-cyan-950"
              >
                🎥 Video
              </Link>
              <Link
                href="/reels"
                className="rounded-lg py-2 text-center text-xs font-bold text-slate-300 hover:bg-cyan-950"
              >
                ▶ Reels
              </Link>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-dashed border-cyan-900/80 p-5 text-center">
            <p className="text-sm font-semibold text-slate-300">
              Your POJAX feed
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Open FEEDS to view and interact with posts. The next integration
              step will bring the existing feed directly into this dashboard.
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-3 sm:grid-cols-2">
          {[
            ["📡", "POJAX LIVE", "Planned feature"],
            ["🏆", "Bill Me Points", "Activity and eligibility programme"],
            ["🔐", "POJAX VAULT", "Planned private storage"],
            ["⭐", "POJAX PRO", "Professional services"],
          ].map(([icon, title, description]) => (
            <article
              key={title}
              className="rounded-xl border border-cyan-950 bg-[#0a1e36] p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-cyan-300">{title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <footer className="border-t border-cyan-950 py-6 text-center text-xs text-slate-500">
          © 2026 POJAX SOCIAL. Connect. Share. Create. Learn. Grow.
        </footer>
      </div>

      <Link
        href="/social"
        aria-label="Create a post"
        className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 text-2xl font-black text-[#041426] shadow-lg shadow-cyan-950/50 hover:bg-cyan-300"
      >
        +
      </Link>
    </main>
  );
}