// Validación masiva de la familia Prolongación (c4u0-prolongacion-core.js) sobre
// el motor a cuatro voces, con el comprobador independiente
// (cuatro-voces-check.js). Puntos de docs/familias/prolongacion.md §9:
//   1. cero infracciones de las normas;
//   2. ritmo: ningún subordinado en parte fuerte, llegada en compás entero (o
//      6/4–V en la SC), 6/4 cadencial según N9, número de compases del tipo,
//      SC del periodo en el c. 4, y cuadre de cada voz con el parser;
//   3. gramática: sin células repetidas seguidas, sin pares de notas del bajo
//      repetidos seguidos dentro de una prolongación, sin V en estado
//      fundamental en una prolongación de I, periodo siempre SC–CA;
//   4. lecturas: el análisis del bajo recupera la realización generada;
//      frecuencia de notas con 2 y 3 lecturas y de segmentaciones múltiples;
//   5. tonalidad única (tipos 2 y 3): el bajo no se analiza en la relativa
//      (con el analizador del core: no es una comprobación independiente);
//   6. frecuencias de células, formas y compases, y render en Verovio.
// Uso: node tests/masivo-prolongacion.js [nivel 1–3] [tipo 1–3] [n] [--sin-verovio]
const path = require('path');
const BASE = path.join(__dirname, '..', 'public') + '/';
const CK = require(BASE + 'ejercicios/cuatro-voces-check.js');
const ML = require(BASE + 'ejercicios/mini-lilypond-parser.js');
const P  = require(BASE + 'ejercicios/c4u0-prolongacion-core.js');
const C  = require(BASE + 'ejercicios/c4u0-cadencias-core.js');

const nivel = parseInt(process.argv[2] || '1', 10);
const tipo  = parseInt(process.argv[3] || '2', 10);
const N = parseInt(process.argv[4] || '1000', 10);
const conVerovio = !process.argv.includes('--sin-verovio');
const COMPASES = {1:[2,3], 2:[4], 3:[8]};

