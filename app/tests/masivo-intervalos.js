// Validación masiva de intervalos-core.js (docs/familias/intervalos.md).
// Uso: node tests/masivo-intervalos.js [n instancias por consigna] [--sin-verovio]
// Comprueba, con reglas escritas aquí y no en el core:
//   1. aumentados y disminuidos: solo 4.ª A, 5.ª D, 2.ª A, 7.ª D, 5.ª A, 4.ª D
//      (y sus compuestos); nunca dobles;
//   2. amplitud: hasta la 12.ª (Identificación, Con grados); 2.ª–7.ª (Inversión);
//   3. sin cruces (la nota aguda nunca suena más grave);
//   4. líneas adicionales: como mucho 2 en el pentagrama de cada nota;
//   5. Con grados: todas las notas son de la escala (menor armónica);
//   6. la calidad, recalculada aquí por semitonos, coincide con la del core;
//   7. render en Verovio: notas, pentagramas y grados (con máscara).
const path = require('path');
const BASE = path.join(__dirname, '../public/');
global.MiniLily = require(BASE + 'ejercicios/mini-lilypond-parser.js');
const I = require(BASE + 'ejercicios/intervalos-core.js');
const N = +(process.argv[2] || 3000);
const conVerovio = !process.argv.includes('--sin-verovio');

const LET = ['C','D','E','F','G','A','B'], SEMI = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const abs = n => n.oct*7 + LET.indexOf(n.letter);
const midi = n => (n.oct+1)*12 + SEMI[n.letter] + n.alter;
// calidad por mi cuenta: semitonos de la forma simple frente a la mayor/justa
function calidad(steps, semis){
  const s = steps<=7 ? steps : steps - 7*Math.floor((steps-1)/7);
  const oct = Math.floor((steps - s) / 7);
  const d = semis - ([0,2,4,5,7,9,11,12][s] + 12*oct);
  const perf = [0,3,4,7].includes(s);
  const q = perf ? {0:'justa',1:'aumentada','-1':'disminuida'}[d] : {0:'mayor','-1':'menor',1:'aumentada','-2':'disminuida'}[d];
  return {s, q: q || 'doble'};
}
const PERMITIDOS = new Set(['4.ª aumentada','5.ª disminuida','2.ª aumentada','7.ª disminuida','5.ª aumentada','4.ª disminuida']);
const LIMITES = {1:[LET.indexOf('E')+4*7, LET.indexOf('F')+5*7], 2:[LET.indexOf('G')+2*7, LET.indexOf('A')+3*7]};
const lineas = (n, staff) => { const a=abs(n), [lo,hi]=LIMITES[staff]; return a>hi ? Math.ceil((a-hi-1)/2) : a<lo ? Math.ceil((lo-a-1)/2) : 0; };

const fallos = []; const falla = (c, m) => { if(fallos.length < 20) fallos.push(c+': '+m); fallos.n = (fallos.n||0)+1; };
const cuenta = {}; const suma = k => cuenta[k] = (cuenta[k]||0) + 1;
const muestras = [];

