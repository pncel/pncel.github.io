import React from "react";
import PubEntry from "./pubEntry";
import pubs from "@/data/pubs";

export default function PubList() {
  return (
    <div className="flex flex-col">
      {pubs.map((pub, idx) => (
        <PubEntry pub={pub} evenLine={idx % 2 === 1} key={pub.id}></PubEntry>
      ))}
    </div>
  );
}

/*
<div>
  {pubs
    .filter(
      (pub) =>
        pub.authors.filter((author) => author.person === "angliz").length > 0
    )
    .map((pub) => (
      <PubEntry pub={pub} />
    ))}
</div>
*/
