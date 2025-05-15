import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Spin, Button } from 'antd';
import { PlusOutlined, MessageOutlined } from '@ant-design/icons';
import { fetchUserChatRooms, fetchChatMessages, setActiveChat } from '../redux/slices/chatSlice';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import NewChatModal from '../components/chat/NewChatModal';
import '../components/chat/chat.css';

const ChatPage = () => {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [newChatVisible, setNewChatVisible] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isLoadingChatRooms, setIsLoadingChatRooms] = useState(true);
  const loadingTimeoutRef = useRef(null);
  
  const { 
    chatRooms, 
    activeChat, 
    loading: reduxLoading, 
    unreadCounts 
  } = useSelector(state => state.chat);
  
  // Determine loading state with a minimum duration to prevent flicker
  useEffect(() => {
    if (reduxLoading) {
      setIsLoadingChatRooms(true);
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    } else {
      // Keep loading state for at least 500ms to prevent flicker
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoadingChatRooms(false);
      }, 500);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [reduxLoading]);
  
  // Load all user chat rooms on component mount
  useEffect(() => {
    console.log('Fetching chat rooms');
    dispatch(fetchUserChatRooms());
  }, [dispatch]);
  
  // Memoized function to select a chat
  const selectChat = useCallback((selectedChat) => {
    if (selectedChat && selectedChat._id) {
      console.log(`Selecting chat: ${selectedChat._id}`);
      dispatch(setActiveChat(selectedChat));
    }
  }, [dispatch]);
  
  // Handle chat selection based on URL or default to first chat
  useEffect(() => {
    if (!chatRooms.length || initialLoadComplete) return;
    
    console.log(`Initial chat selection. ChatID from URL: ${chatId}`);
    let selectedChat = null;
    
    // Case 1: URL has a chatId, try to find it
    if (chatId) {
      selectedChat = chatRooms.find(room => room._id === chatId);
      
      if (selectedChat) {
        selectChat(selectedChat);
        setInitialLoadComplete(true);
      } else {
        console.log('Chat not found, staying on current page');
      }
    } 
    // Case 2: No chatId in URL but we have chat rooms
    else if (chatRooms.length > 0) {
      selectedChat = chatRooms[0];
      selectChat(selectedChat);
      
      // Use replace: true to prevent creating browser history entries
      navigate(`/chat/${selectedChat._id}`, { replace: true });
      setInitialLoadComplete(true);
    }
  }, [chatRooms, chatId, navigate, selectChat, initialLoadComplete]);
  
  // Handle selecting a chat from the sidebar
  const handleSelectChat = useCallback((chat) => {
    if (!chat || !chat._id || chat._id === activeChat?._id) return; // Don't reload if same chat
    
    console.log(`User selected chat: ${chat._id}`);
    dispatch(setActiveChat(chat));
    navigate(`/chat/${chat._id}`);
  }, [activeChat, dispatch, navigate]);
  
  return (
    <div className="container-fluid py-4">
      <div className="page-header mb-4">
        <h2 className="mb-0">Campus Communication Center</h2>
        <p className="text-muted">Connect with students and staff in real-time</p>
      </div>
      
      {isLoadingChatRooms && chatRooms.length === 0 ? (
        <div className="d-flex justify-content-center my-5">
          <Spin size="large" tip="Loading chats..." />
        </div>
      ) : (
        <Card 
          className="chat-container" 
          bodyStyle={{ padding: 0, height: '75vh', overflow: 'hidden' }}
        >
          <Row style={{ height: '100%' }}>
            {/* Chat List Sidebar */}
            <Col xs={24} sm={8} md={6} lg={5} style={{ height: '100%' }}>
              <div className="d-flex flex-column h-100">
                <div className="chat-sidebar-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Conversations</h5>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setNewChatVisible(true)}
                    size="small"
                  >
                    New Chat
                  </Button>
                </div>
                <div className="flex-grow-1 overflow-auto">
                  <ChatSidebar 
                    chatRooms={chatRooms} 
                    activeChat={activeChat} 
                    onSelectChat={handleSelectChat} 
                    unreadCounts={unreadCounts}
                  />
                </div>
              </div>
            </Col>
            
            {/* Chat Window */}
            <Col xs={24} sm={16} md={18} lg={19} style={{ height: '100%' }}>
              {activeChat ? (
                <ChatWindow key={activeChat._id} chat={activeChat} />
              ) : (
                <div className="chat-empty-state">
                  <div className="chat-empty-state-icon">
                    <MessageOutlined />
                  </div>
                  <h4>Welcome to Campus Chat</h4>
                  <p>Select a conversation to start chatting or create a new one.</p>
                  <Button 
                    type="primary" 
                    onClick={() => setNewChatVisible(true)}
                    icon={<PlusOutlined />}
                  >
                    Start a New Conversation
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Card>
      )}
      
      {/* New Chat Modal */}
      <NewChatModal 
        visible={newChatVisible} 
        onClose={() => setNewChatVisible(false)} 
      />
    </div>
  );
};

export default ChatPage; 