console.log("Kanban JS loaded...");

window.addEventListener("DOMContentLoaded", () => {
  const addCardBtn = document.getElementById("addCardBtn");
  const searchInput = document.getElementById("searchInput");
  const sortByPriorityBtn = document.getElementById("sortByPriorityBtn");
  const columns = document.querySelectorAll(".column");

  const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };
  const STORAGE_KEY = "kanban-state";
  let nextId = 5; // les ids 1 à 4 sont déjà utilisés dans le HTML
  let draggedCard = null;

  // --- Fonctionnalité 6 : Sauvegarde localStorage ---
  function saveState() {
    const cards = [];
    document.querySelectorAll(".column").forEach((col) => {
      const status = col.dataset.status;
      col.querySelectorAll(".card").forEach((card) => {
        cards.push({
          id: card.dataset.id,
          priority: card.dataset.priority,
          status,
          title: card.querySelector("h3").textContent,
          content: card.querySelector("p").textContent,
        });
      });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    let cards;
    try {
      cards = JSON.parse(raw);
    } catch (e) {
      return false;
    }
    // On vide les cartes existantes puis on reconstruit depuis le stockage
    document.querySelectorAll(".card").forEach((c) => c.remove());
    let maxId = 0;
    cards.forEach((data) => {
      const col = document.querySelector(`.column[data-status="${data.status}"]`);
      if (col) col.appendChild(makeCard(data));
      maxId = Math.max(maxId, Number(data.id) || 0);
    });
    nextId = maxId + 1;
    return true;
  }

  // Fabrique un élément carte à partir de données
  function makeCard({ id, priority, title, content }) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = id;
    card.dataset.priority = priority;
    card.setAttribute("draggable", "true");
    card.innerHTML =
      `<button class="delete-btn" title="Supprimer">&times;</button>` +
      `<h3>${title}</h3><p>${content}</p>`;
    enableDrag(card);
    enableDelete(card);
    return card;
  }

  // --- Fonctionnalité 3 : Supprimer une carte ---
  function enableDelete(card) {
    const btn = card.querySelector(".delete-btn");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      card.remove();
      saveState();
    });
  }

  // --- Fonctionnalité 2 : Drag & drop ---
  function enableDrag(card) {
    card.addEventListener("dragstart", () => {
      draggedCard = card;
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedCard = null;
    });
  }

  columns.forEach((col) => {
    col.addEventListener("dragover", (e) => e.preventDefault());
    col.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedCard) return;
      col.appendChild(draggedCard);
      draggedCard.dataset.status = col.dataset.status;
      saveState();
    });
  });

  // --- Fonctionnalité 1 : Ajouter une carte ---
  addCardBtn.addEventListener("click", () => {
    const title = prompt("Titre de la carte :");
    if (!title) return;
    const content = prompt("Contenu de la carte :") || "";
    let priority = (prompt("Priorité (high, medium, low) :", "medium") || "medium").toLowerCase();
    if (!["high", "medium", "low"].includes(priority)) priority = "medium";

    const todo = document.querySelector('.column[data-status="todo"]');
    todo.appendChild(makeCard({ id: nextId++, priority, title, content }));
    saveState();
  });

  // --- Fonctionnalité 4 : Filtre par mot-clé ---
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    document.querySelectorAll(".card").forEach((card) => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      const content = card.querySelector("p").textContent.toLowerCase();
      const match = title.includes(query) || content.includes(query);
      card.style.display = match ? "" : "none";
    });
  });

  // --- Fonctionnalité 5 : Classement par priorité ---
  sortByPriorityBtn.addEventListener("click", () => {
    columns.forEach((col) => {
      Array.from(col.querySelectorAll(".card"))
        .sort((a, b) => PRIORITY_ORDER[b.dataset.priority] - PRIORITY_ORDER[a.dataset.priority])
        .forEach((card) => col.appendChild(card));
    });
    saveState();
  });

  // --- Initialisation ---
  // Si un état est sauvegardé, on le restaure ; sinon on prépare les cartes du HTML.
  if (!loadState()) {
    document.querySelectorAll(".card").forEach((card) => {
      card.setAttribute("draggable", "true");
      if (!card.querySelector(".delete-btn")) {
        const btn = document.createElement("button");
        btn.className = "delete-btn";
        btn.title = "Supprimer";
        btn.innerHTML = "&times;";
        card.insertBefore(btn, card.firstChild);
      }
      enableDrag(card);
      enableDelete(card);
    });
    saveState();
  }
});
