import { readdir, readFile } from "fs/promises";
import { MDXRemote } from "next-mdx-remote/rsc";
import { metadataTmpl } from "@/lib/utils";
import PageMain from "@/layouts/pageMain";
import Prose from "@/components/prose";
import matter from "gray-matter";

interface Params {
  params: Promise<{
    blogId: string;
  }>;
}

export async function generateMetadata({ params }: Params) {
  const { blogId } = await params;
  var title = "";
  if (blogId !== "_") {
    try {
      const fileContent = await readFile(
        `${process.cwd()}/src/app/blogs/[blogId]/${blogId}.mdx`,
        "utf-8",
      );
      const { data } = matter(fileContent);
      title = data.title || blogId;
    } catch (e) {
      title = blogId;
    }
  }
  return {
    ...metadataTmpl,
    title: metadataTmpl.title + " | Blog | " + title,
  };
}

export async function generateStaticParams() {
  const blogDir = `${process.cwd()}/src/app/blogs/[blogId]`;
  const files = await readdir(blogDir);
  const blogIds = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({ blogId: file.replace(/\.mdx$/, "") }));
  if (blogIds.length > 0) return blogIds;
  else return [{ blogId: "_" }];
}

export default async function BlogPage({ params }: Params) {
  const { blogId } = await params;
  var title: string = "You've reached the void ...";
  var mdxSrc: string = "";

  if (blogId !== "_") {
    try {
      const fileContent = await readFile(
        `${process.cwd()}/src/app/blogs/[blogId]/${blogId}.mdx`,
        "utf-8",
      );
      const { data, content } = matter(fileContent);
      title = data.title || blogId;
      mdxSrc = content;
    } catch (e) {
      title = "Blog not found";
      mdxSrc = "This blog post could not be loaded.";
    }
  }

  return (
    <PageMain>
      <Prose className="mt-8">
        <h1>{title}</h1>
        <MDXRemote source={mdxSrc} />
      </Prose>
    </PageMain>
  );
}
