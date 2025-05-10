import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import './theme.css';
import { store } from './redux/store';
import { ThemeProvider } from './context/ThemeContext';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import IssueList from './pages/IssueList';
import IssueDetail from './pages/IssueDetail';
import CreateIssue from './pages/CreateIssue';
import FeedbackList from './pages/FeedbackList';
import FeedbackDetail from './pages/FeedbackDetail';
import CreateFeedback from './pages/CreateFeedback';
import EnrollmentForm from './pages/EnrollmentForm';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import RoomManagement from './pages/RoomManagement';
import RoomAllocation from './pages/RoomAllocation';
import NoticeList from './pages/NoticeList';
import AdminNoticeList from './pages/AdminNoticeList';

// Import components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RoleBasedRedirect from './components/RoleBasedRedirect';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <div className="app-container min-vh-100 d-flex flex-column">
            <Navbar />
            <main className="flex-grow-1 py-4">
              <ToastContainer position="top-right" autoClose={3000} />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin-register" element={<AdminRegister />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Dashboard Route with Role-Based Redirect */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <RoleBasedRedirect />
                  </PrivateRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <PrivateRoute requiredRoles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                } />
                <Route path="/admin/rooms" element={
                  <PrivateRoute requiredRoles={['admin']}>
                    <RoomManagement />
                  </PrivateRoute>
                } />
                <Route path="/admin/room-allocation" element={
                  <PrivateRoute requiredRoles={['admin']}>
                    <RoomAllocation />
                  </PrivateRoute>
                } />
                <Route path="/admin/notices" element={
                  <PrivateRoute requiredRoles={['admin']}>
                    <AdminNoticeList />
                  </PrivateRoute>
                } />

                {/* Student Routes */}
                <Route path="/student/dashboard" element={
                  <PrivateRoute requiredRoles={['student']}>
                    <StudentDashboard />
                  </PrivateRoute>
                } />
                <Route path="/enrollments/new" element={
                  <PrivateRoute requiredRoles={['student']}>
                    <EnrollmentForm />
                  </PrivateRoute>
                } />

                {/* Common Protected Routes */}
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/notices" element={
                  <PrivateRoute>
                    <NoticeList />
                  </PrivateRoute>
                } />

                {/* Issue Routes */}
                <Route path="/issues" element={
                  <PrivateRoute>
                    <IssueList />
                  </PrivateRoute>
                } />
                <Route path="/issues/:id" element={
                  <PrivateRoute>
                    <IssueDetail />
                  </PrivateRoute>
                } />
                <Route path="/issues/new" element={
                  <PrivateRoute>
                    <CreateIssue />
                  </PrivateRoute>
                } />

                {/* Feedback Routes */}
                <Route path="/feedback" element={
                  <PrivateRoute>
                    <FeedbackList />
                  </PrivateRoute>
                } />
                <Route path="/feedback/:id" element={
                  <PrivateRoute>
                    <FeedbackDetail />
                  </PrivateRoute>
                } />
                <Route path="/feedback/new" element={
                  <PrivateRoute>
                    <CreateFeedback />
                  </PrivateRoute>
                } />

                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
