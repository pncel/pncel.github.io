"use client";
import Image from "next/image";
import { useState } from "react";
import { useContext } from "react";

import DataContext from "@/app/context";
import { Photo } from "@/data/types";

export default function GalleryItem({
  spec,
  setHighlight,
}: Readonly<{
  spec: Photo;
  setHighlight: (highlight: Photo) => void;
}>) {
  const [isHovered, setIsHovered] = useState(false);

  const context = useContext(DataContext);
  if (!context) {
    throw new Error(
      "Source code error: PubEntry must be used inside ContextProvider",
    );
  }

  const { useDarkTheme } = context;

  return (
    <div
      className={`rounded-lg overflow-clip relative mb-4`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => {
        setHighlight(spec);
        setTimeout(() => {
          (
            document.getElementById("gallery-highlight") as HTMLDialogElement
          ).showModal();
        });
      }}
    >
      <Image
        src={spec.thumbnail || spec.image}
        alt={spec.title}
        width={spec.width}
        height={spec.height}
        className="pointer-events-none object-cover"
      />
      {isHovered && (
        <div
          className={`absolute inset-0 ${useDarkTheme ? "bg-base-300" : "bg-base-100"} bg-opacity-80 flex items-center justify-center text-base-content flex flex-col gap-1 p-8 pointer-events-none`}
        >
          <p className="text-center text-xl font-semibold">{spec.title}</p>
          {spec.subtitle && (
            <p className="text-center text-md">{spec.subtitle}</p>
          )}
          {spec.time && (
            <p className="text-center text-md">
              {spec.time.toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
