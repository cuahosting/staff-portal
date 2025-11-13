import React, { useState } from 'react';
import Input from './Input';
import SearchSelect from './SearchSelect';

/**
 * ExampleForm - Comprehensive demonstration of Input and SearchSelect components
 *
 * This form demonstrates:
 * - Multiple input types (text, email, number, password, date, tel)
 * - SearchSelect with both modern and legacy data formats
 * - Form validation with error handling
 * - Real-time validation on change
 * - Form submission with data processing
 * - Multi-select functionality
 * - Disabled states
 * - Required vs optional fields
 */
const ExampleForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    // Text inputs
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    age: '',
    password: '',
    confirmPassword: '',
    startDate: '',

    // Select inputs
    country: null,
    department: null,
    skills: [], // Multi-select
    priority: null
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Options for SearchSelect components

  // Modern format: {value, label}
  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'in', label: 'India' }
  ];

  // Legacy format: {id, text} - demonstrates backward compatibility
  const departmentOptions = [
    { id: '1', text: 'Computer Science' },
    { id: '2', text: 'Mathematics' },
    { id: '3', text: 'Physics' },
    { id: '4', text: 'Chemistry' },
    { id: '5', text: 'Biology' },
    { id: '6', text: 'Engineering' },
    { id: '7', text: 'Business Administration' },
    { id: '8', text: 'Arts and Humanities' }
  ];

  // Modern format for multi-select
  const skillOptions = [
    { value: 'react', label: 'React' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'sql', label: 'SQL' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'aws', label: 'AWS' },
    { value: 'docker', label: 'Docker' }
  ];

  // Options without auto-sort (preserve order)
  const priorityOptions = [
    { value: 'urgent', label: 'Urgent (Respond within 24 hours)' },
    { value: 'high', label: 'High (Respond within 3 days)' },
    { value: 'medium', label: 'Medium (Respond within 1 week)' },
    { value: 'low', label: 'Low (No specific timeline)' }
  ];

  // Validation functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    // Basic phone validation (allows various formats)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  // Input change handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }

    // Real-time validation for specific fields
    validateField(id, value);
  };

  // Select change handlers
  const handleSelectChange = (field) => (selectedOption) => {
    setFormData(prev => ({ ...prev, [field]: selectedOption }));

    // Clear error when user makes selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Real-time field validation
  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'email':
        if (value && !isValidEmail(value)) {
          error = 'Please enter a valid email address (e.g., user@example.com)';
        }
        break;

      case 'phoneNumber':
        if (value && !isValidPhone(value)) {
          error = 'Please enter a valid phone number (minimum 10 digits)';
        }
        break;

      case 'age':
        const age = parseInt(value);
        if (value && (isNaN(age) || age < 18 || age > 120)) {
          error = 'Age must be between 18 and 120';
        }
        break;

      case 'confirmPassword':
        if (value && value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;

      case 'password':
        if (value && value.length < 8) {
          error = 'Password must be at least 8 characters long';
        }
        // Also validate confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else if (formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
        break;

      default:
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    } else {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // Comprehensive form validation
  const validateForm = () => {
    const newErrors = {};

    // Required text fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 18 || age > 120) {
        newErrors.age = 'Age must be between 18 and 120';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    // Required select fields
    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }

    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    if (!formData.skills || formData.skills.length === 0) {
      newErrors.skills = 'Please select at least one skill';
    }

    // Priority is optional, so no validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('');

    // Validate form
    if (!validateForm()) {
      setSubmitMessage('Please fix the errors above before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Process form data for submission
      const submissionData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        age: parseInt(formData.age),
        startDate: formData.startDate,

        // Extract values from select options
        countryCode: formData.country?.value,
        countryName: formData.country?.label,

        // Legacy format handling
        departmentId: formData.department?.value || formData.department?.id,
        departmentName: formData.department?.label || formData.department?.text,

        // Multi-select array
        skills: formData.skills.map(skill => ({
          id: skill.value,
          name: skill.label
        })),

        // Optional field
        priority: formData.priority?.value || null
      };

      console.log('Form submitted successfully:', submissionData);

      setSubmitMessage('Form submitted successfully!');

      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      age: '',
      password: '',
      confirmPassword: '',
      startDate: '',
      country: null,
      department: null,
      skills: [],
      priority: null
    });
    setErrors({});
    setSubmitMessage('');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Example Form - Input & SearchSelect Components</h3>
            </div>
            <div className="card-body">
              <p className="text-muted mb-4">
                This form demonstrates all features of the Input and SearchSelect components,
                including validation, error handling, and different data formats.
              </p>

              <form onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <div className="border rounded p-3 mb-4 bg-light">
                  <h5 className="mb-3">Personal Information</h5>

                  <div className="row">
                    <div className="col-md-6">
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        label="First Name"
                        placeholder="Enter your first name"
                        error={errors.firstName}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        label="Last Name"
                        placeholder="Enter your last name"
                        error={errors.lastName}
                        required
                      />
                    </div>
                  </div>

                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    label="Email Address"
                    placeholder="user@example.com"
                    error={errors.email}
                    required
                  />

                  <div className="row">
                    <div className="col-md-6">
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        label="Phone Number"
                        placeholder="+1 (555) 123-4567"
                        error={errors.phoneNumber}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={handleInputChange}
                        label="Age"
                        placeholder="Enter your age"
                        min="18"
                        max="120"
                        error={errors.age}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Department Section */}
                <div className="border rounded p-3 mb-4 bg-light">
                  <h5 className="mb-3">Location & Department</h5>

                  <SearchSelect
                    id="country"
                    options={countryOptions}
                    value={formData.country}
                    onChange={handleSelectChange('country')}
                    label="Country"
                    placeholder="Select your country"
                    error={errors.country}
                    required
                  />

                  <SearchSelect
                    id="department"
                    options={departmentOptions}
                    value={formData.department}
                    onChange={handleSelectChange('department')}
                    label="Department (Legacy Format Example)"
                    placeholder="Select your department"
                    error={errors.department}
                    required
                  />

                  <SearchSelect
                    id="skills"
                    options={skillOptions}
                    value={formData.skills}
                    onChange={handleSelectChange('skills')}
                    label="Skills (Multi-Select)"
                    placeholder="Select your skills"
                    error={errors.skills}
                    isMulti
                    required
                  />

                  <SearchSelect
                    id="priority"
                    options={priorityOptions}
                    value={formData.priority}
                    onChange={handleSelectChange('priority')}
                    label="Priority Level (Optional, No Auto-Sort)"
                    placeholder="Select priority level"
                    autoSort={false}
                  />
                </div>

                {/* Account Security Section */}
                <div className="border rounded p-3 mb-4 bg-light">
                  <h5 className="mb-3">Account Security</h5>

                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    label="Password"
                    placeholder="Enter password (min 8 characters)"
                    error={errors.password}
                    required
                    autoComplete="new-password"
                  />

                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    error={errors.confirmPassword}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {/* Start Date Section */}
                <div className="border rounded p-3 mb-4 bg-light">
                  <h5 className="mb-3">Start Date</h5>

                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    label="Start Date"
                    error={errors.startDate}
                    required
                  />
                </div>

                {/* Submit Message */}
                {submitMessage && (
                  <div
                    className={`alert ${
                      submitMessage.includes('success')
                        ? 'alert-success'
                        : 'alert-danger'
                    } mb-3`}
                  >
                    {submitMessage}
                  </div>
                )}

                {/* Form Actions */}
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Form'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Usage Tips Card */}
          <div className="card shadow mt-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Component Features Demonstrated</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary">Input Component:</h6>
                  <ul className="small">
                    <li>Text input (First/Last Name)</li>
                    <li>Email input with validation</li>
                    <li>Tel input for phone numbers</li>
                    <li>Number input with min/max</li>
                    <li>Password input with confirmation</li>
                    <li>Date input</li>
                    <li>Required field indicators</li>
                    <li>Real-time validation</li>
                    <li>Error message display</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary">SearchSelect Component:</h6>
                  <ul className="small">
                    <li>Modern format (Country - value/label)</li>
                    <li>Legacy format (Department - id/text)</li>
                    <li>Multi-select (Skills)</li>
                    <li>Auto-sort enabled (Country, Department)</li>
                    <li>Auto-sort disabled (Priority)</li>
                    <li>Required validation</li>
                    <li>Optional field (Priority)</li>
                    <li>Searchable dropdown</li>
                    <li>Clear button functionality</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleForm;
