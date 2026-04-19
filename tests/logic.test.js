import { describe, expect, test } from "vitest";
import { awardBadge, calculateScore, checkQuizAnswer } from "../src/utils/logic.js";

describe("logic", () => {
  test("score calculation", () => {
    expect(calculateScore(2, 4)).toBe(50);
  });

  test("badge awarding does not duplicate", () => {
    const state = { badges: ["a"] };
    expect(awardBadge(state, "a").badges).toEqual(["a"]);
    expect(awardBadge(state, "b").badges).toEqual(["a", "b"]);
  });

  test("quiz answer checks", () => {
    expect(checkQuizAnswer("True", "True")).toBe(true);
    expect(checkQuizAnswer("False", "True")).toBe(false);
  });
});
