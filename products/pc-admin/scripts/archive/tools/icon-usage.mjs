import { logger } from '../../../utils/logger.mjs';
﻿import fs from "fs";
import path from "path";

const root = process.cwd();
const results = {
  btcSvg: new Map(),
  iconStrings: new Map(),
};

const IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  ".vitepress",
  ".turbo",
  ".cache",
  "build",
]);

function add(map, key, file) {
  if (!key) return;
  if (!map.has(key)) {
    map.set(key, new Set());
  }
  map.get(key).add(file);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(vue|ts|tsx|js|jsx)$/.test(entry.name)) continue;
    const rel = path.relative(root, full).replace(/\\/g, "/");
    const text = fs.readFileSync(full, "utf8");

    const svgRegex = /<btc-svg[^>]*name=["']([^"']+)["']/g;
    let match;
    while ((match = svgRegex.exec(text))) {
      add(results.btcSvg, match[1], rel);
    }

    const iconRegex = /icon\s*:\s*["']([^"'`]+)["']/g;
    while ((match = iconRegex.exec(text))) {
      add(results.iconStrings, match[1], rel);
    }

    const nameRegex = /name\s*:\s*["']([^"'`]+)["']/g;
    while ((match = nameRegex.exec(text))) {
      add(results.iconStrings, match[1], rel);
    }
  }
}

walk(path.join(root, "apps"));

const sortedBtc = Array.from(results.btcSvg.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([key, set]) => [key, Array.from(set).sort()]);

const sortedIconStrings = Array.from(results.iconStrings.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([key, set]) => [key, Array.from(set).sort()]);

logger.info("--- BtcSvg icons (" + sortedBtc.length + ") ---");
for (const [key, files] of sortedBtc) {
  logger.info(key + ": " + files.join(", "));
}

logger.info("\n--- icon string literals (may include non-icon names) ---");
for (const [key, files] of sortedIconStrings) {
  logger.info(key + ": " + files.join(", "));
}

const output = {
  btcSvg: Object.fromEntries(sortedBtc),
  iconStrings: Object.fromEntries(sortedIconStrings),
};
fs.writeFileSync("icon-usage.json", JSON.stringify(output, null, 2), "utf8");
logger.info("\nSaved icon-usage.json");
