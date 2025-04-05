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
  Icon,
  Photo,
} from "@/data/types";
import { readFile, writeFile } from "fs/promises";
import { DefinedError } from "ajv";
import { parse, stringify } from "yaml";
import { createHash, Hash } from "crypto";

const ajv = new Ajv();

type MemberJsonType = Omit<Member, "role"> & { role: keyof typeof MemberRole };
type TagJsonType = Omit<Tag, "type" | "icon"> & {
  type: keyof typeof TagType;
  icon?: keyof typeof Icon;
};
type PubAttachmentJsonType = Omit<PubAttachment, "icon"> & {
  icon?: keyof typeof Icon;
};
type PublicationJsonType = Omit<Publication, "tags" | "attachments"> & {
  tags?: TagJsonType[];
  attachments?: PubAttachmentJsonType[];
};
type MD5JsonType = {
  [K in keyof DatabaseType]: string;
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
            type: { enum: Object.keys(TagType) as (keyof typeof TagType)[] },
            label: { type: "string" },
          },
          optionalProperties: {
            icon: { enum: Object.keys(Icon) as (keyof typeof Icon)[] },
          },
        },
      },
      attachments: {
        elements: {
          properties: { label: { type: "string" }, link: { type: "string" } },
          optionalProperties: {
            icon: { enum: Object.keys(Icon) as (keyof typeof Icon)[] },
          },
        },
      },
    },
    additionalProperties: false,
  },
};

const photoSchema: JTDSchemaType<Photo[]> = {
  elements: {
    properties: {
      title: { type: "string" },
      width: { type: "int32" },
      height: { type: "int32" },
      image: { type: "string" },
      time: { type: "timestamp" },
    },
    optionalProperties: {
      subtitle: { type: "string" },
      thumbnail: { type: "string" },
    },
  },
};

const md5Schema: JTDSchemaType<MD5JsonType> = {
  properties: {
    persons: { type: "string" },
    members: { type: "string" },
    publications: { type: "string" },
    photos: { type: "string" },
  },
};

const validatePerson = ajv.compile(personSchema);
const validateMember = ajv.compile(memberSchema);
const validatePublication = ajv.compile(publicationSchema);
const validatePhoto = ajv.compile(photoSchema);
const validateMD5 = ajv.compile(md5Schema);

async function validate<T>(
  path: string,
  jsonValidator: ValidateFunction<T>,
  data: any,
): Promise<boolean> {
  if (!jsonValidator(data)) {
    for (const err of jsonValidator.errors as DefinedError[]) {
      console.error(
        `${path}: ${err.keyword} | ${err.schemaPath} | ${err.instancePath} | ${err.message || ""}`,
      );
    }
    await new Promise<void>((resolve) => {
      process.stderr.write("", () => resolve());
    });
    return false;
  } else {
    return true;
  }
}

function hash(value: string): string {
  const hash: Hash = createHash("md5");
  hash.update(value);
  return hash.digest("hex");
}

export default class Database extends Object {
  public static warn_on_md5_mismatch: boolean = false;

  private static instance: Promise<Database>;
  private data: DatabaseType = {
    persons: [],
    members: new Map<string, Member>(),
    publications: [],
    photos: [],
  };

  private constructor() {
    super();
  }

  private static async loadJson<T, JT = T>(
    path: string,
    jsonValidator: ValidateFunction<JT[]>,
    postProcess: (data: JT) => T,
    md5: string,
  ): Promise<T[]> {
    const raw = await readFile(path, "utf-8");
    const raw_md5 = hash(raw);
    if (raw_md5 !== md5) {
      if (Database.warn_on_md5_mismatch) {
        console.error(
          `md5 checksum mismatch for ${path}: computed = ${raw_md5}; in-database = ${md5}`,
        );
      } else {
        throw new Error(
          `md5 checksum mismatch for ${path}: computed = ${raw_md5}; in-database = ${md5}`,
        );
      }
    }
    const jsonData = parse(await readFile(path, "utf-8"));
    if (!(await validate<JT[]>(path, jsonValidator, jsonData))) {
      throw new Error(`Invalid JSON: ${path}`);
    }
    return jsonData.map(postProcess);
  }

  public static async get(): Promise<Database> {
    if (!Database.instance) {
      Database.instance = new Promise(async (resolve) => {
        const instance = new Database();
        // const databasePath = isClient ? "/database" : `${process.cwd()}/public/database`;
        const databasePath = `${process.cwd()}/public/database`;

        // load checksum
        const md5_path = `${databasePath}/md5.yaml`;
        const md5_raw = parse(await readFile(md5_path, "utf-8"));
        if (!(await validate(md5_path, validateMD5, md5_raw))) {
          throw new Error(`Invalid md5.yaml`);
        }
        const md5 = md5_raw as MD5JsonType;

        // load databases in parallel
        const [personArray, memberArray, publicationArray, photos] =
          await Promise.all([
            Database.loadJson<Person>(
              `${databasePath}/persons.yaml`,
              validatePerson,
              (person) => person,
              md5.persons,
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
              md5.members,
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
                  icon: Icon[tag.icon || "default"],
                })),
                attachments: publication.attachments?.map((attachment) => ({
                  ...attachment,
                  icon: Icon[attachment.icon || "default"],
                })),
              }),
              md5.publications,
            ),
            Database.loadJson<Photo>(
              `${databasePath}/photos.yaml`,
              validatePhoto,
              (photo) => ({ ...photo, time: new Date(photo.time) }),
              md5.photos,
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
        Array.from(members.values()).forEach((member) => {
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
              new Set(member.selectedPubIds).size !==
              member.selectedPubIds.length
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
              new Set(publication.authorIds).size !==
              publication.authorIds.length
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

        instance.data = { persons, members, publications, photos };
        resolve(instance);
      });
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

  public getAllPublicationsByPerson(personId: number): Publication[] {
    return this.data.publications.filter(
      (p) => p && p?.authorIds.includes(personId),
    ) as Publication[];
  }

  public getAllPhotos(): Photo[] {
    return this.data.photos;
  }

  public async updateDatabase() {
    const databasePath = `${process.cwd()}/public/database`;

    const [persons, members, publications, photos] = await Promise.all([
      new Promise<string>((resolve) => {
        const persons = stringify(
          this.data.persons.filter((p) => p !== undefined),
        );
        writeFile(`${databasePath}/persons.yaml`, persons).then(() =>
          resolve(hash(persons)),
        );
      }),
      new Promise<string>((resolve) => {
        const members = stringify(Array.from(this.data.members.values()));
        writeFile(`${databasePath}/members.yaml`, members).then(() =>
          resolve(hash(members)),
        );
      }),
      new Promise<string>((resolve) => {
        const publications = stringify(
          this.data.publications.filter((p) => p !== undefined),
        );
        writeFile(`${databasePath}/publications.yaml`, publications).then(() =>
          resolve(hash(publications)),
        );
      }),
      new Promise<string>((resolve) => {
        const photos = stringify(this.data.photos);
        writeFile(`${databasePath}/photos.yaml`, publications).then(() =>
          resolve(hash(photos)),
        );
      }),
    ]);

    let md5: MD5JsonType = { persons, members, publications, photos };
    await writeFile(`${databasePath}/md5.yaml`, stringify(md5));
  }
}
