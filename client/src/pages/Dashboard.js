import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getMyIssues } from '../redux/actions/issueActions';
import { getMyFeedback } from '../redux/actions/feedbackActions';
import { reset as resetIssues } from '../redux/slices/issueSlice';
import { reset as resetFeedback } from '../redux/slices/feedbackSlice';
import Spinner from '../components/Spinner';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { myIssues, isLoading: issuesLoading } = useSelector((state) => state.issues);
  const { myFeedbacks, isLoading: feedbackLoading } = useSelector((state) => state.feedbacks);
  
  const [issueStats, setIssueStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  const [feedbackStats, setFeedbackStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    implemented: 0,
    declined: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getMyIssues());
        await dispatch(getMyFeedback());
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();

    return () => {
      dispatch(resetIssues());
      dispatch(resetFeedback());
    };
  }, [dispatch]);

  useEffect(() => {
    if (myIssues && myIssues.length > 0) {
      const stats = {
        total: myIssues.length,
        open: myIssues.filter(issue => issue.status === 'open').length,
        inProgress: myIssues.filter(issue => issue.status === 'in-progress').length,
        resolved: myIssues.filter(issue => issue.status === 'resolved').length,
        closed: myIssues.filter(issue => issue.status === 'closed').length
      };
      setIssueStats(stats);
    }
  }, [myIssues]);

  useEffect(() => {
    if (myFeedbacks && myFeedbacks.length > 0) {
      const stats = {
        total: myFeedbacks.length,
        pending: myFeedbacks.filter(feedback => feedback.status === 'pending').length,
        reviewed: myFeedbacks.filter(feedback => feedback.status === 'reviewed').length,
        implemented: myFeedbacks.filter(feedback => feedback.status === 'implemented').length,
        declined: myFeedbacks.filter(feedback => feedback.status === 'declined').length
      };
      setFeedbackStats(stats);
    }
  }, [myFeedbacks]);

  if (issuesLoading || feedbackLoading) {
    return <Spinner />;
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Dashboard</h1>
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">My Issues</h5>
              <Link to="/issues/create" className="btn btn-primary btn-sm">
                Report New Issue
              </Link>
            </div>
            <div className="card-body">
              <div className="row text-center mb-3">
                <div className="col">
                  <div className="p-3 border rounded bg-light">
                    <h3>{issueStats.total}</h3>
                    <small>Total</small>
                  </div>
                </div>
                <div className="col">
                  <div className="p-3 border rounded bg-primary bg-opacity-10">
                    <h3>{issueStats.open}</h3>
                    <small>Open</small>
                  </div>
                </div>
                <div className="col">
                  <div className="p-3 border rounded bg-warning bg-opacity-10">
                    <h3>{issueStats.inProgress}</h3>
                    <small>In Progress</small>
                  </div>
                </div>
                <div className="col">
                  <div className="p-3 border rounded bg-success bg-opacity-10">
                    <h3>{issueStats.resolved}</h3>
                    <small>Resolved</small>
                  </div>
                </div>
              </div>
              {myIssues && myIssues.length > 0 ? (
                <div className="list-group">
                  {myIssues.slice(0, 3).map((issue) => (
                    <Link
                      key={issue._id}
                      to={`/issues/${issue._id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{issue.title}</h6>
                        <small>
                          <span className={`badge bg-${
                            issue.status === 'open' ? 'primary' :
                            issue.status === 'in-progress' ? 'warning' :
                            issue.status === 'resolved' ? 'success' : 'secondary'
                          }`}>
                            {issue.status}
                          </span>
                        </small>
                      </div>
                      <small className="text-muted">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </small>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center">No issues reported yet.</p>
              )}
              {myIssues && myIssues.length > 3 && (
                <div className="text-center mt-3">
                  <Link to="/issues" className="btn btn-outline-primary btn-sm">
                    View All Issues
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">My Feedback</h5>
              <Link to="/feedback/create" className="btn btn-primary btn-sm">
                Submit Feedback
              </Link>
            </div>
            <div className="card-body">
              <div className="row text-center mb-3">
                <div className="col">
                  <div className="p-3 border rounded bg-light">
                    <h3>{feedbackStats.total}</h3>
                    <small>Total</small>
                  </div>
                </div>
                <div className="col">
                  <div className="p-3 border rounded bg-info bg-opacity-10">
                    <h3>{feedbackStats.pending}</h3>
                    <small>Pending</small>
                  </div>
                </div>
                <div className="col">
                  <div className="p-3 border rounded bg-primary bg-opacity-10">
                    <h3>{feedbackStats.reviewed}</h3>
                    <small>Reviewed</small>
                  </div>
                </div>
                <div className="col">
                  <div className="p-3 border rounded bg-success bg-opacity-10">
                    <h3>{feedbackStats.implemented}</h3>
                    <small>Implemented</small>
                  </div>
                </div>
              </div>
              {myFeedbacks && myFeedbacks.length > 0 ? (
                <div className="list-group">
                  {myFeedbacks.slice(0, 3).map((feedback) => (
                    <Link
                      key={feedback._id}
                      to={`/feedback/${feedback._id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{feedback.title}</h6>
                        <small>
                          <span className={`badge bg-${
                            feedback.status === 'pending' ? 'info' :
                            feedback.status === 'reviewed' ? 'primary' :
                            feedback.status === 'implemented' ? 'success' : 'secondary'
                          }`}>
                            {feedback.status}
                          </span>
                        </small>
                      </div>
                      <small className="text-muted">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </small>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center">No feedback submitted yet.</p>
              )}
              {myFeedbacks && myFeedbacks.length > 3 && (
                <div className="text-center mt-3">
                  <Link to="/feedback" className="btn btn-outline-primary btn-sm">
                    View All Feedback
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 col-sm-6 mb-3">
                  <Link to="/issues/create" className="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center py-3">
                    <i className="bi bi-exclamation-triangle-fill fs-1 mb-2"></i>
                    <span>Report Issue</span>
                  </Link>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                  <Link to="/feedback/create" className="btn btn-outline-success w-100 h-100 d-flex flex-column justify-content-center py-3">
                    <i className="bi bi-chat-dots-fill fs-1 mb-2"></i>
                    <span>Submit Feedback</span>
                  </Link>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                  <Link to="/issues" className="btn btn-outline-secondary w-100 h-100 d-flex flex-column justify-content-center py-3">
                    <i className="bi bi-list-ul fs-1 mb-2"></i>
                    <span>View All Issues</span>
                  </Link>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                  <Link to="/profile" className="btn btn-outline-info w-100 h-100 d-flex flex-column justify-content-center py-3">
                    <i className="bi bi-person-fill fs-1 mb-2"></i>
                    <span>Update Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 