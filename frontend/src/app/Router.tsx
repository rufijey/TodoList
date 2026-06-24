import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './providers/ProtectedRoute';
import { PublicRoute } from './providers/PublicRoute';
import { LoginPage } from '../pages/login/ui/LoginPage';
import { RegisterPage } from '../pages/register/ui/RegisterPage';
import { DashboardPage } from '../pages/dashboard/ui/DashboardPage';
import { VerifyEmailPage } from '../pages/verify-email/ui/VerifyEmailPage';
import { ROUTES } from '../shared/config/routes';

export const Router: React.FC = () => {
  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.VERIFY_EMAIL}
        element={
          <PublicRoute>
            <VerifyEmailPage />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LIST_DETAIL}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};
