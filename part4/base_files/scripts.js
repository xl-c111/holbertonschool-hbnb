document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission behavior

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        // Send POST request to the login API
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password }) // Send credentials as JSON
        });

        if (response.ok) {
          const data = await response.json();
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
      }
    });
  }
  checkAuthentication();
});

// Get cookie by name
function getCookie(name) {
  // Function to get a cookie value by its name
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key == name) {
      return value;
    }
  }
  return null;
}

// Check user authentication and show/hide login link
function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (!token) {
    loginLink.style.display = 'block';
  } else {
    loginLink.style.display = 'none';
    // Fetch places data if the user is authenticated
    fetchPlaces(token);
  }
}

// Fetch places data from API
async function fetchPlaces(token) {
  try {
    const response = await fetch('/api/v1/places', {
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

    console.log('Fetched places:', places);

    displayPlaces(places);
    setupFilterDropdown();
    setupPriceFilter();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Populate places into #places-list
function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  if (!placesList) return;
  placesList.innerHTML = ''; // Clear previous

  places.forEach((place) => {
    const placeCard = document.createElement('div');
    placeCard.classList.add('place-card');
    placeCard.dataset.price = place.price;

    placeCard.innerHTML = `
      <h3>${place.title}</h3>
      <p>${place.description}</p>
      <p><strong>Location:</strong> Latitude ${place.latitude}, Longitude ${place.longitude}</p>
      <p><strong>Price per night:</strong> $${place.price}</p>
      <button class="details-button">View Details</button>
    `;

    placesList.appendChild(placeCard);
  });
}

// Populate price filter options
function setupFilterDropdown() {
  const priceFilter = document.getElementById('price-filter');
  const options = ['10', '50', '100', 'All'];

  options.forEach((price) => {
    const option = document.createElement('option');
    option.value = price;
    option.textContent = price;
    priceFilter.appendChild(option);
  });
}

// Filter places when dropdown changes
function setupPriceFilter() {
  const priceFilter = document.getElementById('price-filter');
  if (!priceFilter) return;

  priceFilter.addEventListener('change', () => {
    const selectedValue = priceFilter.value;
    const maxPrice =
      selectedValue === 'All' ? Infinity : parseFloat(selectedValue);

    const placeCards = document.querySelectorAll('.place-card');

    placeCards.forEach((card) => {
      const price = parseFloat(card.dataset.price);
      console.log(`Filtering: place price = ${price}, max = ${maxPrice}`);

      if (!isNaN(price) && price <= maxPrice) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Make sure filtering happens as soon as the page loads
  priceFilter.dispatchEvent(new Event('change'));
}
