# Acordes (tríadas) — diseño

> Procede de `Generador-ejercicios.md` (dividido el 2026-10-05, ver `../../informes/2026-10-05-revision-tras-clase.md`). El modelo común —material, consigna, presentación, nivel; la página de ejercicio— está en `../Modelo-ejercicios.md`; aquí, solo lo propio de este material.

Hoy en el menú: 3.º UD 0, familia *Acordes* (Tipo y cifrado, Inversiones, Con grados).

⟶ DECIDIDO (2026-10-05):

- **Fuera el sentido *construir***, en todas las variantes: la alternancia al 50 % cambiaba la tarea sin aviso. Escribir acordes es trabajo de las fichas en papel. ⟶ HECHO (2026-10-06): siempre se ve el acorde y se nombra; las tres páginas, sobre la página común (`../Modelo-ejercicios.md` §2), y en *Con grados* la tonalidad pasa a la partitura como dato (`<reh type="dato">`, como en 4.º).
- **Sin niveles** (⟶ HECHO 2026-10-09; validación: `../../tests/masivo-acordes.js`, con
  las tres disposiciones por tercios): la clave y la disposición dejan de graduar. Pentagrama doble siempre; el acorde cae en el de Sol, en el de Fa (posición cerrada) o repartido (abierta: bajo en Fa, el resto en Sol). La UD 0 de 3.º queda entera sin niveles.

## Origen

Reubica la antigua familia 1 de la UD 1 (*Identificación de tríadas*):

- Un solo pentagrama (clave de Sol **o** de Fa).
- Tonalidad entre las válidas; accidentales solo la **sensible del modo menor**.
- Se muestra un **acorde tríada** → identificar **mayor / menor / disminuido / aumentado**.
- **Variante:** mostrar la tríada **invertida** → identificar **tipo + inversión**.

## Consignas

Reubica la antigua **familia 1** (tríadas de la UD 1). Tres variantes, paralelas a las de
Intervalos (simple · inversión · grados). En las dos primeras, tríadas **aisladas**, sin
tonalidad: fundamental libre con alteración simple (se rechazan los acordes que exigirían
dobles alteraciones, y las fundamentales Mi♯/Si♯/Fa♭/Do♭). Se ve el acorde y se nombra.
Disposiciones (antes eran los niveles): **1** clave de Sol y **2** clave de Fa (posición cerrada); **3** posición abierta
en pentagrama doble: el bajo en clave de Fa y las otras dos notas en clave de Sol, apiladas
ascendentes desde Do4, de modo que **nunca distan más de una 8.ª entre sí** (la distancia
grande, si la hay, queda entre el bajo y ellas).

- **Tipo y cifrado** (icono de tríada: tres notas apiladas con plica arriba): tríada en
  estado fundamental → tipo (mayor / menor / aumentada / disminuida) **y** cifrado
  americano (D♭m, F°, C+…). Fusiona las antiguas variantes *tipo* y *cifrado*: el
  cifrado no es más que fundamental + tipo.
- **Inversiones** (icono textual 6/4 apilado, como el bajo cifrado): acorde (cualquier
  estado) → inversión + cifrado («1.ª inversión · 6/3»; en el detalle, el cifrado americano
  con el bajo tras la barra, C/E). Los tres estados salen por igual. *(El sentido inverso
  daba el bajo con sus cifras y el tipo de tríada, y pedía el resto del acorde: el tipo
  hacía falta para la respuesta única —un 6/3 sobre Mi, sin tonalidad, puede ser Do
  mayor, Do♯ menor o Do♯ disminuido—. Fuera desde el 2026-10-06; la lectura de un bajo
  cifrado se trabaja en* Bajo cifrado *(3.º UD 1) y en papel.)*
- **Con grados** (icono «IV»: aquí el grado se nombra en romanos): tríada diatónica en **estado
  fundamental** dentro de una tonalidad (armadura en la partitura + nombre; las 4 del
  trimestre 1, como en Intervalos con grados) → modo, grado de la fundamental y tipo
  («Modo mayor · II grado · Tríada menor»; en el detalle, cifrado y nombres). En **menor, la sensible aparece solo en V y VII** (mayor y disminuida); **el III se
  toma de la escala natural** (mayor), no aumentado: es lo que verán en 3.º y evita
  explicar el III+. Es la única variante de la familia con armadura en el MEI (`keysig`),
  y en ella solo llevan accidental las notas ajenas a la armadura (la sensible).
  ⟶ ABIERTO: ampliar a inversiones (habría que hallar la fundamental antes; hoy es tarea
  de la variante *Inversiones*).
