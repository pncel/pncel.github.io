import { PrismaClient } from "@prisma/client";
import { stringify } from "yaml";
import { writeFile } from "fs/promises";
import { createHash } from "crypto";

const prisma = new PrismaClient();

async function convert_persons() {
  const allPersons = await prisma.person.findMany({
    include: {
      member: true,
    },
  });

  const allPersons_newtype = allPersons.map((p) => ({
    id: p.id,
    firstname: p.firstname,
    lastname: p.lastname,
    goby: p.goby || undefined,
    middlename: p.middlename || undefined,
    headshot: p.avatar || undefined,
    externalLink: p.externalLink || undefined,
    memberId: p.member?.memberId || undefined,
  }));

  const yaml = stringify(allPersons_newtype);
  await writeFile(`${process.cwd()}/public/database/persons.yaml`, yaml);

  const hash = createHash("md5");
  hash.update(yaml);
  return hash.digest("hex");
}

async function convert_members() {
  const allMembers = await prisma.member.findMany({
    include: {
      selectedPubs: true,
    },
  });

  const allMembers_newtype = allMembers.map((m) => ({
    id: m.memberId,
    role: m.role,
    personId: m.personId,
    whenJoined: new Date(m.whenJoined).toISOString(),
    position: m.position || undefined,
    email: m.email || undefined,
    office: m.office || undefined,
    gscholar: m.gscholar || undefined,
    orcid: m.orcid || undefined,
    github: m.github || undefined,
    linkedin: m.linkedin || undefined,
    twitter: m.twitter || undefined,
    facebook: m.facebook || undefined,
    instagram: m.instagram || undefined,
    youtube: m.youtube || undefined,
    selectedPubIds: m.useSelectedPubs
      ? m.selectedPubs.map((p) => p.id)
      : undefined,
  }));

  const yaml = stringify(allMembers_newtype);
  await writeFile(`${process.cwd()}/public/database/members.yaml`, yaml);

  const hash = createHash("md5");
  hash.update(yaml);
  return hash.digest("hex");
}

async function convert_pubs() {
  const allPubs = await prisma.publication.findMany({
    include: {
      tags: true,
      resources: true,
    },
  });

  const allPubs_newtype = allPubs.map((p) => ({
    id: p.id,
    title: p.title,
    authorIds: JSON.parse(p.authorOrder),
    time: new Date(p.time).toISOString(),
    doi: p.doi || undefined,
    booktitle: p.booktitle || undefined,
    bibtex: p.bibtex || undefined,
    arxivDOI: p.arxivDOI || undefined,
    arxivBibtex: p.arxivBibtex || undefined,
    authorsCopy: p.authorsCopy || undefined,
    equalContrib: p.equalContrib || undefined,
    notPncel: p.notPncel || undefined,
    tags: (p.venueKey ? [{ type: "venue", label: p.venueKey }] : []).concat(
      p.tags.map((t) => ({
        type: ["venue", "award"].includes(t.type) ? t.type : "other",
        label: t.label,
      })),
    ),
    attachments: p.resources
      ? p.resources.map((r) => ({
          label: r.label,
          link: r.link,
          icon: r.icon || undefined,
        }))
      : undefined,
  }));

  const yaml = stringify(allPubs_newtype);
  await writeFile(`${process.cwd()}/public/database/publications.yaml`, yaml);

  const hash = createHash("md5");
  hash.update(yaml);
  return hash.digest("hex");
}

const [persons_md5, members_md5, pubs_md5] = await Promise.all([
  convert_persons(),
  convert_members(),
  convert_pubs(),
]);

await writeFile(
  `${process.cwd()}/public/database/md5.yaml`,
  stringify({
    persons: persons_md5,
    members: members_md5,
    publications: pubs_md5,
  }),
);
