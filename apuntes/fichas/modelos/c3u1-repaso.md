---
title: "3.º — UD 1 · Repaso"
subtitle: "Morfología y conducción de voces"
publico: true
tonalidades: 1.er trimestre
menores: al menos 1
---

<!-- guion:inicio -->

> Modelo de la ficha de repaso de la UD 1: de aquí salen las variantes
> generadas (plan en informes/2026-10-29-plan-fichas-generadas.md). Cada
> ejercicio es uno de una ficha de clase, con sus condiciones:
> 1 = c3u1-f2 (un solo apartado); 2 = c3u1-f3, ejercicio 3; 3 = c3u1-f5 d);
> 4 = c3u1-f6 c).
>
> Las condiciones se comprueban con
> `node herramientas/comprobar-fichas.js --modelo c3u1-repaso <ficha>`; las
> claves de cada tipo, en el VOCABULARIO de ese programa.
>
> Criterios que no son condiciones, porque los pone el generador: en menor,
> sin II ni III en estado fundamental; el 6/4, cadencial o de paso
> (bajo-cifrado-core.js); en enlazar, sin V–VI, VI–V ni III–IV (enlace-core.js).

<!-- guion:fin -->

::: {.ejercicio tipo="grados-bajo-cifrado"}
```condiciones
acordes: 8
invertidos: al menos 4
repetidos: como mucho 1
modelo: sí
```
:::

::: {.ejercicio tipo="construir-acordes" pide="mixta"}
```condiciones
acordes: 8
disposiciones: mixta (5.ª) 2, mixta (3.ª) 2, cerrada 2, abierta 2
primer acorde: dado
```
:::

::: {.ejercicio tipo="faltas-paralelas"}
```condiciones
voces: 4
sonoridades: 10
paralelas: 2
directas: 1
```

Busca también las 5.as y 8.as directas incorrectas entre las voces extremas
(8.ª dir.).
:::

::: {.ejercicio tipo="enlazar-acordes"}
```condiciones
acordes: 10
primer acorde: sin dar
enlaces: contr. al menos 1, 1 n.c. al menos 1, 2 n.c. al menos 1
```

Elige tú el primer acorde.
:::
