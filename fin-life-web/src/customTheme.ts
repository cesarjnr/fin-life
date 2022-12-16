import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

const customTheme = extendTheme(
  {
    fonts: {
      body: "Poppins"
    },
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
      red: 
      {
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
    components: {
      Input: {
        variants: {
          filled: {
            field: {
              bg: "black.700",
              _hover: {
                bg: "black.700"
              },
              _focus: {
                bg: "black.700"
              },
              _placeholder: {
                color: "whiteAlpha.400"
              }
            }
          }
        }
      }
    }
  },
  withDefaultColorScheme({ colorScheme: "green" })
);

export default customTheme;
