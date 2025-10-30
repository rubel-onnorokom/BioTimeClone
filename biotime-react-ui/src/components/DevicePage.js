import React, { useState, useEffect } from 'react';
import { getDevices, createDevice, updateDevice, deleteDevice, getAreas, getPendingCommands, clearDeviceCommands, syncAllDataToDevice } from '../ApiService';
import { Card, Button, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import DeviceDetailsModal from './DeviceDetailsModal';

const DevicePage = () => {
    const [devices, setDevices] = useState([]);
    const [areas, setAreas] = useState([]);
    const [serialNumber, setSerialNumber] = useState('');
    const [deviceName, setDeviceName] = useState('');
    const [ipAddress, setIpAddress] = useState('');
    const [selectedAreaId, setSelectedAreaId] = useState('');
    const [editingDevice, setEditingDevice] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingCommands, setPendingCommands] = useState({});
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [showClearCommandsModal, setShowClearCommandsModal] = useState(false);
    const [deviceToDeleteCommands, setDeviceToDeleteCommands] = useState(null);
    const [showSyncAllDataModal, setShowSyncAllDataModal] = useState(false);
    const [deviceToSyncAllData, setDeviceToSyncAllData] = useState(null);

    useEffect(() => {
        fetchDevices();
        fetchAreas();
    }, []);

    const fetchDevices = async () => {
        setIsLoading(true);
        try {
            const response = await getDevices();
            setDevices(response.data);
            // Fetch pending commands count for each device
            const promises = response.data.map(device => 
                fetchPendingCommandsCount(device.serialNumber)
            );
            await Promise.all(promises);
        } catch (error) {
            setMessage(`Error fetching devices: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPendingCommandsCount = async (serialNumber) => {
        try {
            const response = await getPendingCommands(serialNumber);
            setPendingCommands(prev => ({
                ...prev,
                [serialNumber]: response.data.pendingCommands
            }));
        } catch (error) {
            console.error(`Error fetching pending commands for device ${serialNumber}:`, error);
            // Set to 0 if there's an error
            setPendingCommands(prev => ({
                ...prev,
                [serialNumber]: 0
            }));
        }
    };

    const fetchAreas = async () => {
        try {
            const response = await getAreas();
            setAreas(response.data);
        } catch (error) {
            setMessage(`Error fetching areas: ${error.message}`);
        }
    };

    const handleCreateDevice = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createDevice({ 
                serialNumber, 
                name: deviceName, 
                ipAddress, 
                areaId: selectedAreaId ? parseInt(selectedAreaId, 10) : null 
            });
            setMessage('Device created successfully!');
            setSerialNumber('');
            setDeviceName('');
            setIpAddress('');
            setSelectedAreaId('');
            fetchDevices();
        } catch (error) {
            setMessage(`Error creating device: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (device) => {
        setEditingDevice(device);
        setSerialNumber(device.serialNumber);
        setDeviceName(device.name || '');
        setIpAddress(device.ipAddress || '');
        setSelectedAreaId(device.areaId ? device.areaId.toString() : '');
    };

    const handleUpdateDevice = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateDevice(serialNumber, { 
                serialNumber, 
                name: deviceName, 
                ipAddress, 
                areaId: selectedAreaId ? parseInt(selectedAreaId, 10) : null 
            });
            setMessage('Device updated successfully!');
            setEditingDevice(null);
            setSerialNumber('');
            setDeviceName('');
            setIpAddress('');
            setSelectedAreaId('');
            fetchDevices();
        } catch (error) {
            setMessage(`Error updating device: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDevice = async (serialNumberToDelete) => {
        if (window.confirm(`Are you sure you want to delete device with serial number ${serialNumberToDelete}?`)) {
            setIsLoading(true);
            try {
                await deleteDevice(serialNumberToDelete);
                setMessage('Device deleted successfully!');
                fetchDevices();
            } catch (error) {
                setMessage(`Error deleting device: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleShowDetails = (device) => {
        setSelectedDevice(device);
        setShowDetailsModal(true);
    };

    const handleClearDeviceCommands = (serialNumber) => {
        setDeviceToDeleteCommands(serialNumber);
        setShowClearCommandsModal(true);
    };

    const handleConfirmClearCommands = async () => {
        if (deviceToDeleteCommands) {
            setIsLoading(true);
            setShowClearCommandsModal(false);
            try {
                const response = await clearDeviceCommands(deviceToDeleteCommands);
                setMessage(response.data);
                // Refresh pending commands count after clearing
                fetchPendingCommandsCount(deviceToDeleteCommands);
            } catch (error) {
                setMessage(`Error clearing device commands: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
                setDeviceToDeleteCommands(null);
            }
        }
    };

    const handleSyncAllData = (serialNumber) => {
        setDeviceToSyncAllData(serialNumber);
        setShowSyncAllDataModal(true);
    };

    const handleConfirmSyncAllData = async () => {
        if (deviceToSyncAllData) {
            setIsLoading(true);
            setShowSyncAllDataModal(false);
            try {
                const response = await syncAllDataToDevice(deviceToSyncAllData);
                setMessage(response.data);
                // Refresh pending commands count after syncing
                fetchPendingCommandsCount(deviceToSyncAllData);
            } catch (error) {
                setMessage(`Error syncing all data to device: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
                setDeviceToSyncAllData(null);
            }
        }
    };

    return (
        <div>
            <h2 className="page-title">Device Management</h2>

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
                            {editingDevice ? 'Edit Device' : 'Add New Device'}
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={editingDevice ? handleUpdateDevice : handleCreateDevice}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Serial Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter serial number"
                                        value={serialNumber}
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                        required
                                        disabled={!!editingDevice || isLoading}
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Device Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter device name"
                                        value={deviceName}
                                        onChange={(e) => setDeviceName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>IP Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter IP address (e.g., 192.168.1.100)"
                                        value={ipAddress}
                                        onChange={(e) => setIpAddress(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Assign to Area</Form.Label>
                                    <Form.Select
                                        value={selectedAreaId}
                                        onChange={(e) => setSelectedAreaId(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="">Select an Area</option>
                                        {areas.map(area => (
                                            <option key={area.id} value={area.id}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                
                                <div className="d-flex gap-2">
                                    <Button 
                                        variant={editingDevice ? "success" : "primary"} 
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Processing...' : (editingDevice ? 'Update Device' : 'Add Device')}
                                    </Button>
                                    
                                    {editingDevice && (
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => {
                                                setEditingDevice(null);
                                                setSerialNumber('');
                                                setDeviceName('');
                                                setIpAddress('');
                                                setSelectedAreaId('');
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
                        <Card.Header>Registered Devices</Card.Header>
                        <Card.Body>
                            {isLoading && devices.length === 0 ? (
                                <p>Loading devices...</p>
                            ) : devices.length === 0 ? (
                                <p className="text-muted">No devices found.</p>
                            ) : (
                                <div className="list-group">
                                    {devices.map((device) => (
                                        <div key={device.serialNumber} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-0">{device.name || 'Unnamed Device'}</h6>
                                                <div className="mt-1">
                                                    <small className="text-muted">SN: {device.serialNumber}</small><br />
                                                    <small className="text-muted">IP: {device.ipAddress || 'Not set'}</small><br />
                                                    <small className="text-muted">Last Seen: {new Date(device.lastSeen).toLocaleString()}</small><br />
                                                    {device.areaId && (
                                                        <Badge bg="info" className="mt-1 me-1">
                                                            {areas.find(a => a.id === device.areaId)?.name || `Area ID: ${device.areaId}`}
                                                        </Badge>
                                                    )}
                                                    <Badge bg={pendingCommands[device.serialNumber] > 0 ? "warning" : "success"} className="mt-1">
                                                        Pending: {pendingCommands[device.serialNumber] || 0}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="info" 
                                                    size="sm"
                                                    onClick={() => handleShowDetails(device)}
                                                    disabled={isLoading}
                                                >
                                                    Details
                                                </Button>
                                                <Button 
                                                    variant="warning" 
                                                    size="sm"
                                                    onClick={() => handleEditClick(device)}
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm"
                                                    onClick={() => handleDeleteDevice(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Delete
                                                </Button>
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm"
                                                    onClick={() => handleClearDeviceCommands(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Clear Commands
                                                </Button>
                                                <Button 
                                                    variant="primary" 
                                                    size="sm"
                                                    onClick={() => handleSyncAllData(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Sync All Data
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
            <DeviceDetailsModal device={selectedDevice} show={showDetailsModal} onHide={() => setShowDetailsModal(false)} />
            
            {/* Clear Commands Confirmation Modal */}
            <div className={`modal ${showClearCommandsModal ? 'show d-block' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Clear Commands</h5>
                            <button type="button" className="btn-close" onClick={() => setShowClearCommandsModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to clear all commands for device <strong>{deviceToDeleteCommands}</strong>?</p>
                            <p className="text-warning">This will remove all queued commands for this device.</p>
                        </div>
                        <div className="modal-footer">
                            <Button variant="secondary" onClick={() => setShowClearCommandsModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleConfirmClearCommands}>
                                Clear Commands
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Sync All Data Confirmation Modal */}
            <div className={`modal ${showSyncAllDataModal ? 'show d-block' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Sync All Data</h5>
                            <button type="button" className="btn-close" onClick={() => setShowSyncAllDataModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to sync all data for device <strong>{deviceToSyncAllData}</strong>?</p>
                            <p className="text-info">This will sync all user information and biometric templates (fingerprints, face, finger vein, unified) from the database to the device.</p>
                            <p className="text-warning"><strong>Note:</strong> This will queue new commands to update the device. Any previously cleared commands will not be restored.</p>
                        </div>
                        <div className="modal-footer">
                            <Button variant="secondary" onClick={() => setShowSyncAllDataModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleConfirmSyncAllData}>
                                Sync All Data
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevicePage;