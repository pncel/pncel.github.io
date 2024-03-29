import Link from "next/link";
import ThemeToggle from "./themeToggle";
import React from "react";

export default function NavAndDrawer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  interface NavDataSubType {
    title: string,
    target: string,
  };

  interface NavDataType {
    title: string,
    target: string | null,
    sub: NavDataSubType[],
  };

  const navData: NavDataType[] = [
    { title: "News", target: "/news", sub: [] },
    { title: "Blogs", target: "/blogs", sub: [] },
    {
      title: "Projects",
      target: null,
      sub: [{ title: "All Projects", target: "/projects" }],
    },
    { title: "Publications", target: "/pubs", sub: [] },
    { title: "Team", target: "/team", sub: [] },
  ];

  return (
    <body className="drawer">
      <input id="navDrawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-base-100 text-base-content flex flex-col min-h-screen">
        <div className="bg-neutral w-full">
          <nav className="navbar text-neutral-content justify-between container mx-auto">
            <div className="flex grow flex-row justify-start gap-1">
              <div className="flex-none">
                <Link className="btn btn-ghost text-xl" href="/">
                  PᴺCEL
                </Link>
              </div>
              {navData.length > 0 && (
                <div className="flex-none lg:hidden tooltip tooltip-bottom" data-tip="Open sidebar">
                  <label
                    htmlFor="navDrawer"
                    aria-label="open navigation sidebar"
                    className="btn btn-square btn-ghost"
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
                  </label>
                </div>
              )}
              {navData.length > 0 && (
                <div className="flex-auto hidden lg:flex">
                  <ul className="menu menu-horizontal px-1">
                    {navData.map((item) => {
                      return (
                        <li key={item.title}>
                          {item.sub.length > 0 ? (
                            <details className="z-20">
                              <summary>{item.title}</summary>
                              <ul className="bg-neutral text-neutral-content rounded-t-none">
                                {item.sub.map((i) => (
                                  <li key={i.title}>
                                    <Link
                                      href={i.target}
                                      className="text-nowrap"
                                    >
                                      {i.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </details>
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
            <div className="flex navbar-end pr-2 gap-1">
              <div className="form-control hidden lg:flex">
                <input
                  type="text"
                  placeholder="Search"
                  className="input input-bordered w-64"
                />
              </div>
              <button className="btn btn-ghost lg:hidden">
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
      </div>
      <div className="drawer-side">
        <label
          htmlFor="navDrawer"
          aria-label="close navigation sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu p-4 w-64 min-h-full bg-base-200">
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
