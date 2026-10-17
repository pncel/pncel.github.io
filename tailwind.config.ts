import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/mdx-components.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Both variables are set on <html> by next/font in src/app/context.tsx.
        // The default stacks stay behind them so nothing breaks if one is missing.
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-serif)", ...defaultTheme.fontFamily.serif],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        tiny: "400px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    // Base ramps are overridden in both themes so that `base-100` is the lifted
    // content surface and `base-200` the page behind it (daisyUI's own model --
    // see navAndDrawer's drawer-content). Stock values are kept for everything
    // else. The two ramps are tuned to give comparable stripe separation:
    // emerald 100.0/97.2/93.2, dim 34.7/29.6/25.5 (OKLCH L).
    themes: [
      {
        dim: {
          ...require("daisyui/src/theming/themes")["dim"],
          // Stock dim spans only 4.5 L across the whole base ramp (30.9 -> 26.3),
          // about a third of a light theme's range, which leaves the zebra too
          // faint to read. Widened to 9.3 L.
          "base-100": "#323a49",
          "base-200": "#272d38",
          "base-300": "#1e232b",
        },
      },
      {
        emerald: {
          ...require("daisyui/src/theming/themes")["emerald"],
          success: require("daisyui/src/theming/themes")["emerald"]["primary"],
          // Stock emerald's base-200/300 are chroma 0 -- neutral grey in a theme
          // whose primary is green. Tinted toward that green instead.
          "base-100": "#ffffff",
          "base-200": "#f2f7f4",
          "base-300": "#e2ebe6",
        },
      },
    ],
  },
  safelist: ["columns-1", "columns-2", "columns-3", "italic"],
};
export default config;