for(const consigna of ['normal','inversion','grados']){
  const gen = {normal:I.generarNormal, inversion:I.generarInversion, grados:I.generarGrados}[consigna];
  for(let k=0;k<N;k++){
    const e = gen();
    if(!e){ falla(consigna, 'sin instancia'); continue; }
    const steps = abs(e.upper) - abs(e.lower), semis = midi(e.upper) - midi(e.lower);
    if(steps !== e.steps) falla(consigna, `pasos ${steps} ≠ ${e.steps}`);
    if(semis < 0) falla(consigna, `cruce ${JSON.stringify(e.lower)} ${JSON.stringify(e.upper)}`);
    const {s, q} = calidad(steps, semis);
    if(q !== e.quality) falla(consigna, `calidad ${q} ≠ ${e.quality} (${steps} pasos, ${semis} st)`);
    if(q==='doble') falla(consigna, 'doble aumentado/disminuido');
    const nombre = (s+1)+'.ª '+q;
    if((q==='aumentada'||q==='disminuida') && !PERMITIDOS.has(nombre)) falla(consigna, 'alterado no admitido: '+nombre);
    if(consigna==='inversion'){
      if(steps<1 || steps>6) falla(consigna, 'amplitud '+steps);
      const ii = e.inv; const s2 = abs(ii.upper)-abs(ii.lower);
      if(s2 !== 7-steps) falla(consigna, 'inversión mal');
      const c2 = calidad(s2, midi(ii.upper)-midi(ii.lower));
      if(c2.q !== ii.quality) falla(consigna, 'calidad de la inversión');
    }else{
      if(steps > 11) falla(consigna, 'más allá de la 12.ª: '+steps);
      suma(consigna+' disp '+e.disp);
      if(steps > 7) suma(consigna+' compuestos');
    }
    if(consigna==='grados'){
      const L = ['C','D','E','F','G','A','B'], t = L.indexOf(e.key.tonic);
      for(const n of [e.lower, e.upper]){
        const grado = ((L.indexOf(n.letter)-t)%7+7)%7;
        const sig = {}; L.forEach(x=>sig[x]=0);
        const SH=['F','C','G','D','A','E','B'], FL=['B','E','A','D','G','C','F'];
        if(e.key.sig>0) SH.slice(0,e.key.sig).forEach(x=>sig[x]=1); else FL.slice(0,-e.key.sig).forEach(x=>sig[x]=-1);
        const esperado = sig[n.letter] + (e.key.mode==='minor' && grado===6 ? 1 : 0);
        if(n.alter !== esperado) falla(consigna, `nota fuera de la escala de ${e.key.nombre}: ${n.letter}${n.alter}`);
      }
    }
    if(q==='aumentada'||q==='disminuida') suma(consigna+' '+nombre);
    if(k < 60) muestras.push({consigna, e});
  }
}

console.log(`${N} instancias por consigna`);
console.log('Fallos: ' + (fallos.n ? fallos.n + '\n  ' + fallos.join('\n  ') : 'ninguno'));
console.log('Recuentos:'); Object.keys(cuenta).sort().forEach(k => console.log(`  ${k}: ${(100*cuenta[k]/N).toFixed(1)} %`));

if(conVerovio){
  const verovio = require(BASE + 'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized = () => {
    const tk = new verovio.toolkit();
    tk.setOptions({scale:60, adjustPageHeight:true, pageWidth:900, header:'none', footer:'none', breaks:'none', font:'Leland'});
    let mal = 0, lin = 0, revisadas = 0;
    for(const {consigna, e} of muestras){
      const mei = consigna==='grados' ? e.mei({mascara:true, dato:e.key.nombre}) : e.mei({mascara:true});
      const ok = tk.loadData(mei), svg = ok ? tk.renderToSVG(1) : '';
      const c = re => (svg.match(re)||[]).length;
      const notas = c(/class="note"/g), staffs = c(/class="staff"/g), dirs = c(/class="dir resp"/g), reh = c(/class="reh dato"/g);
      const esp = consigna==='inversion' ? {notas:4, staffs:2, dirs:0, reh:0} : {notas:2, staffs:2, dirs: consigna==='grados'?2:0, reh: consigna==='grados'?1:0};
      if(!ok || notas!==esp.notas || staffs!==esp.staffs || dirs!==esp.dirs || reh!==esp.reh){
        mal++; if(mal<5) console.log('VEROVIO', consigna, {ok, notas, staffs, dirs, reh}, esp);
      }
      // líneas adicionales: por mi cuenta, en el pentagrama de cada nota
      if(consigna!=='inversion'){
        const mLo = mei.match(/<staff n="(\d)">(?:(?!<\/staff>).)*xml:id="m0b"/), mHi = mei.match(/<staff n="(\d)">(?:(?!<\/staff>).)*xml:id="m0s"/);
        if(mLo && mHi) revisadas++;
        if(mLo && mHi && (lineas(e.lower, +mLo[1]) > 2 || lineas(e.upper, +mHi[1]) > 2)){ lin++; if(lin<5) console.log('LÍNEAS', e.lower, e.upper, e.disp); }
      }
    }
    console.log(`Verovio: ${muestras.length} MEI con máscara · con problema: ${mal} · líneas adicionales revisadas en ${revisadas}, con más de 2: ${lin}`);
  };
}
