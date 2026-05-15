const cardContainer = document.getElementById("cardContainer");
const breadcrumb = document.getElementById("breadcrumb");
const backBtn = document.getElementById("backBtn");

let currentView = "home";
let selectedSubject = null;
let selectedCategory = null;

function renderHome() {
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
    currentView = "subject";

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

    breadcrumb.textContent = `Home / ${subject.name} / ${category.name}`;
    backBtn.classList.remove("hidden");

    cardContainer.innerHTML = "";

    if (category.items.length === 0) {
        cardContainer.innerHTML = `
            <div class="empty-message">
                No links added yet.
            </div>
        `;
        return;
    }

    category.items.forEach(item => {
        const card = createCard({
            icon: "🔗",
            title: item.title,
            description: item.description,
            footer: "Open Google Form"
        });

        card.classList.add("link-card");

        card.addEventListener("click", function() {
            window.open(item.link, "_blank");
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
            <p>${description}</p>
        </div>
        <div class="card-footer">${footer}</div>
    `;

    return card;
}

backBtn.addEventListener("click", function() {
    if (currentView === "category") {
        renderSubject(selectedSubject);
    } else if (currentView === "subject") {
        renderHome();
    }
});

renderHome();