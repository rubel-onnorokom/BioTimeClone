import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { getProfile, updateProfile, changePassword } from '../ApiService';

const ProfilePage = () => {
    const [username, setUsername] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            setUsername(response.username);
            setNewUsername(response.username);
        } catch (err) {
            setError('Failed to fetch profile.');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await updateProfile(newUsername);
            setUsername(newUsername);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data || 'Failed to update profile.');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmNewPassword) {
            setError('New password and confirmation do not match.');
            return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            setMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setError(err.response?.data || 'Failed to change password.');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '30rem' }} className="shadow-sm p-4">
                <Card.Body>
                    <h2 className="text-center mb-4">User Profile</h2>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <h4 className="mt-4">Update Username</h4>
                    <Form onSubmit={handleUpdateProfile}>
                        <Form.Group className="mb-3" controlId="formNewUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Update Username
                        </Button>
                    </Form>

                    <h4 className="mt-5">Change Password</h4>
                    <Form onSubmit={handleChangePassword}>
                        <Form.Group className="mb-3" controlId="formCurrentPassword">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formNewPassword">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formConfirmNewPassword">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                        </Form.Group>
                        <Button variant="danger" type="submit" className="w-100">
                            Change Password
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ProfilePage;
