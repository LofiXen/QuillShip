// Journal Save

const entry = document.querySelector(".entry");
entry.style.height = entry.scrollHeight + 'px';
entry.addEventListener("input", () => {
entry.style.height = 'auto';
entry.style.height = entry.scrollHeight + 'px';
});

// MUSIC (fade-in system)
const music = document.getElementById("ship-music");
const toggleBtn = document.getElementById("music-toggle");

let hasStarted = false;

function fadeIn(audio) {
let vol = 0;
audio.volume = 0;
audio.muted = false;

const interval = setInterval(() => {
    if (vol < 0.3) {
        vol += 0.01;
        audio.volume = vol;
    } else {
        clearInterval(interval);
    }
}, 200);

}

// Start music on FIRST interaction
document.addEventListener("click", () => {
if (!hasStarted) {
music.play();
fadeIn(music);
hasStarted = true;
}
});

// Toggle button
toggleBtn.addEventListener("click", () => {
if (music.paused) {
music.play();
toggleBtn.textContent = "🔊";
} else {
music.pause();
toggleBtn.textContent = "🔇";
}
});

// Sticky notes full-featured
const addBtn = document.getElementById("add-note");
const dock = document.querySelector(".sticky-dock");
let notes = JSON.parse(localStorage.getItem("stickyNotes")) || [];

// Save notes
function saveNotes() {
notes = [];
document.querySelectorAll(".sticky-note").forEach(note => {
notes.push({
id: note.dataset.id,
title: note.querySelector(".note-title").innerText,
body: note.querySelector(".note-body").innerText,
color: note.dataset.color,
top: note.style.top,
left: note.style.left,
width: note.style.width,
height: note.style.height,
minimized: note.dataset.minimized === "true"
});
});
localStorage.setItem("stickyNotes", JSON.stringify(notes));
}

