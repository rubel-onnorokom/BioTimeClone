import React, { useState, useEffect } from 'react';
import { 
    getDevices, 
    syncUsersToDevice, 
    rebootDevice, 
    getDeviceInfo, 
    reloadOptions, 
    checkAndTransmitNewData, 
    checkDataUpdate, 
    cancelAlarm, 
    unlockDoor, 
    clearBioData, 
    clearData, 
    clearAttendancePhotos, 
    clearAttendanceLogs,
    assignDeviceToArea,
    setDeviceOption,
    enrollFingerprint,
    updateFirmware,
    executeShellCommand,
    putFile,
    getFile,
    getAreas,
    clearDeviceCommands
} from '../ApiService';
import { Card, Button, Form, Alert, Row, Col, Tab, Tabs, Accordion } from 'react-bootstrap';

const DeviceManagementPage = () => {
    const [devices, setDevices] = useState([]);
    const [areas, setAreas] = useState([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('device-actions');
    const [deviceInfo, setDeviceInfo] = useState({});

    // States for Batch 2 actions
    const [assignAreaSerialNumber, setAssignAreaSerialNumber] = useState('');
    const [assignAreaId, setAssignAreaId] = useState('');
    const [setOptionSerialNumber, setSetOptionSerialNumber] = useState('');
    const [setOptionKey, setSetOptionKey] = useState('');
    const [setOptionValue, setSetOptionValue] = useState('');
    const [enrollFpDeviceSerialNumber, setEnrollFpDeviceSerialNumber] = useState('');
    const [enrollFpPin, setEnrollFpPin] = useState('');
    const [enrollFpFingerIndex, setEnrollFpFingerIndex] = useState(0);
    const [enrollFpRetryCount, setEnrollFpRetryCount] = useState(0);
    const [enrollFpOverwrite, setEnrollFpOverwrite] = useState(false);
    const [pushTemplate, setPushTemplate] = useState(false);
    const [enrollFpTemplateData, setEnrollFpTemplateData] = useState('');
    const [updateFirmwareSerialNumber, setUpdateFirmwareSerialNumber] = useState('');
    const [updateFirmwareChecksum, setUpdateFirmwareChecksum] = useState('');
    const [updateFirmwareUrl, setUpdateFirmwareUrl] = useState('');
    const [updateFirmwareSize, setUpdateFirmwareSize] = useState('');
    const [execShellSerialNumber, setExecShellSerialNumber] = useState('');
    const [execShellCommand, setExecShellCommand] = useState('');
    const [putFileSerialNumber, setPutFileSerialNumber] = useState('');
    const [putFileUrl, setPutFileUrl] = useState('');
    const [putFilePath, setPutFilePath] = useState('');
    const [getFileSerialNumber, setGetFileSerialNumber] = useState('');
    const [getFilePath, setGetFilePath] = useState('');

    useEffect(() => {
        fetchDevices();
        fetchAreas();
    }, []);

    const fetchDevices = async () => {
        setIsLoading(true);
        try {
            const response = await getDevices();
            setDevices(response.data);
        } catch (error) {
            setMessage(`Error fetching devices: ${error.message}`);
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
        }
    };

    const handleSyncUsers = async (serialNumberToSync) => {
        setIsLoading(true);
        try {
            const response = await syncUsersToDevice(serialNumberToSync);
            setMessage(response.data);
            fetchDevices();
        } catch (error) {
            setMessage(`Error syncing users: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRebootDevice = async (serialNumberToReboot) => {
        if (window.confirm(`Are you sure you want to reboot device ${serialNumberToReboot}?`)) {
            setIsLoading(true);
            try {
                const response = await rebootDevice(serialNumberToReboot);
                setMessage(response.data);
                fetchDevices();
            } catch (error) {
                setMessage(`Error rebooting device: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleGetDeviceInfo = async (serialNumber) => {
        setIsLoading(true);
        try {
            const response = await getDeviceInfo(serialNumber);
            setMessage(`Device Info for ${serialNumber}: ${JSON.stringify(response.data)}`);
            setDeviceInfo(prevState => ({ ...prevState, [serialNumber]: response.data }));
        } catch (error) {
            setMessage(`Error getting device info: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReloadOptions = async (serialNumber) => {
        setIsLoading(true);
        try {
            const response = await reloadOptions(serialNumber);
            setMessage(response.data);
        } catch (error) {
            setMessage(`Error reloading options: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckAndTransmitNewData = async (serialNumber) => {
        setIsLoading(true);
        try {
            const response = await checkAndTransmitNewData(serialNumber);
            setMessage(response.data);
        } catch (error) {
            setMessage(`Error checking/transmitting data: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckDataUpdate = async (serialNumber) => {
        setIsLoading(true);
        try {
            const response = await checkDataUpdate(serialNumber);
            setMessage(response.data);
        } catch (error) {
            setMessage(`Error checking data update: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelAlarm = async (serialNumber) => {
        setIsLoading(true);
        try {
            const response = await cancelAlarm(serialNumber);
            setMessage(response.data);
        } catch (error) {
            setMessage(`Error canceling alarm: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnlockDoor = async (serialNumber) => {
        if (window.confirm(`Are you sure you want to unlock the door for device ${serialNumber}?`)) {
            setIsLoading(true);
            try {
                const response = await unlockDoor(serialNumber);
                setMessage(response.data);
            } catch (error) {
                setMessage(`Error unlocking door: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleClearBioData = async (serialNumber) => {
        if (window.confirm(`Are you sure you want to clear biodata for device ${serialNumber}?`)) {
            setIsLoading(true);
            try {
                const response = await clearBioData(serialNumber);
                setMessage(response.data);
            } catch (error) {
                setMessage(`Error clearing biodata: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleClearData = async (serialNumber) => {
        if (window.confirm(`Are you sure you want to clear all data for device ${serialNumber}?`)) {
            setIsLoading(true);
            try {
                const response = await clearData(serialNumber);
                setMessage(response.data);
            } catch (error) {
                setMessage(`Error clearing data: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleClearAttendancePhotos = async (serialNumber) => {
        if (window.confirm(`Are you sure you want to clear attendance photos for device ${serialNumber}?`)) {
            setIsLoading(true);
            try {
                const response = await clearAttendancePhotos(serialNumber);
                setMessage(response.data);
            } catch (error) {
                setMessage(`Error clearing attendance photos: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleClearAttendanceLogs = async (serialNumber) => {
        if (window.confirm(`Are you sure you want to clear attendance logs for device ${serialNumber}?`)) {
            setIsLoading(true);
            try {
                const response = await clearAttendanceLogs(serialNumber);
                setMessage(response.data);
            } catch (error) {
                setMessage(`Error clearing attendance logs: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleClearDeviceCommands = async (serialNumber) => {
        if (window.confirm(`Are you sure you want to clear all commands for device ${serialNumber}? This will remove all queued commands for this device.`)) {
            setIsLoading(true);
            try {
                const response = await clearDeviceCommands(serialNumber);
                setMessage(response.data);
            } catch (error) {
                setMessage(`Error clearing device commands: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Handlers for Batch 2 actions
    const handleAssignDeviceToArea = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await assignDeviceToArea(assignAreaSerialNumber, parseInt(assignAreaId, 10));
            setMessage('Device assigned to area successfully.');
            setAssignAreaSerialNumber('');
            setAssignAreaId('');
            fetchDevices();
        } catch (error) {
            setMessage(`Error assigning device to area: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetDeviceOption = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await setDeviceOption(setOptionSerialNumber, setOptionKey, setOptionValue);
            setMessage('Device option set successfully.');
            setSetOptionSerialNumber('');
            setSetOptionKey('');
            setSetOptionValue('');
        } catch (error) {
            setMessage(`Error setting device option: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnrollFingerprint = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const enrollDto = {
                deviceSerialNumber: enrollFpDeviceSerialNumber,
                pin: enrollFpPin,
                fingerIndex: enrollFpFingerIndex,
                retryCount: enrollFpRetryCount,
                overwrite: enrollFpOverwrite,
                templateData: pushTemplate ? enrollFpTemplateData : null,
            };
            await enrollFingerprint(enrollDto);
            setMessage('Fingerprint enrollment command queued.');
            setEnrollFpDeviceSerialNumber('');
            setEnrollFpPin('');
            setEnrollFpFingerIndex(0);
            setEnrollFpRetryCount(0);
            setEnrollFpOverwrite(false);
            setPushTemplate(false);
            setEnrollFpTemplateData('');
        } catch (error) {
            setMessage(`Error enrolling fingerprint: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateFirmware = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateFirmware(updateFirmwareSerialNumber, updateFirmwareChecksum, updateFirmwareUrl, updateFirmwareSize);
            setMessage('Firmware update command queued.');
            setUpdateFirmwareSerialNumber('');
            setUpdateFirmwareChecksum('');
            setUpdateFirmwareUrl('');
            setUpdateFirmwareSize('');
        } catch (error) {
            setMessage(`Error updating firmware: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExecuteShellCommand = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await executeShellCommand(execShellSerialNumber, execShellCommand);
            setMessage('Shell command executed.');
            setExecShellSerialNumber('');
            setExecShellCommand('');
        } catch (error) {
            setMessage(`Error executing shell command: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePutFile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await putFile(putFileSerialNumber, putFileUrl, putFilePath);
            setMessage('Put file command queued.');
            setPutFileSerialNumber('');
            setPutFileUrl('');
            setPutFilePath('');
        } catch (error) {
            setMessage(`Error putting file: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetFile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await getFile(getFileSerialNumber, getFilePath);
            setMessage('Get file command queued.');
            setGetFileSerialNumber('');
            setGetFilePath('');
        } catch (error) {
            setMessage(`Error getting file: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
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

            <Tabs 
                activeKey={activeTab} 
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
            >
                <Tab eventKey="device-actions" title="Device Actions">
                    <Card className="data-table">
                        <Card.Header>Manage Devices</Card.Header>
                        <Card.Body>
                            {isLoading && devices.length === 0 ? (
                                <p>Loading devices...</p>
                            ) : devices.length === 0 ? (
                                <p className="text-muted">No devices found.</p>
                            ) : (
                                <div className="list-group">
                                    {devices.map((device) => (
                                        <div key={device.serialNumber} className="list-group-item list-group-item-action">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    <h6 className="mb-0">{device.name || 'Unnamed Device'}</h6>
                                                    <small className="text-muted">SN: {device.serialNumber} | IP: {device.ipAddress || 'N/A'}</small>
                                                </div>
                                                <div>
                                                    <Button 
                                                        variant="info" 
                                                        size="sm" 
                                                        className="me-1 mb-1"
                                                        onClick={() => handleGetDeviceInfo(device.serialNumber)}
                                                        disabled={isLoading}
                                                    >
                                                        Get Info
                                                    </Button>
                                                    <Button 
                                                        variant="primary" 
                                                        size="sm" 
                                                        className="me-1 mb-1"
                                                        onClick={() => handleSyncUsers(device.serialNumber)}
                                                        disabled={isLoading}
                                                    >
                                                        Sync Users
                                                    </Button>
                                                    <Button 
                                                        variant="warning" 
                                                        size="sm" 
                                                        className="me-1 mb-1"
                                                        onClick={() => handleRebootDevice(device.serialNumber)}
                                                        disabled={isLoading}
                                                    >
                                                        Reboot
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <div className="d-flex flex-wrap gap-1">
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    className="me-1 mb-1"
                                                    onClick={() => handleReloadOptions(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Reload Options
                                                </Button>
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    className="me-1 mb-1"
                                                    onClick={() => handleCheckAndTransmitNewData(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Check/Transmit Data
                                                </Button>
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    className="me-1 mb-1"
                                                    onClick={() => handleCheckDataUpdate(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Check Data Update
                                                </Button>
                                                <Button 
                                                    variant="warning" 
                                                    size="sm" 
                                                    className="me-1 mb-1"
                                                    onClick={() => handleCancelAlarm(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Cancel Alarm
                                                </Button>
                                                <Button 
                                                    variant="success" 
                                                    size="sm" 
                                                    className="me-1 mb-1"
                                                    onClick={() => handleUnlockDoor(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Unlock Door
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm" 
                                                    className="me-1 mb-1"
                                                    onClick={() => handleClearBioData(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Clear Biodata
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm" 
                                                    className="me-1 mb-1"
                                                    onClick={() => handleClearData(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Clear All Data
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm" 
                                                    className="me-1 mb-1"
                                                    onClick={() => handleClearAttendancePhotos(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Clear Att. Photos
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm" 
                                                    className="me-1 mb-1"
                                                    onClick={() => handleClearAttendanceLogs(device.serialNumber)}
                                                    disabled={isLoading}
                                                >
                                                    Clear Att. Logs
                                                </Button>
                                            </div>
                                            
                                            {deviceInfo[device.serialNumber] && (
                                                <div className="mt-2 p-2 bg-light rounded">
                                                    <small>
                                                        <strong>Device Info:</strong> {JSON.stringify(deviceInfo[device.serialNumber], null, 2)}
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="configuration" title="Configuration">
                    <Row>
                        <Col md={6}>
                            <Card className="form-card">
                                <Card.Header>Assign Device to Area</Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleAssignDeviceToArea}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Device Serial Number</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={assignAreaSerialNumber} 
                                                onChange={(e) => setAssignAreaSerialNumber(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Area</Form.Label>
                                            <Form.Select 
                                                value={assignAreaId} 
                                                onChange={(e) => setAssignAreaId(e.target.value)} 
                                                required
                                            >
                                                <option value="">Select Area</option>
                                                {areas.map(area => (
                                                    <option key={area.id} value={area.id}>{area.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                        <Button type="submit" variant="primary" disabled={isLoading}>
                                            {isLoading ? 'Processing...' : 'Assign Device'}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="form-card">
                                <Card.Header>Set Device Option</Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleSetDeviceOption}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Device Serial Number</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={setOptionSerialNumber} 
                                                onChange={(e) => setSetOptionSerialNumber(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Option Key</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={setOptionKey} 
                                                onChange={(e) => setSetOptionKey(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Option Value</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={setOptionValue} 
                                                onChange={(e) => setSetOptionValue(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                        <Button type="submit" variant="primary" disabled={isLoading}>
                                            {isLoading ? 'Processing...' : 'Set Option'}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="enrollment" title="Enrollment">
                    <Card className="form-card">
                        <Card.Header>Enroll Fingerprint</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleEnrollFingerprint}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Device Serial Number</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={enrollFpDeviceSerialNumber} 
                                                onChange={(e) => setEnrollFpDeviceSerialNumber(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>User PIN</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={enrollFpPin} 
                                                onChange={(e) => setEnrollFpPin(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Finger Index</Form.Label>
                                            <Form.Control 
                                                type="number" 
                                                value={enrollFpFingerIndex} 
                                                onChange={(e) => setEnrollFpFingerIndex(parseInt(e.target.value, 10))} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Retry Count</Form.Label>
                                            <Form.Control 
                                                type="number" 
                                                value={enrollFpRetryCount} 
                                                onChange={(e) => setEnrollFpRetryCount(parseInt(e.target.value, 10))} 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="checkbox"
                                        id="enrollFpOverwrite"
                                        label="Overwrite Existing"
                                        checked={enrollFpOverwrite} 
                                        onChange={(e) => setEnrollFpOverwrite(e.target.checked)} 
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="checkbox"
                                        id="pushTemplateCheckbox"
                                        label="Push Existing Template"
                                        checked={pushTemplate} 
                                        onChange={(e) => {
                                            setPushTemplate(e.target.checked);
                                            if (!e.target.checked) {
                                                setEnrollFpTemplateData('');
                                            }
                                        }} 
                                    />
                                </Form.Group>
                                
                                {pushTemplate && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Template Data (Base64)</Form.Label>
                                        <Form.Control 
                                            as="textarea" 
                                            rows={3} 
                                            value={enrollFpTemplateData} 
                                            onChange={(e) => setEnrollFpTemplateData(e.target.value)} 
                                            required 
                                        />
                                    </Form.Group>
                                )}
                                
                                <Button type="submit" variant="primary" disabled={isLoading}>
                                    {isLoading ? 'Processing...' : 'Enroll Fingerprint'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="advanced" title="Advanced Operations">
                    <Row>
                        <Col md={6}>
                            <Card className="form-card">
                                <Card.Header>Update Firmware</Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleUpdateFirmware}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Device Serial Number</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={updateFirmwareSerialNumber} 
                                                onChange={(e) => setUpdateFirmwareSerialNumber(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Checksum</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={updateFirmwareChecksum} 
                                                onChange={(e) => setUpdateFirmwareChecksum(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>URL</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={updateFirmwareUrl} 
                                                onChange={(e) => setUpdateFirmwareUrl(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Size</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={updateFirmwareSize} 
                                                onChange={(e) => setUpdateFirmwareSize(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                        <Button type="submit" variant="primary" disabled={isLoading}>
                                            {isLoading ? 'Processing...' : 'Update Firmware'}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="form-card">
                                <Card.Header>Execute Shell Command</Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleExecuteShellCommand}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Device Serial Number</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={execShellSerialNumber} 
                                                onChange={(e) => setExecShellSerialNumber(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Command</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={execShellCommand} 
                                                onChange={(e) => setExecShellCommand(e.target.value)} 
                                                required 
                                            />
                                        </Form.Group>
                                        <Button type="submit" variant="primary" disabled={isLoading}>
                                            {isLoading ? 'Processing...' : 'Execute Command'}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>
        </div>
    );
};

export default DeviceManagementPage;