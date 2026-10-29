#!/usr/bin/env python3
"""Turn a Figma frame's get_design_context output (React + Tailwind) into a static HTML fragment
plus scoped CSS that drops into a HyperFrames composition. Built on the Audience Segment launch
film (October 2026), where hand-redrawn phone screens kept drifting from the design.

Usage:
  python3 figma2html.py <design_context.json|.txt> <project> <name> [--edits edits.json]
      [--node-modules DIR] [--scope .figma-<name>]

  <design_context>: the file the Figma MCP's get_design_context saved (JSON array of {type,text}),
                    or the plain code text.
  <project>:        the HyperFrames project folder. Assets go to <project>/assets/figma/<name>/.
  <name>:           short name for this frame, e.g. bundle-page.
  --edits:          JSON {"replace": [[old, new], ...], "remove": ["1850:14657", ...],
                          "pin_bottom": "1850:14628",
                          "style": {"1850:14636": "justify-content:center;width:100%"}}
                    text swaps (numbers, copy), Figma node ids to delete, one node to lift out
                    and pin to the bottom of the screen (a sticky bar), and inline styles to add
                    to nodes (re-centre a row after removing items from it).
  --font:           "Family=assets/fonts/File.ttf": the real font the design uses (Figma names it
                    'Roboto:Medium'); every Figma font name is mapped to it.
  --node-modules:   a node_modules with react, react-dom, esbuild and tailwindcss v3
                    (default: ~/Projects/upnova/upez-frontend/node_modules).

Writes /tmp/figma2html-<name>/: fragment.html, fragment.css (scoped under the scope class),
preview.html (open it, or screenshot it with Chrome headless, to compare with Figma).
"""
import json, os, re, subprocess, sys, argparse

ap = argparse.ArgumentParser()
ap.add_argument("ctx"); ap.add_argument("project"); ap.add_argument("name")
ap.add_argument("--edits"); ap.add_argument("--scope"); ap.add_argument("--font")
ap.add_argument("--node-modules", default=os.path.expanduser("~/Projects/upnova/upez-frontend/node_modules"))
a = ap.parse_args()
scope = a.scope or ".figma-" + a.name
work = f"/tmp/figma2html-{a.name}"; os.makedirs(work, exist_ok=True)
nm = a.node_modules

raw = open(a.ctx).read()
try:
    code = "\n".join(x.get("text", "") for x in json.loads(raw))
except Exception:
    code = raw
code = code.split("SUPER CRITICAL")[0]                     # drop the advice text after the code

# 1. assets: download every asset the code names into the project, point the code at them
m = re.search(r'const assetPathPrefix = "([^"]+)"', code)
rel = f"assets/figma/{a.name}"
os.makedirs(os.path.join(a.project, rel), exist_ok=True)
if m:
    prefix = m.group(1)
    for f in sorted(set(re.findall(r"\$\{assetPathPrefix\}/([\w.-]+)", code))):
        dst = os.path.join(a.project, rel, f)
        if not os.path.exists(dst):
            subprocess.run(["curl", "-sfL", "-o", dst, f"{prefix}/{f}"], check=True)  # curl: python certs fail on some Macs
    code = code.replace(m.group(0), f'const assetPathPrefix = "{rel}"')
open(f"{work}/Comp.tsx", "w").write(code)

# 2. render the React component to static markup
open(f"{work}/render.tsx", "w").write(
    'import React from "react";import {renderToStaticMarkup} from "react-dom/server";'
    'import Page from "./Comp";process.stdout.write(renderToStaticMarkup(<Page/>));')
env = dict(os.environ, NODE_PATH=nm)
subprocess.run([f"{nm}/.bin/esbuild", f"{work}/render.tsx", "--bundle", "--platform=node", "--jsx=automatic",
                f"--outfile={work}/render.js", "--log-level=warning"], check=True, env=env)
html = subprocess.run(["node", f"{work}/render.js"], check=True, env=env, capture_output=True, text=True).stdout
html = re.sub(r"<link [^>]*/>", "", html)

# 3. element spans by Figma node id (for removals and the pinned bar)
def spans(s):
    out, stack = {}, []
    for t in re.finditer(r"<(/?)(\w+)([^>]*?)(/?)>", s):
        tag = t.group(2)
        if tag in ("img", "br", "input", "path", "rect", "circle", "line", "ellipse", "polygon") or t.group(4) == "/":
            continue
        if t.group(1) == "":
            nid = re.search(r'data-node-id="([^"]*)"', t.group(3))
            stack.append((t.start(), nid.group(1) if nid else None))
        else:
            st, nid = stack.pop()
            if nid: out[nid] = (st, t.end())
    return out
