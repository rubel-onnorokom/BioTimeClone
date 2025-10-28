
import React, { useState, useEffect } from 'react';
import { getOperationLogs } from '../ApiService';

const OperationLogPage = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await getOperationLogs();
                setLogs(response.data);
            } catch (error) {
                console.error('Error fetching operation logs:', error);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div>
            <h2>Operation Logs</h2>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>User ID</th>
                        <th>Device ID</th>
                        <th>Operation Type</th>
                        <th>Operation Result</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td>{log.timestamp}</td>
                            <td>{log.userId}</td>
                            <td>{log.deviceId}</td>
                            <td>{log.operationType}</td>
                            <td>{log.operationResult}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OperationLogPage;
