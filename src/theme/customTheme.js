import { createTheme } from '@mui/material/styles';

/**
 * Custom MUI Theme
 *
 * This theme ensures MUI components match the existing design system
 * with borderless inputs, custom shadows, and floating labels.
 */
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#667eea', // Brand purple
      light: '#b8c5f2',
      dark: '#4c5fd5',
    },
    secondary: {
      main: '#764ba2', // Secondary purple
    },
    error: {
      main: '#dc3545',
      light: '#ea8693',
      dark: '#c82333',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 16,
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          marginBottom: 0,
          '& .MuiOutlinedInput-root': {
            height: '60px',
            fontSize: '1.05rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: '#ffffff',
            '& fieldset': {
              border: 'none',
            },
            '&:not(.Mui-error)': {
              boxShadow: '0 4px 12px rgba(0, 86, 179, 0.15)',
            },
            '&.Mui-error': {
              boxShadow: '0 4px 12px rgba(220, 53, 69, 0.2)',
            },
            '&.Mui-focused:not(.Mui-error)': {
              boxShadow: '0 0 0 0.2rem rgba(102, 126, 234, 0.25)',
            },
            '&.Mui-focused.Mui-error': {
              boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
            },
            '& input': {
              padding: '1.5rem 1rem 0.5rem',
              height: 'auto',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6c757d',
            fontWeight: 500,
            fontSize: '1.05rem',
            transition: 'all 0.2s ease',
            '&.Mui-focused:not(.Mui-error)': {
              color: '#667eea',
            },
            '&.Mui-error': {
              color: '#dc3545',
            },
            '&.MuiInputLabel-shrink': {
              fontSize: '0.95rem',
              transform: 'translate(14px, -9px) scale(0.85)',
            },
          },
          '& .MuiFormHelperText-root': {
            marginTop: '0.5rem',
            marginLeft: 0,
            fontSize: '0.875rem',
            fontWeight: 500,
            '&.Mui-error': {
              color: '#dc3545',
            },
          },
        },
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          marginBottom: 0,
          '& .MuiOutlinedInput-root': {
            minHeight: '60px',
            fontSize: '1.05rem',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: '#ffffff',
            '& fieldset': {
              border: 'none',
            },
            '&:not(.Mui-error)': {
              boxShadow: '0 4px 12px rgba(0, 86, 179, 0.15)',
            },
            '&.Mui-error': {
              boxShadow: '0 4px 12px rgba(220, 53, 69, 0.2)',
            },
            '&.Mui-focused:not(.Mui-error)': {
              boxShadow: '0 0 0 0.2rem rgba(102, 126, 234, 0.25)',
            },
            '&.Mui-focused.Mui-error': {
              boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
            },
            '& .MuiAutocomplete-input': {
              padding: '0.5rem 0 0.5rem 0',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6c757d',
            fontWeight: 500,
            fontSize: '1.05rem',
            transition: 'all 0.2s ease',
            '&.Mui-focused:not(.Mui-error)': {
              color: '#667eea',
            },
            '&.Mui-error': {
              color: '#dc3545',
            },
            '&.MuiInputLabel-shrink': {
              fontSize: '0.95rem',
              transform: 'translate(14px, -9px) scale(0.85)',
            },
          },
        },
        popper: {
          zIndex: 9999,
        },
        paper: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          borderRadius: '12px',
          marginTop: '8px',
        },
        listbox: {
          padding: '8px',
          '& .MuiAutocomplete-option': {
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '1.05rem',
            transition: 'all 0.2s ease',
            '&[aria-selected="true"]': {
              backgroundColor: 'rgba(102, 126, 234, 0.15)',
              '&.Mui-focused': {
                backgroundColor: 'rgba(102, 126, 234, 0.25)',
              },
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
        },
      },
    },
  },
});

export default customTheme;
