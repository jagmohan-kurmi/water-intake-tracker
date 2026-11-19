const STORAGE_KEY = "ripple-water-tracker-v1";
const statusMessage = document.querySelector("#status");
let statusTimer;

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) throw new Error("Saved data has an unexpected format.");
    return { goal: WaterTracker.validateGoal(saved.goal || 2000), days: saved.days && typeof saved.days === "object" ? saved.days : {} };
  } catch (error) {
    statusMessage.textContent = `Saved data could not be read: ${error.message}`;
    statusMessage.classList.add("show");
    return { goal: 2000, days: {} };
  }
}

let state = readState();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    showStatus(`Could not save your log: ${error.message}`);
  }
}

function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.classList.add("show");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => statusMessage.classList.remove("show"), 2300);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayKey() {
  return dateKey(new Date());
}

function todayEntries() {
  return Array.isArray(state.days[todayKey()]) ? state.days[todayKey()] : [];
}

function render() {
  const entries = todayEntries();
  const consumed = WaterTracker.total(entries);
  const percentage = WaterTracker.progress(entries, state.goal);
  document.querySelector("#total").textContent = consumed.toLocaleString();
  document.querySelector("#goal-label").textContent = `${state.goal.toLocaleString()} ml`;
  document.querySelector("#goal-input").value = String(state.goal);
  document.querySelector("#progress-label").textContent = percentage >= 100 ? "You reached your personal goal." : `${percentage}% of your personal goal`;
  document.querySelector("#ring").style.setProperty("--angle", `${Math.round(percentage * 3.6)}deg`);
  document.querySelector("#entry-actions").hidden = entries.length === 0;
  renderHistory();
}

function renderHistory() {
  const rows = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = dateKey(date);
    const entries = Array.isArray(state.days[key]) ? state.days[key] : [];
    const amount = WaterTracker.total(entries);
    const bar = WaterTracker.progress(entries, state.goal);
    const label = index === 6 ? "Today" : new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
    return `<div class="history-row"><span>${label}</span><div class="track" role="img" aria-label="${bar}% of goal"><div class="fill" style="width:${bar}%"></div></div><span class="history-total">${amount.toLocaleString()} ml</span></div>`;
  }).join("");
  document.querySelector("#history").innerHTML = rows;
}

function addDrink(amount) {
  try {
    state.days = WaterTracker.addEntry(state.days, todayKey(), amount, globalThis.crypto.randomUUID());
    save();
    render();
    showStatus(`${Number(amount).toLocaleString()} ml added.`);
  } catch (error) {
    showStatus(error.message);
  }
}

document.querySelector("#today").textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
document.querySelectorAll("[data-add]").forEach((button) => button.addEventListener("click", () => addDrink(Number(button.dataset.add))));
document.querySelector("#custom-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#custom-amount");
  addDrink(Number(input.value));
  input.value = "";
});
document.querySelector("#goal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    state.goal = WaterTracker.validateGoal(document.querySelector("#goal-input").value);
    save();
    render();
    showStatus("Your personal goal was saved.");
  } catch (error) {
    showStatus(error.message);
  }
});
document.querySelector("#undo").addEventListener("click", () => {
  state.days = WaterTracker.undoLast(state.days, todayKey());
  save();
  render();
  showStatus("Last drink removed.");
});
document.querySelector("#clear").addEventListener("click", () => {
  if (!window.confirm("Clear today's water log?")) return;
  state.days = WaterTracker.clearDay(state.days, todayKey());
  save();
  render();
  showStatus("Today's log cleared.");
});

render();
