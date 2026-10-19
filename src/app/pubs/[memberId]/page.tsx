import Link from "next/link";
import PubList, { PubListFootnote } from "@/components/pubList";
import { metadataTmpl } from "@/lib/utils";
import { Publication } from "@/lib/types";
import { PageTitle } from "@/components/prose";
import PageMain from "@/layouts/pageMain";
import { composeFullName } from "@/lib/utils";
import { Database } from "@/lib/database";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

interface Params {
  params: Promise<{
    memberId: string;
  }>;
}

export async function generateStaticParams() {
  const db = await Database.get();
  const memberIds = (await db.getManyMembers()).map((m) => ({
    memberId: m.id,
  }));
  return memberIds;
}

export async function generateMetadata({ params }: Params) {
  const { memberId } = await params;
  const db = await Database.get();
  const member = await db.getMember(memberId);
  const fullname = composeFullName(member);
  return {
    ...metadataTmpl,
    title: metadataTmpl.title + " | Publications | " + (fullname || memberId),
  };
}

export default async function PubsByMember({ params }: Params) {
  const { memberId } = await params;
  const db = await Database.get();
  const member = await db.getMember(memberId);
  const pubs = await db.getAllPublicationsByPerson(member.id);
  const mByYear = pubs.reduce((g, pub) => {
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
    <PageMain>
      <PageTitle className="lg:pb-4">
        Full Publication List:{" "}
        <Link className="link link-hover" href={`/team/${memberId}`}>
          {composeFullName(member)}
        </Link>{" "}
      </PageTitle>
      {sortedByYear.map(({ year, pubs, idx }) => (
        <div key={year} className="lg:flex lg:flex-row lg:p-2 lg:gap-4">
          <h2 className="divider lg:divider-horizontal lg:divider-start text-2xl">{`${year}`}</h2>
          <PubList pubs={pubs} startIndex={idx} />
        </div>
      ))}
      <PubListFootnote />
    </PageMain>
  );
}
