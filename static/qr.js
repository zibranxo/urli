document.addEventListener('DOMContentLoaded', function() {
    const qrForm = document.getElementById('qr-form');
    const qrUrlInput = document.getElementById('qr-url');
    const qrImage = document.getElementById('qr-image');
    const qrResult = document.getElementById('qr-result');
    const downloadQrBtn = document.getElementById('download-qr');
    const copyShortUrlBtn = document.getElementById('copy-short-url');
    
    let currentShortCode = '';

    if (qrForm) {
        qrForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const shortUrl = qrUrlInput.value.trim();
            if (!shortUrl) {
                alert('Please enter a short URL');
                return;
            }

            // Add spinner to button
            const submitButton = qrForm.querySelector('button[type="submit"]');
            const originalButtonContent = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';

            // Extract the short code from the URL
            try {
                const url = new URL(shortUrl);
                currentShortCode = url.pathname.substring(1); // Remove the leading slash
            } catch (error) {
                // If not a valid URL, assume it's just the code
                currentShortCode = shortUrl;
            }

            if (!currentShortCode) {
                alert('Invalid URL format');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonContent;
                return;
            }

            const qrCodeUrl = `/qr/${currentShortCode}`;
            
            // Display the QR code
            qrImage.src = qrCodeUrl;
            qrImage.onload = function() {
                qrResult.style.display = 'block';
                
                // Reset form state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonContent;
            };
            
            qrImage.onerror = function() {
                alert('Error generating QR code. Please check the URL and try again.');
                
                // Reset form state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonContent;
            };
        });
    }
    
    // QR Code download functionality
    if (downloadQrBtn) {
        downloadQrBtn.addEventListener('click', function() {
            if (!currentShortCode) return;
            
            const qrCodeUrl = `/qr/${currentShortCode}`;
            
            // Create a temporary link and trigger download
            fetch(qrCodeUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `qrcode-${currentShortCode}.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                
                // Visual feedback
                const originalHTML = downloadQrBtn.innerHTML;
                downloadQrBtn.innerHTML = '<i class="fas fa-check me-1"></i> Downloaded!';
                
                setTimeout(() => {
                    downloadQrBtn.innerHTML = originalHTML;
                }, 2000);
            })
            .catch(error => {
                console.error('Error downloading QR code:', error);
                alert('Error downloading QR code. Please try again.');
            });
        });
    }
    
    // Copy short URL functionality
    if (copyShortUrlBtn) {
        copyShortUrlBtn.addEventListener('click', function() {
            if (!currentShortCode) return;
            
            const shortUrl = `http://127.0.0.1:5000/${currentShortCode}`;
            
            navigator.clipboard.writeText(shortUrl).then(() => {
                // Visual feedback
                const originalHTML = copyShortUrlBtn.innerHTML;
                copyShortUrlBtn.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
                
                setTimeout(() => {
                    copyShortUrlBtn.innerHTML = originalHTML;
                }, 2000);
            });
        });
    }
});