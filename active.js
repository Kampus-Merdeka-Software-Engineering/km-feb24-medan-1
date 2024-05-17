let arrow = document.querySelectorAll(".arrow");
for (var i = 0; i < arrow.length; i++) {
  arrow[i].addEventListener("click", (e) => {
    let arrowParent = e.target.parentElement.parentElement; // selecting main parent of arrow
    arrowParent.classList.toggle("showMenu");
  });
}

let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".sidebar .logo-details");
console.log(sidebarBtn);
sidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});


const ctx = document.getElementById("ActiveChart");

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Agust", "Sept", "Oct", "Nov", "Dec" ], // Corrected month names
    datasets: [{
        data: [492.5, 554.0, 599.0, 734.5, 635.0, 657.5, 1004.0, 906.5, 656.5, 550.5, 571.0, 435.5],
        label: "GuttenPlans x1367",
        borderColor: "#3e95cd",
        fill: false
      }, {
        data: [173.0, 195.5, 175.5, 127.5, 116.5, 120.75, 133.0, 231.75, 208.25, 156.75, 174.5, 123.5],
        label: "Earle Asphalt x1371",
        borderColor: "#8e5ea2",
        fill: false
      }, {
        data: [116.75, 144.0, 191.5, 117.5, 205.25, 226.25, 270.25, 187.5, 79.0, 123.5, 91.25, 114.25],
        label: "BSQ Mall x1364 - Zales",
        borderColor: "#3cba9f",
        fill: false
      }, {
        data: [168.5, 157.0, 97.75, 143.25, 148.75, 167.5, 150.5, 134.75, 117,0, 127.25, 127.0, 131.75],
        label: "BSQ Mall x1366 - ATT",
        borderColor: "#FFFF00",
        fill: false
      }, {
        data: [ , , 250.0, 664.5, 705.25, 783.5, 800.75, 867.0, 873.75, 888.25, 702.0, 705.5],
        label: "EB Public Libray x1380",
        borderColor: "#FF0000",
        fill: false
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: 'Sale Based on Active Machine'
    }
  }
});
