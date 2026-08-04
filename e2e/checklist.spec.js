import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("persists completion and filters across a reload", async ({ page }) => {
  const task = page.getByRole("checkbox", { name: /мягкий перенос/i });
  await task.check();
  await page.getByRole("button", { name: "Таблицы", pressed: true }).click();
  await page.reload();
  await expect(page.getByTestId("hidden-by-filters")).toContainText("6");
  await expect(page.getByRole("checkbox", { name: /мягкий перенос/i })).toBeChecked();
  await expect(page.locator("body")).not.toContainText("Фон");
});

test("preset controls Misc and RESET preserves theme", async ({ page }) => {
  await page.getByRole("combobox", { name: "Формат" }).selectOption("tests");
  await expect(page.getByRole("button", { name: "Раздел Прочее" })).toBeVisible();
  await page.getByRole("combobox", { name: "Формат" }).selectOption("invest");
  await expect(page.getByRole("button", { name: "Раздел Прочее" })).toHaveCount(0);
  await page.getByRole("button", { name: "Переключить тему" }).click();
  await page.getByRole("button", { name: "Меню действий" }).click();
  await page.getByRole("menuitem", { name: "Полный RESET" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("every format builds its checklist and shows Misc only where defined", async ({ page }) => {
  const formats = ["default", "invest", "shopping", "tests", "compare", "spending", "cd", "shorts", "ugc"];
  const formatsWithMisc = new Set(["tests", "cd", "shorts"]);

  for (const format of formats) {
    await page.getByRole("combobox", { name: "Формат" }).selectOption(format);
    await expect(page.getByRole("button", { name: "Раздел Админка" })).toBeVisible();
    const misc = page.getByRole("button", { name: "Раздел Прочее" });
    if (formatsWithMisc.has(format)) await expect(misc).toBeVisible();
    else await expect(misc).toHaveCount(0);
  }
});

test("clear marks keeps the format, theme, and notes while restoring filters", async ({ page }) => {
  await page.getByRole("combobox", { name: "Формат" }).selectOption("tests");
  await page.getByRole("button", { name: "Переключить тему" }).click();
  const task = page.getByRole("checkbox", { name: /мягкий перенос/i });
  await task.check();
  await page.getByRole("button", { name: "Таблицы", pressed: true }).click();
  await page.getByRole("button", { name: "Открыть заметки" }).click();
  await page.getByRole("textbox", { name: "Заметки" }).fill("сохранить");
  await page.getByRole("button", { name: "Снять отметки" }).click();

  await expect(page.getByRole("combobox", { name: "Формат" })).toHaveValue("tests");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(task).not.toBeChecked();
  await expect(page.getByRole("button", { name: "Таблицы", pressed: true })).toBeVisible();
  await page.getByRole("button", { name: "Открыть заметки" }).click();
  await expect(page.getByRole("textbox", { name: "Заметки" })).toHaveValue("сохранить");
});

test("focus mode hides completed relevant tasks without changing progress", async ({ page }) => {
  const task = page.getByRole("checkbox", { name: /мягкий перенос/i });
  await task.check();
  await page.getByRole("switch", { name: /Режим фокуса|Фокус/ }).click();
  await expect(task).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Раздел Админка" })).toContainText("1/7");
});

test("notes move focus to the editor and close with Escape", async ({ page }) => {
  const notesButton = page.getByRole("button", { name: "Открыть заметки" });
  await notesButton.click();
  await expect(page.getByRole("textbox", { name: "Заметки" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("textbox", { name: "Заметки" })).toHaveCount(0);
  await expect(notesButton).toBeFocused();
});

test("mobile section chips scroll to their section", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only assertion");
  await page.locator(".mobile-category-nav button").filter({ hasText: "Выпуск" }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test("mobile page has no horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only assertion");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test.skip("@visual desktop-light", async ({ page }) => {
  await expect(page).toHaveScreenshot("desktop-light.png", { fullPage: true });
});
