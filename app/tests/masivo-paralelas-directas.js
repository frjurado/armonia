// Validación masiva de paralelas-directas-core.js (docs/familias/paralelas-directas.md).
// Uso: node tests/masivo-paralelas-directas.js [n] [--sin-verovio]
// Con reglas escritas AQUÍ (no con el comprobador que da la respuesta): las
// 5.as, 8.as y unísonos paralelos de cualquier pareja (también por movimiento
// contrario) y las directas de 5.ª u 8.ª entre las extremas con la aguda por
// salto, recalculadas, coinciden con la respuesta; como mucho dos, ni en el
// mismo paso ni en pasos contiguos. Nivel 1: dos voces, siempre consonantes (sin 4.ª), sin directas.
// Nivel 2: las faltas, todas en la pareja resaltada. Niveles 2 y 3: fuera de
// lo inyectado, la realización a cuatro voces está limpia según el
// comprobador de 4.º. Reparto, y render (todas las notas con su id, sin <harm>).
const path = require('path');
const BASE = path.join(__dirname, '../public/');
const P  = require(BASE + 'ejercicios/paralelas-directas-core.js');
const CK = require(BASE + 'ejercicios/cuatro-voces-check.js');
const N = +(process.argv[2] || 1000);
const conVerovio = !process.argv.includes('--sin-verovio');

