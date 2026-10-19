import FancySlogan from "@/app/fancyslogan";
import PageMain from "@/layouts/pageMain";
import NewsList from "@/components/newsList";
import { SectionHeading } from "@/components/prose";
import { Database } from "@/lib/database";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faLayerGroup,
  faMicrochip,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

// The short, public form of the research vision. The long argument lives on
// /research; these are written to stand alone until that page exists.
const pillars = [
  {
    icon: faRobot,
    title: "Ubiquitous intelligence needs a different computer.",
    body:
      "Edge, physical, and embodied AI mix AI with ordinary computation, serve " +
      "one request at a time instead of a full batch, and live inside a fixed " +
      "power and size budget. The answers that work for cloud serving do not " +
      "carry over.",
  },
  {
    icon: faLayerGroup,
    title: "Renegotiate the hardware–software contract.",
    body:
      "Transistor scaling has ended, so efficiency now has to come from moving " +
      "work up the stack. We make hardware simpler and cheaper, and ask " +
      "compilers, runtimes, and programmers to carry what they are already " +
      "better at.",
  },
  {
    icon: faMicrochip,
    title: "Build it, then measure it.",
    body:
      "We tape out chips and release open-source infrastructure, because a " +
      "claim about efficiency is only as good as the silicon behind it.",
  },
];

// Student chips and research chips are kept as separate numbers: they are
// different kinds of claim, and the 12 is also the evidence for the tape-out
// course series.
const stats = [
  {
    value: "12",
    title: "student chips taped out",
    desc: "through our tape-out course series",
  },
  {
    value: "3",
    title: "research chips co-led",
    desc: "CIFER, DECADES, SKY130 FPSoC",
  },
  {
    value: "2",
    title: "open-source frameworks",
    desc: "PRGA and DORA",
  },
  {
    value: "53",
    title: "students in the tape-out program",
    desc: "across 2025 and 2026",
  },
];

export default async function Home() {
  const db = await Database.get();
  const latestNews = await db.getManyNews(undefined, 10, true);

  return (
    <PageMain>
      <section className="py-8 flex flex-col items-center gap-6">
        <div
          className="bg-current w-72 sm:w-96 lg:w-[28rem] aspect-[390/130]"
          role="img"
          aria-label="PNCEL logo"
          style={{
            WebkitMaskImage: "url('/notext.svg')",
            maskImage: "url('/notext.svg')",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
        <FancySlogan />
      </section>

      <div className="divider"></div>

      {/* Vision. No heading of its own -- the positioning sentence is the
          heading. */}
      <section className="py-8">
        {/* The page's h1. Tailwind preflight strips heading styles, so these
            utilities render it exactly as the paragraph it replaces. */}
        <h1 className="mx-auto max-w-3xl text-center font-serif text-xl lg:text-2xl">
          We design computer architectures for ubiquitous intelligence &mdash;
          efficient, general-purpose, and proven in real silicon.
        </h1>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {pillars.map((p, i) => (
            // base-100 over the base-200 page, the same elevation the entry
            // lists use, so a pillar reads as content lifted off the page.
            <div
              className="flex flex-col gap-2 rounded-xl bg-base-100 p-5"
              key={i}
            >
              <FontAwesomeIcon
                className="text-2xl text-secondary"
                icon={p.icon}
              />
              <h3 className="text-lg font-bold">{p.title}</h3>
              <p className="text-base-content/80">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>

      {/* Named for what it will hold, not for what it holds today: project
          cards join this section later without a rename. */}
      <section className="py-8">
        <SectionHeading>What We&apos;ve Built</SectionHeading>
        <div className="stats stats-vertical sm:stats-horizontal mt-6 w-full bg-base-100">
          {stats.map((s, i) => (
            <div className="stat place-items-center text-center" key={i}>
              <div className="stat-value text-secondary">{s.value}</div>
              {/* daisyUI sets `white-space: nowrap` on these; these labels are
                  sentences, so let them wrap. */}
              <div className="stat-title whitespace-normal text-base-content">
                {s.title}
              </div>
              <div className="stat-desc whitespace-normal">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {latestNews.length > 0 && (
        <>
          <div className="divider"></div>
          <section className="py-8">
            <SectionHeading action={{ label: "All news", href: "/news" }}>
              Latest News
            </SectionHeading>
            <div className="mt-6">
              <NewsList news={latestNews} />
            </div>
          </section>
        </>
      )}
    </PageMain>
  );
}
