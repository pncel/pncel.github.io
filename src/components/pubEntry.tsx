"use client";
import React, { useRef, useState, useContext } from "react";
import { composeFullName } from "@/data/utils";
import SelectedFontAwesomeIcon from "./icon";
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
import { Publication, Person } from "@/data/types";
import DataContext from "@/app/context";
config.autoAddCss = false;

export default function PubEntry({
  pub,
  authors,
  altStyle,
  highlightedPersonId,
}: Readonly<{
  pub: Publication;
  authors: Person[];
  altStyle: boolean;
  highlightedPersonId?: string;
}>) {
  // regular bibtex
  const [showBibtex, setShowBibtex] = useState(false);
  const bibtexRef = useRef<HTMLDivElement>(null);

  // arxiv bibtex
  const [showArxivBibtex, setShowArxivBibtex] = useState(false);
  const arxivBibtexRef = useRef<HTMLDivElement>(null);

  const context = useContext(DataContext);
  if (!context) {
    throw new Error(
      "Source code error: PubEntry must be used inside ContextProvider",
    );
  }

  const { useDarkTheme } = context;

  return (
    <div
      className={
        `${altStyle || (useDarkTheme ? "bg-base-300" : "bg-base-200")} text-base-content ` +
        "flex flex-col items-start px-2 pt-1 pb-2 rounded-lg gap-1 max-w-5xl"
      }
    >
      <p
        className="font-semibold text-lg 2xl:text-xl"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.title) }}
      />
      {pub.tags && pub.tags.length > 0 && (
        <div className="flex flex-row items-start gap-1 flex-wrap">
          {pub.tags.map((tag, i) => (
            <TagBadge tag={tag} key={i} />
          ))}
        </div>
      )}
      <p className="text-sm 2xl:text-md">
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
        <p className="text-sm 2xl:text-md font-light text-base-content/60">
          {pub.booktitle}
          {pub.time &&
            `, ${pub.time.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })}`}
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
              href={`https://doi.org/${pub.doi}`}
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
                <SelectedFontAwesomeIcon icon={attachment.icon} />
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
