import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllStudents } from '../redux/slices/userSlice';
import { getAllEnrollments, updateEnrollmentStatus } from '../redux/slices/enrollmentSlice';
import { getRooms } from '../redux/slices/roomSlice';
import { getIssues } from '../redux/actions/issueActions';
import { getAllFeedback } from '../redux/actions/feedbackActions';
import Spinner from '../components/Spinner';
import AdminNotice from '../components/Notice/AdminNotice';
import './AdminDashboard.css'; // We'll create this CSS file

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('roomStats'); // Default to room statistics tab
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrollmentView, setEnrollmentView] = useState('pending'); // 'pending', 'approved', 'allocated'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const dispatch = useDispatch();

  const { user } = useSelector(state => state.auth);
  const { students = [], isLoading: studentsLoading, isError: studentsError, message: studentsMessage } = useSelector(state => state.users || { students: [] });
  const { enrollments = [], pagination = {}, isLoading: enrollmentsLoading } = useSelector(state => state.enrollments);
  const { issues = [], isLoading: issuesLoading } = useSelector(state => state.issues || { issues: [] });
  const { feedbacks = [], isLoading: feedbacksLoading } = useSelector(state => state.feedbacks || { feedbacks: [] });
  const { rooms = [], isLoading: roomLoading } = useSelector(state => state.rooms);

  // Add a state to hold mock enrollments
  const [useMockEnrollments, setMockEnrollments] = useState(false);

  useEffect(() => {
    loadEnrollments();
    dispatch(getAllStudents());
    dispatch(getRooms());
    dispatch(getIssues(1, 5)); 
    dispatch(getAllFeedback(1, 5));
  }, [dispatch]);

  const loadEnrollments = async () => {
    try {
      console.log("Fetching enrollment data...");
      await dispatch(getAllEnrollments({
        page: currentPage,
        limit: limit,
        status: enrollmentView === 'pending' ? 'Pending' : 
               enrollmentView === 'approved' ? 'Approved' :
               enrollmentView === 'allocated' ? 'Room Allocated' : ''
      }));
    } catch (error) {
      console.error("Error loading enrollment data:", error);
      toast.error("Could not load enrollment data");
    }
  };

  // Re-fetch enrollments when page, limit or view changes
  useEffect(() => {
    loadEnrollments();
  }, [currentPage, limit, enrollmentView]);

  useEffect(() => {
    if (studentsError) {
      toast.error(studentsMessage || "Failed to load student data");
    }
  }, [studentsError, studentsMessage]);

  const updateStatus = async (id, status) => {
    try {
      await dispatch(updateEnrollmentStatus({ id, statusData: { status } }));
      toast.success(`Enrollment status updated to ${status}`);
      // Reload the current page of enrollments
      loadEnrollments();
    } catch (error) {
      toast.error('Error updating enrollment status');
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing limit
  };

  // Get enrollments based on search (we're now relying more on the backend filtering)
  const filteredEnrollments = searchTerm === '' 
    ? enrollments 
    : enrollments.filter(enrollment => {
        if (!enrollment) return false;
        
        // Get the user from the enrollment if it's populated, otherwise find it in students array
        const student = enrollment.user && typeof enrollment.user === 'object' 
          ? enrollment.user 
          : students.find(s => s._id === enrollment.user);
          
        if (!student) return false;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          student.name?.toLowerCase().includes(searchLower) || 
          student.email?.toLowerCase().includes(searchLower) ||
          student.regNo?.toLowerCase().includes(searchLower) ||
          enrollment.roomType?.toLowerCase().includes(searchLower)
        );
      });

  const enrollmentsToShow = filteredEnrollments;

  const isLoading = enrollmentsLoading || roomLoading || studentsLoading || issuesLoading || feedbacksLoading;

  if (isLoading) {
    return <Spinner />;
  }

  // Helper function to get the student data from an enrollment
  const getStudentFromEnrollment = (enrollment) => {
    if (!enrollment) return null;
    
    // If user is already populated as an object with data, use it
    if (enrollment.user && typeof enrollment.user === 'object' && enrollment.user.name) {
      return enrollment.user;
    }
    
    // Otherwise try to find the student in the students array
    return students.find(s => s._id === enrollment.user);
  };

  // For the counts, fetch them from the backend
  const pendingEnrollments = enrollments.filter(enrollment => enrollment && enrollment.status === 'Pending');
  const approvedEnrollments = enrollments.filter(enrollment => enrollment && enrollment.status === 'Approved');
  const allocatedEnrollments = enrollments.filter(enrollment => enrollment && enrollment.status === 'Room Allocated');

  // Add this section after the enrollment table to render pagination controls
  const renderPagination = () => {
    const totalPages = pagination.totalPages || 1;
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="d-flex justify-content-between align-items-center mt-4">
        <div>
          <select 
            className="form-select" 
            value={limit} 
            onChange={handleLimitChange}
            aria-label="Items per page"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>
        
        <nav aria-label="Enrollment pagination">
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            
            {[...Array(totalPages).keys()].map(page => (
              <li key={page + 1} className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(page + 1)}
                >
                  {page + 1}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
        
        <div>
          <span className="text-muted">
            Showing {enrollmentsToShow.length} of {pagination.total || 0} enrollments
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="fw-bold display-6">Admin Dashboard</h1>
        <div className="badge bg-primary p-3 fs-6">
          <i className="bi bi-person-circle me-2"></i> {user?.name || 'Admin'}
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'roomStats' ? 'active' : ''}`}
            onClick={() => setActiveTab('roomStats')}
          >
            <i className="bi bi-bar-chart-fill me-2"></i>
            Room Statistics
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'enrollment' ? 'active' : ''}`}
            onClick={() => setActiveTab('enrollment')}
          >
            <i className="bi bi-clipboard-check me-2"></i>
            Enrollment Management
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            Issues
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <i className="bi bi-chat-left-text me-2"></i>
            Feedback
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            <i className="bi bi-megaphone me-2"></i>
            Notices
          </button>
        </li>
      </ul>

      {/* Prominent Hostel Enrollment Section at Top */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-gradient-primary text-white p-3" style={{ background: 'linear-gradient(135deg, #3a8ffe 0%, #0043c8 100%)' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold m-0">
                  <i className="bi bi-building-fill me-2"></i>
                  Hostel Enrollment Management
                </h5>
                <div className="btn-group">
                  <Link to="/admin/room-allocation" className="btn btn-sm btn-light">
                    <i className="bi bi-grid-1x2-fill me-2"></i>Manage All Enrollments
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="card-body p-4">
              <div className="row g-4 mb-4">
                <div className="col-lg-3 col-md-6">
                  <div className="card h-100 border-start border-5 border-warning shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 me-3">
                          <div className="avatar avatar-md bg-warning-lighten rounded">
                            <i className="bi bi-hourglass-split text-warning fs-3"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h3 className="fw-bold mb-1">{pendingEnrollments.length}</h3>
                          <span className="text-muted">Pending Enrollments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <div className="card h-100 border-start border-5 border-success shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 me-3">
                          <div className="avatar avatar-md bg-success-lighten rounded">
                            <i className="bi bi-check-circle-fill text-success fs-3"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h3 className="fw-bold mb-1">{approvedEnrollments.length}</h3>
                          <span className="text-muted">Approved Enrollments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <div className="card h-100 border-start border-5 border-info shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 me-3">
                          <div className="avatar avatar-md bg-info-lighten rounded">
                            <i className="bi bi-house-door-fill text-info fs-3"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h3 className="fw-bold mb-1">{allocatedEnrollments.length}</h3>
                          <span className="text-muted">Room Allocated</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-3 col-md-6">
                  <div className="card h-100 border-start border-5 border-danger shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 me-3">
                          <div className="avatar avatar-md bg-danger-lighten rounded">
                            <i className="bi bi-x-circle-fill text-danger fs-3"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h3 className="fw-bold mb-1">{enrollments.length - pendingEnrollments.length - approvedEnrollments.length - allocatedEnrollments.length}</h3>
                          <span className="text-muted">Rejected Enrollments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter and Search */}
              <div className="row align-items-center mb-4">
                <div className="col-md-6">
                  <ul className="nav nav-pills nav-fill">
                    <li className="nav-item">
                      <button 
                        type="button" 
                        className={`nav-link ${enrollmentView === 'pending' ? 'active' : ''}`}
                        onClick={() => {
                          setEnrollmentView('pending');
                          setCurrentPage(1);
                        }}
                      >
                        <i className="bi bi-hourglass-split me-2"></i> Pending
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        type="button" 
                        className={`nav-link ${enrollmentView === 'approved' ? 'active' : ''}`}
                        onClick={() => {
                          setEnrollmentView('approved');
                          setCurrentPage(1);
                        }}
                      >
                        <i className="bi bi-check-circle me-2"></i> Approved
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        type="button" 
                        className={`nav-link ${enrollmentView === 'allocated' ? 'active' : ''}`}
                        onClick={() => {
                          setEnrollmentView('allocated');
                          setCurrentPage(1);
                        }}
                      >
                        <i className="bi bi-house-door me-2"></i> Allocated
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search by name, email, or reg number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button 
                        className="btn btn-outline-secondary border-start-0" 
                        type="button"
                        onClick={() => setSearchTerm('')}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Enrollment Table */}
              <div className="card shadow-sm">
                <div className="card-body p-0">
                  {enrollmentsToShow.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="ps-3">Student Details</th>
                            <th>Registration No.</th>
                            <th>Student Type</th>
                            <th>Room Preferences</th>
                            <th>Meal Plan</th>
                            <th>Date Applied</th>
                            <th className="text-end pe-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollmentsToShow.map((enrollment) => {
                            if (!enrollment) return null;
                            const student = getStudentFromEnrollment(enrollment);
                            return (
                              <tr key={enrollment._id}>
                                <td className="ps-3">
                                  <div className="d-flex align-items-center">
                                    <div className="avatar me-3 bg-soft-primary rounded-circle">
                                      <span className="avatar-text">
                                        {student?.name?.charAt(0)?.toUpperCase() || 'U'}
                                      </span>
                                    </div>
                                    <div>
                                      <h6 className="mb-0">{student?.name || 'Unknown'}</h6>
                                      <small className="text-muted">{student?.email || 'N/A'}</small>
                                      <div>
                                        <span className={`badge ${
                                          enrollment.gender === 'Male' ? 'text-bg-soft-primary' : 'text-bg-soft-danger'
                                        } rounded-pill`}>
                                          <i className={`bi ${
                                            enrollment.gender === 'Male' ? 'bi-gender-male' : 'bi-gender-female'
                                          } me-1`}></i>
                                          {enrollment.gender || 'N/A'}
                                        </span>
                                        <span className={`badge ${
                                          enrollment.studentType === 'School' ? 'text-bg-soft-info' : 'text-bg-soft-success'
                                        } rounded-pill ms-1`}>
                                          {enrollment.studentType || 'N/A'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>{student?.regNo || student?.studentId || 'N/A'}</td>
                                <td>
                                  <span className={`badge ${
                                    enrollment.studentType === 'School' ? 'text-bg-info' : 'text-bg-primary'
                                  } rounded-pill`}>
                                    {enrollment.studentType || 'N/A'}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex flex-column">
                                    <span className="badge text-bg-soft-dark mb-1">{enrollment.roomType || 'N/A'}</span>
                                    {enrollment.roomPreferences?.acPreference && 
                                      <span className="badge text-bg-soft-info">AC Required</span>
                                    }
                                  </div>
                                </td>
                                <td>{enrollment.mealPlan || 'N/A'}</td>
                                <td>
                                  <div className="d-flex flex-column">
                                    <span>{new Date(enrollment.createdAt).toLocaleDateString()}</span>
                                    <small className="text-muted">
                                      {new Date(enrollment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </small>
                                  </div>
                                </td>
                                <td className="text-end pe-3">
                                  {enrollment.status === 'Pending' && (
                                    <div className="btn-group">
                                      <button
                                        onClick={() => updateStatus(enrollment._id, 'Approved')}
                                        className="btn btn-sm btn-outline-success"
                                        title="Approve"
                                      >
                                        <i className="bi bi-check-circle me-1"></i> Approve
                                      </button>
                                      <button
                                        onClick={() => updateStatus(enrollment._id, 'Rejected')}
                                        className="btn btn-sm btn-outline-danger"
                                        title="Reject"
                                      >
                                        <i className="bi bi-x-circle me-1"></i> Reject
                                      </button>
                                      <Link 
                                        to={`/enrollments/${enrollment._id}`} 
                                        className="btn btn-sm btn-outline-primary"
                                        title="View Details"
                                      >
                                        <i className="bi bi-eye"></i>
                                      </Link>
                                    </div>
                                  )}
                                  {enrollment.status === 'Approved' && (
                                    <div className="btn-group">
                                      <Link
                                        to={`/admin/room-allocation?studentId=${student?._id}`}
                                        className="btn btn-sm btn-outline-primary"
                                        title="Allocate Room"
                                      >
                                        <i className="bi bi-building me-1"></i> Allocate
                                      </Link>
                                      <Link 
                                        to={`/enrollments/${enrollment._id}`} 
                                        className="btn btn-sm btn-outline-info"
                                        title="View Details"
                                      >
                                        <i className="bi bi-eye"></i>
                                      </Link>
                                    </div>
                                  )}
                                  {enrollment.status === 'Room Allocated' && (
                                    <div className="btn-group">
                                      <Link 
                                        to={`/admin/room-allocation?studentId=${student?._id}`}
                                        className="btn btn-sm btn-outline-secondary"
                                        title="Change Room"
                                      >
                                        <i className="bi bi-arrow-left-right me-1"></i> Change
                                      </Link>
                                      <Link 
                                        to={`/enrollments/${enrollment._id}`} 
                                        className="btn btn-sm btn-outline-info"
                                        title="View Details"
                                      >
                                        <i className="bi bi-eye"></i>
                                      </Link>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-info text-center m-3">
                      <i className="bi bi-info-circle me-2 fs-5"></i>
                      No {enrollmentView} enrollments found
                      {searchTerm && " matching your search criteria"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-4">
          <div className="card border-0 shadow h-100">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4 text-primary">Enrollment Statistics</h5>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">Pending Enrollments</span>
                  <span className="badge bg-warning rounded-pill fs-6 px-3 py-2">{pendingEnrollments.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">Approved (Not Allocated)</span>
                  <span className="badge bg-success rounded-pill fs-6 px-3 py-2">{approvedEnrollments.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">Room Allocated</span>
                  <span className="badge bg-info rounded-pill fs-6 px-3 py-2">{allocatedEnrollments.length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6 fw-bold">Total Enrollments</span>
                  <span className="badge bg-primary rounded-pill fs-6 px-3 py-2">{enrollments.length}</span>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0 py-3">
              <Link to="/admin/room-allocation" className="btn btn-outline-primary w-100 fw-bold">
                <i className="bi bi-list-check me-2"></i>Manage Enrollments
              </Link>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow h-100">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4 text-primary">Room Statistics</h5>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">Available Rooms</span>
                  <span className="badge bg-success rounded-pill fs-6 px-3 py-2">{rooms.filter(room => room.occupancy === 0).length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">Partially Occupied</span>
                  <span className="badge bg-warning rounded-pill fs-6 px-3 py-2">{rooms.filter(room => room.occupancy > 0 && room.occupancy < room.capacity).length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">Fully Occupied</span>
                  <span className="badge bg-danger rounded-pill fs-6 px-3 py-2">{rooms.filter(room => room.occupancy >= room.capacity).length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6 fw-bold">Total Rooms</span>
                  <span className="badge bg-primary rounded-pill fs-6 px-3 py-2">{rooms.length}</span>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent border-0 py-3">
              <Link to="/admin/rooms" className="btn btn-outline-primary w-100 fw-bold">
                <i className="bi bi-building me-2"></i>Manage Rooms
              </Link>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow h-100">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4 text-primary">Quick Actions</h5>
              <div className="d-grid gap-3">
                <Link to="/admin/rooms" className="btn btn-primary py-3 fw-bold">
                  <i className="bi bi-building me-2"></i>Room Management
                </Link>
                <Link to="/admin/room-allocation" className="btn btn-success py-3 fw-bold">
                  <i className="bi bi-person-check me-2"></i>Room Allocation
                </Link>
                <Link to="/issues" className="btn btn-info py-3 fw-bold text-white">
                  <i className="bi bi-exclamation-triangle me-2"></i>View Issues
                </Link>
                <Link to="/feedback" className="btn btn-secondary py-3 fw-bold">
                  <i className="bi bi-chat-left-text me-2"></i>View Feedback
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Issues and Feedback Section */}
      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div className="card border-0 shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title fw-bold text-primary mb-0">Recent Issues</h5>
                <Link to="/issues" className="btn btn-sm btn-outline-primary">View All</Link>
              </div>
              
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">Open Issues</span>
                  <span className="badge bg-primary rounded-pill fs-6 px-3 py-2">{issues.filter(issue => issue.status === 'open').length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">In Progress</span>
                  <span className="badge bg-warning rounded-pill fs-6 px-3 py-2">{issues.filter(issue => issue.status === 'in-progress').length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">Resolved</span>
                  <span className="badge bg-success rounded-pill fs-6 px-3 py-2">{issues.filter(issue => issue.status === 'resolved').length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6 fw-bold">Total Issues</span>
                  <span className="badge bg-secondary rounded-pill fs-6 px-3 py-2">{issues.length}</span>
                </div>
              </div>
              
              {issues.length > 0 ? (
                <div className="list-group">
                  {issues.slice(0, 3).map(issue => (
                    <Link to={`/issues/${issue._id}`} key={issue._id} className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{issue.title}</h6>
                        <span className={`badge ${issue.status === 'open' ? 'bg-primary' : issue.status === 'in-progress' ? 'bg-warning' : 'bg-success'}`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="mb-1 text-truncate">{issue.description}</p>
                      <small className="text-muted">
                        {issue.location} • {new Date(issue.createdAt).toLocaleDateString()}
                      </small>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  No issues have been reported yet.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-6">
          <div className="card border-0 shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title fw-bold text-primary mb-0">Recent Feedback</h5>
                <Link to="/feedback" className="btn btn-sm btn-outline-primary">View All</Link>
              </div>
              
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">Pending Review</span>
                  <span className="badge bg-info rounded-pill fs-6 px-3 py-2">{feedbacks.filter(feedback => feedback.status === 'pending').length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">Reviewed</span>
                  <span className="badge bg-primary rounded-pill fs-6 px-3 py-2">{feedbacks.filter(feedback => feedback.status === 'reviewed').length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6">Implemented</span>
                  <span className="badge bg-success rounded-pill fs-6 px-3 py-2">{feedbacks.filter(feedback => feedback.status === 'implemented').length}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fs-6 fw-bold">Total Feedback</span>
                  <span className="badge bg-secondary rounded-pill fs-6 px-3 py-2">{feedbacks.length}</span>
                </div>
              </div>
              
              {feedbacks.length > 0 ? (
                <div className="list-group">
                  {feedbacks.slice(0, 3).map(feedback => (
                    <Link to={`/feedback/${feedback._id}`} key={feedback._id} className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{feedback.title}</h6>
                        <span className={`badge ${feedback.status === 'pending' ? 'bg-info' : feedback.status === 'reviewed' ? 'bg-primary' : 'bg-success'}`}>
                          {feedback.status}
                        </span>
                      </div>
                      <p className="mb-1 text-truncate">{feedback.description}</p>
                      <small className="text-muted">
                        {feedback.category} • {new Date(feedback.createdAt).toLocaleDateString()}
                      </small>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  No feedback has been submitted yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Room Allocation Section */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-4 text-primary">Room Allocation Overview</h5>
              <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2 fs-5"></i>
                You can allocate rooms to students manually or use the auto-allocation feature based on student preferences.
              </div>
              <div className="d-flex justify-content-between mt-4">
                <Link to="/admin/room-allocation" className="btn btn-primary btn-lg px-4 py-3 fw-bold">
                  <i className="bi bi-person-plus-fill me-2"></i>Manual Allocation
                </Link>
                <Link to="/admin/room-allocation?autoAllocate=true" className="btn btn-success btn-lg px-4 py-3 fw-bold">
                  <i className="bi bi-magic me-2"></i>Auto Allocation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notices Tab */}
      {activeTab === 'notices' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <AdminNotice />
          </div>
        </div>
      )}

      {enrollmentsToShow.length > 0 && renderPagination()}
    </div>
  );
};

export default AdminDashboard; 