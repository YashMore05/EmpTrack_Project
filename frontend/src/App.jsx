import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './layouts/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeList from './pages/admin/EmployeeList';
import EmployeeDetail from './pages/admin/EmployeeDetail';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import LeaveRequests from './pages/admin/LeaveRequests';
import LeaveHistory from './pages/admin/LeaveHistory';
import DepartmentManagement from './pages/admin/DepartmentManagement';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfile from './pages/employee/MyProfile';
import MyAttendance from './pages/employee/MyAttendance';
import ApplyLeave from './pages/employee/ApplyLeave';
import MyLeaves from './pages/employee/MyLeaves';
import LeaveBalance from './pages/employee/LeaveBalance';

// Root redirect based on auth status
const RootRedirect = () => {
  const { isAuthenticated, isAdmin, isEmployee } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isEmployee) return <Navigate to="/employee/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/:id" element={<EmployeeDetail />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="leave-requests" element={<LeaveRequests />} />
            <Route path="leave-history" element={<LeaveHistory />} />
            <Route path="departments" element={<DepartmentManagement />} />
          </Route>

          {/* Employee Protected Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute requiredRole="EMPLOYEE">
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="attendance" element={<MyAttendance />} />
            <Route path="apply-leave" element={<ApplyLeave />} />
            <Route path="leaves" element={<MyLeaves />} />
            <Route path="leave-balance" element={<LeaveBalance />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
