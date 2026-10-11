import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  getTokenCss,
  getTokenVariables,
  parsePreferences,
} from "./system";

describe("design system preferences", () => {
  it("rejects unknown or inherited accent names and clamps the radius", () => {
    expect(
      parsePreferences({
        accent: "constructor",
        theme: "dark",
        density: "compact",
        radius: 999,
      }),
    ).toEqual({
      ...DEFAULT_PREFERENCES,
      theme: "dark",
      density: "compact",
      radius: 24,
    });
    expect(parsePreferences({ accent: "emerald", radius: -20 }).accent).toBe(
      "emerald",
    );
    expect(parsePreferences({ radius: -20 }).radius).toBe(6);
  });

  it("keeps the live CSS variables and copyable token snippet in sync", () => {
    const preferences = {
      ...DEFAULT_PREFERENCES,
      accent: "violet" as const,
      density: "compact" as const,
      radius: 20,
    };
    const variables = getTokenVariables(preferences);
    const snippet = getTokenCss(preferences);
    expect(variables["--ui-accent"]).toBe("#6945D9");
    expect(variables["--ui-radius"]).toBe("20px");
    expect(variables["--ui-space"]).toBe("0.78");
    expect(snippet).toContain("--ui-accent: #6945D9");
    expect(snippet).toContain("--ui-radius: 20px");
    expect(snippet).toContain("--ui-space: 0.78");
  });
});
