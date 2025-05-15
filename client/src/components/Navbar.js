import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { resetChatState } from '../redux/slices/chatSlice';
import { useTheme } from '../context/ThemeContext';
import { Badge } from 'antd';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { unreadCounts } = useSelector(state => state.chat);
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  
  // Calculate total unread messages
  const totalUnreadCount = Object.values(unreadCounts || {}).reduce((total, count) => total + count, 0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    // Reset chat state before logout
    dispatch(resetChatState());
    // Logout the user
    dispatch(logout());
    // Navigate to login page
    navigate('/login');
  };

  return (
    <nav className={`navbar navbar-expand-lg ${scrolled ? 'navbar-scrolled shadow-sm' : ''} ${theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-white'}`}>
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-buildings me-2"></i>
          Campus Comfort
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
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/issues">Issues</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/feedback">Feedback</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/notices">Notices</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/chat">
                    Chat
                    {totalUnreadCount > 0 && (
                      <Badge 
                        count={totalUnreadCount} 
                        size="small" 
                        style={{ marginLeft: '5px', backgroundColor: '#f5222d' }} 
                      />
                    )}
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
                      Admin
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="adminDropdown">
                      <li>
                        <Link className="dropdown-item" to="/admin/rooms">Room Management</Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/room-allocation">Room Allocation</Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/admin/notices">Manage Notices</Link>
                      </li>
                    </ul>
                  </li>
                )}
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="userDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user.name}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>
                        Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={toggleTheme}
                      >
                        <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'} me-2`}></i>
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link" 
                    onClick={toggleTheme}
                    style={{ background: 'none', border: 'none' }}
                  >
                    <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon'}`}></i>
                  </button>
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