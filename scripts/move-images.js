#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const publicImagesDir = path.join(root, 'public', 'images');
const EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

function isImageFile(name) {
  return EXTS.includes(path.extname(name).toLowerCase());
}

function walk(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (full.includes(path.join('node_modules')) || full.includes(path.join('dist'))) continue;
    if (full.includes(path.join('public', 'images'))) continue; // skip destination
    if (e.isDirectory()) {
      results.push(...walk(full));
    } else {
      if (isImageFile(e.name)) results.push(full);
    }
  }
  return results;
}

function uniqueName(destDir, name) {
  let dest = path.join(destDir, name);
  if (!fs.existsSync(dest)) return name;
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  let i = 1;
  while (fs.existsSync(path.join(destDir, `${base}-${i}${ext}`))) i++;
  return `${base}-${i}${ext}`;
}

function collectFilesToEdit(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (full.includes(path.join('node_modules')) || full.includes(path.join('dist'))) continue;
    if (e.isDirectory()) {
      out.push(...collectFilesToEdit(full));
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (['.js', '.jsx', '.json', '.md', '.csv', '.html'].includes(ext)) out.push(full);
    }
  }
  return out;
}

function replaceAllMappingsInFile(filePath, mapping) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const { oldBasename, newBasename } of mapping) {
    const patterns = [
      new RegExp(oldBasename, 'g'),
      new RegExp(`/images/${oldBasename.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'g'),
      new RegExp(`\\.\./public/images/${oldBasename.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'g')
    ];
    for (const p of patterns) {
      if (p.test(content)) {
        content = content.replace(p, (match) => {
          // If the match already contains newBasename, keep it
          if (match.includes(newBasename)) return match;
          changed = true;
          return match.startsWith('/') ? `/images/${newBasename}` : `/images/${newBasename}`;
        });
      }
    }
  }
  if (changed) fs.writeFileSync(filePath, content, 'utf8');
  return changed;
}

(async function main() {
  try {
    fs.mkdirSync(publicImagesDir, { recursive: true });

    const imageFiles = walk(root);

    // Filter out images that are already inside public/images (walk excludes them), and also skip node_modules/dist
    const toMove = imageFiles.filter(p => !p.includes(path.join('public', 'images')));

    const mapping = []; // {src, dest, oldBasename, newBasename}

    for (const src of toMove) {
      const name = path.basename(src);
      const newName = uniqueName(publicImagesDir, name);
      const dest = path.join(publicImagesDir, newName);
      // ensure dest dir exists
      fs.renameSync(src, dest);
      mapping.push({ src, dest, oldBasename: name, newBasename: newName });
      console.log(`Moved: ${src} -> ${dest}`);
    }

    // write mapping file
    fs.writeFileSync(path.join(root, 'scripts', 'moved-images.json'), JSON.stringify(mapping, null, 2));

    // Update references in project files
    const filesToEdit = collectFilesToEdit(root);
    const changedFiles = [];
    for (const f of filesToEdit) {
      const changed = replaceAllMappingsInFile(f, mapping);
      if (changed) changedFiles.push(f);
    }

    console.log('Updated references in files:', changedFiles);

    // remove now-empty image directories under data/imports/*/images
    const importsDir = path.join(root, 'data', 'imports');
    if (fs.existsSync(importsDir)) {
      const entries = fs.readdirSync(importsDir, { withFileTypes: true });
      for (const e of entries) {
        if (e.isDirectory()) {
          const imgDir = path.join(importsDir, e.name, 'images');
          try {
            if (fs.existsSync(imgDir)) {
              const files = fs.readdirSync(imgDir);
              if (files.length === 0) {
                fs.rmdirSync(imgDir);
                console.log('Removed empty dir:', imgDir);
              }
            }
          } catch (err) {
            // ignore
          }
        }
      }
    }

    console.log('Done. Mapping saved to scripts/moved-images.json');
    console.log('Please review changed files, then commit the changes.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
