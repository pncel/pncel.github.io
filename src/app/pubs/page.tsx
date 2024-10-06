import PubList, { PubListFootnote } from "@/components/pubList";
import { metadataTmpl } from "@/data/metadata";
import { getAllPubs } from "@/data/pub";
import { Publication } from "@/data/types";
import DefaultMain from "@/layouts/defaultMain";
import DefaultMDX from "@/layouts/defaultMdx";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Publications",
};

export default async function Pubs() {
  const pubs = await getAllPubs();
  const mByYear = pubs.reduce((g, pub) => {
    const pubs = g.get(pub.time.getFullYear()) || [];
    pubs.push(pub);
    g.set(pub.time.getFullYear(), pubs);
    return g;
  }, new Map<number, Publication[]>());
  const sortedByYear = Array.from(mByYear.entries())
    .toSorted(([year1], [year2]) => year2 - year1)
    .reduce((a, [year, pubs]) => {
      if (a.length === 0) {
        a.push({ year, pubs, idx: 0 });
      } else {
        a.push({
          year,
          pubs,
          idx: a[a.length - 1].idx + a[a.length - 1].pubs.length,
        });
      }
      return a;
    }, new Array<{ year: number; pubs: Publication[]; idx: number }>());

  return (
    <div>
      <DefaultMDX>
        <h1>Publications</h1>
      </DefaultMDX>
      <DefaultMain>
        {sortedByYear.map(({ year, pubs, idx }) => (
          <div key={year}>
            <h2 className="divider text-2xl">{`${year}`}</h2>
            <PubList pubs={pubs} altStyle={idx % 2 !== 0} />
          </div>
        ))}
        <PubListFootnote />
      </DefaultMain>
    </div>
  );
}
