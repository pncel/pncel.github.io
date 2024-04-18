import prisma, {
  queryPubExt,
  validatePubExt,
  PublicationExtended,
} from "./prisma";

export async function getAllPubs() {
  const pubs = await prisma.publication.findMany(queryPubExt);
  const correctedPubs = pubs.map(validatePubExt);
  return correctedPubs;
}

export async function getPubsByPerson(
  personId: number,
  selectByMemberId?: string
) {
  const where = {
    authors: {
      some: {
        id: personId,
      },
    },
  };

  const pubs = await (selectByMemberId
    ? prisma.publication.findMany({
        where: {
          AND: {
            ...where,
            selectedBy: {
              some: {
                memberId: selectByMemberId,
              },
            },
          },
        },
        ...queryPubExt,
      })
    : prisma.publication.findMany({
        where: where,
        ...queryPubExt,
      }));

  const correctedPubs = pubs.map(validatePubExt);
  return correctedPubs;
}

export function generateBibtexForPub(pub: PublicationExtended) {
  if (!pub.type) {
    return null;
  } else if (pub.type === "inproceedings") {
    var bibtex = `@inproceedings{pncel${pub.id},
  title={{${pub.title}}},
  author={${pub.authors.map((author) => author.lastname + ", " + author.firstname).join(" and ")}},`;

    if (pub.time) {
      bibtex += `
  year={${pub.time.getFullYear()}},`;
    }

    if (pub.volume !== null) {
      bibtex += `
  volume={${pub.volume}},`;
    }

    if (pub.number !== null) {
      bibtex += `
  number={${pub.number}},`;
    }

    if (pub.doi) {
      bibtex += `
  doi={${pub.doi}},`;
    }

    if (pub.fromPage !== null) {
      bibtex += `
  pages={${pub.fromPage}-${pub.toPage || pub.fromPage}},`;
    }

    bibtex += `
  booktitle={${pub.booktitle}}
}`;

    return bibtex;
  } else {
    throw new Error(
      `Database data error: invalid type (${pub.type}) for publication "${pub.title}"`
    );
  }
}
