
import axios from 'axios';

const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Authorization header
apiClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && !config.url.includes('/api/auth')) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 Unauthorized errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If the error is 401 and it's not a login/register request, try to refresh token
        if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/auth')) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post('/api/auth/refresh', { refreshToken });
                    const { accessToken, newRefreshToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // Refresh token failed, clear tokens and redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login'; // Redirect to login page
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login'; // Redirect to login page
            }
        } else if (error.response.status === 401 && (originalRequest.url.includes('/api/auth/login') || originalRequest.url.includes('/api/auth/register'))) {
            // If 401 on login/register, just reject the promise so the component can handle it
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

// Authentication functions
export const login = async (username, password) => {
    const response = await apiClient.post('/api/auth/login', { username, password });
    return response.data;
};

export const register = async (username, password) => {
    const response = await apiClient.post('/api/auth/register', { username, password });
    return response.data;
};

export const getAreas = () => apiClient.get('/api/areas');
export const createArea = (area) => apiClient.post('/api/areas', area);
export const updateArea = (id, area) => apiClient.put(`/api/areas/${id}`, area);
export const deleteArea = (id) => apiClient.delete(`/api/areas/${id}`);

export const getUsers = () => apiClient.get('/api/users');
export const createUser = (user) => apiClient.post('/api/users', user);
export const updateUser = (pin, user) => apiClient.put(`/api/users/${pin}`, user);
export const updateUserAreas = (pin, areaIds) => apiClient.put(`/api/users/${pin}/areas`, { areaIds });
export const getUserAttendanceLogs = (pin) => apiClient.get(`/api/users/${pin}/attendance-logs`);
export const getUserFingerprints = (pin) => apiClient.get(`/api/users/${pin}/fingerprints`);
export const getUserFaceTemplates = (pin) => apiClient.get(`/api/users/${pin}/facetemplates`);
export const getUserFingerVeinTemplates = (pin) => apiClient.get(`/api/users/${pin}/fingerveintemplates`);
export const getUserUnifiedTemplates = (pin) => apiClient.get(`/api/users/${pin}/unifiedtemplates`);
export const getUserAttendanceReport = (pin, startDate, endDate) => apiClient.get(`/api/users/${pin}/attendance-report`, { params: { startDate, endDate } });
export const deleteUser = (pin) => apiClient.delete(`/api/users/${pin}`);

export const getDevices = () => apiClient.get('/api/devices');
export const createDevice = (device) => apiClient.post('/api/devices', device);
export const updateDevice = (serialNumber, device) => apiClient.put(`/api/devices/${serialNumber}`, device);
export const deleteDevice = (serialNumber) => apiClient.delete(`/api/devices/${serialNumber}`);
export const assignDeviceToArea = (serialNumber, areaId) => apiClient.put(`/api/DeviceManagement/${serialNumber}/area`, { areaId });
export const syncUsersToDevice = (serialNumber) => apiClient.post(`/api/DeviceManagement/${serialNumber}/sync-users`);
export const rebootDevice = (serialNumber) => apiClient.post(`/api/DeviceManagement/${serialNumber}/reboot`);

export const getDeviceInfo = (serialNumber) => apiClient.get(`/api/DeviceManagement/${serialNumber}/info`);
export const reloadOptions = (serialNumber) => apiClient.post(`/api/DeviceManagement/${serialNumber}/reload-options`);
export const checkAndTransmitNewData = (serialNumber) => apiClient.post(`/api/DeviceManagement/${serialNumber}/check-new-data`);
export const checkDataUpdate = (serialNumber) => apiClient.post(`/api/DeviceManagement/${serialNumber}/check-update`);
export const cancelAlarm = (serialNumber) => apiClient.post(`/api/DeviceManagement/${serialNumber}/cancel-alarm`);
export const unlockDoor = (serialNumber) => apiClient.post(`/api/DeviceManagement/${serialNumber}/unlock`);
export const clearBioData = (serialNumber) => apiClient.post(`/api/DeviceManagement/${serialNumber}/clear-biodata`);
export const clearData = (serialNumber) => apiClient.post(`/api/DeviceManagement/${serialNumber}/clear-data`);
export const clearAttendancePhotos = (serialNumber) => apiClient.post(`/api/DeviceManagement/${serialNumber}/clear-att-photos`);
export const clearAttendanceLogs = (serialNumber) => apiClient.post(`/api/DeviceManagement/${serialNumber}/clear-att-logs`);
export const getPendingCommands = (serialNumber) => apiClient.get(`/api/DeviceManagement/${serialNumber}/pending-commands`);

export const setDeviceOption = (serialNumber, key, value) => apiClient.post(`/api/DeviceManagement/${serialNumber}/set-option?key=${key}&value=${value}`);
export const enrollFingerprint = (enrollDto) => apiClient.post(`/api/DeviceManagement/enrollment/fingerprint`, enrollDto);
export const updateFirmware = (serialNumber, checksum, url, size) => apiClient.post(`/api/DeviceManagement/${serialNumber}/update-firmware?checksum=${checksum}&url=${url}&size=${size}`);
export const executeShellCommand = (serialNumber, command) => apiClient.post(`/api/DeviceManagement/${serialNumber}/execute-shell-command?command=${command}`);
export const putFile = (serialNumber, url, filePath) => apiClient.post(`/api/DeviceManagement/${serialNumber}/put-file?url=${url}&filePath=${filePath}`);
export const getFile = (serialNumber, filePath) => apiClient.post(`/api/DeviceManagement/${serialNumber}/get-file?filePath=${filePath}`);

export const getOperationLogs = () => apiClient.get('/api/operationlogs');

export const getUserCount = () => apiClient.get('/api/users').then(response => response.data.length);
export const getDeviceCount = () => apiClient.get('/api/devices').then(response => response.data.length);
export const getAreaCount = () => apiClient.get('/api/areas').then(response => response.data.length);
export const getRecentOperationLogs = (count = 10, deviceSerialNumber = null) => {
    let url = `/api/operationlogs/recent?count=${count}`;
    if (deviceSerialNumber) {
        url += `&deviceSerialNumber=${deviceSerialNumber}`;
    }
    return apiClient.get(url);
};

