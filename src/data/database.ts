import Ajv, { ValidateFunction, JTDSchemaType } from "ajv/dist/jtd.js";
import addFormats from "ajv-formats";
import {
  MemberRole,
  TagType,
  Tag,
  Person,
  Member,
  Publication,
  PubAttachment,
  Icon,
  Photo,
} from "./types.js";
import { readFile, writeFile } from "fs/promises";
import { DefinedError } from "ajv";
import { parse, stringify } from "yaml";
import { createHash, Hash } from "crypto";

const ajv = new Ajv();
addFormats(ajv);

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
  persons: string,
  members: string,
  publications: string,
  photos: string,
};

export enum DatabaseState {
  init,     // db not loaded
  clean,    // consistent, and up to date with the files
  error,    // db has errors besides md5 mismatch
  dirty,    // in-memory db is consistent but out of sync with the files
};

export enum DatabaseMode {
  normal,       // normal mode
  diagnostic,   // diagnostic -- errors are reported, not throwned
  editting,     // editting -- errors lead to abortion of edit
};

const personArrayJSONSchema: JTDSchemaType<Person[]> = {
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
} as JTDSchemaType<Person[]>;

const memberArrayJSONSchema: JTDSchemaType<MemberJsonType[]> = {
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
} as JTDSchemaType<MemberJsonType[]>;

const publicationArrayJSONSchema: JTDSchemaType<PublicationJsonType[]> = {
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
} as JTDSchemaType<PublicationJsonType[]>;

const photoArrayJSONSchema: JTDSchemaType<Photo[]> = {
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
} as JTDSchemaType<Photo[]>;

const md5JSONSchema: JTDSchemaType<MD5JsonType> = {
  properties: {
    persons: { type: "string" },
    members: { type: "string" },
    publications: { type: "string" },
    photos: { type: "string" },
  },
} as JTDSchemaType<MD5JsonType>;

const validateJSONPersonArray = ajv.compile(personArrayJSONSchema) as ValidateFunction<Person[]>;
const validateJSONMemberArray = ajv.compile(memberArrayJSONSchema) as ValidateFunction<MemberJsonType[]>;
const validateJSONPublicationArray = ajv.compile(publicationArrayJSONSchema) as ValidateFunction<PublicationJsonType[]>;
const validateJSONPhotoArray = ajv.compile(photoArrayJSONSchema) as ValidateFunction<Photo[]>;
const validateJSONMD5 = ajv.compile(md5JSONSchema) as ValidateFunction<MD5JsonType>;

function identity<T>(t: T): T {
    return t;
}

const personToJSON = identity<Person>;
const JSONToPerson = identity<Person>;
const photoToJSON = identity<Photo>;

function memberToJSON(member: Member): MemberJsonType {
    return {
        ...member,
        role: stringify(member.role) as keyof typeof MemberRole,
    }
}

function JSONToMember(member: MemberJsonType): Member {
    return {
        ...member,
        role: MemberRole[member.role],
        whenJoined: new Date(member.whenJoined),
        whenLeft: member.whenLeft && new Date(member.whenLeft),
    }
}

function publicationToJSON(pub: Publication): PublicationJsonType {
    return {
        ...pub,
        tags: pub.tags?.map(tag => ({
            ...tag,
            type: stringify(tag.type) as keyof typeof TagType,
            icon: stringify(tag.icon || "default") as keyof typeof Icon,
        })),
        attachments: pub.attachments?.map(attachment => ({
            ...attachment,
            icon: stringify(attachment.icon || "default") as keyof typeof Icon,
        }))
    }
}

function JSONToPublication(pub: PublicationJsonType): Publication {
    return {
        ...pub,
        time: new Date(pub.time),
        tags: pub.tags?.map((tag) => ({
            ...tag,
            type: TagType[tag.type],
            icon: Icon[tag.icon || "default"],
        })),
        attachments: pub.attachments?.map((attachment) => ({
            ...attachment,
            icon: Icon[attachment.icon || "default"],
        })),
    }
}

function JSONToPhoto(photo: Photo): Photo {
    return {
        ...photo,
        time: new Date(photo.time)
    };
}

