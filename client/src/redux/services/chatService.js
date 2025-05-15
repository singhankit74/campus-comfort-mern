import axios from 'axios';

const API_URL = '/api/chat';

// Track chat message requests to prevent duplicates
const inProgressRequests = {};

// Get all chat rooms for the current user
const getUserChatRooms = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 8000
    };
    const response = await axios.get(`${API_URL}/rooms`, config);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching chat rooms:', error.message);
    return []; // Return empty array instead of throwing
  }
};

// Get or create a direct chat
const getOrCreateDirectChat = async (participantId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 8000
    };
    const response = await axios.get(`${API_URL}/direct/${participantId}`, config);
    return response.data.data;
  } catch (error) {
    console.error('Error creating direct chat:', error.message);
    throw error;
  }
};

// Create a group chat
const createGroupChat = async (groupData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 8000
    };
    const response = await axios.post(`${API_URL}/group`, groupData, config);
    return response.data.data;
  } catch (error) {
    console.error('Error creating group chat:', error.message);
    throw error;
  }
};

// Get messages for a chat room
const getChatMessages = async (chatId, page = 1, limit = 50, token) => {
  const requestKey = `${chatId}-${page}-${limit}`;
  
  // Prevent duplicate requests
  if (inProgressRequests[requestKey]) {
    console.log(`Request already in progress for chat ${chatId}`);
    return inProgressRequests[requestKey];
  }
  
  let retries = 0;
  const maxRetries = 2;
  
  const fetchWithRetry = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 8000 // 8 second timeout
      };
      
      console.log(`Fetching messages for chat ${chatId}, attempt ${retries + 1}`);
      const response = await axios.get(`${API_URL}/${chatId}/messages?page=${page}&limit=${limit}`, config);
      
      // Log success response 
      console.log(`Successfully fetched ${response.data.data?.length || 0} messages for chat ${chatId}`);
      
      return {
        chatId,
        messages: response.data.data || [],
        pagination: response.data.pagination || { page, limit, total: 0, pages: 0 }
      };
    } catch (error) {
      console.error(`Error fetching chat messages (attempt ${retries + 1}):`, error.message);
      
      if (retries < maxRetries) {
        retries++;
        // Shorter backoff - 500ms, 1000ms
        const delay = 500 * retries;
        console.log(`Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry();
      }
      
      // Return empty messages instead of throwing after max retries
      console.error('Max retries reached, returning empty messages');
      return {
        chatId,
        messages: [],
        pagination: { page: 1, limit, total: 0, pages: 0 }
      };
    }
  };
  
  try {
    // Store promise to prevent duplicate requests
    const fetchPromise = fetchWithRetry();
    inProgressRequests[requestKey] = fetchPromise;
    
    // Wait for the result
    const result = await fetchPromise;
    
    // Clear from pending requests
    delete inProgressRequests[requestKey];
    
    return result;
  } catch (error) {
    // Make sure to clear the request on error too
    delete inProgressRequests[requestKey];
    throw error;
  }
};

// Get users for chat selection
const getChatUsers = async (search = '', token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 8000
    };
    
    const encodedSearch = search ? encodeURIComponent(search) : '';
    const url = `${API_URL}/users${encodedSearch ? `?search=${encodedSearch}` : ''}`;
    
    console.log('Fetching chat users with query:', search ? search : '(empty)');
    
    const response = await axios.get(url, config);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching chat users:', error.message);
    return []; // Return empty array instead of throwing
  }
};

const chatService = {
  getUserChatRooms,
  getOrCreateDirectChat,
  createGroupChat,
  getChatMessages,
  getChatUsers
};

export default chatService; 