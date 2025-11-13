import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

/**
 * Standardized SearchSelect Component (wrapper around react-select)
 *
 * A searchable dropdown component built on react-select with Bootstrap 5 theming,
 * automatic sorting, and support for both modern and legacy data formats.
 *
 * Features:
 * - Searchable dropdown with fuzzy matching
 * - Automatically sorts options alphabetically by label (configurable)
 * - Consistent Bootstrap 5 styling
 * - Support for legacy data format {id, text} and modern {value, label}
 * - Multi-select capability
 * - Clearable selection
 * - Error states with visual feedback
 * - Full accessibility with ARIA attributes
 * - Performance optimized with useMemo
 *
 * @param {string} id - Input id (required)
 * @param {string} name - Input name for form submission
 * @param {array} options - Options array [{value, label}] or [{id, text}] (legacy)
 * @param {object|string|array} value - Selected value (option object, value string, or array for multi-select)
 * @param {function} onChange - Change handler receives (selectedOption, actionMeta)
 * @param {string} placeholder - Placeholder text
 * @param {string} label - Label text (optional)
 * @param {boolean} required - Required field indicator
 * @param {boolean} disabled - Disabled state
 * @param {boolean} isMulti - Enable multi-select mode
 * @param {boolean} isClearable - Show clear button
 * @param {string} error - Error message to display
 * @param {boolean} autoSort - Auto-sort options alphabetically (default: true)
 * @param {object} customStyles - Custom react-select style overrides
 * @param {object} props - Additional props to pass to react-select
 *
 * @example
 * // Modern format
 * <SearchSelect
 *   id="country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' }
 *   ]}
 *   value={selectedCountry}
 *   onChange={setSelectedCountry}
 *   label="Country"
 *   required
 * />
 *
 * @example
 * // Legacy format (automatically converted)
 * <SearchSelect
 *   id="department"
 *   options={[
 *     { id: '1', text: 'Engineering' },
 *     { id: '2', text: 'Marketing' }
 *   ]}
 *   value={selectedDept}
 *   onChange={setSelectedDept}
 *   label="Department"
 * />
 */
const SearchSelect = React.memo(({
  id,
  name,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  label,
  required = false,
  disabled = false,
  isMulti = false,
  isClearable = true,
  error = '',
  autoSort = true,
  customStyles = {},
  ...props
}) => {
  // Convert legacy {id, text} format to {value, label} format
  const normalizedOptions = useMemo(() => {
    const normalized = options.map(option => {
      // If already in correct format
      if (option.value !== undefined && option.label !== undefined) {
        return option;
      }
      // Convert legacy format {id, text} to {value, label}
      if (option.id !== undefined && option.text !== undefined) {
        return {
          value: option.id,
          label: option.text
        };
      }
      // If option is just a string
      if (typeof option === 'string') {
        return {
          value: option,
          label: option
        };
      }
      return option;
    });

    // Sort options alphabetically by label if autoSort is enabled
    if (autoSort) {
      return normalized.sort((a, b) => {
        const labelA = (a.label || '').toString().toLowerCase();
        const labelB = (b.label || '').toString().toLowerCase();
        return labelA.localeCompare(labelB);
      });
    }

    return normalized;
  }, [options, autoSort]);

  // Normalize value to match react-select format
  const normalizedValue = useMemo(() => {
    if (!value) return null;

    // If value is already an object with value/label, use it
    if (typeof value === 'object' && value.value !== undefined) {
      return value;
    }

    // If value is a string or number, find matching option
    const matchedOption = normalizedOptions.find(opt => opt.value === value);
    return matchedOption || null;
  }, [value, normalizedOptions]);

  // Custom styles to match Bootstrap theme
  const defaultStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderColor: error ? '#dc3545' : state.isFocused ? '#86b7fe' : '#ced4da',
      boxShadow: state.isFocused
        ? error
          ? '0 0 0 0.25rem rgba(220, 53, 69, 0.25)'
          : '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
        : 'none',
      '&:hover': {
        borderColor: error ? '#dc3545' : '#86b7fe'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999
    }),
    ...customStyles
  };

  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="form-group mb-4">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger" aria-label="required"> *</span>}
        </label>
      )}
      <Select
        inputId={id}
        name={name || id}
        options={normalizedOptions}
        value={normalizedValue}
        onChange={onChange}
        placeholder={placeholder}
        isDisabled={disabled}
        isMulti={isMulti}
        isClearable={isClearable}
        styles={defaultStyles}
        classNamePrefix="react-select"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <div id={errorId} className="text-danger small mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

SearchSelect.displayName = 'SearchSelect';

SearchSelect.propTypes = {
  /** Unique identifier for the select input */
  id: PropTypes.string.isRequired,

  /** Name attribute for form submission (defaults to id if not provided) */
  name: PropTypes.string,

  /** Options array in format [{value, label}] or legacy [{id, text}] */
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string
      }),
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        text: PropTypes.string
      }),
      PropTypes.string
    ])
  ),

  /** Selected value (option object, value string, or array for multi-select) */
  value: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.number,
    PropTypes.array
  ]),

  /** Change handler receives (selectedOption, actionMeta) */
  onChange: PropTypes.func.isRequired,

  /** Placeholder text displayed when no option is selected */
  placeholder: PropTypes.string,

  /** Label text displayed above the select */
  label: PropTypes.string,

  /** Shows required indicator (*) - note: validation must be handled manually */
  required: PropTypes.bool,

  /** Disables the select input */
  disabled: PropTypes.bool,

  /** Enable multi-select mode */
  isMulti: PropTypes.bool,

  /** Show clear button to remove selection */
  isClearable: PropTypes.bool,

  /** Error message to display below the select */
  error: PropTypes.string,

  /** Automatically sort options alphabetically by label */
  autoSort: PropTypes.bool,

  /** Custom react-select style overrides */
  customStyles: PropTypes.object,

  /** Loading state for async options */
  isLoading: PropTypes.bool,

  /** Message displayed when no options are available */
  noOptionsMessage: PropTypes.func,

  /** Enable search functionality */
  isSearchable: PropTypes.bool,

  /** Custom filter function for options */
  filterOption: PropTypes.func,

  /** Menu placement (auto, top, bottom) */
  menuPlacement: PropTypes.oneOf(['auto', 'top', 'bottom']),

  /** Menu position (fixed, absolute) */
  menuPosition: PropTypes.oneOf(['fixed', 'absolute'])
};

export default SearchSelect;
