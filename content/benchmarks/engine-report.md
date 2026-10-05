# Benchmarks: measure your production workload

Compare speed, output size, startup, and memory independently. MinifyJS uses esbuild's native engine, but Python calls also involve process startup, serialization, and result handling. Sharing an engine does not mean identical end-to-end timings.

## Recorded results

The repository's checked-in `bench/results/latest.md` was generated on **2026-10-05 at 03:10 UTC**. The tables below reproduce that report; they are not a new benchmark run on this documentation site. The report does not record enough hardware, operating-system, and tool-version metadata to treat these values as universal performance guarantees.

### Processing time

Fixture: `medium.js`, 44,612 input bytes. Median of 10 measured iterations. Lower time is better.

| Tool | Median time | Throughput |
| --- | --- | --- |
| MinifyJS | 13.88 ms | 3.2 MB/s |
| esbuild | 10.45 ms | 4.3 MB/s |
| terser | 526.18 ms | 0.1 MB/s |
| uglify-js | 682.39 ms | 0.1 MB/s |
| rjsmin | 0.32 ms | 139.5 MB/s |

The MinifyJS comparator invokes `optimize()` through Python. The rjsmin comparator runs a whitespace/comment minifier in process and does not perform the same optimization work. Its low time should not be interpreted as an equivalent replacement for bundling, mangling, or syntax optimization.

### Output size

Smaller raw JavaScript is better on this metric. Parentheses show bytes saved as a percentage of the input, not output-to-input ratio.

| Fixture | Input bytes | MinifyJS | esbuild | terser | uglify-js | rjsmin |
| --- | --- | --- | --- | --- | --- | --- |
| application.js | 2,391 | 1,144 (52.2%) | 1,105 (53.8%) | 1,172 (51.0%) | 1,173 (50.9%) | 1,460 (38.9%) |
| medium.js | 44,612 | 18,185 (59.2%) | 17,885 (59.9%) | 17,885 (59.9%) | 17,866 (60.0%) | 25,911 (41.9%) |
| large.js | 355,525 | 130,474 (63.3%) | 128,475 (63.9%) | 128,475 (63.9%) | 124,458 (65.0%) | 244,570 (31.2%) |

These runs use the comparator settings in the repository. Check those settings before claiming feature-for-feature parity. Raw byte size is separate from gzip/Brotli transfer size and browser execution cost.

### Startup

Median of 20 iterations, in milliseconds.

| MinifyJS | esbuild | terser | uglify-js | rjsmin |
| --- | --- | --- | --- | --- |
| 6.71 | 6.43 | 138.47 | 133.38 | 39.97 |

Startup matters when you invoke a process once for every small file. Compare the whole pipeline as well as isolated transforms.

### Peak memory

Recorded peak RSS for `large.js`, 355,525 input bytes.

| MinifyJS | esbuild | terser | uglify-js |
| --- | --- | --- | --- |
| 23.3 MB | 25.0 MB | 192.4 MB | 277.0 MB |

Memory measurements are platform dependent. Inspect `measure_memory.py` for your platform and test realistic concurrency separately.

## Reproduce the suite

Clone the source, record the commit, create and activate a virtual environment, then install the Python package and benchmark dependencies:

```console
git clone https://github.com/aldanedev-create/minifyjs.git
cd minifyjs
python -m venv .venv
```

Activate with `. .venv/bin/activate` on macOS/Linux or `.venv\Scripts\Activate.ps1` in PowerShell.

```console
python -m pip install ./python
python -m pip install -r bench/requirements.txt
cd bench
npm install
python run_all.py
```

The local Python package must have a usable native binary. Use a supported wheel or build/package the binary using the repository's development instructions if local installation cannot find it. Node/npm are needed for the JavaScript competitors in this benchmark, not for using MinifyJS itself. Check the output for missing tools or measurement errors before comparing results.

## Run individual measurements

```console
python measure_compression.py
python measure_throughput.py --fixture medium.js --iterations 10
python measure_startup.py
python measure_memory.py
```

Run these commands from `bench/`. The combined runner writes `bench/results/latest.md`. Archive your report before the next run overwrites it.

## Record enough context

| Record | Why it matters |
| --- | --- |
| Git commit and exact tool versions | The code and engine can change |
| CPU, RAM, OS, Python version | Runtime and process costs vary |
| Input checksum and byte length | Comparisons need identical input |
| Target, optimization and map settings | Options change both time and size |
| Iterations and timing boundary | In-process and CLI timing differ |
| Cold/warm cache and machine load | Filesystem and contention add noise |

The current throughput script reports the median of its requested iterations; it does not explicitly discard warmup runs. Inspect each measurement script rather than assuming one shared timing boundary or warmup policy.

## Choose based on the application

Use your actual source files as well as synthetic fixtures. Verify behavior after minification, compare compressed size, and time the complete build. A faster isolated transform may have little impact when another build step dominates.

See the [source report](https://github.com/aldanedev-create/minifyjs/blob/main/bench/results/latest.md) and [benchmark harness](https://github.com/aldanedev-create/minifyjs/tree/main/bench) for the data and implementation.
