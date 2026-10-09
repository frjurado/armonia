// Validación masiva de disposicion-core.js (docs/familias/disposicion.md).
// Uso: node tests/masivo-disposicion.js [n] [--sin-verovio]
// Con reglas escritas AQUÍ (no con el comprobador que usa el core):
// Entre dos voces — cada sonoridad: como mucho una falta (> 8.ª, cruce o
//   unísono), la que dice la respuesta; las notas, en su tesitura.
// A cuatro voces — cada acorde: tríada completa, el bajo en la fundamental;
//   como mucho una falta (tesitura, > 8.ª entre S–A o A–T o > 15.ª entre T–B,
//   cruce), la que dice
//   la respuesta; sin falta, la disposición recalculada por la distancia
//   tenor–soprano coincide, y la duplicación es la que toca (fundamental en
//   cerrada y abierta; 3.ª o 5.ª en mixta).
// Además: en Entre dos voces, intervalos consonantes (o 4.ª justa) y sin repetir;
// en A cuatro voces, sin unísonos y sin grados repetidos. Reparto de faltas y disposiciones, y render.
const path = require('path');
const BASE = path.join(__dirname, '../public/');
const D = require(BASE + 'ejercicios/disposicion-core.js');
const N = +(process.argv[2] || 1500);
const conVerovio = !process.argv.includes('--sin-verovio');

