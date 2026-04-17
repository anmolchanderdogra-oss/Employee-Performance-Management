/**
 * EmployeeLC - Frontend JavaScript
 * Common utilities and authentication helpers
 */

// Check if user is authenticated
function checkAuth() {
    const session = localStorage.getItem('employeeLC_session');
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Get current session data
function getSession() {
    const session = localStorage.getItem('employeeLC_session');
    return session ? JSON.parse(session) : null;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format datetime
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';

    const notification = document.createElement('div');
    notification.className = `alert ${alertClass} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// API helper for NodeJS backend
const API_BASE = 'http://localhost:3000/api';

async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'API call failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Employee CRUD operations (for frontend)
const EmployeeAPI = {
    async getAll() {
        return apiCall('/employees');
    },

    async getById(id) {
        return apiCall(`/employees/${id}`);
    },

    async create(employee) {
        return apiCall('/employees', 'POST', employee);
    },

    async update(id, employee) {
        return apiCall(`/employees/${id}`, 'PUT', employee);
    },

    async delete(id) {
        return apiCall(`/employees/${id}`, 'DELETE');
    },

    async search(query) {
        return apiCall(`/employees/search/${query}`);
    }
};

// Audit API
const AuditAPI = {
    async getLogs(page = 1, limit = 50) {
        return apiCall(`/audit-logs?page=${page}&limit=${limit}`);
    },

    async getEntityHistory(entityId) {
        return apiCall(`/audit-logs/entity/${entityId}`);
    }
};

// Export for use in other scripts
window.EmployeeLC = {
    checkAuth,
    getSession,
    formatDate,
    formatDateTime,
    showNotification,
    apiCall,
    EmployeeAPI,
    AuditAPI
};
