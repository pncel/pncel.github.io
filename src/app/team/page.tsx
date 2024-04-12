import DefaultMDX from "@/layouts/defaultMdx";
import MemberCard from "./memberCard";
import { metadataTmpl } from "@/data/metadata";
import { getAllMemberIds, getMemberMdxSrc } from "@/data/team";
import DefaultMain from "@/layouts/defaultMain";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Team",
};

export default async function Team() {
  const allMemberIds = await getAllMemberIds();
  const allMembers: Member[] = await Promise.all(
    allMemberIds.map(async (id) =>
      getMemberMdxSrc(id).then(({ member }) => member)
    )
  );
  const groups = allMembers.reduce((g: Map<string, Member[]>, m: Member) => {
    const members = g.get(m.role) || [];
    members.push(m);
    g.set(m.role, members);
    return g;
  }, new Map<string, Member[]>());

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
                <div className="divider">{role}</div>
                <div className="columns-1 lg:columns-2 2xl:columns-3 gap-x-4 py-4">
                  {members.map((m: Member) => (
                    <MemberCard member={m} key={m.id}></MemberCard>
                  ))}
                </div>
              </div>
            )
        )}
      </DefaultMain>
    </div>
  );
}
