import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from '../components/app-shell';
import { ProtectedRoute } from '../components/protected-route';
import { GuestRoute } from '../components/guest-route';
import { DashboardPage } from '../pages/dashboard-page';
import { LoginPage } from '../pages/login-page';
import { RegisterPage } from '../pages/register-page';
import { ProjectsPage } from '../pages/projects-page';
import { ProjectDetailPage } from '../pages/project-detail-page';
import { ProfilePage } from '../pages/profile-page';
import { NotFoundPage } from '../pages/not-found-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:projectId', element: <ProjectDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    path: '/dashboard',
    element: <Navigate to="/" replace />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
