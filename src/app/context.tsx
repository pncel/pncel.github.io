"use client";
import React, { createContext, useState, useEffect } from "react";

const DataContext = createContext(null);

export function ContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // useDarkTheme
  const [useDarkTheme, setUseDarkTheme] = useState(false);

  const setAndSaveUseDarkTheme = (newUseDarkTheme: boolean) => {
    setUseDarkTheme(newUseDarkTheme);
    localStorage.setItem("theme", newUseDarkTheme ? "dark" : "light");
  };

  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      console.log(
        "initialized to dark mode b/c of %s",
        localStorage.theme === "dark" ? "storage" : "media"
      );
      setAndSaveUseDarkTheme(true);
    } else {
      console.log(
        "initialized to light mode b/c of %s",
        localStorage.theme === "light" ? "storage" : "else"
      );
      setAndSaveUseDarkTheme(false);
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        setAndSaveUseDarkTheme(e.matches);
      });
  }, []);

  return (
    <DataContext.Provider value={{ useDarkTheme, setAndSaveUseDarkTheme }}>
      <html lang="en" data-theme={useDarkTheme ? "dim" : "cupcake"}>
        <body>{children}</body>
      </html>
    </DataContext.Provider>
  );
}

export default DataContext;
