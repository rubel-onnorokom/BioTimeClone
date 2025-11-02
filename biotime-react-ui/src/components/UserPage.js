import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser, getAreas, getUserAttendanceLogs } from '../ApiService';
import { Card, Button, Form, Alert, Row, Col, Badge, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const UserPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [pin, setPin] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [privilege, setPrivilege] = useState(0);
    const [cardNumber, setCardNumber] = useState('');
    const [selectedAreaIds, setSelectedAreaIds] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [attendanceLogs, setAttendanceLogs] = useState({});
    const [selectedUserForLogs, setSelectedUserForLogs] = useState(null);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [fingerprints, setFingerprints] = useState({});
    const [selectedUserForFingerprints, setSelectedUserForFingerprints] = useState(null);
    const [showFingerprintsModal, setShowFingerprintsModal] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchAreas();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (error) {
            setMessage(`Error fetching users: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAreas = async () => {
        try {
            const response = await getAreas();
            setAreas(response.data);
        } catch (error) {
            setMessage(`Error fetching areas: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userDto = {
                pin,
                name,
                password,
                privilege,
                cardNumber,
                areaIds: selectedAreaIds.map(id => parseInt(id, 10)),
            };
            const response = await createUser(userDto);
            setMessage(`User created successfully: ${JSON.stringify(response.data)}`);
            // Clear form
            setPin(''); setName(''); setPassword(''); setPrivilege(0); setCardNumber(''); setSelectedAreaIds([]);
            fetchUsers();
        } catch (error) {
            setMessage(`Error creating user: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setPin(user.pin);
        setName(user.name);
        setPassword(user.password);
        setPrivilege(user.privilege);
        setCardNumber(user.cardNumber);
        setSelectedAreaIds(user.userAreas ? user.userAreas.map(ua => ua.areaId.toString()) : []);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userDto = {
                name,
                password,
                privilege,
                cardNumber,
                areaIds: selectedAreaIds.map(id => parseInt(id, 10)),
            };

            await updateUser(pin, userDto);

            setMessage('User updated successfully!');
            setEditingUser(null);
            setPin('');
            setName('');
            setPassword('');
            setPrivilege(0);
            setCardNumber('');
            setSelectedAreaIds([]);
            fetchUsers(); // Refresh the list
        } catch (error) {
            setMessage(`Error updating user: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userPin) => {
        if (window.confirm(`Are you sure you want to delete user with PIN ${userPin}?`)) {
            setIsLoading(true);
            try {
                const response = await deleteUser(userPin);
                setMessage(response.data);
                fetchUsers();
            } catch (error) {
                setMessage(`Error deleting user: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const fetchUserAttendanceLogs = async (pin) => {
        setIsLoading(true);
        try {
            const response = await getUserAttendanceLogs(pin);
            setAttendanceLogs(prev => ({
                ...prev,
                [pin]: response.data
            }));
            setSelectedUserForLogs(pin);
            setShowAttendanceModal(true);
        } catch (error) {
            setMessage(`Error fetching attendance logs: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };



    const handleAreaSelect = (e) => {
        const options = e.target.options;
        const value = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setSelectedAreaIds(value);
    };

    return (
        <div>
            <h2 className="page-title">User Management</h2>

            {message && (
                <Alert 
                    variant={message.includes('Error') ? 'danger' : 'success'} 
                    onClose={() => setMessage('')} 
                    dismissible
                >
                    {message}
                </Alert>
            )}

            <Row>
                <Col md={6}>
                    <Card className="form-card">
                        <Card.Header>
                            {editingUser ? 'Edit User' : 'Create New User'}
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>PIN</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter PIN"
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value)}
                                                required
                                                disabled={!!editingUser || isLoading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Privilege</Form.Label>
                                            <Form.Select
                                                value={privilege}
                                                onChange={(e) => setPrivilege(parseInt(e.target.value, 10))}
                                                disabled={isLoading}
                                            >
                                                <option value={0}>User</option>
                                                <option value={1}>Admin</option>
                                                <option value={2}>Super Admin</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Card Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter card number"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Assign to Areas</Form.Label>
                                    <Form.Select
                                        multiple
                                        value={selectedAreaIds}
                                        onChange={handleAreaSelect}
                                        disabled={isLoading}
                                    >
                                        {areas.map(area => (
                                            <option key={area.id} value={area.id}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                
                                <div className="d-flex gap-2">
                                    <Button 
                                        variant={editingUser ? "success" : "primary"} 
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Processing...' : (editingUser ? 'Update User' : 'Create User')}
                                    </Button>
                                    
                                    {editingUser && (
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => {
                                                setEditingUser(null);
                                                setPin(''); setName(''); setPassword(''); setPrivilege(0); setCardNumber(''); setSelectedAreaIds([]);
                                                setMessage('');
                                            }}
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="data-table">
                        <Card.Header>Existing Users</Card.Header>
                        <Card.Body>
                            {isLoading && users.length === 0 ? (
                                <p>Loading users...</p>
                            ) : users.length === 0 ? (
                                <p className="text-muted">No users found.</p>
                            ) : (
                                <div className="list-group">
                                    {users.map((user) => (
                                        <div key={user.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-0">{user.name || 'N/A'} <small className="text-muted">(PIN: {user.pin})</small></h6>
                                                <div className="mt-1">
                                                    {user.userAreas && user.userAreas.length > 0 ? (
                                                        user.userAreas.slice(0, 3).map(ua => (
                                                            <Badge key={ua.areaId} bg="primary" className="me-1">
                                                                {areas.find(a => a.id === ua.areaId)?.name || `Area ${ua.areaId}`}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted">No areas assigned</span>
                                                    )}
                                                    {user.userAreas && user.userAreas.length > 3 && (
                                                        <Badge bg="secondary" className="ms-1">+{user.userAreas.length - 3}</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="info" 
                                                    size="sm"
                                                    onClick={() => fetchUserAttendanceLogs(user.pin)}
                                                    disabled={isLoading}
                                                >
                                                    View Logs
                                                </Button>
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm"
                                                    onClick={() => navigate(`/biometric-management/${user.pin}`)}
                                                    disabled={isLoading}
                                                >
                                                    Manage Biometrics
                                                </Button>
                                                <Button 
                                                    variant="warning" 
                                                    size="sm"
                                                    onClick={() => handleEditClick(user)}
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user.pin)}
                                                    disabled={isLoading}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Attendance Logs Modal */}
            {showAttendanceModal && (
                <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Attendance Logs for User: {selectedUserForLogs}</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowAttendanceModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {isLoading ? (
                                    <p>Loading attendance logs...</p>
                                ) : (
                                    <div className="table-responsive">
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Timestamp</th>
                                                    <th>Status</th>
                                                    <th>Verification Mode</th>
                                                    <th>Work Code</th>
                                                    <th>Device ID</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendanceLogs[selectedUserForLogs] && attendanceLogs[selectedUserForLogs].length > 0 ? (
                                                    attendanceLogs[selectedUserForLogs].map((log, index) => (
                                                        <tr key={index}>
                                                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                                                            <td>{log.status}</td>
                                                            <td>{log.verificationMode}</td>
                                                            <td>{log.workCode || 'N/A'}</td>
                                                            <td>{log.deviceId}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="text-center">No attendance logs found for this user.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <Button variant="secondary" onClick={() => setShowAttendanceModal(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default UserPage;