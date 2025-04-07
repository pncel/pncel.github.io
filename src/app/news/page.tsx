import { metadataTmpl } from "@/data/utils";
import DefaultMain from "@/layouts/defaultMain";
import DefaultMDX from "@/layouts/defaultMdx";

export const metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | News",
};

export default async function News() {
  return (
    <DefaultMain>
      <DefaultMDX>
        <h1>News</h1>
        <p>Under construction...</p>
      </DefaultMDX>
    </DefaultMain>
  );
}
