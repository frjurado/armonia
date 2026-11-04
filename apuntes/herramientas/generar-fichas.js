#!/usr/bin/env node
/* ============================================================
   generar-fichas.js — fichas generadas a partir de un modelo
   ------------------------------------------------------------
   Uso:  node herramientas/generar-fichas.js <modelo> [opciones]
           --cuantas 10       cuántas fichas (por defecto, 10)
           --semilla 1        la ficha n lleva la semilla 1000·s + n
           --salida dir       dónde se escriben (por defecto,
                              tmp/generadas/<modelo>/)
           --ejercicios 1,3   solo esos ejercicios del modelo (prueba
                              de un tipo; entonces no se exigen las
                              condiciones de la cabecera, como «menores»)

   El modelo (fichas/modelos/<modelo>.md) dice qué ejercicios lleva la
   ficha y con qué condiciones. Para cada ejercicio, un adaptador pide
   el material al núcleo de la app que lo genera (bajo-cifrado-core.js…)
   y lo escribe como un bloque ```lilypond de ficha, con los mismos
   comandos que una escrita a mano. Antes de darlo por bueno, lo pasa
   por el verificador (comprobar-fichas.js): sin discrepancias y
   cumpliendo las condiciones del modelo; si no, otro intento.

   Las fichas salen como .md; los PDF, con construir.py y su ruta.

   SEMILLA. Los núcleos sortean con Math.random; aquí se sustituye por un
   generador con semilla antes de cada ficha, así que una ficha se puede
   rehacer idéntica (mientras no cambien los núcleos). Sin tocar la app.

   LOTE. Las fichas de una misma tirada no repiten ejercicio: cada uno deja
   su huella (modo y grados del bajo) y las siguientes la evitan; y las
   tonalidades de cada ejercicio se reparten. En menor, el bajo de Enlazar
   acordes (fundamentales: I, IV, V, VI) apenas da para 25–30 sucesiones,
   y sin esto se repetían. Una ficha depende así de las anteriores del
   lote: se rehace idéntica rehaciendo el lote entero.

   Plan: informes/2026-10-29-plan-fichas-generadas.md, §2.3.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const APP = path.join(RAIZ, '..', 'app', 'public');
const V = require('./comprobar-fichas.js');
const BC = require(path.join(APP, 'ejercicios', 'bajo-cifrado-core.js'));
const CV = require(path.join(APP, 'ejercicios', 'cuatro-voces-core.js'));
const D = require(path.join(APP, 'ejercicios', 'disposicion-core.js'));
const P = require(path.join(APP, 'ejercicios', 'paralelas-directas-core.js'));
const EN = require(path.join(APP, 'ejercicios', 'enlace-core.js'));
const K = require(path.join(APP, 'ejercicios', 'conduccion-check.js'));
const CK = require(path.join(APP, 'ejercicios', 'cuatro-voces-check.js'));
const SEC = require(path.join(APP, 'ejercicios', 'secuencia-core.js'));
const SEPT = require(path.join(APP, 'ejercicios', 'septimas-core.js'));
const TON = require(path.join(APP, 'tonalidades.js'));
const LETRAS = 'CDEFGAB';
const ROLES4 = ['soprano', 'contralto', 'tenor', 'bajo'];

// mulberry32: pequeño, rápido y suficiente para sortear ejercicios.
function aleatorio(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const elige = lista => lista[Math.floor(Math.random() * lista.length)];
// Un número de las condiciones («8», «2–4», «al menos 4»): uno al azar.
const numero = (c, defecto) => !c ? defecto : c.max === Infinity ? c.min : c.min + Math.floor(Math.random() * (c.max - c.min + 1));

// Altura de la app ({letter, alter, oct}) → nota de LilyPond (inglés, absoluta).
function ly(p) {
  const alt = { 1: 's', '-1': 'f', 2: 'ss', '-2': 'ff' }[p.alter] || '';
  const oct = p.oct > 3 ? "'".repeat(p.oct - 3) : ','.repeat(3 - p.oct);
  return p.letter.toLowerCase() + alt + oct;
}
const CIRCULOS = { 1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤', 6: '⑥', 7: '⑦' };

/* ---------- adaptadores: condiciones + tonalidad → bloque lilypond ---------- */

