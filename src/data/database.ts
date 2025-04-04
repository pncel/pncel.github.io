import Ajv, { ValidateFunction, JTDSchemaType } from "ajv/dist/jtd";
import {
  MemberRole,
  TagType,
  Tag,
  Person,
  Member,
  Publication,
  Database as DatabaseType,
  PubAttachment,
  LinkIcon,
} from "@/data/newtypes";
import { readFile } from "fs/promises";
import { DefinedError } from "ajv";
import { parse } from "yaml";

const ajv = new Ajv();

type MemberJsonType = Omit<Member, "role"> & { role: keyof typeof MemberRole };
type TagJsonType = Omit<Tag, "type"> & { type: keyof typeof TagType };
type PubAttachmentJsonType = Omit<PubAttachment, "icon"> & {
  icon?: keyof typeof LinkIcon;
};
type PublicationJsonType = Omit<Publication, "tags" | "attachments"> & {
  tags?: TagJsonType[];
  attachments?: PubAttachmentJsonType[];
};

const personSchema: JTDSchemaType<Person[]> = {
  elements: {
    properties: {
      id: { type: "int32" },
      firstname: { type: "string" },
      lastname: { type: "string" },
    },
    optionalProperties: {
      goby: { type: "string" },
      middlename: { type: "string" },
      headshot: { type: "string" },
      externalLink: { type: "string" },
      memberId: { type: "string" },
    },
    additionalProperties: false,
  },
};

const memberSchema: JTDSchemaType<MemberJsonType[]> = {
  elements: {
    properties: {
      id: { type: "string" },
      role: { enum: Object.keys(MemberRole) as (keyof typeof MemberRole)[] },
      personId: { type: "int32" },
      whenJoined: { type: "timestamp" },
    },
    optionalProperties: {
      whenLeft: { type: "timestamp" },
      position: { type: "string" },
      email: { type: "string" },
      office: { type: "string" },
      gscholar: { type: "string" },
      orcid: { type: "string" },
      github: { type: "string" },
      linkedin: { type: "string" },
      twitter: { type: "string" },
      facebook: { type: "string" },
      instagram: { type: "string" },
      youtube: { type: "string" },
      selectedPubIds: { elements: { type: "int32" } },
    },
    additionalProperties: false,
  },
};

const publicationSchema: JTDSchemaType<PublicationJsonType[]> = {
  elements: {
    properties: {
      id: { type: "int32" },
      title: { type: "string" },
      authorIds: { elements: { type: "int32" } }, // person ID
      time: { type: "timestamp" },
    },
    optionalProperties: {
      doi: { type: "string" },
      booktitle: { type: "string" },
      bibtex: { type: "string" },
      arxivDOI: { type: "string" },
      arxivBibtex: { type: "string" },
      authorsCopy: { type: "string" },
      equalContrib: { type: "int32" },
      notPncel: { type: "boolean" },
      tags: {
        elements: {
          properties: {
            type: { enum: Object.keys(MemberRole) as (keyof typeof TagType)[] },
            label: { type: "string" },
          },
        },
      },
      attachments: {
        elements: {
          properties: { label: { type: "string" }, link: { type: "string" } },
          optionalProperties: {
            icon: { enum: Object.keys(LinkIcon) as (keyof typeof LinkIcon)[] },
          },
        },
      },
    },
    additionalProperties: false,
  },
};

const validatePerson = ajv.compile(personSchema);
const validateMember = ajv.compile(memberSchema);
const validatePublication = ajv.compile(publicationSchema);

export default class Database extends Object {
  private static instance: Database;
  private data: DatabaseType = {
    persons: [],
    members: new Map<string, Member>(),
    publications: [],
  };
  private isClient: boolean = false;

  private static async loadJson<T, JT = T>(
    path: string,
    jsonValidator: ValidateFunction<JT[]>,
    postProcess: (data: JT) => T,
  ): Promise<T[]> {
    const jsonData = parse(await readFile(path, "utf-8"));
    if (!jsonValidator(jsonData)) {
      for (const err of jsonValidator.errors as DefinedError[]) {
        console.error(
          `${path}: ${err.keyword} | ${err.schemaPath} | ${err.instancePath} | ${err.message || ""}`,
        );
      }
      // TODO: more helpful error message
      await new Promise<void>((resolve) => {
        process.stderr.write("", () => resolve());
      });
      throw new Error(`Invalid JSON: ${path}`);
    }
    return jsonData.map(postProcess);
  }

  private constructor() {
    super();
  }