const inc = (o,k,d=1) => { o[k]=(o[k]||0)+d; };
const porRegla={}, fallos={}, porCelula={}, porForma={}, porCompas={}, porLecturas={}, porSoprano={};
let total=0, nulos=0, seg=0, penSum=0, n9tern=0; const ejemplos=[]; const muestra=[];
const fallo = (k, inst, txt) => { inc(fallos,k); if((fallos[k]||0)<=3) console.log('FALLO '+k+': '+txt+' · '+inst.key.nombre+' ['+inst.ritmo.plantilla+'] '+inst.ids.join(' ')); };
const t0=Date.now();
for(let i=0;i<N;i++){
  const inst=P.generar(tipo, nivel);
  if(!inst){ nulos++; continue; }
  total++; penSum+=inst.pen;
  const {ev, tramos, celulas, frases}=inst.est, n=ev.length, r=inst.ritmo;
  // 1
  const faltas=CK.comprobar(inst.key, inst.acordes, inst.voces);
  faltas.forEach(f=>inc(porRegla,f.regla));
  if(faltas.length && ejemplos.length<5) ejemplos.push({ids:inst.ids.join(' '), voces:inst.json.voices.map(v=>v.music), faltas:faltas.map(f=>f.regla+' ev'+f.evento+' '+f.texto)});
  // 2. ritmo
  const barDe=[], posDe=[];
  r.compases.forEach((m,b)=>m.forEach((x,j)=>{ barDe[x.k]=b; posDe[x.k]=j; }));
  if(!COMPASES[tipo].includes(r.nCompases)) fallo('compases', inst, r.nCompases+' compases');
  ev.forEach((e,k)=>{ if(e.rol==='S' && posDe[k]===0) fallo('subordinado-fuerte', inst, 'evento '+k); });
  frases.forEach(f=>{
    const b=barDe[f.hasta], m=r.compases[b];
    const ok = m.length===1 || (m.length===2 && ev[f.hasta-1].rol==='D64');
    if(!ok || m[m.length-1].k!==f.hasta) fallo('llegada', inst, 'frase '+f.desde+'–'+f.hasta);
  });
  ev.forEach((e,k)=>{
    if(e.rol!=='D64') return;
    const m=r.compases[barDe[k]], tern=C.n9Ternario(r.time, m.map(x=>x.dur), posDe[k]);
    if(tern) n9tern++;
    if(!(barDe[k+1]===barDe[k] && (r.fuerza[k]>r.fuerza[k+1] || tern))) fallo('N9-ritmo', inst, 'evento '+k);
  });
  if(tipo===3 && barDe[frases[0].hasta]!==3) fallo('SC-c4', inst, 'la SC acaba en el c. '+(barDe[frases[0].hasta]+1));
  inst.json.voices.forEach(v=>{
    const p=ML.parseVoice(v.music,{time:r.time});
    if(p.errors.length || p.events.length!==n) fallo('parser', inst, v.music+' '+JSON.stringify(p.errors));
  });
  // 3. gramática
  tramos.filter(t=>t.tipo==='prol').forEach(t=>{
    t.celulas.forEach((c,j)=>{ if(j>0 && t.celulas[j-1]===c) fallo('celula-repetida', inst, c); });
    if(t.armonia==='I') for(let k=t.desde;k<=t.hasta;k++) if(inst.ids[k]==='V'||inst.ids[k]==='V7') fallo('V-fundamental', inst, 'evento '+k);
  });
  { // bajo: ningún par repetido seguido dentro de una prolongación (comprobación propia)
    const b=inst.voces[3].map(p=>p.letter+p.alter);
    tramos.filter(t=>t.tipo==='prol').forEach(t=>{
      for(let k=t.desde;k+3<=t.hasta;k++) if(b[k]===b[k+2] && b[k+1]===b[k+3]) fallo('par-repetido', inst, 'evento '+k);
    });
  }
  if(tipo===3){
    const s=tramos.filter(t=>t.tipo==='cad').map(t=>t.sigla).join('-');
    if(s!=='SC-CA') fallo('periodo', inst, s);
  }
  // 4. lecturas
  const recupera = inst.analisis.some(a=>a.slots.every((sl,k)=>sl.includes(inst.ids[k])));
  if(!recupera) fallo('lectura', inst, 'el análisis no recupera la realización');
  inst.alternativas.forEach(a=>inc(porLecturas, a.length+1));
  if(inst.segmentaciones>1){ seg++; if(seg<=3) console.log('   varias segmentaciones:', inst.ids.join(' '), inst.analisis.map(a=>a.tramos.map(P.etiquetaTramo).join('+')).join(' | ')); }
  // 5. tonalidad
  if(tipo>1){
    const bajo=inst.voces[3].map(p=>({letter:p.letter, alter:p.alter}));
    if(P.relativas(inst.key).some(rel=>P.analizar(rel, nivel, tipo, bajo).length)) fallo('tonalidad', inst, 'se lee en la relativa');
  }
  // 6. frecuencias
  celulas.forEach(c=>inc(porCelula,c.id));
  inc(porForma, P.resumen(inst));
  inc(porCompas, r.time);
  tramos.filter(t=>t.tipo==='prol').forEach(t=>t.celulas.forEach(()=>{}));
  celulas.forEach(c=>{ if(P.SOPRANO[c.id]) inc(porSoprano, c.id+' '+inst.voces[0].slice(c.desde,c.hasta+1).map(p=>p.deg).join('–')); });
  if(conVerovio && muestra.length<120 && i%Math.max(1,Math.floor(N/120))===0) muestra.push(inst);
}
const ms=Date.now()-t0;
console.log(`\nNivel ${nivel} · tipo ${tipo} · ${total} instancias · ${ms} ms (${(ms/Math.max(1,total)).toFixed(1)} ms/inst) · sin instancia: ${nulos} · pen media ${(penSum/total).toFixed(2)}`);
console.log('1. Infracciones por regla:', JSON.stringify(porRegla));
console.log('2–5. Fallos de ritmo, gramática, lecturas y tonalidad:', JSON.stringify(fallos));
console.log('4. Notas por número de lecturas:', JSON.stringify(porLecturas), ' · instancias con varias segmentaciones:', seg);
console.log('Por compás:', JSON.stringify(porCompas), ' · 6/4 cadencial en el 2.º tiempo de 3/4:', n9tern);
console.log('\n6. Formas:'); Object.entries(porForma).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(String(v).padStart(6), (100*v/total).toFixed(1).padStart(5)+'%', k));
const totCel=Object.values(porCelula).reduce((a,b)=>a+b,0);
console.log('\n6. Células (sobre '+totCel+'):'); Object.entries(porCelula).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(String(v).padStart(6), (100*v/totCel).toFixed(1).padStart(5)+'%', k));
console.log('\nSoprano por célula (top 3):');
Object.keys(P.SOPRANO).forEach(c=>{
  const top=Object.entries(porSoprano).filter(([k])=>k.startsWith(c+' ')).sort((a,b)=>b[1]-a[1]);
  const tot=top.reduce((s,[,v])=>s+v,0); if(!tot) return;
  console.log('  '+c.padEnd(10)+' '+top.slice(0,3).map(([k,v])=>k.slice(c.length+1)+' '+(100*v/tot).toFixed(0)+'%').join(' · '));
});
if(ejemplos.length){ console.log('\nEjemplos con faltas:'); console.log(JSON.stringify(ejemplos,null,1)); }

