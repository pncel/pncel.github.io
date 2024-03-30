import { metadataTmpl } from "@/data/metadata";
import DefaultMDX from "@/layouts/defaultMdx";
import React from "react";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Blogs",
};

export default async function Blogs({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div>
    <DefaultMDX>
      <p>Under construction...</p>
    </DefaultMDX>
  </div>
}
