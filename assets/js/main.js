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
});


document.addEventListener('DOMContentLoaded', function () {
  let rawData = [];
  let categoryLocationChart, machineMonthChart, locationPieChart, productBarChart, averagePriceChart;

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

  document.getElementById('machineSearch').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    updateMachineChart(searchQuery);
  });

  document.getElementById('monthFilter').addEventListener('change', function () {
    const selectedQuarter = this.value;
    updateMachineChart('', selectedQuarter);
  });

  document.getElementById('filterDateButton').addEventListener('click', function () {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    updateCharts('all', startDate, endDate);
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

  function updateCharts(selectedCategory, startDate = '', endDate = '') {
    console.log('Selected Category:', selectedCategory); // Log selected category for debugging

    const salesByCategoryAndLocation = {};
    const salesByMachineAndMonth = {};
    const salesByLocation = {};
    const salesByProduct = {};

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    rawData.forEach(item => {
      if (!item.Category || !item.Location || !item.Machine || !item.Product || !item.TransDate || !item.TransTotal) {
        console.warn('Incomplete item data:', item);
        return;
      }

      const itemDate = new Date(item.TransDate);
      if ((start && itemDate < start) || (end && itemDate > end)) {
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
    const locationPieData = locationPieLabels.map(location => salesByLocation[location] || 0);

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
                    size: 10,
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
                    size: 10,
                  };
                } else {
                  return {
                    size: 12,
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
                    bottom: 10,
                    size: 12,
                  };
                } else {
                  return {
                    size: 12,
                  }
                }
              }
            }
          }
        }
      },
    });

    // Create the machine-month line chart
    updateMachineChart('', 'all', startDate, endDate);

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
            left: 20,
            right: 20,
            top: 0,
            bottom: 0
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

    //create the avereage price chart
    const ctxAveragePrice = document.getElementById('averagePriceChart').getContext('2d');
    if (averagePriceChart) averagePriceChart.destroy();
    averagePriceChart = new Chart(ctxAveragePrice, {
      type: 'bar',
      data: averagePriceData,
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            position: ''
          }
        },
        scales: {
          x: {
            ticks: {
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
                    size: 8,
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
        maintainAspectRatio: false,
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

  function updateMachineChart(searchQuery, selectedQuarter = 'all', startDate = '', endDate = '') {
    const salesByMachineAndMonth = {};

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

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

      if ((start && date < start) || (end && date > end)) {
        return;
      }

      let monthStart = 0;
      let monthEnd = 11; // Default to all months

      if (selectedQuarter !== 'all') {
        const [start, end] = selectedQuarter.split('-').map(Number);
        monthStart = start - 1;
        monthEnd = end - 1;
      }

      if (year === 2022 && machineLowerCase.includes(searchQuery) && month >= monthStart && month <= monthEnd) { // Filter for the year 2022 and search query
        if (!salesByMachineAndMonth[machine]) {
          salesByMachineAndMonth[machine] = Array(12).fill(0);
        }
        salesByMachineAndMonth[machine][month] += amount;
      }

      // Adjust data for "EB Public Library x1380" to start from March
      if (salesByMachineAndMonth["EB Public Library x1380"]) {
        salesByMachineAndMonth["EB Public Library x1380"] = ['', '', ...salesByMachineAndMonth["EB Public Library x1380"].slice(2)];
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
      const filteredData = salesByMachineAndMonth[machine].filter((value, month) => {
        if (selectedQuarter !== 'all') {
          const [start, end] = selectedQuarter.split('-').map(Number);
          return (month + 1 >= start && month + 1 <= end) && value !== 0;
        }
        return value !== 0;
      });

      datasetMachineMonth.push({
        label: machine,
        data: filteredData,
        borderColor: colors[index % colors.length],
        fill: false,
      });
    });

    const filteredMonths = months.filter((_, index) => {
      if (selectedQuarter !== 'all') {
        const [start, end] = selectedQuarter.split('-').map(Number);
        return (index + 1 >= start && index + 1 <= end);
      }
      return true;
    });

    const ctxLine = document.getElementById('machineMonthChart').getContext('2d');
    if (machineMonthChart) {
      machineMonthChart.destroy();
    }
    machineMonthChart = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: filteredMonths,
        datasets: datasetMachineMonth
      },
      options: {
        maintainAspectRatio: false,
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
