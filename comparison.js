'use strict';
let comparisonFrame=0,comparisonObserver;
window.renderPyPIComparison=async function(){
 cancelAnimationFrame(comparisonFrame);comparisonObserver?.disconnect();
 const host=document.getElementById('pypi-comparison');if(!host)return;
 try{
  const response=await fetch('pypi-benchmarks.json');if(!response.ok)throw Error();const data=await response.json();if(!host.isConnected)return;
  host.innerHTML=`<div class="bench-heading"><div><span class="eyebrow">PYTHON LIBRARIES. SAME INPUT.</span><h2>Watch the comparison.</h2></div><button class="race-replay">↻ Replay</button></div><div class="bench-controls" role="group" aria-label="Comparison metric"><button data-metric="ms" class="selected" aria-pressed="true">Processing time</button><button data-metric="bytes" aria-pressed="false">Raw output</button><button data-metric="gzip_bytes" aria-pressed="false">Gzip output</button></div><p class="bench-description"></p><div class="race-clock"><span>Measured time</span><strong>0.000 ms</strong><span class="race-state" role="status">Ready</span></div><div class="bar-chart" role="img"></div><div class="chart-axis"></div><p class="race-explanation"></p><p class="bench-caption">44,697-byte ES5 fixture · Median of 30 calls · 3 warmups<br>MinifyJS optimizes and mangles; rjsmin and jsmin remove whitespace/comments.<br><a href="#/benchmarks/overview">Read the methodology ↗</a></p><details class="bench-data"><summary>Exact results and versions</summary><table><thead><tr><th>Library</th><th>Version</th><th>Median time</th><th>Raw output</th><th>Gzip output</th></tr></thead><tbody>${data.rows.map(r=>`<tr><th scope="row">${r.name}</th><td>${r.version}</td><td>${r.ms.toFixed(3)} ms</td><td>${r.bytes.toLocaleString()} B</td><td>${r.gzip_bytes.toLocaleString()} B</td></tr>`).join('')}</tbody></table></details>`;
  let metric='ms';const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const format=(n,m)=>m==='ms'?n.toFixed(3)+' ms':Math.round(n).toLocaleString()+' B';
  function play(){
   cancelAnimationFrame(comparisonFrame);if(!host.isConnected)return;
   const max=Math.max(...data.rows.map(r=>r[metric]));const ceiling=metric==='ms'?Math.ceil(max):Math.ceil(max/1000)*1000;
   const chart=host.querySelector('.bar-chart');chart.setAttribute('aria-label',data.rows.map(r=>`${r.name}: ${format(r[metric],metric)}`).join('; '));
   host.querySelector('.bench-description').textContent=metric==='ms'?'All three start together. Each bar stops when its measured processing time is reached. Lower is better.':(metric==='bytes'?'Raw':'Gzip-compressed')+' output size. Each bar grows to its measured size. Lower is better.';
   host.querySelector('.race-explanation').textContent=metric==='ms'?'Playback is slowed down for visibility. Bar lengths and finish times use the same linear scale. This replays recorded results; it does not run a live benchmark.':'Size animation uses a shared linear scale. Its duration represents bytes, not processing time.';
   host.querySelector('.race-clock>span').textContent=metric==='ms'?'Measured time':'Output bytes';
   chart.innerHTML=data.rows.map((r,i)=>`<div class="chart-row"><a class="chart-label" href="https://pypi.org/project/${r.name}/">${r.name}</a><div class="chart-track"><div class="chart-bar ${i===0?'brand-bar':''}"></div><span class="chart-value">${format(0,metric)}</span></div><span class="race-done">Waiting</span></div>`).join('');
   host.querySelector('.chart-axis').innerHTML=[0,.25,.5,.75,1].map(t=>`<span>${format(ceiling*t,metric)}</span>`).join('');
   const rows=[...chart.querySelectorAll('.chart-row')];const clock=host.querySelector('.race-clock strong');const state=host.querySelector('.race-state');state.textContent=reduced.matches?'Complete':'Playing';
   const start=performance.now();
   function tick(now){
    if(!host.isConnected)return;
    const progress=reduced.matches?1:Math.min(1,(now-start)/5000);const elapsed=progress*ceiling;
    rows.forEach((el,i)=>{const value=Math.min(elapsed,data.rows[i][metric]);const width=value/ceiling*100;const finished=value>=data.rows[i][metric];el.querySelector('.chart-bar').style.width=width+'%';el.querySelector('.chart-value').style.left=Math.min(82,width)+'%';el.querySelector('.chart-value').textContent=format(value,metric);el.querySelector('.race-done').textContent=finished?'✓ Done':'Running';el.classList.toggle('finished',finished)});
    clock.textContent=format(Math.min(elapsed,max),metric);
    if(elapsed<max){comparisonFrame=requestAnimationFrame(tick)}else{state.textContent='Complete';host.querySelector('.race-replay').textContent='↻ Replay'}
   }
   comparisonFrame=requestAnimationFrame(tick);
  }
  host.querySelector('.race-replay').onclick=play;
  host.querySelectorAll('[data-metric]').forEach(b=>b.onclick=()=>{metric=b.dataset.metric;host.querySelectorAll('[data-metric]').forEach(x=>{const selected=x===b;x.classList.toggle('selected',selected);x.setAttribute('aria-pressed',selected)});play()});
  if('IntersectionObserver' in window){comparisonObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){comparisonObserver.disconnect();play()}},{threshold:.25});comparisonObserver.observe(host)}else play();
 }catch{host.innerHTML='<p><a href="#/benchmarks/overview">Read the benchmark methodology →</a></p>'}
};
