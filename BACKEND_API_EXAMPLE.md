# Backend API Example for Google SSO

This document provides example implementations for the Google SSO backend endpoint.

## Endpoint Details

**URL:** `POST /login/staff_portal_google_login`

**Content-Type:** `application/json`

## Request Payload

```json
{
  "email": "john.doe@cosmopolitan.edu.ng",
  "googleId": "102345678901234567890",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/a/default-user=s96-c",
  "credential": "ya29.a0AfH6SMBx...",
  "authType": "google"
}
```

## Response Examples

### Success Response
```json
{
  "message": "success",
  "userData": [
    {
      "StaffID": "CU2024001",
      "FirstName": "John",
      "LastName": "Doe",
      "OfficialEmailAddress": "john.doe@cosmopolitan.edu.ng",
      "Department": "Computer Science",
      "Role": "Lecturer",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "PhoneNumber": "08012345678",
      "GoogleLinked": true
    }
  ],
  "permissionData": [
    {
      "PermissionID": 1,
      "StaffID": "CU2024001",
      "ModuleName": "Dashboard",
      "CanView": true,
      "CanEdit": false
    }
  ]
}
```

### Account Not Found
```json
{
  "message": "not_found",
  "error": "No staff account found with email: john.doe@cosmopolitan.edu.ng"
}
```

### Account Not Linked
```json
{
  "message": "not_linked",
  "error": "This Google account is not linked to any staff account. Please contact administrator."
}
```

### Invalid Domain
```json
{
  "message": "invalid_domain",
  "error": "Email must be from @cosmopolitan.edu.ng domain"
}
```

### Server Error
```json
{
  "message": "error",
  "error": "Internal server error occurred"
}
```

---

## Implementation Examples

### Node.js + Express Example

```javascript
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

router.post('/login/staff_portal_google_login', async (req, res) => {
  try {
    const { email, googleId, name, picture, credential, authType } = req.body;

    // 1. Validate required fields
    if (!email || !googleId || !credential) {
      return res.status(400).json({
        message: 'error',
        error: 'Missing required fields'
      });
    }

    // 2. Verify email domain
    const allowedDomain = '@cosmopolitan.edu.ng';
    if (!email.endsWith(allowedDomain)) {
      return res.status(403).json({
        message: 'invalid_domain',
        error: `Email must be from ${allowedDomain} domain`
      });
    }

    // 3. Optional: Verify Google token with Google API
    try {
      const tokenInfo = await axios.get(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${credential}`
      );

      // Verify the token is for the correct user
      if (tokenInfo.data.email !== email) {
        return res.status(403).json({
          message: 'error',
          error: 'Token verification failed'
        });
      }
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.status(403).json({
        message: 'error',
        error: 'Invalid Google token'
      });
    }

    // 4. Find staff by email
    const query = `
      SELECT * FROM staff_table
      WHERE OfficialEmailAddress = ?
      AND Status = 'Active'
    `;

    const staffResult = await db.query(query, [email]);

    if (staffResult.length === 0) {
      // Log failed attempt
      await logAudit(email, 'Google SSO login failed - account not found');

      return res.status(404).json({
        message: 'not_found',
        error: 'No staff account found with this email'
      });
    }

    const staff = staffResult[0];

    // 5. Optional: Check if Google ID is linked
    // If you maintain a google_id field in your database
    if (staff.google_id && staff.google_id !== googleId) {
      return res.status(403).json({
        message: 'not_linked',
        error: 'This Google account is not linked to your staff account'
      });
    }

    // 6. Update Google ID if not set (first-time Google login)
    if (!staff.google_id) {
      await db.query(
        'UPDATE staff_table SET google_id = ?, google_picture = ? WHERE StaffID = ?',
        [googleId, picture, staff.StaffID]
      );
    }

    // 7. Generate JWT token
    const token = jwt.sign(
      {
        StaffID: staff.StaffID,
        email: staff.OfficialEmailAddress,
        role: staff.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 8. Fetch user permissions
    const permissionsQuery = `
      SELECT * FROM permissions_table
      WHERE StaffID = ?
    `;
    const permissions = await db.query(permissionsQuery, [staff.StaffID]);

    // 9. Update last login
    await db.query(
      'UPDATE staff_table SET LastLogin = NOW() WHERE StaffID = ?',
      [staff.StaffID]
    );

    // 10. Log successful login
    await logAudit(staff.StaffID, 'Logged in via Google SSO', token);

    // 11. Return success response
    return res.status(200).json({
      message: 'success',
      userData: [{
        StaffID: staff.StaffID,
        FirstName: staff.FirstName,
        LastName: staff.LastName,
        OfficialEmailAddress: staff.OfficialEmailAddress,
        Department: staff.Department,
        Role: staff.Role,
        token: token,
        PhoneNumber: staff.PhoneNumber,
        GoogleLinked: true,
        GooglePicture: picture
      }],
      permissionData: permissions
    });

  } catch (error) {
    console.error('Google SSO Login Error:', error);
    return res.status(500).json({
      message: 'error',
      error: 'An error occurred during authentication'
    });
  }
});

