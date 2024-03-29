import React from "react";
import type { Metadata } from "next";
import "./globals.css";

import NavAndDrawer from "@/components/navAndDrawer";
import Footer from "@/components/footer";
import { ContextProvider } from "@/components/context";

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
        <NavAndDrawer>
          <main className="grow-1 flex-auto container mx-auto my-4">
            {children}
          </main>
          <Footer></Footer>
        </NavAndDrawer>
      </ContextProvider>
    </React.StrictMode>
  );
}