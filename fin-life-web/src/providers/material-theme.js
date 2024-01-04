'use client'

import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material/styles";

const customTheme = (theme) => createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    primary: {
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
    }
  },
  components: {
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          backgroundColor: '#171717'
          // backgroundColor: 'rgba(255, 255, 255, .03)',
          // borderRadius: '0.75rem'
        }
      }
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
          color: 'rgba(255, 255, 255, .4)'
        },
        switchViewIcon: {
          color: 'rgba(255, 255, 255, .4)'
        }
      }
    },
    MuiDayCalendar: {
      styleOverrides: {
        weekDayLabel: {
          color: 'rgba(255, 255, 255, .4)'
        }
      }
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, .4)'
        }
      }
    },
    MuiPickersMonth: {
      styleOverrides: {
        monthButton: {
          color: 'rgba(255, 255, 255, .4)'
        }
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fill: 'rgba(255, 255, 255, .4)'
        }
      }
    }
  }
});

export const MaterialThemeProvider = ({ children }) => {
  return (
    <ThemeProvider theme={customTheme}>
      {children}
    </ThemeProvider>
  );
};
