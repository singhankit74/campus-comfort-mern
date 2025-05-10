import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyFeedback, getAllFeedback } from '../redux/actions/feedbackActions';
import { reset } from '../redux/slices/feedbackSlice';
import Spinner from '../components/Spinner';

const FeedbackList = () => {
  const dispatch = useDispatch();
  const { feedbacks, myFeedbacks, isLoading, isError, message, pagination } = useSelector((state) => state.feedback);
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [activeTab, setActiveTab] = useState('my');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        if (activeTab === 'my' || !user || (user.role !== 'admin' && user.role !== 'staff')) {
          await dispatch(getMyFeedback());
        } else {
          await dispatch(getAllFeedback(currentPage, limit));
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchFeedback();

    return () => {
      dispatch(reset());
    };
  }, [dispatch, activeTab, currentPage, limit, user]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  if (isLoading) {
    return <Spinner />;
  }

  const displayFeedbacks = activeTab === 'my' ? myFeedbacks : feedbacks;
  const isAdminOrStaff = user && (user.role === 'admin' || user.role === 'staff');

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Feedback</h1>
        <Link to="/feedback/create" className="btn btn-primary">
          Submit New Feedback
        </Link>
      </div>

      {isAdminOrStaff && (
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'my' ? 'active' : ''}`}
              onClick={() => setActiveTab('my')}
            >
              My Feedback
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Feedback
            </button>
          </li>
        </ul>
      )}

      {displayFeedbacks && displayFeedbacks.length > 0 ? (
        <>
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayFeedbacks.map((feedback) => (
                      <tr key={feedback._id}>
                        <td>{feedback.title}</td>
                        <td>{feedback.category}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(feedback.status)}`}>
                            {feedback.status}
                          </span>
                        </td>
                        <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link
                            to={`/feedback/${feedback._id}`}
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {activeTab === 'all' && pagination && pagination.totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(pagination.totalPages).keys()].map((page) => (
                  <li
                    key={page + 1}
                    className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page + 1)}
                    >
                      {page + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === pagination.totalPages ? 'disabled' : ''
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      ) : (
        <div className="card">
          <div className="card-body text-center py-5">
            <h3>No feedback found</h3>
            <p className="mb-0">
              {activeTab === 'my'
                ? 'You have not submitted any feedback yet.'
                : 'There is no feedback available.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackList; 