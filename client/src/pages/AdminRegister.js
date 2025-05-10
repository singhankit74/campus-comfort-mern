import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { registerUser } from '../redux/actions/authActions';
import { reset } from '../redux/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import Spinner from '../components/Spinner';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'admin',
    department: '',
    adminCode: ''
  });

  const { name, email, password, password2, adminCode, department } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    // Redirect when logged in
    if (isSuccess || user) {
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [isError, isSuccess, user, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error('Passwords do not match');
      return;
    }

    if (!name || !email || !password || !adminCode) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const userData = {
        name,
        email,
        password,
        role: 'admin',
        department,
        adminCode
      };

      await dispatch(registerUser(userData));
      toast.success('Registration successful');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg rounded-3">
            <div className="card-header bg-primary text-white p-4">
              <h3 className="card-title text-center mb-0">Admin Registration</h3>
            </div>
            <div className="card-body p-4 p-sm-5">
              <p className="text-center text-muted mb-4">Create a new administrator account with special privileges</p>
              
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    <i className="bi bi-person me-2"></i>Full Name*
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={name}
                    placeholder="Enter your full name"
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="bi bi-envelope me-2"></i>Email*
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={email}
                    placeholder="Enter your email"
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="department" className="form-label">
                    <i className="bi bi-building me-2"></i>Department
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="department"
                    name="department"
                    value={department}
                    placeholder="Enter your department"
                    onChange={onChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <i className="bi bi-lock me-2"></i>Password*
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    placeholder="Create a password"
                    onChange={onChange}
                    required
                    minLength="6"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password2" className="form-label">
                    <i className="bi bi-lock-fill me-2"></i>Confirm Password*
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password2"
                    name="password2"
                    value={password2}
                    placeholder="Confirm your password"
                    onChange={onChange}
                    required
                    minLength="6"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="adminCode" className="form-label">
                    <i className="bi bi-shield-lock me-2"></i>Admin Registration Code*
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="adminCode"
                    name="adminCode"
                    value={adminCode}
                    placeholder="Enter admin code"
                    onChange={onChange}
                    required
                  />
                  <div className="form-text">
                    <i className="bi bi-info-circle me-1"></i>
                    A special code is required for admin registration. Please contact the system administrator to get the access code.
                  </div>
                </div>
                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-primary btn-lg">
                    <i className="bi bi-shield-check me-2"></i>Create Admin Account
                  </button>
                </div>
              </form>
              <div className="mt-4 text-center">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary text-decoration-none">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister; 