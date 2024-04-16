import prisma, {
  validateMember,
  validatePubResource,
  validateTag,
  validateVenueSeries,
  queryPubExt,
  validatePubExt,
} from "./prisma";

export async function getAllPubs() {
  const pubs = await prisma.publication.findMany(queryPubExt);
  pubs.forEach(validatePubExt);
  return pubs;
}

export async function getPubsByPerson(personId: number, selectedOnly = false) {
  const where = {
    authors: {
      some: {
        id: personId,
      },
    },
  };

  const pubs = await (selectedOnly
    ? prisma.publication.findMany({
        where: {
          AND: {
            ...where,
            selectedBy: {
              some: {
                id: personId,
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
  pubs.forEach(validatePubExt);

  return pubs;
}
