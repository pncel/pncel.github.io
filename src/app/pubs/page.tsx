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
  const byyear = pubs.reduce((g, pub) => {
    const pubs = g.get(pub.time.getFullYear()) || [];
    pubs.push(pub);
    g.set(pub.time.getFullYear(), pubs);
    return g;
  }, new Map<Number, Publication[]>());

  return (
    <div>
      <DefaultMDX>
        <h1>Publications</h1>
      </DefaultMDX>
      <DefaultMain>
        {Array.from(byyear.entries()).map(([year, pubs]) => (
          <>
            <h2 className="divider text-2xl">{`${year}`}</h2>
            <PubList pubs={pubs} />
          </>
        ))}
        <PubListFootnote />
      </DefaultMain>
    </div>
  );
}
