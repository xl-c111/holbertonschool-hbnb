// Global variables to store places data
let allPlaces = [];
let currentToken = null;

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-page');

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
                const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password }) // Send credentials as JSON
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
                    const errorText = await response.text();
                    alert('Login failed: ' + errorText);
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

    // Always check authentication on page load
    checkAuthentication();
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
    const loginLink = document.getElementById('loginLink'); // Updated to match your HTML
    const logoutBtn = document.getElementById('logoutBtn');

    currentToken = token;

    // Handle login link visibility
    if (loginLink) {
        if (!token) {
            // User is not authenticated - show login link
            loginLink.style.display = 'block';
            loginLink.classList.remove('hidden');
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
                logoutBtn.classList.add('hidden');
            }

            // Show message to login if we're on the main page
            if (document.getElementById('places-list')) {
                showMessage('Please log in to view places.', 'info');
            }
        } else {
            // User is authenticated - hide login link, show logout button
            loginLink.style.display = 'none';
            loginLink.classList.add('hidden');
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
                logoutBtn.classList.remove('hidden');
            }

            // Fetch places data if we're on the main page
            if (document.getElementById('places-list')) {
                fetchPlaces(token);
            }
        }
    }
}

/**
 * Fetch places data from the API
 * @param {string} token - JWT authentication token
 */
async function fetchPlaces(token) {
    const placesContainer = document.getElementById('places-list');
    if (!placesContainer) return;

    try {
        // Show loading state
        placesContainer.innerHTML = '<div class="loading">🔮 Loading places...</div>';

        const response = await fetch('http://127.0.0.1:5000/api/v1/places/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch places');
        }

        const places = await response.json();
        allPlaces = places; // Store globally for filtering

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

    // Clear current content
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

    // Create place cards using your structure
    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.classList.add('place-card');
        placeCard.dataset.price = place.price || 0;

        placeCard.innerHTML = `
            <div class="place-header">
                <h3 class="place-title">🏚️ ${place.title || place.name || 'Unnamed Place'}</h3>
                <span class="place-price">$${place.price || 0}/night</span>
            </div>
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
 * Setup price filter event listener (works with existing HTML options)
 */
function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (!priceFilter) return;

    // Add event listener for filtering based on your HTML structure
    priceFilter.addEventListener('change', function() {
        const selectedValue = priceFilter.value;
        let minPrice = 0;
        let maxPrice = Infinity;

        // Parse the selected filter value from your HTML options
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
        // 'all' means no filtering (minPrice = 0, maxPrice = Infinity)

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

        // Update message with filter results
        const filterMessage = selectedValue === 'all'
            ? `Showing all ${visibleCount} places`
            : `Showing ${visibleCount} places in range ${selectedValue}`;

        showMessage(filterMessage, 'info');
    });

    // Trigger the filter on page load to show all initially
    priceFilter.dispatchEvent(new Event('change'));
}

/**
 * Show all places (for navigation link)
 */
function showAllPlaces() {
    if (!currentToken) {
        showMessage('Please log in to view places.', 'error');
        return;
    }

    // Reset price filter
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

        // Hide message after 5 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
}

/**
 * View place details (placeholder function)
 * @param {string} placeId - Place ID
 */
function viewPlace(placeId) {
    showMessage(`🔮 Viewing details for place: ${placeId}`, 'info');
    // Here you would typically redirect to a place details page
    // window.location.href = `place.html?id=${placeId}`;
}

/**
 * Logout function
 */
function logout() {
    // Remove the token cookie
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Clear global variables
    allPlaces = [];
    currentToken = null;

    // Clear places list
    const placesContainer = document.getElementById('places-list');
    if (placesContainer) {
        placesContainer.innerHTML = '';
    }

    // Show message and redirect
    showMessage('👻 Logged out successfully!', 'success');

    // Redirect to login page after a short delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}