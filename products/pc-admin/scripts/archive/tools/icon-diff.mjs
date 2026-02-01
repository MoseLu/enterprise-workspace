import { logger } from '../../../utils/logger.mjs';
﻿import fs from "fs";
import path from "path";

function collect(dir) {
  const icons = new Set();
  if (!fs.existsSync(dir)) return icons;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const sub of collect(full)) {
        icons.add(sub);
      }
    } else if (entry.isFile() && entry.name.endsWith(".svg")) {
      icons.add(entry.name);
    }
  }
  return icons;
}

const root = process.cwd();
const sharedDir = path.join(root, "packages/shared-components/src/assets/icons");
const mainDir = path.join(root, "apps/admin-app/src/assets/icons");
const logisticsDir = path.join(root, "apps/logistics-app/src/assets/icons");
const engineeringDir = path.join(root, "apps/engineering-app/src/assets/icons");
const qualityDir = path.join(root, "apps/quality-app/src/assets/icons");
const productionDir = path.join(root, "apps/production-app/src/assets/icons");

const shared = collect(sharedDir);
const main = collect(mainDir);
const logistics = collect(logisticsDir);
const engineering = collect(engineeringDir);
const quality = collect(qualityDir);
const production = collect(productionDir);

function diff(name, set) {
  const dup = [...set].filter((icon) => shared.has(icon)).sort();
  const unique = [...set].filter((icon) => !shared.has(icon)).sort();
  return { name, total: set.size, duplicates: dup, unique };
}

const reports = [
  diff("admin-app", main),
  diff("logistics-app", logistics),
  diff("engineering-app", engineering),
  diff("quality-app", quality),
  diff("production-app", production),
];

for (const report of reports) {
  logger.info(`\n=== ${report.name} ===`);
  logger.info(`total icons: ${report.total}`);
  logger.info(`duplicates in shared (${report.duplicates.length}): ${report.duplicates.join(', ')}`);
  logger.info(`unique (${report.unique.length}): ${report.unique.join(', ')}`);
}
