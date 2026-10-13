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
  const ROM = ['I','II','III','IV','V','VI','VII'];
  // Acorde de la secuencia: sin la duplicación vetada de la sensible (licencia)
  // y, en menor, los grados con 7̂ de la menor natural (VII, III, v).
  function specSec(grado, inv, modo){
    const s={grado, inv, id:'sec'+ROM[grado-1]+(inv?'6':''), dup:{nunca:[]}};
    if(modo==='minor' && [7,3,5].includes(grado)) s.baja=[7];
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
    const mods=S.mods.slice(o.desde||0);
    const ini=est.ev.length;
    const modulos=[];
    mods.forEach((m,i)=>{
      const acs = (o.truncar && i===mods.length-1) ? m.slice(0,1) : m;
      const d=est.ev.length;
      acs.forEach(([g,inv],j)=>est.ev.push({id:specSec(g,inv,modo).id, spec:specSec(g,inv,modo), rol:'Q', cel:[],
        iniModulo:j===0, modulo:modulos.length}));
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
      // el II, último de la secuencia, es la PD; luego (6/4) V y, en la CA, I
      ult.rol='PD';
      if(sigla==='SC'){
        if(nivel>=2 && rnd()<0.5) est.ev.push({id:'I64', rol:'D64', cel:[]});
        est.ev.push({id:'V', rol:'D', cel:[]});
      } else {
        est.ev.push({id: nivel>=2 && !o.soloV ? pesado(CAD.casilla('D',nivel,modo)) : 'V', rol:'D', cel:[]});
        est.ev.push({id:'I', rol:'TF', cel:[]});
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
    const cad = P.cadenciaTras(bis, sigla, nivel, modo);
    if(!cad) return false;
    ult.bisagra=true;
    cad.forEach(x=>est.ev.push({id:x.id, rol:x.rol, cel:[]}));
    est.tramos.push({tipo:'cad', sigla, real, desde:h, hasta:est.ev.length-1});
    return true;
  }
  // Frase de secuencia: la secuencia y su cadencia (tipo 2 y mitades del 3).
  function fraseSecuencia(est, S, sigla, real, nivel, modo){
    const truncar = S.tipo==='romanesca' && sigla==='CA';
    const t=ponerSecuencia(est, S, modo, {truncar});
    return cerrar(est, t, sigla, real, nivel, modo);
  }

  // Forma (§3), elegida ANTES de los reintentos, como en Prolongación.
  function elegirForma(tipo, nivel, modo){
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
  function estructura(tipo, nivel, modo, forma){
    const est={ev:[], celulas:[], tramos:[], frases:[]};
    if(tipo===1){
      const t=ponerSecuencia(est, forma.S, modo, {desde: forma.desdeVII ? 1 : 0});
      // el círculo acaba en V–I. Es ambiguo (II–V–I, fin de la secuencia y
      // cadencia), pero en el tipo 1 no se marca cadencia: el V–I va dentro del
      // tramo de la secuencia, aunque fuera de sus módulos (sin licencias ni
      // traslado: el V lleva la sensible y resuelve). La cadencia explícita,
      // en la frase de 4 cc.
      if(forma.S.tipo==='quintas'){
        est.ev.push({id:'V', rol:'D', cel:[]}, {id:'I', rol:'TF', cel:[]});
        t.hastaDibujo=est.ev.length-1;
      }
      est.frases.push({desde:0, hasta:est.ev.length-1});
      return est;
    }
    if(tipo===2){
      if(!fraseSecuencia(est, forma.S, forma.sigla, forma.real, nivel, modo)) return null;
      est.frases.push({desde:0, hasta:est.ev.length-1, compases:[4]});
      return est;
    }
    // periodo: antecedente (… SC) y consecuente (… CA)
    const o={nivel, modo};
    if(forma.S1){ if(!fraseSecuencia(est, forma.S1, 'SC', 'SC', nivel, modo)) return null; }
    else if(!P.frase(est, Object.assign({prol:'I', sigla:'SC', real:'SC'}, o))) return null;
    const n1=est.ev.length;
    est.frases.push({desde:0, hasta:n1-1, compases:[4]});
    if(forma.S2){ if(!fraseSecuencia(est, forma.S2, 'CA', 'CAP', nivel, modo)) return null; }
    else if(!P.frase(est, Object.assign({prol:forma.prol2, sigla:'CA', real:'CAP'}, o))) return null;
    est.frases.push({desde:n1, hasta:est.ev.length-1, compases:[4]});
    return est;
  }

  /* ---------- ritmo (§3) ---------- */
  const MODULO = {'4/4':['2','2'], '3/4':['2','4'], '2/4':['4','4']};
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
        // un módulo (o el V–I final) por compás
        const n=est.ev.length; if(n%2) return;
        compases=Array.from({length:n/2}, ()=>MODULO[time]);
      } else {
        let parciales=[{compases:[], w:1}];
        for(const f of est.frases){
          const rs=P.ritmosFrase(est.ev, f.desde, f.hasta, 4, time).filter(r=>modulosOK(est.ev, f.desde, r.compases));
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
    const txt=o.compases.map(c=>c.join(' ')).join(' | ');
    return Object.assign({time:o.time, plantilla:txt}, CAD.leerPlantilla(txt, o.time));
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
    est.tramos.filter(t=>t.tipo==='sec').forEach(t=>{
      for(let k=t.desde+2;k<=t.hasta;k++) trasl[k]={de:k-2, paso:t.sec.paso};
      const M=t.modulos.length;
      t.modulos.forEach((m,i)=>{ for(let k=m.desde;k<=m.hasta;k++) baja[k]=-t.sec.paso*(M-1-i); });
    });
    const lic=licencias(est);
    // el bajo, como las demás voces, sigue el movimiento secuencial; con
    // `octava`, su primera o su última nota pueden ir a otra 8.ª (la romanesca
    // en Re no cabe de otro modo en la tesitura del bajo), penalizado
    const libre=[];      // libre[k]: el bajo de k puede ir a la 8.ª de lo esperado
    if(octava) est.tramos.filter(t=>t.tipo==='sec').forEach(t=>{ libre[t.desde+2]=true; libre[t.hasta]=true; });
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
      context:{ key:{tonic:key.tonic, mode:key.mode, sig:key.sig}, time:r.time, partial:null },
      answer:{
        tonalidad:key.nombre, resumen:resumen(inst),
        tramos:inst.est.tramos.map(t=>Object.assign({etiqueta:etiquetaTramo(t)}, detalleTramo(inst,t))),
        acordes:inst.acordes.map(a=>({romano:a.romano, americano:a.americano}))
      }
    };
  }

  /* ---------- generación ---------- */
  function generar(tipo, nivel, opts){
    opts=opts||{};
    tipo=Math.max(1,Math.min(3,tipo|0));
    nivel=Math.max(1,Math.min(MAX_NIVEL,nivel|0));
    const keys=opts.key ? [opts.key] : tonalidades(nivel);
    let forma=null, key=null;
    for(let intento=0;intento<300;intento++){
      if(intento%60===0){ key=elige(keys); forma=elegirForma(tipo, nivel, key.mode); }
      const est=estructura(tipo, nivel, key.mode, forma);
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
        const an=P.analizar(key, nivel, 2, tramo);
        if(P.relativas(key).some(rel=>P.analizar(rel, nivel, 2, tramo).length>0)) ambigua=true;
        an.forEach(a=>a.slots.forEach((ids,j)=>ids.forEach(x=>{
          const k=f.desde+j; if(x!==est.ev[k].id && !alternativas[k].includes(x)) alternativas[k].push(x);
        })));
      });
      if(ambigua) continue;
      // el bajo, a otra 8.ª solo si sin ello no hay realización
      const real=CV.realizar(key, acordes, ganchos(est, false)) || CV.realizar(key, acordes, ganchos(est, true));
      if(!real) continue;
      const inst={ tipo, nivel, key, est, ids:est.ev.map(e=>e.id), acordes, voces:real.voces, ritmo:r, pen:real.pen,
                   alternativas, licencias:licencias(est).comprobador };
      inst.encima=encima(inst);
      inst.json=json(inst);
      return inst;
    }
    return null;
  }

  // MEI: el de Prolongación, sin tramos ni dato (los dibuja la página encima,
  // en filas fijas: `inst.encima`).
  function toMEI(inst, opts){
    return P.toMEI(inst, Object.assign({}, opts, {tramos:false, dato:null}));
  }
  // Audio. Con «Oír» (§6): las cuatro voces, el bajo destacado.
  const GANANCIA_OIR = [0.55, 0.55, 0.55, 1];
  const midis = (inst, opts) => P.midis(inst, opts);

  const api = { generar, toMEI, midis, GANANCIA_OIR, MAX_NIVEL, TIPOS, SECUENCIAS,
    estructura, ritmo, acordesDe, licencias, ganchos, etiquetaTramo, resumen, tonalidades, elegirForma };
  if (esNode) module.exports = api;
  else global.Secuencia = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
