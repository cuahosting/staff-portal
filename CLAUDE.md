# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **staff portal** for Cosmopolitan University, built with React and Create React App. The application is a university management system for staff members to manage academic operations, human resources, student registration, assessments, and administrative tasks.

The codebase is designed to support multiple universities (Baba Ahmed, Olivia, Al-Ansar, Lux Mundi, and Cosmopolitan) through configuration constants. Currently configured for **Cosmopolitan University**.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm start

# Run tests in interactive watch mode
npm test

# Build for production
npm run build
```

## Configuration & Multi-University Support

The application supports multiple universities through configuration files:

- **`src/resources/url.js`**: Contains `serverStatus` (Dev/Production), `serverLink` (backend API URL), and project-specific constants (name, phone, email, address)
- **`src/resources/constants.js`**: Contains all project configuration including:
  - `projectCode`: Used in Redux action types (currently `COSMOPOLITAN_UNIVERSITY_STAFF_PORTAL`)
  - `shortCode`: Used in Redux persist storage key (currently `CU`)
  - Project branding: logo, URLs, contact info, social media links
  - University-specific domains for email addresses

**To switch universities**: Uncomment the desired configuration block in both files and comment out the current one.

## Architecture

### State Management (Redux)

The application uses **Redux with Redux Persist** for state management:

- **Store configuration**: `src/index.js` - Conditional setup based on `serverStatus` (includes logger in Dev mode)
- **Root Reducer**: `src/reducers/rootReducer.js` - Combines all reducers with persistence
- **Reducers**: `src/reducers/detailsReducer.js` - Contains:
  - `LoginDetailsReducer`: Authentication state
  - `PermissionDetailsReducer`: User permissions/role-based access
  - `FacultyListReducer`: Faculty data cache
  - `DepartmentListReducer`: Department data cache
  - `currentSemesterReducer`: Active semester
  - `generalDetailsReducer`: General application state
  - `dashboardDaraReducer`: Dashboard data
- **Actions**: `src/actions/setactiondetails.js` - Action creators for dispatching state updates
- **Persistence**: Uses `redux-persist` with `localStorage`, key format: `{shortCode}_staff_` (e.g., `cu_staff_`)

### Routing Architecture

- **`src/App.js`**: Root component that conditionally renders routes based on authentication state:
  - `loginData.length < 1` → `PublicRoutes` (login, password reset)
  - Otherwise → `PageRoutes` (authenticated routes)
- **`src/component/pageroutes/pageroutes.jsx`**: Main routing file with 100+ routes for authenticated users
- **`src/component/pageroutes/publicroutes.jsx`**: Public routes (login, forgot password, reset password)

All authenticated pages include `<Header />` and `<Footer />` components.

### Component Structure

Components are organized by functional domain:

- **`academic/`**: Faculty, departments, courses, modules, timetable management, timetable planning
- **`assessments/`**: CA settings/entry, exam management, grading, attendance, academic results
- **`authentication/`**: Login, password reset, forgot password
- **`common/`**: Reusable components (header, footer, navigation, modal, loader, table, barcode, error pages)
- **`dashboard/`**: Main dashboard and dashboard sections
- **`human-resources/`**: Staff management, payroll, pension, jobs/recruitment, qualifications, finance, inventory, staff leave
- **`registration/`**: Student admissions, semester registration, hostel allocation, progressions, deferment, change of course, transcript applications
- **`settings/`**: Permission management (menus, groups, permissions), registration settings
- **`user/`**: Staff reports, student reports, profile management, ID cards, publications, graduation clearance, service desk

### Common Utilities (`src/resources/constants.js`)

Key utility functions:

- **`formatDateAndTime(date, option)`**: Formats dates with options: `"date_and_time"`, `"date"`, `"day"`, `"full_month"`, `"short_month"`, `"year_only"`, `"month_and_year"`
- **`formatDate(date)`**: Returns YYYY-MM-DD format
- **`currencyConverter(amount)`**: Formats numbers as Nigerian Naira (NGN)
- **`sendEmail(email, subject, title, name, body, signature)`**: Sends email via backend API
- **`encryptData(string, val)`** / **`decryptData(string, val)`**: AES encryption using CryptoJS with project-specific keys
- **`EmailTemplates(type, interview)`**: Returns predefined email templates for job applications, interviews, offers, staff onboarding
- **`Audit(staff_id, message, header)`**: Logs staff actions for audit trail
- **`convertNumbertoWords(s)`**: Converts numbers to words
- **`dynamicSort(property)`**: Returns sort comparator for arrays

### Backend Communication

- **API Base URL**: `serverLink` from `src/resources/url.js`
  - Dev: `http://localhost:4480/`
  - Production: `https://backend.cosmopolitan.edu.ng:4480/`
