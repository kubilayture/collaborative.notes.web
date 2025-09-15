import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router";
import { Suspense } from "react";
import { RoutesContainer } from "./routes";
import { ThemeProvider } from "./providers/theme-provider";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { Toaster } from "./components/ui/sonner";
import InitialLoading from "./components/common/InitialLoading";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        if (error && typeof error === 'object' && 'response' in error) {
          const httpError = error as { response?: { status?: number } };
          if (httpError.response?.status === 401) {
            return false;
          }
        }
        return failureCount < 3;
      },
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<InitialLoading />}>
            <BrowserRouter>
              <RoutesContainer />
            </BrowserRouter>
          </Suspense>
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
