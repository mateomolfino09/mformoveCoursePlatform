/** @type {import('tailwindcss').Config} */
module.exports = {

  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layout/**/*.{js,ts,jsx,tsx,mdx}',
    './src/common/**/*.{js,ts,jsx,tsx,mdx}',
    
  ],
  theme: {
    fontFamily: {
      boldFont: ["var(--font-boldfont)"],
      montserrat: ["var(--font-montserrat)"]
    },
    extend: {
      backgroundImage: {
        'gradient-to-b':
          'linear-gradient(to bottom,rgba(20,20,20,0) 0,rgba(20,20,20,.15) 15%,rgba(20,20,20,.35) 29%,rgba(20,20,20,.58) 44%,#141414 68%,#141414 100%);',
          'gradient-to-w':
          'linear-gradient(to bottom,rgba(255,255,255,0) 0,rgba(255,255,255,.15) 20%,rgba(255,255,255,.35) 40%,rgba(255,255,255,.58) 44%,#ffff 68%,#ffff 100%);'
      },
      colors: {
        'light-cream': '#FFFDFD',
        'rich-black': '#0D0D0D',
        'chill-black': '#293132',
        'light-white': '#FFFDFD',
        'soft-error': '#AA6373',
        'soft-success': '#519872',
        'soft-black': '#141414'

      }
    }
  },
  plugins: [
    require('tailwindcss-textshadow'),
    require('tailwind-scrollbar-hide'),
    require('tailwind-scrollbar')
  ]
};
