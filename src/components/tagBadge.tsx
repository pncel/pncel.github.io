import { config } from "@fortawesome/fontawesome-svg-core";
import { TagType, Tag } from "@/data/types";
import React from "react";
import SelectedFontAwesomeIcon from "./icon";
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
        {tag.icon === undefined ? undefined : (
          <SelectedFontAwesomeIcon icon={tag.icon} />
        )}
        {tag.label}
      </a>
    </div>
  );
}
