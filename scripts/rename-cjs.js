import { readdirSync, readFileSync, writeFileSync, renameSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dir = join(__dirname, "..", "dist", "cjs");
mkdirSync(dir, { recursive: true });

function walk(dirPath) {
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const full = join(dirPath, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".js")) {
      const newPath = full.replace(/\.js$/, ".cjs");
      const code = readFileSync(full, "utf8");
      writeFileSync(full, code, "utf8");
      renameSync(full, newPath);
    }
  }
}
walk(dir);
