import { addRxPlugin, RxCollection, RxDocument } from "rxdb";
import { RxDBCleanupPlugin } from "rxdb/plugins/cleanup";
import {
  Database,
  encodePerson,
  decodePerson,
  encodePublication,
  decodePublication,
  encodePhoto,
  decodePhoto,
} from "./database";
import {
  Person,
  Publication,
  Photo,
  PersonJson,
  PublicationJson,
  PhotoJson,
} from "./types";

addRxPlugin(RxDBCleanupPlugin);

function marshalId(i: number): string {
  // LFSR + modified BASE64
  if (i <= 0 || i > 0xffffffff) {
    throw new Error(
      `ID marshalling failed. ${i} not in range (0, 0xFFFF_FFFF]`,
    );
  }

  // lfsr
  let x = i & 0xffffffff;
  x ^= x >>> 13;
  x ^= x << 17;
  x ^= x >>> 5;

  // base64
  const rixits =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-".split(
      "",
    );
  let res = "";
  for (let j = 0; j < 6; j++) {
    res = rixits[x & 0x3f] + res;
    x = x >>> 6;
  }

  // if (unmarshalId(res) !== i) {
  //     throw new Error(`Unmashal(${res}) === ${(unmarshalId(res) >>> 0).toString(16)} !== ${(i >>> 0).toString(16)}`);
  // }

  return res;
}

function unmarshalId(i: string): number {
  // base64 decoding
  if (i.length !== 6) {
    throw new Error(
      `ID unmarshalling failed. ${i} is not a 6-character base64{'_-'} string`,
    );
  }

  let x = 0;
  const rixits =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-".split(
      "",
    );
  for (const v of i.split("").map((c) => rixits.findIndex((v) => v === c))) {
    if (v === -1) {
      throw new Error(
        `ID unmarshalling failed. ${i} is not a 6-character base64{'_-'} string`,
      );
    } else {
      x = (x << 6) + v;
    }
  }
  x = x & 0xffffffff;

  // reverse LFSR
  let mask = 0xf8000000,
    r = 0;
  while (mask) {
    r |= ((r >>> 5) ^ x) & mask;
    mask = mask >>> 5;
  }
  x = r;

  (mask = 0x0001ffff), (r = 0);
  while (mask) {
    r |= ((r << 17) ^ x) & mask;
    mask = mask << 17;
  }
  x = r;

  (mask = 0xfff80000), (r = 0);
  while (mask) {
    r |= ((r >>> 13) ^ x) & mask;
    mask = mask >>> 13;
  }
  return r;
}

const tempIdPrefix: string = ".";
class CollectionMutator<JsonT, ObjT extends { id: string }> extends Object {
  public collection: RxCollection<JsonT>;
  public decode: (d: RxDocument<JsonT>) => ObjT;
  public encode: (o: ObjT) => JsonT;
  public numberedIdPrefix: string;
  public maxNumberedId: number = 0;
  public recycledNumberedIds: number[] = [];
  public fixes: Map<string, ObjT> = new Map<string, ObjT>();
  public pendingRemovals: Promise<void>[] = [];

  constructor(
    _collection: RxCollection<JsonT>,
    _numberedIdPrefix: string,
    _decode: (d: RxDocument<JsonT>) => ObjT,
    _encode: (o: ObjT) => JsonT,
  ) {
    super();
    this.collection = _collection;
    this.numberedIdPrefix = _numberedIdPrefix;
    this.decode = _decode;
    this.encode = _encode;
  }

  public async scanForFixes(addlFixNeeded: (o: ObjT) => boolean = () => false) {
    await this.collection
      .find()
      .exec()
      .then((docs) =>
        docs.map((doc) => {
          const obj = this.decode(doc);
          if (obj.id.startsWith(this.numberedIdPrefix)) {
            try {
              const n = unmarshalId(obj.id.slice(this.numberedIdPrefix.length));
              if (n < this.maxNumberedId) {
                this.recycledNumberedIds = this.recycledNumberedIds.filter(
                  (v) => v !== n,
                );
              } else {
                if (n - 1 > this.maxNumberedId) {
                  this.recycledNumberedIds.push(
                    ...Array.from(
                      { length: n - this.maxNumberedId - 2 },
                      (_, i) => this.maxNumberedId + i + 1,
                    ),
                  );
                }
                this.maxNumberedId = n;
              }
            } catch (e) {}
          }

          if (obj.id.startsWith(tempIdPrefix) || addlFixNeeded(obj)) {
            this.fixes.set(obj.id, obj);
            this.pendingRemovals.push(doc.remove().then(() => {}));
          }
        }),
      )
      .then(() => {
        // allocating IDs
        for (const p of Array.from(this.fixes.values())) {
          if (p.id.startsWith(tempIdPrefix)) {
            p.id = this.allocId();
          }
        }
      });
  }

  public clearFixes() {
    this.fixes.clear();
    this.pendingRemovals = [];
  }

  public allocId(): string {
    let n = this.recycledNumberedIds.pop();
    if (n === undefined) {
      n = this.maxNumberedId + 1;
      this.maxNumberedId = n;
    }
    return `${this.numberedIdPrefix}${marshalId(n)}`;
  }
}

