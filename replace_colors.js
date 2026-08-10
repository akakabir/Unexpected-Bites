const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src/components');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace background colors
  content = content.replace(/#180D08/g, 'var(--bg-base)');
  content = content.replace(/#26150D/g, 'var(--bg-surface)');
  content = content.replace(/#1C0F0A/g, 'var(--bg-surface-elevated)');
  
  // Replace text colors
  content = content.replace(/#FAF0E6/g, 'var(--text-primary)');
  content = content.replace(/#D1C2B4/g, 'var(--text-secondary)');
  content = content.replace(/#A39082/g, 'var(--text-muted)');
  
  // Replace amber accents
  content = content.replace(/amber-500/g, 'accent-main');
  content = content.replace(/amber-400/g, 'accent-light');
  content = content.replace(/amber-300/g, 'accent-lighter');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

fs.readdirSync(directoryPath).forEach(file => {
  if (file.endsWith('.tsx')) {
    replaceInFile(path.join(directoryPath, file));
  }
});
replaceInFile(path.join(__dirname, 'src/App.tsx'));
