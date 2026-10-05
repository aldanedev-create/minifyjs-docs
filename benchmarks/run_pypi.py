"""Run from the site root after installing minifyjs, rjsmin, jsmin."""
import gzip,hashlib,importlib.metadata,json,platform,statistics,time
from pathlib import Path
from minifyjs import optimize
from rjsmin import jsmin as rjsmin
from jsmin import jsmin

fixture='/* Deterministic ES5-compatible benchmark input. */\n'+''.join(
 f'function calculate_{i}(firstValue, secondValue) {{\n  var multiplier = {i%7+1};\n  var subtotal = firstValue + secondValue;\n  return subtotal * multiplier;\n}}\n' for i in range(300))+'console.log(calculate_0(12, 8), calculate_299(12, 8));\n'
root=Path(__file__).resolve().parent
(root/'fixture.js').write_text(fixture)
rows=[]
for name,fn in [('minifyjs',lambda s:optimize(s).code),('rjsmin',rjsmin),('jsmin',jsmin)]:
 for _ in range(3):fn(fixture)
 times=[]
 for _ in range(30):
  start=time.perf_counter();code=fn(fixture);times.append((time.perf_counter()-start)*1000)
 (root/(name+'.output.js')).write_text(code)
 rows.append(dict(name=name,version=importlib.metadata.version(name),ms=round(statistics.median(times),4),bytes=len(code.encode()),gzip_bytes=len(gzip.compress(code.encode(),mtime=0))))
data=dict(date=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),python=platform.python_version(),os=platform.platform(),machine=platform.machine(),processor=platform.processor(),input_bytes=len(fixture.encode()),sha256=hashlib.sha256(fixture.encode()).hexdigest(),iterations=30,warmups=3,rows=rows)
(root/'results.json').write_text(json.dumps(data,indent=2));print(json.dumps(data,indent=2))
