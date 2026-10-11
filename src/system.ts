export const ACCENTS = {
  cobalt: { label: "Cobalt", hex: "#365CF5", rgb: "54 92 245" },
  violet: { label: "Violet", hex: "#6945D9", rgb: "105 69 217" },
  coral: { label: "Coral", hex: "#B74B38", rgb: "183 75 56" },
  emerald: { label: "Emerald", hex: "#087D62", rgb: "8 125 98" },
  amber: { label: "Amber", hex: "#946200", rgb: "148 98 0" },
} as const;

export type Accent = keyof typeof ACCENTS;
export type Theme = "light" | "dark";
export type Density = "comfortable" | "compact";

export type Preferences = {
  accent: Accent;
  theme: Theme;
  density: Density;
  radius: number;
};

export const DEFAULT_PREFERENCES: Preferences = {
  accent: "cobalt",
  theme: "light",
  density: "comfortable",
  radius: 14,
};

export const STORAGE_KEY = "aperture-ui-lab.preferences.v1";

export function parsePreferences(value: unknown): Preferences {
  if (!value || typeof value !== "object") return DEFAULT_PREFERENCES;
  const raw = value as Partial<Preferences>;
  return {
    accent:
      raw.accent && Object.prototype.hasOwnProperty.call(ACCENTS, raw.accent)
        ? raw.accent
        : DEFAULT_PREFERENCES.accent,
    theme: raw.theme === "dark" ? "dark" : "light",
    density: raw.density === "compact" ? "compact" : "comfortable",
    radius:
      typeof raw.radius === "number" && Number.isFinite(raw.radius)
        ? Math.min(24, Math.max(6, Math.round(raw.radius)))
        : DEFAULT_PREFERENCES.radius,
  };
}

export function loadPreferences(): Preferences {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value
      ? parsePreferences(JSON.parse(value) as unknown)
      : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: Preferences): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // The playground still works when storage is unavailable.
  }
}

export function getTokenVariables(
  preferences: Preferences,
): Record<string, string> {
  return {
    "--ui-accent": ACCENTS[preferences.accent].hex,
    "--ui-accent-rgb": ACCENTS[preferences.accent].rgb,
    "--ui-radius": `${preferences.radius}px`,
    "--ui-space": preferences.density === "compact" ? "0.78" : "1",
  };
}

export function getTokenCss(preferences: Preferences): string {
  return `.preview-window {
  --ui-accent: ${ACCENTS[preferences.accent].hex};
  --ui-radius: ${preferences.radius}px;
  --ui-space: ${preferences.density === "compact" ? "0.78" : "1"};
  color-scheme: ${preferences.theme};
}`;
}
