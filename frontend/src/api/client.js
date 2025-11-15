/**
 * API Client - Base HTTP client for all API requests
 */
import { config } from '../config.js';
import { getCookie } from '../utils/cookies.js';

class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    /**
     * Build headers with authentication
     * @param {Object} extra - Additional headers
     * @returns {Object} - Headers object
     */
    buildHeaders(extra = {}) {
        const token = getCookie('token');
        const base = { 'Content-Type': 'application/json' };
        if (token) base['Authorization'] = `Bearer ${token}`;
        return { ...base, ...extra };
    }

    /**
     * Make HTTP request
     * @param {string} path - API endpoint path
     * @param {Object} options - Fetch options
     * @returns {Promise<Response>} - Fetch response
     */
    async request(path, options = {}) {
        const { method = 'GET', headers = {}, body } = options;

        const response = await fetch(`${this.baseURL}${path}`, {
            method,
            headers: this.buildHeaders(headers),
            body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
        });

        return response;
    }

    /**
     * GET request
     */
    async get(path) {
        return this.request(path, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(path, body) {
        return this.request(path, { method: 'POST', body });
    }

    /**
     * PUT request
     */
    async put(path, body) {
        return this.request(path, { method: 'PUT', body });
    }

    /**
     * DELETE request
     */
    async delete(path) {
        return this.request(path, { method: 'DELETE' });
    }
}

// Export singleton instance
export const api = new APIClient(config.API_URL);