export class DatabaseMutator extends Object {
  public db: Database;
  private dirty: boolean = false;
  private pendingJob: Promise<void>;

  private personsMutator: CollectionMutator<PersonJson, Person>;
  private pubsMutator: CollectionMutator<PublicationJson, Publication>;
  private photosMutator: CollectionMutator<PhotoJson, Photo>;

  constructor(_db: Database) {
    super();
    this.db = _db;
    this.personsMutator = new CollectionMutator(
      _db.db.persons,
      "$",
      decodePerson,
      encodePerson,
    );
    this.pubsMutator = new CollectionMutator(
      _db.db.publications,
      "+",
      decodePublication,
      encodePublication,
    );
    this.photosMutator = new CollectionMutator(
      _db.db.photos,
      "p-",
      decodePhoto,
      encodePhoto,
    );

    // scan for fixes
    const pScanForFixesPersons = this.personsMutator.scanForFixes(
      (person) =>
        (person.memberInfo?.selectedPubIds?.filter((v) =>
          v.startsWith(tempIdPrefix),
        ).length || 0) > 0,
    );

    const pScanForFixesPubs = this.pubsMutator.scanForFixes(
      (pub) =>
        pub.authorIds.filter((v) => v.startsWith(tempIdPrefix)).length > 0,
    );

    const pScanForFixesPhotos = this.photosMutator.scanForFixes();

    // fix cross-references then update DB
    const pUpdatePersons = Promise.all(
      [pScanForFixesPersons, pScanForFixesPubs]
        .concat(this.personsMutator.pendingRemovals)
        .concat(this.pubsMutator.pendingRemovals),
    )
      .then(() => this.db.db.persons.cleanup(0))
      .then(() =>
        Promise.all(
          Array.from(this.personsMutator.fixes.values()).map(async (p) => {
            if (p.memberInfo?.selectedPubIds) {
              p.memberInfo.selectedPubIds = p.memberInfo.selectedPubIds.map(
                (v) => this.pubsMutator.fixes.get(v)?.id || v,
              );
            }
            await this.db.db.persons.insert(encodePerson(p));
          }),
        ),
      );

    const pUpdatePubs = Promise.all(
      [pScanForFixesPersons, pScanForFixesPubs]
        .concat(this.personsMutator.pendingRemovals)
        .concat(this.pubsMutator.pendingRemovals),
    )
      .then(() => this.db.db.publications.cleanup(0))
      .then(() =>
        Promise.all(
          Array.from(this.pubsMutator.fixes.values()).map(async (p) => {
            p.authorIds = p.authorIds.map(
              (v) => this.personsMutator.fixes.get(v)?.id || v,
            );
            await this.db.db.publications.insert(encodePublication(p));
          }),
        ),
      );

    const pUpdatePhotos = Promise.all(
      [pScanForFixesPhotos].concat(this.photosMutator.pendingRemovals),
    )
      .then(() => this.db.db.photos.cleanup(0))
      .then(() =>
        Promise.all(
          Array.from(this.photosMutator.fixes.values()).map(async (p) => {
            await this.db.db.photos.insert(encodePhoto(p));
          }),
        ),
      );

    // 5. apply changes!
    this.pendingJob = Promise.all([
      pUpdatePersons,
      pUpdatePubs,
      pUpdatePhotos,
    ]).then(() => {
      this.dirty =
        this.personsMutator.fixes.size +
          this.pubsMutator.fixes.size +
          this.photosMutator.fixes.size >
        0;
      for (const [id, person] of Array.from(
        this.personsMutator.fixes.entries(),
      )) {
        if (person.id !== id)
          console.log(
            `Assigned permanent ID for person with temporary ID=${id}`,
          );
      }
      for (const [id, pub] of Array.from(this.pubsMutator.fixes.entries())) {
        if (pub.id !== id)
          console.log(
            `Assigned permanent ID for publication with temporary ID=${id}`,
          );
      }
      for (const [id, photo] of Array.from(
        this.photosMutator.fixes.entries(),
      )) {
        if (photo.id !== id)
          console.log(
            `Assigned permanent ID for photo with temporary ID=${id}`,
          );
      }
      this.personsMutator.clearFixes();
      this.pubsMutator.clearFixes();
      this.photosMutator.clearFixes();
    });
  }

  public async settle() {
    return this.pendingJob;
  }

  public async persist(force: boolean = false) {
    await this.settle();
    if (force || this.dirty) {
      await this.db.persist();
      this.dirty = false;
    }
  }

  public async createPerson(
    person: Omit<Person, "id"> & { id?: string },
  ): Promise<Person> {
    await this.settle();
    if (person.id === undefined) {
      person.id = this.personsMutator.allocId();
    }
    const p = await this.db.db.persons.insert(encodePerson(person as Person));
    this.dirty = true;
    return decodePerson(p);
  }

  public async createPublication(
    pub: Omit<Publication, "id"> & { id?: string },
  ): Promise<Publication> {
    await this.settle();
    if (pub.id === undefined) {
      pub.id = this.pubsMutator.allocId();
    }
    const p = await this.db.db.publications.insert(
      encodePublication(pub as Publication),
    );
    this.dirty = true;
    return decodePublication(p);
  }
}
