(function (root, factory) {
  const logic = factory();
  if (typeof module === "object" && module.exports) module.exports = logic;
  root.WaterTracker = logic;
})(globalThis, function () {
  function total(entries = []) {
    return entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  }

  function addEntry(days, dateKey, amount, id, loggedAt = Date.now()) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 1 || value > 5000) throw new Error("Amount must be between 1 and 5,000 ml.");
    if (!id) throw new Error("Entry id is required.");
    const entries = Array.isArray(days[dateKey]) ? days[dateKey] : [];
    return { ...days, [dateKey]: [...entries, { id, amount: Math.round(value), loggedAt }] };
  }

  function undoLast(days, dateKey) {
    const entries = Array.isArray(days[dateKey]) ? days[dateKey] : [];
    if (!entries.length) return { ...days };
    const remaining = entries.slice(0, -1);
    const updated = { ...days };
    if (remaining.length) updated[dateKey] = remaining;
    else delete updated[dateKey];
    return updated;
  }

  function clearDay(days, dateKey) {
    const updated = { ...days };
    delete updated[dateKey];
    return updated;
  }

  function progress(entries, goal) {
    const safeGoal = Number(goal);
    if (!Number.isFinite(safeGoal) || safeGoal < 1) throw new Error("Goal must be a positive number.");
    return Math.min(100, Math.round(total(entries) / safeGoal * 100));
  }

  function validateGoal(goal) {
    const value = Number(goal);
    if (!Number.isInteger(value) || value < 1 || value > 10000) throw new Error("Goal must be between 1 and 10,000 ml.");
    return value;
  }

  return { total, addEntry, undoLast, clearDay, progress, validateGoal };
});
