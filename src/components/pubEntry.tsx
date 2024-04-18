import React, { Dispatch, SetStateAction } from "react";
import { PublicationExtended } from "@/data/prisma";
import { composeFullName } from "@/data/person";
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
import CopyableCode from "./copyableCode";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
config.autoAddCss = false;

export default function PubEntry({
  pub,
  altStyle,
  highlightedPersonId,
  showBibtexByPubId,
  setShowBibtexByPubId,
}: Readonly<{
  pub: PublicationExtended;
  altStyle: boolean;
  highlightedPersonId: number | undefined;
  showBibtexByPubId: number | null;
  setShowBibtexByPubId: Dispatch<SetStateAction<number | null>>;
}>) {
  const tags = pub.tags.filter((tag) => tag.level && tag.level > 100);
  const bibtex = generateBibtexForPub(pub);

  return (
    <div
      className={`${altStyle || "bg-base-200"} text-base-content flex flex-col items-start gap-1 p-2 rounded-lg`}
    >
      <p className="font-semibold text-md lg:text-lg">{pub.title}</p>
      <div className="flex flex-row items-start gap-1 flex-wrap">
        <div
          className={`badge tooltip-top bg-base-content ${altStyle ? "text-base-200" : "text-base-300"}`}
          data-tip={`${pub.venue.type}:${pub.venue.abbr}`}
        >
          {pub.venue.abbr}
        </div>
        {tags.map((tag, i) => (
          <div
            className="badge badge-primary tooltip-top"
            data-tip={`${tag.type}:${tag.label}`}
            key={i}
          >
            {tag.label}
          </div>
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
                  className={`link link-hover ${author.id === highlightedPersonId ? "font-bold text-primary" : "font-semibold"}`}
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
        <div className={`flex flex-row items-start gap-2 flex-wrap`}>
          {bibtex && (
            <button
              className="flex-none btn btn-xs lg:btn-sm btn-accent"
              onClick={() => {
                if (showBibtexByPubId === pub.id) {
                  setShowBibtexByPubId(null);
                } else {
                  setShowBibtexByPubId(pub.id);
                }
              }}
            >
              <FontAwesomeIcon icon={faPaperclip} />
              Bibtex
            </button>
          )}
          {pub.doi && (
            <a
              className="flex-none btn btn-xs lg:btn-sm btn-accent"
              href={`https://doi.org/${pub.doi}`}
              target="_blank"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              DOI
            </a>
          )}
          {pub.authorsCopy && (
            <a
              className="flex-none btn btn-xs lg:btn-sm btn-accent"
              href={pub.authorsCopy}
              target="_blank"
            >
              <FontAwesomeIcon icon={faFilePdf} />
              Author&apos;s Copy
            </a>
          )}
          {pub.resources.map((res) => (
            <a
              className="flex-none btn btn-xs lg:btn-sm btn-accent"
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
        </div>
      )}
      <div
        className={`transition-all duration-200 ease-out w-full ${showBibtexByPubId === pub.id ? "opacity-100 h-fit" : "opacity-0 h-0"}`}
      >
        <CopyableCode className="bg-neutral my-2 p-2 rounded-lg text-xs lg:text-sm h-full">
          <code>{bibtex}</code>
        </CopyableCode>
      </div>
    </div>
  );
}
