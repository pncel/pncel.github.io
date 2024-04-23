import { readFile } from "fs/promises";
import prisma, { validateMember } from "./prisma";

export async function getAllMemberIds() {
  const memberIds = await prisma.member.findMany({
    select: {
      memberId: true,
    },
  });
  return memberIds;
}

export async function getAllMembers() {
  const members = await prisma.member.findMany({
    include: {
      person: true,
    },
  });

  return members.map(validateMember);
}

export async function getMember(memberId: string) {
  const member = await prisma.member.findUnique({
    where: {
      memberId: memberId,
    },
    include: {
      person: true,
    },
  });

  if (!member) {
    throw new Error(
      `Database data or source code error: no member found for memberId ${memberId}`
    );
  } else if (!member.person) {
    throw new Error(
      `Database data or source code error: no person found for id ${member.personId}`
    );
  }

  return validateMember(member);
}

export async function getMemberMdxSrc(memberId: string) {
  // get mdx if there is one
  const mdxSrc = await readFile(
    process.cwd() + `/src/app/team/[memberId]/${memberId}.mdx`,
    "utf-8"
  ).catch((e) => {
    if (e.code == "ENOENT") {
      return null; // if no file, just return null
    } else {
      throw e;
    }
  });

  return mdxSrc;
}
