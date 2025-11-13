# Form Components Documentation

Standardized, reusable form components for the application using Bootstrap 5 and React.

## Table of Contents

- [Overview](#overview)
- [Components](#components)
  - [Input](#input-component)
  - [SearchSelect](#searchselect-component)
- [Migration Guide](#migration-guide)
- [Example Usage](#example-usage)
- [Best Practices](#best-practices)

---

## Overview

This library provides two core form components that standardize form inputs across the application:

1. **Input** - A flexible text input component with validation and error handling
2. **SearchSelect** - A searchable dropdown built on react-select with legacy format support

Both components:
- Follow Bootstrap 5 styling conventions
- Support error states with visual feedback
- Include label and required field indicators
- Are fully accessible with proper ARIA attributes
- Accept additional props for extensibility

---

## Components

### Input Component

A standardized input component that wraps the native HTML input element with consistent styling, validation, and error handling.

#### Import

```jsx
import Input from './component/common/form/Input';
```

#### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `id` | string | - | Yes | Unique identifier for the input (used for both id and name) |
| `type` | string | 'text' | No | Input type (text, number, email, password, date, etc.) |
| `value` | string/number | - | Yes | Controlled input value |
| `onChange` | function | - | Yes | Change handler function `(event) => void` |
| `placeholder` | string | - | No | Placeholder text displayed when empty |
| `label` | string | - | No | Label text displayed above the input |
| `required` | boolean | false | No | Shows red asterisk and adds HTML5 required attribute |
| `disabled` | boolean | false | No | Disables the input field |
| `error` | string | '' | No | Error message to display below the input |
| `className` | string | '' | No | Additional CSS classes to add to the input element |
| `...props` | object | - | No | Any additional props are passed to the native input element |

#### Usage Examples

##### Basic Text Input

```jsx
import React, { useState } from 'react';
import Input from './component/common/form/Input';

function MyForm() {
  const [name, setName] = useState('');

  return (
    <Input
      id="name"
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      label="Full Name"
      placeholder="Enter your full name"
      required
    />
  );
}
```

##### Email Input with Validation

```jsx
import React, { useState } from 'react';
import Input from './component/common/form/Input';

function EmailForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  };

  return (
    <Input
      id="email"
      type="email"
      value={email}
      onChange={handleChange}
      label="Email Address"
      placeholder="user@example.com"
      error={emailError}
      required
    />
  );
}
```

##### Number Input with Min/Max

```jsx
<Input
  id="age"
  type="number"
  value={age}
  onChange={(e) => setAge(e.target.value)}
  label="Age"
  placeholder="Enter your age"
  min="18"
  max="100"
  required
/>
```

##### Password Input

```jsx
<Input
  id="password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  label="Password"
  placeholder="Enter password"
  required
  autoComplete="current-password"
/>
```

##### Date Input

```jsx
<Input
  id="birthdate"
  type="date"
  value={birthdate}
  onChange={(e) => setBirthdate(e.target.value)}
  label="Date of Birth"
  required
/>
```

---

### SearchSelect Component

A searchable dropdown component built on `react-select` with support for both modern and legacy data formats, automatic sorting, and Bootstrap 5 theming.

#### Import

```jsx
import SearchSelect from './component/common/form/SearchSelect';
```

#### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `id` | string | - | Yes | Unique identifier for the select input |
| `name` | string | id | No | Name attribute for form submission |
| `options` | array | [] | Yes | Array of options in format `[{value, label}]` or legacy `[{id, text}]` |
| `value` | object/string | - | Yes | Selected value (option object or value string) |
| `onChange` | function | - | Yes | Change handler `(selectedOption, actionMeta) => void` |
| `placeholder` | string | 'Select...' | No | Placeholder text when no option is selected |
| `label` | string | - | No | Label text displayed above the select |
| `required` | boolean | false | No | Shows red asterisk (visual only) |
| `disabled` | boolean | false | No | Disables the select input |
| `isMulti` | boolean | false | No | Enable multi-select mode |
| `isClearable` | boolean | true | No | Show clear button to remove selection |
| `error` | string | '' | No | Error message to display below the select |
| `autoSort` | boolean | true | No | Automatically sort options alphabetically by label |
| `customStyles` | object | {} | No | Custom react-select style overrides |
| `...props` | object | - | No | Additional props passed to react-select component |

#### Option Format

SearchSelect supports multiple option formats:

**Modern Format (Recommended):**
```javascript
const options = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' }
];
```

**Legacy Format (Automatically Converted):**
```javascript
const options = [
  { id: 'us', text: 'United States' },
  { id: 'uk', text: 'United Kingdom' },
  { id: 'ca', text: 'Canada' }
];
```

**String Array (Simple Options):**
```javascript
const options = ['Option 1', 'Option 2', 'Option 3'];
```

#### Usage Examples

##### Basic Select

```jsx
import React, { useState } from 'react';
import SearchSelect from './component/common/form/SearchSelect';

function CountrySelector() {
  const [country, setCountry] = useState(null);

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' }
  ];

  return (
    <SearchSelect
      id="country"
      options={countryOptions}
      value={country}
      onChange={setCountry}
      label="Country"
      placeholder="Select a country"
      required
    />
  );
}
```

##### Select with Legacy Format

```jsx
// Existing code using {id, text} format works without changes
const [department, setDepartment] = useState(null);

const departmentOptions = [
  { id: '1', text: 'Engineering' },
  { id: '2', text: 'Marketing' },
  { id: '3', text: 'Sales' },
  { id: '4', text: 'Human Resources' }
];

return (
  <SearchSelect
    id="department"
    options={departmentOptions}
    value={department}
    onChange={setDepartment}
    label="Department"
    required
  />
);
```

##### Multi-Select

```jsx
const [skills, setSkills] = useState([]);

const skillOptions = [
  { value: 'react', label: 'React' },
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' }
];

return (
  <SearchSelect
    id="skills"
    options={skillOptions}
    value={skills}
    onChange={setSkills}
    label="Skills"
    placeholder="Select skills"
    isMulti
    required
  />
);
```

##### Select Without Auto-Sort

```jsx
// Preserve original order (e.g., for priority-sorted options)
const priorityOptions = [
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'low', label: 'Low Priority' }
];

return (
  <SearchSelect
    id="priority"
    options={priorityOptions}
    value={priority}
    onChange={setPriority}
    label="Priority Level"
    autoSort={false}
  />
);
```

##### Select with Error Handling

```jsx
const [category, setCategory] = useState(null);
const [categoryError, setCategoryError] = useState('');

const handleCategoryChange = (selectedOption) => {
  setCategory(selectedOption);
  if (!selectedOption) {
    setCategoryError('Please select a category');
  } else {
    setCategoryError('');
  }
};

return (
  <SearchSelect
    id="category"
    options={categoryOptions}
    value={category}
    onChange={handleCategoryChange}
    label="Category"
    error={categoryError}
    required
  />
);
```

##### Custom Styling

```jsx
const customStyles = {
  control: (base) => ({
    ...base,
    minHeight: '50px',
    fontSize: '16px'
  }),
  menu: (base) => ({
    ...base,
    zIndex: 10000
  })
};

return (
  <SearchSelect
    id="custom"
    options={options}
    value={selected}
    onChange={setSelected}
    label="Custom Styled"
    customStyles={customStyles}
  />
);
```

---

## Migration Guide

### Migrating from Inline Inputs

#### Before (Old Pattern)

```jsx
function OldForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');

  return (
    <div>
      <div className="form-group mb-3">
        <label htmlFor="name">
          Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className={`form-control ${nameError ? 'is-invalid' : ''}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          required
        />
        {nameError && <div className="invalid-feedback">{nameError}</div>}
      </div>

      <div className="form-group mb-3">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
      </div>
    </div>
  );
}
```

#### After (New Pattern)

```jsx
import Input from './component/common/form/Input';

function NewForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');

  return (
    <div>
      <Input
        id="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="Name"
        placeholder="Enter name"
        error={nameError}
        required
      />

      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email"
        placeholder="Enter email"
      />
    </div>
  );
}
```

**Benefits:**
- 15 lines reduced to 8 lines (47% reduction)
- Consistent styling automatically applied
- Error handling simplified
- Required indicator automatic
- More maintainable and readable

---

### Migrating from Inline react-select

#### Before (Old Pattern)

```jsx
import Select from 'react-select';

function OldDepartmentSelect() {
  const [department, setDepartment] = useState(null);

  const departments = [
    { id: '1', text: 'Engineering' },
    { id: '2', text: 'Marketing' },
    { id: '3', text: 'Sales' }
  ];

  // Convert format manually
  const selectOptions = departments.map(d => ({
    value: d.id,
    label: d.text
  }));

  // Sort manually
  const sortedOptions = selectOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderColor: state.isFocused ? '#86b7fe' : '#ced4da',
      boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
      '&:hover': {
        borderColor: '#86b7fe'
      }
    })
  };

  return (
    <div className="form-group mb-3">
      <label htmlFor="department">
        Department <span className="text-danger">*</span>
      </label>
      <Select
        inputId="department"
        options={sortedOptions}
        value={department}
        onChange={setDepartment}
        placeholder="Select department"
        styles={customStyles}
      />
    </div>
  );
}
```

#### After (New Pattern)

```jsx
import SearchSelect from './component/common/form/SearchSelect';

function NewDepartmentSelect() {
  const [department, setDepartment] = useState(null);

  const departments = [
    { id: '1', text: 'Engineering' },
    { id: '2', text: 'Marketing' },
    { id: '3', text: 'Sales' }
  ];

  return (
    <SearchSelect
      id="department"
      options={departments}
      value={department}
      onChange={setDepartment}
      label="Department"
      placeholder="Select department"
      required
    />
  );
}
```

**Benefits:**
- Automatic format conversion (supports `{id, text}` legacy format)
- Automatic alphabetical sorting
- Bootstrap styling pre-configured
- 35 lines reduced to 10 lines (71% reduction)
- No manual data transformation needed

---

### Migrating Complete Forms

#### Before (Old Pattern)

```jsx
function OldStudentForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: null,
    country: null
  });

  const [errors, setErrors] = useState({});

  const departmentOptions = [
    { id: '1', text: 'Computer Science' },
    { id: '2', text: 'Mathematics' },
    { id: '3', text: 'Physics' }
  ].map(d => ({ value: d.id, label: d.text }))
   .sort((a, b) => a.label.localeCompare(b.label));

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field) => (selectedOption) => {
    setFormData(prev => ({ ...prev, [field]: selectedOption }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation and submission logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group mb-3">
        <label htmlFor="firstName">
          First Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
          value={formData.firstName}
          onChange={handleInputChange}
          placeholder="Enter first name"
          required
        />
        {errors.firstName && (
          <div className="invalid-feedback">{errors.firstName}</div>
        )}
      </div>

      <div className="form-group mb-3">
        <label htmlFor="email">
          Email <span className="text-danger">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter email"
          required
        />
        {errors.email && (
          <div className="invalid-feedback">{errors.email}</div>
        )}
      </div>

      <div className="form-group mb-3">
        <label htmlFor="department">
          Department <span className="text-danger">*</span>
        </label>
        <Select
          inputId="department"
          options={departmentOptions}
          value={formData.department}
          onChange={handleSelectChange('department')}
          placeholder="Select department"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
}
```

#### After (New Pattern)

```jsx
import Input from './component/common/form/Input';
import SearchSelect from './component/common/form/SearchSelect';

function NewStudentForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: null,
    country: null
  });

  const [errors, setErrors] = useState({});

  // Legacy format works directly - no conversion needed!
  const departmentOptions = [
    { id: '1', text: 'Computer Science' },
    { id: '2', text: 'Mathematics' },
    { id: '3', text: 'Physics' }
  ];

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' }
  ];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field) => (selectedOption) => {
    setFormData(prev => ({ ...prev, [field]: selectedOption }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation and submission logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        id="firstName"
        type="text"
        value={formData.firstName}
        onChange={handleInputChange}
        label="First Name"
        placeholder="Enter first name"
        error={errors.firstName}
        required
      />

      <Input
        id="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        label="Email"
        placeholder="Enter email"
        error={errors.email}
        required
      />

      <SearchSelect
        id="department"
        options={departmentOptions}
        value={formData.department}
        onChange={handleSelectChange('department')}
        label="Department"
        placeholder="Select department"
        error={errors.department}
        required
      />

      <SearchSelect
        id="country"
        options={countryOptions}
        value={formData.country}
        onChange={handleSelectChange('country')}
        label="Country"
        placeholder="Select country"
      />

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
}
```

**Benefits:**
- 50% reduction in boilerplate code
- Automatic sorting and format conversion
- Consistent error handling
- Cleaner, more maintainable code
- Same functionality with less code

---

## Example Usage

See `ExampleForm.jsx` for a complete working example demonstrating:
- Form state management
- Validation logic
- Error handling
- Form submission
- Mixed input types
- Both Input and SearchSelect components

---

## Best Practices

### 1. Always Use Controlled Components

```jsx
// Good
const [name, setName] = useState('');
<Input value={name} onChange={(e) => setName(e.target.value)} />

// Bad - uncontrolled
<Input defaultValue="initial" />
```

### 2. Validate on Change for Better UX

```jsx
const handleEmailChange = (e) => {
  const value = e.target.value;
  setEmail(value);

  // Validate immediately
  if (value && !isValidEmail(value)) {
    setEmailError('Invalid email format');
  } else {
    setEmailError('');
  }
};
```

### 3. Use Consistent Error State Structure

```jsx
// Good - separate error state
const [errors, setErrors] = useState({
  firstName: '',
  email: '',
  department: ''
});

// Update individual errors
setErrors(prev => ({ ...prev, email: 'Invalid email' }));
```

### 4. Clear Errors on Valid Input

```jsx
const validateField = (name, value) => {
  if (!value) {
    setErrors(prev => ({ ...prev, [name]: 'This field is required' }));
  } else {
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear error
  }
};
```

### 5. Extract Option Data

```jsx
// Good - reusable options
export const COUNTRY_OPTIONS = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' }
];

// Import and use in multiple components
import { COUNTRY_OPTIONS } from './constants/options';
```

### 6. Handle SearchSelect Value Correctly

```jsx
// SearchSelect onChange provides the full option object
const handleDepartmentChange = (selectedOption) => {
  // selectedOption = { value: '1', label: 'Engineering' } or null
  setDepartment(selectedOption);

  // To get just the value:
  const departmentId = selectedOption?.value;
};

// When submitting to API
const submitForm = () => {
  const payload = {
    departmentId: formData.department?.value, // Extract value
    departmentName: formData.department?.label // Extract label if needed
  };
};
```

### 7. Validate Before Submit

```jsx
const handleSubmit = (e) => {
  e.preventDefault();

  // Validate all fields
  const newErrors = {};

  if (!formData.firstName) {
    newErrors.firstName = 'First name is required';
  }

  if (!formData.email) {
    newErrors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    newErrors.email = 'Invalid email format';
  }

  if (!formData.department) {
    newErrors.department = 'Department is required';
  }

  setErrors(newErrors);

  // Only submit if no errors
  if (Object.keys(newErrors).length === 0) {
    // Submit form
    submitToAPI(formData);
  }
};
```

### 8. Provide Clear Error Messages

```jsx
// Good - specific and helpful
error="Email must be in format: user@example.com"
error="Password must be at least 8 characters"
error="Please select a department"

// Bad - vague
error="Invalid input"
error="Error"
```

### 9. Use Semantic HTML Types

```jsx
// Use appropriate input types for better mobile experience
<Input type="email" />   // Shows @ on mobile keyboards
<Input type="tel" />     // Shows number pad on mobile
<Input type="number" />  // Shows numeric keyboard
<Input type="date" />    // Shows date picker
<Input type="url" />     // Shows .com on mobile keyboards
```

### 10. Consider Performance for Large Option Lists

```jsx
// For very large lists, disable auto-sort and sort on server
<SearchSelect
  options={thousandsOfOptions}
  autoSort={false}  // Sort on backend instead
/>

// Or use pagination/virtualization with react-select's async features
```

---

## Accessibility Features

Both components include built-in accessibility features:

1. **Proper Label Association**: Labels are correctly associated with inputs using `htmlFor` and `id`
2. **Required Indicators**: Visual indicators (asterisks) for required fields
3. **Error Announcements**: Error messages are properly associated with inputs
4. **Keyboard Navigation**: Full keyboard support (Tab, Enter, Arrow keys for SearchSelect)
5. **Focus Management**: Proper focus states with Bootstrap styling
6. **ARIA Attributes**: react-select includes comprehensive ARIA support

---

## Component File Locations

- Input Component: `C:\Users\NEW USER\Project\cosmopolitanedu\staff\src\component\common\form\Input.jsx`
- SearchSelect Component: `C:\Users\NEW USER\Project\cosmopolitanedu\staff\src\component\common\form\SearchSelect.jsx`
- Example Form: `C:\Users\NEW USER\Project\cosmopolitanedu\staff\src\component\common\form\ExampleForm.jsx`
- Documentation: `C:\Users\NEW USER\Project\cosmopolitanedu\staff\src\component\common\form\README.md`

---

## Support

For questions or issues with these components, please contact the development team or create an issue in the project repository.

---

## Version History

- **v1.0.0** - Initial release with Input and SearchSelect components
  - Bootstrap 5 integration
  - Legacy format support for SearchSelect
  - Auto-sorting functionality
  - Comprehensive error handling
