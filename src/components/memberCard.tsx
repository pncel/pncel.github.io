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
      <div className="card card-compact bg-neutral shadow-xl w-36 md:w-56">
        <figure className="px-2 pt-2 md:px-4 md:pt-4">
          {avatar ? (
            <div className="avatar">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl">
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
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-base-100">
                <span className="text-3xl text-base-content">
                  {[firstname[0], lastname[0]].join("").toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </figure>
        <div className="card-body items-center text-center text-neutral-content">
          <h2 className="card-title text-base md:text-lg">
            {firstname + " " + lastname}
          </h2>
          <p className="text-sm md:text-base">{position}</p>
        </div>
      </div>
    </Link>
  );
}
