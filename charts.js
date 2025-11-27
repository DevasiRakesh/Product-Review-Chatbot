// Chart functionality
let productsChart = null;
let ratingsChart = null;

// Initialize charts
function initializeCharts() {
    console.log('Initializing charts...');

    // Check if chart elements exist
    const productsChartElement = document.getElementById('productsChart');
    const ratingsChartElement = document.getElementById('ratingsChart');

    if (!productsChartElement || !ratingsChartElement) {
        console.error('Chart elements not found:', {
            productsChart: !!productsChartElement,
            ratingsChart: !!ratingsChartElement
        });
        return;
    }

    try {
        // Products Chart (Pie)
        const productsCtx = productsChartElement.getContext('2d');
        
        // Destroy existing chart if it exists
        if (productsChart) {
            productsChart.destroy();
        }

        productsChart = new Chart(productsCtx, {
            type: 'pie',
            data: getProductsChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        console.log('Products chart initialized');
    } catch (error) {
        console.error('Error initializing products chart:', error);
    }

    try {
        // Ratings Chart (Bar)
        const ratingsCtx = ratingsChartElement.getContext('2d');
        
        // Destroy existing chart if it exists
        if (ratingsChart) {
            ratingsChart.destroy();
        }

        ratingsChart = new Chart(ratingsCtx, {
            type: 'bar',
            data: getRatingsChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        console.log('Ratings chart initialized');
    } catch (error) {
        console.error('Error initializing ratings chart:', error);
    }
}

// Get data for products chart
function getProductsChartData() {
    // Use the current in-memory data
    const labels = window.products.map(product => product.name);
    const counts = window.products.map(product => (window.reviews[product.id] || []).length);
    
    return {
        labels: labels,
        datasets: [{
            data: counts,
            backgroundColor: generateColors(labels.length),
            borderColor: '#ffffff',
            borderWidth: 1
        }]
    };
}

// Get data for ratings chart
function getRatingsChartData() {
    const ratings = [0, 0, 0, 0, 0]; // 1-5 stars
    
    Object.values(window.reviews).forEach(productReviews => {
        productReviews.forEach(review => {
            ratings[review.rating - 1]++;
        });
    });
    
    return {
        labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
        datasets: [{
            label: 'Number of Reviews',
            data: ratings,
            backgroundColor: 'rgba(234, 88, 12, 0.7)',
            borderColor: 'rgba(234, 88, 12, 1)',
            borderWidth: 1
        }]
    };
}

// Generate distinct colors for the pie chart
function generateColors(count) {
    const colors = [];
    const hueStep = 360 / count;
    
    for (let i = 0; i < count; i++) {
        const hue = Math.floor(i * hueStep);
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    
    return colors;
}

// Update charts when data changes
function updateCharts() {
    console.log('Updating charts...');
    
    // If charts don't exist yet, initialize them
    if (!productsChart || !ratingsChart) {
        console.log('Charts not initialized yet, initializing now...');
        initializeCharts();
        return;
    }
    
    try {
        // Update products chart
        productsChart.data = getProductsChartData();
        productsChart.update();
        console.log('Products chart updated');
        
        // Update ratings chart
        ratingsChart.data = getRatingsChartData();
        ratingsChart.update();
        console.log('Ratings chart updated');
    } catch (error) {
        console.error('Error updating charts:', error);
        
        // If there was an error, try reinitializing the charts
        setTimeout(() => {
            console.log('Attempting to reinitialize charts after error...');
            initializeCharts();
        }, 200);
    }
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts when DOM is loaded
    setTimeout(initializeCharts, 300);
    
    // Listen for product updates
    window.addEventListener('productUpdated', function() {
        console.log('Product updated event detected, updating charts...');
        updateCharts();
    });
});
