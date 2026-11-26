import Link from "next/link";
import Logo from "@/components/Logo";

const features = [
  {
    number: "01",
    title: "POJAX CONNECT",
    subtitle: "Build meaningful connections",
    description:
      "Discover people, connect with communities and build relationships with members from different countries and backgrounds.",
    icon: "🌍",
  },
  {
    number: "02",
    title: "POJAX SOCIAL",
    subtitle: "Share your world",
    description:
      "Create posts, share photos and videos, publish stories, react to content, comment, follow creators and participate in groups.",
    icon: "👥",
  },
  {
    number: "03",
    title: "POJAX REELS",
    subtitle: "Discover videos and creativity",
    description:
      "Explore short videos, discover new creators, share your creativity and enjoy content from communities around the world.",
    icon: "▶️",
  },
  {
    number: "04",
    title: "POJAX MESSAGING",
    subtitle: "Communicate with people",
    description:
      "Connect through private conversations and share messages with other members. Messaging is intended to be free.",
    icon: "💬",
  },
  {
    number: "05",
    title: "POJAX ACADEMY",
    subtitle: "Learn and develop your skills",
    description:
      "Discover educational content, exchange knowledge, develop digital skills and explore opportunities to improve your learning.",
    icon: "🎓",
  },
  {
    number: "06",
    title: "POJAX MARKET",
    subtitle: "Discover products and opportunities",
    description:
      "Explore a marketplace concept designed to help members discover products, services and opportunities.",
    icon: "🛍️",
  },
  {
    number: "07",
    title: "POJAX VAULT",
    subtitle: "Your personal digital space",
    description:
      "A private storage service planned for personal photos, videos, documents, notes and other important information, with access controls.",
    icon: "🔐",
  },
  {
    number: "08",
    title: "POJAX JOBS",
    subtitle: "Explore opportunities worldwide",
    description:
      "Discover job opportunities in your own country and internationally. Job information should include useful details such as responsibilities, qualifications, skills, experience, location, employment type and application requirements. Members should be able to explore opportunities beyond their national borders.",
    icon: "💼",
  },
  {
    number: "09",
    title: "POJAX SPORTS",
    subtitle: "Follow the world of sports",
    description:
      "Stay informed about football and other popular sports. The planned service will bring together results, fixtures, scores, competitions and sports updates from around the world.",
    icon: "⚽",
  },
  {
    number: "10",
    title: "POJAX WORLD NEWS",
    subtitle: "Stay informed about the world",
    description:
      "Discover international news and important developments. BBC World News is an intended news source. Where available, news will be attributed and linked to its original publisher. POJAX SOCIAL is not claiming an official BBC partnership.",
    icon: "📰",
  },
  {
    number: "11",
    title: "POJAX REWARDS",
    subtitle: "Recognise creativity and contribution",
    description:
      "A planned recognition system for eligible creators and valuable community contributions. Rewards will follow published eligibility rules, review processes and available funding. Rewards are not guaranteed income.",
    icon: "🏆",
  },
  {
    number: "12",
    title: "BILL ME POINTS",
    subtitle: "Recognise meaningful participation",
    description:
      "An internal points system intended to recognise eligible contributions and genuine engagement. Points are not communication credits or guaranteed cash.",
    icon: "⭐",
  },
];

