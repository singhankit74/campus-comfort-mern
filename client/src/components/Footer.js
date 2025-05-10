import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const year = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer className="footer-custom py-5 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="mb-4">
              <h5 className="mb-3 fw-bold d-flex align-items-center">
                <i className="bi bi-building me-2"></i> Campus Comfort
              </h5>
              <p className="mb-3 opacity-75">
                Enhancing campus living through innovative solutions for reporting and managing hostel issues, providing feedback, and accessing important campus services.
              </p>
              <div className="d-flex gap-3">
                <a href="#" className="social-icon" aria-label="Facebook">
                  <i className="bi bi-facebook fs-5"></i>
                </a>
                <a href="#" className="social-icon" aria-label="Twitter">
                  <i className="bi bi-twitter-x fs-5"></i>
                </a>
                <a href="#" className="social-icon" aria-label="Instagram">
                  <i className="bi bi-instagram fs-5"></i>
                </a>
                <a href="#" className="social-icon" aria-label="LinkedIn">
                  <i className="bi bi-linkedin fs-5"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="mb-3 text-uppercase fw-semibold">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="footer-link"><i className="bi bi-chevron-right small me-1"></i> Home</Link></li>
              <li className="mb-2"><Link to="/issues" className="footer-link"><i className="bi bi-chevron-right small me-1"></i> Issues</Link></li>
              <li className="mb-2"><Link to="/feedback" className="footer-link"><i className="bi bi-chevron-right small me-1"></i> Feedback</Link></li>
              <li className="mb-2"><Link to="/dashboard" className="footer-link"><i className="bi bi-chevron-right small me-1"></i> Dashboard</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="mb-3 text-uppercase fw-semibold">Resources</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/faq" className="footer-link"><i className="bi bi-chevron-right small me-1"></i> FAQs</Link></li>
              <li className="mb-2"><Link to="/support" className="footer-link"><i className="bi bi-chevron-right small me-1"></i> Support</Link></li>
              <li className="mb-2"><Link to="/privacy" className="footer-link"><i className="bi bi-chevron-right small me-1"></i> Privacy</Link></li>
              <li className="mb-2"><Link to="/terms" className="footer-link"><i className="bi bi-chevron-right small me-1"></i> Terms</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-4 col-md-6">
            <h6 className="mb-3 text-uppercase fw-semibold">Contact</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <div className="d-flex">
                  <i className="bi bi-geo-alt me-2 opacity-75"></i>
                  <span>University Campus, Building 3<br />123 Education Lane, Campus City</span>
                </div>
              </li>
              <li className="mb-2">
                <div className="d-flex">
                  <i className="bi bi-envelope me-2 opacity-75"></i>
                  <span>support@campuscomfort.com</span>
                </div>
              </li>
              <li className="mb-2">
                <div className="d-flex">
                  <i className="bi bi-telephone me-2 opacity-75"></i>
                  <span>+1 (123) 456-7890</span>
                </div>
              </li>
              <li className="mb-0">
                <div className="d-flex">
                  <i className="bi bi-clock me-2 opacity-75"></i>
                  <span>Mon-Fri: 9:00 AM - 5:00 PM</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="my-4 opacity-25" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-md-0 mb-3 small opacity-75">
              &copy; {year} Campus Comfort Hub. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-md-end justify-content-center gap-3">
              <Link to="/privacy" className="footer-link small">Privacy Policy</Link>
              <Link to="/terms" className="footer-link small">Terms of Service</Link>
              <Link to="/cookies" className="footer-link small">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 