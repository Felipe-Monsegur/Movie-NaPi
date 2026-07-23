import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { MoviesDataProvider } from './context/MoviesDataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import NotAuthorized from './pages/NotAuthorized';
import MovieWatchlist from './pages/MovieWatchlist';
import MovieRate from './pages/MovieRate';
import ScoresPanel from './pages/ScoresPanel';
import WatchedList from './pages/WatchedList';

function BootSplash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app text-ink">
      <div
        className="h-8 w-8 rounded-full border-2 border-line border-t-[var(--header-color)] animate-spin"
        aria-label="Cargando"
      />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAllowed, checkingAccess } = useAuth();

  if (loading || checkingAccess) {
    return <BootSplash />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAllowed) {
    return <Navigate to="/not-authorized" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <MovieWatchlist />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/puntuar"
        element={
          <ProtectedRoute>
            <Layout>
              <MovieRate />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lista"
        element={
          <ProtectedRoute>
            <Layout>
              <WatchedList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/panel"
        element={
          <ProtectedRoute>
            <Layout>
              <ScoresPanel />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <MoviesDataProvider>
              <AppRoutes />
            </MoviesDataProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
