# Historial de versiones de GymLog

Resumen de cada versión publicada, con los cambios y correcciones principales.
La numeración empieza en **0.1.0** con la primera subida a GitHub. Hasta la 0.3.1 la app mostraba internamente otra numeración (2.x); la equivalencia está en la tabla del final.

Formato: `mayor.menor.parche`. Sube **menor** con funciones nuevas y **parche** con correcciones.

---

## 0.7.0 — Rutinas serie a serie y modo concentración · 30 oct 2026
**Crear rutinas**
- **Cada serie se configura por separado**: tipo (aproximación, normal, al fallo, drop set), repeticiones y, si quieres, kg. Si dejas los kg en «auto», se usan los de la última vez o la sugerencia.
- **Añadir varios ejercicios a la vez**: en el buscador se marcan todos los que quieras (se numeran en orden) y se añaden juntos. También funciona en el entreno en curso.
- **Duplicar rutina**: guarda la rutina y abre una copia para editarla.
- **Nota por ejercicio** (p. ej. "agarre neutro"), visible durante el entreno.
- **Ordenar arrastrando** desde el asa ⋮⋮. Cerca de los bordes de la pantalla la página se desplaza sola. Los ejercicios se pliegan para verlos de un vistazo.
- **Plan semanal**: asigna días a cada rutina. Inicio muestra «Hoy toca» con un botón para empezar (o «Hoy descanso · Próximo: …»), y Rutinas muestra la semana entera.

**Durante el entreno**
- **Modo concentración** (botón junto a ⋯): una serie cada vez, con la **foto del ejercicio animada** (posición inicial y final). También se ven la nota, el número de serie, lo que hiciste la última vez, botones grandes y «Serie hecha». Al marcarla pasa sola a la siguiente, y las flechas sobre la foto cambian de ejercicio.
- **Botones − / +** para el peso (saltos de 1,25, 2,5 o 5 kg; toca «±» para cambiarlo) y para las repeticiones.
- **Rellenar con la última vez**: por ejercicio (menú ⋯ o modo concentración) o para todo el entreno (menú del entreno).
- **El temporizador dice qué viene después** con el peso y las repeticiones previstas (p. ej. «Fondos con lastre · serie 1 · +20 kg × 8»).
- **Cambiar por otro parecido**: propone ejercicios de la misma familia o que trabajan los mismos músculos (p. ej. Fondos → Fondos con lastre, en anillas, flexiones diamante…). Las series ya hechas se quedan en el ejercicio original.
- **Series de aproximación automáticas** en ejercicios con peso, según los estudios:
  - 2 en el primer ejercicio de cada músculo (≈50 % × 6 y ≈80 % × 3);
  - 1 en los siguientes ejercicios de ese músculo (≈70 % × 4);
  - con lastre, el % se calcula sobre tu peso + lastre;
  - después de ellas, el descanso es corto (máximo 1 min).

  Se pueden desactivar por ejercicio en la rutina o añadir a mano desde el menú ⋯.

**Mejoras**
- La columna «Anterior» empareja las series por clase (aproximación con aproximación, trabajo con trabajo), así las aproximaciones no descolocan la comparación.
- Las rutinas antiguas se convierten solas al abrirlas; no se pierde nada.

---

## 0.6.1 — Deslizar para borrar · 30 oct 2026
**Nuevo**
- **Deslizar a la izquierda una serie** del entreno en curso (también los tramos de cardio) muestra un botón **Eliminar** que la quita del entreno.
- **Deslizar a la izquierda una rutina** en la pestaña Rutinas muestra **Eliminar**. Pide confirmación y el historial no se borra.
- Solo hay una fila abierta a la vez; tocar fuera la cierra. El desplazamiento vertical de la página sigue funcionando con normalidad.

---

## 0.6.0 — Perfil, medallas, niveles y estilo Kingdom · 30 oct 2026
**Nuevo**
- **Perfil de usuario** (botón con tu foto arriba a la derecha):
  - foto desde el móvil, nombre ("Hola, Yago" en Inicio) y título elegible;
  - medidas básicas y vitrina de medallas.
- **Experiencia y nivel**:
  - cada kg levantado (con tu peso corporal en calistenia) es 1 punto;
  - del nivel 1 al 2 hacen falta 2.000 kg, y cada nivel pide un 10 % más;
  - se calcula también con todo tu historial;
  - la barra de experiencia cambia según el estilo.
- **Títulos**: por nivel (Novato, Aprendiz, Constante, Guerrero, Veterano, Campeón, Élite, Titán, Leyenda, Mito, Inmortal), por medallas en nivel Maestro (p. ej. "Maestro de las dominadas") y por medallas secretas.
- **20 medallas con 6 niveles** (bronce, plata, oro, platino, diamante y maestro) en 5 categorías:
  - **Constancia**: entrenos, racha, objetivo semanal.
  - **Calistenia**: dominadas, fondos, flexiones, muscle up, pino, front lever, L-sit.
  - **Fuerza**: dominadas y fondos lastrados (% del peso), press banca, sentadilla y peso muerto (× tu peso).
  - **Volumen**: toneladas, sesión épica, récords.
  - **Cardio**: km en cinta, calorías.
  - Además, **4 secretas**.
