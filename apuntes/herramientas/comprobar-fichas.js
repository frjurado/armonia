#!/usr/bin/env node
/* ============================================================
   comprobar-fichas.js — verificador de las fichas de ejercicios
   ------------------------------------------------------------
   Uso:  node herramientas/comprobar-fichas.js [ficha…] [--detalle]
         (sin fichas, todas las de fichas/; una ficha es su nombre,
         «c3u1-f3b», o su ruta)

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

   Las notas las lee el parser de la app (mini-lilypond-parser.js);
   aquí solo se quitan y se guardan los comandos de las fichas
   (\falta, \rotulo, \analitico…), que van DELANTE de la nota a la
   que acompañan (etiquetas.ily), salvo en una melodía, donde los
   corchetes (\falta, \mejorable … \stopGroup) van detrás.

   Plan: informes/2026-10-29-plan-fichas-generadas.md, §2.1.
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
const RE_ATRIBUTO = /([\w-]+)="([^"]*)"/g;
const atributos = s => Object.fromEntries([...s.matchAll(RE_ATRIBUTO)].map(m => [m[1], m[2]]));

function leerFicha(fichero) {
  const texto = fs.readFileSync(fichero, 'utf8').replace(/\r/g, '')
    .replace(/<!-- guion:inicio -->[\s\S]*?<!-- guion:fin -->/, '');
  const ejercicios = [];
  for (const m of texto.matchAll(RE_EJERCICIO)) {
    const attr = atributos(m[1]);
    const bloques = [...m[2].matchAll(RE_LILYPOND)];
    const nota = m[2].replace(RE_LILYPOND, '').trim();
    ejercicios.push({
      attr, nota,
      apartados: bloques.map(b => ({ attr: { ...attr, ...atributos(b[1]) }, codigo: b[2] })),
    });
  }
  return ejercicios;
}

// Las variables del bloque: `soprano = { … }`, `soprano = \analitico { … }`.
function variables(codigo) {
  const out = {};
  const re = /^([a-zA-Z]+)\s*=\s*/gm;
  let m;
  while ((m = re.exec(codigo))) {
    let i = re.lastIndex, j = codigo.indexOf('{', i);
    if (j < 0) break;
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
        const et = { cmd: n, args };
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
                     solucion: analiticoUna || analiticoHasta.length > 0, modelo });
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
// Cada una recibe el apartado y devuelve {lineas, fallos, avisos}: una
// línea por acorde o paso (para --detalle) y lo que no cuadra.

function informe() {
  const r = { lineas: [], fallos: [], avisos: [] };
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

// Reglas de un acorde suelto (Disposición): N1, N2, N3, P2.
const faltasAcorde = (vs, roles) =>
  K.comprobar(vs.map(p => [p]), { roles, reglas: ['N1', 'N2', 'N3', 'P2'], superposicion: false });

// La duplicación de la mixta, por el grado (Minimos §4): la 3.ª en II y VI.
const dupMixta = grado => (grado === 2 || grado === 6) ? '3.ª' : '5.ª';

const REGLA_DISPOSICION = { '> 8.ª': 'N2', 'cruce': 'N3', 'tesitura': 'N1', 'unísono': 'P2' };

function faltasDisposicion(ap) {
  const r = informe(), key = tonalidad(ap.attr.tono);
  const { roles, voces } = vocesDe(variables(ap.codigo), ROLES4);
  voces[0].forEach((_, k) => {
    const vs = alturasEn(voces, k), donde = `acorde ${k + 1}`;
    const fs = faltasAcorde(vs, roles), t = triada(vs);
    const falta = etiqueta(voces[3][k], 'falta'), grado = etiqueta(voces[3][k], 'grado');
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
    const romano = ROMANOS[g - 1] + ['', '6', '6/4'][inv];
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
  });
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
  for (let k = 1; k < vs[0].length; k++) {
    const halladas = [];
    for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) {
      const a1 = vs[i][k - 1], b1 = vs[j][k - 1], a2 = vs[i][k], b2 = vs[j][k];
      if (K.movimiento(a1, b1, a2, b2) !== 'paralelo') continue;
      const prohibida = n4.some(f => f.evento === k && f.voces.join() === [i, j].join());
      halladas.push(`${prohibida ? '✗' : ''}${ini(i)}–${ini(j)} ${a1.abs - b1.abs + 1}`);
    }
    const anot = (resp[k - 1] ? resp[k - 1].parejas : [])
      .map(p => `${p.prohibida ? '✗' : ''}${p.voces} ${parseInt(p.intervalo, 10)}`);
    const clave = l => l.slice().sort().join(', ');
    if (clave(anot) !== clave(halladas))
      r.mal(`paso ${k}–${k + 1}`, `anotadas [${clave(anot)}], halladas [${clave(halladas)}]`);
    r.lineas.push(`${k}–${k + 1}. ${clave(halladas) || '—'}`);
  }
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
    ant = hecho;
  }
  // sin el primer acorde dado: cuántos primeros acordes valen
  if (voces[0][0].solucion) {
    const validos = [];
    for (const disp of ['cerrada', 'abierta', 'mixta']) for (const ini of EN.inicios(acs[0], vs[3][0], disp)) {
      let a = ini, bien = true;
      const cadena = [[ini[0]], [ini[1]], [ini[2]], [vs[3][0]]];
      for (let k = 1; k < vs[0].length && bien; k++) {
        const e = EN.enlazar(a, vs[3][k - 1], vs[3][k], acs[k]);
        if (!e) { bien = false; break; }
        e.voces.forEach((q, v) => cadena[v].push(q)); cadena[3].push(vs[3][k]); a = e.voces;
      }
      if (bien && !K.comprobar(cadena, { roles, reglas }).length && !CK.comprobar(key, acs, cadena).length
          && !cadena[0].some((p, k) => p.abs === cadena[1][k].abs || cadena[1][k].abs === cadena[2][k].abs))
        validos.push(`${disp} ${ini.map(p => (CV.ES[p.letter] + CV.SYM(p.alter)).toLowerCase()).join('–')}`);
    }
    r.lineas.push(`primeros acordes válidos (${validos.length}): ${validos.join('; ')}`);
    if (!validos.length) r.mal('primer acorde', 'ningún primer acorde lleva a una cadena sin faltas');
  }
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
};

