/**
 * Place Card Component
 */

export function PlaceCard(place) {
    return `
        <div class="place-card" data-price="${place.price || 0}">
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
                <button class="details-button" onclick="window.location.href='place.html?id=${place.id}'">👀 View Details</button>
            </div>
        </div>
    `;
}

export function NoPlacesMessage() {
    return `
        <div class="no-places">
            <h3>🦇 No places found</h3>
            <p>There are no places available at the moment.</p>
        </div>
    `;
}

export function LoadingPlaces() {
    return '<div class="loading">🔮 Loading places...</div>';
}
