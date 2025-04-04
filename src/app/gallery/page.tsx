import { readFile } from "fs/promises";
import { parse } from "yaml";

import Gallery from "@/app/gallery/gallery";
import { Photo } from "@/data/types";
import { metadataTmpl } from "@/data/metadata";
import DefaultMain from "@/layouts/defaultMain";
import DefaultMDX from "@/layouts/defaultMdx";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Gallery",
};

export default async function GalleryPage() {
  const photo_specs = parse(
    await readFile(`${process.cwd()}/src/app/gallery/photos.yaml`, "utf-8"),
  ) as any[];
  const photos: Photo[] = photo_specs
    .map((photo: any) => ({
      ...photo,
      time: new Date(photo.time),
    }))
    .toSorted((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <DefaultMain>
      <DefaultMDX>
        <h1>Gallery</h1>
      </DefaultMDX>
      <Gallery specs={photos} />
    </DefaultMain>
  );
}
