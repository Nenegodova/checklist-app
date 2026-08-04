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
  await expect(
    page.getByRole("checkbox", { name: /мягкий перенос/i }),
  ).toBeChecked();
  await expect(page.locator("body")).not.toContainText("Фон");
});

test("task links do not change the neighbouring checkbox", async ({ page }) => {
  const task = page.getByRole("checkbox", { name: /мягкий перенос/i });
  await page
    .getByRole("link", { name: "Символы ↗" })
    .click({ modifiers: ["Meta"] });
  await expect(task).not.toBeChecked();
});

test("full RESET restores the checklist while preserving theme", async ({
  page,
}) => {
  await page.getByRole("combobox", { name: "Формат" }).selectOption("tests");
  await expect(
    page.getByRole("button", { name: "Раздел Прочее" }),
  ).toBeVisible();
  const task = page.getByRole("checkbox", { name: /мягкий перенос/i });
  await task.check();
  await page.getByRole("button", { name: "Таблицы", pressed: true }).click();
  await page.getByRole("button", { name: "Раздел Текст" }).click();
  await page.getByRole("button", { name: "Открыть заметки" }).click();
  await page.getByRole("textbox", { name: "Заметки" }).fill("сбросить");
  await page.getByRole("switch", { name: /фокус/i }).click();
  await page.getByTestId("theme-toggle").click();
  await page.getByRole("button", { name: "Полный RESET" }).click();
  await expect(
    page.getByRole("alertdialog", { name: "Сбросить чек-лист?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Сбросить", exact: true }).click();

  await expect(page.getByRole("combobox", { name: "Формат" })).toHaveValue(
    "default",
  );
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("switch", { name: /фокус/i })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await expect(
    page.getByRole("checkbox", { name: /мягкий перенос/i }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "Таблицы", pressed: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Раздел Текст" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: "Открыть заметки" }).click();
  await expect(page.getByRole("textbox", { name: "Заметки" })).toHaveValue("");
});

test("navigation stays pinned and focus follows clear marks", async ({
  page,
}, testInfo) => {
  await expect(page.locator(".sticky-header")).toHaveCSS("position", "sticky");
  await expect(page.getByRole("switch", { name: /фокус/i })).toHaveCSS(
    "border-top-width",
    "1px",
  );

  if (testInfo.project.name === "mobile") {
    await expect(page.locator(".focus-dock")).toHaveCSS("position", "fixed");
  } else {
    await expect(page.locator(".sidebar")).toHaveCSS("position", "sticky");
    const clearBox = await page.locator(".sidebar-clear-button").boundingBox();
    const focusBox = await page.locator(".desktop-focus").boundingBox();
    expect(focusBox?.y).toBeGreaterThan(
      (clearBox?.y ?? 0) + (clearBox?.height ?? 0),
    );
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect
    .poll(async () => (await page.locator(".topbar").boundingBox())?.y)
    .toBe(0);
});

test("mobile header keeps format and actions aligned and centers the reset icon", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only assertion");
  const elements = [
    page.locator(".header-format-control > span"),
    page.getByRole("combobox", { name: "Формат" }),
    page.getByTestId("theme-toggle"),
    page.getByRole("button", { name: "Полный RESET" }),
  ];
  const boxes = await Promise.all(
    elements.map((element) => element.boundingBox()),
  );
  const centers = boxes.map((box) => (box?.y ?? 0) + (box?.height ?? 0) / 2);
  expect(Math.max(...centers) - Math.min(...centers)).toBeLessThanOrEqual(1);

  const resetBox = boxes.at(-1);
  const iconBox = await page.locator(".reset-button svg").boundingBox();
  expect((iconBox?.x ?? 0) + (iconBox?.width ?? 0) / 2).toBeCloseTo(
    (resetBox?.x ?? 0) + (resetBox?.width ?? 0) / 2,
    0,
  );
  expect((iconBox?.y ?? 0) + (iconBox?.height ?? 0) / 2).toBeCloseTo(
    (resetBox?.y ?? 0) + (resetBox?.height ?? 0) / 2,
    0,
  );
});

test("dark theme keeps primary content readable", async ({ page }) => {
  await page.getByTestId("theme-toggle").click();
  const contrast = await page.locator(".app").evaluate((app) => {
    const parseRgb = (value) => value.match(/\d+/g).slice(0, 3).map(Number);
    const luminance = (value) => {
      const [red, green, blue] = parseRgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const styles = getComputedStyle(app);
    const foreground = luminance(styles.color);
    const background = luminance(styles.backgroundColor);
    return (
      (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05)
    );
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});

test("changing format asks before resetting completion and restores context", async ({
  page,
}) => {
  const task = page.getByRole("checkbox", { name: /мягкий перенос/i });
  await task.check();
  await page.getByRole("button", { name: "Раздел Текст" }).click();
  await expect(
    page.getByRole("button", { name: "Раздел Текст" }),
  ).toHaveAttribute("aria-expanded", "false");

  await page.getByRole("combobox", { name: "Формат" }).selectOption("tests");
  await expect(
    page.getByRole("alertdialog", { name: "Сменить формат?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Сменить формат" }).click();
  await expect(task).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "Раздел Текст" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("button", { name: "Раздел Админка" }),
  ).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("every format builds its checklist and shows Misc only where defined", async ({
  page,
}) => {
  const formats = [
    "default",
    "invest",
    "shopping",
    "tests",
    "compare",
    "spending",
    "cd",
    "shorts",
    "ugc",
  ];
  const formatsWithMisc = new Set(["tests", "cd", "shorts"]);

  for (const format of formats) {
    await page.getByRole("combobox", { name: "Формат" }).selectOption(format);
    await expect(
      page.getByRole("button", { name: "Раздел Админка" }),
    ).toBeVisible();
    const misc = page.getByRole("button", { name: "Раздел Прочее" });
    if (formatsWithMisc.has(format)) await expect(misc).toBeVisible();
    else await expect(misc).toHaveCount(0);
  }
});

test("clear marks keeps the format, theme, and notes while restoring filters", async ({
  page,
}) => {
  await page.getByRole("combobox", { name: "Формат" }).selectOption("tests");
  await page.getByTestId("theme-toggle").click();
  const task = page.getByRole("checkbox", { name: /мягкий перенос/i });
  await task.check();
  await page.getByRole("button", { name: "Таблицы", pressed: true }).click();
  await page.getByRole("button", { name: "Открыть заметки" }).click();
  await page.getByRole("textbox", { name: "Заметки" }).fill("сохранить");
  await page.getByRole("button", { name: "Закрыть заметки" }).click();
  await page.getByRole("button", { name: "Снять отметки" }).click();

  await expect(page.getByRole("combobox", { name: "Формат" })).toHaveValue(
    "tests",
  );
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(task).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "Таблицы", pressed: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Открыть заметки" }).click();
  await expect(page.getByRole("textbox", { name: "Заметки" })).toHaveValue(
    "сохранить",
  );
});

test("clear marks can be undone together with filters", async ({ page }) => {
  const task = page.getByRole("checkbox", { name: /мягкий перенос/i });
  await task.check();
  await page.getByRole("button", { name: "Таблицы", pressed: true }).click();
  await page.getByRole("button", { name: "Снять отметки" }).click();
  await expect(task).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "Таблицы", pressed: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Вернуть" }).click();
  await expect(task).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Таблицы", exact: true, pressed: false }),
  ).toBeVisible();
});

test("clicking task copy toggles the task without changing link behavior", async ({
  page,
}) => {
  const task = page.getByRole("checkbox", {
    name: "Проверить, что коллеги закрыли вкладку с визивигом",
  });
  const row = page.locator(".task-row").filter({ has: task });
  await row.locator(".task-copy").click();
  await expect(task).toBeChecked();
});

test("next incomplete expands its section and moves keyboard focus", async ({
  page,
}) => {
  const section = page.getByRole("button", { name: "Раздел Админка" });
  const task = page.getByRole("checkbox", { name: /мягкий перенос/i });
  await section.click();
  await expect(section).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Следующий невыполненный →" }).click();
  await expect(section).toHaveAttribute("aria-expanded", "true");
  await expect(task).toBeFocused();
});

test("focus mode hides completed relevant tasks without changing progress", async ({
  page,
}) => {
  const task = page.getByRole("checkbox", { name: /мягкий перенос/i });
  await task.check();
  await page.getByRole("switch", { name: /Режим фокуса|Фокус/ }).click();
  await expect(task).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Раздел Админка" }),
  ).toContainText("1/7");
});

test("notes move focus to the editor and close with Escape", async ({
  page,
}) => {
  const notesButton = page.getByRole("button", { name: "Открыть заметки" });
  await notesButton.click();
  await expect(page.getByRole("textbox", { name: "Заметки" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("textbox", { name: "Заметки" })).toHaveCount(0);
  await expect(notesButton).toBeFocused();
});

test("mobile section chips scroll to their section", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only assertion");
  await page
    .locator(".mobile-category-nav button")
    .filter({ hasText: "Выпуск" })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  await expect(page.locator(".mobile-category-nav")).toBeVisible();
  await expect
    .poll(async () => (await page.locator(".sticky-header").boundingBox())?.y)
    .toBe(0);
});

test("mobile page has no clipped main content", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only assertion");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const clipped = await page.locator(".main-content").evaluate((main) =>
    [...main.querySelectorAll("*")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          className: element.className,
          left: rect.left,
          right: rect.right,
        };
      })
      .filter(({ left, right }) => left < 0 || right > window.innerWidth + 1),
  );
  expect(clipped).toEqual([]);
});

test.skip("@visual desktop-light", async ({ page }) => {
  await expect(page).toHaveScreenshot("desktop-light.png", { fullPage: true });
});
