/* script.js - Control de modales y ruleta mejorado */

const $ = (id) => document.getElementById(id);

// DOM elements
const wheel = $("wheel");
const spinBtn = $("spinBtn");
const btnMenu = $("btnMenu");
const menuOpciones = $("menuOpciones");

const btnAgregarJugador = $("btnAgregarJugador");
const modalAddPlayer = $("modalAddPlayer");
const addPlayerBtn = $("addPlayerBtn");
const clearPlayerFields = $("clearPlayerFields");
const closeAddPlayer = $("closeAddPlayer");
const p_name = $("p_name");
const p_gender = $("p_gender");
const p_pairing = $("p_pairing");
const playerList = $("playerList"); // 📌 lista donde pondremos los jugadores

const btnAgregarVR = $("btnAgregarVR");
const modalBanks = $("modalBanks");
const addTruthBtn = $("addTruthBtn");
const resetTruths = $("resetTruths");
const truthText = $("truthText");
const addDareBtn = $("addDareBtn");
const resetDares = $("resetDares");
const dareText = $("dareText");
const dareCategory = $("dareCategory");
const listTruths = $("listTruths");
const listDares = $("listDares");
const closeBanks = $("closeBanks");

const selectedCard = $("selectedCard");
const selectedName = $("selectedName");
const selectedMeta = $("selectedMeta");
const vrButtons = $("vrButtons");
const btnTruth = $("btnTruth");
const btnDare = $("btnDare");

const modalPrompt = $("modalPrompt");
const promptTitle = $("promptTitle");
const promptContent = $("promptContent");

// Estado y persistencia
let players = JSON.parse(localStorage.getItem("vo_players")) || [];
let truths = JSON.parse(localStorage.getItem("vo_truths")) || null;
let dares = JSON.parse(localStorage.getItem("vo_dares")) || null;

if (!truths)
  truths = [
    "¿Cuál fue la cosa más embarazosa que te ha pasado en la escuela?",
    "¿Tienes algún talento oculto? ¿Cuál?",
    "¿Cuál es tu comida favorita y por qué?",
  ];
if (!dares)
  dares = {
    Hombre: [
      "Imita a un animal durante 20 segundos.",
      "Cuenta un chiste y haz que todos voten si fue gracioso.",
    ],
    Mujer: ["Baila sin música durante 30 segundos."],
    "Hombre y Mujer": ["Canta el estribillo de una canción al azar."],
  };
saveState();

function saveState() {
  localStorage.setItem("vo_players", JSON.stringify(players));
  localStorage.setItem("vo_truths", JSON.stringify(truths));
  localStorage.setItem("vo_dares", JSON.stringify(dares));
}

function renderPlayers() {
  playerList.innerHTML = "";

  if (players.length === 0) {
    playerList.innerHTML = "<div class='muted'>No hay jugadores aún</div>";
    return;
  }

  players.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "bankItem";
    row.innerHTML = `
      <div style="flex:1">${p.name} — <small>${p.gender}, ${p.pairing}</small></div>
      <div><button class="btn ghost btnDelPlayer" data-i="${i}">Eliminar</button></div>
    `;
    playerList.appendChild(row);
  });

  // Eventos de eliminar
  document.querySelectorAll(".btnDelPlayer").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.i);
      players.splice(index, 1);
      saveState();
      renderPlayers();
      drawWheel(); // actualizar ruleta
    });
  });
}

// Gestión de modales
const allModals = [modalAddPlayer, modalBanks, modalPrompt];
let lastTrigger = null;

function hideAllModals() {
  allModals.forEach((m) => {
    m.classList.add("hidden");
    m.setAttribute("aria-hidden", "true");
  });

  wheel.classList.remove("freezeCanvas"); // ⭐ AGREGAR AQUÍ

  if (lastTrigger) lastTrigger.focus();
}

function showModal(modal, trigger) {
  hideAllModals();

  wheel.classList.add("freezeCanvas"); // ⭐ AGREGAR AQUÍ

  lastTrigger = trigger || null;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  const first = modal.querySelector("input, textarea, select, button");
  if (first) first.focus();
}

