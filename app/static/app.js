const STORAGE_KEY = "bullshit_counter_records";

function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayRecords() {
  const key = todayKey();
  return getRecords().filter(r => r.date === key);
}

function addRecord(word) {
  const records = getRecords();
  records.push({
    word: word,
    timestamp: Date.now(),
    date: todayKey()
  });
  saveRecords(records);
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function formatDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const toast = document.getElementById("toast");
let toastTimer;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function render() {
  const records = todayRecords();
  document.getElementById("todayCount").textContent = records.length;
  document.getElementById("todayDate").textContent = formatDate();

  const historyEl = document.getElementById("history");
  if (records.length === 0) {
    historyEl.innerHTML = '<div class="empty">Nenhum palavrão registrado ainda.</div>';
    return;
  }

  // Mais recentes primeiro (espelha o ORDER BY datetime DESC)
  const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
  historyEl.innerHTML = sorted
    .map(r => `
            <div class="history-item">
                <span class="word">🤬 ${escapeHtml(r.word)}</span>
                <span class="time">🕐 ${formatTime(r.timestamp)}</span>
            </div>
        `)
    .join("");
}

function register(word) {
  const cleaned = word.trim();
  if (!cleaned) {
    showToast("❌ Texto vazio.");
    return;
  }
  addRecord(cleaned);
  render();
  showToast("✅ Palavrão registrado!");
}

// Botões pré-definidos
document.querySelectorAll(".grid button[data-word]").forEach(btn => {
  btn.addEventListener("click", () => register(btn.dataset.word));
});

// Palavrão customizado
document.getElementById("customBtn").addEventListener("click", () => {
  const input = document.getElementById("customInput");
  register(input.value);
  input.value = "";
  input.focus();
});

document.getElementById("customInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const input = document.getElementById("customInput");
    register(input.value);
    input.value = "";
  }
});

// Zerar registros do dia
document.getElementById("resetBtn").addEventListener("click", () => {
  const key = todayKey();
  const all = getRecords().filter(r => r.date !== key);
  saveRecords(all);
  render();
  showToast("🗑️ Registros de hoje zerados!");
});

render();
