// Validación masiva de movimientos-core.js (docs/familias/movimientos.md).
// Uso: node tests/masivo-movimientos.js [n] [--sin-verovio]
// Con reglas escritas AQUÍ (no con el comprobador que da la respuesta):
// Melódicos — la voz, en su tesitura y acabando en la tónica; sus defectos
//   recalculados (N12 aumentados y disminuidos, salvo la 5.ª disminuida que
//   vuelve hacia dentro por grado; N13 7.ª, más de 8.ª, más de 6.ª fuera del
//   bajo; N15 dos saltos en la misma dirección que suman 7.ª o 9.ª; P9 salto
//   de 4.ª o más sin cambio de dirección por grado, salvo la 8.ª del bajo)
//   coinciden con la respuesta; como mucho dos, sin solaparse; un rótulo por
//   defecto.
// Armónicos — el movimiento de cada paso, recalculado; al menos tres tipos y
//   como mucho un paso sin movimiento; la realización a cuatro voces (nivel 2),
//   sin faltas según el comprobador de 4.º. Reparto, y render (todas las notas,
//   con su id, y sin <harm>).
const path = require('path');
const BASE = path.join(__dirname, '../public/');
const M  = require(BASE + 'ejercicios/movimientos-core.js');
const CK = require(BASE + 'ejercicios/cuatro-voces-check.js');
const N = +(process.argv[2] || 1000);
const conVerovio = !process.argv.includes('--sin-verovio');

