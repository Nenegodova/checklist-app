import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import {
  exportSnapshot,
  getAvailablePort,
  resolveRef,
  startVite,
  stopServer,
  waitForServer,
} from "./runtime.mjs";
import { runVersionScenarios } from "./scenarios.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const outputDirectory = path.join(
  repositoryRoot,
  "output/playwright/redesign-comparison",
);
const temporaryRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), "checklist-redesign-comparison-"),
);

const refs = {
  before: process.env.REDESIGN_BEFORE_REF || "73fc447",
  redesign: process.env.REDESIGN_FINISHED_REF || "58daf90",
  current: "HEAD",
};

function loadDataContract(root) {
  const dataFile = path.join(root, "src/checklist-data.js");
  const source = fs.readFileSync(
    fs.existsSync(dataFile) ? dataFile : path.join(root, "src/App.jsx"),
    "utf8",
  );
  const start = source.indexOf(
    source.includes("export const DATA_VERSION")
      ? "export const DATA_VERSION"
      : "const DATA_VERSION",
  );
  const end = source.includes("// --- Helpers ---")
    ? source.indexOf("// --- Helpers ---")
    : source.indexOf("export const PRESET_LABELS");
  if (start < 0 || end < 0) {
    throw new Error(`Cannot extract checklist data contract from ${root}`);
  }
  const code = source.slice(start, end).replaceAll("export const ", "const ");
  return Function(
    `${code}; return {
      DATA_VERSION,
      NOTES_TEMPLATE,
      METHODICHKA_URL,
      CONTENT_FILTERS,
      PRESETS,
      PRESET_EXCLUDES,
      DATA,
    };`,
  )();
}

function conciseState(state) {
  const progress = state.progress
    ? `${state.progress.done}/${state.progress.total}`
    : "—";
  return `${state.preset}; ${progress}; задач ${state.totalTasks}; видно ${state.visibleCheckboxes.length}`;
}

function scenarioRows(results) {
  const columns = ["before", "redesign", "current"];
  const describe = {
    initial: (value) => conciseState(value),
    completionAfterReload: (value) =>
      `после reload выполнено ${value.doneTasks.length}`,
    filteredProgress: (value) =>
      `прогресс ${value.progress?.done ?? "—"}/${value.progress?.total ?? "—"}; видно ${value.visibleCheckboxes.length}`,
    focus: (value) =>
      `выполненный пункт ${value.completedTaskVisible ? "виден" : "скрыт"}; прогресс ${value.progress?.done ?? "—"}/${value.progress?.total ?? "—"}`,
    presetPersistence: (value) =>
      `${value.beforeReload.preset} → reload → ${value.afterReload.preset}`,
    protectedPresetSwitch: (value) =>
      `confirm: ${value.confirmationShown ? "да" : "нет"}; выполнено ${value.state.doneTasks.length}`,
    clearMarks: (value) =>
      `undo: ${value.undoAvailable ? "да" : "нет"}; выполнено ${value.state.doneTasks.length}; фильтры ${value.state.allFiltersEnabled ? "включены" : "изменены"}`,
    hardReset: (value) =>
      `confirm: ${value.confirmationShown ? "да" : "нет"}; тема ${value.state.dark ? "тёмная" : "светлая"}; Прочее ${value.state.hasMisc ? "есть" : "нет"}`,
    legacyBackground: (value) =>
      value.bgImagePresent ? "фон сохранён" : "фон удалён",
    notesKeyboard: (value) =>
      `фокус ${value.focusedOnOpen ? "да" : "нет"}; Escape ${value.closedWithEscape ? "закрывает" : "не закрывает"}`,
    taskLink: (value) =>
      value.toggledNeighbouringTask
        ? "ссылка меняет checkbox"
        : "checkbox не меняется",
  };
  const classification = {
    initial: "Контент сохранён, начальное раскрытие изменено",
    completionAfterReload: "Сохранено",
    filteredProgress: "Намеренно исправлен расчёт",
    focus: "Сохранено",
    presetPersistence: "Добавлено сохранение формата",
    protectedPresetSwitch: "Защита от потери данных",
    clearMarks: "Добавлен Undo",
    hardReset: "Тема сохраняется, добавлен confirm",
    legacyBackground: "Функция намеренно удалена",
    notesKeyboard: "Улучшена доступность",
    taskLink: "Поведение ссылки сохранено",
  };

  return Object.keys(describe).map((scenario) => ({
    scenario,
    values: Object.fromEntries(
      columns.map((column) => [
        column,
        describe[scenario](results[column][scenario]),
      ]),
    ),
    classification: classification[scenario],
  }));
}

