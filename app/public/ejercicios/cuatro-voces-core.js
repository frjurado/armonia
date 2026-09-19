/* ============================================================
   Cuatro voces — motor genérico de realización coral (SATB)
   ------------------------------------------------------------
   Módulo AISLADO: recibe tonalidad + secuencia de acordes y
   devuelve una realización a cuatro voces que cumple las NORMAS
   (N1–N13) y optimiza las PREFERENCIAS (P1–P10) de
   `curriculum/Minimos-conduccion.md`. No sabe nada de cadencias,
   ritmo, niveles, MEI ni UI: eso es de cada familia
   (`c4u0-cadencias-core.js`, …). Diseño en
   `docs/Generador-ejercicios.md` §5.3.

   · Las realizaciones NO están escritas a mano: se BUSCAN.
     Por acorde se enumeran las disposiciones válidas (registro,
     distancias, duplicaciones) y entre acordes se filtra por las
     normas de transición y se puntúa por las preferencias.
     Búsqueda en profundidad con orden aleatorio ponderado por
     puntuación y reinicios: variedad sin perder idiomatismo.
   · Alturas como índice diatónico absoluto `abs` (octava*7 +
     letra, C4 = 28) + alteración; MIDI solo para comparar.
   · Ganchos `filtro` / `puntuar` para que cada familia imponga
     condiciones propias (p. ej. la cláusula de la soprano) sin
     tocar el motor. `fija` permite fijar una voz (Canto dado).
   · El COMPROBADOR independiente vive en `cuatro-voces-check.js`
     y no comparte con este fichero las funciones de transición.

   Convención de voces: índice 0 = soprano, 1 = contralto,
   2 = tenor, 3 = bajo (de agudo a grave).
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- alturas y tonalidad ---------- */
  const LETTERS = ['C','D','E','F','G','A','B'];
  const LETTER_SEMITONE = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const SHARP_ORDER = ['F','C','G','D','A','E','B'];
  const FLAT_ORDER  = ['B','E','A','D','G','C','F'];

  function keysigAlters(sig){
    const m={C:0,D:0,E:0,F:0,G:0,A:0,B:0};
    if(sig>0) for(let i=0;i<sig;i++) m[SHARP_ORDER[i]]=1;
    else if(sig<0) for(let i=0;i<-sig;i++) m[FLAT_ORDER[i]]=-1;
    return m;
  }
  // Escala de la tonalidad: [{letter, alter}], índice 0 = 1̂.
  // En menor, ARMÓNICA: 7̂ es la sensible (alteración +1).
  function escala(key){
    const sig=keysigAlters(key.sig), s=LETTERS.indexOf(key.tonic), out=[];
    for(let i=0;i<7;i++){ const L=LETTERS[(s+i)%7]; out.push({letter:L, alter:sig[L]}); }
    if(key.mode==='minor') out[6]={letter:out[6].letter, alter:out[6].alter+1};
    return out;
  }
  const absIdx  = (letter, oct) => oct*7 + LETTERS.indexOf(letter);
  const letterOf = abs => LETTERS[((abs%7)+7)%7];
  const octOf    = abs => Math.floor(abs/7);
  const midiOf   = (abs, alter) => (octOf(abs)+1)*12 + LETTER_SEMITONE[letterOf(abs)] + alter;
  const mod = (a,n) => ((a%n)+n)%n;

  // Altura completa a partir de índice diatónico + alteración.
  function altura(abs, alter, extra){
    const p={abs, alter, letter:letterOf(abs), oct:octOf(abs), midi:midiOf(abs,alter)};
    if(extra) Object.assign(p, extra);
    return p;
  }
  // Token mini-LilyPond (sin duración): c' = C4, gs = G#3, bf, = Bb2.
  function token(p){
    const acc = p.alter>0 ? 's'.repeat(p.alter) : p.alter<0 ? 'f'.repeat(-p.alter) : '';
    const m = p.oct-3;
    return p.letter.toLowerCase()+acc+(m>0 ? "'".repeat(m) : m<0 ? ','.repeat(-m) : '');
  }
  const SYM = a => a===1?'♯':a===-1?'♭':a===2?'𝄪':a===-2?'𝄫':'';
  const ES = {C:'Do',D:'Re',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};

  /* ---------- tesituras (N1) ---------- */
  // De agudo a grave: soprano, contralto, tenor, bajo. Límites estrictos.
  const RANGOS = [
    [absIdx('C',4), absIdx('A',5)],
    [absIdx('F',3), absIdx('D',5)],
    [absIdx('C',3), absIdx('A',4)],
    [absIdx('E',2), absIdx('C',4)]
  ];
  const EXTREMO = 2;   // P10: la 3.ª inferior/superior de cada tesitura (3 notas)
  const enExtremo = (v, abs) => abs <= RANGOS[v][0]+EXTREMO || abs >= RANGOS[v][1]-EXTREMO;

  /* ---------- modelo de acorde ---------- */
  const ROMANOS = ['I','II','III','IV','V','VI','VII'];
  const CIFRAS_TRIADA = ['', '6', '6/4'];
  const CIFRAS_SEPTIMA = ['7', '6/5', '4/3', '4/2'];
  const ROLES = ['F','3','5','7'];

  function calidadDe(tones){
    const m = tones.map(t=>midiOf(absIdx(t.letter,4), t.alter));
    const t3=mod(m[1]-m[0],12), t5=mod(m[2]-m[0],12);
    const tri = (t3===4&&t5===7)?'mayor':(t3===3&&t5===7)?'menor':(t3===3&&t5===6)?'dim':(t3===4&&t5===8)?'aum':'otra';
    if(tones.length<4) return {triada:tri, septima:null};
    const t7=mod(m[3]-m[0],12);
    return {triada:tri, septima: t7===10?'menor':t7===11?'mayor':t7===9?'dim':'otra'};
  }

  // Duplicaciones por defecto (Minimos-conduccion.md §4) según grado,
  // inversión y calidad. Formato: {pref:[rol], adm:[rol], nunca:[rol],
  // oblig: rol|null, omitir: rol|null}. Las familias pueden pasar `dup`
  // en el spec para sobrescribir (p. ej. VI tras V: oblig '3').
  function dupPorDefecto(spec, tones, calidad){
    const nunca = tones.filter(t=>t.deg===7).map(t=>t.rol);   // la sensible, nunca (N7)
    if(spec.septima){
      const n7 = ['3','7'].concat(nunca.filter(r=>r!=='3'&&r!=='7'));
      return {pref:[], adm:['F'], nunca:n7, oblig:null, omitir:'5'};
    }
    if(spec.inv===0){
      const adm = (spec.grado===2||spec.grado===6) ? ['3'] : ['5'];
      return {pref:['F'], adm, nunca, oblig:null, omitir:null};
    }
    if(spec.inv===1){
      if(spec.grado===1) return {pref:[], adm:['F','3','5'], nunca, oblig:null, omitir:null};
      if(spec.grado===2) return {pref:['3'], adm:['F'], nunca, oblig:null, omitir:null};
      if(spec.grado===4) return {pref:['F'], adm:['5'], nunca, oblig:null, omitir:null};
      if(calidad.triada==='dim') return {pref:['3'], adm:['F'], nunca, oblig:null, omitir:null};
      return {pref:['F'], adm:['3','5'], nunca, oblig:null, omitir:null};
    }
    // 2.ª inversión: el bajo (5.ª) duplicado, obligatorio
    return {pref:['5'], adm:[], nunca, oblig:'5', omitir:null};
  }

  // acorde(key, {grado:1–7, inv:0–3, septima:bool, id?, dup?, cadencial64?})
  function acorde(key, spec){
    spec = Object.assign({}, spec, {inv: spec.inv||0, septima: !!spec.septima});
    const esc = escala(key);
    const n = spec.septima ? 4 : 3;
    const inv = spec.inv;
    const tones=[];
    for(let i=0;i<n;i++){
      const deg = mod(spec.grado-1 + 2*i, 7) + 1;
      const e = esc[deg-1];
      tones.push({deg, letter:e.letter, alter:e.alter, rol:ROLES[i]});
    }
    const calidad = calidadDe(tones);
    const dup = spec.dup ? Object.assign(dupPorDefecto(spec,tones,calidad), spec.dup)
                         : dupPorDefecto(spec,tones,calidad);
    const cifras = spec.septima ? CIFRAS_SEPTIMA[inv] : CIFRAS_TRIADA[inv];
    // Romanos en mayúscula siempre y sin marca de calidad (ni °): la calidad
    // la da la tonalidad. El cifrado americano sí la lleva.
    const romano = ROMANOS[spec.grado-1] + cifras;
    const root = tones[0], bassT = tones[inv];
    const cal = {mayor:'',menor:'m',dim:'°',aum:'+',otra:'?'}[calidad.triada];
    let americano = root.letter + SYM(root.alter) + cal;
    if(spec.septima) americano += (calidad.triada==='dim' && calidad.septima==='dim') ? '7'
                                : (calidad.triada==='dim') ? 'ø7' : '7';
    if(inv>0) americano += '/' + bassT.letter + SYM(bassT.alter);
    return {
      id: spec.id || romano, grado: spec.grado, inv, septima: !!spec.septima,
      tones, bass: inv, calidad, dup, cadencial64: !!spec.cadencial64,
      romano, cifras, americano,
      nombreBajo: ES[bassT.letter]+SYM(bassT.alter)
    };
  }
  const tieneGrado = (ch, deg) => ch.tones.some(t=>t.deg===deg);
  const tonoDeGrado = (ch, deg) => ch.tones.find(t=>t.deg===deg) || null;

  /* ---------- enumeración de disposiciones (por acorde) ---------- */
  // Multiconjuntos de roles admisibles para 4 voces, con su penalización
  // de duplicación (pref 0 · adm 1 · sin listar 2). `omision` marca las
  // variantes con nota omitida (N11: solo válidas en su contexto).
  function multiconjuntos(ch){
    const d=ch.dup, out=[];
    const roles = ch.tones.map(t=>t.rol);
    if(ch.septima){
      out.push({roles:roles.slice(), pen:0, omision:false});
      if(d.omitir) out.push({roles:['F','F'].concat(roles.filter(r=>r!=='F'&&r!==d.omitir)), pen:1, omision:true});
      return out;
    }
    const dobles = d.oblig ? [d.oblig] : roles.filter(r=>!d.nunca.includes(r));
    dobles.forEach(r=>{
      const pen = d.pref.includes(r)?0 : d.adm.includes(r)?1 : d.oblig===r?0 : 2;
      out.push({roles:roles.concat([r]), pen, omision:false});
    });
    if(d.omitir) out.push({roles:['F','F','F'].concat(roles.filter(r=>r!=='F'&&r!==d.omitir)), pen:1, omision:true});
    return out;
  }
  function permutaciones3(arr){
    const seen=new Set(), out=[];
    const idx=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
    idx.forEach(p=>{ const k=p.map(i=>arr[i]); const s=k.join(); if(!seen.has(s)){seen.add(s); out.push(k);} });
    return out;
  }
  // Octavas posibles de una letra dentro de la tesitura de la voz v.
  function alturasEnRango(v, tone){
    const [lo,hi]=RANGOS[v], out=[];
    for(let o=octOf(lo)-1;o<=octOf(hi)+1;o++){
      const a=absIdx(tone.letter,o);
      if(a>=lo && a<=hi) out.push(altura(a, tone.alter, {deg:tone.deg, rol:tone.rol}));
    }
    return out;
  }
  // Penalización estática de una disposición: P1 (tenor–bajo > 12.ª),
  // P2 (unísonos), duplicación.
  function penEstatica(v, dupPen){
    let p = dupPen;
    for(let i=0;i<4;i++) if(enExtremo(i,v[i].abs)) p += 0.4;  // P10 (primer acorde)
    if(v[2].abs - v[3].abs > 11) p += 1;                       // P1
    if(v[0].abs===v[1].abs || v[1].abs===v[2].abs) p += 3;      // P2
    else if(v[2].abs===v[3].abs) p += 0.5;
    return p;
  }
  // Todas las disposiciones válidas de `ch` (N1, N2, N3 dentro del acorde,
  // duplicaciones). Si `fija` = {voz, altura:{abs,alter}} solo las que la
  // respetan. Devuelve [{v:[S,A,T,B], omision, completo, pen}].
  function candidatos(ch, fija){
    const out=[];
    const tonoPorRol = {}; ch.tones.forEach(t=>{ tonoPorRol[t.rol]=t; });
    const bajoT = ch.tones[ch.bass];
    const bajos = alturasEnRango(3, bajoT);
    multiconjuntos(ch).forEach(mc=>{
      const roles = mc.roles.slice();
      const ib = roles.indexOf(bajoT.rol);
      if(ib<0) return;                       // el bajo debe estar en el multiconjunto
      roles.splice(ib,1);
      permutaciones3(roles).forEach(perm=>{
        const opS=alturasEnRango(0,tonoPorRol[perm[0]]);
        const opA=alturasEnRango(1,tonoPorRol[perm[1]]);
        const opT=alturasEnRango(2,tonoPorRol[perm[2]]);
        bajos.forEach(B=>opT.forEach(T=>{
          if(T.abs<B.abs || T.abs-B.abs>14) return;             // N3 orden · N2 tenor–bajo ≤ 15.ª
          opA.forEach(A=>{
            if(A.abs<T.abs || A.abs-T.abs>7) return;            // N2 ≤ 8.ª
            opS.forEach(S=>{
              if(S.abs<A.abs || S.abs-A.abs>7) return;
              const v=[S,A,T,B];
              if(fija && (v[fija.voz].abs!==fija.altura.abs || v[fija.voz].alter!==fija.altura.alter)) return;
              const completo = new Set(v.map(x=>x.rol)).size === ch.tones.length;
              out.push({v, omision:mc.omision, completo, pen:penEstatica(v, mc.pen)});
            });
          });
        }));
      });
    });
    return out;
  }

  /* ---------- normas de transición (N3–N13) ---------- */
  // Clase de intervalo perfecto entre dos alturas: 'P8' (8.ª/unísono),
  // 'P5' (5.ª justa), 'd5' (5.ª disminuida) o null. Compuestos incluidos.
  function clase(p, q){
    const d=mod(p.abs-q.abs,7), s=mod(p.midi-q.midi,12);
    if(d===0 && s===0) return 'P8';
    if(d===4 && s===7) return 'P5';
    if(d===4 && s===6) return 'd5';
    return null;
  }
  const sgn = x => x>0?1:x<0?-1:0;

  // Intervalo melódico prohibido (N12/N13) entre dos alturas de una voz.
  // Devuelve el id de la norma o null. `v` = índice de voz (el bajo salta más).
  function melodica(v, a, b){
    const d=Math.abs(b.abs-a.abs), s=Math.abs(b.midi-a.midi);
    if(d===0) return s===0 ? null : 'N12';               // semitono cromático: aumentado
    const max = v===3 ? 7 : 5;
    if(d>max || d===6) return 'N13';                     // 7.ª nunca; > 6.ª (8.ª en el bajo)
    // aumentados: 2.ª aum (1,3), 4.ª aum (3,6), 5.ª aum (4,8), 6.ª aum (5,10)
    if((d===1&&s===3)||(d===3&&s===6)||(d===4&&s===8)||(d===5&&s===10)) return 'N12';
    // disminuidos: 3.ª dim (2,2), 4.ª dim (3,4), 6.ª dim (5,7), 8.ª dim (7,11); la 5.ª dim (4,6) se trata aparte
    if((d===2&&s===2)||(d===3&&s===4)||(d===5&&s===7)||(d===7&&s===11)) return 'N12';
    return null;
  }
  const esQuintaDim = (a,b) => Math.abs(b.abs-a.abs)===4 && Math.abs(b.midi-a.midi)===6;

  // Comprueba la transición prev → cand (disposiciones) con sus acordes.
  // `path` = disposiciones anteriores (para la resolución de la 5.ª dim),
  // `esUltimo` = cand es el último acorde. Devuelve id de norma o null.
  function normasTransicion(prev, cand, chPrev, chCand, path, esUltimo){
    const P=prev.v, C=cand.v;
    // N11 (omisión de la 5.ª en el I final): solo tras un V7 completo
    if(cand.omision && !chCand.septima && !(esUltimo && chCand.grado===1 && chPrev.septima && prev.completo)) return 'N11';
    for(let v=0;v<4;v++){
      // N3: superposición
      if(v>0 && C[v].midi > P[v-1].midi) return 'N3';
      if(v<3 && C[v].midi < P[v+1].midi) return 'N3';
      // N12/N13: melódicas
      const m = melodica(v, P[v], C[v]);
      if(m) return m;
      if(esQuintaDim(P[v],C[v])){
        if(esUltimo) return 'N12';                        // sin resolución posible
      }
      // 5.ª dim anterior: ahora grado conjunto en dirección contraria
      if(path.length>=2){
        const PP=path[path.length-2].v[v];
        if(esQuintaDim(PP,P[v])){
          const dir=sgn(P[v].abs-PP.abs);
          if(!(Math.abs(C[v].abs-P[v].abs)===1 && sgn(C[v].abs-P[v].abs)===-dir)) return 'N12';
        }
      }
    }
    // N4: paralelas (incluidas por movimiento contrario) · N6: 5.ª dim → justa desde el bajo
    for(let i=0;i<4;i++) for(let j=i+1;j<4;j++){
      const a=clase(P[i],P[j]), b=clase(C[i],C[j]);
      const movI=P[i].abs!==C[i].abs, movJ=P[j].abs!==C[j].abs;
      if(a && b && a===b && a!=='d5' && movI && movJ) return 'N4';
      if(j===3 && a==='d5' && b==='P5') return 'N6';
    }
    // N5: directas entre extremas
    {
      const dS=sgn(C[0].abs-P[0].abs), dB=sgn(C[3].abs-P[3].abs);
      const b=clase(C[0],C[3]);
      if(dS && dS===dB && (b==='P5'||b==='P8') && Math.abs(C[0].abs-P[0].abs)>1) return 'N5';
    }
    // N7: sensible
    if(!tieneGrado(chCand,7)){
      for(let v=0;v<4;v++) if(P[v].deg===7){
        const sube = C[v].deg===1 && C[v].abs===P[v].abs+1;
        if(sube) continue;
        if(v===0 || v===3) return 'N7';
        const baja = C[v].deg===5 && C[v].abs===P[v].abs-2 && chCand.grado===1 && C[v-1].deg===1;
        if(!baja) return 'N7';
      }
    }
    // N8: 7.ª del acorde de dominante (tono con rol '7')
    for(let v=0;v<4;v++) if(P[v].rol==='7'){
      const baja = C[v].abs===P[v].abs-1;
      const queda = C[v].abs===P[v].abs && C[v].deg===P[v].deg;
      if(!baja && !queda) return 'N8';
      if(baja){
        for(let u=0;u<4;u++) if(u!==v && P[u].rol==='F' && C[u].deg===C[v].deg && P[u].abs!==C[u].abs) return 'N8';
      }
    }
    // N9: 6/4 cadencial → V (el bajo se mantiene o salta de 8.ª)
    if(chPrev.cadencial64){
      if(chCand.grado!==5) return 'N9';
      if(Math.abs(C[3].abs-P[3].abs)%7!==0) return 'N9';
      for(let v=0;v<3;v++){
        if(P[v].rol==='F' && !(C[v].abs===P[v].abs-1)) return 'N9';
        if(P[v].rol==='3' && !(C[v].abs===P[v].abs-1)) return 'N9';
      }
    }
    return null;
  }

  /* ---------- preferencias (P3–P10) como penalización ---------- */
  function penTransicion(prev, cand, chPrev, chCand, path){
    const P=prev.v, C=cand.v;
    let pen=0;
    const dB=C[3].abs-P[3].abs;
    // P3: extremas en movimiento directo
    const dS=C[0].abs-P[0].abs;
    if(sgn(dS) && sgn(dS)===sgn(dB)) pen+=1;
    // P4: notas comunes / contrario al bajo
    const saltoBajo = [3,4].includes(mod(Math.abs(dB),7)) && dB!==0;
    for(let v=0;v<3;v++){
      const d=C[v].abs-P[v].abs;
      if(saltoBajo && tieneGrado(chCand,P[v].deg) && d!==0) pen+=1;
      if(Math.abs(dB)===1 && sgn(d)===sgn(dB)) pen+=1;
    }
    // P5: mínimo movimiento en las internas
    pen += 0.5*(Math.abs(C[1].abs-P[1].abs)+Math.abs(C[2].abs-P[2].abs));
    // P6: la 7.ª por nota común o grado conjunto
    for(let v=0;v<4;v++) if(C[v].rol==='7' && Math.abs(C[v].abs-P[v].abs)>1) pen+=2;
    // P7: soprano por grado conjunto; a lo sumo un salto, y mejor contrario al bajo
    if(Math.abs(dS)>1){
      const d=Math.abs(dS); pen += 0.25*d*(d-1);              // 3.ª 0,5 · 4.ª 1,5 · 5.ª 3 · 6.ª 5
      let saltos=0;
      for(let k=1;k<path.length;k++) if(Math.abs(path[k].v[0].abs-path[k-1].v[0].abs)>1) saltos++;
      if(saltos>=1) pen+=3;
      if(sgn(dS)===sgn(dB)) pen+=1;
    }
    // P8: no más de dos veces seguidas la misma nota en la soprano
    if(path.length>=2 && dS===0 && path[path.length-2].v[0].abs===P[0].abs) pen+=2;
    // P9: rebote tras salto de 4.ª o mayor; en la soprano, seguir en la
    // misma dirección tras el salto penaliza además
    if(path.length>=2) for(let v=0;v<4;v++){
      const PP=path[path.length-2].v[v], d0=P[v].abs-PP.abs, d1=C[v].abs-P[v].abs;
      if(v===3 && Math.abs(d0)===7) continue;               // el bajo, tras una 8.ª, sigue libre
      if(Math.abs(d0)>=3 && !(Math.abs(d1)===1 && sgn(d1)===-sgn(d0)) && d1!==0){
        pen+=1.5;
        if(v===0 && sgn(d1)===sgn(d0)) pen+=2;
      }
    }
    // P11: las cuatro voces en la misma dirección
    {
      const dirs=[0,1,2,3].map(v=>sgn(C[v].abs-P[v].abs));
      if(dirs[0]!==0 && dirs.every(d=>d===dirs[0])) pen+=2;
    }
    // Bonificación: en I6/4 → V, el bajo salta de 8.ª descendente si el registro lo permite
    if(chPrev.cadencial64 && dB===-7) pen-=4;
    // P10: registros extremos: leve por visitarlos, más por habitarlos (> 2 seguidos)
    for(let v=0;v<4;v++){
      if(!enExtremo(v,C[v].abs)) continue;
      pen+=0.4;
      if(path.length>=2 && enExtremo(v,P[v].abs) && enExtremo(v,path[path.length-2].v[v].abs)) pen+=1;
    }
    return pen;
  }
  // Penalización de la línea completa (P8: un solo punto culminante).
  function penLinea(path){
    const s=path.map(x=>x.v[0].abs);
    const max=Math.max.apply(null,s);
    let picos=0;
    for(let k=0;k<s.length;k++) if(s[k]===max && (k===0 || s[k-1]!==max)) picos++;
    return picos>1 ? 2 : 0;
  }

  /* ---------- búsqueda ---------- */
  function mulberry32(a){
    return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  }
  // Orden aleatorio ponderado (sin reemplazo) por peso exp(-beta·pen).
  function ordenPonderado(items, beta, rnd){
    const pool=items.map(it=>({it, w:Math.exp(-beta*it.pen)}));
    const out=[];
    while(pool.length){
      let tot=0; pool.forEach(p=>{tot+=p.w;});
      let r=rnd()*tot, i=0;
      for(;i<pool.length-1;i++){ r-=pool[i].w; if(r<=0) break; }
      out.push(pool[i].it); pool.splice(i,1);
    }
    return out;
  }

  /**
   * realizar(key, acordes, opts) → {voces:[[altura…]×4], acordes, pen, intentos}
   *   o null si no hay realización.
   * opts: { reinicios (6), beta (0.8), seed, maxNodos (5000),
   *         fija: {voz, alturas:[{abs,alter}…]}  — una voz dada (Canto dado),
   *         filtro(path, cand, k, acordes) → bool,
   *         puntuar(path, cand, k, acordes) → penalización extra,
   *         mejorDe (nº de soluciones entre las que elegir por softmax; = reinicios) }
   */
  function realizar(key, acordes, opts){
    opts=opts||{};
    const reinicios=opts.reinicios||6, beta=opts.beta||0.8, maxNodos=opts.maxNodos||5000;
    const rnd = opts.seed!=null ? mulberry32(opts.seed) : Math.random;
    const n=acordes.length;
    const cands = acordes.map((ch,k)=>{
      const fija = opts.fija ? {voz:opts.fija.voz, altura:opts.fija.alturas[k]} : null;
      return candidatos(ch, fija);
    });
    if(cands.some(c=>c.length===0)) return null;

    let nodos=0;
    function dfs(k, path, penAcc){
      if(k===n) return {path, pen: penAcc + penLinea(path)};
      const prev = k>0 ? path[k-1] : null;
      const lista=[];
      cands[k].forEach(c=>{
        if(prev && normasTransicion(prev, c, acordes[k-1], acordes[k], path, k===n-1)) return;
        if(opts.filtro && !opts.filtro(path, c, k, acordes)) return;
        let pen = c.pen + (prev ? penTransicion(prev, c, acordes[k-1], acordes[k], path) : 0);
        if(opts.puntuar) pen += opts.puntuar(path, c, k, acordes);
        lista.push({c, pen});
      });
      for(const it of ordenPonderado(lista, beta, rnd)){
        if(++nodos>maxNodos) return null;
        const r=dfs(k+1, path.concat([it.c]), penAcc+it.pen);
        if(r) return r;
      }
      return null;
    }
    const sols=[];
    let intentos=0;
    for(let r=0;r<reinicios;r++){
      nodos=0; intentos++;
      const s=dfs(0, [], 0);
      if(s) sols.push(s);
    }
    if(!sols.length) return null;
    const elegida = ordenPonderado(sols, beta, rnd)[0];
    const voces=[0,1,2,3].map(v=>elegida.path.map(x=>x.v[v]));
    return {voces, acordes, pen:elegida.pen, intentos, disposiciones:elegida.path};
  }

  const api = {
    realizar, acorde, candidatos, escala, RANGOS,
    // utilidades de altura
    absIdx, letterOf, octOf, midiOf, altura, token, keysigAlters, SYM, ES,
    // reglas sueltas (reutilizables por otras familias; el comprobador NO las usa)
    normasTransicion, penTransicion, melodica, clase, tieneGrado, tonoDeGrado
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.CuatroVoces = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
