import {
    createRxDatabase,
    RxDatabase as _RxDatabase,
    RxCollection,
    addRxPlugin,
} from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { wrappedValidateAjvStorage, getAjv } from 'rxdb/plugins/validate-ajv';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { readFile, writeFile } from "fs/promises";
import { parse, stringify } from 'yaml';
import addFormats from "ajv-formats";
import {
    TagType,
    MemberRole,
    Icon,
    Tag,
    PersonDoc,
    Person,
    personSchema,
    MemberDoc,
    Member,
    PublicationDoc,
    Publication,
    publicationSchema,
    PhotoDoc,
    Photo,
    photoSchema,
    TagDoc,
} from './newtypes.js'; // .js suffix is required here for js transpilation for our scripts

addRxPlugin(RxDBJsonDumpPlugin);
addRxPlugin(RxDBDevModePlugin);
addFormats(getAjv());

type RxDatabase = _RxDatabase<Readonly<{
    persons: RxCollection<PersonDoc>,
    publications: RxCollection<PublicationDoc>,
    photos: RxCollection<PhotoDoc>,
}>>;

// ==============================================================================
// == Encoder/Decoders ==========================================================
// ==============================================================================
export function encodeEnum<E, ET>(e: E | undefined): ET | undefined {
    return e === undefined ? undefined : stringify(e) as ET;
}

export function decodeEnum<E extends Record<string, string | number>>(
    ET: E,
    v: string | undefined
): E[keyof E] | undefined {
    if (v && v in Object.keys(ET)) {
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
        const dd = new Date(d.getTime() - (offset * 60 * 1000));
        return dd.toISOString().split('T')[0];
    }
}

export function encodeTag(t: Tag): TagDoc {
    return {
        ...t,
        type: encodeEnum(t.type),
        icon: encodeEnum(t.icon),
    }
}

export function decodeTag(t: TagDoc): Tag {
    return {
        ...t,
        type: decodeEnum(TagType, t.type),
        icon: decodeEnum(Icon, t.type),
    }
}

export function encodeMember(m: Member): MemberDoc {
    return {
        ...m,
        role: encodeEnum(m.role)!,
        whenJoined: encodeDate(m.whenJoined)!,
        whenLeft: encodeDate(m.whenLeft),
        links: m.links?.map(l => ({
            ...l,
            icon: encodeEnum(l.icon),
        }))
    }
}

export function decodeMember(m: MemberDoc): Member {
    return {
        ...m,
        role: decodeEnum(MemberRole, m.role)!,
        whenJoined: new Date(m.whenJoined),
        whenLeft: m.whenLeft === undefined ? undefined : new Date(m.whenLeft),
        links: m.links?.map(l => ({
            ...l,
            icon: decodeEnum(Icon, l.icon),
        })),
    }
}

export function encodePerson(p: Person): PersonDoc {
    const m = p.member;
    return {
        ...p,
        id: p.id.toString(),
        member: m === undefined ? undefined : encodeMember(m),
    }
}

export function decodePerson(d: PersonDoc): Person {
    return {
        ...d,
        id: parseInt(d.id),
        member: d.member === undefined ? undefined : decodeMember(d.member),
    }
}

export function encodePublication(p: Publication): PublicationDoc {
    return {
        ...p,
        id: p.id.toString(),
        time: encodeDate(p.time)!,
        tags: p.tags?.map(encodeTag),
        attachments: p.attachments?.map(a => ({
            ...a,
            icon: encodeEnum(a.icon)
        }))
    }
}

export function decodePublication(p: PublicationDoc): Publication {
    return {
        ...p,
        id: parseInt(p.id),
        time: new Date(p.time),
        tags: p.tags?.map(decodeTag),
        attachments: p.attachments?.map(a => ({
            ...a,
            icon: decodeEnum(Icon, a.icon)
        }))
    }
}

export function encodePhoto(p: Photo): PhotoDoc {
    return {
        ...p,
        id: p.id.toString(),
        time: encodeDate(p.time)!,
    }
}

export function decodePhoto(p: PhotoDoc): Photo {
    return {
        ...p,
        id: parseInt(p.id),
        time: new Date(p.time),
    }
}

const dbPath = `${process.cwd()}/public/database.yaml`;

// ==============================================================================
// == Database Class ============================================================
// ==============================================================================
export default class Database extends Object {
    private static instance: Promise<Database>;     // singleton instance
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
                    const instance = new Database(await createRxDatabase<RxDatabase>({
                        name: "db",
                        storage: wrappedValidateAjvStorage({
                            storage: getRxStorageMemory()
                        })
                    }).then(async db => {
                        await db.addCollections({
                            persons: { schema: personSchema },
                            publications: { schema: publicationSchema },
                            photos: { schema: photoSchema },
                        });
                        return db;
                    }).then(async db => {
                        await readFile(dbPath, "utf-8")
                            .then(raw => parse(raw))
                            .then(data => { db.importJSON(data) });
                        return db;
                    }));

