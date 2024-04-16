import React from "react";
import PubEntry from "./pubEntry";
import { PublicationExtended } from "@/data/prisma";

export default function PubList({
  pubs,
  highlightedPersonId,
}: Readonly<{
  pubs: PublicationExtended[];
  highlightedPersonId: number | undefined;
}>) {
  return (
    <div className="flex flex-col">
      {pubs.map((pub, idx) => (
        <PubEntry
          pub={pub}
          highlightedPersonId={highlightedPersonId}
          altStyle={idx % 2 === 1}
          key={pub.id}
        ></PubEntry>
      ))}
    </div>
  );
}
