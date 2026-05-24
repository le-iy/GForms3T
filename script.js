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
    return linkMode === "edit" ? "Edit Links" : "Practice Links";
}

function updateBreadcrumb() {
    if (currentView === "home") {
        breadcrumb.textContent = "Home";
        return;
    }

    if (currentView === "categories" && selectedSubject) {
        breadcrumb.textContent = `Home / ${getModeLabel()} / ${selectedSubject.name}`;
        return;
    }

    if (currentView === "links" && selectedSubject && selectedCategory) {
        breadcrumb.textContent = `Home / ${getModeLabel()} / ${selectedSubject.name} / ${selectedCategory.name}`;
    }
}

function clearContainer() {
    cardContainer.innerHTML = "";
    cardContainer.className = "list-grid";
}

function countItems(category) {
    const itemCount = category.items ? category.items.length : 0;
    return itemCount === 1 ? "1 link" : `${itemCount} links`;
}

function renderHome() {
    currentView = "home";
    selectedSubject = null;
    selectedCategory = null;

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
            renderCategories(subject);
        });

        cardContainer.appendChild(row);
    });
}

function renderCategories(subject) {
    currentView = "categories";
    selectedSubject = subject;
    selectedCategory = null;

    clearContainer();
    cardContainer.classList.add("category-view");

    updateBreadcrumb();
    backBtn.classList.remove("hidden");

    if (!subject.categories || subject.categories.length === 0) {
        cardContainer.innerHTML = `<div class="empty-message">No categories yet.</div>`;
        return;
    }

    subject.categories.forEach(category => {
        const row = document.createElement("button");
        row.className = "category-row";
        row.type = "button";

        row.innerHTML = `
            <span class="row-title">${category.name}</span>
            <span class="row-meta">${countItems(category)}</span>
        `;

        row.addEventListener("click", () => {
            selectedCategory = category;
            renderLinks(category);
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
        <span class="source-arrow">⌄</span>
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
    if (currentView === "links" && selectedSubject) {
        renderCategories(selectedSubject);
        return;
    }

    if (currentView === "categories") {
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