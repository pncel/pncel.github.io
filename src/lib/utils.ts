import { Person } from "./types";
import type { Metadata } from "next";

export function composeFullName(person: Person) {
  const { firstname, goby, middlename, lastname } = person;
  const name = middlename ? `${firstname} ${middlename}` : firstname;
  if (goby) {
    return `${name} "${goby}" ${lastname}`;
  } else {
    return `${name} ${lastname}`;
  }
}

/**
 * Buckets dated items by year, newest year first, carrying a running
 * `startIndex` so a list rendered one bucket at a time can keep its zebra
 * stripes alternating across the year boundaries.
 *
 * Order within a year is left as given -- `PubList` and `NewsList` both sort
 * their own contents.
 */
export function groupByYear<T>(
  items: T[],
  getTime: (item: T) => Date,
): { year: number; items: T[]; startIndex: number }[] {
  const byYear = new Map<number, T[]>();
  for (const item of items) {
    const year = getTime(item).getUTCFullYear();
    const bucket = byYear.get(year);
    if (bucket) {
      bucket.push(item);
    } else {
      byYear.set(year, [item]);
    }
  }

  let startIndex = 0;
  return Array.from(byYear.entries())
    .toSorted(([a], [b]) => b - a)
    .map(([year, yearItems]) => {
      const group = { year, items: yearItems, startIndex };
      startIndex += yearItems.length;
      return group;
    });
}

// Spelled out rather than taken from Intl, so the string is identical in the
// build and in the browser and cannot drift with the platform's ICU data.
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * "Sep 2025" -- the one date format the entry lists use, shared so a news row
 * and a publication row can never print the same month differently.
 *
 * UTC throughout, so an item does not slide into the neighbouring month for
 * readers west of Greenwich.
 */
export function formatMonthYear(date: Date): string {
  return `${MONTHS[date.getUTCMonth()] ?? ""} ${date.getUTCFullYear()}`;
}

export function pubAnchorId(id: string): string {
  const stripped = id.replace(/^\+/, "");
  const safe = stripped.replace(/[^A-Za-z0-9._-]/g, "-");
  return `pub-${safe}`;
}

export function composeAvatarPlaceholder(person: Person) {
  const { firstname, goby, lastname } = person;
  const placeholder = [goby || firstname, lastname]
    .filter((s) => s !== undefined)
    .filter((s) => s) // make sure it's not an empty string
    .map((s) => s[0])
    .join("")
    .toUpperCase();
  return placeholder;
}

// Site configuration for SEO and metadata
export const siteConfig = {
  name: "PᴺCEL",
  title: "PᴺCEL Research Group",
  description:
    "PNCEL: {Programmable, Parallel, high-Performance, Power-efficient, ...} Computer Engineering Lab at University of Washington (UW)",
  url: "https://pncel.github.io",
  ogImage: "/og-image.png",
  keywords: [
    "PNCEL",
    "University of Washington",
    "UW",
    "UW ECE",
    "Ang Li",
    "PRGA",
    "Princeton Reconfigurable Gate Array",
    "DORA",
    "Domain-Optimized Reconfigurable Array",
    "DICE",
    "Dataflow Intelligence Computing Engine",
    "research lab",
    "computer engineering",
    "computer architecture",
    "reconfigurable computing",
    "high-performance computing",
    "parallel computing",
    "power-efficient computing",
  ],
};

export const metadataTmpl: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "PᴺCEL Research Group" }],
  creator: "PᴺCEL Research Group",
  publisher: "University of Washington",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 300,
        height: 68,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
