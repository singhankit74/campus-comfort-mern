import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { lazy, Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import './theme.css';
import { store } from './redux/store';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

// Import critical pages (needed immediately)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Spinner from './components/Spinner';

// Import components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RoleBasedRedirect from './components/RoleBasedRedirect';

// Lazy load heavy pages
const AdminRegister = lazy(() => import('./pages/AdminRegister'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const IssueList = lazy(() => import('./pages/IssueList'));
const IssueDetail = lazy(() => import('./pages/IssueDetail'));
const CreateIssue = lazy(() => import('./pages/CreateIssue'));
const FeedbackList = lazy(() => import('./pages/FeedbackList'));
const FeedbackDetail = lazy(() => import('./pages/FeedbackDetail'));
const CreateFeedback = lazy(() => import('./pages/CreateFeedback'));
const EnrollmentForm = lazy(() => import('./pages/EnrollmentForm'));
const Profile = lazy(() => import('./pages/Profile'));
const RoomManagement = lazy(() => import('./pages/RoomManagement'));
const RoomAllocation = lazy(() => import('./pages/RoomAllocation'));
const NoticeList = lazy(() => import('./pages/NoticeList'));
const AdminNoticeList = lazy(() => import('./pages/AdminNoticeList'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SocketProvider>
          <Router>
            <div className="app-container min-vh-100 d-flex flex-column">
              <Navbar />
              <main className="flex-grow-1 py-4">
                <ToastContainer position="top-right" autoClose={3000} />
                <Suspense fallback={<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}><Spinner /></div>}>
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

                    {/* Chat Routes */}
                    <Route path="/chat" element={
                      <PrivateRoute>
                        <ChatPage />
                      </PrivateRoute>
                    } />
                    <Route path="/chat/:chatId" element={
                      <PrivateRoute>
                        <ChatPage />
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
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </SocketProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
