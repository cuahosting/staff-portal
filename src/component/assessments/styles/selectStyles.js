// Centralized select styling configuration matching login page auth-input styling
// This ensures consistent look and feel across all assessment components

export const authSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        border: '2px solid #e8e8e8 !important',
        backgroundColor: state.isFocused ? '#ffffff' : '#f8f9fa',
        padding: '0.25rem 0.5rem',
        fontSize: '1rem',
        borderRadius: '0.5rem',
        boxShadow: state.isFocused ? '0 6px 20px rgba(13, 110, 253, 0.15)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: state.isFocused ? 'translateY(-2px)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#0d6efd' : '#d0d0d0',
            backgroundColor: '#ffffff',
            transform: state.isFocused ? 'translateY(-2px)' : 'translateY(-1px)',
            boxShadow: state.isFocused ? '0 6px 20px rgba(13, 110, 253, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
        }
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e7f3ff' : 'white',
        color: state.isSelected ? 'white' : '#212529',
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:active': {
            backgroundColor: '#0d6efd',
        }
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        borderRadius: '0.5rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
    }),
    menuList: (provided) => ({
        ...provided,
        padding: 0,
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#6c757d',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#212529',
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#e7f3ff',
        borderRadius: '0.25rem',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: '#0d6efd',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: '#0d6efd',
        ':hover': {
            backgroundColor: '#0d6efd',
            color: 'white',
        },
    }),
};
