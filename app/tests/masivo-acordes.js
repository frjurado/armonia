// Validación masiva de acordes-core.js (docs/familias/acordes.md).
// Uso: node tests/masivo-acordes.js [n instancias por consigna] [--sin-verovio]
// Comprueba, con reglas escritas aquí y no en el core:
//   1. el acorde suena con el tipo declarado (por semitonos) y con la
//      inversión declarada (qué nota está en el bajo);
//   2. disposición por tercios: 'sol' y 'fa', cerrada (dentro de una 8.ª) y en
//      su pentagrama; 'repartido', el bajo en Fa y las otras dos en Sol,
//      a menos de una 8.ª entre sí;
//   3. con grados: notas de la escala (menor: sensible solo en V y VII);
//   4. render en Verovio: dos pentagramas, tres notas, el dato si lo hay.
const path = require('path');
const BASE = path.join(__dirname, '../public/');
global.MiniLily = require(BASE + 'ejercicios/mini-lilypond-parser.js');
const A = require(BASE + 'ejercicios/acordes-core.js');
const N = +(process.argv[2] || 3000);
const conVerovio = !process.argv.includes('--sin-verovio');

const SEMI = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const midi = n => (n.oct+1)*12 + SEMI[n.letter] + n.alter;
const TIPOS = {mayor:[4,7], menor:[3,7], disminuida:[3,6], aumentada:[4,8]};
const fallos = []; const falla = (c, m) => { if(fallos.length<20) fallos.push(c+': '+m); fallos.n=(fallos.n||0)+1; };
const cuenta = {}; const suma = k => cuenta[k]=(cuenta[k]||0)+1;
const muestras = [];

for(const v of ['tipo','inversion','grados']){
  for(let k=0;k<N;k++){
    const e = A.generar(v);
    if(!e){ falla(v,'sin instancia'); continue; }
    const notas = (e.single ? e.notes : [e.bass].concat(e.upper)).slice().sort((a,b)=>midi(a)-midi(b));
    const ms = notas.map(midi);
    // tipo: desde la fundamental, por clases de altura
    const rootPc = (SEMI[e.root.letter]+e.root.alter+120)%12;
    const pcs = new Set(ms.map(m=>((m-rootPc)%12+12)%12));
    const [t3, t5] = TIPOS[e.type];
    if(!(pcs.has(0) && pcs.has(t3) && pcs.has(t5) && pcs.size===3)) falla(v, `no es ${e.type}: ${JSON.stringify(notas)}`);
    // inversión: la nota del bajo
    const bajoPc = ((ms[0]-rootPc)%12+12)%12;
    const invReal = bajoPc===0 ? 0 : bajoPc===t3 ? 1 : 2;
    if(invReal !== e.inv) falla(v, `inversión ${invReal} ≠ ${e.inv}`);
    if(v!=='inversion' && e.inv!==0) falla(v, 'inversión en una consigna en fundamental');
    // disposición
    suma(v+' '+e.disp);
    if(e.disp==='repartido'){
      if(e.single) falla(v,'repartido en un solo pentagrama');
      if(midi(e.bass) > 60) falla(v,'bajo demasiado agudo para Fa');
      const sup = e.upper.map(midi);
      if(Math.min(...sup) < 60) falla(v,'nota aguda por debajo de Do4');
      if(Math.max(...sup)-Math.min(...sup) > 12) falla(v,'las dos de arriba a más de una 8.ª');
    }else{
      if(!e.single || e.clef !== (e.disp==='sol'?'treble':'bass')) falla(v,'clave mal');
      if(ms[2]-ms[0] >= 12) falla(v,'no es posición cerrada');
      const [lo,hi] = e.clef==='treble' ? [60,81] : [40,60];
      if(ms[0]<lo || ms[2]>hi) falla(v,'fuera de la tesitura de su clave');
    }
    if(v==='grados'){
      const L=['C','D','E','F','G','A','B'], t=L.indexOf(e.key.tonic);
      const sig={}; L.forEach(x=>sig[x]=0);
      const SH=['F','C','G','D','A','E','B'], FL=['B','E','A','D','G','C','F'];
      if(e.key.sig>0) SH.slice(0,e.key.sig).forEach(x=>sig[x]=1); else FL.slice(0,-e.key.sig).forEach(x=>sig[x]=-1);
      for(const n of notas){
        const g=((L.indexOf(n.letter)-t)%7+7)%7;
        const sensible = e.key.mode==='minor' && g===6 && (e.grado===5 || e.grado===7);
        if(n.alter !== sig[n.letter] + (sensible?1:0)) falla(v, `nota fuera de la escala: ${n.letter}${n.alter} en ${e.key.nombre}, grado ${e.grado}`);
      }
    }
    if(k<40) muestras.push({v, e});
  }
}
console.log(`${N} instancias por consigna`);
console.log('Fallos: ' + (fallos.n ? fallos.n+'\n  '+fallos.join('\n  ') : 'ninguno'));
console.log('Disposiciones:'); Object.keys(cuenta).sort().forEach(k=>console.log(`  ${k}: ${(100*cuenta[k]/N).toFixed(1)} %`));

if(conVerovio){
  const verovio = require(BASE + 'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized = () => {
    const tk = new verovio.toolkit();
    tk.setOptions({scale:60, adjustPageHeight:true, pageWidth:900, header:'none', footer:'none', breaks:'none', font:'Leland'});
    let mal = 0;
    for(const {v, e} of muestras){
      const ok = tk.loadData(A.toMEI(e, v==='grados' ? {dato:e.key.nombre} : {}));
      const svg = ok ? tk.renderToSVG(1) : '', c = re => (svg.match(re)||[]).length;
      const r = {ok, notas:c(/class="note"/g), staffs:c(/class="staff"/g), dato:c(/class="reh dato"/g)};
      if(!ok || r.notas!==3 || r.staffs!==2 || r.dato!==(v==='grados'?1:0)){ mal++; if(mal<5) console.log('VEROVIO', v, e.disp, r); }
    }
    console.log(`Verovio: ${muestras.length} MEI · con problema: ${mal}`);
  };
}
