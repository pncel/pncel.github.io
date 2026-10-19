import { Database } from "@/lib/database";
import Gallery from "@/app/gallery/gallery";
import { metadataTmpl } from "@/lib/utils";
import PageMain from "@/layouts/pageMain";
import { PageTitle } from "@/components/prose";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Gallery",
};

export default async function GalleryPage() {
  const db = await Database.get();
  const photos = (await db.getManyPhotos()).toSorted(
    (a, b) => b.time.getTime() - a.time.getTime(),
  );

  return (
    <PageMain>
      <PageTitle>Gallery</PageTitle>
      <Gallery specs={photos} />
    </PageMain>
  );
}
