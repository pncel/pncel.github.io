"use client";
import React, { createContext, useState, useEffect } from "react";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";

// Self-hosted at build time, so there is no render-blocking request to Google
// and no layout shift. `variable` exposes each as a CSS custom property that
// tailwind.config.ts puts at the head of the matching stack.
// Source Sans 3 and Source Serif 4 are one superfamily, drawn to share metrics.
// Source Sans also sets ~12% narrower than Inter at the same size (avg advance
// 0.456 vs 0.518 em), which keeps long author lists on fewer lines.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Carries the serif voice the slogan already asked for with `font-serif`.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

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
      <html
        lang="en"
        data-theme={useDarkTheme ? "dim" : "emerald"}
        className={`${sourceSans.variable} ${sourceSerif.variable}`}
      >
        {children}
      </html>
    </DataContext.Provider>
  );
}

export default DataContext;
