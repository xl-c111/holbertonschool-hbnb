/**
 * Places API
 */
import { api } from './client.js';

export const placesAPI = {
    /**
     * Get all places
     * @returns {Promise<Array>}
     */
    async getAll() {
        const response = await api.get('/api/v1/places/');
        if (!response.ok) throw new Error('Failed to fetch places');
        return response.json();
    },

    /**
     * Get place by ID
     * @param {string} id - Place ID
     * @returns {Promise<Object>}
     */
    async getById(id) {
        const response = await api.get(`/api/v1/places/${id}`);
        if (!response.ok) throw new Error('Failed to fetch place details');
        return response.json();
    },

    /**
     * Create new place
     * @param {Object} placeData
     * @returns {Promise<Object>}
     */
    async create(placeData) {
        const response = await api.post('/api/v1/places/', placeData);
        if (!response.ok) throw new Error('Failed to create place');
        return response.json();
    }
};
