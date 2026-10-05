# Lesson 1: Build your first production asset

Move JavaScript processing into a repeatable build step. This course uses a small browser application and the actual keyword-based MinifyJS Python API.

## What you will ship

A source file, a build script, and an optimized asset that your web server can serve. Run optimization at build time so visitors do not pay the processing cost.

## Prepare the project

Create `src/app.js`:

```javascript
function total(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
console.log(total([{ price: 12 }, { price: 8 }]));
```

Install MinifyJS in your virtual environment. Pin the version that you have tested in your production requirements file.

```console
python -m venv .venv
python -m pip install minifyjs
python -m pip freeze > requirements.lock.txt
```

Activate `.venv` before installing: `. .venv/bin/activate` on macOS/Linux; `.venv\Scripts\Activate.ps1` in Windows PowerShell.

## Write the build script

Save as `build_assets.py`:

```python
from pathlib import Path
from minifyjs import optimize

source = Path("src/app.js")
output = Path("dist/app.min.js")
output.parent.mkdir(parents=True, exist_ok=True)
result = optimize(
    source.read_text(encoding="utf-8"),
    target="es2020",
    source_name=str(source),
)
output.write_text(result.code, encoding="utf-8")
print(f"{result.original_bytes} -> {result.minified_bytes} bytes")
```

```console
python build_assets.py
```

`optimize()` enables compression and local identifier mangling. Set your target from the browsers you support. Targets lower supported syntax; they do not provide missing browser APIs or polyfills.

## Verify before release

Load the optimized asset in a test HTML page and confirm the console reports `20`. Exercise real interactions against the optimized code; a smaller file alone does not establish correctness.

## Completion checkpoint

The build exits successfully, the output exists, and the browser behaves the same as with the original source. Keep `src/` in version control and generate `dist/` in your release pipeline.

Continue with [Lesson 2: Bundles](#/production/02-bundle).
