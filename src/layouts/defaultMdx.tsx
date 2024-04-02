import React from "react";

export default function DefaultMDX({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="prose 2xl:prose-lg max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl  mx-auto">
      {children}
    </div>
  );
}
