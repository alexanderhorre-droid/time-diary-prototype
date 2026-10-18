"""Turns the built page in BUILD_DIR into the installable web app in OUT_DIR (the repository root, served by
GitHub Pages): adds the manifest, the offline helper (sw.js), icons, and cache-busting on the CSS and JS links.
Usage: python3 tools/pwa.py BUILD_DIR OUT_DIR"""
import os, shutil, sys, hashlib
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
for f in ['tokens.css', 'components.css', 'app.js']: shutil.copy(f'{src}/{f}', f'{out}/{f}')
html = open(f'{src}/index.html').read()
head = '''<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Time Diary">
<meta name="apple-mobile-web-app-status-bar-style" content="default">'''
assert '<link rel="icon" href="data:,">' in html
html = html.replace('<link rel="icon" href="data:,">', head)
reg = '''<script>if ('serviceWorker' in navigator && isSecureContext) addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });</script>
</body>'''
html = html.replace('</body>', reg, 1)
import hashlib as _h
_v = _h.sha1(b''.join(open(f'{src}/{f}', 'rb').read() for f in ['tokens.css', 'components.css', 'app.js'])).hexdigest()[:8]
for f in ['tokens.css', 'components.css', 'app.js']:
    html = html.replace(f'"{f}"', f'"{f}?v={_v}"')
open(f'{out}/index.html', 'w').write(html)
open(f'{out}/manifest.webmanifest', 'w').write('''{
  "name": "Time Diary",
  "short_name": "Time Diary",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ffffff",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
''')
# Icon: black square, three white blocks like activities on a timeline (stays inside the maskable safe zone)
def icon(n, path):
    im = Image.new('RGB', (n, n), '#0a0a0a'); d = ImageDraw.Draw(im); u = n / 512
    d.rounded_rectangle([156*u, 140*u, 196*u, 372*u], radius=20*u, fill='#ffffff')          # hour rail
    for y, w in [(140, 200), (232, 140), (316, 180)]:
        d.rounded_rectangle([220*u, y*u, (220 + w)*u, (y + 56)*u], radius=14*u, fill='#ffffff')
    im.save(path)
icon(192, f'{out}/icon-192.png'); icon(512, f'{out}/icon-512.png'); icon(180, f'{out}/apple-touch-icon.png')
files = ['./', 'index.html', 'tokens.css', 'components.css', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']
ver = hashlib.sha1(b''.join(open(f'{out}/{f}', 'rb').read() for f in files[1:])).hexdigest()[:10]
open(f'{out}/sw.js', 'w').write('''/* Offline: keep the app on the phone; network first so updates show, cache when there is no signal. */
var CACHE = 'time-diary-%s', FILES = %s;
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then(function (r) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); return r; })
    .catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || caches.match('index.html'); }); }));
});
''' % (ver, repr(files).replace("'", '"')))
open(f'{out}/.nojekyll', 'w').write('')
print('built', out, ver)
