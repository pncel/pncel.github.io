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
