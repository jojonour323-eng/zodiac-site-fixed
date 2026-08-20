"""Replace .short.toLowerCase() inline usages with a first-sentence-only version."""
import re
from pathlib import Path

path = Path("/home/z/my-project/src/lib/astro/interpretations.ts")
src = path.read_text()

# Pattern: ${something.short.toLowerCase()}  ->  ${something.short.split(".")[0].toLowerCase()}
# We need to be careful not to break the split-based fix already in combinedSummary.
# Only replace standalone .short.toLowerCase() usages, not the ones already using .split

# Count current usages
count = src.count(".short.toLowerCase()")
print(f"Found {count} .short.toLowerCase() usages")

# Replace all .short.toLowerCase() with .short.split(".")[0].toLowerCase()
# This takes just the first sentence, avoiding the mid-sentence capital issue.
new_src = src.replace(".short.toLowerCase()", '.short.split(".")[0].toLowerCase()')
path.write_text(new_src)
print("Replaced all usages with first-sentence-only version.")