function buildReport({ resolvedRefs, results, dataEqual, failures }) {
  const rows = scenarioRows(results)
    .map(
      ({ scenario, values, classification }) =>
        `| ${scenario} | ${values.before} | ${values.redesign} | ${values.current} | ${classification} |`,
    )
    .join("\n");
  const status = failures.length
    ? failures.map((failure) => `- ❌ ${failure}`).join("\n")
    : "- ✅ Все обязательные инварианты выполнены";

  return `# Сравнение поведения до и после редизайна

Сгенерировано: ${new Date().toISOString()}

## Версии

- До редизайна: \`${resolvedRefs.before.slice(0, 8)}\`
- Завершённый редизайн: \`${resolvedRefs.redesign.slice(0, 8)}\`
- Текущая версия: \`${resolvedRefs.current.slice(0, 8)}\`

Данные чек-листа (DATA, PRESETS, исключения и фильтры): ${dataEqual ? "совпадают" : "различаются"}.

## Результат теста

${status}

## Поведенческая матрица

| Сценарий | До редизайна | После редизайна | Сейчас | Оценка |
| --- | --- | --- | --- | --- |
${rows}

## Артефакты

В этой папке находятся полный \`results.json\` и desktop/mobile-скриншоты каждой версии.
Исторические версии запускаются на текущем dependency runtime, поэтому сравнение отражает
изменения приложения, а не различия инструментов сборки.
`;
}

function validateCurrentContract(current) {
  assert.equal(
    current.completionAfterReload.doneTasks.length,
    1,
    "checked task must survive reload",
  );
  assert.equal(
    current.filteredProgress.progress.total < current.initial.progress.total,
    true,
    "filtered tasks must leave the progress denominator",
  );
  assert.equal(
    current.focus.completedTaskVisible,
    false,
    "focus mode must hide completed tasks",
  );
  assert.equal(
    current.presetPersistence.afterReload.preset,
    "tests",
    "selected preset must survive reload",
  );
  assert.equal(
    current.protectedPresetSwitch.confirmationShown,
    true,
    "changing a checklist with progress must ask for confirmation",
  );
  assert.equal(
    current.protectedPresetSwitch.state.doneTasks.length,
    0,
    "confirmed preset change must clear completion",
  );
  assert.equal(
    current.clearMarks.state.allFiltersEnabled,
    true,
    "clear marks must enable every filter",
  );
  assert.equal(
    current.clearMarks.undoAvailable,
    true,
    "clear marks must offer undo",
  );
  assert.equal(
    current.hardReset.state.dark,
    true,
    "full reset must preserve the selected theme",
  );
  assert.equal(
    current.hardReset.state.hasMisc,
    false,
    "default format after full reset must not contain Misc",
  );
  assert.equal(
    current.legacyBackground.bgImagePresent,
    false,
    "legacy background must be migrated away",
  );
  assert.deepEqual(
    current.notesKeyboard,
    {
      focusedOnOpen: true,
      closedWithEscape: true,
      focusReturned: true,
    },
    "notes must implement the documented keyboard flow",
  );
  assert.equal(
    current.taskLink.toggledNeighbouringTask,
    false,
    "task links must not toggle their checkbox",
  );
}

function withoutScreenshots(result) {
  const { screenshots: _screenshots, ...comparable } = result;
  return comparable;
}