const L=['C','D','E','F','G','A','B'], SEMI={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const mod=(a,n)=>((a%n)+n)%n;
const midi = p => (Math.floor(p.abs/7)+1)*12 + SEMI[L[mod(p.abs,7)]] + p.alter;
const IDX=(l,o)=>o*7+L.indexOf(l);
const RANGO = {soprano:[IDX('C',4),IDX('A',5)], contralto:[IDX('F',3),IDX('D',5)], tenor:[IDX('C',3),IDX('A',4)], bajo:[IDX('E',2),IDX('C',4)]};
// semitonos admitidos (justos, mayores, menores) de cada amplitud simple, en pasos 0..7
const BUENOS = {0:[0], 1:[1,2], 2:[3,4], 3:[5], 4:[7], 5:[8,9], 6:[10,11], 7:[12]};
const calidadOK = (p,q) => { const d=Math.abs(p.abs-q.abs), s=Math.abs(midi(p)-midi(q)); const r=d>7 ? d%7 : d, o=(d-r)/7; return BUENOS[r].includes(s-12*o); };
const fallos=[]; const falla=m=>{ if(fallos.length<15) fallos.push(m); fallos.n=(fallos.n||0)+1; };
const cuenta={}, suma=k=>cuenta[k]=(cuenta[k]||0)+1;
const muestras=[];

// defectos de una voz, como 'regla@nota' (la nota donde se ve: la de llegada
// del intervalo; en N15, la tercera; en P9, la que no compensa)
function misDefectos(v, rol){
  const out=[], n=v.length;
  for(let k=1;k<n;k++){
    const p=v[k-1], q=v[k], d=q.abs-p.abs, a=Math.abs(d);
    if(a===0) continue;
    if(a===6 || a>7 || (rol!=='bajo' && a>5)) out.push('N13@'+k);
    else if(!calidadOK(p,q)){
      const quintaDim = a===4 && Math.abs(midi(q)-midi(p))===6;
      const r=v[k+1], vuelve = r && Math.abs(r.abs-q.abs)===1 && Math.sign(r.abs-q.abs)===-Math.sign(d);
      if(!(quintaDim && vuelve)) out.push('N12@'+k);
    }
    if(k>=2){
      const d0=p.abs-v[k-2].abs, tot=Math.abs(q.abs-v[k-2].abs);
      if(Math.abs(d0)>=2 && a>=2 && Math.sign(d0)===Math.sign(d) && (tot===6 || tot===8)) out.push('N15@'+k);
    }
    if(a>=3 && k+1<n && !(rol==='bajo' && a===7)){
      const dr=v[k+1].abs-q.abs;
      if(!(Math.abs(dr)===1 && Math.sign(dr)===-Math.sign(d))) out.push('P9@'+(k+1));
    }
  }
  return out.sort();
}

for(let i=0;i<N;i++){
  // --- melódicos ---
  const e = M.generarMelodico();
  if(!e) falla('mel: sin instancia');
  else {
    const v=e.voz;
    if(v.some(p=>p.abs<RANGO[e.rol][0] || p.abs>RANGO[e.rol][1])) falla('mel: fuera de tesitura');
    if(L[mod(v[v.length-1].abs,7)]!==e.key.tonic) falla('mel: no acaba en la tónica');
    const mios = misDefectos(v, e.rol), suyos = e.defectos.map(d=>d.regla+'@'+d.tramo[1]).sort();
    if(mios.join()!==suyos.join()) falla(`mel ${e.rol} ${v.map(p=>p.abs).join(' ')}: ${mios} ≠ ${suyos}`);
    if(e.defectos.length>2) falla('mel: más de dos defectos');
    for(let a=0;a<e.defectos.length;a++) for(let b=a+1;b<e.defectos.length;b++){
      const x=e.defectos[a].tramo, y=e.defectos[b].tramo;
      if(x[0]<y[1] && y[0]<x[1]) falla('mel: defectos solapados');
    }
    if(M.dibujo(e).rotulos.length!==e.defectos.length) falla('mel: rótulos');
    suma('mel n='+e.defectos.length); suma('mel voz '+e.rol); e.defectos.forEach(d=>suma('mel regla '+d.regla));
    if(i<30) muestras.push(e);
  }
  // --- armónicos ---
  for(const nivel of [1,2]){
    const a = M.generarArmonico(nivel);
    if(!a){ falla('arm'+nivel+': sin instancia'); continue; }
    const [s,t] = a.sel, x=a.voces[s], y=a.voces[t];
    const mios = x.slice(1).map((_,k)=>{
      const da=x[k+1].abs-x[k].abs, db=y[k+1].abs-y[k].abs;
      if(!da && !db) return null;
      if(!da || !db) return 'oblicuo';
      if(Math.sign(da)!==Math.sign(db)) return 'contrario';
      return x[k].abs-y[k].abs===x[k+1].abs-y[k+1].abs ? 'paralelo' : 'directo';
    });
    if(mios.join()!==a.movs.join()) falla(`arm${nivel}: ${mios} ≠ ${a.movs}`);
    if(new Set(mios.filter(Boolean)).size<3 || mios.filter(m=>!m).length>1) falla('arm'+nivel+': poca variedad');
    if(x.some((p,k)=>midi(p)<midi(y[k]))) falla('arm'+nivel+': voces cruzadas');
    if(nivel===2){
      const f = CK.comprobar(a.key, a.acordes, a.voces);
      if(f.length) falla('arm2: faltas en la realización '+f.map(z=>z.regla));
    }
    const d = M.dibujo(a);
    if(d.rotulos.length!==M.N-1 || d.rayas.length!==2*(M.N-1)) falla('arm'+nivel+': dibujo');
    mios.forEach(m=>suma(`arm${nivel} mov ${m||'—'}`)); suma(`arm${nivel} pareja ${a.roles.join('-')}`);
    if(i<30) muestras.push(a);
  }
}
console.log(`${N} instancias de cada consigna (Armónicos, de cada nivel)`);
console.log('Fallos: '+(fallos.n ? fallos.n+'\n  '+fallos.join('\n  ') : 'ninguno'));
const grupo = (pre,tot) => Object.keys(cuenta).filter(k=>k.startsWith(pre)).sort().map(k=>k.slice(pre.length)+' '+(100*cuenta[k]/tot).toFixed(1)+'%').join(' · ');
console.log('Melódicos, nº de defectos: '+grupo('mel n=', N));
console.log('Melódicos, defectos por tipo (por ejercicio): '+grupo('mel regla ', N));
console.log('Melódicos, voz: '+grupo('mel voz ', N));
for(const nv of [1,2]){
  console.log(`Armónicos ${nv}, movimientos (por paso): `+grupo(`arm${nv} mov `, N*(M.N-1)));
  console.log(`Armónicos ${nv}, parejas: `+grupo(`arm${nv} pareja `, N));
}

if(conVerovio){
  const verovio = require(BASE + 'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized = () => {
    const tk = new verovio.toolkit();
    tk.setOptions({scale:60, adjustPageHeight:true, pageWidth:1250, header:'none', footer:'none', breaks:'none', font:'Leland'});
    let mal=0;
    for(const e of muestras){
      const ok = tk.loadData(M.toMEI(e));
      const svg = ok ? tk.renderToSVG(1) : '', c = re => (svg.match(re)||[]).length;
      const nv = e.tipo==='melodico' ? 1 : e.voces.length;
      const faltan = [...Array(nv).keys()].flatMap(v=>[...Array(M.N).keys()].map(k=>`id="n${v}_${k}"`)).filter(s=>!svg.includes(s)).length;
      const r = {ok, notas:c(/class="note[ "]/g), harm:c(/class="harm/g), faltan};
      if(!ok || r.notas!==M.N*nv || r.harm!==0 || faltan){ mal++; if(mal<5) console.log('VEROVIO', e.tipo, r); }
    }
    console.log(`Verovio: ${muestras.length} MEI · con problema: ${mal}`);
  };
}
