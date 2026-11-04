#!/usr/bin/env node
/* ============================================================
   comprobar-fichas.js — verificador de las fichas de ejercicios
   ------------------------------------------------------------
   Uso:  node herramientas/comprobar-fichas.js [ficha…] [--detalle]
         node herramientas/comprobar-fichas.js --modelo c3u1-repaso [ficha…]
         (sin fichas, todas las de fichas/; una ficha es su nombre,
         «c3u1-f3b», o su ruta. Con --modelo y sin fichas, solo lee
         el modelo, de fichas/modelos/, y dice qué condiciones pone)

   Lee cada ficha (fichas/cXuY-fN.md) y comprueba su material con
   los comprobadores de la app, que aplican Minimos-conduccion.md:
   conduccion-check.js y cuatro-voces-check.js. Dos cosas, según el
   tipo de ejercicio (curriculum/Ejercicios-papel.md):

   · que la solución no tenga faltas que no se pretenden;
   · que lo anotado sea lo que hay: la falta escrita es la que
     encuentra el comprobador, la disposición pedida es la de la
     solución, el grado y la cifra son los del bajo…

   Un tipo sin comprobación sale como «sin comprobar», nunca como
   bien. Cada discrepancia (✗) hace que el programa acabe con error;
   los avisos (!) no: son cosas que conviene mirar, pero que pueden
   ser a propósito.

   Además, el diseño (ver «perfiles y modelos»): una variante
   (c3u1-f3b) se compara con su original (c3u1-f3), y con --modelo,
   cada ficha con las condiciones del modelo.

   Las notas las lee el parser de la app (mini-lilypond-parser.js);
   aquí solo se quitan y se guardan los comandos de las fichas
   (\falta, \rotulo, \analitico…), que van DELANTE de la nota a la
   que acompañan (etiquetas.ily), salvo en una melodía, donde los
   corchetes (\falta, \mejorable … \stopGroup) van detrás.

   Plan: informes/2026-10-29-plan-fichas-generadas.md, §2.1–2.2.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const FICHAS = path.join(RAIZ, 'fichas');
const APP = path.join(RAIZ, '..', 'app', 'public');
const ML = require(path.join(APP, 'ejercicios', 'mini-lilypond-parser.js'));
const K  = require(path.join(APP, 'ejercicios', 'conduccion-check.js'));
const CK = require(path.join(APP, 'ejercicios', 'cuatro-voces-check.js'));
const CV = require(path.join(APP, 'ejercicios', 'cuatro-voces-core.js'));
const EN = require(path.join(APP, 'ejercicios', 'enlace-core.js'));
const TON = require(path.join(APP, 'tonalidades.js'));

const ROLES4 = ['soprano', 'contralto', 'tenor', 'bajo'];
const INICIAL = { S: 'soprano', A: 'contralto', T: 'tenor', B: 'bajo' };
const LETRA_VOZ = { soprano: 'S', contralto: 'A', tenor: 'T', bajo: 'B' };
const LETRAS = 'CDEFGAB';
const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const CIRCULOS = ['①', '②', '③', '④', '⑤', '⑥', '⑦'];
const mod = (a, n) => ((a % n) + n) % n;

/* ---------- lectura de la ficha ---------- */

// Los mismos bloques que construir.py: `::: {.ejercicio …}` con uno o
// varios ```lilypond dentro (varios = una serie, apartados a), b)…).
const RE_EJERCICIO = /^:::+[ \t]*\{\.ejercicio\b([^}]*)\}[ \t]*\n([\s\S]*?)^:::+[ \t]*$/gm;
const RE_LILYPOND = /^```[ \t]*lilypond([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm;
// En un modelo, en lugar del material, sus condiciones (ver «perfiles y modelos»).
const RE_CONDICIONES = /^```[ \t]*condiciones([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm;
const RE_ATRIBUTO = /([\w-]+)="([^"]*)"/g;
const atributos = s => Object.fromEntries([...s.matchAll(RE_ATRIBUTO)].map(m => [m[1], m[2]]));
// Líneas «clave: valor» (la cabecera YAML, un bloque de condiciones).
const claves = s => Object.fromEntries(s.split('\n').map(l => l.match(/^([^:#][^:]*?)\s*:\s*(.*?)\s*$/))
  .filter(Boolean).map(m => [m[1], m[2].replace(/^"(.*)"$/, '$1')]));

function leerFicha(fichero) {
  const texto = fs.readFileSync(fichero, 'utf8').replace(/\r/g, '')
    .replace(/<!-- guion:inicio -->[\s\S]*?<!-- guion:fin -->/, '');
  const cab = texto.match(/^---\n([\s\S]*?)\n---/);
  const ejercicios = [];
  for (const m of texto.matchAll(RE_EJERCICIO)) {
    const attr = atributos(m[1]);
    const bloques = [...m[2].matchAll(RE_LILYPOND)];
    const condiciones = [...m[2].matchAll(RE_CONDICIONES)];
    const nota = m[2].replace(RE_LILYPOND, '').replace(RE_CONDICIONES, '').trim();
    ejercicios.push({
      attr, nota,
      apartados: bloques.map(b => ({ attr: { ...attr, ...atributos(b[1]) }, codigo: b[2] }))
        .concat(condiciones.map(b => ({ attr: { ...attr, ...atributos(b[1]) }, condiciones: claves(b[2]) }))),
    });
  }
  ejercicios.cabecera = cab ? claves(cab[1]) : {};
  return ejercicios;
}

// Las variables del bloque: `soprano = { … }`, `soprano = \analitico { … }`.
// Las que no son música (`solucionPosible = ##t`, `alternativas = "…"`), fuera.
function variables(codigo) {
  const out = {};
  const re = /^([a-zA-Z]+)\s*=\s*/gm;
  let m;
  while ((m = re.exec(codigo))) {
    let i = re.lastIndex, j = codigo.indexOf('{', i);
    if (j < 0) break;
    if (!/^(\\analitico\s*)?$/.test(codigo.slice(i, j).trim())) continue;
    let prov = 0, k = j;
    for (; k < codigo.length; k++) {
      if (codigo[k] === '{') prov++;
      else if (codigo[k] === '}' && --prov === 0) break;
    }
    out[m[1]] = codigo.slice(i, k + 1);
    re.lastIndex = k + 1;
  }
  return out;
}

// Fichas en LilyPond → fichas en piezas: cadenas, comandos, llaves, notas.
function piezas(src) {
  const out = [];
  const re = /"((?:[^"\\]|\\.)*)"|\\([a-zA-Z-]+)|(<<|>>|[{}])|(<[^>]*>[\d.]*~?)|([^\s{}"\\<>]+)/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[1] !== undefined) out.push({ t: 'cadena', v: m[1] });
    else if (m[2]) out.push({ t: 'cmd', v: m[2] });
    else if (m[3]) out.push({ t: 'llave', v: m[3] });
    else if (m[4]) out.push({ t: 'nota', v: m[4] });
    else out.push({ t: /^[a-g]/.test(m[5]) ? 'nota' : 'otro', v: m[5] });
  }
  return out;
}

// Comandos de ficha que acompañan a una nota, con su número de cadenas.
const ETIQUETAS = { falta: 2, mejorable: 1, grado: 1, rotulo: 1, encima: 1, gradoBajo: 1,
                    acorde: 1, figuras: 1, stopGroup: 0, rotuloAnalisis: 2 };
const DETRAS = new Set(['falta', 'mejorable', 'stopGroup']);   // en una melodía

