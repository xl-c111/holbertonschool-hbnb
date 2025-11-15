/**
 * Authentication utilities
 */
import { getCookie, setCookie, deleteCookie } from '../utils/cookies.js';
import { api } from '../api/client.js';

export const auth = {
    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!getCookie('token');
    },

    /**
     * Get current token
     * @returns {string|null}
     */
    getToken() {
        return getCookie('token');
    },

    /**
     * Login user
     * @param {string} email
     * @param {string} password
     * @returns {Promise<Object>}
     */
    async login(email, password) {
        const response = await api.post('/api/v1/auth/login', { email, password });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setCookie('token', data.access_token);
        return data;
    },

    /**
     * Register new user
     * @param {Object} userData
     * @returns {Promise<Object>}
     */
    async register(userData) {
        const response = await api.post('/api/v1/users/', userData);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (_) {
                errorData = { error: `HTTP ${response.status}` };
            }
            throw new Error(errorData.error || 'Registration failed');
        }

        return response.json();
    },

    /**
     * Logout user
     */
    logout() {
        deleteCookie('token');
        window.location.href = '/login.html';
    }
};
