document.addEventListener("DOMContentLoaded", () => {
    // Sidebar functionality and theme toggle
    const listItems = document.querySelectorAll(".sidebar-list li");

    // Fungsi untuk menyimpan status sidebar aktif ke localStorage
    function saveActiveSidebarItemToLocalStorage(activeItem) {
        localStorage.setItem('activeSidebarItem', activeItem);
    }

    // Fungsi untuk memuat status sidebar aktif dari localStorage
    function loadActiveSidebarItemFromLocalStorage() {
        const activeItem = localStorage.getItem('activeSidebarItem');
        if (activeItem) {
            const item = document.getElementById(activeItem);
            if (item) {
                item.classList.add('active');
            }
        }
    }

    listItems.forEach((item) => {
        item.addEventListener("click", () => {
            let isActive = item.classList.contains("active");

            listItems.forEach((el) => {
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

    // Muat status sidebar aktif dari localStorage saat halaman dimuat
    loadActiveSidebarItemFromLocalStorage();

    const toggleSidebar = document.querySelector(".toggle-sidebar");
    const logo = document.querySelector(".logo-box");
    const sidebar = document.querySelector(".sidebar");

    // Fungsi untuk menyimpan status sidebar ke localStorage
    function saveSidebarStatusToLocalStorage(status) {
        localStorage.setItem('sidebarStatus', status);
    }

    // Fungsi untuk memuat status sidebar dari localStorage
    function loadSidebarStatusFromLocalStorage() {
        const savedStatus = localStorage.getItem('sidebarStatus');
        if (savedStatus === 'close') {
            sidebar.classList.add('close');
        } else {
            sidebar.classList.remove('close');
        }
    }

    // Muat status sidebar dari localStorage saat halaman dimuat
    loadSidebarStatusFromLocalStorage();

    toggleSidebar.addEventListener("click", () => {
        sidebar.classList.toggle("close");
        if (sidebar.classList.contains("close")) {
            saveSidebarStatusToLocalStorage('close');
        } else {
            saveSidebarStatusToLocalStorage('open');
        }
    });

    logo.addEventListener("click", () => {
        sidebar.classList.toggle("close");
        if (sidebar.classList.contains("close")) {
            saveSidebarStatusToLocalStorage('close');
        } else {
            saveSidebarStatusToLocalStorage('open');
        }
    });

    // Theme toggle
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Fungsi untuk menyimpan status tema ke localStorage
    function saveThemeToLocalStorage(theme) {
        localStorage.setItem('theme', theme);
    }

    // Fungsi untuk mengatur tema berdasarkan localStorage
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

    // Muat tema dari localStorage saat halaman dimuat
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

    // Set default theme jika tidak ada di localStorage
    if (!localStorage.getItem('theme')) {
        body.classList.add("light-mode");
        saveThemeToLocalStorage('light-mode');
    }
});

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
    ],
    responsive: true,
});
