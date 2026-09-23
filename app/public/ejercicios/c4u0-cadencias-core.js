/* ============================================================
   4.º · Unidad 0 — Cadencias (núcleo compartido)
   ------------------------------------------------------------
   Lógica común a las tres variantes (tipo, bajo dado, canto dado)
   de la familia Cadencias. Diseño: docs/Generador-ejercicios.md
   §4 ter. Reglas de escritura: curriculum/Minimos-conduccion.md.
     · CATÁLOGO: cadencias (CAP, CAI, SC, SC frigia, CR) como
       fórmula por casillas T0 · PD · D64 · D · TF, con los acordes
       y pesos de §4t.3 por nivel y modo, y una lista de vetos;
     · REALIZACIÓN a cuatro voces por el motor genérico
       (cuatro-voces-core.js), con la cláusula de la soprano de
       §4t.4 como filtro (grado final) y puntuación (movimiento);
     · RITMO por plantillas (§4t.5): compás 2/4, 3/4 o 4/4, con
       anacrusa desde el nivel 2; el 6/4 cadencial en parte más
       fuerte que su V y en el mismo compás;
     · SALIDA: JSON de §5.2 (cuatro cadenas mini-LilyPond, una
       por voz, con bar checks y `partial`), exportador a MEI
       (pentagrama doble, dos capas por pentagrama, cifrado
       americano encima y romanos con cifras debajo) y notas MIDI.
     · VARIANTES: generar() (Tipo), generarBajo() y generarCanto().
       Las dos últimas parten de una realización completa y añaden
       las LECTURAS ALTERNATIVAS, que se obtienen enumerando el
       catálogo entero (es pequeño) y quedándose con las fórmulas
       realizables: por casilla en Bajo dado, por línea de bajo en
       Canto dado. Canto dado descarta además las instancias que
       se leerían igual en la tonalidad relativa (§4t.7 bis).
   Depende de cuatro-voces-core.js (CuatroVoces), tonalidades.js
   (TONALIDADES) y mini-lilypond-parser.js (MiniLily). Sin DOM.
   ============================================================ */
