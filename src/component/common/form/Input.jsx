import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

/**
 * Standardized Input Component with Floating Labels (MUI-based)
 *
 * A reusable form input component with built-in validation, error handling,
 * and floating label styling. Supports all standard HTML input types
 * and provides consistent styling across the application.
 *
 * NOW USES MUI TEXTFIELD INTERNALLY
 * API remains the same for backward compatibility
 *
 * Features:
 * - MUI floating labels (label animates when input has focus or value)
 * - Visual error states with error messages
 * - Required field indicators with asterisks
 * - Disabled state support
 * - Fully controlled component pattern
 * - Accessibility features (htmlFor, aria-describedby)
 * - Password visibility toggle with MUI icons
 * - Extensible with additional props
 *
 * @param {string} id - Input id and name attribute (required)
 * @param {string} type - Input type (text, number, email, password, date, etc.)
 * @param {string|number} value - Controlled input value
 * @param {function} onChange - Change handler function (event) => void
 * @param {string} placeholder - Placeholder text (also used for floating label)
 * @param {string} label - Label text (optional, defaults to placeholder if not provided)
 * @param {boolean} required - Required field indicator
 * @param {boolean} disabled - Disabled state
 * @param {string} error - Error message to display
 * @param {string} className - Additional CSS classes for input
 * @param {object} props - Additional props to pass to input element
 *
 * @example
 * <Input
 *   id="email"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   label="Email Address"
 *   placeholder="Email Address"
 *   error={emailError}
 *   required
 * />
 */
const Input = React.memo(({
  id,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  error = '',
  className = '',
  min,
  max,
  step,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  readOnly,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Use label if provided, otherwise use placeholder for label text
  const labelText = label || placeholder;

  // Determine the actual input type (toggle for password)
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const isPasswordField = type === 'password';

  // Build inputProps object for HTML attributes
  const inputProps = {
    min,
    max,
    step,
    maxLength,
    minLength,
    pattern,
    readOnly,
    ...props.inputProps,
  };

  // Password visibility toggle button
  const endAdornment = isPasswordField ? (
    <InputAdornment position="end">
      <IconButton
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        onClick={() => setShowPassword(!showPassword)}
        edge="end"
        sx={{
          color: '#6c757d',
          transition: 'all 0.2s ease',
          borderRadius: '8px',
          '&:hover': {
            color: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
          },
        }}
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  ) : null;

  // Error helper text with icon (matching current design)
  const helperText = error ? (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      {error}
    </span>
  ) : '';

  return (
    <div className="mb-4 p-3">
      <TextField
        id={id}
        name={id}
        type={inputType}
        value={value}
        onChange={onChange}
        label={labelText}
        placeholder={placeholder || labelText}
        required={required}
        disabled={disabled}
        error={!!error}
        helperText={helperText}
        className={className}
        autoComplete={autoComplete}
        inputProps={inputProps}
        InputProps={{
          endAdornment,
          ...props.InputProps,
        }}
        sx={{
          ...style,
        }}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  /** Unique identifier for the input (used for both id and name) */
  id: PropTypes.string.isRequired,

  /** Input type (text, number, email, password, date, tel, url, etc.) */
  type: PropTypes.string,

  /** Controlled input value */
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),

  /** Change handler function (event) => void */
  onChange: PropTypes.func.isRequired,

  /** Placeholder text displayed when input is empty */
  placeholder: PropTypes.string,

  /** Label text displayed above the input */
  label: PropTypes.string,

  /** Shows required indicator (*) and adds HTML5 required attribute */
  required: PropTypes.bool,

  /** Disables the input field */
  disabled: PropTypes.bool,

  /** Error message to display below the input */
  error: PropTypes.string,

  /** Additional CSS classes to apply to the input element */
  className: PropTypes.string,

  /** Min value for number/date inputs */
  min: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),

  /** Max value for number/date inputs */
  max: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),

  /** Step value for number inputs */
  step: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),

  /** Auto-complete attribute */
  autoComplete: PropTypes.string,

  /** Maximum length for text inputs */
  maxLength: PropTypes.number,

  /** Minimum length for text inputs */
  minLength: PropTypes.number,

  /** Pattern for validation (regex string) */
  pattern: PropTypes.string,

  /** Read-only state */
  readOnly: PropTypes.bool,

  /** Custom styles */
  style: PropTypes.object
};

export default Input;
