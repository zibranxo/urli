// This file handles the URL shortening functionality
document.addEventListener('DOMContentLoaded', function() {
    const shortenForm = document.getElementById('shorten-form');
    const longUrlInput = document.getElementById('long-url');
    const shortenedUrlElement = document.getElementById('shortened-url');

    if (shortenForm) {
        shortenForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const longUrl = longUrlInput.value.trim();
            if (!longUrl) {
                alert('Please enter a URL');
                return;
            }

            // Check if URL has http/https protocol
            let formattedUrl = longUrl;
            if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
                formattedUrl = 'https://' + longUrl;
            }

            fetch('/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: formattedUrl })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                shortenedUrlElement.innerHTML = `
                    <strong>Shortened URL:</strong> 
                    <a href="${data.short_url}" target="_blank">${data.short_url}</a>
                    <br>
                    <strong>QR Code:</strong> 
                    <a href="${data.qr_code}" target="_blank">View QR Code</a>
                `;
            })
            .catch(error => {
                console.error('Error:', error);
                shortenedUrlElement.textContent = 'Error shortening URL. Please try again.';
            });
        });
    }
});