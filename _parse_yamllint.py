import sys

cur = None
errs = set()
for raw_line in sys.stdin:
    line = raw_line.rstrip()
    if not line:
        continue
    if line.startswith("./") or line.startswith(".\\"):
        cur = line
    elif "error" in line and cur:
        errs.add(cur)
for f in sorted(errs):
    print(f)
