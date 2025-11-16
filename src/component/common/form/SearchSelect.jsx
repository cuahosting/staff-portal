import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

/**
 * Standardized SearchSelect Component (MUI Autocomplete-based)
 *
 * A searchable dropdown component built on MUI Autocomplete with automatic sorting,
 * and support for both modern and legacy data formats.
 *
 * NOW USES MUI AUTOCOMPLETE INTERNALLY
 * API remains the same for backward compatibility
 *
 * Features:
 * - Searchable dropdown with fuzzy matching
 * - Automatically sorts options alphabetically by label (configurable)
 * - Consistent MUI theming with floating labels
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
 * @param {boolean} isLoading - Loading state for async options
 * @param {function} noOptionsMessage - Message displayed when no options available
 * @param {object} props - Additional props to pass to MUI Autocomplete
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
  isLoading = false,
  noOptionsMessage,
  isSearchable = true,
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
          label: option.text,
        };
      }
      // If option is just a string
      if (typeof option === 'string') {
        return {
          value: option,
          label: option,
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

  // Normalize value to match MUI Autocomplete format
  const normalizedValue = useMemo(() => {
    if (!value) {
      return isMulti ? [] : null;
    }

    // For multi-select
    if (isMulti) {
      if (Array.isArray(value)) {
        return value.map(v => {
          if (typeof v === 'object' && v.value !== undefined) {
            return v;
          }
          return normalizedOptions.find(opt => opt.value === v) || null;
        }).filter(Boolean);
      }
      return [];
    }

    // For single select
    if (typeof value === 'object' && value.value !== undefined) {
      return value;
    }

    // If value is a string or number, find matching option
    const matchedOption = normalizedOptions.find(opt => opt.value === value);
    return matchedOption || null;
  }, [value, normalizedOptions, isMulti]);

  // Wrapper for onChange to maintain backward compatibility
  // Convert MUI's (event, newValue, reason) to react-select's (selectedOption, actionMeta)
  const handleChange = (event, newValue, reason) => {
    if (!onChange) return;

    // Create actionMeta object similar to react-select
    const actionMeta = {
      action: reason, // 'select-option', 'remove-value', 'clear', etc.
      option: newValue,
    };

    // Call onChange with react-select signature
    onChange(newValue, actionMeta);
  };

  // Error helper text with icon (matching Input component)
  const helperText = error ? (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      {error}
    </span>
  ) : '';

  return (
    <div className="mb-4">
      <Autocomplete
        id={id}
        options={normalizedOptions}
        value={normalizedValue}
        onChange={handleChange}
        disabled={disabled}
        multiple={isMulti}
        disableClearable={!isClearable}
        loading={isLoading}
        noOptionsText={noOptionsMessage ? noOptionsMessage() : 'No options'}
        getOptionLabel={(option) => option?.label || ''}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name || id}
            label={label}
            placeholder={placeholder}
            required={required}
            error={!!error}
            helperText={helperText}
          />
        )}
        {...props}
      />
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
        label: PropTypes.string,
      }),
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        text: PropTypes.string,
      }),
      PropTypes.string,
    ])
  ),

  /** Selected value (option object, value string, or array for multi-select) */
  value: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
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

  /** Loading state for async options */
  isLoading: PropTypes.bool,

  /** Message displayed when no options are available */
  noOptionsMessage: PropTypes.func,

  /** Enable search functionality */
  isSearchable: PropTypes.bool,
};

export default SearchSelect;
