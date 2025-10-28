import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

const DeviceDetailsModal = ({ device, show, onHide }) => {
    if (!device) {
        return null;
    }

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Device Details: {device.name || device.serialNumber}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table striped bordered hover>
                    <tbody>
                        <tr>
                            <td>Serial Number</td>
                            <td>{device.serialNumber}</td>
                        </tr>
                        <tr>
                            <td>Device Name</td>
                            <td>{device.name}</td>
                        </tr>
                        <tr>
                            <td>IP Address</td>
                            <td>{device.ipAddress}</td>
                        </tr>
                        <tr>
                            <td>Firmware Version</td>
                            <td>{device.firmwareVersion}</td>
                        </tr>
                        <tr>
                            <td>User Count</td>
                            <td>{device.userCount}</td>
                        </tr>
                        <tr>
                            <td>Admin Count</td>
                            <td>{device.adminCount}</td>
                        </tr>
                        <tr>
                            <td>Fingerprint Count</td>
                            <td>{device.fingerprintCount}</td>
                        </tr>
                        <tr>
                            <td>Face Count</td>
                            <td>{device.faceCount}</td>
                        </tr>
                        <tr>
                            <td>Attendance Record Count</td>
                            <td>{device.attendanceRecordCount}</td>
                        </tr>
                        <tr>
                            <td>Fingerprint Algorithm Version</td>
                            <td>{device.fingerprintAlgorithmVersion}</td>
                        </tr>
                        <tr>
                            <td>Face Algorithm Version</td>
                            <td>{device.faceAlgorithmVersion}</td>
                        </tr>
                        <tr>
                            <td>Required Face Count</td>
                            <td>{device.requiredFaceCount}</td>
                        </tr>
                        <tr>
                            <td>Supported Functions</td>
                            <td>{device.supportedFunctions}</td>
                        </tr>
                        <tr>
                            <td>Language</td>
                            <td>{device.language}</td>
                        </tr>
                        <tr>
                            <td>Push Version</td>
                            <td>{device.pushVersion}</td>
                        </tr>
                        <tr>
                            <td>Push Options Flag</td>
                            <td>{device.pushOptionsFlag}</td>
                        </tr>
                        <tr>
                            <td>Last Seen</td>
                            <td>{new Date(device.lastSeen).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeviceDetailsModal;
