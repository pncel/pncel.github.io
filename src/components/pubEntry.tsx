import React from "react";
import { PublicationExtended } from "@/data/prisma";
import { composeFullName } from "@/data/person";
import Link from "next/link";

export default function PubEntry({
  pub,
  altStyle,
}: Readonly<{
  pub: PublicationExtended;
  altStyle: boolean;
}>) {
  const tags = pub.tags.filter((tag) => tag.level && tag.level > 100);

  return (
    <div
      className={`bg-base-${altStyle ? "200" : "300"} flex flex-col items-start gap-2 px-2`}
    >
      <div>{pub.title}</div>
      {tags.length > 0 && (
        <div className="flex flex-row">
          {tags.map((tag, i) => (
            <div
              className="badge badge-secondary tooltip-bottom"
              data-tip={`${tag.type}:${tag.label}`}
              key={i}
            >
              {tag.label}
            </div>
          ))}
        </div>
      )}
      <p>
        {pub.authors.map((author, i) => {
          const fullName = composeFullName(author);
          return (
            <div key={i}>
              {i !== 0 ? <span>, </span> : <></>}
              {author.member ? (
                <Link
                  className="link link-hover text-primary font-bold"
                  href={`/team/${author.member.memberId}`}
                >
                  {fullName}
                </Link>
              ) : author.externalLink ? (
                <a
                  className="link link-hover"
                  target="_blank"
                  href={author.externalLink}
                >
                  {fullName}
                </a>
              ) : (
                <span className="text-neutral-content">{fullName}</span>
              )}
            </div>
          );
        })}
      </p>
    </div>
  );
}
