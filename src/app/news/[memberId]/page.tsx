import Link from "next/link";
import NewsList from "@/components/newsList";
import Prose from "@/components/prose";
import PageMain from "@/layouts/pageMain";
import { Database } from "@/lib/database";
import { metadataTmpl, composeFullName, groupByYear } from "@/lib/utils";
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
    title: metadataTmpl.title + " | News | " + (fullname || memberId),
  };
}

export default async function NewsByMember({ params }: Params) {
  const { memberId } = await params;
  const db = await Database.get();
  const member = await db.getMember(memberId);
  const memberNews = await db.getAllNewsByPerson(member.id);
  const byYear = groupByYear(memberNews, (n) => n.time);

  return (
    <PageMain>
      <Prose className="mt-8">
        <h1 className="lg:pb-4">
          All News:{" "}
          <Link className="link link-hover" href={`/team/${memberId}`}>
            {composeFullName(member)}
          </Link>
        </h1>
        {memberNews.length === 0 && <p>No news items yet.</p>}
      </Prose>
      {byYear.map(({ year, items, startIndex }) => (
        <div key={year} className="lg:flex lg:flex-row lg:p-2 lg:gap-4">
          <h2 className="divider lg:divider-horizontal lg:divider-start text-2xl">{`${year}`}</h2>
          <NewsList news={items} startIndex={startIndex} />
        </div>
      ))}
    </PageMain>
  );
}
