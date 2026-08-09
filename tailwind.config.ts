import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        foam: "var(--foam)",
        mist: "var(--mist)",
        lime: "var(--lime)",
        "lime-deep": "var(--lime-deep)",
        tide: "var(--tide)",
        sand: "var(--sand)",
        ember: "var(--ember)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(200,245,96,0.35), 0 20px 50px rgba(7,26,20,0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
