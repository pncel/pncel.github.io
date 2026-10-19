import React from "react";
import ContentContainer from "@/layouts/contentContainer";

export default function DefaultMain({
  children,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <ContentContainer
      className={"flex-grow flex-shrink-0 basis-auto py-4 " + className}
    >
      {children}
    </ContentContainer>
  );
}
