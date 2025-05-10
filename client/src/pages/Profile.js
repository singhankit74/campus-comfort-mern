import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getUserProfile, updateUserProfile } from '../redux/actions/authActions';
import { reset } from '../redux/slices/authSlice';
import Spinner from '../components/Spinner';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    password: '',
    password2: ''
  });

  const { name, email, studentId, department, password, password2 } = formData;
  
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await dispatch(getUserProfile());
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          studentId: profileData.studentId || '',
          department: profileData.department || '',
          password: '',
          password2: ''
        });
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success('Profile updated successfully');
    }

    dispatch(reset());
  }, [isError, isSuccess, message, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== password2) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const updateData = {
        name,
        department
      };

      // Only include password if it's provided
      if (password) {
        updateData.password = password;
      }

      // Only include studentId if user is a student
      if (user.role === 'student' && studentId) {
        updateData.studentId = studentId;
      }

      await dispatch(updateUserProfile(updateData));
      
      // Clear the password fields after update
      setFormData({
        ...formData,
        password: '',
        password2: ''
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Profile</h2>
            </div>
            <div className="card-body">
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={email}
                    disabled
                  />
                  <div className="form-text">Email cannot be changed</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="role"
                    value={user ? user.role : ''}
                    disabled
                  />
                </div>

                {user && user.role === 'student' && (
                  <div className="mb-3">
                    <label htmlFor="studentId" className="form-label">
                      Student ID
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="studentId"
                      name="studentId"
                      value={studentId}
                      onChange={onChange}
                    />
                  </div>
                )}

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
                    onChange={onChange}
                  />
                </div>

                <hr className="my-4" />
                <h4 className="mb-3">Change Password</h4>
                <p className="text-muted mb-3">Leave blank if you don't want to change</p>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    minLength="6"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password2" className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password2"
                    name="password2"
                    value={password2}
                    onChange={onChange}
                    minLength="6"
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 