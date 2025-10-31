import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth
import Login from './pages/Auth/Login';

// Dashboard & Patients
import Dashboard from './pages/Dashboard/Dashboard';
import PatientList from './pages/Patients/PatientList';
import PatientDetails from './pages/Patients/PatientDetails';
import PatientRegister from './pages/Patients/PatientRegister';

// Visits - Classic
import VisitNew from './pages/Visits/VisitNew';
import PendingVisits from './pages/Visits/PendingVisits';
import VisitEdit from './pages/Visits/VisitEdit';

// Two-Stage Workflow (New API-based workflow)
import PreConsultationWorkflow from './pages/Visits/PreConsultationWorkflow';
import ConsultationWorkflow from './pages/Visits/ConsultationWorkflow';

// Other
import PrescriptionNew from './pages/Prescriptions/PrescriptionNew';
import PatientHistory from './pages/History/PatientHistory';

// Admin
import HospitalList from './pages/Admin/HospitalList';
import CreateHospital from './pages/Admin/CreateHospital';
import UserList from './pages/Admin/UserList';
import CreateUser from './pages/Admin/CreateUser';
import EditUser from './pages/Admin/EditUser';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Patients */}
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <Layout>
                  <PatientList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/register"
            element={
              <ProtectedRoute>
                <Layout>
                  <PatientRegister />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <PatientDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* New Workflow - Pre-Consultation (Both Nurse and Doctor can access) */}
          <Route
            path="/visits/workflow/new/pre-consultation"
            element={
              <ProtectedRoute>
                <Layout>
                  <PreConsultationWorkflow />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visits/workflow/:id/pre-consultation"
            element={
              <ProtectedRoute>
                <Layout>
                  <PreConsultationWorkflow />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* New Workflow - Consultation (Doctor only) */}
          <Route
            path="/visits/workflow/:id/consultation"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Layout>
                  <ConsultationWorkflow />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Classic Visits */}
          <Route
            path="/visits/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <VisitNew />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visits/pending"
            element={
              <ProtectedRoute>
                <Layout>
                  <PendingVisits />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/visits/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <VisitEdit />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Prescriptions & History */}
          <Route
            path="/prescriptions/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <PrescriptionNew />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history/:patientId"
            element={
              <ProtectedRoute>
                <Layout>
                  <PatientHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin - Hospital Management (Super Admin only) */}
          <Route
            path="/admin/hospitals"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Layout>
                  <HospitalList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hospitals/create"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Layout>
                  <CreateHospital />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin - User Management (Hospital Admin & Super Admin) */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'hospital_admin']}>
                <Layout>
                  <UserList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/create"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'hospital_admin']}>
                <Layout>
                  <CreateUser />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:userId/edit"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'hospital_admin']}>
                <Layout>
                  <EditUser />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Hospital-specific user management (Super Admin viewing specific hospital) */}
          <Route
            path="/admin/hospitals/:hospitalId/users"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Layout>
                  <UserList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hospitals/:hospitalId/users/create"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Layout>
                  <CreateUser />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hospitals/:hospitalId/users/:userId/edit"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Layout>
                  <EditUser />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
