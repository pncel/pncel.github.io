"use client";
import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TagBadge from "./tagBadge";
import { processContent } from "@/lib/processContent";
import { config } from "@fortawesome/fontawesome-svg-core";
import { News, Person, TagType, NewsType, type IconName } from "@/lib/types";
import { getIcon } from "@/lib/icon-registry";
import DataContext from "@/app/context";
config.autoAddCss = false;

export default function NewsEntry({
  news,
  allMembers,
  altStyle,
}: Readonly<{
  news: News;
  allMembers: Person[];
  altStyle: boolean;
}>) {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error(
      "Source code error: NewsEntry must be used inside ContextProvider",
    );
  }

  const { useDarkTheme } = context;

  // Format date as MM/DD/YYYY with zero-padding
  // Use UTC methods to avoid timezone offset issues
  const formatDate = (date: Date): string => {
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
  };

  // Get icon for news type
  const getNewsTypeIcon = (type?: NewsType): IconName | undefined => {
    switch (type) {
      case NewsType.grant:
        return "award";
      case NewsType.award:
        return "medal";
      case NewsType.publication:
        return "file-lines";
      case NewsType.tapeout:
        return "microchip";
      case NewsType.newmember:
        return "user-plus";
      case NewsType.graduation:
        return "graduation-cap";
      case NewsType.internship:
        return "user-tie";
      default:
        return undefined;
    }
  };

  return (
    <div
      className={
        `${altStyle || (useDarkTheme ? "bg-base-300" : "bg-base-200")} text-base-content ` +
        "flex flex-row items-start p-2 rounded-lg gap-3"
      }
    >
      {/* Left column: Date badge */}
      <div className="flex-none">
        <TagBadge
          tag={{
            label: formatDate(news.time),
            type: TagType.venue, // reuse venue tag's styling
            icon: "calendar",
          }}
        />
      </div>

      {/* Right column: Everything else */}
      <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
        <p className="text-lg 2xl:text-xl">
          {getNewsTypeIcon(news.type) !== undefined && (
            <span className="mr-2">
              <FontAwesomeIcon icon={getIcon(getNewsTypeIcon(news.type)!)} />
            </span>
          )}
          <span
            dangerouslySetInnerHTML={{
              __html: processContent(news.news, allMembers),
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
            className="text-sm 2xl:text-md"
            dangerouslySetInnerHTML={{
              __html: processContent(news.details, allMembers),
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
