import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Copies diagnosis markdown assets into dist after `tsc` (tsc only emits .ts). */
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src", "diagnosis", "gap-detection-rubric.md");
const destDir = join(root, "dist", "diagnosis");
const dest = join(destDir, "gap-detection-rubric.md");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`Copied ${src} → ${dest}`);