const L=['C','D','E','F','G','A','B'], SEMI={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const midi = p => (p.oct+1)*12 + SEMI[p.letter] + p.alter;
const IDX=(l,o)=>o*7+L.indexOf(l);
const RANGO = {soprano:[IDX('C',4),IDX('A',5)], contralto:[IDX('F',3),IDX('D',5)], tenor:[IDX('C',3),IDX('A',4)], bajo:[IDX('E',2),IDX('C',4)]};
const fuera = (p, r) => p.abs<RANGO[r][0] || p.abs>RANGO[r][1];
const fallos=[]; const falla=m=>{ if(fallos.length<15) fallos.push(m); fallos.n=(fallos.n||0)+1; };
const cuenta={}, suma=k=>cuenta[k]=(cuenta[k]||0)+1;
const muestras=[];

for(let i=0;i<N;i++){
  // --- dos voces ---
  const e = D.generarDosVoces();
  if(!e){ falla('dos: sin instancia'); continue; }
  e.voces[0].forEach((a,k)=>{
    const g = e.voces[1][k], mias=[];
    if(fuera(a,e.roles[0]) || fuera(g,e.roles[1])) mias.push('N1');
    if(midi(a)<midi(g)) mias.push('N3');
    else if(midi(a)===midi(g)) mias.push('P2');
    if(a.abs-g.abs>7) mias.push('N2');
    const resp = e.porSon[k].map(f=>f.regla);
    if(mias.length>1) falla('dos: más de una falta '+mias);
    if(mias.join()!==resp.join()) falla(`dos: ${mias} ≠ ${resp}`);
    // el intervalo: consonante o 4.ª justa, y ninguno repetido en el ejercicio
    const st=Math.abs(a.abs-g.abs), s=((Math.abs(midi(a)-midi(g)))%12), simple=st%7;
    const ok = ({0:[0],2:[3,4],3:[5],4:[7],5:[8,9]})[simple];
    if(!ok || !ok.includes(s)) falla(`dos: intervalo disonante (${st} pasos, ${s} st)`);
    suma('dos '+(mias[0]||'bien'));
  });
  const nombres = e.voces[0].map((a,k)=>{ const g=e.voces[1][k]; return (a.abs<g.abs?'x':'')+(a.abs-g.abs)+':'+(midi(a)-midi(g)); });
  if(new Set(nombres).size!==nombres.length) falla('dos: intervalo repetido '+nombres);
  if(e.rotulos.length!==D.N_DOS || e.rotulos.some(r=>!r.length)) falla('dos: rótulos');
  if(i<40) muestras.push(e);
  // --- cuatro voces ---
  const c = D.generarCuatroVoces();
  if(!c){ falla('cuatro: sin instancia'); continue; }
  const R=['soprano','contralto','tenor','bajo'];
  c.voces[0].forEach((_,k)=>{
    const v = c.voces.map(x=>x[k]), mias=[];
    v.forEach((p,j)=>{ if(fuera(p,R[j])) mias.push('N1'); });
    if(v[0].abs-v[1].abs>7 || v[1].abs-v[2].abs>7 || v[2].abs-v[3].abs>14) mias.push('N2');   // T–B: 15.ª
    for(let j=0;j<3;j++) if(midi(v[j])<midi(v[j+1])) mias.push('N3');
    const resp = c.porAcorde[k].map(f=>f.regla);
    if(new Set(mias).size>1 || mias.length>1) falla('cuatro: más de una falta '+mias);
    if(mias.join()!==resp.join()) falla(`cuatro: ${mias} ≠ ${resp}`);
    // tríada completa sobre la fundamental del bajo
    const raiz = ((v[3].abs%7)+7)%7, clases = v.map(p=>(((p.abs%7)+7)%7 - raiz + 7)%7);
    if(![0,2,4].every(x=>clases.includes(x)) || clases.some(x=>![0,2,4].includes(x))) falla('cuatro: acorde incompleto o con nota ajena');
    if(!mias.length){
      const d = v[0].abs-v[2].abs, disp = d<7?'cerrada':d>7?'abierta':'mixta';
      if(disp!==c.disposiciones[k]) falla(`cuatro: disposición ${disp} ≠ ${c.disposiciones[k]}`);
      const dobl = [0,2,4].find(x=>clases.filter(y=>y===x).length===2);
      if(disp==='mixta' ? dobl===0 : dobl!==0) falla(`cuatro: duplicación ${dobl} en ${disp}`);
      suma('cuatro '+disp);
    } else suma('cuatro '+mias[0]);
    if(new Set(v.map(midi)).size<4) falla('cuatro: unísono');
  });
  if(new Set(c.grados).size!==c.grados.length) falla('cuatro: grado repetido '+c.grados);
  if(c.rotulos.length!==D.N_CUATRO || c.rotulos.some(r=>r.length!==1)) falla('cuatro: rótulos');
  if(i<40) muestras.push(c);
}
console.log(`${N} instancias de cada consigna`);
console.log('Fallos: '+(fallos.n ? fallos.n+'\n  '+fallos.join('\n  ') : 'ninguno'));
const grupo = (pre,tot) => Object.keys(cuenta).filter(k=>k.startsWith(pre)).sort().map(k=>k.slice(pre.length)+' '+(100*cuenta[k]/tot).toFixed(1)+'%').join(' · ');
console.log('Entre dos voces (por sonoridad): '+grupo('dos ', N*D.N_DOS));
console.log('A cuatro voces (por acorde): '+grupo('cuatro ', N*D.N_CUATRO));

if(conVerovio){
  const verovio = require(BASE + 'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized = () => {
    const tk = new verovio.toolkit();
    tk.setOptions({scale:60, adjustPageHeight:true, pageWidth:1000, header:'none', footer:'none', breaks:'none', font:'Leland'});
    let mal=0;
    for(const e of muestras){
      const ok = tk.loadData(D.toMEI(e, {mascara:true}));
      const svg = ok ? tk.renderToSVG(1) : '', c = re => (svg.match(re)||[]).length;
      const n = e.voces[0].length, nv = e.voces.length;
      // sin <harm> (los rótulos se dibujan aparte, y no deben ensanchar compases)
      const r = {ok, notas:c(/class="note"/g), medidas:c(/class="measure"/g), harm:c(/class="harm/g)};
      if(!ok || r.notas!==n*nv || r.medidas!==n || r.harm!==0){ mal++; if(mal<5) console.log('VEROVIO', e.tipo, r); }
    }
    console.log(`Verovio: ${muestras.length} MEI con máscara · con problema: ${mal}`);
  };
}
