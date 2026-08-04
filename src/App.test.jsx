import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
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
    const format = screen.getByRole("combobox", { name: "Формат" });
    await user.click(checkbox);

    await user.selectOptions(format, "tests");
    expect(
      screen.getByRole("alertdialog", { name: "Сменить формат?" }),
    ).toBeInTheDocument();
    expect(format).toHaveValue("default");
    await user.click(screen.getByRole("button", { name: "Отмена" }));
    expect(checkbox).toBeChecked();

    await user.selectOptions(format, "tests");
    await user.click(screen.getByRole("button", { name: "Сменить формат" }));
    expect(format).toHaveValue("tests");
    expect(
      screen.getByRole("checkbox", { name: /мягкий перенос/i }),
    ).not.toBeChecked();
  });

  it("undoes clear marks together with the previous filter state", async () => {
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
      screen.getByRole("button", { name: "Таблицы", pressed: true }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Вернуть" }));
    expect(checkbox).toBeChecked();
    expect(
      screen.getByRole("button", { name: "Таблицы", pressed: false }),
    ).toBeInTheDocument();
  });

  it("migrates away legacy backgrounds without changing other saved values", async () => {
    localStorage.setItem("bgImage", "legacy-image");
    localStorage.setItem("notes", "keep me");
    const { unmount } = render(<App />);
    await waitFor(() => expect(localStorage.getItem("bgImage")).toBeNull());
    expect(localStorage.getItem("notes")).toBe("keep me");
    unmount();
  });
});
