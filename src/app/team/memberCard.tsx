import React from "react";
import Image from "next/image";
import Link from "next/link";
import { composeFullName, composeHeadshotPlaceholder } from "@/data/utils";
import { Member, Person } from "@/data/newtypes";

export default async function MemberCard({
  member,
  person,
}: Readonly<{ member: Member; person: Person }>) {
  const { id, position } = member;
  const fullname = composeFullName(person);
  const placeholder = composeHeadshotPlaceholder(person);
  const { headshot } = person;

  return (
    <div
      className={
        "w-full max-w-sm mb-4 mx-auto " +
        "shadow-xl rounded-xl overflow-clip break-inside-avoid-column"
      }
    >
      <Link href={`/team/${id}`}>
        <div className="w-full p-4 gap-8 m-auto flex flex-row items-center bg-neutral">
          <div
            className={
              "flex-none rounded-full w-24 h-24 overflow-clip" +
              (headshot ? "" : " ring-2 ring-secondary")
            }
          >
            {headshot ? (
              <div className="headshot">
                <Image
                  width={512}
                  height={512}
                  src={headshot}
                  alt={fullname}
                ></Image>
              </div>
            ) : (
              <div className="headshot placeholder bg-base-300 w-full h-full">
                <span className="text-3xl text-base-content m-auto">
                  {placeholder}{" "}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center items-start text-neutral-content">
            <h2 className="text-md lg:text-lg font-bold">{fullname}</h2>
            <p className="text-sm lg:text-md text-neutral-content/60">
              {position}
            </p>
          </div>
        </div>
        {/*
        {shortbio && (
          <div className="w-full p-4 bg-secondary text-secondary-content">
            <p>{shortbio}</p>
          </div>
        )}
          */}
      </Link>
    </div>
  );
}
