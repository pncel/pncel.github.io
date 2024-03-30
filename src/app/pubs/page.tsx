import { metadataTmpl } from "@/data/metadata";
import DefaultMDX from "@/layouts/defaultMdx";
import React from "react";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Publications",
};

export default async function Pubs({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div>
    <DefaultMDX>
      <p>Under construction...</p>
    </DefaultMDX>
  </div>
}
