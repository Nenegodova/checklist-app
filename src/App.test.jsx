import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { NOTES_TEMPLATE } from "./checklist-data";
import App from "./App";

afterEach(() => {
  cleanup();
  document.documentElement.className = "";
});

describe("checklist application", () => {
  it("persists a checked task and calculates progress from it", async () => {
    const user = userEvent.setup();
    const rendered = render(<App />);
    const checkbox = screen.getByRole("checkbox", { name: /мягкий перенос/i });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(
      screen.getByLabelText(/Общий прогресс: 1 из \d+/),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(localStorage.getItem("checklist")).toContain('"done":true'),
    );

    rendered.unmount();
    render(<App />);
    expect(
      screen.getByRole("checkbox", { name: /мягкий перенос/i }),
    ).toBeChecked();
  });

  it("makes a fully filtered category report 0/0 and shows the hidden count", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Таблицы", pressed: true }),
    );
    expect(
      screen.getByRole("button", { name: "Раздел Таблицы" }),
    ).toHaveTextContent("0/0");
    expect(screen.getByTestId("hidden-by-filters")).toHaveTextContent(
      "Скрыто фильтрами: 6",
    );
  });

  it("keeps notes and the selected theme through the appropriate resets", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Включить тёмную тему" }),
    );
    expect(document.documentElement).toHaveClass("dark");
    await user.click(screen.getByRole("button", { name: "Открыть заметки" }));
    const textarea = screen.getByRole("textbox", { name: "Заметки" });
    expect(textarea).toHaveFocus();
    await user.type(textarea, "note");
    await user.click(screen.getByRole("button", { name: "Снять отметки" }));
    expect(localStorage.getItem("notes")).toBe("note");
    await user.click(screen.getByRole("button", { name: "Полный RESET" }));
    expect(
      screen.getByRole("alertdialog", { name: "Сбросить чек-лист?" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Сбросить" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("dark")).toBe("true");
    expect(localStorage.getItem("notes")).toBe("");
  });

  it("protects a checklist with progress before changing format", async () => {
    const user = userEvent.setup();
    render(<App />);
    const checkbox = screen.getByRole("checkbox", { name: /мягкий перенос/i });
    const currentFormat = screen.getByRole("button", {
      name: "Формат: Обычный",
    });
    const candidateFormat = screen.getByRole("button", {
      name: "Формат: Тест",
    });
    await user.click(checkbox);

    await user.click(candidateFormat);
    expect(
      screen.getByRole("alertdialog", { name: "Сменить формат?" }),
    ).toBeInTheDocument();
    expect(currentFormat).toHaveAttribute("aria-pressed", "true");
    expect(candidateFormat).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: "Отмена" }));
    expect(checkbox).toBeChecked();
    await waitFor(() => expect(candidateFormat).toHaveFocus());

    await user.click(candidateFormat);
    await user.click(screen.getByRole("button", { name: "Сменить формат" }));
    expect(candidateFormat).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("checkbox", { name: /мягкий перенос/i }),
    ).not.toBeChecked();
  });

  it("resets content filters only after a format change is confirmed", async () => {
    const user = userEvent.setup();
    render(<App />);
    const filter = screen.getByRole("button", {
      name: "Таблицы",
      pressed: true,
    });
    const candidate = screen.getByRole("button", { name: "Формат: Тест" });

    const checkbox = screen.getByRole("checkbox", {
      name: /мягкий перенос/i,
    });

    await user.click(filter);
    await user.click(checkbox);
    expect(filter).toHaveAttribute("aria-pressed", "false");
    await user.click(candidate);
    expect(
      screen.getByRole("alertdialog", { name: "Сменить формат?" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Отмена" }));
    expect(filter).toHaveAttribute("aria-pressed", "false");

    await user.click(candidate);
    await user.click(screen.getByRole("button", { name: "Сменить формат" }));
    expect(
      screen.getByRole("button", { name: "Таблицы", pressed: true }),
    ).toBeInTheDocument();
  });

  it("collapses and reopens the desktop format control", async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggle = screen.getByRole("button", { name: "ФОРМАТ" });

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("button", { name: /Тип: Обычный, 8 форматов/i }),
    ).not.toBeInTheDocument();
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: /Тип: Обычный, 8 форматов/i }),
    ).toBeInTheDocument();
  });

  it("marks only UGC formats in the desktop header", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: /Тип: UGC, 20 форматов/i }),
    );
    await user.click(screen.getByRole("button", { name: "Формат: Базовый" }));

    expect(
      screen.getByRole("heading", { name: "Чек-лист проверки · Базовый" }),
    ).toBeInTheDocument();
    expect(document.querySelector(".format-type-badge")).toHaveTextContent(
      "UGC",
    );
    expect(screen.queryByText(/\(UGC\)/)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Тип: Обычный, 8 форматов/i }),
    );
    await user.click(screen.getByRole("button", { name: "Формат: Обычный" }));
    expect(
      document.querySelector(".format-type-badge"),
    ).not.toBeInTheDocument();
  });

  it("reopens the mobile format dialog on the same branch after cancellation", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("checkbox", { name: /мягкий перенос/i }));

    const trigger = screen.getByRole("button", {
      name: "Выбрать формат: Обычный",
      hidden: true,
    });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Выбор формата" });
    expect(document.body).toHaveStyle({ overflow: "hidden" });
    await user.click(
      within(dialog).getByRole("button", {
        name: /Тип: UGC, 20 форматов/i,
      }),
    );
    await user.click(
      within(dialog).getByRole("button", {
        name: /Рубрика Вопрос—ответ, 6 форматов/i,
      }),
    );
    await user.click(
      within(dialog).getByRole("button", {
        name: "Формат: Вопрос—ответ: Авто / Образование",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("alertdialog", { name: "Сменить формат?" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Отмена" }));

    const reopenedDialog = await screen.findByRole("dialog", {
      name: "Выбор формата",
    });
    expect(
      within(reopenedDialog).getByRole("button", {
        name: /Рубрика Вопрос—ответ, 6 форматов/i,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await waitFor(() =>
      expect(
        within(reopenedDialog).getByRole("button", {
          name: "Формат: Вопрос—ответ: Авто / Образование",
        }),
      ).toHaveFocus(),
    );

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("clears marks without touching filters, and undo restores only the marks", async () => {
    const user = userEvent.setup();
    render(<App />);
    const checkbox = screen.getByRole("checkbox", { name: /мягкий перенос/i });
    await user.click(checkbox);
    await user.click(
      screen.getByRole("button", { name: "Таблицы", pressed: true }),
    );
    await user.click(screen.getByRole("button", { name: "Снять отметки" }));
    expect(checkbox).not.toBeChecked();
    expect(
      screen.getByRole("button", { name: "Таблицы", pressed: false }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Вернуть" }));
    expect(checkbox).toBeChecked();
    expect(
      screen.getByRole("button", { name: "Таблицы", pressed: false }),
    ).toBeInTheDocument();
  });

  it("resets filters without touching marks, and undo restores only the filters", async () => {
    const user = userEvent.setup();
    render(<App />);
    const checkbox = screen.getByRole("checkbox", { name: /мягкий перенос/i });
    const resetFiltersButton = screen.getByRole("button", {
      name: "Сбросить фильтры",
    });
    expect(resetFiltersButton).toBeDisabled();

    await user.click(checkbox);
    await user.click(
      screen.getByRole("button", { name: "Таблицы", pressed: true }),
    );
    expect(resetFiltersButton).toBeEnabled();

    await user.click(resetFiltersButton);
    expect(
      screen.getByRole("button", { name: "Таблицы", pressed: true }),
    ).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    expect(resetFiltersButton).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Вернуть" }));
    expect(
      screen.getByRole("button", { name: "Таблицы", pressed: false }),
    ).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    expect(resetFiltersButton).toBeEnabled();
  });

  it("renders a link-only task as an accessible link that does not toggle the checkbox", async () => {
    const user = userEvent.setup();
    render(<App />);
    const taskLabel =
      "Пометка про иноагентов/экстремистов в инфоблоке оформлена корректно";
    const checkbox = screen.getByRole("checkbox", { name: taskLabel });
    const link = screen.getByRole("link", { name: new RegExp(taskLabel) });
    expect(link).toHaveClass("task-link-primary");
    // The arrow is decorative; screen readers should announce the label plus
    // "откроется в новой вкладке" without the arrow polluting the name.
    expect(link).toHaveTextContent("откроется в новой вкладке");
    expect(link.querySelector('[aria-hidden="true"]')).toHaveTextContent("↗");

    await user.click(link);
    expect(checkbox).not.toBeChecked();
  });

  it("migrates away legacy backgrounds without changing other saved values", async () => {
    localStorage.setItem("bgImage", "legacy-image");
    localStorage.setItem("notes", "keep me");
    const { unmount } = render(<App />);
    await waitFor(() => expect(localStorage.getItem("bgImage")).toBeNull());
    expect(localStorage.getItem("notes")).toBe("keep me");
    unmount();
  });

  it("edits notes with the template and closes the popover from the keyboard or outside", async () => {
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Открыть заметки" });

    await user.click(trigger);
    const textarea = screen.getByRole("textbox", { name: "Заметки" });
    expect(textarea).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Вставить шаблон" }));
    expect(textarea).toHaveValue(NOTES_TEMPLATE);
    await user.click(screen.getByRole("button", { name: "Очистить" }));
    expect(textarea).toHaveValue("");

    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("notes-popover")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(document.body);
    expect(screen.queryByTestId("notes-popover")).not.toBeInTheDocument();
  });

  it("offers recovery actions when focus mode hides a completed category", async () => {
    const user = userEvent.setup();
    render(<App />);

    const tableSection = document.getElementById("category-Таблицы");
    const tableCheckboxes = within(tableSection).getAllByRole("checkbox");
    for (const checkbox of tableCheckboxes) await user.click(checkbox);

    expect(
      screen.getByRole("button", { name: "Раздел Таблицы" }),
    ).toHaveTextContent("Готово");
    await user.click(screen.getAllByRole("switch")[0]);
    expect(
      screen.getByText("Все релевантные пункты выполнены"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Показать всё" }));
    expect(
      screen.queryByText("Все релевантные пункты выполнены"),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Снять отметки" }));
    expect(
      screen.getByRole("checkbox", { name: "У таблицы есть заголовок" }),
    ).not.toBeChecked();
  });
});
