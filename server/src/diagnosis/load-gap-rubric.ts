import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));

/**
 * Loads the founder-editable gap checklist injected into the diagnosis system prompt.
 *
 * Edit point: `server/src/diagnosis/gap-detection-rubric.md`
 * (copied into `dist/diagnosis/` on `npm run build`).
 */
export function loadGapDetectionRubric(): string {
  const candidates = [
    join(MODULE_DIR, "gap-detection-rubric.md"),
    // Dev/tsx fallback when cwd differs, and dist→src fallback if copy was skipped
    join(MODULE_DIR, "..", "..", "src", "diagnosis", "gap-detection-rubric.md"),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      return readFileSync(path, "utf8").trim();
    }
  }

  throw new Error(
    "gap-detection-rubric.md not found — ensure it sits next to load-gap-rubric and is copied on build",
  );
}