const values = [
  {
    title: "Privacy",
    description:
      "Members should have meaningful control over their information, profile visibility and privacy settings.",
    icon: "🔒",
  },
  {
    title: "Account Security",
    description:
      "We aim to protect member accounts through secure authentication, responsible data handling and appropriate safeguards.",
    icon: "🛡️",
  },
  {
    title: "Respect and Inclusion",
    description:
      "We want a welcoming community where people from different countries, cultures and backgrounds can participate respectfully.",
    icon: "🤝",
  },
  {
    title: "Creativity and Learning",
    description:
      "We want to encourage original ideas, creative expression, education and the sharing of useful knowledge.",
    icon: "💡",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050914] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-5 py-5 md:px-12">
        <Link href="/" className="inline-flex items-center">
          <Logo size={42} />
        </Link>
      </header>

      {/* Introduction */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[110px]" />

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-8 flex justify-center">
            <Logo size={115} showText={false} />
          </div>

          <p className="text-sm font-bold tracking-[0.3em] text-cyan-400">
            GET TO KNOW US
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            WELCOME TO
            <span className="block text-cyan-400">
              POJAX SOCIAL
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
            More than a place to connect. A growing digital world designed
            to bring people together, encourage creativity, support education,
            discover opportunities and share experiences across borders.
          </p>

          <p className="mt-8 text-lg font-bold text-cyan-300">
            CONNECT. SHARE. CREATE. LEARN. GROW.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-[#091225] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold tracking-[0.3em] text-cyan-400">
            WHO WE ARE
          </p>

          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            Our Story
          </h2>

          <p className="mt-6 max-w-4xl leading-8 text-slate-300">
            POJAX SOCIAL is a digital platform being developed under the
            POJAX T-N brand. Our ambition is to create a place where people
            can connect, express themselves, exchange knowledge, discover
            opportunities and participate in a global community.
          </p>

          <p className="mt-5 max-w-4xl leading-8 text-slate-300">
            We are starting with an African perspective while building
            towards a platform that can welcome people from different
            countries around the world. We believe that technology can
            help people communicate, learn, create and discover new
            possibilities.
          </p>
        </div>
      </section>

      {/* Vision and Mission */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-cyan-400/20 bg-[#091225] p-7">
            <div className="text-3xl">🌍</div>
            <h2 className="mt-5 text-2xl font-black text-cyan-400">
              Our Vision
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              To build a connected digital world where people can discover
              opportunities, share knowledge, express creativity and
              participate in communities without unnecessary borders.
            </p>
          </article>

          <article className="rounded-2xl border border-cyan-400/20 bg-[#091225] p-7">
            <div className="text-3xl">🚀</div>
            <h2 className="mt-5 text-2xl font-black text-cyan-400">
              Our Mission
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              To develop useful digital services that bring social
              connection, communication, education, entertainment,
              opportunities and creativity together in one platform.
            </p>
          </article>
        </div>
      </section>

      {/* Platform Features */}
      <section className="bg-[#091225] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.3em] text-cyan-400">
              EXPLORE OUR SERVICES
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              One Platform. Many Possibilities.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl leading-8 text-slate-400">
              POJAX SOCIAL aims to bring together different digital
              experiences so members can connect, learn, discover and
              create in one place.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="rounded-2xl border border-white/10 bg-[#0b1529] p-6 transition hover:-translate-y-1 hover:border-cyan-400/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{feature.icon}</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-black text-cyan-300">
                  {feature.title}
                </h3>

                <h4 className="mt-2 font-semibold text-white">
                  {feature.subtitle}
                </h4>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#102344] to-[#091225] p-8 md:p-12">
          <div className="text-4xl">💼</div>

          <h2 className="mt-5 text-3xl font-black md:text-4xl">
            Opportunities Should Reach Beyond Borders.
          </h2>

          <p className="mt-6 leading-8 text-slate-300">
            POJAX JOBS is intended to help people discover employment
            opportunities locally and internationally. Our goal is to
            make job information easier to understand so applicants can
            prepare for opportunities that match their skills and
            qualifications.
          </p>

          <p className="mt-4 leading-8 text-slate-300">
            Listings should provide clear requirements, job descriptions,
            locations, application instructions and relevant eligibility
            information. International listings should also explain
            important conditions such as work authorisation, visa
            requirements and relocation where applicable.
          </p>

          <p className="mt-4 text-sm leading-7 text-slate-400">
            Job information will need appropriate verification and
            safeguards against fraudulent listings. POJAX SOCIAL will
            not guarantee employment or visa approval.
          </p>
        </div>
      </section>

      {/* Sports and News */}
      <section className="bg-[#091225] px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-[#0b1529] p-7">
            <div className="text-4xl">⚽</div>
            <h2 className="mt-5 text-2xl font-black text-cyan-400">
              Sports Around the World
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              From football to basketball, tennis and other popular
              sports, POJAX SPORTS aims to help members follow fixtures,
              results, scores, competitions and important sporting
              developments.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0b1529] p-7">
            <div className="text-4xl">📰</div>
            <h2 className="mt-5 text-2xl font-black text-cyan-400">
              World News
            </h2>
            <p className="mt-4 leading-8 text-slate-300">
              POJAX WORLD NEWS aims to help members stay informed about
              international events and developments. BBC World News is
              an intended source. Articles and reports will be attributed
              to their publishers and linked where possible.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              POJAX SOCIAL is an independent platform and does not claim
              to be owned by, sponsored by or officially partnered with
              the BBC.
            </p>
          </article>
        </div>
      </section>

      {/* Community Values */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.3em] text-cyan-400">
              WHAT MATTERS TO US
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              A Community Built on Trust
            </h2>

            <p className="mx-auto mt-6 max-w-3xl leading-8 text-slate-400">
              A valuable digital community needs more than features.
              It needs responsibility, respect and trust.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <article
                key={value.title}
                className="rounded-2xl border border-white/10 bg-[#091225] p-6"
              >
                <div className="text-3xl">{value.icon}</div>

                <h3 className="mt-5 font-bold text-cyan-300">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Our Future */}
      <section className="bg-[#091225] px-6 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold tracking-[0.3em] text-cyan-400">
            THE JOURNEY AHEAD
          </p>

          <h2 className="mt-5 text-3xl font-black md:text-5xl">
            From Africa to the World.
          </h2>

          <p className="mx-auto mt-7 max-w-3xl leading-8 text-slate-300">
            Our ambition is to grow POJAX SOCIAL into a platform that
            welcomes people across countries and cultures. We want to
            create a digital environment where social connection,
            creativity, education, sports, news and opportunities can
            come together.
          </p>

          <p className="mt-7 text-xl font-bold text-cyan-300">
            Your world. Your possibilities.
          </p>
        </div>
      </section>

      {/* Development Notice */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
          <h2 className="font-bold text-amber-300">
            An Important Note
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            POJAX SOCIAL is under development. Some services described
            on this page are planned features and may not yet be
            available. Their availability will depend on development,
            testing, safety requirements and the countries served.
            Feature descriptions are not promises of guaranteed jobs,
            income, rewards or other outcomes.
          </p>
        </div>
      </section>

      {/* Bottom Back Button */}
      <footer className="border-t border-white/10 px-6 py-12 text-center">
        <p className="text-sm text-slate-400">
          Thank you for taking the time to discover POJAX SOCIAL.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-3 rounded-xl border border-cyan-400 px-8 py-4 font-bold text-cyan-300 transition hover:bg-cyan-400 hover:text-[#050914]"
        >
          <span aria-hidden="true">←</span>
          Back to Welcome Page
        </Link>

        <p className="mt-10 text-sm text-slate-500">
          © 2026 POJAX T-N. All rights reserved.
        </p>

        <p className="mt-2 text-xs text-slate-600">
          Connect. Share. Create. Learn. Grow.
        </p>
      </footer>
    </main>
  );
}