/**
 * Reviews API
 */
import { api } from './client.js';

export const reviewsAPI = {
    /**
     * Get reviews for a place
     * @param {string} placeId - Place ID
     * @returns {Promise<Array>}
     */
    async getByPlace(placeId) {
        const response = await api.get(`/api/v1/places/${placeId}/reviews`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return response.json();
    },

    /**
     * Submit a review
     * @param {Object} reviewData
     * @returns {Promise<Object>}
     */
    async create(reviewData) {
        const response = await api.post('/api/v1/reviews/', reviewData);

        // Handle token expiration
        if (response.status === 401) {
            const data = await response.json();
            if (data.msg && data.msg.includes('expired')) {
                throw new Error('Token expired');
            }
        }

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to submit review: ${response.status} - ${error}`);
        }

        return response.json();
    }
};
