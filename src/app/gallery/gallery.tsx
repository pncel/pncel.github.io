"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { Photo } from "@/lib/types";
import GalleryItem from "@/app/gallery/item";

export default function Gallery({
  specs,
}: Readonly<{
  specs: Photo[];
}>) {
  const [highlight, setHighlight] = useState<Photo | undefined>(undefined);
  const [cols, setCols] = useState<number>(1);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1280) setCols(3);
      else if (w >= 480) setCols(2);
      else setCols(1);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const columns = useMemo(() => {
    const cols_: Photo[][] = Array.from({ length: cols }, () => []);
    const heights: number[] = new Array(cols).fill(0);
    for (const photo of specs) {
      let minIdx = 0;
      let minHeight = heights[0]!;
      for (let i = 1; i < cols; i++) {
        if (heights[i]! < minHeight) {
          minIdx = i;
          minHeight = heights[i]!;
        }
      }
      cols_[minIdx]!.push(photo);
      heights[minIdx] = minHeight + photo.height / photo.width;
    }
    return cols_;
  }, [specs, cols]);

  return (
    <>
      <div className="mt-8 flex gap-4">
        {columns.map((col, c) => (
          <div key={c} className="flex-1 flex flex-col gap-4 min-w-0">
            {col.map((photo, i) => (
              <GalleryItem
                spec={photo}
                setHighlight={setHighlight}
                key={`${c}-${i}`}
              />
            ))}
          </div>
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
                {highlight.time.toLocaleDateString("en-US", {
                  timeZone: "UTC",
                })}
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
