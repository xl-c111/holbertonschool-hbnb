// Global variables to store places data
let allPlaces = [];
let currentToken = null;
const API_BASE = 'http://127.0.0.1:5000';

// Helper: build headers with optional JWT from cookie
function buildHeaders(extra = {}) {
    const token = getCookie('token');
    const base = { 'Content-Type': 'application/json' };
    if (token) base['Authorization'] = `Bearer ${token}`;
    return { ...base, ...extra };
}

// Helper: API fetch wrapper (JSON by default)
async function apiFetch(path, options = {}) {
    const { method = 'GET', headers = {}, body } = options;
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: buildHeaders(headers),
        body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });
    return res;
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-page');
    const registerForm = document.getElementById('register-page');

    // Handle registration form if we're on the register page
    if (registerForm) {
        console.log('✅ Registration form found, attaching event listener');
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission behavior
            console.log('🎯 Registration form submitted');

            const firstName = document.getElementById('first_name').value.trim();
            const lastName = document.getElementById('last_name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            const registerBtn = document.getElementById('registerBtn');
            const registerText = document.getElementById('registerText');
            const registerLoading = document.getElementById('registerLoading');
            const messageDiv = document.getElementById('message');

            // Client-side validation
            if (password !== confirmPassword) {
                messageDiv.textContent = 'Passwords do not match!';
                messageDiv.className = 'message error';
                messageDiv.classList.remove('hidden');
                return;
            }

            // Validate password complexity
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
            if (!passwordRegex.test(password)) {
                messageDiv.textContent = 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character.';
                messageDiv.className = 'message error';
                messageDiv.classList.remove('hidden');
                return;
            }

            registerBtn.disabled = true;
            registerText.classList.add('hidden');
            registerLoading.classList.remove('hidden');

            try {
                console.log('Attempting registration with:', { firstName, lastName, email });
                // Send POST request to the registration API
                const response = await apiFetch('/api/v1/users/', {
                    method: 'POST',
                    body: {
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                        password: password
                    }
                });
                console.log('Registration response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Registration successful:', data);

                    // Show success message
                    messageDiv.textContent = '✅ Registration successful! Redirecting to login...';
                    messageDiv.className = 'message success';
                    messageDiv.classList.remove('hidden');

                    // Redirect to login page after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    // Registration failed - show error message from response
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (_) {
                        errorData = { error: `HTTP ${response.status}` };
                    }

                    const errorMessage = errorData.error || 'Registration failed';
                    messageDiv.textContent = errorMessage;
                    messageDiv.className = 'message error';
                    messageDiv.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error:', error);
                messageDiv.textContent = 'An error occurred. Please try again.';
                messageDiv.className = 'message error';
                messageDiv.classList.remove('hidden');
            } finally {
                // Reset button state
                registerBtn.disabled = false;
                registerText.classList.remove('hidden');
                registerLoading.classList.add('hidden');
            }
        });
    }

    // Handle login form if we're on the login page
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission behavior

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const loginText = document.getElementById('loginText');
            const loginLoading = document.getElementById('loginLoading');
            const messageDiv = document.getElementById('message');

            loginBtn.disabled = true;
            loginText.classList.add('hidden');
            loginLoading.classList.remove('hidden');

            try {
                console.log('Attempting login with:', { email });
                // Send POST request to the login API
                const response = await apiFetch('/api/v1/auth/login', {
                    method: 'POST',
                    body: { email, password }
                });
                console.log('Login response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Login successful:', data);
                    // Store JWT token in cookie
                    document.cookie = `token=${data.access_token}; path=/`;

                    // Redirect to main page
                    window.location.href = 'index.html';
                } else {
                    // Login failed - show error message from response
                    let errorText;
                    try { errorText = await response.text(); } catch (_) { errorText = ''; }
                    alert('Login failed: ' + (errorText || `HTTP ${response.status}`));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            } finally {
                // Reset button state
                loginBtn.disabled = false;
                loginText.classList.remove('hidden');
                loginLoading.classList.add('hidden');
            }
        });
    }

    // Check if we're on the place details page and initialize it
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get('id');

    if (placeId) {
        // We're on a place details page
        fetchPlaceDetails(placeId);
        fetchPlaceReviews(placeId);
    } else {
        // We're on another page, check authentication normally
        checkAuthentication();
    }

    // Initialize review form if we're on the add_review page
    initializeReviewForm();
});

