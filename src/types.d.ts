type Relational = {
  tags?: string[];
  news?: number[]; // news ids
  pubs?: string[]; // publication ids
  projects?: string[]; // project ids
  members?: string[]; // member ids
};

type Person = {
  id: string;
  firstname: string;
  lastname: string;
  goby?: string;
  middlename?: string;
  externalLink?: string;
};

type RoleType =
  | "Principle Investigator"
  | "PhD"
  | "Master"
  | "Undergraduate"
  | "Postdoc"
  | "Staff"
  | "Visitor"
  | "Other";

type Member = Person &
  Relational & {
    role: RoleType;
    position: string;
    whenLeft?: Date;
    email?: string;
    avatar?: string;
    shortbio?: string;
    office?: string;
    gscholar?: string;
    orcid?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };

type NewsType =
  | "Grant"
  | "Award"
  | "Pub"
  | "Media"
  | "Chip"
  | "Group"
  | "Collab"
  | "Other";

type News = Relational & {
  id: number; // should match its index in the news array
  date?: Date; // dateless news won't appear in the news pages
  type: NewsType;
  content: string; // markdown ok
};

type Project = {
  id: string;
  title: string;
  abbr?: string; // default to id
  abstract?: string; // markdown ok
  splash?: string; // splash image
};

type VenueType = "Conference" | "Journal" | "Workshop" | "Preprint" | "Other";

type Venue = {
  id: string;
  fullname: string;
  abbr: string;
  type: VenueType;
};

type Author = {
  person: string; // id
  equalContrib?: boolean;
};

type AddlPubInfo = {
  tag: string;
  type:
    | "DOI"
    | "PDF"
    | "Video"
    | "Cite"
    | "Website"
    | "GitHub"
    | "Artifact"
    | "Other";
  link?: string;
};

type Publication = Relational & {
  id: string;
  title: string;
  venue: string; // venue id
  time: Date;
  authors: Author[];
  addlInfo?: AddlPubInfo[];
  abstract?: string; // markdown ok
  notPncel?: boolean;
};
