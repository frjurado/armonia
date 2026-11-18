// Validación masiva de tonica-dominante-core.js (docs/familias/tonica-dominante.md).
// Uso: node tests/masivo-tonica-dominante.js [n] [--sin-verovio]
// Para las tres consignas: I y V alternados en estado fundamental, el bajo
// ①/⑤ por 4.ª o 5.ª, la soprano por grado en 7̂ 1̂ 2̂ 3̂ (nunca 5̂), cero faltas
// en el comprobador (con la licencia N11I, y ninguna tríada sin 3.ª ni el V
// incompleto: lo vigila el comprobador). Recalculado AQUÍ desde las notas:
//   · Bajo dado: la conducción obvia (la nota común se queda; las demás voces
//     por grado; la sensible sube a la tónica), el primer acorde completo con
//     la fundamental duplicada.
//   · Canto dado: la soprano es la línea del nivel (2–3 notas en 1 y 2, cuatro
//     en 3; con 2̂–1̂ o 1̂–2̂ solo en 2 y 3); la línea sin 1̂–2̂/2̂–1̂ se realiza
//     de forma obvia; la que lo tiene cede, y nombra otra cesión.
//   · Cadencia: acaba en V–I (CA) o I–V (SC); CAP con 1̂ final, CAI con 3̂.
// Reparto y render con máscara (todas las notas; lo de respuesta, `resp`).
const path = require('path');
const BASE = path.join(__dirname, '../public/');
const T  = require(BASE + 'ejercicios/tonica-dominante-core.js');
const CK = require(BASE + 'ejercicios/cuatro-voces-check.js');
const N = +(process.argv[2] || 500);
const conVerovio = !process.argv.includes('--sin-verovio');

const L=['C','D','E','F','G','A','B'];
const mod=(a,n)=>((a%n)+n)%n;
const fallos=[]; const falla=m=>{ if(fallos.length<15) fallos.push(m); fallos.n=(fallos.n||0)+1; };
const cuenta={}, suma=k=>cuenta[k]=(cuenta[k]||0)+1;
const muestras=[];

// grado de la escala (1–7) de una altura en la tonalidad
const gradoEsc = (key, p) => mod(p.abs - L.indexOf(key.tonic[0]), 7) + 1;
// grado de la nota dentro del acorde k: 'F', '3', '5'
const rolEn = (e, k, p) => ['F','','3','','5'][mod(p.abs - e.voces[3][k].abs, 7)] || '?';

function comun(e, et){
  const v=e.voces, n=e.grados.length;
  if(v.some(x=>x.length!==n)) falla(et+': longitud');
  e.grados.forEach((g,k)=>{ if(k && g===e.grados[k-1]) falla(et+': acorde repetido'); });
  // bajo: ① o ⑤ según el acorde, por 4.ª o 5.ª
  v[3].forEach((p,k)=>{
    if(gradoEsc(e.key,p)!==e.grados[k]) falla(`${et}: bajo ${k+1} no es ${e.grados[k]}`);
    if(k){ const d=Math.abs(p.abs-v[3][k-1].abs); if(d!==3 && d!==4) falla(`${et}: bajo salta ${d+1}.ª`); else suma(et+' bajo '+(d+1)+'.ª'); }
  });
  // soprano: 7̂ 1̂ 2̂ 3̂, por grado
  v[0].forEach((p,k)=>{
    const g=gradoEsc(e.key,p);
    if(![7,1,2,3].includes(g)) falla(`${et}: soprano en ${g}̂`);
    if(k && Math.abs(p.abs-v[0][k-1].abs)!==1) falla(`${et}: la soprano no va por grado`);
  });
  const f=CK.comprobar(e.key, e.acordes, v, {licencias:T.licencias});
  if(f.length) falla(`${et}: faltas ${f.map(x=>x.regla+' '+x.texto).join('; ')}`);
  // los incompletos, solo el I
  for(let k=0;k<n;k++){
    const roles=new Set(v.map(x=>rolEn(e,k,x[k])));
    if(roles.size<3){ if(e.grados[k]!==1 || roles.has('5')) falla(`${et}: acorde ${k+1} incompleto (${[...roles]})`); suma(et+' I sin 5.ª'); }
  }
  suma(et+' modo '+e.key.mode);
  suma(et+' casos '+e.romanos.join('-'));
}
// ¿Conducción obvia? La nota común (5̂) se queda; las demás voces, por grado;
// la sensible, a la tónica; y todos los acordes completos.
function obvia(e){
  const v=e.voces;
  for(let k=0;k<e.grados.length;k++) if(new Set(v.map(x=>rolEn(e,k,x[k]))).size<3) return false;
  for(let k=1;k<e.grados.length;k++) for(let u=0;u<3;u++){
    const a=v[u][k-1], d=v[u][k], ga=gradoEsc(e.key,a);
    if(ga===5){ if(d.abs!==a.abs) return false; }
    else if(Math.abs(d.abs-a.abs)!==1) return false;
    if(ga===7 && gradoEsc(e.key,d)!==1) return false;
  }
  return true;
}

