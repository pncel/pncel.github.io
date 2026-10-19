import React from "react";

/**
 * Centres its children in the column the page content lives in.
 *
 * Exported because the footer needs that column without the main slot's flex
 * sizing: it lines its own columns up with the body copy, and sharing one
 * component is what stops the two from drifting apart.
 */
export function ContentWidth({
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

/**
 * The page's main slot: the content column, grown to fill the drawer so the
 * footer stays at the bottom on short pages.
 */
export default function PageMain({
  children,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <ContentWidth
      className={"flex-grow flex-shrink-0 basis-auto py-4 " + className}
    >
      {children}
    </ContentWidth>
  );
}
