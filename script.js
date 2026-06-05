const cardContainer = document.getElementById("cardContainer");
const breadcrumb = document.getElementById("breadcrumb");
const backBtn = document.getElementById("backBtn");
const practiceModeBtn = document.getElementById("practiceModeBtn");
const editModeBtn = document.getElementById("editModeBtn");
const themeSelect = document.getElementById("themeSelect");

const savedTheme = localStorage.getItem("formsDashboardTheme") || "ember";
const savedMode = localStorage.getItem("formsDashboardLinkMode") || "practice";

let currentView = "home";
let selectedSubject = null;
let selectedCategory = null;
let currentCategoryParent = null;
let categoryTrail = [];
let linkMode = savedMode;

function applyTheme(themeName) {
    document.body.setAttribute("data-theme", themeName);
    localStorage.setItem("formsDashboardTheme", themeName);

    if (themeSelect) {
        themeSelect.value = themeName;
    }
}

function applyMode(mode) {
    linkMode = mode;
    localStorage.setItem("formsDashboardLinkMode", mode);

    if (practiceModeBtn) {
        practiceModeBtn.classList.toggle("active", mode === "practice");
    }

    if (editModeBtn) {
        editModeBtn.classList.toggle("active", mode === "edit");
    }

    updateBreadcrumb();

    if (currentView === "links" && selectedCategory) {
        renderLinks(selectedCategory);
    }
}

function getModeLabel() {
    if (linkMode === "edit") {
        return "Edit Links";
    }

    return "Practice Links";
}

/* PASSWORD CHECK */
function checkPassword(section) {
    if (!section.password) {
        return true;
    }

    const enteredPassword = prompt(`Enter password for ${section.name}:`);

    if (enteredPassword === null) {
        return false;
    }

    if (enteredPassword === section.password) {
        return true;
    }

    alert("Wrong password.");
    return false;
}

function updateBreadcrumb() {
    breadcrumb.innerHTML = "";

    function addSeparator() {
        const separator = document.createElement("span");
        separator.className = "crumb-separator";
        separator.textContent = "/";
        breadcrumb.appendChild(separator);
    }

    function addCrumb(label, onClick, isCurrent = false) {
        const crumb = document.createElement(isCurrent ? "span" : "button");
        crumb.className = isCurrent ? "crumb-current" : "crumb-btn";
        crumb.textContent = label;

        if (!isCurrent) {
            crumb.type = "button";
            crumb.addEventListener("click", onClick);
        }

        breadcrumb.appendChild(crumb);
    }

    addCrumb("Home", () => renderHome(), currentView === "home");

    if (currentView === "home") {
        return;
    }

    addSeparator();

    addCrumb(getModeLabel(), () => renderHome(), false);

    if (selectedSubject) {
        addSeparator();

        addCrumb(
            selectedSubject.name,
            () => renderCategories(selectedSubject, []),
            currentView === "categories" && categoryTrail.length === 0
        );
    }

    categoryTrail.forEach((category, index) => {
        addSeparator();

        const trailUpToHere = categoryTrail.slice(0, index + 1);
        const isCurrentTrail =
            currentView === "categories" &&
            index === categoryTrail.length - 1 &&
            !selectedCategory;

        addCrumb(
            category.name,
            () => renderCategories(category, trailUpToHere),
            isCurrentTrail
        );
    });

    if (selectedCategory) {
        addSeparator();

        addCrumb(
            selectedCategory.name,
            () => renderLinks(selectedCategory),
            currentView === "links"
        );
    }
}

function clearContainer() {
    cardContainer.innerHTML = "";
    cardContainer.className = "list-grid";
}

function countItems(category) {
    if (category.categories && category.categories.length > 0) {
        let totalLinks = 0;

        category.categories.forEach(innerCategory => {
            if (innerCategory.items) {
                totalLinks += innerCategory.items.length;
            }
        });

        if (totalLinks === 0) {
            if (category.categories.length === 1) {
                return "1 category";
            }

            return `${category.categories.length} categories`;
        }

        if (totalLinks === 1) {
            return "1 link";
        }

        return `${totalLinks} links`;
    }

    const itemCount = category.items ? category.items.length : 0;

    if (itemCount === 1) {
        return "1 link";
    }

    return `${itemCount} links`;
}

function renderHome() {
    currentView = "home";
    selectedSubject = null;
    selectedCategory = null;
    currentCategoryParent = null;
    categoryTrail = [];

    clearContainer();
    updateBreadcrumb();
    backBtn.classList.add("hidden");

    subjects.forEach(subject => {
        const row = document.createElement("button");
        row.className = "subject-row";
        row.type = "button";

        row.innerHTML = `
            <span class="row-title">${subject.name}</span>
            <span class="row-meta">${subject.description || ""}</span>
        `;

        row.addEventListener("click", () => {
            selectedSubject = subject;
            renderCategories(subject, []);
        });

        cardContainer.appendChild(row);
    });
}

