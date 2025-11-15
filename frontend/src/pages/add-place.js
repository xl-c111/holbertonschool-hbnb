/**
 * Add Place Page
 */
import { auth } from '../auth/index.js';
import { api } from '../api/client.js';

export async function initAddPlacePage() {
    // Check if user is logged in
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const addPlaceForm = document.getElementById('add-place-form');
    if (!addPlaceForm) return;

    console.log('Add place form found, attaching event listener');
    addPlaceForm.addEventListener('submit', handleAddPlaceSubmit);
}

async function handleAddPlaceSubmit(event) {
    event.preventDefault();
    console.log('Add place form submitted');

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);

    const addPlaceBtn = document.getElementById('addPlaceBtn');
    const addPlaceText = document.getElementById('addPlaceText');
    const addPlaceLoading = document.getElementById('addPlaceLoading');
    const messageDiv = document.getElementById('message');

    // Client-side validation
    if (price <= 0) {
        showError(messageDiv, 'Price must be greater than 0');
        return;
    }

    if (latitude < -90 || latitude > 90) {
        showError(messageDiv, 'Latitude must be between -90 and 90');
        return;
    }

    if (longitude < -180 || longitude > 180) {
        showError(messageDiv, 'Longitude must be between -180 and 180');
        return;
    }

    // Disable button and show loading state
    addPlaceBtn.disabled = true;
    addPlaceText.classList.add('hidden');
    addPlaceLoading.classList.remove('hidden');

    try {
        console.log('Attempting to create place:', { title, description, price, latitude, longitude });

        const response = await api.post('/api/v1/places/', {
            title,
            description,
            price,
            latitude,
            longitude
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (_) {
                errorData = { error: `HTTP ${response.status}` };
            }
            throw new Error(errorData.error || 'Failed to create place');
        }

        const newPlace = await response.json();
        console.log('Place created successfully:', newPlace);

        // Show success message
        showSuccess(messageDiv, 'Place listed successfully! Redirecting...');

        // Redirect to home page after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error('Add place error:', error);
        showError(messageDiv, error.message || 'Failed to create place. Please try again.');
    } finally {
        // Reset button state
        addPlaceBtn.disabled = false;
        addPlaceText.classList.remove('hidden');
        addPlaceLoading.classList.add('hidden');
    }
}

function showError(messageDiv, text) {
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = 'message error';
        messageDiv.classList.remove('hidden');
    }
}

function showSuccess(messageDiv, text) {
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = 'message success';
        messageDiv.classList.remove('hidden');
    }
}
