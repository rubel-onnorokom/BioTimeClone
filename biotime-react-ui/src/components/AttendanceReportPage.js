import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Row, Col, Table, Spinner } from 'react-bootstrap';
import { getUsers, getUserAttendanceReport } from '../ApiService';

const AttendanceReportPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedPin, setSelectedPin] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [report, setReport] = useState([]);
    const [totalWorkingHours, setTotalWorkingHours] = useState(null);
    const [totalLateEntries, setTotalLateEntries] = useState(0);
    const [totalEarlyLeaves, setTotalEarlyLeaves] = useState(0);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await getUsers();
            setUsers(response.data);
            if (response.data.length > 0) {
                setSelectedPin(response.data[0].pin); // Select first user by default
            }
        } catch (error) {
            setMessage(`Error fetching users: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        if (!selectedPin || !startDate || !endDate) {
            setMessage('Please select a user, start date, and end date.');
            return;
        }

        setIsLoading(true);
        setMessage('');
        try {
            const response = await getUserAttendanceReport(selectedPin, startDate, endDate);
            console.log('Backend response data:', response.data); // Keep this for now

            if (response.data && response.data.dailyReports) {
                setReport(response.data.dailyReports);
                setTotalWorkingHours(response.data.totalWorkingHours);
                setTotalLateEntries(response.data.totalLateEntries);
                setTotalEarlyLeaves(response.data.totalEarlyLeaves);

                if (response.data.dailyReports.length === 0) {
                    setMessage('No attendance data found for the selected user and date range.');
                }
            } else {
                setMessage('Unexpected response format from the server.');
                console.error('Unexpected response format:', response.data);
                setReport([]); // Ensure report is an array
                setTotalWorkingHours(null);
                setTotalLateEntries(0);
                setTotalEarlyLeaves(0);
            }
        } catch (error) {
            setMessage(`Error generating report: ${error.response ? error.response.data : error.message}`);
            console.error('Attendance report error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeSpan = (timeSpan) => {
        if (!timeSpan) return '-';
        // timeSpan is now expected to be a formatted string from the backend
        return timeSpan;
    };

    return (
        <div>
            <h2 className="page-title">Attendance Report</h2>

            {message && (
                <Alert 
                    variant={message.includes('Error') ? 'danger' : 'success'} 
                    onClose={() => setMessage('')} 
                    dismissible
                >
                    {message}
                </Alert>
            )}

            <Card className="mb-4">
                <Card.Header>Generate Report</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleGenerateReport}>
                        <Row className="mb-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Select User</Form.Label>
                                    <Form.Select
                                        value={selectedPin}
                                        onChange={(e) => setSelectedPin(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    >
                                        <option value="">Select a user</option>
                                        {users.map(user => (
                                            <option key={user.pin} value={user.pin}>
                                                {user.name} ({user.pin})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex align-items-end">
                                <Button type="submit" variant="primary" disabled={isLoading}>
                                    {isLoading ? <Spinner animation="border" size="sm" /> : 'Show Report'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {report.length > 0 && (
                <Card>
                    <Card.Header>Attendance Details</Card.Header>
                    <Card.Body>
                        <div className="table-responsive">
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>In Time</th>
                                        <th>Out Time</th>
                                        <th>Late Entry</th>
                                        <th>Early Leave</th>
                                        <th>W. Hour</th>
                                        <th>Absent/Leave</th>
                                        <th>Zone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.map((entry, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{new Date(entry.date).toLocaleDateString()}</td>
                                                <td>{entry.inTime ? formatTimeSpan(entry.inTime) : '-'}</td>
                                                <td>{entry.outTime ? formatTimeSpan(entry.outTime) : '-'}</td>
                                                <td>{entry.isLateEntry ? 'Yes' : '-'}</td>
                                                <td>{entry.isEarlyLeave ? 'Yes' : '-'}</td>
                                                <td>{entry.workingHours ? formatTimeSpan(entry.workingHours) : '-'}</td>
                                                <td>{entry.absentLeaveReason || '-'}</td>
                                                <td>{entry.zone || '-'}</td>
                                            </tr>
                                        );
                                    })}
                                    {totalWorkingHours !== null && (
                                        <tr className="fw-bold">
                                            <td colSpan="3">Total</td> {/* Adjusted colSpan */}
                                            <td>{totalLateEntries}</td> {/* Total Late Entries */}
                                            <td>{totalEarlyLeaves}</td> {/* Total Early Leaves */}
                                            <td>{formatTimeSpan(totalWorkingHours)}</td>
                                            <td>-</td> {/* Absent/Leave */}
                                            <td>-</td> {/* Zone - or a summary if needed */}
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default AttendanceReportPage;