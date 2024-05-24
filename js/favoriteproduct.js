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
    let productBarChart;

    fetch('data_cleaning.json')
        .then(response => response.json())
        .then(data => {
            rawData = data;
            updateCharts('all');
            updateTotalValues();
        })
        .catch(error => console.error('Error loading the JSON data:', error));

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
        const salesByProduct = {};

        rawData.forEach(item => {
            if (!item.Category || !item.Product || !item.TransTotal) {
                console.warn('Incomplete item data:', item);
                return;
            }

            const category = item.Category;
            if (selectedCategory !== 'all' && category.toLowerCase() !== selectedCategory.toLowerCase()) {
                return;
            }

            const product = item.Product;
            const amount = parseFloat(item.TransTotal);

            // Aggregate data by product
            if (!salesByProduct[product]) {
                salesByProduct[product] = 0;
            }
            salesByProduct[product] += amount;
        });

        // Prepare data for the product bar chart
        const sortedProducts = Object.entries(salesByProduct)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        const productLabels = sortedProducts.map(([product]) => product);
        const productData = sortedProducts.map(([, sales]) => sales);

        // Create the product bar chart
        const ctxProductBar = document.getElementById('productBarChart').getContext('2d');
        if (productBarChart) {
            productBarChart.destroy();
        }
        productBarChart = new Chart(ctxProductBar, {
            type: 'bar',
            data: {
                labels: productLabels,
                datasets: [{
                    label: 'Total Sales',
                    data: productData,
                    backgroundColor: colors,
                }]
            },
            options: {
                indexAxis: 'y',
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
