// Google OAuth Configuration
// This file manages Google authentication settings

// Get Google Client ID from environment variable or use a default for development
// IMPORTANT: Never commit the actual Client ID to version control
// Set up your .env file with VITE_GOOGLE_CLIENT_ID variable

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Validate that Google Client ID is configured
export const isGoogleAuthConfigured = () => {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
    console.warn('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
    return false;
  }
  return true;
};

// Google OAuth Scopes - what information we want to access
export const GOOGLE_SCOPES = [
  'openid',
  'profile',
  'email'
].join(' ');

// Google OAuth Configuration
export const GOOGLE_AUTH_CONFIG = {
  oneTap: false, // Disable one-tap sign-in for more control
  auto_select: false,
  cancel_on_tap_outside: true
};
