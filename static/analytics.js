// This file handles the analytics functionality
function fetchAnalytics() {
    const analyticsDataElement = document.getElementById('analytics-data');
    
    fetch('/analytics')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                analyticsDataElement.textContent = 'No URLs have been shortened yet.';
                return;
            }

            let analyticsHtml = '<table border="1">';
            analyticsHtml += '<tr><th>Short URL</th><th>Original URL</th><th>Clicks</th></tr>';
            
            data.forEach(item => {
                analyticsHtml += `<tr>
                    <td><a href="${item.short_url}" target="_blank">${item.short_url}</a></td>
                    <td>${item.long_url}</td>
                    <td>${item.clicks}</td>
                </tr>`;
            });
            
            analyticsHtml += '</table>';
            analyticsDataElement.innerHTML = analyticsHtml;
        })
        .catch(error => {
            console.error('Error:', error);
            analyticsDataElement.textContent = 'Error fetching analytics. Please try again.';
        });
}

// Load analytics when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('analytics-data')) {
        fetchAnalytics();
    }
});