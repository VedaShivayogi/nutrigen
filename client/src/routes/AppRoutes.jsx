import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import PrivateRoute from './PrivateRoute';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import MealPlannerPage from '../pages/MealPlannerPage';
import InsightsPage from '../pages/InsightsPage';
import VirtualCoachPage from '../pages/VirtualCoachPage';
import ProfilePage from '../pages/ProfilePage';
import ProgressPage from '../pages/ProgressPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <MainLayout>
          <LandingPage />
        </MainLayout>
      } />
      <Route path="/login" element={
        <MainLayout showFooter={false}>
          <LoginPage />
        </MainLayout>
      } />
      <Route path="/register" element={
        <MainLayout showFooter={false}>
          <RegisterPage />
        </MainLayout>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="/meal-planner" element={
        <PrivateRoute>
          <MainLayout>
            <MealPlannerPage />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="/insights" element={
        <PrivateRoute>
          <MainLayout>
            <InsightsPage />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="/coach" element={
        <PrivateRoute>
          <MainLayout>
            <VirtualCoachPage />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="/progress" element={
        <PrivateRoute>
          <MainLayout>
            <ProgressPage />
          </MainLayout>
        </PrivateRoute>
      } />
      <Route path="/admin/login" element={
        <MainLayout showFooter={false}>
          <AdminLoginPage />
        </MainLayout>
      } />
      <Route path="/admin/dashboard" element={
        <MainLayout showFooter={false}>
          <AdminDashboardPage />
        </MainLayout>
      } />
      <Route path="*" element={
        <MainLayout>
          <NotFoundPage />
        </MainLayout>
      } />
    </Routes>
  );
};

export default AppRoutes;