// Create note
function createNote(data = {}) {
const note = document.createElement("div");
note.className = "sticky-note";
note.dataset.id = data.id || Date.now().toString();
note.dataset.color = data.color || "color-1";
note.dataset.minimized = data.minimized || false;
note.style.top = data.top || "50px";
note.style.left = data.left || "220px";
note.style.width = data.width || "200px";
note.style.height = data.height || "150px";
note.classList.add(note.dataset.color);

// Header
const header = document.createElement("div");
header.className = "note-header";

const title = document.createElement("div");
title.className = "note-title";
title.contentEditable = true;
title.innerText = data.title || "New Note";

const minimizeBtn = document.createElement("button");
minimizeBtn.className = "minimize-note";
minimizeBtn.innerText = "\_";

const deleteBtn = document.createElement("button");
deleteBtn.className = "delete-note";
deleteBtn.innerText = "X";

header.appendChild(title);
header.appendChild(minimizeBtn);
header.appendChild(deleteBtn);

// Body
const body = document.createElement("div");
body.className = "note-body";
body.contentEditable = true;
body.innerText = data.body || "Don't waste your schedulae...";
body.style.color = data.body ? "#000" : "rgba(0,0,0,0.45)";

body.addEventListener("focus", () => {
    if (body.innerText === "Don't waste your schedulae...") {
        body.innerText = "";
        body.style.color = "#000";
    }
});
body.addEventListener("blur", () => {
    if (body.innerText.trim() === "") {
        body.innerText = "Don't waste your schedulae...";
        body.style.color = "rgba(0,0,0,0.45)";
    }
});

// Color selector
const colorSelector = document.createElement("div");
colorSelector.className = "sticky-colors";
const colors = ['color-1','color-2','color-3','color-4','color-5',
                'color-6','color-7','color-8','color-9','color-10',
                'color-11','color-12','color-13','color-14','color-15'];
colors.forEach(c => {
    const swatch = document.createElement("div");
    swatch.className = \`color-option ${c}\`;
    swatch.addEventListener("click", e => {
        note.classList.remove(note.dataset.color);
        note.classList.add(c);
        note.dataset.color = c;
        colorSelector.style.display = "none";
        saveNotes();
        e.stopPropagation();
    });
    colorSelector.appendChild(swatch);
});

note.appendChild(header);
note.appendChild(body);
note.appendChild(colorSelector);
document.body.appendChild(note);

// Minimize
minimizeBtn.addEventListener("click", () => {
    note.dataset.minimized = "true";
    note.style.display = "none";
    addDockTab(note);
    saveNotes();
});

// Delete
deleteBtn.addEventListener("click", () => {
    note.remove();
    removeDockTab(note.dataset.id);
    saveNotes();
});

// Dragging
let offsetX, offsetY;
header.addEventListener("mousedown", e => {
    offsetX = e.clientX - note.offsetLeft;
    offsetY = e.clientY - note.offsetTop;

    function move(e) {
        note.style.left = (e.clientX - offsetX) + "px";
        note.style.top = (e.clientY - offsetY) + "px";
    }
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", move);
        saveNotes();
    }, { once: true });
});

if (!note.dataset.minimized || note.dataset.minimized === "false") {
    note.style.display = "block";
} else {
    note.style.display = "none";
    addDockTab(note);
}

saveNotes();

}

// Dock tab
function addDockTab(note) {
let tab = document.createElement("div");
tab.className = "dock-tab";
tab.dataset.id = note.dataset.id;
tab.innerText = note.querySelector(".note-title").innerText;

tab.addEventListener("click", () => {
    note.style.display = "block";
    note.dataset.minimized = "false";
    tab.remove();
    saveNotes();
});

dock.appendChild(tab);

}

function removeDockTab(id) {
const tab = dock.querySelector(`.dock-tab[data-id="${id}"]`);
if (tab) tab.remove();
}

// Add button
addBtn.addEventListener("click", () => createNote());

// Load saved notes
notes.forEach(n => createNote(n));

const chapterBtn = document.getElementById("add-chapter");
const chapterContainer = document.getElementById("chapters");

let chapters = JSON.parse(localStorage.getItem("chapters")) || [];
let currentChapterId = localStorage.getItem("currentChapter") || null;

// Save chapters
function saveChapters() {
localStorage.setItem("chapters", JSON.stringify(chapters));
}

// Load into editor
function loadChapter(id) {
const chapter = chapters.find(c => c.id === id);
if (!chapter) return;
entry.value = chapter.content || "";
entry.style.height = 'auto';
entry.style.height = entry.scrollHeight + 'px';
currentChapterId = id;
localStorage.setItem("currentChapter", id);
}

// Auto-save writing INTO current chapter
entry.addEventListener("input", () => {
if (!currentChapterId) return;
const chapter = chapters.find(c => c.id === currentChapterId);
if (chapter) {
chapter.content = entry.value;
saveChapters();
}
});

// Create chapter
function createChapter(data = {}) {
const id = data.id || Date.now().toString();
const chapter = {
id: id,
title: data.title || "Untitled Chapter",
content: data.content || ""
};
chapters.push(chapter);
saveChapters();
renderChapters();
loadChapter(id);
}

// Render chapters
function renderChapters() {
chapterContainer.innerHTML = "";
chapters.forEach(ch => {
const div = document.createElement("div");
div.className = "chapter";
div.draggable = true;
div.dataset.id = ch.id;

    const title = document.createElement("div");
    title.className = "chapter-title";
    title.contentEditable = true;
    title.innerText = ch.title;
    title.addEventListener("input", () => {
        ch.title = title.innerText;
        saveChapters();
    });

    const del = document.createElement("button");
    del.className = "chapter-delete";
    del.innerText = "X";

    // 🔥 Two-step burn system
    const burnModal = document.getElementById("burn-modal");
    const burnText = document.getElementById("burn-text");
    const burnConfirm = document.getElementById("burn-confirm");
    const burnCancel = document.getElementById("burn-cancel");

    let burnStage = 0;
    let targetChapterId = null;

    del.addEventListener("click", () => {
        burnStage = 1;
        targetChapterId = ch.id;
        burnText.innerText = "Are you sure you want to burn this scroll?";
        burnModal.classList.remove("burn-hidden");
    });

    burnCancel.addEventListener("click", () => {
        burnModal.classList.add("burn-hidden");
        burnStage = 0;
        targetChapterId = null;
    });

    burnConfirm.addEventListener("click", () => {
        if (burnStage === 1) {
            burnStage = 2;
            burnText.innerText = "The remnants of this scroll cannot be retrieved from the ashes. It is unrecoverable.";
            return;
        }

        if (burnStage === 2 && targetChapterId) {
            chapters = chapters.filter(c => c.id !== targetChapterId);
            saveChapters();
            renderChapters();

            if (currentChapterId === targetChapterId) {
                entry.value = "";
                currentChapterId = null;
            }

            burnModal.classList.add("burn-hidden");
            burnStage = 0;
            targetChapterId = null;
        }
    });

    div.addEventListener("click", () => loadChapter(ch.id));

    div.addEventListener("dragstart", () => div.classList.add("dragging"));
    div.addEventListener("dragend", () => {
        div.classList.remove("dragging");
        const newOrder = [];
        document.querySelectorAll(".chapter").forEach(el => {
            const id = el.dataset.id;
            const found = chapters.find(c => c.id === id);
            if (found) newOrder.push(found);
        });
        chapters = newOrder;
        saveChapters();
    });

    chapterContainer.addEventListener("dragover", e => {
        e.preventDefault();
        const dragging = document.querySelector(".dragging");
        const after = getDragAfterElement(e.clientY);
        if (after == null) chapterContainer.appendChild(dragging);
        else chapterContainer.insertBefore(dragging, after);
    });

    div.appendChild(title);
    div.appendChild(del);
    chapterContainer.appendChild(div);
});

}

// Drag helper
function getDragAfterElement(y) {
const elements = [...chapterContainer.querySelectorAll(".chapter:not(.dragging)")];
return elements.reduce((closest, child) => {
const box = child.getBoundingClientRect();
const offset = y - box.top - box.height / 2;
if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
else return closest;
}, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Add chapter button
chapterBtn.addEventListener("click", () => createChapter());

// Load existing
renderChapters();

// Load last opened
if (currentChapterId) loadChapter(currentChapterId);

// Quill cursor follow
const quillCursor = document.getElementById("quill-cursor");

document.addEventListener("mousemove", (e) => {
quillCursor.style.left = (e.clientX - 4) + "px";
quillCursor.style.top = (e.clientY - 55) + "px";
});

document.addEventListener("mousedown", () => {
quillCursor.style.scale = "0.95";
});

document.addEventListener("mouseup", () => {
quillCursor.style.scale = "1";
});

// =========================
// EXPORT SYSTEM
// =========================
function exportData(type) {
const text = entry.value;
const currentChapter = chapters.find(c => c.id === currentChapterId);
const title = currentChapter ? currentChapter.title : "Untitled";

if (!text.trim()) {
    alert("Nothing to export.");
    return;
}

if (type === "txt") {
    const content = \`${title}\n\n${text}\`;
    const blob = new Blob([content], { type: "text/plain" });
    downloadFile(blob, \`${title}.txt\`);
}

if (type === "doc") {
    const html = \`
    \<html>
    \<body>
        \<h1>${title}\</h1>
        \<p>${text.replace(/\n/g, "\<br>")}\</p>
    \</body>
    \</html>\`;
    const blob = new Blob([html], { type: "application/msword" });
    downloadFile(blob, \`${title}.doc\`);
}

if (type === "json") {
    const data = {
        title: title,
        content: text
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    downloadFile(blob, \`${title}.json\`);
}

if (type === "pdf") {
    const printWindow = window\.open("", "\_blank");
    printWindow\.document.write(\`
        \<html>
        \<head>\<title>${title}\</title>\</head>
        \<body style="font-family: serif; padding: 40px;">
            \<h1>${title}\</h1>
            \<p>${text.replace(/\n/g, "\<br>")}\</p>
        \</body>
        \</html>
    \`);
    printWindow\.document.close();
    printWindow\.print();
}

}

// helper
function downloadFile(blob, filename) {
const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download = filename;
a.click();
}

// =========================
// IMPORT SYSTEM
// =========================
function importData(file) {
const reader = new FileReader();

reader.onload = function(e) {
    try {
        const data = JSON.parse(e.target.result);

        if (data.chapters) {
            chapters = data.chapters;
            saveChapters();
            renderChapters();
        }

        if (data.notes) {
            localStorage.setItem("stickyNotes", JSON.stringify(data.notes));
            location.reload(); // refresh to rebuild notes
        }

    } catch {
        alert("Invalid file. Use a QuillShip JSON backup.");
    }
};

reader.readAsText(file);

}
