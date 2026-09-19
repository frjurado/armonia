// Validación masiva de la familia Cadencias (c4u0-cadencias-core.js) sobre el
// motor a cuatro voces, con el comprobador independiente (cuatro-voces-check.js):
//   1. cero infracciones de las normas;
//   2. frecuencia de cada fórmula (para vetar/ajustar pesos, §4t.3);
//   3. variedad de realizaciones por fórmula y tonalidad;
//   5. la etiqueta CAP/CAI coincide con la soprano final;
//   6. cuadre rítmico: cada voz pasa el bar check del parser (compás + partial);
//   7. el MEI carga y se renderiza en Verovio sin avisos (muestra de instancias).
// (La numeración sigue a docs/Generador-ejercicios.md §4t.9; el punto 4 —unicidad
// de tonalidad en Bajo dado— es por construcción.)
// Uso: node tests/masivo-cadencias.js [nivel 1–3] [n instancias] [--sin-verovio]
const path = require('path');
const BASE = path.join(__dirname, '..', 'public') + '/';
const CV = require(BASE + 'ejercicios/cuatro-voces-core.js');
const CK = require(BASE + 'ejercicios/cuatro-voces-check.js');
const ML = require(BASE + 'ejercicios/mini-lilypond-parser.js');
const C  = require(BASE + 'ejercicios/c4u0-cadencias-core.js');

const nivel = parseInt(process.argv[2] || '1', 10);
const N = parseInt(process.argv[3] || '2000', 10);
const conVerovio = !process.argv.includes('--sin-verovio');

const porRegla={}, porFormula={}, porTipo={}, porCompas={}, porSoprano={}; let nulos=0, total=0, penSum=0, errParser=0, etiquetas=0;
const ejemplos={}; const muestraMEI=[];
const t0=Date.now();
for(let i=0;i<N;i++){
  const inst=C.generar(nivel);
  if(!inst){ nulos++; continue; }
  total++; penSum+=inst.pen;
  const fk = inst.tipo+': '+inst.ids.join('–')+(inst.key.mode==='minor'?' (m)':' (M)');
  porFormula[fk]=(porFormula[fk]||0)+1;
  porTipo[inst.tipo]=(porTipo[inst.tipo]||0)+1;
  const sk=inst.tipo+' '+inst.voces[0].map(p=>p.deg).join('–');
  porSoprano[sk]=(porSoprano[sk]||0)+1;
  porCompas[inst.ritmo.time+(inst.ritmo.anacrusa?' ↑':'')]=(porCompas[inst.ritmo.time+(inst.ritmo.anacrusa?' ↑':'')]||0)+1;
  // 1. normas
  const faltas = CK.comprobar(inst.key, inst.acordes, inst.voces);
  faltas.forEach(f=>{ porRegla[f.regla]=(porRegla[f.regla]||0)+1; });
  if(faltas.length && Object.keys(ejemplos).length<8)
    ejemplos[fk+' '+inst.key.nombre] = {voces:inst.json.voices.map(v=>v.music), faltas:faltas.map(f=>f.regla+' ev'+f.evento+' '+f.texto)};
  // 5. etiqueta
  const last=inst.voces[0][inst.voces[0].length-1].deg;
  if(!C.FINAL[inst.tipo].includes(last) || (inst.tipo==='CAP'&&last!==1) || (inst.tipo==='CAI'&&last===1)){ etiquetas++; console.log('ETIQUETA INCOHERENTE', fk, last); }
  // 6. cuadre rítmico
  inst.json.voices.forEach(v=>{
    const p=ML.parseVoice(v.music,{time:inst.json.context.time, partial:inst.json.context.partial});
    if(p.errors.length){ errParser++; if(errParser<4) console.log('PARSER', fk, inst.ritmo.plantilla, v.music, p.errors); }
    if(p.events.length!==inst.ids.length){ errParser++; console.log('Nº EVENTOS', fk, v.music); }
  });
  if(conVerovio && muestraMEI.length<150 && i%Math.max(1,Math.floor(N/150))===0) muestraMEI.push({inst, fk});
}
const ms=Date.now()-t0;
console.log(`\nNivel ${nivel} · ${total} instancias · ${ms} ms (${(ms/total).toFixed(1)} ms/inst) · sin instancia: ${nulos} · pen media ${(penSum/total).toFixed(2)}`);
console.log('1. Infracciones por regla:', JSON.stringify(porRegla));
console.log('5. Etiquetas incoherentes:', etiquetas, ' 6. Errores de parser:', errParser);
console.log('Por tipo:', JSON.stringify(porTipo), ' Por compás:', JSON.stringify(porCompas));
console.log('\n2. Frecuencia de fórmulas (top 30):');
Object.entries(porFormula).sort((a,b)=>b[1]-a[1]).slice(0,30).forEach(([k,v])=>console.log(String(v).padStart(5), (100*v/total).toFixed(1).padStart(5)+'%', k));
console.log('Fórmulas distintas:', Object.keys(porFormula).length);
console.log('\nLíneas de soprano (grados) por tipo, top 8 de cada uno:');
Object.keys(porTipo).forEach(tipo=>{
  const tot=porTipo[tipo];
  const top=Object.entries(porSoprano).filter(([k])=>k.startsWith(tipo+' ')).sort((a,b)=>b[1]-a[1]).slice(0,8);
  console.log('  '+tipo+': '+top.map(([k,v])=>k.slice(tipo.length+1)+' '+(100*v/tot).toFixed(0)+'%').join(' · '));
});
if(Object.keys(ejemplos).length){ console.log('\nEjemplos con faltas:'); console.log(JSON.stringify(ejemplos,null,1)); }

