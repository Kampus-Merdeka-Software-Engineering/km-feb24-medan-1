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

[{
  "Location": "GuttenPlans",
  "PercentageOfTotal": "38.0"
}, {
  "Location": "Earle Asphalt",
  "PercentageOfTotal": "9.0"
}, {
  "Location": "Brunswick Sq Mall",
  "PercentageOfTotal": "17.0"
}, {
  "Location": "EB Public Library",
  "PercentageOfTotal": "35.0"
}]

const xValues = ['GuttenPlans', 'Earle Asphalt', 'Bruinswick Sq Mall', 'EB Public Library'];
const ctx = document.getElementById('locationChart');

new Chart(ctx, {
    type: "pie",
    data: {
      labels: xValues,
      datasets: [{
        data: [38.0, 9.0, 17.0, 35.0],
      }]
    },
    options: {
      title: {
        display: true,
      }
    }
  });
