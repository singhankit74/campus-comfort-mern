import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../services/userService';

const initialState = {
  students: [],
  student: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Get all students
export const getAllStudents = createAsyncThunk(
  'users/getAllStudents',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await userService.getAllStudents(token);
    } catch (error) {
      console.error('Error in getAllStudents thunk:', error);
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

// Get student by ID
export const getStudentById = createAsyncThunk(
  'users/getStudentById',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await userService.getStudentById(id, token);
    } catch (error) {
      console.error('Error in getStudentById thunk:', error);
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

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearStudent: (state) => {
      state.student = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all students
      .addCase(getAllStudents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.students = action.payload.students;
      })
      .addCase(getAllStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get student by ID
      .addCase(getStudentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStudentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.student = action.payload.student;
      })
      .addCase(getStudentById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearStudent } = userSlice.actions;
export default userSlice.reducer; 