import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal, Tabs, Input, List, Avatar, Button, Spin, Form } from 'antd';
import { SearchOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { 
  fetchChatUsers, 
  getOrCreateDirectChat,
  createGroupChat
} from '../../redux/slices/chatSlice';

const { TabPane } = Tabs;
const { Search } = Input;

const NewChatModal = ({ visible, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('1');
  const [groupForm] = Form.useForm();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatUsers, usersLoading } = useSelector(state => state.chat);
  
  // Load users when modal opens
  useEffect(() => {
    if (visible) {
      dispatch(fetchChatUsers());
    }
  }, [visible, dispatch]);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchText('');
      setSelectedTab('1');
      groupForm.resetFields();
      setSelectedUsers([]);
    }
  }, [visible, groupForm]);
  
  // Handle search users
  const handleSearch = (value) => {
    setSearchText(value);
    console.log('Searching for users with query:', value);
    
    // Dispatch with empty string if the search text is empty
    dispatch(fetchChatUsers(value))
      .unwrap()
      .then(users => {
        console.log('Search results:', users);
      })
      .catch(error => {
        console.error('Error searching for users:', error);
      });
  };
  
  // Start direct chat with a user
  const handleStartDirectChat = async (userId) => {
    setIsCreating(true);
    
    try {
      const resultAction = await dispatch(getOrCreateDirectChat(userId));
      if (getOrCreateDirectChat.fulfilled.match(resultAction)) {
        const chatId = resultAction.payload._id;
        onClose();
        navigate(`/chat/${chatId}`);
      }
    } catch (error) {
      console.error('Failed to start direct chat:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Create a new group chat
  const handleCreateGroupChat = async (values) => {
    if (selectedUsers.length === 0) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      const groupData = {
        name: values.name,
        participants: selectedUsers
      };
      
      const resultAction = await dispatch(createGroupChat(groupData));
      if (createGroupChat.fulfilled.match(resultAction)) {
        const chatId = resultAction.payload._id;
        onClose();
        navigate(`/chat/${chatId}`);
      }
    } catch (error) {
      console.error('Failed to create group chat:', error);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Toggle user selection for group chat
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  
  return (
    <Modal
      title="New Conversation"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Tabs 
        activeKey={selectedTab} 
        onChange={setSelectedTab}
        centered
      >
        <TabPane 
          tab={
            <span>
              <UserOutlined /> Direct Message
            </span>
          }
          key="1"
        >
          <div className="py-2">
            <Search
              placeholder="Search by name, email or registration number"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              style={{ marginBottom: 16 }}
              enterButton={<SearchOutlined />}
              allowClear
            />
            
            <List
              loading={usersLoading}
              dataSource={chatUsers}
              renderItem={user => (
                <List.Item
                  actions={[
                    <Button 
                      type="primary" 
                      size="small"
                      onClick={() => handleStartDirectChat(user._id)}
                      loading={isCreating}
                    >
                      Chat
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<UserOutlined />} 
                        src={user.profileImage}
                      />
                    }
                    title={user.name}
                    description={
                      <div>
                        <div>{user.email}</div>
                        <small className="text-muted">{user.role} {user.regNo ? `• ${user.regNo}` : ''}</small>
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: 
                  usersLoading ? 
                    <Spin tip="Loading users..." /> :
                    searchText ? 
                      'No users found matching your search' : 
                      'No users available'
              }}
            />
          </div>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <TeamOutlined /> Group Chat
            </span>
          }
          key="2"
        >
          <Form 
            form={groupForm}
            layout="vertical"
            onFinish={handleCreateGroupChat}
          >
            <Form.Item
              name="name"
              label="Group Name"
              rules={[{ required: true, message: 'Please enter a group name' }]}
            >
              <Input placeholder="Enter group name" />
            </Form.Item>
            
            <div className="mb-3">
              <label className="form-label">Select Participants</label>
              <Search
                placeholder="Search users"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                style={{ marginBottom: 16 }}
                enterButton={<SearchOutlined />}
                allowClear
              />
            </div>
            
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <List
                loading={usersLoading}
                dataSource={chatUsers}
                renderItem={user => (
                  <List.Item
                    actions={[
                      <Button 
                        type={selectedUsers.includes(user._id) ? 'primary' : 'default'}
                        size="small"
                        onClick={() => toggleUserSelection(user._id)}
                        icon={selectedUsers.includes(user._id) ? '✓' : '+'}
                      >
                        {selectedUsers.includes(user._id) ? 'Selected' : 'Select'}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<UserOutlined />} 
                          src={user.profileImage}
                        />
                      }
                      title={user.name}
                      description={
                        <div>
                          <small className="text-muted">{user.role} {user.regNo ? `• ${user.regNo}` : ''}</small>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{
                  emptyText: 
                    usersLoading ? 
                      <Spin tip="Loading users..." /> :
                      searchText ? 
                        'No users found matching your search' : 
                        'No users available'
                }}
              />
            </div>
            
            <div className="mt-3">
              <small className="text-muted">
                {selectedUsers.length} {selectedUsers.length === 1 ? 'user' : 'users'} selected
              </small>
            </div>
            
            <div className="mt-3 d-flex justify-content-end">
              <Button onClick={onClose} className="me-2">
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                disabled={selectedUsers.length === 0}
                loading={isCreating}
              >
                Create Group
              </Button>
            </div>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default NewChatModal; 