import DefaultMDX from "@/layouts/defaultMdx";
import MemberCard from "@/components/memberCard";
import { members } from "@/data/team";
import { metadataTmpl } from "@/data/metadata";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Team",
};

export default async function Team() {
  var pi = [],
    phd = [],
    ms = [],
    ug = [],
    other = [];

  for (const m of members) {
    if (m.position.toLowerCase().includes("professor")) {
      pi.push(m);
    } else if (m.position.toLowerCase().includes("phd")) {
      phd.push(m);
    } else if (m.position.toLowerCase().includes("ms")) {
      ms.push(m);
    } else if (m.position.toLowerCase().includes("undergraduate")) {
      ug.push(m);
    } else {
      other.push(m);
    }
  }

  return (
    <div>
      <DefaultMDX>
        <h1>Team</h1>
      </DefaultMDX>
      <div className="divider">PI</div>
      <div className="flex flex-row justify-center flex-wrap content-start gap-4">
        {pi.map((m) => (
          <MemberCard member={m} key={m.id}></MemberCard>
        ))}
      </div>
      {phd.length > 0 && (
        <>
          <div className="divider">PhD</div>
          <div className="flex flex-row justify-center flex-wrap content-start gap-4">
            {phd.map((m) => (
              <MemberCard member={m} key={m.id}></MemberCard>
            ))}
          </div>
        </>
      )}
      {ms.length > 0 && (
        <>
          <div className="divider">Master</div>
          <div className="flex flex-row justify-center flex-wrap content-start gap-4">
            {ms.map((m) => (
              <MemberCard member={m} key={m.id}></MemberCard>
            ))}
          </div>
        </>
      )}
      {ug.length > 0 && (
        <>
          <div className="divider">Undergraduate</div>
          <div className="flex flex-row justify-center flex-wrap content-start gap-4">
            {ug.map((m) => (
              <MemberCard member={m} key={m.id}></MemberCard>
            ))}
          </div>
        </>
      )}
      {other.length > 0 && (
        <>
          <div className="divider">Others</div>
          <div className="flex flex-row justify-center flex-wrap content-start gap-4">
            {other.map((m) => (
              <MemberCard member={m} key={m.id}></MemberCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