// Una voz → lista de eventos {altura(s), etiquetas, solucion, modelo}.
function leerVoz(src, opciones = {}) {
  const ps = piezas(src), eventos = [];
  let pendientes = [], modelo = false, prof = 0;
  const analiticoHasta = [];               // profundidades de llave dentro de \analitico
  let analiticoUna = false;                // \analitico sobre una sola nota o acorde
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    if (p.t === 'llave') {
      if (p.v === '{') {
        prof++;
        if (analiticoUna) { analiticoHasta.push(prof); analiticoUna = false; }
      } else {
        if (analiticoHasta[analiticoHasta.length - 1] === prof) analiticoHasta.pop();
        prof--;
      }
      continue;
    }
    if (p.t === 'cmd') {
      const n = p.v;
      if (n === 'analitico') { analiticoUna = true; continue; }
      if (n === 'modelo') { modelo = true; continue; }
      if (n === 'finModelo') { modelo = false; continue; }
      if (n in ETIQUETAS) {
        const args = [];
        while (args.length < Math.max(ETIQUETAS[n], 2) && ps[i + 1] && ps[i + 1].t === 'cadena')
          args.push(ps[++i].v);
        const et = { cmd: n, args, modelo };
        if (opciones.melodia && DETRAS.has(n) && eventos.length) eventos[eventos.length - 1].etiquetas.push(et);
        else pendientes.push(et);
        continue;
      }
      // \bar "…", \break, \time 3/4…: sin contenido para el comprobador
      while (ps[i + 1] && (ps[i + 1].t === 'cadena' || ps[i + 1].t === 'otro')) i++;
      continue;
    }
    if (p.t === 'nota') {
      const leida = ML.parseVoice(p.v);
      if (leida.errors.length || !leida.events.length) throw new Error(`no leo la nota «${p.v}»`);
      const ev = leida.events[0];
      const alturas = (ev.type === 'chord' ? ev.notes : [ev])
        .map(q => CV.altura(q.octave * 7 + LETRAS.indexOf(q.letter.toUpperCase()), q.alter));
      eventos.push({ alturas, altura: alturas[0], etiquetas: pendientes, texto: p.v,
                     solucion: analiticoUna || analiticoHasta.length > 0,
                     // \modelo … \finModelo suele cerrarse antes de la nota (tras sus etiquetas)
                     modelo: modelo || pendientes.some(et => et.modelo) });
      pendientes = [];
      analiticoUna = false;
    }
  }
  return eventos;
}
const etiqueta = (ev, cmd) => { const e = ev.etiquetas.find(x => x.cmd === cmd); return e ? e.args : null; };

// `respuestas = { … }`: una entrada por paso, \paso "…", \paso \markup …,
// \falta "…", \sinFalta, \sinParalelas.
function leerRespuestas(src) {
  const ps = piezas(src), out = [];
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    if (p.t !== 'cmd') continue;
    if (['paso', 'falta', 'sinFalta', 'sinParalelas'].includes(p.v)) {
      out.push({ cmd: p.v, textos: [], parejas: [] });
      continue;
    }
    const actual = out[out.length - 1];
    if ((p.v === 'pareja' || p.v === 'prohibida') && actual) {
      actual.parejas.push({ prohibida: p.v === 'prohibida', voces: ps[i + 1].v, intervalo: ps[i + 2].v });
      i += 2;
    }
  }
  // las cadenas sueltas tras \paso o \falta: su texto
  let k = -1;
  for (const p of ps) {
    if (p.t === 'cmd' && ['paso', 'falta', 'sinFalta', 'sinParalelas'].includes(p.v)) k++;
    else if (p.t === 'cmd' && (p.v === 'pareja' || p.v === 'prohibida')) k += 0;
    else if (p.t === 'cadena' && k >= 0 && !out[k].parejas.length) out[k].textos.push(p.v);
  }
  return out;
}

/* ---------- utilidades musicales ---------- */

const tonalidad = nombre => {
  const t = TON.porNombre(nombre);
  if (!t) throw new Error(`tonalidad desconocida: «${nombre}»`);
  return t;
};
const nombreNota = p => p.letter + CV.SYM(p.alter);
const midi = K.midi;
// grado (1–7) de una letra en la tonalidad
const gradoDe = (key, letra) => mod(LETRAS.indexOf(letra) - LETRAS.indexOf(key.tonic), 7) + 1;

// Tríada sobre el bajo: la fundamental es la letra que hace que las cuatro
// voces sean F, 3.ª y 5.ª. Devuelve {raiz (letra), clases (0/2/4 por voz), inv}.
function triada(voces) {
  const idx = voces.map(p => LETRAS.indexOf(p.letter));
  for (let r = 0; r < 7; r++) {
    const cl = idx.map(x => mod(x - r, 7));
    if (cl.every(c => [0, 2, 4].includes(c)) && [0, 2, 4].every(c => cl.includes(c)))
      return { raiz: LETRAS[r], clases: cl, inv: [0, 2, 4].indexOf(cl[cl.length - 1]) };
  }
  return null;
}
const duplicada = t => ({ 0: 'F', 2: '3.ª', 4: '5.ª' })[[0, 2, 4].find(c => t.clases.filter(x => x === c).length === 2)];
const disposicion = (s, t) => s.abs - t.abs < 7 ? 'cerrada' : s.abs - t.abs > 7 ? 'abierta' : 'mixta';
const unisonos = voces => new Set(voces.map(midi)).size < voces.length;
const fmtFalta = (f, roles) => `${f.regla} ${f.texto}`;

/* ---------- comprobaciones por tipo ---------- */
// Cada una recibe el apartado y devuelve {lineas, fallos, avisos, perfil}:
// una línea por acorde o paso (para --detalle), lo que no cuadra y el
// perfil del ejercicio, su diseño sin el material: cuántos acordes, qué
// faltas o disposiciones de cada clase… (ver «perfiles y modelos»).

function informe() {
  const r = { lineas: [], fallos: [], avisos: [], perfil: {} };
  r.mal = (donde, txt) => r.fallos.push(`${donde}: ${txt}`);
  r.ojo = (donde, txt) => r.avisos.push(`${donde}: ${txt}`);
  return r;
}

// Voces a cuatro (o menos) desde las variables del bloque, por nombre.
function vocesDe(vars, nombres) {
  const presentes = nombres.filter(n => vars[n]);
  const voces = presentes.map(n => leerVoz(vars[n]));
  const n = voces[0].length;
  if (voces.some(v => v.length !== n))
    throw new Error(`las voces no tienen las mismas notas (${presentes.map((p, i) => p + ' ' + voces[i].length).join(', ')})`);
  return { roles: presentes, voces };
}
const alturasEn = (voces, k) => voces.map(v => v[k].altura);
// Recuento de clases: ['cerrada', 'mixta', 'cerrada'] → {cerrada: 2, mixta: 1}.
const cuenta = lista => lista.reduce((o, x) => (o[x] = (o[x] || 0) + 1, o), {});

// Reglas de un acorde suelto (Disposición): N1, N2, N3, P2.
const faltasAcorde = (vs, roles) =>
  K.comprobar(vs.map(p => [p]), { roles, reglas: ['N1', 'N2', 'N3', 'P2'], superposicion: false });

// La duplicación de la mixta, por el grado (Minimos §4): la 3.ª en II y VI.
const dupMixta = grado => (grado === 2 || grado === 6) ? '3.ª' : '5.ª';

const REGLA_DISPOSICION = { '> 8.ª': 'N2', 'cruce': 'N3', 'tesitura': 'N1', 'unísono': 'P2' };

