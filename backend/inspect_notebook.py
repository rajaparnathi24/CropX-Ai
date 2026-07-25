import json
import sys

nb = json.load(open("CropX_Model.ipynb", encoding="utf-8"))
cells = nb["cells"]
print(f"Total cells: {len(cells)}")
for i, c in enumerate(cells):
    ct = c["cell_type"]
    src = "".join(c["source"])
    first_line = src.split("\n")[0][:120] if src.strip() else "(empty)"
    print(f"Cell {i:3d} ({ct:8s}): {first_line}")
