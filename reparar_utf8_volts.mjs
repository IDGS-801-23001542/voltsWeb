import { readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'src');

const validExtensions = new Set([
  '.html',
  '.ts',
  '.css',
  '.json'
]);

const suspicious = /(?:Ã|Â|â|ðŸ|ï¿½|�)/g;

const utf8 = new TextDecoder('utf-8', {
  fatal: true
});

const windows1252 = new Map([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f]
]);

function suspiciousCount(value) {
  return (value.match(suspicious) ?? []).length;
}

function encodeWindows1252(value) {
  const bytes = [];

  for (const character of value) {
    const codePoint = character.codePointAt(0);

    if (codePoint <= 0xff) {
      bytes.push(codePoint);
      continue;
    }

    const mapped = windows1252.get(codePoint);

    if (mapped === undefined) {
      throw new Error(
        'La línea contiene caracteres que no pertenecen a Windows-1252.'
      );
    }

    bytes.push(mapped);
  }

  return Uint8Array.from(bytes);
}

function repairLine(line) {
  let current = line;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (suspiciousCount(current) === 0) {
      break;
    }

    try {
      const candidate = utf8.decode(
        encodeWindows1252(current)
      );

      if (
        suspiciousCount(candidate) >=
        suspiciousCount(current)
      ) {
        break;
      }

      current = candidate;
    } catch {
      break;
    }
  }

  const knownReplacements = new Map([
    ['COTIZACIï¿½N', 'COTIZACIÓN'],
    ['Cotizaciï¿½n', 'Cotización'],
    ['cotizaciï¿½n', 'cotización'],
    ['envï¿½a', 'envía'],
    ['Envï¿½o', 'Envío'],
    ['envï¿½o', 'envío'],
    ['podrï¿½', 'podrá'],
    ['informaciï¿½n', 'información'],
    ['opciï¿½n', 'opción'],
    ['selecciï¿½n', 'selección'],
    ['nï¿½mero', 'número'],
    ['ï¿½Cï¿½mo', '¿Cómo'],
    ['Recï¿½belo', 'Recíbelo'],
    ['ï¿½rmalo', 'Ármalo'],
    ['tï¿½', 'tú'],
    ['sesiï¿½n', 'sesión'],
    ['ï¿½XITO', 'ÉXITO'],
    ['ï¿½', '×']
  ]);

  for (const [damaged, correct] of knownReplacements) {
    current = current.replaceAll(damaged, correct);
  }

  return current;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, {
    withFileTypes: true
  });

  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
      continue;
    }

    if (
      validExtensions.has(
        extname(entry.name).toLowerCase()
      )
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = await collectFiles(root);

let changedFiles = 0;
let remainingFiles = 0;

for (const file of files) {
  const original = await readFile(file, 'utf8');

  if (suspiciousCount(original) === 0) {
    continue;
  }

  const repaired = original
    .split(/(\r?\n)/)
    .map(part => {
      if (part === '\n' || part === '\r\n') {
        return part;
      }

      return repairLine(part);
    })
    .join('');

  if (repaired !== original) {
    await writeFile(file, repaired, 'utf8');
    changedFiles += 1;

    console.log(`CORREGIDO: ${file}`);
  }

  if (suspiciousCount(repaired) > 0) {
    remainingFiles += 1;

    console.warn(`REVISAR: ${file}`);
  }
}

console.log('');
console.log(`Archivos corregidos: ${changedFiles}`);
console.log(`Archivos pendientes: ${remainingFiles}`);

if (remainingFiles > 0) {
  process.exitCode = 1;
}