function faltasDisposicion(ap) {
  const r = informe(), key = tonalidad(ap.attr.tono);
  const { roles, voces } = vocesDe(variables(ap.codigo), ROLES4);
  const pf = { faltas: [], disposiciones: [] };
  voces[0].forEach((_, k) => {
    const vs = alturasEn(voces, k), donde = `acorde ${k + 1}`;
    const fs = faltasAcorde(vs, roles), t = triada(vs);
    const falta = etiqueta(voces[3][k], 'falta'), grado = etiqueta(voces[3][k], 'grado');
    if (falta) pf.faltas.push(falta.join(' '));
    else if (grado) pf.disposiciones.push(grado[0]);
    let hay;
    if (!t) r.mal(donde, 'no es una tríada completa en estado fundamental');
    else if (t.inv !== 0) r.mal(donde, 'el bajo no es la fundamental');
    if (unisonos(vs)) r.mal(donde, 'unísono entre dos voces');
    if (falta) {
      const regla = REGLA_DISPOSICION[falta[0]];
      const vsEsp = (falta[1] || '').split(/[–/]/).map(x => roles.indexOf(INICIAL[x]));
      if (!regla) r.mal(donde, `no reconozco la falta «${falta.join(' ')}»`);
      else if (fs.length !== 1 || fs[0].regla !== regla || fs[0].voces.join() !== vsEsp.join())
        r.mal(donde, `anotada «${falta.join(' ')}», encontrada: ${fs.map(f => fmtFalta(f)).join('; ') || 'ninguna'}`);
      hay = `${fs.map(f => f.regla).join(',')} ${falta.join(' ')}`;
    } else if (grado) {
      if (fs.length) r.mal(donde, `anotada «${grado[0]}», pero tiene: ${fs.map(f => fmtFalta(f)).join('; ')}`);
      const disp = disposicion(vs[0], vs[2]);
      if (grado[0] !== disp) r.mal(donde, `anotada «${grado[0]}», es ${disp}`);
      if (t) {
        const dup = duplicada(t), g = gradoDe(key, t.raiz);
        const esperada = disp === 'mixta' ? dupMixta(g) : 'F';
        if (dup !== esperada) r.mal(donde, `${disp} sobre ${ROMANOS[g - 1]} con la ${dup} duplicada (se espera la ${esperada})`);
      }
      hay = `${disp}, dup. ${t ? duplicada(t) : '?'}`;
    } else r.mal(donde, 'sin \\falta ni \\grado bajo el bajo');
    r.lineas.push(`${k + 1}. ${vs.map(nombreNota).join(' ').padEnd(16)} ${hay}`);
  });
  r.perfil = { acordes: voces[0].length, faltas: cuenta(pf.faltas), disposiciones: cuenta(pf.disposiciones) };
  return r;
}

function construirAcordes(ap) {
  const r = informe(), key = tonalidad(ap.attr.tono);
  const mixta = (ap.attr.pide || '').split(/\s+/).includes('mixta');
  const { roles, voces } = vocesDe(variables(ap.codigo), ROLES4);
  voces[0].forEach((_, k) => {
    const vs = alturasEn(voces, k), donde = `acorde ${k + 1}`;
    const fs = faltasAcorde(vs, roles), t = triada(vs);
    const rot = etiqueta(voces[0][k], 'rotulo');
    if (fs.length) r.mal(donde, fs.map(f => fmtFalta(f)).join('; '));
    if (unisonos(vs)) r.mal(donde, 'unísono entre dos voces');
    if (!t || t.inv !== 0) { r.mal(donde, 'no es una tríada completa sobre la fundamental'); return; }
    const disp = disposicion(vs[0], vs[2]), dup = duplicada(t), g = gradoDe(key, t.raiz);
    const m = rot && rot[0].match(/^(cerrada|abierta|mixta)(?: \((3\.ª|5\.ª)\))?$/);
    if (!m) r.mal(donde, `no reconozco el rótulo «${rot ? rot[0] : ''}»`);
    else {
      if (m[1] !== disp) r.mal(donde, `pedida «${m[1]}», es ${disp}`);
      const esperada = disp !== 'mixta' ? 'F' : (m[2] || dupMixta(g));
      if (dup !== esperada) r.mal(donde, `${disp} con la ${dup} duplicada (se pide la ${esperada})`);
      if (disp === 'mixta' && !mixta) r.mal(donde, 'mixta en un ejercicio sin pide="mixta"');
      if (disp === 'mixta' && m[2] && m[2] !== dupMixta(g))
        r.ojo(donde, `mixta sobre ${ROMANOS[g - 1]} con la ${m[2]} (Minimos §4: la ${dupMixta(g)})`);
    }
    if (key.mode === 'minor' && (g === 2 || g === 3)) r.ojo(donde, `${ROMANOS[g - 1]} en estado fundamental en menor`);
    r.lineas.push(`${k + 1}. ${vs.map(nombreNota).join(' ').padEnd(16)} ${ROMANOS[g - 1].padEnd(4)}${disp}, dup. ${dup}`);
  });
  r.perfil = {
    acordes: voces[0].length,
    disposiciones: cuenta(voces[0].map(e => (etiqueta(e, 'rotulo') || ['?'])[0])),
    'primer acorde': voces[0][0].solucion ? 'sin dar' : 'dado',
  };
  return r;
}

