// Validación masiva de la familia Morfología de 3.º UD 1, variante Bajo cifrado
// (c3u1-morfologia-core.js; docs/Generador-ejercicios.md §4 cinco). Comprueba
// sobre las instancias generadas, con reglas escritas aquí aparte del core:
//   1. forma: 5–6 acordes; empieza en I o I6; acaba en V–I o en V tras
//      predominante o 6/4 cadencial; tonalidades del nivel;
//   2. bajo: rango Mi2–Do4; intervalos sin aumentados, disminuidos, 7.ª ni
//      6.ª mayor; nota repetida solo en 6/4 cadencial → V y en 5/3 → 6
//      (IV → II6, VI → IV6), y entonces siempre; nunca el mismo grado a la 8.ª; sensible → tónica;
//      tras salto de 4.ª o más, cambio de dirección;
//   3. 6/4: cadencial seguido de V con el mismo bajo; de paso por grado
//      conjunto y entre dos acordes de la función que prolonga;
//   4. cifrado: coincide con las notas (6 = 1.ª inv., 6/4 = 2.ª), y en menor
//      la sensible fuera del bajo lleva su alteración;
//   5. frecuencias de acordes, finales y 6/4; y render en Verovio.
// Uso: node tests/masivo-morfologia.js [nivel 1–2] [n] [--sin-verovio]
const path = require('path');
const BASE = path.join(__dirname, '..', 'public') + '/';
const M  = require(BASE + 'ejercicios/c3u1-morfologia-core.js');
const ML = require(BASE + 'ejercicios/mini-lilypond-parser.js');

const nivel = parseInt(process.argv[2] || '1', 10);
const N = parseInt(process.argv[3] || '2000', 10);
const conVerovio = !process.argv.includes('--sin-verovio');

