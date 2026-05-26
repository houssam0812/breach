import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        breach: {
          orange: "#FF4500",
          "orange-dark": "#CC3700",
          blue: "#0079D3",
          "blue-light": "#24A0ED",
          dark: "#1A1A1B",
          "dark-secondary": "#272729",
          border: "#343536",
          text: "#D7DADC",
          "text-muted": "#818384",
          surface: "#1A1A1B",
          card: "#272729",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
