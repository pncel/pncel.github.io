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
    <Link
      href={`/team/${id}`}
      className="w-full tiny:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-4"
    >
      <div className="card card-compact bg-neutral shadow-xl rounded-2xl">
        <figure>
          {avatar ? (
            <div className="avatar">
              <Image width={512} height={512} src={avatar} alt={name}></Image>
            </div>
          ) : (
            <div className="avatar placeholder bg-base-200 w-full aspect-square">
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
        </figure>
        <div className="card-body text-neutral-content text-center mx-auto">
          <h2 className="text-base lg:text-lg">{name}</h2>
          <p className="text-sm lg:text-base">{position}</p>
        </div>
      </div>
    </Link>
  );
}
