"use client";
import React, { useRef, useState, useEffect } from "react";
import { composeFullName, formatMonthYear, pubAnchorId } from "@/lib/utils";
import { getIcon } from "@/lib/icon-registry";
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
  faP,
  fa1,
} from "@fortawesome/free-solid-svg-icons";
import sanitizeHtml from "sanitize-html";
import { Publication, Person, TagType } from "@/lib/types";
config.autoAddCss = false;

export default function PubEntry({
  pub,
  authors,
  lifted,
  highlightedPersonId,
}: Readonly<{
  pub: Publication;
  authors: Person[];
  /** Zebra stripe: true renders on the raised base-100 surface. */
  lifted: boolean;
  highlightedPersonId?: string;
}>) {
  // regular bibtex
  const [showBibtex, setShowBibtex] = useState(false);
  const bibtexRef = useRef<HTMLDivElement>(null);

  // arxiv bibtex
  const [showArxivBibtex, setShowArxivBibtex] = useState(false);
  const arxivBibtexRef = useRef<HTMLDivElement>(null);

  // "To appear" status. Computed in the browser so it reflects the visitor's
  // current time while the page stays statically generated. `now` starts null
  // so the build-time HTML and the first client render agree (no hydration
  // mismatch), then resolves after mount.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const toAppear = now !== null && pub.time.getTime() > now.getTime();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const anchor = pubAnchorId(pub.id);

  useEffect(() => {
    const selectIfMatch = () => {
      if (window.location.hash === `#${anchor}`) {
        wrapperRef.current?.focus({ preventScroll: false });
      }
    };
    selectIfMatch();
    window.addEventListener("hashchange", selectIfMatch);
    return () => window.removeEventListener("hashchange", selectIfMatch);
  }, [anchor]);

  return (
    <div
      id={anchor}
      ref={wrapperRef}
      tabIndex={0}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (
          !target.closest(
            'button, a, input, textarea, [contenteditable="true"]',
          )
        ) {
          wrapperRef.current?.focus();
        }
      }}
      onFocus={() => {
        if (window.location.hash !== `#${anchor}`) {
          history.replaceState(null, "", `#${anchor}`);
        }
      }}
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node | null)) {
          history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
        }
      }}
      className={
        // Zebra: lifted rows sit on base-100, the rest let the base-200 page
        // show through. Both themes ramp base-100 -> base-300 light -> dark, so
        // the lifted row is brighter than the page either way.
        `${lifted ? "bg-base-100" : "bg-transparent"} text-base-content ` +
        "flex flex-col items-start p-4 rounded-xl gap-2 " +
        "scroll-mt-4 outline-none cursor-pointer " +
        // A ring rather than a border, so hover composes over either stripe
        // without reserving layout space or fighting the zebra.
        "transition-shadow duration-200 hover:ring-1 hover:ring-base-content/15 " +
        "focus-within:ring-2 focus-within:ring-secondary focus-within:cursor-auto"
      }
    >
      <p
        className="font-semibold text-lg 2xl:text-xl"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.title) }}
      />
      {(toAppear || (pub.tags && pub.tags.length > 0)) && (
        <div className="flex flex-row items-start gap-1 flex-wrap">
          {toAppear && (
            <TagBadge tag={{ label: "To appear", type: TagType.other }} />
          )}
          {pub.tags?.map((tag, i) => <TagBadge tag={tag} key={i} />)}
        </div>
      )}
      <p className="text-sm 2xl:text-base">
        {authors.map((author, i) => {
          const fullName = composeFullName(author);
          const equalContrib =
            pub.equalContrib && i < pub.equalContrib ? (
              <sup
                className="tooltip tooltip-secondary"
                data-tip="Equal contribution"
              >
                <button
                  tabIndex={-1}
                  onClick={() => {
                    const modal = document.getElementById(
                      "modal_equal_contribution",
                    ) as HTMLDialogElement;
                    modal.showModal();
                  }}
                >
                  <FontAwesomeIcon
                    className={
                      `text-[0.5rem] ml-0.5 rounded-sm aspect-square p-px ` +
                      `${author.id === highlightedPersonId ? "bg-secondary text-secondary-content" : "bg-base-content text-base-100"}`
                    }
                    icon={fa1}
                  />
                </button>
              </sup>
            ) : (
              ""
            );

          return (
            <span className="pr-0.5" key={i}>
              {author.memberInfo ? (
                <span>
                  <Link
                    className={`link link-hover ${author.id === highlightedPersonId ? "font-bold text-secondary" : "font-bold"}`}
                    href={`/team/${author.id}`}
                  >
                    {fullName}
                  </Link>
                  <sup
                    className="tooltip tooltip-secondary"
                    data-tip="PᴺCEL member"
                  >
                    <button
                      tabIndex={-1}
                      onClick={() => {
                        const modal = document.getElementById(
                          "modal_pncel_members",
                        ) as HTMLDialogElement;
                        modal.showModal();
                      }}
                    >
                      <FontAwesomeIcon
                        className={
                          `text-[0.5rem] ml-0.5 rounded-sm aspect-square p-px ` +
                          `${author.id === highlightedPersonId ? "bg-secondary text-secondary-content" : "bg-base-content text-base-100"}`
                        }
                        icon={faP}
                      />
                    </button>
                  </sup>
                </span>
              ) : author.externalLink ? (
                <a
                  className="link link-hover align-baseline whitespace-nowrap"
                  target="_blank"
                  href={author.externalLink}
                >
                  {fullName}
                  <FontAwesomeIcon
                    className="text-xs ml-0.5"
                    icon={faUpRightFromSquare}
                  />
                </a>
              ) : (
                <span className=" font-light">{fullName}</span>
              )}
              {equalContrib}
              {i < authors.length - 1 && <span>, </span>}
            </span>
          );
        })}
      </p>
      {pub.booktitle && (
        <p className="text-sm 2xl:text-base font-light text-base-content/60">
          {pub.booktitle}
          {pub.time && `, ${formatMonthYear(pub.time)}`}
          {/* pub.location && `, ${pub.location}` */}
        </p>
      )}
      {(pub.doi ||
        pub.bibtex ||
        pub.arxivDoi ||
        pub.arxivBibtex ||
        pub.authorsCopy ||
        (pub.attachments && pub.attachments.length > 0)) && (
        <div className={`flex flex-row items-start gap-2 flex-wrap pt-1`}>
          {pub.doi && (
            <a
              className="flex-none btn btn-xs btn-secondary px-2 py-1"
              href={
                pub.doi.startsWith("https://")
                  ? pub.doi
                  : `https://doi.org/${pub.doi}`
              }
              target="_blank"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              DOI
            </a>
          )}
          {pub.bibtex && (
            <button
              tabIndex={0}
              className="flex-none btn btn-xs btn-secondary px-2 py-1"
              onClick={() => {
                setShowBibtex(true);
                bibtexRef.current?.focus();
              }}
            >
              <FontAwesomeIcon icon={faPaperclip} />
              bibtex
            </button>
          )}
          {pub.authorsCopy && (
            <a
              className="flex-none btn btn-xs btn-secondary px-2 py-1"
              href={pub.authorsCopy}
              target="_blank"
            >
              <FontAwesomeIcon icon={faFilePdf} />
              Authors&apos; Copy
            </a>
          )}
          {pub.arxivDoi && (
            <a
              className="flex-none btn btn-xs btn-secondary px-2 py-1"
              href={`https://doi.org/${pub.arxivDoi}`}
              target="_blank"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              arXiv
            </a>
          )}
          {pub.arxivBibtex && (
            <button
              tabIndex={0}
              className="flex-none btn btn-xs btn-secondary px-2 py-1"
              onClick={() => {
                setShowArxivBibtex(true);
                arxivBibtexRef.current?.focus();
              }}
            >
              <FontAwesomeIcon icon={faPaperclip} />
              bibtex (arXiv)
            </button>
          )}
          {pub.attachments?.map((attachment, i) => (
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
      <div
        className={`transition-all duration-200 ease-in-out w-full h-fit overflow-y-clip ${showBibtex ? "max-h-screen" : "max-h-0"}`}
      >
        <CopyableCode
          className="bg-neutral mt-1 p-2 rounded-sm text-xs 2xl:text-sm h-full"
          forwardRef={bibtexRef}
          addlOnBlur={() => setShowBibtex(false)}
        >
          <code className="text-neutral-content">{pub.bibtex}</code>
        </CopyableCode>
      </div>
      <div
        className={`transition-all duration-200 ease-in-out w-full h-fit overflow-y-clip ${showArxivBibtex ? "max-h-screen" : "max-h-0"}`}
      >
        <CopyableCode
          className="bg-neutral mt-1 p-2 rounded-sm text-xs 2xl:text-sm h-full"
          forwardRef={arxivBibtexRef}
          addlOnBlur={() => setShowArxivBibtex(false)}
        >
          <code className="text-neutral-content">{pub.arxivBibtex}</code>
        </CopyableCode>
      </div>
    </div>
  );
}
