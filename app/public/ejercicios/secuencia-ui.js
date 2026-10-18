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
   Con `window.SEC_SEPTIMAS` (familia Secuencias de 4.º UD 1, círculo
   de 5.as con 7.as; páginas secuencia-septimas-*.html): los niveles
   de esa familia, las ligaduras de preparación de las 7.as y, en el
   tipo 1, el primer acorde a la vista (y sonando).
   ============================================================ */
(function(){
  'use strict';
  const TIPO = window.SEC_TIPO || 1;
  const S = window.Secuencia;
  const SEPT = !!window.SEC_SEPTIMAS;
  const sep='<span class="sep-q">·</span>';

  ArmoniaEj.ejercicio({
    maxNivel: SEPT ? S.MAX_NIVEL_7 : S.MAX_NIVEL,
    generar: n => S.generar(TIPO, n, SEPT ? {septimas:true} : null),
    mei: inst => S.toMEI(inst, {mascara:true, ocultas:[0,1,2], cifrados:true, saltoFrase:true}),
    trasRender: (root, inst) => {
      ArmoniaEj.apilarCifras(root);
      // encima, en filas fijas (de abajo arriba): módulos, tramos, tonalidad
      ArmoniaEj.rotulosEncima(root, inst.encima);
    },
    respuesta: inst => {
      const a=inst.json.answer, s7=SEPT ? S.septimasDe(inst) : null;
      const lis=a.tramos.map(t=>`<li><b>${t.compases}</b> · ${t.texto}</li>`);
      if(s7) lis.push(`<li><b>7.as</b> · ${s7.voces.map(x=>x.romano+': '+x.voz).join(' · ')}. ${s7.nota}</li>`);
      // Círculo de 5.as (con 7.as, tipo 1): la pregunta, según el nivel (en el
      // nivel 1 todo va en estado fundamental: la inversión no se pregunta)
      const preg = SEPT && TIPO===1 ? {preg: inst.septimas>=2
        ? '¿En qué <b>voz</b> va la <b>7.ª</b> de cada acorde? ¿En qué <b>inversión</b> está cada uno?'
        : '¿En qué <b>voz</b> va la <b>7.ª</b> de cada acorde?'} : {};
      return {...preg,
        ansQ: (TIPO===1 ? '' : `<span class="ton">${a.tonalidad}</span>${sep}`) + `<span>${a.resumen}</span>`,
        ansDet: '<ul class="tramos">' + lis.join('') + '</ul>'
      };
    },
    // sin «Oír», antes de revelar, solo el bajo (las cuatro voces darían la
    // respuesta); con «Oír», las cuatro, con el bajo destacado
    // (con 7.as, tipo 1: el primer acorde, dado, suena entero)
    audio: (inst, revelado, oir) => oir ? S.midis(inst, {ganancia:S.GANANCIA_OIR})
                                        : revelado ? S.midis(inst)
                                        : (SEPT && TIPO===1 ? S.midis(inst).slice(0,3) : []).concat(S.midis(inst, {voces:[3]})),
    audioBajo: inst => S.midis(inst, {voces:[3]}),
    avisoOir: inst => TIPO===1 ? inst.key.nombre : '',
    sonarAlRevelar: true,
    // sitio encima para las filas de rotulosEncima (pageMarginTop; entre los
    // dos sistemas del periodo, spacingSystem)
    verovio: Object.assign({scale:60, pageWidth:1000, pageMarginTop: TIPO===1 ? 180 : 150},
      TIPO===3 ? {breaks:'encoded', minLastJustification:0, spacingSystem:22} : {})
  });
})();
