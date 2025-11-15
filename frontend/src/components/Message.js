/**
 * Message/Notification Component
 */

export function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
}

export function showError(message) {
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
