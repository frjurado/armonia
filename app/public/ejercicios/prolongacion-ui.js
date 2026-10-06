/* ============================================================
   4.º · Unidad 0 — Prolongación: UI común a los tres tipos
   ------------------------------------------------------------
   Las tres páginas (prolongacion-prol/-frase/-periodo.html)
   son iguales salvo el tipo y la ayuda: cada una fija
   `window.PROL_TIPO` (1, 2 o 3) antes de cargar este fichero.
   La lógica musical vive en prolongacion-core.js; lo común de
   la página (nivel, revelado, audio), en ArmoniaEj.ejercicio
   (comun.js). Antes de revelar se ve y suena SOLO el bajo (y, en el
   tipo 1, la tonalidad como dato): las voces superiores, los
   cifrados y los tramos ya están dibujados, pero ocultos (máscara).
   ============================================================ */
(function(){
  'use strict';
  const TIPO = window.PROL_TIPO || 1;
  const P = window.Prolongacion;
  const sep='<span class="sep-q">·</span>';

  ArmoniaEj.ejercicio({
    maxNivel: P.MAX_NIVEL,
    generar: n => P.generar(TIPO, n),
    mei: inst => P.toMEI(inst, {mascara:true, ocultas:[0,1,2], cifrados:true, tramos:true,
      dato: TIPO===1 ? inst.key.nombre : null, saltoFrase:true}),
    trasRender: (root, inst) => {
      ArmoniaEj.apilarCifras(root);
      // corchete de cada etiqueta de tramo hasta su último acorde; abierto (sin
      // gancho) si solapa con el siguiente: la bisagra prolongación–cadencia.
      // Se dibuja dentro de la etiqueta, así que se oculta y aparece con ella.
      const tr=inst.est.tramos;
      ArmoniaEj.corchetesTramo(root, tr.map((t,i)=>({etiqueta:'tramo'+i, hasta:'s'+t.hasta,
        abierto: !!tr[i+1] && tr[i+1].desde===t.hasta})));
    },
    // Titular: tonalidad (si no era el dato) y la forma. Los acordes no se
    // repiten aquí: salen cifrados en la partitura, con sus alternativas.
    respuesta: inst => {
      const a=inst.json.answer;
      return {
        ansQ: (TIPO===1 ? '' : `<span class="ton">${a.tonalidad}</span>${sep}`) + `<span>${a.resumen}</span>`,
        ansDet: '<ul class="tramos">' + a.tramos.map(t=>`<li><b>${t.compases}</b> · ${t.texto}</li>`).join('') + '</ul>'
      };
    },
    audio: (inst, revelado) => P.midis(inst, revelado ? null : {voces:[3]}),
    sonarAlRevelar: true,
    // El periodo va en dos sistemas, uno por frase (<sb/> en el MEI), los dos
    // del mismo ancho: el último se justifica siempre (minLastJustification 0;
    // por defecto Verovio solo lo estira si ya ocupa el 80 %).
    verovio: Object.assign({scale:60, pageWidth:1000}, TIPO===3 ? {breaks:'encoded', minLastJustification:0} : {})
  });
})();
