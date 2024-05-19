import DefaultMDX from "@/layouts/defaultMdx";
import DefaultMain from "@/layouts/defaultMain";
import MemberCard from "./memberCard";
import { metadataTmpl } from "@/data/metadata";
import { getAllMembers } from "@/data/member";
import type { Member } from "@/data/types";
import { MemberRole } from "@/data/enums";
import { group } from "console";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Team",
};

export default async function Team() {
  const allMembers = await getAllMembers();

  const group_order = [
    MemberRole.pi,
    MemberRole.postdoc,
    MemberRole.staff,
    MemberRole.phd,
    MemberRole.visitor,
    MemberRole.ms,
    MemberRole.ug,
    MemberRole.other,
  ]

  const groups = allMembers.reduce((g: Map<MemberRole, Member[]>, m) => {
    const members = g.get(m.role) || [];
    members.push(m);
    g.set(m.role, members);
    return g;
  }, new Map<MemberRole, Member[]>());

  const groups_ordered = Array.from(groups.entries()).sort(([r0], [r1]) => {
    return group_order.indexOf(r0) - group_order.indexOf(r1)
  })
  
  return (
    <div>
      <DefaultMDX>
        <h1>Team</h1>
      </DefaultMDX>
      <DefaultMain>
        {groups_ordered.map(
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
