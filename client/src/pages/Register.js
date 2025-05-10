import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { registerUser } from '../redux/actions/authActions';
import { reset } from '../redux/slices/authSlice';
import Spinner from '../components/Spinner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'student',
    department: ''
  });

  const { name, email, password, password2, department } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

    if (!name || !email || !password) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const userData = {
        name,
        email,
        password,
        role: 'student',
        department
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
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm border-0 mt-5 mb-5">
            <div className="card-body p-4 p-sm-5">
              <h1 className="card-title text-center mb-4">Student Registration</h1>
              <p className="text-center text-muted mb-4">Create your student account</p>
              
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name*
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
                    Email*
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
                    Department
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
                    Password*
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
                    Confirm Password*
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
                <div className="alert alert-info">
                  <small><i className="bi bi-info-circle me-2"></i>A unique registration number will be automatically generated for you upon registration.</small>
                </div>
                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Register
                  </button>
                </div>
              </form>
              <div className="mt-4 text-center">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none">
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

export default Register; 