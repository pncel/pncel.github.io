import React from "react";

export default function DefaultMDX({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="prose lg:max-w-screen-md 2xl:max-w-screen-lg 2xl:prose-lg mx-auto">
      {children}
    </div>
  );
}
