import { metadataTmpl } from "@/data/metadata";
import DefaultMDX from "@/layouts/defaultMdx";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Projects",
};

export default async function Projects() {
  return (
    <div>
      <DefaultMDX>
        <p>Under construction...</p>
      </DefaultMDX>
    </div>
  );
}
