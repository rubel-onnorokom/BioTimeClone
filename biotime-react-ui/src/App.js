import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { FaFingerprint, FaUsers, FaMicrochip, FaTools, FaHome, FaCog, FaChartBar } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import AreaPage from './components/AreaPage';
import UserPage from './components/UserPage';
import DevicePage from './components/DevicePage';
import DeviceManagementPage from './components/DeviceManagementPage';
import OperationLogPage from './components/OperationLogPage';
import BiometricManagementPage from './components/BiometricManagementPage';
import AttendanceReportPage from './components/AttendanceReportPage'; // New import
import { getUserCount, getDeviceCount, getAreaCount, getRecentOperationLogs } from './ApiService';

// Sidebar component for better navigation
const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path ? 'active' : '';
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3><FaFingerprint className="mr-2" /> BioTime Admin</h3>
      </div>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/')}`} to="/">
            <FaHome className="mr-2" /> Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/areas')}`} to="/areas">
            <FaChartBar className="mr-2" /> Areas
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/users')}`} to="/users">
            <FaUsers className="mr-2" /> Users
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/devices')}`} to="/devices">
            <FaMicrochip className="mr-2" /> Devices
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/device-management')}`} to="/device-management">
            <FaTools className="mr-2" /> Device Management
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/operation-logs')}`} to="/operation-logs">
            <FaCog className="mr-2" /> Operation Logs
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${isActive('/attendance-report')}`} to="/attendance-report">
            <FaChartBar className="mr-2" /> Attendance Report
          </Link>
        </li>
      </ul>
    </div>
  );
};

// Dashboard component
const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [deviceCount, setDeviceCount] = useState(0);
  const [areaCount, setAreaCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const users = await getUserCount();
        setUserCount(users);

        const devices = await getDeviceCount();
        setDeviceCount(devices);

        const areas = await getAreaCount();
        setAreaCount(areas);

        const activitiesResponse = await getRecentOperationLogs(5); // Fetch 5 recent activities
        setRecentActivities(activitiesResponse.data);

      } catch (err) {
        setError('Failed to fetch dashboard data: ' + err.message);
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h2 className="mb-4">Biometric Attendance Dashboard</h2>
        
        <div className="row">
          <div className="col-md-3">
            <div className="dashboard-card bg-white text-dark shadow-sm">
              <div className="card-icon text-primary">
                <FaUsers size={40} />
              </div>
              <div className="card-content">
                <h3>Users</h3>
                <p className="display-4">{userCount}</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="dashboard-card bg-white text-dark shadow-sm">
              <div className="card-icon text-success">
                <FaMicrochip size={40} />
              </div>
              <div className="card-content">
                <h3>Devices</h3>
                <p className="display-4">{deviceCount}</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="dashboard-card bg-white text-dark shadow-sm">
              <div className="card-icon text-info">
                <FaChartBar size={40} />
              </div>
              <div className="card-content">
                <h3>Areas</h3>
                <p className="display-4">{areaCount}</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="dashboard-card bg-white text-dark shadow-sm">
              <div className="card-icon text-warning">
                <FaTools size={40} />
              </div>
              <div className="card-content">
                <h3>Management</h3>
                <p>Device controls</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row mt-4">
          <div className="col-md-8">
            <div className="dashboard-card shadow-sm">
              <h4>System Overview</h4>
              <p>Monitor your biometric attendance system in real-time. Track user enrollments, device connectivity, and attendance data.</p>
              <div className="system-stats">
                <div className="stat-item">
                  <span className="stat-number">{deviceCount}</span>
                  <span className="stat-label">Total Devices</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{userCount}</span>
                  <span className="stat-label">Total Users</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{areaCount}</span>
                  <span className="stat-label">Total Areas</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="dashboard-card shadow-sm">
              <h4>Recent Activity</h4>
              <ListGroup variant="flush">
                {recentActivities.length === 0 ? (
                  <ListGroup.Item>No recent activity.</ListGroup.Item>
                ) : (
                  recentActivities.map((activity, index) => (
                    <ListGroup.Item key={index}>
                      <strong>Device SN:</strong> {activity.deviceSerialNumber} -
                      <strong> Type:</strong> {activity.operationType} -
                      <strong> Details:</strong> {activity.details} -
                      <small className="text-muted ms-2">{new Date(activity.timestamp).toLocaleString()}</small>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar bg="light" expand="lg" className="mb-4">
            <Container>
              <Navbar.Brand href="#home">BioTime Admin</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <NavDropdown title="Settings" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">System Settings</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">User Preferences</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.3">Logout</NavDropdown.Item>
                  </NavDropdown>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          
          <Container fluid>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/areas" element={<AreaPage />} />
              <Route path="/users" element={<UserPage />} />
              <Route path="/biometric-management/:pin" element={<BiometricManagementPage />} />
              <Route path="/attendance-report" element={<AttendanceReportPage />} /> {/* New route */}
              <Route path="/devices" element={<DevicePage />} />
              <Route path="/device-management" element={<DeviceManagementPage />} />
              <Route path="/operation-logs" element={<OperationLogPage />} />
            </Routes>
          </Container>
        </div>
      </div>
    </Router>
  );
}

export default App;