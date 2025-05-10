import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getFeedback, updateFeedback, deleteFeedback } from '../redux/actions/feedbackActions';
import { reset } from '../redux/slices/feedbackSlice';
import Spinner from '../components/Spinner';

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { feedback, isLoading, isError, message } = useSelector((state) => state.feedbacks);
  const { user } = useSelector((state) => state.auth);
  
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        await dispatch(getFeedback(id));
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchFeedback();

    return () => {
      dispatch(reset());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(updateFeedback(id, { status: newStatus }));
      toast.success(`Feedback status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteFeedback(id));
      toast.success('Feedback deleted successfully');
      navigate('/feedback');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-info';
      case 'reviewed':
        return 'bg-primary';
      case 'implemented':
        return 'bg-success';
      case 'declined':
        return 'bg-secondary';
      default:
        return 'bg-light text-dark';
    }
  };

  if (isLoading || !feedback) {
    return <Spinner />;
  }

  const isAuthor = user && feedback.user === user._id;
  const isStaffOrAdmin = user && (user.role === 'staff' || user.role === 'admin');
  const canModify = isAuthor || isStaffOrAdmin;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <Link to="/feedback" className="btn btn-outline-secondary">
          &larr; Back to Feedback
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h2 className="mb-0">{feedback.title}</h2>
          <span className={`badge ${getStatusBadge(feedback.status)}`}>
            {feedback.status}
          </span>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <p className="mb-1 text-muted">Category</p>
              <p className="mb-0 fw-bold">{feedback.category}</p>
            </div>
            <div className="col-md-4">
              <p className="mb-1 text-muted">Type</p>
              <p className="mb-0 fw-bold">{feedback.type}</p>
            </div>
            <div className="col-md-4">
              <p className="mb-1 text-muted">Submitted On</p>
              <p className="mb-0 fw-bold">{new Date(feedback.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <hr />
          <h5>Details</h5>
          <p className="mb-0">{feedback.description}</p>
          
          {feedback.response && (
            <>
              <hr />
              <h5>Staff Response</h5>
              <div className="p-3 bg-light rounded">
                <p className="mb-0">{feedback.response}</p>
              </div>
            </>
          )}
        </div>

        {canModify && (
          <div className="card-footer bg-light">
            <div className="d-flex justify-content-between">
              <div>
                {isStaffOrAdmin && (
                  <div className="dropdown">
                    <button
                      className="btn btn-outline-primary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Update Status
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleStatusChange('pending')}
                        >
                          Pending
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleStatusChange('reviewed')}
                        >
                          Reviewed
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleStatusChange('implemented')}
                        >
                          Implemented
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleStatusChange('declined')}
                        >
                          Declined
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div>
                {canModify && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => setShowConfirmDelete(true)}
                  >
                    Delete Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isStaffOrAdmin && (
        <div className="card mb-4">
          <div className="card-header bg-light">
            <h4 className="mb-0">Add or Update Response</h4>
          </div>
          <div className="card-body">
            <form onSubmit={(e) => {
              e.preventDefault();
              const response = e.target.response.value.trim();
              if (response) {
                dispatch(updateFeedback(id, { response }))
                  .then(() => toast.success('Response added successfully'))
                  .catch((err) => toast.error(err.message));
              } else {
                toast.error('Please enter a response');
              }
            }}>
              <div className="mb-3">
                <label htmlFor="response" className="form-label">
                  Response
                </label>
                <textarea
                  className="form-control"
                  id="response"
                  name="response"
                  rows="3"
                  defaultValue={feedback.response || ''}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Save Response
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="position-fixed top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="position-absolute top-50 start-50 translate-middle bg-white p-4 rounded shadow-sm" style={{ width: '90%', maxWidth: '500px' }}>
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this feedback? This action cannot be undone.</p>
            <div className="d-flex justify-content-end gap-2">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackDetail; 