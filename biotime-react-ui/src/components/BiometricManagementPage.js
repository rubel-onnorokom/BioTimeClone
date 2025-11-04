import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Alert, Table, Spinner, Tab, Tabs, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaExclamationTriangle, FaInfoCircle, FaFingerprint } from 'react-icons/fa';
import { getUserFingerprints, getUserFaceTemplates, getUserFingerVeinTemplates, getUserUnifiedTemplates, 
         createUserFingerprint, updateUserFingerprint, deleteUserFingerprint,
         createFaceTemplate, updateFaceTemplate, deleteFaceTemplate,
         createFingerVeinTemplate, updateFingerVeinTemplate, deleteFingerVeinTemplate,
         createUnifiedTemplate, updateUnifiedTemplate, deleteUnifiedTemplate } from '../ApiService';

const BiometricManagementPage = () => {
    const { pin } = useParams(); // Get user PIN from URL parameter

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [fingerprints, setFingerprints] = useState({});
    const [faceTemplates, setFaceTemplates] = useState({});
    const [fingerVeinTemplates, setFingerVeinTemplates] = useState({});
    const [unifiedTemplates, setUnifiedTemplates] = useState({});

    // State for modals
    const [showFingerprintModal, setShowFingerprintModal] = useState(false);
    const [showFaceTemplateModal, setShowFaceTemplateModal] = useState(false);
    const [showFingerVeinTemplateModal, setShowFingerVeinTemplateModal] = useState(false);
    const [showUnifiedTemplateModal, setShowUnifiedTemplateModal] = useState(false);
    
    // State for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleteType, setDeleteType] = useState('');
    
    // State for editing
    const [editingFingerprint, setEditingFingerprint] = useState(null);
    const [editingFaceTemplate, setEditingFaceTemplate] = useState(null);
    const [editingFingerVeinTemplate, setEditingFingerVeinTemplate] = useState(null);
    const [editingUnifiedTemplate, setEditingUnifiedTemplate] = useState(null);
    
    // State for form data
    const [fingerprintData, setFingerprintData] = useState({ fingerIndex: 0, size: 0, valid: 1, template: '' });
    const [faceTemplateData, setFaceTemplateData] = useState({ fid: 0, size: 0, valid: 1, template: '' });
    const [fingerVeinTemplateData, setFingerVeinTemplateData] = useState({ fid: 0, index: 0, size: 0, valid: 1, template: '' });
    const [unifiedTemplateData, setUnifiedTemplateData] = useState({ no: 0, index: 0, valid: 1, duress: 0, type: 0, majorVer: 0, minorVer: 0, format: 0, template: '' });

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
            let errorMessage = 'An error occurred';
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else {
                    errorMessage = error.response.data.toString();
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setMessage(`Error fetching biometric data: ${errorMessage}`);
            console.error('Biometric data fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fingerprint operations
    const handleCreateFingerprint = () => {
        setEditingFingerprint(null);
        setFingerprintData({ fingerIndex: 0, size: 0, valid: 1, template: '' });
        setShowFingerprintModal(true);
    };

    const handleSaveFingerprint = async () => {
        setIsLoading(true);
        try {
            if (editingFingerprint) {
                // Update existing fingerprint
                await updateUserFingerprint(editingFingerprint.id, fingerprintData);
                setMessage('Fingerprint template updated successfully!');
            } else {
                // Create new fingerprint
                await createUserFingerprint(pin, fingerprintData);
                setMessage('Fingerprint template created successfully!');
            }
            setShowFingerprintModal(false);
            // Refresh data
            const fpResponse = await getUserFingerprints(pin);
            setFingerprints(prev => ({ ...prev, [pin]: fpResponse.data }));
        } catch (error) {
            let errorMessage = 'An error occurred';
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else {
                    errorMessage = error.response.data.toString();
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setMessage(`Error saving fingerprint: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditFingerprint = (fingerprint) => {
        setEditingFingerprint(fingerprint);
        setFingerprintData({
            fingerIndex: fingerprint.fingerIndex,
            size: fingerprint.size,
            valid: fingerprint.valid,
            template: fingerprint.template
        });
        setShowFingerprintModal(true);
    };

    const handleDeleteFingerprint = (fingerprint) => {
        if (!fingerprint.id) {
            setMessage(`Error: Cannot delete fingerprint without ID`);
            return;
        }
        setDeleteItem(fingerprint);
        setDeleteType('fingerprint');
        setShowDeleteModal(true);
    };

    // Face Template operations
    const handleCreateFaceTemplate = () => {
        setEditingFaceTemplate(null);
        setFaceTemplateData({ fid: 0, size: 0, valid: 1, template: '' });
        setShowFaceTemplateModal(true);
    };

    const handleSaveFaceTemplate = async () => {
        setIsLoading(true);
        try {
            if (editingFaceTemplate) {
                // Update existing face template
                await updateFaceTemplate(editingFaceTemplate.id, faceTemplateData);
                setMessage('Face template updated successfully!');
            } else {
                // Create new face template
                await createFaceTemplate(pin, faceTemplateData);
                setMessage('Face template created successfully!');
            }
            setShowFaceTemplateModal(false);
            // Refresh data
            const ftResponse = await getUserFaceTemplates(pin);
            setFaceTemplates(prev => ({ ...prev, [pin]: ftResponse.data }));
        } catch (error) {
            let errorMessage = 'An error occurred';
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else {
                    errorMessage = error.response.data.toString();
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setMessage(`Error saving face template: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditFaceTemplate = (template) => {
        setEditingFaceTemplate(template);
        setFaceTemplateData({
            fid: template.fid,
            size: template.size,
            valid: template.valid,
            template: template.template
        });
        setShowFaceTemplateModal(true);
    };

    const handleDeleteFaceTemplate = (template) => {
        if (!template.id) {
            setMessage(`Error: Cannot delete face template without ID`);
            return;
        }
        setDeleteItem(template);
        setDeleteType('face');
        setShowDeleteModal(true);
    };

    // Finger Vein Template operations
    const handleCreateFingerVeinTemplate = () => {
        setEditingFingerVeinTemplate(null);
        setFingerVeinTemplateData({ fid: 0, index: 0, size: 0, valid: 1, template: '' });
        setShowFingerVeinTemplateModal(true);
    };

    const handleSaveFingerVeinTemplate = async () => {
        setIsLoading(true);
        try {
            if (editingFingerVeinTemplate) {
                // Update existing finger vein template
                await updateFingerVeinTemplate(editingFingerVeinTemplate.id, fingerVeinTemplateData);
                setMessage('Finger vein template updated successfully!');
            } else {
                // Create new finger vein template
                await createFingerVeinTemplate(pin, fingerVeinTemplateData);
                setMessage('Finger vein template created successfully!');
            }
            setShowFingerVeinTemplateModal(false);
            // Refresh data
            const fvtResponse = await getUserFingerVeinTemplates(pin);
            setFingerVeinTemplates(prev => ({ ...prev, [pin]: fvtResponse.data }));
        } catch (error) {
            let errorMessage = 'An error occurred';
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else {
                    errorMessage = error.response.data.toString();
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setMessage(`Error saving finger vein template: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditFingerVeinTemplate = (template) => {
        setEditingFingerVeinTemplate(template);
        setFingerVeinTemplateData({
            fid: template.fid,
            index: template.index,
            size: template.size,
            valid: template.valid,
            template: template.template
        });
        setShowFingerVeinTemplateModal(true);
    };

    const handleDeleteFingerVeinTemplate = (template) => {
        if (!template.id) {
            setMessage(`Error: Cannot delete finger vein template without ID`);
            return;
        }
        setDeleteItem(template);
        setDeleteType('fingerVein');
        setShowDeleteModal(true);
    };

    // Unified Template operations
    const handleCreateUnifiedTemplate = () => {
        setEditingUnifiedTemplate(null);
        setUnifiedTemplateData({ no: 0, index: 0, valid: 1, duress: 0, type: 0, majorVer: 0, minorVer: 0, format: 0, template: '' });
        setShowUnifiedTemplateModal(true);
    };

    const handleSaveUnifiedTemplate = async () => {
        setIsLoading(true);
        try {
            if (editingUnifiedTemplate) {
                // Update existing unified template
                await updateUnifiedTemplate(editingUnifiedTemplate.id, unifiedTemplateData);
                setMessage('Unified template updated successfully!');
            } else {
                // Create new unified template
                await createUnifiedTemplate(pin, unifiedTemplateData);
                setMessage('Unified template created successfully!');
            }
            setShowUnifiedTemplateModal(false);
            // Refresh data
            const utResponse = await getUserUnifiedTemplates(pin);
            setUnifiedTemplates(prev => ({ ...prev, [pin]: utResponse.data }));
        } catch (error) {
            let errorMessage = 'An error occurred';
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else {
                    errorMessage = error.response.data.toString();
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setMessage(`Error saving unified template: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditUnifiedTemplate = (template) => {
        setEditingUnifiedTemplate(template);
        setUnifiedTemplateData({
            no: template.no,
            index: template.index,
            valid: template.valid,
            duress: template.duress,
            type: template.type,
            majorVer: template.majorVer,
            minorVer: template.minorVer,
            format: template.format,
            template: template.template
        });
        setShowUnifiedTemplateModal(true);
    };

    const handleDeleteUnifiedTemplate = (template) => {
        if (!template.id) {
            setMessage(`Error: Cannot delete unified template without ID`);
            return;
        }
        setDeleteItem(template);
        setDeleteType('unified');
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteItem || !deleteType) return;
        
        setIsLoading(true);
        setShowDeleteModal(false);
        
        try {
            switch (deleteType) {
                case 'fingerprint':
                    await deleteUserFingerprint(deleteItem.id);
                    setMessage('Fingerprint template deleted successfully!');
                    // Refresh data
                    const fpResponse = await getUserFingerprints(pin);
                    setFingerprints(prev => ({ ...prev, [pin]: fpResponse.data }));
                    break;
                case 'face':
                    await deleteFaceTemplate(deleteItem.id);
                    setMessage('Face template deleted successfully!');
                    // Refresh data
                    const ftResponse = await getUserFaceTemplates(pin);
                    setFaceTemplates(prev => ({ ...prev, [pin]: ftResponse.data }));
                    break;
                case 'fingerVein':
                    await deleteFingerVeinTemplate(deleteItem.id);
                    setMessage('Finger vein template deleted successfully!');
                    // Refresh data
                    const fvtResponse = await getUserFingerVeinTemplates(pin);
                    setFingerVeinTemplates(prev => ({ ...prev, [pin]: fvtResponse.data }));
                    break;
                case 'unified':
                    await deleteUnifiedTemplate(deleteItem.id);
                    setMessage('Unified template deleted successfully!');
                    // Refresh data
                    const utResponse = await getUserUnifiedTemplates(pin);
                    setUnifiedTemplates(prev => ({ ...prev, [pin]: utResponse.data }));
                    break;
                default:
                    break;
            }
        } catch (error) {
            let errorMessage = 'An error occurred';
            if (error.response && error.response.data) {
                // Handle different response formats
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else {
                    // For general error object, try to get the message
                    errorMessage = error.response.data.toString();
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setMessage(`Error deleting ${deleteType} template: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle hardware fingerprint registration using FetchFingerprint
    const handleHardwareFingerprintRegistration = async () => {
        // Check if required dependencies are available
        if (typeof window.$ === 'undefined') {
            setMessage('jQuery is required but not loaded properly.');
            return;
        }
        
        if (typeof window.FetchFingerprint === 'undefined') {
            setMessage('FetchFingerprint function is not available. Please ensure FPRegister.js is loaded properly.');
            return;
        }
        
        // FIRST: Ensure that the hidden input fields exist in the DOM
        // This is required for the FPRegister.js functions to work properly
        let templatesInput = document.getElementById('id_templates');
        if (!templatesInput) {
            templatesInput = document.createElement('input');
            templatesInput.type = 'hidden';
            templatesInput.id = 'id_templates';
            templatesInput.name = 'templates';
            templatesInput.autocomplete = 'off';
            templatesInput.setAttribute('lay-verify', 'templates');
            templatesInput.className = 'layui-input';
            templatesInput.value = "[]"; // Initialize with empty array
            document.body.appendChild(templatesInput);
        } else {
            // If it exists, make sure it has a default value
            templatesInput.value = "[]";
        }
        
        let delFpsInput = document.getElementById('id_del_fps');
        if (!delFpsInput) {
            delFpsInput = document.createElement('input');
            delFpsInput.type = 'hidden';
            delFpsInput.id = 'id_del_fps';
            delFpsInput.name = 'delFps';
            delFpsInput.value = "";
            document.body.appendChild(delFpsInput);
        } else {
            delFpsInput.value = "";
        }
        
        let durFpsInput = document.getElementById('id_dur_fps');
        if (!durFpsInput) {
            durFpsInput = document.createElement('input');
            durFpsInput.type = 'hidden';
            durFpsInput.id = 'id_dur_fps';
            durFpsInput.name = 'durFps';
            durFpsInput.value = "[]";
            document.body.appendChild(durFpsInput);
        } else {
            durFpsInput.value = "[]";
        }
        
        let fpTypeInput = document.getElementById('id_fp_type');
        if (!fpTypeInput) {
            fpTypeInput = document.createElement('input');
            fpTypeInput.type = 'hidden';
            fpTypeInput.id = 'id_fp_type';
            fpTypeInput.name = 'fpType';
            fpTypeInput.value = "";
            document.body.appendChild(fpTypeInput);
        } else {
            fpTypeInput.value = "";
        }
        
        // Make sure the id_fps input exists too if it's needed
        let fpsInput = document.getElementById('id_fps');
        if (!fpsInput) {
            fpsInput = document.createElement('input');
            fpsInput.type = 'hidden';
            fpsInput.id = 'id_fps';
            fpsInput.name = 'fps';
            fpsInput.value = "";
            document.body.appendChild(fpsInput);
        } else {
            fpsInput.value = "";
        }

        let pinInput = document.getElementById('user_pin');
        if (!pinInput) {
            pinInput = document.createElement('input');
            pinInput.type = 'hidden';
            pinInput.id = 'user_pin';
            pinInput.name = 'pin';
            pinInput.value = "";
            document.body.appendChild(pinInput);
        } else {
            pinInput.value = "";
        }
        
        // NOW call the existing FetchFingerprint function with the user's pin
        // This function will fetch existing fingerprints from the backend 
        // and populate the id_templates field in the required format
        window.FetchFingerprint(pin);
    };

    const handleHardwareFaceRegistration = async () => {
        // Check if required dependencies are available
        if (typeof window.$ === 'undefined') {
            setMessage('jQuery is required but not loaded properly.');
            return;
        }
        
        if (typeof window.submitFaceRegister === 'undefined') {
            setMessage('submitFaceRegister function is not available. Please ensure faceCapture.js is loaded properly.');
            return;
        }
        
        let faceInput = document.getElementById('id_face');
        if (!faceInput) {
            faceInput = document.createElement('input');
            faceInput.type = 'hidden';
            faceInput.id = 'id_face';
            faceInput.name = 'face';
            faceInput.value = "";
            document.body.appendChild(faceInput);
        } else {
            faceInput.value = "";
        }

        let faceCountInput = document.getElementById('id_faceCount');
        if (!faceCountInput) {
            faceCountInput = document.createElement('input');
            faceCountInput.type = 'hidden';
            faceCountInput.id = 'id_faceCount';
            faceCountInput.name = 'faceCount';
            faceCountInput.value = "";
            document.body.appendChild(faceCountInput);
        } else {
            faceCountInput.value = "";
        }
        
        
        // NOW call the existing FetchFingerprint function with the user's pin
        // This function will fetch existing fingerprints from the backend 
        // and populate the id_templates field in the required format
        window.submitFaceRegister();
    };


    const handleHardwarePalmRegistration = async () => {
        // Check if required dependencies are available
        if (typeof window.$ === 'undefined') {
            setMessage('jQuery is required but not loaded properly.');
            return;
        }
        
        if (typeof window.submitFaceRegister === 'undefined') {
            setMessage('submitFaceRegister function is not available. Please ensure faceCapture.js is loaded properly.');
            return;
        }
        
        let palmInput = document.getElementById('id_palms');
        if (!palmInput) {
            palmInput = document.createElement('input');
            palmInput.type = 'hidden';
            palmInput.id = 'id_palms';
            palmInput.name = 'palms';
            palmInput.value = "";
            document.body.appendChild(palmInput);
        } else {
            palmInput.value = "";
        }

        let palmHelpInput = document.getElementById('id_palm_help');
        if (!palmHelpInput) {
            palmHelpInput = document.createElement('input');
            palmHelpInput.type = 'hidden';
            palmHelpInput.id = 'id_palm_help';
            palmHelpInput.name = 'palmhelp';
            palmHelpInput.value = "";
            document.body.appendChild(palmHelpInput);
        } else {
            palmHelpInput.value = "";
        }

        let palmLngInput = document.getElementById('id_lng');
        if (!palmLngInput) {
            palmLngInput = document.createElement('input');
            palmLngInput.type = 'hidden';
            palmLngInput.id = 'id_lng';
            palmLngInput.name = 'palmlng';
            palmLngInput.value = "";
            document.body.appendChild(palmLngInput);
        } else {
            palmLngInput.value = "";
        }
        
        // NOW call the existing FetchFingerprint function with the user's pin
        // This function will fetch existing fingerprints from the backend 
        // and populate the id_templates field in the required format
        window.checkPalmDriver(false);
        window.submitPalmRegister();
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
                {/* Fingerprints Tab */}
                <Tab eventKey="fingerprints" title="Fingerprints">
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            Fingerprints
                            <div className="d-flex gap-2">
                                <Button variant="primary" size="sm" onClick={handleCreateFingerprint}>
                                    Add Fingerprint
                                </Button>
                                <Button 
                                    variant="success" 
                                    size="sm" 
                                    onClick={handleHardwareFingerprintRegistration}
                                    className="d-flex align-items-center"
                                >
                                    <FaFingerprint className="me-1" /> Enroll
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Finger Index</th>
                                            <th>Size</th>
                                            <th>Valid</th>
                                            <th>Template Preview</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fingerprints[pin] && fingerprints[pin].length > 0 ? (
                                            fingerprints[pin].map((fp, index) => (
                                                <tr key={fp.id || index}>
                                                    <td>{fp.id}</td>
                                                    <td>{fp.fingerIndex}</td>
                                                    <td>{fp.size}</td>
                                                    <td>{fp.valid ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        {fp.template ? `${fp.template.substring(0, 50)}...` : 'No template'}
                                                    </td>
                                                    <td>
                                                        <Button 
                                                            variant="warning" 
                                                            size="sm" 
                                                            className="me-2"
                                                            onClick={() => handleEditFingerprint(fp)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm"
                                                            onClick={() => handleDeleteFingerprint(fp)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">No fingerprints found for this user.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>

                {/* Face Templates Tab */}
                <Tab eventKey="face" title="Face Templates">
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            Face Templates
                            <div className="d-flex gap-2">
                                <Button variant="primary" size="sm" onClick={handleCreateFaceTemplate}>
                                    Add Face Template
                                </Button>
                                <Button 
                                    variant="success" 
                                    size="sm" 
                                    onClick={handleHardwareFaceRegistration}
                                    className="d-flex align-items-center"
                                >
                                    <FaFingerprint className="me-1" /> Enroll
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>FID</th>
                                            <th>Size</th>
                                            <th>Valid</th>
                                            <th>Template Preview</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {faceTemplates[pin] && faceTemplates[pin].length > 0 ? (
                                            faceTemplates[pin].map((ft, index) => (
                                                <tr key={ft.id || index}>
                                                    <td>{ft.id}</td>
                                                    <td>{ft.fid}</td>
                                                    <td>{ft.size}</td>
                                                    <td>{ft.valid ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        {ft.template ? `${ft.template.substring(0, 50)}...` : 'No template'}
                                                    </td>
                                                    <td>
                                                        <Button 
                                                            variant="warning" 
                                                            size="sm" 
                                                            className="me-2"
                                                            onClick={() => handleEditFaceTemplate(ft)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm"
                                                            onClick={() => handleDeleteFaceTemplate(ft)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">No face templates found for this user.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>

                {/* Finger Vein Templates Tab */}
                <Tab eventKey="fingerVein" title="Finger Vein Templates">
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            Finger Vein Templates
                            <Button variant="primary" size="sm" onClick={handleCreateFingerVeinTemplate}>
                                Add Finger Vein Template
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>FID</th>
                                            <th>Index</th>
                                            <th>Size</th>
                                            <th>Valid</th>
                                            <th>Template Preview</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fingerVeinTemplates[pin] && fingerVeinTemplates[pin].length > 0 ? (
                                            fingerVeinTemplates[pin].map((fvt, index) => (
                                                <tr key={fvt.id || index}>
                                                    <td>{fvt.id}</td>
                                                    <td>{fvt.fid}</td>
                                                    <td>{fvt.index}</td>
                                                    <td>{fvt.size}</td>
                                                    <td>{fvt.valid ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        {fvt.template ? `${fvt.template.substring(0, 50)}...` : 'No template'}
                                                    </td>
                                                    <td>
                                                        <Button 
                                                            variant="warning" 
                                                            size="sm" 
                                                            className="me-2"
                                                            onClick={() => handleEditFingerVeinTemplate(fvt)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm"
                                                            onClick={() => handleDeleteFingerVeinTemplate(fvt)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No finger vein templates found for this user.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>

                {/* Unified Templates Tab */}
                <Tab eventKey="unified" title="Unified Templates">
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            Unified Templates
                            <div className="d-flex gap-2">
                                <Button variant="primary" size="sm" onClick={handleCreateUnifiedTemplate}>
                                    Add Unified Template
                                </Button>
                                <Button 
                                    variant="success" 
                                    size="sm" 
                                    onClick={handleHardwarePalmRegistration}
                                    className="d-flex align-items-center"
                                >
                                    <FaFingerprint className="me-1" /> Enroll
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>No</th>
                                            <th>Index</th>
                                            <th>Valid</th>
                                            <th>Duress</th>
                                            <th>Type</th>
                                            <th>Template Preview</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unifiedTemplates[pin] && unifiedTemplates[pin].length > 0 ? (
                                            unifiedTemplates[pin].map((ut, index) => (
                                                <tr key={ut.id || index}>
                                                    <td>{ut.id}</td>
                                                    <td>{ut.no}</td>
                                                    <td>{ut.index}</td>
                                                    <td>{ut.valid ? 'Yes' : 'No'}</td>
                                                    <td>{ut.duress}</td>
                                                    <td>{ut.type}</td>
                                                    <td>
                                                        {ut.template ? `${ut.template.substring(0, 50)}...` : 'No template'}
                                                    </td>
                                                    <td>
                                                        <Button 
                                                            variant="warning" 
                                                            size="sm" 
                                                            className="me-2"
                                                            onClick={() => handleEditUnifiedTemplate(ut)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm"
                                                            onClick={() => handleDeleteUnifiedTemplate(ut)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center">No unified templates found for this user.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            {/* Fingerprint Modal */}
            <Modal show={showFingerprintModal} onHide={() => setShowFingerprintModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingFingerprint ? 'Edit Fingerprint' : 'Add Fingerprint'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Finger Index</Form.Label>
                            <Form.Control
                                type="number"
                                value={fingerprintData.fingerIndex}
                                onChange={(e) => setFingerprintData({...fingerprintData, fingerIndex: parseInt(e.target.value, 10)})}
                                min="0"
                                max="9"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Size</Form.Label>
                            <Form.Control
                                type="number"
                                value={fingerprintData.size}
                                onChange={(e) => setFingerprintData({...fingerprintData, size: parseInt(e.target.value, 10)})}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Valid</Form.Label>
                            <Form.Select
                                value={fingerprintData.valid}
                                onChange={(e) => setFingerprintData({...fingerprintData, valid: parseInt(e.target.value, 10)})}
                            >
                                <option value={1}>Valid</option>
                                <option value={0}>Invalid</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Template Data</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={fingerprintData.template}
                                onChange={(e) => setFingerprintData({...fingerprintData, template: e.target.value})}
                                placeholder="Enter fingerprint template data"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFingerprintModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveFingerprint}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Face Template Modal */}
            <Modal show={showFaceTemplateModal} onHide={() => setShowFaceTemplateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingFaceTemplate ? 'Edit Face Template' : 'Add Face Template'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>FID</Form.Label>
                            <Form.Control
                                type="number"
                                value={faceTemplateData.fid}
                                onChange={(e) => setFaceTemplateData({...faceTemplateData, fid: parseInt(e.target.value, 10)})}
                                min="0"
                                max="9"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Size</Form.Label>
                            <Form.Control
                                type="number"
                                value={faceTemplateData.size}
                                onChange={(e) => setFaceTemplateData({...faceTemplateData, size: parseInt(e.target.value, 10)})}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Valid</Form.Label>
                            <Form.Select
                                value={faceTemplateData.valid}
                                onChange={(e) => setFaceTemplateData({...faceTemplateData, valid: parseInt(e.target.value, 10)})}
                            >
                                <option value={1}>Valid</option>
                                <option value={0}>Invalid</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Template Data</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={faceTemplateData.template}
                                onChange={(e) => setFaceTemplateData({...faceTemplateData, template: e.target.value})}
                                placeholder="Enter face template data"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFaceTemplateModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveFaceTemplate}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Finger Vein Template Modal */}
            <Modal show={showFingerVeinTemplateModal} onHide={() => setShowFingerVeinTemplateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingFingerVeinTemplate ? 'Edit Finger Vein Template' : 'Add Finger Vein Template'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>FID</Form.Label>
                            <Form.Control
                                type="number"
                                value={fingerVeinTemplateData.fid}
                                onChange={(e) => setFingerVeinTemplateData({...fingerVeinTemplateData, fid: parseInt(e.target.value, 10)})}
                                min="0"
                                max="9"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Index</Form.Label>
                            <Form.Control
                                type="number"
                                value={fingerVeinTemplateData.index}
                                onChange={(e) => setFingerVeinTemplateData({...fingerVeinTemplateData, index: parseInt(e.target.value, 10)})}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Size</Form.Label>
                            <Form.Control
                                type="number"
                                value={fingerVeinTemplateData.size}
                                onChange={(e) => setFingerVeinTemplateData({...fingerVeinTemplateData, size: parseInt(e.target.value, 10)})}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Valid</Form.Label>
                            <Form.Select
                                value={fingerVeinTemplateData.valid}
                                onChange={(e) => setFingerVeinTemplateData({...fingerVeinTemplateData, valid: parseInt(e.target.value, 10)})}
                            >
                                <option value={1}>Valid</option>
                                <option value={0}>Invalid</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Template Data</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={fingerVeinTemplateData.template}
                                onChange={(e) => setFingerVeinTemplateData({...fingerVeinTemplateData, template: e.target.value})}
                                placeholder="Enter finger vein template data"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFingerVeinTemplateModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveFingerVeinTemplate}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Unified Template Modal */}
            <Modal show={showUnifiedTemplateModal} onHide={() => setShowUnifiedTemplateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingUnifiedTemplate ? 'Edit Unified Template' : 'Add Unified Template'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>No</Form.Label>
                            <Form.Control
                                type="number"
                                value={unifiedTemplateData.no}
                                onChange={(e) => setUnifiedTemplateData({...unifiedTemplateData, no: parseInt(e.target.value, 10)})}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Index</Form.Label>
                            <Form.Control
                                type="number"
                                value={unifiedTemplateData.index}
                                onChange={(e) => setUnifiedTemplateData({...unifiedTemplateData, index: parseInt(e.target.value, 10)})}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Valid</Form.Label>
                            <Form.Select
                                value={unifiedTemplateData.valid}
                                onChange={(e) => setUnifiedTemplateData({...unifiedTemplateData, valid: parseInt(e.target.value, 10)})}
                            >
                                <option value={1}>Valid</option>
                                <option value={0}>Invalid</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Duress</Form.Label>
                            <Form.Select
                                value={unifiedTemplateData.duress}
                                onChange={(e) => setUnifiedTemplateData({...unifiedTemplateData, duress: parseInt(e.target.value, 10)})}
                            >
                                <option value={0}>Normal</option>
                                <option value={1}>Duress</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Control
                                type="number"
                                value={unifiedTemplateData.type}
                                onChange={(e) => setUnifiedTemplateData({...unifiedTemplateData, type: parseInt(e.target.value, 10)})}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Major Version</Form.Label>
                            <Form.Control
                                type="number"
                                value={unifiedTemplateData.majorVer}
                                onChange={(e) => setUnifiedTemplateData({...unifiedTemplateData, majorVer: parseInt(e.target.value, 10)})}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Minor Version</Form.Label>
                            <Form.Control
                                type="number"
                                value={unifiedTemplateData.minorVer}
                                onChange={(e) => setUnifiedTemplateData({...unifiedTemplateData, minorVer: parseInt(e.target.value, 10)})}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Format</Form.Label>
                            <Form.Control
                                type="number"
                                value={unifiedTemplateData.format}
                                onChange={(e) => setUnifiedTemplateData({...unifiedTemplateData, format: parseInt(e.target.value, 10)})}
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Template Data</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={unifiedTemplateData.template}
                                onChange={(e) => setUnifiedTemplateData({...unifiedTemplateData, template: e.target.value})}
                                placeholder="Enter unified template data"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUnifiedTemplateModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveUnifiedTemplate}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="text-danger">
                        <FaExclamationTriangle className="me-2" />
                        Confirm Deletion
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <div className="mb-4">
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                            <FaTrash className="text-danger" style={{ fontSize: '2rem' }} />
                        </div>
                    </div>
                    <h5 className="mb-3">Are you sure you want to delete this {deleteType} template?</h5>
                    <p className="text-muted mb-4">
                        {deleteType === 'fingerprint' && `Finger Index: ${deleteItem?.fingerIndex}`}
                        {deleteType === 'face' && `FID: ${deleteItem?.fid}`}
                        {deleteType === 'fingerVein' && `FID: ${deleteItem?.fid}, Index: ${deleteItem?.index}`}
                        {deleteType === 'unified' && `No: ${deleteItem?.no}, Index: ${deleteItem?.index}`}
                        <br />
                        <small className="text-muted">This action cannot be undone.</small>
                    </p>
                    <div className="alert alert-warning d-inline-block text-start">
                        <FaInfoCircle className="me-2" />
                        This will also remove the template from all associated devices.
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 justify-content-center gap-2">
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4"
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={confirmDelete}
                        className="px-4"
                    >
                        <FaTrash className="me-2" />
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default BiometricManagementPage;