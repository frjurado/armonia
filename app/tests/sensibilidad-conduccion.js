// Sensibilidad del comprobador general (conduccion-check.js): cada regla, con
// un caso que DEBE dar la falta y otro de control que no. Sin esto, «cero
// faltas» en una validación masiva no demostraría nada.
// Uso: node tests/sensibilidad-conduccion.js
const path = require('path');
const K = require(path.join(__dirname, '../public/ejercicios/conduccion-check.js'));

const L = ['C','D','E','F','G','A','B'];
// 'C4', 'F#4', 'Bb3' → {abs, alter}
const n = s => { const m=/^([A-G])([#b]?)(\d)$/.exec(s); return {abs:+m[3]*7+L.indexOf(m[1]), alter:m[2]==='#'?1:m[2]==='b'?-1:0}; };
const voz = s => s.trim().split(/\s+/).map(n);

let ok=0, mal=0;
function caso(nombre, voces, opciones, esperado){
  const fs = K.comprobar(voces.map(voz), opciones);
  const reglas = fs.map(f=>f.regla);
  const bien = esperado.every(r => r.startsWith('!') ? !reglas.includes(r.slice(1)) : reglas.includes(r));
  if(bien) ok++; else { mal++; console.log('✗', nombre, '→', JSON.stringify(fs.map(f=>f.regla+': '+f.texto))); }
}
const DOS = {roles:['soprano','bajo']};

// Control: un contrapunto correcto a dos voces no da ninguna falta.
caso('correcto', ['C5 D5 E5 D5 C5', 'C4 B3 C4 B3 C4'], DOS, ['!N3','!N4','!N5','!N12','!N13']);
// N4
caso('5.as paralelas', ['G4 A4', 'C4 D4'], DOS, ['N4']);
caso('8.as paralelas', ['C5 D5', 'C4 D4'], DOS, ['N4']);
caso('8.ª → unísono por contrario', ['C5 D4', 'C4 D4'], {roles:['soprano','contralto'], reglas:['N4']}, ['N4']);
caso('5.ª → 12.ª por contrario', ['G4 A5', 'C4 D3'], {reglas:['N4']}, ['N4']);
caso('control: 5.ª → 6.ª', ['G4 A4', 'C4 C4'], DOS, ['!N4']);
caso('control: 5.ª con voz quieta (oblicuo)', ['G4 G4', 'C4 C4'], DOS, ['!N4']);
// N5
caso('8.ª directa, soprano por salto', ['G4 C5', 'A3 C4'], DOS, ['N5']);
caso('control: 8.ª directa, soprano por grado', ['B4 C5', 'G3 C4'], DOS, ['!N5']);
caso('control: N5 desactivada a dos voces', ['G4 C5', 'A3 C4'], {roles:DOS.roles, reglas:['N4']}, ['!N5']);
caso('N5 no se repite si ya son paralelas', ['C5 D5', 'C4 D4'], DOS, ['!N5']);
// N3
caso('cruce', ['C4', 'E4'], DOS, ['N3']);
caso('superposición', ['E4 A4', 'C4 F4'], {roles:['soprano','contralto']}, ['N3']);
caso('control: sin superposición si se desactiva', ['E4 A4', 'C4 F4'], {roles:['soprano','contralto'], superposicion:false, reglas:['N3']}, ['!N3']);
// N2 / P2
caso('soprano–contralto a más de una 8.ª', ['E5', 'C4'], {roles:['soprano','contralto']}, ['N2']);
caso('control: tenor–bajo a una 12.ª', ['G4', 'C3'], {roles:['tenor','bajo']}, ['!N2']);
caso('control: soprano–bajo, no contiguas', ['E5', 'C3'], DOS, ['!N2']);
caso('unísono soprano/contralto', ['E4', 'E4'], {roles:['soprano','contralto']}, ['P2']);
caso('control: unísono tenor/bajo', ['C3', 'C3'], {roles:['tenor','bajo']}, ['!P2']);
// N1
caso('soprano fuera de tesitura', ['C6'], {roles:['soprano']}, ['N1']);
caso('control: bajo en Mi2', ['E2'], {roles:['bajo']}, ['!N1']);
// N12
caso('4.ª aumentada melódica', ['F4 B4 C5'], {roles:['soprano']}, ['N12']);
caso('2.ª aumentada melódica', ['F4 G#4 A4'], {roles:['soprano']}, ['N12']);
caso('control: 5.ª disminuida que resuelve hacia dentro', ['B4 F5 E5'], {roles:['soprano']}, ['!N12']);
caso('5.ª disminuida sin resolver', ['B4 F5 G5'], {roles:['soprano']}, ['N12']);
caso('4.ª aumentada descendente (si–fa)', ['B4 F4 E4'], {roles:['soprano']}, ['N12']);
caso('control: superposición, no cruce', ['E4 A4', 'C4 F4'], {roles:['soprano','contralto'], reglas:['N3'], superposicion:false}, ['!N3']);
// N13
caso('salto de 7.ª', ['C4 B4 A4'], {roles:['soprano']}, ['N13']);
caso('salto de 9.ª en el bajo', ['C3 D4 C4'], {roles:['bajo']}, ['N13']);
caso('control: 6.ª en la soprano', ['C4 A4 G4'], {roles:['soprano']}, ['!N13']);
caso('6.ª con tope de 5.ª (UD 1 a dos voces)', ['C4 A4 G4'], {roles:['soprano'], saltoMax:4}, ['N13']);
caso('control: 8.ª en el bajo', ['C3 C4 B3'], {roles:['bajo']}, ['!N13']);
// P9
caso('salto no compensado', ['C4 G4 A4'], {roles:['soprano']}, ['P9']);
caso('control: salto compensado', ['C4 G4 F4'], {roles:['soprano']}, ['!P9']);
caso('control: bajo tras salto de 8.ª', ['G2 G3 C3'], {roles:['bajo']}, ['!P9']);

// clasificar / movimiento
function igual(nombre, a, b){ if(a===b) ok++; else { mal++; console.log('✗', nombre, a, '≠', b); } }
igual('4.ª J sobre el bajo: D', K.clasificar(n('F4'), n('C4'), true).clase, 'D');
igual('4.ª J entre superiores: P', K.clasificar(n('F4'), n('C4'), false).clase, 'P');
igual('3.ª m: I', K.clasificar(n('Eb4'), n('C4'), true).clase, 'I');
igual('4.ª A: D', K.clasificar(n('B4'), n('F4'), true).clase, 'D');
igual('4.ª D (sol♯–do): D', K.clasificar(n('C5'), n('G#4'), true).clase, 'D');
igual('10.ª M: I', K.clasificar(n('E5'), n('C4'), true).clase, 'I');
igual('12.ª J: P', K.clasificar(n('G5'), n('C4'), true).clase, 'P');
igual('7.ª m: D', K.clasificar(n('Bb4'), n('C4'), true).clase, 'D');
igual('unísono: P', K.clasificar(n('C4'), n('C4'), true).clase, 'P');
igual('nombre de la 10.ª', K.clasificar(n('E5'), n('C4'), true).nombre, '10.ª mayor');
igual('movimiento contrario', K.movimiento(n('C5'), n('C4'), n('D5'), n('B3')), 'contrario');
igual('movimiento oblicuo', K.movimiento(n('C5'), n('C4'), n('D5'), n('C4')), 'oblicuo');
igual('paralelo: 3.ª M → 3.ª m', K.movimiento(n('E4'), n('C4'), n('F4'), n('D4')), 'paralelo');
igual('paralelo: 5.ª J → 5.ª J', K.movimiento(n('G4'), n('C4'), n('A4'), n('D4')), 'paralelo');
igual('movimiento directo', K.movimiento(n('E4'), n('C4'), n('A4'), n('D4')), 'directo');

console.log(`Sensibilidad del comprobador general: ${ok}/${ok+mal}`);
process.exit(mal ? 1 : 0);
