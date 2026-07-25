import sys
import os

libs = ['tensorflow', 'PIL', 'sklearn', 'cv2', 'numpy', 'fastapi']
for lib in libs:
    try:
        m = __import__(lib)
        print(f"  {lib:12s}: {getattr(m, '__version__', 'Installed')}")
    except Exception as e:
        print(f"  {lib:12s}: NOT INSTALLED ({e})")
