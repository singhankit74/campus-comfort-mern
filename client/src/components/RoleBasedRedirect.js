import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Spinner from './Spinner';

const RoleBasedRedirect = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return;
    }

    switch (user.role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'student':
        navigate('/student/dashboard');
        break;
      case 'staff':
        navigate('/staff/dashboard');
        break;
      default:
        navigate('/unauthorized');
    }
  }, [user, navigate]);

  return <Spinner />;
};

export default RoleBasedRedirect; 