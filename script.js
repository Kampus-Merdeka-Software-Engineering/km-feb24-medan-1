let arrow = document.querySelectorAll(".arrow");
for (var i = 0; i < arrow.length; i++) {
  arrow[i].addEventListener("click", (e) => {
    let arrowParent = e.target.parentElement.parentElement;//selecting main parent of arrow
    arrowParent.classList.toggle("showMenu");
  });
}

let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".sidebar .logo-details");
console.log(sidebarBtn);
sidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});

const productctx = document.getElementById('productChart');
const barColors = ["orange"];

new Chart(productctx, {
  type: 'bar',
  data: {
    labels: ['Food', 'Carbonated', 'Non Carbonated', 'Water'],
    datasets: [{
      label: 'Average',
      backgroundColor: barColors,
      data: [1.74, 2.11, 2.60, 1.82],
      borderWidth: 2
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

const ctx = document.getElementById('locationChart');

new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['GuttenPlans', 'EB Public Library', 'Bruinswick Sq Mall', 'Earle Asphalt'],
    datasets: [{
      data: [7796.5, 7240.5, 3538, 1936.5],
      borderWidth: 2
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

