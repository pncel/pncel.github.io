import type { Metadata } from "next";
import "./globals.css";

import Nav from "./nav";

export const metadata: Metadata = {
  title: "PᴺCEL | Home",
  description: "PNCEL: {Programmable, Parallel, high-Performance, Power-efficient, ...} Computer Engineering Lab at University of Washington (UW)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Nav ></Nav>
        <main className="container mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}

