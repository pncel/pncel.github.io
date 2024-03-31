import { metadataTmpl } from "@/data/metadata";
import DefaultMDX from "@/layouts/defaultMdx";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Publications",
};

export default async function Pubs() {
  return (
    <div>
      <DefaultMDX>
        <p>Under construction...</p>
      </DefaultMDX>
    </div>
  );
}
