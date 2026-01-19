import axios from "axios";
import { serverLink } from "./url";
import { toast } from "react-toastify";

/**
 * Centralized HTTP Client for the Staff Portal
 * 
 * Features:
 * - Auto-injects authentication token from Redux store
 * - Standardized { success, data, message, error } response format
 * - Built-in error handling with optional toast notifications
 * - No need to pass token or serverLink in components
 * 
 * Usage:
 *   import { api } from '../resources/api';
 *   
 *   // Simple GET request - token is auto-injected
 *   const { success, data } = await api.get('staff/hr/bank/list');
 *   
 *   // POST request with payload
 *   const { success, data } = await api.post('staff/hr/bank/add', { bank_name: 'Test' });
 *   
 *   // Disable auto error toast
 *   const { success, data } = await api.get('staff/hr/bank/list', { showError: false });
 */

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: serverLink,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Store reference for auto token injection
let storeRef = null;

/**
 * Initialize the API client with the Redux store reference
 * Call this once in your app's index.js after store creation
 * 
 * @param {object} store - Redux store instance
 */
export const initializeApi = (store) => {
    storeRef = store;
};

/**
 * Get the current auth token from Redux store
 * @returns {object|null} Token headers object or null
 */
const getAuthToken = () => {
    if (!storeRef) {
        console.warn("API: Store not initialized. Call initializeApi(store) in index.js");
        return null;
    }

    const state = storeRef.getState();
    const loginDetails = state.LoginDetails;

    if (loginDetails && loginDetails.length > 0 && loginDetails[0].token) {
        return loginDetails[0].token;
    }

    return null;
};

// Request interceptor - auto-attach token
apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token?.headers) {
            config.headers = { ...config.headers, ...token.headers };
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific HTTP status codes with toast notifications
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    toast.error("Session expired. Please login again.");
                    break;
                case 403:
                    toast.error("Access denied. Insufficient permissions.");
                    break;
                case 500:
                    toast.error("Server error. Please try again later.");
                    break;
                default:
                    break;
            }
        } else if (error.request) {
            // Network error - no response received
            toast.error("Network error. Please check your connection.");
        }
        return Promise.reject(error);
    }
);


/**
 * Make an HTTP request with standardized response format
 * 
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint (relative to serverLink)
 * @param {object} data - Request body or query params
 * @param {object} options - Additional options { showError: boolean, headers: object }
 * @returns {Promise<{success: boolean, data: any, message: string, error?: any}>}
 */
const request = async (method, endpoint, data = null, options = {}) => {
    const { showError = true, headers = {}, timeout } = options;

    try {
        const config = {
            method: method.toUpperCase(),
            url: endpoint,
            headers: { ...headers },
        };

        // Add custom timeout if specified
        if (timeout) {
            config.timeout = timeout;
        }

        // Add data based on method type
        if (["POST", "PATCH", "PUT"].includes(method.toUpperCase()) && data) {
            config.data = data;
        }

        if (method.toUpperCase() === "GET" && data) {
            config.params = data;
        }

        if (method.toUpperCase() === "DELETE" && data) {
            config.data = data;
        }

        const response = await apiClient(config);

        return {
            success: true,
            data: response.data,
            message: response.data?.message || "success",
        };
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Network Error";

        if (showError) {
            toast.error(errorMessage);
        }

        console.error(`API Error [${method.toUpperCase()} ${endpoint}]:`, error.message);

        return {
            success: false,
            data: null,
            message: errorMessage,
            error: error.response?.data || error,
        };
    }
};

/**
 * HTTP API wrapper with convenience methods
 * Token is automatically injected - no need to pass it
 */
export const api = {
    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {object} params - Query parameters (optional)
     * @param {object} options - { showError: boolean, headers: object }
     */
    get: (endpoint, params = null, options = {}) =>
        request("GET", endpoint, params, options),

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body
     * @param {object} options - { showError: boolean, headers: object }
     */
    post: (endpoint, data = {}, options = {}) =>
        request("POST", endpoint, data, options),

    /**
     * PATCH request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body
     * @param {object} options - { showError: boolean, headers: object }
     */
    patch: (endpoint, data = {}, options = {}) =>
        request("PATCH", endpoint, data, options),

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body
     * @param {object} options - { showError: boolean, headers: object }
     */
    put: (endpoint, data = {}, options = {}) =>
        request("PUT", endpoint, data, options),

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body (optional)
     * @param {object} options - { showError: boolean, headers: object }
     */
    delete: (endpoint, data = null, options = {}) =>
        request("DELETE", endpoint, data, options),
};

export default api;
export { apiClient };