// Grados y cifrado: del bajo y sus cifras sale el acorde; con él se
// comprueban el grado del bajo, el romano, el americano y las notas.
function gradosBajoCifrado(ap) {
  const r = informe(), key = tonalidad(ap.attr.tono);
  const vars = variables(ap.codigo);
  const abajo = leerVoz(vars.abajo), arriba = leerVoz(vars.arriba);
  if (abajo.length !== arriba.length) throw new Error('arriba y abajo no tienen las mismas notas');
  const firma = CV.keysigAlters(key.sig);
  let invertidos = 0;
  const acordes = [];
  abajo.forEach((ev, k) => {
    const donde = `acorde ${k + 1}`, bajo = ev.altura;
    const cifras = (etiqueta(ev, 'figuras') || [''])[0].trim();
    // cifras → inversión y alteraciones por intervalo («♯» solo = la 3.ª)
    const toques = cifras ? cifras.split('/') : [];
    const nums = toques.map(c => +(c.replace(/[^\d]/g, '')) || 3);
    const inv = nums.includes(4) ? 2 : nums.includes(6) ? 1 : 0;
    const alterada = {};
    toques.forEach((c, i) => { const a = c.match(/[♯♭♮]/); if (a) alterada[nums[i]] = a[0]; });
    const sobre = inv === 0 ? [3, 5] : inv === 1 ? [3, 6] : [4, 6];
    const tonos = [bajo].concat(sobre.map(n => {
      const letra = LETRAS[mod(LETRAS.indexOf(bajo.letter) + n - 1, 7)];
      const a = alterada[n];
      return { letter: letra, alter: a === '♯' ? firma[letra] + 1 : a === '♭' ? firma[letra] - 1 : a === '♮' ? 0 : firma[letra] };
    }));
    const raiz = tonos[[0, 2, 1][inv]];            // inv 0: el bajo; 1: la 6.ª; 2: la 4.ª
    const g = gradoDe(key, raiz.letter);
    // En estado fundamental, las cifras que lleve el bajo pasan al romano:
    // «♯» → «V♯» (la sensible), «5/3» o «5/♯» → «V5/3», «V5/♯» (el V tras
    // el 6/4 cadencial). Así la solución, que da el romano y no las cifras
    // del bajo, no las pierde.
    const romano = ROMANOS[g - 1] + (inv ? ['', '6', '6/4'][inv]
      : /^[♯♮♭]$/.test(cifras) || cifras.startsWith('5/') ? cifras : '');
    const semis = n => mod(midi(CV.altura(LETRAS.indexOf(n.letter) + 28, n.alter)) - midi(CV.altura(LETRAS.indexOf(raiz.letter) + 28, raiz.alter)), 12);
    const tercera = tonos.find(n => mod(LETRAS.indexOf(n.letter) - LETRAS.indexOf(raiz.letter), 7) === 2);
    const quinta = tonos.find(n => mod(LETRAS.indexOf(n.letter) - LETRAS.indexOf(raiz.letter), 7) === 4);
    const cal = { '4,7': '', '3,7': 'm', '3,6': '°', '4,8': '+' }[semis(tercera) + ',' + semis(quinta)];
    const americano = nombreNota(raiz) + (cal === undefined ? '?' : cal) + (inv ? '/' + nombreNota(bajo) : '');
    const gb = CV.SYM(bajo.alter - firma[bajo.letter]) + CIRCULOS[gradoDe(key, bajo.letter) - 1];
    // lo anotado
    const anot = { gradoBajo: etiqueta(ev, 'gradoBajo'), acorde: etiqueta(ev, 'acorde'), encima: etiqueta(arriba[k], 'encima') };
    if (!anot.gradoBajo || anot.gradoBajo[0] !== gb) r.mal(donde, `grado del bajo «${anot.gradoBajo}», es ${gb}`);
    if (!anot.acorde || anot.acorde[0].replace(/\s/g, '') !== romano) r.mal(donde, `acorde «${anot.acorde}», es ${romano}`);
    if (!anot.encima || anot.encima[0] !== americano) r.mal(donde, `americano «${anot.encima}», es ${americano}`);
    const escritas = arriba[k].alturas.map(nombreNota).sort().join(' ');
    if (escritas !== tonos.map(nombreNota).sort().join(' '))
      r.mal(donde, `acorde escrito ${escritas}, se espera ${tonos.map(nombreNota).join(' ')}`);
    // contra el modelo de acorde de la app (en menor, la armónica)
    const app = CV.acorde(key, { grado: g, inv });
    if (app.tones.map(nombreNota).sort().join() !== tonos.map(nombreNota).sort().join())
      r.ojo(donde, `${romano} con ${tonos.map(nombreNota).join(' ')}; en la app es ${app.americano} (${app.tones.map(nombreNota).join(' ')})`);
    if (inv === 2 && k === abajo.length - 1) r.ojo(donde, '6/4 al final');
    r.lineas.push(`${k + 1}. ${nombreNota(bajo).padEnd(3)} ${(cifras || '·').padEnd(4)} ${gb.padEnd(3)} ${romano.padEnd(6)} ${americano}`);
    if (inv) invertidos++;
    acordes.push(romano);
  });
  // repetidos: cuántas veces vuelve a salir un acorde ya visto (mismo grado
  // y cifrado, es decir, mismo bajo y cifras): I, I6, I6, I6 → 2. El I en
  // estado fundamental no cuenta: abrir y cerrar con él es lo normal (si
  // contara, una sola repetición permitida empujaría a acabar en V).
  const sinI = acordes.filter(a => a !== 'I');
  const repetidos = sinI.length - new Set(sinI).size;
  r.perfil = { acordes: abajo.length, invertidos, repetidos, modelo: abajo[0].modelo ? 'sí' : 'no' };
  return r;
}

// Melodía con corchetes: \falta "…" o \mejorable "…" en la primera nota,
// \stopGroup en la última. Cada corchete ha de cubrir una falta de su
// clase, y cada falta ha de estar dentro de un corchete.
function claseMelodica(et) {
  if (et.cmd === 'mejorable') return 'P9';
  const t = et.args[0] || '';
  return /aum|dism/.test(t) ? 'N12' : /suman/.test(t) ? 'N15' : /salto/.test(t) ? 'N13' : null;
}
function faltasMelodicas(ap) {
  const r = informe();
  const ev = leerVoz(variables(ap.codigo).melodia, { melodia: true });
  const corchetes = [], abiertos = [];
  ev.forEach((e, k) => e.etiquetas.forEach(et => {
    if (et.cmd === 'falta' || et.cmd === 'mejorable') abiertos.push({ ini: k, et, clase: claseMelodica(et) });
    else if (et.cmd === 'stopGroup' && abiertos.length) corchetes.push({ ...abiertos.shift(), fin: k });
  }));
  if (abiertos.length) r.mal('melodía', 'corchete sin \\stopGroup');
  const fs = K.comprobar([ev.map(e => e.altura)], { roles: ['soprano'], reglas: ['N12', 'N13', 'N15', 'P9'] });
  const usados = new Set();
  for (const c of corchetes) {
    const donde = `notas ${c.ini + 1}–${c.fin + 1}`;
    if (!c.clase) { r.mal(donde, `no reconozco «${c.et.args[0]}»`); continue; }
    const f = fs.find(f => f.regla === c.clase && f.evento > c.ini && f.evento <= c.fin);
    if (!f) r.mal(donde, `«${c.et.args[0]}» (${c.clase}), sin falta de esa clase dentro`);
    else usados.add(f);
    r.lineas.push(`${donde}: «${c.et.args[0]}» ${f ? '= ' + fmtFalta(f) : ''}`);
  }
  for (const f of fs) if (!usados.has(f)) r.mal(`nota ${f.evento + 1}`, `${fmtFalta(f)}, sin corchete`);
  r.perfil = { notas: ev.length, faltas: cuenta(corchetes.map(c => c.clase)) };
  return r;
}

const MOVIMIENTO = { 'dir.': 'directo', 'contr.': 'contrario', 'obl.': 'oblicuo', 'par.': 'paralelo' };
function movimientosArmonicos(ap) {
  const r = informe(), vars = variables(ap.codigo);
  const a = leerVoz(vars.superior).map(e => e.altura), b = leerVoz(vars.inferior).map(e => e.altura);
  const resp = leerRespuestas(vars.respuestas);
  if (resp.length !== a.length - 1) r.mal('respuestas', `${resp.length} para ${a.length - 1} pasos`);
  for (let k = 1; k < a.length; k++) {
    const m = K.movimiento(a[k - 1], b[k - 1], a[k], b[k]), anot = resp[k - 1] && resp[k - 1].textos[0];
    if (MOVIMIENTO[anot] !== m) r.mal(`paso ${k}–${k + 1}`, `anotado «${anot}», es ${m}`);
    r.lineas.push(`${k}–${k + 1}. ${m}`);
  }
  const fs = K.comprobar([a, b], { roles: ['soprano', 'bajo'], reglas: ['N4'] });
  fs.forEach(f => r.ojo(`paso ${f.evento}–${f.evento + 1}`, fmtFalta(f)));
  const movs = [];
  for (let k = 1; k < a.length; k++) movs.push(K.movimiento(a[k - 1], b[k - 1], a[k], b[k]));
  r.perfil = { pasos: a.length - 1, movimientos: cuenta(movs) };
  return r;
}

