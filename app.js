'use strict';

// ---------- Utilidades ----------
const KEY = 'gymlog_v1';
const $ = s => document.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => parseFloat(String(v).replace(',', '.')) || 0;
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const fmt = s => {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0');
};
const fdate = ts => new Date(ts).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

// Tipos de ejercicio: w = peso × reps, r = solo reps (peso corporal), t = tiempo en segundos
const KINDS = { w: 'Peso × reps', r: 'Solo reps', t: 'Tiempo (seg)' };

// [nombre, grupo, tipo, imagen del catálogo free-exercise-db]
const DEFAULT_EX = [
  ['Press banca', 'Pecho', 'w', 'Barbell_Bench_Press_-_Medium_Grip'], ['Press inclinado con mancuernas', 'Pecho', 'w', 'Incline_Dumbbell_Press'],
  ['Press declinado', 'Pecho', 'w', 'Decline_Barbell_Bench_Press'], ['Aperturas con mancuernas', 'Pecho', 'w', 'Dumbbell_Flyes'],
  ['Cruce de poleas', 'Pecho', 'w', 'Cable_Crossover'], ['Fondos', 'Pecho', 'r', 'Dips_-_Chest_Version'], ['Flexiones', 'Pecho', 'r', 'Pushups'],
  ['Dominadas', 'Espalda', 'r', 'Pullups'], ['Jalón al pecho', 'Espalda', 'w', 'Wide-Grip_Lat_Pulldown'], ['Remo con barra', 'Espalda', 'w', 'Bent_Over_Barbell_Row'],
  ['Remo con mancuerna', 'Espalda', 'w', 'One-Arm_Dumbbell_Row'], ['Remo en polea baja', 'Espalda', 'w', 'Seated_Cable_Rows'],
  ['Peso muerto', 'Espalda', 'w', 'Barbell_Deadlift'], ['Pullover en polea', 'Espalda', 'w', 'Straight-Arm_Pulldown'],
  ['Sentadilla', 'Piernas', 'w', 'Barbell_Squat'], ['Prensa', 'Piernas', 'w', 'Leg_Press'], ['Zancadas', 'Piernas', 'w', 'Dumbbell_Lunges'],
  ['Sentadilla búlgara', 'Piernas', 'w', 'Split_Squat_with_Dumbbells'], ['Peso muerto rumano', 'Piernas', 'w', 'Romanian_Deadlift'],
  ['Extensión de cuádriceps', 'Piernas', 'w', 'Leg_Extensions'], ['Curl femoral', 'Piernas', 'w', 'Lying_Leg_Curls'],
  ['Hip thrust', 'Piernas', 'w', 'Barbell_Hip_Thrust'], ['Gemelos de pie', 'Piernas', 'w', 'Standing_Calf_Raises'],
  ['Abductores en máquina', 'Piernas', 'w', 'Thigh_Abductor'],
  ['Press militar', 'Hombros', 'w', 'Standing_Military_Press'], ['Press con mancuernas sentado', 'Hombros', 'w', 'Seated_Dumbbell_Press'],
  ['Elevaciones laterales', 'Hombros', 'w', 'Side_Lateral_Raise'], ['Pájaros', 'Hombros', 'w', 'Reverse_Flyes'], ['Face pull', 'Hombros', 'w', 'Face_Pull'],
  ['Curl con barra', 'Bíceps', 'w', 'Barbell_Curl'], ['Curl con mancuernas', 'Bíceps', 'w', 'Dumbbell_Bicep_Curl'],
  ['Curl martillo', 'Bíceps', 'w', 'Hammer_Curls'], ['Curl en polea', 'Bíceps', 'w', 'Standing_Biceps_Cable_Curl'],
  ['Press francés', 'Tríceps', 'w', 'EZ-Bar_Skullcrusher'], ['Extensión de tríceps en polea', 'Tríceps', 'w', 'Triceps_Pushdown'],
  ['Fondos en banco', 'Tríceps', 'r', 'Bench_Dips'],
  ['Plancha', 'Core', 't', 'Plank'], ['Crunch', 'Core', 'r', 'Crunches'], ['Elevación de piernas', 'Core', 'r', 'Hanging_Leg_Raise'],
  ['Rueda abdominal', 'Core', 'r', 'Ab_Roller'],
  ['Cinta', 'Cardio', 't', 'Running_Treadmill'], ['Bicicleta', 'Cardio', 't', 'Bicycling_Stationary'],
  ['Remo ergómetro', 'Cardio', 't', 'Rowing_Stationary'], ['Comba', 'Cardio', 't', 'Rope_Jumping'],
];

// Fotos del catálogo libre free-exercise-db (dominio público), servidas por jsDelivr
const IMG_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';
const imgUrl = (id, n = 0) => `${IMG_BASE}${id}/${n}.jpg`;
const GROUP_ICON = { Piernas: '🦵', 'Bíceps': '💪', 'Tríceps': '💪', Cardio: '🏃', Estiramientos: '🧘' };
const thumb = (e, cls = 'thumb') => e.img
  ? `<img class="${cls}" src="${imgUrl(e.img)}" alt="" loading="lazy" crossorigin="anonymous">`
  : `<span class="${cls} noimg">${GROUP_ICON[e.group] || '🏋️'}</span>`;

// Campos de medidas corporales: [clave, etiqueta, unidad]
const BODY_FIELDS = [['weight', 'Peso', 'kg'], ['height', 'Altura', 'cm'], ['fat', 'Grasa', '%'],
  ['waist', 'Cintura', 'cm'], ['chest', 'Pecho', 'cm'], ['arm', 'Brazo', 'cm'], ['thigh', 'Muslo', 'cm']];

// ---------- Datos ----------
let db = load();
let view = 'train';
let draft = null;      // rutina en edición
let openHist = null;   // entreno desplegado en el historial
let exQuery = '';
let pickCb = null;
let sheetOpts = [];
let progTab = 'records';  // pestaña de Progreso: records | body
let openRec = null;       // ejercicio desplegado en récords
let catalog = null;       // catálogo de fotos (se carga al abrirlo)
let catMode = null;       // { type: 'add', cb } o { type: 'img', exId }
let viewerTimer = null;

function load() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
  if (!d) d = {
    exercises: DEFAULT_EX.map(([name, group, kind, img]) => ({ id: uid(), name, group, kind, img })),
    routines: [], history: [], active: null,
  };
  d.body ||= [];
  // Datos de versiones anteriores: añade la foto a los ejercicios por defecto
  const imgByName = Object.fromEntries(DEFAULT_EX.map(e => [e[0], e[3]]));
  d.exercises.forEach(e => { if (e.img === undefined) e.img = imgByName[e.name] || ''; });
  d.settings = Object.assign({ rest: 90, sound: true, vibrate: true, notify: true, awake: true }, d.settings);
  return d;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch (e) { alert('No se pudo guardar: ' + e.message); }
}

