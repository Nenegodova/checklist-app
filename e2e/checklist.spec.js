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

test("mobile page has no horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only assertion");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test.skip("@visual desktop-light", async ({ page }) => {
  await expect(page).toHaveScreenshot("desktop-light.png", { fullPage: true });
});