// Grados y cifrado (como c3u1-f2): un bajo cifrado de bajo-cifrado-core.js;
// encima, el acorde en posición cerrada (el `agudo` de la app) y su cifrado
// americano. El primero, entre \modelo y \finModelo si se pide.
// El final (en I o en V) se sortea una vez por ejercicio, en `ctx`, con la
// proporción de la app: si se sorteara en cada intento, los que descarta el
// verificador (los finales en I gastan antes la repetición) lo desviarían.
const FINAL_EN_V = 0.35;
function gradosBajoCifrado(reglas, key, ctx) {
  if (!ctx.fin) ctx.fin = Math.random() < FINAL_EN_V ? 'V' : 'I';
  const inst = BC.generar(2, { key, n: numero(reglas.acordes, 8), fin: ctx.fin });
  if (!inst) return null;
  const modelo = reglas.modelo === 'sí';
  const arriba = [], abajo = [];
  inst.acordes.forEach((a, k) => {
    const [ini, fin] = modelo && k === 0 ? ['\\modelo ', ' \\finModelo'] : ['', ''];
    arriba.push(`  ${ini}\\encima "${a.americano}" \\analitico <${a.agudo.map(ly).join(' ')}>1${fin}`);
    const figuras = a.cifras.length ? `\\figuras "${a.cifras.join('/')}" ` : '';
    // en estado fundamental, las cifras del bajo (♯; 5/3 o 5/♯ tras el 6/4
    // cadencial) van también en el romano: «V♯», «V5/3»
    const cifrasRomano = a.inv === 0 ? a.cifras.join('/') : a.cifrasRomano;
    const grado = `\\gradoBajo "${a.gradoBajo.acc}${CIRCULOS[a.gradoBajo.num]}" \\acorde "${a.romano}${cifrasRomano}"`;
    abajo.push(`  ${figuras}${ini}${grado}${fin} ${ly(a.bajo)}1`);
  });
  return `arriba = {\n${arriba.join('\n')}\n}\nabajo = {\n${abajo.join('\n')}\n}\n`;
}

