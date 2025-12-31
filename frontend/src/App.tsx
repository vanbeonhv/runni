import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { toast } from './lib/toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HeaderProvider } from './contexts/HeaderContext';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { LoginPage } from './pages/LoginPage';
import { CallbackPage } from './pages/CallbackPage';
import { TodayPage } from './pages/TodayPage';
import { PlanPage } from './pages/PlanPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { CommunityPage } from './pages/CommunityPage';
import { SupportPage } from './pages/SupportPage';

// Create QueryClient with caching configuration and global error handler
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache for 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: false, // Don't refetch on reconnect
      refetchOnMount: false, // Don't refetch when component mounts if data exists
    },
    mutations: {
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch data';
      toast.error(message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to save data';
      toast.error(message);
    },
  }),
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <HeaderProvider>
      <TopBar />
      <div className="pt-[64px]">
        {children}
      </div>
    </HeaderProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />

      <Route
        path="/today"
        element={
          <ProtectedRoute>
            <TodayPage />
            <BottomNav />
          </ProtectedRoute>
        }
      />

      <Route
        path="/plan"
        element={
          <ProtectedRoute>
            <PlanPage />
            <BottomNav />
          </ProtectedRoute>
        }
      />

      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <ActivitiesPage />
            <BottomNav />
          </ProtectedRoute>
        }
      />

      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <CommunityPage />
            <BottomNav />
          </ProtectedRoute>
        }
      />

      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <SupportPage />
            <BottomNav />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/today" : "/login"} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
      <Toaster richColors closeButton />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
