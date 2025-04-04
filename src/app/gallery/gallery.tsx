"use client";
import { useState } from "react";
import Image from "next/image";

import { Photo } from "@/data/types";
import GalleryItem from "@/app/gallery/item";

export default function Gallery({
  specs,
}: Readonly<{
  specs: Photo[];
}>) {
  const [highlight, setHighlight] = useState<Photo | undefined>(undefined);

  return (
    <>
      <div className="mt-8 columns-1 min-[480px]:columns-2 xl:columns-3 gap-4">
        {specs.map((photo, i) => (
          <GalleryItem spec={photo} setHighlight={setHighlight} key={i} />
        ))}
      </div>
      <dialog id="gallery-highlight" className="modal">
        <div className="modal-box max-w-full">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          {highlight && (
            <>
              <h3 className="font-bold text-xl pb-2">{highlight.title}</h3>
              {highlight.subtitle && (
                <p className="text-md pb-2">{highlight.subtitle}</p>
              )}
              <p className="text-md pb-2">
                {highlight.time.toLocaleDateString()}
              </p>
              <Image
                src={highlight.image}
                alt={highlight.title}
                width={highlight.width}
                height={highlight.height}
              />
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
