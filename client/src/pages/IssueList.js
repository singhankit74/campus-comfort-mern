import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getIssues } from '../redux/actions/issueActions';
import { reset } from '../redux/slices/issueSlice';
import Spinner from '../components/Spinner';

const IssueList = () => {
  const dispatch = useDispatch();
  const { issues, isLoading, isError, message, pagination } = useSelector((state) => state.issues);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        await dispatch(getIssues(currentPage, limit));
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchIssues();

    return () => {
      dispatch(reset());
    };
  }, [dispatch, currentPage, limit]);

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

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Issues</h1>
        <Link to="/issues/create" className="btn btn-primary">
          Report New Issue
        </Link>
      </div>

      {issues && issues.length > 0 ? (
        <>
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr key={issue._id}>
                        <td>{issue.title}</td>
                        <td>{issue.location}</td>
                        <td>{issue.category}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(issue.status)}`}>
                            {issue.status}
                          </span>
                        </td>
                        <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link
                            to={`/issues/${issue._id}`}
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

          {pagination && pagination.totalPages > 1 && (
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
            <h3>No issues found</h3>
            <p className="mb-0">
              There are no issues reported yet or matching your criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueList; 