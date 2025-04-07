import { readdir } from "fs/promises";
import { metadataTmpl } from "@/data/utils";
import DefaultMDX from "@/layouts/defaultMdx";
import DefaultMain from "@/layouts/defaultMain";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Blogs",
};

async function getAllBlogs() {
  const files = await readdir(`${process.cwd()}/src/app/blogs/[blogId]`);
  const blogs = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({
      file: file,
      exports: require(`@/app/blogs/[blogId]/${file}`),
    }))
    .toSorted(
      (a, b) =>
        Date.parse(b.exports["creation_time"]) -
        Date.parse(a.exports["creation_time"]),
    );
  return blogs;
}

export default async function Blogs() {
  const blogs = await getAllBlogs();
  return (
    <DefaultMain>
      <DefaultMDX>
        <h1>Blogs</h1>
        {blogs.length === 0 && <p>Under construction...</p>}
        {blogs.map(({ exports }) => {
          const date = new Date(exports["creation_time"]).toLocaleString(
            "en-US",
            { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
          );
          return (
            <p key={exports["title"]}>
              {exports["title"]}, {date}
            </p>
          );
        })}
      </DefaultMDX>
    </DefaultMain>
  );
}
