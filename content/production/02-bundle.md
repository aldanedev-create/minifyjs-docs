# Lesson 2: Bundle a multi-file application

Turn several modules into deployable browser assets, with optional lazy-loaded chunks.

## Split the application into modules

`src/math.js`:

```javascript
export const add = (a, b) => a + b;
```

`src/main.js`:

```javascript
import { add } from './math.js';
document.querySelector('#result').textContent = add(12, 8);
```

Your page needs an element with `id="result"`.

## Build for the browser

```python
from minifyjs import bundle

bundle(
    ["src/main.js"],
    outdir="dist/assets",
    platform="browser",
    format="esm",
    target="es2020",
    splitting=True,
    compress=True,
    mangle=True,
)
```

Use exactly one of `outdir` or `outfile`. Splitting requires ESM. A single entry without dynamic imports may still produce only one JavaScript output.

## Add lazy loading when useful

```javascript
// src/main.js
import { add } from './math.js';
document.querySelector('#result').textContent = add(12, 8);
document.querySelector('#details').addEventListener('click', async () => {
  const { showDetails } = await import('./details.js');
  showDetails();
});
```

```javascript
// src/details.js
export function showDetails() {
  document.querySelector('#result').textContent = 'Details loaded';
}
```

Add a button with `id="details"`. Serve the entire output directory so generated imports can locate their chunks.

## Load the entry correctly

```html
<div id="result"></div>
<button id="details">Show details</button>
<script type="module" src="/assets/main.js"></script>
```

Check the actual generated entry filename before wiring your template. Use a local HTTP server rather than opening the HTML through `file://`.

## Completion checkpoint

The initial page shows `20`, clicking the button loads the details, and there are no missing chunk requests. Deploy every generated file together.

Continue with [Lesson 3: Diagnostics](#/production/03-diagnostics).
