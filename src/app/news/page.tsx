import { metadataTmpl } from "@/data/metadata";
import DefaultMDX from "@/layouts/defaultMdx";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | News",
};

export default async function News() {
  return (
    <div>
      <DefaultMDX>
        <p>Under construction...</p>
      </DefaultMDX>
    </div>
  );
}
