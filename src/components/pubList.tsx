import React from "react";
import PubEntry from "./pubEntry";
import { Publication, Person } from "@/data/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faP, fa1 } from "@fortawesome/free-solid-svg-icons";
import { Database } from "@/data/database";

export default async function PubList({
  pubs,
  highlightedPersonId,
  altStyle,
}: Readonly<{
  pubs: Publication[];
  highlightedPersonId?: string;
  altStyle?: boolean;
}>) {
  const db = await Database.get();
  const pubAndAuthors = await Promise.all(
    pubs.map(
      (p) =>
        new Promise<Readonly<{ pub: Publication; authors: Person[] }>>(
          async (resolve) => {
            const authors = await db.getManyPersons(p.authorIds);
            resolve({ pub: p, authors });
          },
        ),
    ),
  );
  return (
    <div className="flex flex-col gap-4 min-w-0 w-full">
      {pubAndAuthors.map(({ pub, authors }, idx) => {
        return (
          <>
            <dialog id="modal_pncel_members" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">
                  <FontAwesomeIcon
                    className="text-sm mx-1 rounded-md aspect-square p-1 bg-base-content text-base-100"
                    icon={faP}
                  />{" "}
                  PᴺCEL member
                </h3>
                <p className="py-4">Press ESC key or click outside to close</p>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button>close</button>
              </form>
            </dialog>
            <dialog id="modal_equal_contribution" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">
                  <FontAwesomeIcon
                    className="text-sm mx-1 rounded-md aspect-square p-1 bg-base-content text-base-100"
                    icon={fa1}
                  />{" "}
                  Equal contribution
                </h3>
                <p className="py-4">Press ESC key or click outside to close</p>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button>close</button>
              </form>
            </dialog>
            <PubEntry
              pub={pub}
              authors={authors}
              highlightedPersonId={highlightedPersonId}
              altStyle={(idx % 2 === 0) === (altStyle || false)}
              key={pub.id}
            ></PubEntry>
          </>
        );
      })}
    </div>
  );
}

export function PubListFootnote() {
  return (
    <>
      <p className="divider" />
      <div id="pub-footnote" className="text-sm text-base-content/60">
        <p>
          <FontAwesomeIcon
            className="text-xs mx-1 rounded-sm aspect-square p-px bg-base-content text-base-100"
            icon={faP}
          />
          PᴺCEL member
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
