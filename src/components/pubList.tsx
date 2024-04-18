"use client";
import React, { useState } from "react";
import PubEntry from "./pubEntry";
import { PublicationExtended } from "@/data/prisma";

export default function PubList({
  pubs,
  highlightedPersonId,
}: Readonly<{
  pubs: PublicationExtended[];
  highlightedPersonId: number | undefined;
}>) {
  const [showBibtexByPubId, setShowBibtexByPubId] = useState<number | null>(
    null
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        {pubs.map((pub, idx) => (
          <PubEntry
            pub={pub}
            highlightedPersonId={highlightedPersonId}
            altStyle={idx % 2 === 1}
            key={pub.id}
            showBibtexByPubId={showBibtexByPubId}
            setShowBibtexByPubId={setShowBibtexByPubId}
          ></PubEntry>
        ))}
      </div>
      <p className="divider" />
      <div id="footnote" className="text-sm text-base-content/50">
        <p>* Equal contribution</p>
      </div>
    </>
  );
}
