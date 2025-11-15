/**
 * Bookings API Client
 */
import { api } from './client.js';

export const bookingsAPI = {
    /**
     * Create a new booking
     * @param {Object} bookingData - {place_id, check_in_date, check_out_date}
     * @returns {Promise<Response>}
     */
    async create(bookingData) {
        return api.post('/api/v1/bookings/', bookingData);
    },

    /**
     * Get all bookings for the authenticated user
     * @param {string} type - 'upcoming', 'past', or null for all
     * @param {string} status - Filter by status (optional)
     * @returns {Promise<Response>}
     */
    async getMyBookings(type = null, status = null) {
        let url = '/api/v1/bookings/';
        const params = new URLSearchParams();

        if (type) params.append('type', type);
        if (status) params.append('status', status);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        return api.get(url);
    },

    /**
     * Get booking details by ID
     * @param {string} bookingId
     * @returns {Promise<Response>}
     */
    async getById(bookingId) {
        return api.get(`/api/v1/bookings/${bookingId}`);
    },

    /**
     * Cancel a booking
     * @param {string} bookingId
     * @returns {Promise<Response>}
     */
    async cancel(bookingId) {
        return api.delete(`/api/v1/bookings/${bookingId}`);
    },

    /**
     * Confirm a booking (place owner only)
     * @param {string} bookingId
     * @returns {Promise<Response>}
     */
    async confirm(bookingId) {
        return api.put(`/api/v1/bookings/${bookingId}/confirm`, {});
    },

    /**
     * Get all bookings for a place (owner only)
     * @param {string} placeId
     * @param {string} status - Filter by status (optional)
     * @returns {Promise<Response>}
     */
    async getPlaceBookings(placeId, status = null) {
        let url = `/api/v1/bookings/places/${placeId}`;
        if (status) {
            url += `?status=${status}`;
        }
        return api.get(url);
    },

    /**
     * Check if a place is available for given dates
     * @param {string} placeId
     * @param {string} checkInDate - YYYY-MM-DD
     * @param {string} checkOutDate - YYYY-MM-DD
     * @returns {Promise<Response>}
     */
    async checkAvailability(placeId, checkInDate, checkOutDate) {
        return api.post('/api/v1/bookings/availability/check', {
            place_id: placeId,
            check_in_date: checkInDate,
            check_out_date: checkOutDate
        });
    }
};
