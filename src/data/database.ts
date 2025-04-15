import {
  createRxDatabase,
  RxDatabase as _RxDatabase,
  RxCollection,
  RxDocument,
  addRxPlugin,
} from "rxdb";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { wrappedValidateAjvStorage, getAjv } from "rxdb/plugins/validate-ajv";
import { RxDBJsonDumpPlugin } from "rxdb/plugins/json-dump";
import { RxDBDevModePlugin, disableWarnings } from "rxdb/plugins/dev-mode";
import { readFile, writeFile } from "fs/promises";
import { parse, stringify } from "yaml";
import addFormats from "ajv-formats";
import {
  TagType,
  MemberRole,
  Icon,
  Tag,
  PersonJson,
  Person,
  personSchema,
  Member,
  PublicationJson,
  Publication,
  publicationSchema,
  PhotoJson,
  Photo,
  photoSchema,
  TagJson,
} from "./types";

disableWarnings();
addRxPlugin(RxDBJsonDumpPlugin);
addRxPlugin(RxDBDevModePlugin);
addFormats(getAjv());

export type RxDatabase = _RxDatabase<
  Readonly<{
    persons: RxCollection<PersonJson>;
    publications: RxCollection<PublicationJson>;
    photos: RxCollection<PhotoJson>;
  }>
>;

// ==============================================================================
// == Encoder/Decoders ==========================================================
// ==============================================================================
export function encodeEnum<E extends Record<string, string | number>>(
  ET: E,
  v: E[keyof E] | undefined,
): keyof E | undefined {
  if (v === undefined) {
    return undefined;
  } else {
    return Object.keys(ET).find((k) => ET[k] === v) as keyof E | undefined;
  }
}

export function decodeEnum<E extends Record<string, string | number>>(
  ET: E,
  v: string | undefined,
): E[keyof E] | undefined {
  if (Object.keys(ET).find((k) => k === v)) {
    return ET[v as keyof E];
  } else {
    return undefined;
  }
}

export function encodeDate(d: Date | undefined): string | undefined {
  if (d === undefined) {
    return undefined;
  } else {
    const offset = d.getTimezoneOffset();
    const dd = new Date(d.getTime() - offset * 60 * 1000);
    return dd.toISOString().split("T")[0];
  }
}

export function encodeTag(t: Tag): TagJson {
  return {
    ...t,
    type: encodeEnum(TagType, t.type)!,
    icon: encodeEnum(Icon, t.icon),
  };
}

export function decodeTag(t: TagJson): Tag {
  return {
    ...t,
    type: decodeEnum(TagType, t.type)!,
    icon: decodeEnum(Icon, t.icon),
  };
}

export function encodePerson(p: Person): PersonJson {
  const m = p.memberInfo;
  return {
    ...p,
    memberInfo:
      m === undefined
        ? undefined
        : {
            ...m,
            role: encodeEnum(MemberRole, m.role)!,
            whenJoined: encodeDate(m.whenJoined)!,
            whenLeft: encodeDate(m.whenLeft),
            links: m.links?.map((l) => ({
              ...l,
              icon: encodeEnum(Icon, l.icon),
            })),
          },
  };
}

export function decodePerson(doc: RxDocument<PersonJson>): Person {
  const d = doc.toJSON() as PersonJson;
  const m = d.memberInfo;
  return {
    ...d,
    memberInfo:
      m === undefined
        ? undefined
        : {
            ...m,
            role: decodeEnum(MemberRole, m.role)!,
            whenJoined: new Date(m.whenJoined),
            whenLeft:
              m.whenLeft === undefined ? undefined : new Date(m.whenLeft),
            links: m.links?.map((l) => ({
              ...l,
              icon: decodeEnum(Icon, l.icon),
            })),
          },
  };
}

export function encodePublication(p: Publication): PublicationJson {
  return {
    ...p,
    time: encodeDate(p.time)!,
    tags: p.tags?.map(encodeTag),
    attachments: p.attachments?.map((a) => ({
      ...a,
      icon: encodeEnum(Icon, a.icon),
    })),
  };
}

export function decodePublication(
  doc: RxDocument<PublicationJson>,
): Publication {
  const p = doc.toJSON() as PublicationJson;
  return {
    ...p,
    time: new Date(p.time),
    tags: p.tags?.map(decodeTag),
    attachments: p.attachments?.map((a) => ({
      ...a,
      icon: decodeEnum(Icon, a.icon),
    })),
  };
}

export function encodePhoto(p: Photo): PhotoJson {
  return {
    ...p,
    time: encodeDate(p.time)!,
  };
}

