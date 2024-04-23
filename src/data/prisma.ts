import {
  PrismaClient,
  Person as _Person,
  Member as _Member,
  Tag as _Tag,
  Venue as _Venue,
  PubResource as _PubResource,
  Publication as _Publication,
  Prisma,
} from "@prisma/client";

import { MemberRole, TagType, VenueType, LinkIcon, PubType } from "./enums";

import type {
  Member,
  Person,
  Tag,
  Venue,
  PubResource,
  Publication,
} from "./types";

const prisma = new PrismaClient();
export default prisma;

type _TagExt = _Tag & { pubs?: _PubExt[] };
type _PersonExt = _Person & { member?: _MemberExt | null; pubs?: _PubExt[] };
type _MemberExt = _Member & { person?: _PersonExt; selectedPubs?: _PubExt[] };
type _VenueExt = _Venue & { pubs?: _PubExt[] };
type _PubRscExt = _PubResource & { pub?: _PubExt };
type _PubExt = _Publication & {
  tags?: _TagExt[];
  authors?: _PersonExt[];
  venue?: _VenueExt;
  resources?: _PubRscExt[];
  selectedBy?: _MemberExt[];
};

export function validateTag(tag: _TagExt): Tag {
  // check "type" value (Runtime)
  const TagTypeValues = Object.keys(TagType).filter((k) => isNaN(Number(k)));
  if (tag.type && !TagTypeValues.includes(tag.type)) {
    throw new Error(
      `Database data error: invalid type (${tag.type}) for tag ${tag.id}`
    );
  }

  return {
    ...tag,
    type: TagType[(tag.type || "other") as keyof typeof TagType],
    pubs: tag.pubs?.map(validatePublication),
  };
}

export function validatePerson(person: _PersonExt): Person {
  return {
    ...person,
    member: person.member && validateMember(person.member),
    pubs: person.pubs?.map(validatePublication),
  };
}

export function validateMember(member: _MemberExt): Member {
  // check "role" value
  const MemberRoleValues = Object.keys(MemberRole).filter((k) =>
    isNaN(Number(k))
  );
  if (member.role && !MemberRoleValues.includes(member.role)) {
    throw new Error(
      `Database data error: invalid role (${member.role}) for member (id:${member.memberId})`
    );
  }

  return {
    ...member,
    role: MemberRole[(member.role || "other") as keyof typeof MemberRole],
    person: member.person && validatePerson(member.person),
    selectedPubs: member.selectedPubs?.map(validatePublication),
  };
}

export function validateVenue(venue: _VenueExt): Venue {
  // check "type" value
  const VenueTypeValues = Object.keys(VenueType).filter((k) =>
    isNaN(Number(k))
  );
  if (venue.type && !VenueTypeValues.includes(venue.type)) {
    throw new Error(
      `Database data error: invalid type (${venue.type}) for venue ${venue.id}`
    );
  }

  return {
    ...venue,
    type: VenueType[(venue.type || "default") as keyof typeof VenueType],
    pubs: venue.pubs?.map(validatePublication),
  };
}

export function validatePubResource(rsc: _PubRscExt): PubResource {
  // check "icon" value
  const LinkIconValues = Object.keys(LinkIcon).filter((k) => isNaN(Number(k)));
  if (rsc.icon && !LinkIconValues.includes(rsc.icon)) {
    throw new Error(
      `Database data error: invalid icon (${rsc.icon}) for resource (id:${rsc.id})`
    );
  }

  return {
    ...rsc,
    icon: LinkIcon[(rsc.icon || "default") as keyof typeof LinkIcon],
    pub: rsc.pub && validatePublication(rsc.pub),
  };
}

export function validatePublication(pub: _PubExt): Publication {
  // check "type" value
  const PubTypeValues = Object.keys(PubType).filter((k) => isNaN(Number(k)));
  if (pub.type && !PubTypeValues.includes(pub.type)) {
    throw new Error(
      `Database data error: invalid type (${pub.type}) for publication "${pub.id}"`
    );
  }

  // correct author order
  let authors: Person[] | undefined = undefined;
  if (pub.authors) {
    let order: number[];
    try {
      order = JSON.parse(pub.authorOrder);
    } catch (e) {
      throw new Error(
        `Database data error: failed to parse authorOrder for publication ${pub.id}`
      );
    }

    if (order.length != pub.authors.length) {
      throw new Error(
        `Database data error: len(authorOrder) != len(authors) for publication ${pub.id}`
      );
    } else if (new Set(order).size != order.length) {
      throw new Error(
        `Database data error: duplicate entry in authorOrder for publication ${pub.id}`
      );
    }

    authors = order.map((id) => {
      const authors = pub.authors!.filter((author) => author.id === id);
      if (authors.length === 0) {
        throw new Error(
          `Database data error: no author with ID ${id} in the authors list for publication ${pub.id}`
        );
      } else if (authors.length > 1) {
        throw new Error(
          `Database data error: multiple authors with ID ${id} in the authors list for publication ${pub.id}`
        );
      }
      return validatePerson(authors[0]);
    });
  }

  return {
    ...pub,
    type: PubType[(pub.type || "unpublished") as keyof typeof PubType],
    tags: pub.tags?.map(validateTag),
    authors: authors,
    venue: pub.venue && validateVenue(pub.venue),
    resources: pub.resources?.map(validatePubResource),
    selectedBy: pub.selectedBy?.map(validateMember),
  };
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