function validateHistoricalDelta(before, current) {
  assert.equal(
    before.initial.totalTasks,
    current.initial.totalTasks,
    "redesign must preserve the default checklist size",
  );
  assert.equal(
    before.completionAfterReload.doneTasks.length,
    1,
    "legacy completion persistence is part of the preserved contract",
  );
  assert.equal(
    before.filteredProgress.progress.total,
    before.initial.progress.total,
    "legacy progress is expected to include filtered tasks",
  );
  assert.equal(
    before.presetPersistence.afterReload.preset,
    "default",
    "legacy preset is expected to reset after reload",
  );
  assert.equal(
    before.protectedPresetSwitch.confirmationShown,
    false,
    "legacy preset change is expected to have no confirmation",
  );
  assert.equal(
    before.protectedPresetSwitch.state.doneTasks.length,
    1,
    "legacy preset change is expected to preserve matching completion",
  );
  assert.equal(
    before.clearMarks.undoAvailable,
    false,
    "legacy clear marks is expected to have no undo",
  );
  assert.equal(
    before.hardReset.confirmationShown,
    false,
    "legacy full reset is expected to have no confirmation",
  );
  assert.equal(
    before.hardReset.state.dark,
    false,
    "legacy full reset is expected to reset the theme",
  );
  assert.equal(
    before.legacyBackground.bgImagePresent,
    true,
    "legacy version is expected to retain the custom background",
  );
  assert.equal(
    before.notesKeyboard.focusedOnOpen,
    false,
    "legacy notes are expected not to move keyboard focus",
  );
  assert.equal(
    before.notesKeyboard.closedWithEscape,
    false,
    "legacy notes are expected not to close with Escape",
  );
  assert.equal(
    before.taskLink.toggledNeighbouringTask,
    false,
    "task links must remain non-destructive across the redesign",
  );
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });
const servers = [];
let browser;
const failures = [];

try {
  const resolvedRefs = Object.fromEntries(
    Object.entries(refs).map(([name, ref]) => [
      name,
      resolveRef(repositoryRoot, ref),
    ]),
  );
  const roots = {
    before: exportSnapshot(
      repositoryRoot,
      temporaryRoot,
      "before",
      resolvedRefs.before,
    ),
    redesign: exportSnapshot(
      repositoryRoot,
      temporaryRoot,
      "redesign",
      resolvedRefs.redesign,
    ),
    current: repositoryRoot,
  };

  const dataContracts = Object.fromEntries(
    Object.entries(roots).map(([name, root]) => [name, loadDataContract(root)]),
  );
  const serializedData = Object.fromEntries(
    Object.entries(dataContracts).map(([name, value]) => [
      name,
      JSON.stringify(value),
    ]),
  );
  const dataEqual =
    serializedData.before === serializedData.redesign &&
    serializedData.redesign === serializedData.current;

  const versions = [];
  for (const name of ["before", "redesign", "current"]) {
    const port = await getAvailablePort();
    const server = startVite(roots[name], port);
    servers.push(server);
    const url = `http://127.0.0.1:${port}`;
    await waitForServer(url, server);
    versions.push({ name, url });
  }

  browser = await chromium.launch();
  const results = {};
  for (const version of versions) {
    process.stdout.write(`Сравниваю ${version.name}…\n`);
    results[version.name] = await runVersionScenarios({
      browser,
      ...version,
      outputDirectory,
    });
  }

  try {
    assert.equal(dataEqual, true, "checklist data contract changed");
  } catch (error) {
    failures.push(error.message);
  }
  try {
    validateCurrentContract(results.current);
  } catch (error) {
    failures.push(error.message);
  }
  try {
    assert.deepEqual(
      withoutScreenshots(results.current),
      withoutScreenshots(results.redesign),
      "current behavior drifted from the completed redesign",
    );
  } catch (error) {
    failures.push(error.message);
  }
  try {
    validateHistoricalDelta(results.before, results.current);
  } catch (error) {
    failures.push(error.message);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    refs: resolvedRefs,
    dataEqual,
    failures,
    results,
  };
  fs.writeFileSync(
    path.join(outputDirectory, "results.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(outputDirectory, "REPORT.md"),
    buildReport({ resolvedRefs, results, dataEqual, failures }),
  );

  if (failures.length) {
    process.stderr.write(
      `Comparison failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}\n`,
    );
    process.exitCode = 1;
  } else {
    process.stdout.write(
      `Comparison passed. Report: ${path.join(outputDirectory, "REPORT.md")}\n`,
    );
  }
} finally {
  await browser?.close();
  await Promise.all(servers.map(stopServer));
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
