import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Alert, Table, Spinner, Tab, Tabs } from 'react-bootstrap';
import { getUserFingerprints, getUserFaceTemplates, getUserFingerVeinTemplates, getUserUnifiedTemplates } from '../ApiService';

const BiometricManagementPage = () => {
    const { pin } = useParams(); // Get user PIN from URL parameter

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [fingerprints, setFingerprints] = useState({});
    const [faceTemplates, setFaceTemplates] = useState({});
    const [fingerVeinTemplates, setFingerVeinTemplates] = useState({});
    const [unifiedTemplates, setUnifiedTemplates] = useState({});

    useEffect(() => {
        if (pin) {
            fetchAllBiometricData(pin);
        }
    }, [pin]);

    const fetchAllBiometricData = async (userPin) => {
        setIsLoading(true);
        try {
            // Fetch Fingerprints
            const fpResponse = await getUserFingerprints(userPin);
            setFingerprints(prev => ({ ...prev, [userPin]: fpResponse.data }));

            // Fetch Face Templates
            const ftResponse = await getUserFaceTemplates(userPin);
            setFaceTemplates(prev => ({ ...prev, [userPin]: ftResponse.data }));

            // Fetch Finger Vein Templates
            const fvtResponse = await getUserFingerVeinTemplates(userPin);
            setFingerVeinTemplates(prev => ({ ...prev, [userPin]: fvtResponse.data }));

            // Fetch Unified Templates
            const utResponse = await getUserUnifiedTemplates(userPin);
            setUnifiedTemplates(prev => ({ ...prev, [userPin]: utResponse.data }));

            setMessage('All biometric data fetched successfully!');
        } catch (error) {
            setMessage(`Error fetching biometric data: ${error.response ? error.response.data : error.message}`);
            console.error('Biometric data fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div>
            <h2 className="page-title">Biometric Management for User: {pin}</h2>

            {message && (
                <Alert 
                    variant={message.includes('Error') ? 'danger' : 'success'} 
                    onClose={() => setMessage('')} 
                    dismissible
                >
                    {message}
                </Alert>
            )}

            <Tabs defaultActiveKey="fingerprints" id="biometric-tabs" className="mb-3">
                <Tab eventKey="fingerprints" title="Fingerprints">
                    <Card>
                        <Card.Header>Fingerprints</Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Finger Index</th>
                                            <th>Size</th>
                                            <th>Valid</th>
                                            <th>Template Preview</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fingerprints[pin] && fingerprints[pin].length > 0 ? (
                                            fingerprints[pin].map((fp, index) => (
                                                <tr key={index}>
                                                    <td>{fp.fingerIndex}</td>
                                                    <td>{fp.size}</td>
                                                    <td>{fp.valid ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        {fp.template ? `${fp.template.substring(0, 50)}...` : 'No template'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No fingerprints found for this user.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="face" title="Face Templates">
                    <Card>
                        <Card.Header>Face Templates</Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Face ID</th>
                                            <th>Size</th>
                                            <th>Valid</th>
                                            <th>Template Preview</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {faceTemplates[pin] && faceTemplates[pin].length > 0 ? (
                                            faceTemplates[pin].map((ft, index) => (
                                                <tr key={index}>
                                                    <td>{ft.faceId}</td>
                                                    <td>{ft.size}</td>
                                                    <td>{ft.valid ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        {ft.template ? `${ft.template.substring(0, 50)}...` : 'No template'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No face templates found for this user.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="fingerVein" title="Finger Vein Templates">
                    <Card>
                        <Card.Header>Finger Vein Templates</Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Finger Index</th>
                                            <th>Size</th>
                                            <th>Valid</th>
                                            <th>Template Preview</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fingerVeinTemplates[pin] && fingerVeinTemplates[pin].length > 0 ? (
                                            fingerVeinTemplates[pin].map((fvt, index) => (
                                                <tr key={index}>
                                                    <td>{fvt.fingerIndex}</td>
                                                    <td>{fvt.size}</td>
                                                    <td>{fvt.valid ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        {fvt.template ? `${fvt.template.substring(0, 50)}...` : 'No template'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No finger vein templates found for this user.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="unified" title="Unified Templates">
                    <Card>
                        <Card.Header>Unified Templates</Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Template Type</th>
                                            <th>Size</th>
                                            <th>Valid</th>
                                            <th>Template Preview</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unifiedTemplates[pin] && unifiedTemplates[pin].length > 0 ? (
                                            unifiedTemplates[pin].map((ut, index) => (
                                                <tr key={index}>
                                                    <td>{ut.templateType}</td>
                                                    <td>{ut.size}</td>
                                                    <td>{ut.valid ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        {ut.template ? `${ut.template.substring(0, 50)}...` : 'No template'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No unified templates found for this user.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
};

export default BiometricManagementPage;