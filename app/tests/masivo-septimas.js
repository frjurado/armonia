// Validación masiva de la familia 7.ª diatónica (septimas-core.js), sobre el
// motor a cuatro voces y con el comprobador independiente (docs/familias/septimas.md §7):
//   1. cero infracciones de las normas (N16 incluida);
//   2. la línea de la 7.ª: preparada por nota común en la misma voz, mantenida
//      (6/4) y resuelta bajando por grado; en II grado, la voz de la 7.ª es la
//      de la sensible, y en el primer acorde una sola voz superior lleva la nota;
//   3. cuadre rítmico: cada voz pasa el bar check del parser;
//   4. frecuencias de fórmulas (para ajustar pesos);
//   5. Bajo dado: al menos un II o IV con 7.ª, y la línea de cada una;
//   6. el MEI carga y se renderiza en Verovio (muestra), con la ligadura.
// Uso: node tests/masivo-septimas.js [n instancias por consigna y nivel] [--sin-verovio]
const path = require('path');
const BASE = path.join(__dirname, '..', 'public') + '/';
const CK = require(BASE + 'ejercicios/cuatro-voces-check.js');
const ML = require(BASE + 'ejercicios/mini-lilypond-parser.js');
const S  = require(BASE + 'ejercicios/septimas-core.js');
const CV = require(BASE + 'ejercicios/cuatro-voces-core.js');

const N = parseInt(process.argv[2] || '800', 10);
const conVerovio = !process.argv.includes('--sin-verovio');
const muestra=[];

function lineaBien(inst, l){
  const v=l.v, V=inst.voces[v], p=l.sept;
  if(V[p-1].abs!==V[p].abs || V[p-1].alter!==V[p].alter) return 'sin preparar';
  if(l.res==null) return 'sin resolver';
  if(V[l.res].abs!==V[p].abs-1) return 'no baja por grado';
  return null;
}
function cuadra(inst){
  let mal=0;
  inst.json.voices.forEach(v=>{
    const p=ML.parseVoice(v.music,{time:inst.json.context.time, partial:inst.json.context.partial});
    if(p.errors.length || p.events.length!==inst.ids.length) mal++;
  });
  return mal;
}

