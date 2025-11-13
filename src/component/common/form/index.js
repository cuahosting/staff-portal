/**
 * Form Components - Centralized Exports
 *
 * This file provides a single import point for all form components,
 * making it easier to import multiple components at once.
 *
 * @example
 * // Import individual components
 * import { Input, SearchSelect } from './component/common/form';
 *
 * @example
 * // Import all components
 * import * as FormComponents from './component/common/form';
 */

// Export all form components from a single entry point
export { default as Input } from './Input';
export { default as SearchSelect } from './SearchSelect';
export { default as ExampleForm } from './ExampleForm';
