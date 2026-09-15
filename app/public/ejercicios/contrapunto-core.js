/* ============================================================
   Contrapunto — motor genérico de primera especie (1:1)
   ------------------------------------------------------------
   Módulo AISLADO de generación de contrapunto nota-contra-nota,
   pensado para reutilizarse desde distintas familias de
   ejercicios y con variantes (p. ej. fragmentos con faltas
   deliberadas). No sabe nada de niveles, claves, MEI ni UI:
   recibe tonalidad + tesituras y devuelve las voces generadas.

   · Nº de voces genérico (2 probadas; 3 soportadas por la misma
     arquitectura: sonoridades = arrays de grave a agudo y reglas
     aplicadas por pares de voces).
   · Reglas individuales activables/desactivables (`reglas`),
     para poder generar variantes que relajen alguna de ellas.
   · Ganchos `filtroCandidato` / `pesoCandidato` para que cada
     ejercicio imponga condiciones propias (p. ej. movimiento
     uniforme) sin tocar el motor.
   · `analizar()` revisa una realización cualquiera y devuelve
     la lista de faltas: base para los ejercicios de detección
     de errores (y para verificar variantes con faltas a propósito).

   REGLAS (por defecto todas activas):
     · solo consonancias; sin 4.ª sobre el bajo (entre voces
       superiores se admite si `cuartaEntreSuperiores`)
     · sin cruces; unísono solo en los extremos
     · empieza y acaba en consonancia perfecta sobre la tónica
       (clase de 8.ª entre las voces extremas)
     · sin 5.as/8.as consecutivas de la misma clase (paralelas)
       ni directas con salto en la voz aguda del par
     · sin 8.ª/unísono sobre la sensible (sensible doblada)
     · CADENCIA: la penúltima sonoridad es 3.ª (7̂ abajo, 2̂
       arriba → unísono) o 6.ª (2̂ abajo, 7̂ arriba → 8.ª);
       siempre con los grados 2 y 7 (sensible)
     · melódicas: salto máximo de 5.ª; nunca aum/dim (excluye
       la 2.ª aumentada del menor y los tritonos); dos saltos
       seguidos en la misma dirección no suman 7.ª ni 9.ª;
       (blanda) tras un salto de 4.ª o mayor se prefiere girar
       por grado conjunto en dirección contraria («rebote»)
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- alturas / tonalidad ---------- */
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
  function scaleLetters(tonic){
    const s=LETTERS.indexOf(tonic), out=[];
    for(let i=0;i<7;i++) out.push(LETTERS[(s+i)%7]);
    return out;
  }
  function scaleDegreeAlters(key){
    const sig=keysigAlters(key.sig), L=scaleLetters(key.tonic);
    const arr=L.map(x=>({letter:x,alter:sig[x]}));
    if(key.mode==='minor') arr[6].alter+=1;   // única alteración añadida: la sensible
    return arr;
  }
  function altersByLetter(key){
    const map={};
    scaleDegreeAlters(key).forEach(d=>{ map[d.letter]=d.alter; });
    return map;
  }
  function midiOf(letter,alter,oct){ return (oct+1)*12 + LETTER_SEMITONE[letter] + alter; }
  function absLetterIndex(letter, oct){ return oct*7 + LETTERS.indexOf(letter); }
  function letterOctAt(absIdx){
    const oct = Math.floor(absIdx/7);
    const letter = LETTERS[((absIdx%7)+7)%7];
    return { letter, oct };
  }
  function pitchAt(absIdx, alters){
    const { letter, oct } = letterOctAt(absIdx);
    return { letter, oct, alter: alters[letter] };
  }
  function midiAt(absIdx, alters){
    const p = pitchAt(absIdx, alters);
    return midiOf(p.letter, p.alter, p.oct);
  }

  /* ---------- calidad de intervalos ---------- */
  const REF_SEMIS = [0,2,4,5,7,9,11,12];
  const PERFECT_STEPS = new Set([0,3,4,7]);
  function reduceSteps(steps){
    if(steps<=7) return { reduced: steps, octaves: 0 };
    const octaves = Math.floor((steps-1)/7);
    return { reduced: steps-7*octaves, octaves };
  }
  function intervalQuality(steps, semis){
    const { reduced, octaves } = reduceSteps(steps);
    const ref = REF_SEMIS[reduced] + 12*octaves;
    const diff = semis - ref;
    if(PERFECT_STEPS.has(reduced)){
      if(diff===0) return 'justa';
      if(diff===1) return 'aumentada';
      if(diff===-1) return 'disminuida';
      return diff>0 ? 'superaumentada' : 'superdisminuida';
    }
    if(diff===0) return 'mayor';
    if(diff===-1) return 'menor';
    if(diff===1) return 'aumentada';
    if(diff===-2) return 'disminuida';
    return diff>0 ? 'superaumentada' : 'superdisminuida';
  }
  function perfectClass(semis){                            // clase de consonancia perfecta
    const m=((semis%12)+12)%12;
    return m===0 ? 'octava' : (m===7 ? 'quinta' : null);   // unísono/8.ª/15.ª ~ misma clase
  }
  function consonantQuality(q){ return q==='justa'||q==='mayor'||q==='menor'; }

  /* ---------- clasificación del movimiento (por par de voces) ---------- */
  // du/dl = desplazamiento diatónico de cada voz entre dos sonoridades.
  // paralelo ⊂ directo: misma dirección Y misma amplitud diatónica.
  function motionOf(du, dl, sameAmp){
    if(du===0 && dl===0) return null;                      // sin movimiento
    if(du===0 || dl===0) return 'oblicuo';
    if(Math.sign(du)!==Math.sign(dl)) return 'contrario';
    return sameAmp ? 'paralelo' : 'directo';
  }
  const MOTION_TYPES = ['oblicuo','contrario','directo','paralelo'];

  /* ---------- reglas (todas desconectables para generar variantes) ---------- */
  const REGLAS_DEFECTO = {
    consonancias: true,          // solo consonancias; sin 2.ª/7.ª; sin 4.ª sobre el bajo
    cuartaEntreSuperiores: true, // (≥3 voces) la 4.ª se admite entre voces superiores
    unisonoInterior: false,      // unísono solo en la primera/última sonoridad
    extremos: true,              // empezar/acabar en clase de 8.ª sobre la tónica
    paralelas: true,             // sin 5.as/8.as consecutivas de la misma clase
    directas: true,              // sin 5.ª/8.ª directa con salto en la voz aguda del par
    sensibleDoblada: true,       // sin 8.ª/unísono sobre la sensible
    cadencia: true,              // penúltima: 3.ª (7̂-2̂ → unísono) o 6.ª (2̂-7̂ → 8.ª)
    saltoMaximo: 4,              // en pasos diatónicos (4 = 5.ª); las aum/dim se excluyen siempre
    saltosSumados: true,         // dos saltos seguidos en la misma dirección no suman 7.ª ni 9.ª
    rebote: true                 // (blanda) tras salto ≥ 4.ª, girar por grado conjunto
  };

  // Interválica melódica: dentro del salto máximo y nunca aum/dim
  // (excluye p. ej. la 2.ª aumentada VI–VII# del menor armónico y el tritono).
  function melodiaOK(dSteps, dSemis, reglas){
    const a=Math.abs(dSteps);
    if(a>reglas.saltoMaximo) return false;
    return consonantQuality(intervalQuality(a, Math.abs(dSemis)));
  }

  // Dos saltos consecutivos en la misma dirección no deben sumar 7.ª (6 pasos)
  // ni 9.ª (8 pasos); la 8.ª (7 pasos) sí se admite.
  function saltosSumadosOK(dPrev, d){
    if(Math.abs(dPrev)<2 || Math.abs(d)<2) return true;    // hace falta que ambos sean saltos
    if(Math.sign(dPrev)!==Math.sign(d)) return true;
    const suma=Math.abs(dPrev)+Math.abs(d);
    return suma!==6 && suma!==8;
  }

  // ¿Es válido el intervalo armónico entre dos voces del entramado?
  // o = { esExtremo, conBajo, esParExterior, nv, reglas }
  function armoniaParOK(steps, semis, o){
    if(steps<0) return false;                              // cruce
    const q = intervalQuality(steps, semis);
    if(!consonantQuality(q)) return false;                 // fuera aum/dim (p. ej. con la sensible)
    const pc = perfectClass(semis);
    const { reduced } = reduceSteps(steps);
    if(o.esExtremo){
      // extremos: 8.ª/unísono entre las voces extremas; la intermedia (≥3
      // voces) forma 5.ª u 8.ª con el bajo y cualquier consonancia (4.ª
      // incluida, p. ej. Do-Sol-Do) con la voz superior
      if(o.nv<=2 || o.esParExterior) return pc==='octava';
      if(o.conBajo) return !!pc;
      if(reduced===1 || reduced===6) return false;
      if(reduced===3 && !o.reglas.cuartaEntreSuperiores) return false;
      return true;
    }
    if(!o.reglas.consonancias) return steps!==0 || o.reglas.unisonoInterior;
    if(reduced===1 || reduced===6) return false;           // 2.ª / 7.ª: disonancias
    if(reduced===3 && (o.conBajo || !o.reglas.cuartaEntreSuperiores)) return false;
    if(steps===0 && !o.reglas.unisonoInterior) return false;
    return true;                                           // 3.ª, 5.ª, 6.ª, 8.ª (y compuestos)
  }

  /* ---------- generador con backtracking ---------- */
  const MOVES=[-4,-3,-2,-1,0,1,2,3,4];
  const MOVE_W={0:1.6, 1:4, 2:2, 3:1, 4:0.7};

  // Ordena candidatos por sorteo ponderado sin reemplazo.
  function weightedOrder(cands){
    const arr=cands.slice(), out=[];
    while(arr.length){
      let tot=0; for(const c of arr) tot+=c.w;
      let r=Math.random()*tot, k=0;
      for(;k<arr.length-1;k++){ r-=arr[k].w; if(r<=0) break; }
      out.push(arr[k]); arr.splice(k,1);
    }
    return out;
  }
  function shuffle(a){
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }

  // Cadencia: dada la penúltima sonoridad (voces extremas), el final es único.
  function finalDeCadencia(son, nv){
    const lo=son[0], hi=son[nv-1];
    if(hi-lo===2) return { lo: lo+1, hi: hi-1 };           // 3.ª (7̂-2̂) → unísono
    return { lo: lo-1, hi: hi+1 };                         // 6.ª (2̂-7̂) → 8.ª
  }

  /* Un intento completo de generación.
     opciones:
       tonalidad  — {tonic, sig, mode}
       rangos     — [[min,max], …] índices diatónicos abs, de GRAVE a AGUDA
       nNotas     — sonoridades por voz (por defecto 10)
       reglas     — overrides parciales de REGLAS_DEFECTO
       filtroCandidato(ctx) → bool   — condición extra del ejercicio
       pesoCandidato(ctx, w) → w     — ajuste de pesos del ejercicio
       maxVisitas — presupuesto de backtracking (por defecto 8000)
     ctx de los ganchos: { k, motionIdx, tipo, tipoPrevio, seq, cand }
       (tipo/tipoPrevio: movimiento del PAR EXTERIOR de voces)
     Devuelve null si no lo consigue, o:
       { tonalidad, alters, n, nv, voces } con voces[v] = array de notas
       {letter, alter, oct, abs, midi} de la más grave a la más aguda. */
  function generar(opciones){
    const o = opciones||{};
    const reglas = Object.assign({}, REGLAS_DEFECTO, o.reglas||{});
    const tonalidad = o.tonalidad;
    const alters = altersByLetter(tonalidad);
    const rangos = o.rangos;
    const nv = rangos.length;
    const n = o.nNotas || 10;
    const maxVisitas = o.maxVisitas || 8000;
    const L = scaleLetters(tonalidad.tonic);
    const sensLetter = L[6], deg2Letter = L[1];
    let visits = 0;

    const M = abs => midiAt(abs, alters);

    // Comprobaciones a nivel de sonoridad (todas las parejas de voces).
    function sonoridadOK(son, esExtremo){
      for(let i=0;i<nv;i++) for(let j=i+1;j<nv;j++){
        const steps=son[j]-son[i], semis=M(son[j])-M(son[i]);
        if(!armoniaParOK(steps, semis,
             {esExtremo, conBajo:i===0, esParExterior:(i===0&&j===nv-1), nv, reglas}))
          return false;
        if(reglas.sensibleDoblada && perfectClass(semis)==='octava'
           && letterOctAt(son[i]).letter===sensLetter) return false;
      }
      return true;
    }

    // Sonoridades iniciales: tónica en el bajo + sonoridad de extremo válida.
    function starts(){
      const out=[];
      (function fill(son){
        const v=son.length;
        if(v===nv){ if(sonoridadOK(son,true)) out.push(son.slice()); return; }
        for(let x=rangos[v][0]; x<=rangos[v][1]; x++){
          if(v===0 && letterOctAt(x).letter!==tonalidad.tonic) continue;
          if(v>0 && x<son[v-1]) continue;                  // sin cruces ya al enumerar
          son.push(x); fill(son); son.pop();
        }
      })([]);
      return shuffle(out);
    }

    function extend(seq){
      if(++visits>maxVisitas) return false;
      const k=seq.length;                                  // posición a colocar (0-based)
      if(k===n) return true;
      const esUltima = k===n-1;
      const prev=seq[k-1], prev2=seq[k-2]||null;
      const motionIdx = k-1;                               // transición prev→nueva

      // final forzado por la cadencia (solo voces extremas; las intermedias, libres)
      const forzado = (reglas.cadencia && esUltima) ? finalDeCadencia(prev, nv) : null;

      // movimientos admisibles por voz (chequeos melódicos, independientes por voz)
      const porVoz=[];
      for(let v=0;v<nv;v++){
        const lista=[];
        for(const d of MOVES){
          const x=prev[v]+d;
          if(x<rangos[v][0]||x>rangos[v][1]) continue;
          if(d!==0 && !melodiaOK(d, M(x)-M(prev[v]), reglas)) continue;
          if(reglas.saltosSumados && prev2 && !saltosSumadosOK(prev[v]-prev2[v], d)) continue;
          if(forzado && v===0    && x!==forzado.lo) continue;
          if(forzado && v===nv-1 && x!==forzado.hi) continue;
          // peso melódico: pasos pequeños + «rebote» tras salto de 4.ª o mayor
          let w = MOVE_W[Math.abs(d)];
          if(reglas.rebote && prev2){
            const dPrev = prev[v]-prev2[v];
            if(Math.abs(dPrev)>=3)
              w *= (Math.abs(d)===1 && Math.sign(d)===-Math.sign(dPrev)) ? 3 : 0.25;
          }
          lista.push({x, d, w});
        }
        if(!lista.length) return false;
        porVoz.push(lista);
      }

      // producto cartesiano de movimientos + chequeos de conjunto
      const prevPCs=[], prevSteps=[];
      for(let i=0;i<nv;i++) for(let j=i+1;j<nv;j++){
        prevPCs.push(perfectClass(M(prev[j])-M(prev[i])));
        prevSteps.push(prev[j]-prev[i]);
      }
      const tipoPrevio = prev2
        ? motionOf(prev[nv-1]-prev2[nv-1], prev[0]-prev2[0],
                   (prev[nv-1]-prev[0])===(prev2[nv-1]-prev2[0]))
        : null;

      const cands=[];
      (function combi(v, son, ds, w){
        if(v===nv){
          if(ds.every(d=>d===0)) return;                   // sin movimiento: prohibido
          if(!sonoridadOK(son, esUltima)) return;
          if(esUltima && reglas.extremos
             && letterOctAt(son[0]).letter!==tonalidad.tonic) return;

          // cadencia: la penúltima debe ser una fórmula alcanzable (7̂-2̂ ó 2̂-7̂)
          if(reglas.cadencia && k===n-2){
            const st=son[nv-1]-son[0], Ll=letterOctAt(son[0]).letter;
            let fLo, fHi;
            if(st===2 && Ll===sensLetter){ fLo=son[0]+1; fHi=son[nv-1]-1; }
            else if((st===5||st===12) && Ll===deg2Letter){ fLo=son[0]-1; fHi=son[nv-1]+1; }
            else return;
            if(fLo<rangos[0][0]||fLo>rangos[0][1]) return;
            if(fHi<rangos[nv-1][0]||fHi>rangos[nv-1][1]) return;
          }

          // paralelas y directas, por pares de voces
          let p=0, pcExterior=null;
          for(let i=0;i<nv;i++) for(let j=i+1;j<nv;j++,p++){
            const semis=M(son[j])-M(son[i]);
            const pc=perfectClass(semis);
            if(i===0&&j===nv-1) pcExterior=pc;
            if(!pc) continue;
            if(reglas.paralelas && prevPCs[p]===pc) return;
            const tipoPar=motionOf(ds[j], ds[i], (son[j]-son[i])===prevSteps[p]);
            if(reglas.directas && (tipoPar==='directo'||tipoPar==='paralelo')
               && Math.abs(ds[j])>1) return;
          }

          const tipo=motionOf(ds[nv-1], ds[0],
                              (son[nv-1]-son[0])===(prev[nv-1]-prev[0]));
          const ctx={k, motionIdx, tipo, tipoPrevio, seq, cand:son};
          if(o.filtroCandidato && !o.filtroCandidato(ctx)) return;
          let peso = w * (pcExterior?1:3);                 // prioriza consonancias imperfectas
          if(o.pesoCandidato) peso=o.pesoCandidato(ctx, peso);
          if(!(peso>0)) return;
          cands.push({son:son.slice(), w:peso});
          return;
        }
        for(const c of porVoz[v]){
          if(v>0 && c.x<son[v-1]) continue;                // sin cruces
          son.push(c.x); ds.push(c.d);
          combi(v+1, son, ds, w*c.w);
          son.pop(); ds.pop();
        }
      })(0, [], [], 1);

      for(const c of weightedOrder(cands)){
        seq.push(c.son);
        if(extend(seq)) return true;
        seq.pop();
      }
      return false;
    }

    for(const s of starts()){
      const seq=[s];
      if(extend(seq)){
        const voces=[];
        for(let v=0;v<nv;v++)
          voces.push(seq.map(son=>({ ...pitchAt(son[v],alters), abs:son[v], midi:M(son[v]) })));
        return { tonalidad, alters, n, nv, voces };
      }
    }
    return null;
  }

  /* ---------- analizador de faltas ---------- */
  /* Revisa una realización (correcta o no) contra las reglas y devuelve la
     lista de faltas encontradas: base de las variantes «con errores a
     propósito» y de los ejercicios de detección de faltas.
     voces: arrays (de grave a aguda) de índices abs o de notas {abs};
     devuelve [{tipo, indice, voces|voz, texto}] (indice = sonoridad o, en las
     faltas de transición, la sonoridad de LLEGADA). */
  function analizar(voces, tonalidad, reglasOpt){
    const reglas = Object.assign({}, REGLAS_DEFECTO, reglasOpt||{});
    const alters = altersByLetter(tonalidad);
    const vs = voces.map(v=>v.map(x=>typeof x==='number'?x:x.abs));
    const nv = vs.length, n = vs[0].length;
    const L = scaleLetters(tonalidad.tonic);
    const sensLetter=L[6];
    const M = abs => midiAt(abs, alters);
    const faltas=[];
    const f=(tipo,indice,extra,texto)=>faltas.push(Object.assign({tipo,indice,texto},extra));
    const ord=i=>(i+1)+'.ª';

    for(let k=0;k<n;k++){
      const esExtremo = k===0||k===n-1;
      for(let i=0;i<nv;i++) for(let j=i+1;j<nv;j++){
        const steps=vs[j][k]-vs[i][k], semis=M(vs[j][k])-M(vs[i][k]);
        const par={voces:[i,j]};
        if(steps<0){ f('cruce',k,par,'cruce de voces en la sonoridad '+ord(k)); continue; }
        const pc=perfectClass(semis);
        if(!armoniaParOK(steps,semis,{esExtremo,conBajo:i===0,esParExterior:(i===0&&j===nv-1),nv,reglas}))
          f(esExtremo?'extremo':'disonancia',k,par,
            (esExtremo?'sonoridad extrema no válida':'intervalo armónico no válido')+' en la '+ord(k));
        if(reglas.sensibleDoblada && pc==='octava' && letterOctAt(vs[i][k]).letter===sensLetter)
          f('sensibleDoblada',k,par,'sensible doblada en la sonoridad '+ord(k));
        if(k>0){
          const di=vs[i][k]-vs[i][k-1], dj=vs[j][k]-vs[j][k-1];
          const pcPrev=perfectClass(M(vs[j][k-1])-M(vs[i][k-1]));
          if(reglas.paralelas && pc && pcPrev===pc)
            f('paralelas',k,par,pc+'s consecutivas hacia la sonoridad '+ord(k));
          const tipoPar=motionOf(dj,di,steps===(vs[j][k-1]-vs[i][k-1]));
          if(reglas.directas && pc && (tipoPar==='directo'||tipoPar==='paralelo') && Math.abs(dj)>1)
            f('directas',k,par,pc+' directa (salto en la voz aguda) hacia la '+ord(k));
        }
      }
      if(k>0 && vs.every((v)=>v[k]===v[k-1]))
        f('sinMovimiento',k,{},'sonoridad repetida en la '+ord(k));
    }
    for(let v=0;v<nv;v++) for(let k=1;k<n;k++){
      const d=vs[v][k]-vs[v][k-1];
      if(d!==0 && !melodiaOK(d, M(vs[v][k])-M(vs[v][k-1]), reglas))
        f('melodia',k,{voz:v},'salto melódico no válido hacia la sonoridad '+ord(k));
      if(reglas.saltosSumados && k>1 && !saltosSumadosOK(vs[v][k-1]-vs[v][k-2], d))
        f('saltosSumados',k,{voz:v},'dos saltos seguidos que suman 7.ª o 9.ª hacia la '+ord(k));
    }
    if(reglas.cadencia && n>=2){
      const st=vs[nv-1][n-2]-vs[0][n-2], Ll=letterOctAt(vs[0][n-2]).letter;
      const fin=finalDeCadencia(vs.map(v=>v[n-2]), nv);
      const ok = ((st===2 && Ll===sensLetter) || ((st===5||st===12) && Ll===L[1]))
                 && vs[0][n-1]===fin.lo && vs[nv-1][n-1]===fin.hi;
      if(!ok) f('cadencia',n-2,{},'la cadencia no sigue la fórmula 3.ª→unísono / 6.ª→8.ª');
    }
    return faltas;
  }

  const api = {
    generar, analizar, REGLAS_DEFECTO, MOTION_TYPES,
    // utilidades de altura/tonalidad e intervalos, para las familias
    keysigAlters, scaleLetters, scaleDegreeAlters, altersByLetter,
    midiOf, absLetterIndex, letterOctAt, pitchAt, midiAt,
    reduceSteps, intervalQuality, perfectClass, consonantQuality, motionOf,
    // reglas sueltas (reutilizables por variantes/comprobadores)
    melodiaOK, saltosSumadosOK, armoniaParOK
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.Contrapunto = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
