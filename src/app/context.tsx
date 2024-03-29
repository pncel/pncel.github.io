"use client";
import React, { createContext, useState, useEffect } from "react";

const DataContext = createContext(null);

export function ContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // useDarkTheme
  const [useDarkTheme, setUseDarkTheme] = useState(true);

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
      setAndSaveUseDarkTheme(true);
    } else {
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
        {children}
      </html>
    </DataContext.Provider>
  );
}

export default DataContext;
