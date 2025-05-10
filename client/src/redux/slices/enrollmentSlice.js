import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import enrollmentService from '../services/enrollmentService';

const initialState = {
  enrollments: [],
  enrollment: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    total: 0,
    limit: 10
  },
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Create new enrollment
export const createEnrollment = createAsyncThunk(
  'enrollments/create',
  async (enrollmentData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await enrollmentService.createEnrollment(enrollmentData, token);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) || 
        error.message || 
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all enrollments (admin)
export const getAllEnrollments = createAsyncThunk(
  'enrollments/getAll',
  async (params, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await enrollmentService.getAllEnrollments(params, token);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) || 
        error.message || 
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user enrollments (student)
export const getMyEnrollments = createAsyncThunk(
  'enrollments/getMine',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await enrollmentService.getMyEnrollments(token);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) || 
        error.message || 
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get enrollment by ID
export const getEnrollmentById = createAsyncThunk(
  'enrollments/getById',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await enrollmentService.getEnrollmentById(id, token);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) || 
        error.message || 
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update enrollment status (admin)
export const updateEnrollmentStatus = createAsyncThunk(
  'enrollments/updateStatus',
  async ({ id, statusData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await enrollmentService.updateEnrollmentStatus(id, statusData, token);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) || 
        error.message || 
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete enrollment (admin)
export const deleteEnrollment = createAsyncThunk(
  'enrollments/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await enrollmentService.deleteEnrollment(id, token);
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) || 
        error.message || 
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearEnrollment: (state) => {
      state.enrollment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create enrollment
      .addCase(createEnrollment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEnrollment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.enrollments.push(action.payload.enrollment);
      })
      .addCase(createEnrollment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get all enrollments
      .addCase(getAllEnrollments.pending, (state) => {
        state.isLoading = true;
        console.log('getAllEnrollments.pending');
      })
      .addCase(getAllEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        console.log('getAllEnrollments.fulfilled, payload:', action.payload);
        
        // Ensure we're storing the enrollments array correctly
        state.enrollments = action.payload && Array.isArray(action.payload.enrollments) 
          ? action.payload.enrollments 
          : [];
          
        // Store pagination information
        if (action.payload && action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        
        // Log the first enrollment data for debugging  
        if (state.enrollments.length > 0) {
          console.log('First enrollment after storing in state:', {
            id: state.enrollments[0]._id,
            user: state.enrollments[0].user,
            status: state.enrollments[0].status
          });
        }
      })
      .addCase(getAllEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        console.log('getAllEnrollments.rejected, error:', action.payload);
        state.enrollments = []; // Reset enrollments on error
      })
      // Get my enrollments
      .addCase(getMyEnrollments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.enrollments = action.payload.enrollments;
      })
      .addCase(getMyEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get enrollment by ID
      .addCase(getEnrollmentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEnrollmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.enrollment = action.payload.enrollment;
      })
      .addCase(getEnrollmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update enrollment status
      .addCase(updateEnrollmentStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEnrollmentStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.enrollments = state.enrollments.map(enrollment => 
          enrollment._id === action.payload.enrollment._id 
            ? action.payload.enrollment 
            : enrollment
        );
      })
      .addCase(updateEnrollmentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete enrollment
      .addCase(deleteEnrollment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEnrollment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.enrollments = state.enrollments.filter(
          enrollment => enrollment._id !== action.meta.arg
        );
      })
      .addCase(deleteEnrollment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearEnrollment } = enrollmentSlice.actions;
export default enrollmentSlice.reducer; 