import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const fullPath = path.join(dir, f.name);
    if (f.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = getAllFiles(srcDir);

// Collect all text from all files to check imports / references
const fileContents = allFiles.map(f => ({
  filePath: f,
  relativeSrc: path.relative(srcDir, f).replace(/\\/g, '/'),
  content: fs.readFileSync(f, 'utf8')
}));

console.log(`Total files in src: ${allFiles.length}`);

// Next.js App router special entrypoints (pages, layouts, route handlers, error, loading, not-found)
const isAppRouterEntry = (relPath: string) => {
  if (!relPath.startsWith('app/')) return false;
  const base = path.basename(relPath);
  return [
    'page.tsx', 'page.ts', 'page.jsx', 'page.js',
    'layout.tsx', 'layout.ts', 'layout.jsx', 'layout.js',
    'route.ts', 'route.js',
    'loading.tsx', 'error.tsx', 'not-found.tsx', 'global-error.tsx',
    'template.tsx', 'default.tsx'
  ].includes(base);
};

// Check which non-entrypoint files are never imported anywhere
const unusedCandidates: string[] = [];

fileContents.forEach(target => {
  const rel = target.relativeSrc;
  
  // Skip entrypoints
  if (isAppRouterEntry(rel)) return;
  if (rel === 'middleware.ts') return;
  if (rel.endsWith('.d.ts')) return;
  if (rel.endsWith('.bak') || rel.endsWith('.new')) return;

  const baseWithoutExt = path.basename(rel, path.extname(rel));
  const dirName = path.dirname(rel);
  
  // Potential import patterns:
  // @/components/...
  // @/lib/...
  // ./filename
  // ../filename
  const searchPattern1 = `@/${rel.replace(/\.(tsx?|jsx?|json)$/, '')}`;
  const searchPattern2 = `./${baseWithoutExt}`;
  const searchPattern3 = `/${baseWithoutExt}`;
  const baseName = path.basename(rel);

  let isImported = false;

  for (const file of fileContents) {
    if (file.filePath === target.filePath) continue;
    
    if (
      file.content.includes(searchPattern1) ||
      file.content.includes(baseWithoutExt) ||
      file.content.includes(baseName)
    ) {
      isImported = true;
      break;
    }
  }

  if (!isImported) {
    unusedCandidates.push(rel);
  }
});

console.log('\n=== Potentially Unused Files in src ===');
if (unusedCandidates.length === 0) {
  console.log('No completely unreferenced files found in src.');
} else {
  unusedCandidates.forEach(f => console.log(' - src/' + f));
}
