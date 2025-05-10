document.addEventListener('DOMContentLoaded', function() {
    const loadingElement = document.getElementById('loading');
    const analyticsContainer = document.getElementById('analytics-container');
    const noDataElement = document.getElementById('no-data');
    const refreshButton = document.getElementById('refresh-analytics');
    
    let dataTable;
    
    function fetchAnalytics() {
        if (loadingElement) loadingElement.style.display = 'block';
        if (analyticsContainer) analyticsContainer.style.display = 'none';
        if (noDataElement) noDataElement.style.display = 'none';
        
        fetch('/analytics')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (loadingElement) loadingElement.style.display = 'none';
                
                if (data.length === 0) {
                    if (noDataElement) noDataElement.style.display = 'block';
                    return;
                }

                const tableBody = document.getElementById('analytics-data');
                if (!tableBody) return;
                
                // Clear existing table data
                tableBody.innerHTML = '';
                
                // Add new data
                data.forEach(item => {
                    const row = tableBody.insertRow();
                    
                    // Short URL with copy button
                    const shortUrlCell = row.insertCell();
                    shortUrlCell.innerHTML = `
                        <div class="d-flex align-items-center">
                            <a href="${item.short_url}" target="_blank" class="me-2">${item.short_url}</a>
                            <button class="btn btn-sm btn-outline-secondary copy-btn" data-url="${item.short_url}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    `;
                    
                    // Original URL (trimmed if too long)
                    const longUrlCell = row.insertCell();
                    const displayUrl = item.long_url.length > 50 ? 
                        item.long_url.substring(0, 47) + '...' : 
                        item.long_url;
                    longUrlCell.innerHTML = `
                        <span title="${item.long_url}">${displayUrl}</span>
                    `;
                    
                    // Clicks with badge
                    const clicksCell = row.insertCell();
                    clicksCell.innerHTML = `
                        <span class="badge bg-primary rounded-pill">${item.clicks}</span>
                    `;
                    
                    // Actions (QR code)
                    const actionsCell = row.insertCell();
                    const shortCode = item.short_url.split('/').pop();
                    actionsCell.innerHTML = `
                        <div class="btn-group btn-group-sm" role="group">
                            <a href="/qr/${shortCode}" target="_blank" class="btn btn-outline-primary">
                                <i class="fas fa-qrcode"></i> QR
                            </a>
                            <a href="#" class="btn btn-outline-success download-qr" data-code="${shortCode}">
                                <i class="fas fa-download"></i>
                            </a>
                        </div>
                    `;
                });
                
                // Show the table container
                if (analyticsContainer) analyticsContainer.style.display = 'block';
                
                // Initialize DataTable if not already initialized
                if ($.fn.DataTable.isDataTable('#analytics-table')) {
                    $('#analytics-table').DataTable().destroy();
                }
                
                dataTable = $('#analytics-table').DataTable({
                    responsive: true,
                    order: [[2, 'desc']], // Sort by clicks column descending
                    language: {
                        search: "Search URLs:",
                        lengthMenu: "Show _MENU_ entries",
                        info: "Showing _START_ to _END_ of _TOTAL_ URLs"
                    }
                });
                
                // Add event listeners to copy buttons
                document.querySelectorAll('.copy-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const url = this.getAttribute('data-url');
                        navigator.clipboard.writeText(url).then(() => {
                            // Visual feedback
                            const originalHTML = this.innerHTML;
                            this.innerHTML = '<i class="fas fa-check"></i>';
                            this.classList.remove('btn-outline-secondary');
                            this.classList.add('btn-success');
                            
                            setTimeout(() => {
                                this.innerHTML = originalHTML;
                                this.classList.remove('btn-success');
                                this.classList.add('btn-outline-secondary');
                            }, 2000);
                        });
                    });
                });
                
                // Add event listeners to download QR buttons
                document.querySelectorAll('.download-qr').forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        const code = this.getAttribute('data-code');
                        const qrUrl = `/qr/${code}`;
                        
                        // Create a temporary link and trigger download
                        fetch(qrUrl)
                        .then(response => response.blob())
                        .then(blob => {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.style.display = 'none';
                            a.href = url;
                            a.download = `qrcode-${code}.png`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            
                            // Visual feedback
                            const originalHTML = this.innerHTML;
                            this.innerHTML = '<i class="fas fa-check"></i>';
                            
                            setTimeout(() => {
                                this.innerHTML = originalHTML;
                            }, 2000);
                        });
                    });
                });
            })
            .catch(error => {
                console.error('Error:', error);
                if (loadingElement) loadingElement.style.display = 'none';
                if (noDataElement) {
                    noDataElement.textContent = 'Error fetching analytics. Please try again.';
                    noDataElement.style.display = 'block';
                }
            });
    }

    // Load analytics when the page loads
    if (document.getElementById('analytics-data')) {
        fetchAnalytics();
    }
    
    // Refresh button event listener
    if (refreshButton) {
        refreshButton.addEventListener('click', fetchAnalytics);
    }
});