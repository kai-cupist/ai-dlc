import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import MenuManagementPage from '@/pages/MenuManagementPage';
import OptionGroupPage from '@/pages/OptionGroupPage';
import TableSetupPage from '@/pages/TableSetupPage';
import TableHistoryPage from '@/pages/TableHistoryPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/menus" element={<MenuManagementPage />} />
            <Route path="/option-groups" element={<OptionGroupPage />} />
            <Route path="/tables/setup" element={<TableSetupPage />} />
            <Route path="/tables/:tableId/history" element={<TableHistoryPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
