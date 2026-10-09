// Validación masiva de consonancia-core.js (docs/familias/consonancia.md).
// Uso: node tests/masivo-consonancia.js [n] [--sin-verovio]
// 1. La clase de cada intervalo, recalculada AQUÍ con una tabla propia (no con
//    el comprobador que usa el core), coincide con la respuesta.
// 2. Fuera de las disonancias, la cadena no tiene faltas (comprobador general).
// 3. Las disonancias: en sonoridades interiores, nunca en las dos últimas
//    (la cadencia), nunca seguidas; extremos en consonancia perfecta.
// 4. Reparto: nº de disonancias, cuáles, parejas, tonalidades.
// 5. Render en Verovio con máscara: 16 notas, 16 rótulos de respuesta.
const path = require('path');
const BASE = path.join(__dirname, '../public/');
const Co = require(BASE + 'ejercicios/consonancia-core.js');
const K  = require(BASE + 'ejercicios/conduccion-check.js');
const N = +(process.argv[2] || 2000);
const conVerovio = !process.argv.includes('--sin-verovio');

const L=['C','D','E','F','G','A','B'], SEMI={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const midi = p => (p.oct+1)*12 + SEMI[p.letter] + p.alter;
// clase por mi cuenta: forma simple (pasos) + semitonos reducidos
function clase(a, b){
  const pasos = a.abs-b.abs, s = ((midi(a)-midi(b))%12+12)%12, simple = pasos%7;
  const tabla = {0:{0:'P'}, 2:{3:'I',4:'I'}, 4:{7:'P'}, 5:{8:'I',9:'I'}};   // unísono/8.ª, 3.as, 5.ª, 6.as
  return (tabla[simple] && tabla[simple][s]) || 'D';                      // 2.as, 4.as (sobre el bajo), 7.as, alterados
}
const fallos=[]; const falla=(m)=>{ if(fallos.length<15) fallos.push(m); fallos.n=(fallos.n||0)+1; };
const cuenta={}, suma=k=>cuenta[k]=(cuenta[k]||0)+1;
const muestras=[];
for(let i=0;i<N;i++){
  const e = Co.generar(1 + i%2);
  if(!e){ falla('sin instancia'); continue; }
  const n = e.voces[0].length;
  e.voces[0].forEach((p,k)=>{
    const c = clase(p, e.voces[1][k]);
    if(c !== e.intervalos[k].clase) falla(`clase ${c} ≠ ${e.intervalos[k].clase} (${e.intervalos[k].nombre})`);
  });
  const fs = K.comprobar(e.voces, {roles:e.pareja.voces, saltoMax:4, reglas:['N1','N2','N3','N4','N12','N13']});
  if(fs.length) falla('faltas: '+fs.map(f=>f.regla+' '+f.texto).join('; '));
  const dis = e.voces[0].map((p,k)=>clase(p,e.voces[1][k])==='D'?k:-1).filter(k=>k>=0);
  if(dis.some(k=>k===0 || k>=n-2)) falla('disonancia en un extremo o en la cadencia: '+dis);
  if(dis.some((k,j)=>j>0 && k-dis[j-1]<2)) falla('disonancias seguidas: '+dis);
  if(clase(e.voces[0][0],e.voces[1][0])!=='P' || clase(e.voces[0][n-1],e.voces[1][n-1])!=='P') falla('extremos no perfectos');
  if(e.nivel===1 && e.key.mode!=='major') falla('menor en el nivel 1');
  suma('nº '+dis.length); suma('pareja '+e.pareja.voces.join('-'));
  dis.forEach(k=>suma('dis '+e.intervalos[k].nombreSimple));
  if(i<80) muestras.push(e);
}
console.log(`${N} cadenas`);
console.log('Fallos: '+(fallos.n ? fallos.n+'\n  '+fallos.join('\n  ') : 'ninguno'));
const grupo = pre => Object.keys(cuenta).filter(k=>k.startsWith(pre)).sort().map(k=>k.slice(pre.length)+' '+(100*cuenta[k]/N).toFixed(1)+'%').join(' · ');
console.log('Nº de disonancias: '+grupo('nº '));
console.log('Parejas: '+grupo('pareja '));
console.log('Disonancias (por cadena): '+grupo('dis '));

if(conVerovio){
  const verovio = require(BASE + 'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized = () => {
    const tk = new verovio.toolkit();
    tk.setOptions({scale:60, adjustPageHeight:true, pageWidth:1000, header:'none', footer:'none', breaks:'none', font:'Leland'});
    let mal=0;
    for(const e of muestras){
      const ok = tk.loadData(Co.toMEI(e, {mascara:true}));
      const svg = ok ? tk.renderToSVG(1) : '', c = re => (svg.match(re)||[]).length;
      const r = {ok, notas:c(/class="note"/g), resp:c(/class="harm[^"]* resp[^"]*"/g), dis:c(/class="harm[^"]* dis"/g)};
      if(!ok || r.notas!==16 || r.resp!==16 || r.dis!==2*e.disonancias.length){ mal++; if(mal<5) console.log('VEROVIO', r, e.disonancias); }
    }
    console.log(`Verovio: ${muestras.length} MEI con máscara · con problema: ${mal}`);
  };
}
