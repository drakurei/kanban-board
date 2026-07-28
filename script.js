console.log("Kanban JS loaded...");

window.addEventListener("DOMContentLoaded", () => {

const addCardBtn = document.getElementById("addCardBtn");
const searchInput = document.getElementById("searchInput");
const sortByPriorityBtn = document.getElementById("sortByPriorityBtn");

const modal = document.getElementById("cardModal");
const modalTitle = document.getElementById("modalTitle");

const saveCardBtn = document.getElementById("saveCardBtn");
const cancelBtn = document.getElementById("cancelBtn");

const titleInput = document.getElementById("cardTitle");
const descInput = document.getElementById("cardDescription");
const priorityInput = document.getElementById("cardPriority");

const columns = document.querySelectorAll(".column");

const STORAGE_KEY="kanban-state";

const PRIORITY_ORDER={
    high:3,
    medium:2,
    low:1
};

let draggedCard=null;
let editedCard=null;
let nextId=5;

function updateCounters(){

    columns.forEach(column=>{

        const counter=column.querySelector(".counter");

        counter.textContent=
            column.querySelectorAll(".card").length;

    });

}

function getPriorityLabel(priority){

    if(priority==="high")
        return "🔴 Haute";

    if(priority==="medium")
        return "🟡 Moyenne";

    return "🟢 Faible";

}

function openModal(card=null){

    editedCard=card;

    if(card){

        modalTitle.textContent="Modifier une carte";

        titleInput.value=
            card.querySelector("h3").textContent;

        descInput.value=
            card.querySelector("p").textContent;

        priorityInput.value=
            card.dataset.priority;

    }

    else{

        modalTitle.textContent="Nouvelle carte";

        titleInput.value="";
        descInput.value="";
        priorityInput.value="medium";

    }

    modal.classList.add("show");

}

function closeModal(){

    modal.classList.remove("show");

}

addCardBtn.addEventListener("click",()=>{

    openModal();

});

cancelBtn.addEventListener("click",closeModal);

window.addEventListener("click",(e)=>{

    if(e.target===modal)
        closeModal();

});

function makeCard(data){

    const card=document.createElement("div");

    card.className="card";

    card.dataset.id=data.id;

    card.dataset.priority=data.priority;

    card.setAttribute("draggable","true");

    card.innerHTML=`

        <button class="delete-btn">✖</button>

        <button class="edit-btn">✏</button>

        <h3>${data.title}</h3>

        <p>${data.content}</p>

        <span class="priority ${data.priority}">
            ${getPriorityLabel(data.priority)}
        </span>

    `;

    enableDelete(card);

    enableEdit(card);

    enableDrag(card);

    return card;

}

function enableEdit(card){

    card.querySelector(".edit-btn")
        .addEventListener("click",(e)=>{

        e.stopPropagation();

        openModal(card);

    });

}

saveCardBtn.addEventListener("click",()=>{

    const title=titleInput.value.trim();

    if(title===""){

        alert("Le titre est obligatoire.");

        return;

    }

    const content=descInput.value.trim();

    const priority=priorityInput.value;

    if(editedCard){

        editedCard.querySelector("h3").textContent=title;

        editedCard.querySelector("p").textContent=content;

        editedCard.dataset.priority=priority;

        editedCard.querySelector(".priority").className=
            `priority ${priority}`;

        editedCard.querySelector(".priority").textContent=
            getPriorityLabel(priority);

    }

    else{

        const todo=document.querySelector(
            '.column[data-status="todo"]'
        );

        todo.appendChild(

            makeCard({

                id:nextId++,

                title,

                content,

                priority

            })

        );

    }

    updateCounters();

    saveState();

    closeModal();

});

// ----------------------
// SUPPRESSION
// ----------------------

function enableDelete(card){

    card.querySelector(".delete-btn")
        .addEventListener("click",(e)=>{

        e.stopPropagation();

        if(!confirm("Voulez-vous vraiment supprimer cette carte ?"))
            return;

        card.remove();

        updateCounters();

        saveState();

    });

}

// ----------------------
// DRAG & DROP
// ----------------------

function enableDrag(card){

    card.addEventListener("dragstart",()=>{

        draggedCard=card;

        card.classList.add("dragging");

    });

    card.addEventListener("dragend",()=>{

        draggedCard=null;

        card.classList.remove("dragging");

        updateCounters();

        saveState();

    });

}

columns.forEach(column=>{

    column.addEventListener("dragover",(e)=>{

        e.preventDefault();

    });

    column.addEventListener("drop",(e)=>{

        e.preventDefault();

        if(!draggedCard) return;

        column.appendChild(draggedCard);

        updateCounters();

        saveState();

    });

});

// ----------------------
// RECHERCHE
// ----------------------

searchInput.addEventListener("input",()=>{

    const value=searchInput.value.toLowerCase();

    document.querySelectorAll(".card")
        .forEach(card=>{

            const title=card.querySelector("h3")
                .textContent
                .toLowerCase();

            const description=card.querySelector("p")
                .textContent
                .toLowerCase();

            const visible=
                title.includes(value)
                ||
                description.includes(value);

            card.style.display=
                visible
                    ? ""
                    : "none";

        });

});

// ----------------------
// TRI PAR PRIORITE
// ----------------------

sortByPriorityBtn.addEventListener("click",()=>{

    columns.forEach(column=>{

        const cards=
            Array.from(
                column.querySelectorAll(".card")
            );

        cards.sort((a,b)=>{

            return PRIORITY_ORDER[b.dataset.priority]
                -
                PRIORITY_ORDER[a.dataset.priority];

        });

        cards.forEach(card=>{

            column.appendChild(card);

        });

    });

    saveState();

});

// ----------------------
// LOCAL STORAGE
// ----------------------

function saveState(){

    const cards=[];

    columns.forEach(column=>{

        const status=column.dataset.status;

        column.querySelectorAll(".card")
            .forEach(card=>{

                cards.push({

                    id:card.dataset.id,

                    status,

                    priority:card.dataset.priority,

                    title:card.querySelector("h3").textContent,

                    content:card.querySelector("p").textContent

                });

            });

    });

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(cards)

    );

}

function loadState(){

    const data=
        JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

    if(!data)
        return false;

    document.querySelectorAll(".card")
        .forEach(card=>card.remove());

    let maxId=0;

    data.forEach(card=>{

        const column=document.querySelector(

            `.column[data-status="${card.status}"]`

        );

        column.appendChild(

            makeCard(card)

        );

        maxId=Math.max(maxId,Number(card.id));

    });

    nextId=maxId+1;

    updateCounters();

    return true;

}

// ----------------------
// INITIALISATION
// ----------------------

if(!loadState()){

    document.querySelectorAll(".card")
        .forEach(card=>{

            card.dataset.priority=
                card.dataset.priority || "medium";

            card.setAttribute("draggable","true");

            if(!card.querySelector(".delete-btn")){

                const deleteBtn=document.createElement("button");

                deleteBtn.className="delete-btn";

                deleteBtn.textContent="✖";

                card.prepend(deleteBtn);

            }

            if(!card.querySelector(".edit-btn")){

                const editBtn=document.createElement("button");

                editBtn.className="edit-btn";

                editBtn.textContent="✏";

                card.prepend(editBtn);

            }

            if(!card.querySelector(".priority")){

                const badge=document.createElement("span");

                badge.className=`priority ${card.dataset.priority}`;

                badge.textContent=getPriorityLabel(card.dataset.priority);

                card.appendChild(badge);

            }

            enableDelete(card);

            enableEdit(card);

            enableDrag(card);

        });

    updateCounters();

    saveState();

}

});

