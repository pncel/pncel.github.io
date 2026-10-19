"use client";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";
import { ContentWidth } from "@/layouts/pageMain";
import ThemeToggle from "./themeToggle";
import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

config.autoAddCss = false;

export default function NavAndDrawer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  interface NavDataSubType {
    title: string;
    target: string;
    ref: React.RefObject<HTMLAnchorElement>;
  }

  interface NavDataType {
    title: string;
    target: string | null;
    sub: NavDataSubType[];
  }

  const navData: NavDataType[] = [
    { title: "News", target: "/news", sub: [] },
    { title: "Blogs", target: "/blogs", sub: [] },
    /*
    {
      title: "Projects",
      target: null,
      sub: [
        {
          title: "All Projects",
          target: "/projects",
          ref: useRef<HTMLAnchorElement>(null),
        },
        {
          title: "PRGA",
          target: "/projects/prga",
          ref: useRef<HTMLAnchorElement>(null),
        },
        {
          title: "DORA",
          target: "/projects/dora",
          ref: useRef<HTMLAnchorElement>(null),
        },
      ],
    },
    */
    { title: "Publications", target: "/pubs", sub: [] },
    { title: "Team", target: "/team", sub: [] },
    { title: "Gallery", target: "/gallery", sub: [] },
    { title: "Join Us", target: "/join", sub: [] },
  ];

  const pathname = usePathname();
  const [isSideBarOpen, setIsSetBarOpen] = useState(false);
  const [activeNavSub, setActiveNavSub] = useState<string | null>(null);

  useEffect(() => {
    setIsSetBarOpen(false);
    setActiveNavSub(null);
  }, [pathname]);

  return (
    <body className="drawer">
      <input
        id="navDrawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isSideBarOpen}
        onChange={() => {}}
      />
      <div
        className={
          // base-200, not base-100: the page is the recessed surface so that
          // content laid on it (list entries, cards) can sit above it on
          // base-100. Entries have nowhere to rise to if the page takes the
          // brightest surface for itself.
          "drawer-content bg-base-200 text-base-content overflow-x-hidden " +
          "flex flex-col " +
          "h-screen overflow-y-auto" /* force creation of scrollable area */
        }
      >
        <div className="bg-base-300 w-full">
          <nav className="navbar justify-between mx-auto max-w-screen-2xl">
            <div className="flex grow flex-row justify-start gap-1">
              <div className="flex-none">
                <Link
                  className="btn btn-ghost"
                  href="/"
                  aria-label="PNCEL home"
                >
                  <span
                    className="block h-7 w-11 bg-current"
                    style={{
                      WebkitMaskImage: "url('/compact.svg')",
                      maskImage: "url('/compact.svg')",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                    }}
                  />
                </Link>
              </div>
              {navData.length > 0 && (
                <button
                  className="flex-none lg:hidden btn btn-square btn-ghost"
                  onClick={() => setIsSetBarOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-6 h-6 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </button>
              )}
              {navData.length > 0 && (
                <div className="flex-auto hidden lg:flex">
                  <ul className="menu menu-horizontal px-1">
                    {navData.map((item) => {
                      return (
                        <li key={item.title}>
                          {item.sub.length > 0 ? (
                            <div className="dropdown dropdown-bottom p-0">
                              <div
                                className="px-4 py-2"
                                role="button"
                                tabIndex={0}
                              >
                                {item.title}
                                <FontAwesomeIcon
                                  icon={faAngleDown}
                                  className="ml-2"
                                />
                              </div>
                              <div
                                tabIndex={0}
                                className="dropdown-content bg-base-300 rounded-lg rounded-t-none z-[1] pt-2"
                              >
                                <ul>
                                  {item.sub.map((i) => (
                                    <li key={i.title}>
                                      <Link
                                        href={i.target}
                                        className="text-nowrap"
                                        ref={i.ref}
                                        onClick={(e) => {
                                          i.ref!.current?.blur();
                                        }}
                                      >
                                        {i.title}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : item.target === null ? (
                            item.title
                          ) : (
                            <Link href={item.target}>{item.title}</Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex pr-2 gap-1">
              <div className="form-control hidden lg:flex">
                <input
                  disabled
                  type="text"
                  placeholder="Search"
                  className="input input-bordered w-64"
                />
              </div>
              <button className="btn btn-ghost btn-disabled lg:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <ThemeToggle></ThemeToggle>
            </div>
          </nav>
        </div>
        {children}
        <div className="bg-base-300 mt-8">
          <ContentWidth>
            <footer className="footer md:justify-between items-start gap-x-8 gap-y-6 py-8 text-base-content">
              <aside className="max-w-md">
                <Link href="/" aria-label="PNCEL home">
                  <span
                    className="block w-48 aspect-[390/130] bg-current"
                    style={{
                      WebkitMaskImage: "url('/logo.svg')",
                      maskImage: "url('/logo.svg')",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "left center",
                      maskPosition: "left center",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                    }}
                  />
                </Link>
                {/*
                <p>
                  Computer architecture for ubiquitous intelligence, built and
                  measured in real silicon.
                </p>
                */}
                <p>
                  Department of Electrical &amp; Computer Engineering
                  <br />
                  University of Washington, Seattle
                </p>
              </aside>
              {/* Built from the same navData as the top bar, so the two can never
                drift apart. A dropdown with no page of its own falls back to
                its first child. */}
              <nav>
                <h2 className="footer-title">Explore</h2>
                <div className="grid grid-flow-col grid-rows-3 gap-x-10 gap-y-2">
                  {navData.map((item) => {
                    const target = item.target ?? item.sub[0]?.target;
                    return (
                      target && (
                        <Link
                          className="link link-hover"
                          href={target}
                          key={item.title}
                        >
                          {item.title}
                        </Link>
                      )
                    );
                  })}
                </div>
              </nav>
            </footer>
          </ContentWidth>
          {/* The legal line keeps the full window width, so its rule reads as
              the bottom edge of the page rather than of the footer column. */}
          <div className="border-t border-base-content/10">
            <p className="px-4 py-3 text-center text-sm text-base-content/70">
              Copyright © 2024&ndash;2026 PᴺCEL. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      <div className="drawer-side">
        <div
          className="drawer-overlay"
          onClick={() => setIsSetBarOpen(false)}
        ></div>
        <ul className="menu p-4 w-64 min-h-full bg-base-300">
          {navData.map((item) => (
            <li key={item.title}>
              {item.target ? (
                <>
                  <Link href={item.target}>{item.title}</Link>
                  {item.sub.length > 0 && (
                    <ul>
                      {item.sub.map((i) => (
                        <li key={i.title}>
                          <Link href={i.target}>{i.title}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : item.sub.length > 0 ? (
                <details open>
                  <summary>{item.title}</summary>
                  <ul>
                    {item.sub.map((i) => (
                      <li key={i.title}>
                        <Link href={i.target}>{i.title}</Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <h2 className="menu-title">{item.title}</h2>
              )}
            </li>
          ))}
        </ul>
      </div>
    </body>
  );
}