function renderCategories(parent, trail = []) {
    currentView = "categories";
    selectedCategory = null;
    currentCategoryParent = parent;
    categoryTrail = trail;

    clearContainer();
    cardContainer.classList.add("category-view");

    updateBreadcrumb();
    backBtn.classList.remove("hidden");

    if (!parent.categories || parent.categories.length === 0) {
        cardContainer.innerHTML = `<div class="empty-message">No categories yet.</div>`;
        return;
    }

    parent.categories.forEach(category => {
        const row = document.createElement("button");
        row.className = "category-row";
        row.type = "button";

        const lockIcon = category.password ? " 🔒" : "";

        row.innerHTML = `
            <span class="row-title">${category.name}${lockIcon}</span>
            <span class="row-meta">${countItems(category)}</span>
        `;

        row.addEventListener("click", () => {
            if (!checkPassword(category)) {
                return;
            }

            if (category.categories && category.categories.length > 0) {
                renderCategories(category, [...categoryTrail, category]);
            } else {
                renderLinks(category);
            }
        });

        cardContainer.appendChild(row);
    });
}

function renderLinks(category) {
    currentView = "links";
    selectedCategory = category;

    clearContainer();
    cardContainer.classList.add("links-view");

    updateBreadcrumb();
    backBtn.classList.remove("hidden");

    if (!category.items || category.items.length === 0) {
        cardContainer.innerHTML = `<div class="empty-message">No links yet.</div>`;
        return;
    }

    category.items.forEach((item, index) => {
        const rowWrap = document.createElement("div");
        rowWrap.className = "link-row-wrap";

        const selectedUrl = linkMode === "edit" ? item.collabLink : item.link;
        const openText = linkMode === "edit" ? "Open Edit Link" : "Open Link";

        const linkMain = document.createElement("div");
        linkMain.className = "link-main";

        linkMain.innerHTML = `
            <span class="row-title link-title">${item.title}</span>
            <span class="open-link">${selectedUrl ? openText : "No link"}</span>
        `;

        if (selectedUrl) {
            linkMain.addEventListener("click", () => {
                window.open(selectedUrl, "_blank", "noopener,noreferrer");
            });
        }

        const sourcesWrap = createSourcesBlock(item, index);

        rowWrap.appendChild(linkMain);
        rowWrap.appendChild(sourcesWrap);

        cardContainer.appendChild(rowWrap);
    });
}

function createSourcesBlock(item, index) {
    const sourcesWrap = document.createElement("div");
    sourcesWrap.className = "sources-wrap";

    const sources = Array.isArray(item.repositories) ? item.repositories : [];

    const sourceBtn = document.createElement("button");
    sourceBtn.className = "source-btn";
    sourceBtn.type = "button";

    sourceBtn.innerHTML = `
        <span class="source-label">Sources</span>
        <span class="source-arrow">⬇️</span>
    `;

    const sourceMenu = document.createElement("div");
    sourceMenu.className = "source-menu";
    sourceMenu.id = `sourceMenu-${index}`;

    if (sources.length > 0) {
        sources.forEach(source => {
            const sourceLink = document.createElement("a");
            sourceLink.href = source.link;
            sourceLink.target = "_blank";
            sourceLink.rel = "noopener noreferrer";
            sourceLink.textContent = source.title || "Source";
            sourceMenu.appendChild(sourceLink);
        });
    } else {
        const empty = document.createElement("span");
        empty.textContent = "No sources available";
        sourceMenu.appendChild(empty);
    }

    sourceBtn.addEventListener("click", event => {
        event.stopPropagation();

        document.querySelectorAll(".source-menu").forEach(menu => {
            if (menu !== sourceMenu) {
                menu.classList.remove("show");
            }
        });

        sourceMenu.classList.toggle("show");
    });

    sourcesWrap.appendChild(sourceBtn);
    sourcesWrap.appendChild(sourceMenu);

    return sourcesWrap;
}

function goBack() {
    if (currentView === "links") {
        renderCategories(currentCategoryParent, categoryTrail);
        return;
    }

    if (currentView === "categories") {
        if (categoryTrail.length > 0) {
            const newTrail = categoryTrail.slice(0, -1);

            const newParent =
                newTrail.length > 0
                    ? newTrail[newTrail.length - 1]
                    : selectedSubject;

            renderCategories(newParent, newTrail);
            return;
        }

        renderHome();
    }
}

document.addEventListener("click", event => {
    if (!event.target.closest(".sources-wrap")) {
        document.querySelectorAll(".source-menu").forEach(menu => {
            menu.classList.remove("show");
        });
    }
});

if (themeSelect) {
    themeSelect.addEventListener("change", () => {
        applyTheme(themeSelect.value);
    });
}

if (practiceModeBtn) {
    practiceModeBtn.addEventListener("click", () => {
        applyMode("practice");
    });
}

if (editModeBtn) {
    editModeBtn.addEventListener("click", () => {
        applyMode("edit");
    });
}

if (backBtn) {
    backBtn.addEventListener("click", goBack);
}

applyTheme(savedTheme);
applyMode(savedMode);
renderHome();