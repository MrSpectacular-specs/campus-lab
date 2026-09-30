import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import type { UserRole } from '../lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-block w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-text-muted uppercase tracking-wider">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to appropriate workspace based on role
    const roleRedirects: Record<UserRole, string> = {
      admin: '/dashboard',
      faculty: '/faculty',
      mentor: '/mentor',
      student: '/student',
    };
    return <Navigate to={roleRedirects[profile.role] || '/dashboard'} replace />;
  }

  return <>{children}</>;
};