// 3. variedad
console.log('\n3. Variedad (200 extracciones por fórmula/tonalidad, realización completa):');
const keys=C.tonalidades(nivel);
const pruebas = [
  ['CAP',['I','IV','V7','I']], ['CAP',['I6','II6','V','I']], ['CAI',['I','II6','V7','I']],
  ['SC',['I','IV','V']], ['CAP',['V7','I']], ['CR',['I','II6','V7','VI']], ['CAP',['I','II6','I64','V7','I']], ['SCF',['I','IV6','V']]
];
pruebas.forEach(([tipo,ids])=>{
  if(C.TIPOS[tipo].desde>nivel) return;
  const key = tipo==='SCF' ? keys.find(k=>k.mode==='minor') : keys[0];
  const acs=C.acordesDe(key, ids);
  const cuenta={}; const sopr=new Set();
  for(let i=0;i<200;i++){
    const r=CV.realizar(key, acs, C.ganchos(tipo));
    if(!r){ cuenta['null']=(cuenta['null']||0)+1; continue; }
    const s=r.voces.map(v=>v.map(CV.token).join(' ')).join('|');
    cuenta[s]=(cuenta[s]||0)+1; sopr.add(r.voces[0].map(CV.token).join(' '));
  }
  const arr=Object.values(cuenta).sort((a,b)=>b-a);
  console.log(`${tipo} ${ids.join('–')} (${key.nombre}): ${arr.length} distintas · máx ${(100*arr[0]/200).toFixed(0)}% · sopranos distintas ${sopr.size}`);
  Object.entries(cuenta).sort((a,b)=>b[1]-a[1]).slice(0,2).forEach(([s,c])=>console.log('   '+c+'×  '+s));
});

// 7. Verovio
if(conVerovio){
  const verovio=require(BASE+'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized=()=>{
    const tk=new verovio.toolkit();
    tk.setOptions({scale:60,adjustPageHeight:true,pageWidth:900,header:'none',footer:'none',breaks:'none',font:'Leland'});
    let mal=0; const t1=Date.now();
    muestraMEI.forEach(({inst,fk})=>{
      const mei=C.toMEI(inst,{cifrados:true});
      const ok=tk.loadData(mei);
      const svg=ok ? tk.renderToSVG(1) : '';
      const notas=(svg.match(/class="note"/g)||[]).length, harms=(svg.match(/class="harm"/g)||[]).length, medidas=(svg.match(/class="measure"/g)||[]).length;
      const esp = inst.ids.length*4;
      if(!ok || notas!==esp || harms!==inst.ids.length*2 || medidas!==inst.ritmo.nCompases){
        mal++; if(mal<5) console.log('VEROVIO', fk, inst.ritmo.plantilla, {ok, notas, esp, harms, medidas});
      }
    });
    console.log(`\n7. Verovio: ${muestraMEI.length} MEI renderizados en ${Date.now()-t1} ms · con problema: ${mal}`);
  };
}