/**
 * Get cookie value by name
 * @param {string} name - The name of the cookie
 * @returns {string|null} - The cookie value or null if not found
 */
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) {
            return value;
        }
    }
    return null;
}

/**
 * Check if user is authenticated and control UI elements accordingly
 */
function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('loginLink');
    const logoutBtn = document.getElementById('logoutBtn');

    currentToken = token;

    // Handle login link visibility
    if (loginLink) {
        if (!token) {
            loginLink.style.display = 'block';
            loginLink.classList.remove('hidden');
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
                logoutBtn.classList.add('hidden');
            }
        } else {
            loginLink.style.display = 'none';
            loginLink.classList.add('hidden');
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
                logoutBtn.classList.remove('hidden');
            }
        }

        // Always fetch places, regardless of login status
        if (document.getElementById('places-list')) {
            fetchPlaces(token);
        }
    }
}

/**
 * Fetch places data from the API
 * @param {string} token - JWT authentication token (optional)
 */
async function fetchPlaces(token) {
    const placesContainer = document.getElementById('places-list');
    if (!placesContainer) return;

    try {
        placesContainer.innerHTML = '<div class="loading">🔮 Loading places...</div>';

        const response = await apiFetch('/api/v1/places/');

        if (!response.ok) {
            throw new Error('Failed to fetch places');
        }

        const places = await response.json();
        allPlaces = places;

        console.log('Fetched places:', places);

        displayPlaces(places);
        setupPriceFilter();

    } catch (error) {
        console.error('Error:', error);
        placesContainer.innerHTML = `
            <div class="error-message">
                <h3>👻 Oops! Something went wrong</h3>
                <p>Unable to load places. Please try again later.</p>
                <button onclick="fetchPlaces('${token}')" class="retry-btn">🔄 Retry</button>
            </div>
        `;
        showMessage('Failed to load places. Please try again.', 'error');
    }
}

/**
 * Display places in the DOM
 * @param {Array} places - Array of place objects
 */
function displayPlaces(places) {
    const placesContainer = document.getElementById('places-list');
    if (!placesContainer) return;

    placesContainer.innerHTML = '';

    if (!places || places.length === 0) {
        placesContainer.innerHTML = `
            <div class="no-places">
                <h3>🦇 No places found</h3>
                <p>There are no places available at the moment.</p>
            </div>
        `;
        return;
    }

    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.classList.add('place-card');
        placeCard.dataset.price = place.price || 0;

        placeCard.innerHTML = `
            <h3 class="place-title-card">🏚️ ${place.title || place.name || 'Unnamed Place'}</h3>
            <span class="place-price">$${place.price || 0}/night</span>

            <div class="place-details">
                <p class="place-description">
                    ${place.description || 'No description available'}
                </p>
                <div class="place-info">
                    <span class="place-location">📍 Latitude ${place.latitude || 'N/A'}, Longitude ${place.longitude || 'N/A'}</span>
                </div>
            </div>
            <div class="place-actions">
                <button class="details-button" onclick="viewPlace('${place.id || ''}')">👀 View Details</button>
            </div>
        `;

        placesContainer.appendChild(placeCard);
    });

    showMessage(`Found ${places.length} places`, 'success');
}

/**
 * Setup price filter event listener
 */
