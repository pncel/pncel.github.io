import React from "react";

export default function TeamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="prose py-4">
      {children}
    </div>
  );
}
