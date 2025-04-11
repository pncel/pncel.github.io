import DefaultMain from "@/layouts/defaultMain";
import DefaultMDX from "@/layouts/defaultMdx";
import MemberCard from "./memberCard";
import { metadataTmpl, composeFullName } from "@/data/utils";
import { Database } from "@/data/database";
import { Member, MemberRole } from "@/data/types";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Team",
};

export default async function Team() {
  const db = await Database.get();
  const allMembers = await db.getManyMembers();

  const group_order = [
    MemberRole.pi,
    MemberRole.postdoc,
    MemberRole.staff,
    MemberRole.phd,
    MemberRole.visitor,
    MemberRole.ms,
    MemberRole.ug,
    MemberRole.other,
  ];

  const groups = allMembers.reduce((g: Map<MemberRole, Member[]>, p) => {
    g.set(p.memberInfo.role, (g.get(p.memberInfo.role) || []).concat(p));
    return g;
  }, new Map<MemberRole, Member[]>());

  const groups_sorted = new Map<MemberRole, Member[]>(
    Array.from(groups.entries()).map(([role, members]) => [
      role,
      members.sort((a, b) => {
        const aName = composeFullName(a).toLowerCase();
        const bName = composeFullName(b).toLowerCase();
        if (aName < bName) return -1;
        else if (aName > bName) return 1;
        else return 0;
      }),
    ]),
  );

  const groups_ordered = Array.from(groups_sorted.entries()).sort(
    ([r0], [r1]) => {
      return group_order.indexOf(r0) - group_order.indexOf(r1);
    },
  );

  return (
    <DefaultMain>
      <DefaultMDX>
        <h1>Team</h1>
      </DefaultMDX>
      {groups_ordered.map(
        ([role, members]) =>
          members.length > 0 && (
            <div key={role}>
              <p className="divider text-xl 2xl:text-2xl">{role}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 py-4">
                {members.map((m) => (
                  <MemberCard member={m} key={m.id}></MemberCard>
                ))}
              </div>
            </div>
          ),
      )}
    </DefaultMain>
  );
}
