import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { useMDXComponents } from "@/mdx-components";

function PubTitleBlock({ pub }: Readonly<{ pub: Publication }>) {
  return (
    <>
      <div className="px-2">{pub.title}</div>
      <div className="flex flex-row p-2">
        <div className="btn btn-xs 2xl:btn-sm btn-primary">{pub.venue}</div>
        {pub.tags?.map((tag) => (
          <div className="badge badge-secondary">{tag}</div>
        ))}
      </div>
    </>
  );
}

export default function PubEntry({
  pub,
  evenLine,
}: Readonly<{ pub: Publication; evenLine: boolean }>) {
  return pub.abstract ? (
    <div
      tabIndex={0}
      className={`collapse collapse-arrow ${evenLine ? "bg-base-200" : "bg-base-300"} text-base-content`}
    >
      <div className="collapse-title p-2">
        <PubTitleBlock pub={pub} />
      </div>
      <div className="collapse-content bg-neutral text-neutral-content">
        <MDXRemote source={pub.abstract} components={useMDXComponents({})} />
      </div>
    </div>
  ) : (
    <div className={`${evenLine ? "bg-base-200" : "bg-base-300"}`}>
      <div className="collapse-title">
        <PubTitleBlock pub={pub} />
      </div>
    </div>
  );
}
