import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createEnrollment } from '../redux/slices/enrollmentSlice';
import Spinner from '../components/Spinner';

const EnrollmentForm = () => {
  const [formData, setFormData] = useState({
    hostelName: '',
    roomType: 'Single',
    mealPlan: 'Vegetarian',
    specialRequirements: '',
    studentType: 'College',
    gender: 'Male',
    state: '',
    roomPreferences: {
      preferredFloor: 1,
      preferredRoommates: [],
      acPreference: false,
      sameStatePreference: false
    }
  });

  const { 
    hostelName, 
    roomType, 
    mealPlan, 
    specialRequirements,
    studentType,
    gender,
    state,
    roomPreferences
  } = formData;
  
  const [tempRoommate, setTempRoommate] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading } = useSelector(state => state.enrollments);

  const onChange = e => {
    if (e.target.name.includes('.')) {
      // Handle nested objects (roomPreferences)
      const [parent, child] = e.target.name.split('.');
      setFormData(prevState => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
      }));
    }
  };

  const addRoommate = () => {
    if (tempRoommate && !roomPreferences.preferredRoommates.includes(tempRoommate)) {
      setFormData(prevState => ({
        ...prevState,
        roomPreferences: {
          ...prevState.roomPreferences,
          preferredRoommates: [...prevState.roomPreferences.preferredRoommates, tempRoommate]
        }
      }));
      setTempRoommate('');
    }
  };

  const removeRoommate = (index) => {
    setFormData(prevState => ({
      ...prevState,
      roomPreferences: {
        ...prevState.roomPreferences,
        preferredRoommates: prevState.roomPreferences.preferredRoommates.filter((_, i) => i !== index)
      }
    }));
  };

  const onSubmit = async e => {
    e.preventDefault();

    if (!hostelName) {
      toast.error('Please enter hostel name');
      return;
    }

    if (!state) {
      toast.error('Please enter your state');
      return;
    }

    // For school students, AC is compulsory
    let updatedFormData = {...formData};
    if (studentType === 'School') {
      updatedFormData.roomPreferences.acPreference = true;
    }

    try {
      await dispatch(createEnrollment(updatedFormData)).unwrap();
      toast.success('Hostel enrollment submitted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error || 'Error submitting enrollment');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">Hostel Enrollment Application</h2>
              
              <div className="alert alert-info mb-4">
                <h5 className="alert-heading">Important Information</h5>
                <p className="mb-0">
                  Please complete this form to apply for campus hostel accommodation. 
                  Your application will be reviewed by the administration, and you will be 
                  notified of the decision.
                </p>
              </div>

              <form onSubmit={onSubmit}>
                <h4 className="mb-3">Personal Information</h4>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="studentType" className="form-label">Student Type*</label>
                    <select
                      className="form-select"
                      id="studentType"
                      name="studentType"
                      value={studentType}
                      onChange={onChange}
                      required
                    >
                      <option value="School">School Student</option>
                      <option value="College">College Student</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="gender" className="form-label">Gender*</label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={gender}
                      onChange={onChange}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="state" className="form-label">State*</label>
                  <input
                    type="text"
                    className="form-control"
                    id="state"
                    name="state"
                    value={state}
                    onChange={onChange}
                    placeholder="Enter your state"
                    required
                  />
                </div>

                <h4 className="mb-3 mt-4">Hostel Information</h4>
                <div className="mb-3">
                  <label htmlFor="hostelName" className="form-label">Hostel Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    id="hostelName"
                    name="hostelName"
                    value={hostelName}
                    onChange={onChange}
                    placeholder="Enter hostel name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="roomType" className="form-label">Room Type*</label>
                  <select
                    className="form-select"
                    id="roomType"
                    name="roomType"
                    value={roomType}
                    onChange={onChange}
                    required
                  >
                    <option value="Single">Single Room</option>
                    <option value="Double">Double Room (Shared)</option>
                    <option value="Triple">Triple Room (Shared)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="mealPlan" className="form-label">Meal Plan*</label>
                  <select
                    className="form-select"
                    id="mealPlan"
                    name="mealPlan"
                    value={mealPlan}
                    onChange={onChange}
                    required
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="No Meal Plan">No Meal Plan</option>
                  </select>
                </div>

                <h4 className="mb-3 mt-4">Room Preferences</h4>
                <div className="mb-3">
                  <label htmlFor="preferredFloor" className="form-label">Preferred Floor</label>
                  <input
                    type="number"
                    className="form-control"
                    id="preferredFloor"
                    name="roomPreferences.preferredFloor"
                    value={roomPreferences.preferredFloor}
                    onChange={onChange}
                    min="1"
                  />
                </div>

                {studentType === 'College' && (
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="acPreference"
                      name="roomPreferences.acPreference"
                      checked={roomPreferences.acPreference}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="acPreference">
                      Prefer AC Room
                    </label>
                  </div>
                )}

                {studentType === 'School' && (
                  <div className="alert alert-warning">
                    <i className="bi bi-info-circle me-2"></i>
                    AC rooms are compulsory for school students
                  </div>
                )}

                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="sameStatePreference"
                    name="roomPreferences.sameStatePreference"
                    checked={roomPreferences.sameStatePreference}
                    onChange={onChange}
                  />
                  <label className="form-check-label" htmlFor="sameStatePreference">
                    Prefer roommates from same state
                  </label>
                </div>

                <div className="mb-3">
                  <label htmlFor="preferredRoommates" className="form-label">Preferred Roommates</label>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      id="preferredRoommates"
                      value={tempRoommate}
                      onChange={(e) => setTempRoommate(e.target.value)}
                      placeholder="Enter student ID"
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-primary"
                      onClick={addRoommate}
                    >
                      Add
                    </button>
                  </div>
                  {roomPreferences.preferredRoommates.length > 0 && (
                    <div className="mt-2">
                      <p className="mb-1">Selected roommates:</p>
                      <ul className="list-group">
                        {roomPreferences.preferredRoommates.map((id, index) => (
                          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            {id}
                            <button 
                              type="button" 
                              className="btn btn-sm btn-danger" 
                              onClick={() => removeRoommate(index)}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="specialRequirements" className="form-label">
                    Special Requirements or Preferences
                  </label>
                  <textarea
                    className="form-control"
                    id="specialRequirements"
                    name="specialRequirements"
                    value={specialRequirements}
                    onChange={onChange}
                    placeholder="Any special requirements or preferences?"
                    rows="3"
                  ></textarea>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Submit Application
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

export default EnrollmentForm; 