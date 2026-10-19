import React from "react";

/**
 * Centres its children in the column the page content lives in.
 *
 * `DefaultMain` is this plus the flex sizing the main slot needs, and the
 * footer uses it directly so its columns line up with the body copy. Keeping
 * the breakpoint chain in one component -- rather than in a class string passed
 * around -- means there is a single place to change the page width.
 */
export default function ContentContainer({
  children,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={
        "mx-auto max-lg:px-4 " +
        "w-full max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl " +
        className
      }
    >
      {children}
    </div>
  );
}
