"""Makes the single-file version shown inside Claude (CSS and JS inlined, no document skeleton).
Usage: python3 tools/single_file.py BUILD_DIR/index.html OUT_FILE"""
import re, sys
src, out = sys.argv[1], sys.argv[2]
import os
d = os.path.dirname(os.path.abspath(src))
s = open(src).read()
head = s[s.index('<head>') + 6:s.index('</head>')]
body = s[s.index('<body>') + 6:s.index('</body>')]
head = re.sub(r'<meta charset[^>]*>\n?|<meta name="viewport"[^>]*>\n?|<link rel="icon"[^>]*>\n?', '', head)
head = head.replace('<title>Time Diary</title>', '<title>Time Diary Prototype</title>')
css = open(d + '/tokens.css').read() + '\n' + open(d + '/components.css').read()
head = re.sub(r'<link rel="stylesheet" href="tokens.css">\n<link rel="stylesheet" href="components.css">',
              lambda m: '<style>\n' + css + '\n</style>', head)
# The viewer already pads the page by the safe areas: the sticky bar sits below the top inset,
# and a fixed band paints the area above it.
head = head.replace('</style>\n</head>', '').rstrip()
head += '''
<style>
  .td-topbar { top: env(safe-area-inset-top, 0px); padding-top: 0; }
  .td-page__head { top: env(safe-area-inset-top, 0px); padding-top: var(--space-2); }
  body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 11; background: var(--bg); }
</style>
'''
js = open(d + '/app.js').read()
body = body.replace('<script src="app.js"></script>', lambda_js := '<script>\n' + js + '\n</script>') if False else body.replace('<script src="app.js"></script>', '<script>\n' + js + '\n</script>')
open(out, 'w').write(head.strip() + '\n' + body.strip() + '\n')
print('wrote', out)
