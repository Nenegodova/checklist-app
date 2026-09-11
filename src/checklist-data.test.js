import { describe, expect, it } from "vitest";
import {
  FORMAT_GROUPS,
  PRESET_LABELS,
  getCategoryCount,
  getFormatCategory,
  getFormatType,
  getPresetLocation,
  getTypeCount,
  isUgcPreset,
} from "./checklist-data";

const regularType = getFormatType("regular");
const ugcType = getFormatType("ugc");
const allItems = FORMAT_GROUPS.flatMap(
  (type) => type.items ?? type.categories.flatMap((category) => category.items),
);

describe("format taxonomy", () => {
  it("contains every preset exactly once with the expected group counts", () => {
    const presetKeys = allItems.map((item) => item.preset);

    expect(presetKeys).toHaveLength(28);
    expect(new Set(presetKeys).size).toBe(28);
    expect([...presetKeys].sort()).toEqual(Object.keys(PRESET_LABELS).sort());
    expect(getTypeCount(regularType)).toBe(8);
    expect(getTypeCount(ugcType)).toBe(20);
    expect(ugcType.categories).toHaveLength(7);
    expect(ugcType.categories.map(getCategoryCount)).toEqual([
      1, 2, 3, 2, 6, 2, 4,
    ]);
  });

  it("locates regular and UGC presets without guessing from their labels", () => {
    expect(getPresetLocation("default")).toEqual({
      typeId: "regular",
      categoryId: null,
    });
    expect(getPresetLocation("ugc15")).toEqual({
      typeId: "ugc",
      categoryId: "question-answer",
    });
    expect(getFormatCategory("question-answer")?.label).toBe("Вопрос—ответ");
    expect(isUgcPreset("ugc15")).toBe(true);
    expect(isUgcPreset("tests")).toBe(false);
    expect(getPresetLocation("unknown")).toBeNull();
  });
});
