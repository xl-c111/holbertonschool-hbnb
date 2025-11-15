/**
 * Place Details Page
 */
import { placesAPI } from '../api/places.js';
import { reviewsAPI } from '../api/reviews.js';
import { bookingsAPI } from '../api/bookings.js';
import { ReviewCard, NoReviewsMessage, generateStars } from '../components/ReviewCard.js';
import { showError, showMessage } from '../components/Message.js';
import { AmenityItem } from '../utils/amenities.js';
import { auth } from '../auth/index.js';

let currentPlace = null;

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

    // Initialize booking form if user is logged in
    if (auth.isAuthenticated()) {
        initBookingForm(placeId);
    }
}

async function loadPlaceDetails(placeId) {
    try {
        console.log(`Fetching place details for ID: ${placeId}`);
        const place = await placesAPI.getById(placeId);
        console.log('Place details fetched:', place);

        currentPlace = place; // Save for booking calculations
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

// --- Booking Form Functions ---

function initBookingForm(placeId) {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) {
        console.log('No booking form found on page');
        return;
    }

    // Set minimum date to today
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    const today = new Date().toISOString().split('T')[0];

    if (checkInInput) {
        checkInInput.setAttribute('min', today);
        checkInInput.addEventListener('change', () => {
            // Set check-out min to day after check-in
            if (checkInInput.value) {
                const checkIn = new Date(checkInInput.value);
                checkIn.setDate(checkIn.getDate() + 1);
                const minCheckOut = checkIn.toISOString().split('T')[0];
                checkOutInput.setAttribute('min', minCheckOut);

                // Update price calculation
                updatePriceCalculation();
            }
        });
    }

    if (checkOutInput) {
        checkOutInput.addEventListener('change', updatePriceCalculation);
    }

    // Handle form submission
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleBookingSubmit(placeId);
    });

    console.log('Booking form initialized');
}

function updatePriceCalculation() {
    const checkIn = document.getElementById('check-in')?.value;
    const checkOut = document.getElementById('check-out')?.value;
    const totalPriceElement = document.getElementById('total-price');

    if (!checkIn || !checkOut || !currentPlace) {
        if (totalPriceElement) {
            totalPriceElement.textContent = '-';
        }
        return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (nights > 0) {
        const total = nights * currentPlace.price;
        if (totalPriceElement) {
            totalPriceElement.textContent = `$${total.toFixed(2)} (${nights} nights × $${currentPlace.price})`;
        }
    } else {
        if (totalPriceElement) {
            totalPriceElement.textContent = 'Invalid dates';
        }
    }
}

async function handleBookingSubmit(placeId) {
    const checkIn = document.getElementById('check-in')?.value;
    const checkOut = document.getElementById('check-out')?.value;
    const submitBtn = document.querySelector('#booking-form button[type="submit"]');
    const originalText = submitBtn?.textContent;

    if (!checkIn || !checkOut) {
        showError('Please select check-in and check-out dates');
        return;
    }

    // Disable button and show loading
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Booking...';
    }

    try {
        const response = await bookingsAPI.create({
            place_id: placeId,
            check_in_date: checkIn,
            check_out_date: checkOut
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Booking failed');
        }

        const booking = await response.json();
        showMessage('Booking created successfully! Redirecting to your bookings...', 'success');

        // Reset form
        document.getElementById('booking-form').reset();
        document.getElementById('total-price').textContent = '-';

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    } catch (error) {
        console.error('Booking error:', error);
        showError(error.message || 'Failed to create booking. Please try again.');
    } finally {
        // Re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}