const exById = id => db.exercises.find(e => e.id === id);
const exInfo = x => exById(x.exId) || { name: x.name || '(eliminado)', group: '', kind: x.kind || 'w' };

// Series del último entreno que incluyó este ejercicio
function lastSets(exId) {
  for (let k = db.history.length - 1; k >= 0; k--) {
    const e = db.history[k].exercises.find(x => x.exId === exId);
    if (e) return e.sets;
  }
  return [];
}
const setText = (kind, s) => (kind === 'w' ? `${s.w}kg×${s.r}` : kind === 't' ? `${s.r}s` : `${s.r} reps`) + (s.pr ? ' 🏆' : '');

// ---------- Récords ----------
// 1RM estimado (fórmula de Epley)
const e1rm = (w, r) => r > 0 && w > 0 ? (r === 1 ? w : w * (1 + r / 30)) : 0;
const r1 = v => Math.round(v * 10) / 10;

// Mejores marcas de un ejercicio en el historial
function exStats(exId) {
  const st = { kind: null, sessions: [], maxW: null, best: null, maxR: null, maxVol: null };
  const up = (key, v, s, date) => { if (v > 0 && (!st[key] || v > st[key].v)) st[key] = { v, w: s.w, r: s.r, date }; };
  db.history.forEach(h => h.exercises.forEach(x => {
    if (x.exId !== exId) return;
    st.kind = x.kind;
    let top = 0, vol = 0;
    x.sets.forEach(s => {
      if (x.kind === 'w') {
        up('maxW', s.w, s, h.start);
        up('best', e1rm(s.w, s.r), s, h.start);
        vol += s.w * s.r;
        top = Math.max(top, e1rm(s.w, s.r));
      } else top = Math.max(top, s.r);
      up('maxR', s.r, s, h.start);
    });
    if (vol > (st.maxVol ? st.maxVol.v : 0)) st.maxVol = { v: vol, date: h.start };
    if (top > 0) st.sessions.push({ x: h.start, y: r1(top) });
  }));
  return st;
}

// ¿Es la serie (i, j) del entreno actual un récord? Devuelve el texto del récord o null
function checkPR(i, j) {
  const x = db.active.exercises[i], s = x.sets[j], kind = exInfo(x).kind;
  const st = exStats(x.exId);
  if (!st.sessions.length) return null;  // primera vez que haces el ejercicio: nada con qué comparar
  const others = db.active.exercises.flatMap((y, ii) => y.exId === x.exId ? y.sets.filter((z, jj) => z.done && !(ii === i && jj === j)) : []);
  const w = num(s.w), r = num(s.r);
  const best = (key, f) => Math.max(st[key] ? st[key].v : 0, ...others.map(f));
  if (kind === 'w') {
    if (w > best('maxW', z => num(z.w))) return `Peso máximo: ${w} kg`;
    if (e1rm(w, r) > best('best', z => e1rm(num(z.w), num(z.r))) + 0.05) return `Mejor serie: ${w} kg × ${r} (1RM est. ${r1(e1rm(w, r))} kg)`;
    return null;
  }
  return r > best('maxR', z => num(z.r)) ? `${r} ${kind === 't' ? 'seg' : 'reps'}` : null;
}

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { el.hidden = true; }, 4000);
}

