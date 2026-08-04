export const readStorageJSON = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    // A malformed value is not recoverable; dropping only this key lets the app rebuild its defaults.
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage itself can be unavailable (for example in privacy mode), so fall back to memory state.
    }
    return null;
  }
};
