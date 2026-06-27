/**
 * @file        MuiProvider.tsx
 * @description MUI theme for stakeholder and admin consoles
 * @module      providers
 * @layer       provider
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React, { useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const stakeholderTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0d9488", dark: "#0f766e", light: "#14b8a6" },
    secondary: { main: "#6366f1" },
    background: { default: "#f4f7fb", paper: "#ffffff" },
    success: { main: "#22c55e" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      "var(--font-sans, system-ui, -apple-system, Segoe UI, Roboto, sans-serif)",
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiCard: {
      styleOverrides: { root: { boxShadow: "0 1px 3px rgba(15,23,42,0.08)" } },
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderRight: "1px solid #e2e8f0" } },
    },
  },
});

export function MuiProvider({ children }: { children: React.ReactNode }) {
  const theme = useMemo(() => stakeholderTheme, []);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
