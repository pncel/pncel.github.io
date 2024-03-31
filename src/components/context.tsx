"use client";
import React, { createContext, useState, useEffect } from "react";

export interface DataContextType {
  useDarkTheme: boolean;
  setAndSaveUseDarkTheme: (newUseDarkTheme: boolean) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function ContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // useDarkTheme
  const [useDarkTheme, setUseDarkTheme] = useState(true);

  const setAndSaveUseDarkTheme = (newUseDarkTheme: boolean): void => {
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
    <DataContext.Provider
      value={{
        useDarkTheme,
        setAndSaveUseDarkTheme,
      }}
    >
      <html lang="en" data-theme={useDarkTheme ? "dim" : "emerald"}>
        {children}
      </html>
    </DataContext.Provider>
  );
}

export default DataContext;
