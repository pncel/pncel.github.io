import { metadataTmpl } from "@/data/metadata";
import DefaultMDX from "@/layouts/defaultMdx";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Blogs",
};

export default async function Blogs() {
  return (
    <div>
      <DefaultMDX>
        <p>Under construction...</p>
      </DefaultMDX>
    </div>
  );
}
