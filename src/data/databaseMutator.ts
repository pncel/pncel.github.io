import { Database } from "./database";

function marshalId(i: number): string {
    // LFSR + modified BASE64
    if (i <= 0 || i > 0xffffffff) {
        throw new Error(`ID marshalling failed. ${i} not in range (0, 0xFFFF_FFFF]`);
    }

    // lfsr
    let x = i & 0xFFFFFFFF;
    x ^= x >>> 13;
    x ^= x << 17;
    x ^= x >>> 5;

    // base64
    const rixits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-".split('');
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
        throw new Error(`ID unmarshalling failed. ${i} is not a 6-character base64{'_-'} string`);
    }

    let x = 0;
    const rixits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-".split('');
    for (const v of i.split('').map(c => rixits.findIndex(v => v === c))) {
        if (v === -1) {
            throw new Error(`ID unmarshalling failed. ${i} is not a 6-character base64{'_-'} string`);
        } else {
            x = (x << 6) + v;
        }
    }
    x = x & 0xFFFFFFFF;

    // reverse LFSR
    let mask = 0xF8000000, r = 0;
    while (mask) {
        r |= ((r >>> 5) ^ x) & mask;
        mask = mask >>> 5;
    }
    x = r;

    mask = 0x0001FFFF, r = 0;
    while (mask) {
        r |= ((r << 17) ^ x) & mask;
        mask = mask << 17;
    }
    x = r;

    mask = 0xFFF80000, r = 0;
    while (mask) {
        r |= ((r >>> 13) ^ x) & mask;
        mask = mask >>> 13;
    }
    return r;
}

export class DatabaseMutator extends Object {
    public db: Database;

    private maxNumberedPersonId: number = 0;
    private recycledNumberedPersonId: number[] = [];
    private maxNumberedPubId: number = 0;
    private recycledNumberedPubId: number[] = [];
    private maxNumberedPhotoId: number = 0;
    private recycledNumberedPhotoId: number[] = [];

    private dirty: boolean = false;

    private allocPersonId(): string {
        let n = this.recycledNumberedPersonId.pop();
        if (n === undefined) {
            n = this.maxNumberedPersonId + 1;
            this.maxNumberedPersonId = n;
        }
        return `${'$'}${marshalId(n)}`;
    }

    private allocPubId(): string {
        let n = this.recycledNumberedPubId.pop();
        if (n === undefined) {
            n = this.maxNumberedPubId + 1;
            this.maxNumberedPubId = n;
        }
        return `+${marshalId(n)}`;
    }

    private allocPhotoId(): string {
        let n = this.recycledNumberedPhotoId.pop();
        if (n === undefined) {
            n = this.maxNumberedPhotoId + 1;
            this.maxNumberedPhotoId = n;
        }
        return `!${marshalId(n)}`;
    }

    constructor(_db: Database) {
        super();
        this.db = _db;
    }
};