import { faMedal, faMicrochip } from "@fortawesome/free-solid-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Tag } from "@/data/types";
import { TagType } from "@/data/enums";
import React from "react";
config.autoAddCss = false;

export default function TagBadge({ tag }: Readonly<{ tag: Tag }>) {
  return (
    <div
      className={`badge ${tag.level && tag.level >= 200 ? "badge-primary" : `bg-base-content text-base-100`}`}
    >
      <a className="whitespace-nowrap">
        {tag.type === TagType.award && (
          <FontAwesomeIcon className="text-xs mr-1" icon={faMedal} />
        )}
        {tag.type === TagType.tapeout && (
          <FontAwesomeIcon className="text-xs mr-1" icon={faMicrochip} />
        )}
        {tag.label}
      </a>
    </div>
  );
}