                    // 1. validate all persons
                    const pValidateAllPersons =
                        instance.db.persons.find()
                            .exec()
                            .then(persons => persons.map(decodePerson))
                            .then(persons => persons.map(p => instance.validatePerson(p)));

                    // 2. validate all publications
                    const pValidateAllPublications =
                        instance.db.publications.find()
                            .exec()
                            .then(pubs => pubs.map(decodePublication))
                            .then(pubs => pubs.map(pub => instance.validatePublication(pub)));

                    // 3. run in async and gather all errors
                    const errors: any[] = [];
                    await Promise.allSettled([pValidateAllPersons, pValidateAllPublications].map(
                        plple /* promise of list of promises of list of errors */ => plple.then(
                            lple /* list of promises of list of errors */ => lple.map(
                                ple /* promise of list of errors */ => ple.then(
                                    le /* list of errors */ => errors.push(...le)
                                )
                            )
                        )
                    ));

                    resolve(instance);
                } catch (e) {
                    reject(e);
                }
            });
        }
        return Database.instance
    }

    public async persist() {
        const json = await this.db.exportJSON();
        await writeFile(`${process.cwd()}/public/database.yaml`, stringify(json));
    }

    // --------------------------------------------------------------------------
    // -- Validators ------------------------------------------------------------
    // --------------------------------------------------------------------------

    private async validatePerson(person: Person): Promise<any[]> {
        let errors = [];
        const selectedPubIds = person.member?.selectedPubIds;
        if (selectedPubIds) {
            const uniquePubIds = Array.from(new Set(selectedPubIds));
            if (uniquePubIds.length !== selectedPubIds.length) {
                errors.push(`Member id=${person.id} has duplicate entries in selectedPubIds`);
            }

            await Promise.allSettled(uniquePubIds.map(pubId =>
                this.db.publications.findOne({ selector: { id: { $eq: pubId } } })
                    .exec()
                    .then(pub => {
                        if (pub === null) {
                            errors.push(`Publication id=${pubId} not found (selected by member id=${person.id})`);
                        } else if (!pub.authorIds.includes(person.id)) {
                            errors.push(`Publication id=${pubId} does not include member id=${person.id} as author by is selected by that member`);
                        }
                    })
            ))
        }
        return errors;
    }

    private async validatePublication(pub: Publication): Promise<any[]> {
        let errors = [];
        const uniqueAuthorIds = Array.from(new Set(pub.authorIds));
        if (uniqueAuthorIds.length != pub.authorIds.length) {
            errors.push(`Publication id=${pub.id} has duplicate entries in authorIds`);
        }

        await Promise.allSettled(uniqueAuthorIds.map(id =>
            this.db.persons.findOne({ selector: { id: { $eq: id}}})
                .exec()
                .then(person => {
                    if (person === null) {
                        errors.push(`Person id=${id} not found (listed as author by publication id=${pub.id})`);
                    }
                })
        ))
        return errors;
    }

    // --------------------------------------------------------------------------
    // -- Read ------------------------------------------------------------------
    // --------------------------------------------------------------------------
    public async getAllMembers(): Promise<Person[]> {
        return (await this.db.persons.find({selector:{member:{$exists:true}}}).exec()).map(decodePerson);
    }

    public async getManyPersons(personIds?: number[]): Promise<Person[]> {
        if (!personIds) {
            return (await this.db.persons.find().exec()).map(decodePerson);
        } else {
            const personMap = await this.db.persons.findByIds(personIds.map(id => id.toString())).exec();
            return Array.from(personMap.values()).map(decodePerson);
        }
    }

    public async getPerson(personId: number): Promise<Person> {
        const person = await this.db.persons.findOne({selector:{id:{$eq:personId}}}).exec();
        if (person) {
            return decodePerson(person);
        } else {
            throw new Error(`No person found id=${personId}`);
        }
    }

    public async getManyPublications(pubIds?: number[]): Promise<Publication[]> {
        if (!pubIds) {
            return (await this.db.publications.find().exec()).map(decodePublication);
        } else {
            const pubMap = await this.db.publications.findByIds(pubIds.map(id => id.toString())).exec();
            return Array.from(pubMap.values()).map(decodePublication);
        }
    }

    public async getPublication(pubId: number): Promise<Publication> {
        const pub = await this.db.publications.findOne({selector:{id:{$eq:pubId}}}).exec();
        if (pub) {
            return decodePublication(pub);
        } else {
            throw new Error(`No publication found id=${pubId}`);
        }
    }

    public async getManyPhotos(photoIds?: number[]): Promise<Photo[]> {
        if (!photoIds) {
            return (await this.db.photos.find().exec()).map(decodePhoto);
        } else {
            const photoMap = await this.db.photos.findByIds(photoIds.map(id => id.toString())).exec();
            return Array.from(photoMap.values()).map(decodePhoto);
        }
    }

    // --------------------------------------------------------------------------
    // Note: Creation/Update/Deletion methods are not provided. Please use the
    //  db attribute and use RxDB API directly.
    // --------------------------------------------------------------------------
};