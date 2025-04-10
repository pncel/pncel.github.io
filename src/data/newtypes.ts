/*
Describes all the JSON schemas for RXDB and all the types (both RXDB documentation
types and native types). RXDB types are suffixed with 'Doc', e.g. 'Person' vs
'PersonDoc'. Native types are richer than RXDB types because the latter is for
JSON data, and can only represent date/time/enum as strings.
*/

import {
    toTypedRxJsonSchema,
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxJsonSchema,
} from 'rxdb';

// ==============================================================================
// == Enums =====================================================================
// ==============================================================================
export enum TagType {
  award,
  venue,
  tapeout,
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
  link,         // faPaperPlane
  pdf,          // faFilePdf
  video,        // faVideo
  github,       // faGithub
  website,      // faGlobe
  gscholar,     // faGoogleScholar
  orcid,        // faOrcid
  linkedin,     // faLinkedin
  twitter,      // faXTwitter
  instagram,    // faInstagram
  facebook,     // faFacebook
  youtube,      // faYoutube
  chip,         // faMicrochip
}

// ==============================================================================
// == Tag =======================================================================
// ==============================================================================
const tagSchemaLiteral = {
    type: 'object',
    properties: {
        label: { type: 'string' },
        link: { type: 'string' },
        type: { type: 'string', enum: Object.keys(TagType) as (keyof typeof TagType)[] },
        icon: { type: 'string', enum: Object.keys(Icon) as (keyof typeof Icon)[] },
    },
    required: ['label'],
} as const;
export type TagDoc = {
    label: string;
    link?: string;
    type?: keyof typeof TagType;
    icon?: keyof typeof Icon;
};
export type Tag = {
    label: string,
    link?: string,
    type?: TagType,
    icon?: Icon,
};

// ==============================================================================
// == Person ====================================================================
// ==============================================================================
const personSchemaLiteral = {
    title: 'person schema',
    description: 'describes a person (not necessarily a PNCEL member)',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 32 }, // actually a positive integer
        firstname: { type: 'string', maxLength: 50 },
        lastname: { type: 'string', maxLength: 50 },
        goby: { type: 'string' },
        middlename: { type: 'string' },
        headshot: { type: 'string' },
        externalLink: { type: 'string' },
        member: {
            type: 'object',
            properties: {
                role: {
                    type: 'string',
                    enum: Object.keys(MemberRole) as (keyof typeof MemberRole)[]
                },
                whenJoined: { type: 'string', format: 'date' },
                whenLeft: { type: 'string', format: 'date' },
                position: { type: 'string' },
                email: { type: 'string', format: 'email' },
                office: { type: 'string' },
                links: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            icon: { type: 'string', enum: Object.keys(Icon) as (keyof typeof Icon)[] },
                            link: { type: 'string' },
                        },
                        required: ['link'],
                    }
                },
                selectedPubIds: {
                    type: 'array',
                    items: { type: 'integer' },
                },
            },
            required: ['role', 'whenJoined']
        },
    },
    required: ['id', 'firstname', 'lastname'],
    indexes: ['firstname', 'lastname']
} as const;
const personSchemaTyped = toTypedRxJsonSchema(personSchemaLiteral);
export type PersonDoc = ExtractDocumentTypeFromTypedRxJsonSchema<typeof personSchemaTyped>;
export const personSchema: RxJsonSchema<PersonDoc> = personSchemaLiteral;

export type MemberDoc = NonNullable<PersonDoc['member']>;
export type Member = Omit<MemberDoc, 'role' | 'whenJoined' | 'whenLeft' | 'links'> & {
    role: MemberRole,
    whenJoined: Date,
    whenLeft?: Date,
    links?: {
        icon?: Icon,
        link: string,
    }[],
};
export type Person = Omit<PersonDoc, 'id' | 'member'> & { id: number, member?: Member };

