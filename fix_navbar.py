import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'bg-\[var\(--theme-bg\)\]', 'bg-theme-bg', content)
content = re.sub(r'bg-\[var\(--theme-surface\)\]-elevated/95', 'bg-theme-surface-elevated/95', content)
content = re.sub(r'bg-\[var\(--theme-surface\)\]-elevated', 'bg-theme-surface-elevated', content)
content = re.sub(r'bg-\[var\(--theme-surface\)\]', 'bg-theme-surface', content)
content = re.sub(r'text-\[var\(--theme-text\)\]', 'text-theme-text', content)
content = re.sub(r'text-\[var\(--theme-text-muted\)\]', 'text-theme-text-muted', content)
content = re.sub(r'border-\[var\(--theme-accent-500\)\]', 'border-theme-accent-500', content)
content = re.sub(r'border-l-\[var\(--theme-accent-500\)\]', 'border-l-theme-accent-500', content)
content = re.sub(r'text-\[var\(--theme-accent-400\)\]', 'text-theme-accent-400', content)
content = re.sub(r'bg-\[var\(--theme-surface-elevated\)\]', 'bg-theme-surface-elevated', content)
content = re.sub(r'bg-var\(--theme-bg-surface-elevated\)', 'bg-theme-surface-elevated', content)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
