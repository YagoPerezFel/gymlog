# Manual de GymLog

Guía para entender cómo está hecha la app, qué hace cada archivo y cada función, y cómo modificarla o publicar cambios.

**Versión descrita:** 0.6.0 · Historial de cambios: [CHANGELOG.md](CHANGELOG.md)
**App publicada:** https://yagoperezfel.github.io/gymlog/
**Código:** https://github.com/YagoPerezFel/gymlog

---

## Índice

1. [Qué tipo de app es](#1-qué-tipo-de-app-es)
2. [Lenguajes utilizados](#2-lenguajes-utilizados)
3. [Archivos del proyecto](#3-archivos-del-proyecto)
4. [Dependencias y servicios externos](#4-dependencias-y-servicios-externos)
5. [Funciones del navegador que usa (APIs)](#5-funciones-del-navegador-que-usa-apis)
6. [Cómo se guardan los datos](#6-cómo-se-guardan-los-datos)
7. [Cómo funciona `app.js` por dentro](#7-cómo-funciona-appjs-por-dentro)
8. [Referencia de funciones de `app.js`](#8-referencia-de-funciones-de-appjs)
9. [Acciones de los botones](#9-acciones-de-los-botones)
10. [El service worker (`sw.js`)](#10-el-service-worker-swjs)
11. [Sistema de actualizaciones](#11-sistema-de-actualizaciones)
12. [El diseño (`index.html` y CSS)](#12-el-diseño-indexhtml-y-css)
13. [Cómo probar la app en el ordenador](#13-cómo-probar-la-app-en-el-ordenador)
14. [Cómo publicar una versión nueva](#14-cómo-publicar-una-versión-nueva)
15. [Cambios habituales paso a paso](#15-cambios-habituales-paso-a-paso)
16. [Problemas frecuentes](#16-problemas-frecuentes)
17. [Glosario](#17-glosario)
18. [Calorías, kg levantados y mapa muscular (v0.3)](#18-calorías-kg-levantados-y-mapa-muscular-v03)
19. [Tipos de serie, RPE, progresión, gráficas y compartir (v0.4)](#19-tipos-de-serie-rpe-progresión-gráficas-y-compartir-v04)
20. [Estilos: oscuro, claro y Persona (v0.5)](#20-estilos-oscuro-claro-y-persona-v05)
21. [Perfil, medallas, experiencia y avisos propios (v0.6)](#21-perfil-medallas-experiencia-y-avisos-propios-v06)

---

## 1. Qué tipo de app es

GymLog es una **PWA** (*Progressive Web App*): una página web que el móvil puede **instalar como si fuera una app**. Tiene icono propio, se abre a pantalla completa y funciona sin conexión.

- **No necesita servidor propio ni base de datos.** Todo se ejecuta en el navegador del móvil.
- **Los datos se guardan en el propio móvil**, no en internet.
- **GitHub Pages** solo sirve los archivos (HTML, JS, imágenes) para que el móvil los descargue la primera vez.
- No hay que compilar nada: los archivos que ves en la carpeta son exactamente los que ejecuta el navegador.

```
 GitHub (código)  ──►  GitHub Pages (web pública)  ──►  Móvil (navegador)
                                                         ├─ ejecuta app.js
                                                         ├─ guarda los datos (localStorage)
                                                         └─ guarda una copia de la app (service worker)
```

---

## 2. Lenguajes utilizados

| Lenguaje | Dónde | Para qué |
|---|---|---|
| **HTML** | `index.html` | La estructura base de la página: dónde van el contenido, la barra inferior, el temporizador y las ventanas emergentes. |
| **CSS** | Dentro de `index.html`, en `<style>` | El diseño: colores, tamaños, tarjetas, animaciones, modo oscuro. |
| **JavaScript** | `app.js` y `sw.js` | Toda la lógica: pantallas, guardar datos, temporizador, récords, actualizaciones... |
| **JSON** | `manifest.json`, `version.json`, `catalog.json` | Archivos de datos y configuración (formato de texto con `{ "clave": valor }`). |
| **SVG** | `icon.svg` y los iconos dentro de `app.js` | Gráficos vectoriales (iconos y gráficas) que se ven nítidos a cualquier tamaño. |

Es **JavaScript "puro"** (en inglés *vanilla JS*): no usa frameworks como React o Vue ni librerías externas.

**Python** no forma parte de la app. Solo lo usé como herramienta para generar los iconos PNG y el archivo `catalog.json`.

---

## 3. Archivos del proyecto

```
AppGym/
├── index.html      Página principal: estructura HTML + todo el CSS (diseño)
├── medals.js       Medallas, experiencia, niveles, títulos y dibujo de las medallas
├── data.js         Datos fijos: músculos, ejercicios por defecto, valores MET, cardio y dibujo del cuerpo
├── app.js          Toda la lógica de la app (≈1400 líneas)
├── sw.js           Service worker: funcionamiento sin conexión, caché y notificaciones
├── manifest.json   Datos para instalar la app (nombre, icono, colores)
├── version.json    Versión publicada + lista de archivos (lo usa el botón de actualizar)
├── catalog.json    Catálogo de 873 ejercicios con foto (para el buscador del catálogo)
├── favicon.png     Icono de la pestaña del navegador
├── icon-180.png    Icono de iPhone (pantalla de inicio)
├── icon-192.png    Icono 192×192 (Android / iPhone)
├── icon-512.png    Icono 512×512 (pantalla de carga de Android)
├── README.md       Resumen corto del proyecto
├── CHANGELOG.md    Historial de versiones con los cambios de cada una
└── MANUAL.md       Este manual
```

### `catalog.json`
Es una lista de listas. Cada ejercicio tiene este formato:

```json
["Barbell_Curl", "Barbell Curl", "Bíceps", "barra", "w"]
//  id de la foto   nombre (inglés)  grupo    material  tipo
```

El **tipo** puede ser `w` (peso × reps), `r` (solo reps) o `t` (tiempo).

### `manifest.json`
Le dice al móvil cómo instalar la app: nombre (`GymLog`), iconos, color de fondo (`#000000`) y que se abra a pantalla completa (`"display": "standalone"`).

### `version.json`
```json
{
  "version": "0.5.0",
  "files": ["./", "index.html", "app.js", ...]
}
```
El botón "Buscar nuevas actualizaciones" lee este archivo para saber si hay versión nueva y qué archivos descargar. Ver [sección 11](#11-sistema-de-actualizaciones).

---

## 4. Dependencias y servicios externos

La app **no tiene dependencias que instalar**: no usa `npm`, `pip` ni nada parecido. Solo usa estos servicios externos, todos gratuitos:

| Servicio | Para qué | ¿Qué pasa sin él? |
|---|---|---|
| **GitHub Pages** | Aloja la web: `yagoperezfel.github.io/gymlog` | Ya instalada, la app sigue funcionando; solo no se podría instalar ni actualizar. |
| **jsDelivr** (`cdn.jsdelivr.net`) | Sirve las fotos de los ejercicios | Las fotos que ya viste siguen guardadas; las nuevas no cargarían. |
| **free-exercise-db** | Origen de las fotos y del catálogo. Licencia *Unlicense* (dominio público). | — |
| **Google Fonts** | La tipografía **Inter** | Se usa la fuente del sistema (SF Pro en iPhone, Roboto en Android). |

---

## 5. Funciones del navegador que usa (APIs)

Son capacidades que trae el propio navegador del móvil, sin instalar nada:

| API | Para qué la usa GymLog |
|---|---|
| **localStorage** | Guardar todos tus datos: rutinas, entrenos, medidas y ajustes. |
| **Service Worker** | Que la app funcione sin conexión y se pueda instalar. |
| **Cache Storage** | Guardar una copia de los archivos de la app y de las fotos. |
| **Notifications** | Avisar cuando termina el descanso. |
| **Web Audio** | Generar el pitido al terminar el descanso (sin archivos de sonido). |
| **Vibration** | Hacer vibrar el móvil al terminar el descanso (solo Android). |
| **Wake Lock** | Mantener la pantalla encendida durante el entreno. |
| **Storage persist** | Pedir al navegador que no borre los datos si le falta espacio. |
| **beforeinstallprompt** | Mostrar el botón "Instalar app" en Android/Chrome. |

---

## 6. Cómo se guardan los datos

Todo se guarda en **un único objeto JavaScript** llamado `db`, que se convierte a texto JSON y se guarda en `localStorage` bajo la clave **`gymlog_v1`**.

```js
db = {
  exercises: [ ... ],   // catálogo personal de ejercicios
  routines:  [ ... ],   // rutinas guardadas
  history:   [ ... ],   // entrenos terminados
  body:      [ ... ],   // medidas corporales
  active:    { ... },   // entreno en curso (null si no hay ninguno)
  settings:  { ... }    // ajustes
}
```

### Estructura de cada parte

**Ejercicio** (`db.exercises[]`)
```js
{ id: "lq3x9ab12", name: "Press banca", group: "Pecho", kind: "w", img: "Barbell_Bench_Press_-_Medium_Grip",
  mus: { p: ["chest"], s: ["triceps", "shoulders"] },  // músculos principales y secundarios
  bw: 0,          // % de peso corporal que se mueve (0,64 = 64 %); en "w" el peso escrito es lastre
  met: 0,         // MET propio (0 = automático según el tipo)
  cardio: "" }    // treadmill, bike, row, ellip, rope, stair... (solo ejercicios de cardio)
// kind: "w" = peso × reps, "r" = solo reps, "t" = tiempo en segundos, "c" = cardio en minutos
// img: id de la foto en el catálogo ("" si no tiene)
```

**Rutina** (`db.routines[]`)
```js
{ id: "...", name: "Pecho + Tríceps", items: [
    { exId: "lq3x9ab12", sets: 4, reps: "8-12", rest: 120 }   // rest = descanso en segundos
] }
```

**Entreno terminado** (`db.history[]`)
```js
{ id: "...", name: "Pecho + Tríceps", routineId: "...", start: 1761740000000, end: 1761743600000,
  exercises: [
    { exId: "...", name: "Press banca", kind: "w", sets: [ { w: 60, r: 8 }, { w: 62.5, r: 8, pr: true } ] }
  ] }
// start/end: fecha en milisegundos desde 1970 (formato estándar de JavaScript)
// w = peso, r = repeticiones (o segundos si kind es "t"), pr: true = fue récord
```

**Medida corporal** (`db.body[]`)
```js
{ id: "...", date: 1761740000000, weight: 80.4, height: 180, fat: 15, waist: 86, chest: 100, arm: 36, thigh: 58 }
// Solo existen los campos que rellenaste
```

**Entreno en curso** (`db.active`)
```js
{ id, name, routineId, start,
  exercises: [ { exId, rest: 90, target: "8-12", sets: [ { w: "60", r: "8", done: true, pr: "Peso máximo: 60 kg" } ] } ],
  timer: { end, total, label, fired } }   // temporizador de descanso (null si no hay)
```
Aquí los valores `w` y `r` son **texto**, tal cual los escribes. Se convierten a números al terminar el entreno.

**Perfil** (`db.profile`) — se usa para calorías y kg con peso corporal
```js
{ sex: "m", birthYear: 1996, height: 180 }   // sex: "m" hombre, "f" mujer. La edad se calcula con el año.
```
El peso sale del último registro de medidas corporales.

En los entrenos guardados se añaden `bodyKg` (tu peso ese día), `kcal` (calorías estimadas) y, en cada ejercicio, `bw`, `cardio` y `kcal`. Las series de cardio guardan `{ r: minutos, v: km/h, g: % inclinación }` (cinta) o `{ r: minutos, l: nivel de intensidad }`.

**Ajustes** (`db.settings`)
```js
{ rest: 90, sound: true, vibrate: true, notify: true, awake: true, weekGoal: 3 }
```

### Puntos importantes
- **Las actualizaciones de la app no tocan estos datos**, porque se guardan aparte del código.
- **Si borras los datos del navegador** o desinstalas la app, se pierden. Para eso está **Ajustes → Exportar datos**, que descarga un `.json` con todo el objeto `db`.
- **Compatibilidad hacia atrás:** la función `load()` completa los datos de versiones antiguas, y `migrateV3()` (v0.3) añade músculos, % de peso corporal y cardio a tus ejercicios, más los ejercicios nuevos de calistenia. Por ejemplo, añade `body: []` o `weekGoal: 3` si faltan, y pone la foto a los ejercicios de antes.

---

## 7. Cómo funciona `app.js` por dentro

### 7.1 Organización del archivo
`app.js` está dividido en secciones marcadas con comentarios `// ---------- Nombre ----------`:

| Sección | Contenido |
|---|---|
| Utilidades | Funciones pequeñas de formato (fechas, números, texto) |
| Iconos | Los iconos SVG y la función `ic()` que los dibuja |
| Datos por defecto | Los 44 ejercicios iniciales, la URL de las fotos, los campos de medidas |
| Datos | Variables de estado, `load()` y `save()` |
| Récords | Cálculo de marcas personales, racha y último récord |
| Vistas | Una función por pantalla que genera su HTML |
| Modal | Ventanas emergentes inferiores: menús, buscador, catálogo, visor de fotos |
| Entrenamiento | Empezar entreno y mover ejercicios |
| Temporizador | Cuenta atrás del descanso |
| Avisos | Sonido, vibración, notificaciones y pantalla encendida |
| Actualizaciones | Buscar y aplicar versiones nuevas |
| Acciones | Qué hace cada botón (objeto `A`) |
| Campos de texto | Qué pasa al escribir en un campo (`onField`) |
| Arranque | Lo que se ejecuta al abrir la app |

### 7.2 El ciclo de la app: estado → render → evento

La app sigue un patrón muy simple que se repite todo el rato:

```
  1. ESTADO           Las variables (db, view, draft...) dicen qué hay y qué pantalla se ve
        │
        ▼
  2. RENDER           render() llama a la función de la pantalla actual (vHome, vCalendar...)
        │             que devuelve un texto HTML, y lo mete en <main id="app">
        ▼
  3. EVENTO           Tocas un botón → se ejecuta su acción en el objeto A
        │             Escribes en un campo → onField() actualiza los datos
        ▼
  4. CAMBIO           La acción modifica el estado, llama a save() y a render()
        └──────────► vuelta al paso 2
```

### 7.3 Cómo saben los botones qué hacer: `data-a`

En vez de poner un "listener" a cada botón, todos los botones llevan un atributo **`data-a`** con el nombre de su acción:

```html
<button data-a="startRoutine" data-id="r1">▶</button>
```

Un único listener en todo el documento captura cualquier clic, lee `data-a` y ejecuta la función con ese nombre dentro del objeto `A`:

```js
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');          // el botón tocado (o su padre con data-a)
  if (!b || !A[b.dataset.a]) return;
  A[b.dataset.a](b, +b.dataset.i, +b.dataset.j, b.dataset.id, e);
});
```

Cada acción recibe: `(botón, i, j, id)`. Los valores `i`, `j` e `id` vienen de los atributos `data-i`, `data-j` y `data-id`. Por ejemplo, `data-i` es el número de ejercicio y `data-j` el número de serie.

**Para añadir un botón nuevo:** pon `data-a="miAccion"` en el HTML y añade `miAccion() { ... }` dentro del objeto `A`.

### 7.4 Cómo se guardan los campos de texto: `data-f`

Igual que los botones, cada campo editable lleva **`data-f`** con el nombre del dato que modifica:

```html
<input data-f="w" data-i="0" data-j="2">   <!-- peso del ejercicio 0, serie 2 -->
```

La función `onField()` recibe cada pulsación de tecla y, según `data-f`, guarda el valor en su sitio (`switch (f) { case 'w': ... }`).

Los campos **no vuelven a dibujar la pantalla** al escribir: así no se cierra el teclado.

### 7.5 Variables de estado principales

| Variable | Qué guarda |
|---|---|
| `db` | Todos los datos (ver sección 6) |
| `view` | Pantalla actual: `home`, `workout`, `routines`, `calendar`, `progress` o `settings` |
| `draft` | Copia de la rutina que estás editando (`null` si no editas ninguna) |
| `routTab` / `progTab` | Pestaña activa dentro de Rutinas (`routines` / `exercises`) y de Progreso (`records` / `body`) |
| `calMonth` / `calDay` | Mes que se ve en el calendario / día seleccionado (`"2026-10-29"`) |
| `openHist` / `openRec` | Entreno o récord desplegado |
| `catalog` | Catálogo de fotos (se descarga la primera vez que lo abres) |
| `pickCb` / `catMode` | Qué hacer cuando eliges un ejercicio en el buscador o en el catálogo |
| `updateInfo` | Datos de la versión nueva si hay una disponible |

### 7.6 Seguridad: `esc()`
Todo texto escrito por el usuario (nombres de rutinas, ejercicios...) pasa por **`esc()`** antes de meterse en el HTML. Así, un nombre como `<b>hola</b>` se muestra tal cual y no se interpreta como código.

---

## 8. Referencia de funciones de `app.js`

### Utilidades
| Función | Qué hace | Ejemplo |
|---|---|---|
| `$(selector)` | Atajo de `document.querySelector` | `$('#app')` |
| `uid()` | Genera un id único | `"lq3x9ab12"` |
| `esc(texto)` | Escapa caracteres HTML peligrosos | `esc('<b>')` → `&lt;b&gt;` |
| `num(valor)` | Texto a número aceptando coma decimal | `num('62,5')` → `62.5` |
| `norm(texto)` | Minúsculas y sin tildes, para buscar | `norm('Jalón')` → `jalon` |
| `fmt(segundos)` | Formato reloj | `fmt(95)` → `1:35` |
| `fdate(fecha)` | Fecha legible | `jue, 29 oct 2026` |
| `fkg(valor)` | Número con separador de miles | `fkg(3200)` → `3.200` |
| `dayKey(fecha)` | Fecha como clave de día | `"2026-10-29"` |
| `startOfDay` / `startOfWeek` | Inicio del día / del lunes de esa semana | — |
| `dayName(fecha)` | "Hoy", "Ayer", "Lunes" o la fecha | — |
| `agoText(fecha)` | "hoy", "ayer", "hace 3 días" | — |
| `cap(texto)` | Primera letra en mayúscula | `cap('octubre')` → `Octubre` |

### Iconos y gráficos
| Función | Qué hace |
|---|---|
| `ic(nombre, tamaño)` | Devuelve el SVG de un icono del objeto `ICONS` (`ic('plus', 20)`) |
| `ring(valor, total)` | Anillo de progreso del widget "Esta semana" |
| `lineChart(puntos, unidad)` | Gráfica de línea en SVG (récords y peso corporal) |
| `miniCalendars()` | Los 3 mini calendarios de puntos del inicio |
| `thumb(ejercicio)` | Miniatura del ejercicio: su foto, o un icono si no tiene |
| `imgUrl(id, n)` | URL de la foto `n` (0 = posición inicial, 1 = final) en jsDelivr |

### Datos
| Función | Qué hace |
|---|---|
| `load()` | Lee `db` de localStorage. Si no hay datos, crea los iniciales con los 44 ejercicios. Completa los datos de versiones antiguas. |
| `save()` | Guarda `db` en localStorage. Se llama tras cada cambio. |
| `exById(id)` | Busca un ejercicio por su id |
| `exInfo(x)` | Datos del ejercicio de un entreno (aunque lo hayas borrado del catálogo) |
| `lastSets(exId)` | Series de la última vez que hiciste ese ejercicio (columna "Anterior") |
| `setText(tipo, serie)` | Texto de una serie: `60 kg × 8`, `12 reps`, `45 s` |
| `workoutVolume(entreno)` | Kilos totales de un entreno (suma de peso × reps) |
| `latestBody(campo)` | Última medida registrada de un campo (p. ej. el peso) |

### Récords y estadísticas
| Función | Qué hace |
|---|---|
| `e1rm(peso, reps)` | **1RM estimado** con la fórmula de Epley: `peso × (1 + reps/30)` |
| `exStats(exId)` | Recorre el historial y calcula peso máximo, mejor 1RM, más reps, más volumen y la evolución por día |
| `checkPR(i, j)` | Al marcar ✓, comprueba si esa serie supera tus marcas. Devuelve el texto del récord o `null`. |
| `lastPR()` | Último récord conseguido (widget de inicio) |
| `weekStreak()` | Semanas seguidas con al menos un entreno |

### Vistas (pantallas)
Cada una devuelve el HTML de su pantalla como texto:

| Función | Pantalla |
|---|---|
| `render()` | Dibuja la pantalla actual, marca el icono activo de la barra y actualiza el temporizador |
| `header(título, botones, subtítulo)` | Cabecera grande de cada pantalla |
| `vHome()` | Inicio con widgets |
| `vWorkout()` + `exCard()` | Entreno en curso + tarjeta de cada ejercicio con sus series |
| `vRoutines()` + `routineCard()` | Lista de rutinas, editor de rutina y pestaña Ejercicios |
| `vExercises()`, `exList()`, `filterEx()`, `grouped()` | Lista de ejercicios agrupada por músculo y su buscador |
| `vCalendar()` + `histCard()` | Calendario mensual y tarjetas de entrenos |
| `vProgress()`, `vRecords()`, `vBody()` | Progreso: récords y medidas corporales |
| `vSettings()` | Ajustes |
| `installCard()` | Tarjeta "Instala GymLog como una app" (se oculta si ya está instalada) |
| `updateBanner()` | Aviso de versión nueva |

### Ventanas emergentes (modal)
| Función | Qué hace |
|---|---|
| `showModal(html)` / `closeModal()` | Abre / cierra la hoja inferior |
| `openSheet(título, opciones)` | Menú de opciones (p. ej. el botón ⋯ de un ejercicio) |
| `openPicker(callback)` + `pickList()` | Buscador para elegir un ejercicio. Al elegirlo llama a `callback(id)`. |
| `openCatalog(modo)` + `catList()` | Catálogo de 873 ejercicios con foto. El modo `add` añade el ejercicio y el modo `img` cambia su foto. |
| `openViewer(ejercicio)` | Visor de la foto grande, que alterna las 2 posiciones cada segundo |

### Entreno y temporizador
| Función | Qué hace |
|---|---|
| `startWorkout(nombre, ejercicios, rutinaId)` | Crea `db.active` y abre la pantalla de entreno |
| `nextLabel(i, j)` | Texto "Siguiente: …" del temporizador |
| `moveItem(lista, i, dirección)` | Sube o baja un elemento de una lista |
| `startTimer(segundos, texto)` | Arranca el descanso |
| `renderTimer()` | Dibuja el temporizador: tiempo, anillo y texto |
| `tick()` | Se ejecuta cada 0,5 s: actualiza el cronómetro, y lanza el aviso cuando el descanso llega a 0 |

> El temporizador guarda la **hora de fin** (`timer.end`), no los segundos que quedan. Así, aunque el móvil pause la app, al volver calcula bien el tiempo restante.

### Avisos
| Función | Qué hace |
|---|---|
| `unlockAudio()` | Activa el audio con tu primer toque, porque los navegadores no dejan sonar nada antes |
| `beep()` | Genera 3 pitidos con Web Audio |
| `notify(título, texto)` | Muestra una notificación a través del service worker |
| `alarm(texto)` | Pitido + vibración + notificación, según los ajustes |
| `askNotifPermission()` | Pide permiso de notificaciones |
| `keepAwake()` / `releaseAwake()` | Activa / desactiva "pantalla siempre encendida" durante el entreno |
| `toast(texto)` | Mensaje flotante temporal arriba (p. ej. "Nuevo récord") |

### Actualizaciones
| Función | Qué hace |
|---|---|
| `checkUpdate(manual)` | Descarga `version.json` y compara con `APP_VERSION`. Si `manual` es `true`, te avisa del resultado. |
| `applyUpdate()` | Descarga los archivos nuevos, los guarda en la caché y recarga la app |

### Campos de texto
| Función | Qué hace |
|---|---|
| `onField(evento)` | Guarda lo que escribes según el `data-f` del campo. También gestiona los interruptores de Ajustes y la importación de datos. |

---

## 9. Acciones de los botones

Todas están en el objeto **`A`** de `app.js`:

| Grupo | Acciones |
|---|---|
| Navegación | `nav`, `go`, `goBody`, `routTab`, `progTab`, `newRoutineGo` |
| Entreno | `startEmpty`, `startRoutine`, `addEx`, `addSet`, `delSet`, `toggle` (marcar serie ✓), `exMenu`, `wkMenu`, `finish`, `saveAsRoutine`, `discard` |
| Temporizador | `tMinus` (−15 s), `tPlus` (+15 s), `tSkip` (cerrar) |
| Rutinas | `newRoutine`, `editRoutine`, `rAddEx`, `rMove`, `rDel`, `rSave`, `rCancel`, `rDelete` |
| Ejercicios | `addExercise`, `exEdit`, `pick`, `pickNew`, `viewEx` |

**Buscador de ejercicios** (`filterEx()` + `searchText()`): cada palabra de la búsqueda debe aparecer en el nombre, el grupo o los sinónimos del movimiento (`FAM_ALIASES` y `WEIGHTED_ALIASES` en `data.js`), en cualquier orden y en singular o plural. Palabras como "con" o "de" se ignoran (`STOP`).
| Catálogo | `catAdd`, `catFromPick`, `catImg`, `catPick` |
| Calendario | `calMove` (mes anterior/siguiente), `calDay`, `hToggle`, `hDel` |
| Progreso | `recToggle`, `bodySave`, `bodyDel` |
| Ajustes | `testAlarm`, `export`, `reset`, `askNotif`, `install`, `copyLink`, `checkUpdate`, `applyUpdate` |
| Modal | `sheet` (opción de un menú), `closeModal` |

### Qué pasa al tocar ✓ en una serie (`toggle`)
1. Marca la serie como hecha.
2. Si dejaste kg o reps vacíos, usa el valor sugerido: lo de la vez anterior o el objetivo de la rutina.
3. Llama a `checkPR()`. Si es récord, guarda el texto y muestra el aviso.
4. Si el ejercicio tiene descanso, arranca el temporizador con `startTimer()`.
5. Guarda (`save()`) y redibuja (`render()`).

### Qué pasa al tocar "Terminar entrenamiento" (`finish`)
1. Se queda solo con las series marcadas y convierte los textos a números.
2. Lo añade a `db.history` y borra `db.active`.
3. Te lleva al calendario, con el día de hoy seleccionado.

---

## 10. El service worker (`sw.js`)

Un **service worker** es un pequeño programa que el navegador ejecuta "por detrás" de la app. Se sitúa entre la app e internet y decide de dónde sacar cada archivo.

### Qué hace el de GymLog

| Evento | Qué hace |
|---|---|
| `install` | La primera vez, descarga todos los archivos de la app y los guarda en la caché `gymlog-app` |
| `activate` | Borra las cachés de versiones antiguas, pero conserva `gymlog-app` y `gymlog-img` |
| `fetch` | Cada vez que la app pide un archivo, decide de dónde sacarlo (ver la tabla siguiente) |
| `notificationclick` | Al tocar una notificación, abre o enfoca la app |

### De dónde saca cada archivo (`fetch`)

| Tipo de archivo | Estrategia |
|---|---|
| **Archivos de la app** (html, js, json, iconos) | **Primero la caché.** Por eso abre al instante y funciona sin conexión. |
| **Fotos de ejercicios** | **Primero la caché.** Si no está, la descarga y la guarda en `gymlog-img`. |
| **Descargas de actualización** (llevan `?t=...`) | **Directo a internet**, sin pasar por la caché |
| **Fuente Inter** | **Primero internet**; si no hay conexión, la caché |

---

## 11. Sistema de actualizaciones

Como la app sale de la caché, los cambios que subas a GitHub **no llegan solos**. Para eso está el sistema de versiones:

```
  app.js tiene:        APP_VERSION = '0.5.0'      ← la versión que tienes instalada
  version.json tiene:  "version": "0.5.1"         ← la última publicada en GitHub

  ¿Son distintas? ──► sí ──► hay actualización
```

### Funcionamiento
1. **Al abrir la app** (con internet), `checkUpdate(false)` mira en silencio si hay versión nueva. Si la hay, aparece el aviso "Nueva versión X" en Inicio y en Ajustes.
2. **Al pulsar "Buscar nuevas actualizaciones"**, `checkUpdate(true)` hace lo mismo y, si hay versión nueva, te pide confirmación.
3. `applyUpdate()` descarga cada archivo de la lista `files` de `version.json` y lo guarda en la caché, sustituyendo el antiguo.
   - Las descargas llevan `?t=<hora>` para saltarse cualquier copia antigua guardada por el camino.
4. Recarga la página, que ya arranca con los archivos nuevos.

**Los datos no se tocan en ningún momento:** viven en localStorage y la actualización solo cambia la caché de archivos.

---

## 12. El diseño (`index.html` y CSS)

### Estructura HTML
`index.html` solo tiene el esqueleto. El contenido lo genera `app.js`:

```html
<main id="app"></main>          ← aquí se dibuja cada pantalla
<div id="timer">...</div>       ← temporizador flotante de descanso
<nav id="nav"></nav>            ← barra inferior (los iconos los pone app.js)
<div id="toast"></div>          ← mensajes flotantes
<div id="modal">...</div>       ← hoja inferior para menús, buscador y catálogo
```

### Colores (variables CSS)
Todos los colores están definidos una sola vez al principio del CSS, en `:root`. **Para cambiar el aspecto de toda la app basta con cambiar estas líneas:**

```css
--bg:#000;         /* fondo */
--card:#141414;    /* fondo de las tarjetas (parte de abajo del degradado) */
--card-hi:#1b1b1b; /* fondo de las tarjetas (parte de arriba) */
--field:#232323;   /* campos de texto */
--tx:#f5f5f7;      /* texto principal */
--mut:#8e8e93;     /* texto secundario (gris) */
--dim:#48484a;     /* elementos apagados */
--ac:#fff;         /* color de acento (botones principales, ✓, anillos) */
--on-ac:#000;      /* texto encima del acento */
--dan:#ff453a;     /* rojo para borrar */
--r:26px;          /* redondeo de las tarjetas */
```

### Clases CSS principales
| Clase | Qué es |
|---|---|
| `.w` | Widget (tarjeta de inicio). `.w.sq` = cuadrado, `.w.wide` = ancho completo |
| `.card` | Tarjeta normal |
| `.round` | Botón redondo. `.round.light` = blanco, `.round.sm` = pequeño |
| `.btn` | Botón. `.btn.primary` = blanco, `.btn.ghost` = transparente, `.btn.block` = ancho completo |
| `.srow` | Fila de una serie en el entreno. `.srow.done` = serie completada |
| `.seg` | Selector de pestañas (Rutinas/Ejercicios, Récords/Cuerpo) |
| `.calgrid` / `.cday` | Calendario y cada uno de sus días |
| `.mcal` / `.dot` | Mini calendarios de puntos del inicio |
| `svg.i` | Icono |

### Iconos
Los iconos están dibujados a mano como trazos SVG en el objeto **`ICONS`** de `app.js`. Para usarlos se escribe `ic('nombre')`. Disponibles:

`grid, dumbbell, calendar, chart, sliders, plus, back, chevL, chevR, play, check, x, more, timer, trophy, flame, scale, ruler, trash, edit, up, down, refresh, download, upload, bell, phone, book, image, copy`

---

## 13. Cómo probar la app en el ordenador

Abrir `index.html` con doble clic **no funciona bien**, porque el service worker exige un servidor. Usa el servidor que trae Python:

```bash
cd AppGym
python -m http.server 8000
```

Abre **http://localhost:8000** en Chrome.

- Para verla con tamaño de móvil: **F12 → icono de móvil** (arriba a la izquierda del panel), o `Ctrl+Shift+M`.
- La pestaña **Application** de F12 es muy útil:
  - **Local Storage** → `gymlog_v1`: ves y editas tus datos.
  - **Service Workers**: marca *"Update on reload"* mientras programas. Si no, el service worker te servirá la versión vieja de la caché.
  - **Cache Storage**: los archivos guardados.
- La pestaña **Console** muestra los errores de JavaScript.

---

## 14. Cómo publicar una versión nueva

Cada vez que cambies algo y quieras que llegue a tu móvil:

1. **Haz los cambios** y pruébalos en local (sección 13).
2. **Sube el número de versión en los dos sitios.** Tienen que coincidir:
   - `app.js` → `const APP_VERSION = '0.5.1';`
   - `version.json` → `"version": "0.5.1"`
3. **Si añadiste un archivo nuevo** que la app necesita, añádelo a la lista `files` de `version.json` y a `FILES` en `sw.js`.
4. **Sube a GitHub:**
   ```bash
   git add -A
   git commit -m "v0.5.1: descripción del cambio"
   git push
   ```
5. **Espera 1–2 minutos** a que GitHub Pages lo publique. Puedes comprobarlo abriendo `https://yagoperezfel.github.io/gymlog/version.json`.
6. **En el móvil:** Ajustes → *Buscar nuevas actualizaciones*, o acepta el aviso que aparece al abrir la app.

**Convención de versiones** (`mayor.menor.parche`):
- `0.5.1`: arreglo pequeño.
- `0.6.0`: función nueva.
- `1.0.0`: versión estable completa.

**Apunta cada versión en [CHANGELOG.md](CHANGELOG.md)** (qué se añadió y qué se corrigió). En GitHub, cada versión tiene su etiqueta (`v0.5.0`...) y su página en *Releases*.

> ⚠️ Si se te olvida subir la versión, la app del móvil no sabrá que hay cambios.

---

## 15. Cambios habituales paso a paso

### Añadir un ejercicio a la lista inicial
En `app.js`, dentro de `DEFAULT_EX`, añade una línea `[nombre, grupo, tipo, foto]`:
```js
['Remo Gironda', 'Espalda', 'w', 'Seated_Cable_Rows'],
```
Para la foto, busca el id en `catalog.json` (es el primer valor de cada fila).

> Esto solo afecta a usuarios nuevos. En tu móvil, añade el ejercicio desde la app: Rutinas → Ejercicios.

### Cambiar el color de acento
En `index.html`, cambia `--ac:#fff;` por otro color, por ejemplo `--ac:#4ade80;` (verde). Ajusta también `--on-ac`, el color del texto encima del acento, para que se lea bien.

### Cambiar el descanso por defecto o el objetivo semanal iniciales
En `load()`: `{ rest: 90, ..., weekGoal: 3 }`. Tú también puedes cambiarlos desde Ajustes.

### Añadir un widget nuevo al inicio
En `vHome()`, dentro de `<div class="wgrid">`, añade por ejemplo:
```js
<div class="w sq"><span class="wico">${ic('timer', 20)}</span>
  <div class="big">${db.history.length}</div>
  <div class="wfoot"><b>Entrenos totales</b><small>desde el principio</small></div></div>
```

### Añadir un campo de medida corporal
Añade una entrada a `BODY_FIELDS` en `app.js`: `['calf', 'Gemelo', 'cm']`. El formulario y la lista se generan solos.

### Cambiar el sonido del aviso
En `beep()`: `o.frequency.value` es el tono en Hz, la lista `[0, 0.3, 0.6]` son los momentos de cada pitido, y `o.type` puede ser `'sine'` (suave) o `'square'` (fuerte).

---

## 16. Problemas frecuentes

| Problema | Causa y solución |
|---|---|
| Hice cambios y no los veo en el PC | El service worker sirve la caché. En F12 → Application → Service Workers, marca "Update on reload", o "Unregister" y recarga. |
| Subí cambios y el móvil no se actualiza | Comprueba que subiste `APP_VERSION` y `version.json` y que coinciden. Luego pulsa "Buscar nuevas actualizaciones". |
| "No se pudo comprobar si hay actualizaciones" | No hay conexión, o GitHub Pages aún no ha publicado. Espera un par de minutos. |
| No suena el aviso | En iPhone, el modo silencio corta el sonido de las webs. Toca la pantalla al menos una vez tras abrir la app (los navegadores lo exigen). |
| No llegan notificaciones | Permiso denegado (actívalo en los ajustes del navegador). En iPhone solo funcionan con la app instalada desde Safari. |
| El temporizador se retrasa con la pantalla bloqueada | El móvil pausa las webs en segundo plano. Deja activado "Mantener la pantalla encendida". |
| No aparece "Instalar app" | Estás en el navegador interno de otra app. Ábrela en Chrome (Android) o Safari (iPhone). |
| Quiero pasar mis datos a otro móvil | Ajustes → Exportar datos en el viejo; en el nuevo, Ajustes → Importar datos. |

---

## 17. Glosario

| Término | Significado |
|---|---|
| **PWA** | *Progressive Web App*: web que se instala y funciona como una app |
| **localStorage** | Almacén de texto del navegador, propio de cada web, donde guardamos los datos |
| **Service worker** | Script que corre en segundo plano y controla la caché y las notificaciones |
| **Caché** | Copia local de archivos para no descargarlos cada vez |
| **JSON** | Formato de texto para datos: `{"nombre": "valor", "lista": [1, 2]}` |
| **SVG** | Formato de imagen vectorial escrito como texto (no se pixela) |
| **CDN** | Red de servidores que sirve archivos rápido desde cualquier país (jsDelivr) |
| **Render** | Dibujar la pantalla a partir del estado |
| **Template literal** | Texto JS entre comillas invertidas con huecos `${...}`. Así se genera el HTML: `` `<b>${nombre}</b>` `` |
| **Arrow function** | Forma corta de función: `x => x * 2` |
| **async / await** | Forma de esperar operaciones lentas (descargas, permisos) sin bloquear la app |
| **1RM** | Peso máximo que podrías levantar a 1 repetición (aquí, estimado con la fórmula de Epley) |
| **Volumen** | Suma de peso × repeticiones |
| **Commit / push** | Guardar una versión del código en git / subirla a GitHub |

---

## 18. Calorías, kg levantados y mapa muscular (v0.3)

### 18.1 Kg levantados
```
kg de una serie = (% peso corporal × tu peso) + peso escrito (barra o lastre)
kg del entreno  = suma de (kg de cada serie × repeticiones)
```
- **Pesas** (press banca, sentadilla...): % peso corporal = 0, cuenta solo el peso de la barra.
- **Calistenia**: dominadas, fondos y pino 100 %; flexiones 64 %, declinadas 74 %, inclinadas 41 %, de rodillas 49 % (Ebben et al., 2011); pike push ups 75 % y elevadas 85 %; sentadilla y zancadas 88 % (todo el cuerpo menos piernas por debajo de la rodilla); remo invertido 60 % (estimado).
- **Con lastre** (fondos/dominadas con lastre): la columna se llama **+kg** y se suma a tu peso.
- Puedes cambiar el % de cualquier ejercicio: Rutinas → Ejercicios → el ejercicio → *Peso corporal*.
- **Reconocimiento automático (v0.3.1)**: los ejercicios del catálogo o creados por ti se reconocen por el nombre, en español o inglés (*pull up*, *dominada*, *chin up*, *dips*, *fondos*, *push up*, *flexiones*, *muscle up*, *pike*, *handstand push up*, *inverted row*, *pistol*...). Así reciben su % de peso corporal, sus músculos y su familia para el estimador. Ejercicios con barra, máquina o polea, y las sentadillas, quedan fuera. Las reglas están en `MOVES` (`data.js`) y se aplican con `moveOf()` y `applyMove()`.
- Si editas a mano los músculos o el % de un ejercicio (`musUser` / `bwUser`), la app no lo vuelve a cambiar.
- `migrateV4()` recalculó los entrenos anteriores con tu peso de ese día (`bodyWeightAt()`).

Funciones: `setLoad()`, `workoutVolume()`, `activeTotals()`.

### 18.2 Calorías
Se calculan serie a serie y se van sumando mientras entrenas:

```
kcal de una serie = MET del ejercicio × metabolismo basal por minuto × duración (min)
duración           = 3 s por repetición (mínimo 10 s) + el descanso que la sigue (máx. 5 min)
metabolismo basal  = Harris-Benedict con sexo, edad, altura y peso (kcal/día ÷ 1440)
```
- **MET** (Compendio de Actividades Físicas 2024): pesas 3,5; sentadilla/peso muerto 5,0; calistenia 3,8; pliometría y burpees 7,5; core y estáticos 2,8. Están en el objeto `MET` de `data.js`.
- **Las calorías no dependen de los kg levantados**: el método del Compendio usa el tipo de ejercicio (MET), el tiempo y tu metabolismo (peso, altura, edad y sexo). Levantar más peso se nota en el récord y en los kg, pero no cambia la estimación de calorías.
- El descanso se incluye porque los MET del Compendio para entrenamiento de fuerza corresponden a sesiones con descansos.
- Sin sexo/edad/altura se usa el valor estándar (1 MET = 3,5 ml O₂/kg/min). Sin peso no se calculan.

**Cinta** — ecuaciones del ACSM con velocidad (km/h) e inclinación (%) por tramo:
```
caminar (< 7 km/h):  VO2 = 0,1·v + 1,8·v·incl + 3,5     (v en m/min, incl en decimal)
correr  (≥ 7 km/h):  VO2 = 0,2·v + 0,9·v·incl + 3,5
MET = VO2 / 3,5   →   kcal = MET × metabolismo basal por minuto × minutos
```
**Resto de cardio** — por minutos e intensidad, con los MET del Compendio (objeto `CARDIO` en `data.js`): bicicleta 5,0/6,8/10,3; remo 5,0/7,5/11,0; elíptica 5,0/9,0; comba 8,3/11,8/12,3; escaladora 9,3.

Funciones: `profile()`, `rmrPerMin()`, `treadmillMET()`, `exMET()`, `setKcal()`, `activeTotals()`, `histKcal()`.

> Son **estimaciones**: el gasto real varía según la técnica, el ritmo y la persona (±10-20 %).

### 18.3 Mapa e informe muscular
- Cada ejercicio tiene músculos **principales** y **secundarios** (`mus`). Por cada serie hecha, el principal suma **1 serie** y cada secundario **½**. Las repeticiones se reparten igual.
- Se cuenta la semana de lunes a domingo, incluido el entreno en curso.
- Colores: **azul** 1-4 series, **violeta claro** 5-8, **morado** 9 o más (`musColor()`).
- 16 grupos musculares (objeto `MUSCLES` en `data.js`), cada uno asociado a zonas del dibujo.
- El dibujo (`BODY` en `data.js`) son polígonos SVG de *react-body-highlighter* (licencia MIT); `bodySvg()` los pinta.
- Los ejercicios del catálogo traen sus músculos de *free-exercise-db*. Para cambiar los de cualquier ejercicio: Rutinas → Ejercicios → el ejercicio → *Músculos trabajados*.

Funciones: `musOf()`, `weekMuscles()`, `musColor()`, `bodySvg()`, `vMuscles()`, `homeMuscles()`, `openMuscleEditor()`.

### 18.4 Estimador de repeticiones (Progreso → Récords, v0.3)
Al abrir el récord de un ejercicio con peso o con peso corporal aparece una tabla de repeticiones estimadas y dos calculadoras: "con X kg → cuántas reps" y "para N reps → cuántos kg".

```
1RM (kg totales) = peso total × (1 + reps / 30)            ← fórmula de Epley, con tu mejor serie
reps con un peso = 30 × (1RM / peso total − 1)
peso para N reps = 1RM / (1 + N / 30)
peso total       = % peso corporal × tu peso actual + lastre   (en pesas: el peso de la barra)
```
Ejemplo: pesas 80 kg y haces 5 dominadas con +40 kg → 1RM = 120 × (1 + 5/30) = 140 kg → sin lastre: 30 × (140/80 − 1) ≈ 22 dominadas.

- Las variantes del mismo movimiento comparten datos (objeto `FAMILY` en `data.js`): *Dominadas* ↔ *Dominadas con lastre*, *Fondos* ↔ *Fondos con lastre*, *Flexiones* ↔ *Flexiones con lastre*.
- Es más fiable entre 1 y 12 repeticiones; con más de 15 es orientativo.

Funciones: `famOf()`, `strengthModel()`, `repsAt()`, `loadFor()`, `estimatorCard()`.

### 18.5 Fuentes
- [2024 Adult Compendium of Physical Activities](https://pacompendium.com/adult-compendium/) — valores MET.
- [Compendium: Corrected METs](https://pacompendium.com/corrected-mets/) — uso de Harris-Benedict.
- Ecuaciones metabólicas del ACSM (*ACSM's Guidelines for Exercise Testing and Prescription*).
- Ebben et al. (2011), *Kinetic analysis of several variations of push-ups* — % de peso en flexiones.
- [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense) — fotos y músculos del catálogo.
- [react-body-highlighter](https://github.com/giavinh79/react-body-highlighter) (MIT) — dibujo del cuerpo.

---

## 19. Tipos de serie, RPE, progresión, gráficas y compartir (v0.4)

### 19.1 Tipos de serie y RPE
Al tocar el número de una serie se abre un menú (`setMenu`) con:
- **Tipo** (`s.t`): Normal, **Calentamiento** (`w`, se ve como "C"), **Al fallo** (`f`, "F") o **Drop set** (`d`, "D"). Objeto `SET_TYPES`.
- **RPE** (`s.rpe`): esfuerzo percibido de 6 a 10 (10 = al fallo, 8 = te quedaban 2 repeticiones). Se ve como "@8" bajo el número.
- **Eliminar serie**.

Las series de calentamiento **no cuentan** en kg levantados, récords, informe muscular ni estimador, pero **sí** en calorías. La función `isWork(s)` distingue una serie de trabajo de un calentamiento.

### 19.2 Sugerencia de progresión
Encima de las series de cada ejercicio aparece una sugerencia con el botón **Aplicar**, que rellena las series pendientes (`suggestion()`, `suggestionBox()`, `sugApply`). Usa la **doble progresión**: primero subes repeticiones dentro de un rango y, al llegar al tope en todas las series, subes peso.

- **Rango**: el objetivo de la rutina ("8-12" o "8"). Si no hay, 8-12 en pesas, 5-8 con lastre y hasta 15 sin lastre.
- **Pesas o lastre**:
  - si en tu última sesión llegaste al tope en todas las series (o el RPE medio fue ≤ 7), propone **subir 2,5 kg** (5 kg en sentadilla y peso muerto) y volver al mínimo del rango;
  - si no, propone **repetir el peso y sumar 1 repetición**.
- Si la última vez llegaste **al fallo o RPE ≥ 9,5**, no propone subir: toca consolidar.
- **Calistenia sin lastre**: busca +1 rep por serie. Al llegar a 15, propone pasar a la versión con lastre de la misma familia.
- **Estáticos (tiempo)**: +5 segundos.

### 19.3 Gráficas (Progreso → Músculos)
- **Evolución (8 semanas)**: series por semana del músculo que elijas, con los colores del informe.
- **Kg levantados y calorías por semana**.

Funciones: `barChart()`, `muscleCharts()`. Por dentro, `weekMuscles()` usa `addMuscles()` y `addWorkoutMuscles()`, que también sirven para el mapa de un solo entreno.

### 19.4 Compartir entreno
En Calendario, abre un entreno y pulsa **Compartir**. `shareWorkout()` dibuja una imagen de 1080×1350 en un `<canvas>` con:
- nombre, fecha, duración, kg, calorías y series;
- la lista de ejercicios;
- el mapa muscular de ese entreno.

Se puede **compartir** (WhatsApp, Instagram... mediante `navigator.share`, si el móvil lo permite) o **guardar** como PNG.

---

## 20. Estilos: oscuro, claro y Persona (v0.5)

Se cambian en **Ajustes → Estilo** y se guardan en `db.settings.theme` (`dark`, `light` o `persona`).

### Cómo funciona
1. `applyTheme()` pone el atributo `data-theme` en la etiqueta `<html>` y actualiza el color de la barra del sistema (`<meta name="theme-color">`).
2. Todos los colores están en **variables CSS** dentro de `:root` (el oscuro, que es el de por defecto). Cada estilo las redefine:
   ```css
   :root[data-theme=light]  { --bg:#f2f2f7; --ac:#ff3b30; ... }
   :root[data-theme=persona]{ --bg:#070707; --ac:#e5141b; ... }
   ```
3. Lo que no se puede resolver solo con colores (formas, inclinaciones, sombras) va en reglas que empiezan por `[data-theme=persona] ...` o `[data-theme=light] ...`, al final del CSS de `index.html`.
4. Cada icono tiene la clase `i-<nombre>` (por ejemplo `i-flame`, `i-trophy`), y así el estilo claro les da su color.

### Variables principales
| Variable | Para qué |
|---|---|
| `--bg`, `--card`, `--field`, `--line` | Fondo, tarjetas, campos y bordes |
| `--tx`, `--mut`, `--dim` | Texto principal, secundario y apagado |
| `--ac`, `--on-ac` | Color de acento y texto encima |
| `--hl` | Acento en formato `R,G,B` para brillos con transparencia: `rgba(var(--hl),.3)` |
| `--nav-bg`, `--nav-off`, `--nav-on` | Barra inferior |
| `--sheet`, `--timer-bg`, `--toast-bg` | Hojas emergentes, temporizador y avisos |
| `--body-off`, `--body-head` | Músculos sin trabajar en el mapa corporal |
| `--thumb-filter` | Filtro de las fotos (blanco y negro en oscuro, color en claro) |
| `--title-font` | Fuente de los títulos (Anton en Persona) |

### Estilo Persona
- Los títulos de cada pantalla se trocean en letras con `ransom()`. Cada letra recibe una de 4 clases (`.rn.r0`…`.r3`: blanco, negro, rojo o girada) calculada a partir de la letra y su posición, así que la misma palabra siempre sale igual.
- La estrella de la pestaña activa y del botón ▶ es un `clip-path: polygon(...)`.
- El fondo combina un degradado diagonal rojo con un patrón de puntos (`radial-gradient`).

### Añadir un estilo nuevo
1. Añádelo al objeto `THEMES` de `app.js`: `clave: [nombre, color de la barra del sistema, degradado de la muestra]`.
2. Crea en `index.html` un bloque `:root[data-theme=clave]{ ... }` con las variables.
3. Si quieres, añade reglas `[data-theme=clave] .card{...}` para formas propias.

> La imagen de **Compartir entreno** siempre usa colores oscuros fijos, porque se dibuja en un `<canvas>` donde no existen las variables CSS.

---

## 21. Perfil, medallas, experiencia y avisos propios (v0.6)

### 21.1 Perfil (`vUser()` en `app.js`)
Se abre con el botón redondo de arriba a la derecha (`avatarBtn()`), que muestra tu foto (o tus iniciales) y tu nivel. Datos en `db.user`:
```js
{ name: "Yago", photo: "data:image/jpeg;base64,...", title: "Maestro de las dominadas" }
```
- **Foto** (`setPhoto()`): se recorta en cuadrado y se reduce a 256×256 px en JPEG (unos 20-40 KB) para guardarla en el móvil con el resto de datos. Se exporta con la copia de seguridad.
- **Nombre**: se usa en el saludo de Inicio ("Hola, Yago").
- **Título**: eliges entre los desbloqueados (`unlockedTitles()`). Queda guardado para la futura parte social.

### 21.2 Experiencia y nivel (`medals.js`)
```
XP total = suma de los kg levantados en todos tus entrenos      (totalXP)
XP para pasar del nivel n al n+1 = 2.000 × 1,10^(n-1)           (xpForLevel)
   → nivel 1→2: 2.000 · 2→3: 2.200 · 3→4: 2.420 · 10→11: 4.716 · 20→21: 12.232
```
`levelInfo()` devuelve el nivel, lo que llevas del actual y lo que te falta. `xpBar()` dibuja la barra; su aspecto cambia con el estilo mediante las reglas `.xp` de cada tema en `index.html`. Los cardio sin kg no dan experiencia.

### 21.3 Medallas
- **Catálogo**: `MEDAL_DEFS`, con id, categoría, nombre, título de Maestro, pictograma, los **6 umbrales** (bronce → maestro), la estadística que mide y la unidad. Las secretas están en `SECRET_DEFS`.
- **Estadísticas**: `computeStats()` recorre todo el historial y calcula: entrenos, mejor racha, semanas con el objetivo, máximo de repeticiones por familia (dominadas, fondos, flexiones, muscle up), segundos en estáticos, lastre en % de tu peso, fuerza relativa (1RM estimado ÷ tu peso), toneladas, km de cinta, récords y calorías. Las series de calentamiento no cuentan.
- **Estado**: `medalStates()` compara cada estadística con sus umbrales y da el nivel conseguido y la siguiente meta.
- **Dibujo**: `medalSvg()` genera un escudo hexagonal con el degradado del nivel (`TIERS`). Desde Oro gana alas, desde Diamante destellos y en Maestro una corona. El pictograma del centro sale de `GLYPHS`.
- **Celebración**: `finish()` guarda el estado antes y después del entreno y `celebrate()` muestra la experiencia ganada, si subes de nivel y las medallas nuevas.

**Calentamiento y estiramientos**: grupos `Calentamiento` y `Estiramientos` de `data.js`, con MET `MET.warmup` (3,5), `MET.stretch` (2,3) o `MET.plyo` (7,5). No tienen músculos ni % de peso corporal, así que no cuentan en el informe muscular, los kg ni la experiencia. `defRest()` les pone el descanso a 0.

**Añadir una medalla**: añade una fila a `MEDAL_DEFS` y, si mide algo nuevo, calcula ese valor en `computeStats()`.

### 21.4 Ventanas de aviso propias
`uiDialog()`, `uiAlert()`, `uiConfirm()` y `uiPrompt()` sustituyen a `alert`/`confirm`/`prompt` del navegador, que ponen "*dirección* dice" y no se pueden personalizar. Devuelven una **promesa**: las funciones que preguntan algo son `async` y esperan la respuesta con `await`:
```js
if (!(await uiConfirm('¿Eliminar este registro?', 'Eliminar', true))) return;
```

### 21.5 Estilo Kingdom
Es otro bloque `:root[data-theme=kingdom]` (ver sección 20).
- El fondo y la franja inferior son **SVG propios** (corazones, coronas, estrellas) incrustados en el CSS como `data:image/svg+xml`.
- Los botones usan la variable `--cmd`, el degradado azul tipo "menú de comandos".
- El menú inferior convierte cada botón en una tecla de comando inclinada; la activa es dorada y lleva una corona (`nav button.on::before`).
- Fuentes de Google: **Grenze Gotisch** (títulos) y **Cinzel** (subtítulos).