- **Celebración al terminar un entreno**: experiencia ganada, subida de nivel y medallas nuevas.
- **Estilo Kingdom** (inspirado en Kingdom Hearts, con símbolos propios): fondo de retícula con corazones, coronas y estrellas, títulos góticos plateados, detalles dorados, botones tipo "menú de comandos", anillo verde como la barra de vida y **menú inferior con botones de comando** (el activo dorado y con corona).
- **Icono nuevo** de la app.
- **38 ejercicios de calentamiento y estiramiento** en español (antes solo existían en el catálogo en inglés):
  - **Calentamiento**: jumping jacks, skipping, talones al glúteo, escaladores, círculos articulares, rotaciones de tronco, inchworm, estiramiento más grande del mundo, gato-camello, band pull-apart, retracciones escapulares, puente de glúteo, dead bug, superman, molinos.
  - **Estiramientos** por tiempo: isquios, cuádriceps, flexores de cadera, glúteo, aductores, gemelos, pecho, hombro, tríceps, dorsales, espalda alta, antebrazos, postura del niño, torsión de columna, cintilla iliotibial, corredor, puntas de pies, cuello.
  - Suman calorías (MET 2,3 / 3,5 / 7,5), pero no cuentan en músculos, kg ni experiencia. Al añadirlos, el descanso empieza en 0.

**Cambiado**
- **Ventanas de aviso propias** en lugar de las del navegador (ya no aparece "yagoperezfel.github.io dice"). Al terminar un entreno:
  - sin series hechas: "No has completado ninguna serie. ¿Quieres terminar el entrenamiento?";
  - con series pendientes: "No has completado todas las series. ¿Quieres terminar el entrenamiento?";
  - con todas hechas: termina directamente.

---

## 0.5.1 — Correcciones de la primera prueba · 30 oct 2026
**Corregido**
- **No se podían guardar las medidas corporales** (detectado en iPhone, pero pasaba en todos los móviles desde la 0.3.0). Al pasar la altura al Perfil, *Guardar medidas* seguía buscando ese campo y daba error.
- **El buscador no encontraba los ejercicios con lastre** ("fondos con peso", "flexiones lastradas", "weighted dips"...). Ahora busca por palabras en cualquier orden, en singular o plural, y con sinónimos en español e inglés según el movimiento: lastre / lastrado / con peso / weighted, fondos / dips, flexiones / push ups, dominadas / pull ups / chin ups...

**Nuevo**
- **Dominadas supinas con lastre**, enlazadas con las supinas en el estimador y la progresión, igual que dominadas y fondos con su versión con lastre. Se añade sola a quien ya tenía datos.

---

## 0.5.0 — Estilos visuales · 29 oct 2026
**Nuevo**
- **Ajustes → Estilo** con tres temas que se aplican al instante:
  - **Oscuro**: el diseño de siempre.
  - **Claro**: fondo blanco, acento rojo-coral con degradados, iconos de colores (racha roja, trofeo amarillo, peso turquesa, avisos naranja...), fotos a color y series hechas en verde.
  - **Persona** (prototipo): rojo, negro y blanco; títulos con letras recortadas; tarjetas con borde blanco y sombra roja; botones inclinados; estrella roja en la pestaña activa y fondo de semitono con corte diagonal. Inspirado en el estilo, sin copiar elementos del juego.
- Fuente **Anton** para los títulos del estilo Persona.

**Técnico**
- Los colores fijos del CSS y del código pasan a variables (`--nav-bg`, `--sheet`, `--body-off`...), y cada tema las redefine con `:root[data-theme=...]`.
- Los iconos llevan la clase `i-<nombre>` para poder colorearlos por tema.

**Cambio de numeración**: desde esta versión la app usa la numeración 0.x (antes 2.x).

---

## 0.4.0 — Tipos de serie, RPE, progresión, gráficas y compartir · 29 oct 2026
**Nuevo**
- **Tipos de serie**: al tocar el número de una serie se puede marcar como *Calentamiento*, *Al fallo* o *Drop set*. El calentamiento no cuenta en kg, récords, mapa muscular ni estimador, pero sí en calorías.
- **RPE** (esfuerzo 6-10) por serie, visible como "@8".
- **Sugerencia de progresión** (doble progresión) en cada ejercicio, con botón *Aplicar*: subir peso, repetir y sumar una repetición, o pasar a la versión con lastre.
- **Gráficas de 8 semanas** en Progreso → Músculos: series del músculo elegido, kg y calorías por semana.
- **Compartir entreno**: imagen con cifras, ejercicios y mapa muscular, para compartir o guardar.

**Corregido**
- La sugerencia mostraba el peso redondeado (72,5 → 73 kg).

---

