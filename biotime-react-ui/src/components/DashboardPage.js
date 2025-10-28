import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { getUserCount, getDeviceCount, getAreaCount, getRecentOperationLogs } from '../ApiService';

const DashboardPage = () => {
    const [userCount, setUserCount] = useState(0);
    const [deviceCount, setDeviceCount] = useState(0);
    const [areaCount, setAreaCount] = useState(0);
    const [recentActivities, setRecentActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const users = await getUserCount();
                setUserCount(users);

                const devices = await getDeviceCount();
                setDeviceCount(devices);

                const areas = await getAreaCount();
                setAreaCount(areas);

                const activitiesResponse = await getRecentOperationLogs(5); // Fetch 5 recent activities
                setRecentActivities(activitiesResponse.data);

            } catch (err) {
                setError('Failed to fetch dashboard data: ' + err.message);
                console.error('Dashboard data fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div>
            <h2 className="page-title">Dashboard</h2>

            <Row className="mb-4">
                <Col md={4}>
                    <Card className="text-center dashboard-card">
                        <Card.Body>
                            <Card.Title>Total Users</Card.Title>
                            <Card.Text className="display-4">{userCount}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center dashboard-card">
                        <Card.Body>
                            <Card.Title>Total Devices</Card.Title>
                            <Card.Text className="display-4">{deviceCount}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center dashboard-card">
                        <Card.Body>
                            <Card.Title>Total Areas</Card.Title>
                            <Card.Text className="display-4">{areaCount}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Card className="dashboard-card">
                        <Card.Header>Recent Device Activity</Card.Header>
                        <Card.Body>
                            {recentActivities.length === 0 ? (
                                <p className="text-muted">No recent activity.</p>
                            ) : (
                                <ListGroup variant="flush">
                                    {recentActivities.map((activity, index) => (
                                        <ListGroup.Item key={index}>
                                            <strong>Device SN:</strong> {activity.deviceSerialNumber} -
                                            <strong> Type:</strong> {activity.operationType} -
                                            <strong> Details:</strong> {activity.details} -
                                            <small className="text-muted ms-2">{new Date(activity.timestamp).toLocaleString()}</small>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;