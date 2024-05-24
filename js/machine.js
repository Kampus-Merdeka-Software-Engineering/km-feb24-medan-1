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
    let machineMonthChart;

    fetch('data_cleaning.json')
        .then(response => response.json())
        .then(data => {
            rawData = data;
            updateTotalValues();
            updateMachineChart('');
        })
        .catch(error => console.error('Error loading the JSON data:', error));

    const colors = ['#FFC94A', '#8644A2', '#ff007b', '#ff9933', '#7AA2E3', '#dc3545', '#ffc107', '#6c757d', '#17a2b8', '#6610f2'];

    document.getElementById('machineSearchForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const searchQuery = document.getElementById('machineSearch').value.toLowerCase();
        if (searchQuery) {
            updateMachineChart(searchQuery);
        } else {
            document.getElementById('machineSearch').classList.add('invalid');
        }
    });

    document.getElementById('refreshButton').addEventListener('click', function () {
        document.getElementById('machineSearch').value = '';
        document.getElementById('machineSearch').classList.remove('invalid');
        updateMachineChart('');
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