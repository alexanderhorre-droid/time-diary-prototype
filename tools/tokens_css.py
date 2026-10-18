import json, sys
t = json.load(open(sys.argv[1]))
def val(k, th): v = k['value']; return v if isinstance(v, str) else v.get(th, v['light'])
def block(th):
    out = [f"  --{k['name']}: {val(k, th)};" for k in t['color']['tokens']]
    out += [f"  --{k['name']}: {val(k, th)};" for k in t['shadow']['tokens']]
    return '\n'.join(out)
css = "/* Time Diary tokens — generated from tokens.json */\n"
css += ":root, [data-theme=\"light\"] {\n  color-scheme: light;\n" + block('light') + "\n}\n"
css += "@media (prefers-color-scheme: dark) {\n  :root:not([data-theme=\"light\"]) {\n  color-scheme: dark;\n" + block('dark') + "\n  }\n}\n"
css += "[data-theme=\"dark\"] {\n  color-scheme: dark;\n" + block('dark') + "\n}\n"
css += ":root {\n"
for fam in ('spacing', 'radius', 'size', 'zIndex'):
    css += '\n'.join(f"  --{k['name']}: {k['value']};" for k in t[fam]['tokens']) + '\n'
css += '\n'.join(f"  --font-{k}: {v};" for k, v in t['type']['families'].items()) + '\n}\n'
print(css)
