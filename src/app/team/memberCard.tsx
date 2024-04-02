import React from "react";
import Image from "next/image";
import Link from "next/link";
import { composeMemberName } from "@/data/team";

export default function MemberCard({
  member: { id, firstname, middlename, lastname, position, avatar, shortbio },
}: Readonly<{
  member: Member;
}>) {
  const name = composeMemberName(firstname, middlename, lastname);

  return (
    <div className="shadow-xl rounded-xl overflow-clip w-full break-inside-avoid-column mb-4">
      <Link href={`/team/${id}`}>
        <div className="w-full p-4 gap-8 m-0 flex flex-row items-center bg-neutral">
          <div className="flex-none rounded-full w-24 h-24 overflow-clip">
            {avatar ? (
              <div className="avatar">
                <Image width={512} height={512} src={avatar} alt={name}></Image>
              </div>
            ) : (
              <div className="avatar placeholder bg-base-300 w-full h-full">
                <span className="text-3xl text-base-content m-auto">
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
          <div className="flex flex-col justify-center items-start text-neutral-content">
            <h2 className="text-lg lg:text-xl font-bold">{name}</h2>
            <p className="text-sm lg:text-base">{position}</p>
          </div>
        </div>
        {shortbio && (
          <div className="w-full p-4 bg-secondary text-secondary-content">
            <p>{shortbio}</p>
          </div>
        )}
      </Link>
    </div>
  );
}
