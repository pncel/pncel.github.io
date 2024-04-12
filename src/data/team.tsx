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
  );

  const { frontmatter: fm } = await serialize(mdxSrc, {
    parseFrontmatter: true,
  });

  for (let key of ["firstname", "lastname", "role", "position"]) {
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
    role: fm.role as RoleType,
    position: fm.position as string,

    // optional
    goby: fm.goby as string | undefined,
    middlename: fm.middlename as string | undefined,
    email: fm.email as string | undefined,
    externalLink: fm.website as string | undefined,
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

  // XXX
  // below is a temporary workaround because MDXRemote from "next-mdx-remote" is
  // not working properly for post-serialize MDX source. we have to remove the
  // frontmatter manually and let MDXRemote from "next-mdx-remote/rsc" use the
  // raw MDX source instead

  const mdxSrcWithoutFrontMatter = mdxSrc.replace(/---\n(.*\n)*---/, "");

  // return { mdxSrc, member };
  return { mdxSrc: mdxSrcWithoutFrontMatter, member };
}

export function composeMemberName(member: Member) {
  const { firstname, goby, middlename, lastname } = member;
  const name = middlename ? `${firstname} ${middlename}` : firstname;
  if (goby) {
    return `${goby} (${name}) ${lastname}`;
  } else {
    return `${name} ${lastname}`;
  }
}
