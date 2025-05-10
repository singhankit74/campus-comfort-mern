import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { 
  getAllEnrollments,
  updateEnrollmentStatus
} from '../redux/slices/enrollmentSlice';
import { 
  getRooms, 
  allocateRoom,
  autoAllocateRooms,
  deallocateRoom
} from '../redux/slices/roomSlice';
import Spinner from '../components/Spinner';
import 'bootstrap/dist/css/bootstrap.min.css';

const RoomAllocation = () => {
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Approved');
  const [roomSearchTerm, setRoomSearchTerm] = useState('');
  const [autoAllocating, setAutoAllocating] = useState(false);
  const [autoAllocateResults, setAutoAllocateResults] = useState(null);

  const location = useLocation();
  const dispatch = useDispatch();
  
  const { enrollments, isLoading: enrollmentLoading } = useSelector(state => state.enrollments);
  const { rooms, isLoading: roomLoading } = useSelector(state => state.rooms);

  const isLoading = enrollmentLoading || roomLoading || autoAllocating;

  useEffect(() => {
    dispatch(getAllEnrollments());
    dispatch(getRooms());
    
    // Check if auto-allocate parameter is present in URL
    const params = new URLSearchParams(location.search);
    if (params.get('autoAllocate') === 'true') {
      // Trigger auto allocation after a short delay to ensure data is loaded
      const timer = setTimeout(() => {
        handleAutoAllocate();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [dispatch, location]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalOpen]);

  const openAllocationModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setSelectedRoom('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEnrollment(null);
    setSelectedRoom('');
  };

  const handleAllocateRoom = () => {
    if (!selectedRoom) {
      toast.error('Please select a room');
      return;
    }

    // Find the selected room
    const room = rooms.find(r => r._id === selectedRoom);
    
    // Check for potential mismatches but allow admin to proceed
    let warnings = [];
    
    if (selectedEnrollment.gender === 'Male' && room.block !== 'Boys') {
      warnings.push("Room block doesn't match student gender");
    }
    
    if (selectedEnrollment.gender === 'Female' && room.block !== 'Girls') {
      warnings.push("Room block doesn't match student gender");
    }
    
    if (room.type !== selectedEnrollment.studentType) {
      warnings.push(`Room type (${room.type}) doesn't match student type (${selectedEnrollment.studentType})`);
    }
    
    if (selectedEnrollment.studentType === 'School' && !room.hasAC) {
      warnings.push("School students typically require AC rooms");
    }
    
    // Show warnings but allow admin to proceed
    if (warnings.length > 0) {
      const proceed = window.confirm(`Warning: ${warnings.join(', ')}. Do you want to proceed anyway?`);
      if (!proceed) return;
    }

    // Always use override to allow admins full control
    dispatch(allocateRoom({ 
      enrollmentId: selectedEnrollment._id, 
      roomId: selectedRoom,
      override: true // Always allow admin to override
    }))
      .unwrap()
      .then(() => {
        toast.success('Room allocated successfully');
        dispatch(getAllEnrollments());
        dispatch(getRooms());
        closeModal();
      })
      .catch(error => {
        console.error('Room allocation error:', error);
        toast.error(typeof error === 'string' ? error : 'Failed to allocate room');
      });
  };

  const handleDeallocateRoom = (enrollmentId) => {
    if (window.confirm('Are you sure you want to deallocate this room?')) {
      dispatch(deallocateRoom(enrollmentId))
        .unwrap()
        .then(() => {
          toast.success('Room deallocated successfully');
          dispatch(getAllEnrollments());
          dispatch(getRooms());
        })
        .catch(error => toast.error(error));
    }
  };

  const handleAutoAllocate = () => {
    setAutoAllocating(true);
    setAutoAllocateResults(null);
    
    dispatch(autoAllocateRooms())
      .unwrap()
      .then((result) => {
        setAutoAllocateResults(result);
        toast.success(`Auto allocation completed: ${result.results.success.length} allocated, ${result.results.failed.length} failed`);
        dispatch(getAllEnrollments());
        dispatch(getRooms());
      })
      .catch(error => toast.error(error))
      .finally(() => setAutoAllocating(false));
  };

  // Filter enrollments based on search and status
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user?.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user?.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? enrollment.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  // Filter available rooms for the selected enrollment
  const getAvailableRooms = () => {
    if (!selectedEnrollment) return [];

    return rooms.filter(room => {
      // Must not be fully occupied
      if (room.occupancy >= room.capacity) return false;
      
      // Filter by search term only
      if (roomSearchTerm && 
          !room.roomNumber.toLowerCase().includes(roomSearchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  const availableRooms = getAvailableRooms();

  if (isLoading && !modalOpen) {
    return <Spinner />;
  }

  return (
    <div className="container my-4">
      {/* Compatibility Rules Alert */}
      <div className="alert alert-info mb-4">
        <h5 className="mb-2"><i className="bi bi-info-circle-fill me-2"></i>Room Allocation Rules:</h5>
        <ul className="mb-0">
          <li><strong>Student Type Compatibility:</strong> College students can only be allocated with other college students. School students can only be allocated with other school students.</li>
          <li><strong>Gender Compatibility:</strong> Students can only be allocated with others of the same gender.</li>
          <li><strong>AC Requirement:</strong> AC rooms are compulsory for school students.</li>
        </ul>
      </div>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Room Allocation</h2>
        <button
          className="btn btn-primary"
          onClick={handleAutoAllocate}
          disabled={autoAllocating}
        >
          {autoAllocating ? 'Processing...' : 'Auto Allocate Rooms'}
        </button>
      </div>
      
      {isLoading ? (
        <Spinner />
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Approved">Approved</option>
                <option value="Room Allocated">Room Allocated</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>

          {autoAllocateResults && (
            <div className="alert alert-info mb-4">
              <h5 className="alert-heading">Auto Allocation Results</h5>
              <p>Successfully allocated: {autoAllocateResults.results.success.length}</p>
              <p>Failed to allocate: {autoAllocateResults.results.failed.length}</p>
              {autoAllocateResults.results.failed.length > 0 && (
                <div>
                  <p className="mb-1">Failed allocations:</p>
                  <ul className="mb-0">
                    {autoAllocateResults.results.failed.map((failed, index) => (
                      <li key={index}>{failed.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h4 className="card-title mb-3">Enrollment Applications</h4>
              
              {filteredEnrollments.length === 0 ? (
                <div className="alert alert-info">
                  No enrollments found matching your criteria
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Student</th>
                        <th>Reg. Number</th>
                        <th>Type</th>
                        <th>Gender</th>
                        <th>State</th>
                        <th>Status</th>
                        <th>Room</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEnrollments.map(enrollment => (
                        <tr key={enrollment._id}>
                          <td>{enrollment.user?.name}</td>
                          <td>{enrollment.user?.regNo || enrollment.user?.studentId}</td>
                          <td>
                            <span className={`badge ${enrollment.studentType === 'School' ? 'bg-info' : 'bg-primary'}`}>
                              {enrollment.studentType}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${enrollment.gender === 'Male' ? 'bg-primary' : 'bg-danger'}`}>
                              {enrollment.gender}
                            </span>
                          </td>
                          <td>{enrollment.state}</td>
                          <td>
                            <span className={`badge ${
                              enrollment.status === 'Approved' ? 'bg-success' : 
                              enrollment.status === 'Pending' ? 'bg-warning' : 
                              enrollment.status === 'Rejected' ? 'bg-danger' : 
                              'bg-info'
                            }`}>
                              {enrollment.status}
                            </span>
                          </td>
                          <td>
                            {enrollment.allocatedRoom ? (
                              enrollment.allocatedRoom.roomNumber
                            ) : (
                              <span className="text-muted">Not Allocated</span>
                            )}
                          </td>
                          <td>
                            {enrollment.status === 'Approved' && !enrollment.allocatedRoom && (
                              <button
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => openAllocationModal(enrollment)}
                              >
                                Allocate Room
                              </button>
                            )}
                            {enrollment.status === 'Room Allocated' && enrollment.allocatedRoom && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeallocateRoom(enrollment._id)}
                              >
                                Deallocate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Room Allocation Modal */}
          {modalOpen && selectedEnrollment && (
            <>
              <div 
                className="modal fade show" 
                style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                onClick={closeModal}
              >
                <div 
                  className="modal-dialog modal-lg" 
                  onClick={(e) => e.stopPropagation()}
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        Allocate Room for {selectedEnrollment.user?.name}
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={closeModal}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-4">
                        <h6>Student Information</h6>
                        <div className="row">
                          <div className="col-md-6">
                            <p><strong>Registration Number:</strong> {selectedEnrollment.user?.regNo || 'Not assigned yet'}</p>
                            <p><strong>Student Type:</strong> {selectedEnrollment.studentType}</p>
                            <p><strong>Gender:</strong> {selectedEnrollment.gender}</p>
                          </div>
                          <div className="col-md-6">
                            <p><strong>State:</strong> {selectedEnrollment.state}</p>
                            <p><strong>AC Preference:</strong> {selectedEnrollment.roomPreferences?.acPreference ? 'Yes' : 'No'}</p>
                            <p><strong>Same State Preference:</strong> {selectedEnrollment.roomPreferences?.sameStatePreference ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h6>Select Room</h6>
                        <div className="mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search rooms"
                            value={roomSearchTerm}
                            onChange={e => setRoomSearchTerm(e.target.value)}
                          />
                        </div>
                        {availableRooms.length === 0 ? (
                          <div className="alert alert-warning">
                            No suitable rooms available for this student. Add more rooms from the Room Management page.
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead className="table-light">
                                <tr>
                                  <th>Select</th>
                                  <th>Room Number</th>
                                  <th>Type</th>
                                  <th>Block</th>
                                  <th>Floor</th>
                                  <th>AC</th>
                                  <th>Occupancy</th>
                                </tr>
                              </thead>
                              <tbody>
                                {availableRooms.map(room => (
                                  <tr 
                                    key={room._id} 
                                    className={selectedRoom === room._id ? 'table-primary' : ''}
                                    onClick={() => setSelectedRoom(room._id)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <td>
                                      <input
                                        type="radio"
                                        name="room"
                                        value={room._id}
                                        checked={selectedRoom === room._id}
                                        onChange={() => setSelectedRoom(room._id)}
                                        className="form-check-input"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </td>
                                    <td>{room.roomNumber}</td>
                                    <td>{room.type}</td>
                                    <td>{room.block}</td>
                                    <td>{room.floor}</td>
                                    <td>{room.hasAC ? 'Yes' : 'No'}</td>
                                    <td>{room.occupancy}/{room.capacity}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAllocateRoom}
                        disabled={!selectedRoom || availableRooms.length === 0}
                      >
                        Allocate Room
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomAllocation; 