// Cerrar modales con clic fuera o ESC
allModals.forEach((back) => {
  back.addEventListener("click", (e) => {
    if (e.target === back) hideAllModals();
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideAllModals();
});

// Menú superior
btnMenu.addEventListener("click", () => {
  const open = !menuOpciones.classList.contains("hidden");
  menuOpciones.classList.toggle("hidden", open);
  btnMenu.setAttribute("aria-expanded", String(!open));
});
menuOpciones.addEventListener("click", () => {
  menuOpciones.classList.add("hidden");
  btnMenu.setAttribute("aria-expanded", "false");
});

// Estado inicial
hideAllModals();
selectedCard.classList.add("hidden");
vrButtons.classList.add("hidden");
vrButtons.setAttribute("aria-hidden", "true");

// Modal jugadores
btnAgregarJugador.addEventListener("click", (e) => {
  renderPlayers();
  showModal(modalAddPlayer, e.target);
});
closeAddPlayer.addEventListener("click", hideAllModals);
clearPlayerFields.addEventListener("click", () => {
  p_name.value = "";
  p_gender.value = "";
  p_pairing.value = "";
});
addPlayerBtn.addEventListener("click", () => {
  const name = p_name.value.trim(),
    gender = p_gender.value,
    pairing = p_pairing.value;
  if (!name || !gender || !pairing)
    return alert("Completa: nombre, género y emparejamiento.");
  players.push({ name, gender, pairing });
  saveState();
  renderPlayers();
  p_name.value = "";
  p_gender.value = "";
  p_pairing.value = "";
  hideAllModals();
  drawWheel();
});

// Modal bancos
btnAgregarVR.addEventListener("click", (e) => {
  renderBanks();
  showModal(modalBanks, e.target);
});
closeBanks.addEventListener("click", hideAllModals);

// Renderizar bancos de verdades y retos
function renderBanks() {
  listTruths.innerHTML = "";
  truths.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "bankItem";
    row.innerHTML = `<div style="flex:1">${t}</div><div><button class="btn ghost btnDelTruth" data-i="${i}">Eliminar</button></div>`;
    listTruths.appendChild(row);
  });
  listDares.innerHTML = "";
  Object.keys(dares).forEach((cat) => {
    const header = document.createElement("div");
    header.style.fontWeight = "700";
    header.style.margin = "6px 0";
    header.textContent = cat;
    listDares.appendChild(header);
    dares[cat].forEach((d, i) => {
      const row = document.createElement("div");
      row.className = "bankItem";
      row.innerHTML = `<div style="flex:1">${d}</div><div><button class="btn ghost btnDelDare" data-cat="${cat}" data-i="${i}">Eliminar</button></div>`;
      listDares.appendChild(row);
    });
  });
  document.querySelectorAll(".btnDelTruth").forEach((b) =>
    b.addEventListener("click", () => {
      truths.splice(parseInt(b.dataset.i), 1);
      saveState();
      renderBanks();
    })
  );
  document.querySelectorAll(".btnDelDare").forEach((b) =>
    b.addEventListener("click", () => {
      const c = b.dataset.cat;
      dares[c].splice(parseInt(b.dataset.i), 1);
      saveState();
      renderBanks();
    })
  );
}

// Agregar verdad / reto
addTruthBtn.addEventListener("click", () => {
  const t = truthText.value.trim();
  if (!t) return alert("Escribe una verdad.");
  truths.unshift(t);
  truthText.value = "";
  saveState();
  renderBanks();
});
resetTruths.addEventListener("click", () => {
  if (!confirm("Restablecer banco de verdades?")) return;
  truths = [
    "¿Cuál fue la cosa más embarazosa que te ha pasado en la escuela?",
    "¿Tienes algún talento oculto? ¿Cuál?",
    "¿Cuál es tu comida favorita y por qué?",
  ];
  saveState();
  renderBanks();
});
addDareBtn.addEventListener("click", () => {
  const d = dareText.value.trim(),
    cat = dareCategory.value;
  if (!d || !cat) return alert("Escribe un reto y selecciona una categoría.");
  dares[cat].unshift(d);
  dareText.value = "";
  saveState();
  renderBanks();
});
resetDares.addEventListener("click", () => {
  if (!confirm("Restablecer retos?")) return;
  dares = {
    Hombre: [
      "Imita a un animal durante 20 segundos.",
      "Cuenta un chiste y haz que todos voten si fue gracioso.",
    ],
    Mujer: ["Baila sin música durante 30 segundos."],
    "Hombre y Mujer": ["Canta el estribillo de una canción al azar."],
  };
  saveState();
  renderBanks();
});

// Canvas ruleta
const ctx = wheel.getContext("2d");
function resizeCanvas() {
  const rect = wheel.getBoundingClientRect();
  wheel.width = Math.round(rect.width * devicePixelRatio);
  wheel.height = Math.round(rect.height * devicePixelRatio);
  wheel.style.width = rect.width + "px";
  wheel.style.height = rect.height + "px";
  drawWheel();
}
window.addEventListener("resize", resizeCanvas);
document.addEventListener("DOMContentLoaded", resizeCanvas);

