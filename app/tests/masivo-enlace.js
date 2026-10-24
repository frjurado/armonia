// Validación masiva de enlace-core.js (docs/familias/paralelas-directas.md, «Enlazar acordes»).
// Uso: node tests/masivo-enlace.js [n] [--sin-verovio]
// La consigna, recalculada AQUÍ desde las notas (no con `enlazar`): de cada
// acorde al siguiente, la voz superior cuya nota es del acorde siguiente se
// queda; si hay alguna así, las demás van por grado; si no hay ninguna, las
// tres van en dirección contraria al bajo, a la primera nota del acorde
// siguiente. Además: cada acorde completo con la fundamental duplicada (en el
// bajo), el primero en la disposición sorteada (nunca mixta), cero faltas en
// los dos comprobadores, sin V–VI, VI–V ni III–IV, nivel 1 solo en mayor.
// Reparto, y render con máscara (todas las notas; las de respuesta, `resp`).
const path = require('path');
const BASE = path.join(__dirname, '../public/');
const E  = require(BASE + 'ejercicios/enlace-core.js');
const K  = require(BASE + 'ejercicios/conduccion-check.js');
const CK = require(BASE + 'ejercicios/cuatro-voces-check.js');
const N = +(process.argv[2] || 1000);
const conVerovio = !process.argv.includes('--sin-verovio');

const L=['C','D','E','F','G','A','B'];
const mod=(a,n)=>((a%n)+n)%n;
const letra = p => L[mod(p.abs,7)];
const fallos=[]; const falla=m=>{ if(fallos.length<15) fallos.push(m); fallos.n=(fallos.n||0)+1; };
const cuenta={}, suma=k=>cuenta[k]=(cuenta[k]||0)+1;
const muestras=[];

