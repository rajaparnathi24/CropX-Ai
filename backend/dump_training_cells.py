import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
nb = json.load(open("CropX_Model.ipynb", encoding="utf-8"))
cells = nb["cells"]

for i in range(30, min(52, len(cells))):
    print(f"=== CELL {i} ===")
    src = "".join(cells[i]["source"])
    print(src)
    print("\n" + "-"*50 + "\n")
