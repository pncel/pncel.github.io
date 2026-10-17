"use client";
import Image from "next/image";
import { useContext } from "react";

import DataContext from "@/app/context";
import { Photo } from "@/lib/types";

export default function GalleryItem({
  spec,
  setHighlight,
}: Readonly<{
  spec: Photo;
  setHighlight: (highlight: Photo) => void;
}>) {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error(
      "Source code error: GalleryItem must be used inside ContextProvider",
    );
  }

  const { useDarkTheme } = context;

  return (
    <div
      className="group rounded-lg overflow-clip relative cursor-pointer"
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
      {/* Kept mounted so it can fade; `group-hover` replaces the old hover state. */}
      <div
        className={
          `absolute inset-0 ${useDarkTheme ? "bg-base-300" : "bg-base-100"} bg-opacity-80 ` +
          "flex flex-col items-center justify-center text-base-content gap-1 p-8 " +
          "pointer-events-none opacity-0 group-hover:opacity-100 " +
          "transition-opacity duration-200"
        }
      >
        <p className="text-center text-xl font-semibold">{spec.title}</p>
        {spec.subtitle && (
          <p className="text-center text-base">{spec.subtitle}</p>
        )}
        {spec.time && (
          <p className="text-center text-base">
            {spec.time.toLocaleDateString("en-US", { timeZone: "UTC" })}
          </p>
        )}
      </div>
    </div>
  );
}