// ==============================================================================
// == Member ====================================================================
// ==============================================================================
/*
const memberSchemaLiteral = {
    title: 'member schema',
    description: 'describes a PNCEL member',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        role: { enum: Object.keys(MemberRole) as (keyof typeof MemberRole)[] },
        personId: { type: 'integer' },
        whenJoined: { type: 'string', format: 'date' },
        whenLeft: { type: 'string', format: 'date' },
        position: { type: 'string' },
        email: { type: 'string', format: 'email' },
        office: { type: 'string' },
        links: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    icon: { enum: Object.keys(Icon) as (keyof typeof Icon)[] },
                    link: { type: 'string' },
                },
                required: ['link'],
            }
        },
        selectedPubIds: {
            type: 'array',
            items: { type: 'integer' },
        },
    },
    required: ['id', 'role', 'personId', 'whenJoined'],
} as const;
const memberSchemaTyped = toTypedRxJsonSchema(memberSchemaLiteral);
export type MemberDoc = ExtractDocumentTypeFromTypedRxJsonSchema<typeof memberSchemaTyped>;
export type Member = Omit<MemberDoc, 'role' | 'whenJoined' | 'whenLeft' | 'links'> & {
    role: MemberRole,
    whenJoined: Date,
    whenLeft?: Date,
    links?: {
        icon?: Icon,
        link: string,
    }[],
};
export const memberSchema: RxJsonSchema<MemberDoc> = memberSchemaLiteral;
*/

// ==============================================================================
// == Publication ===============================================================
// ==============================================================================
const publicationSchemaLiteral = {
    title: 'publication schema',
    description: 'describes a publication',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 }, // actually a positive number
        title: { type: 'string' },
        authorIds: {
            type: 'array',
            items: { type: 'integer' },
        },
        time: { type: 'string', format: 'date' },
        booktitle: { type: 'string' },
        doi: { type: 'string' },
        bibtex: { type: 'string' },
        arxivDoi: { type: 'string' },
        arxivBibtex: { type: 'string' },
        authorsCopy: { type: 'string' },
        equalContrib: { type: 'integer' },
        notPncel: { type: 'boolean' },
        tags: {
            type: 'array',
            items: tagSchemaLiteral,
        },
        attachments: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    label: { type: 'string' },
                    link: { type: 'string' },
                    icon: { type: 'string', enum: Object.keys(Icon) as (keyof typeof Icon)[] },
                },
                required: ['label', 'link'],
            },
        },
    },
    required: ['id', 'title', 'authorIds', 'time'],
} as const;
const publicationSchemaTyped = toTypedRxJsonSchema(publicationSchemaLiteral);
export type PublicationDoc = ExtractDocumentTypeFromTypedRxJsonSchema<typeof publicationSchemaTyped>;
export type Publication = Omit<PublicationDoc, 'id' | 'time' | 'tags' | 'attachments'> & {
    id: number,
    time: Date,
    tags?: Tag[],
    attachments?: {
        label: string,
        link: string,
        icon?: Icon,
    }[],
};
export const publicationSchema: RxJsonSchema<PublicationDoc> = publicationSchemaLiteral;

// ==============================================================================
// == Photo =====================================================================
// ==============================================================================
const photoSchemaLiteral = {
    title: 'photo schema',
    description: 'describes a photo',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        description: { type: 'string' },
        width: { type: 'integer' },
        height: { type: 'integer' },
        image: { type: 'string' },
        thumbnail: { type: 'string' },
        time: { type: 'string', format: 'date' },
    },
    required: ['id', 'title', 'height', 'width', 'image', 'time'],
} as const;
const photoSchemaTyped = toTypedRxJsonSchema(photoSchemaLiteral);
export type PhotoDoc = ExtractDocumentTypeFromTypedRxJsonSchema<typeof photoSchemaTyped>;
export type Photo = Omit<PhotoDoc, 'id' | 'time'> & {
    id: number,
    time: Date
};
export const photoSchema: RxJsonSchema<PhotoDoc> = photoSchemaLiteral;