export function decodePhoto(doc: RxDocument<PhotoJson>): Photo {
  const p = doc.toJSON() as PhotoJson;
  return {
    ...p,
    time: new Date(p.time),
  };
}

// ==============================================================================
// == Database Class ============================================================
// ==============================================================================
export class Database extends Object {
  private static instance: Promise<Database>; // singleton instance
  private _db: RxDatabase;

  // --------------------------------------------------------------------------
  // -- Core Utilities --------------------------------------------------------
  // --------------------------------------------------------------------------

  private constructor(db: RxDatabase) {
    super();
    this._db = db;
  }

  public get db(): RxDatabase {
    return this._db;
  }

  public static async get(): Promise<Database> {
    if (!Database.instance) {
      Database.instance = new Promise(async (resolve, reject) => {
        try {
          // create singleton
          const instance = new Database(
            await createRxDatabase<RxDatabase>({
              name: "db",
              storage: wrappedValidateAjvStorage({
                storage: getRxStorageMemory(),
              }),
            })
              .then(async (db) => {
                await db.addCollections({
                  persons: { schema: personSchema },
                  publications: { schema: publicationSchema },
                  photos: { schema: photoSchema },
                });
                return db;
              })
              .then(async (db) => {
                const pReadPersons = readFile(
                  `${process.cwd()}/public/database/persons.yaml`,
                  "utf-8",
                )
                  .then((raw) => parse(raw))
                  .then((data) => {
                    db.persons.importJSON(data);
                  });

                const pReadPublications = readFile(
                  `${process.cwd()}/public/database/pubs.yaml`,
                  "utf-8",
                )
                  .then((raw) => parse(raw))
                  .then((data) => {
                    db.publications.importJSON(data);
                  });

                const pReadPhotos = readFile(
                  `${process.cwd()}/public/database/photos.yaml`,
                  "utf-8",
                )
                  .then((raw) => parse(raw))
                  .then((data) => {
                    db.photos.importJSON(data);
                  });

                await Promise.all([
                  pReadPersons,
                  pReadPublications,
                  pReadPhotos,
                ]);
                return db;
              }),
          );

          // validation: gather all errors
          const errors: any[] = [];

          // 1. validate all persons
          const pValidateAllPersons = instance.db.persons
            .find()
            .exec()
            .then((persons) => persons.map(decodePerson))
            .then((persons) => persons.map(instance.validatePerson))
            .then((lple) =>
              Promise.allSettled(
                lple.map((ple) =>
                  ple.then((le) => {
                    errors.push(...le);
                  }),
                ),
              ),
            );

          // 2. validate all publications
          const pValidateAllPublications = instance.db.publications
            .find()
            .exec()
            .then((pubs) => pubs.map(decodePublication))
            .then((pubs) => pubs.map(instance.validatePublication))
            .then((lple) =>
              Promise.allSettled(
                lple.map((ple) =>
                  ple.then((le) => {
                    errors.push(...le);
                  }),
                ),
              ),
            );

          // await 1 & 2
          await Promise.allSettled([
            pValidateAllPersons,
            pValidateAllPublications,
          ]);

          if (errors.length > 0) {
            throw new Error("[FATAL] Database corrupted. Cannot recover");
          }

          resolve(instance);
        } catch (e) {
          reject(e);
        }
      });
    }
    return Database.instance;
  }

  public async persist() {
    const personsJson = await this.db.persons.exportJSON();
    await writeFile(
      `${process.cwd()}/public/database/persons.yaml`,
      stringify(personsJson),
    );

    const pubsJson = await this.db.publications.exportJSON();
    await writeFile(
      `${process.cwd()}/public/database/pubs.yaml`,
      stringify(pubsJson),
    );

    const photosJson = await this.db.photos.exportJSON();
    await writeFile(
      `${process.cwd()}/public/database/photos.yaml`,
      stringify(photosJson),
    );
  }

  // --------------------------------------------------------------------------
  // -- Validators ------------------------------------------------------------
  // --------------------------------------------------------------------------

  private async validatePerson(person: Person): Promise<any[]> {
    let errors = [];
    const selectedPubIds = person.memberInfo?.selectedPubIds;
    if (selectedPubIds) {
      const uniquePubIds = Array.from(new Set(selectedPubIds));
      if (uniquePubIds.length !== selectedPubIds.length) {
        errors.push(
          `Member id=${person.id} has duplicate entries in selectedPubIds`,
        );
      }

      await Promise.allSettled(
        uniquePubIds.map((pubId) =>
          this.db.publications
            .findOne({ selector: { id: { $eq: pubId } } })
            .exec()
            .then((pub) => {
              if (pub === null) {
                errors.push(
                  `Publication id=${pubId} not found (selected by member id=${person.id})`,
                );
              } else if (!pub.authorIds.includes(person.id)) {
                errors.push(
                  `Publication id=${pubId} does not include member id=${person.id} as author by is selected by that member`,
                );
              }
            }),
        ),
      );
    }
    return errors;
  }

