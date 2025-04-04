import Link from "next/link";
import PubList, { PubListFootnote } from "@/components/pubList";
import { metadataTmpl } from "@/data/metadata";
import { getPubsByPerson } from "@/data/pub";
import { Publication } from "@/data/newtypes";
import DefaultMDX from "@/layouts/defaultMdx";
import DefaultMain from "@/layouts/defaultMain";
import { getAllMemberIds, getMember } from "@/data/member";
import { composeFullName } from "@/data/person";

interface Params {
  params: {
    memberId: string;
  };
}

export async function generateStaticParams() {
  const memberIds = await getAllMemberIds();
  return memberIds;
}

export async function generateMetadata({ params: { memberId } }: Params) {
  const member = await getMember(memberId);
  const fullname = composeFullName(member.person!);
  return {
    ...metadataTmpl,
    title: metadataTmpl.title + " | Publications | " + (fullname || memberId),
  };
}

export default async function PubsByMember({ params: { memberId } }: Params) {
  const member = await getMember(memberId);
  const pubs = await getPubsByPerson(member.person!.id);
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
    <DefaultMain>
      <DefaultMDX>
        <h1 className="lg:pb-4">
          Full Publication List:{" "}
          <Link className="link link-hover" href={`/team/${memberId}`}>
            {composeFullName(member.person!)}
          </Link>{" "}
        </h1>
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
