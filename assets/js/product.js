document.addEventListener("DOMContentLoaded", () => {
    const listItems = document.querySelectorAll(".sidebar-list > li");
    const dropdownLinks = document.querySelectorAll(".submenu .link");

    function saveActiveSidebarItemToLocalStorage(activeItem, isDropdown = false) {
        localStorage.setItem('activeSidebarItem', activeItem);
        localStorage.setItem('isDropdown', isDropdown);
    }

    function loadActiveSidebarItemFromLocalStorage() {
        const activeItem = localStorage.getItem('activeSidebarItem');
        const isDropdown = localStorage.getItem('isDropdown') === 'true';
        if (activeItem) {
            const item = document.getElementById(activeItem);
            if (item) {
                item.classList.add('active');
                if (isDropdown) {
                    const parent = item.closest('.dropdown');
                    if (parent) {
                        parent.classList.add('active');
                    }
                }
            }
        }
    }

    listItems.forEach((item) => {
        item.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent event from bubbling up
            let isActive = item.classList.contains("active");

            listItems.forEach((el) => {
                el.classList.remove("active");
            });

            dropdownLinks.forEach((el) => {
                el.classList.remove("active");
            });

            if (isActive) {
                item.classList.remove("active");
                saveActiveSidebarItemToLocalStorage('');
            } else {
                item.classList.add("active");
                saveActiveSidebarItemToLocalStorage(item.id);
            }
        });
    });

    dropdownLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent event from bubbling up
            let isActive = link.classList.contains("active");

            dropdownLinks.forEach((el) => {
                el.classList.remove("active");
            });

            if (isActive) {
                link.classList.remove("active");
                saveActiveSidebarItemToLocalStorage('');
            } else {
                link.classList.add("active");
                const parent = link.closest('.dropdown');
                if (parent) {
                    parent.classList.add('active');
                }
                saveActiveSidebarItemToLocalStorage(link.id, true);
            }
        });
    });

    loadActiveSidebarItemFromLocalStorage();

    const toggleSidebar = document.querySelector(".toggle-sidebar");
    const logo = document.querySelector(".logo-box");
    const sidebar = document.querySelector(".sidebar");

    function saveSidebarStatusToLocalStorage(status) {
        localStorage.setItem('sidebarStatus', status);
    }

    function loadSidebarStatusFromLocalStorage() {
        const savedStatus = localStorage.getItem('sidebarStatus');
        if (savedStatus === 'close') {
            sidebar.classList.add('close');
        } else {
            sidebar.classList.remove('close');
        }
    }

    loadSidebarStatusFromLocalStorage();

    toggleSidebar.addEventListener("click", () => {
        sidebar.classList.toggle("close");
        saveSidebarStatusToLocalStorage(sidebar.classList.contains("close") ? 'close' : 'open');
    });

    logo.addEventListener("click", () => {
        sidebar.classList.toggle("close");
        saveSidebarStatusToLocalStorage(sidebar.classList.contains("close") ? 'close' : 'open');
    });

    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    function saveThemeToLocalStorage(theme) {
        localStorage.setItem('theme', theme);
    }

    function loadThemeFromLocalStorage() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark-mode') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
            themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            themeToggle.innerHTML = "<i class='bx bx-moon'></i>";
        }
    }

    loadThemeFromLocalStorage();

    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        body.classList.toggle("light-mode");

        if (body.classList.contains("dark-mode")) {
            themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
            saveThemeToLocalStorage('dark-mode');
        } else {
            themeToggle.innerHTML = "<i class='bx bx-moon'></i>";
            saveThemeToLocalStorage('light-mode');
        }
    });

    if (!localStorage.getItem('theme')) {
        body.classList.add("light-mode");
        saveThemeToLocalStorage('light-mode');
    }

    // Chart functionality
    let rawData = [];
    let categoryLocationChart;

    fetch('data_cleaning.json')
        .then(response => response.json())
        .then(data => {
            rawData = data;
            updateCharts('all');
            updateTotalValues();
            updateAverageSales();
            updateTotalProductsSold();
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

        rawData.forEach(item => {
            if (!item.TransTotal || !item.MQty) {
                console.warn('Incomplete item data:', item);
                return;
            }

            totalRevenue += parseFloat(item.TransTotal);
            totalQuantity += parseInt(item.MQty);
        });

        document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString();
        document.getElementById('totalQuantity').textContent = totalQuantity.toLocaleString();
    }

    function updateAverageSales() {
        let totalRevenue = 0;
        let count = 0;

        rawData.forEach(item => {
            if (!item.TransTotal) {
                console.warn('Incomplete item data:', item);
                return;
            }

            totalRevenue += parseFloat(item.TransTotal);
            count++;
        });

        const averageSales = totalRevenue / count;
        document.getElementById('averageSales').textContent = averageSales.toFixed(2);
    }

    function updateTotalProductsSold() {
        let productSet = new Set();

        rawData.forEach(item => {
            if (!item.Product) {
                console.warn('Incomplete item data:', item);
                return;
            }

            productSet.add(item.Product);
        });

        const totalProductsSold = productSet.size;
        document.getElementById('totalProductsSold').textContent = totalProductsSold.toLocaleString();
    }

    document.getElementById('filterDateButton').addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        updateCharts('all', startDate, endDate);
    });

    // Modifikasi fungsi updateCharts untuk menerima parameter tanggal mulai dan akhir
    function updateCharts(selectedCategory, startDate, endDate) {
        console.log('Selected Category:', selectedCategory); // Log selected category for debugging

        const salesByCategoryAndLocation = {};

        rawData.forEach(item => {
            if (!item.Category || !item.Location || !item.TransDate || !item.TransTotal) {
                console.warn('Incomplete item data:', item);
                return;
            }

            const transDate = new Date(item.TransDate);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if ((start && transDate < start) || (end && transDate > end)) {
                return; // Skip items outside the date range
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

        // Create or update the category-location bar chart
        const ctxBar = document.getElementById('categoryLocationChart').getContext('2d');
        if (!categoryLocationChart) {
            categoryLocationChart = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: categoryLabels,
                    datasets: datasetCategoryLocation
                },
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    animation: {
                        duration: 800,
                        easing: 'easeOutQuart'
                    },
                    scales: {
                        x: {
                            ticks: {
                                font: function (context) {
                                    let width = context.chart.width;
                                    if (width <= 430) {
                                        return {
                                            size: 6,
                                        };
                                    } else {
                                        return {
                                            size: 14,
                                        }
                                    }
                                }
                            },
                            title: {
                                display: true,
                            }
                        },
                        y: {
                            ticks: {
                                font: function (context) {
                                    let width = context.chart.width;
                                    if (width <= 430) {
                                        return {
                                            size: 6,
                                        };
                                    } else {
                                        return {
                                            size: 14,
                                        }
                                    }
                                }
                            },
                            title: {
                                display: true,
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                font: function (context) {
                                    let width = context.chart.width;
                                    if (width <= 430) {
                                        return {
                                            size: 8,
                                        };
                                    } else {
                                        return {
                                            size: 14,
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            });
        } else {
            categoryLocationChart.data.labels = categoryLabels;
            categoryLocationChart.data.datasets = datasetCategoryLocation;
            categoryLocationChart.update(); // Update the chart with new data
        }
    }
});

