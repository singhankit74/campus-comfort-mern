import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Typography, List, Spin, Alert, Empty, Button } from 'antd';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Notice = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector(state => state.auth);
    const token = user?.token;

    const fetchNotices = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get('/api/notices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNotices(response.data);
        } catch (err) {
            console.error('Error fetching notices:', err);
            setError(err.response?.data?.message || 'Failed to fetch notices. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotices();
        } else {
            setLoading(false);
            setError('Authentication token is missing. Please log in again.');
        }
    }, [token]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <Spin size="large" />
                <div style={{ marginLeft: '10px' }}>Loading notices...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert
                    type="error"
                    message="Error"
                    description={error}
                    showIcon
                />
            </div>
        );
    }

    if (!notices.length) {
        return (
            <div style={{ padding: '20px' }}>
                <Title level={2}>Notices</Title>
                <Empty 
                    description={user?.role === 'admin' ? 
                        "No notices available. Create one from the admin panel." : 
                        "No notices available at this time."
                    } 
                />
                {user?.role === 'admin' && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Link to="/admin/notices">
                            <Button type="primary">Manage Notices</Button>
                        </Link>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={2}>Notices</Title>
            </div>
            
            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={notices}
                renderItem={notice => (
                    <List.Item>
                        <Card
                            title={notice.title}
                            extra={
                                <Text type="secondary">
                                    Posted by: {notice.createdBy?.name || 'Admin'}
                                </Text>
                            }
                        >
                            <Text>{notice.content}</Text>
                            <br />
                            <Text type="secondary">
                                Posted on: {new Date(notice.createdAt).toLocaleDateString()}
                            </Text>
                        </Card>
                    </List.Item>
                )}
            />
            {user?.role === 'admin' && (
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <Link to="/admin/notices">
                        <Button type="primary">Manage Notices</Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Notice; 