const test = require("node:test");
const assert = require("node:assert/strict");
const water = require("../logic.js");

test("adds validated intake entries immutably and totals them", () => {
  const days = {};
  const updated = water.addEntry(days, "2026-01-02", 250, "drink-1", 10);
  assert.deepEqual(days, {});
  assert.equal(water.total(updated["2026-01-02"]), 250);
});

test("rejects amounts outside the supported range", () => {
  assert.throws(() => water.addEntry({}, "today", 0, "x"), /between 1 and 5,000/);
  assert.throws(() => water.addEntry({}, "today", 5001, "x"), /between 1 and 5,000/);
});

test("undo removes only the latest entry and drops an empty day", () => {
  const days = { today: [{ id: "a", amount: 100 }, { id: "b", amount: 200 }] };
  assert.deepEqual(water.undoLast(days, "today").today, [{ id: "a", amount: 100 }]);
  assert.deepEqual(water.undoLast({ today: [{ id: "a", amount: 100 }] }, "today"), {});
  assert.equal(days.today.length, 2);
});

test("progress is capped at 100 and goals are range-checked", () => {
  assert.equal(water.progress([{ amount: 2500 }], 2000), 100);
  assert.equal(water.progress([{ amount: 500 }], 2000), 25);
  assert.equal(water.validateGoal("2500"), 2500);
  assert.throws(() => water.validateGoal(0), /between 1 and 10,000/);
});
