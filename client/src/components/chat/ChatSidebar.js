import React from 'react';
import { List, Badge, Avatar, Tooltip } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import './chat.css';

const ChatSidebar = ({ chatRooms, activeChat, onSelectChat, unreadCounts }) => {
  // Function to get other participant's name in direct chats
  const getOtherParticipantName = (chat, participants) => {
    if (chat.type === 'direct' && participants.length === 2) {
      // In direct chats with 2 participants, we want to show the other person's name
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const otherParticipant = participants.find(p => p._id !== currentUser._id);
      return otherParticipant ? otherParticipant.name : 'Unknown User';
    }
    return chat.name;
  };

  // Function to get participant avatar
  const getAvatar = (chat, participants) => {
    if (chat.type === 'direct' && participants.length === 2) {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const otherParticipant = participants.find(p => p._id !== currentUser._id);
      
      if (otherParticipant && otherParticipant.profileImage) {
        return otherParticipant.profileImage;
      }
    }
    return null;
  };

  // Format time for last message
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <List
      className="chat-sidebar"
      dataSource={chatRooms}
      renderItem={(chat) => {
        const isActive = activeChat && activeChat._id === chat._id;
        const displayName = getOtherParticipantName(chat, chat.participants);
        const avatarUrl = getAvatar(chat, chat.participants);
        const unreadCount = unreadCounts[chat._id] || 0;
        
        return (
          <List.Item
            className={`chat-list-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectChat(chat)}
          >
            <List.Item.Meta
              avatar={
                <Badge count={unreadCount} size="small">
                  {avatarUrl ? (
                    <Avatar src={avatarUrl} />
                  ) : (
                    <Avatar icon={chat.type === 'direct' ? <UserOutlined /> : <TeamOutlined />} />
                  )}
                </Badge>
              }
              title={
                <div className="d-flex justify-content-between align-items-center">
                  <Tooltip title={displayName}>
                    <span className="text-truncate" style={{ maxWidth: '120px', display: 'inline-block' }}>
                      {displayName}
                    </span>
                  </Tooltip>
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {formatTime(chat.lastMessage)}
                  </small>
                </div>
              }
              description={
                <div className="text-truncate" style={{ fontSize: '0.85rem' }}>
                  {chat.type === 'group' ? (
                    <small>
                      <TeamOutlined /> {chat.participants.length} participants
                    </small>
                  ) : (
                    <small className="text-muted">
                      Direct message
                    </small>
                  )}
                </div>
              }
            />
          </List.Item>
        );
      }}
      locale={{
        emptyText: (
          <div className="p-4 text-center">
            <i className="bi bi-chat-square-text mb-2" style={{ fontSize: '2rem', color: '#ccc' }}></i>
            <p>No conversations yet</p>
          </div>
        )
      }}
    />
  );
};

export default ChatSidebar; 