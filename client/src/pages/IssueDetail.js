import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIssue, updateIssue, deleteIssue, addComment } from '../redux/actions/issueActions';
import { reset } from '../redux/slices/issueSlice';
import Spinner from '../components/Spinner';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { issue, isLoading, isError, message } = useSelector((state) => state.issues);
  const { user } = useSelector((state) => state.auth);
  
  const [comment, setComment] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        await dispatch(getIssue(id));
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchIssue();

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
      await dispatch(updateIssue(id, { status: newStatus }));
      toast.success(`Issue status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await dispatch(addComment(id, { text: comment }));
      toast.success('Comment added successfully');
      setComment('');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteIssue(id));
      toast.success('Issue deleted successfully');
      navigate('/issues');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return 'bg-primary';
      case 'in-progress':
        return 'bg-warning';
      case 'resolved':
        return 'bg-success';
      case 'closed':
        return 'bg-secondary';
      default:
        return 'bg-info';
    }
  };

  if (isLoading || !issue) {
    return <Spinner />;
  }

  const isAuthor = user && issue.user === user._id;
  const isStaffOrAdmin = user && (user.role === 'staff' || user.role === 'admin');
  const canModify = isAuthor || isStaffOrAdmin;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <Link to="/issues" className="btn btn-outline-secondary">
          &larr; Back to Issues
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h2 className="mb-0">{issue.title}</h2>
          <span className={`badge ${getStatusBadge(issue.status)}`}>
            {issue.status}
          </span>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <p className="mb-1 text-muted">Category</p>
              <p className="mb-0 fw-bold">{issue.category}</p>
            </div>
            <div className="col-md-4">
              <p className="mb-1 text-muted">Location</p>
              <p className="mb-0 fw-bold">{issue.location}</p>
            </div>
            <div className="col-md-4">
              <p className="mb-1 text-muted">Reported On</p>
              <p className="mb-0 fw-bold">{new Date(issue.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <hr />
          <h5>Description</h5>
          <p className="mb-0">{issue.description}</p>
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
                          onClick={() => handleStatusChange('open')}
                        >
                          Open
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleStatusChange('in-progress')}
                        >
                          In Progress
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleStatusChange('resolved')}
                        >
                          Resolved
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleStatusChange('closed')}
                        >
                          Closed
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
                    Delete Issue
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h4 className="mb-0">Comments</h4>
        </div>
        <div className="card-body">
          {issue.comments && issue.comments.length > 0 ? (
            <div className="comment-list">
              {issue.comments.map((comment, index) => (
                <div key={index} className="comment mb-3 pb-3 border-bottom">
                  <div className="d-flex justify-content-between">
                    <h6 className="mb-1">{comment.userName || 'User'}</h6>
                    <small className="text-muted">
                      {new Date(comment.date).toLocaleString()}
                    </small>
                  </div>
                  <p className="mb-0">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center mb-4">No comments yet.</p>
          )}

          <form onSubmit={handleCommentSubmit}>
            <div className="mb-3">
              <label htmlFor="comment" className="form-label">
                Add a Comment
              </label>
              <textarea
                className="form-control"
                id="comment"
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              Submit Comment
            </button>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="position-fixed top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="position-absolute top-50 start-50 translate-middle bg-white p-4 rounded shadow-sm" style={{ width: '90%', maxWidth: '500px' }}>
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this issue? This action cannot be undone.</p>
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

export default IssueDetail; 