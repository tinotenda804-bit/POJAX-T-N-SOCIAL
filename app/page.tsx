import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050914] text-white">
      {/* Navigation */}
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-5 md:px-12">
        <Link href="/" className="flex items-center">
          <Logo size={42} />
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/about"
            className="rounded-lg border border-cyan-400/40 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
          >
            About
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-[#050914] transition hover:bg-cyan-300"
          >
            Create Account
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-400"
          >
            Log In
          </Link>
        </div>
      </nav>

      {/* Welcome Section */}
      <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div className="absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[110px]" />

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-8 flex justify-center">
            <Logo size={110} showText={false} />
          </div>

          <p className="mb-6 text-sm font-semibold tracking-[0.3em] text-cyan-400">
            CONNECT • SHARE • CREATE • LEARN • GROW
          </p>

          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            YOUR WORLD.
            <span className="block text-cyan-400">
              YOUR POSSIBILITIES.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
            Welcome to POJAX SOCIAL, a growing digital platform designed
            to bring people together, encourage creativity, support learning,
            discover opportunities and create a connected world.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-cyan-400 px-8 py-4 font-bold text-[#050914] transition hover:bg-cyan-300 sm:w-auto"
            >
              Create Account
            </Link>

            <Link
              href="/login"
              className="w-full rounded-xl border border-white/20 px-8 py-4 font-semibold transition hover:border-cyan-400 sm:w-auto"
            >
              Log In
            </Link>
          </div>

          <Link
            href="/about"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            Discover POJAX SOCIAL
            <span aria-hidden="true">→</span>
          </Link>

          <p className="mt-14 text-sm font-semibold tracking-widest text-slate-500">
            A NEW WORLD OF DIGITAL CONNECTIONS
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        <p>© 2026 POJAX T-N. All rights reserved.</p>
        <p className="mt-2">
          Connect. Share. Create. Learn. Grow.
        </p>
        <Link
          href="/about"
          className="mt-4 inline-block text-cyan-400 hover:text-cyan-300"
        >
          About POJAX SOCIAL
        </Link>
      </footer>
    </main>
  );
}