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

    let rawData = [];
    let locationPieChart;

    fetch('data_cleaning.json')
        .then(response => response.json())
        .then(data => {
            rawData = data;
            updateTotalValues();
            updateLocationPieChart('all');
            updateTotalProductsSold();
            updateAverageSales();
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
                maintainAspectRatio: false,
                layout: {
                    padding: {
                    }
                },
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
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
                    },
                    labels: {
                        render: 'percentage',
                        fontColor: ['white', 'white', 'white', 'white'],
                        precision: 2,
                        fontStyle: 'bold',
                        fontSize: 14,
                        fontFamily: '"Lucida Console", Monaco, monospace',
                        textShadow: true,
                        shadowColor: 'rgba(0,0,0,0.3)',
                        shadowBlur: 5,
                    }
                }
            }
        });
    };
});
