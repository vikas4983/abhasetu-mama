import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useMemo } from 'react';
import { Provider } from 'react-redux';
import { store } from '@app/store/store';
import { useAppSelector } from '@app/store/hooks';
import { createAppTheme } from '@theme/theme';
import '@/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ThemeBridge({ children }: PropsWithChildren) {
  const mode = useAppSelector((state) => state.preferences.themeMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeBridge>{children}</ThemeBridge>
      </QueryClientProvider>
    </Provider>
  );
}