// Todas las paralelas (cualquier pareja, las dos voces se mueven y el
// intervalo no cambia de número), con las prohibidas (N4) marcadas.
function paralelas(ap) {
  const r = informe();
  const { roles, voces } = vocesDe(variables(ap.codigo), ROLES4);
  const vs = voces.map(v => v.map(e => e.altura));
  const resp = leerRespuestas(variables(ap.codigo).respuestas);
  const n4 = K.comprobar(vs, { roles, reglas: ['N4'] });
  const ini = x => LETRA_VOZ[roles[x]];
  let total = 0, prohibidas = 0;
  for (let k = 1; k < vs[0].length; k++) {
    const halladas = [];
    for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) {
      const a1 = vs[i][k - 1], b1 = vs[j][k - 1], a2 = vs[i][k], b2 = vs[j][k];
      if (K.movimiento(a1, b1, a2, b2) !== 'paralelo') continue;
      const prohibida = n4.some(f => f.evento === k && f.voces.join() === [i, j].join());
      halladas.push(`${prohibida ? '✗' : ''}${ini(i)}–${ini(j)} ${a1.abs - b1.abs + 1}`);
      total++; if (prohibida) prohibidas++;
    }
    const anot = (resp[k - 1] ? resp[k - 1].parejas : [])
      .map(p => `${p.prohibida ? '✗' : ''}${p.voces} ${parseInt(p.intervalo, 10)}`);
    const clave = l => l.slice().sort().join(', ');
    if (clave(anot) !== clave(halladas))
      r.mal(`paso ${k}–${k + 1}`, `anotadas [${clave(anot)}], halladas [${clave(halladas)}]`);
    r.lineas.push(`${k}–${k + 1}. ${clave(halladas) || '—'}`);
  }
  r.perfil = { voces: roles.length, pasos: vs[0].length - 1, paralelas: total, prohibidas };
  return r;
}

// Faltas de 5.as y 8.as: «5.as par.», «8.as par./contr.», «5.ª dir./(S–B)».
function leerFaltaParalela(txt) {
  const m = txt.match(/^(5|8)\.(?:as|ª) (par|dir)\.(\/contr\.)?(?:\/\(([STAB])–([STAB])\))?$/);
  if (!m) return null;
  return { regla: m[2] === 'par' ? 'N4' : 'N5', int: m[1], contr: !!m[3], voces: m[4] ? [m[4], m[5]] : null };
}
function faltasParalelas(ap) {
  const r = informe(), vars = variables(ap.codigo), key = tonalidad(ap.attr.tono);
  const { roles, voces } = vocesDe(vars, ROLES4);
  const vs = voces.map(v => v.map(e => e.altura));
  const resp = leerRespuestas(vars.respuestas);
  if (resp.length !== vs[0].length - 1) r.mal('respuestas', `${resp.length} para ${vs[0].length - 1} pasos`);
  const anotadas = resp.map(x => x.cmd === 'falta' ? leerFaltaParalela(x.textos[0]) : null);
  const conDirectas = resp.some(x => x.cmd === 'falta' && / dir\./.test(x.textos[0]));
  const todas = K.comprobar(vs, { roles }).sort((a, b) => a.evento - b.evento);
  const fs = todas.filter(f => f.regla === 'N4' || (f.regla === 'N5' && conDirectas));
  for (let k = 1; k < vs[0].length; k++) {
    const donde = `paso ${k}–${k + 1}`, aqui = fs.filter(f => f.evento === k), x = resp[k - 1];
    const a = anotadas[k - 1];
    if (x && x.cmd === 'falta' && !a) { r.mal(donde, `no reconozco «${x.textos[0]}»`); continue; }
    if (!a && aqui.length) r.mal(donde, `sin anotar: ${aqui.map(f => fmtFalta(f)).join('; ')}`);
    if (a) {
      const f = aqui.find(f => f.regla === a.regla && f.texto.startsWith(a.int));
      if (!f) r.mal(donde, `anotada «${x.textos[0]}», encontrada: ${aqui.map(f => fmtFalta(f)).join('; ') || 'ninguna'}`);
      else {
        if (a.regla === 'N4' && a.contr !== f.texto.includes('contrario'))
          r.mal(donde, `«${x.textos[0]}»: ${f.texto}`);
        const vsF = f.voces.map(v => LETRA_VOZ[roles[v]]);
        if (a.voces && a.voces.join() !== vsF.join()) r.mal(donde, `«${x.textos[0]}»: son ${vsF.join('–')}`);
        if (!a.voces && roles.length > 2) r.mal(donde, `«${x.textos[0]}» sin las voces, a ${roles.length} voces`);
      }
      if (aqui.length > 1) r.mal(donde, `más de una falta: ${aqui.map(f => fmtFalta(f)).join('; ')}`);
    }
    r.lineas.push(`${k}–${k + 1}. ${aqui.map(f => fmtFalta(f)).join('; ') || '—'}`);
  }
  // fuera de lo buscado, nada (las preferencias, como aviso)
  todas.filter(f => !fs.includes(f) && f.regla !== 'N5').forEach(f =>
    (f.grado === 'mejorable' ? r.ojo : r.mal)(`evento ${f.evento + 1}`, `además: ${fmtFalta(f)}`));
  todas.filter(f => f.regla === 'N5' && !conDirectas).forEach(f =>
    r.ojo(`paso ${f.evento}–${f.evento + 1}`, `directa sin pedir: ${fmtFalta(f)}`));
  // a cuatro voces, también el comprobador de 4.º (acordes, duplicaciones…)
  if (roles.length === 4) {
    const acs = identificarAcordes(key, vs, r);
    if (acs) CK.comprobar(key, acs, vs)
      .filter(f => f.regla !== 'N4' && f.regla !== 'N5')
      .forEach(f => r.mal(`evento ${f.evento + 1}`, `cuatro voces: ${f.regla} ${f.texto}`));
  }
  r.perfil = {
    voces: roles.length, sonoridades: vs[0].length,
    paralelas: fs.filter(f => f.regla === 'N4').length, directas: fs.filter(f => f.regla === 'N5').length,
  };
  return r;
}

// El acorde de cada evento a cuatro voces, en el modelo de la app.
function identificarAcordes(key, vs, r) {
  const acs = [];
  for (let k = 0; k < vs[0].length; k++) {
    const t = triada(vs.map(v => v[k]));
    if (!t) { r.mal(`acorde ${k + 1}`, 'no es una tríada completa'); return null; }
    acs.push(CV.acorde(key, { grado: gradoDe(key, t.raiz), inv: t.inv }));
  }
  return acs;
}

// Enlazar: sin faltas (los dos comprobadores), la consigna seguida desde el
// primer acorde (la cadena la recalcula `enlazar`) y el rótulo de cada enlace.
const ROTULO_ENLACE = ['contr.', '1 n.c.', '2 n.c.'];
function enlazarAcordes(ap) {
  const r = informe(), vars = variables(ap.codigo), key = tonalidad(ap.attr.tono);
  const { roles, voces } = vocesDe(vars, ROLES4);
  const vs = voces.map(v => v.map(e => e.altura));
  const resp = leerRespuestas(vars.respuestas);
  const acs = identificarAcordes(key, vs, r);
  if (!acs) return r;
  acs.forEach((a, k) => { if (a.inv) r.mal(`acorde ${k + 1}`, 'el bajo no es la fundamental'); });
  const reglas = ['N1', 'N2', 'N3', 'N4', 'N5', 'N12', 'N13', 'N15'];
  K.comprobar(vs, { roles, reglas }).forEach(f => r.mal(`evento ${f.evento + 1}`, fmtFalta(f)));
  CK.comprobar(key, acs, vs).forEach(f => r.mal(`evento ${f.evento + 1}`, `cuatro voces: ${f.regla} ${f.texto}`));
  // la cadena de la consigna, desde el primer acorde escrito
  let ant = [0, 1, 2].map(v => vs[v][0]);
  const rotulos = [];
  for (let k = 1; k < vs[0].length; k++) {
    const donde = `enlace ${k}–${k + 1}`;
    const e = EN.enlazar(ant, vs[3][k - 1], vs[3][k], acs[k]);
    const hecho = [0, 1, 2].map(v => vs[v][k]);
    if (!e) r.mal(donde, 'la consigna no da un acorde completo');
    else if (e.voces.some((q, v) => q.abs !== hecho[v].abs || q.alter !== hecho[v].alter))
      r.mal(donde, `la consigna da ${e.voces.map(nombreNota).join(' ')}, escrito ${hecho.map(nombreNota).join(' ')}`);
    const rot = e ? ROTULO_ENLACE[e.comunes.length] : '?';
    const anot = resp[k - 1] && resp[k - 1].textos[0];
    if (anot !== rot) r.mal(donde, `rotulado «${anot}», es «${rot}»`);
    r.lineas.push(`${k}–${k + 1}. ${acs[k - 1].romano}–${acs[k].romano} ${rot}`);
    rotulos.push(rot);
    ant = hecho;
  }
  r.perfil = { acordes: vs[0].length, 'primer acorde': voces[0][0].solucion ? 'sin dar' : 'dado', enlaces: cuenta(rotulos) };
  // sin el primer acorde dado: cuántos primeros acordes valen
  if (voces[0][0].solucion) {
    const validos = primerosValidos(key, acs, vs[3]).map(v => v.nombre);
    r.lineas.push(`primeros acordes válidos (${validos.length}): ${validos.join('; ')}`);
    if (!validos.length) r.mal('primer acorde', 'ningún primer acorde lleva a una cadena sin faltas');
  }
  return r;
}