const t0=Date.now();
for(const consigna of ['ii','iiiv']) for(const nivel of [1,2]){
  const porRegla={}, porFormula={}; let nulos=0, total=0, lineas=0, voces=0, unica=0, parser=0;
  for(let i=0;i<N;i++){
    const inst=S.generar(consigna, nivel);
    if(!inst){ nulos++; continue; }
    total++;
    const fk=inst.ids.join('–')+(inst.key.mode==='minor'?' (m)':' (M)');
    porFormula[fk]=(porFormula[fk]||0)+1;
    CK.comprobar(inst.key, inst.acordes, inst.voces).forEach(f=>{ porRegla[f.regla]=(porRegla[f.regla]||0)+1; });
    const e=lineaBien(inst, inst.linea); if(e){ lineas++; if(lineas<4) console.log('LÍNEA', e, fk); }
    if(consigna==='ii'){
      if(inst.linea.v!==inst.vSens) voces++;
      const t7=inst.acordes[inst.pd].tones.find(t=>t.rol==='7');
      if(inst.linea.v!==3 && [0,1,2].filter(v=>inst.voces[v][0].deg===t7.deg).length!==1) unica++;
    }
    parser+=cuadra(inst);
    if(conVerovio && muestra.length<400 && i%Math.max(1,Math.floor(N/50))===0) muestra.push({inst, tipo:'cad', fk});
  }
  console.log(`\n${consigna} · nivel ${nivel} · ${total} instancias · sin instancia ${nulos}`);
  console.log('  1. infracciones:', JSON.stringify(porRegla), ' 2. líneas mal:', lineas, ' 7.ª≠sensible:', voces, ' voz no única:', unica, ' 3. parser:', parser);
  console.log('  4. fórmulas:', Object.keys(porFormula).length, 'distintas; top 8:');
  Object.entries(porFormula).sort((a,b)=>b[1]-a[1]).slice(0,8).forEach(([k,v])=>console.log('     '+String(v).padStart(5), (100*v/total).toFixed(1).padStart(5)+'%', k));
}
for(const nivel of [1,2]){
  const porRegla={}, porSept={}; let nulos=0, total=0, sin=0, lineas=0, parser=0;
  const n=Math.max(50, Math.floor(N/4));
  for(let i=0;i<n;i++){
    const inst=S.generarFrase(nivel);
    if(!inst){ nulos++; continue; }
    total++;
    CK.comprobar(inst.key, inst.acordes, inst.voces).forEach(f=>{ porRegla[f.regla]=(porRegla[f.regla]||0)+1; });
    const sept=inst.ids.filter(id=>S.SEPTIMAS.includes(id));
    if(!sept.length) sin++;
    sept.forEach(id=>{ porSept[id]=(porSept[id]||0)+1; });
    inst.lineas.forEach(l=>{ const e=lineaBien(inst,l); if(e){ lineas++; if(lineas<4) console.log('LÍNEA', e, inst.ids.join(' ')); } });
    parser+=cuadra(inst);
    if(conVerovio && muestra.length<450 && i%Math.max(1,Math.floor(n/25))===0) muestra.push({inst, tipo:'frase'});
  }
  console.log(`\nbajo dado · nivel ${nivel} · ${total} instancias · sin instancia ${nulos}`);
  console.log('  1. infracciones:', JSON.stringify(porRegla), ' 5. sin 7.ª:', sin, ' líneas mal:', lineas, ' 3. parser:', parser, ' séptimas:', JSON.stringify(porSept));
}
// Secuencias (círculo de 5.as con 7.as, secuencia-core.js con {septimas}):
// 0 faltas con las licencias de la secuencia y, sin ellas, solo N7, N10, N12;
// cada 7.ª de la secuencia, preparada (ligadura) salvo el V7 final; parser.
const SQ = require(BASE + 'ejercicios/secuencia-core.js');
for(const tipo of [1,2,3]) for(const nivel of [1,2]){
  const porRegla={}, sinLic={}, porVar={}; let nulos=0, total=0, sinPrep=0, parser=0;
  const n=Math.max(60, Math.floor(N/5));
  for(let i=0;i<n;i++){
    const inst=SQ.generar(tipo, nivel, {septimas:true});
    if(!inst){ nulos++; continue; }
    total++;
    CK.comprobar(inst.key, inst.acordes, inst.voces, {licencias:inst.licencias}).forEach(f=>{ porRegla[f.regla]=(porRegla[f.regla]||0)+1; });
    CK.comprobar(inst.key, inst.acordes, inst.voces).forEach(f=>{ sinLic[f.regla]=(sinLic[f.regla]||0)+1; });
    const lig=new Set(SQ.ligaduras7(inst).map(([v,k])=>k));
    inst.est.tramos.filter(t=>t.tipo==='sec').forEach(t=>{
      const k=SQ.claveSec(t.sec); porVar[k]=(porVar[k]||0)+1;
      for(let j=t.desde;j<=t.hasta;j++) if(inst.acordes[j].septima && !lig.has(j)) sinPrep++;
    });
    // cuadre: cada voz, escrita con el ritmo, pasa el bar check del parser
    inst.voces.forEach(v=>{
      const music=inst.ritmo.compases.map(m=>m.map(x=>CV.token(v[x.k])+x.dur).join(' ')).join(' | ');
      const p=ML.parseVoice(music,{time:inst.ritmo.time, partial:inst.ritmo.partial||null});
      if(p.errors.length || p.events.length!==inst.ids.length) parser++;
    });
    if(conVerovio && muestra.length<600 && i%Math.max(1,Math.floor(n/20))===0) muestra.push({inst, tipo:'sec'});
  }
  const ajenas=Object.keys(sinLic).filter(r=>!['N7','N10','N12'].includes(r));
  console.log(`\nsecuencias · tipo ${tipo} · nivel ${nivel} · ${total} instancias · sin instancia ${nulos}`);
  console.log('  infracciones:', JSON.stringify(porRegla), ' sin licencias, ajenas a N7/N10/N12:', JSON.stringify(ajenas),
    ' 7.as sin preparar:', sinPrep, ' parser:', parser, ' variantes:', JSON.stringify(porVar));
}
console.log(`\n${Date.now()-t0} ms`);

if(conVerovio){
  const verovio=require(BASE+'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized=()=>{
    const tk=new verovio.toolkit();
    tk.setOptions({scale:60,adjustPageHeight:true,pageWidth:1000,header:'none',footer:'none',breaks:'none',font:'Leland'});
    let mal=0;
    muestra.forEach(({inst,tipo,fk})=>{
      const mei = tipo==='cad' ? S.toMEI(inst) : tipo==='sec' ? SQ.toMEI(inst, {mascara:true, ocultas:[0,1,2], cifrados:true, saltoFrase:true})
                : S.toMEIFrase(inst, {mascara:true, ocultas:[0,1,2], cifrados:true, tramos:true});
      const ok=tk.loadData(mei), svg=ok ? tk.renderToSVG(1) : '';
      const c=re=>(svg.match(re)||[]).length;
      const r={notas:c(/class="note[ "]/g), ties:c(/class="tie[ "]/g), medidas:c(/class="measure"/g)};
      const nLig = l => l.notas.filter(k=>k>l.prep && k!==l.res).length;   // preparación y 6/4
      const ties = tipo==='cad' ? nLig(inst.linea) : tipo==='sec' ? SQ.ligaduras7(inst).length : inst.lineas.reduce((s,l)=>s+nLig(l),0);
      if(!ok || r.notas!==inst.ids.length*4 || r.ties!==ties || r.medidas!==inst.ritmo.nCompases){
        mal++; if(mal<5) console.log('VEROVIO', tipo, fk||inst.ids.join(' '), r, {esp:inst.ids.length*4, ties});
      }
    });
    console.log(`6. Verovio: ${muestra.length} MEI renderizados · con problema: ${mal}`);
  };
}
