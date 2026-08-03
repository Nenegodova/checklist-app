import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
});

beforeEach(() => {
  localStorage.clear();
});
