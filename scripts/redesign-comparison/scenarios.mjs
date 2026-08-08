const PRIMARY_TASK = /мягкий перенос/i;
const TABLE_TASK = /У таблицы есть заголовок/i;

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function settle(page) {
  await page.waitForTimeout(650);
}

async function loadClean(page, url, seed = {}) {
  const seedValue = encodeURIComponent(JSON.stringify(seed));
  await page.goto(`${url}/?comparisonSeed=${seedValue}`);
  await page.evaluate(() => {
    history.replaceState(null, "", "/");
  });
  await page.locator("select").first().waitFor();
  await page.evaluate(() => document.fonts?.ready);
  await settle(page);
}

async function captureState(page) {
  return page.evaluate(() => {
    const parse = (key, fallback) => {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    };
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const taskKey = (task) =>
      task.text ||
      task.links?.map((link) => link.url || link.label).join("|") ||
      "(без текста)";
    const checklist = parse("checklist", {});
    const contentFilters = parse("contentFilters", {});
    const categories = Object.keys(checklist);
    const tasks = Object.values(checklist).flat();
    const visibleCheckboxes = [
      ...document.querySelectorAll('input[type="checkbox"]'),
    ]
      .filter(visible)
      .map((checkbox) => checkbox.getAttribute("aria-label") || "");

    const progressLabel = document
      .querySelector('[aria-label^="Общий прогресс"]')
      ?.getAttribute("aria-label");
    const currentProgress = progressLabel?.match(
      /Общий прогресс:\s*(\d+)\s*из\s*(\d+)/,
    );
    const legacyProgress = document.body.innerText.match(
      /(\d+)\s*\/\s*(\d+)\s*\((\d+)%\)/,
    );
    const progress = currentProgress
      ? {
          done: Number(currentProgress[1]),
          total: Number(currentProgress[2]),
        }
      : legacyProgress
        ? {
            done: Number(legacyProgress[1]),
            total: Number(legacyProgress[2]),
          }
        : null;

    return {
      preset: document.querySelector("select")?.value ?? null,
      categories,
      totalTasks: tasks.length,
      doneTasks: tasks
        .filter((task) => task.done)
        .map(taskKey)
        .sort(),
      visibleCheckboxes,
      progress,
      contentFilters,
      allFiltersEnabled:
        Object.keys(contentFilters).length > 0 &&
        Object.values(contentFilters).every(Boolean),
      notes: localStorage.getItem("notes") || "",
      dark:
        document.documentElement.classList.contains("dark") ||
        localStorage.getItem("dark") === "true",
      bgImagePresent: Boolean(localStorage.getItem("bgImage")),
      hasMisc: categories.includes("Прочее"),
    };
  });
}

async function getTask(page, name, category) {
  let task = page.getByRole("checkbox", { name });
  if ((await task.count()) > 0) return task;

  const redesignedHeading = page.getByRole("button", {
    name: `Раздел ${category}`,
  });
  if ((await redesignedHeading.count()) > 0) {
    await redesignedHeading.click();
  } else {
    // In the legacy UI the category heading is a clickable div without a role.
    await page.getByText(category, { exact: true }).first().click();
  }
  await page.waitForTimeout(100);
  task = page.getByRole("checkbox", { name });
  await task.waitFor();
  return task;
}

async function selectPreset(page, preset, confirm = true) {
  await page.locator("select").first().selectOption(preset);
  await page.waitForTimeout(100);
  const dialog = page.locator('[role="alertdialog"]');
  const confirmationShown = await dialog.isVisible().catch(() => false);
  if (confirmationShown && confirm) {
    await dialog.getByRole("button", { name: "Сменить формат" }).click();
  }
  await settle(page);
  return confirmationShown;
}

async function clickTablesFilter(page) {
  await page
    .getByRole("button", { name: /^(✓\s*)?Таблицы$/, exact: false })
    .first()
    .click();
  await settle(page);
}

async function clickFocus(page) {
  const switchControl = page.getByRole("switch", { name: /фокус/i });
  if ((await switchControl.count()) > 0) {
    await switchControl.first().click();
  } else {
    await page
      .getByRole("button", { name: /Фокус (ON|OFF)/i })
      .first()
      .click();
  }
  await settle(page);
}

async function clickClear(page) {
  await page
    .locator("button")
    .filter({ hasText: /^(Снять отметки|Сброс)$/ })
    .first()
    .click();
  await settle(page);
}

async function clickFullReset(page) {
  const reset = page
    .getByRole("button", { name: /^(Полный )?RESET$/i })
    .first();
  await reset.click();
  await page.waitForTimeout(100);
  const dialog = page.locator('[role="alertdialog"]');
  const confirmationShown = await dialog.isVisible().catch(() => false);
  if (confirmationShown) {
    await dialog.getByRole("button", { name: "Сбросить", exact: true }).click();
  }
  await settle(page);
  return confirmationShown;
}

