/* ============================================================
   4.º · Unidad 1 — 7.ª diatónica (núcleo compartido)
   ------------------------------------------------------------
   Séptimas de predominante (II7, IV7 y sus inversiones) en la
   progresión cadencial. Diseño: docs/familias/septimas.md.
   Reglas: curriculum/Minimos-conduccion.md (N8, N11 y N16: la
   7.ª se prepara y se resuelve en la misma voz).
     · FÓRMULA T0 · PD con 7.ª · (6/4 cadencial) · D · (I): la
       tónica inicial siempre, para que la 7.ª llegue preparada
       como nota común; II4/2 e IV6/5 van a V6/5 (o V6) → I;
     · REALIZACIÓN por el motor a cuatro voces, con la cláusula de
       la soprano de Cadencias;
     · LÍNEA DE LA 7.ª: preparación, 7.ª (mantenida en el 6/4) y
       resolución, en la misma voz; la ligadura de preparación;
     · CONSIGNAS: 'ii' (II grado: bajo cifrado y primer acorde; se
       pide la voz de la 7.ª y la de la sensible) e 'iiiv' (II y IV
       grados: bajo sin cifrar, primer acorde y la ligadura de
       preparación; se pide el grado y la inversión);
     · BAJO DADO (4 cc.): prolongación + cadencia con una 7.ª de II o
       IV, sobre Prolongación con el perfil `perfilSeptimas`.
   Depende de cuatro-voces-core.js, tonalidades.js,
   mini-lilypond-parser.js, cadencias-core.js y prolongacion-core.js.
   Sin DOM.
   ============================================================ */
