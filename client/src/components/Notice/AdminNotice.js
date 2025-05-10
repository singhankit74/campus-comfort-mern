import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Card, List, Typography, Modal, message, Space, Spin, Alert, Switch, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminNotice = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [form] = Form.useForm();
    const { user } = useSelector(state => state.auth);
    const token = user?.token;

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/notices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotices(response.data);
        } catch (err) {
            console.error('Error fetching notices:', err);
            message.error('Failed to fetch notices. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotices();
        }
    }, [token]);

    const handleSubmit = async (values) => {
        try {
            if (editingNotice) {
                await axios.put(`/api/notices/${editingNotice._id}`, values, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                message.success('Notice updated successfully');
            } else {
                await axios.post('/api/notices', values, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                message.success('Notice created successfully');
            }
            setModalVisible(false);
            form.resetFields();
            setEditingNotice(null);
            fetchNotices();
        } catch (err) {
            console.error('Error saving notice:', err);
            message.error(err.response?.data?.message || 'Operation failed. Please try again.');
        }
    };

    const handleEdit = (notice) => {
        setEditingNotice(notice);
        form.setFieldsValue({
            title: notice.title,
            content: notice.content,
            isActive: notice.isActive
        });
        setModalVisible(true);
    };

    const handleDelete = async (noticeId) => {
        try {
            await axios.delete(`/api/notices/${noticeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Notice deleted successfully');
            fetchNotices();
        } catch (err) {
            console.error('Error deleting notice:', err);
            message.error('Failed to delete notice. Please try again.');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <Space style={{ marginBottom: '20px' }}>
                <Title level={2}>Manage Notices</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingNotice(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Create Notice
                </Button>
            </Space>

            {notices.length === 0 ? (
                <Empty description="No notices available" />
            ) : (
                <List
                    grid={{ gutter: 16, column: 1 }}
                    dataSource={notices}
                    renderItem={notice => (
                        <List.Item>
                            <Card
                                title={notice.title}
                                extra={
                                    <Space>
                                        <Button
                                            icon={<EditOutlined />}
                                            onClick={() => handleEdit(notice)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDelete(notice._id)}
                                        >
                                            Delete
                                        </Button>
                                    </Space>
                                }
                            >
                                <Text>{notice.content}</Text>
                                <br />
                                <Space style={{ marginTop: '10px' }}>
                                    <Text type="secondary">
                                        Status: {notice.isActive ? 'Active' : 'Inactive'}
                                    </Text>
                                    <Text type="secondary">
                                        Posted on: {new Date(notice.createdAt).toLocaleDateString()}
                                    </Text>
                                </Space>
                            </Card>
                        </List.Item>
                    )}
                />
            )}

            <Modal
                title={editingNotice ? 'Edit Notice' : 'Create Notice'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingNotice(null);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="Content"
                        rules={[{ required: true, message: 'Please enter content' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item
                        name="isActive"
                        label="Active"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingNotice ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                setEditingNotice(null);
                                form.resetFields();
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminNotice; 