// Los primeros acordes (S, A, T sobre el primer bajo) desde los que la
// consigna lleva a una cadena sin faltas, cada uno con su cadena y sus
// rótulos: [{nombre: 'cerrada mi–do–sol', disp, voces, rotulos}].
// Lo usa también generar-fichas.js, para elegir el primero y dar los demás.
function primerosValidos(key, acs, bajos) {
  const reglas = ['N1', 'N2', 'N3', 'N4', 'N5', 'N12', 'N13', 'N15'], out = [];
  for (const disp of ['cerrada', 'abierta', 'mixta']) for (const ini of EN.inicios(acs[0], bajos[0], disp)) {
    let a = ini, bien = true;
    const cadena = [[ini[0]], [ini[1]], [ini[2]], [bajos[0]]], rotulos = [];
    for (let k = 1; k < bajos.length && bien; k++) {
      const e = EN.enlazar(a, bajos[k - 1], bajos[k], acs[k]);
      if (!e) { bien = false; break; }
      e.voces.forEach((q, v) => cadena[v].push(q)); cadena[3].push(bajos[k]); a = e.voces;
      rotulos.push(ROTULO_ENLACE[e.comunes.length]);
    }
    if (bien && !K.comprobar(cadena, { roles: ROLES4, reglas }).length && !CK.comprobar(key, acs, cadena).length
        && !cadena[0].some((p, k) => p.abs === cadena[1][k].abs || cadena[1][k].abs === cadena[2][k].abs))
      out.push({ nombre: `${disp} ${ini.map(p => (CV.ES[p.letter] + CV.SYM(p.alter)).toLowerCase()).join('–')}`,
                 disp, voces: cadena, rotulos });
  }
  return out;
}

// Realizar un bajo: cada acorde, el que dice su romano; la solución, sin
// faltas (los dos comprobadores) y sin ligaduras por comprobar: las 7.as, N8 y
// N16 de cuatro-voces-check.js. Las licencias de la secuencia (N7, N10, N12),
// desde su rótulo hasta el final: el rótulo dice dónde empieza, no dónde acaba.
// Las fichas a mano con notas de paso o varios ritmos por voz no se leen por
// acordes: quedan sin comprobar. Las preferencias del bajo no son avisos:
// en un bajo dado, un salto sin compensar es el dato.
const RE_SECUENCIA = /^(C\. de 5\.as|Romanesca)/;
const CIFRAS_ROMANO = { '': [0, false], 6: [1, false], '6/4': [2, false],
                        7: [0, true], '6/5': [1, true], '4/3': [2, true], '4/2': [3, true] };
