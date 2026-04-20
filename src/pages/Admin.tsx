import { Routes, Route, Navigate } from 'react-router-dom';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminExport from '@/components/admin/AdminExport';
import AdminAuditLog from '@/components/admin/AdminAuditLog';
import AdminContent from '@/components/admin/AdminContent';
import AdminBackups from '@/components/admin/AdminBackups';
import AdminSchools from '@/components/admin/AdminSchools';

export default function Admin() {
  return (
    <AdminGuard>
      <AdminLayout>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="schools" element={<AdminSchools />} />
          <Route path="backups" element={<AdminBackups />} />
          <Route path="export" element={<AdminExport />} />
          <Route path="audit" element={<AdminAuditLog />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </AdminGuard>
  );
}