for(let i=0;i<N;i++){
  // Bajo dado
  {
    const e=T.generarBajo(), et='bajo';
    if(!e) falla('bajo: sin instancia');
    else {
      comun(e, et);
      if(!obvia(e)) falla('bajo: no es la obvia');
      const ds=e.voces.map(x=>rolEn(e,0,x[0]));
      if(new Set(ds).size!==3 || ds.filter(r=>r==='F').length!==2) falla(`bajo: primer acorde ${ds}`);
      suma(et+' soprano inicial '+gradoEsc(e.key,e.voces[0][0])+'̂');
      if(!e.resp.every((x,u)=>x.every((r,k)=>r===(u<3 && k>0)))) falla('bajo: máscara');
      if(i<15) muestras.push(e);
    }
  }
  // Canto dado
  for(const nivel of [1,2,3]){
    const e=T.generarCanto(nivel), et='canto'+nivel;
    if(!e){ falla(et+': sin instancia'); continue; }
    comun(e, et);
    const n=e.grados.length;
    if(nivel<3 ? !(n===2||n===3) : n!==4) falla(`${et}: ${n} acordes`);
    if(e.linea.join()!==e.voces[0].map(p=>gradoEsc(e.key,p)).join()) falla(`${et}: la soprano no es la línea`);
    const dif=T.dificil(e.linea);
    if(nivel===1 && dif) falla(et+': línea difícil');
    if(nivel===2 && !dif) falla(et+': línea fácil');
    if(T.repite(e.linea)) falla(`${et}: ${e.linea.join('-')} repite el gesto`);
    if(!dif && !obvia(e)) falla(`${et}: ${e.linea.join('-')} sin la obvia`);
    if(dif && obvia(e)) falla(`${et}: ${e.linea.join('-')} obvia (¿?)`);
    if(dif && !e.otra) falla(`${et}: ${e.linea.join('-')} sin otra cesión`);
    if(dif !== (e.cesiones.length>0)) falla(`${et}: cesiones ${e.cesiones}`);
    if(!e.resp.every((x,u)=>x.every(r=>r===(u>0)))) falla(et+': máscara');
    suma(et+' cesión '+e.real.principal);
    if(i<5) muestras.push(e);
  }
  // Cadencia
  {
    const e=T.generarCadencia(), et='cad';
    if(!e){ falla('cad: sin instancia'); continue; }
    comun(e, et);
    const g=e.grados, n=g.length, fin=gradoEsc(e.key, e.voces[0][n-1]);
    if(e.tipo==='CA' && !(g[n-2]===5 && g[n-1]===1)) falla('cad: CA no acaba en V–I');
    if(e.tipo==='SC' && !(g[n-2]===1 && g[n-1]===5)) falla('cad: SC no acaba en I–V');
    if(e.tipo==='CA' && e.exacto!==(fin===1?'CAP':'CAI')) falla(`cad: ${e.exacto} con ${fin}̂ final`);
    if(!obvia(e)) falla('cad: no es obvia');
    suma(et+' '+e.exacto+' '+n);
    if(i<15) muestras.push(e);
  }
}
console.log(`${N} instancias de cada consigna (Canto dado, de cada nivel)`);
console.log('Fallos: '+(fallos.n ? fallos.n+'\n  '+fallos.join('\n  ') : 'ninguno'));
const grupo = (pre,tot) => Object.keys(cuenta).filter(k=>k.startsWith(pre)).sort().map(k=>k.slice(pre.length)+' '+(tot ? (100*cuenta[k]/tot).toFixed(1)+'%' : cuenta[k])).join(' · ');
for(const et of ['bajo','canto1','canto2','canto3','cad']){
  console.log(et+':');
  console.log('  modo: '+grupo(et+' modo ', N)+' · I sin 5.ª (acordes): '+(cuenta[et+' I sin 5.ª']||0)+' · bajo: '+grupo(et+' bajo ', 0));
  console.log('  casos: '+grupo(et+' casos ', N));
}
console.log('bajo, soprano inicial: '+grupo('bajo soprano inicial ', N));
for(const nv of [1,2,3]) console.log(`canto${nv}, cesión mostrada: `+grupo(`canto${nv} cesión `, N));
console.log('cadencia (tipo, acordes): '+grupo('cad C', N)+' · '+grupo('cad SC', N));

if(conVerovio){
  const verovio = require(BASE + 'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized = () => {
    const tk = new verovio.toolkit();
    tk.setOptions({scale:60, adjustPageHeight:true, pageWidth:1250, header:'none', footer:'none', breaks:'none', font:'Leland'});
    let mal=0;
    for(const e of muestras){
      const n=e.grados.length, ok = tk.loadData(T.toMEI(e));
      const svg = ok ? tk.renderToSVG(1) : '', c = re => (svg.match(re)||[]).length;
      const faltan = [0,1,2,3].flatMap(v=>[...Array(n).keys()].map(k=>`id="n${v}_${k}"`)).filter(s=>!svg.includes(s)).length;
      const nResp = e.resp.flat().filter(Boolean).length;
      const r = {ok, notas:c(/class="note[ "]/g), resp:c(/class="note resp/g), harm:c(/class="harm resp/g), faltan};
      if(!ok || r.notas!==4*n || r.resp!==nResp || r.harm!==n || faltan){ mal++; if(mal<5) console.log('VEROVIO', e.variante, r); }
    }
    console.log(`Verovio: ${muestras.length} MEI · con problema: ${mal}`);
  };
}
