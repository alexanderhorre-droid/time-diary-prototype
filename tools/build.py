"""One command to rebuild everything from source.

    python3 tools/build.py

Reads   src/page.py, src/app.js, design-system/tokens.json, design-system/components/bundle.css
Writes  build/                       the plain page (for local work; not committed)
        index.html, app.js, *.css,   the installable web app at the repository root, which
        manifest, sw.js, icons       GitHub Pages serves (do not edit these by hand)
        dist/time-diary-prototype.html   the single-file version used inside Claude
"""
import os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B, T = os.path.join(ROOT, 'build'), os.path.join(ROOT, 'tools')
os.makedirs(B, exist_ok=True); os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
def run(*a, **k): subprocess.run([sys.executable, *a], check=True, cwd=ROOT, **k)
with open(os.path.join(B, 'tokens.css'), 'w') as f: run(os.path.join(T, 'tokens_css.py'), 'design-system/tokens.json', stdout=f)
shutil.copy(os.path.join(ROOT, 'design-system/components/bundle.css'), os.path.join(B, 'components.css'))
shutil.copy(os.path.join(ROOT, 'src/app.js'), os.path.join(B, 'app.js'))
run('src/page.py', os.path.join(B, 'index.html'))
run(os.path.join(T, 'pwa.py'), B, ROOT)
run(os.path.join(T, 'single_file.py'), os.path.join(B, 'index.html'), os.path.join(ROOT, 'dist/time-diary-prototype.html'))
print('Built build/, the site at the repository root, and dist/time-diary-prototype.html')
