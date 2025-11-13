# Google Single Sign-On (SSO) Setup Guide

## Overview
This guide explains how to configure and use Google SSO for the Cosmopolitan University Staff Portal.

## Table of Contents
1. [Getting Google OAuth Credentials](#getting-google-oauth-credentials)
2. [Frontend Configuration](#frontend-configuration)
3. [Backend API Requirements](#backend-api-requirements)
4. [Testing the Implementation](#testing-the-implementation)
5. [Troubleshooting](#troubleshooting)

---

## Getting Google OAuth Credentials

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" dropdown at the top
3. Click "New Project"
4. Enter project name (e.g., "Cosmopolitan Staff Portal")
5. Click "Create"

### Step 2: Enable Google+ API
1. In the left sidebar, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - User Type: Select "Internal" (for organization use) or "External"
   - Fill in the required information:
     - App name: "Cosmopolitan Staff Portal"
     - User support email: your email
     - Developer contact information: your email
   - Click "Save and Continue"
   - Add scopes: `openid`, `profile`, `email`
   - Click "Save and Continue"
4. Return to "Create OAuth client ID":
   - Application type: Select "Web application"
   - Name: "Staff Portal Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `https://staff.cosmopolitan.edu.ng` (for production)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - `https://staff.cosmopolitan.edu.ng` (for production)
5. Click "Create"
6. **Copy the Client ID** (format: `xxxxx.apps.googleusercontent.com`)

---

## Frontend Configuration

### Step 1: Create Environment File
Create a `.env` file in the root directory of the staff portal project:

```bash
# Copy the example file
cp .env.example .env
```

### Step 2: Add Google Client ID
Edit the `.env` file and add your Google Client ID:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

**Important:**
- Replace `your_client_id_here` with your actual Google Client ID
- Never commit the `.env` file to version control
- The `.env` file is already in `.gitignore`

### Step 3: Restart Development Server
After adding the Client ID, restart your development server:

```bash
npm run dev
```

---

## Backend API Requirements

The backend needs to implement a new endpoint to handle Google SSO authentication:

### Endpoint: `POST /login/staff_portal_google_login`

#### Request Body:
```json
{
  "email": "user@cosmopolitan.edu.ng",
  "googleId": "google_unique_id",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "credential": "google_access_token",
  "authType": "google"
}
```

#### Expected Response (Success):
```json
{
  "message": "success",
  "userData": [
    {
      "StaffID": "STAFF001",
      "FirstName": "John",
      "LastName": "Doe",
      "OfficialEmailAddress": "user@cosmopolitan.edu.ng",
      "token": "jwt_token_here",
      // ... other user data
    }
  ],
  "permissionData": [
    // Permission data array
  ]
}
```

#### Expected Response (Account Not Found):
```json
{
  "message": "not_found",
  "error": "No staff account found with this email"
}
```

#### Expected Response (Account Not Linked):
```json
{
  "message": "not_linked",
  "error": "This Google account is not linked to any staff account"
}
```

### Backend Implementation Requirements:

1. **Verify Google Token** (Optional but recommended):
   ```javascript
   // Verify the access token with Google
   const response = await fetch(
     `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${credential}`
   );
   ```

2. **Match Staff Account**:
   - Search for staff by `OfficialEmailAddress` matching the Google email
   - Optionally, maintain a `google_id` field in the staff table for linking

3. **Return Same Structure as Regular Login**:
   - Must return the same `userData` and `permissionData` structure
   - Must include authentication token

4. **Security Considerations**:
   - Validate email domain (e.g., must be @cosmopolitan.edu.ng)
   - Log authentication attempts
   - Implement rate limiting
   - Consider implementing Google ID linking mechanism

---

## Files Modified/Created

### Created Files:
1. **`src/config/googleAuth.js`**
   - Configuration for Google OAuth
   - Client ID management
   - Validation helper functions

2. **`src/component/authentication/login/GoogleSignInButton.jsx`**
   - Custom Google Sign-In button component
   - Uses `@react-oauth/google` library
   - Styled to match existing design

3. **`.env.example`**
   - Template for environment variables
   - Documents required configuration

4. **`GOOGLE_SSO_SETUP.md`** (this file)
   - Complete setup and usage documentation

### Modified Files:
1. **`src/index.jsx`**
   - Wrapped app with `GoogleOAuthProvider`
   - Imported Google Client ID configuration

2. **`src/component/authentication/login/login.jsx`**
   - Added Google Sign-In functionality
   - Implemented `handleGoogleSuccess` and `handleGoogleError` functions
   - Added Google button with OR separator
   - Added loading states for Google authentication

---

## Testing the Implementation

### 1. Development Testing

```bash
# Ensure dependencies are installed
npm install

# Create .env file with Google Client ID
echo "VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com" > .env

# Start development server
npm run dev
```

### 2. Test Regular Login
- Verify regular login still works with Staff ID and Password
- Ensure no regression in existing functionality

### 3. Test Google SSO
- Click "Continue with Google" button
- Select a Google account
- Verify authentication with backend
- Check that user is logged in successfully

### 4. Test Error Scenarios
- Try with non-authorized email domain
- Cancel the Google sign-in popup
- Test with account not in the system
- Test network error handling

---

## User Flow

### Google SSO Login Flow:
1. User clicks "Continue with Google" button
2. Google authentication popup opens
3. User selects Google account and grants permissions
4. Frontend receives Google access token
5. Frontend fetches user info from Google API
6. Frontend sends user data to backend endpoint
7. Backend verifies and matches staff account
8. Backend returns user data and permissions
9. Frontend stores data in Redux
10. User is redirected to dashboard

---

## Troubleshooting

### Google Button Not Showing
**Problem:** The Google Sign-In button doesn't appear on the login page.

**Solutions:**
1. Check that `VITE_GOOGLE_CLIENT_ID` is set in `.env` file
2. Verify the Client ID is valid
3. Check browser console for errors
4. Ensure development server was restarted after adding .env

### "Invalid Client ID" Error
**Problem:** Google shows "Invalid Client ID" error.

**Solutions:**
1. Verify the Client ID is correct in `.env`
2. Ensure no extra spaces in the Client ID
3. Check that the Client ID ends with `.apps.googleusercontent.com`
4. Verify the domain is in "Authorized JavaScript origins"

### CORS Errors
**Problem:** CORS error when calling Google API or backend.

**Solutions:**
1. Add your domain to Google Cloud Console authorized origins
2. Ensure backend API has proper CORS headers
3. Check that backend endpoint exists and is accessible

### "Account Not Found" Error
**Problem:** Google login succeeds but backend returns "not_found".

**Solutions:**
1. Ensure the Google email matches staff `OfficialEmailAddress`
2. Check if email domain restriction is too strict
3. Verify staff account exists in database
4. Check backend logs for specific error

### Popup Blocked
**Problem:** Google authentication popup is blocked by browser.

**Solutions:**
1. Allow popups for the application domain
2. User must click the button directly (can't be programmatically triggered)
3. Add instructions for users to enable popups

---

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to version control
   - Use different Client IDs for dev/staging/production
   - Rotate credentials periodically

2. **Backend Validation**
   - Always verify Google tokens on backend
   - Implement rate limiting on login endpoints
   - Log all authentication attempts
   - Validate email domains

3. **User Data**
   - Only request necessary Google scopes
   - Don't store Google access tokens long-term
   - Implement proper session management
   - Use HTTPS in production

4. **Error Handling**
   - Don't expose detailed error messages to users
   - Log errors for debugging
   - Implement proper fallback mechanisms

---

## Production Deployment Checklist

- [ ] Create production Google OAuth Client ID
- [ ] Add production domain to authorized origins
- [ ] Set `VITE_GOOGLE_CLIENT_ID` in production environment
- [ ] Implement backend endpoint for Google login
- [ ] Test with production Google accounts
- [ ] Verify HTTPS is enabled
- [ ] Test error scenarios in production
- [ ] Set up monitoring and logging
- [ ] Document for staff (how to link Google accounts)
- [ ] Train support team on troubleshooting

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Support

For issues or questions:
- Check this documentation first
- Review browser console for errors
- Check backend logs
- Contact IT Services Department

---

**Last Updated:** 2025-01-12
**Version:** 1.0.0
