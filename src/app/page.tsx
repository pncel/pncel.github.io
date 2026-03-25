import FancySlogan from "@/app/fancyslogan";
import DefaultMain from "@/layouts/defaultMain";
import DefaultMDX from "@/layouts/defaultMdx";
import NewsList from "@/components/newsList";
import { Database } from "@/lib/database";
import Link from "next/link";

export default async function Home() {
  const db = await Database.get();
  const latestNews = await db.getManyNews(undefined, 10, true);

  return (
    <DefaultMain>
      <div className="my-8">
        <FancySlogan />
      </div>
      <DefaultMDX>
        <p>Welcome to PᴺCEL&apos;s website!</p>
      </DefaultMDX>
      {latestNews.length > 0 && (
        <>
          <div className="divider"></div>
          <DefaultMDX>
            <div className="flex justify-between items-baseline">
              <h2 className="mt-0">Latest News</h2>
              <Link
                className="btn btn-sm btn-ghost sm:text-xl text-lg"
                href="/news"
              >
                All news
              </Link>
            </div>
          </DefaultMDX>
          <NewsList news={latestNews} />
        </>
      )}
    </DefaultMain>
  );
}
