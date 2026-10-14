/* ============================================================
   4.º · Unidad 0 — Secuencia: UI común a los tres tipos
   ------------------------------------------------------------
   Como prolongacion-ui.js: las tres páginas (secuencia-sec/
   -frase/-periodo.html) solo cambian en el tipo y la ayuda; cada
   una fija `window.SEC_TIPO` antes de cargar este fichero. La
   lógica musical vive en secuencia-core.js; lo común de la página
   (nivel, revelado, audio, «Oír»), en ArmoniaEj.ejercicio
   (comun.js). Antes de revelar se ve y suena SOLO el bajo; con
   «Oír» (tipo 1), suenan las cuatro voces con el bajo destacado.
   ============================================================ */
(function(){
  'use strict';
  const TIPO = window.SEC_TIPO || 1;
  const S = window.Secuencia;
  const sep='<span class="sep-q">·</span>';

  ArmoniaEj.ejercicio({
    maxNivel: S.MAX_NIVEL,
    generar: n => S.generar(TIPO, n),
    mei: inst => S.toMEI(inst, {mascara:true, ocultas:[0,1,2], cifrados:true, saltoFrase:true}),
    trasRender: (root, inst) => {
      ArmoniaEj.apilarCifras(root);
      // encima, en filas fijas (de abajo arriba): módulos, tramos, tonalidad
      ArmoniaEj.rotulosEncima(root, inst.encima);
    },
    respuesta: inst => {
      const a=inst.json.answer;
      return {
        ansQ: (TIPO===1 ? '' : `<span class="ton">${a.tonalidad}</span>${sep}`) + `<span>${a.resumen}</span>`,
        ansDet: '<ul class="tramos">' + a.tramos.map(t=>`<li><b>${t.compases}</b> · ${t.texto}</li>`).join('') + '</ul>'
      };
    },
    // sin «Oír», antes de revelar, solo el bajo (las cuatro voces darían la
    // respuesta); con «Oír», las cuatro, con el bajo destacado
    audio: (inst, revelado, oir) => oir ? S.midis(inst, {ganancia:S.GANANCIA_OIR})
                                        : S.midis(inst, revelado ? null : {voces:[3]}),
    audioBajo: inst => S.midis(inst, {voces:[3]}),
    avisoOir: inst => TIPO===1 ? inst.key.nombre : '',
    sonarAlRevelar: true,
    // sitio encima para las filas de rotulosEncima (pageMarginTop; entre los
    // dos sistemas del periodo, spacingSystem)
    verovio: Object.assign({scale:60, pageWidth:1000, pageMarginTop: TIPO===1 ? 180 : 150},
      TIPO===3 ? {breaks:'encoded', minLastJustification:0, spacingSystem:22} : {})
  });
})();