  public static async get(isClient: boolean = false): Promise<Database> {
    if (!Database.instance) {
      const instance = (Database.instance = new Database());
      instance.isClient = isClient;
      const databasePath = isClient
        ? "/database"
        : `${process.cwd()}/public/database`;

      // load databases in parallel
      const [personArray, memberArray, publicationArray] = await Promise.all([
        Database.loadJson<Person>(
          `${databasePath}/persons.yaml`,
          validatePerson,
          (person) => person,
        ),
        Database.loadJson<Member, MemberJsonType>(
          `${databasePath}/members.yaml`,
          validateMember,
          (member) => ({
            ...member,
            role: MemberRole[member.role],
            whenJoined: new Date(member.whenJoined),
            whenLeft: member.whenLeft && new Date(member.whenLeft),
          }),
        ),
        Database.loadJson<Publication, PublicationJsonType>(
          `${databasePath}/publications.yaml`,
          validatePublication,
          (publication) => ({
            ...publication,
            time: new Date(publication.time),
            tags: publication.tags?.map((tag) => ({
              ...tag,
              type: TagType[tag.type],
            })),
            attachments: publication.attachments?.map((attachment) => ({
              ...attachment,
              icon: LinkIcon[attachment.icon || "default"],
            })),
          }),
        ),
      ]);

      // construct id -> object map
      const persons = personArray.reduce((persons, person) => {
        if (persons[person.id] !== undefined) {
          throw new Error(`Duplicate person id: ${person.id}`);
        } else {
          persons[person.id] = person;
          return persons;
        }
      }, new Array<Person | undefined>(personArray.length));
      const members = new Map<string, Member>(
        memberArray.map((member) => [member.id, member]),
      );
      const publications = publicationArray.reduce(
        (publications, publication) => {
          if (publications[publication.id] !== undefined) {
            throw new Error(`Duplicate publication id: ${publication.id}`);
          } else {
            publications[publication.id] = publication;
            return publications;
          }
        },
        new Array<Publication | undefined>(publicationArray.length),
      );

      // cross-reference and duplicate ID check
      persons.forEach((person) => {
        if (person?.memberId !== undefined) {
          const member = members.get(person.memberId);
          if (!member) {
            throw new Error(
              `Member id: ${person.memberId} not found for person ${person.id}`,
            );
          } else if (member.personId !== person.id) {
            throw new Error(
              `Person ${person.id} has member id ${person.memberId} but member ${member.id} has person id ${member.personId}`,
            );
          }
        }
      });
      members.values().forEach((member) => {
        const person = persons[member.personId];
        if (!person) {
          throw new Error(
            `Person id: ${member.personId} not found for member ${member.id}`,
          );
        } else if (person.memberId !== member.id) {
          throw new Error(
            `Member ${member.id} has person id ${member.personId} but person ${person.id} has member id ${person.memberId}`,
          );
        }

        if (member.selectedPubIds) {
          if (
            new Set(member.selectedPubIds).size !== member.selectedPubIds.length
          ) {
            throw new Error(
              `Member ${member.id} has duplicate publication ids`,
            );
          }
          for (const pubId of member.selectedPubIds) {
            const publication = publications[pubId];
            if (!publication) {
              throw new Error(
                `Publication id: ${pubId} not found for member ${member.id}`,
              );
            } else if (!publication.authorIds.includes(member.personId)) {
              throw new Error(
                `Member ${member.id} has person id ${member.personId} but publication ${publication.id} does not include this person as author`,
              );
            }
          }
        }
      });
      publications.forEach((publication) => {
        if (publication?.authorIds) {
          if (
            new Set(publication.authorIds).size !== publication.authorIds.length
          ) {
            throw new Error(
              `Publication ${publication.id} has duplicate author ids`,
            );
          }
          for (const authorId of publication.authorIds) {
            const person = persons[authorId];
            if (!person) {
              throw new Error(
                `Author id: ${authorId} not found for publication ${publication.id}`,
              );
            }
          }
        }
      });

      instance.data = { persons, members, publications };
    } else if (Database.instance.isClient !== isClient) {
      throw new Error(
        `Database instance already created with isClient = ${Database.instance.isClient}. Cannot create another instance with isClient = ${isClient}`,
      );
    }
    return Database.instance;
  }

  public getManyMembers(memberIds?: string[]): Member[] {
    if (!memberIds) {
      return Array.from(this.data.members.values());
    } else {
      const members = memberIds.map((memberId) => {
        const member = this.data.members.get(memberId);
        if (!member) {
          throw new Error(`Member ${memberId} not found`);
        }
        return member;
      });
      return members;
    }
  }

  public getMember(memberId: string): Member {
    const member = this.data.members.get(memberId);
    if (!member) {
      throw new Error(`Member ${memberId} not found`);
    }
    return member;
  }

  public getManyPersons(personIds?: number[]): Person[] {
    if (!personIds) {
      return this.data.persons.filter(
        (person) => person !== undefined,
      ) as Person[];
    } else {
      const persons = personIds.map((personId) => {
        const person = this.data.persons[personId];
        if (!person) {
          throw new Error(`Person ${personId} not found`);
        }
        return person;
      });
      return persons;
    }
  }

  public getPerson(personId: number): Person {
    const person = this.data.persons[personId];
    if (!person) {
      throw new Error(`Person ${personId} not found`);
    }
    return person;
  }

  public getManyPublications(publicationIds?: number[]): Publication[] {
    if (!publicationIds) {
      return this.data.publications.filter(
        (publication) => publication !== undefined,
      ) as Publication[];
    } else {
      const publications = publicationIds.map((publicationId) => {
        const publication = this.data.publications[publicationId];
        if (!publication) {
          throw new Error(`Publication ${publicationId} not found`);
        }
        return publication;
      });
      return publications;
    }
  }

  public getPublication(publicationId: number): Publication {
    const publication = this.data.publications[publicationId];
    if (!publication) {
      throw new Error(`Publication ${publicationId} not found`);
    }
    return publication;
  }
}
