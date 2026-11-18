/* ============================================================
   Tónica y dominante — familia Estado fundamental (3.º UD 2)
   ------------------------------------------------------------
   Diseño: docs/familias/tonica-dominante.md.
   Fragmentos de dos a cuatro acordes, solo I y V (sin 7.ª) en
   estado fundamental, alternados; el bajo, ① y ⑤ por 4.ª o 5.ª;
   la soprano, por grado en 7̂ 1̂ 2̂ 3̂ (nunca en 5̂). Tres consignas:
     · Bajo dado (generarBajo): el bajo y el primer acorde; la
       realización es la «obvia» de la UD 1 (nota común, lo demás
       por grado, la sensible a la tónica) y es única.
     · Canto dado (generarCanto): la soprano; con 2̂–1̂ o 1̂–2̂ no
       hay realización obvia y se cede: el I sin 5.ª (licencia
       N11I, fundamental triplicada), la sensible interior a 5̂
       (N7) o un salto en una voz interior. Se muestra una y se
       nombra la otra.
     · Cadencia (generarCadencia): CA (… V–I) o SC (… I–V) de dos o
       tres acordes; al revelar, una realización obvia y si la CA
       es CAP o CAI.
   Las realizaciones no se escriben: se ENUMERAN todas las válidas
   (son pocas) con el modelo de acorde y las normas de transición
   del motor (cuatro-voces-core.js), se pasan por el comprobador
   independiente (cuatro-voces-check.js) y se elige por lo que
   ceden (`rasgos`, `coste`).
   Sin DOM. Depende de cuatro-voces-core.js, cuatro-voces-check.js
   y ../tonalidades.js.
   ============================================================ */