function acordeDeRomano(key, romano) {
  const m = romano.match(/^(VII|VI|V|IV|III|II|I)(.*)$/);
  if (!m || !(m[2] in CIFRAS_ROMANO)) return null;
  const [inv, septima] = CIFRAS_ROMANO[m[2]];
  return { grado: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].indexOf(m[1]) + 1, inv, septima };
}
const notasDe = ch => ch.tones.map(t => t.letter + t.alter).sort().join();
function realizarBajo(ap) {
  const r = informe(), vars = variables(ap.codigo), key = tonalidad(ap.attr.tono);
  const { roles, voces } = vocesDe(vars, ROLES4);
  const vs = voces.map(v => v.map(e => e.altura));
  const inicio = voces[0].findIndex(ev => (etiqueta(ev, 'encima') || []).some(x => RE_SECUENCIA.test(x)));
  const licencia = k => inicio >= 0 && k > inicio;
  const acs = voces[3].map((ev, k) => {
    const romano = (etiqueta(ev, 'acorde') || [''])[0], sp = acordeDeRomano(key, romano);
    if (!sp) { r.mal(`acorde ${k + 1}`, `no reconozco el romano «${romano}»`); return null; }
    const sonando = [...new Set(vs.map(v => v[k].letter + v[k].alter))];
    // en menor, 7̂ natural (la secuencia) o elevada, y 6̂ elevada (de paso a
    // la sensible): la que suene; en la secuencia, sensible duplicable (N7)
    const dup = licencia(k) ? { dup: { nunca: [] } } : {};
    const ch = [sp, { ...sp, baja: [7] }, { ...sp, eleva: [6] }].map(s => CV.acorde(key, { ...s, ...dup }))
      .find(c => sonando.every(n => c.tones.some(t => t.letter + t.alter === n)));
    if (!ch) { r.mal(`acorde ${k + 1}`, `${romano}: suenan ${sonando.join(' ')}`); return null; }
    if (vs[3][k].letter + vs[3][k].alter !== ch.tones[ch.bass].letter + ch.tones[ch.bass].alter)
      r.mal(`acorde ${k + 1}`, `${romano}: el bajo no es el de esa inversión`);
    return ch;
  });
  if (acs.some(a => !a)) return r;
  const LIC = new Set(['N7', 'N10', 'N12']);
  CK.comprobar(key, acs, vs, { licencias: k => licencia(k) ? LIC : null })
    .forEach(f => r.mal(`evento ${f.evento + 1}`, `cuatro voces: ${f.regla} ${f.texto}`));
  K.comprobar(vs, { roles }).filter(f => !(LIC.has(f.regla) && licencia(f.evento)))
    .forEach(f => {
      if (f.grado !== 'mejorable') r.mal(`evento ${f.evento + 1}`, fmtFalta(f));
      else if (!f.voces.includes(3)) r.ojo(`evento ${f.evento + 1}`, fmtFalta(f));
    });
  const barras = (vars.bajo.replace(/\\bar\s*"[^"]*"/g, '').match(/\|/g) || []).length + 1;
  r.perfil = { acordes: acs.length, compases: barras - (/\\partial/.test(ap.codigo) ? 1 : 0),
               secuencia: inicio >= 0 ? 'sí' : 'no',
               septimas: acs.filter(a => a.septima && a.grado !== 5).length };
  return r;
}

const COMPROBACION = {
  'grados-bajo-cifrado': gradosBajoCifrado,
  'faltas-disposicion': faltasDisposicion,
  'construir-acordes': construirAcordes,
  'faltas-melodicas': faltasMelodicas,
  'movimientos-armonicos': movimientosArmonicos,
  'paralelas': paralelas,
  'faltas-paralelas': faltasParalelas,
  'enlazar-acordes': enlazarAcordes,
  'realizar-bajo': realizarBajo,
};

/* ---------- perfiles y modelos ---------- */
// El perfil de un apartado es su diseño sin el material: para una variante
// (c3u1-f3b), ha de ser el de la original (c3u1-f3); para una ficha
// generada, ha de cumplir las condiciones de su modelo
// (fichas/modelos/c3u1-repaso.md), que se escriben con las mismas claves.
//
// Las claves de cada tipo, con su clase de valor: 'n', un número
// («8», «2–4», «al menos 4», «como mucho 2»); una lista de palabras, una de
// ellas; {clases}, un recuento («cerrada 2, mixta (5.ª) 1»; una clase que no
// se nombra, ninguna). `tono` (mayor o menor) vale en todos los tipos.
const VOCABULARIO = {
  'grados-bajo-cifrado': { acordes: 'n', invertidos: 'n', repetidos: 'n', modelo: ['sí', 'no'] },
  'faltas-disposicion': { acordes: 'n', faltas: { clases: null },
                          disposiciones: { clases: ['cerrada', 'abierta', 'mixta'] } },
  'construir-acordes': { acordes: 'n', 'primer acorde': ['dado', 'sin dar'],
                         disposiciones: { clases: ['cerrada', 'abierta', 'mixta', 'mixta (5.ª)', 'mixta (3.ª)'] } },
  'faltas-melodicas': { notas: 'n', faltas: { clases: ['N12', 'N13', 'N15', 'P9'] } },
  'movimientos-armonicos': { pasos: 'n', movimientos: { clases: ['directo', 'contrario', 'oblicuo', 'paralelo'] } },
  'paralelas': { voces: 'n', pasos: 'n', paralelas: 'n', prohibidas: 'n' },
  'faltas-paralelas': { voces: 'n', sonoridades: 'n', paralelas: 'n', directas: 'n' },
  'enlazar-acordes': { acordes: 'n', 'primer acorde': ['dado', 'sin dar'],
                       enlaces: { clases: ['contr.', '1 n.c.', '2 n.c.'] } },
  'realizar-bajo': { compases: 'n', acordes: 'n', secuencia: ['sí', 'no'], septimas: 'n' },
};

function leerCantidad(txt) {
  let m;
  if ((m = txt.match(/^(\d+)$/))) return { min: +m[1], max: +m[1] };
  if ((m = txt.match(/^(\d+)\s*[–-]\s*(\d+)$/))) return { min: +m[1], max: +m[2] };
  if ((m = txt.match(/^al menos (\d+)$/))) return { min: +m[1], max: Infinity };
  if ((m = txt.match(/^como mucho (\d+)$/))) return { min: 0, max: +m[1] };
  return null;
}
const textoCantidad = c => c.min === c.max ? `${c.min}` : c.max === Infinity ? `al menos ${c.min}`
  : c.min === 0 ? `como mucho ${c.max}` : `${c.min}–${c.max}`;
function leerRecuento(txt) {
  const out = {};
  for (const trozo of txt.split(/\s*,\s*/)) {
    const m = trozo.match(/^(.*?)\s+(al menos \d+|como mucho \d+|\d+(?:\s*[–-]\s*\d+)?)$/);
    if (!m) return null;
    out[m[1]] = leerCantidad(m[2]);
  }
  return out;
}

// Condiciones escritas → {reglas: {clave: valor leído}, errores}.
function leerCondiciones(tipo, cond) {
  const vocab = VOCABULARIO[tipo], reglas = {}, errores = [];
  if (!vocab) return { reglas, errores: [`el tipo «${tipo}» no tiene comprobación: no admite condiciones`] };
  for (const [k, v] of Object.entries(cond)) {
    const clase = k === 'tono' ? ['mayor', 'menor'] : vocab[k];
    if (!clase) { errores.push(`«${k}» no es una condición de ${tipo} (son: ${['tono', ...Object.keys(vocab)].join(', ')})`); continue; }
    let leido = null;
    if (clase === 'n') leido = leerCantidad(v);
    else if (Array.isArray(clase)) leido = clase.includes(v) ? v : null;
    else {
      leido = leerRecuento(v);
      const ajenas = leido && clase.clases ? Object.keys(leido).filter(c => !clase.clases.includes(c)) : [];
      if (ajenas.length) { errores.push(`${k}: no conozco ${ajenas.map(c => `«${c}»`).join(', ')} (son: ${clase.clases.join(', ')})`); continue; }
    }
    if (leido === null) errores.push(`${k}: no entiendo «${v}»`);
    else reglas[k] = leido;
  }
  return { reglas, errores };
}

// Lo que no cumple el perfil de las condiciones leídas.
function incumple(perfil, reglas) {
  const out = [];
  const dentro = (n, c) => n >= c.min && n <= c.max;
  for (const [k, c] of Object.entries(reglas)) {
    const v = perfil[k];
    if (typeof c === 'string') { if (v !== c) out.push(`${k}: ${v}, se pide ${c}`); }
    else if ('min' in c) { if (!dentro(v, c)) out.push(`${k}: ${v}, se pide ${textoCantidad(c)}`); }
    else {
      for (const [clase, q] of Object.entries(c))
        if (!dentro((v || {})[clase] || 0, q)) out.push(`${k}: ${(v || {})[clase] || 0} «${clase}», se pide ${textoCantidad(q)}`);
      for (const clase of Object.keys(v || {}))
        if (!(clase in c)) out.push(`${k}: ${v[clase]} «${clase}», no prevista`);
    }
  }
  return out;
}

// Dos perfiles (variante y original): las diferencias.
function diferencias(a, b) {
  const plano = x => typeof x === 'object' ? JSON.stringify(Object.keys(x).sort().map(k => [k, x[k]])) : String(x);
  const ver = x => typeof x === 'object' ? Object.entries(x).map(([k, n]) => `${k} ${n}`).join(', ') || '—' : x;
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter(k => plano(a[k]) !== plano(b[k]))
    .map(k => `${k}: ${ver(a[k])} (en la original: ${ver(b[k])})`);
}

const modoDe = tono => tono ? (/menor$/.test(tono) ? 'menor' : 'mayor') : undefined;

// Las tonalidades de la cabecera de un modelo: «1.er trimestre», «hasta el 2.º trimestre».
function tonalidadesPermitidas(txt) {
  const m = txt.match(/(\d)/);
  if (!m) return null;
  return (/hasta/.test(txt) ? TON.hastaTrimestre(+m[1]) : TON.delTrimestre(+m[1])).map(t => t.nombre);
}

function leerModelo(fichero) {
  const ejs = leerFicha(fichero), errores = [];
  const aps = ejs.flatMap(e => e.apartados.map(a => ({ ...a, nota: e.nota })));   // con la nota tras la consigna
  aps.forEach((ap, i) => {
    if (!ap.condiciones) { errores.push(`ejercicio ${i + 1}: sin bloque de condiciones`); return; }
    const l = leerCondiciones(ap.attr.tipo, ap.condiciones);
    ap.reglas = l.reglas;
    l.errores.forEach(e => errores.push(`ejercicio ${i + 1} (${ap.attr.tipo}): ${e}`));
  });
  const cab = ejs.cabecera, global = {};
  if (cab.tonalidades) {
    global.tonalidades = tonalidadesPermitidas(cab.tonalidades);
    if (!global.tonalidades) errores.push(`tonalidades: no entiendo «${cab.tonalidades}»`);
  }
  if (cab.menores) {
    global.menores = leerCantidad(cab.menores);
    if (!global.menores) errores.push(`menores: no entiendo «${cab.menores}»`);
  }
  return { nombre: path.basename(fichero, '.md'), apartados: aps, global, errores };
}

/* ---------- principal ---------- */

function comprobarApartado(ap) {
  const f = COMPROBACION[ap.attr.tipo];
  if (!f) return null;
  let r;
  try { r = f(ap); } catch (e) { r = informe(); r.mal('lectura', e.message); }
  r.perfil = { ...(ap.attr.tono ? { tono: modoDe(ap.attr.tono) } : {}), ...r.perfil };
  return r;
}

function comprobarFicha(fichero, opciones) {
  const nombre = path.basename(fichero, '.md');
  console.log(`\n${nombre}`);
  let fallos = 0, avisos = 0, sin = 0;
  const hechos = [];
  leerFicha(fichero).forEach((ej, i) => {
    const serie = ej.apartados.length > 1;
    ej.apartados.forEach((ap, j) => {
      const rotulo = `  ${i + 1}${serie ? 'abcdefghij'[j] : ''} · ${ap.attr.tipo}${ap.attr.tono ? ' (' + ap.attr.tono + ')' : ''}`;
      const r = comprobarApartado(ap);
      hechos.push({ ap, r });
      if (!r) { console.log(`${rotulo}: sin comprobar`); sin++; return; }
      const estado = r.fallos.length ? `✗ ${r.fallos.length}` : 'bien';
      console.log(`${rotulo}: ${estado}${r.avisos.length ? `, ${r.avisos.length} aviso(s)` : ''}`);
      if (opciones.detalle) r.lineas.forEach(l => console.log(`       ${l}`));
      r.fallos.forEach(x => console.log(`     ✗ ${x}`));
      r.avisos.forEach(x => console.log(`     ! ${x}`));
      fallos += r.fallos.length; avisos += r.avisos.length;
    });
  });

  // el diseño: contra la original (si es una variante) o contra el modelo
  const contra = [];
  const original = nombre.match(/^(c\d+u\d+-f\d+)[b-z]$/);
  if (original && fs.existsSync(path.join(FICHAS, original[1] + '.md'))) {
    const otra = leerFicha(path.join(FICHAS, original[1] + '.md')).flatMap(e => e.apartados);
    const mal = [];
    if (otra.length !== hechos.length) mal.push(`${hechos.length} apartados; la original, ${otra.length}`);
    else otra.forEach((ap, i) => {
      const h = hechos[i], donde = `apartado ${i + 1}`;
      if (ap.attr.tipo !== h.ap.attr.tipo) return mal.push(`${donde}: ${h.ap.attr.tipo}; en la original, ${ap.attr.tipo}`);
      if ((ap.attr.pide || '') !== (h.ap.attr.pide || '')) mal.push(`${donde}: pide «${h.ap.attr.pide || ''}»; en la original, «${ap.attr.pide || ''}»`);
      const ro = comprobarApartado(ap);
      if (h.r && ro) diferencias(h.r.perfil, ro.perfil).forEach(d => mal.push(`${donde}: ${d}`));
    });
    contra.push({ que: `la original, ${original[1]}`, mal });
  }
  if (opciones.modelo) {
    const m = opciones.modelo, mal = [];
    if (m.apartados.length !== hechos.length) mal.push(`${hechos.length} apartados; el modelo, ${m.apartados.length}`);
    else m.apartados.forEach((ap, i) => {
      const h = hechos[i], donde = `apartado ${i + 1}`;
      if (ap.attr.tipo !== h.ap.attr.tipo) return mal.push(`${donde}: ${h.ap.attr.tipo}; el modelo pide ${ap.attr.tipo}`);
      if ((ap.attr.pide || '') !== (h.ap.attr.pide || '')) mal.push(`${donde}: pide «${h.ap.attr.pide || ''}»; el modelo, «${ap.attr.pide || ''}»`);
      if (h.r) incumple(h.r.perfil, ap.reglas).forEach(d => mal.push(`${donde}: ${d}`));
    });
    const tonos = hechos.map(h => h.ap.attr.tono).filter(Boolean);
    if (m.global.tonalidades)
      tonos.filter(t => !m.global.tonalidades.includes(t)).forEach(t => mal.push(`tonalidad fuera de las del modelo: ${t}`));
    if (m.global.menores) {
      const n = tonos.filter(t => modoDe(t) === 'menor').length;
      if (n < m.global.menores.min || n > m.global.menores.max) mal.push(`menores: ${n}, se pide ${textoCantidad(m.global.menores)}`);
    }
    contra.push({ que: `el modelo ${m.nombre}`, mal });
  }
  for (const c of contra) {
    console.log(`  diseño, contra ${c.que}: ${c.mal.length ? `✗ ${c.mal.length}` : 'bien'}`);
    c.mal.forEach(x => console.log(`     ✗ ${x}`));
    fallos += c.mal.length;
  }
  return { fallos, avisos, sin };
}

function main() {
  const args = process.argv.slice(2);
  const opciones = { detalle: args.includes('--detalle') };
  const i = args.indexOf('--modelo');
  const pedidas = args.filter((a, k) => !a.startsWith('--') && !(i >= 0 && k === i + 1));
  if (i >= 0) {
    const n = args[i + 1] || '';
    const fichero = fs.existsSync(n) ? n : path.join(FICHAS, 'modelos', n.replace(/\.md$/, '') + '.md');
    if (!fs.existsSync(fichero)) { console.error(`No encuentro el modelo ${fichero}`); process.exit(2); }
    const m = leerModelo(fichero);
    console.log(`modelo ${m.nombre}: ${m.errores.length ? `✗ ${m.errores.length}` : 'bien'}`);
    m.errores.forEach(e => console.log(`  ✗ ${e}`));
    if (m.errores.length) process.exit(1);
    if (!pedidas.length) {
      if (m.global.tonalidades) console.log(`  tonalidades: ${m.global.tonalidades.join(', ')}`);
      if (m.global.menores) console.log(`  en menor: ${textoCantidad(m.global.menores)}`);
      m.apartados.forEach((ap, k) => console.log(`  ${k + 1} · ${ap.attr.tipo}${ap.attr.pide ? ` (pide ${ap.attr.pide})` : ''}: ` +
        Object.entries(ap.reglas).map(([c, v]) => `${c} ${typeof v === 'string' ? v : 'min' in v ? textoCantidad(v)
          : Object.entries(v).map(([x, q]) => `${x} ${textoCantidad(q)}`).join(', ')}`).join(' · ')));
      return;
    }
    opciones.modelo = m;
  }
  const fichas = pedidas.length
    ? pedidas.map(a => fs.existsSync(a) ? a : path.join(FICHAS, a.replace(/\.md$/, '') + '.md'))
    : fs.readdirSync(FICHAS).filter(f => /^c[34]u.*\.md$/.test(f)).sort().map(f => path.join(FICHAS, f));
  const total = { fallos: 0, avisos: 0, sin: 0 };
  for (const f of fichas) {
    const r = comprobarFicha(f, opciones);
    for (const k in total) total[k] += r[k];
  }
  console.log(`\n${fichas.length} ficha(s): ${total.fallos} discrepancia(s), ${total.avisos} aviso(s), ${total.sin} apartado(s) sin comprobar`);
  process.exit(total.fallos ? 1 : 0);
}

if (require.main === module) main();
module.exports = { comprobarApartado, primerosValidos, triada, gradoDe, leerFicha, leerModelo, variables, leerVoz, leerRespuestas, COMPROBACION, VOCABULARIO, incumple };
