/**
 * Home Page - Place listing and filtering
 */
import { auth } from '../auth/index.js';
import { placesAPI } from '../api/places.js';
import { PlaceCard, NoPlacesMessage, LoadingPlaces } from '../components/PlaceCard.js';
import { showMessage } from '../components/Message.js';

let allPlaces = [];

export async function initHomePage() {
    checkAuthentication();
    await loadPlaces();
    setupPriceFilter();
    setupEventHandlers();
}

function setupEventHandlers() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.logout();
        });
    }

    // Show all places link
    const showAllPlacesLink = document.getElementById('showAllPlaces');
    if (showAllPlacesLink) {
        showAllPlacesLink.addEventListener('click', (e) => {
            e.preventDefault();
            const priceFilter = document.getElementById('price-filter');
            if (priceFilter) {
                priceFilter.value = 'all';
                priceFilter.dispatchEvent(new Event('change'));
            }
            showMessage('Showing all places', 'info');
        });
    }
}

function checkAuthentication() {
    const loginLink = document.getElementById('loginLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const addPlaceLink = document.getElementById('addPlaceLink');

    if (loginLink) {
        if (!auth.isAuthenticated()) {
            loginLink.style.display = 'block';
            loginLink.classList.remove('hidden');
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
                logoutBtn.classList.add('hidden');
            }
            if (addPlaceLink) {
                addPlaceLink.style.display = 'none';
                addPlaceLink.classList.add('hidden');
            }
        } else {
            loginLink.style.display = 'none';
            loginLink.classList.add('hidden');
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
                logoutBtn.classList.remove('hidden');
            }
            if (addPlaceLink) {
                addPlaceLink.style.display = 'block';
                addPlaceLink.classList.remove('hidden');
            }
        }
    }
}

async function loadPlaces() {
    const container = document.getElementById('places-list');
    if (!container) return;

    try {
        container.innerHTML = LoadingPlaces();

        const places = await placesAPI.getAll();
        allPlaces = places;

        displayPlaces(places);
        showMessage(`Found ${places.length} places`, 'success');
    } catch (error) {
        console.error('Error loading places:', error);
        container.innerHTML = `
            <div class="error-message">
                <h3>👻 Oops! Something went wrong</h3>
                <p>Unable to load places. Please try again later.</p>
                <button onclick="location.reload()" class="retry-btn">🔄 Retry</button>
            </div>
        `;
        showMessage('Failed to load places', 'error');
    }
}

function displayPlaces(places) {
    const container = document.getElementById('places-list');
    if (!container) return;

    if (!places || places.length === 0) {
        container.innerHTML = NoPlacesMessage();
        return;
    }

    container.innerHTML = places.map(place => PlaceCard(place)).join('');
}

function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (!priceFilter) return;

    priceFilter.addEventListener('change', () => {
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

        filterPlacesByPrice(minPrice, maxPrice, selectedValue);
    });

    priceFilter.dispatchEvent(new Event('change'));
}

function filterPlacesByPrice(minPrice, maxPrice, rangeLabel) {
    const placeCards = document.querySelectorAll('.place-card');
    let visibleCount = 0;

    placeCards.forEach(card => {
        const price = parseFloat(card.dataset.price) || 0;
        if (price >= minPrice && price <= maxPrice) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    const message = rangeLabel === 'all'
        ? `Showing all ${visibleCount} places`
        : `Showing ${visibleCount} places in range ${rangeLabel}`;

    showMessage(message, 'info');
}
