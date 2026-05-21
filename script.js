const cardContainer = document.getElementById("cardContainer");
const breadcrumb = document.getElementById("breadcrumb");
const backBtn = document.getElementById("backBtn");
const collabBtn = document.getElementById("collabBtn");

const themeSelect = document.getElementById("themeSelect");
const savedTheme = localStorage.getItem("formsDashboardTheme") || "ember";

let currentView = "home";
let selectedSubject = null;
let selectedCategory = null;
let linkMode = "response";

function applyTheme(themeName) {
    document.body.setAttribute("data-theme", themeName);
    localStorage.setItem("formsDashboardTheme", themeName);

    if (themeSelect) {
        themeSelect.value = themeName;
    }
}

if (themeSelect) {
    themeSelect.addEventListener("change", function() {
        applyTheme(themeSelect.value);
    });
}

applyTheme(savedTheme);

function removeRepositoryDropdown() {
    const existingRepoBox = document.getElementById("repoBox");

    if (existingRepoBox) {
        existingRepoBox.remove();
    }
}

function resetLinkMode() {
    linkMode = "response";

    if (collabBtn) {
        collabBtn.textContent = "Collab Links";
    }
}

function hideCollabButton() {
    if (collabBtn) {
        collabBtn.classList.add("hidden");
    }
}

function showCollabButton() {
    if (collabBtn) {
        collabBtn.classList.remove("hidden");
    }
}

function renderRepositoryDropdown(category) {
    removeRepositoryDropdown();

    if (!category.repositories || category.repositories.length === 0) {
        return;
    }

    const repoBox = document.createElement("div");
    repoBox.id = "repoBox";
    repoBox.className = "repo-box";

    repoBox.innerHTML = `
        <label for="repoSelect" class="repo-label">Sources</label>

        <select id="repoSelect" class="repo-select">
            <option value="">Choose source...</option>
            ${category.repositories.map(repo => `
                <option value="${repo.link}">${repo.title}</option>
            `).join("")}
        </select>
    `;

    const navRow = document.querySelector(".nav-row");
    navRow.appendChild(repoBox);

    const repoSelect = document.getElementById("repoSelect");

    repoSelect.addEventListener("change", function() {
        if (repoSelect.value) {
            window.open(repoSelect.value, "_blank");
            repoSelect.value = "";
        }
    });
}

function renderHome() {
    removeRepositoryDropdown();
    hideCollabButton();
    resetLinkMode();

    currentView = "home";
    selectedSubject = null;
    selectedCategory = null;

    breadcrumb.textContent = "Home";
    backBtn.classList.add("hidden");

    cardContainer.innerHTML = "";

    subjects.forEach(subject => {
        const card = createCard({
            icon: subject.icon,
            title: subject.name,
            description: subject.description,
            footer: `${subject.categories.length} categories`
        });

        card.addEventListener("click", function() {
            selectedSubject = subject;
            renderSubject(subject);
        });

        cardContainer.appendChild(card);
    });
}

function renderSubject(subject) {
    removeRepositoryDropdown();
    hideCollabButton();
    resetLinkMode();

    currentView = "subject";
    selectedSubject = subject;
    selectedCategory = null;

    breadcrumb.textContent = `Home / ${subject.name}`;
    backBtn.classList.remove("hidden");

    cardContainer.innerHTML = "";

    subject.categories.forEach(category => {
        const card = createCard({
            icon: category.icon,
            title: category.name,
            description: category.description,
            footer: `${category.items.length} links`
        });

        card.addEventListener("click", function() {
            selectedCategory = category;
            renderCategory(subject, category);
        });

        cardContainer.appendChild(card);
    });
}

function renderCategory(subject, category) {
    currentView = "category";
    selectedSubject = subject;
    selectedCategory = category;

    breadcrumb.textContent = `Home / ${subject.name} / ${category.name}`;
    backBtn.classList.remove("hidden");
    showCollabButton();

    cardContainer.innerHTML = "";

    renderRepositoryDropdown(category);

    if (!category.items || category.items.length === 0) {
        cardContainer.innerHTML = `
            <div class="empty-message">
                No links added yet.
            </div>
        `;
        return;
    }

    category.items.forEach(item => {
        const activeLink = linkMode === "collab" ? item.collabLink : item.link;
        const hasLink = activeLink && activeLink.trim() !== "";

        const card = createCard({
            icon: linkMode === "collab" ? "🤝" : "🔗",
            title: item.title,
            description: item.description || "No description added.",
            footer: hasLink
                ? (linkMode === "collab" ? "Open Collab Link" : "Open Form")
                : (linkMode === "collab" ? "Collab link not added yet" : "Link not added yet")
        });

        card.classList.add("link-card");

        if (!hasLink) {
            card.classList.add("disabled-card");
        }

        card.addEventListener("click", function() {
            if (hasLink) {
                window.open(activeLink, "_blank");
            }
        });

        cardContainer.appendChild(card);
    });
}

function createCard({ icon, title, description, footer }) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
        <div>
            <div class="card-icon">${icon}</div>
            <h2>${title}</h2>
            <p>${description || "No description added."}</p>
        </div>
        <div class="card-footer">${footer}</div>
    `;

    return card;
}

if (collabBtn) {
    collabBtn.addEventListener("click", function() {
        if (!selectedSubject || !selectedCategory) {
            return;
        }

        if (linkMode === "response") {
            linkMode = "collab";
            collabBtn.textContent = "Response Links";
        } else {
            linkMode = "response";
            collabBtn.textContent = "Collab Links";
        }

        renderCategory(selectedSubject, selectedCategory);
    });
}

backBtn.addEventListener("click", function() {
    if (currentView === "category") {
        renderSubject(selectedSubject);
    } else if (currentView === "subject") {
        renderHome();
    }
});

renderHome();