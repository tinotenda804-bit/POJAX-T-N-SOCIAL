
import Logo from "@/components/Logo";

const services = [
  {
    number: "01",
    title: "POJAX CONNECT",
    description:
      "Connect with people around the world, discover opportunities and build meaningful relationships.",
    icon: "◈",
  },
  {
    number: "02",
    title: "POJAX SOCIAL",
    description:
      "Share ideas, publish content, upload videos and participate in communities and discussions.",
    icon: "◎",
  },
  {
    number: "03",
    title: "POJAX ACADEMY",
    description:
      "Learn new skills, explore technology, develop your talents and share your knowledge.",
    icon: "⌬",
  },
  {
    number: "04",
    title: "POJAX MARKET",
    description:
      "Discover hardware, digital products and useful services from trusted providers.",
    icon: "▣",
  },
  {
    number: "05",
    title: "POJAX PRO",
    description:
      "Discover professional services, including cybersecurity, programming and digital expertise.",
    icon: "⌘",
  },
  {
    number: "06",
    title: "POJAX VAULT",
    description:
      "A private space for members to organize and store their personal digital files.",
    icon: "▤",
  },
  {
    number: "07",
    title: "POJAX REWARDS",
    description:
      "Earn recognition and eligible rewards by making valuable contributions to the platform.",
    icon: "✧",
  },
  {
    number: "08",
    title: "POJAX BILL ME POINTS",
    description:
      "Explore our member rewards points and eligible communication benefits.",
    icon: "◉",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050914] text-white">
      {/* Navigation */}
      <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-12">
        <a href="/" className="flex items-center">
          <Logo size={42} />
        </a>

        <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#about" className="hover:text-cyan-400">
            About
          </a>
          <a href="#services" className="hover:text-cyan-400">
            Explore
          </a>
          <a href="#contact" className="hover:text-cyan-400">
            Contact
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:border-cyan-400"
          >
            Login
          </a>

          <a
            href="/signup"
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-[#050914] hover:bg-cyan-300"
          >
            Join Us
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-28 text-center md:py-40">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[110px]" />

        <div className="relative mx-auto max-w-4xl">
          <p className="mb-6 text-sm font-semibold tracking-[0.35em] text-cyan-400">
            CONNECTION • KNOWLEDGE • OPPORTUNITY
          </p>

          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            YOUR WORLD.
            <span className="block text-cyan-400">
              YOUR POSSIBILITIES.
            </span>
            ONE PLATFORM.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
            Connect with people, share ideas, learn new skills, discover
            opportunities, access services and grow together with a global
            community.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/signup"
              className="rounded-lg bg-cyan-400 px-8 py-4 font-bold text-[#050914] transition hover:bg-cyan-300"
            >
              Join PojaX T-N
            </a>

            <a
              href="#about"
              className="rounded-lg border border-white/20 px-8 py-4 font-bold hover:border-cyan-400"
            >
              Discover Our Vision
            </a>
          </div>

          <div className="mt-20 flex flex-wrap justify-center gap-4 text-xs tracking-widest text-slate-500">
            <span className="rounded-full border border-white/10 px-5 py-3">
              GLOBAL CONNECTION
            </span>
            <span className="rounded-full border border-white/10 px-5 py-3">
              LEARNING & CREATIVITY
            </span>
            <span className="rounded-full border border-white/10 px-5 py-3">
              OPPORTUNITY & GROWTH
            </span>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-y border-white/10 bg-[#091225] px-6 py-20 text-center"
      >
        <p className="text-sm font-bold tracking-[0.3em] text-cyan-400">
          OUR VISION
        </p>

        <h2 className="mt-5 text-3xl font-bold md:text-4xl">
          A world of connections and possibilities.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-400">
          PojaX T-N is being built as a global platform for everyone.
          A place where individuals, creators, students, professionals
          and businesses can connect, share, learn, discover opportunities
          and contribute to a growing digital world.
        </p>
      </section>

      {/* Services */}
      <section id="services" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold tracking-[0.3em] text-cyan-400">
            EXPLORE THE PLATFORM
          </p>

          <h2 className="mt-4 text-3xl font-black md:text-5xl">
            ONE PLATFORM. MANY POSSIBILITIES.
          </h2>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.number}
                className="rounded-2xl border border-white/10 bg-[#0b1529] p-8 transition hover:-translate-y-1 hover:border-cyan-400/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl text-cyan-400">
                    {service.icon}
                  </span>
                  <span className="text-sm text-slate-600">
                    {service.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-bold tracking-wider">
                  {service.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {service.description}
                </p>

                <p className="mt-6 text-xs font-bold tracking-widest text-cyan-400">
                  IN DEVELOPMENT
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="bg-[#091225] px-6 py-20 text-center"
      >
        <h2 className="text-3xl font-black">
          BE PART OF WHAT COMES NEXT.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Connect the world. Empower expertise. Protect the future.
          Together, we can build something meaningful.
        </p>

        <a
          href="/signup"
          className="mt-8 inline-block rounded-lg bg-cyan-400 px-8 py-4 font-bold text-[#050914]"
        >
          Become a Member
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        © 2026 PojaX T-N. All rights reserved.

        <p className="mt-2">
          Connect the world. Empower expertise. Protect the future.
        </p>
      </footer>
    </main>
  );
}
