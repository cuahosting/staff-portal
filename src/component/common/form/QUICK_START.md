# Form Components - Quick Start Guide

A quick reference for using the standardized Input and SearchSelect components.

## Installation

No installation needed - components are already in your project!

```
src/component/common/form/
  ├── Input.jsx           (Text input component)
  ├── SearchSelect.jsx    (Dropdown component)
  ├── ExampleForm.jsx     (Full example)
  ├── README.md           (Detailed docs)
  ├── IMPROVEMENTS.md     (Technical details)
  └── index.js            (Exports)
```

---

## Basic Import

```jsx
// Import individual components
import Input from './component/common/form/Input';
import SearchSelect from './component/common/form/SearchSelect';

// OR import from index
import { Input, SearchSelect } from './component/common/form';
```

---

## Input Component - 30 Second Tutorial

### Simplest Usage
```jsx
const [name, setName] = useState('');

<Input
  id="name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  label="Name"
  required
/>
```

### With Validation
```jsx
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

<Input
  id="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  label="Email"
  placeholder="user@example.com"
  error={emailError}
  required
/>
```

### Common Types
```jsx
// Text
<Input id="name" type="text" value={name} onChange={handleChange} label="Name" />

// Email
<Input id="email" type="email" value={email} onChange={handleChange} label="Email" />

// Number
<Input id="age" type="number" value={age} onChange={handleChange} label="Age" min="18" max="120" />

// Password
<Input id="password" type="password" value={password} onChange={handleChange} label="Password" />

// Date
<Input id="date" type="date" value={date} onChange={handleChange} label="Date" />

// Phone
<Input id="phone" type="tel" value={phone} onChange={handleChange} label="Phone" />
```

---

## SearchSelect Component - 30 Second Tutorial

### Simplest Usage
```jsx
const [country, setCountry] = useState(null);

const options = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' }
];

<SearchSelect
  id="country"
  options={options}
  value={country}
  onChange={setCountry}
  label="Country"
  required
/>
```

### Legacy Format (Works Automatically!)
```jsx
const [department, setDepartment] = useState(null);

// Old format - component converts automatically
const options = [
  { id: '1', text: 'Engineering' },
  { id: '2', text: 'Marketing' }
];

<SearchSelect
  id="department"
  options={options}
  value={department}
  onChange={setDepartment}
  label="Department"
/>
```

### Multi-Select
```jsx
const [skills, setSkills] = useState([]);

<SearchSelect
  id="skills"
  options={skillOptions}
  value={skills}
  onChange={setSkills}
  label="Skills"
  isMulti
  required
/>
```

---

## Complete Form Example

```jsx
import React, { useState } from 'react';
import { Input, SearchSelect } from './component/common/form';

function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: null
  });

  const [errors, setErrors] = useState({});

  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' }
  ];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, country: selectedOption }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.country) newErrors.country = 'Country is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Submit form
      console.log('Form data:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        id="name"
        value={formData.name}
        onChange={handleInputChange}
        label="Name"
        error={errors.name}
        required
      />

      <Input
        id="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        label="Email"
        error={errors.email}
        required
      />

      <SearchSelect
        id="country"
        options={countries}
        value={formData.country}
        onChange={handleSelectChange}
        label="Country"
        error={errors.country}
        required
      />

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
}
```

---

## Common Props

### Input Props
| Prop | Type | Example |
|------|------|---------|
| id | string (required) | `id="email"` |
| value | string/number (required) | `value={name}` |
| onChange | function (required) | `onChange={(e) => setName(e.target.value)}` |
| label | string | `label="Full Name"` |
| type | string | `type="email"` (default: 'text') |
| placeholder | string | `placeholder="Enter name"` |
| required | boolean | `required` |
| error | string | `error="This field is required"` |
| disabled | boolean | `disabled` |

### SearchSelect Props
| Prop | Type | Example |
|------|------|---------|
| id | string (required) | `id="country"` |
| options | array (required) | `options={[{value, label}]}` |
| value | object/array (required) | `value={selected}` |
| onChange | function (required) | `onChange={setSelected}` |
| label | string | `label="Country"` |
| placeholder | string | `placeholder="Select..."` |
| required | boolean | `required` |
| error | string | `error="Please select"` |
| isMulti | boolean | `isMulti` |
| isClearable | boolean | `isClearable` (default: true) |
| autoSort | boolean | `autoSort={false}` (default: true) |
| disabled | boolean | `disabled` |

---

## Getting Values from SearchSelect

SearchSelect onChange receives the full option object:

