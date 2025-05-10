import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { logout } from '../redux/slices/authSlice';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-custom ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-building me-2 fs-4"></i>
          <span className="fw-bold">Campus Comfort</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/issues">
                    <i className="bi bi-exclamation-triangle me-1"></i> Issues
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/feedback">
                    <i className="bi bi-chat-square-text me-1"></i> Feedback
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/notices">
                    <i className="bi bi-megaphone me-1"></i> Notices
                  </Link>
                </li>
                {user.role === 'admin' && (
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      id="adminDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="bi bi-shield-lock me-1"></i> Admin
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                      <li>
                        <Link className="dropdown-item" to="/admin/dashboard">
                          <i className="bi bi-grid-1x2 me-2"></i> Admin Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/rooms">
                          <i className="bi bi-grid-1x2 me-2"></i> Room Management
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/room-allocation">
                          <i className="bi bi-grid-1x2 me-2"></i> Room Allocation
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/notices">
                          <i className="bi bi-megaphone me-2"></i> Manage Notices
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
              </>
            )}
          </ul>
          
          <ul className="navbar-nav ms-auto">
            {/* Theme Toggle Button */}
            <li className="nav-item me-2">
              <button 
                className="btn theme-toggle" 
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <i className="bi bi-sun-fill text-warning fs-5"></i>
                ) : (
                  <i className="bi bi-moon-fill text-light fs-5"></i>
                )}
              </button>
            </li>

            {user ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="avatar-circle me-2 bg-white bg-opacity-25 text-white d-flex align-items-center justify-content-center">
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <span>{user.name.split(' ')[0]}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                  {user.role === 'admin' && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/admin/dashboard">
                          <i className="bi bi-grid-1x2 me-2"></i> Admin Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/notices">
                          <i className="bi bi-megaphone me-2"></i> Manage Notices
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                    </>
                  )}
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person-circle me-2"></i> Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/dashboard">
                      <i className="bi bi-speedometer2 me-2"></i> Dashboard
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={onLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-light btn-sm rounded-pill px-3 ms-2" to="/register">
                    <i className="bi bi-person-plus me-1"></i> Register
                  </Link>
                </li>
                <li className="nav-item ms-2">
                  <Link className="btn btn-outline-light btn-sm rounded-pill px-3" to="/admin-register">
                    <i className="bi bi-shield me-1"></i> Admin
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 