## 0.3.1 — Corrección de kg y músculos en calistenia · 29 oct 2026
**Corregido**
- Los ejercicios añadidos desde el catálogo en inglés (p. ej. *Weighted Pull Ups*, *Chin-Up*) no sumaban el peso corporal: 6 series con +20 kg contaban solo 120 kg.
- Esos mismos ejercicios marcaban solo "Espalda" en el mapa muscular.

**Nuevo**
- **Reconocimiento de movimientos por el nombre** (en español o inglés): dominadas, supinas, fondos, flexiones y variantes, muscle up, pike, pino, remo invertido y pistol. Cada uno recibe su % de peso corporal, sus músculos y su familia (para el estimador). Sentadillas y ejercicios con barra, máquina o polea no entran.
- Las dominadas marcan más músculos secundarios: bíceps, antebrazo, hombro y trapecio.
- **Migración automática**: se corrigen los ejercicios y entrenos ya guardados, recalculando los kg con el peso de cada fecha. Las ediciones manuales se respetan.

**Aclarado**
- Las calorías no dependen de los kg levantados (método MET del Compendio). Solo se corrigió el tipo de ejercicio, de pesas (3,5) a calistenia (3,8).

---

## 0.3.0 — Calistenia, calorías, mapa muscular y estimador · 29 oct 2026
**Nuevo**
- **39 ejercicios de calistenia**: fondos y dominadas con lastre, variantes de flexiones, pike push ups, HSPU, muscle up, remo invertido, pistol, L-sit, front lever, planche... Además, elíptica y escaladora en cardio.
- **Perfil** (sexo, edad, altura) y **metabolismo basal** con la fórmula de Harris-Benedict.
- **Calorías por serie** con los valores MET del Compendio 2024, sumadas en directo durante el entreno y guardadas en el historial.
- **Cinta por tramos** (minutos, km/h e inclinación) con las ecuaciones ACSM. El resto del cardio, por intensidad.
- **Kg levantados con peso corporal**: % del peso por ejercicio (flexiones 64 %, dominadas 100 %...) más el lastre.
- **Informe muscular semanal** con mapa del cuerpo de frente y espalda: azul 1-4 series, violeta claro 5-8, morado 9 o más. El músculo principal cuenta 1 serie y los secundarios ½.
- **Estimador de repeticiones** en Récords (fórmula de Epley sobre el peso total): cuántas repeticiones con X kg de lastre y cuánto lastre para N repeticiones.
- El catálogo de 873 ejercicios incluye músculos principales y secundarios.
- Editor de músculos y de % de peso corporal para cada ejercicio.

---

## 0.2.0 — Nuevo diseño y actualizaciones dentro de la app · 29 oct 2026
**Nuevo**
- **Rediseño completo**: estilo oscuro y serio, pantalla de inicio con widgets (semana, peso corporal, calendario de puntos de 3 meses, volumen, racha, último récord), iconos de línea y barra inferior flotante.
- **Calendario** con los días entrenados, que sustituye al historial.
- **Objetivo semanal** de entrenos.
- **Botón "Buscar nuevas actualizaciones"**: compara la versión con `version.json` en GitHub y actualiza sin borrar los datos. También avisa al abrir la app.
- La app arranca desde la caché del móvil: abre más rápido y funciona sin conexión.
- **Manual del código** (`MANUAL.md`).

---

## 0.1.1 — Instalar como app · 29 oct 2026
**Nuevo**
- Tarjeta **"Instala GymLog como una app"** con botón de instalación (Android/Chrome) e instrucciones para iPhone y para navegadores internos de otras apps.

---

## 0.1.0 — Primera versión publicada · 29 oct 2026
**Nuevo**
- App web instalable (PWA) que funciona sin conexión. Los datos se guardan en el móvil.
- **Rutinas** con ejercicios, series, repeticiones objetivo y descanso.
- **Entreno en curso**: peso y repeticiones por serie, columna "Anterior" con la última sesión y ejercicios añadidos sobre la marcha.
- **Temporizador de descanso** con sonido, vibración, notificación y pantalla siempre encendida.
- **Récords** con aviso durante el entreno: peso máximo, mejor serie, 1RM estimado y gráfica de evolución.
- **Medidas corporales** (peso, grasa, perímetros) con IMC y gráfica.
- **Fotos de ejercicios** y catálogo de 873 ejercicios (free-exercise-db).
- Historial, exportar e importar datos.

---

## Equivalencia de numeración

| Versión | Numeración antigua (interna) | Commit |
|---|---|---|
| 0.1.0 | — | `db74387` |
| 0.1.1 | — | `05ec02b` |
| 0.2.0 | 2.0.0 | `d72f806` (+ manual `0878e36`) |
| 0.3.0 | 2.1.0 / 2.2.0 | `5969f68` |
| 0.3.1 | 2.3.0 | `f6bc763` |
| 0.4.0 | 2.4.0 | `8763b87` |
| 0.5.0 | 2.5.0 | `f220405` |
| 0.5.1 | — | `f69256f` |
| 0.6.0 | — | `d44d8c3` |
| 0.6.1 | — | deslizar para borrar |
