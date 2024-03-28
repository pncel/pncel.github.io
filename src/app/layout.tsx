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
        <Nav></Nav>
        <main className="container mx-auto bg-base-100 text-base-content">
          {children}
        </main>
        <Footer></Footer>
      </ContextProvider>
    </React.StrictMode>
  );
}