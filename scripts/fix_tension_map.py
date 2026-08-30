"""Rewrite the tensionFromAspect map in mappers.ts with deduplicated, sorted keys.

The pair key is `[a, b].sort().join("-")`, so for any two planet ids we need
the alphabetically-sorted form. This script reads the current map, dedupes
entries (preferring the sorted-key version), and writes the file back.
"""
import re
from pathlib import Path

path = Path("/home/z/my-project/src/lib/astro/mappers.ts")
src = path.read_text()

# Find the map block. It starts with `  const map: Record<...> = {` and
# ends with the next `  };` at that indent.
start_marker = "  const map: Record<string, { title: string; what: string; tip: string }> = {"
start = src.index(start_marker)
# find the matching closing `  };` after start
end = src.index("\n  };\n", start) + len("\n  };\n")

block = src[start:end]

# Parse each entry: "key": { title: "...", what: "...", tip: "..." },
# Keys can have single-quoted strings inside the values, so we parse
# carefully by tracking braces.
entries = {}
i = block.index("{", len(start_marker)) + 1
while i < len(block):
    # skip whitespace
    while i < len(block) and block[i] in " \t\n":
        i += 1
    if i >= len(block) or block[i] == "}":
        break
    # expect a quoted key
    if block[i] != '"':
        i += 1
        continue
    j = block.index('"', i + 1)
    key = block[i + 1:j]
    # find the next `{`
    brace_start = block.index("{", j)
    # find matching `}`
    depth = 1
    k = brace_start + 1
    while depth > 0:
        if block[k] == "{":
            depth += 1
        elif block[k] == "}":
            depth -= 1
        k += 1
    entry_body = block[brace_start:k]
    # parse title, what, tip
    def extract(field):
        m = re.search(field + r':\s*"((?:[^"\\]|\\.)*)"', entry_body)
        if not m:
            return ""
        return m.group(1).encode().decode("unicode_escape")
    title = extract("title")
    what = extract("what")
    tip = extract("tip")
    # Normalize key to sorted form
    parts = sorted(key.split("-"))
    norm_key = "-".join(parts)
    entries[norm_key] = {"title": title, "what": what, "tip": tip}
    # skip trailing comma
    i = k
    while i < len(block) and block[i] in " \t\n,":
        i += 1

# Write back as a clean, sorted map.
lines = ["  const map: Record<string, { title: string; what: string; tip: string }> = {"]
for key in sorted(entries.keys()):
    e = entries[key]
    # Escape backslashes and quotes for TS string literal
    def esc(s):
        return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
    lines.append(f'    "{key}": {{')
    lines.append(f'      title: "{esc(e["title"])}",')
    lines.append(f'      what: "{esc(e["what"])}",')
    lines.append(f'      tip: "{esc(e["tip"])}",')
    lines.append('    },')
lines.append("  };")
new_block = "\n".join(lines) + "\n"

new_src = src[:start] + new_block + src[end:]
path.write_text(new_src)
print(f"Wrote {len(entries)} deduplicated, sorted entries.")
print("Keys:", sorted(entries.keys()))
