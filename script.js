console.log("Kanban JS loaded...");

window.addEventListener("DOMContentLoaded", () => {
  const addCardBtn = document.getElementById("addCardBtn");
  const searchInput = document.getElementById("searchInput");
  const sortByPriorityBtn = document.getElementById("sortByPriorityBtn");

  let nextId = 5; // les ids 1 à 4 sont déjà utilisés dans le HTML

  // Fabrique un élément carte à partir de données
  function makeCard({ id, priority, title, content }) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = id;
    card.dataset.priority = priority;
    card.innerHTML = `<h3>${title}</h3><p>${content}</p>`;
    return card;
  }

  // --- Fonctionnalité 1 : Ajouter une carte ---
  addCardBtn.addEventListener("click", () => {
    const title = prompt("Titre de la carte :");
    if (!title) return; // annulation ou champ vide
    const content = prompt("Contenu de la carte :") || "";
    let priority = (prompt("Priorité (high, medium, low) :", "medium") || "medium").toLowerCase();
    if (!["high", "medium", "low"].includes(priority)) priority = "medium";

    const todo = document.querySelector('.column[data-status="todo"]');
    todo.appendChild(makeCard({ id: nextId++, priority, title, content }));
  });

  // Les autres fonctionnalités arriveront sur leurs propres branches feature/...
  searchInput.addEventListener("input", () => {});
  sortByPriorityBtn.addEventListener("click", () => {});
});
