import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { metadataTmpl } from "@/data/metadata";

import NavAndDrawer from "./navAndDrawer";
import Footer from "./footer";
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
        <NavAndDrawer>
          <main className="grow-1 flex-auto container mx-auto max-w-screen-xl p-4">
            {children}
          </main>
          <Footer></Footer>
        </NavAndDrawer>
      </ContextProvider>
    </React.StrictMode>
  );
}
