# Lesson 3: Diagnostics, source maps, and safe builds

Make failed asset builds visible and preserve enough information to debug released JavaScript.

## Fail on invalid source

```python
from pathlib import Path
from minifyjs import optimize, MinifyError

path = Path("src/app.js")
try:
    result = optimize(
        path.read_text(encoding="utf-8"),
        source_name=str(path),
        target="es2020",
        sourcemap="external",
    )
except MinifyError as exc:
    raise SystemExit(f"Asset build failed: {exc}")

for diagnostic in result.diagnostics:
    print(diagnostic)

output = Path("dist/app.min.js")
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(result.code, encoding="utf-8")
output.with_suffix(".js.map").write_text(result.map, encoding="utf-8")
```

Only write assets after processing succeeds. Let other failures, such as a missing native binary or unreadable source, fail the build too. For bundle builds, catch `BundleError` if you need a custom error message.

## Understand map modes

| Mode | Where the map goes | Production use |
| --- | --- | --- |
| None | No map | Small output, harder debugging |
| inline | Embedded in JavaScript | Convenient local debugging |
| external | `result.map` for transforms | Separate map artifact |
| both | Embedded and separate | Usually unnecessary for production |

Check that the `sourceMappingURL` comment matches the map location you deploy. Rename or adjust the reference if your output naming changes.

## Decide map visibility

Maps can reveal original source and filesystem paths. Publish them only if that is acceptable for your application. Otherwise retain them as private release artifacts and configure your error monitoring service to associate them with the matching release. Do not place credentials in frontend source.

## Protect legal notices

```python
result = optimize(source, legal_comments="eof")
```

Review your dependencies' licenses and distribute their required notices. Removing comments is not a substitute for that review.

## Completion checkpoint

Deliberately introduce a syntax error: the build must fail. Restore it, build again, and verify a browser stack trace maps to the expected original line when maps are available.

Continue with [Lesson 4: Deploy assets](#/production/04-deploy).