// Helper function for audit logging
async function logAudit(staffId, action, token = '') {
  const query = `
    INSERT INTO audit_log (StaffID, Action, Timestamp, Token)
    VALUES (?, ?, NOW(), ?)
  `;
  await db.query(query, [staffId, action, token]);
}
```

---

### PHP + MySQL Example

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
require_once 'config/database.php';
require_once 'vendor/autoload.php'; // For JWT library

use Firebase\JWT\JWT;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $email = $data['email'] ?? '';
    $googleId = $data['googleId'] ?? '';
    $name = $data['name'] ?? '';
    $picture = $data['picture'] ?? '';
    $credential = $data['credential'] ?? '';

    // 1. Validate required fields
    if (empty($email) || empty($googleId) || empty($credential)) {
        http_response_code(400);
        echo json_encode([
            'message' => 'error',
            'error' => 'Missing required fields'
        ]);
        exit;
    }

    // 2. Verify email domain
    $allowedDomain = '@cosmopolitan.edu.ng';
    if (!str_ends_with($email, $allowedDomain)) {
        http_response_code(403);
        echo json_encode([
            'message' => 'invalid_domain',
            'error' => "Email must be from $allowedDomain domain"
        ]);
        exit;
    }

    // 3. Optional: Verify token with Google
    $verifyUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=" . $credential;
    $tokenInfo = json_decode(file_get_contents($verifyUrl), true);

    if (!$tokenInfo || $tokenInfo['email'] !== $email) {
        http_response_code(403);
        echo json_encode([
            'message' => 'error',
            'error' => 'Invalid Google token'
        ]);
        exit;
    }

    // 4. Find staff by email
    $stmt = $conn->prepare("
        SELECT * FROM staff_table
        WHERE OfficialEmailAddress = ?
        AND Status = 'Active'
        LIMIT 1
    ");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        // Log failed attempt
        logAudit($conn, $email, 'Google SSO login failed - account not found');

        http_response_code(404);
        echo json_encode([
            'message' => 'not_found',
            'error' => 'No staff account found with this email'
        ]);
        exit;
    }

    $staff = $result->fetch_assoc();

    // 5. Update Google ID if not set
    if (empty($staff['google_id'])) {
        $updateStmt = $conn->prepare("
            UPDATE staff_table
            SET google_id = ?, google_picture = ?
            WHERE StaffID = ?
        ");
        $updateStmt->bind_param("sss", $googleId, $picture, $staff['StaffID']);
        $updateStmt->execute();
    }

    // 6. Generate JWT token
    $secretKey = getenv('JWT_SECRET');
    $issuedAt = time();
    $expire = $issuedAt + (24 * 60 * 60); // 24 hours

    $tokenPayload = [
        'iat' => $issuedAt,
        'exp' => $expire,
        'StaffID' => $staff['StaffID'],
        'email' => $staff['OfficialEmailAddress'],
        'role' => $staff['Role']
    ];

    $token = JWT::encode($tokenPayload, $secretKey, 'HS256');

    // 7. Get permissions
    $permStmt = $conn->prepare("
        SELECT * FROM permissions_table
        WHERE StaffID = ?
    ");
    $permStmt->bind_param("s", $staff['StaffID']);
    $permStmt->execute();
    $permResult = $permStmt->get_result();
    $permissions = $permResult->fetch_all(MYSQLI_ASSOC);

    // 8. Update last login
    $updateLoginStmt = $conn->prepare("
        UPDATE staff_table
        SET LastLogin = NOW()
        WHERE StaffID = ?
    ");
    $updateLoginStmt->bind_param("s", $staff['StaffID']);
    $updateLoginStmt->execute();

    // 9. Log successful login
    logAudit($conn, $staff['StaffID'], 'Logged in via Google SSO', $token);

    // 10. Return success response
    echo json_encode([
        'message' => 'success',
        'userData' => [[
            'StaffID' => $staff['StaffID'],
            'FirstName' => $staff['FirstName'],
            'LastName' => $staff['LastName'],
            'OfficialEmailAddress' => $staff['OfficialEmailAddress'],
            'Department' => $staff['Department'],
            'Role' => $staff['Role'],
            'token' => $token,
            'PhoneNumber' => $staff['PhoneNumber'],
            'GoogleLinked' => true,
            'GooglePicture' => $picture
        ]],
        'permissionData' => $permissions
    ]);

} else {
    http_response_code(405);
    echo json_encode([
        'message' => 'error',
        'error' => 'Method not allowed'
    ]);
}

function logAudit($conn, $staffId, $action, $token = '') {
    $stmt = $conn->prepare("
        INSERT INTO audit_log (StaffID, Action, Timestamp, Token)
        VALUES (?, ?, NOW(), ?)
    ");
    $stmt->bind_param("sss", $staffId, $action, $token);
    $stmt->execute();
}
?>
```

