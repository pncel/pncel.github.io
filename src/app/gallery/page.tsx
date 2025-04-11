import { Database } from "@/data/database";
import Gallery from "@/app/gallery/gallery";
import { metadataTmpl } from "@/data/utils";
import DefaultMain from "@/layouts/defaultMain";
import DefaultMDX from "@/layouts/defaultMdx";

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
    <DefaultMain>
      <DefaultMDX>
        <h1>Gallery</h1>
      </DefaultMDX>
      <Gallery specs={photos} />
    </DefaultMain>
  );
}
