import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FormatModal from "./FormatModal";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("FormatModal", () => {
  it("focuses a requested preset, traps Tab navigation, and forwards selections", async () => {
    const onClose = vi.fn();
    const onSelectPreset = vi.fn();
    render(
      <FormatModal
        open
        preset="default"
        view={{ typeId: "regular", categoryId: null }}
        onViewChange={vi.fn()}
        onSelectPreset={onSelectPreset}
        onClose={onClose}
        focusPreset="tests"
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "Выбор формата" });
    const testsPreset = screen.getByRole("button", { name: "Формат: Тест" });
    await waitFor(() => expect(testsPreset).toHaveFocus());
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    const controls = [...dialog.querySelectorAll("button:not(:disabled)")];
    controls[0].focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(controls.at(-1)).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(controls[0]).toHaveFocus();

    fireEvent.click(testsPreset);
    expect(onSelectPreset).toHaveBeenCalledWith("tests", testsPreset, "modal");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.mouseDown(dialog.parentElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