  private async validatePublication(pub: Publication): Promise<any[]> {
    let errors = [];
    const uniqueAuthorIds = Array.from(new Set(pub.authorIds));
    if (uniqueAuthorIds.length !== pub.authorIds.length) {
      errors.push(
        `Publication id=${pub.id} has duplicate entries in authorIds`,
      );
    }

    await Promise.allSettled(
      uniqueAuthorIds.map((id) =>
        this.db.persons
          .findOne({ selector: { id: { $eq: id } } })
          .exec()
          .then((person) => {
            if (person === null) {
              errors.push(
                `Person id=${id} not found (listed as author by publication id=${pub.id})`,
              );
            }
          }),
      ),
    );
    return errors;
  }

  // --------------------------------------------------------------------------
  // -- Read ------------------------------------------------------------------
  // --------------------------------------------------------------------------
  public async getManyMembers(personIds?: string[]): Promise<Member[]> {
    if (!personIds) {
      return (
        await this.db.persons
          .find({ selector: { memberInfo: { $exists: true } } })
          .exec()
      ).map(decodePerson) as Member[];
    } else {
      const personMap = await this.db.persons.findByIds(personIds).exec();
      const persons = Array.from(personMap.values()).map(decodePerson);
      const nonMemberIds = persons.reduce((ids, p) => {
        if (p.memberInfo === undefined) {
          ids.push(p.id);
        }
        return ids;
      }, [] as string[]);

      if (nonMemberIds.length > 0) {
        throw new Error(`Persons with id=(${nonMemberIds}) are not members`);
      } else {
        return persons as Member[];
      }
    }
  }

  public async getMember(personId: string): Promise<Member> {
    const doc = await this.db.persons
      .findOne({ selector: { id: { $eq: personId } } })
      .exec();
    if (!doc) {
      throw new Error(`No person found id=${personId}`);
    }
    const person = decodePerson(doc);
    if (!person.memberInfo) {
      throw new Error(`Person with id=${personId} is not a member`);
    }
    return person as Member;
  }

  public async getManyPersons(personIds?: string[]): Promise<Person[]> {
    if (!personIds) {
      return (await this.db.persons.find().exec()).map(decodePerson);
    } else {
      const personMap = await this.db.persons.findByIds(personIds).exec();
      return Array.from(personMap.values()).map(decodePerson);
    }
  }

  public async getPerson(personId: string): Promise<Person> {
    const person = await this.db.persons
      .findOne({ selector: { id: { $eq: personId } } })
      .exec();
    if (person) {
      return decodePerson(person);
    } else {
      throw new Error(`No person found id=${personId}`);
    }
  }

  public async getAllPublicationsByPerson(
    personId: string,
  ): Promise<Publication[]> {
    const pubs = await this.db.publications
      .find({ selector: { authorIds: { $eq: personId } } })
      .exec();
    return pubs.map(decodePublication);
  }

  public async getManyPublications(pubIds?: string[]): Promise<Publication[]> {
    if (!pubIds) {
      return (await this.db.publications.find().exec()).map(decodePublication);
    } else {
      const pubMap = await this.db.publications.findByIds(pubIds).exec();
      return Array.from(pubMap.values()).map(decodePublication);
    }
  }

  public async getPublication(pubId: string): Promise<Publication> {
    const pub = await this.db.publications
      .findOne({ selector: { id: { $eq: pubId } } })
      .exec();
    if (pub) {
      return decodePublication(pub);
    } else {
      throw new Error(`No publication found id=${pubId}`);
    }
  }

  public async getManyPhotos(photoIds?: string[]): Promise<Photo[]> {
    if (!photoIds) {
      return (await this.db.photos.find().exec()).map(decodePhoto);
    } else {
      const photoMap = await this.db.photos.findByIds(photoIds).exec();
      return Array.from(photoMap.values()).map(decodePhoto);
    }
  }

  // --------------------------------------------------------------------------
  // Note: Creation/Update/Deletion methods are not provided. Please use the
  //  db attribute and use RxDB API directly.
  // --------------------------------------------------------------------------
}
