import { z } from 'zod';

/**
 * Login Form Validation Schema
 *
 * This schema defines the validation rules for the staff portal login form.
 * It uses Zod for robust type-safe validation with clear error messages.
 */
export const loginSchema = z.object({
  StaffID: z
    .string({
      required_error: "Staff ID is required",
      invalid_type_error: "Staff ID must be a string"
    })
    .trim()
    .min(1, "Please enter your staff ID"),

  Password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string"
    })
    .min(1, "Please enter your password")
});

/**
 * Validates login form data
 *
 * @param {Object} data - The form data to validate
 * @returns {Object} - { success: boolean, data?: validatedData, errors?: errorObject }
 *
 * @example
 * const result = validateLogin({ StaffID: "STF001", Password: "password123" });
 * if (result.success) {
 *   // Use result.data
 * } else {
 *   // Handle result.errors
 * }
 */
export const validateLogin = (data) => {
  try {
    const result = loginSchema.safeParse(data);

    if (!result.success) {
      // Format errors for easier consumption
      const errors = {};

      // Check if error structure exists
      if (result.error && result.error.errors && Array.isArray(result.error.errors)) {
        result.error.errors.forEach(err => {
          const field = err.path[0];
          if (field) {
            errors[field] = err.message;
          }
        });
      }

      return {
        success: false,
        errors
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      success: false,
      errors: {
        general: 'An unexpected validation error occurred'
      }
    };
  }
};
