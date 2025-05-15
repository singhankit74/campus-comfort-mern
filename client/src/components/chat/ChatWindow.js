import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input, Button, Avatar, Spin, Tooltip, Badge } from 'antd';
import { SendOutlined, UserOutlined, TeamOutlined, SmileOutlined } from '@ant-design/icons';
import { fetchChatMessages } from '../../redux/slices/chatSlice';
import { useSocket } from '../../context/SocketContext';
import { format } from 'date-fns';
import './chat.css';

const { TextArea } = Input;

const ChatWindow = ({ chat }) => {
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [initialScroll, setInitialScroll] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastChatIdRef = useRef(null);
  
  const dispatch = useDispatch();
  const { 
    messages: allMessages, 
    messagesLoading,
    typingUsers
  } = useSelector(state => state.chat);
  const { user } = useSelector(state => state.auth);
  const { sendMessage, startTyping, stopTyping, markAsRead } = useSocket();
  
  // Get messages for this chat using useMemo to avoid re-renders
  const messages = useMemo(() => {
    return allMessages[chat._id] || [];
  }, [allMessages, chat._id]);
  
  // Get users who are typing in this chat
  const chatTypingUsers = typingUsers[chat._id] || {};
  
  // Load messages when chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (chat && chat._id && lastChatIdRef.current !== chat._id) {
        console.log(`Loading messages for chat: ${chat._id}`);
        lastChatIdRef.current = chat._id;
        setLoadingMessages(true);
        setInitialScroll(false);
        
        try {
          await dispatch(fetchChatMessages({ chatId: chat._id })).unwrap();
          if (markAsRead) markAsRead(chat._id);
        } catch (error) {
          console.error('Failed to load messages:', error);
        } finally {
          setLoadingMessages(false);
        }
      }
    };
    
    loadMessages();
    
    // Cleanup function
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [chat?._id, dispatch, markAsRead]);
  
  // Scroll to bottom when messages load
  useEffect(() => {
    if (!initialScroll && messages?.length > 0 && !loadingMessages) {
      setTimeout(() => {
        scrollToBottom('auto');
        setInitialScroll(true);
      }, 100); // Small delay to ensure DOM is updated
    }
  }, [messages?.length, initialScroll, loadingMessages]);
  
  // Function to scroll to bottom of messages
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);
  
  // Get chat title (other user's name for direct chats, or group name)
  const getChatTitle = useCallback(() => {
    if (!chat || !user) return 'Chat';
    
    if (chat.type === 'direct' && chat.participants?.length === 2) {
      const otherParticipant = chat.participants.find(p => p._id !== user._id);
      return otherParticipant ? otherParticipant.name : 'Unknown User';
    }
    return chat.name || 'Group Chat';
  }, [chat, user]);
  
  // Get the other participant's avatar URL or role for direct chats
  const getParticipantInfo = useCallback(() => {
    if (!chat || !user) return {};
    
    if (chat.type === 'direct' && chat.participants?.length === 2) {
      const otherParticipant = chat.participants.find(p => p._id !== user._id);
      if (otherParticipant) {
        return {
          avatar: otherParticipant.profileImage,
          role: otherParticipant.role
        };
      }
    }
    return {};
  }, [chat, user]);
  
  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    try {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return format(date, 'h:mm a');
    } catch (error) {
      return '';
    }
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !chat?._id) return;
    
    setSending(true);
    sendMessage(chat._id, messageInput.trim());
    setMessageInput('');
    if (stopTyping) stopTyping(chat._id);
    
    // Add a small delay to show sending state
    setTimeout(() => {
      setSending(false);
      // Scroll to bottom when user sends a message
      scrollToBottom();
    }, 300);
  };
  
  // Handle key press in message input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle typing indicators
  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Emit typing event if available
    if (startTyping && chat?._id) {
      startTyping(chat._id);
    }
    
    // Set timeout to stop typing after 2 seconds of inactivity
    if (stopTyping && chat?._id) {
      const timeout = setTimeout(() => {
        stopTyping(chat._id);
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  };
  
  // Should show date separator
  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    
    try {
      const currentDate = new Date(currentMsg.createdAt).toDateString();
      const prevDate = new Date(prevMsg.createdAt).toDateString();
      return currentDate !== prevDate;
    } catch (error) {
      return false;
    }
  };
  
  // Format date for separator
  const formatDateSeparator = (timestamp) => {
    try {
      if (!timestamp) return '';
      
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const date = new Date(timestamp).toDateString();
      
      if (date === today) return 'Today';
      if (date === yesterday) return 'Yesterday';
      return format(new Date(timestamp), 'MMM d, yyyy');
    } catch (error) {
      return '';
    }
  };
  
  // Render a single message
  const renderMessage = (message, index, messageArray) => {
    if (!message || !message.sender) return null;
    
    const isCurrentUser = message.sender._id === user?._id;
    const prevMessage = index > 0 ? messageArray[index - 1] : null;
    const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
    
    return (
      <React.Fragment key={message._id || index}>
        {showDateSeparator && (
          <div className="text-center my-3">
            <Badge 
              count={formatDateSeparator(message.createdAt)} 
              style={{ 
                backgroundColor: '#f0f0f0', 
                color: '#666',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }} 
            />
          </div>
        )}
      
        <div className="message-container">
          <div className={`message-bubble ${isCurrentUser ? 'message-sent' : 'message-received'}`}>
            {!isCurrentUser && (
              <div className="message-sender">
                {message.sender.name}
              </div>
            )}
            <div>{message.content}</div>
            <div className="message-time">
              {formatMessageTime(message.createdAt)}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };
  
  // Render typing indicators
  const renderTypingIndicators = () => {
    const typingUsersList = Object.values(chatTypingUsers);
    
    if (typingUsersList.length === 0) {
      return null;
    }
    
    return (
      <div className="typing-indicator">
        {typingUsersList.length === 1 
          ? `${typingUsersList[0]} is typing...` 
          : `${typingUsersList.length} people are typing...`}
      </div>
    );
  };
  
  // Get participant info
  const { avatar, role } = getParticipantInfo();
  
  // Show loading if we're loading initial messages or we have no chat
  const isLoading = loadingMessages || messagesLoading || !chat;
  
  return (
    <div className="d-flex flex-column h-100">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="d-flex align-items-center">
          <Avatar 
            icon={chat?.type === 'direct' ? <UserOutlined /> : <TeamOutlined />}
            src={avatar}
            className="me-2 user-avatar"
            size="large"
          />
          <div>
            <h5 className="mb-0">{getChatTitle()}</h5>
            <small className="text-muted">
              {chat?.type === 'group' 
                ? `${chat.participants?.length || 0} participants` 
                : role ? `${role}` : 'Direct message'}
            </small>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="chat-messages" ref={messagesContainerRef}>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spin tip="Loading messages..." size="large" />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-state-icon">
              <i className="bi bi-chat-dots"></i>
            </div>
            <h4>No messages yet</h4>
            <p>Start the conversation by sending a message!</p>
          </div>
        ) : (
          <>
            {/* Reversed order because messages are coming newest first from API */}
            {[...messages].reverse().map((message, index, array) => 
              renderMessage(message, index, array)
            )}
            {renderTypingIndicators()}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message Input */}
      <div className="chat-input">
        <div className="d-flex align-items-center">
          <TextArea
            placeholder="Type a message..."
            value={messageInput}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={sending || isLoading}
            className="flex-grow-1"
          />
          <Tooltip title="Send message">
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={handleSendMessage} 
              className="ms-2"
              disabled={!messageInput.trim() || sending || isLoading}
              loading={sending}
              shape="circle"
              size="large"
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatWindow); 