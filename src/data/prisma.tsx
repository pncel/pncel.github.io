import {
  PrismaClient,
  Member,
  Person,
  Tag,
  Venue,
  PubResource,
  Publication,
  Prisma,
} from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;

export function validateTag(tag: Tag) {
  // check "type" value
  if (tag.type && !(tag.type === "Award" || tag.type === "Artifact")) {
    throw new Error(
      `Database data error: invalid type (${tag.type}) for tag ${tag.label}`
    );
  }
}

export function validateMember(member: Member) {
  // check "role" value
  if (
    member.role &&
    !(
      member.role === "Principle Investigator" ||
      member.role === "PhD" ||
      member.role === "Master" ||
      member.role === "Undergrad" ||
      member.role === "Postdoc" ||
      member.role === "Staff" ||
      member.role === "Visitor"
    )
  ) {
    throw new Error(
      `Database data error: invalid role (${member.role}) for member (id:${member.memberId})`
    );
  }
}

export function validateVenue(venue: Venue) {
  // check "type" value
  if (
    venue.type &&
    !(
      venue.type === "Conference" ||
      venue.type === "Journal" ||
      venue.type === "Workshop"
    )
  ) {
    throw new Error(
      `Database data error: invalid type (${venue.type}) for venue venue ${venue.abbr}`
    );
  }
}

export function validatePubResource(rsc: PubResource) {
  // check "icon" value
  if (rsc.icon && !(rsc.icon === "pdf" || rsc.icon === "video")) {
    throw new Error(
      `Database data error: invalid icon (${rsc.icon}) for resource (id:${rsc.id})`
    );
  }
}

export type PublicationExtended = Publication & {
  venue: Venue;
  authors: (Person & { member: Member | null })[];
  tags: Tag[];
  resources: PubResource[];
};

export function validatePubExt(pub: PublicationExtended) {
  if (
    pub.type &&
    !(
      // pub.type === "masterthesis" ||
      // pub.type === "phdthesis" ||
      // pub.type === "misc" ||
      (pub.type === "inproceedings")
    )
  ) {
    throw new Error(
      `Database data error: invalid type (${pub.type}) for publication "${pub.title}"`
    );
  }
  pub.tags.forEach(validateTag);
  pub.resources.forEach(validatePubResource);
  validateVenue(pub.venue);
  pub.authors.forEach((p) => p.member && validateMember(p.member));
}

export const queryPubExt = Prisma.validator(
  prisma,
  "publication",
  "findMany"
)({
  include: {
    tags: true,
    venue: true,
    authors: {
      include: {
        member: true,
      },
    },
    resources: true,
  },
  orderBy: {
    time: "desc",
  },
});
