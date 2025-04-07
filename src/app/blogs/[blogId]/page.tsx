import { readdir, readFile } from "fs/promises";
import { MDXRemote } from "next-mdx-remote/rsc";
import { useMDXComponents } from "@/mdx-components";
import { metadataTmpl } from "@/data/utils";
import DefaultMain from "@/layouts/defaultMain";
import DefaultMDX from "@/layouts/defaultMdx";

interface Params {
  params: {
    blogId: string;
  };
}

export async function generateMetadata({ params: { blogId } }: Params) {
  var title = "";
  if (blogId !== "_") {
    title = require(`@/app/blogs/[blogId]/${blogId}.mdx`)["title"];
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

export default async function BlogPage({ params: { blogId } }: Params) {
  var title: string = "You've reached the void ...";
  var mdxSrc: string = "";

  if (blogId !== "_") {
    title = require(`@/app/blogs/[blogId]/${blogId}.mdx`);
    mdxSrc = await readFile(
      `${process.cwd()}/src/app/blogs/[blogId]/${blogId}.mdx`,
      "utf-8",
    );
  }

  return (
    <DefaultMain>
      <DefaultMDX>
        <h1>{title}</h1>
        <MDXRemote source={mdxSrc} components={useMDXComponents({})} />
      </DefaultMDX>
    </DefaultMain>
  );
}
