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
    const inverted = current === 'dark' ? 'light' : 'dark';
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

new DataTable('#example', {
    ajax: {
        url: 'data_cleaning.json',
        dataSrc: ''
    },
    columns: [
        { data: 'Category' },
        { data: 'Product' },
        { data: 'Location' },
        { data: 'Machine' },
        { data: 'TransDate' },
        { data: 'TransTotal' },
        { data: 'MQty' }
    ]
});