/* ============================================================
   comun.js — utilidades compartidas por TODAS las páginas de
   ejercicios (app/ejercicios/*.html):
     · inicialización robusta de Verovio (detecta el runtime ya
       arrancado aunque onRuntimeInitialized haya disparado antes
       de engancharlo, y distingue los motivos de fallo)
     · audio por samples de piano (soundfont-player)
     · la página común (ejercicio): nivel, revelado por máscara y
       audio, para las páginas migradas (Modelo-ejercicios.md §2)
     · dibujos tras el render: cifras apiladas, grados en círculo,
       corchetes de tramo, líneas adicionales de notas ocultas,
       rótulos bajo cada compás
   Depende de los <script> de Verovio y soundfont-player
   (../vendor/), cargados por cada página.
   ============================================================ */
(function (global) {
  'use strict';

  const $ = id => document.getElementById(id);

  /* ---------- Verovio ---------- */
  // Margen izquierdo amplio por defecto: con pentagrama doble la llave (brace)
  // sobresale a la izquierda del sistema y con márgenes pequeños se corta.
  // Fuente musical: Leland (MuseScore), la misma familia que pone las
  // alteraciones en el texto (../vendor/fuentes/). Cambiar las dos a la vez.
  const VRV_DEFAULTS = {
    font:'Leland',
    scale:60, adjustPageHeight:true, pageWidth:900,
    header:'none', footer:'none', breaks:'none',
    pageMarginTop:15, pageMarginBottom:15,
    pageMarginLeft:60, pageMarginRight:20
  };
  // Pizarra: la partitura se dibuja un 50 % más grande. Se reconoce por
  // dos condiciones a la vez — ventana ancha (≥ 1700 px; la del aula son
  // 1920) Y puntero primario grueso (táctil) —, para no disparar en un
  // monitor de escritorio grande con ratón. Solo multiplica `scale`, que
  // es tamaño en píxeles; `pageWidth` va en unidades de Verovio, así que
  // la disposición (qué cabe en un sistema) no cambia; max-width:100% capa
  // el SVG al ancho de la tarjeta si se pasa. En un PC se puede probar
  // emulando «pointer: coarse» en las DevTools.
  const VRV_FACTOR_PIZARRA = 1.5;
  function factorEscala(){
    const mq = q => global.matchMedia && global.matchMedia(q).matches;
    return mq('(min-width:1700px)') && mq('(pointer:coarse)') ? VRV_FACTOR_PIZARRA : 1;
  }

  // initVerovio(opciones, onReady, onFail): crea el toolkit en cuanto el WASM
  // está listo y lo pasa a onReady(tk). onFail(mensaje) recibe un texto
  // legible con el motivo: el <script> no llegó (red), llegó pero el
  // navegador no lo ejecuta (demasiado antiguo para la sintaxis de la
  // build), o el runtime no arranca en ~90 s. Son 7 MB (el WASM va
  // incrustado): la primera visita con conexión lenta tarda; después queda
  // en la caché del navegador. Mientras, si hay un #notation con .ph, avisa.
  //
  // Cómo se sabe que el runtime está listo (Emscriptem, build 6.x de
  // Verovio): `Module.onRuntimeInitialized` se invoca UNA vez; si se engancha
  // tarde no vuelve a disparar, y esta build ya no expone `calledRun`. Lo
  // que sí hace es asignar los exports del WASM (p. ej.
  // `_vrvToolkit_constructor`) justo antes de inicializar, sin ceder el hilo
  // entre medias: si existen al mirarlos desde un timer, ya está listo.
  const VRV_PLAZO_MS = 90000;
  const MSG = {
    red:       'No se pudo descargar Verovio (revisa la conexión y recarga).',
    navegador: 'Este navegador no puede ejecutar Verovio: es demasiado antiguo. Prueba con una versión reciente de Chrome, Edge, Firefox o Safari.',
    toolkit:   'Verovio se cargó pero no pudo arrancar (ver la consola del navegador).',
    plazo:     'Verovio no ha terminado de cargar. Recarga la página; si la conexión es lenta, la primera vez puede tardar.'
  };
  function initVerovio(options, onReady, onFail){
    let done=false;
    const modulo = () => global.verovio && global.verovio.module;
    const listo  = m  => typeof m._vrvToolkit_constructor === 'function';
    function boot(){
      if(done) return; done=true;
      let tk;
      try{
        tk=new global.verovio.toolkit();
        const opts=Object.assign({}, VRV_DEFAULTS, options||{});
        opts.scale=Math.round(opts.scale*factorEscala());
        tk.setOptions(opts);
      }catch(e){ done=false; fail('toolkit', e); return; }
      onReady(tk);                     // fuera del try: un error de la página no es de Verovio
    }
    function fail(motivo, err){
      if(done) return; done=true;
      if(global.console) console.error('initVerovio:', motivo, err||'');
      if(onFail) onFail(MSG[motivo]||MSG.plazo);
    }
    // Engancha al módulo si ya existe; true si lo ha encontrado.
    function enganchar(){
      const m=modulo(); if(!m) return false;
      if(listo(m)) boot(); else m.onRuntimeInitialized = boot;
      return true;
    }
    const script=document.querySelector('script[src*="verovio"]');
    if(script){
      script.addEventListener('error', ()=>fail('red'));
      // load dispara tras ejecutarse el script: si no ha definido `verovio`,
      // lo ha abortado un error de sintaxis (navegador antiguo)
      script.addEventListener('load', ()=>{ if(!enganchar()) fail('navegador'); });
    }
    const t0=Date.now();
    (function wait(){                                              // respaldo por sondeo
      if(done) return;
      enganchar();
      const t=Date.now()-t0;
      if(t>=VRV_PLAZO_MS){ fail('plazo'); return; }
      if(t>=4000){                                                 // tarda: explicar por qué
        const ph=document.querySelector('#notation .ph');
        if(ph && ph.dataset.espera!=='1'){
          ph.dataset.espera='1';
          ph.textContent='Cargando motor de partitura… (7 MB; la primera vez puede tardar)';
        }
      }
      setTimeout(wait,50);
    })();
  }

  /* ---------- cifras apiladas en los <harm> ---------- */
  // Los grados con cifras van en el MEI como <rend>I</rend><rend rend="sup">6
  // </rend><rend rend="sub">4</rend> (Verovio descarta <fb> si el <harm> lleva
  // texto). Verovio escribe sup y sub uno TRAS otro en la misma línea, así que
  // «I⁶₄» sale en diagonal; esta función, tras insertar el SVG en el DOM,
  // retrocede cada cifra sub la anchura medida de la sup anterior para que
  // queden apiladas. Medir (y no estimar) hace que valga con cualquier fuente.
  // Las alteraciones (♯6, 5/♯) Verovio las cambia por un glifo de su fuente
  // musical, en un <tspan font-family> con otro cuerpo: no cuentan para
  // comparar cuerpos, y se apila centrando la parte NUMÉRICA de las dos
  // cifras (el ♯ de «♯6» cuelga a la izquierda; un «♯» solo se centra bajo
  // la cifra de arriba). Ese glifo puede cargarse después de medir: si las
  // fuentes aún no están, se repite al cargar (fija `dx`, no lo acumula).
  function apilarCifras(root){
    if(!root || !root.querySelectorAll) return;
    const largo = t => { try{ return t.getComputedTextLength(); }catch(e){ return 0; } };
    // [anchura de las alteraciones, anchura del resto] de una cifra
    const partes = t => {
      const alt=Array.from(t.querySelectorAll('tspan[font-family]')).reduce((s,x)=>s+largo(x),0);
      return [alt, Math.max(0, largo(t)-alt)];
    };
    root.querySelectorAll('g.harm text').forEach(text=>{
      const rends=Array.from(text.children).filter(c=>c.classList && c.classList.contains('rend'));
      for(let i=1;i<rends.length;i++){
        const prev=rends[i-1].querySelector('tspan.text'), cur=rends[i].querySelector('tspan.text');
        if(!prev || !cur) continue;
        const dyP=parseFloat(prev.getAttribute('dy')||'0'), dyC=parseFloat(cur.getAttribute('dy')||'0');
        // Solo una cifra sub (mismo cuerpo que la sup) se apila; un texto que
        // vuelve a la línea base tras la sup —el «)» de un acorde subordinado,
        // en Prolongación— tiene el cuerpo normal y sigue a continuación.
        const cuerpo = t => { const s=t.querySelector('tspan[font-size]:not([font-family])'); return s ? parseFloat(s.getAttribute('font-size')) : NaN; };
        const cP=cuerpo(prev), cC=cuerpo(cur);
        const mismoCuerpo = !(cP>0 && cC>0) || Math.abs(cC-cP) < 0.15*cP;   // sin dato, como antes
        if(dyP<0 && dyC>0 && mismoCuerpo){
          const [, numP]=partes(prev);
          let [altC, numC]=partes(cur);
          if(!numC){ numC=altC; altC=0; }                  // un «♯» solo: se centra entero
          // la cifra sub empieza donde acaba la sup: se retrocede hasta que
          // los centros de las partes numéricas coincidan (con cifras sin
          // alteración y de igual anchura, lo mismo que retroceder la sup entera)
          cur.setAttribute('dx', -numP/2 - altC - numC/2);
        }
      }
    });
    if(document.fonts && document.fonts.status!=='loaded' && !root.__apilarPendiente){
      root.__apilarPendiente=true;
      document.fonts.ready.then(()=>{ root.__apilarPendiente=false; apilarCifras(root); });
    }
  }

  /* ---------- grado del bajo en círculo («①», «♯⑦») ---------- */
  // circularGrados(root): tras insertar el SVG, rodea con un círculo la cifra
  // de cada <harm type="gradobajo">, y si el @type trae una alteración
  // (clase alt-sostenido | alt-bemol | alt-becuadro) la escribe delante,
  // fuera del círculo, como en los apuntes (♯⑦), anclada por la derecha para
  // que su anchura no mueva nada. Se dibuja en vez de usar los caracteres
  // ①…⑦ porque ni Source Serif ni Leland los traen y la fuente de
  // sustitución cambia de un dispositivo a otro.
  const ALTERACION = {'alt-sostenido':'♯', 'alt-bemol':'♭', 'alt-becuadro':'♮'};
  function circularGrados(root){
    if(!root || !root.querySelectorAll) return;
    const NS='http://www.w3.org/2000/svg';
    root.querySelectorAll('g.harm.gradobajo').forEach(g=>{
      try{
        const text=g.querySelector('text'); if(!text) return;
        const n=text.getNumberOfChars(); if(!n) return;
        const r=text.getExtentOfChar(n-1);
        const radio=Math.max(r.width, r.height*0.7)*0.78;
        const cx=r.x + r.width/2, cy=r.y + r.height*0.55;
        const c=document.createElementNS(NS,'circle');
        c.setAttribute('class','circulo');
        c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', radio);
        c.setAttribute('stroke-width', r.height*0.07);
        g.appendChild(c);
        const alt=Object.keys(ALTERACION).find(k=>g.classList.contains(k));
        if(alt){
          const t=document.createElementNS(NS,'text');
          const cuerpo=text.querySelector('tspan[font-size]');
          t.setAttribute('class','alteracion');
          t.setAttribute('x', cx - radio*1.15);
          t.setAttribute('y', text.getAttribute('y'));
          t.setAttribute('text-anchor','end');
          t.setAttribute('font-size', cuerpo ? cuerpo.getAttribute('font-size') : r.height);
          t.textContent=ALTERACION[alt];
          g.appendChild(t);
        }
      }catch(e){}
    });
  }

  /* ---------- corchete de tramo («Prol. I ────┐») ---------- */
  // corchetesTramo(root, [{etiqueta:'tramo0', hasta:'s5', abierto?}, …]): tras
  // insertar el SVG, prolonga cada etiqueta (id de un <reh>) con una línea
  // continua hasta el final de la nota `hasta`, acabada en un gancho hacia
  // abajo. Si la etiqueta siguiente está en el mismo sistema y más cerca, la
  // línea se para antes de ella. `abierto`: sin gancho, para el tramo que
  // SOLAPA con el siguiente (su último acorde es el primero del otro: la
  // bisagra entre prolongación y cadencia); la línea sigue así en la etiqueta
  // siguiente, sin cerrarse. Se mide en pantalla y se dibuja en las coordenadas de la
  // etiqueta, así que escala con el SVG. El color lo pone el CSS (path.corchete).
  function corchetesTramo(root, tramos){
    if(!root || !root.querySelector) return;
    const cajas = tramos.map(t=>{
      const et=root.querySelector('#'+t.etiqueta), nota=root.querySelector('#'+t.hasta);
      return (et && nota) ? {et, nota, r:et.getBoundingClientRect(), rn:nota.getBoundingClientRect()} : null;
    });
    cajas.forEach((c,i)=>{
      if(!c || !c.r.width) return;
      const ctm=c.et.getScreenCTM(); if(!ctm) return;
      const inv=ctm.inverse();
      const svg=c.et.ownerSVGElement;
      const local=(x,y)=>{ const p=svg.createSVGPoint(); p.x=x; p.y=y; return p.matrixTransform(inv); };
      const alto=c.r.height, hueco=alto*0.35;
      let x1=c.rn.right;
      const sig=cajas[i+1];
      if(sig && Math.abs(sig.r.top-c.r.top) < alto && sig.r.left-hueco < x1) x1=sig.r.left-hueco;
      const x0=c.r.right+hueco, y=c.r.top+alto*0.55;
      if(x1-x0 < alto) return;                        // no cabe una línea que se entienda
      const a=local(x0,y), b=local(x1,y), g=local(x1,y+alto*0.6);
      const d = tramos[i].abierto ? `M${a.x} ${a.y} L${b.x} ${b.y}` : `M${a.x} ${a.y} L${b.x} ${b.y} L${g.x} ${g.y}`;
      const unidad=Math.abs(local(0,alto).y-local(0,0).y);  // alto de la etiqueta, en unidades locales
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('class','corchete');
      path.setAttribute('d', d);
      path.setAttribute('stroke-width', unidad*0.06);
      c.et.appendChild(path);
    });
  }

  /* ---------- rótulos bajo cada compás ---------- */
  // rotulosBajo(root, filas): tras el render, escribe bajo cada compás sus
  // rótulos de texto, centrados sobre sus notas. filas[k] = [{texto, clase}]
  // para el compás k (una fila por elemento). Cada rótulo es un <text
  // class="rotulo …">: con `resp`, la máscara lo oculta hasta revelar.
  // No van como <harm> en el MEI a propósito: Verovio ensancha el compás
  // según el texto, así que unos rótulos de respuesta, aun ocultos, delatarían
  // cuál es diferente por su anchura (y no dejarían elegir la letra). La
  // página reserva el sitio de debajo con pageMarginBottom.
  function rotulosBajo(root, filas){
    if(!root || !root.querySelectorAll) return;
    const NS='http://www.w3.org/2000/svg';
    const medidas=Array.from(root.querySelectorAll('g.measure'));
    // una sola línea para todos: bajo lo más bajo del sistema (si cada rótulo
    // se pusiera bajo su compás, una plica larga lo descolgaría)
    let fondo=-Infinity, esp=180;
    try{
      medidas.forEach(m=>{ const b=m.getBBox(); fondo=Math.max(fondo, b.y+b.height); });
      const cab=root.querySelector('g.notehead'); if(cab) esp=cab.getBBox().height;   // ~ un espacio
    }catch(e){ return; }
    const y0=fondo+esp*2;
    medidas.forEach((m,k)=>{
      const f=filas[k]; if(!f || !f.length) return;
      const notas=Array.from(m.querySelectorAll('g.note')); if(!notas.length) return;
      try{
        const bb=notas.map(n=>n.getBBox());
        const x0=Math.min(...bb.map(b=>b.x)), x1=Math.max(...bb.map(b=>b.x+b.width));
        f.forEach((r,i)=>{
          const t=document.createElementNS(NS,'text');
          t.setAttribute('x',(x0+x1)/2); t.setAttribute('y',y0+i*esp*2.2);
          t.setAttribute('text-anchor','middle'); t.setAttribute('font-size',esp*1.9);
          t.setAttribute('class','rotulo '+(r.clase||''));
          t.textContent=r.texto;
          m.appendChild(t);
        });
      }catch(e){}
    });
  }

  // Rótulos ENTRE notas (Movimientos): cada uno, centrado entre dos notas
  // (ids de nota del MEI: desde, hasta), en la misma línea base que
  // rotulosBajo; con `corchete`, además, un corchete abierto hacia arriba que
  // abarca las dos. Si dos se solapan, el segundo baja a otra fila. La clase
  // `resp` va en el grupo (rótulo y corchete), y las de color, en el texto;
  // `paso` (1, 2…) lo deja para el modo por pasos de ejercicio().
  // Las filas dependen del ancho de cada texto: si la fuente aún no ha
  // llegado (la cursiva solo se pide al usarla), se mediría con la de
  // sustitución, más ancha; por eso se vuelven a colocar al cargar las fuentes.
  function rotulosEntre(root, items){
    const b=baseRotulos(root); if(!b || !items || !items.length) return;
    const {esp, NS, medida, caja}=b;
    const puestos=[];
    items.forEach(it=>{
      const a=caja(it.desde), z=caja(it.hasta); if(!a || !z) return;
      const cls=(it.clase||'').split(/\s+/).filter(Boolean), color=cls.filter(c=>c!=='resp').join(' ');
      const g=document.createElementNS(NS,'g');
      g.setAttribute('class','rotulo-entre '+cls.join(' '));
      if(it.paso) g.setAttribute('data-paso', it.paso);
      medida.appendChild(g);
      const xa=a.x+a.width/2, xz=z.x+z.width/2;
      const t=document.createElementNS(NS,'text');
      t.setAttribute('x',(xa+xz)/2); t.setAttribute('text-anchor','middle'); t.setAttribute('font-size',esp*1.9);
      t.setAttribute('class','rotulo '+color);
      t.textContent=it.texto;
      g.appendChild(t);
      let p=null;
      if(it.corchete){
        p=document.createElementNS(NS,'path');
        p.setAttribute('stroke-width',esp*0.16);
        p.setAttribute('class','corchete-rot '+color);
        g.insertBefore(p, t);
      }
      puestos.push({t, p, xa, xz});
    });
    const colocar=()=>{
      const filas=[];
      puestos.forEach(({t, p, xa, xz})=>{
        const xc=(xa+xz)/2;
        let w=0; try{ w=t.getBBox().width; }catch(e){}
        // lo que ocupa: el texto y, si lo hay, el corchete
        const x0=(p ? Math.min(xa, xc-w/2) : xc-w/2)-esp*0.6,
              x1=(p ? Math.max(xz, xc+w/2) : xc+w/2)+esp*0.6;
        let f=0; while(filas[f] && filas[f].some(([u,v])=>u<x1 && x0<v)) f++;
        (filas[f]=filas[f]||[]).push([x0,x1]);
        const y=b.fondo+esp*(p?3.6:2)+f*esp*3.4;
        t.setAttribute('y',y);
        if(p){ const yc=y-esp*2.1, h=esp*0.7; p.setAttribute('d',`M${xa} ${yc-h} V${yc} H${xz} V${yc-h}`); }
      });
    };
    colocar();
    if(document.fonts && document.fonts.status!=='loaded') document.fonts.ready.then(colocar);
  }
  // Rayas entre dos notas de una misma voz (Movimientos · Armónicos): de cabeza
  // a cabeza, recortadas para no tapar ninguna. rayas: [{de, a, clase, paso}].
  function lineasMovimiento(root, rayas){
    const b=baseRotulos(root); if(!b || !rayas || !rayas.length) return;
    const {esp, NS, medida, caja}=b;
    rayas.forEach(r=>{
      const a=caja(r.de), z=caja(r.a); if(!a || !z) return;
      const x1=a.x+a.width/2, y1=a.y+a.height/2, x2=z.x+z.width/2, y2=z.y+z.height/2;
      const dx=x2-x1, dy=y2-y1, l=Math.hypot(dx,dy)||1, c=Math.min(esp*0.9, l*0.3);
      const ln=document.createElementNS(NS,'line');
      ln.setAttribute('x1',x1+dx*c/l); ln.setAttribute('y1',y1+dy*c/l);
      ln.setAttribute('x2',x2-dx*c/l); ln.setAttribute('y2',y2-dy*c/l);
      ln.setAttribute('stroke-width',esp*0.28);
      ln.setAttribute('class','raya '+(r.clase||''));
      if(r.paso) ln.setAttribute('data-paso', r.paso);
      medida.appendChild(ln);
    });
  }
  // Lo común a los rótulos entre notas y las rayas: el fondo del sistema, el
  // tamaño de una cabeza de nota (≈ un espacio) y la caja de una nota por id.
  function baseRotulos(root){
    if(!root || !root.querySelectorAll) return null;
    const medida=root.querySelector('g.measure'); if(!medida) return null;
    let fondo=-Infinity, esp=180;
    try{
      root.querySelectorAll('g.measure').forEach(m=>{ const b=m.getBBox(); fondo=Math.max(fondo, b.y+b.height); });
      const cab=root.querySelector('g.notehead'); if(cab) esp=cab.getBBox().height;
    }catch(e){ return null; }
    const caja=id=>{
      const g=root.querySelector('#'+CSS.escape(id)); if(!g) return null;
      try{ return (g.querySelector('g.notehead')||g).getBBox(); }catch(e){ return null; }
    };
    return {fondo, esp, NS:'http://www.w3.org/2000/svg', medida, caja};
  }

  /* ---------- líneas adicionales de notas ocultas ---------- */
  // Verovio dibuja las líneas adicionales por pentagrama (g.ledgerLines.above
  // | .below, un <path> por línea), FUERA de la nota: ocultar una nota (clase
  // `resp`) dejaría sus líneas a la vista. Aquí, tras el render, cada línea
  // que solo necesitan notas ocultas recibe también la clase `resp`. Una
  // línea la necesita una nota que solapa en x y cuyo centro está en ella o
  // más allá (encima, en las de arriba; debajo, en las de abajo).
  function lineasAdicionales(root){
    if(!root || !root.querySelectorAll) return;
    root.querySelectorAll('g.ledgerLines').forEach(g=>{
      const staff=g.closest('g.staff'); if(!staff) return;
      const arriba=g.classList.contains('above');
      const notas=Array.from(staff.querySelectorAll('g.note')).map(n=>{
        try{
          const b=(n.querySelector('g.notehead')||n).getBBox();
          return {x0:b.x, x1:b.x+b.width, cy:b.y+b.height/2, tol:b.height*0.25, oculta:!!n.closest('.resp')};
        }catch(e){ return null; }
      }).filter(Boolean);
      g.querySelectorAll('path').forEach(p=>{
        const m=(p.getAttribute('d')||'').match(/M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*L\s*(-?[\d.]+)/);
        if(!m) return;
        const x0=+m[1], y=+m[2], x1=+m[3];
        const usan=notas.filter(n=>n.x0<x1 && n.x1>x0 && (arriba ? n.cy<=y+n.tol : n.cy>=y-n.tol));
        if(usan.length && usan.every(n=>n.oculta)) p.classList.add('resp');
      });
    });
  }

  /* ---------- la página de ejercicio (Modelo-ejercicios.md §2) ---------- */
  // ejercicio(cfg) monta lo común a todas las consignas: nivel, generación,
  // render, revelado y audio. La página solo aporta su marcado (cabecera,
  // .pregunta, #notation, #answer, botones) y estas funciones:
  //   maxNivel   número de niveles del core (0 o ausente: sin niveles)
  //   generar(nivel) → instancia
  //   mei(inst)  → MEI COMPLETO: lo que es respuesta lleva @type "resp" (y lo
  //              que solo se ve antes de revelar, "preg"); Verovio vuelca el
  //              @type como clase y comun.css lo oculta según el estado
  //   trasRender(root, inst)   apilarCifras, circularGrados…  (opcional)
  //   respuesta(inst) → {idDeElemento: html}: se escribe al generar, oculta,
  //              para que el panel ocupe ya su sitio
  //   audio(inst, revelado) → [{midi, at, dur}]
  //   sonarAlRevelar  vuelve a tocar al revelar (con lo que se añada)
  //   verovio    opciones de initVerovio
  //   pasos(inst) → n   modo POR PASOS (opcional; la página pone un botón
  //              #btnPaso, «Siguiente»): cada pulsación muestra lo de un paso
  //              más —los elementos `resp` con data-paso ≤ el paso reciben
  //              `visto`— y, con el último, revela. «Respuesta» los muestra todos.
  //   audioPaso(inst, k) → [{midi, at, dur}]   lo que suena al mostrar el paso k
  // Revelar no vuelve a dibujar nada: pone la clase `revelado` en <body>. Así
  // la partitura y el panel no se mueven (Modelo-ejercicios.md §2.4).
  // El texto de cada nivel sale de curriculum-data.js (fuente única), que la
  // página carga antes que este fichero; ?nivel=N fija el nivel inicial.
  function ejercicio(cfg){
    const body=document.body;
    body.classList.add('mascara');
    const niveles=nivelesDelCurriculo();
    const max=cfg.maxNivel||0;
    let tk=null, inst=null, paso=0;
    let nivel=Math.min(Math.max(parseInt(new URLSearchParams(location.search).get('nivel'),10)||1, 1), max||1);

    function render(){
      if(!tk || !inst) return;
      const root=$('notation');
      tk.loadData(cfg.mei(inst));
      root.innerHTML=tk.renderToSVG(1);
      if(cfg.trasRender) cfg.trasRender(root, inst);
      lineasAdicionales(root);
      marcarPasos();
    }
    // modo por pasos: lo de los pasos ya mostrados, visible (clase `visto`)
    function marcarPasos(){
      if(!cfg.pasos) return;
      $('notation').querySelectorAll('[data-paso]').forEach(el=>el.classList.toggle('visto', +el.dataset.paso<=paso));
      const b=$('btnPaso'); if(b) b.disabled = !inst || paso>=cfg.pasos(inst);
    }
    function avanzar(){
      if(!inst || !cfg.pasos) return;
      const n=cfg.pasos(inst);
      if(paso>=n) return;
      paso++;
      marcarPasos();
      if(cfg.audioPaso) tocar(cfg.audioPaso(inst, paso)).catch(()=>audioNoDisponible($('btnListen')));
      if(paso>=n) revelar();
    }
    async function sonar(){
      if(!inst) return;
      try{ await tocar(cfg.audio(inst, body.classList.contains('revelado'))); }
      catch(e){ audioNoDisponible($('btnListen')); }
    }
    function nuevo(){
      inst=cfg.generar(nivel);
      paso=0;
      body.classList.remove('revelado');
      const r=cfg.respuesta(inst)||{};
      Object.keys(r).forEach(id=>{ const el=$(id); if(el) el.innerHTML=r[id]; });
      $('btnReveal').disabled=false;
      pintarNivel();
      render();
      sonar();
    }
    function revelar(){
      if(!inst || body.classList.contains('revelado')) return;
      body.classList.add('revelado');
      $('btnReveal').disabled=true;
      if(cfg.pasos){ paso=cfg.pasos(inst); marcarPasos(); }
      if(cfg.sonarAlRevelar) sonar();
    }

    // Selector de nivel en la cabecera (en .level) y su descripción bajo la
    // partitura (#nivelDesc). Sin niveles, no aparece ninguno de los dos.
    const caja=document.querySelector('header .level');
    function pintarNivel(){
      if(!caja) return;
      caja.querySelectorAll('button.niv').forEach(b=>b.setAttribute('aria-pressed', +b.dataset.n===nivel));
      const desc=$('nivelDesc');
      if(desc) desc.innerHTML = max>1 && niveles[nivel-1] ? `<b>Nivel ${nivel}.</b> ${niveles[nivel-1]}` : '';
    }
    if(caja){
      if(max>1){
        caja.innerHTML='<span class="niv-rotulo">Nivel</span>'
          + Array.from({length:max},(_,i)=>`<button type="button" class="niv" data-n="${i+1}" title="${esc(niveles[i]||'')}">${i+1}</button>`).join('');
        caja.setAttribute('role','group');
        caja.addEventListener('click', e=>{
          const b=e.target.closest('button.niv'); if(!b) return;
          detener();
          nivel=+b.dataset.n;
          const u=new URL(location.href); u.searchParams.set('nivel', nivel);
          history.replaceState(null, '', u);
          nuevo();
        });
      }else caja.style.display='none';
    }

    // «Oír» (Modelo-ejercicios.md §1.3): si la consigna lo admite (`oir:true` en
    // curriculum-data.js), un conmutador al final de las acciones. Activo, pone
    // `oir` en <body>: comun.css oculta la partitura hasta revelar y muestra el
    // aviso «Escucha». Se mantiene de un ejercicio al siguiente y va en la URL
    // (?oir=1), como el nivel. No genera otro ejercicio: solo cambia la vista.
    const pagina=deEstaPagina();
    if(pagina && pagina.consigna.oir){
      const card=document.querySelector('.score-card');
      if(card){
        const aviso=document.createElement('div');
        aviso.className='oir-aviso';
        aviso.innerHTML=ICONO_OIDO+'<span>Escucha</span>';
        card.appendChild(aviso);
      }
      const b=document.createElement('button');
      b.id='btnOir'; b.type='button'; b.className='toggle';
      b.title='Solo audio: la partitura aparece al revelar';
      b.innerHTML=`<span class="ic">${ICONO_OIDO}</span>Oír`;
      const sep=document.createElement('div'); sep.className='sep';
      $('btnSimilar').after(sep, b);
      const poner=on=>{
        body.classList.toggle('oir', on);
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
        const u=new URL(location.href);
        if(on) u.searchParams.set('oir','1'); else u.searchParams.delete('oir');
        history.replaceState(null, '', u);
      };
      b.onclick=()=>poner(!body.classList.contains('oir'));
      poner(new URLSearchParams(location.search).get('oir')==='1');
    }

    $('btnReveal').onclick=revelar;
    $('btnSimilar').onclick=()=>nuevo();
    if(cfg.pasos && $('btnPaso')) $('btnPaso').onclick=avanzar;
    $('btnListen').onclick=sonar;

    nuevo();                               // texto y botones funcionan ya, sin esperar a Verovio
    initVerovio(cfg.verovio||{}, t=>{ tk=t; render(); },
      msg=>{ $('notation').innerHTML='<span class="ph">'+msg+'</span>'; });
  }

  // La familia y la consigna de esta página en curriculum-data.js (se buscan
  // por nombre de fichero, como hace el menú con #de=). null si no está o si
  // la página no ha cargado curriculum-data.js.
  function deEstaPagina(){
    let C; try{ C=CURRICULO; }catch(e){ return null; }    // const global de curriculum-data.js
    const fichero=location.pathname.split('/').pop();
    for(const curso of C.cursos) for(const ud of curso.unidades) for(const fam of ud.familias)
      for(const c of fam.consignas)
        if(c.url && c.url.split('/').pop()===fichero) return {ud, fam, consigna:c};
    return null;
  }
  // los niveles, de la consigna si los tiene (cuando no todas las de la
  // familia tienen niveles); si no, de la familia
  function nivelesDelCurriculo(){ const d=deEstaPagina(); return (d && (d.consigna.niveles || d.fam.niveles)) || []; }

  /* ---------- enlace a los apuntes (Modelo-ejercicios.md §3) ---------- */
  // El primer epígrafe que cita la consigna (`apuntes` en curriculum-data.js)
  // se enlaza con un botón junto a «Ayuda»: «Apuntes · 1.2 Cifrado de
  // grados». El título y si la unidad está publicada los da enlaces.js, que
  // genera la construcción de los apuntes en el sitio montado; sin él (en
  // local, o con la unidad sin publicar) no se pinta nada.
  function enlaceApuntes(){
    const d=deEstaPagina(), ayuda=document.querySelector('details.ayuda');
    const ancla=d && d.consigna.apuntes && d.consigna.apuntes[0];
    if(!ancla || !ayuda) return;
    const s=document.createElement('script');
    s.src='../../apuntes/enlaces.js';
    s.onload=()=>{
      const A=global.ARMONIA_APUNTES, titulo=A && A.epigrafes && A.epigrafes[ancla];
      const [unidad, id]=ancla.split('#');
      if(!titulo || !A.unidades.includes(unidad)) return;
      const a=document.createElement('a');
      a.className='apuntes-enlace';
      a.href=`../../apuntes/${unidad}.html#${encodeURIComponent(id)}`;
      a.title=`Apuntes · ${titulo}`;
      // «1.2 Cifrado de grados»: en el móvil solo se ve el número (comun.css)
      const m=/^(\d+(?:\.\d+)*)\s+(.*)$/.exec(titulo);
      const texto = m ? `<span class="ap-num">${esc(m[1])}</span><span class="ap-resto"> ${esc(m[2])}</span>` : esc(titulo);
      a.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>'
        + `<span>Apuntes · ${texto}</span>`;
      // fila común con «Ayuda»: el enlace delante; la ayuda, al abrirse, baja
      // a su propia línea (comun.css, .pie-ej)
      const fila=document.createElement('div');
      fila.className='pie-ej';
      ayuda.parentNode.insertBefore(fila, ayuda);
      fila.append(a, ayuda);
    };
    document.head.appendChild(s);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enlaceApuntes);
  else enlaceApuntes();
  // auriculares (el mismo icono que la audición en el menú)
  const ICONO_OIDO='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>';
  const esc=s=>String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* ---------- audio ---------- */
  let piano=null;
  async function getPiano(){
    if(!piano){
      const ac=new (global.AudioContext||global.webkitAudioContext)();
      piano=await global.Soundfont.instrument(ac,'acoustic_grand_piano');
    }
    try{ await piano.context.resume(); }catch(e){}   // desbloquea audio tras gesto de usuario
    return piano;
  }

  // tocar([{midi, at, dur}, …]): programa las notas relativas a "ahora".
  // at en segundos (0 por defecto), dur en segundos (1.6 por defecto).
  // Lanza si el audio no está disponible: la página decide qué botón anular.
  // Si el contexto sigue suspendido (móvil: aún no ha habido un gesto del
  // usuario), no encola nada y vuelve en silencio: si se encolaran, al
  // primer toque sonarían de golpe todas las acumuladas. La página no
  // distingue este caso del normal; el usuario pulsa «Escuchar» y suena.
  // Cada llamada es una reproducción completa: antes de empezar se corta la
  // anterior (note off general), para que no se superpongan el bajo y la
  // solución, ni un ejercicio y el siguiente.
  let sonando=[];            // notas de la reproducción en curso (sonando o programadas)
  async function tocar(notas){
    detener();
    const p=await getPiano();
    if(p.context.state!=='running') return;
    detener();               // por si otra llamada se coló mientras cargaba el piano
    const now=p.context.currentTime;
    sonando = notas.map(n=>p.play(n.midi, now+(n.at||0), {duration:(n.dur!=null?n.dur:1.6)})).filter(Boolean);
  }
  // Para las notas de la reproducción en curso, una a una: piano.stop() recorre
  // TODAS las de la sesión (también las acabadas) y un error en una dejaría
  // sonando las demás.
  function detener(){
    sonando.forEach(nodo=>{ try{ nodo.stop(); }catch(e){} });
    sonando=[];
  }
  // Respuesta, Otro (#btnSimilar), Más difícil y el selector de nivel cortan
  // siempre el audio, toque o no la página algo después (fase de captura:
  // antes que el manejador de la página).
  document.addEventListener('click', e=>{
    if(e.target.closest && e.target.closest('#btnReveal, #btnSimilar, #btnHarder, button.niv')) detener();
  }, true);

  function audioNoDisponible(btn){ btn.textContent='(sin audio)'; btn.disabled=true; }

  /* ---------- vuelta al menú ---------- */
  // El enlace «← Menú» de cada página apunta a ../index.html a secas. Aquí
  // se le añade el nombre de fichero de esta página; el menú lo busca en
  // curriculum-data.js y abre la pestaña de curso y la unidad de las que
  // salió el ejercicio. Así ninguna página repite a qué curso pertenece:
  // el dato sigue estando solo en el curículo.
  function marcarEnlaceMenu(){
    const a = document.querySelector('a.back');
    if(!a) return;
    const fichero = location.pathname.split('/').pop();
    if(!fichero) return;
    a.href = a.getAttribute('href').split('#')[0] + '#de=' + encodeURIComponent(fichero);
  }
  if(document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', marcarEnlaceMenu);
  else marcarEnlaceMenu();

  global.ArmoniaEj = { $, initVerovio, apilarCifras, circularGrados, corchetesTramo, lineasAdicionales, rotulosBajo, rotulosEntre, lineasMovimiento,
                       ejercicio, tocar, detener, audioNoDisponible };
})(window);
