import { serialize } from "next-mdx-remote/serialize";
import { readdir, readFile } from "fs/promises";

export async function getAllMemberIds() {
  const files = await readdir(process.cwd() + "/src/app/team/[memberId]");
  const memberIds = files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
  return memberIds;
}

export async function getMemberMdxSrc(memberId: string) {
  const mdxSrc = await readFile(
    process.cwd() + `/src/app/team/[memberId]/${memberId}.mdx`,
    "utf-8"
  )

  const { frontmatter: fm } = await serialize(mdxSrc, { parseFrontmatter: true })

  for (let key of ["firstname", "lastname", "position"]) {
    if (!(key in fm)) {
      throw new Error(
        `Source code error: missing frontmatter key ${key} in ${memberId}.mdx`
      );
    }
  }

  const member: Member = {
    // required
    id: memberId,
    firstname: fm.firstname as string,
    lastname: fm.lastname as string,
    position: fm.position as string,

    // optional
    middlename: fm.middlename as string | undefined,
    email: fm.email as string | undefined,
    website: fm.website as string | undefined,
    avatar: fm.avatar as string | undefined,
    shortbio: fm.shortbio as string | undefined,
    office: fm.office as string | undefined,
    gscholar: fm.gscholar as string | undefined,
    orcid: fm.orcid as string | undefined,
    github: fm.github as string | undefined,
    linkedin: fm.linkedin as string | undefined,
    twitter: fm.twitter as string | undefined,
    facebook: fm.facebook as string | undefined,
    instagram: fm.instagram as string | undefined,
    youtube: fm.youtube as string | undefined,
  };

  const name = [member.firstname, member.middlename, member.lastname]
    .filter((i) => i)
    .join(" ");

  // XXX
  // below is a temporary workaround because MDXRemote from "next-mdx-remote" is
  // not working properly for post-serialize MDX source. we have to remove the
  // frontmatter manually and let MDXRemote from "next-mdx-remote/rsc" use the
  // raw MDX source instead

  console.log(mdxSrc)
  const mdxSrcWithoutFrontMatter = mdxSrc.replace(/---\n(.*\n)*---/, "")
  console.log(mdxSrcWithoutFrontMatter)

  // return { mdxSrc, member, name };
  return { mdxSrc: mdxSrcWithoutFrontMatter, member, name };
}