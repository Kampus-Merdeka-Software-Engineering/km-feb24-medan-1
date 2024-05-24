const sidebarToggle = document.querySelector("#sidebar-toggle");
sidebarToggle.addEventListener("click", function () {
    document.querySelector("#sidebar").classList.toggle("collapsed");
});

document.querySelector(".theme-toggle").addEventListener("click", () => {
    toggleLocalStorage();
    toggleRootClass();
});

function toggleRootClass() {
    const current = document.documentElement.getAttribute('data-bs-theme');
    const inverted = current == 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', inverted);
}

function toggleLocalStorage() {
    if (isLight()) {
        localStorage.removeItem("light");
    } else {
        localStorage.setItem("light", "set");
    }
}

function isLight() {
    return localStorage.getItem("light");
}

if (isLight()) {
    toggleRootClass();
}

document.addEventListener('DOMContentLoaded', function () {
    let rawData = [];
    let categoryLocationChart;
    let averagePriceChart;

    fetch('data_cleaning.json')
        .then(response => response.json())
        .then(data => {
            rawData = data;
            updateCharts('all');
            updateTotalValues();
        })
        .catch(error => console.error('Error loading the JSON data:', error));

    const totalPricesByCategory = {};
    const countsByCategory = {};

    const colors = ['#FFC94A', '#8644A2', '#ff007b', '#ff9933', '#7AA2E3', '#dc3545', '#ffc107', '#6c757d', '#17a2b8', '#6610f2'];

    document.getElementById('categoryFilter').addEventListener('change', function () {
        const selectedCategory = this.value;
        updateCharts(selectedCategory);
    });

    function updateTotalValues() {
        let totalRevenue = 0;
        let totalQuantity = 0;
        let totalSales = 0;

        rawData.forEach(item => {
            if (!item.TransTotal || !item.MQty) {
                console.warn('Incomplete item data:', item);
                return;
            }

            totalRevenue += parseFloat(item.TransTotal);
            totalQuantity += parseInt(item.MQty);
            totalSales += parseFloat(item.LineTotal);
        });

        document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString();
        document.getElementById('totalQuantity').textContent = totalQuantity.toLocaleString();
        document.getElementById('totalSales').textContent = totalSales.toLocaleString();
    }

    function updateCharts(selectedCategory) {
        console.log('Selected Category:', selectedCategory); // Log selected category for debugging

        const salesByCategoryAndLocation = {};

        rawData.forEach(item => {
            if (!item.Category || !item.Location || !item.TransDate || !item.TransTotal) {
                console.warn('Incomplete item data:', item);
                return;
            }

            const category = item.Category;
            if (selectedCategory !== 'all' && category.toLowerCase() !== selectedCategory.toLowerCase()) {
                return;
            }
            const location = item.Location;
            const amount = parseFloat(item.TransTotal);
            const price = parseFloat(item.MPrice);

            console.log('Processing item:', item); // Log each item for debugging

            // Aggregate data by category and location
            if (!salesByCategoryAndLocation[location]) {
                salesByCategoryAndLocation[location] = {};
            }
            if (!salesByCategoryAndLocation[location][category]) {
                salesByCategoryAndLocation[location][category] = 0;
            }
            salesByCategoryAndLocation[location][category] += amount;

            // Aggregate total prices and counts by category
            totalPricesByCategory[category] = (totalPricesByCategory[category] || 0) + price;
            countsByCategory[category] = (countsByCategory[category] || 0) + 1;
        });

        console.log('Sales By Category and Location:', salesByCategoryAndLocation); // Log aggregated data for debugging

        // Prepare data for the category-location bar chart
        const locationLabels = ["GuttenPlans", "EB Public Library", "Brunswick Sq Mall", "Earle Asphalt"];
        const categoryLabels = [];
        const datasetCategoryLocation = [];

        locationLabels.forEach(location => {
            const categoryData = salesByCategoryAndLocation[location];
            if (categoryData) {
                Object.keys(categoryData).forEach(category => {
                    if (!categoryLabels.includes(category)) {
                        categoryLabels.push(category);
                    }
                });
            }
        });

        locationLabels.forEach((location, index) => {
            const categoryData = salesByCategoryAndLocation[location];
            const data = categoryLabels.map(category => (categoryData ? categoryData[category] : 0) || 0);
            datasetCategoryLocation.push({
                label: location,
                data: data,
                backgroundColor: colors[index % colors.length],
            });
        });

        // Create the category-location bar chart
        const ctxBar = document.getElementById('categoryLocationChart').getContext('2d');
        if (categoryLocationChart) {
            categoryLocationChart.destroy();
        }
        categoryLocationChart = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: categoryLabels,
                datasets: datasetCategoryLocation
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                        }
                    },
                    y: {
                        title: {
                            display: true,
                        }
                    }
                }
            }
        });

        // Prepare data for the average price chart
        const averagePrices = {};
        Object.keys(totalPricesByCategory).forEach(category => {
            averagePrices[category] = totalPricesByCategory[category] / countsByCategory[category];
        });

        const averagePriceLabels = Object.keys(averagePrices);
        const averagePriceData = averagePriceLabels.map(category => averagePrices[category]);

        // Create the average price chart
        const ctxAveragePrice = document.getElementById('averagePriceChart').getContext('2d');
        if (averagePriceChart) {
            averagePriceChart.destroy();
        }
        averagePriceChart = new Chart(ctxAveragePrice, {
            type: 'bar',
            data: {
                labels: averagePriceLabels,
                datasets: [{
                    label: 'Average Price',
                    data: averagePriceData,
                    backgroundColor: colors.slice(0, averagePriceLabels.length)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: ''
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                        }
                    },
                    y: {
                        title: {
                            display: true,
                        }
                    }
                }
            }
        });
    }
});