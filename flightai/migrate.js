const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /var\(--color-cockpit-black\)/g, replacement: 'aervyn-bg-dark' },
  { regex: /var\(--color-instrument-grey\)/g, replacement: 'aervyn-border-subtle' }, // Or text-tertiary depending on context, but border-subtle is safe for borders. Let's use aervyn-text-secondary for text if we could.
  { regex: /text-\[var\(--color-instrument-grey\)\]/g, replacement: 'text-aervyn-text-secondary' },
  { regex: /border-\[var\(--color-instrument-grey\)\]/g, replacement: 'border-aervyn-border-subtle' },
  { regex: /bg-\[var\(--color-instrument-grey\)\]/g, replacement: 'bg-aervyn-border-subtle' },
  { regex: /var\(--color-instrument-white\)/g, replacement: 'aervyn-text-primary' },
  { regex: /text-\[var\(--color-instrument-white\)\]/g, replacement: 'text-aervyn-text-primary' },
  { regex: /border-\[var\(--color-instrument-white\)\]/g, replacement: 'border-aervyn-text-secondary' },
  { regex: /bg-\[var\(--color-instrument-white\)\]/g, replacement: 'bg-aervyn-text-primary' },
  { regex: /var\(--color-horizon-blue\)/g, replacement: 'aervyn-status-cyan' },
  { regex: /text-\[var\(--color-horizon-blue\)\]/g, replacement: 'text-aervyn-status-cyan' },
  { regex: /border-\[var\(--color-horizon-blue\)\]/g, replacement: 'border-aervyn-status-cyan' },
  { regex: /bg-\[var\(--color-horizon-blue\)\]/g, replacement: 'bg-aervyn-status-cyan' },
  { regex: /var\(--color-horizon-brown\)/g, replacement: 'aervyn-status-amber' },
  { regex: /var\(--color-warning-red\)/g, replacement: 'aervyn-status-red' },
  { regex: /var\(--color-warning-yellow\)/g, replacement: 'aervyn-status-amber' },
  { regex: /var\(--color-aervyn-bg-dark\)/g, replacement: 'aervyn-bg-dark' },
  { regex: /var\(--color-aervyn-panel-base\)/g, replacement: 'aervyn-panel-base' },
  { regex: /var\(--color-aervyn-border-subtle\)/g, replacement: 'aervyn-border-subtle' },
  { regex: /var\(--color-aervyn-text-primary\)/g, replacement: 'aervyn-text-primary' },
  { regex: /var\(--font-labels\)/g, replacement: 'labels' },
  { regex: /var\(--font-numerals\)/g, replacement: 'mono' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      for (const { regex, replacement } of replacements) {
        newContent = newContent.replace(regex, replacement);
      }
      
      // Additional cleanup for remaining specific [] syntax with aervyn variables
      newContent = newContent.replace(/bg-\[aervyn-/g, 'bg-aervyn-');
      newContent = newContent.replace(/text-\[aervyn-/g, 'text-aervyn-');
      newContent = newContent.replace(/border-\[aervyn-/g, 'border-aervyn-');
      newContent = newContent.replace(/from-\[aervyn-/g, 'from-aervyn-');
      newContent = newContent.replace(/to-\[aervyn-/g, 'to-aervyn-');
      
      // Cleanup for specific font replacements
      newContent = newContent.replace(/font-\[family-name:labels\]/g, 'font-labels');
      newContent = newContent.replace(/font-\[family-name:mono\]/g, 'font-mono');

      if (content !== newContent) {
        console.log('Updated:', fullPath);
        fs.writeFileSync(fullPath, newContent, 'utf8');
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
