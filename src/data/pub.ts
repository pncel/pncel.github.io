import prisma, { queryPubExt, validatePublication } from "./prisma";
import type { Publication } from "./types";

export async function getAllPubs() {
  const pubs = await prisma.publication.findMany(queryPubExt);
  return pubs.map(validatePublication);
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

  return pubs.map(validatePublication);
}

export function generateBibtexForPub(pub: Publication) {
  var bibtex = `@${pub.type}{pncel${pub.id},
  title={{${pub.title}}},
  author={${pub.authors!.map((author) => author.lastname + ", " + author.firstname).join(" and ")}},`;

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
}
