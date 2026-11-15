import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './state/useAuthStore';
import { useInventoryStore } from './state/useInventoryStore';
import { UserRole } from './types';

import { AppLayout } from './components/layout/AppLayout';
import { LoginScreen } from './screens/LoginScreen';
import { AboutScreen } from './screens/AboutScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { AddEditPartScreen } from './screens/AddEditPartScreen';
import { ShelfMapScreen } from './screens/ShelfMapScreen';
import { IssuePartScreen } from './screens/IssuePartScreen';
import { IssueSlipScreen } from './screens/IssueSlipScreen';
import { AlertsScreen } from './screens/AlertsScreen';
import { SuppliersScreen } from './screens/SuppliersScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { ReorderScreen } from './screens/ReorderScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { AuditTrailScreen } from './screens/AuditTrailScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { DesignSystemScreen } from './screens/DesignSystemScreen';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, isAuthenticated } = useAuthStore();
  const { addToast } = useInventoryStore();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Show toast for blocked access
    addToast('error', 'You do not have access to that module.');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AuthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/about" element={<AboutScreen />} />

      {/* Protected app routes inside AppLayout */}
      <Route
        path="/"
        element={
          <AuthCheck>
            <AppLayout />
          </AuthCheck>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard: All roles */}
        <Route
          path="dashboard"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper', 'mechanic', 'purchasing']}>
              <DashboardScreen />
            </RoleRoute>
          }
        />

        {/* Master Inventory Catalog: All roles */}
        <Route
          path="inventory"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper', 'mechanic', 'purchasing']}>
              <InventoryScreen />
            </RoleRoute>
          }
        />

        {/* Add Part: Owner & Storekeeper only */}
        <Route
          path="inventory/add"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper']}>
              <AddEditPartScreen />
            </RoleRoute>
          }
        />

        {/* Edit Part: Owner & Storekeeper only */}
        <Route
          path="inventory/edit/:id"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper']}>
              <AddEditPartScreen />
            </RoleRoute>
          }
        />

        {/* Shelf Map: All roles */}
        <Route
          path="shelf-map"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper', 'mechanic', 'purchasing']}>
              <ShelfMapScreen />
            </RoleRoute>
          }
        />

        {/* Issue Part: Owner, Storekeeper, Mechanic */}
        <Route
          path="issue-part"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper', 'mechanic']}>
              <IssuePartScreen />
            </RoleRoute>
          }
        />

        {/* Issue Slip: All roles */}
        <Route
          path="issue-slip/:slipId"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper', 'mechanic', 'purchasing']}>
              <IssueSlipScreen />
            </RoleRoute>
          }
        />

        {/* Alerts: Owner, Storekeeper, Purchasing */}
        <Route
          path="alerts"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper', 'purchasing']}>
              <AlertsScreen />
            </RoleRoute>
          }
        />

        {/* Suppliers: Owner, Storekeeper, Purchasing */}
        <Route
          path="suppliers"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper', 'purchasing']}>
              <SuppliersScreen />
            </RoleRoute>
          }
        />

        {/* Orders: Owner, Storekeeper, Purchasing */}
        <Route
          path="procurement/orders"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper', 'purchasing']}>
              <OrdersScreen />
            </RoleRoute>
          }
        />

        {/* Reorder / PO creation: Owner, Storekeeper, Purchasing */}
        <Route
          path="procurement/reorder"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper', 'purchasing']}>
              <ReorderScreen />
            </RoleRoute>
          }
        />

        {/* Reports: Owner, Storekeeper, Purchasing */}
        <Route
          path="reports"
          element={
            <RoleRoute allowedRoles={['owner', 'storekeeper', 'purchasing']}>
              <ReportsScreen />
            </RoleRoute>
          }
        />

        {/* Audit Trail: Owner only */}
        <Route
          path="admin/audit-trail"
          element={
            <RoleRoute allowedRoles={['owner']}>
              <AuditTrailScreen />
            </RoleRoute>
          }
        />

        {/* Settings: Owner only */}
        <Route
          path="admin/settings"
          element={
            <RoleRoute allowedRoles={['owner']}>
              <SettingsScreen />
            </RoleRoute>
          }
        />

        {/* Hidden Design System Specimen (Proto.io documentation) */}
        <Route path="design-system" element={<DesignSystemScreen />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
