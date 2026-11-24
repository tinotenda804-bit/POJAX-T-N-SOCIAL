
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050914] text-white">
      {/* Navigation */}
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-5 md:px-12">
        <a href="/" className="flex items-center">
          <Logo size={42} />
        </a>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <a
            href="/signup"
            className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-bold text-[#050914] transition hover:bg-cyan-300"
          >
            Create Account
          </a>

          <a
            href="/login"
            className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-400"
          >
            Log In
          </a>

          <a
            href="#about"
            className="rounded-lg border border-cyan-400/50 px-4 py-2.5 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400 hover:text-[#050914]"
          >
            About This Platform
          </a>
        </div>
      </nav>

      {/* Welcome Section */}
      <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div className="absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[110px]" />

        <div className="relative mx-auto max-w-4xl">
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
            to bring people together, encourage creativity, support learning
            and create opportunities for a connected world.
          </p>

          <p className="mt-10 text-sm font-semibold tracking-widest text-slate-500">
            A NEW WORLD OF DIGITAL CONNECTIONS
          </p>
        </div>
      </section>

      {/* About This Platform */}
      <section
        id="about"
        className="border-y border-white/10 bg-[#091225] px-6 py-20"
      >
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <Logo size={100} showText={false} />
          </div>

          <p className="text-sm font-bold tracking-[0.3em] text-cyan-400">
            ABOUT THIS PLATFORM
          </p>

          <h2 className="mt-5 text-3xl font-black md:text-5xl">
            Welcome to POJAX SOCIAL.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl leading-8 text-slate-400">
            POJAX SOCIAL is a platform being developed to connect people
            across Africa and the world. It aims to provide a place where
            members can create profiles, share ideas, publish content,
            communicate, learn, discover opportunities and build communities.
          </p>

          <div className="mt-12 grid gap-5 text-left sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#0b1529] p-6">
              <h3 className="text-lg font-bold text-cyan-400">
                Privacy
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Members should have meaningful control over their profile
                visibility and available privacy settings. Private information
                should not be displayed publicly without authorization.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#0b1529] p-6">
              <h3 className="text-lg font-bold text-cyan-400">
                Account Security
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                The platform is being developed with account protection
                in mind, including secure authentication and safeguards
                for members' information.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#0b1529] p-6">
              <h3 className="text-lg font-bold text-cyan-400">
                Respect and Safety
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Members are expected to respect others, protect their
                accounts and follow the platform's community rules.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#0b1529] p-6">
              <h3 className="text-lg font-bold text-cyan-400">
                Our Vision
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                To create a digital environment where people can connect,
                share knowledge, express creativity and discover opportunities.
              </p>
            </article>
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-xs leading-6 text-slate-500">
            POJAX SOCIAL is still under development. These descriptions
            express our intended privacy and security principles and do not
            replace the platform's published Privacy Policy or Terms of Service.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        <p>© 2026 POJAX T-N. All rights reserved.</p>

        <p className="mt-2">
          Connect. Share. Create. Learn. Grow.
        </p>
      </footer>
    </main>
  );
}