(function (global) {
  'use strict';

  const esNode = typeof module !== 'undefined' && module.exports;
  const CV  = esNode ? require('./cuatro-voces-core.js')  : global.CuatroVoces;
  const CK  = esNode ? require('./cuatro-voces-check.js') : global.CuatroVocesCheck;
  const TON = esNode ? require('../tonalidades.js')       : global.TONALIDADES;

  const MAX_NIVEL_CANTO = 3;
  const NOMBRE_VOZ = ['soprano','contralto','tenor','bajo'];
  const LIC = new Set(['N11I']);
  const licencias = () => LIC;
  const rnd = a => a[Math.floor(Math.random()*a.length)];

  const tonalidades = () => TON.hastaTrimestre(1);

  // Los acordes de una sucesión de grados (1 y 5). El I admite ir sin 5.ª
  // (fundamental triplicada): solo con la licencia N11I, que se pasa siempre.
  function acordesDe(key, grados){
    return grados.map(g => g===1 ? CV.acorde(key, {grado:1, dup:{omitir:'5'}}) : CV.acorde(key, {grado:5}));
  }
  const alterna = (n, inicio) => Array.from({length:n}, (_,i) => (i%2===0)===(inicio===1) ? 1 : 5);
  const romanos = grados => grados.map(g => g===1 ? 'I' : 'V');
  const degDe = (ch, p) => (ch.tones.find(t=>t.letter===CV.letterOf(p.abs) && t.alter===p.alter) || {}).deg;

  /* ---------- enumeración ---------- */
  // Todas las realizaciones válidas de `acs`. restr: {sop:[altura|null…],
  // bajo:[altura|null…], primero:[S,A,T,B]} fijan notas. Devuelve
  // [{v:[[S,A,T,B]…], …rasgos}] (las disposiciones por acorde).
  function realizaciones(key, acs, restr){
    restr = restr || {};
    const igual = (p,q) => p.abs===q.abs && p.alter===q.alter;
    const cands = acs.map((ch,k)=>{
      if(k===0 && restr.primero) return CV.candidatos(ch, {voz:3, altura:restr.primero[3]})
        .filter(c=>c.v.every((p,v)=>igual(p, restr.primero[v])));
      const s = restr.sop && restr.sop[k], b = restr.bajo && restr.bajo[k];
      return CV.candidatos(ch, s ? {voz:0, altura:s} : b ? {voz:3, altura:b} : null)
        .filter(c=>!(s && !igual(c.v[0],s)) && !(b && !igual(c.v[3],b)));
    });
    const out=[];
    (function dfs(k, path){
      if(k===acs.length){
        const voces=[0,1,2,3].map(v=>path.map(c=>c.v[v]));
        if(!CK.comprobar(key, acs, voces, {licencias}).length) out.push(path.map(c=>c.v));
        return;
      }
      for(const c of cands[k]){
        if(k>0 && CV.normasTransicion(path[k-1], c, acs[k-1], acs[k], path, k===acs.length-1, LIC)) continue;
        if(k===0 && c.omision && !(restr.sop)) continue;     // el primer acorde, completo salvo en Canto dado
        dfs(k+1, path.concat([c]));
      }
    })(0, []);
    return out.map(v=>Object.assign({v}, rasgos(acs, v)));
  }

  /* ---------- lo que cede una realización ---------- */
  // Por transición: la nota común (5̂) que no se mantiene, la sensible que
  // baja a 5̂, los saltos de las voces superiores; por acorde, el que va
  // sin 5.ª. `cesiones` las describe; `principal` es la que da nombre a la
  // realización (para nombrar «la otra» en Canto dado).
  function rasgos(acs, v){
    const incompletos=[], sensBaja=[], saltos=[], sinComun=[];
    let mov=0, pen=0;
    v.forEach((d,k)=>{
      const presentes=new Set(d.map(p=>degDe(acs[k],p)));
      if(presentes.size<3) incompletos.push(k);
      if(d[2].abs-d[3].abs>11) pen+=1;                        // P1
      if(d[0].abs===d[1].abs || d[1].abs===d[2].abs) pen+=3;  // P2
      if(k===0) return;
      const a=v[k-1];
      let comun=false, habiaComun=false;
      for(let x=0;x<3;x++){
        const da=degDe(acs[k-1],a[x]), dd=degDe(acs[k],d[x]), m=Math.abs(d[x].abs-a[x].abs);
        mov+=m;
        if(da===7 && dd===5) sensBaja.push({k, voz:x});
        if(m>1) saltos.push({k, voz:x, pasos:m});
        if(da===5) habiaComun=true;
        if(da===5 && m===0) comun=true;
      }
      if(habiaComun && !comun) sinComun.push(k);
    });
    const principal = incompletos.length ? 'incompleto' : sensBaja.length ? 'sensible' : saltos.length ? 'salto' : sinComun.length ? 'comun' : 'obvia';
    const coste = 3*incompletos.length + 2*sensBaja.length + saltos.reduce((s,x)=>s+x.pasos,0)
                + sinComun.length + 0.5*pen + 0.05*mov;
    return {incompletos, sensBaja, saltos, sinComun, principal, coste};
  }
  const ORD = ['','','3.ª','4.ª','5.ª','6.ª'];
  const laVoz = v => (v===2 ? 'el ' : 'la ')+NOMBRE_VOZ[v];
  // Texto de lo que cede (vacío si es la obvia). `grados` para nombrar el acorde.
  function cesiones(r, grados){
    const t=[], nAc = k => `el ${romanos(grados)[k]} (${k+1}.º acorde)`;
    r.incompletos.forEach(k=>t.push(`${nAc(k)} sin 5.ª, con la fundamental triplicada`));
    r.sensBaja.forEach(s=>t.push(`la sensible ${s.voz===2?'del tenor':'de la '+NOMBRE_VOZ[s.voz]} baja a 5̂`));
    // el salto de la sensible a 5̂ ya está dicho
    r.saltos.filter(s=>!r.sensBaja.some(b=>b.k===s.k && b.voz===s.voz))
      .forEach(s=>t.push(`salto de ${ORD[s.pasos]||'más de 6.ª'} en ${laVoz(s.voz)}`));
    if(!r.saltos.length) r.sinComun.forEach(()=>t.push('no se mantiene la nota común'));
    return [...new Set(t)];
  }

  /* ---------- soprano y bajo ---------- */
  const SOP = {1:[1,3], 5:[7,2]};                 // grados de la soprano en cada acorde
  const pasoConj = (a,b) => { const d=Math.abs(((a-b+7+3)%7)-3); return d===1; };
  // Líneas de soprano por grado conjunto sobre una sucesión de grados.
  function lineas(grados){
    let ls=[[]];
    for(const g of grados) ls=ls.flatMap(l=>SOP[g].map(s=>l.concat([s])));
    return ls.filter(l=>l.every((s,i)=>i===0 || pasoConj(l[i-1],s)));
  }
  // ¿La línea pasa por 1̂–2̂ o 2̂–1̂? (las que no tienen realización obvia)
  // ¿Repite dos veces el mismo gesto de dos notas? (7–1–7–1, 1–2–1–2…)
  const repite = l => l.length===4 && l[0]===l[2] && l[1]===l[3];
  const dificil = l => l.some((s,i)=>i>0 && ((l[i-1]===1 && s===2) || (l[i-1]===2 && s===1)));
  // La línea en alturas: 7̂ bajo 1̂, todo en un tramo 7̂–3̂; una octava al azar
  // entre las que caben en la tesitura de la soprano (sin tocar sus extremos).
  function sopranoEnAlturas(key, linea){
    const esc=CV.escala(key), t='CDEFGAB'.indexOf(key.tonic[0]), rel={7:-1,1:0,2:1,3:2};
    const [lo,hi]=CV.RANGOS[0], ops=[];
    for(let o=3;o<=6;o++){
      const ps=linea.map(g=>CV.altura(o*7+t+rel[g], esc[g-1].alter, {deg:g}));
      if(ps.every(p=>p.abs>lo && p.abs<hi)) ops.push(ps);
    }
    return ops.length ? rnd(ops) : null;
  }

  /* ---------- Bajo dado ---------- */
  const CASOS_BAJO = [[1,5],[5,1],[1,5,1],[5,1,5]];
  // generarBajo() → instancia: el bajo y el primer acorde (fundamental
  // duplicada, soprano en 3.ª o fundamental del I / 3.ª o 5.ª del V) se dan;
  // la realización obvia desde ahí es única.
  function generarBajo(){
    for(let intento=0; intento<40; intento++){
      const key=rnd(tonalidades()), grados=rnd(CASOS_BAJO), acs=acordesDe(key, grados);
      // primeros acordes posibles: completos, fundamental duplicada, soprano no en 5̂
      const primeros = CV.candidatos(acs[0], null).filter(c=>{
        if(c.omision || c.pen>0.5) return false;
        const ds=c.v.map(p=>degDe(acs[0],p));
        return ds.filter(d=>d===grados[0]).length===2 && ds[0]!==5 && c.v[2].abs-c.v[3].abs<=11;
      });
      if(!primeros.length) continue;
      const primero=rnd(primeros).v;
      const todas=realizaciones(key, acs, {primero}).sort((a,b)=>a.coste-b.coste);
      // el bajo de la mejor y, con ese bajo, que la obvia sea la única
      const mejor=todas.find(r=>r.principal==='obvia');
      if(!mejor) continue;
      const bajo=mejor.v.map(d=>d[3]);
      const mismas=todas.filter(r=>r.principal==='obvia' && r.v.every((d,k)=>d[3].abs===bajo[k].abs));
      if(mismas.length!==1) continue;
      return instancia('bajo', key, grados, acs, mejor, {
        // respuesta: las voces superiores desde el 2.º acorde
        resp: [0,1,2,3].map(v=>grados.map((_,k)=>v<3 && k>0))
      });
    }
    return null;
  }

  /* ---------- Canto dado ---------- */
  // Nivel 1: líneas de 2–3 notas con realización obvia; 2: de 2–3 notas con
  // 2̂–1̂ o 1̂–2̂; 3: de cuatro notas, salvo las que repiten el mismo gesto
  // (7–1–7–1, 3–2–3–2…). Mayor y menor siempre.
  function lineasDelNivel(nivel){
    const out=[];
    const ns = nivel===3 ? [4] : [2,3];
    ns.forEach(n=>[1,5].forEach(ini=>{
      const grados=alterna(n, ini);
      lineas(grados).forEach(l=>{
        if(nivel===1 && dificil(l)) return;
        if(nivel===2 && !dificil(l)) return;
        if(repite(l)) return;
        out.push({grados, linea:l});
      });
    }));
    return out;
  }
  // Las mejores realizaciones de cada clase (`principal`), por coste.
  function porClase(todas){
    const m=new Map();
    todas.forEach(r=>{ if(!m.has(r.principal) || r.coste<m.get(r.principal).coste) m.set(r.principal, r); });
    return [...m.values()].sort((a,b)=>a.coste-b.coste);
  }
  // Margen de coste para considerar «igual de buenas» dos cesiones distintas.
  const MARGEN = 1.5;
  function generarCanto(nivel, opts){
    nivel=Math.max(1, Math.min(MAX_NIVEL_CANTO, nivel|0));
    opts=opts||{};
    for(let intento=0; intento<40; intento++){
      const key=opts.key || rnd(tonalidades());
      const caso=opts.linea ? {grados:opts.grados, linea:opts.linea} : rnd(lineasDelNivel(nivel));
      const acs=acordesDe(key, caso.grados);
      const sop=sopranoEnAlturas(key, caso.linea);
      if(!sop) continue;
      const todas=realizaciones(key, acs, {sop});
      if(!todas.length) continue;
      const clases=porClase(todas);
      // si hay obvia, esa; si no, una de las cesiones igual de buenas, al azar,
      // y la otra (la mejor de otra clase) se nombra
      let elegida, otra=null;
      if(clases[0].principal==='obvia') elegida=clases[0];
      else {
        const buenas=clases.filter(c=>c.coste<=clases[0].coste+MARGEN);
        elegida=rnd(buenas);
        otra=clases.find(c=>c!==elegida) || null;
      }
      return instancia('canto', key, caso.grados, acs, elegida, {
        nivel, linea:caso.linea, otra,
        resp: [0,1,2,3].map(v=>caso.grados.map(()=>v>0))
      });
    }
    return null;
  }

  /* ---------- Cadencia ---------- */
  const CASOS_CAD = { CA:[[5,1],[1,5,1]], SC:[[1,5],[5,1,5]] };
  // generarCadencia() → instancia: se dan la tonalidad, el tipo y el número
  // de acordes; la respuesta, una realización obvia (soprano libre, nunca en
  // 5̂) con su tipo exacto (CAP/CAI por la soprano final).
  function generarCadencia(opts){
    opts=opts||{};
    for(let intento=0; intento<40; intento++){
      const key=rnd(tonalidades());
      const tipo=opts.tipo || rnd(['CA','SC']);
      const grados=rnd(CASOS_CAD[tipo]), acs=acordesDe(key, grados);
      // la soprano: una línea obvia al azar, en alturas; el resto, libre
      const ls=lineas(grados).filter(l=>!dificil(l));
      const linea=rnd(ls), sop=sopranoEnAlturas(key, linea);
      if(!sop) continue;
      const obvias=realizaciones(key, acs, {sop}).filter(r=>r.principal==='obvia').sort((a,b)=>a.coste-b.coste);
      if(!obvias.length) continue;
      const elegida=rnd(obvias.slice(0, 3));
      const fin=linea[linea.length-1];
      const exacto = tipo==='SC' ? 'SC' : fin===1 ? 'CAP' : 'CAI';
      return instancia('cadencia', key, grados, acs, elegida, {
        tipo, exacto, linea,
        resp: [0,1,2,3].map(()=>grados.map(()=>true))
      });
    }
    return null;
  }

  function instancia(variante, key, grados, acs, real, extra){
    const voces=[0,1,2,3].map(v=>real.v.map(d=>d[v]));
    return Object.assign({variante, key, grados, acordes:acs, voces, real,
      romanos:romanos(grados), cesiones:cesiones(real, grados)}, extra);
  }

  /* ---------- texto de la respuesta ---------- */
  const SIGLAS = {CA:'Cadencia auténtica', SC:'Semicadencia', CAP:'Cadencia auténtica perfecta', CAI:'Cadencia auténtica imperfecta'};
  const GR = {1:'1̂',2:'2̂',3:'3̂',7:'7̂'};
  function respuesta(inst){
    const q=inst.romanos.join(' – ');
    let det=inst.key.nombre;
    if(inst.variante==='canto'){
      det += ' · soprano '+inst.linea.map(g=>GR[g]).join('–');
      det += inst.cesiones.length ? ' · Se cede: '+inst.cesiones.join('; ')+'.' : ' · Realización obvia: nota común y la sensible a la tónica.';
      if(inst.otra) det += ' También vale: '+cesiones(inst.otra, inst.grados).join('; ')+'.';
    } else if(inst.variante==='cadencia'){
      if(inst.tipo==='CA'){
        const otro = inst.exacto==='CAP' ? 'en 3̂, sería CAI' : 'en 1̂, sería CAP';
        return {ansQ:`${inst.exacto} · ${q}`, ansDet:`${SIGLAS[inst.exacto]}: la soprano acaba en ${GR[inst.linea[inst.linea.length-1]]}. Con la soprano ${otro}. ${inst.key.nombre}.`};
      }
      return {ansQ:`SC · ${q}`, ansDet:`${SIGLAS.SC}, en ${inst.key.nombre}: acaba en el V (soprano en ${GR[inst.linea[inst.linea.length-1]]}).`};
    } else det += ' · nota común mantenida; las demás voces, por grado; la sensible, a la tónica.';
    return {ansQ:q, ansDet:det};
  }
  // El dato que va sobre la partitura: la tonalidad (la armadura no dice el
  // modo). En Cadencia, el tipo y el número de acordes van en la pregunta:
  // sobre el primer tiempo, un texto largo se sale por la izquierda.
  const dato = inst => inst.key.nombre;
  const NUM = {2:'dos', 3:'tres'};
  function pregunta(inst){
    return `Escribe una <b>${inst.tipo==='CA' ? 'cadencia auténtica (CA)' : 'semicadencia (SC)'}</b> de `
      + `<b>${NUM[inst.grados.length]} acordes</b> en ${inst.key.nombre}, con I y V en estado fundamental.`;
  }

  /* ---------- MEI ---------- */
  const accMap={1:'s',0:'n','-1':'f',2:'x','-2':'ff'};
  const sigStr = sig => sig===0 ? '0' : Math.abs(sig)+(sig>0?'s':'f');
  const idNota = (v,k) => `n${v}_${k}`;
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  // toMEI(inst): blancas en un compás sin métrica visible, pentagrama doble.
  // Lo que es respuesta (inst.resp[v][k] y los romanos) lleva type="resp".
  function toMEI(inst){
    const sig=CV.keysigAlters(inst.key.sig), n=inst.grados.length;
    const nt=(p,v,k)=>`<note xml:id="${idNota(v,k)}" dur="2" pname="${p.letter.toLowerCase()}" oct="${p.oct}"`
      + (p.alter!==sig[p.letter] ? ` accid="${accMap[p.alter]}"` : '') + (inst.resp[v][k] ? ' type="resp"' : '') + '/>';
    const capa=(v,l)=>`<layer n="${l}">${inst.voces[v].map((p,k)=>nt(p,v,k)).join('')}</layer>`;
    const harms=inst.romanos.map((r,k)=>`<harm place="below" staff="2" startid="#${idNota(3,k)}" type="resp">${r}</harm>`).join('');
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(inst.key.sig)}" meter.count="${n}" meter.unit="2" meter.form="invis">
   <staffGrp symbol="brace" bar.thru="true"><staffDef n="1" lines="5" clef.shape="G" clef.line="2"/><staffDef n="2" lines="5" clef.shape="F" clef.line="4"/></staffGrp>
  </scoreDef>
  <section><measure right="end"><staff n="1">${capa(0,1)}${capa(1,2)}</staff><staff n="2">${capa(2,1)}${capa(3,2)}</staff>${harms}<reh place="above" staff="1" tstamp="1" type="dato">${esc(dato(inst))}</reh></measure></section>
 </score></mdiv></body></music>
</mei>`;
  }

  /* ---------- audio ---------- */
  const PASO = 1.2;
  // Sin revelar suena lo dado (en Cadencia, el acorde de tónica como
  // referencia); revelado, todo.
  function midis(inst, revelado){
    const out=[];
    if(!revelado && inst.variante==='cadencia'){
      const k=inst.grados.indexOf(1);
      inst.voces.forEach(v=>out.push({midi:v[k].midi, at:0, dur:PASO*1.5}));
      return out;
    }
    inst.voces.forEach((v,i)=>v.forEach((p,k)=>{
      if(revelado || !inst.resp[i][k]) out.push({midi:p.midi, at:k*PASO, dur:PASO*0.95});
    }));
    return out;
  }

  const api = { generarBajo, generarCanto, generarCadencia, realizaciones, rasgos, cesiones, lineas,
                lineasDelNivel, dificil, repite, acordesDe, alterna, sopranoEnAlturas, porClase, respuesta, dato, pregunta,
                toMEI, midis, idNota, licencias, tonalidades, CASOS_BAJO, CASOS_CAD, MAX_NIVEL_CANTO, NOMBRE_VOZ };
  if (esNode) module.exports = api;
  else global.TonicaDominante = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