def cut(s, nid):
    st, en = spans(s)[nid]; return s[:st] + s[en:], s[st:en]

edits = json.load(open(a.edits)) if a.edits else {}
for nid, st in edits.get("style", {}).items():
    html = html.replace(f'data-node-id="{nid}"', f'data-node-id="{nid}" style="{st}"', 1)
for nid in edits.get("remove", []):
    html, _ = cut(html, nid)
pinned = ""
if edits.get("pin_bottom"):
    html, pinned = cut(html, edits["pin_bottom"])
    pinned = re.sub(r'class="absolute', 'data-figma-pinned="1" class="absolute', pinned, count=1)
    pinned = re.sub(r"\binset-\[[^\]]*\]", "", pinned, count=1)
html = html.replace("&#x27;", "'"); pinned = pinned.replace("&#x27;", "'")
for old, new in edits.get("replace", []):
    html = html.replace(old, new); pinned = pinned.replace(old, new)

# 4. Tailwind v3 turns "_" into spaces, which breaks var(--token/31_5, 31.5px): keep the fallback value
def unvar(c):
    out, i = "", 0
    while True:
        j = c.find("var(--", i)
        if j < 0: return out + c[i:]
        out += c[i:j]; k = j + 4; depth = 1; comma = None
        while depth:
            ch = c[k]
            if ch == "(": depth += 1
            elif ch == ")": depth -= 1
            elif ch == "," and depth == 1 and comma is None: comma = k
            k += 1
        out += c[comma + 1:k - 1] if comma else c[j:k]; i = k
fix = lambda s: re.sub(r'class="([^"]*)"', lambda m: 'class="' + unvar(m.group(1)) + '"', s)
html, pinned = fix(html), fix(pinned)
frag = f'<div class="figma-scroll">{html}</div>{pinned}'
open(f"{work}/fragment.html", "w").write(frag)

# 5. compile only the classes used, scoped under the scope class, no preflight
open(f"{work}/tw.config.js", "w").write(
    f'module.exports={{content:["{work}/fragment.html"],important:"{scope}",corePlugins:{{preflight:false}}}};')
open(f"{work}/in.css", "w").write("@tailwind utilities;")
subprocess.run([f"{nm}/.bin/tailwindcss", "-c", f"{work}/tw.config.js", "-i", f"{work}/in.css",
                "-o", f"{work}/tw.css", "--minify"], check=True, env=env, capture_output=True)
css = open(f"{work}/tw.css").read()
# Figma names fonts like 'Roboto:Medium' or 'SF Pro:Regular': HyperFrames lint rejects them. Map to one real family.
fams = sorted(set(re.findall(r'font-family:\s*"([^"]+)"', css)))
css = re.sub(r'font-family:\s*"[^"]+:[^"]+"', "font-family:inherit", css)
fam, ffile = (a.font.split("=", 1) if a.font else ("", ""))
face = f'@font-face{{font-family:"{fam}";src:url("{ffile}");font-weight:100 900}}' if fam else ""
s0 = scope.lstrip(".")
base = (f"{scope}{{position:absolute;left:0;top:0;overflow:hidden;background:#fff;transform-origin:0 0}}"
        f"{scope} *{{box-sizing:border-box{(';font-family:\"' + fam + '\",sans-serif') if fam else ''}}}"
        f"{scope} p{{margin:0}}{scope} img{{max-width:none}}"
        f"{scope} .figma-scroll{{position:absolute;left:0;top:0;width:100%}}"
        f"{scope} [data-figma-pinned]{{left:0;right:0;bottom:0;top:auto;width:100%}}")
open(f"{work}/fragment.css", "w").write(face + base + css)
open(f"{work}/preview.html", "w").write(
    f'<html><head><style>{face.replace(ffile, os.path.abspath(os.path.join(a.project, ffile))) if fam else ""}body{{margin:0}}{base}{css}</style></head><body>'
    f'<div class="{s0}" style="width:100vw;height:100vh">{frag}</div></body></html>')
print(json.dumps({"work": work, "assets": rel, "figma_fonts": fams, "scope": scope,
                  "next": "copy fragment.css into the composition <style>, wrap fragment.html in "
                          f'<div class="{s0}" data-layout-allow-overlap>, add an @font-face for the real font family'}, indent=1))
