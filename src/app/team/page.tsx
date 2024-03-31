import DefaultMDX from "@/layouts/defaultMdx";
import MemberCard from "@/components/memberCard";
import { metadataTmpl } from "@/data/metadata";
import { getAllMemberIds, getMemberMdxSrc } from "@/data/team";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Team",
};

export default async function Team() {
  type Group = {
    cls: string;
    members: Member[];
    classify: (m: Member) => boolean;
  };

  const groups: Group[] = [
    {
      cls: "PI",
      members: [] as Member[],
      classify: (m: Member) => m.position.toLowerCase().includes("professor"),
    },
    {
      cls: "PhD",
      members: [] as Member[],
      classify: (m: Member) => m.position.toLowerCase().includes("phd"),
    },
    {
      cls: "Master",
      members: [] as Member[],
      classify: (m: Member) => m.position.toLowerCase().includes("master"),
    },
    {
      cls: "Undergraduate",
      members: [] as Member[],
      classify: (m: Member) =>
        m.position.toLowerCase().includes("undergraduate"),
    },
  ];
  const others: Group = {
    cls: "Other",
    members: [] as Member[],
    classify: () => true,
  };

  const allMemberIds = await getAllMemberIds();
  const allMembers: Member[] = await Promise.all(
    allMemberIds.map(async (id) =>
      getMemberMdxSrc(id).then(({ member }) => member)
    )
  );

  for (const m of allMembers) {
    var classified = false;
    for (const { members, classify } of groups) {
      if (classify(m)) {
        members.push(m);
        classified = true;
      }
    }

    if (!classified) {
      others.members.push(m);
    }
  }

  groups.push(others);

  return (
    <div>
      <DefaultMDX>
        <h1>Team</h1>
      </DefaultMDX>
      {groups.map((value) => {
        const { cls, members } = value;
        return (
          members.length > 0 && (
            <>
              <div className="divider">{cls}</div>
              <div className="flex flex-row justify-center flex-wrap content-start gap-4">
                {members.map((m) => (
                  <MemberCard member={m} key={m.id}></MemberCard>
                ))}
              </div>
            </>
          )
        );
      })}
    </div>
  );
}
