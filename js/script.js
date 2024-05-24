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
    let categoryLocationChart, machineMonthChart, locationPieChart, productBarChart, averagePriceChart;

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

    document.getElementById('machineSearch').addEventListener('input', function () {
        const searchQuery = this.value.toLowerCase();
        updateMachineChart(searchQuery);
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
        const salesByMachineAndMonth = {};
        const salesByLocation = {};
        const salesByProduct = {};

        rawData.forEach(item => {
            if (!item.Category || !item.Location || !item.Machine || !item.Product || !item.TransDate || !item.TransTotal) {
                console.warn('Incomplete item data:', item);
                return;
            }

            const category = item.Category;
            const price = parseFloat(item.MPrice);
            totalPricesByCategory[category] = (totalPricesByCategory[category] || 0) + price;
            countsByCategory[category] = (countsByCategory[category] || 0) + 1;
            if (selectedCategory !== 'all' && category.toLowerCase() !== selectedCategory.toLowerCase()) {
                return;
            }
            const location = item.Location;
            const machine = item.Machine;
            const product = item.Product;
            const date = new Date(item.TransDate);
            const month = date.getMonth(); // getMonth returns 0-11 for Jan-Dec
            const year = date.getFullYear();
            const amount = parseFloat(item.TransTotal);

            console.log('Processing item:', item); // Log each item for debugging

            // Aggregate data by category and location
            if (!salesByCategoryAndLocation[location]) {
                salesByCategoryAndLocation[location] = {};
            }
            if (!salesByCategoryAndLocation[location][category]) {
                salesByCategoryAndLocation[location][category] = 0;
            }
            salesByCategoryAndLocation[location][category] += amount;

            // Aggregate data by machine and month
            if (year === 2022) { // Filter for the year 2022
                if (!salesByMachineAndMonth[machine]) {
                    salesByMachineAndMonth[machine] = Array(12).fill(0);
                }
                salesByMachineAndMonth[machine][month] += amount;
            }

            // Aggregate data by location
            if (!salesByLocation[location]) {
                salesByLocation[location] = 0;
            }
            salesByLocation[location] += amount;

            // Aggregate data by product
            if (!salesByProduct[product]) {
                salesByProduct[product] = 0;
            }
            salesByProduct[product] += amount;


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

        // Prepare data for the machine-month line chart
        const machineLabels = Object.keys(salesByMachineAndMonth);
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const datasetMachineMonth = [];

        machineLabels.forEach((machine, index) => {
            datasetMachineMonth.push({
                label: machine,
                data: salesByMachineAndMonth[machine],
                borderColor: colors[index % colors.length],
                fill: false,
            });
        });


        function prepareDataForAveragePriceChart(averagePrices) {
            const categories = Object.keys(averagePrices);
            const prices = categories.map(category => averagePrices[category]);
            return {
                labels: categories,
                datasets: [{
                    label: 'Average Price',
                    data: prices,
                    backgroundColor: colors.slice(0, categories.length)
                }]
            };
        }

        // Prepare data for the location pie chart
        const locationPieLabels = ["GuttenPlans", "EB Public Library", "Brunswick Sq Mall", "Earle Asphalt"];
        const locationPieData = locationPieLabels.map(location => salesByLocation[location]);

        // Prepare data for the product bar chart
        const sortedProducts = Object.entries(salesByProduct)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        const productLabels = sortedProducts.map(([product]) => product);
        const productData = sortedProducts.map(([, sales]) => sales);

        const averagePrices = {};
        Object.keys(totalPricesByCategory).forEach(category => {
            averagePrices[category] = totalPricesByCategory[category] / countsByCategory[category];
        });
        const averagePriceData = prepareDataForAveragePriceChart(averagePrices);

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

        // Create the machine-month line chart
        updateMachineChart('');

        // Create the location pie chart
        const ctxPie = document.getElementById('locationPieChart').getContext('2d');
        if (locationPieChart) {
            locationPieChart.destroy();
        }
        locationPieChart = new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: locationPieLabels,
                datasets: [{
                    data: locationPieData,
                    backgroundColor: colors,
                }]
            },
            options: {
                layout: {
                    padding: {
                        left: 20, // Atur jarak kiri
                        right: 20, // Atur jarak kanan
                        top: 20, // Atur jarak atas
                        bottom: 20 // Atur jarak bawah
                    }
                },
                responsive: true,
                plugins: {
                    legend: {
                        position: '',
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

        //create the avereage price chart
        const ctxAveragePrice = document.getElementById('averagePriceChart').getContext('2d');
        if (averagePriceChart) averagePriceChart.destroy();
        averagePriceChart = new Chart(ctxAveragePrice, {
            type: 'bar',
            data: averagePriceData,
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

    function updateMachineChart(searchQuery) {
        const salesByMachineAndMonth = {};

        rawData.forEach(item => {
            if (!item.Machine || !item.TransDate || !item.TransTotal) {
                console.warn('Incomplete item data:', item);
                return;
            }

            const machine = item.Machine;
            const machineLowerCase = machine.toLowerCase();
            const date = new Date(item.TransDate);
            const month = date.getMonth(); // getMonth returns 0-11 for Jan-Dec
            const year = date.getFullYear();
            const amount = parseFloat(item.TransTotal);

            if (year === 2022 && machineLowerCase.includes(searchQuery)) { // Filter for the year 2022 and search query
                if (!salesByMachineAndMonth[machine]) {
                    salesByMachineAndMonth[machine] = Array(12).fill(0);
                }
                salesByMachineAndMonth[machine][month] += amount;
            }
        });

        // Prepare data for the machine-month line chart
        const machineLabels = Object.keys(salesByMachineAndMonth);
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const datasetMachineMonth = [];

        machineLabels.forEach((machine, index) => {
            datasetMachineMonth.push({
                label: machine,
                data: salesByMachineAndMonth[machine],
                borderColor: colors[index % colors.length],
                fill: false,
            });
        });

        const ctxLine = document.getElementById('machineMonthChart').getContext('2d');
        if (machineMonthChart) {
            machineMonthChart.destroy();
        }
        machineMonthChart = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: months,
                datasets: datasetMachineMonth
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
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
    }
});
