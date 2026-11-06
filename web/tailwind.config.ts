import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#0a66c2", dark: "#0f2b4a" },
      },
    },
  },
  plugins: [],
};
export default config;
