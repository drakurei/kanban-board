console.log("Kanban JS loaded...");

window.addEventListener("DOMContentLoaded", () => {
  const addCardBtn = document.getElementById("addCardBtn");
  const searchInput = document.getElementById("searchInput");
  const sortByPriorityBtn = document.getElementById("sortByPriorityBtn");
  const columns = document.querySelectorAll(".column");

  let nextId = 5; // les ids 1 à 4 sont déjà utilisés dans le HTML
  let draggedCard = null;

  // Fabrique un élément carte à partir de données
  function makeCard({ id, priority, title, content }) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = id;
    card.dataset.priority = priority;
    card.setAttribute("draggable", "true");
    card.innerHTML = `<h3>${title}</h3><p>${content}</p>`;
    enableDrag(card);
    return card;
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
    col.addEventListener("dragover", (e) => e.preventDefault()); // autorise le drop
    col.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedCard) return;
      col.appendChild(draggedCard);
      draggedCard.dataset.status = col.dataset.status; // met à jour la colonne
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

  searchInput.addEventListener("input", () => {});
  sortByPriorityBtn.addEventListener("click", () => {});

  // Rendre déplaçables les cartes déjà présentes dans le HTML
  document.querySelectorAll(".card").forEach((card) => {
    card.setAttribute("draggable", "true");
    enableDrag(card);
  });
});
