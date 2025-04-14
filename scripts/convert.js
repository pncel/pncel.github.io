import { Database as OldDatabase } from "./dist/database.js";
import { Database, encodeDate, marshalId } from "./dist/newdatabase.js";
import { TagType, Icon, MemberRole } from "./dist/newtypes.js";

const old = await OldDatabase.get();
const new_ = await Database.get();

function getEnumKeyByValue(enumObj, value) {
  return Object.keys(enumObj).find((key) => enumObj[key] === value);
}

// start with persons
const id_old2new = new Map();
for (const p of old.getManyPersons()) {
  const m =
    p.memberId === undefined || p.memberId === ""
      ? undefined
      : old.getMember(p.memberId);
  const id = m ? m.id : `${"$"}${marshalId(p.id)}`;
  id_old2new.set(p.id, id);
  await new_.db.persons.insert({
    id,
    firstname: p.firstname,
    lastname: p.lastname,
    goby: p.goby,
    middlename: p.middlename,
    avatar: p.headshot,
    externalLink: p.externalLink,
    memberInfo: m && {
      role: getEnumKeyByValue(MemberRole, m.role),
      whenJoined: encodeDate(m.whenJoined),
      whenLeft: encodeDate(m.whenLeft),
      position: m.position,
      email: m.email,
      office: m.office,
      links: [
        ...(m.gscholar
          ? [{ icon: "gscholar", link: m.gscholar, label: "Google Scholar" }]
          : []),
        ...(m.orcid ? [{ icon: "orcid", link: m.orcid, label: "ORCiD" }] : []),
        ...(m.github
          ? [{ icon: "github", link: m.github, label: "GitHub" }]
          : []),
        ...(m.linkedin
          ? [{ icon: "linkedin", link: m.linkedin, label: "LinkedIn" }]
          : []),
        ...(m.twitter
          ? [{ icon: "twitter", link: m.twitter, label: "X (Twitter)" }]
          : []),
        ...(m.facebook
          ? [{ icon: "facebook", link: m.facebook, label: "Facebook" }]
          : []),
        ...(m.instagram
          ? [{ icon: "instagram", link: m.instagram, label: "Instagram" }]
          : []),
        ...(m.youtube
          ? [{ icon: "youtube", link: m.youtube, label: "Youtube" }]
          : []),
      ],
      selectedPubIds: m.selectedPubIds?.map((id) => `+${marshalId(id)}`),
    },
  });
}

// publications
for (const p of old.getManyPublications()) {
  await new_.db.publications.insert({
    id: `+${marshalId(p.id)}`,
    title: p.title,
    authorIds: p.authorIds.map((id) => id_old2new.get(id)),
    time: encodeDate(p.time),
    booktitle: p.booktitle,
    doi: p.doi,
    bibtex: p.bibtex,
    arxivDoi: p.arxivDOI,
    arxivBibtex: p.arxivBibtex,
    authorsCopy: p.authorsCopy,
    equalContrib: p.equalContrib,
    notPncel: p.notPncel,
    tags: p.tags?.map((t) => ({
      ...t,
      type: getEnumKeyByValue(TagType, t.type),
      icon: getEnumKeyByValue(Icon, t.icon),
    })),
    attachments: p.attachments?.map((a) => ({
      ...a,
      icon: getEnumKeyByValue(Icon, a.icon),
    })),
  });
}

// photos
for (const [i, p] of old.getAllPhotos().entries()) {
  await new_.db.photos.insert({
    ...p,
    id: `!${marshalId(i + 1)}`,
    time: encodeDate(p.time),
  });
}

new_.persist();