async function validate<T>(
  jsonValidator: ValidateFunction<T>,
  data: any,
  prefix: string = "",
): Promise<boolean> {
  if (!jsonValidator(data)) {
    for (const err of jsonValidator.errors as DefinedError[]) {
      console.error(
        `[Error] ${prefix}${err.keyword} | ${err.schemaPath} | ${err.instancePath} | ${err.message || ""}`,
      );
    }
    await new Promise<void>(resolve => {
        process.stderr.write("", () => resolve());
    })
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
  private static instance: Promise<Database>;
  private mode: DatabaseMode = DatabaseMode.normal;
  private state: DatabaseState = DatabaseState.init;
  private data: Readonly<{
    persons?: (Person | undefined)[],
    members?: Map<string, Member>,
    publications?: (Publication | undefined)[],
    photos?: Photo[],
  }> = {};

  private constructor() {
    super();
  }

  private error(msg: string) {
    switch (this.mode) {
        case DatabaseMode.normal:
        case DatabaseMode.editting:
            throw new Error(msg);
        case DatabaseMode.diagnostic:
            console.error(`[Error] ${msg}`);
            this.state = DatabaseState.error;
            break;
    }
  }

  private async loadJson<T, JT = T>(
    path: string,
    jsonValidator: ValidateFunction<JT[]>,
    postProcess: (data: JT) => T,
    md5: string,
  ): Promise<T[]> {
    const raw = await readFile(path, "utf-8");
    if (this.mode === DatabaseMode.normal || md5 !== "") {
      const raw_md5 = hash(raw);
      if (raw_md5 !== md5) {
        const prevState = this.state;
          this.error(
            `md5 checksum mismatch for ${path}: computed = ${raw_md5}; in-database = ${md5}`,
          );
          if (prevState != DatabaseState.error) {
            this.state = DatabaseState.dirty;
          }
      }
    }
    const jsonData = parse(raw);
    if (!(await validate<JT[]>(jsonValidator, jsonData, `${path}: `))) {
        this.error(`Invalid JSON: ${path}`);
        return [];
    } else {
      return jsonData.map(postProcess);
    }
  }

  private validatePerson(person: Person, members: Map<string, Member> | undefined = undefined) {
    const members_ = members || this.data.members;
    // XXX: if this.data.members is 'undefined', members.yaml did not pass schema check
    if (members_ && person.memberId !== undefined) {
      const member = members_.get(person.memberId);
      if (!member) {
        this.error(
          `Member id: ${person.memberId} not found for person ${person.id}`,
        );
        return false;
      } else if (member.personId !== person.id) {
        this.error(
          `Person ${person.id} has member id ${person.memberId} but member ${member.id} has person id ${member.personId}`,
        );
      }
    }
  }

  private validateMember(member: Member, is_creating_member: boolean = false, persons: Person[] | undefined = undefined, publications: Publication[] | undefined = undefined) {
    const persons_ = persons || this.data.persons;
    const publications_ = publications || this.data.publications;
    // XXX: if this.data.persons is 'undefined', persons.yaml did not pass schema check
    // XXX: if this.data.publications is 'undefined', publications.yaml did not pass schema check
    if (is_creating_member || persons_) {
      const person = persons_ && persons_[member.personId];
      if (!person) {
        this.error(
          `Person id: ${member.personId} not found for member ${member.id}`,
        );
      } else if (is_creating_member) {
          if (person.memberId !== undefined) {
            this.error(`Person with id=${member.personId} is already linked with member with id=${person?.memberId}`);
          }
      } else if (person.memberId !== member.id) {
        this.error(
          `Member ${member.id} has person id ${member.personId} but person ${person.id} has member id ${person.memberId}`,
        );
      }
    }

    if (member.selectedPubIds) {
      if (
        new Set(member.selectedPubIds).size !==
        member.selectedPubIds.length
      ) {
        this.error(
          `Member ${member.id} has duplicate publication ids`,
        );
      }
      if (publications_) {
      for (const pubId of member.selectedPubIds) {
        const publication = publications_[pubId];
        if (!publication) {
          this.error(
            `Publication id: ${pubId} not found for member ${member.id}`,
          );
        } else if (!publication.authorIds.includes(member.personId)) {
          this.error(
            `Member ${member.id} has person id ${member.personId} but publication ${publication.id} does not include this person as author`,
          );
        }
      }
      }
    }
  }

  private validatePublication(pub: Publication, persons: Person[] | undefined = undefined) {
    const persons_ = persons || this.data.persons;
    if (pub.authorIds) {
      if (
        new Set(pub.authorIds).size !==
        pub.authorIds.length
      ) {
        this.error(
          `Publication ${pub.id} has duplicate author ids`,
        );
      }
      if (persons_) {
        for (const authorId of pub.authorIds) {
          const person = persons_[authorId];
          if (!person) {
            this.error(
              `Author id: ${authorId} not found for publication ${pub.id}`,
            );
          }
        }
      }
    }
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
        let md5: MD5JsonType = { persons: "", members: "", publications: "", photos: "" };
        if (!(await validate<MD5JsonType>(validateJSONMD5, md5_raw, `${md5_path}: `))) {
            instance.error(`Invalid MD5 JSON: ${md5_path}`);
        } else {
            md5 = md5_raw as MD5JsonType;
        }

        // load databases in parallel
        const [personArray, memberArray, publicationArray, photos] =
          await Promise.all([
            instance.loadJson<Person>(
              `${databasePath}/persons.yaml`,
              validateJSONPersonArray,
              JSONToPerson,
              md5.persons,
            ),
            instance.loadJson<Member, MemberJsonType>(
              `${databasePath}/members.yaml`,
              validateJSONMemberArray,
              JSONToMember,
              md5.members,
            ),
            instance.loadJson<Publication, PublicationJsonType>(
              `${databasePath}/publications.yaml`,
              validateJSONPublicationArray,
              JSONToPublication,
              md5.publications,
            ),
            instance.loadJson<Photo, Photo>(
              `${databasePath}/photos.yaml`,
              validateJSONPhotoArray,
              JSONToPhoto,
              md5.photos,
            ),
          ]);

        // construct id -> object map
        const persons = personArray.reduce((persons, person) => {
          if (persons[person.id] !== undefined) {
            instance.error(`Duplicate person id: ${person.id}. Dropping ${person}`);
          } else {
            persons[person.id] = person;
          }
          return persons;
        }, new Array<Person | undefined>(personArray.length));
        const members = new Map<string, Member>(
          memberArray.map((member) => [member.id, member]),
        );
        const publications = publicationArray.reduce(
          (publications, publication) => {
            if (publications[publication.id] !== undefined) {
              instance.error(`Duplicate publication id: ${publication.id}`);
            } else {
              publications[publication.id] = publication;
            }
            return publications;
          },
          new Array<Publication | undefined>(publicationArray.length),
        );

        // cross-reference and duplicate ID check
        persons.forEach((person) => person && instance.validatePerson(person, members));
        Array.from(members.values()).forEach((member) => {
          const person = persons[member.personId];
          if (!person) {
            instance.error(
              `Person id: ${member.personId} not found for member ${member.id}`,
            );
          } else if (person.memberId !== member.id) {
            instance.error(
              `Member ${member.id} has person id ${member.personId} but person ${person.id} has member id ${person.memberId}`,
            );
          }

          if (member.selectedPubIds) {
            if (
              new Set(member.selectedPubIds).size !==
              member.selectedPubIds.length
            ) {
              instance.error(
                `Member ${member.id} has duplicate publication ids`,
              );
            }
            for (const pubId of member.selectedPubIds) {
              const publication = publications[pubId];
              if (!publication) {
                instance.error(
                  `Publication id: ${pubId} not found for member ${member.id}`,
                );
              } else if (!publication.authorIds.includes(member.personId)) {
                instance.error(
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
              instance.error(
                `Publication ${publication.id} has duplicate author ids`,
              );
            }
            for (const authorId of publication.authorIds) {
              const person = persons[authorId];
              if (!person) {
                instance.error(
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

  // ------------------------------------------------------------------------
  // -- CRUD: Read Operations -----------------------------------------------
  // ------------------------------------------------------------------------
  public getManyMembers(memberIds?: string[]): Member[] {
    if (!memberIds) {
      return Array.from(this.data.members?.values() || []);
    } else {
      return memberIds.map(id => this.getMember(id));
    }
  }

  public getMember(memberId: string): Member {
    const member = this.data.members?.get(memberId);
    if (!member) {
      throw new Error(`Member ${memberId} not found`);
    }
    return member;
  }

  public getManyPersons(personIds?: number[]): Person[] {
    if (!personIds) {
      return this.data.persons?.filter(
        (person) => person !== undefined,
      ) as Person[];
    } else {
      return personIds.map(id => this.getPerson(id));
    }
  }

  public getPerson(personId: number): Person {
    const person = this.data.persons?.at(personId);
    if (!person) {
      throw new Error(`Person ${personId} not found`);
    }
    return person;
  }

  public getManyPublications(publicationIds?: number[]): Publication[] {
    if (!publicationIds) {
      return this.data.publications?.filter(
        (publication) => publication !== undefined,
      ) as Publication[];
    } else {
      return publicationIds.map(id => this.getPublication(id));
    }
  }

  public getPublication(publicationId: number): Publication {
    const publication = this.data.publications?.at(publicationId);
    if (!publication) {
      throw new Error(`Publication ${publicationId} not found`);
    }
    return publication;
  }

  public getAllPublicationsByPerson(personId: number): Publication[] {
    return this.data.publications?.filter(
      (p) => p && p?.authorIds.includes(personId),
    ) as Publication[];
  }

  public getAllPhotos(): Photo[] {
    return this.data.photos || [];
  }

  // ------------------------------------------------------------------------
  // -- CRUD: Create Operations ---------------------------------------------
  // ------------------------------------------------------------------------
  /*
  public async createPerson(person: Omit<Person, "id" | "memberId"> & {id?: number}): Promise<Person> {
    // create new id if not specified
    if (!person.id) {
        const idx = this.data.persons?.findIndex((p, i) => p === undefined && i > 0);
        if (idx === -1) {
            person.id = this.data.persons?.length;
        } else {
            person.id = idx;
        }
    } else {
        // check id conflict with specific ID
        if (this.data.persons?[person.id] !== undefined) {
            throw new Error(`ID conflict: ${person.id}. Abandoning creating a new person`);
        }
    }

    // validate
    const personWithID = person as Person;
    if (!(await validate<Person[]>(validateJSONPersonArray, [personToJSON(personWithID)]))) {
        throw new Error(`Invalid person data. Abandoning creating a new person`);
    }

    this.data.persons[person.id] = personWithID;
    return personWithID;
  }

  public async createMember(member: Member): Promise<Member> {
    // NOTE: this must be called after the corresponding person has been created
    // validate
    if (!(await validate<MemberJsonType[]>(validateJSONMemberArray, [memberToJSON(member)]))) {
        throw new Error(`Invalid member data. Abandoning creating a new member`);
    }

    // check person
    const person = this.data.persons[member.personId];
    if (person === undefined) {
        throw new Error(`Person with id=${member.personId} not found. Abandoning creating a new member`);
    } else if (person.memberId != undefined) {
        throw new Error(`Person with id=${member.personId} is already linked with member with id=${person?.memberId}. Abandoning creating a new member`);
    }

    // check selectedPubIds
    if (member.selectedPubIds) {
        for (const pubId of member.selectedPubIds) {
            const pub = this.data.publications[pubId];
            if (pub === undefined) {
                throw new Error(`Selected pub ID=${pubId} not found. Abandoning creating a new member`);
            } else if (!pub.authorIds.includes(member.personId)) {
                throw new Error(`Selected pub ID=${pubId} does not have an author with person ID=${member.personId}. Abandoning creating a new member`)
            }
        }
    }

    person.memberId = member.id;
    this.data.members.set(member.id, member);
    return member;
  }

  public async createPublication(pub: Omit<Publication, "id"> & {id?: number}): Promise<Publication> {
    // create new id if not specified
    if (!pub.id) {
        const idx = this.data.publications.findIndex((p, i) => p === undefined && i > 0);
        if (idx === -1) {
            pub.id = this.data.publications.length;
        } else {
            pub.id = idx;
        }
    } else {
        // check id conflict with specific ID
        if (this.data.publications[pub.id] !== undefined) {
            throw new Error(`ID conflict: ${pub.id}. Abandoning creating a new publication`);
        }
    }

    // validate
    const pubWithID = pub as Publication;
    if (!(await validate<PublicationJsonType[]>(validateJSONPublicationArray, [publicationToJSON(pubWithID)]))) {
        throw new Error(`Invalid publication data. Abandoning creating a new person`);
    }

    // check authors
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
    */
}
