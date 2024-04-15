import {
  PrismaClient,
  Member,
  Person,
  Tag,
  VenueSeries,
  Venue,
  PubResource,
  Publication,
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

export function validateVenueSeries(series: VenueSeries) {
  // check "type" value
  if (
    series.type &&
    !(
      series.type === "Conference" ||
      series.type === "Journal" ||
      series.type === "Workshop"
    )
  ) {
    throw new Error(
      `Database data error: invalid type (${series.type}) for venue series ${series.abbr}`
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
  venue: Venue & { series: VenueSeries };
  authors: (Person & { member: Member | null })[];
  tags: Tag[];
  resources: PubResource[];
};

export function validatePubExt(pub: PublicationExtended) {
  pub.tags.forEach(validateTag);
  pub.resources.forEach(validatePubResource);
  validateVenueSeries(pub.venue.series);
  pub.authors.forEach((p) => p.member && validateMember(p.member));
}

export const queryPubExt = {
  include: {
    tags: true,
    venue: {
      include: {
        series: true,
      },
    },
    authors: {
      include: {
        member: true,
      },
    },
    resources: true,
  },
};
