import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../ApiService';
import { Card, Form, Button, Alert } from 'react-bootstrap';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!token) {
            setError('Password reset token is missing.');
            return;
        }

        try {
            const response = await resetPassword(token);
            setGeneratedPassword(response.newPassword);
            setMessage('Password has been reset successfully. Please use the generated password to log in.');
            // Optionally, redirect to login after a delay
            // setTimeout(() => {
            //     navigate('/login');
            // }, 10000);
        } catch (err) {
            setError(err.response?.data || 'Failed to reset password.');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Card style={{ width: '24rem' }} className="shadow-sm">
                <Card.Body>
                    <h2 className="text-center mb-4">Reset Password</h2>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {generatedPassword ? (
                        <Alert variant="info">
                            Your new password is: <strong>{generatedPassword}</strong>
                            <p className="mt-2">Please use this to log in and change it in your profile settings.</p>
                        </Alert>
                    ) : (
                        <Form onSubmit={handleResetPassword}>
                            <p>Click the button below to reset your password. A new random password will be generated.</p>
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

export default ResetPasswordPage;
