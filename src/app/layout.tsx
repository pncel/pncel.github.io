import type { Metadata } from "next";
import "./globals.css";

import Nav from "./nav";
import Footer from "./footer";

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
        <main className="container mx-auto bg-base-100 text-base-content">
          {children}
        </main>
        <Footer ></Footer>
      </body>
    </html>
  );
}