for(let i=0;i<N;i++) for(const nivel of [1,2]){
  const e = E.generar(nivel);
  if(!e){ falla(nivel+': sin instancia'); continue; }
  const v = e.voces, n = v[0].length;
  if(n!==E.N || v.some(x=>x.length!==n)) falla(nivel+': longitud');
  if(nivel===1 && e.key.mode!=='major') falla('1: tonalidad menor');
  // acordes completos, con la fundamental (el bajo) duplicada
  const letras = k => v.map(x=>letra(x[k]));
  for(let k=0;k<n;k++){
    const ls=letras(k), b=ls[3];
    if(new Set(ls).size!==3 || ls.filter(x=>x===b).length!==2) falla(`${nivel}: acorde ${k+1} (${ls})`);
    const raiz = L[mod(L.indexOf(b),7)], tercera=L[mod(L.indexOf(b)+2,7)], quinta=L[mod(L.indexOf(b)+4,7)];
    if(!ls.every(x=>[raiz,tercera,quinta].includes(x))) falla(`${nivel}: acorde ${k+1} no es una tríada en estado fundamental`);
  }
  // la consigna, paso a paso
  for(let k=1;k<n;k++){
    const sig=new Set(letras(k)), comunes=[0,1,2].filter(u=>sig.has(letra(v[u][k-1])));
    const dB=v[3][k].abs-v[3][k-1].abs;
    for(let u=0;u<3;u++){
      const a=v[u][k-1], d=v[u][k], dd=d.abs-a.abs;
      if(comunes.includes(u)){ if(dd) falla(`${nivel}: ${k}–${k+1}, voz ${u}: la nota común no se mantiene`); }
      else if(comunes.length){ if(Math.abs(dd)!==1) falla(`${nivel}: ${k}–${k+1}, voz ${u}: no va por grado`); }
      else {
        if(!dB || Math.sign(dd)!==-Math.sign(dB)) falla(`${nivel}: ${k}–${k+1}, voz ${u}: no va por movimiento contrario`);
        for(let x=a.abs+Math.sign(dd); x!==d.abs; x+=Math.sign(dd)) if(sig.has(L[mod(x,7)])) falla(`${nivel}: ${k}–${k+1}, voz ${u}: salta una nota del acorde`);
      }
    }
    if(e.enlaces[k-1].comunes.join()!==comunes.join()) falla(`${nivel}: ${k}–${k+1}: notas comunes ${e.enlaces[k-1].comunes} ≠ ${comunes}`);
    suma(nivel+' enlace '+e.enlaces[k-1].rotulo);
    if(!comunes.length) suma(nivel+' contrario bajo '+(dB>0?'sube':'baja'));
  }
  // el primer acorde y la disposición a lo largo de la cadena
  const disp = k => E.disposicion(v[0][k], v[2][k]);
  if(disp(0)!==e.disp || e.disp==='mixta') falla(`${nivel}: disposición ${disp(0)} ≠ ${e.disp}`);
  suma(nivel+' disp '+e.disp);
  if(v[0].some((_,k)=>disp(k)!==e.disp)) suma(nivel+' cambia de disposición');
  suma(nivel+' soprano '+['F','3','5'][mod(v[0][0].abs-v[3][0].abs,7)/2]);
  // sucesiones vetadas y comprobadores
  e.grados.forEach((g,k)=>{ if(k && E.EVITA.some(([a,b])=>a===e.grados[k-1] && b===g)) falla(`${nivel}: ${e.grados[k-1]}–${g}`); });
  const f1 = K.comprobar(v, {roles:['soprano','contralto','tenor','bajo'], reglas:E.REGLAS}), f2 = CK.comprobar(e.key, e.acordes, v);
  if(f1.length || f2.length) falla(`${nivel}: faltas ${f1.concat(f2).map(f=>f.regla+' '+f.texto).join('; ')}`);
  e.grados.forEach(g=>suma(nivel+' grado '+g));
  suma(nivel+' modo '+e.key.mode);
  if(E.dibujo(e).rotulos.length!==n-1) falla(nivel+': rótulos');
  if(i<20) muestras.push(e);
}
console.log(`${N} instancias de cada nivel`);
console.log('Fallos: '+(fallos.n ? fallos.n+'\n  '+fallos.join('\n  ') : 'ninguno'));
const grupo = (pre,tot) => Object.keys(cuenta).filter(k=>k.startsWith(pre)).sort().map(k=>k.slice(pre.length)+' '+(tot ? (100*cuenta[k]/tot).toFixed(1)+'%' : cuenta[k])).join(' · ');
for(const nv of [1,2]){
  console.log(`Nivel ${nv}`);
  console.log('  modo: '+grupo(nv+' modo ', N)+' · disposición: '+grupo(nv+' disp ', N)+' · cambia de disposición: '+(cuenta[nv+' cambia de disposición']||0));
  console.log('  soprano en el 1.er acorde: '+grupo(nv+' soprano ', N));
  console.log('  enlaces: '+grupo(nv+' enlace ', N*(E.N-1))+' · contrario con el bajo que '+grupo(nv+' contrario bajo ', 0));
  console.log('  grados (recuento): '+grupo(nv+' grado ', 0));
}

if(conVerovio){
  const verovio = require(BASE + 'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized = () => {
    const tk = new verovio.toolkit();
    tk.setOptions({scale:60, adjustPageHeight:true, pageWidth:1250, header:'none', footer:'none', breaks:'none', font:'Leland'});
    let mal=0;
    for(const e of muestras){
      const ok = tk.loadData(E.toMEI(e));
      const svg = ok ? tk.renderToSVG(1) : '', c = re => (svg.match(re)||[]).length;
      const faltan = [0,1,2,3].flatMap(v=>[...Array(E.N).keys()].map(k=>`id="n${v}_${k}"`)).filter(s=>!svg.includes(s)).length;
      const r = {ok, notas:c(/class="note[ "]/g), resp:c(/class="note resp/g), harm:c(/class="harm/g), faltan};
      if(!ok || r.notas!==4*E.N || r.resp!==3*(E.N-1) || r.harm!==0 || faltan){ mal++; if(mal<5) console.log('VEROVIO', e.nivel, r); }
    }
    console.log(`Verovio: ${muestras.length} MEI · con problema: ${mal}`);
  };
}