(function (global) {
  'use strict';

  const esNode = typeof module !== 'undefined' && module.exports;
  const CV  = esNode ? require('./cuatro-voces-core') : global.CuatroVoces;
  const TON = esNode ? require('../tonalidades') : global.TONALIDADES;
  const ML  = esNode ? require('./mini-lilypond-parser') : global.MiniLily;
  const CAD = esNode ? require('./cadencias-core') : global.Cadencias;
  const PRO = esNode ? require('./prolongacion-core') : global.Prolongacion;

  const rnd = () => Math.random();
  const elige = a => a[Math.floor(rnd()*a.length)];
  function pesado(items){                 // [{x, w}] → x, con probabilidad ∝ w
    const tot=items.reduce((s,i)=>s+i.w,0); let r=rnd()*tot;
    for(const i of items){ r-=i.w; if(r<=0) return i.x; }
    return items[items.length-1].x;
  }

  const MAX_NIVEL = 2;
  const NOMBRE_VOZ = ['soprano','contralto','tenor','bajo'];
  const LA_VOZ = ['la soprano','la contralto','el tenor','el bajo'];

  /* ---------- catálogo (septimas.md §2) ---------- */
  const ACORDES = {
    I:{grado:1}, I6:{grado:1,inv:1}, VI:{grado:6},
    I64:{grado:1,inv:2,cadencial64:true},
    V:{grado:5}, V7:{grado:5,septima:true}, V6:{grado:5,inv:1}, V65:{grado:5,inv:1,septima:true},
    II7:{grado:2,septima:true}, II65:{grado:2,inv:1,septima:true},
    II43:{grado:2,inv:2,septima:true}, II42:{grado:2,inv:3,septima:true},
    IV7:{grado:4,septima:true}, IV65:{grado:4,inv:1,septima:true}
  };
  const SEPTIMAS = ['II7','II65','II43','II42','IV7','IV65'];
  const T0 = [ {id:'I', w:3, desde:1}, {id:'I6', w:3, desde:1}, {id:'VI', w:1, desde:2} ];
  // PD por consigna: el nivel 1, solo los de bajo ④ (II6/5; en 'iiiv', II6/5
  // frente a IV7, que comparten bajo y solo los distingue la nota ligada).
  // Pesos por nivel (w[nivel-1]): en el nivel 2, los del nivel 1 bajan para que
  // salgan de verdad las inversiones nuevas (revisión del 2026-10-17).
  const PD = {
    ii:   [ {id:'II65', w:[1,1], desde:1}, {id:'II7', w:[0,1], desde:2}, {id:'II43', w:[0,1], desde:2}, {id:'II42', w:[0,2.2], desde:2} ],
    iiiv: [ {id:'II65', w:[1,1], desde:1}, {id:'IV7', w:[1,1], desde:1}, {id:'II7', w:[0,1], desde:2},
            {id:'II43', w:[0,1], desde:2}, {id:'IV65', w:[0,1.8], desde:2, soloMayor:true}, {id:'II42', w:[0,2.2], desde:2} ]
  };
  // Vetos: el mismo bajo repetido (VI–II4/3, VI–IV6/5) y ③–⑥ (como I6–IV6 en
  // Cadencias).
  const VETADAS = [['VI','II43'], ['VI','IV65'], ['I6','II43'], ['I6','IV65']];
  const vetada = (a,b) => VETADAS.some(v=>v[0]===a && v[1]===b);
  // Dominante tras cada PD: la 7.ª del V7 pide 4̂ preparado, que el II6/5 lleva
  // en el bajo (apuntes c4u1 §2.2): ahí, mejor V.
  const D_TRAS = { II65:{V:3,V7:1}, II7:{V:1,V7:2}, II43:{V:2,V7:1}, IV7:{V:2,V7:2}, I64:{V:1,V7:1} };
  const P_SC = 0.25, P_64 = 0.4;

  function formula(consigna, nivel, modo){
    // la PD primero, y la tónica entre las que no la vetan: si no, los vetos
    // (I6 y VI ante II4/3) dejaban el II4/3 en muy pocos casos
    const pd=pesado(PD[consigna].filter(a=>a.desde<=nivel && !(a.soloMayor && modo==='minor')).map(a=>({x:a.id, w:a.w[nivel-1]})));
    const t0s=T0.filter(a=>a.desde<=nivel && !vetada(a.id,pd));
    if(!t0s.length) return null;
    const t0=pesado(t0s.map(a=>({x:a.id, w:a.w})));
    const ids=[t0,pd];
    let tipo = rnd()<0.6 ? 'CAP' : 'CAI';
    if(pd==='II42') ids.push(pesado([{x:'V65',w:3},{x:'V6',w:1}]), 'I');      // no cadencial
    else if(pd==='IV65') ids.push('V65','I');
    else{
      const sc = rnd()<P_SC;
      if(rnd()<P_64) ids.push('I64');
      const prev=ids[ids.length-1];
      ids.push(sc ? 'V' : pesado(Object.entries(D_TRAS[prev]).map(([x,w])=>({x,w}))));
      if(sc) tipo='SC'; else ids.push('I');
    }
    return {tipo, ids, pd:1};
  }
  function acordesDe(key, ids){
    return ids.map((id,k)=>{
      const s=Object.assign({id}, ACORDES[id]);
      if(id==='I' && k===ids.length-1 && ids[k-1]==='V7') s.dup={omitir:'5'};
      return CV.acorde(key, s);
    });
  }

  /* ---------- la línea de la 7.ª ---------- */
  // En la voz de la 7.ª del acorde p: la preparación (p-1), la 7.ª, la misma
  // nota mantenida (el 6/4 cadencial retrasa la resolución) y la resolución.
  // → {v, prep, sept, notas:[k…], res} o null.
  function lineaSeptima(acordes, voces, p){
    const v=[0,1,2,3].find(v=>voces[v][p].rol==='7');
    if(v==null || p===0) return null;
    const notas=[p-1, p];
    let k=p+1;
    while(k<acordes.length && voces[v][k].abs===voces[v][p].abs && voces[v][k].alter===voces[v][p].alter){ notas.push(k); k++; }
    const res = k<acordes.length ? k : null;
    if(res!==null) notas.push(res);
    return {v, prep:p-1, sept:p, notas, res};
  }

  // Notas de la línea a las que llega una ligadura: la 7.ª y, si se mantiene
  // (6/4 cadencial), las siguientes hasta antes de la resolución.
  const ligadas = l => l.notas.filter(k=>k>l.prep && k!==l.res);

  /* ---------- ritmo ---------- */
  // Plantillas de Cadencias (N9 con el 6/4 cadencial); además, la PD con 7.ª
  // mejor en parte más fuerte que el acorde en que resuelve (apuntes c4u1
  // §1.2: es un retardo), sin exigirlo.
  const W_PD_DEBIL = 0.25;
  function ritmo(nivel, ids, pd){
    const n=ids.length, i64=ids.indexOf('I64');
    const tabla = (i64===n-2) ? CAD.PLANTILLAS_SC64 : CAD.PLANTILLAS;
    const opciones=[];
    Object.keys(tabla).forEach(time=>(tabla[time][n]||[]).forEach(p=>{
      if(nivel<2 && p.startsWith('↑')) return;
      const r=CAD.leerPlantilla(p, time);
      let w=1;
      if(i64>=0){
        const c=r.compases.findIndex(m=>m.some(x=>x.k===i64));
        const enMismo=r.compases[c].some(x=>x.k===i64+1);
        const pat=r.compases[c].map(x=>x.dur), i=r.compases[c].findIndex(x=>x.k===i64);
        const tern=CAD.n9Ternario(time, pat, i);
        if(!enMismo || !(r.fuerza[i64]>r.fuerza[i64+1] || tern)) return;
        if(tern && !(r.fuerza[i64]>r.fuerza[i64+1])) w*=0.3;
      }
      if(r.fuerza[pd] < r.fuerza[pd+1]) w*=W_PD_DEBIL;
      opciones.push({x:Object.assign({time, plantilla:p}, r), w});
    }));
    return opciones.length ? pesado(opciones) : null;
  }

  /* ---------- cifras del bajo (consigna 'ii') ---------- */
  // Como un bajo cifrado (bajo-cifrado-core.js): de arriba abajo; en menor, la
  // sensible lleva su alteración —sola si es la 3.ª sobre el bajo, delante de la
  // cifra si no—; si está en el bajo, la lleva la nota. El V tras el 6/4
  // cadencial, 5/3 (o 7 con la 3.ª: 7/♯ en menor).
  const BASE_CIFRAS = { triada:[[],['6'],['6','4']], septima:[['7'],['6','5'],['4','3'],['4','2']] };
  function cifrasBajo(key, a, idPrev){
    let f = (a.septima ? BASE_CIFRAS.septima : BASE_CIFRAS.triada)[a.inv].slice();
    if(idPrev==='I64' && a.grado===5 && a.inv===0) f = a.septima ? ['7','3'] : ['5','3'];
    if(key.mode==='minor'){
      const sig=CV.keysigAlters(key.sig);
      a.tones.forEach((t,i)=>{
        if(t.deg!==7 || i===a.inv) return;
        const acc = t.alter===sig[t.letter] ? null : (t.alter===0 ? '♮' : CV.SYM(t.alter));
        if(!acc) return;
        const sobre = String(((2*(i - a.inv)) % 7 + 7) % 7 + 1);   // 3, 5, 6… sobre el bajo
        const num = sobre==='1' ? '8' : sobre;
        if(num==='3'){ const j=f.indexOf('3'); if(j>=0) f[j]=acc; else f.push(acc); }
        else { const j=f.indexOf(num); if(j>=0) f[j]=acc+num; else f.unshift(acc+num); }
      });
    }
    return f;
  }

  /* ---------- generación: 'ii' y 'iiiv' ---------- */
  function tonalidades(){ return TON.hastaTrimestre(3); }
  function musica(voz, r){
    return r.compases.map(m=>m.map(x=>CV.token(voz[x.k])+x.dur).join(' ')).join(' | ');
  }
  const ES = p => CV.ES[p.letter]+CV.SYM(p.alter);

  // generar(consigna, nivel) → instancia (o null)
  function generar(consigna, nivel, opts){
    opts=opts||{};
    consigna = consigna==='iiiv' ? 'iiiv' : 'ii';
    nivel=Math.max(1,Math.min(MAX_NIVEL,nivel|0));
    const keys=opts.key ? [opts.key] : tonalidades();
    for(let intento=0;intento<80;intento++){
      const key=elige(keys);
      const fm=formula(consigna, nivel, key.mode);
      if(!fm || (opts.pd && fm.ids[1]!==opts.pd)) continue;
      const acordes=acordesDe(key, fm.ids);
      const pdCh=acordes[fm.pd], t7=pdCh.tones.find(t=>t.rol==='7');
      const g=CAD.ganchos(fm.tipo);
      const enBajo = pdCh.bass===3;
      const real=CV.realizar(key, acordes, {
        filtro:(path,c,k,acs)=>{
          if(!g.filtro(path,c,k,acs)) return false;
          // 'ii': en el primer acorde, una sola voz superior con la nota que
          // será la 7.ª (si no, «en qué voz» no tendría respuesta única)
          if(consigna==='ii' && k===0 && !enBajo && [0,1,2].filter(v=>c.v[v].deg===t7.deg).length!==1) return false;
          return true;
        },
        puntuar:g.puntuar
      });
      if(!real) continue;
      const r=ritmo(nivel, fm.ids, fm.pd);
      if(!r) continue;
      const linea=lineaSeptima(acordes, real.voces, fm.pd);
      if(!linea || linea.res===null) continue;
      const tipo=CAD.tipoPorSoprano(fm.tipo, real.voces[0][real.voces[0].length-1].deg);
      // la sensible, en la dominante de la resolución
      const kD=fm.ids.findIndex((id,k)=>k>fm.pd && id[0]==='V');
      const vSens=[0,1,2,3].find(v=>real.voces[v][kD].deg===7);
      const inst={ consigna, nivel, key, tipo, ids:fm.ids, pd:fm.pd, acordes, voces:real.voces, ritmo:r,
                   pen:real.pen, linea, kD, vSens };
      inst.cifras=acordes.map((a,k)=>cifrasBajo(key, a, fm.ids[k-1]));
      inst.json=json(inst);
      return inst;
    }
    return null;
  }

  // Bajo del PD como «④» y la lectura contraria en 'iiiv' (II6/5 ↔ IV7, II4/3 ↔ IV6/5)
  const CIRC = ['①','②','③','④','⑤','⑥','⑦'];
  const PAREJA = { II65:'IV7', IV7:'II65', II43:'IV65', IV65:'II43' };
  const INVERSION = ['estado fundamental','1.ª inversión','2.ª inversión','3.ª inversión'];
  function json(inst){
    const {key, ritmo:r, acordes, linea, voces}=inst;
    const pd=acordes[inst.pd], v=linea.v;
    const s7=voces[v][inst.pd], res=voces[v][linea.res];
    const con64 = inst.ids[inst.pd+1]==='I64';
    const answer={
      tonalidad:key.nombre,
      acordes:acordes.map(a=>({id:a.id, romano:a.romano, cifras:a.cifras, americano:a.americano})),
      pd:{romano:pd.romano, grado:pd.grado, inversion:INVERSION[pd.inv], americano:pd.americano},
      septima:{voz:NOMBRE_VOZ[v], nota:ES(s7), grado:pd.tones.find(t=>t.rol==='7').deg},
      resolucion:{nota:ES(res), voz:NOMBRE_VOZ[v], con64},
      sensible:{voz:NOMBRE_VOZ[inst.vSens]}
    };
    return {
      family:'septimas', consigna:inst.consigna, level:inst.nivel,
      context:{ key:{tonic:key.tonic, mode:key.mode, sig:key.sig}, time:r.time, partial:r.partial },
      voices: voces.map((vv,i)=>({clef:i<2?'treble':'bass', music:musica(vv,r)})),
      prompt: inst.consigna==='ii' ? '¿En qué voz irá la 7.ª del II? ¿Y la sensible?'
                                   : '¿Es un II o un IV con 7.ª? ¿En qué inversión?',
      answer
    };
  }

  // Texto de la respuesta (las páginas lo envuelven en su marcado)
  function explicacion(inst){
    const a=inst.json.answer, pd=inst.acordes[inst.pd], v=inst.linea.v;
    const prep=inst.acordes[inst.linea.prep];
    const camino = a.resolucion.con64 ? ', se mantiene en el 6/4 cadencial' : '';
    const destino = inst.consigna==='ii' ? `la sensible (${a.resolucion.nota}) en el ${inst.acordes[inst.linea.res].romano}`
                                         : `${a.resolucion.nota} en el ${inst.acordes[inst.linea.res].romano}`;
    const comun = `La 7.ª del ${pd.romano}, ${a.septima.nota} (${a.septima.grado}̂), ya suena en el ${prep.romano}, en ${LA_VOZ[v]}: `
      + `se prepara como nota común${camino} y baja a ${destino}, en la misma voz.`;
    if(inst.consigna==='ii') return comun;
    const bajo=CIRC[CV.acorde(inst.key, ACORDES[pd.id]).tones[pd.bass].deg-1];
    const otro=PAREJA[pd.id];
    const contraste = otro ? ` Sobre ${bajo}, si la nota ligada fuera ${a.septima.grado===1?'3̂':'1̂'}, sería un ${CV.acorde(inst.key, ACORDES[otro]).romano}.` : '';
    return comun + contraste;
  }

  /* ---------- MEI ---------- */
  const accMap={1:'s',0:'n','-1':'f',2:'x','-2':'ff'};
  const clefAttr = c => c==='bass' ? 'clef.shape="F" clef.line="4"' : 'clef.shape="G" clef.line="2"';
  const durAttrs = d => { const m=/^(\d+)(\.*)$/.exec(d); return `dur="${m[1]}"`+(m[2].length?` dots="${m[2].length}"`:''); };
  const sigStr = sig => sig===0 ? '0' : Math.abs(sig)+(sig>0?'s':'f');
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const PRE = ['s','a','t','b'];
  const VO_CIFRADO = -1;      // la fila de cifras/romanos, algo más baja
  const CUERPO_CIFRAS = '115%';

  // toMEI(inst): siempre con máscara (página común). Se ven el bajo, el primer
  // acorde completo y la tonalidad (dato); en 'ii', las cifras del bajo
  // (`preg`), y en 'iiiv', la ligadura de preparación, cuya nota de llegada
  // está oculta. Al revelar: las voces superiores, el romano con cifras, el
  // americano, la ligadura (en 'ii') y, en gris (`atenua`), las notas
  // superiores que no son de la línea de la 7.ª.
  function toMEI(inst){
    const key=inst.key, sig=CV.keysigAlters(key.sig), [num,den]=inst.ritmo.time.split('/');
    const enLinea = (v,k) => v===inst.linea.v && inst.linea.notas.includes(k);
    const tipos=(v,k)=>{
      const t=[];
      if(v<3 && k>0) t.push('resp');
      if(v<3 && !enLinea(v,k)) t.push('atenua');
      return t.length ? ` type="${t.join(' ')}"` : '';
    };
    const nota=(v,x)=>{
      const p=inst.voces[v][x.k];
      const acc = p.alter!==sig[p.letter] ? ` accid="${accMap[p.alter]}"` : '';
      return `<note xml:id="${PRE[v]}${x.k}" ${durAttrs(x.dur)} pname="${p.letter.toLowerCase()}" oct="${p.oct}"${acc}${tipos(v,x.k)}/>`;
    };
    const capa=(v,m)=>`<layer n="${v%2+1}">${m.map(x=>nota(v,x)).join('')}</layer>`;
    const cifrasXml=(figs, rom)=>(rom ? `<rend>${esc(rom)}</rend>` : '')
      + figs.map((f,i)=>`<rend rend="${i===0?'sup':'sub'}" fontsize="${CUERPO_CIFRAS}">${esc(f)}</rend>`).join('');
    const romanoXml=a=>cifrasXml(a.cifras ? a.cifras.split('/') : [], a.romano.replace(a.cifras,''));
    // ligaduras: la de preparación (en 'iiiv', visible: es el dato) y, si la 7.ª
    // se mantiene en el 6/4 cadencial, también hasta él (siempre respuesta)
    const L=inst.linea;
    const ligaduras={};
    ligadas(L).forEach(k=>{ ligaduras[k-1]=`<tie startid="#${PRE[L.v]}${k-1}" endid="#${PRE[L.v]}${k}"${inst.consigna==='ii' || k!==L.sept ?' type="resp"':''}/>`; });
    const measures=inst.ritmo.compases.map((m,i)=>{
      const last=i===inst.ritmo.compases.length-1;
      const attrs=(inst.ritmo.anacrusa && i===0 ? ' metcon="false"' : '') + (last ? ' right="end"' : '');
      let ctl='';
      m.forEach(x=>{
        const a=inst.acordes[x.k];
        ctl += `<harm place="above" staff="1" startid="#s${x.k}" type="americano resp"><rend fontsize="80%">${esc(a.americano)}</rend></harm>`;
        if(inst.consigna==='ii' && inst.cifras[x.k].length)
          ctl += `<harm place="below" staff="2" startid="#b${x.k}" type="preg" vo="${VO_CIFRADO}">${cifrasXml(inst.cifras[x.k])}</harm>`;
        ctl += `<harm place="below" staff="2" startid="#b${x.k}" type="resp" vo="${VO_CIFRADO}">${romanoXml(a)}</harm>`;
        if(ligaduras[x.k]) ctl += ligaduras[x.k];
      });
      if(i===0) ctl += `<reh place="above" staff="1" tstamp="1" type="dato">${esc(key.nombre)}</reh>`;
      return `<measure n="${inst.ritmo.anacrusa ? i : i+1}"${attrs}>`
        + `<staff n="1">${capa(0,m)}${capa(1,m)}</staff>`
        + `<staff n="2">${capa(2,m)}${capa(3,m)}</staff>${ctl}</measure>`;
    }).join('\n   ');
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(key.sig)}" meter.count="${num}" meter.unit="${den}">
   <staffGrp symbol="brace" bar.thru="true"><staffDef n="1" lines="5" ${clefAttr('treble')}/><staffDef n="2" lines="5" ${clefAttr('bass')}/></staffGrp>
  </scoreDef>
  <section>
   ${measures}
  </section>
 </score></mdiv></body></music>
</mei>`;
  }

  /* ---------- audio ---------- */
  const NEGRA_S = 0.6;
  // midis(inst, {revelado}): sin revelar, el primer acorde y después el bajo;
  // al revelar, las cuatro voces, con la nota ligada sostenida.
  function midis(inst, opts){
    const rev=!!(opts && opts.revelado), out=[];
    const segs=inst.ritmo.durs.map(d=>ML.durTokenValue(d)*4*NEGRA_S);
    let t=0;
    const sueltas={};      // nota ligada: se alarga la anterior en vez de repetirla
    segs.forEach((seg,k)=>{
      [0,1,2,3].forEach(v=>{
        if(!rev && v<3 && k>0) return;
        if(rev && v===inst.linea.v && ligadas(inst.linea).includes(k)){ sueltas[v].dur += seg; return; }
        const n={midi:inst.voces[v][k].midi, at:t, dur:seg*0.95};
        out.push(n); sueltas[v]=n;
      });
      t+=seg;
    });
    return out;
  }

  /* ---------- Bajo dado: prolongación + cadencia (septimas.md §5) ---------- */
  // Perfil para prolongacion-core.js: qué PD caben en la cadencia (al generar
  // y al analizar el bajo), si hay células con 7.ª en la prolongación y la
  // condición de que la frase lleve al menos un II o IV con 7.ª. La base es el
  // nivel 2 de Prolongación (inversiones de V7, 6/4 cadencial, menor).
  const NIVEL_BASE = 2;
  const PD_SEPT = [{x:'II65',w:5},{x:'II7',w:2},{x:'IV7',w:3}];
  function perfilSeptimas(nivel){
    const triadas = modo => CAD.casilla('PD', NIVEL_BASE, modo).filter(x=>x.x!=='IV6');
    return {
      pdGen: modo => nivel>=2 ? PD_SEPT.concat(triadas(modo)) : PD_SEPT,
      pdLect: modo => PD_SEPT.concat(triadas(modo)),
      celulas: nivel>=2,
      exige: est => est.ev.some(e=>SEPTIMAS.includes(e.id))
    };
  }
  // generarFrase(nivel) → instancia de Prolongación (tipo 2) + la línea de cada
  // 7.ª; en la cadencia, las alternativas que se muestran son solo las de 7.ª
  // (la consigna pide una).
  function generarFrase(nivel, opts){
    nivel=Math.max(1,Math.min(MAX_NIVEL,nivel|0));
    for(let i=0;i<20;i++){
      const inst=PRO.generar(2, NIVEL_BASE, Object.assign({perfil:perfilSeptimas(nivel)}, opts||{}));
      if(!inst) continue;
      inst.nivelSeptimas=nivel;
      inst.alternativas=inst.alternativas.map((alts,k)=>inst.est.ev[k].rol==='PD'
        ? alts.filter(id=>SEPTIMAS.includes(id)) : alts);
      inst.json.answer.acordes.forEach((a,k)=>{ a.alternativas=inst.alternativas[k].map(id=>PRO.acordeDe(inst.key,id).romano); });
      inst.lineas=inst.ids.map((id,k)=>SEPTIMAS.includes(id) ? lineaSeptima(inst.acordes, inst.voces, k) : null).filter(Boolean);
      if(inst.lineas.some(l=>l.res===null)) continue;
      inst.json.prompt='¿En qué tonalidad estás? Armoniza el bajo con un II o un IV con 7.ª. ¿Dónde se prolonga y dónde está la cadencia?';
      inst.json.answer.septimas=inst.lineas.map(l=>({acorde:inst.acordes[l.sept].romano, voz:NOMBRE_VOZ[l.v],
        nota:ES(inst.voces[l.v][l.sept]), resolucion:ES(inst.voces[l.v][l.res])}));
      return inst;
    }
    return null;
  }
  // MEI de Prolongación + la línea de cada 7.ª en el color de la respuesta
  // (`destaca`) y la ligadura de preparación, las dos ocultas hasta revelar.
  function toMEIFrase(inst, opts){
    let mei=PRO.toMEI(inst, opts);
    inst.lineas.forEach(l=>{
      l.notas.forEach(k=>{ mei=mei.replace(`<note xml:id="${PRE[l.v]}${k}" `, `<note xml:id="${PRE[l.v]}${k}" type="destaca" `); });
      ligadas(l).forEach(k=>{
        const at=mei.indexOf(`xml:id="${PRE[l.v]}${k-1}"`), fin=mei.indexOf('</measure>', at);
        if(at<0 || fin<0) return;
        mei=mei.slice(0,fin)+`<tie startid="#${PRE[l.v]}${k-1}" endid="#${PRE[l.v]}${k}" type="resp destaca"/>`+mei.slice(fin);
      });
    });
    return mei;
  }
  // Explicación de cada 7.ª (Bajo dado)
  function explicacionFrase(inst){
    return inst.lineas.map(l=>{
      const a=inst.acordes[l.sept];
      return `La 7.ª del ${a.romano} (${ES(inst.voces[l.v][l.sept])}), en ${LA_VOZ[l.v]}: preparada en el ${inst.acordes[l.prep].romano}, `
        + `resuelve en ${ES(inst.voces[l.v][l.res])} en el ${inst.acordes[l.res].romano}.`;
    });
  }

  const api = {
    generar, toMEI, midis, explicacion, MAX_NIVEL, NOMBRE_VOZ, ACORDES, SEPTIMAS, PD,
    generarFrase, toMEIFrase, explicacionFrase, perfilSeptimas,
    // para pruebas
    formula, acordesDe, lineaSeptima, ritmo, cifrasBajo, vetada
  };
  if (esNode) module.exports = api;
  else global.Septimas = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
