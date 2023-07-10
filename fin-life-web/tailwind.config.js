/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: {
          50: "#d9d9d9",
          100: "#bfbfbf",
          200: "#a6a6a6",
          300: "#8c8c8c",
          400: "#737373",
          500: "#595959",
          600: "#404040",
          700: "#171717",
          800: "#0d0d0d",
          900: "#000000"
        },
        green: {
          50: "#dbffed",
          100: "#adffd2",
          200: "#7cffb6",
          300: "#4aff99",
          400: "#1aff7d",
          500: "#00e663",
          600: "#00b34c",
          700: "#008035",
          800: "#004e1e",
          900: "#001c05"
        },
        red: {
          50: '#ffe6df',
          100: '#ffbab0',
          200: '#ff8e7f',
          300: '#ff614c',
          400: '#ff351a',
          500: '#e61b00',
          600: '#b41300',
          700: '#810b00',
          800: '#500400',
          900: '#210000',
        }
      },
      fontFamily: {
        sans: ['"Poppins"', 'sans-serif']
      }
      // backgroundImage: {
      //   'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      //   'gradient-conic':
      //     'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      // },
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
