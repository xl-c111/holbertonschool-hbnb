/**
 * Add Review Page
 */
import { placesAPI } from '../api/places.js';
import { reviewsAPI } from '../api/reviews.js';
import { getCookie } from '../utils/cookies.js';

export async function initReviewPage() {
    const placeNameSpan = document.getElementById('place-name');
    const reviewForm = document.getElementById('reviewForm');
    const messageBox = document.getElementById('message');

    // Only initialize if we're on the review form page
    if (!reviewForm) return;

    // Get place_id from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get('id');

    console.log('All URL parameters:', Object.fromEntries(urlParams.entries()));
    console.log('Looking for place_id:', placeId);
    console.log('Current URL:', window.location.href);

    if (!placeId) {
        console.error('No place_id found in URL.');
        console.error('Available parameters:', Array.from(urlParams.keys()));

        if (placeNameSpan) {
            placeNameSpan.textContent = '[Unknown Place - No ID provided]';
        }

        if (messageBox) {
            showMessage(messageBox, 'No place ID provided', 'error');
        }
        return;
    }

    // Get token for authenticated requests
    const token = getCookie('token');

    if (!token) {
        console.error('No authentication token found');
        if (messageBox) {
            showMessage(messageBox, 'Please log in to submit a review', 'error');
        }
        return;
    }

    // Fetch place details
    try {
        console.log(`Fetching place details for ID: ${placeId}`);
        const place = await placesAPI.getById(placeId);
        console.log('Place details fetched:', place);

        if (placeNameSpan) {
            placeNameSpan.textContent = `🏚️ ${place.name || place.title || 'Unknown Place'}`;
        }
    } catch (error) {
        console.error('Error fetching place details:', error);
        if (placeNameSpan) {
            placeNameSpan.textContent = '[Error Loading Place]';
        }
        if (messageBox) {
            showMessage(messageBox, 'Failed to load place details', 'error');
        }
    }

    // Handle review form submission
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const reviewText = document.getElementById('review').value.trim();
        const rating = document.getElementById('rating').value;

        if (!reviewText || !rating) {
            showMessage(messageBox, 'Please fill in all fields.', 'error');
            return;
        }

        const reviewData = {
            place_id: placeId,
            text: reviewText,
            rating: parseInt(rating)
        };

        console.log('Submitting review data:', reviewData);

        try {
            const result = await reviewsAPI.create(reviewData);
            console.log('Review submitted successfully:', result);

            showMessage(messageBox, 'Review submitted successfully!', 'success');
            reviewForm.reset();

            // Redirect back to place details after successful submission
            setTimeout(() => {
                window.location.href = `place.html?id=${placeId}`;
            }, 2000);
        } catch (error) {
            console.error('Error submitting review:', error);

            // Check if it's a token expiration error
            if (error.message && error.message.includes('expired')) {
                showMessage(messageBox, 'Your session has expired. Redirecting to login...', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(messageBox, `Failed to submit review: ${error.message}`, 'error');
            }
        }
    });
}

function showMessage(messageBox, msg, type) {
    if (messageBox) {
        messageBox.textContent = msg;
        messageBox.className = `message ${type}`;
        messageBox.classList.remove('hidden');

        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, 5000);
        }
    } else {
        console.log(`Message: ${msg} (${type})`);
    }
}