---

## Database Schema Additions

### Optional: Add Google-specific fields to staff table

```sql
ALTER TABLE staff_table
ADD COLUMN google_id VARCHAR(100) DEFAULT NULL,
ADD COLUMN google_picture TEXT DEFAULT NULL,
ADD COLUMN google_linked_at DATETIME DEFAULT NULL,
ADD INDEX idx_google_id (google_id);
```

### Update when linking Google account

```sql
UPDATE staff_table
SET
    google_id = ?,
    google_picture = ?,
    google_linked_at = NOW()
WHERE StaffID = ?;
```

---

## Security Considerations

1. **Token Verification**
   - Always verify the Google access token with Google's API
   - Don't trust the frontend-provided data alone

2. **Email Domain Validation**
   - Restrict to institutional email domain
   - Prevent unauthorized access from personal emails

3. **Rate Limiting**
   - Implement rate limiting on the endpoint
   - Prevent brute force attempts

4. **Logging**
   - Log all authentication attempts
   - Include timestamp, IP address, and result

5. **CORS Configuration**
   - Only allow requests from authorized domains
   - Don't use wildcard (*) in production

6. **Error Messages**
   - Don't expose sensitive information in errors
   - Use generic messages for security failures

---

## Testing the Endpoint

### Using cURL

```bash
curl -X POST https://gargatechapi.com.ng:5008/login/staff_portal_google_login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@cosmopolitan.edu.ng",
    "googleId": "102345678901234567890",
    "name": "Test User",
    "picture": "https://lh3.googleusercontent.com/a/default-user",
    "credential": "ya29.test_token",
    "authType": "google"
  }'
```

### Using Postman

1. Method: POST
2. URL: `https://gargatechapi.com.ng:5008/login/staff_portal_google_login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "test@cosmopolitan.edu.ng",
  "googleId": "102345678901234567890",
  "name": "Test User",
  "picture": "https://lh3.googleusercontent.com/a/default-user",
  "credential": "ya29.test_token",
  "authType": "google"
}
```

---

## Additional Features to Consider

### 1. Account Linking Flow
Allow staff to link their Google account from their profile:

```javascript
// Endpoint: POST /staff/link-google-account
router.post('/staff/link-google-account', authenticateJWT, async (req, res) => {
  const { googleId, googleEmail } = req.body;
  const staffId = req.user.StaffID;

  // Verify the Google email matches staff email
  // Update database with Google ID
  // Return success
});
```

### 2. Account Unlinking
Allow staff to unlink their Google account:

```javascript
// Endpoint: POST /staff/unlink-google-account
router.post('/staff/unlink-google-account', authenticateJWT, async (req, res) => {
  const staffId = req.user.StaffID;

  await db.query(
    'UPDATE staff_table SET google_id = NULL WHERE StaffID = ?',
    [staffId]
  );

  res.json({ message: 'success' });
});
```

### 3. Admin Dashboard
Show Google SSO statistics:
- Number of staff using Google SSO
- Recent Google logins
- Failed authentication attempts

---

**Last Updated:** 2025-01-12
**Version:** 1.0.0
