import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../ApiService';
import { Card, Form, Button, Alert } from 'react-bootstrap';

const ForgotPasswordPage = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setGeneratedPassword('');
        try {
            const response = await forgotPassword(username);
            if (response.newPassword) {
                setGeneratedPassword(response.newPassword);
                setMessage('A new password has been generated. Please use this to log in.');
            } else {
                setMessage(response.message || 'If an account with that username exists, a new password has been generated.');
            }
        } catch (err) {
            setError(err.response?.data || 'Failed to send password reset request.');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Card style={{ width: '24rem' }} className="shadow-sm">
                <Card.Body>
                    <h2 className="text-center mb-4">Forgot Password</h2>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {generatedPassword ? (
                        <Alert variant="info">
                            Your new password is: <strong>{generatedPassword}</strong>
                            <p className="mt-2">Please use this to log in and change it in your profile settings.</p>
                        </Alert>
                    ) : (
                        <Form onSubmit={handleForgotPassword}>
                            <Form.Group className="mb-3" controlId="formUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100">
                                Generate New Password
                            </Button>
                        </Form>
                    )}
                    <div className="text-center mt-3">
                        <Link to="/login">Back to Login</Link>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