async function screenshotInitial(page, url, outputPath, viewport) {
  await page.setViewportSize(viewport);
  await loadClean(page, url);
  await page.screenshot({ path: outputPath, fullPage: true });
}

export async function runVersionScenarios({
  browser,
  name,
  url,
  outputDirectory,
}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8_000);
  await page.addInitScript(() => {
    const encodedSeed = new URLSearchParams(location.search).get(
      "comparisonSeed",
    );
    if (encodedSeed === null) return;
    const seed = JSON.parse(encodedSeed);
    localStorage.clear();
    Object.entries(seed).forEach(([key, value]) =>
      localStorage.setItem(key, value),
    );
  });
  const screenshots = {
    desktop: `${outputDirectory}/${name}-desktop.png`,
    mobile: `${outputDirectory}/${name}-mobile.png`,
  };

  await screenshotInitial(page, url, screenshots.desktop, {
    width: 1440,
    height: 1000,
  });
  await screenshotInitial(page, url, screenshots.mobile, {
    width: 390,
    height: 844,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });

  await loadClean(page, url);
  const initial = await captureState(page);

  await loadClean(page, url);
  await (await getTask(page, PRIMARY_TASK, "Админка")).check();
  await settle(page);
  await page.reload();
  await settle(page);
  const completionAfterReload = await captureState(page);

  await loadClean(page, url);
  await (await getTask(page, TABLE_TASK, "Таблицы")).check();
  await clickTablesFilter(page);
  const filteredProgress = await captureState(page);

  await loadClean(page, url);
  const completedTask = await getTask(page, PRIMARY_TASK, "Админка");
  await completedTask.check();
  await clickFocus(page);
  const focus = {
    ...(await captureState(page)),
    completedTaskVisible: await completedTask.isVisible().catch(() => false),
  };

  await loadClean(page, url);
  await selectPreset(page, "tests");
  const presetBeforeReload = await captureState(page);
  await page.reload();
  await settle(page);
  const presetAfterReload = await captureState(page);

  await loadClean(page, url);
  await (await getTask(page, PRIMARY_TASK, "Админка")).check();
  const presetConfirmationShown = await selectPreset(page, "tests");
  const protectedPresetSwitch = {
    confirmationShown: presetConfirmationShown,
    state: await captureState(page),
  };

  await loadClean(page, url, { dark: "true", notes: "сохранить" });
  await selectPreset(page, "tests");
  await (await getTask(page, PRIMARY_TASK, "Админка")).check();
  await clickTablesFilter(page);
  await clickClear(page);
  const clearMarks = {
    state: await captureState(page),
    undoAvailable: await page
      .getByRole("button", { name: "Вернуть" })
      .isVisible()
      .catch(() => false),
  };

  await loadClean(page, url, {
    dark: "true",
    notes: "сбросить",
    preset: "tests",
  });
  await (await getTask(page, PRIMARY_TASK, "Админка")).check();
  const resetConfirmationShown = await clickFullReset(page);
  const hardReset = {
    confirmationShown: resetConfirmationShown,
    state: await captureState(page),
  };

  await loadClean(page, url, {
    bgImage: "data:image/png;base64,AA==",
  });
  const legacyBackground = await captureState(page);

  await loadClean(page, url);
  const notesButton = page.locator(".notes-fab").first();
  await notesButton.click();
  await page.waitForTimeout(100);
  const textarea = page.locator("textarea").first();
  const notesKeyboard = {
    focusedOnOpen: await textarea.evaluate(
      (element) => document.activeElement === element,
    ),
  };
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  notesKeyboard.closedWithEscape = !(await textarea
    .isVisible()
    .catch(() => false));
  notesKeyboard.focusReturned = await notesButton.evaluate(
    (element) => document.activeElement === element,
  );

  await loadClean(page, url);
  const linkedTask = await getTask(page, PRIMARY_TASK, "Админка");
  const popupPromise = page
    .waitForEvent("popup", { timeout: 1_500 })
    .catch(() => null);
  await page.getByRole("link", { name: /Символы/ }).click();
  const popup = await popupPromise;
  await popup?.close();
  await delay(50);
  const taskLink = {
    toggledNeighbouringTask: await linkedTask.isChecked(),
  };

  await context.close();

  return {
    initial,
    completionAfterReload,
    filteredProgress,
    focus,
    presetPersistence: {
      beforeReload: presetBeforeReload,
      afterReload: presetAfterReload,
    },
    protectedPresetSwitch,
    clearMarks,
    hardReset,
    legacyBackground,
    notesKeyboard,
    taskLink,
    screenshots,
  };
}
