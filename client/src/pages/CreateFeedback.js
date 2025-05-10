import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createFeedback } from '../redux/actions/feedbackActions';
import { reset } from '../redux/slices/feedbackSlice';
import Spinner from '../components/Spinner';

const CreateFeedback = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'suggestion'
  });

  const { title, description, category, type } = formData;
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.feedbacks
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess) {
      toast.success('Feedback submitted successfully');
      navigate('/feedback');
    }

    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await dispatch(createFeedback(formData));
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <Link to="/feedback" className="btn btn-outline-secondary">
          &larr; Back to Feedback
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h2 className="mb-0">Submit Feedback</h2>
            </div>
            <div className="card-body">
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={title}
                    onChange={onChange}
                    placeholder="Brief title for your feedback"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="category" className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={category}
                    onChange={onChange}
                    required
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    <option value="academic">Academic</option>
                    <option value="facilities">Facilities</option>
                    <option value="services">Services</option>
                    <option value="events">Events</option>
                    <option value="administration">Administration</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="type" className="form-label">
                    Type
                  </label>
                  <select
                    className="form-select"
                    id="type"
                    name="type"
                    value={type}
                    onChange={onChange}
                  >
                    <option value="suggestion">Suggestion</option>
                    <option value="complaint">Complaint</option>
                    <option value="praise">Praise</option>
                    <option value="question">Question</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="form-label">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={description}
                    onChange={onChange}
                    rows="5"
                    placeholder="Please provide detailed information about your feedback"
                    required
                  ></textarea>
                </div>

                <div className="form-check mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="anonymous"
                    name="anonymous"
                    onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="anonymous">
                    Submit anonymously (your name will not be visible to staff)
                  </label>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-success btn-lg">
                    Submit Feedback
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

export default CreateFeedback; 