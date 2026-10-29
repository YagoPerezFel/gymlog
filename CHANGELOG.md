# Historial de versiones de GymLog

Resumen de cada versión publicada, con los cambios y correcciones principales.
La numeración empieza en **0.1.0** con la primera subida a GitHub. Hasta la 0.3.1 la app mostraba internamente otra numeración (2.x); la equivalencia está en la tabla del final.

Formato: `mayor.menor.parche`. Sube **menor** con funciones nuevas y **parche** con correcciones.

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
| 0.5.0 | 2.5.0 | este commit |
