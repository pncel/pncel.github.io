"use client";
import React, { useRef, useState } from "react";
import { PublicationExtended } from "@/data/prisma";
import { composeFullName } from "@/data/person";
import CopyableCode from "./copyableCode";
import TagBadge from "./tagBadge";
import Link from "next/link";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpRightFromSquare,
  faPaperclip,
  faPaperPlane,
  faFilePdf,
  faVideo,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { generateBibtexForPub } from "@/data/pub";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
config.autoAddCss = false;

export default function PubEntry({
  pub,
  altStyle,
  highlightedPersonId,
}: Readonly<{
  pub: PublicationExtended;
  altStyle: boolean;
  highlightedPersonId: number | undefined;
}>) {
  const [showBibtex, setShowBibtex] = useState(false);
  const tags = pub.tags.filter((tag) => tag.level && tag.level >= 100);
  const bibtex = generateBibtexForPub(pub);
  const bibtexRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`${altStyle || "bg-base-200"} text-base-content flex flex-col items-start gap-1 p-2 rounded-lg`}
    >
      <p className="font-semibold text-md lg:text-lg">{pub.title}</p>
      <div className="flex flex-row items-start gap-1 flex-wrap">
        <TagBadge
          tag={{ id: -1, type: "Venue", label: pub.venue.abbr, level: null }}
        />
        {tags.map((tag, i) => (
          <TagBadge tag={tag} key={i} />
        ))}
      </div>
      <p className="text-sm lg:text-md">
        {pub.authors.map((author, i) => {
          const fullName =
            composeFullName(author) +
            (pub.equalContrib !== null && i < pub.equalContrib ? "*" : "");

          return (
            <span className="pr-1.5" key={i}>
              {author.member ? (
                <Link
                  className={`link link-hover ${author.id === highlightedPersonId ? "font-bold text-secondary" : "font-semibold"}`}
                  href={`/team/${author.member.memberId}`}
                >
                  {fullName}
                </Link>
              ) : author.externalLink ? (
                <a
                  className="link link-hover font-semibold align-baseline whitespace-nowrap"
                  target="_blank"
                  href={author.externalLink}
                >
                  {fullName}
                  <FontAwesomeIcon
                    className="text-xs mx-1"
                    icon={faUpRightFromSquare}
                  />
                </a>
              ) : (
                <span>{fullName}</span>
              )}
              {i < pub.authors.length - 1 && <span>, </span>}
            </span>
          );
        })}
      </p>
      <p className="text-xs lg:text-sm text-base-content/60">
        {pub.booktitle} (
        {pub.venueLink ? (
          <a
            href={pub.venueLink}
            className="link link-hover whitespace-nowrap"
            target="_blank"
          >
            {pub.venue.abbr}
            <FontAwesomeIcon
              className="text-xs mx-1"
              icon={faUpRightFromSquare}
            />
          </a>
        ) : (
          pub.venue.abbr
        )}
        )
        {pub.time &&
          `, ${pub.time.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          })}`}
        {pub.location && `, ${pub.location}`}
      </p>
      {(bibtex || pub.doi || pub.authorsCopy || pub.resources.length > 0) && (
        <div className={`flex flex-row items-start gap-2 flex-wrap pt-1`}>
          {pub.doi && (
            <a
              className="flex-none btn btn-sm btn-secondary"
              href={`https://doi.org/${pub.doi}`}
              target="_blank"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              DOI
            </a>
          )}
          {pub.authorsCopy && (
            <a
              className="flex-none btn btn-sm btn-secondary"
              href={pub.authorsCopy}
              target="_blank"
            >
              <FontAwesomeIcon icon={faFilePdf} />
              Author&apos;s Copy
            </a>
          )}
          {pub.resources.map((res) => (
            <a
              className="flex-none btn btn-sm btn-secondary"
              href={res.link}
              target="_blank"
              key={res.id}
            >
              {res.label === "Poster" || res.label === "Slides" ? (
                <FontAwesomeIcon icon={faFilePdf} />
              ) : res.label === "Recorded Talk" ? (
                <FontAwesomeIcon icon={faVideo} />
              ) : res.label === "GitHub" ? (
                <FontAwesomeIcon icon={faGithub} />
              ) : res.label === "arXiv" ? (
                <FontAwesomeIcon icon={faPaperPlane} />
              ) : (
                <FontAwesomeIcon icon={faGlobe} />
              )}
              {res.label}
            </a>
          ))}
          {bibtex && (
            <div
              tabIndex={0}
              className="flex-none btn btn-sm btn-secondary"
              onFocus={() => {
                setShowBibtex(true);
                bibtexRef.current?.focus();
              }}
            >
              <FontAwesomeIcon icon={faPaperclip} />
              Bibtex
            </div>
          )}
        </div>
      )}
      <div
        className={`transition-all duration-200 ease-out w-full ${showBibtex ? "opacity-100 h-fit" : "opacity-0 h-0"}`}
      >
        <CopyableCode
          className="bg-neutral my-2 p-2 rounded-lg text-xs lg:text-sm h-full"
          forwardRef={bibtexRef}
          addlOnBlur={() => setShowBibtex(false)}
        >
          <code className="text-neutral-content">{bibtex}</code>
        </CopyableCode>
      </div>
    </div>
  );
}
