/**
 * Place Details Page
 */
import { placesAPI } from '../api/places.js';
import { reviewsAPI } from '../api/reviews.js';
import { ReviewCard, NoReviewsMessage, generateStars } from '../components/ReviewCard.js';
import { showError } from '../components/Message.js';
import { AmenityItem } from '../utils/amenities.js';

export async function initPlacePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get('id');

    if (!placeId) {
        showError('No place ID provided');
        return;
    }

    await loadPlaceDetails(placeId);
    await loadPlaceReviews(placeId);
    createReviewButton(placeId);
}

async function loadPlaceDetails(placeId) {
    try {
        console.log(`Fetching place details for ID: ${placeId}`);
        const place = await placesAPI.getById(placeId);
        console.log('Place details fetched:', place);

        populatePlaceDetails(place);
    } catch (error) {
        console.error('Error fetching place details:', error);
        showError('Failed to load place details');
    }
}

async function loadPlaceReviews(placeId) {
    try {
        console.log(`Fetching reviews for place ID: ${placeId}`);
        const reviews = await reviewsAPI.getByPlace(placeId);
        console.log('Reviews fetched:', reviews);

        const averageRating = calculateAverageRating(reviews);
        populateReviews(reviews);
        updateRatingUI(averageRating);
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

function populatePlaceDetails(place) {
    try {
        const titleElement = document.querySelector('.place-title');
        if (titleElement) {
            titleElement.textContent = `🏚️ ${place.name || place.title}`;
        }

        const descElement = document.querySelector('.place-description');
        if (descElement) {
            descElement.textContent = place.description || 'No description available';
        }

        const imageElement = document.querySelector('.place-image');
        if (imageElement && place.imageUrl) {
            imageElement.src = place.imageUrl;
            imageElement.alt = place.name || place.title;
        }

        const priceElement = document.querySelector('.price');
        if (priceElement) {
            priceElement.textContent = `$${place.price || 'N/A'}`;
        }

        const locationSection = document.querySelector('.location-section');
        if (locationSection) {
            let cityName = 'Unknown Location';
            if (place.latitude && place.longitude) {
                cityName = `${place.latitude.toFixed(2)}°, ${place.longitude.toFixed(2)}°`;
            }

            locationSection.innerHTML = `
                <span class="detail-label">📍 Location</span>
                <div class="detail-value place-location">${cityName}</div>
            `;
        }

        populateAmenities(place.amenities || []);
        console.log('Place details populated successfully');
    } catch (error) {
        console.error('Error populating place details:', error);
        showError('Error displaying place information');
    }
}

function populateAmenities(amenities) {
    const amenitiesList = document.querySelector('.amenities-list');
    if (!amenitiesList) return;

    amenitiesList.innerHTML = '';

    if (!amenities || amenities.length === 0) {
        amenitiesList.innerHTML = '<li class="amenity-item"><span>No amenities listed</span></li>';
        return;
    }

    amenities.forEach(amenity => {
        amenitiesList.innerHTML += AmenityItem(amenity);
    });
    console.log(`Populated ${amenities.length} amenities`);
}

function populateReviews(reviews) {
    const reviewsContainer = document.getElementById('reviews-list');
    if (!reviewsContainer) return;

    reviewsContainer.innerHTML = '';

    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = NoReviewsMessage();
        return;
    }

    reviewsContainer.innerHTML = reviews.map(review => ReviewCard(review)).join('');
    console.log(`Populated ${reviews.length} reviews`);
}

function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return null;

    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return total / reviews.length;
}

function updateRatingUI(rating) {
    const ratingElement = document.querySelector('.rating span:first-child');
    const starsElement = document.querySelector('.rating span:last-child');

    if (ratingElement) {
        if (rating) {
            ratingElement.textContent = rating.toFixed(1);
            if (starsElement) {
                starsElement.innerHTML = generateStars(rating);
            }
        } else {
            ratingElement.textContent = 'No ratings yet';
            if (starsElement) {
                starsElement.innerHTML = '';
            }
        }
    }
}

function createReviewButton(placeId) {
    const reviewsSection = document.querySelector('.reviews-sectionn');
    if (!reviewsSection || !placeId) {
        console.log('Cannot create review button: missing section or placeId');
        return;
    }

    // Clear existing button if any
    const existingLink = reviewsSection.querySelector('a[href*="add_review.html"]');
    if (existingLink) {
        existingLink.remove();
    }

    // Create new button with correct place ID
    const reviewLink = document.createElement('a');
    reviewLink.href = `add_review.html?id=${placeId}`;

    const reviewButton = document.createElement('button');
    reviewButton.className = 'add-review-btn';
    reviewButton.textContent = '🕯️ Share Your Supernatural Experience';

    reviewLink.appendChild(reviewButton);
    reviewsSection.appendChild(reviewLink);

    console.log(`Created review button for place ID: ${placeId}`);
}
