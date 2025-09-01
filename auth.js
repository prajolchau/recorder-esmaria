// Authentication and Session Management
class AuthManager {
    constructor() {
        this.checkAuthentication();
        this.setupSessionMonitoring();
    }

    checkAuthentication() {
        const token = localStorage.getItem('authToken');
        const sessionExpiry = localStorage.getItem('sessionExpiry');
        const username = localStorage.getItem('username');

        if (!token || !sessionExpiry || Date.now() >= parseInt(sessionExpiry)) {
            this.redirectToLogin();
            return;
        }

        // Update user display
        this.updateUserDisplay(username);
        
        // Set up session expiry warning
        this.setupSessionWarning(parseInt(sessionExpiry));
    }

    updateUserDisplay(username) {
        const userElement = document.getElementById('currentUser');
        if (userElement) {
            userElement.textContent = `Welcome, ${username || 'User'}`;
        }
    }

    setupSessionWarning(sessionExpiry) {
        const warningTime = sessionExpiry - (5 * 60 * 1000); // 5 minutes before expiry
        
        if (Date.now() < warningTime) {
            setTimeout(() => {
                this.showSessionWarning();
            }, warningTime - Date.now());
        }
    }

    showSessionWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'sessionWarning';
        warningDiv.innerHTML = `
            <div class="session-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Your session will expire in 5 minutes. Click to extend.</span>
                <button onclick="extendSession()">Extend Session</button>
                <button onclick="dismissWarning()">Dismiss</button>
            </div>
        `;
        
        warningDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffc107;
            color: #333;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(warningDiv);
    }

    setupSessionMonitoring() {
        // Check session every minute
        setInterval(() => {
            const sessionExpiry = localStorage.getItem('sessionExpiry');
            if (sessionExpiry && Date.now() >= parseInt(sessionExpiry)) {
                this.redirectToLogin();
            }
        }, 60000);
    }

    redirectToLogin() {
        // Clear any existing session data
        this.clearSession();
        
        // Redirect to login page
        if (window.location.pathname !== '/login.html' && !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    clearSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionExpiry');
        localStorage.removeItem('username');
    }
}

// Global functions
function logout() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to logout?')) {
        // Clear session
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionExpiry');
        localStorage.removeItem('username');
        
        // Redirect to login
        window.location.href = 'login.html';
    }
}

function extendSession() {
    // Extend session by 1 hour
    const newExpiry = Date.now() + (60 * 60 * 1000);
    localStorage.setItem('sessionExpiry', newExpiry.toString());
    
    // Remove warning
    const warning = document.getElementById('sessionWarning');
    if (warning) {
        warning.remove();
    }
    
    // Show success message
    showNotification('Session extended successfully!', 'success');
}

function dismissWarning() {
    const warning = document.getElementById('sessionWarning');
    if (warning) {
        warning.remove();
    }
}

function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease-out;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations if not already present
if (!document.querySelector('#auth-animations')) {
    const style = document.createElement('style');
    style.id = 'auth-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .session-warning {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .session-warning button {
            padding: 5px 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s ease;
        }
        
        .session-warning button:first-of-type {
            background: #28a745;
            color: white;
        }
        
        .session-warning button:last-of-type {
            background: #6c757d;
            color: white;
        }
        
        .session-warning button:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
}

// Initialize authentication manager
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Security: Prevent access to developer tools
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        return false;
    }
});

// Security: Prevent right-click context menu
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Security: Monitor for tab visibility changes (user switching tabs)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // User switched tabs or minimized window
        // Could implement additional security measures here
    }
});
