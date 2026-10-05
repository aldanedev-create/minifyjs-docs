# Lesson 4: Serve and cache production assets

Integrate the build output with a Python application, then deploy assets without stale browser caches.

## Use content-based filenames for a single file

```python
import hashlib
import json
from pathlib import Path
from minifyjs import optimize

source = Path("src/app.js").read_text(encoding="utf-8")
code = optimize(source, target="es2020").code
version = hashlib.sha256(code.encode("utf-8")).hexdigest()[:12]
filename = f"app.{version}.js"
assets = Path("static/assets")
assets.mkdir(parents=True, exist_ok=True)
(assets / filename).write_text(code, encoding="utf-8")
(assets / "manifest.json").write_text(
    json.dumps({"app.js": filename}), encoding="utf-8"
)
```

This recipe is for one transformed file without a source map. Do not rename bundled chunks independently: generated import paths would need updating too.

## Read the manifest in Flask

```python
import json
from pathlib import Path
from flask import Flask, render_template

app = Flask(__name__)
manifest = json.loads(
    Path("static/assets/manifest.json").read_text(encoding="utf-8")
)

@app.get("/")
def home():
    return render_template("index.html", app_asset=manifest["app.js"])
```

Template:

```html
<script src="{{ url_for('static', filename='assets/' + app_asset) }}" defer></script>
```

Generate the manifest before the application starts. For other frameworks see the [Django](#/integrations/django) and [FastAPI](#/integrations/fastapi) integration guides.

## Choose cache headers

| Resource | Suggested policy |
| --- | --- |
| Content-hashed asset | `public, max-age=31536000, immutable` |
| HTML document | Revalidate or a short cache lifetime |
| Unversioned manifest | Revalidate; do not cache immutably |

Configure these headers at your static server or CDN. Enable gzip or Brotli there; MinifyJS's JavaScript minification is separate from HTTP compression.

## Deploy as one release

Upload assets first, then activate templates or application code that references them. Keep previous assets through your rollback window so already-open pages still work. Publish a release atomically when your hosting platform supports it.

## Completion checkpoint

Change the source and rebuild: the filename changes. Confirm the page requests the new file, receives the intended cache headers, and your previous release still works during rollback.

Continue with [Lesson 5: CI and release budgets](#/production/05-ci).
