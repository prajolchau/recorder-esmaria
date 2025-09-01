// Login System JavaScript
class LoginSystem {
    constructor() {
        this.maxLoginAttempts = 3;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.loginAttempts = 0;
        this.lockoutTime = 0;
        this.isAuthenticated = false;
        
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadRememberedUser();
        this.checkLockout();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const resetForm = document.getElementById('resetPasswordForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (resetForm) {
            resetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
        }

        // Add input validation
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (usernameInput) {
            usernameInput.addEventListener('input', () => this.validateInput(usernameInput));
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.validateInput(passwordInput));
        }
    }

    checkAuthentication() {
        const token = localStorage.getItem('authToken');
        const sessionExpiry = localStorage.getItem('sessionExpiry');
        
        if (token && sessionExpiry && Date.now() < parseInt(sessionExpiry)) {
            this.isAuthenticated = true;
            this.redirectToMain();
        } else {
            this.clearSession();
        }
    }

    checkLockout() {
        const lockoutTime = localStorage.getItem('lockoutTime');
        if (lockoutTime && Date.now() < parseInt(lockoutTime)) {
            this.showLockoutMessage();
        }
    }

    handleLogin(event) {
        event.preventDefault();
        
        if (this.isLockedOut()) {
            this.showLockoutMessage();
            return;
        }

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validate inputs
        if (!this.validateCredentials(username, password)) {
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        // Simulate API call with delay
        setTimeout(() => {
            if (this.authenticateUser(username, password)) {
                this.loginSuccess(username, rememberMe);
            } else {
                this.loginFailed();
            }
            this.setLoadingState(false);
        }, 1500);
    }

    validateCredentials(username, password) {
        let isValid = true;

        // Username validation
        if (username.length < 3) {
            this.showError('username', 'Username must be at least 3 characters long');
            isValid = false;
        } else {
            this.clearError('username');
        }

        // Password validation
        if (password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters long');
            isValid = false;
        } else {
            this.clearError('password');
        }

        return isValid;
    }

    validateInput(input) {
        const value = input.value.trim();
        const fieldName = input.id;

        if (fieldName === 'username') {
            if (value.length < 3 && value.length > 0) {
                this.showError(fieldName, 'Username must be at least 3 characters long');
            } else if (value.length >= 3) {
                this.clearError(fieldName);
                this.showSuccess(fieldName);
            }
        } else if (fieldName === 'password') {
            if (value.length < 6 && value.length > 0) {
                this.showError(fieldName, 'Password must be at least 6 characters long');
            } else if (value.length >= 6) {
                this.clearError(fieldName);
                this.showSuccess(fieldName);
            }
        }
    }

        authenticateUser(username, password) {
        // In a real application, this would be a server-side API call
        // For demo purposes, we'll use a simple check
        const validCredentials = {
            'Esmaria Sticker House': 'Esmari@143'
        };
    
        return validCredentials[username] === password;
    }

    loginSuccess(username, rememberMe) {
        // Generate secure token
        const token = this.generateToken();
        const sessionDuration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 1 day
        const sessionExpiry = Date.now() + sessionDuration;

        // Store session data
        localStorage.setItem('authToken', token);
        localStorage.setItem('sessionExpiry', sessionExpiry.toString());
        localStorage.setItem('username', username);
        
        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
        } else {
            localStorage.removeItem('rememberedUser');
        }

        // Reset login attempts
        this.loginAttempts = 0;
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');

        // Show success message
        this.showSuccessMessage('Login successful! Redirecting...');

        // Redirect to main page
        setTimeout(() => {
            this.redirectToMain();
        }, 1000);
    }

    loginFailed() {
        this.loginAttempts++;
        localStorage.setItem('loginAttempts', this.loginAttempts.toString());

        if (this.loginAttempts >= this.maxLoginAttempts) {
            this.lockoutAccount();
        } else {
            const remainingAttempts = this.maxLoginAttempts - this.loginAttempts;
            this.showErrorMessage(`Invalid credentials. ${remainingAttempts} attempts remaining.`);
        }
    }

    lockoutAccount() {
        this.lockoutTime = Date.now() + this.lockoutDuration;
        localStorage.setItem('lockoutTime', this.lockoutTime.toString());
        this.showLockoutMessage();
    }

    isLockedOut() {
        const lockoutTime = localStorage.getItem('lockoutTime');
        return lockoutTime && Date.now() < parseInt(lockoutTime);
    }

    showLockoutMessage() {
        const lockoutTime = localStorage.getItem('lockoutTime');
        if (lockoutTime) {
            const remainingTime = Math.ceil((parseInt(lockoutTime) - Date.now()) / 1000 / 60);
            this.showErrorMessage(`Account temporarily locked. Try again in ${remainingTime} minutes.`);
        }
    }

    handlePasswordReset(event) {
        event.preventDefault();
        const email = document.getElementById('resetEmail').value;
        
        if (this.validateEmail(email)) {
            this.showSuccessMessage('Password reset link sent to your email!');
            this.closeForgotPassword();
        } else {
            this.showErrorMessage('Please enter a valid email address.');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    generateToken() {
        // In a real application, this would be generated server-side
        return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    redirectToMain() {
        window.location.href = 'index.html';
    }

    clearSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionExpiry');
        localStorage.removeItem('username');
    }

    loadRememberedUser() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            document.getElementById('username').value = rememberedUser;
            document.getElementById('rememberMe').checked = true;
        }
    }

    setLoadingState(loading) {
        const loginBtn = document.querySelector('.login-btn');
        if (loading) {
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
        } else {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        }
    }

    showError(fieldName, message) {
        const inputGroup = document.querySelector(`#${fieldName}`).closest('.input-group');
        inputGroup.classList.add('error');
        inputGroup.classList.remove('success');
        
        // Remove existing error message
        const existingError = inputGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
        inputGroup.appendChild(errorDiv);
    }

    showSuccess(fieldName) {
        const inputGroup = document.querySelector(`#${fieldName}`).closest('.input-group');
        inputGroup.classList.add('success');
        inputGroup.classList.remove('error');
        
        // Remove error message if exists
        const existingError = inputGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    clearError(fieldName) {
        const inputGroup = document.querySelector(`#${fieldName}`).closest('.input-group');
        inputGroup.classList.remove('error', 'success');
        
        const existingError = inputGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
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

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Utility functions
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

function showForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.style.display = 'block';
}

function closeForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.style.display = 'none';
    document.getElementById('resetEmail').value = '';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('forgotPasswordModal');
    if (event.target === modal) {
        closeForgotPassword();
    }
}

// Add CSS animations
const style = document.createElement('style');
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
`;
document.head.appendChild(style);

// Initialize login system
document.addEventListener('DOMContentLoaded', () => {
    new LoginSystem();
});

// Security: Prevent right-click context menu
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Security: Prevent F12, Ctrl+Shift+I, Ctrl+U
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        return false;
    }
});
