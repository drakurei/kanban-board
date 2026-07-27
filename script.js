console.log("Kanban JS loaded...");

window.addEventListener("DOMContentLoaded", () => {
  const addCardBtn = document.getElementById("addCardBtn");
  const searchInput = document.getElementById("searchInput");
  const sortByPriorityBtn = document.getElementById("sortByPriorityBtn");
  const columns = document.querySelectorAll(".column");

  const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };
  let nextId = 5; // les ids 1 à 4 sont déjà utilisés dans le HTML
  let draggedCard = null;

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
        .forEach((card) => col.appendChild(card)); // réordonne dans le DOM
    });
  });

  // Met à niveau les cartes déjà présentes dans le HTML (drag + bouton supprimer)
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
});
