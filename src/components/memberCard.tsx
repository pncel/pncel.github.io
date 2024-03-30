import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function MemberCard({
  member: { id, firstname, lastname, position, avatar },
}: Readonly<{
  member: Member;
}>) {
  return (
    <Link href={`/team/${id}`}>
      <div className="card card-compact w-44 md:w-56 bg-neutral shadow-xl">
        <figure className="px-4 pt-4">
          {avatar ? (
            <div className="avatar">
              <div className="w-36 h-36 md:w-48 md:h-48 rounded-2xl">
                <Image
                  className="m-0"
                  width={512}
                  height={512}
                  src={avatar}
                  alt={firstname + " " + lastname}
                ></Image>
              </div>
            </div>
          ) : (
            <div className="avatar placeholder">
              <div className="w-36 h-36 md:w-48 md:h-48 rounded-2xl">
                <span className="text-3xl">
                  {[firstname[0], lastname[0]].join("").toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </figure>
        <div className="card-body items-center text-center">
          <h2 className="card-title">{firstname + " " + lastname}</h2>
          <p>{position}</p>
        </div>
      </div>
    </Link>
  );
}