- **HTTP Client**: Axios
- **File Upload API Key**: `simpleFileUploadAPIKey` in `src/resources/url.js`

### Authentication Flow

1. User logs in via `PublicRoutes` → sets `LoginDetails` in Redux
2. `App.js` checks `loginData.length` to determine which routes to render
3. Authenticated state persists across sessions via `redux-persist`
4. User permissions stored in `PermissionDetails` for role-based access control

### Google OAuth

The app uses Google OAuth for authentication:
- Provider: `GoogleOAuthProvider` wraps the entire app in `App.js`
- Client ID is hardcoded in `App.js` (line 11)

## Important Patterns

### Multi-Institution Configuration

When making changes that involve institution-specific constants:
- Always use exported constants from `src/resources/constants.js` and `src/resources/url.js`
- Never hardcode university names, URLs, or contact information
- The system is designed to switch universities by changing configuration only

### Permission-Based Features

Many features are permission-gated. Check `PermissionDetails` from Redux state before rendering restricted UI or allowing actions.

### Email Template System

The application has predefined email templates for:
- Job applications and interviews (`EmailTemplates` type 1)
- Application rejections (type 2)
- Job offers (type 3)
- Staff onboarding (type 4)
- Password recovery (type 5)

Use `sendEmail()` utility with appropriate template type.

### Audit Logging

Use `Audit(staff_id, message)` to log significant staff actions throughout the application for compliance and tracking.

## Testing

Tests are configured via Create React App:
- Test runner: Jest
- React testing utilities: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- Run single test: `npm test -- --testNamePattern="test name"`
- Run specific file: `npm test -- path/to/file.test.js`

## Key Dependencies

- **UI Framework**: Material-UI v4 & v5 (mixed versions), React Bootstrap, MDBReact
- **Forms**: React Hook Form
- **Rich Text Editor**: Jodit React, Draft.js with draft-js-to-html
- **Data Tables**: MUI Datatables, React Data Table Component
- **PDF/Export**: React PDF, React Export Table to Excel, React JSON to CSV
- **Charts**: React Google Charts, React Circular Progressbar
- **Barcode/QR**: JSBarcode, React Barcode, Next QRCode
- **Notifications**: React Toastify, SweetAlert
- **State**: Redux, React Redux, Redux Thunk, Redux Logger, Redux Persist
- **Routing**: React Router DOM v6
- **Security**: Crypto-JS, DOMPurify
- **Date**: React Moment
- **Idle Detection**: React Idle Timer
- **Printing**: React to Print

## Common Issues

### Google OAuth Client ID
The Google OAuth client ID is hardcoded in `App.js`. For production deployments, this should be moved to environment variables.

### Mixed Material-UI Versions
The project uses both Material-UI v4 (`@material-ui/*`) and v5 (`@mui/*`). Be careful when adding new Material-UI components to use the correct import path.

### Encryption Keys
The encryption/decryption functions use project-specific keys. Changing `projectCode` will break decryption of existing encrypted data.

## File Naming Conventions

- Components: kebab-case for files (e.g., `add-edit-staff.jsx`)
- Component exports: PascalCase (e.g., `AddEditStaff`)
- Utilities: kebab-case (e.g., `constants.js`, `url.js`)
- Reducers: camelCase with "Reducer" suffix (e.g., `LoginDetailsReducer`)