function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (!priceFilter) return;

    priceFilter.addEventListener('change', function() {
        const selectedValue = priceFilter.value;
        let minPrice = 0;
        let maxPrice = Infinity;

        if (selectedValue === '0-50') {
            maxPrice = 50;
        } else if (selectedValue === '51-100') {
            minPrice = 51;
            maxPrice = 100;
        } else if (selectedValue === '101-200') {
            minPrice = 101;
            maxPrice = 200;
        } else if (selectedValue === '201+') {
            minPrice = 201;
        }

        const placeCards = document.querySelectorAll('.place-card');
        let visibleCount = 0;

        placeCards.forEach((card) => {
            const price = parseFloat(card.dataset.price) || 0;
            console.log(`Filtering: place price = ${price}, range = ${minPrice} to ${maxPrice}`);

            if (price >= minPrice && price <= maxPrice) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        const filterMessage = selectedValue === 'all'
            ? `Showing all ${visibleCount} places`
            : `Showing ${visibleCount} places in range ${selectedValue}`;

        showMessage(filterMessage, 'info');
    });

    priceFilter.dispatchEvent(new Event('change'));
}

/**
 * Show all places
 */
function showAllPlaces() {
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        priceFilter.value = 'all';
        priceFilter.dispatchEvent(new Event('change'));
    }

    showMessage('Showing all places', 'success');
}

/**
 * Display messages to user
 * @param {string} text - Message text
 * @param {string} type - Message type (success, error, info)
 */
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');

        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
}

/**
 * View place details
 * @param {string} placeId - Place ID
 */
function viewPlace(placeId) {
    window.location.href = `place.html?id=${placeId}`;
}

/**
 * Logout function
 */
function logout() {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    allPlaces = [];
    currentToken = null;

    const placesContainer = document.getElementById('places-list');
    if (placesContainer) {
        placesContainer.innerHTML = '';
    }

    showMessage('👻 Logged out successfully!', 'success');

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

/**
 * Fetch place details from the API
 * @param {string} placeId - Place ID
 */
async function fetchPlaceDetails(placeId) {
    try {
        console.log(`Fetching place details for ID: ${placeId}`);

        const response = await apiFetch(`/api/v1/places/${placeId}`);

        console.log('Place details response status:', response.status);

        if (response.ok) {
            const place = await response.json();
            console.log('Place details fetched:', place);
            populatePlaceDetails(place);

            // Create the review button with the correct place ID
            createReviewButton(placeId);
        } else {
            const errorText = await response.text();
            console.error('Failed to fetch place details:', errorText);
            showError('Failed to load place details');
        }
    } catch (error) {
        console.error('Error fetching place details:', error);
        showError('Network error occurred');
    }
}


/**
 * Fetch reviews data from the API
 * @param {string} placeId - Place ID
 */
async function fetchPlaceReviews(placeId) {
    try {
        console.log(`📡 Fetching reviews for place ID: ${placeId}`);

        const response = await apiFetch(`/api/v1/places/${placeId}/reviews`);

        if (response.ok) {
            const reviews = await response.json(); // ✅ define reviews
            console.log('✅ Reviews fetched:', reviews);

            const averageRating = calculateAverageRating(reviews);
            populateReviews(reviews);
            updateRatingUI(averageRating);

        } else {
            console.error(`❌ Failed to fetch reviews: ${response.status}`);
        }
    } catch (error) {
        console.error('🚨 Error fetching reviews:', error);
    }
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

/**
 * Populate place details into the HTML
 */
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
        // Convert coordinates to city name (simplified for demo)
        let cityName = 'Unknown Location';
        if (place.latitude && place.longitude) {
            // Simple mapping based on coordinates (you can enhance this)
            cityName = `${place.latitude.toFixed(2)}°, ${place.longitude.toFixed(2)}°`;
        }

        locationSection.innerHTML = `
            <span class="detail-label">📍 Location</span>
            <div class="detail-value place-location">${cityName}</div>
        `;
        }

        const reviewButton = document.querySelector('.add-review-btn');
        const reviewLink = document.querySelector('a[href*="add_review.html"]');

        if (reviewLink && place.id) {
            reviewLink.href = `add_review.html?id=${place.id}`;
            console.log(`Updated review link with place ID: ${place.id}`);
        }

        populateAmenities(place.amenities || []);
        console.log('Place details populated successfully');

    } catch (error) {
        console.error('Error populating place details:', error);
        showError('Error displaying place information');
    }
}

