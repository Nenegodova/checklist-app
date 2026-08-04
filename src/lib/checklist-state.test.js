import { describe, expect, it } from "vitest";
import {
  buildTasks,
  getCategoryProgress,
  getHiddenByFiltersCount,
  getOverallProgress,
  getRelevantTasks,
  getVisibleTasks,
} from "./checklist-state";

const tasks = {
  Текст: [
    { id: "plain", done: false },
    { id: "image", feature: "images", done: true },
    { id: "both", feature: "images", done: true },
  ],
  Таблицы: [{ id: "table", done: true }],
};
const enabled = { tables: true, images: true };

describe("checklist state", () => {
  it("builds stable ids for text-only and link-only checklist items", () => {
    const built = buildTasks({
      Прочее: [
        "Текстовый пункт",
        { links: [{ label: "Методичка", url: "https://example.com/guide" }] },
      ],
    });

    expect(built["Прочее"].map(({ id }) => id)).toEqual([
      "Текстовый пункт",
      "https://example.com/guide",
    ]);
  });

  it("keeps every task when all filters are enabled", () => {
    const relevant = getRelevantTasks(tasks, enabled);
    expect(relevant).toEqual(tasks);
    expect(getOverallProgress(relevant)).toEqual({
      done: 3,
      total: 4,
      percent: 75,
    });
  });

  it("filters feature tasks and the complete Tables category without double counting", () => {
    const relevant = getRelevantTasks(tasks, { tables: false, images: false });
    expect(relevant["Текст"].map(({ id }) => id)).toEqual(["plain"]);
    expect(relevant["Таблицы"]).toEqual([]);
    expect(getHiddenByFiltersCount(tasks, relevant)).toBe(3);
    expect(getCategoryProgress(relevant, "Таблицы")).toEqual({
      done: 0,
      total: 0,
    });
    expect(getOverallProgress(relevant)).toEqual({
      done: 0,
      total: 1,
      percent: 0,
    });
  });

  it("does not let focus alter progress, while hiding completed relevant tasks", () => {
    const relevant = getRelevantTasks(tasks, { tables: true, images: false });
    expect(getOverallProgress(relevant)).toEqual({
      done: 1,
      total: 2,
      percent: 50,
    });
    expect(getVisibleTasks(relevant, true)).toEqual({
      Текст: [{ id: "plain", done: false }],
      Таблицы: [],
    });
    expect(getCategoryProgress(relevant, "Таблицы")).toEqual({
      done: 1,
      total: 1,
    });
  });
});
