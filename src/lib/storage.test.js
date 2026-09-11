import { describe, expect, it } from "vitest";
import { readStorageJSON } from "./storage";

describe("readStorageJSON", () => {
  it("returns parsed values and null for missing values", () => {
    localStorage.setItem("preferences", '{"compact":true}');

    expect(readStorageJSON("preferences")).toEqual({ compact: true });
    expect(readStorageJSON("missing")).toBeNull();
  });

  it("drops malformed values so future app starts can rebuild defaults", () => {
    localStorage.setItem("preferences", "not-json");

    expect(readStorageJSON("preferences")).toBeNull();
    expect(localStorage.getItem("preferences")).toBeNull();
  });
});
