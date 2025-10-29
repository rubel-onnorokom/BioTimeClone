# BioTime Biometric Attendance System Overview

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Core Components](#core-components)
3. [Device Communication Protocol](#device-communication-protocol)
4. [User Management](#user-management)
5. [Biometric Template Management](#biometric-template-management)
6. [Area-Based Access Control](#area-based-access-control)
7. [Attendance Tracking](#attendance-tracking)
8. [Device Management](#device-management)
9. [Security & Authentication](#security--authentication)
10. [API Endpoints](#api-endpoints)

## System Architecture

The BioTime biometric attendance system is a client-server application built with:
- **Backend**: ASP.NET Core Web API with Entity Framework Core
- **Frontend**: React.js with Bootstrap UI components
- **Database**: Entity Framework Core with SQL Server or SQLite backend
- **Communication**: RESTful API with ZKTeco-compatible device communication protocol

## Core Components

### 1. Backend API (BioTime.Api)
- **Controllers**: Handle device communication, user management, attendance logging
- **Models**: Entity models for devices, users, biometric templates, attendance logs
- **Database Context**: BioTimeDbContext managing all data operations
- **DTOs**: Data Transfer Objects for API communication

### 2. Frontend React Application (biotime-react-ui)
- **Authentication**: Login, registration, and session management
- **User Interface**: Dashboard, user management, device management, attendance reports
- **API Service**: Centralized API calls with request/response interceptors
- **Routing**: Protected routes with role-based access control

### 3. Database Models
- **Device**: Physical device information and management
- **User**: Employee/user profiles and access rights
- **Area**: Physical zones/locations with access permissions
- **Biometric Templates**: Fingerprint, face, finger vein, unified templates
- **Attendance Logs**: Timestamp records of user check-ins/check-outs

## Device Communication Protocol

The system uses a ZKTeco-compatible communication protocol:
- **IClock Interface**: Standard protocol for biometric device communication
- **HTTP Endpoints**: `/iclock/*` endpoints handle device communication
- **Data Exchange**: Bidirectional data transfer between devices and server
- **Commands**: Server can send commands to devices to update users, templates, or settings

### Communication Methods
- **GET /iclock/cdata**: Device configuration and user data requests
- **POST /iclock/cdata**: Attendance logs and device data submissions
- **GET/POST /iclock/getrequest**: Device command requests and responses
- **POST /iclock/exchange**: Encryption key exchange
- **GET /iclock/ping**: Heartbeat/availability check

## User Management

### User Lifecycle
- **Creation**: Add users with PIN, name, credentials, and area assignments
- **Area Assignment**: Link users to specific access areas
- **Biometric Enrollment**: Associate biometric templates with users
- **Deletion**: Remove user access and synchronize with devices

### User Properties
- **PIN**: Unique identifier for each user
- **Name, Privilege Level, Card Number**: User profile information
- **Area Relationships**: Many-to-many relationship between users and areas

## Biometric Template Management

### Template Types Supported
- **Fingerprint Templates**: Traditional fingerprint biometric data
- **Face Templates**: Facial recognition biometric data
- **Finger Vein Templates**: Vein pattern recognition data
- **Unified Templates**: Multi-biometric template support

### CRUD Operations
- **Create**: Add new biometric templates for users
- **Read**: Retrieve templates for specific users
- **Update**: Modify existing templates
- **Delete**: Remove templates and synchronize with devices

### Device Synchronization
- Changes to biometric templates generate server commands
- Commands are queued for delivery to relevant devices
- Devices receive updates during regular communication cycles

## Area-Based Access Control

### Area Management
- **Zones**: Define physical or logical access areas
- **Device Assignment**: Link devices to specific zones
- **User Assignment**: Grant users access to specific areas

### Access Logic
- Users can only authenticate on devices in areas they're assigned to
- Area changes trigger automatic user synchronization to/from devices
- Device area changes update user access rights across the system

## Attendance Tracking

### Data Collection
- **Automatic Logging**: Devices automatically record attendance events
- **Timestamp Records**: Detailed check-in/check-out logs with verification modes
- **Verification Methods**: Support for fingerprint, face, card, password, etc.

### Report Generation
- **Daily Reports**: Per-user attendance summaries
- **Working Hours**: Calculate in/out times and total hours worked
- **Absence Tracking**: Identify absent days and leave patterns
- **Late/Early Detection**: Identify late arrivals and early departures

## Device Management

### Device Lifecycle
- **Registration**: Add new devices with serial numbers and configuration
- **Configuration**: Set device parameters and area assignments
- **Monitoring**: Track device status, last seen, and connection health
- **Maintenance**: Perform device operations (reboot, update, clear data)

### Device Operations
- **Reboot**: Remotely restart devices
- **Firmware Update**: Push firmware updates to devices
- **Data Clearing**: Clear user data, logs, photos from devices
- **Option Management**: Configure device settings remotely

### Communication Management
- **Command Queuing**: Send commands to devices when they connect
- **Status Monitoring**: Track command delivery and acknowledgment
- **Data Synchronization**: Ensure device data aligns with server data

## Security & Authentication

### API Security
- **JWT Authentication**: Token-based authentication for API endpoints
- **Role-Based Access**: Different permission levels for users
- **Token Refresh**: Automatic token refresh with refresh tokens
- **Session Management**: Secure session handling in frontend

### Data Security
- **Encryption**: Support for encrypted communication with devices
- **Access Control**: Area-based access restrictions
- **Audit Trails**: Operation logs for system activities
- **Secure Storage**: Proper handling of biometric template data

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login with JWT token generation
- `POST /api/auth/register` - New user registration
- `POST /api/auth/refresh` - Token refresh operation

### User Management Endpoints
- `GET /api/users` - Retrieve all users
- `POST /api/users` - Create new user with area assignments
- `PUT /api/users/{pin}` - Update user information
- `DELETE /api/users/{pin}` - Delete user and synchronize devices
- `PUT /api/users/{pin}/areas` - Update user area assignments

### Biometric Template Endpoints
- `GET /api/users/{pin}/fingerprints` - Get user fingerprint templates
- `POST /api/users/{pin}/fingerprints` - Create user fingerprint template
- `PUT /api/users/fingerprints/{id}` - Update fingerprint template
- `DELETE /api/users/fingerprints/{id}` - Delete fingerprint template
- Similar endpoints for face templates, finger vein templates, unified templates

### Device Management Endpoints
- `GET /api/devices` - Retrieve all devices
- `POST /api/devices` - Register new device
- `PUT /api/devices/{serialNumber}` - Update device settings
- `DELETE /api/devices/{serialNumber}` - Remove device and clear data
- `PUT /api/DeviceManagement/{serialNumber}/area` - Assign device to area

### Attendance Endpoints
- `GET /api/users/{pin}/attendance-logs` - Get user attendance logs
- `GET /api/users/{pin}/attendance-report` - Generate attendance report
- `GET /api/operationlogs` - Retrieve system operation logs

## Key Features

### Real-time Synchronization
- Automatic user and template synchronization between server and devices
- Real-time command queuing and delivery
- Immediate area access updates across all devices

### Comprehensive Biometric Support
- Multiple biometric modalities (fingerprint, face, finger vein, unified)
- Flexible template management with CRUD operations
- Device-agnostic template storage and retrieval

### Scalable Architecture
- Support for multiple devices across different areas
- Efficient command queuing for large installations
- Optimized database queries for performance

### Robust Device Management
- Complete device lifecycle management
- Remote configuration and maintenance capabilities
- Data integrity protection during device operations

This system provides a comprehensive solution for biometric attendance management with robust security, scalable architecture, and full device synchronization capabilities.