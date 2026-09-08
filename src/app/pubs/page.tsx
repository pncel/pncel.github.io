import PubList, { PubListFootnote } from "@/components/pubList";
import { metadataTmpl } from "@/lib/utils";
import DefaultMDX from "@/layouts/defaultMdx";
import DefaultMain from "@/layouts/defaultMain";
import { Publication } from "@/lib/types";
import { Database } from "@/lib/database";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Publications",
};

export default async function Pubs() {
  const db = await Database.get();
  const pubs = await db.getManyPublications();
  const mByYear = pubs
    .filter((pub) => !pub.notPncel)
    .reduce((g, pub) => {
      const year = pub.time.getUTCFullYear();
      const pubs = g.get(year) || [];
      pubs.push(pub);
      g.set(year, pubs);
      return g;
    }, new Map<number, Publication[]>());
  const sortedByYear = Array.from(mByYear.entries())
    .toSorted(([year1], [year2]) => year2 - year1)
    .reduce((a, [year, pubs]) => {
      if (a.length === 0) {
        a.push({ year, pubs, idx: 0 });
      } else {
        const lastEntry = a[a.length - 1];
        if (lastEntry) {
          a.push({
            year,
            pubs,
            idx: lastEntry.idx + lastEntry.pubs.length,
          });
        }
      }
      return a;
    }, new Array<{ year: number; pubs: Publication[]; idx: number }>());

  return (
    <DefaultMain>
      <DefaultMDX>
        <h1 className="lg:pb-4">Publications</h1>
      </DefaultMDX>
      {sortedByYear.map(({ year, pubs, idx }) => (
        <div key={year} className="lg:flex lg:flex-row lg:p-2 lg:gap-4">
          <h2 className="divider lg:divider-horizontal lg:divider-start text-2xl">{`${year}`}</h2>
          <PubList pubs={pubs} altStyle={idx % 2 !== 0} />
        </div>
      ))}
      <PubListFootnote />
    </DefaultMain>
  );
}
