/**
 * Dashboard Page - User Bookings
 */
import { auth } from '../auth/index.js';
import { bookingsAPI } from '../api/bookings.js';
import { showError, showMessage } from '../components/Message.js';

export async function initDashboard() {
    // Check authentication
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.logout();
        });
    }

    // Setup tabs
    setupTabs();

    // Load bookings
    await loadUpcomingBookings();
    await loadPastBookings();
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

async function loadUpcomingBookings() {
    const container = document.getElementById('upcoming-bookings-list');
    if (!container) return;

    try {
        const response = await bookingsAPI.getMyBookings('upcoming');
        if (!response.ok) {
            throw new Error('Failed to load bookings');
        }

        const bookings = await response.json();
        displayBookings(container, bookings, 'upcoming');
    } catch (error) {
        console.error('Error loading upcoming bookings:', error);
        container.innerHTML = '<p class="error">Failed to load upcoming bookings</p>';
    }
}

async function loadPastBookings() {
    const container = document.getElementById('past-bookings-list');
    if (!container) return;

    try {
        const response = await bookingsAPI.getMyBookings('past');
        if (!response.ok) {
            throw new Error('Failed to load bookings');
        }

        const bookings = await response.json();
        displayBookings(container, bookings, 'past');
    } catch (error) {
        console.error('Error loading past bookings:', error);
        container.innerHTML = '<p class="error">Failed to load past bookings</p>';
    }
}

function displayBookings(container, bookings, type) {
    container.innerHTML = '';

    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="no-bookings">
                <p>No ${type} bookings found</p>
                <a href="index.html" class="browse-link">🏚️ Browse Places</a>
            </div>
        `;
        return;
    }

    bookings.forEach(booking => {
        container.innerHTML += createBookingCard(booking, type);
    });

    // Attach cancel button handlers
    if (type === 'upcoming') {
        attachCancelHandlers();
    }
}

function createBookingCard(booking, type) {
    const checkIn = new Date(booking.check_in_date).toLocaleDateString();
    const checkOut = new Date(booking.check_out_date).toLocaleDateString();
    const statusClass = booking.status.toLowerCase();

    const cancelButton = type === 'upcoming' && booking.status !== 'cancelled'
        ? `<button class="cancel-btn" data-booking-id="${booking.id}">Cancel Booking</button>`
        : '';

    return `
        <div class="booking-card ${statusClass}">
            <div class="booking-header">
                <span class="booking-status status-${statusClass}">${booking.status.toUpperCase()}</span>
                <span class="booking-id">ID: ${booking.id.substring(0, 8)}</span>
            </div>

            <div class="booking-details">
                <div class="booking-dates">
                    <div>
                        <strong>Check-in:</strong> ${checkIn}
                    </div>
                    <div>
                        <strong>Check-out:</strong> ${checkOut}
                    </div>
                </div>

                <div class="booking-price">
                    <strong>Total:</strong> $${booking.total_price.toFixed(2)}
                </div>
            </div>

            <div class="booking-actions">
                <a href="place.html?id=${booking.place_id}" class="view-place-btn">View Place</a>
                ${cancelButton}
            </div>
        </div>
    `;
}

function attachCancelHandlers() {
    const cancelBtns = document.querySelectorAll('.cancel-btn');

    cancelBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const bookingId = e.target.dataset.bookingId;

            if (!confirm('Are you sure you want to cancel this booking?')) {
                return;
            }

            try {
                btn.disabled = true;
                btn.textContent = 'Cancelling...';

                const response = await bookingsAPI.cancel(bookingId);

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to cancel booking');
                }

                showMessage('Booking cancelled successfully', 'success');

                // Reload bookings
                await loadUpcomingBookings();
                await loadPastBookings();
            } catch (error) {
                console.error('Cancel error:', error);
                showError(error.message || 'Failed to cancel booking');
                btn.disabled = false;
                btn.textContent = 'Cancel Booking';
            }
        });
    });
}