// ============ Fonctionnalités supplémentaires (regroupées) ============
window.addEventListener("DOMContentLoaded", () => {
  const toolbar = document.querySelector(".toolbar");
  const h1 = document.querySelector("h1");
  if (!toolbar) return;

  // Helper : crée un bouton de toolbar (libellé, classe, action)
  const addButton = (label, className, onClick) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.className = className;
    btn.addEventListener("click", onClick);
    toolbar.appendChild(btn);
    return btn;
  };

  // Hiérarchie des boutons déjà présents dans le HTML
  document.getElementById("addCardBtn")?.classList.add("btn-primary");
  document.getElementById("sortByPriorityBtn")?.classList.add("btn-ghost");

  // 1) Mode sombre (persistant via localStorage)
  const THEME_KEY = "kanban-theme";
  const applyTheme = (dark) => {
    document.body.classList.toggle("dark-mode", dark);
    themeBtn.textContent = dark ? "☀️ Mode clair" : "🌙 Mode sombre";
  };
  const themeBtn = addButton("🌙 Mode sombre", "btn-ghost", () => {
    const dark = !document.body.classList.contains("dark-mode");
    applyTheme(dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  });
  applyTheme(localStorage.getItem(THEME_KEY) === "dark");

  // 2) Filtre par priorité (segmented control avec état actif)
  const priorityWrap = document.createElement("span");
  priorityWrap.className = "priority-filter segmented";
  [["all", "Toutes"], ["high", "Haute"], ["medium", "Moyenne"], ["low", "Basse"]].forEach(
    ([value, label], i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      if (i === 0) b.classList.add("active");
      b.addEventListener("click", () => {
        priorityWrap.querySelectorAll("button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        document.querySelectorAll(".card").forEach((card) => {
          card.style.display = value === "all" || card.dataset.priority === value ? "" : "none";
        });
      });
      priorityWrap.appendChild(b);
    }
  );
  toolbar.appendChild(priorityWrap);

  // 3) Export du tableau en JSON
  addButton("Exporter (JSON)", "btn-ghost", () => {
    const cards = [];
    document.querySelectorAll(".column").forEach((col) => {
      col.querySelectorAll(".card").forEach((card) => {
        cards.push({
          status: col.dataset.status,
          priority: card.dataset.priority,
          title: card.querySelector("h3")?.textContent ?? "",
          content: card.querySelector("p")?.textContent ?? "",
        });
      });
    });
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kanban.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // 4) Vider la colonne "Done"
  const doneCol = document.querySelector('.column[data-status="done"]');
  if (doneCol) {
    addButton("🧹 Vider Done", "btn-danger", () => {
      if (confirm("Supprimer toutes les cartes terminées ?")) {
        doneCol.querySelectorAll(".card").forEach((c) => c.remove());
      }
    });
  }

  // 5) Nombre total de tâches dans le titre
  if (h1) {
    const base = h1.textContent.replace(/\s*\(\d+\)\s*$/, "");
    const updateTotal = () => {
      h1.textContent = `${base} (${document.querySelectorAll(".card").length})`;
    };
    updateTotal();
    document.querySelectorAll(".column").forEach((col) =>
      new MutationObserver(updateTotal).observe(col, { childList: true, subtree: true })
    );
  }
});
