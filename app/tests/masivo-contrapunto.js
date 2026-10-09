// Validación masiva del motor de contrapunto (contrapunto-core.js), con el
// comprobador general independiente (conduccion-check.js).
// Uso: node tests/masivo-contrapunto.js [n] [pareja: SA|AT|TB|SB|ST|AB|todas]
// 1. Cero faltas según el comprobador (N3, N4, N12, N13 con tope de 5.ª; N2 en
//    las parejas contiguas; N1 por la tesitura de cada voz).
// 2. Perfil (para juzgar si las cadenas son «sosas»): grado conjunto en cada
//    voz, reparto de movimientos, racha más larga del mismo movimiento,
//    notas repetidas, ápices de la voz aguda, P9 (saltos no compensados),
//    consonancias imperfectas.
const path = require('path');
const BASE = path.join(__dirname, '../public/');
const C = require(BASE + 'ejercicios/contrapunto-core.js');
const K = require(BASE + 'ejercicios/conduccion-check.js');
const T = require(BASE + 'tonalidades.js');
const N = +(process.argv[2] || 1000);
const ARG = (process.argv[3] || 'todas').toUpperCase();
const NOMBRE = {S:'soprano', A:'contralto', T:'tenor', B:'bajo'};
const PAREJAS = ARG==='TODAS' ? ['SA','AT','TB','SB','ST','AB'] : [ARG];
const KEYS = T.hastaTrimestre(1);
const rnd = a => a[Math.floor(Math.random()*a.length)];

const st = {inst:0, sin:0, faltas:{}, pasos:0, mov:0, conj:0, motions:{}, rachaMax:[], rep:0, apices:[], p9:0, imp:0, son:0};
const t0 = Date.now();
for(let k=0;k<N;k++){
  const par = rnd(PAREJAS), roles = [NOMBRE[par[0]], NOMBRE[par[1]]];
  const key = rnd(KEYS);
  const res = C.generar({tonalidad:key, pareja:roles, nNotas:8});
  if(!res){ st.sin++; continue; }
  st.inst++;
  // voces del motor: de grave a aguda → comprobador: de aguda a grave
  const voces = [res.voces[1], res.voces[0]];
  const fs = K.comprobar(voces, {roles, saltoMax:4, reglas:['N1','N2','N3','N4','N12','N13','P9']});
  fs.filter(f=>f.grado==='falta').forEach(f => st.faltas[f.regla+' '+par] = (st.faltas[f.regla+' '+par]||0)+1);
  st.p9 += fs.filter(f=>f.regla==='P9').length;
  const n = voces[0].length;
  for(const v of voces) for(let i=1;i<n;i++){ const d=Math.abs(v[i].abs-v[i-1].abs); st.pasos++; if(d===1) st.conj++; if(d===0) st.rep++; }
  let racha=1, max=1;
  for(let i=1;i<n;i++){
    const m = K.movimiento(voces[0][i-1], voces[1][i-1], voces[0][i], voces[1][i]);
    st.motions[m] = (st.motions[m]||0)+1; st.mov++;
    if(i>1 && m===K.movimiento(voces[0][i-2], voces[1][i-2], voces[0][i-1], voces[1][i-1])) racha++; else racha=1;
    max = Math.max(max, racha);
  }
  st.rachaMax.push(max);
  const alto = Math.max(...voces[0].map(p=>p.abs));
  st.apices.push(voces[0].filter(p=>p.abs===alto).length);
  for(let i=0;i<n;i++){ st.son++; if(K.clasificar(voces[0][i], voces[1][i], true).clase==='I') st.imp++; }
}
const pct = (a,b) => (100*a/b).toFixed(1)+' %';
console.log(`${st.inst} cadenas (${PAREJAS.join(', ')}) en ${Date.now()-t0} ms · sin cadena: ${st.sin}`);
console.log('1. Faltas (comprobador independiente): ' + (Object.keys(st.faltas).length ? JSON.stringify(st.faltas) : 'ninguna'));
console.log('2. Perfil:');
console.log(`   grado conjunto ${pct(st.conj, st.pasos)} · nota repetida ${pct(st.rep, st.pasos)}`);
console.log('   movimientos: ' + Object.entries(st.motions).map(([m,c])=>m+' '+pct(c, st.mov)).join(' · '));
const media = a => (a.reduce((x,y)=>x+y,0)/a.length).toFixed(2);
console.log(`   racha más larga del mismo movimiento: media ${media(st.rachaMax)}, máx ${Math.max(...st.rachaMax)}`);
console.log(`   ápice de la voz aguda único: ${pct(st.apices.filter(x=>x===1).length, st.apices.length)}`);
console.log(`   P9 (salto no compensado) por cadena: ${(st.p9/st.inst).toFixed(2)}`);
console.log(`   consonancias imperfectas: ${pct(st.imp, st.son)}`);