/**
 * Populate amenities list
 */
function populateAmenities(amenities) {
    const amenitiesList = document.querySelector('.amenities-list');
    if (!amenitiesList) return;

    amenitiesList.innerHTML = '';

    if (!amenities || amenities.length === 0) {
        amenitiesList.innerHTML = '<li class="amenity-item"><span>No amenities listed</span></li>';
        return;
    }

    amenities.forEach(amenity => {
        const li = document.createElement('li');
        li.className = 'amenity-item';

        let amenityName, amenityIcon;

        if (typeof amenity === 'string') {
            amenityName = amenity;
            amenityIcon = getAmenityIcon(amenity);
        } else if (amenity.name || amenity.title) {
            amenityName = amenity.name || amenity.title;
            amenityIcon = amenity.icon || getAmenityIcon(amenityName);
        } else {
            amenityName = 'Mysterious Amenity';
            amenityIcon = '👁️';
        }

        li.innerHTML = `
            <span class="amenity-icon">${amenityIcon}</span>
            <span>${amenityName}</span>
        `;
        amenitiesList.appendChild(li);
    });
    console.log(`Populated ${amenities.length} amenities`);
}

/**
 * Get appropriate icon for amenity based on name
 */
function getAmenityIcon(amenityName) {
    const name = amenityName.toLowerCase();

    const iconMap = {
        'wifi': '📶',
        'parking': '🅿️',
        'pool': '🏊‍♂️',
        'fitness': '💪',
        'food': '🔮'
    };

    for (const [keyword, icon] of Object.entries(iconMap)) {
        if (name.includes(keyword)) {
            return icon;
        }
    }
    return '🏠';
}

/**
 * Populate reviews
 */
function populateReviews(reviews) {
    const reviewsContainer = document.getElementById('reviews-list'); // ✅ Correct ID

    if (!reviewsContainer) return;

    reviewsContainer.innerHTML = ''; // Clear previous content

    if (!reviews || reviews.length === 0) {
        console.log('Review object:', reviews);

        const noReviewsMsg = document.createElement('p');
        noReviewsMsg.textContent = '👻 No reviews yet. Be the first to share your experience!';
        noReviewsMsg.style.textAlign = 'center';
        noReviewsMsg.style.color = '#9ca3af';
        reviewsContainer.appendChild(noReviewsMsg);
        return;
    }

    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-item';

        const reviewerName = review.user_name || '🔮 Anonymous';
        const rating = review.rating || 5;
        const reviewText = review.text || 'No comment provided';

        reviewElement.innerHTML = `
        <div class="review-card">
            <div class="review-header">
                <span class="reviewer-name">${reviewerName}</span>
                <span class="review-rating">${generateStars(rating)}</span>
        </div>
        <p class="review-text">${reviewText}</p>
        </div>
    `;

        reviewsContainer.appendChild(reviewElement);
    });

    console.log(`✅ Populated ${reviews.length} reviews`);
}

/**
 * Generate star rating HTML
 */
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '⭐';
    }

    if (hasHalfStar) {
        stars += '⭐';
    }

    return stars;
}

