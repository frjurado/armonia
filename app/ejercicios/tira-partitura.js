/* ============================================================
   tira-partitura.js — tira deslizante sobre una partitura
   ------------------------------------------------------------
   Encapsula el patrón de "serie encadenada visible": Verovio
   renderiza TODOS los compases de la serie en un solo sistema
   (breaks:none + adjustPageWidth) y este módulo centra un compás
   cada vez dentro del visor, deslizando la partitura entre pasos
   con una transición CSS. El difuminado de lo anterior/posterior
   (velos laterales) y las capas de respuesta superpuestas son
   HTML/CSS (ver comun.css: .tira, .tira-velo, .tira-resp) y las
   gestiona cada página; aquí solo vive el desplazamiento.
   Reutilizable por cualquier ejercicio en serie (armaduras,
   recorridos cromáticos…).

   Uso, tras insertar el SVG de Verovio en `inner`:
     const tira = TiraPartitura.montar({ viewport, inner });
     tira.irA(3);         // centra el 4.º compás, deslizando
     tira.irA(0, false);  // sin animación
     tira.total           // nº de anclas detectadas
   `viewport` es el visor (overflow:hidden, posición relativa) e
   `inner` el contenedor del SVG que se desplaza (translateX).
   Por defecto se centra cada compás (g.measure); si el punto de
   interés no coincide con el centro del compás (p. ej. la armadura,
   dibujada a su inicio), se puede pasar `anclas(svg, xDe)`, que
   recibe el SVG y un medidor de centros y devuelve las x a centrar.
   Volver a llamar a montar() sobre el mismo visor reemplaza la
   tira anterior (limpia su listener de resize).
   ============================================================ */
(function (global) {
  'use strict';

  function montar(opts){
    const viewport = opts.viewport;
    const inner    = opts.inner;
    const svg      = inner.querySelector('svg');
    if(!svg) return null;

    // Anclas (x a centrar) relativas al contenido SIN desplazar
    // (medidas una sola vez: el SVG no cambia de tamaño después;
    // .tira svg tiene max-width:none para que no se reescale).
    inner.style.transition = 'none';
    inner.style.transform  = 'none';
    const base = inner.getBoundingClientRect().left;
    const xDe = el => {
      const r = el.getBoundingClientRect();
      return (r.left + r.right) / 2 - base;
    };
    const centros = opts.anclas
      ? opts.anclas(svg, xDe)
      : Array.from(svg.querySelectorAll('g.measure')).map(xDe);
    inner.style.transition = '';

    let actual = 0;
    function aplicar(animar){
      if(animar === false){
        inner.style.transition = 'none';
        void inner.offsetWidth;              // aplica sin animar
      }
      const vw = viewport.getBoundingClientRect().width;
      inner.style.transform = `translateX(${vw/2 - centros[actual]}px)`;
      if(animar === false){
        void inner.offsetWidth;
        inner.style.transition = '';
      }
    }
    function irA(i, animar){
      actual = Math.max(0, Math.min(centros.length - 1, i));
      aplicar(animar);
    }

    // Recentrar al cambiar el tamaño de la ventana; una sola tira
    // viva por visor (remontar limpia el listener anterior).
    if(viewport._tiraResize)
      global.removeEventListener('resize', viewport._tiraResize);
    viewport._tiraResize = () => aplicar(false);
    global.addEventListener('resize', viewport._tiraResize);

    irA(0, false);
    return { irA, get actual(){ return actual; }, total: centros.length };
  }

  // Anclas para SERIES DE ARMADURAS (una por compás): centra el glifo
  // g.keySig de cada compás, dibujado a su inicio. Cada compás emite su
  // propio g.keySig en orden (los cambios deben ir como
  // scoreDef/staffGrp/staffDef@keysig, ver unidad0-armaduras-core.js),
  // pero el de 0 alteraciones (Do M / La m) es un grupo VACÍO sin caja
  // medible: su ancla se estima con el paso medio entre las demás (los
  // compases vacíos son casi equidistantes), lo que funciona también si
  // cae al principio o al final de la serie.
  function anclasArmaduras(sigs){
    return (svg, xDe) => {
      const ks = Array.from(svg.querySelectorAll('g.keySig'));
      const a = sigs.map((s,j) => s!==0 ? xDe(ks[j]) : null);
      const j0 = a.indexOf(null);
      if(j0 >= 0){
        const idxs = a.map((x,j)=>x!==null?j:-1).filter(j=>j>=0);
        const primero = idxs[0], ultimo = idxs[idxs.length-1];
        const paso = (a[ultimo]-a[primero]) / (ultimo-primero);
        a[j0] = j0===0 ? a[1]-paso : a[j0-1]+paso;
      }
      return a;
    };
  }

  global.TiraPartitura = { montar, anclasArmaduras };
})(window);
