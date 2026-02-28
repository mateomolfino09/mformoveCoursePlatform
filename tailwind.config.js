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
      montserrat: ["var(--font-montserrat)"],
      lora: ["var(--font-lora)", "Georgia", "serif"],
      raleway: ["var(--font-raleway)", "sans-serif"]
    },
    extend: {
      backgroundImage: {
        'custom-vertical': 'linear-gradient(180deg, rgba(179, 189, 208, 1) 0%, rgba(243, 244, 247, 1) 50%, rgba(243, 244, 247, 1) 100%)',
        'custom-dark-fade': 'linear-gradient(180deg, rgba(179, 189, 208, 1) 0%, rgba(136, 148, 189, 1) 50%, rgba(0, 0, 0, 1) 100%)',

        'gradient-to-b':
          'linear-gradient(to bottom,rgba(20,20,20,0) 0,rgba(20,20,20,.15) 15%,rgba(20,20,20,.35) 29%,rgba(20,20,20,.58) 44%,#141414 68%,#141414 100%);',
          'gradient-to-w':
          'linear-gradient(to bottom,rgba(255,255,255,0) 0,rgba(255,255,255,.15) 20%,rgba(255,255,255,.35) 40%,rgba(255,255,255,.58) 44%,#ffff 68%,#ffff 100%);',
          'custom-gradient': 'linear-gradient(108deg, #a6d3f7, #dffcf5)',
          'custom-stronger': 'linear-gradient(108deg, #4a4de7, #9fd8ff)',
          'custom-stronger-alt': 'linear-gradient(120deg, #3b9cf5, #021f3f)'


      },
      colors: {
        'light-cream': '#FFFDFD',
        'rich-black': '#0D0D0D',
        'chill-black': '#293132',
        'light-white': '#FFFDFD',
        'soft-error': '#AA6373',
        'soft-success': '#519872',
        'soft-black': '#141414',
        'secondary': '#687ca8',
        'secondary-darker': '#173067',
        'primary': '#F3F4F7',
        'tertiary': '#373436',
        'yellow': '#ffeb99',
        /* Paleta del sistema */
        palette: {
          ink: '#141411',
          sage: '#acae89',
          stone: '#787867',
          'deep-teal': '#001b1c',
          teal: '#074647',
          olive: '#6b8e23',
          'olive-dark': '#5a7a1e',
          white: '#FAF8F4',
          cream: '#FAF8F4',
        },
      }
    }
  },
  plugins: [
    require('tailwindcss-textshadow'),
    require('tailwind-scrollbar-hide'),
    require('tailwind-scrollbar')
  ]
};
