import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { useMDXComponents } from "@/mdx-components";
import { metadataTmpl } from "@/data/metadata";
import { getAllMemberIds, getMember, getMemberMdxSrc } from "@/data/member";
import { getPubsByPerson } from "@/data/pub";
import { composeFullName } from "@/data/person";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLocationDot,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faGithub,
  faXTwitter,
  faFacebook,
  faInstagram,
  faGoogleScholar,
  faOrcid,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import DefaultMain from "@/layouts/defaultMain";
import PubList from "@/components/pubList";
config.autoAddCss = false;

interface Params {
  params: {
    memberId: string;
  };
}

export async function generateStaticParams() {
  const memberIds = await getAllMemberIds();
  return memberIds;
}

export async function generateMetadata({ params: { memberId } }: Params) {
  const member = await getMember(memberId);
  const fullname = composeFullName(member.person);
  return {
    ...metadataTmpl,
    title: metadataTmpl.title + " | Team | " + (fullname || memberId),
  };
}

export default async function MemberPage({ params: { memberId } }: Params) {
  const member = await getMember(memberId);
  const mdxSrc = await getMemberMdxSrc(memberId);
  const pubs = await getPubsByPerson(member.person.id);

  const {
    position,
    email,
    avatar,
    shortbio,
    office,
    gscholar,
    orcid,
    github,
    linkedin,
    twitter,
    facebook,
    instagram,
    youtube,
  } = member;
  const { firstname, lastname, externalLink } = member.person;
  const fullname = composeFullName(member.person);

  return (
    <DefaultMain>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        {/* let's have a sticky sidebar for avatar and contact info */}
        {/* sidebar becomes a normal section on top of page on small screens */}
        <div
          className={
            "flex flex-row justify-start gap-4 items-center content-center w-full py-2 " +
            "md:flex-none md:flex-col md:gap-2 md:w-[194pt] " +
            "md:sticky md:self-start md:top-0 md:max-h-screen md:overflow-y-auto"
          }
        >
          <div className="flex-none self-start md:self-center w-36 h-36 md:w-48 md:h-48 rounded-2xl ring ring-neutral overflow-clip">
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
                  {[firstname[0], lastname[0]].join("").toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-grow">
            <p className="text-lg font-bold md:text-center text-left">
              {fullname}
            </p>
            <p className="md:text-center text-left">{position}</p>
            {office && (
              <p className="md:text-center text-left">
                <FontAwesomeIcon icon={faLocationDot} />
                &nbsp;
                {office}
              </p>
            )}
            {email && (
              <p className="md:text-center text-left">
                <a href={"mailto:" + email}>
                  <FontAwesomeIcon icon={faEnvelope} />
                  &nbsp;
                  {email.replaceAll("@", " (at) ")}
                </a>
              </p>
            )}
            {(externalLink ||
              gscholar ||
              orcid ||
              github ||
              linkedin ||
              twitter ||
              facebook ||
              instagram ||
              youtube) && (
              <div className="flex flex-row w-full flex-wrap gap-x-2 gap-y-0 justify-start md:justify-center items-center content-center text-lg">
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
                {gscholar && (
                  <a
                    href={gscholar}
                    target="_blank"
                    className="tooltip"
                    data-tip="Google Scholar"
                  >
                    <FontAwesomeIcon icon={faGoogleScholar}></FontAwesomeIcon>
                  </a>
                )}
                {orcid && (
                  <a
                    href={orcid}
                    target="_blank"
                    className="tooltip"
                    data-tip="ORCiD"
                  >
                    <FontAwesomeIcon icon={faOrcid}></FontAwesomeIcon>
                  </a>
                )}
                {github && (
                  <a
                    href={github}
                    target="_blank"
                    className="tooltip"
                    data-tip="GitHub"
                  >
                    <FontAwesomeIcon icon={faGithub}></FontAwesomeIcon>
                  </a>
                )}
                {linkedin && (
                  <a
                    href={linkedin}
                    target="_blank"
                    className="tooltip"
                    data-tip="LinkedIn"
                  >
                    <FontAwesomeIcon icon={faLinkedin}></FontAwesomeIcon>
                  </a>
                )}
                {twitter && (
                  <a
                    href={twitter}
                    target="_blank"
                    className="tooltip"
                    data-tip="X (Twitter)"
                  >
                    <FontAwesomeIcon icon={faXTwitter}></FontAwesomeIcon>
                  </a>
                )}
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    className="tooltip"
                    data-tip="Instagram"
                  >
                    <FontAwesomeIcon icon={faInstagram}></FontAwesomeIcon>
                  </a>
                )}
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    className="tooltip"
                    data-tip="Facebook"
                  >
                    <FontAwesomeIcon icon={faFacebook}></FontAwesomeIcon>
                  </a>
                )}
                {youtube && (
                  <a
                    href={youtube}
                    target="_blank"
                    className="tooltip"
                    data-tip="Youtube"
                  >
                    <FontAwesomeIcon icon={faYoutube}></FontAwesomeIcon>
                  </a>
                )}
              </div>
            )}
            {shortbio && (
              <>
                <div className="divider"></div>
                <p>{shortbio}</p>
              </>
            )}
          </div>
        </div>
        <div className="flex-auto lg:max-w-[640px] 2xl:max-w-[1024px] md:py-4">
          {mdxSrc && (
            <div className="prose 2xl:prose-lg">
              <MDXRemote source={mdxSrc} components={useMDXComponents({})} />
            </div>
          )}
          <PubList pubs={pubs} />
        </div>
      </div>
    </DefaultMain>
  );
}
