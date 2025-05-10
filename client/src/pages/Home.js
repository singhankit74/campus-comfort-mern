import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { user } = useSelector(state => state.auth);
  const { theme } = useTheme();

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-header text-white mb-5">
        <div className="container py-5">
          <div className="row py-lg-5 align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">Welcome to Campus Comfort Hub</h1>
              <p className="lead mb-4">
                A comprehensive platform for campus living management. Report issues, track maintenance requests, and provide feedback to enhance your campus experience.
              </p>
              <div className="d-grid gap-2 d-sm-flex">
                {user ? (
                  <>
                    <Link to="/dashboard" className="btn btn-light btn-lg px-4 me-md-2 fw-medium">
                      <i className="bi bi-speedometer2 me-2"></i>Dashboard
                    </Link>
                    <Link to="/issues/new" className="btn btn-outline-light btn-lg px-4">
                      <i className="bi bi-plus-circle me-2"></i>Report Issue
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-light btn-lg px-4 me-md-2 fw-medium">
                      <i className="bi bi-box-arrow-in-right me-2"></i>Login
                    </Link>
                    <Link to="/register" className="btn btn-outline-light btn-lg px-4">
                      <i className="bi bi-person-plus me-2"></i>Register
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <img 
                src="https://img.freepik.com/free-vector/college-students-concept-illustration_114360-10205.jpg" 
                alt="Campus Life" 
                className="img-fluid rounded-3 shadow-lg" 
                style={{ maxHeight: '400px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Choose Campus Comfort Hub?</h2>
            <p className="lead text-muted">Our platform offers comprehensive solutions for campus management</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="feature-card card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                  </div>
                  <h5 className="card-title fw-bold">Issue Tracking</h5>
                  <p className="card-text">
                    Report maintenance issues and track their resolution in real-time.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <div className="feature-card card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-building-fill fs-4"></i>
                  </div>
                  <h5 className="card-title fw-bold">Hostel Management</h5>
                  <p className="card-text">
                    Apply for hostel accommodation and manage your hostel enrollment.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <div className="feature-card card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-chat-square-text-fill fs-4"></i>
                  </div>
                  <h5 className="card-title fw-bold">Feedback System</h5>
                  <p className="card-text">
                    Provide valuable feedback to improve campus services and amenities.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3">
              <div className="feature-card card border-0 shadow-sm h-100">
                <div className="card-body text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-graph-up-arrow fs-4"></i>
                  </div>
                  <h5 className="card-title fw-bold">Analytics</h5>
                  <p className="card-text">
                    Access insights and statistics about campus facilities and services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How It Works</h2>
            <p className="lead text-muted">Three simple steps to improve your campus experience</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm animated-card">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <h3 className="text-primary m-0">1</h3>
                  </div>
                  <h5 className="card-title fw-bold">Create an Account</h5>
                  <p className="card-text">
                    Register with your student credentials to access all services and features.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm animated-card">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <h3 className="text-primary m-0">2</h3>
                  </div>
                  <h5 className="card-title fw-bold">Submit Requests</h5>
                  <p className="card-text">
                    Report issues, apply for hostel accommodation, or provide feedback.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm animated-card">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <h3 className="text-primary m-0">3</h3>
                  </div>
                  <h5 className="card-title fw-bold">Track Progress</h5>
                  <p className="card-text">
                    Monitor the status of your requests and receive updates until resolution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Stats Section */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6">
              <h2 className="fw-bold mb-4">Campus Life Simplified</h2>
              <p className="lead">
                Our platform addresses the key challenges of campus living, providing efficient solutions for students and administrators.
              </p>
              <div className="d-flex flex-column gap-3 mt-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success fs-4 me-3"></i>
                  <span><strong>Quick Resolution</strong> of maintenance and facility issues</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success fs-4 me-3"></i>
                  <span><strong>Centralized System</strong> for managing all campus services</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success fs-4 me-3"></i>
                  <span><strong>Transparent Processes</strong> for hostel allocation and management</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-success fs-4 me-3"></i>
                  <span><strong>Improved Communication</strong> between students and administration</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card stat-card success h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="display-5 fw-bold">98%</h3>
                      <p className="text-muted mb-0">Issue Resolution Rate</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card stat-card info h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="display-5 fw-bold">24h</h3>
                      <p className="text-muted mb-0">Average Response Time</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card stat-card warning h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="display-5 fw-bold">5k+</h3>
                      <p className="text-muted mb-0">Active Users</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card stat-card danger h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="display-5 fw-bold">12+</h3>
                      <p className="text-muted mb-0">Campus Facilities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-header text-white py-5 mb-0">
        <div className="container py-4">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-3">Ready to Experience Better Campus Living?</h2>
              <p className="lead mb-4">
                Join thousands of students who have simplified their campus life with Campus Comfort Hub.
              </p>
              {!user && (
                <div className="d-grid gap-2 d-sm-flex justify-content-center">
                  <Link to="/register" className="btn btn-light btn-lg px-4 me-md-2 fw-medium">
                    <i className="bi bi-person-plus me-2"></i>Get Started
                  </Link>
                  <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 