import { faMedal, faMicrochip } from "@fortawesome/free-solid-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TagType, Tag } from "@/data/newtypes";
import React from "react";
config.autoAddCss = false;

export default function TagBadge({ tag }: Readonly<{ tag: Tag }>) {
  return (
    <div
      className={
        "badge " +
        (tag.type === TagType.award
          ? "badge-success "
          : "bg-base-content text-base-100 ") +
        (tag.type === TagType.venue ? "rounded-md " : " ")
      }
    >
      <a className="whitespace-nowrap">
        {tag.type === TagType.award && (
          <FontAwesomeIcon className="text-xs mr-1" icon={faMedal} />
        )}
        {tag.label}
      </a>
    </div>
  );
}
