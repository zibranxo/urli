// This file handles the URL shortening functionality
document.addEventListener('DOMContentLoaded', function() {
    const shortenForm = document.getElementById('shorten-form');
    const longUrlInput = document.getElementById('long-url');
    const resultContainer = document.getElementById('result-container');
    const shortUrlDisplay = document.getElementById('short-url-display');
    const copyButton = document.getElementById('copy-button');
    const qrLink = document.getElementById('qr-link');
    const downloadQr = document.getElementById('download-qr');
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Copy button functionality
    if (copyButton) {
        copyButton.addEventListener('click', function() {
            shortUrlDisplay.select();
            navigator.clipboard.writeText(shortUrlDisplay.value).then(() => {
                // Update tooltip text temporarily
                const tooltip = bootstrap.Tooltip.getInstance(copyButton);
                copyButton.setAttribute('data-bs-original-title', 'Copied!');
                tooltip.show();
                
                // Restore tooltip after a delay
                setTimeout(() => {
                    copyButton.setAttribute('data-bs-original-title', 'Copy to clipboard');
                }, 2000);
                
                // Visual feedback
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            });
        });
    }

    // Download QR Code
    if (downloadQr) {
        downloadQr.addEventListener('click', function() {
            const shortCode = shortUrlDisplay.value.split('/').pop();
            const qrUrl = `/qr/${shortCode}`;
            
            // Create a temporary link and trigger download
            fetch(qrUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `qrcode-${shortCode}.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                
                // Visual feedback
                downloadQr.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
                setTimeout(() => {
                    downloadQr.innerHTML = '<i class="fas fa-download me-1"></i> Download QR';
                }, 2000);
            })
            .catch(error => {
                console.error('Error downloading QR code:', error);
                alert('Error downloading QR code. Please try again.');
            });
        });
    }

    if (shortenForm) {
        shortenForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const longUrl = longUrlInput.value.trim();
            if (!longUrl) {
                alert('Please enter a URL');
                return;
            }

            // Add spinner to button
            const submitButton = shortenForm.querySelector('button[type="submit"]');
            const originalButtonContent = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Shortening...';

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
                // Display results
                shortUrlDisplay.value = data.short_url;
                qrLink.href = data.qr_code;
                resultContainer.style.display = 'block';
                
                // Reset form state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonContent;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error shortening URL. Please try again.');
                
                // Reset form state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonContent;
            });
        });
    }
});