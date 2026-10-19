import PageMain from "@/layouts/pageMain";
import Prose, { PageTitle } from "@/components/prose";
import MemberCard from "./memberCard";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { metadataTmpl, composeFullName } from "@/lib/utils";
import { Database } from "@/lib/database";
import { Member, MemberRole } from "@/lib/types";
config.autoAddCss = false;

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Team",
};

function toOrderedGroups(members: Member[]): [MemberRole, Member[]][] {
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

  const groups = members.reduce((g: Map<MemberRole, Member[]>, p) => {
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

  return groups_ordered;
}

export default async function Team() {
  const db = await Database.get();
  const allMembers = await db.getManyMembers();
  const allActiveMembers = allMembers.filter((m) => !m.memberInfo.whenLeft);
  const allAlumni = allMembers.filter((m) => !!m.memberInfo.whenLeft);
  const groups_ordered = toOrderedGroups(allActiveMembers);
  const alums_ordered = toOrderedGroups(allAlumni);

  return (
    <PageMain>
      <PageTitle>Team</PageTitle>
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
      <div className="collapse">
        <input type="checkbox" className="peer" />
        <div className="collapse-title peer-checked:hidden">
          <Prose className="mt-8">
            <h2 className="m-0 text-[2.25em] font-extrabold leading-[1.1111111]">
              Alumni <FontAwesomeIcon icon={faAngleDown}></FontAwesomeIcon>
            </h2>
          </Prose>
        </div>
        <div className="collapse-title hidden peer-checked:block">
          <Prose className="mt-8">
            <h2 className="m-0 text-[2.25em] font-extrabold leading-[1.1111111]">
              Alumni <FontAwesomeIcon icon={faAngleUp}></FontAwesomeIcon>
            </h2>
          </Prose>
        </div>
        <div className="collapse-content">
          {alums_ordered.map(
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
        </div>
      </div>
    </PageMain>
  );
}
