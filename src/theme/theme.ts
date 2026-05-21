import { createTheme } from '@mui/material/styles';
import type { ThemeMode } from '@/types/domain';
import { paletteTokens } from './tokens';

export const createAppTheme = (mode: ThemeMode) => {
  const token = paletteTokens[mode];

  return createTheme({
    palette: {
      mode,
      primary: { main: token.primary },
      secondary: { main: token.cyan },
      background: { default: token.background, paper: token.surface },
      text: { primary: token.text, secondary: token.secondary },
      divider: token.border,
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      button: { textTransform: 'none', fontWeight: 800 },
    },
    shape: { borderRadius: 10 },
    spacing: 8,
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 9 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            border: `1px solid ${token.border}`,
          },
        },
      },
    },
  });
};
