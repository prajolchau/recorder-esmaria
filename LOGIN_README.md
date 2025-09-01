# Esmaria Sticker House - Secure Login System

## Overview
This login system provides secure authentication for the Esmaria Sticker House Credit Recorder application. The system includes modern security features, session management, and a user-friendly interface.

## Features

### 🔐 Security Features
- **Account Lockout**: After 3 failed login attempts, the account is locked for 15 minutes
- **Session Management**: Automatic session expiry with configurable duration
- **Secure Tokens**: JWT-like tokens for session validation
- **Input Validation**: Real-time validation with visual feedback
- **Password Visibility Toggle**: Show/hide password functionality
- **Remember Me**: Option to extend session duration
- **Developer Tools Protection**: Prevents access to browser developer tools

### 🎨 User Interface
- **Modern Design**: Beautiful gradient backgrounds and animations
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Visual Feedback**: Success/error states with animations
- **Loading States**: Visual feedback during authentication
- **Session Warnings**: Notifications before session expiry

### 🔧 Technical Features
- **Session Monitoring**: Continuous session validation
- **Auto-redirect**: Automatic redirection to login when session expires
- **Logout Functionality**: Secure logout with confirmation
- **Password Reset**: Forgot password functionality (UI only)
- **Cross-browser Compatibility**: Works on all modern browsers

## Login Credentials

### Default Users
For demonstration purposes, the following credentials are available:

| Username | Password | Role |
|----------|----------|------|
| admin    | admin123 | Administrator |
| manager  | manager123 | Manager |
| user     | user123 | User |

### ⚠️ Important Security Note
These are demo credentials for testing purposes. In a production environment:
1. Replace with real user credentials
2. Implement server-side authentication
3. Use HTTPS for all communications
4. Store passwords securely (hashed)
5. Implement proper user management

## How to Use

### 1. Access the Login Page
- Navigate to `login.html` in your browser
- The login page will be displayed with the Esmaria Sticker House branding

### 2. Login Process
1. Enter your username (minimum 3 characters)
2. Enter your password (minimum 6 characters)
3. Optionally check "Remember me" for extended session
4. Click "Login" button
5. Wait for authentication (loading animation will show)

### 3. After Successful Login
- You'll be redirected to the main application (`index.html`)
- Your username will be displayed in the top-right corner
- Session will be active for 24 hours (or 7 days if "Remember me" was checked)

### 4. Session Management
- **Session Warning**: 5 minutes before expiry, a warning will appear
- **Extend Session**: Click "Extend Session" to add 1 hour to your session
- **Auto-logout**: Session automatically expires and redirects to login

### 5. Logout
- Click the "Logout" button in the top-right corner
- Confirm logout in the dialog
- You'll be redirected to the login page

## File Structure

```
├── login.html          # Login page
├── login-styles.css    # Login page styles
├── login.js           # Login functionality
├── auth.js            # Authentication management
├── index.html         # Main application (protected)
├── styles.css         # Main application styles
├── script.js          # Main application functionality
└── LOGIN_README.md    # This file
```

## Security Implementation

### Client-Side Security
- **Input Sanitization**: All inputs are validated and sanitized
- **XSS Prevention**: Content is properly escaped
- **CSRF Protection**: Tokens prevent cross-site request forgery
- **Session Validation**: Continuous session checking

### Session Security
- **Token Generation**: Secure random tokens for sessions
- **Expiry Management**: Automatic session expiry
- **Storage Security**: Sensitive data stored in localStorage with expiry
- **Auto-cleanup**: Expired sessions are automatically cleared

## Customization

### Changing Default Credentials
Edit the `authenticateUser` function in `login.js`:

```javascript
authenticateUser(username, password) {
    const validCredentials = {
        'your_username': 'your_password',
        'another_user': 'another_password'
    };
    return validCredentials[username] === password;
}
```

### Session Duration
Modify session duration in `login.js`:

```javascript
const sessionDuration = rememberMe ? 
    7 * 24 * 60 * 60 * 1000 :  // 7 days
    24 * 60 * 60 * 1000;       // 1 day
```

### Lockout Settings
Adjust lockout settings in `login.js`:

```javascript
this.maxLoginAttempts = 5;        // Number of attempts
this.lockoutDuration = 30 * 60 * 1000; // 30 minutes
```

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Troubleshooting

### Common Issues

1. **Login not working**
   - Check if you're using the correct credentials
   - Ensure JavaScript is enabled
   - Clear browser cache and try again

2. **Session expires too quickly**
   - Check "Remember me" option
   - Extend session when warning appears
   - Check system clock accuracy

3. **Page not loading**
   - Ensure all files are in the same directory
   - Check file permissions
   - Verify file names match exactly

### Support
For technical support, contact:
- Phone: +977 9810296797
- Email: esmaria.stickerhouse0@gmail.com

## Future Enhancements

- [ ] Server-side authentication
- [ ] Database integration
- [ ] User registration
- [ ] Password reset via email
- [ ] Two-factor authentication
- [ ] Role-based access control
- [ ] Audit logging
- [ ] API integration

---

**Note**: This is a client-side authentication system for demonstration purposes. For production use, implement proper server-side authentication with secure protocols.
