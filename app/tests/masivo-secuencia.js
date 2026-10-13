// Validación masiva de secuencia-core.js (docs/familias/secuencia.md).
// Uso: node tests/masivo-secuencia.js [nivel] [tipo] [n] [--sin-verovio]
// (sin nivel ni tipo: todos)
// 1. Cero faltas del comprobador de 4.º con las licencias de la secuencia; y
//    sin ellas, solo N7, N10 o N12 y solo dentro de la secuencia.
// 2. La secuencia, trasladada: con reglas de AQUÍ, el bajo de cada acorde es el
//    grado del catálogo, y cada acorde, el de dos posiciones antes bajado un
//    grado (círculo) o una 3.ª (romanesca): exacto en las cuatro voces; el
//    bajo, a otra 8.ª solo en la primera o la última nota (y se cuenta).
// 3. En menor, VII, III y v de la secuencia, sin sensible (menor natural).
// 4. Ritmo: el primer acorde de cada módulo, al principio de compás, y el
//    módulo entero en ese compás; en el tipo 1, un módulo por compás.
// 5. Formas: periodo SC ‖ CA; si las dos mitades son secuencia, de tipos
//    distintos. Reparto. Render de una muestra.
const path = require('path');
const BASE = path.join(__dirname, '../public/');
const S  = require(BASE + 'ejercicios/secuencia-core.js');
const CK = require(BASE + 'ejercicios/cuatro-voces-check.js');
const args = process.argv.slice(2).filter(a=>!a.startsWith('--'));
const NIVELES = args[0] ? [+args[0]] : [1,2,3], TIPOS = args[1] ? [+args[1]] : [1,2,3], N = +(args[2]||300);
const conVerovio = !process.argv.includes('--sin-verovio');

const L=['C','D','E','F','G','A','B'];
const mod=(a,n)=>((a%n)+n)%n;
const alterArmadura = (sig, letra) => sig>0 ? ('FCGDAEB'.indexOf(letra)<sig ? 1 : 0) : sig<0 ? ('BEADGCF'.indexOf(letra)<-sig ? -1 : 0) : 0;
const grado = (key, p) => mod(p.abs - L.indexOf(key.tonic), 7) + 1;      // grado de la escala de una nota
// grado del bajo de cada acorde del catálogo: fundamental + 2·inversión
const bajoEsperado = ([g,inv]) => mod(g-1+2*inv, 7) + 1;
const fallos=[]; const falla=m=>{ if(fallos.length<20) fallos.push(m); fallos.n=(fallos.n||0)+1; };
const cuenta={}, suma=k=>cuenta[k]=(cuenta[k]||0)+1;
const muestras=[];

