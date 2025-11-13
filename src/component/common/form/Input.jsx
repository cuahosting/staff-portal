import React from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized Input Component with Floating Labels
 *
 * A reusable form input component with built-in validation, error handling,
 * and Bootstrap 5 floating label styling. Supports all standard HTML input types
 * and provides consistent styling across the application.
 *
 * Features:
 * - Bootstrap 5 floating labels (label animates when input has focus or value)
 * - Visual error states with error messages
 * - Required field indicators with asterisks
 * - Disabled state support
 * - Fully controlled component pattern
 * - Accessibility features (htmlFor, aria-describedby)
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
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputClasses = `form-control ${error ? 'is-invalid' : ''} ${className}`.trim();
  const errorId = error ? `${id}-error` : undefined;

  // Use label if provided, otherwise use placeholder for label text
  const labelText = label || placeholder;

  // Determine the actual input type (toggle for password)
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const isPasswordField = type === 'password';

  return (
    <div className="mb-4">
      <div className="form-floating" style={{ position: 'relative' }}>
        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder || labelText}
          required={required}
          disabled={disabled}
          className={inputClasses}
          style={{
            borderColor: error ? '#dc3545' : '#0056b3',
            borderWidth: '2px',
            borderRadius: '12px',
            boxShadow: error
              ? '0 4px 12px rgba(220, 53, 69, 0.2)'
              : '0 4px 12px rgba(0, 86, 179, 0.15)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: '1.05rem',
            padding: '1.5rem 1rem 0.5rem',
            paddingRight: isPasswordField ? '3.5rem' : '1rem',
            height: '60px',
            ...props.style
          }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          onFocus={(e) => {
            e.target.style.borderColor = error ? '#dc3545' : '#667eea';
            e.target.style.boxShadow = error
              ? '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
              : '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#dc3545' : '#0056b3';
            e.target.style.boxShadow = error
              ? '0 4px 12px rgba(220, 53, 69, 0.2)'
              : '0 4px 12px rgba(0, 86, 179, 0.15)';
          }}
          {...props}
        />
        {labelText && (
          <label htmlFor={id} style={{
            color: '#6c757d',
            fontWeight: '500',
            fontSize: '0.95rem',
            transition: 'all 0.2s ease',
            paddingLeft: '0.75rem'
          }}>
            {labelText}
            {required && <span className="text-danger" aria-label="required"> *</span>}
          </label>
        )}
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6c757d',
              transition: 'all 0.2s ease',
              zIndex: 10,
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#667eea';
              e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6c757d';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <div
          id={errorId}
          className="text-danger small mt-2"
          role="alert"
          style={{
            animation: 'fadeIn 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: '500'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </div>
      )}
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
  readOnly: PropTypes.bool
};

export default Input;