// Gráfica de línea sencilla en SVG. pts = [{x: fecha, y: valor}]
function lineChart(pts, unit) {
  if (pts.length < 2) return '<p class="muted small">La gráfica aparecerá cuando haya al menos 2 registros.</p>';
  const W = 320, H = 130, P = 8, top = 16, bottom = 18;
  const ys = pts.map(p => p.y), lo = Math.min(...ys), hi = Math.max(...ys), span = hi - lo || 1;
  const x0 = pts[0].x, xs = pts[pts.length - 1].x - x0 || 1;
  const X = p => P + (p.x - x0) / xs * (W - 2 * P), Y = p => top + (1 - (p.y - lo) / span) * (H - top - bottom);
  const path = pts.map((p, k) => (k ? 'L' : 'M') + X(p).toFixed(1) + ' ' + Y(p).toFixed(1)).join(' ');
  const d = ts => new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">
    <path d="${path}" fill="none" stroke="var(--ac)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map(p => `<circle cx="${X(p).toFixed(1)}" cy="${Y(p).toFixed(1)}" r="3" fill="var(--ac)"/>`).join('')}
    <text x="${P}" y="11" class="cl">máx ${r1(hi)} ${unit} · mín ${r1(lo)} ${unit}</text>
    <text x="${P}" y="${H - 4}" class="cl">${d(pts[0].x)}</text><text x="${W - P}" y="${H - 4}" class="cl" text-anchor="end">${d(pts[pts.length - 1].x)}</text>
  </svg>`;
}

// ---------- Vistas ----------
function render() {
  document.querySelectorAll('nav button').forEach(b => {
    b.classList.toggle('on', b.dataset.view === view);
    b.classList.toggle('live', b.dataset.view === 'train' && !!db.active);
  });
  const fn = { train: vTrain, routines: vRoutines, exercises: vExercises, progress: vProgress, history: vHistory, settings: vSettings }[view];
  $('#app').innerHTML = fn();
  renderTimer();
}

function routineCard(r, editable) {
  return `<div class="card">
    <div class="ex-head"><b>${esc(r.name)}</b>${editable ? `<button class="btn sm ghost" data-a="editRoutine" data-id="${r.id}">Editar</button>` : ''}</div>
    <p class="muted small">${r.items.map(it => esc(exInfo(it).name)).join(' · ')}</p>
    <button class="btn primary block" data-a="startRoutine" data-id="${r.id}">▶ Empezar</button>
  </div>`;
}

// ---------- Instalar como app ----------
let installEvt = null;  // evento de Chrome/Android para mostrar el diálogo de instalación
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
// Navegadores internos de otras apps (Instagram, WhatsApp, Claude...) que no permiten instalar
const inAppBrowser = /FBAN|FBAV|Instagram|Line\/|; wv\)|WhatsApp|Claude/i.test(navigator.userAgent);

function installCard() {
  if (isStandalone()) return '';
  let how;
  if (installEvt) how = '<button class="btn primary block" data-a="install">📲 Instalar app</button>';
  else if (inAppBrowser) how = `<p class="small">Ahora mismo estás en el navegador interno de otra app, y desde ahí no se puede instalar.
      Toca <b>⋮</b> o <b>···</b> y elige <b>"Abrir en ${isIOS ? 'Safari' : 'Chrome'}"</b>, o copia el enlace y pégalo en ${isIOS ? 'Safari' : 'Chrome'}.</p>
      <button class="btn block" data-a="copyLink">Copiar enlace</button>`;
  else if (isIOS) how = '<p class="small">En <b>Safari</b>: toca <b>Compartir</b> (□↑) y elige <b>"Añadir a pantalla de inicio"</b>. Después abre GymLog desde el icono.</p>';
  else how = '<p class="small">En <b>Chrome</b>: toca el menú <b>⋮</b> y elige <b>"Instalar aplicación"</b> o <b>"Añadir a pantalla de inicio"</b>.</p>';
  return `<div class="card"><b>📲 Instala GymLog como una app</b><p class="muted small">Tendrás su icono junto a tus otras apps y se abrirá a pantalla completa, sin barra del navegador.</p>${how}</div>`;
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (!db.active) render(); });
window.addEventListener('appinstalled', () => { installEvt = null; if (!db.active) render(); });

function vTrain() {
  if (db.active) return vWorkout();
  const tip = ('Notification' in window && Notification.permission === 'default')
    ? `<div class="card"><b>🔔 Avisos de descanso</b><p class="muted small">Permite las notificaciones para que te avise al acabar cada descanso aunque no estés mirando la app.</p><button class="btn block" data-a="askNotif">Activar notificaciones</button></div>` : '';
  return `<h1>Entrenar</h1>${installCard()}${tip}
    <button class="btn primary big block" data-a="startEmpty">+ Entrenamiento libre</button>
    <h2>Mis rutinas</h2>
    ${db.routines.map(r => routineCard(r, false)).join('') || '<p class="muted">Aún no tienes rutinas. Créalas en la pestaña Rutinas o guarda un entrenamiento libre como rutina.</p>'}`;
}

function vWorkout() {
  const w = db.active;
  return `<div class="wk-head"><input class="wk-name" data-f="wkName" value="${esc(w.name)}"><span class="pill" id="elapsed">${fmt((Date.now() - w.start) / 1000)}</span></div>
    ${w.exercises.map(exCard).join('') || '<p class="muted center">Añade tu primer ejercicio 👇</p>'}
    <button class="btn block" data-a="addEx">+ Añadir ejercicio</button>
    <button class="btn primary block" data-a="finish">✔ Terminar entrenamiento</button>
    <div class="row"><button class="btn ghost" data-a="saveAsRoutine">Guardar como rutina</button><button class="btn ghost danger" data-a="discard">Descartar</button></div>`;
}

function exCard(x, i) {
  const ex = exInfo(x), k = ex.kind, prev = lastSets(x.exId);
  const rows = x.sets.map((s, j) => {
    const p = prev[j];
    const phW = p && k === 'w' ? p.w : '';
    const phR = x.target || (p ? p.r : '');
    return `<tr class="${s.done ? 'done' : ''}">
      <td><button class="setn" data-a="delSet" data-i="${i}" data-j="${j}">${s.pr ? '🏆' : j + 1}</button></td>
      <td class="prev">${p ? setText(k, { ...p, pr: false }) : '—'}</td>
      ${k === 'w' ? `<td><input inputmode="decimal" data-f="w" data-i="${i}" data-j="${j}" value="${esc(s.w)}" placeholder="${esc(phW)}"></td>` : ''}
      <td><input inputmode="numeric" data-f="r" data-i="${i}" data-j="${j}" value="${esc(s.r)}" placeholder="${esc(phR)}"></td>
      <td><button class="chk" data-a="toggle" data-i="${i}" data-j="${j}">✓</button></td>
    </tr>`;
  }).join('');
  return `<div class="card">
    <div class="ex-head"><button class="thumbbtn" data-a="viewEx" data-id="${x.exId}">${thumb(ex)}</button><b>${esc(ex.name)}</b><button class="btn sm ghost" data-a="exMenu" data-i="${i}">⋯</button></div>
    ${x.target ? `<div class="muted small">Objetivo: ${esc(x.target)} ${k === 't' ? 'seg' : 'reps'}</div>` : ''}
    <label class="rest">⏱ Descanso <input inputmode="numeric" data-f="rest" data-i="${i}" value="${x.rest}"> seg</label>
    <table class="sets"><tr><th>Serie</th><th>Anterior</th>${k === 'w' ? '<th>kg</th>' : ''}<th>${k === 't' ? 'Seg' : 'Reps'}</th><th></th></tr>${rows}</table>
    <button class="btn sm ghost" data-a="addSet" data-i="${i}">+ Añadir serie</button>
  </div>`;
}

function vRoutines() {
  if (draft) {
    return `<h1>${draft.id ? 'Editar rutina' : 'Nueva rutina'}</h1>
      <label class="field">Nombre<input data-f="rName" value="${esc(draft.name)}" placeholder="Ej. Pierna, Torso A, Push..."></label>
      ${draft.items.map((it, i) => {
        const ex = exInfo(it);
        return `<div class="card">
          <div class="ex-head"><b>${esc(ex.name)}</b>
            <button class="btn sm ghost" data-a="rMove" data-i="${i}" data-j="-1">↑</button>
            <button class="btn sm ghost" data-a="rMove" data-i="${i}" data-j="1">↓</button>
            <button class="btn sm ghost danger" data-a="rDel" data-i="${i}">✕</button></div>
          <div class="row">
            <label class="field">Series<input inputmode="numeric" data-f="rSets" data-i="${i}" value="${it.sets}"></label>
            <label class="field">${ex.kind === 't' ? 'Segundos' : 'Reps'}<input data-f="rReps" data-i="${i}" value="${esc(it.reps)}" placeholder="8-12"></label>
            <label class="field">Descanso (s)<input inputmode="numeric" data-f="rRest" data-i="${i}" value="${it.rest}"></label>
          </div></div>`;
      }).join('')}
      <button class="btn block" data-a="rAddEx">+ Añadir ejercicio</button>
      <button class="btn primary block" data-a="rSave">Guardar rutina</button>
      <div class="row"><button class="btn ghost" data-a="rCancel">Cancelar</button>${draft.id ? '<button class="btn ghost danger" data-a="rDelete">Eliminar rutina</button>' : ''}</div>`;
  }
  return `<h1>Rutinas</h1>
    <button class="btn primary block" data-a="newRoutine">+ Nueva rutina</button>
    ${db.routines.map(r => routineCard(r, true)).join('') || '<p class="muted">Todavía no hay rutinas.</p>'}`;
}

function filterEx(q) {
  q = norm(q.trim());
  return db.exercises.filter(e => !q || norm(e.name).includes(q) || norm(e.group).includes(q));
}
function grouped(list, rowFn) {
  const g = {};
  list.forEach(e => (g[e.group || 'Otros'] ||= []).push(e));
  return Object.keys(g).map(k => `<div class="grp">${esc(k)}</div>` +
    g[k].sort((a, b) => a.name.localeCompare(b.name, 'es')).map(rowFn).join('')).join('');
}
const exRow = action => e => `<button class="li ili" data-a="${action}" data-id="${e.id}">${thumb(e)}<span>${esc(e.name)}<small>${KINDS[e.kind]}</small></span></button>`;

function exList() {
  return grouped(filterEx(exQuery), exRow('exEdit')) || '<p class="muted">Sin resultados.</p>';
}

function vExercises() {
  const groups = [...new Set(db.exercises.map(e => e.group))];
  return `<h1>Ejercicios</h1>
    <div class="card"><h3>Nuevo ejercicio</h3>
      <input id="nxName" placeholder="Nombre">
      <div class="row" style="margin-top:8px">
        <input id="nxGroup" list="groups" placeholder="Grupo (ej. Pecho)">
        <select id="nxKind">${Object.entries(KINDS).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>
      </div>
      <datalist id="groups">${groups.map(g => `<option value="${esc(g)}">`).join('')}</datalist>
      <button class="btn primary block" data-a="addExercise">Añadir</button>
      <button class="btn block" data-a="catAdd">📚 Añadir desde el catálogo con fotos (+800)</button>
    </div>
    <input data-f="exQ" placeholder="🔍 Buscar..." value="${esc(exQuery)}">
    <div id="exList">${exList()}</div>`;
}

function vHistory() {
  if (!db.history.length) return '<h1>Historial</h1><p class="muted">Aún no hay entrenamientos guardados.</p>';
  return '<h1>Historial</h1>' + [...db.history].reverse().map(h => {
    const sets = h.exercises.reduce((n, x) => n + x.sets.length, 0);
    const vol = h.exercises.reduce((v, x) => v + (x.kind === 'w' ? x.sets.reduce((a, s) => a + s.w * s.r, 0) : 0), 0);
    const det = openHist === h.id ? `<div class="hdet">
        ${h.exercises.map(x => `<div><b>${esc(x.name)}</b><div class="muted small">${x.sets.map(s => setText(x.kind, s)).join(' · ')}</div></div>`).join('')}
        <button class="btn sm ghost danger" style="margin-top:10px" data-a="hDel" data-id="${h.id}">Eliminar entreno</button></div>` : '';
    return `<div class="card"><button class="li" style="border:0;padding:0" data-a="hToggle" data-id="${h.id}"><b>${esc(h.name)}</b>
      <small>${fdate(h.start)} · ${fmt((h.end - h.start) / 1000)} · ${sets} series${vol ? ` · ${Math.round(vol).toLocaleString('es-ES')} kg` : ''}</small></button>${det}</div>`;
  }).join('');
}

function vProgress() {
  return `<h1>Progreso</h1>
    <div class="seg"><button class="${progTab === 'records' ? 'on' : ''}" data-a="progTab" data-id="records">🏆 Récords</button><button class="${progTab === 'body' ? 'on' : ''}" data-a="progTab" data-id="body">📏 Cuerpo</button></div>
    ${progTab === 'records' ? vRecords() : vBody()}`;
}

function vRecords() {
  // Ejercicios con historial, ordenados por la última vez que se hicieron
  const last = {};
  db.history.forEach(h => h.exercises.forEach(x => { last[x.exId] = { at: h.start, name: x.name, kind: x.kind }; }));
  const ids = Object.keys(last).sort((a, b) => last[b].at - last[a].at);
  if (!ids.length) return '<p class="muted">Termina tu primer entrenamiento y aquí aparecerán tus mejores marcas.</p>';
  const ds = d => `<span class="muted small"> · ${new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' })}</span>`;
  return ids.map(id => {
    const ex = exById(id) || { name: last[id].name, kind: last[id].kind, group: '', img: '' };
    const st = exStats(id), k = st.kind;
    const main = k === 'w'
      ? (st.maxW ? `${st.maxW.v} kg${st.best ? ` · 1RM est. ${r1(st.best.v)} kg` : ''}` : '—')
      : (st.maxR ? `${st.maxR.v} ${k === 't' ? 'seg' : 'reps'}` : '—');
    let det = '';
    if (openRec === id) {
      const rows = k === 'w' ? [
        ['Peso máximo', st.maxW && `${st.maxW.v} kg × ${st.maxW.r}`, st.maxW],
        ['Mejor serie (1RM est.)', st.best && `${st.best.w} kg × ${st.best.r} → ${r1(st.best.v)} kg`, st.best],
        ['Más repeticiones', st.maxR && `${st.maxR.r} reps con ${st.maxR.w} kg`, st.maxR],
        ['Más volumen en un día', st.maxVol && `${Math.round(st.maxVol.v).toLocaleString('es-ES')} kg`, st.maxVol],
      ] : [[k === 't' ? 'Más tiempo' : 'Más repeticiones', st.maxR && `${st.maxR.v} ${k === 't' ? 'seg' : 'reps'}`, st.maxR]];
      det = `<div class="hdet">${rows.filter(r => r[1]).map(r => `<div><span class="muted small">${r[0]}</span><br><b>${r[1]}</b>${ds(r[2].date)}</div>`).join('')}
        <p class="muted small" style="margin-top:10px">${k === 'w' ? 'Evolución del 1RM estimado (mejor serie de cada día)' : 'Evolución (mejor serie de cada día)'}</p>
        ${lineChart(st.sessions, k === 'w' ? 'kg' : k === 't' ? 's' : 'reps')}</div>`;
    }
    return `<div class="card"><button class="li ili" style="border:0;padding:0" data-a="recToggle" data-id="${id}">${thumb(ex)}<span><b>${esc(ex.name)}</b><small>${main} · ${st.sessions.length} ${st.sessions.length === 1 ? 'sesión' : 'sesiones'}</small></span></button>${det}</div>`;
  }).join('');
}

function vBody() {
  const list = [...db.body].sort((a, b) => a.date - b.date), last = list[list.length - 1];
  const lastOf = key => { for (let k = list.length - 1; k >= 0; k--) if (list[k][key]) return list[k][key]; return null; };
  const h = lastOf('height'), w = lastOf('weight');
  let summary = '';
  if (w) {
    const first = list.find(e => e.weight), diff = r1(w - first.weight);
    const bmi = h ? w / (h / 100) ** 2 : 0;
    const bmiTxt = bmi ? (bmi < 18.5 ? 'bajo peso' : bmi < 25 ? 'normal' : bmi < 30 ? 'sobrepeso' : 'obesidad') : '';
    summary = `<div class="card"><div class="stats">
      <div><small>Peso actual</small><b>${w} kg</b></div>
      <div><small>Desde el inicio</small><b>${diff > 0 ? '+' : ''}${diff} kg</b></div>
      ${bmi ? `<div><small>IMC</small><b>${r1(bmi)}</b><small>${bmiTxt}</small></div>` : ''}
    </div>${lineChart(list.filter(e => e.weight).map(e => ({ x: e.date, y: e.weight })), 'kg')}</div>`;
  }
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return `${summary}
    <div class="card"><h3>Nuevo registro</h3>
      <label class="field">Fecha<input type="date" id="bDate" value="${today.toISOString().slice(0, 10)}"></label>
      <div class="grid2">${BODY_FIELDS.map(([k, l, u]) => `<label class="field">${l} (${u})<input inputmode="decimal" id="b_${k}" ${k === 'height' && h ? `value="${h}"` : ''} placeholder="${last && last[k] ? last[k] : ''}"></label>`).join('')}</div>
      <p class="muted small">Rellena solo lo que quieras medir.</p>
      <button class="btn primary block" data-a="bodySave">Guardar medidas</button>
    </div>
    ${list.length ? '<h2>Registros</h2>' : ''}
    ${[...list].reverse().map((e, n, arr) => {
      const prev = arr[n + 1];
      const vals = BODY_FIELDS.filter(([k]) => e[k]).map(([k, l, u]) => {
        const d = prev && prev[k] ? r1(e[k] - prev[k]) : 0;
        return `${l}: <b>${e[k]}${u === '%' ? '%' : ' ' + u}</b>${d ? ` <span class="muted small">(${d > 0 ? '+' : ''}${d})</span>` : ''}`;
      }).join(' · ');
      return `<div class="card"><div class="ex-head"><b>${fdate(e.date)}</b><button class="btn sm ghost danger" data-a="bodyDel" data-id="${e.id}">✕</button></div><p class="small">${vals}</p></div>`;
    }).join('')}`;
}

function vSettings() {
  const s = db.settings;
  const perm = 'Notification' in window ? { granted: 'permitidas ✅', denied: 'bloqueadas ❌ (actívalas en los ajustes del navegador)', default: 'sin decidir' }[Notification.permission] : 'no soportadas en este navegador';
  const chk = (f, v, l) => `<label class="sw"><input type="checkbox" data-f="${f}" ${v ? 'checked' : ''}>${l}</label>`;
  return `<h1>Ajustes</h1>${installCard()}
    <div class="card"><h3>Descansos</h3>
      <label class="field">Descanso por defecto (segundos)<input inputmode="numeric" data-f="sRest" value="${s.rest}"></label>
      ${chk('sSound', s.sound, 'Sonido al terminar el descanso')}
      ${chk('sVibrate', s.vibrate, 'Vibración')}
      ${chk('sNotify', s.notify, 'Notificaciones')}
      ${chk('sAwake', s.awake, 'Mantener la pantalla encendida mientras entreno')}
      <p class="muted small">Notificaciones: ${perm}</p>
      <button class="btn block" data-a="testAlarm">Probar aviso (en 5 segundos)</button>
    </div>
    <div class="card"><h3>Copia de seguridad</h3>
      <p class="muted small">Los datos se guardan solo en este móvil. Exporta de vez en cuando por si acaso.</p>
      <button class="btn block" data-a="export">Exportar datos</button>
      <label class="btn block">Importar datos<input type="file" accept=".json,application/json" data-f="import" hidden></label>
      <button class="btn block ghost danger" data-a="reset">Borrar todos los datos</button>
    </div>`;
}

// ---------- Modal ----------
function showModal(html) { $('#sheet').innerHTML = html; $('#modal').hidden = false; }
function closeModal() { $('#modal').hidden = true; $('#sheet').innerHTML = ''; pickCb = null; catMode = null; clearInterval(viewerTimer); }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

function openSheet(title, opts) {
  sheetOpts = opts;
  showModal(`<h3>${esc(title)}</h3>` +
    opts.map((o, k) => `<button class="btn block ${o[2] || ''}" data-a="sheet" data-i="${k}">${esc(o[0])}</button>`).join('') +
    '<button class="btn block ghost" data-a="closeModal">Cancelar</button>');
}

function pickList(q) {
  const list = filterEx(q);
  const more = '<button class="btn block" data-a="catFromPick">📚 Buscar en el catálogo con fotos (+800)</button>';
  if (list.length) return grouped(list, exRow('pick')) + more;
  return `<p class="muted">Sin resultados.</p>${q.trim() ? `<button class="btn block" data-a="pickNew">+ Crear «${esc(q.trim())}»</button>` : ''}${more}`;
}
function openPicker(cb) {
  showModal(`<div class="mhead"><input id="pickQ" data-f="pickQ" placeholder="🔍 Buscar ejercicio..." autocomplete="off"><button class="btn ghost" data-a="closeModal">✕</button></div><div id="pickList">${pickList('')}</div>`);
  pickCb = cb;
}

// ---------- Catálogo con fotos ----------
// catalog.json: [id, nombre (inglés), grupo, material, tipo]
async function openCatalog(mode) {
  catMode = mode;
  showModal('<p class="muted center">Cargando catálogo...</p>');
  if (!catalog) {
    try { catalog = await (await fetch('catalog.json')).json(); }
    catch (e) { showModal('<p>No se pudo cargar el catálogo. Comprueba tu conexión.</p><button class="btn block" data-a="closeModal">Cerrar</button>'); return; }
  }
  const groups = [...new Set(catalog.map(c => c[2]))].sort((a, b) => a.localeCompare(b, 'es'));
  showModal(`<div class="mhead"><input id="catQ" data-f="catQ" placeholder="🔍 Buscar (en inglés: curl, press, row...)" autocomplete="off"><button class="btn ghost" data-a="closeModal">✕</button></div>
    <select id="catG" data-f="catG"><option value="">Todos los grupos</option>${groups.map(g => `<option>${esc(g)}</option>`).join('')}</select>
    <p class="muted small">${mode.type === 'img' ? 'Elige la foto para tu ejercicio.' : 'Los nombres están en inglés; al añadirlo puedes ponerle el nombre en español.'}</p>
    <div id="catList">${catList()}</div>`);
}
function catList() {
  const q = norm(($('#catQ') || {}).value || '').trim(), g = ($('#catG') || {}).value || '';
  const words = q.split(/\s+/).filter(Boolean);
  const res = catalog.filter(c => (!g || c[2] === g) && words.every(w => norm(c[1]).includes(w)));
  return res.slice(0, 60).map(c => `<button class="li ili" data-a="catPick" data-id="${esc(c[0])}">
      <img class="thumb" src="${imgUrl(c[0])}" alt="" loading="lazy" crossorigin="anonymous"><span>${esc(c[1])}<small>${esc(c[2])}${c[3] ? ' · ' + esc(c[3]) : ''}</small></span></button>`).join('')
    + (res.length > 60 ? `<p class="muted small center">Mostrando 60 de ${res.length}. Escribe para filtrar.</p>` : '')
    + (res.length ? '' : '<p class="muted">Sin resultados.</p>');
}

// Visor: alterna las 2 fotos (posición inicial y final) como si fuera una animación
function openViewer(ex) {
  showModal(`<div class="ex-head"><b>${esc(ex.name)}</b><button class="btn sm ghost" data-a="closeModal">✕</button></div>
    <p class="muted small">${esc(ex.group)} · ${KINDS[ex.kind]}</p>
    ${ex.img ? `<img id="viewImg" class="bigimg" src="${imgUrl(ex.img)}" alt="" crossorigin="anonymous">` : '<p class="muted center" style="padding:30px 0">Este ejercicio no tiene foto.</p>'}
    ${ex.id && exById(ex.id) ? `<button class="btn block" data-a="catImg" data-id="${ex.id}">${ex.img ? 'Cambiar foto' : 'Elegir foto del catálogo'}</button>` : ''}`);
  clearInterval(viewerTimer);
  if (ex.img) {
    const pre = new Image(); pre.crossOrigin = 'anonymous'; pre.src = imgUrl(ex.img, 1);
    let n = 0;
    viewerTimer = setInterval(() => {
      const el = $('#viewImg');
      if (!el) return clearInterval(viewerTimer);
      n = 1 - n; el.src = imgUrl(ex.img, n);
    }, 1000);
  }
}

// ---------- Entrenamiento ----------
function startWorkout(name, exercises, routineId) {
  if (db.active) { alert('Ya tienes un entrenamiento en curso.'); view = 'train'; render(); return; }
  db.active = { id: uid(), name, routineId: routineId || null, start: Date.now(), exercises, timer: null };
  save(); view = 'train'; render(); scrollTo(0, 0); keepAwake();
}

function nextLabel(i, j) {
  const w = db.active, x = w.exercises[i];
  const k = x.sets.findIndex((s, n) => n > j && !s.done);
  if (k >= 0) return `${exInfo(x).name} · serie ${k + 1}`;
  const nx = w.exercises.slice(i + 1).find(e => e.sets.some(s => !s.done));
  return nx ? exInfo(nx).name : 'último ejercicio completado';
}

function moveItem(arr, i, d) {
  const k = i + d;
  if (k < 0 || k >= arr.length) return;
  [arr[i], arr[k]] = [arr[k], arr[i]];
}

// ---------- Temporizador de descanso ----------
function startTimer(sec, label) {
  db.active.timer = { end: Date.now() + sec * 1000, total: sec, label, fired: false };
  save(); renderTimer();
}

function renderTimer() {
  const t = db.active && db.active.timer, el = $('#timer');
  document.body.classList.toggle('has-timer', !!t);
  if (!t) { el.hidden = true; return; }
  el.hidden = false;
  const rem = (t.end - Date.now()) / 1000, over = rem <= 0;
  el.classList.toggle('over', over);
  $('#ttime').textContent = over ? '¡Descanso terminado!' : fmt(Math.ceil(rem));
  $('#tlabel').textContent = (over ? 'Ahora: ' : 'Siguiente: ') + t.label;
  $('#tprog').style.width = (over ? 0 : 100 * rem / t.total) + '%';
  $('#tskip').textContent = over ? 'OK' : 'Saltar';
}

function tick() {
  if (!db.active) return;
  const el = $('#elapsed');
  if (el) el.textContent = fmt((Date.now() - db.active.start) / 1000);
  const t = db.active.timer;
  if (!t) return;
  const rem = (t.end - Date.now()) / 1000;
  if (rem <= 0 && !t.fired) { t.fired = true; save(); alarm(t.label); }
  if (rem < -20) { db.active.timer = null; save(); }  // se oculta solo tras 20 s
  renderTimer();
}

// ---------- Avisos: sonido, vibración, notificación ----------
let ac = null;
function unlockAudio() {
  try {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { }
}
function beep() {
  if (!ac) return;
  const t0 = ac.currentTime + 0.05;
  [0, 0.3, 0.6].forEach((d, k) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'square';
    o.frequency.value = k === 2 ? 1320 : 880;
    g.gain.setValueAtTime(0.0001, t0 + d);
    g.gain.exponentialRampToValueAtTime(0.4, t0 + d + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.25);
    o.connect(g).connect(ac.destination);
    o.start(t0 + d); o.stop(t0 + d + 0.28);
  });
}
async function notify(title, body) {
  if (!db.settings.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
    if (reg) { await reg.showNotification(title, { body, icon: 'icon-192.png', badge: 'icon-192.png', vibrate: [300, 100, 300], tag: 'rest', renotify: true }); return; }
  } catch (e) { }
  try { new Notification(title, { body, icon: 'icon-192.png' }); } catch (e) { }
}
function alarm(label) {
  if (db.settings.sound) beep();
  if (db.settings.vibrate && navigator.vibrate) navigator.vibrate([400, 150, 400, 150, 400]);
  notify('⏱ Descanso terminado', 'Siguiente: ' + label);
}
async function askNotifPermission() {
  if (!('Notification' in window)) { alert('Este navegador no soporta notificaciones. En iPhone, primero añade la app a la pantalla de inicio.'); return false; }
  const p = await Notification.requestPermission();
  if (p !== 'granted') alert('No se han permitido las notificaciones. Seguirás teniendo sonido y vibración con la app abierta.');
  return p === 'granted';
}

// Mantener pantalla encendida (evita que el móvil se bloquee y pare el temporizador)
let wl = null;
async function keepAwake() {
  if (!db.active || !db.settings.awake || !('wakeLock' in navigator) || document.hidden || wl) return;
  try { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } catch (e) { }
}
function releaseAwake() { if (wl) { wl.release(); wl = null; } }

// ---------- Acciones (botones) ----------
const A = {
  nav(b) { view = b.dataset.view; draft = null; render(); scrollTo(0, 0); },
  closeModal,
  sheet(b, i) { const f = sheetOpts[i][1]; closeModal(); f(); },
  pick(b, i, j, id) { const cb = pickCb; closeModal(); if (cb) cb(id); },
  pickNew() {
    const name = $('#pickQ').value.trim();
    const kind = confirm(`¿«${name}» usa peso (pesas, discos, máquina...)?`) ? 'w' : 'r';
    const e = { id: uid(), name, group: 'Otros', kind };
    db.exercises.push(e); save();
    A.pick(null, 0, 0, e.id);
  },
  async askNotif() { if (await askNotifPermission()) db.settings.notify = true; save(); render(); },
  async install() {
    if (!installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice;
    installEvt = null; render();
  },
  async copyLink() {
    const url = location.origin + location.pathname;
    try { await navigator.clipboard.writeText(url); toast('Enlace copiado ✅'); }
    catch (e) { prompt('Copia este enlace:', url); }
  },

  // Entreno
  startEmpty() { startWorkout('Entrenamiento libre', []); },
  startRoutine(b, i, j, id) {
    const r = db.routines.find(r => r.id === id);
    startWorkout(r.name, r.items.map(it => ({
      exId: it.exId, rest: it.rest, target: it.reps,
      sets: Array.from({ length: Math.max(1, it.sets) }, () => ({ w: '', r: '', done: false })),
    })), r.id);
  },
  addEx() {
    openPicker(id => {
      db.active.exercises.push({ exId: id, rest: db.settings.rest, target: '', sets: [{ w: '', r: '', done: false }] });
      save(); render();
      scrollTo(0, document.body.scrollHeight);
    });
  },
  addSet(b, i) {
    const x = db.active.exercises[i], last = x.sets[x.sets.length - 1];
    x.sets.push({ w: last ? last.w : '', r: '', done: false });
    save(); render();
  },
  delSet(b, i, j) {
    if (!confirm(`¿Eliminar la serie ${j + 1}?`)) return;
    db.active.exercises[i].sets.splice(j, 1); save(); render();
  },
  toggle(b, i, j) {
    const x = db.active.exercises[i], s = x.sets[j];
    s.done = !s.done;
    if (s.done) {
      // Si dejas los campos vacíos, usa los valores sugeridos (anterior / objetivo)
      const p = lastSets(x.exId)[j];
      if (s.w === '' && p) s.w = String(p.w);
      if (s.r === '') s.r = String(parseInt(x.target) || (p && p.r) || '');
      s.pr = checkPR(i, j);
      if (s.pr) toast(`🏆 ¡Nuevo récord en ${exInfo(x).name}! ${s.pr}`);
      if (x.rest > 0) startTimer(x.rest, nextLabel(i, j));
    } else s.pr = null;
    save(); render();
  },
  exMenu(b, i) {
    const list = db.active.exercises;
    openSheet(exInfo(list[i]).name, [
      ['↑ Subir', () => { moveItem(list, i, -1); save(); render(); }],
      ['↓ Bajar', () => { moveItem(list, i, 1); save(); render(); }],
      ['Eliminar ejercicio', () => { if (confirm('¿Quitar este ejercicio del entreno?')) { list.splice(i, 1); save(); render(); } }, 'danger'],
    ]);
  },
  finish() {
    const w = db.active;
    const exercises = w.exercises.map(x => {
      const ex = exInfo(x);
      return { exId: x.exId, name: ex.name, kind: ex.kind, sets: x.sets.filter(s => s.done).map(s => ({ w: num(s.w), r: num(s.r), ...(s.pr ? { pr: true } : {}) })) };
    }).filter(x => x.sets.length);
    if (!exercises.length) {
      if (confirm('No has completado ninguna serie. ¿Descartar el entrenamiento?')) { db.active = null; save(); releaseAwake(); render(); }
      return;
    }
    const pending = w.exercises.reduce((n, x) => n + x.sets.filter(s => !s.done).length, 0);
    if (!confirm(pending ? `Hay ${pending} series sin marcar ✓ que no se guardarán. ¿Terminar?` : '¿Terminar y guardar el entrenamiento?')) return;
    db.history.push({ id: uid(), name: w.name, routineId: w.routineId, start: w.start, end: Date.now(), exercises });
    db.active = null; save(); releaseAwake();
    openHist = db.history[db.history.length - 1].id;
    view = 'history'; render(); scrollTo(0, 0);
  },
  saveAsRoutine() {
    const w = db.active;
    if (!w.exercises.length) return alert('Añade algún ejercicio primero.');
    const old = db.routines.find(r => r.id === w.routineId);
    const name = prompt('Nombre de la rutina', w.name);
    if (!name || !name.trim()) return;
    const items = w.exercises.map(x => ({
      exId: x.exId, sets: x.sets.length, rest: x.rest,
      reps: x.target || (x.sets.find(s => s.r !== '') || {}).r || '',
    }));
    if (old && old.name === name.trim()) old.items = items;
    else { const r = { id: uid(), name: name.trim(), items }; db.routines.push(r); w.routineId = r.id; }
    w.name = name.trim(); save(); render();
    alert('Rutina guardada ✅');
  },
  discard() {
    if (!confirm('¿Descartar este entrenamiento? Se perderá lo registrado.')) return;
    db.active = null; save(); releaseAwake(); render();
  },

  // Temporizador
  tMinus() { const t = db.active.timer; t.end -= 15000; save(); tick(); },
  tPlus() {
    const t = db.active.timer;
    if (t.end < Date.now()) { t.end = Date.now(); t.total = 0; }
    t.end += 15000; t.total += 15; t.fired = false; save(); tick();
  },
  tSkip() { db.active.timer = null; save(); renderTimer(); },

  // Rutinas
  newRoutine() { draft = { id: null, name: '', items: [] }; render(); },
  editRoutine(b, i, j, id) { draft = JSON.parse(JSON.stringify(db.routines.find(r => r.id === id))); render(); },
  rAddEx() { openPicker(id => { draft.items.push({ exId: id, sets: 3, reps: exById(id).kind === 't' ? '30' : '10', rest: db.settings.rest }); render(); }); },
  rMove(b, i, j) { moveItem(draft.items, i, j); render(); },
  rDel(b, i) { draft.items.splice(i, 1); render(); },
  rCancel() { draft = null; render(); },
  rSave() {
    if (!draft.name.trim()) return alert('Ponle un nombre a la rutina.');
    if (!draft.items.length) return alert('Añade al menos un ejercicio.');
    draft.name = draft.name.trim();
    if (draft.id) db.routines[db.routines.findIndex(r => r.id === draft.id)] = draft;
    else { draft.id = uid(); db.routines.push(draft); }
    draft = null; save(); render();
  },
  rDelete() {
    if (!confirm('¿Eliminar esta rutina? Tu historial no se borra.')) return;
    db.routines = db.routines.filter(r => r.id !== draft.id); draft = null; save(); render();
  },

  // Ejercicios
  addExercise() {
    const name = $('#nxName').value.trim();
    if (!name) return alert('Escribe un nombre.');
    if (db.exercises.some(e => norm(e.name) === norm(name))) return alert('Ese ejercicio ya existe.');
    db.exercises.push({ id: uid(), name, group: $('#nxGroup').value.trim() || 'Otros', kind: $('#nxKind').value });
    save(); render();
  },
  exEdit(b, i, j, id) {
    const e = exById(id);
    openSheet(e.name, [
      [e.img ? 'Ver foto' : 'Añadir foto', () => e.img ? openViewer(e) : openCatalog({ type: 'img', exId: id })],
      ['Renombrar', () => { const n = prompt('Nuevo nombre', e.name); if (n && n.trim()) { e.name = n.trim(); save(); render(); } }],
      ['Cambiar grupo (' + e.group + ')', () => { const g = prompt('Grupo muscular', e.group); if (g && g.trim()) { e.group = g.trim(); save(); render(); } }],
      ['Tipo: ' + KINDS[e.kind], () => openSheet('Tipo de registro', Object.entries(KINDS).map(([k, l]) => [l, () => { e.kind = k; save(); render(); }]))],
      ['Eliminar', () => {
        if (db.active && db.active.exercises.some(x => x.exId === id)) return alert('Está en el entreno en curso; quítalo de ahí primero.');
        const n = db.routines.filter(r => r.items.some(it => it.exId === id)).length;
        if (!confirm(`¿Eliminar «${e.name}»?${n ? ` Se quitará de ${n} rutina(s).` : ''} El historial se conserva.`)) return;
        db.routines.forEach(r => { r.items = r.items.filter(it => it.exId !== id); });
        db.exercises = db.exercises.filter(x => x.id !== id); save(); render();
      }, 'danger'],
    ]);
  },

  // Fotos y catálogo
  viewEx(b, i, j, id) { openViewer(exById(id) || { name: '(eliminado)', group: '', kind: 'w', img: '' }); },
  catAdd() { openCatalog({ type: 'add', cb: null }); },
  catFromPick() { openCatalog({ type: 'add', cb: pickCb }); },
  catImg(b, i, j, id) { openCatalog({ type: 'img', exId: id }); },
  catPick(b, i, j, id) {
    const c = catalog.find(c => c[0] === id), mode = catMode;
    if (!c || !mode) return;
    if (mode.type === 'img') {
      exById(mode.exId).img = id;
      save(); closeModal(); render(); toast('Foto actualizada ✅');
      return;
    }
    const name = prompt('Nombre del ejercicio (puedes ponerlo en español)', c[1]);
    if (!name || !name.trim()) return;
    let e = db.exercises.find(e => norm(e.name) === norm(name.trim()));
    if (e) { if (!e.img) e.img = id; }
    else { e = { id: uid(), name: name.trim(), group: c[2], kind: c[4], img: id }; db.exercises.push(e); }
    save(); closeModal();
    if (mode.cb) mode.cb(e.id);
    else { render(); toast('Añadido: ' + e.name); }
  },

  // Progreso
  progTab(b, i, j, id) { progTab = id; render(); },
  recToggle(b, i, j, id) { openRec = openRec === id ? null : id; render(); },
  bodySave() {
    const e = { id: uid(), date: new Date($('#bDate').value + 'T12:00').getTime() || Date.now() };
    let any = false;
    BODY_FIELDS.forEach(([k]) => {
      const v = num($('#b_' + k).value);
      if (v > 0) { e[k] = v; if (k !== 'height') any = true; }
    });
    if (!any) return alert('Escribe al menos una medida (peso, grasa, cintura...).');
    db.body.push(e); save(); render(); toast('Medidas guardadas ✅');
  },
  bodyDel(b, i, j, id) {
    if (!confirm('¿Eliminar este registro?')) return;
    db.body = db.body.filter(e => e.id !== id); save(); render();
  },

  // Historial
  hToggle(b, i, j, id) { openHist = openHist === id ? null : id; render(); },
  hDel(b, i, j, id) {
    if (!confirm('¿Eliminar este entrenamiento del historial?')) return;
    db.history = db.history.filter(h => h.id !== id); save(); render();
  },

  // Ajustes
  testAlarm() { unlockAudio(); setTimeout(() => alarm('prueba'), 5000); alert('Bloquea la pantalla o cambia de app: en 5 segundos sonará el aviso.'); },
  export() {
    const blob = new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gymlog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  },
  reset() {
    if (!confirm('¿Borrar TODOS los datos (rutinas, historial, ejercicios)? No se puede deshacer.')) return;
    if (!confirm('¿Seguro del todo?')) return;
    localStorage.removeItem(KEY); db = load(); draft = null; render();
  },
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (!b || !A[b.dataset.a]) return;
  A[b.dataset.a](b, +b.dataset.i, +b.dataset.j, b.dataset.id, e);
});

// ---------- Campos de texto ----------
async function onField(e) {
  const el = e.target, f = el.dataset.f;
  if (!f) return;
  const isChange = el.type === 'checkbox' || el.type === 'file';
  if ((e.type === 'change') !== isChange) return;
  const i = +el.dataset.i, j = +el.dataset.j, v = el.value, w = db.active;
  switch (f) {
    case 'wkName': w.name = v; break;
    case 'rest': w.exercises[i].rest = Math.max(0, parseInt(v) || 0); break;
    case 'w': case 'r': w.exercises[i].sets[j][f] = v.trim(); break;
    case 'rName': draft.name = v; return;
    case 'rSets': draft.items[i].sets = Math.max(1, parseInt(v) || 1); return;
    case 'rReps': draft.items[i].reps = v.trim(); return;
    case 'rRest': draft.items[i].rest = Math.max(0, parseInt(v) || 0); return;
    case 'exQ': exQuery = v; $('#exList').innerHTML = exList(); return;
    case 'pickQ': $('#pickList').innerHTML = pickList(v); return;
    case 'catQ': $('#catList').innerHTML = catList(); return;
    case 'catG': if (e.type === 'input') $('#catList').innerHTML = catList(); return;
    case 'sRest': db.settings.rest = Math.max(0, parseInt(v) || 0); break;
    case 'sSound': db.settings.sound = el.checked; break;
    case 'sVibrate': db.settings.vibrate = el.checked; break;
    case 'sAwake': db.settings.awake = el.checked; el.checked ? keepAwake() : releaseAwake(); break;
    case 'sNotify':
      db.settings.notify = el.checked && (Notification.permission === 'granted' || await askNotifPermission());
      save(); render(); return;
    case 'import': {
      const file = el.files[0]; if (!file) return;
      try {
        const d = JSON.parse(await file.text());
        if (!Array.isArray(d.exercises) || !Array.isArray(d.history)) throw new Error('formato no válido');
        if (!confirm('Esto reemplazará todos tus datos actuales. ¿Continuar?')) return;
        localStorage.setItem(KEY, JSON.stringify(d)); db = load(); render();
        alert('Datos importados ✅');
      } catch (err) { alert('No se pudo importar: ' + err.message); }
      return;
    }
  }
  save();
}
document.addEventListener('input', onField);
document.addEventListener('change', onField);

// ---------- Arranque ----------
document.addEventListener('pointerdown', () => { unlockAudio(); keepAwake(); }, { passive: true });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { keepAwake(); tick(); } });
setInterval(tick, 500);
render();
keepAwake();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
