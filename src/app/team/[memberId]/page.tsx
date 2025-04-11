import Image from "next/image";
import { readFile } from "fs/promises";
import { MDXRemote } from "next-mdx-remote/rsc";
import { useMDXComponents } from "@/mdx-components";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLocationDot,
  faGlobe,
  faQuoteLeft,
  faBook,
} from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import PubList, { PubListFootnote } from "@/components/pubList";
import DefaultMDX from "@/layouts/defaultMdx";
import DefaultMain from "@/layouts/defaultMain";
import Link from "next/link";
import { Database } from "@/data/database";
import {
  metadataTmpl,
  composeFullName,
  composeAvatarPlaceholder,
} from "@/data/utils";
import SelectedFontAwesomeIcon from "@/components/icon";
import { Icon } from "@/data/types";
config.autoAddCss = false;

interface Params {
  params: {
    memberId: string;
  };
}

export async function generateStaticParams() {
  const db = await Database.get();
  const memberIds = (await db.getManyMembers()).map((m) => ({
    memberId: m.id,
  }));
  return memberIds;
}

export async function generateMetadata({ params: { memberId } }: Params) {
  const db = await Database.get();
  const member = await db.getMember(memberId);
  const fullname = composeFullName(member);
  return {
    ...metadataTmpl,
    title: metadataTmpl.title + " | Team | " + (fullname || memberId),
  };
}

async function getMemberMdxSrc(memberId: string) {
  // get mdx if there is one
  const mdxSrc = await readFile(
    process.cwd() + `/src/app/team/[memberId]/${memberId}.mdx`,
    "utf-8",
  ).catch((e) => {
    if (e.code == "ENOENT") {
      return null; // if no file, just return null
    } else {
      throw e;
    }
  });

  return mdxSrc;
}

export default async function MemberPage({ params: { memberId } }: Params) {
  const db = await Database.get();
  const member = await db.getMember(memberId);
  const fullname = composeFullName(member);
  const placeholder = composeAvatarPlaceholder(member);
  const pubs = await (member.memberInfo.selectedPubIds
    ? db.getManyPublications(member.memberInfo.selectedPubIds)
    : db.getAllPublicationsByPerson(member.id));
  const mdxSrc = await getMemberMdxSrc(memberId);
  const {
    avatar,
    externalLink,
    memberInfo: { position, email, office },
  } = member;
  const useSelectedPubs = member.memberInfo.selectedPubIds !== undefined;

  return (
    <DefaultMain className="flex flex-col lg:flex-row gap-2 lg:gap-6">
      {/* let's have a sticky sidebar for avatar and contact info */}
      {/* sidebar becomes a normal section on top of page on small screens */}
      <div
        className={
          /* as the element in the parent flex container */
          "self-start flex-none " +
          /* flex container */
          "flex justify-start items-center content-center py-4 " +
          "flex-row lg:flex-col gap-4 lg:gap-2 " +
          /* put on top for small screens; sticky for large screens */
          "w-full lg:w-[200px] " +
          "lg:sticky lg:top-0 lg:overflow-y-auto "
        }
      >
        <div
          className={
            "flex-none self-start lg:self-center w-36 h-36 lg:w-48 lg:h-48 " +
            "rounded-2xl ring ring-neutral overflow-clip"
          }
        >
          {avatar ? (
            <div className="avatar w-full h-full">
              <Image
                className="m-0"
                width={512}
                height={512}
                src={avatar}
                alt={fullname}
                objectFit="cover"
              ></Image>
            </div>
          ) : (
            <div className="avatar placeholder bg-base-300 w-full h-full">
              <span className="text-3xl text-base-content m-auto">
                {placeholder}{" "}
              </span>
            </div>
          )}
        </div>
        <div className="max-lg:flex-grow">
          <p className="text-lg font-bold lg:text-center text-left">
            {fullname}
          </p>
          {position && <p className="lg:text-center text-left">{position}</p>}
          {office && (
            <p className="lg:text-center text-left">
              <FontAwesomeIcon icon={faLocationDot} />
              &nbsp;
              {office}
            </p>
          )}
          {email && (
            <p className="lg:text-center text-left">
              <a href={"mailto:" + email}>
                <FontAwesomeIcon icon={faEnvelope} />
                &nbsp;
                {email.replaceAll("@", " (at) ")}
              </a>
            </p>
          )}
          {(externalLink || member.memberInfo.links?.length) && (
            <div
              className={
                "flex flex-row w-full flex-wrap gap-x-2 gap-y-0 " +
                "justify-start lg:justify-center items-center content-center text-lg"
              }
            >
              {externalLink && (
                <a
                  href={externalLink}
                  target="_blank"
                  className="tooltip"
                  data-tip="Personal Website"
                >
                  <FontAwesomeIcon icon={faGlobe}></FontAwesomeIcon>
                </a>
              )}
              {member.memberInfo.links?.map((l, i) =>
                l.label ? (
                  <a
                    href={l.link}
                    target="_blank"
                    className="tooltip"
                    data-tip={l.label}
                    key={i}
                  >
                    <SelectedFontAwesomeIcon icon={l.icon || Icon.link} />
                  </a>
                ) : (
                  <a href={l.link} target="_blank" key={i}>
                    <SelectedFontAwesomeIcon icon={l.icon || Icon.link} />
                  </a>
                ),
              )}
            </div>
          )}
        </div>
        <div className="divider max-lg:hidden"></div>
        <ul className="menu w-full max-lg:hidden">
          <li>
            <Link href="#personal-statement">
              <FontAwesomeIcon icon={faQuoteLeft} /> Personal Statement
            </Link>
          </li>
          {pubs.length > 0 && (
            <li>
              <Link href={`#${useSelectedPubs ? "selected-" : ""}publications`}>
                <FontAwesomeIcon icon={faBook} />{" "}
                {useSelectedPubs ? "Selected" : ""} Publications
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className="flex-grow min-w-0 lg:max-w-screen-sm xl:max-w-screen-md 2xl:max-w-screen-lg lg:py-4">
        <DefaultMDX>
          <h2 id="personal-statement">
            <FontAwesomeIcon icon={faQuoteLeft} /> Personal Statement
          </h2>
          <div className="pl-4">
            <MDXRemote
              source={mdxSrc || "This person is busy changing the world..."}
              components={useMDXComponents({})}
            />
          </div>
        </DefaultMDX>
        {pubs.length > 0 && (
          <>
            <div className="divider"></div>
            <DefaultMDX className="py-4">
              <div className="flex justify-between items-baseline">
                <h2
                  className="mt-0"
                  id={`#${useSelectedPubs ? "selected-" : ""}publications`}
                >
                  <FontAwesomeIcon icon={faBook} />{" "}
                  {useSelectedPubs ? "Selected" : ""} Publications
                </h2>
                {useSelectedPubs && (
                  <Link
                    className="btn btn-sm btn-ghost sm:text-xl text-lg"
                    href={`/pubs/${memberId}`}
                  >
                    Full publication list
                  </Link>
                )}
              </div>
            </DefaultMDX>
            <div className="pl-4">
              <PubList pubs={pubs} highlightedPersonId={member.id} />
              <PubListFootnote />
            </div>
          </>
        )}
      </div>
    </DefaultMain>
  );
}
