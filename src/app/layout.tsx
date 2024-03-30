import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { metadataTmpl } from "@/data/metadata";

import NavAndDrawer from "@/components/navAndDrawer";
import Footer from "@/components/footer";
import { ContextProvider } from "@/components/context";

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
          <main className="grow-1 flex-auto container mx-auto p-4">
            {children}
          </main>
          <Footer></Footer>
        </NavAndDrawer>
      </ContextProvider>
    </React.StrictMode>
  );
}