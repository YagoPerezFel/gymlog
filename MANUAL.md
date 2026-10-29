# Manual de GymLog

Guía para entender cómo está hecha la app, qué hace cada archivo y cada función, y cómo modificarla o publicar cambios.

**Versión descrita:** 2.0.0
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
├── app.js          Toda la lógica de la app (≈1100 líneas)
├── sw.js           Service worker: funcionamiento sin conexión, caché y notificaciones
├── manifest.json   Datos para instalar la app (nombre, icono, colores)
├── version.json    Versión publicada + lista de archivos (lo usa el botón de actualizar)
├── catalog.json    Catálogo de 873 ejercicios con foto (para el buscador del catálogo)
├── icon.svg        Icono vectorial
├── icon-192.png    Icono 192×192 (Android / iPhone)
├── icon-512.png    Icono 512×512 (pantalla de carga de Android)
├── README.md       Resumen corto del proyecto
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
  "version": "2.0.0",
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
{ id: "lq3x9ab12", name: "Press banca", group: "Pecho", kind: "w", img: "Barbell_Bench_Press_-_Medium_Grip" }
// kind: "w" = peso × reps, "r" = solo reps, "t" = tiempo en segundos
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

**Ajustes** (`db.settings`)
```js
{ rest: 90, sound: true, vibrate: true, notify: true, awake: true, weekGoal: 3 }
```

### Puntos importantes
- **Las actualizaciones de la app no tocan estos datos**, porque se guardan aparte del código.
- **Si borras los datos del navegador** o desinstalas la app, se pierden. Para eso está **Ajustes → Exportar datos**, que descarga un `.json` con todo el objeto `db`.
- **Compatibilidad hacia atrás:** la función `load()` completa los datos de versiones antiguas. Por ejemplo, añade `body: []` o `weekGoal: 3` si faltan, y pone la foto a los ejercicios de antes.

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
  app.js tiene:        APP_VERSION = '2.0.0'      ← la versión que tienes instalada
  version.json tiene:  "version": "2.0.1"         ← la última publicada en GitHub

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
   - `app.js` → `const APP_VERSION = '2.0.1';`
   - `version.json` → `"version": "2.0.1"`
3. **Si añadiste un archivo nuevo** que la app necesita, añádelo a la lista `files` de `version.json` y a `FILES` en `sw.js`.
4. **Sube a GitHub:**
   ```bash
   git add -A
   git commit -m "v2.0.1: descripción del cambio"
   git push
   ```
5. **Espera 1–2 minutos** a que GitHub Pages lo publique. Puedes comprobarlo abriendo `https://yagoperezfel.github.io/gymlog/version.json`.
6. **En el móvil:** Ajustes → *Buscar nuevas actualizaciones*, o acepta el aviso que aparece al abrir la app.

**Convención de versiones** (`mayor.menor.parche`):
- `2.0.1`: arreglo pequeño.
- `2.1.0`: función nueva.
- `3.0.0`: cambio grande.

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
