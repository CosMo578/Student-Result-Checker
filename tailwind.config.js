const flowbite = require("flowbite-react/tailwind");
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-100": "#35a767",
        "primary-200": "#1b9c54",
        "primary-300": "#029141",
        "primary-400": "#02833b",
        "primary-500": "#027434",
        "primary-600": "#01662e",
        "secondary-100": "#fff834",
        "secondary-200": "#fff71a",
        "secondary-300": "#fff601",
        "secondary-400": "#e6dd01",
        "secondary-500": "#ccc501",
        "secondary-600": "#b3ac01",
      },
    },
  },
  plugins: [],
};
