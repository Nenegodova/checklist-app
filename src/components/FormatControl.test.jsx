import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormatControl from "./FormatControl";

describe("FormatControl", () => {
  it("renders the active UGC rubric's formats immediately after that rubric", () => {
    render(
      <FormatControl
        preset="ugc"
        view={{ typeId: "ugc", categoryId: "question-answer" }}
        onViewChange={vi.fn()}
        onSelectPreset={vi.fn()}
      />,
    );

    const category = screen.getByRole("button", {
      name: /Рубрика Вопрос—ответ, 6 форматов/i,
    });
    const options = screen.getByRole("group", {
      name: "Форматы рубрики Вопрос—ответ",
    });
    const nextCategory = screen.getByRole("button", {
      name: /Рубрика Споры и лонги, 2 формата/i,
    });

    expect(category.parentElement?.nextElementSibling).toBe(
      nextCategory.parentElement,
    );
    expect(category.nextElementSibling).toBe(options);
    expect(options).toContainElement(
      screen.getByRole("button", { name: "Формат: Вопрос—ответ: Медицина" }),
    );
  });
});
