"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TagBadge from "./tagBadge";
import { processContent } from "@/lib/processContent";
import { config } from "@fortawesome/fontawesome-svg-core";
import {
  News,
  Person,
  Publication,
  NewsType,
  type IconName,
} from "@/lib/types";
import { getIcon } from "@/lib/icon-registry";
config.autoAddCss = false;

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

// UTC throughout, so an entry does not slide into the neighbouring month for
// readers west of Greenwich.
const formatMonthYear = (date: Date): string =>
  `${MONTHS[date.getUTCMonth()] ?? ""} ${date.getUTCFullYear()}`;

/**
 * What the icon column shows. The label is the tooltip: an icon on its own
 * says nothing until you have learnt the set.
 */
const NEWS_TYPE_META: Partial<
  Record<NewsType, { icon: IconName; label: string }>
> = {
  [NewsType.grant]: { icon: "award", label: "Grant" },
  [NewsType.award]: { icon: "medal", label: "Award" },
  [NewsType.publication]: { icon: "file-lines", label: "Publication" },
  [NewsType.presentation]: {
    icon: "person-chalkboard",
    label: "Presentation",
  },
  [NewsType.tapeout]: { icon: "microchip", label: "Tape-out" },
  [NewsType.newmember]: { icon: "user-plus", label: "New member" },
  [NewsType.graduation]: { icon: "graduation-cap", label: "Graduation" },
  [NewsType.internship]: { icon: "user-tie", label: "Internship" },
  [NewsType.sponsorship]: { icon: "handshake", label: "Sponsorship" },
};

export default function NewsEntry({
  news,
  allMembers,
  allPublications,
  lifted,
}: Readonly<{
  news: News;
  allMembers: Person[];
  allPublications: Publication[];
  /** Zebra stripe: true renders on the raised base-100 surface. */
  lifted: boolean;
}>) {
  const typeMeta =
    news.type === undefined ? undefined : NEWS_TYPE_META[news.type];

  return (
    <div
      className={
        // See pubEntry.tsx for the zebra/ring rationale. Every row declares the
        // same explicit track sizes, which is what makes the three columns line
        // up down the list -- no subgrid needed, and no dependence on content.
        `${lifted ? "bg-base-100" : "bg-transparent"} text-base-content ` +
        "grid grid-cols-[4.5rem_1.25rem_minmax(0,1fr)] " +
        "2xl:grid-cols-[5.5rem_1.5rem_minmax(0,1fr)] " +
        "items-center gap-x-3 2xl:gap-x-4 px-4 py-2 rounded-xl " +
        "transition-shadow duration-200 hover:ring-1 hover:ring-base-content/15"
      }
    >
      {/* 1. When */}
      <time
        className="text-sm 2xl:text-base text-base-content/70 whitespace-nowrap"
        dateTime={news.time.toISOString().slice(0, 7)}
      >
        {formatMonthYear(news.time)}
      </time>

      {/* 2. What kind */}
      <div className="text-center text-base-content/70">
        {typeMeta && (
          <span className="tooltip tooltip-secondary" data-tip={typeMeta.label}>
            <FontAwesomeIcon icon={getIcon(typeMeta.icon)} />
          </span>
        )}
      </div>

      {/* 3. The news itself */}
      <div className="flex flex-col items-start gap-0.5 min-w-0">
        <p className="text-base 2xl:text-lg">
          <span
            dangerouslySetInnerHTML={{
              __html: processContent(news.news, allMembers, allPublications),
            }}
          />
        </p>
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-row items-start gap-1 flex-wrap">
            {news.tags.map((tag, i) => (
              <TagBadge tag={tag} key={i} />
            ))}
          </div>
        )}
        {news.details && (
          <div
            className="text-sm 2xl:text-base"
            dangerouslySetInnerHTML={{
              __html: processContent(news.details, allMembers, allPublications),
            }}
          />
        )}
        {news.attachments && news.attachments.length > 0 && (
          <div className="flex flex-row items-start gap-2 flex-wrap pt-1">
            {news.attachments.map((attachment, i) => (
              <a
                className="flex-none btn btn-xs btn-secondary px-2 py-1"
                href={attachment.link}
                target="_blank"
                key={i}
              >
                {attachment.icon === undefined ? undefined : (
                  <FontAwesomeIcon icon={getIcon(attachment.icon)} />
                )}
                {attachment.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
