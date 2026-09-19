// Sensibilidad del comprobador independiente (cuatro-voces-check.js):
// realizaciones escritas a mano con faltas deliberadas; cada caso debe
// producir al menos la regla esperada (y el caso limpio, ninguna). Sin esto,
// «cero infracciones» en la validación masiva no demostraría nada.
// Uso: node tests/sensibilidad-comprobador.js
const BASE=require('path').join(__dirname,'..','public')+'/';
const CV=require(BASE+'ejercicios/cuatro-voces-core.js'), CK=require(BASE+'ejercicios/cuatro-voces-check.js');
const L={c:0,d:1,e:2,f:3,g:4,a:5,b:6};
function tok(s){ const m=/^([a-g])(s*|f*)('*|,*)$/.exec(s); const alter=m[2].startsWith('s')?m[2].length:-m[2].length; const oct=3+(m[3].startsWith("'")?m[3].length:-m[3].length); return {abs:oct*7+L[m[1]], alter}; }
const voces=str=>str.split('|').map(v=>v.trim().split(/\s+/).map(tok));
const C={tonic:'C',sig:0,mode:'major'}, Am={tonic:'A',sig:0,mode:'minor'};
const ac=(k,ids)=>ids.map(id=>CV.acorde(k,{I:{grado:1},IV:{grado:4},V:{grado:5},V7:{grado:5,septima:true},V65:{grado:5,inv:1,septima:true},I64:{grado:1,inv:2,cadencial64:true},VI:{grado:6},II6:{grado:2,inv:1}}[id]));
const casos=[
 ['limpio',            C, ['I','IV','V7','I'], "e' f' d' c'|c' c' b g|g a f e|c f, g, c", []],
 ['N4 8.as S–B',       C, ['I','IV'],          "c'' f''|e' a'|g c'|c f", ['N4']],
 ['N4 5.as S–B (+N5)', C, ['I','IV'],          "g' c''|e' f'|c' a|c f", ['N4','N5']],
 ['N3 cruce',          C, ['I','IV'],          "e' a'|g' f'|c' c'|c f", ['N3']],
 ['N3 superposición',  C, ['I','IV'],          "e' c''|c' a'|g f'|c f", ['N3']],
 ['N7 sensible S',     C, ['V7','I'],          "b' g'|d' c'|f e|g, c", ['N7']],
 ['N7 sensible interna sin 1̂ arriba', C, ['V7','I'], "d'' e''|b' g'|f' e'|g c", ['N7']],
 ['N8 7.ª sube',       C, ['V7','I'],          "d'' c''|b' c''|f' g'|g c", ['N8']],
 ['N8 fund. dobla resolución', C, ['V7','I'],  "f' e'|d' c'|b g|g e", ['N8']],
 ['N1 tesitura',       C, ['I','V'],           "b'' b''|e' d'|g g|c g,", ['N1']],
 ['N2 distancia',      C, ['I','V'],           "c''' d''|e' d'|g g|c g,", ['N2']],
 ['N12 2.ª aum',       Am,['IV','V'],          "d'' e''|f' gs'|a b|d e", ['N12']],
 ['N13 salto 7.ª',     C, ['I','V'],           "c' b'|e' d'|g g|c g,", ['N13']],
 ['N9 4.ª del 6/4 no baja', C, ['I64','V'],    "c'' b'|e' g'|g' d'|g g", ['N9']],
 ['N9 6/4 bajo a otra nota', C, ['I64','V'],   "c'' b'|e' d'|g' g'|g b,", ['N9']],
 ['limpio 6/4 con 8.ª en el bajo', C, ['I64','V'], "c'' b'|e' d'|g g|g g,", []],
 ['N11 incompleto',    C, ['I','V'],           "c'' b'|e' d'|c' g|c g,", ['N11']],
 ['DUP sensible doblada', C, ['V','I'],        "b' c''|d' e'|b c'|g c", ['N7']],
 ['DUP 6/4 sin doblar bajo', C, ['I64','V'],   "e'' d''|c'' b'|e' d'|g g", ['DUP']],
 ['acorde ajena',      C, ['I','V'],           "c'' a'|e' d'|g g|c g,", ['acorde']],
 ['N6 dim→justa',      C, ['V65','I'],         "d'' c''|f' g'|g g|b, c", ['N6']],
];
let ok=0;
casos.forEach(([nombre,key,ids,v,esperado])=>{
  const f=CK.comprobar(key, ac(key,ids), voces(v));
  const reglas=[...new Set(f.map(x=>x.regla))];
  const bien = esperado.every(e=>reglas.includes(e)) && (esperado.length>0 || reglas.length===0);
  ok+=bien;
  console.log((bien?'OK  ':'FALLO')+' '+nombre.padEnd(36)+' esperado '+JSON.stringify(esperado).padEnd(14)+' obtenido '+JSON.stringify(reglas)+(f.length?'  · '+f.map(x=>x.texto).join(' / '):''));
});
console.log(ok+'/'+casos.length);
