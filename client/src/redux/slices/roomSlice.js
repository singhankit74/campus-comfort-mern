import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roomService from '../services/roomService';

const initialState = {
  rooms: [],
  room: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Create new room
export const createRoom = createAsyncThunk(
  'rooms/create',
  async (roomData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.createRoom(roomData, token);
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

// Get all rooms
export const getRooms = createAsyncThunk(
  'rooms/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.getRooms(token);
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

// Get room by ID
export const getRoomById = createAsyncThunk(
  'rooms/getById',
  async (roomId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.getRoomById(roomId, token);
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

// Update room
export const updateRoom = createAsyncThunk(
  'rooms/update',
  async ({ roomId, roomData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.updateRoom(roomId, roomData, token);
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

// Allocate room
export const allocateRoom = createAsyncThunk(
  'rooms/allocate',
  async ({ enrollmentId, roomId, override = true }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.allocateRoom(enrollmentId, { roomId, override }, token);
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

// Auto allocate rooms
export const autoAllocateRooms = createAsyncThunk(
  'rooms/autoAllocate',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.autoAllocateRooms(token);
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

// Deallocate room
export const deallocateRoom = createAsyncThunk(
  'rooms/deallocate',
  async (enrollmentId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roomService.deallocateRoom(enrollmentId, token);
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

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearRoom: (state) => {
      state.room = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create room
      .addCase(createRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rooms.push(action.payload.room);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get all rooms
      .addCase(getRooms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rooms = action.payload.rooms;
      })
      .addCase(getRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get room by ID
      .addCase(getRoomById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRoomById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.room = action.payload.room;
      })
      .addCase(getRoomById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update room
      .addCase(updateRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.rooms = state.rooms.map(room => 
          room._id === action.payload.room._id ? action.payload.room : room
        );
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Allocate room
      .addCase(allocateRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(allocateRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update the room in the rooms array
        state.rooms = state.rooms.map(room => 
          room._id === action.payload.room._id ? action.payload.room : room
        );
      })
      .addCase(allocateRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Auto allocate rooms
      .addCase(autoAllocateRooms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(autoAllocateRooms.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(autoAllocateRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Deallocate room
      .addCase(deallocateRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deallocateRoom.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(deallocateRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearRoom } = roomSlice.actions;
export default roomSlice.reducer; 