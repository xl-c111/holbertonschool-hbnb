// Global variables to store places data
let allPlaces = [];
let currentToken = null;

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
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
        const response = await fetch(
          'http://127.0.0.1:5000/api/v1/auth/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }) // Send credentials as JSON
          }
        );
        console.log('Login response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Login successful:', data);
          // Store JWT token in cookie
          document.cookie = `token=${data.access_token}; path=/`;

          // Redirect to main page
          const urlParams = new URLSearchParams(window.location.search);
          const nextUrl = urlParams.get('next');

          window.location.href = nextUrl
            ? decodeURIComponent(nextUrl)
            : 'index.html';
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

      initializeReviewForm();
    });
  }

  // Check if we're on the place details page and initialize it
  const urlParams = new URLSearchParams(window.location.search);
  const placeId = urlParams.get('place_id');

  if (placeId) {
    // We're on a place details page
    fetchPlaceDetails(placeId);
    fetchPlaceReviews(placeId);
  } else {
    // We're on another page, check authentication normally
    checkAuthentication();
  }
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

      if (document.getElementById('places-list')) {
        showMessage('Please log in to view places.', 'info');
      }
    } else {
      loginLink.style.display = 'none';
      loginLink.classList.add('hidden');
      if (logoutBtn) {
        logoutBtn.style.display = 'block';
        logoutBtn.classList.remove('hidden');
      }

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
    placesContainer.innerHTML =
      '<div class="loading">🔮 Loading places...</div>';

    const response = await fetch('http://127.0.0.1:5000/api/v1/places/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

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

  places.forEach((place) => {
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

  priceFilter.addEventListener('change', function () {
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
      console.log(
        `Filtering: place price = ${price}, range = ${minPrice} to ${maxPrice}`
      );

      if (price >= minPrice && price <= maxPrice) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const filterMessage =
      selectedValue === 'all'
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
  if (!currentToken) {
    showMessage('Please log in to view places.', 'error');
    return;
  }

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
  window.location.href = `place.html?place_id=${placeId}`;
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
  const token = getCookie('token');

  try {
    console.log(`Fetching place details for ID: ${placeId}`);

    const response = await fetch(
      `http://127.0.0.1:5000/api/v1/places/${placeId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

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
  const token = getCookie('token');

  try {
    console.log(`📡 Fetching reviews for place ID: ${placeId}`);

    const response = await fetch(
      `http://127.0.0.1:5000/api/v1/places/${placeId}/reviews`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

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
  // Get the elements for average rating value and stars
  const ratingElement = document.getElementById('avg-rating');
  const starsElement = document.getElementById('avg-stars');

  if (ratingElement) {
    if (rating) {
      // Show rating value with one decimal
      ratingElement.textContent = rating.toFixed(1);

      // Render stars based on rating
      if (starsElement) {
        starsElement.textContent = renderStars(rating);
      }
    } else {
      // Show dash if no rating
      ratingElement.textContent = '—';

      // Clear stars
      if (starsElement) {
        starsElement.textContent = '';
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
      const lat = place.latitude || 'N/A';
      const lon = place.longitude || 'N/A';

      locationSection.innerHTML = `
            <span class="detail-label">📍 Location:</span>
            <span class="place-location"> Latitude ${place.latitude || 'N/A'}, Longitude ${place.longitude || 'N/A'}</span>
        `;
    }

    const reviewButton = document.querySelector('.add-review-btn');
    const reviewLink = document.querySelector('a[href*="add_review.html"]');

    if (reviewLink && place.id) {
      reviewLink.href = `add_review.html?place_id=${place.id}`;
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
    amenitiesList.innerHTML =
      '<li class="amenity-item"><span>No amenities listed</span></li>';
    return;
  }

  amenities.forEach((amenity) => {
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
    wifi: '📶',
    parking: '🅿️',
    pool: '🏊‍♂️',
    fitness: '💪',
    food: '🔮'
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
  const reviewsContainer = document.getElementById('reviews-list');
  if (!reviewsContainer) return;

  reviewsContainer.innerHTML = '';

  if (!reviews || reviews.length === 0) {
    const noReviewsMsg = document.createElement('p');
    noReviewsMsg.textContent =
      '👻 No reviews yet. Be the first to share your experience!';
    noReviewsMsg.style.textAlign = 'center';
    noReviewsMsg.style.color = '#9ca3af';
    reviewsContainer.appendChild(noReviewsMsg);
    return;
  }

  reviews.forEach((review) => {
    // Create the article element
    const article = document.createElement('article');
    article.className = 'review';
    article.setAttribute('itemprop', 'review');
    article.setAttribute('itemscope', '');
    article.setAttribute('itemtype', 'https://schema.org/Review');

    // Header with author, date, and rating
    const header = document.createElement('header');
    header.className = 'review-head';

    const author = document.createElement('strong');
    author.className = 'review-author';
    author.setAttribute('itemprop', 'author');
    // Force anonymous (do not show UUID)
    author.textContent = review.user_name || 'Anonymous';

    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.textContent = '•';

    const time = document.createElement('time');
    time.className = 'review-date';
    const createdDate = review.created_at
      ? new Date(review.created_at)
      : new Date();
    time.setAttribute('datetime', createdDate.toISOString());
    time.textContent = createdDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });

    const stars = document.createElement('span');
    stars.className = 'review-stars';
    const ratingValue = Number(review.rating) || 0;
    stars.setAttribute('aria-label', `${ratingValue} out of 5`);
    stars.textContent = renderStars(ratingValue);

    // order: Author • Date .......... Stars (right)
    header.appendChild(author);
    header.appendChild(dot);
    header.appendChild(time);
    header.appendChild(stars);

    // Review body
    const body = document.createElement('p');
    body.className = 'review-text';
    body.setAttribute('itemprop', 'reviewBody');
    body.textContent = review.text || 'No comment provided';

    article.appendChild(header);
    article.appendChild(body);

    reviewsContainer.appendChild(article);
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

// Review section

document.addEventListener('DOMContentLoaded', function () {
  const isAddReviewPage = window.location.pathname.includes('add_review.html');
  if (!isAddReviewPage) return;
  const placeNameSpan = document.getElementById('place-name');
  const reviewForm = document.getElementById('reviewForm');
  const messageBox = document.getElementById('message');

  const urlParams = new URLSearchParams(window.location.search);
  const placeId = urlParams.get('place_id');

  if (!placeId) {
    console.error('❌ No place_id found in URL.');
    if (placeNameSpan) {
      placeNameSpan.textContent = '[Unknown Place - No ID provided]';
    }
    if (messageBox) {
      messageBox.textContent = '❌ Error: No place ID found in URL';
      messageBox.className = 'message error';
      messageBox.classList.remove('hidden');
    }
    return;
  }

  // Get token for authenticated requests
  const token = getCookie('token');

  if (!token) {
    console.warn('User not logged in, redirecting to login');

    const currentUrl = window.location.pathname + window.location.search;
    const nextUrl = encodeURIComponent(currentUrl);

    window.location.href = `login.html?next=${nextUrl}`;
    return;
  }

  // Fetch place details using the correct endpoint
  console.log(`Fetching place details for ID: ${placeId}`);

  fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      console.log('Place details response status:', res.status);
      if (!res.ok)
        throw new Error(`Failed to fetch place details: ${res.status}`);
      return res.json();
    })
    .then((place) => {
      console.log('Place details fetched:', place);
      if (placeNameSpan) {
        placeNameSpan.textContent = `🏚️ ${place.name || place.title || 'Unknown Place'}`;
      }
    })
    .catch((err) => {
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
      fetch('http://127.0.0.1:5000/api/v1/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      })
        .then((res) => {
          console.log('Review submission response status:', res.status);
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(
                `Failed to submit review: ${res.status} - ${text}`
              );
            });
          }
          return res.json();
        })
        .then((data) => {
          console.log('Review submitted successfully:', data);
          showMessage('✅ Review submitted successfully!', 'success');
          reviewForm.reset();

          // Redirect back to place details after successful submission
          setTimeout(() => {
            window.location.href = `place.html?place_id=${placeId}`;
          }, 2000);
        })
        .catch((err) => {
          console.error('Error submitting review:', err);
          showMessage(`❌ Failed to submit review: ${err.message}`, 'error');
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

  // Helper function to get cookie (if not already defined)
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
});

// Dynamically create the "Share Your Supernatural Experience" button
function createReviewButton(placeId) {
  const reviewsSection = document.querySelector('.reviews-section');
  if (!reviewsSection || !placeId) {
    console.log('❌ Cannot create review button: missing section or placeId');
    return;
  }

  // Clear any existing button/link
  reviewsSection.innerHTML = '';

  // Create anchor element
  const reviewLink = document.createElement('a');
  reviewLink.href = `add_review.html?place_id=${placeId}`;
  reviewLink.style.textDecoration = 'none'; // Optional: remove underline

  // Create button element inside anchor
  const reviewButton = document.createElement('button');
  reviewButton.textContent = '🕯️ Share Your Supernatural Experience';
  reviewButton.className = 'add-review-btn';

  // Append button inside anchor, then into section
  reviewLink.appendChild(reviewButton);
  reviewsSection.appendChild(reviewLink);

  console.log(`Review button added for place ID: ${placeId}`);
}

// Replace your existing star helpers with these

function renderStars(rating) {
  // Round to nearest 0.5
  const r = Math.round(Number(rating) * 2) / 2;
  if (!Number.isFinite(r) || r <= 0) return '';

  const full = Math.floor(r);
  const hasHalf = r % 1 !== 0;

  // Full gold stars
  let stars = '⭐'.repeat(full);

  // Show half as a "½" symbol after the stars (keeps all stars gold)
  if (hasHalf) stars += '½';

  return stars;
}

function updateAvgRatingUI(rating) {
  const ratingElement = document.getElementById('avg-rating');
  const starsElement = document.getElementById('avg-stars');

  if (!ratingElement) return;

  if (rating && Number(rating) > 0) {
    ratingElement.textContent = Number(rating).toFixed(1);
    if (starsElement) starsElement.textContent = renderStars(rating);
  } else {
    ratingElement.textContent = '—';
    if (starsElement) starsElement.textContent = '';
  }
}
