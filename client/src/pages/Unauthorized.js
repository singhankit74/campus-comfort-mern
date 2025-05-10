import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="container py-5 text-center">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5">
              <h1 className="display-1 fw-bold text-danger">403</h1>
              <h2 className="mb-4">Access Denied</h2>
              <p className="lead mb-4">
                You don't have permission to access this page. Please contact your administrator if you believe this is an error.
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to Dashboard
                </Link>
                <Link to="/" className="btn btn-outline-secondary btn-lg">
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 