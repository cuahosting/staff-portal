import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';

/**
 * Textarea Component
 *
 * A MUI-based textarea component with floating labels, consistent styling,
 * and full backward compatibility with legacy textarea elements.
 *
 * @component
 * @example
 * <Textarea
 *   id="description"
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   label="Description"
 *   rows={4}
 *   required
 * />
 */
const Textarea = React.memo(({
  id,
  value = '',
  onChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  error = '',
  className = '',
  rows = 4,
  minRows,
  maxRows,
  maxLength,
  minLength,
  readOnly = false,
  autoComplete,
  style,
  ...props
}) => {
  const labelText = label || placeholder;

  const inputProps = {
    maxLength,
    minLength,
    readOnly,
    ...props.inputProps,
  };

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
      <TextField
        id={id}
        name={id}
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
        multiline
        rows={rows}
        minRows={minRows}
        maxRows={maxRows}
        inputProps={inputProps}
        InputProps={{
          ...props.InputProps,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: 'auto',
            minHeight: rows ? `${rows * 24 + 36}px` : '120px',
            alignItems: 'flex-start',
            padding: '14px',
          },
          '& .MuiInputBase-input': {
            fontSize: '1.05rem',
            lineHeight: '1.5',
          },
          ...style,
        }}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
    </div>
  );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  rows: PropTypes.number,
  minRows: PropTypes.number,
  maxRows: PropTypes.number,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  readOnly: PropTypes.bool,
  autoComplete: PropTypes.string,
  style: PropTypes.object,
};

export default Textarea;
