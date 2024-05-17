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

let text2 = '{"hooh":[' 
+'{"category": "Non Carbonated","averageRetailPrice": "$before","after":"$after" },' 
+'{"category": "Carbonated","averageRetailPrice": "$before","after":"$after"},'  
+'{"category": "Food","averageRetailPrice": "$before","after":"$after"}]}';


const hoohObj = JSON.parse(text2);
let hoohDisplay = '';
for (let i = 0; i < hoohObj.hooh.length; i++) {
    hoohDisplay += hoohObj.hooh[i].category + " " + "<br><br>";
}

const hoohObj2 = JSON.parse(text2);
let hoohDisplay2 = '';
for (let i = 0; i < hoohObj.hooh.length; i++) {
    hoohDisplay2 += " " + hoohObj2.hooh[i].averageRetailPrice + "<br><br>";
}

const hoohObj3 = JSON.parse(text2);
let hoohDisplay3 = '';
for (let i = 0; i < hoohObj.hooh.length; i++) {
    hoohDisplay3 += " " + hoohObj3.hooh[i].after + "<br><br>";
}

document.getElementById("table").innerHTML = hoohDisplay;
document.getElementById("table2").innerHTML = hoohDisplay2;
document.getElementById("table3").innerHTML = hoohDisplay3;

// new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: xValues,
//       datasets: [{
//         data: [7796.5, 7240.5, 3538, 1936.5],
//       }]
//     },
//     options: {
//       title: {
//         display: true,
//         text: "World Wide Wine Production 2018"
//       }
//     }
//   });

// new Chart(productctx, {
//   type: 'bar',
//   data: {
//     labels: ['Food', 'Carbonated', 'Non Carbonated', 'Water'],
//     datasets: [{
//       label: 'Average',
//       backgroundColor: barColors,
//       data: [1.74, 2.11, 2.60, 1.82],
//       borderWidth: 2
//     }]
//   },
//   options: {
//     scales: {
//       y: {
//         beginAtZero: true
//       }
//     }
//   }
// });

// const ctx = document.getElementById('locationChart');

// new Chart(ctx, {
//   type: 'pie',
//   data: {
//     labels: ['GuttenPlans', 'EB Public Library', 'Bruinswick Sq Mall', 'Earle Asphalt'],
//     datasets: [{
//       data: [7796.5, 7240.5, 3538, 1936.5],
//       borderWidth: 2
//     }]
//   },
//   options: {
//     scales: {
//       y: {
//         beginAtZero: true
//       }
//     }
//   }
// });

