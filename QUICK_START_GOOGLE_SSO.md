# Google SSO - Quick Start Guide

This is a simplified guide to get Google SSO working quickly. For detailed documentation, see [GOOGLE_SSO_SETUP.md](./GOOGLE_SSO_SETUP.md).

## 1. Get Google Client ID (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create new OAuth Client ID (Web application)
3. Add authorized origins:
   - `http://localhost:5173`
   - `https://staff.cosmopolitan.edu.ng`
4. Copy the Client ID (format: `xxxxx.apps.googleusercontent.com`)

## 2. Configure Frontend (1 minute)

Create `.env` file in project root:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

Restart dev server:

```bash
npm run dev
```

## 3. Test Frontend (1 minute)

1. Go to login page
2. You should see "Continue with Google" button below the regular login
3. Click it - Google popup should open
4. Select account - you'll get an error (backend not ready yet)

## 4. Backend Setup (Backend Developer)

Create endpoint: `POST /login/staff_portal_google_login`

**Request:**
```json
{
  "email": "user@cosmopolitan.edu.ng",
  "googleId": "google_user_id",
  "name": "User Name",
  "picture": "https://...",
  "credential": "access_token",
  "authType": "google"
}
```

**Response (Success):**
```json
{
  "message": "success",
  "userData": [{ /* same as regular login */ }],
  "permissionData": [{ /* same as regular login */ }]
}
```

See [BACKEND_API_EXAMPLE.md](./BACKEND_API_EXAMPLE.md) for complete implementation.

## 5. Test Complete Flow

1. Ensure backend endpoint is live
2. Go to login page
3. Click "Continue with Google"
4. Select account with @cosmopolitan.edu.ng email
5. Should login successfully

## Troubleshooting

**Button not showing?**
- Check `.env` file exists with correct Client ID
- Restart dev server after adding `.env`

**"Account not found" error?**
- Backend needs to implement the endpoint
- Email must match staff `OfficialEmailAddress` in database

**Popup blocked?**
- Allow popups in browser settings
- Make sure you click the button directly (not automated)

**CORS error?**
- Add frontend URL to backend CORS whitelist
- Check backend endpoint exists

## Files Created/Modified

### New Files:
- `src/config/googleAuth.js` - Configuration
- `src/component/authentication/login/GoogleSignInButton.jsx` - Button component
- `.env.example` - Environment template
- `GOOGLE_SSO_SETUP.md` - Complete documentation
- `BACKEND_API_EXAMPLE.md` - Backend implementation guide

### Modified Files:
- `src/index.jsx` - Added GoogleOAuthProvider wrapper
- `src/component/authentication/login/login.jsx` - Added Google SSO functionality
- `.gitignore` - Added .env to ignore list

## Production Checklist

- [ ] Create production Google Client ID
- [ ] Set production environment variable
- [ ] Test with production Google accounts
- [ ] Verify HTTPS enabled
- [ ] Backend endpoint deployed

## Need Help?

See complete documentation: [GOOGLE_SSO_SETUP.md](./GOOGLE_SSO_SETUP.md)

---

**Quick Reference:**

| Item | Value |
|------|-------|
| Package | `@react-oauth/google` v0.12.2 |
| Env Var | `VITE_GOOGLE_CLIENT_ID` |
| Backend Endpoint | `POST /login/staff_portal_google_login` |
| Email Domain | `@cosmopolitan.edu.ng` |
| Dev URL | `http://localhost:5173` |
| Prod URL | `https://staff.cosmopolitan.edu.ng` |

