import DefaultMDX from "@/layouts/defaultMdx";
import DefaultMain from "@/layouts/defaultMain";
import MemberCard from "./memberCard";
import { metadataTmpl } from "@/data/metadata";
import { getAllMembers } from "@/data/member";
import type { Member } from "@/data/types";
import { MemberRole } from "@/data/enums";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Team",
};

export default async function Team() {
  const allMembers = await getAllMembers();

  const groups = allMembers.reduce((g: Map<MemberRole, Member[]>, m) => {
    const members = g.get(m.role) || [];
    members.push(m);
    g.set(m.role, members);
    return g;
  }, new Map<MemberRole, Member[]>());

  return (
    <div>
      <DefaultMDX>
        <h1>Team</h1>
      </DefaultMDX>
      <DefaultMain>
        {Array.from(groups.entries()).map(
          ([role, members]) =>
            members.length > 0 && (
              <div key={role}>
                <p className="divider text-xl 2xl:text-2xl">{role}</p>
                <div className="columns-1 lg:columns-2 2xl:columns-3 gap-x-4 py-4">
                  {members.map((m) => (
                    <MemberCard member={m} key={m.memberId}></MemberCard>
                  ))}
                </div>
              </div>
            )
        )}
      </DefaultMain>
    </div>
  );
}
