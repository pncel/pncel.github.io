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

export async function getPubsByPerson(personId: number) {
  const pubs = await prisma.publication.findMany({
    where: {
      authors: {
        some: {
          id: personId,
        },
      },
    },
    ...queryPubExt,
  });

  pubs.forEach(validatePubExt);

  return pubs;
}
