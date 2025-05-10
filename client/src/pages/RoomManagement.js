import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getRooms, createRoom, updateRoom } from '../redux/slices/roomSlice';
import Spinner from '../components/Spinner';

const RoomManagement = () => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    block: 'Boys',
    type: 'College',
    hasAC: false,
    floor: 1
  });

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAC, setFilterAC] = useState('');

  const { roomNumber, block, type, hasAC, floor } = formData;
  
  const dispatch = useDispatch();
  const { rooms, isLoading, isError, message } = useSelector(state => state.rooms);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    dispatch(getRooms());
  }, [dispatch, isError, message]);

  const onChange = e => {
    setFormData(prevState => ({
      ...prevState,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }));
  };

  const onSubmit = e => {
    e.preventDefault();

    if (!roomNumber) {
      toast.error('Please enter room number');
      return;
    }

    // For school students, AC is compulsory
    let updatedFormData = {...formData};
    if (type === 'School') {
      updatedFormData.hasAC = true;
    }

    dispatch(createRoom(updatedFormData))
      .unwrap()
      .then(() => {
        toast.success('Room created successfully');
        setFormData({
          roomNumber: '',
          block: 'Boys',
          type: 'College',
          hasAC: false,
          floor: 1
        });
        setShowForm(false);
      })
      .catch(error => toast.error(error));
  };

  // Filter rooms based on search term and filters
  const filteredRooms = rooms.filter(room => {
    return (
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterBlock === '' || room.block === filterBlock) &&
      (filterType === '' || room.type === filterType) &&
      (filterAC === '' || (filterAC === 'AC' && room.hasAC) || (filterAC === 'Non-AC' && !room.hasAC))
    );
  });

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Room Management</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Room'}
        </button>
      </div>

      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-3">Add New Room</h4>
            <form onSubmit={onSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="roomNumber" className="form-label">Room Number*</label>
                  <input
                    type="text"
                    className="form-control"
                    id="roomNumber"
                    name="roomNumber"
                    value={roomNumber}
                    onChange={onChange}
                    placeholder="Enter room number"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="floor" className="form-label">Floor</label>
                  <input
                    type="number"
                    className="form-control"
                    id="floor"
                    name="floor"
                    value={floor}
                    onChange={onChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="block" className="form-label">Block*</label>
                  <select
                    className="form-select"
                    id="block"
                    name="block"
                    value={block}
                    onChange={onChange}
                    required
                  >
                    <option value="Boys">Boys Block</option>
                    <option value="Girls">Girls Block</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="type" className="form-label">Student Type*</label>
                  <select
                    className="form-select"
                    id="type"
                    name="type"
                    value={type}
                    onChange={onChange}
                    required
                  >
                    <option value="School">School</option>
                    <option value="College">College</option>
                  </select>
                </div>
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="hasAC"
                  name="hasAC"
                  checked={hasAC || type === 'School'}
                  onChange={onChange}
                  disabled={type === 'School'} // Disable for school as it's compulsory
                />
                <label className="form-check-label" htmlFor="hasAC">
                  Has AC
                </label>
                {type === 'School' && (
                  <div className="form-text text-info">
                    AC is compulsory for school students
                  </div>
                )}
              </div>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-success">
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="card-title mb-3">Room List</h4>
          
          <div className="row mb-4">
            <div className="col-md-6 mb-3 mb-md-0">
              <input
                type="text"
                className="form-control"
                placeholder="Search by room number"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={filterBlock}
                  onChange={e => setFilterBlock(e.target.value)}
                >
                  <option value="">All Blocks</option>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
                <select
                  className="form-select"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="School">School</option>
                  <option value="College">College</option>
                </select>
                <select
                  className="form-select"
                  value={filterAC}
                  onChange={e => setFilterAC(e.target.value)}
                >
                  <option value="">AC/Non-AC</option>
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="alert alert-info">
              No rooms found matching your criteria
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Room Number</th>
                    <th>Block</th>
                    <th>Type</th>
                    <th>Floor</th>
                    <th>AC</th>
                    <th>Occupancy</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map(room => (
                    <tr key={room._id}>
                      <td>{room.roomNumber}</td>
                      <td>
                        <span className={`badge ${room.block === 'Boys' ? 'bg-primary' : 'bg-danger'}`}>
                          {room.block}
                        </span>
                      </td>
                      <td>{room.type}</td>
                      <td>{room.floor}</td>
                      <td>
                        {room.hasAC ? (
                          <span className="badge bg-success">AC</span>
                        ) : (
                          <span className="badge bg-secondary">Non-AC</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1" style={{ height: '10px' }}>
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{ width: `${(room.occupancy / room.capacity) * 100}%` }}
                              aria-valuenow={(room.occupancy / room.capacity) * 100}
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <span className="ms-2">{room.occupancy}/{room.capacity}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          room.status === 'Available' ? 'bg-success' : 
                          room.status === 'Partially Occupied' ? 'bg-warning' : 
                          room.status === 'Fully Occupied' ? 'bg-danger' : 
                          'bg-secondary'
                        }`}>
                          {room.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomManagement; 