const SEG_COLORS = [
  "#ff4d4f",
  "#ff8a00",
  "#8b2be2",
  "#ff6b4d",
  "#ff3b00",
  "#a13cff",
];

function drawWheel() {
  const w = wheel.width,
    h = wheel.height;
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2,
    cy = h / 2,
    r = Math.min(w, h) / 2 - 8 * devicePixelRatio;
  const n = Math.max(1, players.length);
  const slice = (2 * Math.PI) / n;
  ctx.textBaseline = "middle";
  for (let i = 0; i < n; i++) {
    const start = -Math.PI / 2 + i * slice,
      end = start + slice;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    const col = SEG_COLORS[i % SEG_COLORS.length];
    const grad = ctx.createLinearGradient(
      cx + Math.cos(start) * r,
      cy + Math.sin(start) * r,
      cx + Math.cos(end) * r,
      cy + Math.sin(end) * r
    );
    grad.addColorStop(0, col);
    grad.addColorStop(1, "rgba(0,0,0,0.15)");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    const ang = start + slice / 2;
    ctx.rotate(ang);
    ctx.fillStyle = "#fff";
    ctx.font = `${14 * devicePixelRatio}px 'Inter', sans-serif`;
    ctx.textAlign = "right";
    const name = players[i] ? players[i].name : "...";
    const displayName = name.length > 10 ? name.slice(0, 9) + "…" : name;
    ctx.fillText(displayName, r - 18 * devicePixelRatio, 0);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fill();
}

// Giro ruleta
let currentRotation = 0,
  spinning = false,
  selectedIndex = null;

spinBtn.addEventListener("click", () => {
  if (players.length < 2) return alert("Agrega al menos 2 jugadores.");
  if (spinning) return;
  spinning = true;
  vrButtons.classList.add("hidden");
  vrButtons.setAttribute("aria-hidden", "true");

  const totalRot = 5 + Math.random() * 3;
  gsap.to(wheel, {
    rotation: currentRotation + 360 * totalRot,
    duration: 3.5,
    ease: "power4.out",
    onUpdate() {
      currentRotation = gsap.getProperty(wheel, "rotation");
    },
    onComplete() {
      spinning = false;
      const deg = ((currentRotation % 360) + 360) % 360;
      const slice = 360 / players.length;
      selectedIndex = players.length - 1 - Math.floor(deg / slice);
      const p = players[selectedIndex];
      selectedName.textContent = p.name;
      selectedMeta.textContent = `${p.gender} — ${p.pairing}`;
      selectedCard.classList.remove("hidden");
      vrButtons.classList.remove("hidden");
      vrButtons.setAttribute("aria-hidden", "false");
    },
  });
});

// Clic manual en ruleta
wheel.addEventListener("click", (e) => {
  if (!players.length) return;
  const rect = wheel.getBoundingClientRect();
  const dx = e.clientX - rect.left - rect.width / 2;
  const dy = e.clientY - rect.top - rect.height / 2;
  const ang = Math.atan2(dy, dx) * (180 / Math.PI);
  const norm = (ang + 360) % 360;
  const idx =
    ((Math.floor(norm / (360 / players.length)) % players.length) +
      players.length) %
    players.length;
  selectedIndex = idx;
  const p = players[idx];
  selectedName.textContent = p.name;
  selectedMeta.textContent = `${p.gender} — ${p.pairing}`;
  selectedCard.classList.remove("hidden");
  vrButtons.classList.remove("hidden");
  vrButtons.setAttribute("aria-hidden", "false");
});

// Modal verdad / reto
btnTruth.addEventListener("click", () => {
  const val = truths[Math.floor(Math.random() * truths.length)];
  promptTitle.textContent = "Verdad";
  promptContent.textContent = val;
  showModal(modalPrompt, btnTruth);
});
btnDare.addEventListener("click", () => {
  const player = players[selectedIndex];
  let options = dares[player.pairing] || [];
  if (!options.length)
    options = [
      ...dares["Hombre"],
      ...dares["Mujer"],
      ...dares["Hombre y Mujer"],
    ];
  const val = options[Math.floor(Math.random() * options.length)];
  promptTitle.textContent = "Reto";
  promptContent.textContent = val;
  showModal(modalPrompt, btnDare);
});

$("closePrompt").addEventListener("click", hideAllModals);
