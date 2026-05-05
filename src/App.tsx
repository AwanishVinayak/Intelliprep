/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import DashboardRouter from './pages/DashboardRouter';
import Layout from './components/Layout';

function AppContent() {
  const { user, profile, activeRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E4E3E0]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-black rounded-full mb-4"></div>
          <p className="font-mono text-xs uppercase tracking-widest italic opacity-50">IntelliPrep Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated or if persona is not selected (activeRole is null)
  const isAuthorized = user && profile && activeRole;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthorized ? <Login /> : <Navigate to="/" />} />
        <Route
          path="/*"
          element={
            isAuthorized ? (
              <Layout>
                <DashboardRouter />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

