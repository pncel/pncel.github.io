import Link from "next/link";
import PubList, { PubListFootnote } from "@/components/pubList";
import { metadataTmpl, groupByYear } from "@/lib/utils";
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
  const byYear = groupByYear(pubs, (p) => p.time);

  return (
    <PageMain>
      <PageTitle className="lg:pb-4">
        Full Publication List:{" "}
        <Link className="link link-hover" href={`/team/${memberId}`}>
          {composeFullName(member)}
        </Link>{" "}
      </PageTitle>
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
