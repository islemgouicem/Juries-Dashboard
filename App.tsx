import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Evaluation from "./pages/Evaluation";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import "./index.css"
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#430870] text-white">Loading...</div>
);

const ProtectedRoute: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children as React.ReactElement;
};

const AdminRoute: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { judgeProfile, isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!judgeProfile?.isAdmin) {
    alert("Access Denied: You must be an administrator.");
    return <Navigate to="/dashboard" replace />;
  }
  return children as React.ReactElement;
};

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/evaluate/:id" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;