```jsx
const handleChange = (selectedOption) => {
  // selectedOption = { value: 'us', label: 'United States' }
  // OR null if cleared
  // OR array if isMulti

  console.log(selectedOption?.value);  // 'us'
  console.log(selectedOption?.label);  // 'United States'
};
```

When submitting to API:

```jsx
const submitToAPI = () => {
  const payload = {
    countryCode: formData.country?.value,     // 'us'
    countryName: formData.country?.label,     // 'United States'

    // For multi-select
    skillIds: formData.skills.map(s => s.value),
    skillNames: formData.skills.map(s => s.label)
  };

  // Post to API
};
```

---

## Validation Pattern

```jsx
// 1. Create validation function
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// 2. Validate on change (real-time)
const handleEmailChange = (e) => {
  const value = e.target.value;
  setEmail(value);

  if (value && !validateEmail(value)) {
    setEmailError('Invalid email format');
  } else {
    setEmailError('');
  }
};

// 3. Validate on submit (final check)
const handleSubmit = (e) => {
  e.preventDefault();

  const newErrors = {};
  if (!email) {
    newErrors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    newErrors.email = 'Invalid email format';
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length === 0) {
    // Submit
  }
};
```

---

## Migration Checklist

Replacing old inline inputs:

1. Import components:
   ```jsx
   import { Input, SearchSelect } from './component/common/form';
   ```

2. Replace `<input>` tags:
   ```jsx
   // Before
   <input
     type="text"
     value={name}
     onChange={(e) => setName(e.target.value)}
   />

   // After
   <Input
     id="name"
     value={name}
     onChange={(e) => setName(e.target.value)}
   />
   ```

3. Replace `<Select>` tags:
   ```jsx
   // Before
   <Select
     options={options}
     value={selected}
     onChange={setSelected}
   />

   // After
   <SearchSelect
     id="country"
     options={options}
     value={selected}
     onChange={setSelected}
   />
   ```

4. Update error handling to use `error` prop

5. Test form submission

---

## Common Issues & Solutions

### Issue: "value must be provided"
**Solution:** Initialize state with empty string/null:
```jsx
const [name, setName] = useState('');        // For Input
const [country, setCountry] = useState(null); // For SearchSelect
```

### Issue: SearchSelect not showing selected value
**Solution:** Make sure value format matches option format:
```jsx
// Option format
options = [{ value: '1', label: 'Option 1' }]

// Value must be the full object, not just the value string
value = { value: '1', label: 'Option 1' }  // Correct
value = '1'  // Will be auto-converted, but use object format
```

### Issue: onChange not triggering
**Solution:** Pass function reference, not function call:
```jsx
onChange={handleChange}     // Correct
onChange={handleChange()}   // Wrong - calls immediately
```

### Issue: Legacy {id, text} format not working
**Solution:** No action needed! Component auto-converts. But verify options array:
```jsx
// This works automatically
options = [
  { id: '1', text: 'Option 1' },
  { id: '2', text: 'Option 2' }
]
```

---

## Need More Help?

1. See `ExampleForm.jsx` for complete working example
2. Read `README.md` for detailed documentation
3. Check `IMPROVEMENTS.md` for technical details
4. Contact development team

---

## Quick Reference - All Props

### Input
```jsx
<Input
  id="fieldId"              // Required
  value={value}             // Required
  onChange={handleChange}   // Required
  type="text"               // Optional
  label="Label"             // Optional
  placeholder="Enter..."    // Optional
  required={false}          // Optional
  disabled={false}          // Optional
  error=""                  // Optional
  className=""              // Optional
  min=""                    // Optional (number/date)
  max=""                    // Optional (number/date)
  step=""                   // Optional (number)
  maxLength={100}           // Optional
  pattern=""                // Optional
  autoComplete=""           // Optional
/>
```

### SearchSelect
```jsx
<SearchSelect
  id="fieldId"              // Required
  options={[]}              // Required
  value={value}             // Required
  onChange={handleChange}   // Required
  name="fieldName"          // Optional
  label="Label"             // Optional
  placeholder="Select..."   // Optional
  required={false}          // Optional
  disabled={false}          // Optional
  isMulti={false}           // Optional
  isClearable={true}        // Optional
  error=""                  // Optional
  autoSort={true}           // Optional
  customStyles={{}}         // Optional
  isLoading={false}         // Optional
  isSearchable={true}       // Optional
  menuPlacement="auto"      // Optional
/>
```

---

## That's It!

You're ready to use the form components. Start with the simple examples above, then explore `ExampleForm.jsx` for advanced patterns.

Happy coding!
