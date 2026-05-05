import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from './dashboards/StudentDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import RecruiterDashboard from './dashboards/RecruiterDashboard';

export default function DashboardRouter() {
  const { activeRole } = useAuth();

  if (!activeRole) {
    return <div className="p-8 bg-white border border-black italic">No persona selected. Please log in again.</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardByRole role={activeRole} />} />
      
      {/* Student Specific */}
      <Route 
        path="/coding" 
        element={activeRole === 'student' ? <StudentDashboard section="coding" /> : <Navigate to="/" replace />} 
      />
      
      {/* Attendance - Shared path but delegates inside */}
      <Route path="/attendance" element={<AttendanceByRole role={activeRole} />} />
      
      {/* Admin Specific */}
      <Route 
        path="/payroll" 
        element={activeRole === 'admin' ? <AdminDashboard section="payroll" /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/users" 
        element={activeRole === 'admin' ? <AdminDashboard section="users" /> : <Navigate to="/" replace />} 
      />

      {/* Faculty Specific */}
      <Route 
        path="/salary" 
        element={activeRole === 'faculty' ? <FacultyDashboard section="salary" /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/classes" 
        element={activeRole === 'faculty' ? <FacultyDashboard section="classes" /> : <Navigate to="/" replace />} 
      />

      {/* Recruiter Specific */}
      <Route 
        path="/search" 
        element={activeRole === 'recruiter' ? <RecruiterDashboard /> : <Navigate to="/" replace />} 
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DashboardByRole({ role }: { role: string }) {
  switch (role) {
    case 'admin': return <AdminDashboard />;
    case 'faculty': return <FacultyDashboard />;
    case 'student': return <StudentDashboard />;
    case 'recruiter': return <RecruiterDashboard />;
    default: return <div className="p-8 bg-white border border-black italic">Unauthorized or Unknown Role. Please contact admin.</div>;
  }
}

function AttendanceByRole({ role }: { role: string }) {
  switch (role) {
    case 'faculty': return <FacultyDashboard section="attendance" />;
    case 'student': return <StudentDashboard section="attendance" />;
    case 'admin': return <AdminDashboard section="attendance" />;
    default: return <div>Not applicable</div>;
  }
}
