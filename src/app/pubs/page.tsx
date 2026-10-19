import PubList, { PubListFootnote } from "@/components/pubList";
import { metadataTmpl, groupByYear } from "@/lib/utils";
import { PageTitle } from "@/components/prose";
import PageMain from "@/layouts/pageMain";
import { Database } from "@/lib/database";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Publications",
};

export default async function Pubs() {
  const db = await Database.get();
  const pubs = await db.getManyPublications();
  const byYear = groupByYear(
    pubs.filter((pub) => !pub.notPncel),
    (p) => p.time,
  );

  return (
    <PageMain>
      <PageTitle className="lg:pb-4">Publications</PageTitle>
      {byYear.map(({ year, items, startIndex }) => (
        <div key={year} className="lg:flex lg:flex-row lg:p-2 lg:gap-4">
          <h2 className="divider lg:divider-horizontal lg:divider-start text-2xl">{`${year}`}</h2>
          <PubList pubs={items} startIndex={startIndex} />
        </div>
      ))}
      <PubListFootnote />
    </PageMain>
  );
}
