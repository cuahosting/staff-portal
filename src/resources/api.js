import axios from "axios";
import { serverLink } from "./url";
import { toast } from "react-toastify";

// Create axios instance with base config
const apiClient = axios.create({
    baseURL: serverLink,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * HTTP Request Wrapper
 * @param {string} method - HTTP method (GET, POST, PATCH, PUT, DELETE)
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {object} data - Request body (for POST, PATCH, PUT) or query params (for GET)
 * @param {object} token - Auth token object from Redux { headers: { Authorization: ... } }
 * @param {object} customHeaders - Additional headers to merge
 * @param {boolean} showError - Whether to show toast on error (default: true)
 * @returns {Promise<{success: boolean, data: any, message: string, error?: any}>}
 */
export const apiRequest = async (
    method,
    endpoint,
    data = null,
    token = null,
    customHeaders = {},
    showError = true
) => {
    try {
        const config = {
            method: method.toUpperCase(),
            url: endpoint,
            headers: {
                ...token?.headers,
                ...customHeaders,
            },
        };

        // Add data for methods that support request body
        if (["POST", "PATCH", "PUT"].includes(method.toUpperCase()) && data) {
            config.data = data;
        }

        // Add query params for GET requests with data
        if (method.toUpperCase() === "GET" && data) {
            config.params = data;
        }

        // Add data for DELETE if provided (some APIs need body in DELETE)
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

        console.error(`API Error [${method} ${endpoint}]:`, error);

        return {
            success: false,
            data: null,
            message: errorMessage,
            error: error.response?.data || error,
        };
    }
};

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {object} token - Auth token object
     * @param {object} params - Query parameters (optional)
     * @param {object} customHeaders - Custom headers (optional)
     * @param {boolean} showError - Show error toast (default: true)
     */
    get: (endpoint, token, params = null, customHeaders = {}, showError = true) =>
        apiRequest("GET", endpoint, params, token, customHeaders, showError),

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body
     * @param {object} token - Auth token object
     * @param {object} customHeaders - Custom headers (optional)
     * @param {boolean} showError - Show error toast (default: true)
     */
    post: (endpoint, data, token, customHeaders = {}, showError = true) =>
        apiRequest("POST", endpoint, data, token, customHeaders, showError),

    /**
     * PATCH request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body
     * @param {object} token - Auth token object
     * @param {object} customHeaders - Custom headers (optional)
     * @param {boolean} showError - Show error toast (default: true)
     */
    patch: (endpoint, data, token, customHeaders = {}, showError = true) =>
        apiRequest("PATCH", endpoint, data, token, customHeaders, showError),

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {object} data - Request body
     * @param {object} token - Auth token object
     * @param {object} customHeaders - Custom headers (optional)
     * @param {boolean} showError - Show error toast (default: true)
     */
    put: (endpoint, data, token, customHeaders = {}, showError = true) =>
        apiRequest("PUT", endpoint, data, token, customHeaders, showError),

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {object} token - Auth token object
     * @param {object} data - Request body (optional, some APIs need it)
     * @param {object} customHeaders - Custom headers (optional)
     * @param {boolean} showError - Show error toast (default: true)
     */
    delete: (endpoint, token, data = null, customHeaders = {}, showError = true) =>
        apiRequest("DELETE", endpoint, data, token, customHeaders, showError),
};

export default api;