if(conVerovio){
  const verovio=require(BASE+'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized=()=>{
    const tk=new verovio.toolkit();
    tk.setOptions({scale:60,adjustPageHeight:true,pageWidth:1000,header:'none',footer:'none',breaks:tipo===3?'encoded':'none',font:'Leland'});
    let mal=0; const t1=Date.now();
    muestra.forEach(inst=>{
      const alt=inst.alternativas.reduce((s,a)=>s+a.length,0);
      const mei=P.toMEI(inst,{cifrados:true, tramos:true, dato:inst.tipo===1?inst.key.nombre:null, saltoFrase:true});
      const ok=tk.loadData(mei);
      const svg=ok ? tk.renderToSVG(1) : '';
      const notas=(svg.match(/class="note"/g)||[]).length, harms=(svg.match(/class="harm( alt| americano)?"/g)||[]).length,
            medidas=(svg.match(/class="measure"/g)||[]).length, dirs=(svg.match(/class="reh tramo"/g)||[]).length,
            sistemas=(svg.match(/class="system"/g)||[]).length, paginas=tk.getPageCount();
      const n=inst.ids.length;
      if(!ok || notas!==4*n || harms!==2*n+alt || medidas!==inst.ritmo.nCompases || dirs!==inst.est.tramos.length
         || paginas!==1 || sistemas!==(inst.tipo===3?2:1)){
        mal++; if(mal<5) console.log('VEROVIO', inst.ritmo.plantilla, {ok, notas, esp:4*n, harms, espH:2*n+alt, medidas, dirs, sistemas, paginas});
      }
      // Con máscara, como la página: todo dibujado; voces superiores, cifrados,
      // alternativas y tramos con la clase «resp»; el dato, no.
      const svgM=tk.loadData(P.toMEI(inst,{mascara:true, ocultas:[0,1,2], cifrados:true, tramos:true,
        dato:inst.tipo===1?inst.key.nombre:null, saltoFrase:true})) ? tk.renderToSVG(1) : '';
      const cM=re=>(svgM.match(re)||[]).length;
      const rM={notas:cM(/class="note"/g), capas:cM(/class="layer resp"/g), harms:cM(/class="harm[^"]*"/g),
        harmsResp:cM(/class="harm[^"]* ?resp"/g), tramos:cM(/class="reh tramo resp"/g), dato:cM(/class="reh dato"/g)};
      if(rM.notas!==4*n || rM.capas!==3*inst.ritmo.nCompases || rM.harms!==rM.harmsResp || rM.harms!==2*n+alt
         || rM.tramos!==inst.est.tramos.length || rM.dato!==(inst.tipo===1?1:0)){
        mal++; if(mal<5) console.log('VEROVIO máscara', rM);
      }
    });
    console.log(`\n6. Verovio: ${2*muestra.length} MEI renderizados (con y sin máscara) en ${Date.now()-t1} ms · con problema: ${mal}`);
  };
}
