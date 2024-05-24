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
    const inverted = current === 'dark' ? 'light' : 'dark';
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
    let locationPieChart;

    fetch('data_cleaning.json')
        .then(response => response.json())
        .then(data => {
            rawData = data;
            updateTotalValues();
            updateLocationPieChart('all');
        })
        .catch(error => console.error('Error loading the JSON data:', error));

    const colors = ['#FFC94A', '#8644A2', '#ff007b', '#ff9933', '#7AA2E3', '#dc3545', '#ffc107', '#6c757d', '#17a2b8', '#6610f2'];

    document.getElementById('categoryFilter').addEventListener('change', function () {
        const selectedCategory = this.value;
        updateLocationPieChart(selectedCategory);
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

    function updateLocationPieChart(selectedCategory) {
        const salesByLocation = {};

        rawData.forEach(item => {
            if (!item.Category || !item.Location || !item.TransTotal) {
                console.warn('Incomplete item data:', item);
                return;
            }

            const category = item.Category;
            if (selectedCategory !== 'all' && category.toLowerCase() !== selectedCategory.toLowerCase()) {
                return;
            }

            const location = item.Location;
            const amount = parseFloat(item.TransTotal);

            if (!salesByLocation[location]) {
                salesByLocation[location] = 0;
            }
            salesByLocation[location] += amount;
        });

        const locationLabels = ["GuttenPlans", "EB Public Library", "Brunswick Sq Mall", "Earle Asphalt"];
        const locationPieData = locationLabels.map(location => salesByLocation[location] || 0);

        const ctxPie = document.getElementById('locationPieChart').getContext('2d');
        if (locationPieChart) {
            locationPieChart.destroy();
        }
        locationPieChart = new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: locationLabels,
                datasets: [{
                    data: locationPieData,
                    backgroundColor: colors,
                }]
            },
            options: {
                layout: {
                    padding: {
                    }
                },
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
                                const value = context.raw;
                                const percentage = ((value / total) * 100).toFixed(2);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
});
