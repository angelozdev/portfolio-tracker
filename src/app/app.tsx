import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Dashboard } from "@/features/portfolio-viewer";
import AuthPage from "@/features/auth/components/auth-page";
import AppProviders from "./providers";
import Header from "./components/header";
import { useSession } from "@/features/auth/hooks/use-session";
import DashboardSkeleton from "@/features/portfolio-viewer/components/dashboard-skeleton";
import GlobalErrorBoundary from "@/shared/components/global-error-boundary";

function App() {
  const { session, loading } = useSession();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <AppProviders>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <ErrorBoundary FallbackComponent={GlobalErrorBoundary}>
            <Suspense fallback={<DashboardSkeleton />}>
              <Dashboard />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </AppProviders>
  );
}

export default App;
