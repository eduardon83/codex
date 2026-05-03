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
import AdminEvents from '@/components/admin/AdminEvents';
import AdminSystem from '@/components/admin/AdminSystem';
import AdminRoleRequests from '@/components/admin/AdminRoleRequests';

export default function Admin() {
  return (
    <AdminGuard>
      <AdminLayout>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="schools" element={<AdminSchools />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="backups" element={<AdminBackups />} />
          <Route path="export" element={<AdminExport />} />
          <Route path="audit" element={<AdminAuditLog />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="role-requests" element={<AdminRoleRequests />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </AdminGuard>
  );
}
