import { metadataTmpl, groupByYear } from "@/lib/utils";
import PageMain from "@/layouts/pageMain";
import Prose from "@/components/prose";
import NewsList from "@/components/newsList";
import { Database } from "@/lib/database";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | News",
};

export default async function News() {
  const db = await Database.get();
  const allNews = await db.getManyNews();
  const byYear = groupByYear(allNews, (n) => n.time);

  return (
    <PageMain>
      <Prose className="mt-8">
        <h1 className="lg:pb-4">News</h1>
        {allNews.length == 0 && <p>No news items yet. Check back soon!</p>}
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
