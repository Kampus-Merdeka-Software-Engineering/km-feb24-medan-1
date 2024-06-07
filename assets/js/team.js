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