const inc = (o,k,d=1) => { o[k]=(o[k]||0)+d; };
const fallos={}, porAcorde={}, porFinal={}, por64={}, porLong={}, porTon={};
const fallo = (k, x, txt) => { inc(fallos,k); if(fallos[k]<=3) console.log('FALLO '+k+': '+txt+' · '+x.key.nombre+' '+x.ids.join(' ')+' | '+x.json.voices[0].music); };
const LET='CDEFGAB', SEMI={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const abs = p => p.oct*7 + LET.indexOf(p.letter);
const midi = p => (p.oct+1)*12 + SEMI[p.letter] + p.alter;
// intervalo melódico → nombre, solo los admitidos
function intervalo(p, q){
  const d=Math.abs(abs(q)-abs(p)), s=Math.abs(midi(q)-midi(p));
  const ok={0:[0],1:[1,2],2:[3,4],3:[5],4:[7],5:[8],7:[12]};
  return (ok[d]||[]).includes(s) ? d : null;
}
let total=0, nulos=0, muestras=[]; const renders=[];
const t0=Date.now();
for(let i=0;i<N;i++){
  const x=M.generar(nivel);
  if(!x){ nulos++; continue; }
  total++;
  const A=x.acordes, n=A.length, b=A.map(a=>a.bajo);
  inc(porLong, n); inc(porTon, x.key.nombre);
  A.forEach(a=>inc(porAcorde, a.id));
  // 1. forma
  if(n<5 || n>6) fallo('longitud', x, n);
  if(!['I','I6'].includes(x.ids[0])) fallo('inicio', x, x.ids[0]);
  const fin=x.ids.slice(-2).join('-');
  inc(porFinal, x.ids[n-1]==='I' ? 'V–I' : x.ids[n-2]+'–V');
  if(!(fin==='V-I' || (x.ids[n-1]==='V' && ['II','II6','IV','IV6','I64c'].includes(x.ids[n-2])))) fallo('final', x, fin);
  if(!M.tonalidades(nivel).includes(x.key)) fallo('tonalidad', x, x.key.nombre);
  // 2. bajo
  b.forEach((p,k)=>{
    if(abs(p)<abs({letter:'E',oct:2}) || abs(p)>abs({letter:'C',oct:4})) fallo('rango', x, k);
    // la nota es la del acorde en su inversión
    const t=x.ids[k]; const deg=((A[k].grado-1 + 2*A[k].inv)%7)+1;
    if(p.deg!==deg) fallo('bajo≠inversión', x, k);
    if(k===0) return;
    const d=intervalo(b[k-1], p);
    if(d===null) fallo('intervalo', x, k);
    const rep = (x.ids[k-1]==='I64c' && t==='V') || (x.ids[k-1]==='IV' && t==='II6') || (x.ids[k-1]==='VI' && t==='IV6');
    if((d===0) !== rep) fallo('repetida', x, k);
    if(d===7 && b[k-1].deg===p.deg) fallo('mismo grado a la 8.ª', x, k);
    if(b[k-1].deg===7 && !(p.deg===1 && abs(p)-abs(b[k-1])===1)) fallo('sensible', x, k);
    if(k>=2){
      const d0=abs(b[k-1])-abs(b[k-2]), d1=abs(p)-abs(b[k-1]);
      if(Math.abs(d0)>=3 && d1!==0 && Math.sign(d0)===Math.sign(d1)) fallo('salto sin compensar', x, k);
    }
  });
  // 3. 6/4
  A.forEach((a,k)=>{
    if(a.inv!==2) return;
    inc(por64, a.uso);
    if(a.uso==='cad'){
      if(!(x.ids[k+1]==='V' && abs(b[k+1])===abs(b[k]))) fallo('6/4 cadencial', x, k);
      if(!['II','II6','IV','IV6'].includes(x.ids[k-1])) fallo('6/4 cad. sin predominante', x, k);
    } else if(a.uso==='paso'){
      const g = a.grado===5 ? 1 : 4;
      if(k===0 || k===n-1 || A[k-1].grado!==g || A[k+1].grado!==g) fallo('6/4 de paso: vecinos', x, k);
      else {
        const d0=abs(b[k])-abs(b[k-1]), d1=abs(b[k+1])-abs(b[k]);
        if(!(Math.abs(d0)===1 && d0===d1)) fallo('6/4 de paso: grado conjunto', x, k);
      }
    } else fallo('6/4 sin uso', x, k);
  });
  // 4. cifrado
  A.forEach((a,k)=>{
    const sinAlt=a.cifras.map(f=>f.replace(/[♯♭♮]/g,'')).filter(Boolean);
    const esperado = a.inv===0 ? (x.ids[k-1]==='I64c' ? ['5','3'] : []) : a.inv===1 ? ['6'] : ['6','4'];
    const conAlt = a.cifras.some(f=>/[♯♭♮]/.test(f));
    // en menor, en estado fundamental la 3.ª alterada sustituye al 3 (o va sola)
    const base = esperado.filter(f=>!(conAlt && f==='3' && a.grado===5 && a.inv===0));
    if(sinAlt.join('/')!==base.join('/')) fallo('cifrado', x, k+': '+a.cifras.join('/'));
    const sensibleFuera = x.key.mode==='minor' && [5,7].includes(a.grado) && !(a.grado===5 && a.inv===1);
    if(sensibleFuera !== conAlt) fallo('alteración del cifrado', x, k+': '+a.cifras.join('/'));
  });
  // el bajo en mini-LilyPond cuadra con el parser
  try{ const r=ML.parseVoice(x.json.voices[0].music); if(r.errors.length || r.events.length!==n) fallo('parser', x, r.events.length); }
  catch(e){ fallo('parser', x, e.message); }
  if(muestras.length<8) muestras.push(x);
  if(renders.length<300) renders.push(x);
}
const pct = v => (100*v/total).toFixed(1)+' %';
const lista = o => Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k} ${pct(v)}`).join(' · ');
console.log(`\nNivel ${nivel}: ${total} instancias (${nulos} nulas) en ${Date.now()-t0} ms`);
console.log('Fallos:', Object.keys(fallos).length ? fallos : 'ninguno');
console.log('Longitud:', lista(porLong));
console.log('Tonalidades:', lista(porTon));
console.log('Finales:', lista(porFinal));
console.log('Acordes (por instancia):', lista(porAcorde));
console.log('6/4:', lista(por64));
console.log('\nMuestras:');
muestras.forEach(x=>console.log('  '+x.key.nombre.padEnd(10)+' '+x.acordes.map(a=>a.romano+a.cifrasRomano).join(' ').padEnd(28)+' '+x.json.answer.gradosBajo.join('')));

if(conVerovio){
  const verovio=require(BASE+'vendor/verovio/verovio-toolkit-wasm.js');
  verovio.module.onRuntimeInitialized=()=>{
    const tk=new verovio.toolkit();
    tk.setOptions({scale:60,adjustPageHeight:true,pageWidth:1000,header:'none',footer:'none',breaks:'none',font:'Leland'});
    let mal=0; const t1=Date.now();
    renders.forEach(x=>[false,true].forEach(rev=>{
      const ok=tk.loadData(M.toMEI(x,{revelado:rev}));
      const svg=ok ? tk.renderToSVG(1) : '';
      const n=x.acordes.length, cif=x.acordes.filter(a=>a.cifras.length).length;
      const notas=(svg.match(/class="note"/g)||[]).length, harms=(svg.match(/class="harm[ "]/g)||[]).length,
            medidas=(svg.match(/class="measure"/g)||[]).length, paginas=tk.getPageCount();
      const espN = rev ? 4*n : n, espH = rev ? 3*n : cif;
      if(!ok || notas!==espN || harms!==espH || medidas!==n || paginas!==1){
        mal++; if(mal<5) console.log('VEROVIO', rev, {ok, notas, espN, harms, espH, medidas, paginas});
      }
    }));
    console.log(`
Verovio: ${2*renders.length} MEI renderizados en ${Date.now()-t1} ms · con problema: ${mal}`);
  };
}
