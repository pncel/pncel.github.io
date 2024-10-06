import React from "react";
import PubEntry from "./pubEntry";
import type { Publication } from "@/data/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faP, fa1 } from "@fortawesome/free-solid-svg-icons";

export default function PubList({
  pubs,
  highlightedPersonId,
  altStyle
}: Readonly<{
  pubs: Publication[];
  highlightedPersonId?: number;
  altStyle?: boolean;
}>) {
  return (
    <div className="flex flex-col gap-4">
      {pubs.map((pub, idx) => {
        return (
          <PubEntry
            pub={pub}
            highlightedPersonId={highlightedPersonId}
            altStyle={(idx % 2 === 0) === (altStyle || false)}
            key={pub.id}
          ></PubEntry>
        );
      })}
    </div>
  );
}

export function PubListFootnote() {
  return (
    <>
      <p className="divider" />
      <div id="footnote" className="text-sm text-base-content/60">
        <p>
          <FontAwesomeIcon
            className="text-xs mx-1 rounded-sm aspect-square p-px bg-base-content text-base-100"
            icon={faP}
          />
          PᴺCEL Member
        </p>
        <p>
          <FontAwesomeIcon
            className="text-xs mx-1 rounded-sm aspect-square p-px bg-base-content text-base-100"
            icon={fa1}
          />
          Equal contribution
        </p>
      </div>
    </>
  );
}
