import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../services/chatService';

// Async thunks
export const fetchUserChatRooms = createAsyncThunk(
  'chat/fetchUserChatRooms',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.user?.token;
      return await chatService.getUserChatRooms(token);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch chat rooms');
    }
  }
);

export const getOrCreateDirectChat = createAsyncThunk(
  'chat/getOrCreateDirectChat',
  async (participantId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.user?.token;
      return await chatService.getOrCreateDirectChat(participantId, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create direct chat');
    }
  }
);

export const createGroupChat = createAsyncThunk(
  'chat/createGroupChat',
  async (groupData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.user?.token;
      return await chatService.createGroupChat(groupData, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create group chat');
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async ({ chatId, page = 1, limit = 50 }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.user?.token;
      return await chatService.getChatMessages(chatId, page, limit, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch messages');
    }
  }
);

export const fetchChatUsers = createAsyncThunk(
  'chat/fetchChatUsers',
  async (search = '', { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.user?.token;
      if (!token) {
        console.error('No auth token available for chat users search');
        return [];
      }
      
      console.log('Fetching chat users with token:', token.substring(0, 10) + '...');
      return await chatService.getChatUsers(search, token);
    } catch (error) {
      console.error('Error fetching chat users:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch users');
    }
  }
);

// Initial state
const initialState = {
  chatRooms: [],
  activeChat: null,
  messages: {},
  chatUsers: [],
  typingUsers: {},
  unreadCounts: {},
  loading: false,
  usersLoading: false,
  messagesLoading: false,
  error: null
};

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      
      // Reset unread count for this chat
      if (action.payload) {
        state.unreadCounts[action.payload._id] = 0;
      }
    },
    addMessage: (state, action) => {
      const { message } = action.payload;
      if (!message || !message.chatRoom) return;
      
      const chatId = message.chatRoom.toString();
      
      // Initialize messages array if it doesn't exist
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      
      // Check for duplicate messages
      const isDuplicate = state.messages[chatId].some(
        existingMsg => existingMsg._id === message._id
      );
      
      if (isDuplicate) return;
      
      // Add message to the beginning (for chronological display)
      state.messages[chatId] = [message, ...state.messages[chatId]];
      
      // Update unread count if the chat is not active
      if (!state.activeChat || state.activeChat._id !== chatId) {
        state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
      }
      
      // Update last message timestamp in chat room
      const chatRoomIndex = state.chatRooms.findIndex(room => room._id === chatId);
      if (chatRoomIndex !== -1) {
        state.chatRooms[chatRoomIndex].lastMessage = new Date().toISOString();
        
        // Move this chat room to the top of the list
        const chatRoom = state.chatRooms[chatRoomIndex];
        state.chatRooms.splice(chatRoomIndex, 1);
        state.chatRooms.unshift(chatRoom);
      }
    },
    markMessagesAsRead: (state, action) => {
      const { chatId } = action.payload;
      state.unreadCounts[chatId] = 0;
    },
    setUserTyping: (state, action) => {
      const { chatId, userId, userName } = action.payload;
      
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = {};
      }
      
      state.typingUsers[chatId][userId] = userName;
    },
    clearUserTyping: (state, action) => {
      const { chatId, userId } = action.payload;
      
      if (state.typingUsers[chatId]) {
        delete state.typingUsers[chatId][userId];
      }
    },
    resetChatState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch user chat rooms
      .addCase(fetchUserChatRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserChatRooms.fulfilled, (state, action) => {
        state.loading = false;
        
        // Only update chat rooms if we received valid data
        if (Array.isArray(action.payload)) {
          state.chatRooms = action.payload;
          
          // Initialize unread counts for all chat rooms
          action.payload.forEach(room => {
            if (!state.unreadCounts[room._id]) {
              state.unreadCounts[room._id] = 0;
            }
          });
        }
      })
      .addCase(fetchUserChatRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch chat rooms';
      })
      
      // Get or create direct chat
      .addCase(getOrCreateDirectChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrCreateDirectChat.fulfilled, (state, action) => {
        state.loading = false;
        
        // Check if chat room already exists in state
        const existingRoom = state.chatRooms.find(room => room._id === action.payload._id);
        if (!existingRoom) {
          state.chatRooms.unshift(action.payload);
        }
        
        // Set as active chat
        state.activeChat = action.payload;
        
        // Initialize unread count
        if (!state.unreadCounts[action.payload._id]) {
          state.unreadCounts[action.payload._id] = 0;
        }
      })
      .addCase(getOrCreateDirectChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create direct chat';
      })
      
      // Create group chat
      .addCase(createGroupChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroupChat.fulfilled, (state, action) => {
        state.loading = false;
        state.chatRooms.unshift(action.payload);
        state.activeChat = action.payload;
        
        // Initialize unread count
        state.unreadCounts[action.payload._id] = 0;
      })
      .addCase(createGroupChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create group chat';
      })
      
      // Fetch chat messages
      .addCase(fetchChatMessages.pending, (state, action) => {
        const { chatId } = action.meta.arg;
        
        // We only want to show loading state if we don't already have messages
        // This prevents flickering when refreshing messages
        if (!state.messages[chatId] || state.messages[chatId].length === 0) {
          state.messagesLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        const { chatId, messages } = action.payload;
        
        // Only update if we received valid data
        if (chatId && Array.isArray(messages)) {
          // Initialize or replace messages for this chat
          state.messages[chatId] = messages;
          
          // Reset unread count when messages are loaded
          state.unreadCounts[chatId] = 0;
        }
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload || 'Failed to fetch messages';
      })
      
      // Fetch chat users
      .addCase(fetchChatUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchChatUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.chatUsers = action.payload;
      })
      .addCase(fetchChatUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload || 'Failed to fetch users';
      });
  }
});

// Export actions and reducer
export const { 
  setActiveChat, 
  addMessage, 
  markMessagesAsRead, 
  setUserTyping, 
  clearUserTyping,
  resetChatState
} = chatSlice.actions;

export default chatSlice.reducer; 