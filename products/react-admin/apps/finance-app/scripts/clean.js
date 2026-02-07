// Clean build artifacts
import { existsSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const paths = [
  'dist',
  'node_modules/.vite',
];

paths.forEach((path) => {
  const absolutePath = `${__dirname}/../${path}`;
  if (existsSync(absolutePath)) {
    rmSync(absolutePath, { recursive: true, force: true });
    console.log(`Removed: ${absolutePath}`);
  }
});
