import React from "react";
import Image from "next/image";
import Link from "next/link";
import { composeMemberName } from "@/data/team";

export default function MemberCard({
  member: { id, firstname, middlename, lastname, position, avatar },
}: Readonly<{
  member: Member;
}>) {
  const name = composeMemberName(firstname, middlename, lastname);

  return (
    <Link href={`/team/${id}`}>
      <div className="bg-neutral shadow-xl h-36 w-72 lg:h-40 lg:w-80 rounded-2xl flex flex-row justify-start items-center gap-0">
        <div className="p-1.5 h-36 w-36 lg:p-2 lg:w-40 lg:h-40">
          {avatar ? (
            <div className="avatar rounded-xl overflow-hidden">
              <Image
                className="m-0"
                width={512}
                height={512}
                src={avatar}
                alt={name}
              ></Image>
            </div>
          ) : (
            <div className="avatar placeholder bg-base-100 w-full h-full rounded-xl">
              <span className="text-3xl text-base-content mx-auto my-auto">
                {[firstname, lastname]
                  .filter((s) => s !== undefined)
                  .filter((s) => s) // make sure it's not an empty string
                  .map((s) => s[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-grow flex flex-col justify-center items-center text-center text-neutral-content">
          <h2 className="text-base lg:text-lg">{name}</h2>
          <p className="text-sm lg:text-base">{position}</p>
        </div>
      </div>
    </Link>
  );
}
