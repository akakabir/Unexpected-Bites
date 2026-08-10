const fs = require('fs');

let content = fs.readFileSync('src/index.css', 'utf8');

// Update :root (dark theme) accents to Orange
content = content.replace(/:root\s*\{[^}]*\}/s, function(match) {
  return match.replace(/--theme-accent-300:[^;]+;/, '--theme-accent-300: #FDBA74;')
              .replace(/--theme-accent-400:[^;]+;/, '--theme-accent-400: #FB923C;')
              .replace(/--theme-accent-500:[^;]+;/, '--theme-accent-500: #F97316;')
              .replace(/--theme-accent-600:[^;]+;/, '--theme-accent-600: #EA580C;');
});

// Remove unused themes
content = content.replace(/\[data-theme='emerald'\]\s*\{[^}]*\}\s*/g, '');
content = content.replace(/\[data-theme='topaz'\]\s*\{[^}]*\}\s*/g, '');
content = content.replace(/\[data-theme='sapphire'\]\s*\{[^}]*\}\s*/g, '');
content = content.replace(/\[data-theme='ruby'\]\s*\{[^}]*\}\s*/g, '');

fs.writeFileSync('src/index.css', content, 'utf8');