(function (global) {
  'use strict';

  const esNode = typeof module !== 'undefined' && module.exports;
  const CV  = esNode ? require('./cuatro-voces-core') : global.CuatroVoces;
  const TON = esNode ? require('../tonalidades') : global.TONALIDADES;
  const ML  = esNode ? require('./mini-lilypond-parser') : global.MiniLily;

  const rnd = () => Math.random();
  const elige = a => a[Math.floor(rnd()*a.length)];
  function pesado(items){                 // [{x, w}] → x, con probabilidad ∝ w
    const tot=items.reduce((s,i)=>s+i.w,0); let r=rnd()*tot;
    for(const i of items){ r-=i.w; if(r<=0) return i.x; }
    return items[items.length-1].x;
  }

  /* ---------- catálogo (§4t.2, §4t.3) ---------- */
  const MAX_NIVEL = 3;
  const TIPOS = {
    CAP:{sigla:'CAP', nombre:'Cadencia Auténtica Perfecta', desde:1},
    CAI:{sigla:'CAI', nombre:'Cadencia Auténtica Imperfecta', desde:1},
    SC: {sigla:'SC',  nombre:'Semicadencia', desde:1},
    SCF:{sigla:'SC (frigia)', nombre:'Semicadencia Frigia', desde:2, soloMenor:true},
    CR: {sigla:'CR',  nombre:'Cadencia Rota', desde:2}
  };
  // Acordes por id → spec para CuatroVoces.acorde()
  const ACORDES = {
    I:{grado:1,inv:0}, I6:{grado:1,inv:1}, VI:{grado:6,inv:0},
    IV:{grado:4,inv:0}, II6:{grado:2,inv:1}, II:{grado:2,inv:0}, IV6:{grado:4,inv:1},
    I64:{grado:1,inv:2,cadencial64:true}, V:{grado:5,inv:0}, V7:{grado:5,inv:0,septima:true}
  };
  // Casillas T0 y PD: acordes con peso por modo y nivel desde el que entran.
  const CASILLAS = {
    T0:[ {id:'I', w:{major:3,minor:3}, desde:1}, {id:'I6', w:{major:6,minor:6}, desde:1},
         {id:'VI', w:{major:1,minor:1}, desde:3} ],
    PD:[ {id:'IV', w:{major:3,minor:3}, desde:1}, {id:'II6', w:{major:5,minor:5}, desde:1},
         {id:'II', w:{major:1,minor:0}, desde:2},
         {id:'IV6', w:{major:1,minor:3}, desde:{major:3,minor:2}} ],
    D: [ {id:'V', w:{major:2,minor:2}, desde:1}, {id:'V7', w:{major:3,minor:3}, desde:1} ]
  };
  const PRESENCIA = { T0:0.8, PD:0.9, D64:0.6 };
  // Fórmulas vetadas: PARES de acordes consecutivos (§4t.3). VI–IV6 repite el
  // bajo; I6–IV6, bajo 3̂–6̂ sin sentido; I–II, fuera del estilo.
  const FORMULAS_VETADAS = [['VI','IV6'], ['I6','IV6'], ['I','II']];
  const vetada = ids => ids.some((id,k)=>k>0 && FORMULAS_VETADAS.some(v=>v[0]===ids[k-1] && v[1]===id));
  // En MENOR, IV6 justo antes de V es SIEMPRE la frigia: la SC común no puede
  // usar esa combinación, o los mismos acordes saldrían con dos etiquetas
  // (§4t.7 bis). Con el 6/4 cadencial por medio ya no es la frigia, y vale.
  const etiquetaChocante = (tipo, ids, modo) =>
    modo==='minor' && tipo==='SC' && ids.some((id,k)=>id==='IV6' && ids[k+1]==='V');

  function casilla(nombre, nivel, modo){
    return CASILLAS[nombre]
      .filter(a=>{ const d = typeof a.desde==='object' ? a.desde[modo] : a.desde; return nivel>=d && a.w[modo]>0; })
      .map(a=>({x:a.id, w:a.w[modo]}));
  }
  function tiposDisponibles(nivel, modo){
    return Object.keys(TIPOS).filter(t=>TIPOS[t].desde<=nivel && (!TIPOS[t].soloMenor || modo==='minor'));
  }
  // Fórmula aleatoria: {tipo, ids} o null si se rechaza (vetada / demasiado corta).
  function formula(nivel, key){
    const modo=key.mode;
    const tipo = elige(tiposDisponibles(nivel, modo));
    const ids=[];
    if(rnd()<PRESENCIA.T0) ids.push(pesado(casilla('T0',nivel,modo)));
    if(tipo==='SCF'){ ids.push('IV6','V'); }
    else{
      if(rnd()<PRESENCIA.PD) ids.push(pesado(casilla('PD',nivel,modo)));
      if(nivel>=2 && rnd()<PRESENCIA.D64) ids.push('I64');
      ids.push(tipo==='SC' ? 'V' : pesado(casilla('D',nivel,modo)));
      if(tipo==='CAP'||tipo==='CAI') ids.push('I');
      if(tipo==='CR') ids.push(nivel>=3 && rnd()<0.3 ? 'IV6' : 'VI');
    }
    if(ids.length<2 || vetada(ids) || etiquetaChocante(tipo, ids, modo)) return null;
    return {tipo, ids};
  }
  // Modelos de acorde de una fórmula (con las duplicaciones contextuales).
  function acordesDe(key, ids){
    return ids.map((id,k)=>{
      const spec=Object.assign({id}, ACORDES[id]);
      if(id==='VI' && k>0 && ids[k-1][0]==='V') spec.dup={oblig:'3'};          // rota: 3.ª doblada
      if(id==='I' && k===ids.length-1 && k>0 && ids[k-1]==='V7') spec.dup={omitir:'5'};
      return CV.acorde(key, spec);
    });
  }

  /* ---------- cláusula de la soprano (§4t.4) ---------- */
  // Grado final de la soprano por tipo: NORMA (Caplin): CAP 1̂; CAI 3̂/5̂…
  const FINAL = { CAP:[1], CAI:[3,5], SC:[2,7,5], SCF:[5,7], CR:[1,3] };
  // Líneas de soprano preferidas (peso 1–4), como grados «a>b>c» alineados al
  // FINAL de la fórmula. ⟶ PROPUESTA en revisión (§4t.4). Las de dos notas
  // son el respaldo cuando ninguna larga casa.
  const CLAUSULA = {
    CAP:{'4>3>2>1':4,'3>2>1':4,'5>4>3>2>1':4,'5>4>2>1':3,'3>2>1>7>1':4,'3>2>7>1':3,'1>7>1':3,'1>1>7>1':2,
         '3>3>2>1':2,'3>4>2>1':2,'3>4>3>2>1':2,'2>1':3,'1>2>7>1':2,'7>1':2},
    CAI:{'1>2>3':3,'5>4>3':4,'6>5>4>3':4,'6>5>3':4,'3>2>3':3,'3>4>4>3':2,'5>6>5':2,'5>5>5':1,
         '2>3':4,'4>3':3,'5>3':2,'5>5':1},
    SC: {'4>3>2':3,'5>4>3>2':4,'1>1>2':3,'3>3>2':3,'3>4>2':2,'3>2>1>7':4,'1>1>7':2,'3>4>5':1,'5>6>5':1,
         '1>2':3,'3>2':3,'1>7':2,'6>5':1,'4>5':1},
    SCF:{'3>4>5':3,'1>1>7':2,'5>4>5':2,'4>5':3,'1>7':3},
    CR: {'4>3>2>1':4,'3>2>1':4,'1>7>1':3,'1>1>7>1':2,'2>1>7>1':2,'5>4>3':2,'6>5>4>3':2,'2>2>1':2,
         '2>1':2,'7>1':3,'4>3':1}
  };
  const PESO_MAX = 4, SIN_CLAUSULA_FINAL = 6, SIN_CLAUSULA_PARCIAL = 2;
  // Penalización de la soprano `sop` (grados hasta el acorde k, incluido) en una
  // fórmula de n acordes: busca la línea con más peso que coincide, entera o en
  // su parte ya recorrida (líneas alineadas al final: empiezan en n−L).
  function penClausula(tipo, sop, k, n){
    let mejor=null, cubre=false;
    for(const seq in CLAUSULA[tipo]){
      const c=seq.split('>').map(Number), ini=n-c.length;
      if(ini<0 || k<ini) continue;
      cubre=true;
      let ok=true;
      for(let j=ini;j<=k;j++) if(sop[j]!==c[j-ini]){ ok=false; break; }
      if(ok){ const w=CLAUSULA[tipo][seq]; if(mejor===null || w>mejor) mejor=w; }
    }
    const final = k===n-1;
    if(!cubre) return 0;
    if(mejor===null) return final ? SIN_CLAUSULA_FINAL : SIN_CLAUSULA_PARCIAL;
    return (PESO_MAX-mejor) * (final ? 1 : 0.5);
  }
  function ganchos(tipo){
    return {
      filtro:(path,c,k,acs)=> k<acs.length-1 || FINAL[tipo].includes(c.v[0].deg),
      puntuar:(path,c,k,acs)=>{
        const sop=path.map(x=>x.v[0].deg).concat([c.v[0].deg]);
        return penClausula(tipo, sop, k, acs.length);
      }
    };
  }
  // Tipo según la soprano final (para comprobar la etiqueta): CAP/CAI se
  // distinguen solo por el grado final (Caplin).
  function tipoPorSoprano(tipo, degFinal){
    if(tipo==='CAP'||tipo==='CAI') return degFinal===1 ? 'CAP' : 'CAI';
    return tipo;
  }

  /* ---------- ritmo por plantillas (§4t.5) ---------- */
  // '↑' = anacrusa (primer compás incompleto). Duraciones mini-LilyPond.
  const PLANTILLAS = {
    '4/4':{ 2:['1 | 1','↑2 | 1'], 3:['2 2 | 1','↑4 4 | 1'],
            4:['1 | 2 2 | 1','2 4 4 | 1','↑4 | 2 2 | 1'],
            5:['1 | 2 4 4 | 1','2 2 | 2 2 | 1','↑4 | 2 4 4 | 1'] },
    '3/4':{ 2:['2. | 2.','↑4 | 2.'], 3:['2 4 | 2.','↑4 4 | 2.'],
            4:['4 4 4 | 2.','2. | 2 4 | 2.','↑4 | 2 4 | 2.'],
            5:['2. | 4 4 4 | 2.','2 4 | 2 4 | 2.','↑4 | 4 4 4 | 2.'] },
    '2/4':{ 2:['2 | 2','↑4 | 2'], 3:['4 4 | 2','↑4 | 2 | 2'],
            4:['2 | 4 4 | 2','↑4 | 4 4 | 2'],
            5:['4 4 | 4 4 | 2','↑4 | 2 | 4 4 | 2'] }
  };
  // Semicadencia con 6/4 cadencial: la V es el último acorde, así que el
  // 6/4 y la V comparten el último compás (6/4 en la parte fuerte).
  const PLANTILLAS_SC64 = {
    '4/4':{ 2:['2 2'], 3:['1 | 2 2','↑4 | 2 2'], 4:['2 2 | 2 2','↑4 | 1 | 2 2'] },
    '3/4':{ 2:['2 4'], 3:['2. | 2 4','↑4 | 2 4'], 4:['2 4 | 2 4','↑4 | 2. | 2 4'] },
    '2/4':{ 2:['4 4'], 3:['2 | 4 4','↑4 | 4 4'], 4:['4 4 | 4 4','↑4 | 2 | 4 4'] }
  };
  const COMPASES = Object.keys(PLANTILLAS);
  // Valor en redondas → duración escrita ("2", "2.", "4") o null.
  function durToken(v){
    for(const b of [1,2,4,8,16]) for(const d of [0,1,2]){
      const dur=(1/b)*(2-Math.pow(0.5,d));
      if(Math.abs(dur-v)<1e-9) return String(b)+'.'.repeat(d);
    }
    return null;
  }
  // Plantilla → {compases:[[{k, dur}…]…], durs:[…], partial, fuerza:[…]}
  function leerPlantilla(txt, time){
    const anacrusa = txt.startsWith('↑');
    const medida = ML.meterToWhole(time);
    const compases = txt.replace('↑','').split('|').map(s=>s.trim().split(/\s+/));
    let k=0; const out=[], durs=[], fuerza=[];
    compases.forEach((c,i)=>{
      let pos=0; const m=[];
      c.forEach(d=>{
        const v=ML.durTokenValue(d);
        const f = pos===0 ? 3 : (time==='4/4' && Math.abs(pos-0.5)<1e-9) ? 2 : 1;
        m.push({k, dur:d, pos, fuerza: (anacrusa && i===0) ? 0 : f});
        fuerza.push(m[m.length-1].fuerza); durs.push(d); pos+=v; k++;
      });
      out.push(m);
    });
    const partial = anacrusa ? durToken(compases[0].reduce((s,d)=>s+ML.durTokenValue(d),0)) : null;
    return {compases:out, durs, partial, anacrusa, fuerza, nCompases: out.length};
  }
  // Elige compás y plantilla para n acordes; respeta N9 (6/4 cadencial en el
  // mismo compás que su V y en parte más fuerte) y el nivel (sin anacrusa en 1).
  function ritmo(nivel, ids){
    const n=ids.length, i64=ids.indexOf('I64');
    const tabla = (i64===n-2) ? PLANTILLAS_SC64 : PLANTILLAS;
    const opciones=[];
    COMPASES.forEach(time=>(tabla[time][n]||[]).forEach(p=>{
      if(nivel<2 && p.startsWith('↑')) return;
      const r=leerPlantilla(p, time);
      if(i64>=0){
        const c = r.compases.findIndex(m=>m.some(x=>x.k===i64));
        const enMismo = r.compases[c].some(x=>x.k===i64+1);
        if(!enMismo || !(r.fuerza[i64] > r.fuerza[i64+1])) return;
      }
      opciones.push(Object.assign({time, plantilla:p}, r));
    }));
    return opciones.length ? elige(opciones) : null;
  }

  /* ---------- generación ---------- */
  const CLAVES = ['treble','treble','bass','bass'];
  const NOMBRE_VOZ = ['soprano','contralto','tenor','bajo'];

  function tonalidades(nivel){ return TON.hastaTrimestre(nivel>=3 ? 4 : 3); }

  // Cadena mini-LilyPond de una voz según el ritmo elegido.
  function musica(voz, r){
    return r.compases.map(m=>m.map(x=>CV.token(voz[x.k])+x.dur).join(' ')).join(' | ');
  }

  // generar(nivel, opts) → instancia. opts.tipo fuerza un tipo (pruebas).
  function generar(nivel, opts){
    opts=opts||{};
    nivel=Math.max(1,Math.min(MAX_NIVEL,nivel|0));
    const keys=tonalidades(nivel);
    for(let intento=0;intento<50;intento++){
      const key=elige(keys);
      const fm=formula(nivel,key);
      if(!fm || (opts.tipo && fm.tipo!==opts.tipo)) continue;
      const acordes=acordesDe(key, fm.ids);
      const real=CV.realizar(key, acordes, ganchos(fm.tipo));
      if(!real) continue;
      const r=ritmo(nivel, fm.ids);
      if(!r) continue;
      const tipo=tipoPorSoprano(fm.tipo, real.voces[0][real.voces[0].length-1].deg);
      const voices=real.voces.map((v,i)=>({clef:CLAVES[i], music:musica(v,r)}));
      const json={
        family:'cadencias', level:nivel,
        context:{ key:{tonic:key.tonic, mode:key.mode, sig:key.sig}, time:r.time, partial:r.partial },
        voices,
        prompt:'¿Qué tipo de cadencia es?',
        answer:{
          tipo, sigla:TIPOS[tipo].sigla, nombre:TIPOS[tipo].nombre, tonalidad:key.nombre,
          acordes:acordes.map(a=>({id:a.id, romano:a.romano, cifras:a.cifras, americano:a.americano}))
        }
      };
      return { nivel, key, tipo, ids:fm.ids, acordes, voces:real.voces, ritmo:r, json, pen:real.pen };
    }
    return null;
  }

  /* ---------- lecturas alternativas (§4t.7, §4t.7 bis) ---------- */
  // Grado del bajo de cada acorde del catálogo.
  const BAJO_DE = {I:1, I6:3, VI:6, IV:4, II6:4, II:2, IV6:6, I64:5, V:5, V7:5};
  const bajoDe = ids => ids.map(id=>BAJO_DE[id]);
  const GRADO_TXT = ['','1̂','2̂','3̂','4̂','5̂','6̂','7̂'];
  const bajoTxt = ids => bajoDe(ids).map(d=>GRADO_TXT[d]).join('–');

  // Etiqueta de respuesta de BAJO DADO: el bajo nunca distingue CAP de CAI
  // (§4t.7 bis), así que las dos se responden «CA». No es un tipo del catálogo.
  const CA = {sigla:'CA', nombre:'Cadencia Auténtica'};
  const tipoDesdeBajo = t => (t==='CAP'||t==='CAI') ? CA : TIPOS[t];

  // Enumeración EXHAUSTIVA de las fórmulas de un nivel y modo (decenas, pocos
  // cientos en el nivel 3). Mismas reglas que formula(), sin azar.
  function enumerarFormulas(nivel, modo){
    const T0=[null].concat(casilla('T0',nivel,modo).map(x=>x.x));
    const PD=[null].concat(casilla('PD',nivel,modo).map(x=>x.x));
    const D  = casilla('D',nivel,modo).map(x=>x.x);
    const D64 = nivel>=2 ? [null,'I64'] : [null];
    const out=[];
    const add=(tipo,ids)=>{
      if(ids.length>=2 && !vetada(ids) && !etiquetaChocante(tipo,ids,modo)) out.push({tipo, ids});
    };
    tiposDisponibles(nivel,modo).forEach(tipo=>{
      if(tipo==='SCF'){ T0.forEach(t0=>add(tipo,[t0,'IV6','V'].filter(Boolean))); return; }
      T0.forEach(t0=>PD.forEach(pd=>D64.forEach(d64=>{
        (tipo==='SC' ? ['V'] : D).forEach(d=>{
          const base=[t0,pd,d64,d].filter(Boolean);
          if(tipo==='SC') add(tipo, base);
          else if(tipo==='CAP'||tipo==='CAI') add(tipo, base.concat(['I']));
          else if(tipo==='CR'){
            add(tipo, base.concat(['VI']));
            if(nivel>=3) add(tipo, base.concat(['IV6']));
          }
        });
      })));
    });
    return out;
  }

  // ¿Tiene realización esta fórmula (con la soprano fijada, si se da) y sigue
  // siendo del tipo pedido? Devuelve la realización o null.
  function realizaCon(key, f, alturasSoprano, tipoExigido){
    const opts=ganchos(f.tipo);
    if(alturasSoprano) opts.fija={voz:0, alturas:alturasSoprano};
    const r=CV.realizar(key, acordesDe(key, f.ids), opts);
    if(!r) return null;
    if(tipoExigido && tipoPorSoprano(f.tipo, r.voces[0][r.voces[0].length-1].deg)!==tipoExigido) return null;
    return r;
  }

  // BAJO DADO: fórmulas del nivel con la MISMA línea de bajo que `ids` y con
  // alguna realización válida.
  function lecturasDelBajo(nivel, key, ids){
    const objetivo=bajoDe(ids).join('-');
    return enumerarFormulas(nivel, key.mode).filter(f=>
      f.ids.length===ids.length && bajoDe(f.ids).join('-')===objetivo && realizaCon(key, f, null, null));
  }
  // Por casilla, los OTROS acordes que caben con ese mismo bajo (§4t.7 bis:
  // nunca más de uno, pero se devuelve lista por si el catálogo crece).
  function alternativasPorCasilla(ids, lecturas){
    return ids.map((id,k)=>[...new Set(lecturas.map(l=>l.ids[k]).filter(x=>x!==id))]);
  }

  // Un grupo de fórmulas con la MISMA línea de bajo, comprimido a «un acorde
  // por casilla + sus alternativas». Nunca se listan las fórmulas enteras: con
  // tres casillas ambiguas serían ocho (§4t.7 bis), ilegibles.
  // `preferida` fija qué acorde va en la primera fila (el de la realización
  // mostrada); si no se da, el primero de la enumeración.
  function comprimeLecturas(key, listaIds, preferida){
    const base=preferida || listaIds[0];
    const alt=alternativasPorCasilla(base, listaIds.map(ids=>({ids})));
    const romano=id=>CV.acorde(key, ACORDES[id]).romano;
    return base.map((id,k)=>({romano:romano(id), alternativas:alt[k].map(romano)}));
  }

  // CANTO DADO: líneas de bajo distintas que admiten realización con esa
  // soprano y ese tipo. → [{bajo:'1̂–4̂–5̂–1̂', lecturas:[[ids]…]}]
  function bajosPosibles(nivel, key, tipo, n, alturasSoprano){
    const compat = (tipo==='CAP'||tipo==='CAI') ? ['CAP','CAI'] : [tipo];
    const mapa=new Map();
    enumerarFormulas(nivel, key.mode).forEach(f=>{
      if(f.ids.length!==n || !compat.includes(f.tipo)) return;
      if(!realizaCon(key, f, alturasSoprano, tipo)) return;
      const b=bajoTxt(f.ids);
      if(!mapa.has(b)) mapa.set(b, {bajo:b, lecturas:[]});
      mapa.get(b).lecturas.push(f.ids);
    });
    return [...mapa.values()];
  }

  // Tonalidad relativa (misma armadura, otro modo); puede haber dos entradas
  // enarmónicas con 6 alteraciones, y cuentan las dos.
  function relativas(key){
    return TON.TODAS.filter(k=>k.sig===key.sig && k.mode!==key.mode);
  }
  // GUARDA DE CANTO DADO (§4t.7 bis): ¿la misma soprano escrita admite una
  // realización con la MISMA sigla en la relativa? Si sí, «se pide tonalidad»
  // no tendría respuesta única y la instancia se descarta. Filtro previo
  // barato: si alguna nota de la soprano no pertenece a la escala de la
  // relativa, no hace falta probar nada.
  function leeEnRelativa(inst){
    const alturas=inst.voces[0].map(p=>({abs:p.abs, alter:p.alter}));
    return relativas(inst.key).some(rel=>{
      const esc=CV.escala(rel), porLetra={};
      esc.forEach(e=>{ porLetra[e.letter]=e.alter; });
      if(inst.voces[0].some(p=>porLetra[p.letter]!==p.alter)) return false;
      const compat = (inst.tipo==='CAP'||inst.tipo==='CAI') ? ['CAP','CAI'] : [inst.tipo];
      return enumerarFormulas(inst.nivel, rel.mode).some(f=>
        f.ids.length===inst.ids.length && compat.includes(f.tipo) &&
        realizaCon(rel, f, alturas, inst.tipo));
    });
  }

  /* ---------- variantes Bajo dado y Canto dado ---------- */
  // generarBajo(nivel) → instancia + answer con tipo(s), tonalidad y las
  // alternativas por casilla. Se muestra solo el bajo hasta revelar.
  function generarBajo(nivel, opts){
    for(let i=0;i<30;i++){
      const inst=generar(nivel, opts);
      if(!inst) continue;
      const lecturas=lecturasDelBajo(nivel, inst.key, inst.ids);
      if(!lecturas.length) continue;                       // no debería ocurrir
      const alternativas=alternativasPorCasilla(inst.ids, lecturas);
      const siglas=[]; const vistas=new Set();
      lecturas.forEach(l=>{
        const e=tipoDesdeBajo(l.tipo);
        if(!vistas.has(e.sigla)){ vistas.add(e.sigla); siglas.push(e); }
      });
      inst.variante='bajo';
      inst.lecturas=lecturas;
      inst.alternativas=alternativas;
      inst.json.prompt='¿En qué tonalidad estás, qué cadencia es y con qué acordes?';
      inst.json.answer=Object.assign({}, inst.json.answer, {
        tonalidad: inst.key.nombre,
        tipos: siglas,                                     // lo que el bajo permite afirmar
        tipoRealizado: TIPOS[inst.tipo].sigla,             // el de la realización mostrada
        bajo: bajoTxt(inst.ids),
        acordes: inst.acordes.map((a,k)=>({
          id:a.id, romano:a.romano, cifras:a.cifras, americano:a.americano,
          alternativas: alternativas[k].map(id=>CV.acorde(inst.key, ACORDES[id]).romano)
        }))
      });
      return inst;
    }
    return null;
  }

  // generarCanto(nivel) → instancia + answer con tonalidad y otras líneas de
  // bajo. Se muestra solo la soprano (y el tipo) hasta revelar.
  function generarCanto(nivel, opts){
    for(let i=0;i<30;i++){
      const inst=generar(nivel, opts);
      if(!inst) continue;
      if(leeEnRelativa(inst)) continue;                    // guarda de tonalidad
      const alturas=inst.voces[0].map(p=>({abs:p.abs, alter:p.alter}));
      const bajos=bajosPosibles(nivel, inst.key, inst.tipo, inst.ids.length, alturas);
      const propio=bajoTxt(inst.ids);
      const mio=bajos.find(b=>b.bajo===propio);
      const otros=bajos.filter(b=>b.bajo!==propio);
      const mias=mio ? mio.lecturas : [inst.ids];
      inst.variante='canto';
      inst.lecturas=mias.map(ids=>({tipo:inst.tipo, ids}));
      inst.alternativas=alternativasPorCasilla(inst.ids, inst.lecturas);
      inst.json.prompt='¿En qué tonalidad estás y cuál es la línea del bajo?';
      inst.json.answer=Object.assign({}, inst.json.answer, {
        tonalidad: inst.key.nombre,
        sigla: TIPOS[inst.tipo].sigla,                     // dato, no respuesta
        bajo: propio,
        acordes: comprimeLecturas(inst.key, mias, inst.ids),
        otrosBajos: otros.map(b=>({bajo:b.bajo, acordes:comprimeLecturas(inst.key, b.lecturas)}))
      });
      return inst;
    }
    return null;
  }

  /* ---------- MEI ---------- */
  const accMap={1:'s',0:'n','-1':'f',2:'x','-2':'ff'};
  const clefAttr = c => c==='bass' ? 'clef.shape="F" clef.line="4"' : 'clef.shape="G" clef.line="2"';
  const durAttrs = d => { const m=/^(\d+)(\.*)$/.exec(d); return `dur="${m[1]}"`+(m[2].length?` dots="${m[2].length}"`:''); };
  const sigStr = sig => sig===0 ? '0' : Math.abs(sig)+(sig>0?'s':'f');
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const VO_ALT = -1.5;    // separación extra de la fila de alternativas

  // toMEI(inst, {cifrados, ocultas, alternativas, dato}):
  //   cifrados: dibuja el americano encima y los romanos con cifras debajo;
  //   ocultas: array de índices de voz que se ocultan (<space>), p. ej.
  //     [0,1,2] en Bajo dado, [1,2,3] en Canto dado;
  //   alternativas: por casilla, ids de acorde que también caben con ese bajo;
  //     van en una SEGUNDA fila de cifrado. Verovio apila los <harm> por su
  //     atributo `n` (sin él se superponen): n="1" la realización, n="2" la
  //     alternativa (§4t.7);
  //   dato: el DATO DE PARTIDA (tonalidad, tipo de cadencia…) como texto
  //     sobre el primer tiempo. Va en la partitura, no en el enunciado: es
  //     información que se DA, y ahí queda alineada con el comienzo de la
  //     música. `type="dato"` llega al SVG como clase (lo entinta comun.css).
  //     Va como `<reh>` (marca de ensayo) y no como `<dir>` a propósito: es el
  //     elemento al que Verovio da la franja MÁS ALTA sobre el pentagrama, así
  //     que al revelar queda por ENCIMA de la fila del americano sin ajustar
  //     nada. Con `<dir>` cae por debajo, y subirlo exige un `vo` a ojo que
  //     depende de la altura de la soprano. `<reh>` se centra sobre el primer
  //     tiempo (Verovio ignora `halign` aquí); con nombres de hasta
  //     «Sol♭ mayor» no se sale del pentagrama.
  function toMEI(inst, opts){
    opts=opts||{};
    const ocultas=opts.ocultas||[];
    const sig=CV.keysigAlters(inst.key.sig);
    const [num,den]=inst.ritmo.time.split('/');
    const nota=(p,x,id)=>{
      if(ocultas.includes(id.v)) return `<space ${durAttrs(x.dur)}/>`;
      const acc = p.alter!==sig[p.letter] ? ` accid="${accMap[p.alter]}"` : '';
      return `<note xml:id="${id.pre}${x.k}" ${durAttrs(x.dur)} pname="${p.letter.toLowerCase()}" oct="${p.oct}"${acc}/>`;
    };
    const capa=(v,m,pre)=>`<layer n="${v%2+1}">${m.map(x=>nota(inst.voces[v][x.k],x,{v,pre})).join('')}</layer>`;
    const romanoXml=a=>{
      const figs=a.cifras ? a.cifras.split('/') : [];
      return `<rend>${a.romano.replace(a.cifras,'')}</rend>`+
        figs.map((f,i)=>`<rend rend="${i===0?'sup':'sub'}">${f}</rend>`).join('');
    };
    const measures=inst.ritmo.compases.map((m,i)=>{
      const last = i===inst.ritmo.compases.length-1;
      const attrs = (inst.ritmo.anacrusa && i===0 ? ' metcon="false"' : '') + (last ? ' right="end"' : '');
      let harms = (i===0 && opts.dato)
        ? `<reh place="above" staff="1" tstamp="1" type="dato">${esc(opts.dato)}</reh>` : '';
      if(opts.cifrados) m.forEach(x=>{
        const a=inst.acordes[x.k];
        // el americano se ancla a la soprano salvo que esté oculta
        const arriba = ocultas.includes(0)
          ? `<harm place="above" staff="2" startid="#b${x.k}">${esc(a.americano)}</harm>`
          : `<harm place="above" staff="1" startid="#s${x.k}">${esc(a.americano)}</harm>`;
        harms += arriba + `<harm place="below" staff="2" startid="#b${x.k}" n="1">${romanoXml(a)}</harm>`;
        // Filas de alternativas: `n` las apila, `type="alt"` llega al SVG como
        // clase (las pinta en gris comun.css) y `vo` las separa un poco más de
        // la principal (negativo = hacia abajo en place="below").
        const alt=(opts.alternativas||[])[x.k]||[];
        alt.forEach((id,j)=>{
          harms += `<harm place="below" staff="2" startid="#b${x.k}" n="${j+2}" type="alt" vo="${VO_ALT}">`
                 + romanoXml(CV.acorde(inst.key, ACORDES[id]))+`</harm>`;
        });
      });
      return `<measure n="${inst.ritmo.anacrusa ? i : i+1}"${attrs}>`
        + `<staff n="1">${capa(0,m,'s')}${capa(1,m,'a')}</staff>`
        + `<staff n="2">${capa(2,m,'t')}${capa(3,m,'b')}</staff>${harms}</measure>`;
    }).join('\n   ');
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(inst.key.sig)}" meter.count="${num}" meter.unit="${den}">
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
  // midis(inst, {voces}) → [{midi, at, dur}] de las voces indicadas (todas por defecto).
  function midis(inst, opts){
    const vs=(opts&&opts.voces)||[0,1,2,3];
    const out=[]; let t=0;
    inst.ritmo.durs.forEach((d,k)=>{
      const seg=ML.durTokenValue(d)*4*NEGRA_S;
      vs.forEach(v=>out.push({midi:inst.voces[v][k].midi, at:t, dur:seg*0.95}));
      t+=seg;
    });
    return out;
  }

  const NIVELES = [
    'CAP, CAI y SC; tónica inicial I o I6, predominante IV o II6, V o V7; 12 tonalidades; sin anacrusa.',
    'Añade la cadencia rota (sobre VI), la semicadencia frigia, el 6/4 cadencial, II en fundamental (mayor), IV6 (menor) y la anacrusa.',
    'Añade VI como tónica inicial, IV6 en mayor y la rota sobre IV6; 16 tonalidades.'
  ];

  const api = {
    generar, generarBajo, generarCanto, toMEI, midis, MAX_NIVEL, NIVELES, TIPOS, CA, NOMBRE_VOZ,
    // lecturas alternativas (Bajo dado / Canto dado)
    enumerarFormulas, lecturasDelBajo, alternativasPorCasilla, comprimeLecturas, bajosPosibles,
    leeEnRelativa, bajoDe, bajoTxt, tipoDesdeBajo, etiquetaChocante,
    // gramática (para pruebas y para las variantes Bajo dado / Canto dado)
    formula, acordesDe, ganchos, casilla, tiposDisponibles, tonalidades, ritmo, leerPlantilla,
    FORMULAS_VETADAS, vetada, PLANTILLAS, PLANTILLAS_SC64, FINAL, CLAUSULA, penClausula, tipoPorSoprano
  };
  if (esNode) module.exports = api;
  else global.Cadencias = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
