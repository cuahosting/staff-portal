/**
 * SearchSelect - Unified Searchable Select Component
 * 
 * A standardized, searchable dropdown component with consistent styling,
 * high z-index for proper layering, and portal rendering to avoid overflow issues.
 * 
 * This component is designed to replace all instances of:
 * - react-select Select
 * - react-select2-wrapper Select2
 * - Native HTML select elements (for searchable cases)
 * 
 * @example
 * // Basic usage
 * <SearchSelect
 *   id="mySelect"
 *   label="Select Option"
 *   value={selectedValue}
 *   options={[{ value: '1', label: 'Option 1' }, { value: '2', label: 'Option 2' }]}
 *   onChange={(selected) => setValue(selected)}
 *   placeholder="Choose an option..."
 * />
 * 
 * @example
 * // With required field indicator
 * <SearchSelect
 *   id="requiredSelect"
 *   label="Required Field"
 *   value={value}
 *   options={options}
 *   onChange={handleChange}
 *   required
 * />
 */

import React from 'react';
import Select from 'react-select';
import './SearchSelect.css';

// Custom styles for consistent appearance across the application
const customStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '44px',
        border: state.isFocused ? '2px solid #009ef7' : '2px solid #e8e8e8',
        backgroundColor: state.isFocused ? '#ffffff' : '#f8f9fa',
        borderRadius: '0.5rem',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(0, 158, 247, 0.15)' : 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            borderColor: '#009ef7',
            backgroundColor: '#ffffff',
        },
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '2px 12px',
    }),
    input: (provided) => ({
        ...provided,
        margin: '0',
        padding: '0',
        color: '#181c32',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#a1a5b7',
        fontSize: '0.95rem',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#181c32',
        fontSize: '1rem',
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        borderRadius: '0.5rem',
        border: '1px solid #e8e8e8',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
    }),
    menuList: (provided) => ({
        ...provided,
        padding: '4px',
        maxHeight: '250px',
    }),
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? '#009ef7'
            : state.isFocused
                ? '#f1faff'
                : '#ffffff',
        color: state.isSelected ? '#ffffff' : '#181c32',
        padding: '10px 14px',
        cursor: 'pointer',
        borderRadius: '0.35rem',
        marginBottom: '2px',
        fontSize: '0.95rem',
        '&:active': {
            backgroundColor: '#009ef7',
            color: '#ffffff',
        },
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: state.isFocused ? '#009ef7' : '#a1a5b7',
        transition: 'transform 0.2s ease-in-out',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        '&:hover': {
            color: '#009ef7',
        },
    }),
    clearIndicator: (provided) => ({
        ...provided,
        color: '#a1a5b7',
        '&:hover': {
            color: '#f1416c',
        },
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#e8f4ff',
        borderRadius: '0.35rem',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: '#009ef7',
        fontSize: '0.9rem',
        padding: '2px 6px',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: '#009ef7',
        '&:hover': {
            backgroundColor: '#009ef7',
            color: '#ffffff',
        },
    }),
    noOptionsMessage: (provided) => ({
        ...provided,
        color: '#a1a5b7',
        fontSize: '0.9rem',
    }),
    loadingMessage: (provided) => ({
        ...provided,
        color: '#a1a5b7',
    }),
};

/**
 * SearchSelect Component
 * 
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the select
 * @param {string} props.name - Name attribute for the select
 * @param {string} props.label - Label text displayed above the select
 * @param {Object|Array} props.value - Currently selected value(s)
 * @param {Array} props.options - Array of {value, label} objects
 * @param {Function} props.onChange - Callback when selection changes
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.isMulti - Enable multi-select mode
 * @param {boolean} props.isSearchable - Enable search functionality (default: true)
 * @param {boolean} props.isClearable - Show clear button (default: true)
 * @param {boolean} props.isDisabled - Disable the select
 * @param {boolean} props.isLoading - Show loading indicator
 * @param {boolean} props.required - Show required indicator
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.styles - Custom styles to merge
 * @param {string} props.noOptionsMessage - Message when no options available
 * @param {string} props.loadingMessage - Message when loading
 */
function SearchSelect({
    id,
    name,
    label,
    value,
    options = [],
    onChange,
    placeholder = 'Select...',
    isMulti = false,
    isSearchable = true,
    isClearable = true,
    isDisabled = false,
    isLoading = false,
    required = false,
    className = '',
    styles = {},
    noOptionsMessage = 'No options available',
    loadingMessage = 'Loading...',
    ...rest
}) {
    // Merge custom styles with default styles
    const mergedStyles = {
        ...customStyles,
        ...styles,
    };

    return (
        <div className={`search-select-wrapper ${className}`}>
            {label && (
                <label htmlFor={id} className="search-select-label">
                    {label}
                    {required && <span className="search-select-required">*</span>}
                </label>
            )}
            <Select
                inputId={id}
                name={name || id}
                value={value}
                options={options}
                onChange={onChange}
                placeholder={placeholder}
                isMulti={isMulti}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                isLoading={isLoading}
                styles={mergedStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                noOptionsMessage={() => noOptionsMessage}
                loadingMessage={() => loadingMessage}
                classNamePrefix="search-select"
                {...rest}
            />
        </div>
    );
}

export default SearchSelect;
