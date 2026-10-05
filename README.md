# MinifyJS Documentation

A responsive documentation website for [MinifyJS](https://github.com/aldanedev-create/minifyjs), built with HTML, CSS, and JavaScript.

Includes 61 documentation pages, five production lessons, full-text search, light/dark themes, code-copy controls, the repository logo, and animated comparisons against rjsmin and jsmin.

## Preview locally

```sh
python -m http.server 8000
```

Open http://localhost:8000. An HTTP server is required because the site fetches JSON documentation and benchmark data.

## Files

- `index.html`, `style.css`, `app.js`: documentation interface.
- `docs.json`: rendered documentation, search text, and page metadata.
- `comparison.js`, `pypi-benchmarks.json`: animated benchmark comparison and measured data.
- `content/`: production lessons and benchmark source Markdown.
- `benchmarks/`: reproducible benchmark script, input, outputs, and results.
- `logo.png`: original MinifyJS repository logo.

## GitHub Pages

In repository Settings → Pages, choose **Deploy from a branch**, then **main** and **/(root)**. Relative asset paths support project URLs such as `/minifyjs-docs/`.

## Benchmarks

Recorded results use MinifyJS 0.1.0, rjsmin 1.2.5, and jsmin 3.0.1 on the same 44,697-byte ES5 fixture. Timing includes each library's Python call overhead; optimization features differ. See the site's benchmark page for methodology and limitations.
