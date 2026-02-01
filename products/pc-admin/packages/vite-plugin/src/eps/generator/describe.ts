import { writeFile, readFile } from '../utils';
import type { EpsState } from './state';
import { checkName, formatName } from './utils';
import { getEpsPath } from './data-loader';

export async function createDescribe(outputDir: string, state: EpsState): Promise<void> {
  const text = `
    // Entity interface definitions
    ${state.epsList.map((item) => {
      if (!checkName(item.name)) return '';

      let t = `interface ${formatName(item.name)} {`;

      const columns = [...(item.columns || []), ...(item.pageColumns || [])];
      columns.forEach((col) => {
        t += `
          /**
           * ${col.comment || col.propertyName}
           */
          ${col.propertyName}?: any;
        `;
      });

      t += `
        /**
         * Any key-value pairs
         */
        [key: string]: any;
      }
      `;

      return t;
    }).join('\n\n')}

    // Service interface definitions
    interface Service {
      request: (options: any) => Promise<any>;
      [key: string]: any;
    }
  `;

  const content = text.trim();
  const localContent = await readFile(getEpsPath(outputDir, 'eps.d.ts'));

  if (content !== localContent && state.epsList.length > 0) {
    writeFile(getEpsPath(outputDir, 'eps.d.ts'), content);
  }
}