for(const nivel of NIVELES) for(const tipo of TIPOS){
  const t0=Date.now(); let nulos=0;
  for(let i=0;i<N;i++){
    const e=S.generar(tipo, nivel);
    if(!e){ nulos++; continue; }
    const id=`n${nivel} t${tipo} ${e.key.nombre} ${S.resumen(e)}`;
    // 1. comprobador
    const conLic=CK.comprobar(e.key, e.acordes, e.voces, {licencias:e.licencias});
    if(conLic.length) falla(`${id}: ${conLic.map(f=>f.regla+'@'+f.evento+' '+f.texto).join('; ')}`);
    const secs=e.est.tramos.filter(t=>t.tipo==='sec');
    const dentro = k => secs.some(t=>k>t.desde && k<=t.hasta) || secs.some(t=>k===t.desde && k===0);
    CK.comprobar(e.key, e.acordes, e.voces).forEach(f=>{
      if(!['N7','N10','N12'].includes(f.regla) || !dentro(f.evento)) falla(`${id}: falta sin licencia posible ${f.regla}@${f.evento}`);
    });
    // 2. traslado y catálogo
    secs.forEach(t=>{
      const mods=t.sec.mods.slice(t.desdeVII ? 1 : 0);
      let k=t.desde;
      mods.forEach((m,mi)=>m.forEach((c,j)=>{
        if(t.truncada && mi===mods.length-1 && j===1) return;
        if(grado(e.key, e.voces[3][k])!==bajoEsperado(c)) falla(`${id}: bajo ${k} no es el del catálogo`);
        if(k>=t.desde+2){
          const paso=t.sec.paso;
          for(let v=0;v<4;v++){
            const d=e.voces[v][k].abs-(e.voces[v][k-2].abs+paso);
            if(v===3 && d!==0){
              // el bajo, a otra 8.ª solo en la primera o la última nota de la secuencia
              if(Math.abs(d)!==7 || !(k===t.desde+2 || k===t.hasta)) falla(`${id}: bajo sin el movimiento secuencial en ${k}`);
              suma(`n${nivel} t${tipo} bajo octavado`);
            } else if(d!==0) falla(`${id}: voz ${v} sin trasladar en ${k}`);
          }
        }
        k++;
      }));
      suma(`n${nivel} t${tipo} sec ${t.sec.nombre}, ${t.sec.variante}${t.truncada?' (truncada)':''}${t.desdeVII?' (desde VII)':''}`);
    });
    // 3. En menor, VII, III y v de la secuencia, sin sensible: el 7.º grado,
    // con la alteración de la armadura (menor natural)
    if(e.key.mode==='minor') secs.forEach(t=>{ for(let k=t.desde;k<=t.hasta;k++){
      if(![3,5,7].includes(e.acordes[k].grado)) continue;
      for(let v=0;v<4;v++){ const p=e.voces[v][k];
        if(grado(e.key,p)===7 && p.alter!==alterArmadura(e.key.sig, L[mod(p.abs,7)])) falla(`${id}: ${e.acordes[k].romano} en ${k} con sensible`); }
    }});
    // 4. ritmo
    const bar=[], pos=[];
    e.ritmo.compases.forEach((m,b)=>m.forEach((x,j)=>{ bar[x.k]=b; pos[x.k]=j; }));
    e.est.ev.forEach((ev,k)=>{
      if(!ev.iniModulo) return;
      if(pos[k]!==0) falla(`${id}: módulo que no empieza compás (${k})`);
      const sig=e.est.ev[k+1];
      if(sig && sig.modulo===ev.modulo && sig.rol!=='TF' && bar[k+1]!==bar[k]) falla(`${id}: módulo partido (${k})`);
    });
    if(tipo===1 && e.ritmo.compases.some(m=>m.length!==2)) falla(`${id}: tipo 1 con un compás que no es un módulo`);
    // 5. formas
    if(tipo===3){
      const cads=e.est.tramos.filter(t=>t.tipo==='cad').map(t=>t.sigla).join();
      if(cads!=='SC,CA') falla(`${id}: cadencias ${cads}`);
      if(secs.length===2 && secs[0].sec.tipo===secs[1].sec.tipo) falla(`${id}: dos secuencias del mismo tipo`);
    }
    suma(`n${nivel} t${tipo} forma ${S.resumen(e).replace(/Prol\. [IV]/g,'Prol.')}`);
    if(i<6) muestras.push(e);
  }
  console.log(`Nivel ${nivel} · tipo ${tipo} · ${N} instancias · ${((Date.now()-t0)/N).toFixed(1)} ms/inst · sin instancia: ${nulos}`);
}
console.log('Fallos: '+(fallos.n ? fallos.n+'\n  '+fallos.join('\n  ') : 'ninguno'));
for(const nivel of NIVELES) for(const tipo of TIPOS){
  const pre=`n${nivel} t${tipo} `, ks=Object.keys(cuenta).filter(k=>k.startsWith(pre)).sort();
  console.log(`— nivel ${nivel}, tipo ${tipo}: `+ks.map(k=>k.slice(pre.length)+' '+cuenta[k]).join(' · '));
}

if(conVerovio){
  const verovio = require(BASE + 'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized = () => {
    const tk = new verovio.toolkit();
    tk.setOptions({scale:60, adjustPageHeight:true, pageWidth:1000, header:'none', footer:'none', breaks:'auto', font:'Leland'});
    let mal=0;
    for(const e of muestras){
      const ok = tk.loadData(S.toMEI(e, {mascara:true, ocultas:[0,1,2], cifrados:true, tramos:true, saltoFrase:true}));
      const svg = ok ? tk.renderToSVG(1) : '', c = re => (svg.match(re)||[]).length;
      // sin <reh> de tramo (los dibuja la página encima); todas las notas, con su id s{k}
      const r = {ok, notas:c(/class="note[ "]/g), reh:c(/class="reh/g), ids:e.est.ev.filter((_,k)=>svg.includes(`id="s${k}"`)).length};
      if(!ok || r.notas!==4*e.est.ev.length || r.reh!==0 || r.ids!==e.est.ev.length){ mal++; if(mal<5) console.log('VEROVIO', S.resumen(e), r); }
    }
    console.log(`Verovio: ${muestras.length} MEI · con problema: ${mal}`);
  };
}
