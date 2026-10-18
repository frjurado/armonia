/* ============================================================
   4.º · Unidad 0 — Secuencia (núcleo compartido)
   ------------------------------------------------------------
   Bajos sin cifrar con progresiones secuenciales (círculo de
   5.as y romanesca, cada una en estado fundamental o alternando
   1.ª inversión), solas o con cadencia y prolongación. Diseño:
   docs/familias/secuencia.md. Sobre el modelo de Prolongación,
   de la que reutiliza las frases de prolongación, la cadencia,
   el ritmo, el análisis del bajo y el MEI.
     · TIPOS: 1 la secuencia sola (un módulo por compás), 2 frase
       (secuencia + CA o SC, 4 cc.), 3 periodo (… SC ‖ … CA, 8 cc.;
       Sec.+Sec., Prol.+Sec. o Sec.+Prol.);
     · REALIZACIÓN por el motor a cuatro voces con dos añadidos:
       dentro de la secuencia, cada acorde es el de dos posiciones
       antes TRASLADADO (la misma conducción en todas las voces), y
       las licencias de los apuntes (N7, N10, N12: tríada
       disminuida en fundamental, sensible duplicada o sin
       resolver, tritono melódico). Las 5.as y 8.as, prohibidas.
   Depende de cuatro-voces-core.js, cadencias-core.js,
   prolongacion-core.js, tonalidades.js y mini-lilypond-parser.js.
   Sin DOM.
   ============================================================ */
