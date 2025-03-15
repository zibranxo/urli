// This file handles the QR code generation functionality
document.addEventListener('DOMContentLoaded', function() {
    const qrForm = document.getElementById('qr-form');
    const qrUrlInput = document.getElementById('qr-url');
    const qrImage = document.getElementById('qr-image');

    if (qrForm) {
        qrForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const shortUrl = qrUrlInput.value.trim();
            if (!shortUrl) {
                alert('Please enter a short URL');
                return;
            }

            // Extract the short code from the URL
            let shortCode;
            try {
                const url = new URL(shortUrl);
                shortCode = url.pathname.substring(1); // Remove the leading slash
            } catch (error) {
                // If not a valid URL, assume it's just the code
                shortCode = shortUrl;
            }

            if (!shortCode) {
                alert('Invalid URL format');
                return;
            }

            const qrCodeUrl = `/qr/${shortCode}`;
            
            // Display the QR code
            qrImage.src = qrCodeUrl;
            qrImage.style.display = 'block';
        });
    }
});