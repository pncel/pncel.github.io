import { posix } from "path";
import { default as OldDatabase } from "./dist/database.js"
import Database, { encodeDate } from "./dist/newdatabase.js"
import { TagType, Icon, MemberRole } from "./dist/newtypes.js"

const old = await OldDatabase.get();
const new_ = await Database.get();

function getEnumKeyByValue(enumObj, value) {
    return Object.keys(enumObj).find(key => enumObj[key] === value);
}

// start with persons
for (const p of old.getManyPersons()) {
    const m = p.memberId === undefined || p.memberId === "" ? undefined : old.getMember(p.memberId);
    await new_.db.persons.insert({
        id: p.id.toString(),
        firstname: p.firstname,
        lastname: p.lastname,
        goby: p.goby,
        middlename: p.middlename,
        headshot: p.headshot,
        externalLink: p.externalLink,
        member: m && {
            role: getEnumKeyByValue(MemberRole, m.role),
            whenJoined: encodeDate(m.whenJoined),
            whenLeft: encodeDate(m.whenLeft),
            position: m.position,
            email: m.email,
            office: m.office,
            links: [
                ...(m.gscholar ? [{icon: "gscholar", link: m.gscholar}] : []),
                ...(m.orcid ? [{icon: "orcid", link: m.orcid}] : []),
                ...(m.github ? [{icon: "github", link: m.github}] : []),
                ...(m.linkedin ? [{icon: "linkedin", link: m.linkedin}] : []),
                ...(m.twitter ? [{icon: "twitter", link: m.twitter}] : []),
                ...(m.facebook ? [{icon: "facebook", link: m.facebook}] : []),
                ...(m.instagram ? [{icon: "instagram", link: m.instagram}] : []),
                ...(m.youtube ? [{icon: "youtube", link: m.youtube}] : []),
            ],
            selectedPubIds: m.selectedPubIds,
        }
    })
}

// publications
for (const p of old.getManyPublications()) {
    await new_.db.publications.insert({
        id: p.id.toString(),
        title: p.title,
        authorIds: p.authorIds,
        time: encodeDate(p.time),
        booktitle: p.booktitle,
        doi: p.doi,
        bibtex: p.bibtex,
        arxivDoi: p.arxivDOI,
        arxivBibtex: p.arxivBibtex,
        authorsCopy: p.authorsCopy,
        equalContrib: p.equalContrib,
        notPncel: p.notPncel,
        tags: p.tags?.map(t => ({
            ...t,
            type: getEnumKeyByValue(TagType, t.type),
            icon: getEnumKeyByValue(Icon, t.icon),
        })),
        attachments: p.attachments?.map(a => ({
            ...a,
            icon: getEnumKeyByValue(Icon, a.icon),
        }))
    })
}

// photos
for (const [i, p] of old.getAllPhotos().entries()) {
    await new_.db.photos.insert({
        ...p,
        id: (i + 1).toString(),
        time: encodeDate(p.time),
    })
}

new_.persist()