/* ---------- principal ---------- */

function comprobarFicha(fichero, detalle) {
  const nombre = path.basename(fichero, '.md');
  console.log(`\n${nombre}`);
  let fallos = 0, avisos = 0, sin = 0;
  leerFicha(fichero).forEach((ej, i) => {
    const serie = ej.apartados.length > 1;
    ej.apartados.forEach((ap, j) => {
      const rotulo = `  ${i + 1}${serie ? 'abcdefghij'[j] : ''} · ${ap.attr.tipo}${ap.attr.tono ? ' (' + ap.attr.tono + ')' : ''}`;
      const f = COMPROBACION[ap.attr.tipo];
      if (!f) { console.log(`${rotulo}: sin comprobar`); sin++; return; }
      let r;
      try { r = f(ap); } catch (e) { r = informe(); r.mal('lectura', e.message); }
      const estado = r.fallos.length ? `✗ ${r.fallos.length}` : 'bien';
      console.log(`${rotulo}: ${estado}${r.avisos.length ? `, ${r.avisos.length} aviso(s)` : ''}`);
      if (detalle) r.lineas.forEach(l => console.log(`       ${l}`));
      r.fallos.forEach(x => console.log(`     ✗ ${x}`));
      r.avisos.forEach(x => console.log(`     ! ${x}`));
      fallos += r.fallos.length; avisos += r.avisos.length;
    });
  });
  return { fallos, avisos, sin };
}

function main() {
  const args = process.argv.slice(2);
  const detalle = args.includes('--detalle');
  const pedidas = args.filter(a => !a.startsWith('--'));
  const fichas = pedidas.length
    ? pedidas.map(a => fs.existsSync(a) ? a : path.join(FICHAS, a.replace(/\.md$/, '') + '.md'))
    : fs.readdirSync(FICHAS).filter(f => /^c[34]u.*\.md$/.test(f)).sort().map(f => path.join(FICHAS, f));
  const total = { fallos: 0, avisos: 0, sin: 0 };
  for (const f of fichas) {
    const r = comprobarFicha(f, detalle);
    for (const k in total) total[k] += r[k];
  }
  console.log(`\n${fichas.length} ficha(s): ${total.fallos} discrepancia(s), ${total.avisos} aviso(s), ${total.sin} apartado(s) sin comprobar`);
  process.exit(total.fallos ? 1 : 0);
}

if (require.main === module) main();
module.exports = { leerFicha, variables, leerVoz, leerRespuestas, COMPROBACION };
