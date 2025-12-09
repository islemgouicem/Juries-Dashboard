
import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Evaluation from "./pages/Evaluation";
// Corrected import path/file to reflect common structure.
import { AuthProvider, useAuth } from "./src/context/AuthContext";
// New import for Admin Dashboard
import AdminDashboard from "./pages/AdminDashboard";

const ProtectedRoute: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children as React.ReactElement;
};

// NEW: Admin Route to enforce the isAdmin check
const AdminRoute: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { judgeProfile, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Enforce admin access
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
          {/* Public Route */}
          <Route path="/" element={<Login />} /> 
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/evaluate/:id" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />
          
          {/* New Protected Admin Route (Requires Admin) */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
  );
}

function App() {
  return (
    <Router>
      {/* AuthProvider wraps all routes, enabling global state */}
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
