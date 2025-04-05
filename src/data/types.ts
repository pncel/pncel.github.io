export enum TagType {
  other,
  award,
  venue,
}

export enum NewsType {
  other,
}

export enum MemberRole {
  other = "Other",
  pi = "Principle Investigator",
  phd = "Ph.D.",
  ms = "Master",
  ug = "Undergrad",
  postdoc = "Postdoc",
  staff = "Staff",
  visitor = "Visitor",
  // alumni is indicated by the `whenLeft` field of a member
  // this allows us to distinguish phd alumni, ms alumni, etc.
  // we only keep track of the most important role a member took
  //   PhD>PostDoc>MS>UG>visitor
}

export enum Icon {
  default,
  pdf,
  video,
  github,
  website,
}

export type Person = {
  id: number;
  firstname: string;
  lastname: string;
  goby?: string;
  middlename?: string;
  headshot?: string;
  externalLink?: string;
  memberId?: string;
};

export type Member = {
  id: string;
  role: MemberRole;
  personId: number;
  whenJoined: Date;
  whenLeft?: Date;
  position?: string;
  email?: string;
  office?: string;
  gscholar?: string;
  orcid?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  selectedPubIds?: number[];
};

export type Tag = {
  type: TagType;
  label: string;
  icon?: Icon;
};

export type PubAttachment = {
  label: string;
  link: string;
  icon?: Icon;
};

export type Publication = {
  id: number;
  title: string;
  authorIds: number[];
  time: Date;
  doi?: string;
  booktitle?: string;
  bibtex?: string;
  arxivDOI?: string;
  arxivBibtex?: string;
  authorsCopy?: string;
  equalContrib?: number;
  notPncel?: boolean;
  tags?: Tag[];
  attachments?: PubAttachment[];
};

export type Photo = {
  title: string;
  subtitle?: string;
  width: number;
  height: number;
  image: string;
  thumbnail?: string;
  time: Date;
};

export type Database = {
  persons: (Person | undefined)[]; // by ID. Cannot guarantee continuity of IDs
  members: Map<string, Member>; // by ID
  publications: (Publication | undefined)[]; // by ID. Cannot guarantee continuity of IDs
  photos: Photo[];
};
