/**
 * Amenity utilities
 */

export function getAmenityIcon(amenityName) {
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

export function AmenityItem(amenity) {
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

    return `
        <li class="amenity-item">
            <span class="amenity-icon">${amenityIcon}</span>
            <span>${amenityName}</span>
        </li>
    `;
}
