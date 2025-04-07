import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { metadataTmpl } from "@/data/utils";

import NavAndDrawer from "./navAndDrawer";
import { ContextProvider } from "./context";

export const metadata: Metadata = {
  ...metadataTmpl,
  title: metadataTmpl.title + " | Home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.StrictMode>
      <ContextProvider>
        <NavAndDrawer>{children}</NavAndDrawer>
      </ContextProvider>
    </React.StrictMode>
  );
}