const L=['C','D','E','F','G','A','B'], SEMI={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const mod=(a,n)=>((a%n)+n)%n;
const midi = p => (Math.floor(p.abs/7)+1)*12 + SEMI[L[mod(p.abs,7)]] + p.alter;
// clase justa de un intervalo armónico: '8' (unísono, 8.ª, 15.ª…), '5' (5.ª, 12.ª…) o null
const justa = (p,q) => { const d=Math.abs(p.abs-q.abs), s=Math.abs(midi(p)-midi(q)); if(d%7===0 && s===12*d/7) return '8'; if(d%7===4 && s===7+12*(d-4)/7) return '5'; return null; };
const fallos=[]; const falla=m=>{ if(fallos.length<15) fallos.push(m); fallos.n=(fallos.n||0)+1; };
const cuenta={}, suma=k=>cuenta[k]=(cuenta[k]||0)+1;
const muestras=[];

function misFaltas(voces){
  const nv=voces.length, n=voces[0].length, out=[];
  for(let k=1;k<n;k++){
    const pares=new Set();
    for(let i=0;i<nv;i++) for(let j=i+1;j<nv;j++){
      const a=[voces[i][k-1],voces[j][k-1]], d=[voces[i][k],voces[j][k]];
      if(a[0].abs===d[0].abs || a[1].abs===d[1].abs) continue;
      const x=justa(a[0],a[1]), y=justa(d[0],d[1]);
      if(x && x===y){ out.push('N4@'+k+'@'+i+'-'+j); pares.add(i+'-'+j); }
    }
    const s=0, b=nv-1, mS=voces[s][k].abs-voces[s][k-1].abs, mB=voces[b][k].abs-voces[b][k-1].abs;
    if(!pares.has(s+'-'+b) && mS && mB && Math.sign(mS)===Math.sign(mB) && Math.abs(mS)>1 && justa(voces[s][k],voces[b][k]))
      out.push('N5@'+k+'@'+s+'-'+b);
  }
  return out.sort();
}

for(let i=0;i<N;i++) for(const nivel of [1,2,3]){
  const e = P.generar(nivel);
  if(!e){ falla(nivel+': sin instancia'); continue; }
  const mias = misFaltas(e.voces), suyas = e.faltas.map(f=>f.regla+'@'+f.paso+'@'+f.voces.join('-')).sort();
  if(nivel===1){
    // a dos voces, N5 no se pregunta y no se genera
    if(mias.some(x=>x.startsWith('N5'))) falla('1: directa a dos voces');
    if(mias.filter(x=>x.startsWith('N4')).join()!==suyas.join()) falla(`1: ${mias} ≠ ${suyas}`);
    e.voces[0].forEach((p,k)=>{
      const q=e.voces[1][k], d=p.abs-q.abs, s=midi(p)-midi(q), r=mod(d,7);
      const ok = (r===0 && mod(s,12)===0) || (r===2 && [3,4].includes(mod(s,12))) || (r===4 && mod(s,12)===7) || (r===5 && [8,9].includes(mod(s,12)));
      if(d<0 || !ok) falla(`1: sonoridad ${k+1} no consonante (${d} pasos, ${s} st)`);
    });
  } else if(mias.join()!==suyas.join()) falla(`${nivel}: ${mias} ≠ ${suyas}`);
  if(e.faltas.length>2) falla(nivel+': más de dos faltas');
  if(e.faltas.some((f,a)=>e.faltas.some((g,b)=>a!==b && Math.abs(f.paso-g.paso)<2))) falla(nivel+': dos faltas en el mismo paso o en pasos contiguos');
  if(nivel===2 && e.faltas.some(f=>f.voces.join()!==e.sel.join())) falla('2: falta fuera de la pareja resaltada');
  if(nivel>1){
    const iny = new Set(e.faltas.map(f=>f.regla+'@'+f.paso));
    const otras = CK.comprobar(e.key, e.acordes, e.voces).filter(f=>!iny.has(f.regla+'@'+f.evento));
    if(otras.length) falla(`${nivel}: otras faltas (4.º): ${otras.map(f=>f.regla+' '+f.texto).join('; ')}`);
  }
  if(P.dibujo(e).rotulos.length!==e.faltas.length) falla(nivel+': rótulos');
  suma(nivel+' n='+e.faltas.length); e.faltas.forEach(f=>suma(nivel+' tipo '+f.rotulo.replace(/ \(.*\)$/,'')));
  if(i<20) muestras.push(e);
}
console.log(`${N} instancias de cada nivel`);
console.log('Fallos: '+(fallos.n ? fallos.n+'\n  '+fallos.join('\n  ') : 'ninguno'));
const grupo = (pre,tot) => Object.keys(cuenta).filter(k=>k.startsWith(pre)).sort().map(k=>k.slice(pre.length)+' '+(tot ? (100*cuenta[k]/tot).toFixed(1)+'%' : cuenta[k])).join(' · ');
for(const nv of [1,2,3]){
  console.log(`Nivel ${nv}, nº de faltas: `+grupo(nv+' n=', N));
  console.log(`Nivel ${nv}, faltas por tipo (recuento): `+grupo(nv+' tipo ', 0));
}

if(conVerovio){
  const verovio = require(BASE + 'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized = () => {
    const tk = new verovio.toolkit();
    tk.setOptions({scale:60, adjustPageHeight:true, pageWidth:1250, header:'none', footer:'none', breaks:'none', font:'Leland'});
    let mal=0;
    for(const e of muestras){
      const ok = tk.loadData(P.toMEI(e));
      const svg = ok ? tk.renderToSVG(1) : '', c = re => (svg.match(re)||[]).length;
      const nv = e.voces.length;
      const faltan = [...Array(nv).keys()].flatMap(v=>[...Array(P.N).keys()].map(k=>`id="n${v}_${k}"`)).filter(s=>!svg.includes(s)).length;
      const gris = c(/class="note gris/g), grisEsperado = e.sel && nv===4 ? 2*P.N : 0;
      const r = {ok, notas:c(/class="note[ "]/g), harm:c(/class="harm/g), faltan, gris};
      if(!ok || r.notas!==P.N*nv || r.harm!==0 || faltan || gris!==grisEsperado){ mal++; if(mal<5) console.log('VEROVIO', e.nivel, r); }
    }
    console.log(`Verovio: ${muestras.length} MEI · con problema: ${mal}`);
  };
}
