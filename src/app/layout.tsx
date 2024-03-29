import React from "react";
import type { Metadata } from "next";
import "./globals.css";

import Nav from "./nav";
import Footer from "./footer";
import { ContextProvider } from "./context";

export const metadata: Metadata = {
  title: "PᴺCEL | Home",
  description:
    "PNCEL: {Programmable, Parallel, high-Performance, Power-efficient, ...} Computer Engineering Lab at University of Washington (UW)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.StrictMode>
      <ContextProvider>
        <body className="min-h-screen flex flex-col bg-base-100 text-base-content">
          <Nav></Nav>
          <main className="grow-1 flex-auto container mx-auto p-4">
            {children}
          </main>
          <Footer></Footer>
        </body>
      </ContextProvider>
    </React.StrictMode>
  );
}