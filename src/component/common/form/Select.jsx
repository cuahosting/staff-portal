import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

/**
 * Standardized Select Component with Floating Labels (MUI-based)
 *
 * A reusable form select component with built-in validation, error handling,
 * and floating label styling. Provides consistent styling across the application.
 *
 * USES MUI SELECT (TextField with select prop) INTERNALLY
 * API remains the same for backward compatibility
 *
 * Features:
 * - MUI floating labels (label animates when select has focus or value)
 * - Visual error states with error messages
 * - Required field indicators with asterisks
 * - Disabled state support
 * - Fully controlled component pattern
 * - Accessibility features (htmlFor, aria-describedby)
 * - Extensible with additional props
 *
 * @param {string} id - Select id and name attribute (required)
 * @param {string|number} value - Controlled select value
 * @param {function} onChange - Change handler function (event) => void
 * @param {string} placeholder - Placeholder text (also used for floating label)
 * @param {string} label - Label text (optional, defaults to placeholder if not provided)
 * @param {array} options - Options array [{value, label}]
 * @param {boolean} required - Required field indicator
 * @param {boolean} disabled - Disabled state
 * @param {string} error - Error message to display
 * @param {string} className - Additional CSS classes for select
 * @param {object} props - Additional props to pass to select element
 *
 * @example
 * <Select
 *   id="main_menu_id"
 *   value={formData.main_menu_id}
 *   onChange={handleChange}
 *   label="Select Main Menu"
 *   options={mainMenuList.map(item => ({
 *     value: item.EntryID,
 *     label: item.MenuName
 *   }))}
 *   placeholder="Select Main Menu"
 *   required
 * />
 */
const Select = React.memo(({
  id,
  value = '',
  onChange,
  placeholder,
  label,
  options = [],
  required = false,
  disabled = false,
  error = '',
  className = '',
  style,
  ...props
}) => {
  // Use label if provided, otherwise use placeholder for label text
  const labelText = label || placeholder;

  // Error helper text with icon (matching Input component design)
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
        select
        fullWidth
        value={value}
        onChange={onChange}
        label={labelText}
        placeholder={placeholder || labelText}
        required={required}
        disabled={disabled}
        error={!!error}
        helperText={helperText}
        className={className}
        sx={{
          width: '100%',
          ...style,
        }}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  /** Unique identifier for the select (used for both id and name) */
  id: PropTypes.string.isRequired,

  /** Controlled select value */
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),

  /** Change handler function (event) => void */
  onChange: PropTypes.func.isRequired,

  /** Placeholder text displayed when select is empty */
  placeholder: PropTypes.string,

  /** Label text displayed above the select */
  label: PropTypes.string,

  /** Options array [{value, label}] */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),

  /** Shows required indicator (*) and adds HTML5 required attribute */
  required: PropTypes.bool,

  /** Disables the select field */
  disabled: PropTypes.bool,

  /** Error message to display below the select */
  error: PropTypes.string,

  /** Additional CSS classes to apply to the select element */
  className: PropTypes.string,

  /** Custom styles */
  style: PropTypes.object
};

export default Select;
