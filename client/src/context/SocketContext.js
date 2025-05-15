import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { addMessage, markMessagesAsRead, setUserTyping, clearUserTyping } from '../redux/slices/chatSlice';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const { user } = useSelector(state => state.auth);
  const { activeChat } = useSelector(state => state.chat);
  const dispatch = useDispatch();

  // Clear any pending reconnection timers
  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    // Clear any existing reconnection timer
    clearReconnectTimer();
    
    // Clean up any existing socket
    if (socketRef.current) {
      console.log('Cleaning up existing socket before creating new one');
      socketRef.current.offAny();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (!user || !user.token) {
      console.log('No user or token, not connecting socket');
      setSocket(null);
      setConnected(false);
      return;
    }

    // Prevent excessive reconnection attempts
    if (connectionAttempts > 5) {
      console.log('Too many connection attempts, stopping reconnection');
      return;
    }

    // Get server URL from proxy or use explicit URL
    const SOCKET_URL = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:5001';

    console.log(`Connecting to socket server at ${SOCKET_URL}`);
    
    try {
      // Create socket connection with improved configuration
      const socketInstance = io(SOCKET_URL, {
        auth: { token: user.token },
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: false, // We'll handle reconnection manually
        timeout: 10000,
        autoConnect: true,
        forceNew: true
      });
      
      socketRef.current = socketInstance;

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected successfully');
        setConnected(true);
        setConnectionAttempts(0);
        
        // Join chat rooms after successful connection
        socketInstance.emit('join_chat_rooms');
      });

      socketInstance.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        setConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.log(`Socket connect error: ${error.message}`);
        setConnected(false);
        setConnectionAttempts(prev => prev + 1);
        
        // Attempt reconnection with increasing delay
        clearReconnectTimer();
        const delay = Math.min(5000, Math.pow(2, connectionAttempts) * 1000);
        console.log(`Scheduling reconnect in ${delay}ms`);
        
        reconnectTimerRef.current = setTimeout(() => {
          if (socketRef.current === socketInstance) {
            console.log('Attempting to reconnect socket');
            socketInstance.connect();
          }
        }, delay);
      });

      // Handle incoming messages
      socketInstance.on('new_message', (message) => {
        dispatch(addMessage({ message }));
        
        // If in the active chat, mark as read
        if (activeChat && message.chatRoom === activeChat._id) {
          socketInstance.emit('mark_as_read', { chatRoomId: message.chatRoom });
          dispatch(markMessagesAsRead({ chatId: message.chatRoom }));
        }
      });

      // Handle typing indicators
      socketInstance.on('user_typing', ({ chatRoomId, userId, userName }) => {
        dispatch(setUserTyping({ chatId: chatRoomId, userId, userName }));
      });

      socketInstance.on('user_stop_typing', ({ chatRoomId, userId }) => {
        dispatch(clearUserTyping({ chatId: chatRoomId, userId }));
      });

      // Set socket instance
      setSocket(socketInstance);
    } catch (error) {
      console.error('Error creating socket connection:', error);
    }

    // Clean up on unmount or when dependencies change
    return () => {
      clearReconnectTimer();
      
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.offAny();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      setSocket(null);
      setConnected(false);
    };
  }, [user, dispatch]);

  // Join active chat room when it changes
  useEffect(() => {
    if (socket && connected && activeChat) {
      // Mark messages as read when entering a chat
      socket.emit('mark_as_read', { chatRoomId: activeChat._id });
      dispatch(markMessagesAsRead({ chatId: activeChat._id }));
    }
  }, [socket, connected, activeChat, dispatch]);

  // Socket context value with functions for components to use
  const value = {
    socket,
    connected,
    sendMessage: (chatRoomId, content) => {
      if (socket && connected) {
        try {
          socket.emit('send_message', { chatRoomId, content });
          return true;
        } catch (error) {
          console.error('Error sending message:', error);
          return false;
        }
      } else {
        console.error('Not connected to chat server');
        return false;
      }
    },
    startTyping: (chatRoomId) => {
      if (socket && connected) {
        socket.emit('typing', { chatRoomId });
      }
    },
    stopTyping: (chatRoomId) => {
      if (socket && connected) {
        socket.emit('stop_typing', { chatRoomId });
      }
    },
    markAsRead: (chatRoomId) => {
      if (socket && connected && chatRoomId) {
        socket.emit('mark_as_read', { chatRoomId });
        dispatch(markMessagesAsRead({ chatId: chatRoomId }));
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 