/**
 * Show error message to user
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 1rem;
        border-radius: 8px;
        margin: 2rem;
        text-align: center;
    `;
    errorDiv.textContent = message;

    const main = document.querySelector('main');
    if (main) {
        main.insertBefore(errorDiv, main.firstChild);
    }
}


// Review section - Initialization for review form on add_review.html page
// This will only run if the elements exist on the page

function initializeReviewForm() {
    const placeNameSpan = document.getElementById('place-name');
    const reviewForm = document.getElementById('reviewForm');
    const messageBox = document.getElementById('message');

    // Only initialize if we're on the review form page
    if (!reviewForm) return;

    // Get place_id from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get('id');

    // DEBUG: Log all URL parameters to see what's available
    console.log('All URL parameters:', Object.fromEntries(urlParams.entries()));
    console.log('Looking for place_id:', placeId);
    console.log('Current URL:', window.location.href);

    if (!placeId) {
        console.error('❌ No place_id found in URL.');
        console.error('Available parameters:', Array.from(urlParams.keys()));

        // Show error message to user
        if (placeNameSpan) {
            placeNameSpan.textContent = '[Unknown Place - No ID provided]';
        }

        if (messageBox) {
            messageBox.classList.remove('hidden');
        }
        return;
    }

    // Get token for authenticated requests
    const token = getCookie('token');

    if (!token) {
        console.error('❌ No authentication token found');
        if (messageBox) {
            messageBox.textContent = '❌ Please log in to submit a review';
            messageBox.className = 'message error';
            messageBox.classList.remove('hidden');
        }
        return;
    }

    // Fetch place details using the correct endpoint
    console.log(`Fetching place details for ID: ${placeId}`);

    apiFetch(`/api/v1/places/${placeId}`)
        .then(res => {
            console.log('Place details response status:', res.status);
            if (!res.ok) throw new Error(`Failed to fetch place details: ${res.status}`);
            return res.json();
        })
        .then(place => {
            console.log('Place details fetched:', place);
            if (placeNameSpan) {
                placeNameSpan.textContent = `🏚️ ${place.name || place.title || 'Unknown Place'}`;
            }
        })
        .catch(err => {
            console.error('Error fetching place details:', err);
            if (placeNameSpan) {
                placeNameSpan.textContent = '[Error Loading Place]';
            }
            if (messageBox) {
                messageBox.textContent = '❌ Failed to load place details';
                messageBox.className = 'message error';
                messageBox.classList.remove('hidden');
            }
        });

    // Handle review form submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const reviewText = document.getElementById('review').value.trim();
            const rating = document.getElementById('rating').value;

            if (!reviewText || !rating) {
                showMessage('⚠️ Please fill in all fields.', 'error');
                return;
            }

            const reviewData = {
                place_id: placeId,
                text: reviewText,
                rating: parseInt(rating)
            };

            console.log('Submitting review data:', reviewData);

            // Submit review to the correct endpoint
            apiFetch('/api/v1/reviews/', {
                method: 'POST',
                body: reviewData
            })
                .then(res => {
                    console.log('Review submission response status:', res.status);
                    if (!res.ok) {
                        // Check if token expired (401 status)
                        if (res.status === 401) {
                            return res.json().then(data => {
                                if (data.msg && data.msg.includes('expired')) {
                                    // Token expired - redirect to login
                                    showMessage('⏰ Your session has expired. Redirecting to login...', 'error');
                                    setTimeout(() => {
                                        window.location.href = 'login.html';
                                    }, 2000);
                                    throw new Error('Token expired');
                                }
                                throw new Error(`Failed to submit review: ${res.status} - ${JSON.stringify(data)}`);
                            });
                        }
                        return res.text().then(text => {
                            throw new Error(`Failed to submit review: ${res.status} - ${text}`);
                        });
                    }
                    return res.json();
                })
                .then(data => {
                    console.log('Review submitted successfully:', data);
                    showMessage('✅ Review submitted successfully!', 'success');
                    reviewForm.reset();

                    // Redirect back to place details after successful submission
                    setTimeout(() => {
                        window.location.href = `place.html?id=${placeId}`;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Error submitting review:', err);
                    // Don't show error if it's token expiration (already handled)
                    if (err.message !== 'Token expired') {
                        showMessage(`❌ Failed to submit review: ${err.message}`, 'error');
                    }
                });
        });
    }

    function showMessage(msg, type) {
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
}

// Add this function to create the review button dynamically
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

    console.log(`✅ Created review button for place ID: ${placeId}`);
}
