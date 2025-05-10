import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser } from '../redux/actions/authActions';
import Spinner from '../components/Spinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [activeTab, setActiveTab] = useState('student');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading } = useSelector((state) => state.auth);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    // Validate form fields
    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const loginData = {
        email: formData.email,
        password: formData.password,
        role: activeTab
      };
      
      console.log('Attempting login with:', loginData);
      const response = await dispatch(loginUser(loginData)).unwrap();
      
      if (response.success) {
        console.log('Login successful:', response);
        toast.success(`Login successful!`);
        
        // Direct navigation based on user role
        const role = response.user.role;
        
        if (role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (role === 'student') {
          window.location.href = '/student/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        console.error('Login failed:', response.message);
        toast.error(response.message || 'Login failed');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error?.message || 'Login failed');
      setSubmitting(false);
    }
  };

  if (isLoading || submitting) {
    return <Spinner />;
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm border-0 mt-5">
            <div className="card-body p-4 p-sm-5">
              <h1 className="card-title text-center mb-4">Login</h1>
              <p className="text-center text-muted mb-4">Enter your credentials to access your account</p>
              
              {/* User Type Tabs */}
              <div className="nav nav-tabs mb-4">
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'student' ? 'active' : ''} flex-fill text-center`} 
                  onClick={() => handleTabChange('student')}
                >
                  Student
                </button>
                <button
                  type="button"
                  className={`nav-link ${activeTab === 'admin' ? 'active' : ''} flex-fill text-center`}
                  onClick={() => handleTabChange('admin')}
                >
                  Administrator
                </button>
              </div>

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter your email"
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    placeholder="Enter your password"
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="d-grid gap-2 mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={submitting}
                  >
                    {submitting ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>
              <div className="mt-4 text-center">
                <p className="mb-0">
                  Don't have an account?{' '}
                  {activeTab === 'student' ? (
                    <Link to="/register" className="text-decoration-none">
                      Register
                    </Link>
                  ) : (
                    <Link to="/admin-register" className="text-decoration-none">
                      Admin Registration
                    </Link>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 