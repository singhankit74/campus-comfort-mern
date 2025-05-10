import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyEnrollments } from '../redux/slices/enrollmentSlice';
import Spinner from '../components/Spinner';
import Notice from '../components/Notice/Notice';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const dispatch = useDispatch();

  const { user } = useSelector(state => state.auth);
  const { enrollments, isLoading: enrollmentsLoading } = useSelector(state => state.enrollments);
  const { issues, isLoading: issuesLoading } = useSelector(state => state.issues);

  useEffect(() => {
    dispatch(getMyEnrollments());
  }, [dispatch]);

  const getStatusColor = status => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'danger';
      default:
        return 'warning';
    }
  };

  if (enrollmentsLoading || issuesLoading) {
    return <Spinner />;
  }

  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-md-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h1 className="card-title mb-4">Student Dashboard</h1>
              <div className="mb-4">
                <div className="alert alert-info">
                  <h4>Welcome, {user?.name}!</h4>
                  <p>
                    Registration Number: <strong>{user?.regNo || 'Not assigned yet'}</strong><br />
                    Department: <strong>{user?.department || 'Not specified'}</strong>
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'enrollments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('enrollments')}
                  >
                    Hostel Enrollments
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'issues' ? 'active' : ''}`}
                    onClick={() => setActiveTab('issues')}
                  >
                    My Issues
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'notices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notices')}
                  >
                    Notices
                  </button>
                </li>
              </ul>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <div className="row">
                    <div className="col-md-4 mb-4">
                      <div className="card h-100 border-primary border-top-0 border-end-0 border-bottom-0 border-4">
                        <div className="card-body">
                          <h5 className="card-title">Hostel Enrollment</h5>
                          <p className="card-text">Apply for campus hostel accommodations or check your enrollment status.</p>
                          <Link to="/enrollments/new" className="btn btn-primary">Apply Now</Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-4">
                      <div className="card h-100 border-danger border-top-0 border-end-0 border-bottom-0 border-4">
                        <div className="card-body">
                          <h5 className="card-title">Report Issue</h5>
                          <p className="card-text">Report an issue or problem that needs attention from the campus staff.</p>
                          <Link to="/issues/new" className="btn btn-danger">Report Issue</Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-4">
                      <div className="card h-100 border-success border-top-0 border-end-0 border-bottom-0 border-4">
                        <div className="card-body">
                          <h5 className="card-title">Submit Feedback</h5>
                          <p className="card-text">Provide feedback about your campus experience to help us improve.</p>
                          <Link to="/feedback/new" className="btn btn-success">Submit Feedback</Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4>Recent Activity</h4>
                    <div className="list-group">
                      {enrollments && enrollments.length > 0 && (
                        <div className="list-group-item list-group-item-action">
                          <div className="d-flex w-100 justify-content-between">
                            <h5 className="mb-1">Hostel Enrollment Application</h5>
                            <small>{new Date(enrollments[0].createdAt).toLocaleDateString()}</small>
                          </div>
                          <p className="mb-1">
                            Status: <span className={`badge bg-${getStatusColor(enrollments[0].status)}`}>
                              {enrollments[0].status}
                            </span>
                          </p>
                        </div>
                      )}
                      
                      {issues && issues.length > 0 && (
                        <div className="list-group-item list-group-item-action">
                          <div className="d-flex w-100 justify-content-between">
                            <h5 className="mb-1">Issue Report: {issues[0].title}</h5>
                            <small>{new Date(issues[0].createdAt).toLocaleDateString()}</small>
                          </div>
                          <p className="mb-1">
                            Status: <span className={`badge bg-${
                              issues[0].status === 'Resolved' ? 'success' : 
                              issues[0].status === 'In Progress' ? 'info' : 
                              'warning'}`}
                            >
                              {issues[0].status}
                            </span>
                          </p>
                        </div>
                      )}

                      {(enrollments?.length === 0 && issues?.length === 0) && (
                        <div className="list-group-item">
                          <p className="mb-0">No recent activity found. Start by applying for hostel or reporting an issue.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Enrollments Tab */}
              {activeTab === 'enrollments' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3>My Hostel Enrollments</h3>
                    <Link to="/enrollments/new" className="btn btn-primary">
                      New Application
                    </Link>
                  </div>

                  {enrollments && enrollments.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Hostel Name</th>
                            <th>Room Type</th>
                            <th>Meal Plan</th>
                            <th>Status</th>
                            <th>Submission Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollments.map(enrollment => (
                            <tr key={enrollment._id}>
                              <td>{enrollment.hostelName}</td>
                              <td>{enrollment.roomType}</td>
                              <td>{enrollment.mealPlan}</td>
                              <td>
                                <span className={`badge bg-${getStatusColor(enrollment.status)}`}>
                                  {enrollment.status}
                                </span>
                              </td>
                              <td>{new Date(enrollment.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <p className="mb-3">You haven't submitted any hostel enrollment applications yet.</p>
                      <Link to="/enrollments/new" className="btn btn-primary">
                        Apply for Hostel
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Issues Tab */}
              {activeTab === 'issues' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3>My Reported Issues</h3>
                    <Link to="/issues/new" className="btn btn-danger">
                      Report New Issue
                    </Link>
                  </div>

                  {issues && issues.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Title</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Reported Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {issues.map(issue => (
                            <tr key={issue._id}>
                              <td>{issue.title}</td>
                              <td>{issue.location}</td>
                              <td>
                                <span className={`badge bg-${
                                  issue.status === 'Resolved' ? 'success' : 
                                  issue.status === 'In Progress' ? 'info' : 
                                  'warning'}`}
                                >
                                  {issue.status}
                                </span>
                              </td>
                              <td>
                                <span className={`badge bg-${
                                  issue.priority === 'High' ? 'danger' : 
                                  issue.priority === 'Medium' ? 'warning' : 
                                  'info'}`}
                                >
                                  {issue.priority}
                                </span>
                              </td>
                              <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                              <td>
                                <Link to={`/issues/${issue._id}`} className="btn btn-sm btn-info">
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <p className="mb-3">You haven't reported any issues yet.</p>
                      <Link to="/issues/new" className="btn btn-danger">
                        Report an Issue
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Notices Tab */}
              {activeTab === 'notices' && (
                <div>
                  <h3 className="mb-4">Important Notices</h3>
                  <Notice />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 