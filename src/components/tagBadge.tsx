import { faMedal, faMicrochip } from "@fortawesome/free-solid-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tag } from "@prisma/client";
import React from "react";
config.autoAddCss = false;

export default function TagBadge({
  tag,
  altStyle,
}: Readonly<{ tag: Tag; altStyle?: boolean }>) {
  return (
    <div
      className={`badge ${tag.level && tag.level >= 200 ? "badge-primary" : `bg-base-content text-base-100`}`}
    >
      <a className="whitespace-nowrap">
        {tag.type === "Award" && (
          <FontAwesomeIcon className="mr-1" icon={faMedal} />
        )}
        {tag.type === "Tapeout" && (
          <FontAwesomeIcon className="mr-1" icon={faMicrochip} />
        )}
        {tag.label}
      </a>
    </div>
  );
}
