import { PrismaClient, Member } from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;

export function validateMember(member: Member) {
  // check "role" value
  if (
    !(
      member.role === "Principle Investigator" ||
      member.role === "PhD" ||
      member.role === "Master" ||
      member.role === "Undergrad" ||
      member.role === "Postdoc" ||
      member.role === "Staff" ||
      member.role === "Visitor" ||
      member.role === "Other"
    )
  ) {
    throw new Error(
      `Database data error: invalid role (${member.role}) for member (id:${member.memberId})`
    );
  }
}
