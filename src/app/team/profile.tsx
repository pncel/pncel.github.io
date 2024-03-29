import Image from "next/image";
import React from "react";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub, faXTwitter, faFacebook, faInstagram, faGoogleScholar, faOrcid, faYoutube } from "@fortawesome/free-brands-svg-icons";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { gscholarSvg, orcidSvg } from "./icons";
config.autoAddCss = false;

export default function Profile({
  children,

  // required arguments
  name, // your name!
  position, // your position in the lab -- PI, PhD student, etc.
  avatar, // photo filename under /public/avatar, e.g. "ang.jpg"
  email, // email

  // optional arguments with default values
  shortbio = "", // short bio
  office = null, // office address. can be null if no office or not on campus

  // optional links to professional network websites
  gscholar = null,
  orcid = null,
  github = null,
  linkedin = null,

  // optional links to other social media websites
  twitter = null,
  facebook = null,
  instagram = null,
  youtube = null,
}: Readonly<{
  children: React.ReactNode;
  name: string;
  position: string;
  avatar: string;
  email: string;
  shortbio: string;
  office: string | null;
  linkedin: string | null;
  github: string | null;
  gscholar: string | null;
  orcid: string | null;
  twitter: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
}>) {
  return (
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
        <div className="avatar flex-none self-start md:self-center">
          <div className="w-36 h-36 md:w-48 md:h-48 rounded-2xl">
            <Image className="m-0" src={avatar} alt={name}></Image>
          </div>
        </div>
        <div className="flex-grow">
          <p className="text-lg font-bold md:text-center text-left">{name}</p>
          <p className="md:text-center text-left">{position}</p>
          {office && (
            <p className="md:text-center text-left">
              <FontAwesomeIcon icon={faLocationDot} />
              &nbsp;
              {office}
            </p>
          )}
          <p className="md:text-center text-left">
            <a href={"mailto:" + email}>
              <FontAwesomeIcon icon={faEnvelope} />
              &nbsp;
              {email.replaceAll("@", " (at) ")}
            </a>
          </p>
          <div className="flex flex-row h-8 w-full gap-2 justify-start md:justify-center items-center content-center text-lg">
            {gscholar && (
              <a href={gscholar} target="_blank" className="tooltip" data-tip="Google Scholar">
                <FontAwesomeIcon icon={faGoogleScholar}></FontAwesomeIcon>
              </a>
            )}
            {orcid && (
              <a href={orcid} target="_blank" className="tooltip" data-tip="ORCiD">
                <FontAwesomeIcon icon={faOrcid}></FontAwesomeIcon>
              </a>
            )}
            {github && (
              <a href={github} target="_blank" className="tooltip" data-tip="GitHub">
                <FontAwesomeIcon icon={faGithub}></FontAwesomeIcon>
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" className="tooltip" data-tip="LinkedIn">
                <FontAwesomeIcon icon={faLinkedin}></FontAwesomeIcon>
              </a>
            )}
            {twitter && (
              <a href={twitter} target="_blank" className="tooltip" data-tip="X (Twitter)">
                <FontAwesomeIcon icon={faXTwitter}></FontAwesomeIcon>
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" className="tooltip" data-tip="Instagram">
                <FontAwesomeIcon icon={faInstagram}></FontAwesomeIcon>
              </a>
            )}
            {facebook && (
              <a href={facebook} target="_blank" className="tooltip" data-tip="Facebook">
                <FontAwesomeIcon icon={faFacebook}></FontAwesomeIcon>
              </a>
            )}
            {youtube && (
              <a href={youtube} target="_blank" className="tooltip" data-tip="Youtube">
                <FontAwesomeIcon icon={faYoutube}></FontAwesomeIcon>
              </a>
            )}
          </div>
          {shortbio && (
            <>
              <div className="divider">Short Bio</div>
              <p>{shortbio}</p>
            </>
          )}
        </div>
      </div>
      <div className="flex-auto prose-sm md:prose lg:prose-lg xl:prose-xl 2xl:prose-2xl md:py-4">
        {children}
      </div>
    </div>
  );
}
