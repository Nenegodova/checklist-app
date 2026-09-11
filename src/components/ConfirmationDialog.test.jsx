import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ConfirmationDialog from "./ConfirmationDialog";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("ConfirmationDialog", () => {
  it("keeps focus in the dialog and restores scrolling after unmount", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    document.body.style.overflow = "auto";
    const { unmount } = render(
      <ConfirmationDialog
        action={{ kind: "preset", value: "tests" }}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    const dialog = screen.getByRole("alertdialog", { name: "Сменить формат?" });
    const [cancel, confirm] = screen.getAllByRole("button");
    expect(cancel).toHaveFocus();
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(confirm).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(cancel).toHaveFocus();
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    unmount();
    expect(document.body).toHaveStyle({ overflow: "auto" });
  });

  it("renders reset-specific content and allows a backdrop cancellation", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmationDialog
        action={{ kind: "reset" }}
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("alertdialog", { name: "Сбросить чек-лист?" }),
    ).toHaveTextContent("Выбранная тема сохранится");
    fireEvent.mouseDown(screen.getByRole("alertdialog").parentElement);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