// Una voz de blancas: la primera con su duración, las demás sin ella.
const blancas = ps => ps.map((p, k) => ly(p) + (k ? '' : '2')).join(' ');
function baraja(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// Un recuento de las condiciones ({cerrada: {min, max}…}) → la lista de
// clases, con tantas de cada una como salgan (desordenada).
const lista = recuento => baraja(Object.entries(recuento || {}).flatMap(([c, q]) => Array(numero(q, 0)).fill(c)));

// Construir acordes (como c3u1-f3, ej. 3): las disposiciones del modelo, en
// orden aleatorio, sobre grados distintos del anterior; cada acorde, una de
// las colocaciones de Disposición (disposicion-core.js) sin faltas, con la
// disposición y la duplicación pedidas (la mixta: la 5.ª en I, IV y V; la
// 3.ª en II y VI). La soprano es libre: una solución posible.
function construirAcordes(reglas, key) {
  const disps = lista(reglas.disposiciones);
  if (reglas.acordes && (disps.length < reglas.acordes.min || disps.length > reglas.acordes.max)) return null;
  const grados = key.mode === 'minor' ? [1, 4, 5, 6] : [1, 2, 3, 4, 5, 6];
  const tonica = LETRAS.indexOf(key.tonic), acordes = [];
  let previo = null;
  for (const d of disps) {
    const m = d.match(/^(cerrada|abierta|mixta)(?: \((3|5)\.ª\))?$/);
    const permitidos = grados.filter(g => g !== previo &&
      (m[1] !== 'mixta' || !m[2] || (m[2] === '5' ? [1, 4, 5] : [2, 6]).includes(g)));
    if (!permitidos.length) return null;
    const g = elige(permitidos), ch = CV.acorde(key, { grado: g, inv: 0 });
    const alter = abs => ch.tones.find(t => t.letter === LETRAS[((abs % 7) + 7) % 7]).alter;
    const buenas = D.colocaciones(tonica + g - 1, m[1] === 'mixta' ? '35' : 'F')
      .map(c => c.map(abs => CV.altura(abs, alter(abs))))
      .filter(v => {
        if (new Set(v.map(K.midi)).size < 4) return false;
        if (K.comprobar(v.map(p => [p]), { roles: ROLES4, reglas: ['N1', 'N2', 'N3', 'P2'], superposicion: false }).length) return false;
        if (D.disposicion(v[0], v[2]) !== m[1]) return false;
        if (!m[2]) return true;
        const doble = v.map(p => p.letter).filter((l, i, a) => a.indexOf(l) !== i)[0];
        return doble === ch.tones[m[2] === '5' ? 2 : 1].letter;
      });
    if (!buenas.length) return null;
    acordes.push({ rotulo: d, voces: elige(buenas) });
    previo = g;
  }
  const dado = reglas['primer acorde'] !== 'sin dar';
  const sol = (k, txt) => (dado && k === 0) ? txt : `\\analitico ${txt}`;
  const n = acordes.length, ancho = Math.max(...acordes.map(a => a.rotulo.length)) + 2;
  const soprano = acordes.map((a, k) =>
    `  \\rotulo ${`"${a.rotulo}"`.padEnd(ancho)} ${sol(k, ly(a.voces[0]) + '2')} \\bar "${k === n - 1 ? '|.' : '||'}"`);
  const voz = v => {
    const ps = acordes.map(a => a.voces[v]);
    return dado ? `{ ${ly(ps[0])}2 \\analitico { ${blancas(ps.slice(1))} } }` : `\\analitico { ${blancas(ps)} }`;
  };
  return ['solucionPosible = ##t', `soprano = {\n${soprano.join('\n')}\n}`,
          `contralto = ${voz(1)}`, `tenor     = ${voz(2)}`,
          `bajo      = { ${blancas(acordes.map(a => a.voces[3]))} }`].join('\n') + '\n';
}

// Faltas de paralelas a cuatro voces (como c3u1-f5 d): una realización de
// Paralelas y directas (paralelas-directas-core.js, generar4) con las faltas
// pedidas inyectadas; los rótulos, los de las fichas. Con `limpia`: fuera de
// esas faltas, buena conducción (ni P2 ni P9). Las directas, primero: son
// las que menos sitio encuentran (el orden no decide dónde caen).
const INICIAL = { soprano: 'S', contralto: 'A', tenor: 'T', bajo: 'B' };
function rotuloParalela(f) {
  const vs = `(${f.voces.map(v => INICIAL[ROLES4[v]]).join('–')})`;
  if (f.regla === 'N5') return `${f.texto.startsWith('5') ? '5.ª' : '8.ª'} dir./${vs}`;
  return `${f.texto.startsWith('5') ? '5.as' : '8.as'} par./${f.texto.includes('contrario') ? 'contr./' : ''}${vs}`;
}
function faltasParalelas(reglas, key) {
  if (reglas.voces && reglas.voces.min !== 4) return null;           // solo a cuatro voces
  const tipos = [...Array(numero(reglas.directas, 1)).fill('N5'), ...Array(numero(reglas.paralelas, 2)).fill('N4')];
  const inst = P.generar4(3, 0, { n: numero(reglas.sonoridades, 10), key, tipos, limpia: true });
  if (!inst) return null;
  const n = inst.voces[0].length;
  const resp = [];
  for (let k = 1; k < n; k++) {
    const f = inst.faltas.find(x => x.paso === k);
    resp.push(f ? `\\falta "${rotuloParalela(f)}"` : '\\sinFalta');
  }
  const nombres = ['soprano  ', 'contralto', 'tenor    ', 'bajo     '];
  return inst.voces.map((v, i) => `${nombres[i]} = { ${blancas(v)} }`).join('\n') +
    `\nrespuestas = {\n  ${resp.join(' ')}\n}\n`;
}

// Enlazar acordes (como c3u1-f6): un bajo en estado fundamental de
// Bajo cifrado (con `fundamental` y sin V–VI, VI–V ni III–IV, como la app),
// y uno de los primeros acordes desde los que la consigna no lleva a ninguna
// falta (comprobar-fichas.js, primerosValidos). Sin el primero dado, la
// solución es una de las posibles (los otros primeros acordes no se dan:
// lo decidió el profesor el 2026-11-02).
function enlazarAcordes(reglas, key) {
  const b = BC.generar(2, { key, n: numero(reglas.acordes, 10), fundamental: true, evita: EN.EVITA });
  if (!b) return null;
  const acs = b.ids.map(id => CV.acorde(key, BC.ACORDES[id]));
  const bajos = b.acordes.map(a => a.bajo);
  const dado = reglas['primer acorde'] === 'dado';
  const validos = V.primerosValidos(key, acs, bajos).filter(v => !dado || v.disp !== 'mixta');
  if (!validos.length) return null;
  const elegido = elige(validos), vs = elegido.voces;
  const voz = v => dado ? `{ ${ly(vs[v][0])}2 \\analitico { ${blancas(vs[v].slice(1))} } }` : `\\analitico { ${blancas(vs[v])} }`;
  const cabeza = dado ? [] : ['solucionPosible = ##t'];
  return [...cabeza,
    `soprano   = ${voz(0)}`, `contralto = ${voz(1)}`, `tenor     = ${voz(2)}`,
    `bajo      = { ${blancas(vs[3])} }`,
    `respuestas = {\n  ${elegido.rotulos.map(r => `\\paso "${r}"`).join(' ')}\n}`].join('\n') + '\n';
}

// Realizar un bajo: una frase de la app, de 4 compases. Con `secuencia: sí`,
// Secuencia › Frase (nivel 2: 6/3 en la secuencia, V7, 6/4 cadencial); si no,
// 7.ª diatónica › Bajo dado (nivel 1: la 7.ª, en la cadencia). La licencia de
// la secuencia, aquí con su final exacto, que la ficha no dice.
function realizarBajo(reglas, key) {
  const inst = reglas.secuencia === 'sí' ? SEC.generar(2, 2, { key }) : SEPT.generarFrase(1, { key });
  if (!inst) return null;
  if (CK.comprobar(key, inst.acordes, inst.voces, { licencias: inst.licencias }).length) return null;
  const { voces, acordes, ritmo, est, lineas = [] } = inst;
  const ligada = v => k => lineas.some(l => l.v === v && l.notas.includes(k) && l.notas.includes(k + 1) &&
    voces[v][k].abs === voces[v][k + 1].abs);
  const compases = pinta => ritmo.compases.map(c => c.map(pinta).join(' ')).join(' | ');
  const sec = est.tramos.find(t => t.tipo === 'sec'), cad = est.tramos.find(t => t.tipo === 'cad');
  const encima = k => k === 0 && sec ? `\\encima "${sec.sec.nombre.replace('Círculo', 'C.')}" `
    : k === acordes.length - 1 ? `\\encima "${cad.real || cad.sigla}" ` : '';
  const superior = v => '\\analitico { ' + compases(({ k, dur }) =>
    (v === 0 ? encima(k) : '') + ly(voces[v][k]) + dur + (ligada(v)(k) ? '~' : '')) + ' }';
  const bajo = compases(({ k, dur }) => {
    const rom = `\\acorde "${acordes[k].romano}"`;
    return `${k === 0 ? `\\modelo ${rom} \\finModelo` : rom} ${ly(voces[3][k])}${dur}`;
  });
  return [`compas = { \\time ${ritmo.time}${ritmo.anacrusa ? ` \\partial ${ritmo.compases[0][0].dur}` : ''} }`,
    `soprano   = ${superior(0)}`, `contralto = ${superior(1)}`, `tenor     = ${superior(2)}`,
    `bajo = {\n  ${bajo} \\bar "|."\n}`].join('\n') + '\n';
}

const ADAPTADOR = {
  'grados-bajo-cifrado': gradosBajoCifrado,
  'construir-acordes': construirAcordes,
  'faltas-paralelas': faltasParalelas,
  'enlazar-acordes': enlazarAcordes,
  'realizar-bajo': realizarBajo,
};

/* ---------- una ficha ---------- */

const INTENTOS = 200;

// Las tonalidades de cada ejercicio: de las del modelo y, si se exigen, con
// tantas en menor como pida la cabecera. En un lote, repartidas: cada
// ejercicio toma solo de las que menos ha usado hasta ahora (o una más).
function tonalidades(modelo, n, global, lote) {
  const lista = (modelo.global.tonalidades || TON.delTrimestre(1).map(t => t.nombre));
  const usos = i => (lote[i] && lote[i].tonos) || {};
  const opciones = Array.from({ length: n }, (_, i) => {
    const u = usos(i), menos = Math.min(...lista.map(t => u[t] || 0));
    return lista.filter(t => (u[t] || 0) <= menos);
  });
  for (const listas of [opciones, opciones.map(() => lista)]) {
    for (let i = 0; i < INTENTOS; i++) {
      const tonos = listas.map(l => elige(l));
      const menores = tonos.filter(t => /menor$/.test(t)).length;
      const m = global && modelo.global.menores;
      if (!m || (menores >= m.min && menores <= m.max)) return tonos;
    }
  }
  throw new Error('no encuentro tonalidades que cumplan la cabecera del modelo');
}

// Huella de un ejercicio: el modo y los grados del bajo. Dos ejercicios con
// la misma huella son el mismo ejercicio, aunque cambien tonalidad u octava.
function huella(codigo, key) {
  const vars = V.variables(codigo), src = vars.bajo || vars.abajo;
  if (!src) return null;
  const t = LETRAS.indexOf(key.tonic[0]);
  const grados = V.leerVoz(src).map(e => (LETRAS.indexOf(e.altura.letter) - t + 7) % 7 + 1);
  return grados.length ? `${key.mode} ${grados.join('')}` : null;
}

// `usadas`: las huellas que ya salieron en ese ejercicio del lote; no se repiten.
function ejercicio(ap, tono, reglas, usadas = new Set()) {
  const f = ADAPTADOR[ap.attr.tipo];
  if (!f) throw new Error(`no hay adaptador para el tipo ${ap.attr.tipo}`);
  const key = TON.porNombre(tono), ctx = {};      // ctx: lo que se sortea una vez por ejercicio
  for (let i = 0; i < INTENTOS; i++) {
    const codigo = f(reglas, key, ctx);
    if (!codigo) continue;
    const h = huella(codigo, key);
    if (h && usadas.has(h)) continue;
    const r = V.comprobarApartado({ attr: { ...ap.attr, tono }, codigo });
    if (r.fallos.length || r.avisos.length || V.incumple(r.perfil, reglas).length) continue;
    return { codigo, huella: h, avisos: r.avisos, intentos: i + 1 };
  }
  return null;
}

function atributosLinea(attr) {
  return Object.entries(attr).map(([k, v]) => `${k}="${v}"`).join(' ');
}

// `lote`: lo que llevan las fichas anteriores del mismo lote, por ejercicio
// ({ tonos: {tono: veces}, huellas: Set }); generarFicha lo va llenando.
function generarFicha(modelo, numeroFicha, semilla, cuales, lote = []) {
  Math.random = aleatorio(semilla);
  const aps = modelo.apartados.filter((_, i) => !cuales || cuales.includes(i + 1));
  aps.forEach((_, i) => { lote[i] = lote[i] || { tonos: {}, huellas: new Set() }; });
  const tonos = tonalidades(modelo, aps.length, !cuales, lote);
  const n = String(numeroFicha).padStart(2, '0');
  const cab = modelo.cabecera;
  const partes = [
    '---',
    `title: "${cab.title} n.º ${n}"`,
    ...(cab.subtitle ? [`subtitle: "${cab.subtitle}"`] : []),
    '---', '',
    '<!-- guion:inicio -->', '',
    `> Generada con herramientas/generar-fichas.js del modelo ${modelo.nombre}` +
      ` (semilla ${semilla}${cuales ? `; solo los ejercicios ${cuales.join(', ')}` : ''}).`,
    '> No se edita a mano: se regenera.', '',
    '<!-- guion:fin -->', '',
  ];
  const avisos = [];
  aps.forEach((ap, i) => {
    const hecho = ejercicio(ap, tonos[i], ap.reglas, lote[i].huellas);
    if (!hecho) throw new Error(`ejercicio ${i + 1} (${ap.attr.tipo}): ningún intento cumple el modelo sin repetir el lote`);
    lote[i].tonos[tonos[i]] = (lote[i].tonos[tonos[i]] || 0) + 1;
    if (hecho.huella) lote[i].huellas.add(hecho.huella);
    hecho.avisos.forEach(a => avisos.push(`ejercicio ${i + 1}: ${a}`));
    const attr = { tipo: ap.attr.tipo, tono: tonos[i], ...(ap.attr.pide ? { pide: ap.attr.pide } : {}) };
    partes.push(`::: {.ejercicio ${atributosLinea(attr)}}`, '```lilypond', hecho.codigo.trimEnd(), '```');
    if (ap.nota) partes.push('', ap.nota);
    partes.push(':::', '');
  });
  return { texto: partes.join('\n'), avisos };
}

/* ---------- principal ---------- */

function main() {
  const args = process.argv.slice(2);
  const opcion = (nombre, defecto) => { const i = args.indexOf(nombre); return i >= 0 ? args[i + 1] : defecto; };
  const nombre = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
  if (!nombre) { console.error('Uso: node herramientas/generar-fichas.js <modelo> [--cuantas n] [--semilla s] [--salida dir] [--ejercicios 1,2]'); process.exit(2); }
  const fichero = fs.existsSync(nombre) ? nombre : path.join(RAIZ, 'fichas', 'modelos', nombre.replace(/\.md$/, '') + '.md');
  const modelo = V.leerModelo(fichero);
  if (modelo.errores.length) { modelo.errores.forEach(e => console.error(`✗ ${e}`)); process.exit(1); }
  modelo.cabecera = V.leerFicha(fichero).cabecera;
  const cuantas = +opcion('--cuantas', 10), semilla = +opcion('--semilla', 1);
  const cuales = opcion('--ejercicios') ? opcion('--ejercicios').split(',').map(Number) : null;
  const salida = opcion('--salida', path.join(RAIZ, 'tmp', 'generadas', modelo.nombre));
  fs.mkdirSync(salida, { recursive: true });
  const lote = [];
  for (let n = 1; n <= cuantas; n++) {
    const s = semilla * 1000 + n;
    const { texto, avisos } = generarFicha(modelo, n, s, cuales, lote);
    const destino = path.join(salida, `${modelo.nombre}-${String(n).padStart(2, '0')}.md`);
    fs.writeFileSync(destino, texto);
    console.log(`${path.relative(RAIZ, destino)} (semilla ${s})`);
    avisos.forEach(a => console.log(`  ! ${a}`));
  }
}

if (require.main === module) main();
module.exports = { generarFicha, ADAPTADOR, aleatorio };
