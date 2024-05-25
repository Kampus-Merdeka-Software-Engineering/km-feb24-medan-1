document.addEventListener('DOMContentLoaded', function () {
    let rawData = [];
    let machineMonthChart;

    fetch('data_cleaning.json')
        .then(response => response.json())
        .then(data => {
            rawData = data;
            updateTotalValues();
            updateMachineChart('');
            updateAverageSales();
            updateTotalProductsSold();
        })
        .catch(error => console.error('Error loading the JSON data:', error));

    const colors = ['#FFC94A', '#8644A2', '#ff007b', '#ff9933', '#7AA2E3', '#dc3545', '#ffc107', '#6c757d', '#17a2b8', '#6610f2'];

    const machineSearchInput = document.getElementById('machineSearch');

    document.getElementById('machineSearchForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const searchQuery = machineSearchInput.value.toLowerCase();
        updateMachineChart(searchQuery);
    });

    machineSearchInput.addEventListener('input', function () {
        const searchQuery = machineSearchInput.value.toLowerCase();
        if (!searchQuery) {
            updateMachineChart('');
        }
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
        document.getElementById('productsSoldBadge').textContent = totalProductsSold.toLocaleString();
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