(function (global) {
  'use strict';

  const esNode = typeof module !== 'undefined' && module.exports;
  const CV  = esNode ? require('./cuatro-voces-core') : global.CuatroVoces;
  const TON = esNode ? require('../tonalidades') : global.TONALIDADES;
  const CAD = esNode ? require('./cadencias-core') : global.Cadencias;
  const P   = esNode ? require('./prolongacion-core') : global.Prolongacion;

  const rnd = () => Math.random();
  const elige = a => a[Math.floor(rnd()*a.length)];
  function pesado(items){ const tot=items.reduce((s,i)=>s+i.w,0); let r=rnd()*tot; for(const i of items){ r-=i.w; if(r<=0) return i.x; } return items[items.length-1].x; }

  const MAX_NIVEL = 3;
  const TIPOS = {
    1:{key:'sec',     nombre:'Secuencia'},
    2:{key:'frase',   nombre:'Frase'},
    3:{key:'periodo', nombre:'Periodo'}
  };

  /* ---------- catálogo (§1) ---------- */
  // mods: los módulos (dos acordes, [grado, inversión]); paso: lo que baja
  // cada repetición, en grados.
  const SECUENCIAS = {
    quintas:    {tipo:'quintas',   nombre:'Círculo de 5.as', variante:'en estado fundamental', inv:false, paso:-1,
                 mods:[[[1,0],[4,0]],[[7,0],[3,0]],[[6,0],[2,0]]]},
    quintas6:   {tipo:'quintas',   nombre:'Círculo de 5.as', variante:'alternando 1.ª inversión', inv:true, paso:-1,
                 mods:[[[1,0],[4,1]],[[7,0],[3,1]],[[6,0],[2,1]]]},
    romanesca:  {tipo:'romanesca', nombre:'Romanesca', variante:'en estado fundamental', inv:false, paso:-2,
                 mods:[[[1,0],[5,0]],[[6,0],[3,0]],[[4,0],[1,0]]]},
    romanesca6: {tipo:'romanesca', nombre:'Romanesca', variante:'alternando 1.ª inversión', inv:true, paso:-2,
                 mods:[[[1,0],[5,1]],[[6,0],[3,1]],[[4,0],[1,1]]]}
  };
  // Con 7.as (4.º UD 1, familia Secuencias; docs/familias/secuencia.md §9): el
  // círculo de 5.as en sus cuatro variantes de los apuntes (c4u1 §3.1–3.2). Un
  // acorde de módulo es [grado, inversión, 7.ª?, dominante?]; `pre`, el acorde
  // que va delante de los módulos (el I6 que prepara en el bajo la 7.ª del
  // primer 4/2), y `fin`, lo que sigue en la secuencia sola (tipo 1).
  // `frase`: si cabe en una frase con cadencia (las de 4/2 acaban en V6 → I).
  const SECUENCIAS7 = {
    quintas7:    {tipo:'quintas', nombre:'Círculo de 5.as', variante:'con 7.as, en estado fundamental', inv:false, paso:-1,
                  sept:true, nivel:1, frase:true, fin:['V7','I'],
                  mods:[[[1,0],[4,0,1]],[[7,0,1],[3,0,1]],[[6,0,1],[2,0,1]]]},
    quintas7_65: {tipo:'quintas', nombre:'Círculo de 5.as', variante:'con 7.as, 5/3 y 6/5 alternados', inv:true, paso:-1,
                  sept:true, nivel:2, frase:true, fin:['V','I'],
                  mods:[[[1,0],[4,1,1]],[[7,0],[3,1,1]],[[6,0],[2,1,1]]]},
    quintas7_42: {tipo:'quintas', nombre:'Círculo de 5.as', variante:'con 7.as, 4/2 y 6/3 alternados', inv:true, paso:-1,
                  sept:true, nivel:2, frase:true, pre:[1,1], fin:['I'],
                  mods:[[[4,3,1],[7,1]],[[3,3,1],[6,1]],[[2,3,1],[5,1,0,1]]]},
    quintas7_4265:{tipo:'quintas', nombre:'Círculo de 5.as', variante:'con 7.as, 4/2 y 6/5 alternados', inv:true, paso:-1,
                  sept:true, nivel:2, frase:true, pre:[1,1], fin:['I'],
                  mods:[[[4,3,1],[7,1,1]],[[3,3,1],[6,1,1]],[[2,3,1],[5,1,1,1]]]}
  };
  // En las de 4/2, el bajo no decide si los 6/x llevan 7.ª: las dos variantes
  // valen, y la otra sale como alternativa (§9).
  const GEMELA = { quintas7_42:'quintas7_4265', quintas7_4265:'quintas7_42' };
  const ROM = ['I','II','III','IV','V','VI','VII'];
  const CIFRA = {false:['','6','64'], true:['7','65','43','42']};
  // Acorde de la secuencia: sin la duplicación vetada de la sensible (licencia)
  // y, en menor, los grados con 7̂ de la menor natural (VII, III, v), salvo la
  // dominante que cierra la secuencia (`dom`: el V6 de las de 4/2).
  function specSec(grado, inv, modo, sept, dom){
    const s={grado, inv, id:'sec'+ROM[grado-1]+CIFRA[!!sept][inv]};
    // la sensible, duplicable (licencia N7): en el VII7 incompleto de la cadena
    // con 7.as, la fundamental doblada es la sensible; la 3.ª y la 7.ª, nunca
    if(sept){ s.septima=true; s.dup={nunca:['3','7']}; } else s.dup={nunca:[]};
    if(modo==='minor' && [7,3,5].includes(grado) && !dom) s.baja=[7];
    return s;
  }
  // Qué secuencia (§1, §5): círculo más en menor, romanesca más en mayor; las
  // variantes con 6/3, desde el nivel 2. `excluir`: el tipo de la otra mitad.
  function eligeSecuencia(nivel, modo, excluir){
    const tipos=[{x:'quintas', w: modo==='minor' ? 0.7 : 0.45}, {x:'romanesca', w: modo==='minor' ? 0.3 : 0.55}]
      .filter(o=>o.x!==excluir);
    const tipo=pesado(tipos);
    const inv = nivel>=2 && rnd()<0.5;
    return SECUENCIAS[tipo+(inv?'6':'')];
  }

  /* ---------- construcción (§3) ---------- */
  // Añade a `est` los acordes de la secuencia `S` (los módulos desde `desde`;
  // `hasta` corta el último: la romanesca truncada) y sus tramos.
  function ponerSecuencia(est, S, modo, o){
    o=o||{};
    const mods=S.mods.slice(o.desde||0, o.hasta);
    const ini=est.ev.length;
    const modulos=[];
    if(S.pre){ const sp=specSec(S.pre[0], S.pre[1], modo); est.ev.push({id:sp.id, spec:sp, rol:'Q', cel:[], pre:true}); }
    mods.forEach((m,i)=>{
      const acs = (o.truncar && i===mods.length-1) ? m.slice(0,1) : m;
      const d=est.ev.length;
      acs.forEach(([g,inv,sept,dom],j)=>{ const sp=specSec(g,inv,modo,sept,dom);
        est.ev.push({id:sp.id, spec:sp, rol:'Q', cel:[], iniModulo:j===0, modulo:modulos.length}); });
      modulos.push({desde:d, hasta:est.ev.length-1});
    });
    const t={tipo:'sec', sec:S, desde:ini, hasta:est.ev.length-1, modulos, truncada:!!o.truncar, desdeVII:(o.desde||0)>0};
    est.tramos.push(t);
    return t;
  }
  // Cadencia que cierra la secuencia (§3). `sigla` CA o SC; `real` CAP/CAI/SC.
  function cerrar(est, t, sigla, real, nivel, modo, o){
    o=o||{};
    const S=t.sec, h=est.ev.length-1, ult=est.ev[h];
    if(S.tipo==='quintas'){
      // el II, último de la secuencia, es la PD; luego (6/4) V y, en la CA, I.
      // Tras el II7 de la cadena con 7.as, mejor V7 (su 7.ª, preparada: 4̂).
      ult.rol='PD';
      if(sigla==='SC'){
        if(nivel>=2 && rnd()<0.5) est.ev.push({id:'I64', rol:'D64', cel:[]});
        est.ev.push({id:'V', rol:'D', cel:[]});
      } else {
        // con 7.as: tras el II6/5, mejor V; tras el II7, V7 (su 7.ª, 4̂, preparada)
        const pd65 = ult.spec && ult.spec.inv===1;
        const d = sigla==='CR' ? 'V7'
                : S.sept ? pesado(pd65 ? [{x:'V',w:2},{x:'V7',w:1}] : [{x:'V7',w:3},{x:'V',w:1}])
                : nivel>=2 && !o.soloV ? pesado(CAD.casilla('D',nivel,modo)) : 'V';
        est.ev.push({id: d, rol:'D', cel:[]});
        if(sigla==='CR') est.ev.push(rota());
        else est.ev.push({id:'I', rol:'TF', cel:[]});
      }
      est.tramos.push({tipo:'cad', sigla, real, desde:h, hasta:est.ev.length-1});
      return true;
    }
    if(t.truncada){
      // romanesca truncada: su IV es la PD de la CA
      ult.rol='PD';
      if(nivel>=2 && rnd()<0.5) est.ev.push({id:'I64', rol:'D64', cel:[]});
      est.ev.push({id: nivel>=2 ? pesado(CAD.casilla('D',nivel,modo)) : 'V', rol:'D', cel:[]});
      est.ev.push({id:'I', rol:'TF', cel:[]});
      est.tramos.push({tipo:'cad', sigla, real, desde:h, hasta:est.ev.length-1});
      return true;
    }
    // romanesca completa: su I (o I6) final es la bisagra hacia la cadencia
    const bis = ult.spec.inv ? 'I6' : 'I';
    const cad = P.cadenciaTras(bis, sigla, nivel, modo, o.perfil);
    if(!cad) return false;
    ult.bisagra=true;
    cad.forEach(x=>est.ev.push({id:x.id, rol:x.rol, cel:[]}));
    est.tramos.push({tipo:'cad', sigla, real, desde:h, hasta:est.ev.length-1});
    return true;
  }
  // Frase de secuencia: la secuencia y su cadencia (tipo 2 y mitades del 3).
  function fraseSecuencia(est, S, sigla, real, nivel, modo, perfil){
    if(S.pre) return fraseCuatroDos(est, S, sigla, real, modo);
    const truncar = S.tipo==='romanesca' && sigla==='CA';
    const t=ponerSecuencia(est, S, modo, {truncar});
    if(S.sept && rnd()<P_PD_LIBRE) pdLibre(est, t, modo);
    return cerrar(est, t, sigla, real, nivel, modo, {perfil});
  }
  // VI de la cadencia rota (3.ª doblada, como en Cadencias)
  const rota = () => ({id:'VI', spec:{grado:6, inv:0, id:'VI', dup:{oblig:'3'}}, rol:'TF', cel:[]});
  // PD final fuera del patrón (§9, revisión del 2026-10-17): el último módulo
  // del círculo con 7.as pasa a VI (sin 7.ª) y II6/5 —o II7, si el patrón ya
  // daba II6/5—. La 7.ª del VI7 resolvería en 4̂, el bajo del II6/5.
  const P_PD_LIBRE = 0.4;
  function pdLibre(est, t, modo){
    const m=t.modulos[t.modulos.length-1], k=m.desde, ii=est.ev[k+1];
    if(!ii || ii.spec.grado!==2) return;
    const vi=specSec(6,0,modo), nuevo = ii.spec.inv===1 ? specSec(2,0,modo,true) : specSec(2,1,modo,true);
    est.ev[k]=Object.assign({}, est.ev[k], {id:vi.id, spec:vi});
    est.ev[k+1]=Object.assign({}, ii, {id:nuevo.id, spec:nuevo});
    t.pdLibre=true;
  }
  // Las de 4/2 en una frase (§9): anacrusa (el I6), dos módulos y la cadencia
  // desde un II6/5 fuera del patrón: ↑I6 | IV4/2 VII6 | III4/2 VI6 | II6/5 V | I.
  // En la de 4/2–6/5, el VI va sin 7.ª (resolvería en el bajo del II6/5).
  function fraseCuatroDos(est, S, sigla, real, modo){
    const ini=est.ev.length;
    const t=ponerSecuencia(est, S, modo, {hasta:2});
    t.cuatroDos=true;
    const vi=est.ev[est.ev.length-1];
    if(vi.spec.septima){ const sp=specSec(6,1,modo); est.ev[est.ev.length-1]=Object.assign({}, vi, {id:sp.id, spec:sp}); }
    const pd=specSec(2,1,modo,true);
    const h=est.ev.length;
    est.ev.push({id:pd.id, spec:pd, rol:'PD', cel:[]});
    if(sigla==='SC'){ est.ev.push({id:'I64', rol:'D64', cel:[]}, {id:'V', rol:'D', cel:[]}); }
    else {
      est.ev.push({id: sigla==='CR' ? 'V7' : pesado([{x:'V',w:2},{x:'V7',w:1}]), rol:'D', cel:[]});
      est.ev.push(sigla==='CR' ? rota() : {id:'I', rol:'TF', cel:[]});
    }
    est.tramos.push({tipo:'cad', sigla, real, desde:h, hasta:est.ev.length-1});
    // el ritmo de esta frase es fijo (ver ritmo): la anacrusa, un módulo por
    // compás, y la cadencia
    est.fija={desde:ini, sigla};
    return true;
  }

  // Círculo con 7.as (§9): las variantes del nivel; en frase y periodo, solo las
  // que acaban en cadencia. `excluir`: la variante de la otra mitad.
  function eligeSecuencia7(nivel7, tipo, excluir){
    const vs=Object.keys(SECUENCIAS7).filter(k=>SECUENCIAS7[k].nivel<=nivel7 && (tipo===1 || SECUENCIAS7[k].frase) && k!==excluir);
    // en el nivel 2, las inversiones pesan algo más (se realizan peor y se
    // reintentan más: sin ello, el 5/3–6/5 quedaba en un tercio de las frases)
    return SECUENCIAS7[pesado(vs.map(k=>({x:k, w: k==='quintas7' ? 1 : 1.25})))];
  }
  // Forma (§3), elegida ANTES de los reintentos, como en Prolongación. Con
  // `sept` (el nivel de la familia con 7.as, §9), al menos un círculo con 7.as.
  function elegirForma(tipo, nivel, modo, sept){
    if(sept){
      if(tipo<3){
        const S=eligeSecuencia7(sept, tipo);
        if(tipo===1) return {S};
        const sigla = pesado([{x:'CA',w:0.4},{x:'SC',w:0.35},{x:'CR',w:0.25}]);
        return {S, sigla, real: sigla==='CA' ? (rnd()<0.65 ? 'CAP' : 'CAI') : sigla};
      }
      // periodo: una mitad, el círculo con 7.as; la otra, prolongación (con
      // 7.as de predominante), romanesca en tríadas u otro círculo con 7.as
      const S7=eligeSecuencia7(sept, 3);
      const otras=[{x:'P', w:2}, {x:'R', w:1}];
      if(Object.keys(SECUENCIAS7).some(k=>SECUENCIAS7[k].nivel<=sept && SECUENCIAS7[k].frase && SECUENCIAS7[k]!==S7)) otras.push({x:'7', w:1});
      const otra=pesado(otras);
      const X = otra==='P' ? null : otra==='R' ? SECUENCIAS[rnd()<0.5 ? 'romanesca' : 'romanesca6']
              : eligeSecuencia7(sept, 3, Object.keys(SECUENCIAS7).find(k=>SECUENCIAS7[k]===S7));
      let primero7 = rnd()<0.5;
      // las de 4/2 empiezan con anacrusa: solo en la primera mitad, y una sola
      if(S7.pre) primero7=true;
      let Y=X;
      if(Y && Y.pre){ if(S7.pre) Y=SECUENCIAS7.quintas7; else primero7=false; }
      const S1 = primero7 ? S7 : Y, S2 = primero7 ? Y : S7;
      return {combo:(S1?'S':'P')+(S2?'S':'P'), S1, S2, prol2: rnd()<0.6 ? 'I' : 'V'};
    }
    if(tipo===1){
      const S=eligeSecuencia(nivel, modo);
      return {S, desdeVII: S.tipo==='quintas' && rnd()<0.25};
    }
    if(tipo===2){
      const sigla = rnd()<0.5 ? 'CA' : 'SC';
      return {S:eligeSecuencia(nivel, modo), sigla, real: sigla==='SC' ? 'SC' : (rnd()<0.65 ? 'CAP' : 'CAI')};
    }
    const combo = elige(['SS','PS','SP']);
    const S1 = combo[0]==='S' ? eligeSecuencia(nivel, modo) : null;
    const S2 = combo[1]==='S' ? eligeSecuencia(nivel, modo, S1 && S1.tipo) : null;
    return {combo, S1, S2, prol2: rnd()<0.6 ? 'I' : 'V'};
  }
  // `perfil`: el de Prolongación con 7.as de predominante (§9), para las
  // cadencias y prolongaciones de la familia con 7.as; null en la UD 0.
  function estructura(tipo, nivel, modo, forma, perfil){
    const est={ev:[], celulas:[], tramos:[], frases:[]};
    if(tipo===1){
      const t=ponerSecuencia(est, forma.S, modo, {desde: forma.desdeVII ? 1 : 0});
      // el círculo acaba en V–I. Es ambiguo (II–V–I, fin de la secuencia y
      // cadencia), pero en el tipo 1 no se marca cadencia: el V–I va dentro del
      // tramo de la secuencia, aunque fuera de sus módulos (sin licencias ni
      // traslado: el V lleva la sensible y resuelve). La cadencia explícita,
      // en la frase de 4 cc. Con 7.as, lo que diga `fin` (V7–I, V–I o solo el
      // I tras el V6 de las de 4/2).
      if(forma.S.tipo==='quintas'){
        (forma.S.fin || ['V','I']).forEach((id,i,a)=>est.ev.push({id, rol: i===a.length-1 ? 'TF' : 'D', cel:[]}));
        t.hastaDibujo=est.ev.length-1;
      }
      est.frases.push({desde:0, hasta:est.ev.length-1});
      return est;
    }
    if(tipo===2){
      if(!fraseSecuencia(est, forma.S, forma.sigla, forma.real, nivel, modo, perfil)) return null;
      est.frases.push({desde:0, hasta:est.ev.length-1, compases:[4]});
      return est;
    }
    // periodo: antecedente (… SC) y consecuente (… CA)
    const o={nivel, modo, perfil};
    if(forma.S1){ if(!fraseSecuencia(est, forma.S1, 'SC', 'SC', nivel, modo, perfil)) return null; }
    else if(!P.frase(est, Object.assign({prol:'I', sigla:'SC', real:'SC'}, o))) return null;
    const n1=est.ev.length;
    est.frases.push({desde:0, hasta:n1-1, compases:[4]});
    if(forma.S2){ if(!fraseSecuencia(est, forma.S2, 'CA', 'CAP', nivel, modo, perfil)) return null; }
    else if(!P.frase(est, Object.assign({prol:forma.prol2, sigla:'CA', real:'CAP'}, o))) return null;
    est.frases.push({desde:n1, hasta:est.ev.length-1, compases:[4]});
    return est;
  }

  /* ---------- ritmo (§3) ---------- */
  const MODULO = {'4/4':['2','2'], '3/4':['2','4'], '2/4':['4','4']};
  const UNO = {'4/4':['1'], '3/4':['2.'], '2/4':['2']};
  // ¿Cada módulo empieza compás y cabe entero en él? (compases: [[dur…]…] desde a)
  function modulosOK(ev, a, compases){
    const bar=[], pos=[]; let k=a;
    compases.forEach((m,i)=>m.forEach((_,j)=>{ bar[k]=i; pos[k]=j; k++; }));
    for(let e=a; e<k; e++){
      if(!ev[e].iniModulo) continue;
      if(pos[e]!==0) return false;
      if(ev[e+1] && ev[e+1].modulo===ev[e].modulo && ev[e+1].rol!=='TF' && bar[e+1]!==bar[e]) return false;
    }
    return true;
  }
  function ritmo(est, tipo){
    const opciones=[];
    Object.keys(MODULO).forEach(time=>{
      let compases;
      if(tipo===1){
        // un módulo (o el V–I final) por compás; el acorde de entrada (el I6 de
        // las de 4/2) y un I final suelto, un compás entero cada uno
        compases=[]; let k=0; const ev=est.ev;
        while(k<ev.length){
          if(ev[k].pre || k===ev.length-1){ compases.push(UNO[time]); k++; }
          else { compases.push(MODULO[time]); k+=2; }
        }
        if(k!==ev.length) return;
      } else {
        let parciales=[{compases:[], w:1}];
        for(const f of est.frases){
          const rs = est.fija && est.fija.desde===f.desde ? [{compases:ritmoCuatroDos(time, est.fija.sigla), w:1}]
            : P.ritmosFrase(est.ev, f.desde, f.hasta, 4, time).filter(r=>modulosOK(est.ev, f.desde, r.compases));
          const nuevas=[];
          parciales.forEach(p=>rs.forEach(r=>nuevas.push({compases:p.compases.concat(r.compases), w:p.w*r.w})));
          parciales=nuevas;
          if(!parciales.length) return;
        }
        compases=pesado(parciales.map(p=>({x:p, w:p.w}))).compases;
      }
      opciones.push({time, compases});
    });
    if(!opciones.length) return null;
    const o=elige(opciones);
    const txt=(est.fija ? '↑' : '')+o.compases.map(c=>c.join(' ')).join(' | ');
    return Object.assign({time:o.time, plantilla:txt}, CAD.leerPlantilla(txt, o.time));
  }
  // ↑I6 | IV4/2 VII6 | III4/2 VI6 | cadencia: el 4/2 en parte fuerte (la 7.ª,
  // en el bajo, sincopada). CA y CR: | II6/5 V | I; SC: | II6/5 | I6/4 V.
  const ANACRUSA = {'4/4':['2'], '3/4':['4'], '2/4':['4']};
  function ritmoCuatroDos(time, sigla){
    const cad = sigla==='SC' ? [UNO[time], MODULO[time]] : [MODULO[time], UNO[time]];
    return [ANACRUSA[time], MODULO[time], MODULO[time]].concat(cad);
  }

  /* ---------- realización ---------- */
  function acordesDe(key, ev){
    return ev.map((e,k)=>{
      if(e.spec) return CV.acorde(key, e.spec);
      const s=P.spec(e.id, key.mode);
      if(e.id==='I' && k===ev.length-1 && k>0 && ev[k-1].id==='V7') s.dup={omitir:'5'};
      return CV.acorde(key, s);
    });
  }
  // Licencias por evento (§2): dentro de la secuencia, N7, N10 y N12 (en el
  // acorde y en la transición que llega a él); a la salida, solo la
  // resolución de una 5.ª disminuida que viniera de dentro (motor: 'N12r').
  const LIC = new Set(['N7','N10','N12']), LIC_SALIDA = new Set(['N12r']);
  function licencias(est){
    const porEv=[];
    est.tramos.filter(t=>t.tipo==='sec').forEach(t=>{
      for(let k=t.desde;k<=t.hasta;k++) porEv[k]=LIC;
      if(porEv[t.hasta+1]===undefined) porEv[t.hasta+1]=LIC_SALIDA;
    });
    // La transición que ENTRA en la secuencia no tiene licencia. En el
    // comprobador, evento y transición van juntos: el primer acorde la lleva
    // solo si no hay transición (el VII inicial del círculo, en el tipo 1);
    // si no, es el I, que no la necesita.
    const primero = k => est.tramos.some(t=>t.tipo==='sec' && k===t.desde);
    return {
      motor: k => primero(k) ? null : porEv[k]||null,
      comprobador: k => porEv[k]===LIC && (!primero(k) || k===0) ? LIC : null
    };
  }
  // Ganchos del motor: los de Prolongación (soprano de las células y de las
  // cadencias) más la secuencia trasladada (exacta en las voces superiores; el
  // bajo, con posible cambio de octava) y las licencias.
  // `octava`: si el bajo puede ir a otra 8.ª en su primera o última nota (solo
  // cuando sin ello no hay realización: ver generar).
  function ganchos(est, octava){
    const g=P.ganchos(est);
    const trasl=[];      // trasl[k] = {de:k-2, paso} si el acorde k es el de k-2 trasladado
    const baja=[];       // baja[k]: lo que aún bajará el acorde k en los módulos siguientes
    // de módulo a módulo, cada acorde con el de la misma posición del anterior,
    // si tienen la misma forma (inversión, 7.ª): en el círculo con 7.as en
    // estado fundamental, el I inicial no tiene 7.ª y el VII7 no lo traslada
    const misma = (a,b) => a.spec && b.spec && a.spec.inv===b.spec.inv && !!a.spec.septima===!!b.spec.septima;
    est.tramos.filter(t=>t.tipo==='sec').forEach(t=>{
      t.modulos.forEach((m,i)=>{ if(!i) return; const p=t.modulos[i-1];
        for(let j=0;m.desde+j<=m.hasta;j++){ const k=m.desde+j, d=p.desde+j;
          if(d<=p.hasta && misma(est.ev[k], est.ev[d])) trasl[k]={de:d, paso:t.sec.paso}; } });
      const M=t.modulos.length;
      t.modulos.forEach((m,i)=>{ for(let k=m.desde;k<=m.hasta;k++) baja[k]=-t.sec.paso*(M-1-i); });
    });
    const lic=licencias(est);
    // el bajo, como las demás voces, sigue el movimiento secuencial; con
    // `octava`, su primera o su última nota pueden ir a otra 8.ª (la romanesca
    // en Re no cabe de otro modo en la tesitura del bajo), penalizado
    const libre=[];      // libre[k]: el bajo de k puede ir a la 8.ª de lo esperado
    if(octava) est.tramos.filter(t=>t.tipo==='sec').forEach(t=>{ if(t.modulos[1]) libre[t.modulos[1].desde]=true; libre[t.hasta]=true; });
    const octavado=(path,c,k)=>{ const t=trasl[k]; return !!t && c.v[3].abs!==path[t.de].v[3].abs+t.paso; };
    return Object.assign({}, g, {
      puntuar:(path,c,k,acs)=>g.puntuar(path,c,k,acs) + (octavado(path,c,k) ? 12 : 0),
      filtro:(path,c,k,acs)=>{
        if(!g.filtro(path,c,k,acs)) return false;
        // el modelo, solo si trasladado sigue en la tesitura de cada voz (si no,
        // la búsqueda lo descubriría tarde y gastaría su presupuesto)
        if(baja[k] && c.v.some((x,i)=>i<3 && x.abs-baja[k]<CV.RANGOS[i][0])) return false;
        const t=trasl[k]; if(!t) return true;
        const m=path[t.de].v;
        return c.v.every((x,i)=>{ const d=x.abs-(m[i].abs+t.paso); return d===0 || (i===3 && libre[k] && Math.abs(d)===7); });
      },
      licencia: lic.motor,
      maxNodos: g.maxNodos*2
    });
  }

  /* ---------- tonalidades (§5) ---------- */
  function tonalidades(nivel){
    const t=TON.hastaTrimestre(nivel>=3 ? 4 : 3);
    return nivel===1 ? t.filter(k=>k.mode==='major') : t;
  }

  /* ---------- etiquetas y respuesta ---------- */
  const etiquetaTramo = t => t.tipo==='sec' ? t.sec.nombre : P.etiquetaTramo(t);
  // en la partitura, más corta (está ya muy poblada)
  const etiquetaCorta = t => t.tipo==='sec' ? (t.sec.tipo==='quintas' ? 'C. de 5.as' : 'Romanesca') : P.etiquetaTramo(t);
  function resumen(inst){
    return inst.est.frases.map(f=>inst.est.tramos.filter(t=>t.desde>=f.desde && t.hasta<=f.hasta)
      .map(etiquetaTramo).join(' + ')).join(' ‖ ');
  }
  function detalleTramo(inst, t){
    if(t.tipo!=='sec') return P.detalleTramo(inst, t);
    const c1=P.compasDe(inst,t.desde), c2=P.compasDe(inst, t.hastaDibujo!=null ? t.hastaDibujo : t.hasta);
    const cc = c1===c2 ? 'c. '+c1 : 'cc. '+c1+'–'+c2;
    const extra = t.truncada ? ' (el último módulo, solo con el IV: es ya la PD de la cadencia)'
                : t.cuatroDos ? ' (dos módulos, tras el I6 en anacrusa)'
                : t.pdLibre ? ' (el último módulo, fuera del patrón: VI y '+inst.acordes[t.hasta].romano+')'
                : t.desdeVII ? ' (desde el VII)' : '';
    return {compases:cc, texto:t.sec.nombre+', '+t.sec.variante+extra};
  }
  // Lo que va encima de la partitura (ArmoniaEj.rotulosEncima), en filas
  // fijas, de la música hacia arriba: los corchetes de los módulos (sin texto;
  // el del último, abierto si está incompleto: la romanesca truncada), los
  // tramos con su línea (abierta en la bisagra) y, en el tipo 1, la tonalidad.
  // Los ids son los de las notas de la soprano (Prolongacion.toMEI: s{k}).
  function encima(inst){
    const tr=inst.est.tramos, s=k=>'s'+k;
    const modulos=[], tramos=[], dato=[];
    tr.filter(t=>t.tipo==='sec').forEach(t=>t.modulos.forEach((m,i)=>{
      const incompleto = t.truncada && i===t.modulos.length-1;
      modulos.push({desde:s(m.desde), hasta:s(m.hasta), abierto:incompleto, sigue:incompleto ? s(m.hasta+1) : null, clase:'resp modulo'});
    }));
    tr.forEach((t,i)=>{
      const hasta = t.hastaDibujo!=null ? t.hastaDibujo : t.hasta;
      tramos.push({desde:s(t.desde), hasta:s(hasta), texto:etiquetaCorta(t),
                   abierto: !!tr[i+1] && tr[i+1].desde===hasta, clase:'resp tramo'});
    });
    if(inst.tipo===1) dato.push({desde:s(0), texto:inst.key.nombre, clase:'dato'});
    return [modulos, tramos, dato];
  }
  function json(inst){
    const {key, ritmo:r}=inst;
    return {
      family:'secuencia', tipo:TIPOS[inst.tipo].key, level:inst.nivel,
      context:{ key:{tonic:key.tonic, mode:key.mode, sig:key.sig}, time:r.time, partial:r.partial||null },
      answer:{
        tonalidad:key.nombre, resumen:resumen(inst),
        tramos:inst.est.tramos.map(t=>Object.assign({etiqueta:etiquetaTramo(t)}, detalleTramo(inst,t))),
        acordes:inst.acordes.map(a=>({romano:a.romano, americano:a.americano}))
      }
    };
  }

  /* ---------- generación ---------- */
  // opts.septimas: la familia con 7.as de 4.º UD 1 (§9). Entonces `nivel` es el
  // de esa familia (1–2: qué variantes del círculo con 7.as); lo demás
  // (cadencias, prolongación, secuencias en tríadas) va con el nivel 2 de la
  // UD 0, y las cadencias y prolongaciones admiten las 7.as de predominante
  // (el perfil de Prolongación de septimas-core.js, sin exigirlas).
  const NIVEL_BASE_7 = 2, MAX_NIVEL_7 = 2;
  function perfil7(){
    const SEP = esNode ? require('./septimas-core') : global.Septimas;
    return Object.assign({}, SEP.perfilSeptimas(2), {exige:null});
  }
  function generar(tipo, nivel, opts){
    opts=opts||{};
    tipo=Math.max(1,Math.min(3,tipo|0));
    const sept = opts.septimas ? Math.max(1,Math.min(MAX_NIVEL_7,nivel|0)) : 0;
    nivel = sept ? NIVEL_BASE_7 : Math.max(1,Math.min(MAX_NIVEL,nivel|0));
    const perfil = sept ? perfil7() : null;
    const keys=opts.key ? [opts.key] : tonalidades(nivel);
    let forma=null, key=null;
    for(let intento=0;intento<300;intento++){
      if(intento%60===0){ key=elige(keys); forma=elegirForma(tipo, nivel, key.mode, sept); }
      const est=estructura(tipo, nivel, key.mode, forma, perfil);
      if(!est) continue;
      const r=ritmo(est, tipo);
      if(!r) continue;
      const acordes=acordesDe(key, est.ev);
      const bajo=acordes.map(a=>a.tones[a.bass]);
      if(P.parRepetido(bajo, est.tramos)) continue;
      // lecturas: solo en las frases de prolongación del periodo (análisis de
      // Prolongación, como frase de tipo 2); en la secuencia, el patrón decide
      const alternativas=est.ev.map(()=>[]);
      let ambigua=false;
      est.frases.forEach(f=>{
        if(est.tramos.some(t=>t.tipo==='sec' && t.desde>=f.desde && t.hasta<=f.hasta)) return;
        const tramo=bajo.slice(f.desde, f.hasta+1);
        const an=P.analizar(key, nivel, 2, tramo, perfil);
        if(P.relativas(key).some(rel=>P.analizar(rel, nivel, 2, tramo, perfil).length>0)) ambigua=true;
        an.forEach(a=>a.slots.forEach((ids,j)=>ids.forEach(x=>{
          const k=f.desde+j; if(x!==est.ev[k].id && !alternativas[k].includes(x)) alternativas[k].push(x);
        })));
      });
      if(ambigua) continue;
      // en las de 4/2 (§9), el bajo no decide si los 6/x llevan 7.ª: la otra
      // lectura, como alternativa (un spec, no un id del catálogo)
      est.tramos.filter(t=>t.tipo==='sec' && GEMELA[claveSec(t.sec)]).forEach(t=>t.modulos.forEach((m,i)=>{
        const e=est.ev[m.desde+1]; if(!e) return;
        // en la frase, el VI que prepara el II6/5 va sin 7.ª: sin alternativa
        if(t.cuatroDos && i===t.modulos.length-1) return;
        const sp=e.spec;
        alternativas[m.desde+1].push(specSec(sp.grado, sp.inv, key.mode, !sp.septima, !sp.baja));
      }));
      // el bajo, a otra 8.ª solo si sin ello no hay realización
      const real=CV.realizar(key, acordes, ganchos(est, false)) || CV.realizar(key, acordes, ganchos(est, true));
      if(!real) continue;
      const inst={ tipo, nivel, key, est, ids:est.ev.map(e=>e.id), acordes, voces:real.voces, ritmo:r, pen:real.pen,
                   alternativas, licencias:licencias(est).comprobador, septimas:sept };
      inst.encima=encima(inst);
      inst.json=json(inst);
      return inst;
    }
    return null;
  }

  // MEI: el de Prolongación, sin tramos ni dato (los dibuja la página encima,
  // en filas fijas: `inst.encima`).
  // Con 7.as (§9): la ligadura de preparación de cada 7.ª (la nota común con
  // el acorde anterior, y hasta el 6/4 si se mantiene en él), como respuesta; y
  // en la secuencia sola (tipo 1), el primer acorde a la vista (`dada`).
  function toMEI(inst, opts){
    let mei=P.toMEI(inst, Object.assign({}, opts, {tramos:false, dato:null}));
    if(inst.ritmo.anacrusa) mei=mei.replace(/<measure n="(\d+)"/g, (m,n)=>n==='1' ? '<measure n="0" metcon="false"' : `<measure n="${n-1}"`);
    if(!inst.septimas) return mei;
    const PRE=['s','a','t','b'];
    if(inst.tipo===1) [0,1,2].forEach(v=>{ mei=mei.replace(`<note xml:id="${PRE[v]}0" `, `<note xml:id="${PRE[v]}0" type="dada" `); });
    // cada 7.ª, en el color de la respuesta al revelar (`destaca`), con su ligadura
    inst.acordes.forEach((a,k)=>{
      if(!a.septima) return;
      const v=[0,1,2,3].find(v=>inst.voces[v][k].rol==='7'); if(v==null) return;
      mei=mei.replace(`<note xml:id="${PRE[v]}${k}" `, `<note xml:id="${PRE[v]}${k}" type="destaca" `);
    });
    ligaduras7(inst).forEach(([v,k])=>{
      const at=mei.indexOf(`xml:id="${PRE[v]}${k-1}"`), fin=mei.indexOf('</measure>', at);
      if(at<0 || fin<0) return;
      mei=mei.slice(0,fin)+`<tie startid="#${PRE[v]}${k-1}" endid="#${PRE[v]}${k}" type="resp destaca"/>`+mei.slice(fin);
    });
    return mei;
  }
  // [voz, k]: notas a las que llega una ligadura de preparación de 7.ª (la 7.ª
  // del acorde k, igual que en el acorde anterior; y la misma nota mantenida
  // después, en el 6/4 cadencial o en el 6/3 que prepara el 4/2 siguiente)
  function ligaduras7(inst){
    const out=[], V=inst.voces, A=inst.acordes, igual=(p,q)=>p.abs===q.abs && p.alter===q.alter;
    A.forEach((a,k)=>{
      if(!a.septima || !k) return;
      const v=[0,1,2,3].find(v=>V[v][k].rol==='7');
      if(v==null || !igual(V[v][k-1], V[v][k])) return;
      out.push([v,k]);
      if(A[k+1] && A[k+1].cadencial64 && igual(V[v][k], V[v][k+1])) out.push([v,k+1]);
    });
    return out;
  }
  // Las 7.as de la realización, para el texto de la respuesta (§9)
  function septimasDe(inst){
    const t=inst.est.tramos.find(t=>t.tipo==='sec' && t.sec.sept);
    if(!t) return null;
    // cada acorde con 7.ª y la voz que la lleva
    const VOZ=['soprano','contralto','tenor','bajo'];
    const ids=[], voces=[];
    for(let k=t.desde;k<=t.hasta;k++) if(inst.acordes[k].septima){
      ids.push(inst.acordes[k].romano);
      voces.push({romano:inst.acordes[k].romano, voz:VOZ[[0,1,2,3].find(v=>inst.voces[v][k].rol==='7')]});
    }
    const k=claveSec(t.sec);
    const nota = k==='quintas7' ? 'Todos llevan 7.ª salvo el I (y el I final); las 7.as se encadenan (la 3.ª de cada acorde es la 7.ª del siguiente) y los acordes se alternan completos e incompletos (sin 5.ª).'
      : k==='quintas7_65' ? 'Llevan 7.ª los acordes en 1.ª inversión (6/5); los de estado fundamental son tríadas, y la 3.ª de cada una pasa a ser la 7.ª del 6/5 siguiente.'
      : k==='quintas7_42' ? 'Llevan 7.ª los 4/2: la 7.ª está en el bajo, que la prepara (nota común) y la resuelve bajando. Los 6/3 también podrían llevarla (6/5): el bajo no lo decide.'
      : 'Llevan 7.ª todos: los 4/2 en el bajo, y los 6/5 en una voz superior, preparada en el 4/2. Los 6/5 también podrían ir sin ella (6/3): el bajo no lo decide.';
    const fuera = t.cuatroDos ? ' En la frase, tras dos módulos la cadena se interrumpe: la predominante es un II6/5, ya fuera del patrón (y el VI que lo prepara, sin 7.ª).'
      : t.pdLibre ? ' Al llegar a la cadencia el patrón se rompe: el VI va sin 7.ª y la predominante es un '+inst.acordes[t.hasta].romano+'.' : '';
    return {acordes:ids, voces, nota: nota+fuera};
  }
  const claveSec = S => Object.keys(SECUENCIAS7).find(k=>SECUENCIAS7[k]===S) || Object.keys(SECUENCIAS).find(k=>SECUENCIAS[k]===S);
  // Audio. Con «Oír» (§6): las cuatro voces, el bajo destacado.
  const GANANCIA_OIR = [0.55, 0.55, 0.55, 1];
  const midis = (inst, opts) => P.midis(inst, opts);

  const api = { generar, toMEI, midis, GANANCIA_OIR, MAX_NIVEL, MAX_NIVEL_7, TIPOS, SECUENCIAS, SECUENCIAS7,
    ligaduras7, septimasDe, claveSec,
    estructura, ritmo, acordesDe, licencias, ganchos, etiquetaTramo, resumen, tonalidades, elegirForma };
  if (esNode) module.exports = api;
  else global.Secuencia = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
