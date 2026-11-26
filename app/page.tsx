
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[#050914] px-6 text-white">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/15 blur-[110px]" />

      {/* Brand at the top */}
      <header className="relative z-10 w-full max-w-md pt-8">
        <Link href="/" className="inline-flex items-center">
          <Logo size={38} />
        </Link>
      </header>

      {/* Welcome content */}
      <section className="relative z-10 flex w-full flex-1 flex-col items-center justify-center py-12 text-center">

        {/* Official logo */}
        <div className="mb-7">
          <Logo size={125} showText={false} />
        </div>

        {/* Platform name */}
        <h1 className="text-3xl font-black tracking-wide sm:text-4xl">
          POJAX T-N
          <span className="mt-2 block text-cyan-400">
            SOCIAL
          </span>
        </h1>

        {/* Tagline */}
        <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
          Connect. Share. Create. Learn. Grow.
        </p>

        {/* Welcome buttons */}
        <div className="mt-12 flex w-full max-w-xs flex-col items-center gap-5">

          <Link
            href="/signup"
            className="w-full rounded-full bg-cyan-400 px-6 py-4 text-center font-bold text-[#050914] shadow-lg shadow-cyan-400/10 transition hover:bg-cyan-300 active:scale-95"
          >
            Create Account
          </Link>

          <Link
            href="/login"
            className="w-full rounded-full border border-cyan-400/60 bg-white/5 px-6 py-4 text-center font-bold text-white transition hover:border-cyan-300 hover:bg-white/10 active:scale-95"
          >
            Log In
          </Link>

          <Link
            href="/about"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-6 py-4 text-center font-semibold text-cyan-300 transition hover:border-cyan-400 hover:bg-white/10 active:scale-95"
          >
            About
          </Link>

        </div>

      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-md pb-7 text-center">
        <p className="text-xs tracking-wide text-slate-500">
          A NEW WORLD OF DIGITAL CONNECTIONS
        </p>

        <p className="mt-4 text-xs text-slate-600">
          © 2026 POJAX T-N. All rights reserved.
        </p>
      </footer>

    </main>
  );
}
