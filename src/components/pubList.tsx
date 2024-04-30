import React from "react";
import PubEntry from "./pubEntry";
import type { Publication } from "@/data/types";

export default function PubList({
  pubs,
  highlightedPersonId,
}: Readonly<{
  pubs: Publication[];
  highlightedPersonId?: number;
}>) {
  return (
    <>
      <div className="flex flex-col gap-2">
        {pubs.map((pub, idx) => (
          <PubEntry
            pub={pub}
            highlightedPersonId={highlightedPersonId}
            altStyle={idx % 2 === 0}
            key={pub.id}
          ></PubEntry>
        ))}
      </div>
    </>
  );
}

export function PubListFootnote() {
  return (
    <>
      <p className="divider" />
      <div id="footnote" className="text-sm text-base-content/60">
        <p>* Equal contribution</p>
      </div>
    </>
  );
}
