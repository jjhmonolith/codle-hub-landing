"""Package the current landing page without repository documents or old HTML drafts."""

from pathlib import Path
import shutil


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "prototypes/codle-hub-studio/toy-hub"
OUTPUT = ROOT / "dist"

if OUTPUT.exists():
    shutil.rmtree(OUTPUT)
OUTPUT.mkdir()

shutil.copy2(SOURCE / "publisher-kakao-font-preview.html", OUTPUT / "index.html")
for pattern in ("*.css", "*.js"):
    for source in SOURCE.glob(pattern):
        shutil.copy2(source, OUTPUT / source.name)
for directory in ("assets", "vendor"):
    shutil.copytree(SOURCE / directory, OUTPUT / directory)

(OUTPUT / ".nojekyll").touch()
print(f"Landing page ready: {OUTPUT / 'index.html'}")
