import React, { useState, useEffect } from 'react';
import { getAreas, createArea, updateArea, deleteArea } from '../ApiService';
import { Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';

const AreaPage = () => {
    const [areas, setAreas] = useState([]);
    const [areaName, setAreaName] = useState('');
    const [editingArea, setEditingArea] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        setIsLoading(true);
        try {
            const response = await getAreas();
            setAreas(response.data);
        } catch (error) {
            setMessage(`Error fetching areas: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateArea = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createArea({ name: areaName });
            setMessage('Area created successfully!');
            setAreaName('');
            fetchAreas();
        } catch (error) {
            setMessage(`Error creating area: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (area) => {
        setEditingArea(area);
        setAreaName(area.name);
    };

    const handleUpdateArea = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateArea(editingArea.id, { id: editingArea.id, name: areaName });
            setMessage('Area updated successfully!');
            setEditingArea(null);
            setAreaName('');
            fetchAreas();
        } catch (error) {
            setMessage(`Error updating area: ${error.response ? error.response.data : error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteArea = async (id) => {
        if (window.confirm('Are you sure you want to delete this area?')) {
            setIsLoading(true);
            try {
                await deleteArea(id);
                setMessage('Area deleted successfully!');
                fetchAreas();
            } catch (error) {
                setMessage(`Error deleting area: ${error.response ? error.response.data : error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div>
            <h2 className="page-title">Area Management</h2>

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
                            {editingArea ? 'Edit Area' : 'Create New Area'}
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={editingArea ? handleUpdateArea : handleCreateArea}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Area Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter area name"
                                        value={areaName}
                                        onChange={(e) => setAreaName(e.target.value)}
                                        required
                                        disabled={isLoading && !!editingArea}
                                    />
                                </Form.Group>
                                
                                <div className="d-flex gap-2">
                                    <Button 
                                        variant={editingArea ? "success" : "primary"} 
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Processing...' : (editingArea ? 'Update Area' : 'Create Area')}
                                    </Button>
                                    
                                    {editingArea && (
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => {
                                                setEditingArea(null);
                                                setAreaName('');
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
                        <Card.Header>Existing Areas</Card.Header>
                        <Card.Body>
                            {isLoading && areas.length === 0 ? (
                                <p>Loading areas...</p>
                            ) : areas.length === 0 ? (
                                <p className="text-muted">No areas found.</p>
                            ) : (
                                <div className="list-group">
                                    {areas.map((area) => (
                                        <div key={area.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-0">{area.name}</h6>
                                                <small className="text-muted">ID: {area.id}</small>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="warning" 
                                                    size="sm"
                                                    onClick={() => handleEditClick(area)}
                                                    disabled={isLoading}
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    size="sm"
                                                    onClick={() => handleDeleteArea(area.id)}
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
        </div>
    );
};

export default AreaPage;