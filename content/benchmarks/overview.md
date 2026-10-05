# PyPI JavaScript minifiers: a measured comparison

Compare MinifyJS, rjsmin, and jsmin using the same deterministic ES5-compatible input. These measurements were run for this site update; the chart on the overview uses this exact data.

## Results

Lower is better for processing time and output size. Each time is the median of 30 iterations after 3 warmup calls.

| Library | Version | Median time | Raw output | Gzip output |
| --- | --- | --- | --- | --- |
| minifyjs | 0.1.0 | 6.272 ms | 16,141 B | 962 B |
| rjsmin | 1.2.5 | 0.092 ms | 38,641 B | 1,111 B |
| jsmin | 3.0.1 | 8.769 ms | 38,641 B | 1,111 B |

## Workload and environment

- Run: 2026-10-05T04:03:56Z.
- Python: 3.12.14.
- OS: Linux-6.18.44-x86_64-with-glibc2.39.
- Architecture: x86_64.
- Input: 44,697 UTF-8 bytes, 300 generated ES5-style functions and two test calls.
- SHA-256: `2c51b7f8f182ece8e4c7e39bcbbfafa429afc2d2ba0da02753e6314c35a7f085`.
- Shared execution environment; timings will vary with hardware and machine load.

## What the timing includes

MinifyJS uses `optimize(source).code`, including the Python wrapper's native process launch and protocol overhead on every call. rjsmin and jsmin use their `jsmin(source)` functions in the existing Python process. Imports, input file reads, output file writes, and gzip compression are outside the timed region.

This compares the public Python calls a user would make, not isolated engine performance. MinifyJS performs compression and local identifier mangling; rjsmin and jsmin mainly remove whitespace and comments. The optimization work is not equivalent.

## Read all three metrics

In this run, rjsmin had the lowest processing time; MinifyJS produced the smallest raw and gzipped output. jsmin was slower than the other two on this fixture. These are observations for this input and environment, not a general ranking.

The input is deliberately repetitive and gzip compresses it strongly. Use your actual application source before choosing a library. Do not extrapolate these compression ratios to real applications.

## Output checks

The original input and each of the three minified outputs were executed with Node during validation. Each printed `20 120`. That checks two functions for this fixture; it does not prove every possible JavaScript input is preserved. Node was used to verify the benchmark output, not as a dependency of MinifyJS.

## Reproduce this run

Download the [benchmark script](run_pypi.py), keep it in a `benchmarks/` directory, and install the measured versions in a virtual environment:

```console
python -m pip install minifyjs==0.1.0 rjsmin==1.2.5 jsmin==3.0.1
python benchmarks/run_pypi.py
```

The script generates the fixture, runs warmups and measurements, and writes `results.json` plus each minified output alongside itself. [Download the exact input](fixture.js) or inspect [the recorded JSON](pypi-benchmarks.json).

The measurements use gzip's default compression level with `mtime=0` for reproducible compressed sizes. Brotli and browser execution time were not measured.

## Capabilities and compatibility

| Library | Approach | Identifier mangling in this run | Bundling in the compared API |
| --- | --- | --- | --- |
| MinifyJS | esbuild-backed native engine via Python | Yes | Available through separate `bundle()` API |
| rjsmin | Whitespace/comment minifier, with C implementation available | No | No |
| jsmin | Python JavaScript minifier | No | No |

The [jsmin package page](https://pypi.org/project/jsmin/) states it does not aim for ES6 compatibility, which is why this comparison uses an ES5-style fixture. The [rjsmin package page](https://pypi.org/project/rjsmin/) documents its semantics and C implementation. See [MinifyJS syntax support](#/supported-syntax) for the engine's scope. SlimIt is another [PyPI JavaScript minifier](https://pypi.org/project/slimit/) with mangling, but it was not measured here and is not represented by an invented bar.

## Other benchmarks

The older repository report comparing native and npm tools remains in [the engine comparison archive](#/benchmarks/engine-report). It uses a different fixture and run; do not combine its numbers with this PyPI comparison.
