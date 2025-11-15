/**
 * Review Card Component
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

export function ReviewCard(review) {
    const reviewerName = review.user_name || '🔮 Anonymous';
    const rating = review.rating || 5;
    const reviewText = review.text || 'No comment provided';

    return `
        <div class="review-item">
            <div class="review-card">
                <div class="review-header">
                    <span class="reviewer-name">${reviewerName}</span>
                    <span class="review-rating">${generateStars(rating)}</span>
                </div>
                <p class="review-text">${reviewText}</p>
            </div>
        </div>
    `;
}

export function NoReviewsMessage() {
    return '<p style="text-align: center; color: #9ca3af;">👻 No reviews yet. Be the first to share your experience!</p>';
}

export { generateStars };
