'use strict';

// Versión de la app. Al publicar cambios hay que subirla aquí y en version.json
const APP_VERSION = '2.4.0';

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
const fkg = v => Math.round(v).toLocaleString('es-ES');
const DAY = 864e5;
const dayKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const startOfDay = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
const startOfWeek = ts => { const d = new Date(startOfDay(ts)); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d.getTime(); };
// "Hoy", "Ayer", "Lunes"... o la fecha si hace más de una semana
function dayName(ts) {
  const diff = Math.round((startOfDay(Date.now()) - startOfDay(ts)) / DAY);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  const d = new Date(ts);
  if (diff < 7) { const w = d.toLocaleDateString('es-ES', { weekday: 'long' }); return w[0].toUpperCase() + w.slice(1); }
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const agoText = ts => { const d = Math.round((startOfDay(Date.now()) - startOfDay(ts)) / DAY); return d === 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`; };

// ---------- Iconos (SVG de línea) ----------
const ICONS = {
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2.2"/>',
  dumbbell: '<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10h17M8.5 3v4M15.5 3v4"/>',
  chart: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M7.5 15l3-3.5 2.5 2 4-5"/>',
  sliders: '<path d="M6 3.5v6M6 14.5v6M12 3.5v1.5M12 10v10.5M18 3.5v9M18 17.5v3"/><circle cx="6" cy="12" r="2.5"/><circle cx="12" cy="7.5" r="2.5"/><circle cx="18" cy="15" r="2.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  chevL: '<path d="M14.5 17l-5-5 5-5"/>',
  chevR: '<path d="M9.5 7l5 5-5 5"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  more: '<circle cx="5.5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18.5" cy="12" r="1.3" fill="currentColor"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2.2 2M9.5 2.5h5"/>',
  trophy: '<path d="M8 3.5h8v6a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.5a2.5 2.5 0 0 0 2.6 4M16 5.5h2.5a2.5 2.5 0 0 1-2.6 4M12 13.5v3.5M8.5 20.5h7M10 17h4"/>',
  flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-2.7 1.6-4.5 3-6 .4 1.8 1.4 2.8 2.4 3.2-.3-3.2.9-6 3.1-8 .4 3.3 5.5 5.6 5.5 10.8 0 3.6-2.6 6.2-7.5 6.2z"/>',
  scale: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M8 9.5a5.5 5.5 0 0 1 8 0M12 10l1.5-2.2"/>',
  ruler: '<rect x="2.5" y="8" width="19" height="8" rx="2"/><path d="M6.5 8v3M10 8v4M13.5 8v3M17 8v4"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  edit: '<path d="M4.5 19.5h4l10-10-4-4-10 10zM13 7l4 4"/>',
  up: '<path d="M12 19V5M6.5 10.5L12 5l5.5 5.5"/>',
  down: '<path d="M12 5v14M6.5 13.5L12 19l5.5-5.5"/>',
  refresh: '<path d="M19.5 11A7.5 7.5 0 0 0 6 6.5L4.5 8M4.5 4v4h4M4.5 13A7.5 7.5 0 0 0 18 17.5l1.5-1.5M19.5 20v-4h-4"/>',
  download: '<path d="M12 3.5v12M7 10.5l5 5 5-5M4.5 20.5h15"/>',
  upload: '<path d="M12 15.5v-12M7 8.5l5-5 5 5M4.5 20.5h15"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5h4"/>',
  phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="3"/><path d="M12 7.5v7M9.5 12l2.5 2.5 2.5-2.5"/>',
  book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8.5 8.5"/>',
  copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="3"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
};
const ic = (name, size) => `<svg class="i" viewBox="0 0 24 24"${size ? ` style="width:${size}px;height:${size}px"` : ''}>${ICONS[name] || ''}</svg>`;

// Anillo de progreso (widget "Esta semana")
function ring(value, total, size = 64) {
  const r = 27, c = 2 * Math.PI * r, frac = Math.min(1, total ? value / total : 0);
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 64 64">
    <circle class="bg" cx="32" cy="32" r="${r}" fill="none" stroke-width="3"/>
    <circle class="fg" cx="32" cy="32" r="${r}" fill="none" stroke-width="3" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - frac)).toFixed(2)}" transform="rotate(-90 32 32)"/>
    <text x="32" y="39" text-anchor="middle">${value}</text></svg>`;
}

// Tipos de ejercicio: w = peso × reps, r = solo reps, t = tiempo en segundos, c = cardio en minutos
const KINDS = { w: 'Peso × reps', r: 'Solo reps', t: 'Tiempo (seg)', c: 'Cardio (min)' };

// Fotos del catálogo libre free-exercise-db (dominio público), servidas por jsDelivr
const IMG_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';
const imgUrl = (id, n = 0) => `${IMG_BASE}${id}/${n}.jpg`;
const thumb = e => e.img
  ? `<img class="thumb" src="${imgUrl(e.img)}" alt="" loading="lazy" crossorigin="anonymous">`
  : `<span class="thumb noimg">${ic('dumbbell')}</span>`;

// Campos de medidas corporales: [clave, etiqueta, unidad]
const BODY_FIELDS = [['weight', 'Peso', 'kg'], ['height', 'Altura', 'cm'], ['fat', 'Grasa', '%'],
  ['waist', 'Cintura', 'cm'], ['chest', 'Pecho', 'cm'], ['arm', 'Brazo', 'cm'], ['thigh', 'Muslo', 'cm']];
const BODY_FORM = BODY_FIELDS.filter(f => f[0] !== 'height');  // la altura va en el perfil

// ---------- Datos ----------
let db = load();
let view = db.active ? 'workout' : 'home';  // home | workout | routines | calendar | progress | settings
let draft = null;         // rutina en edición
let openHist = null;      // entreno desplegado en el calendario
let exQuery = '';
let pickCb = null;
let sheetOpts = [];
let routTab = 'routines'; // pestaña de Rutinas: routines | exercises
let progTab = 'records';  // pestaña de Progreso: records | body
let openRec = null;       // ejercicio desplegado en récords
let catalog = null;       // catálogo de fotos (se carga al abrirlo)
let catMode = null;       // { type: 'add', cb } o { type: 'img', exId }
let viewerTimer = null;
let calMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
let calDay = null;        // día seleccionado en el calendario ('AAAA-MM-DD')
let updateInfo = null;    // { version, files } si hay una versión nueva en GitHub
let musWeek = 0;          // semana del informe muscular (0 = esta semana, -1 = la anterior...)
let bodySide = 'both';    // vista del mapa corporal
let musSel = null;        // músculo elegido en la gráfica de evolución

function load() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
  if (!d) d = {
    exercises: DEFAULT_EX_DATA.map(e => ({ id: uid(), ...exFromData(e) })),
    routines: [], history: [], active: null, dataVer: 4,
  };
  d.body ||= [];
  // Datos de versiones anteriores: añade la foto a los ejercicios por defecto
  if ((d.dataVer || 0) < 3) migrateV3(d);
  if (d.dataVer < 4) migrateV4(d);
  d.profile = Object.assign({ sex: '', birthYear: null, height: null }, d.profile);
  if (!d.profile.height) { const h = d.body.filter(e => e.height).sort((a, b) => b.date - a.date)[0]; if (h) d.profile.height = h.height; }
  d.settings = Object.assign({ rest: 90, sound: true, vibrate: true, notify: true, awake: true, weekGoal: 3 }, d.settings);
  return d;
}
// Versión 2.1: completa los ejercicios existentes (músculos, % peso corporal, MET, cardio)
// y añade los ejercicios nuevos de calistenia y cardio. No toca rutinas ni historial.
function migrateV3(d) {
  const byName = Object.fromEntries(DEFAULT_EX_DATA.map(e => [e[0], exFromData(e)]));
  d.exercises.forEach(e => {
    const def = byName[e.name];
    if (e.img === undefined) e.img = def ? def.img : '';
    if (!def) return;
    if (!e.mus) e.mus = def.mus;
    if (e.bw === undefined) e.bw = def.bw;
    if (e.met === undefined) e.met = def.met;
    if (def.cardio && !e.cardio) {
      e.cardio = def.cardio;
      if (e.kind === 't') {
        // los sets de cardio pasan de segundos a minutos
        if (d.active) d.active.exercises.filter(x => x.exId === e.id).forEach(x => x.sets.forEach(st => { if (st.r !== '') st.r = String(Math.round(num(st.r) / 60) || 1); }));
        e.kind = 'c';
      }
    }
  });
  const have = new Set(d.exercises.map(e => norm(e.name)));
  DEFAULT_EX_DATA.forEach(e => { if (!have.has(norm(e[0]))) d.exercises.push({ id: uid(), ...exFromData(e) }); });
  d.dataVer = 3;
}

// Aplica una regla de movimiento a un ejercicio (sin pisar lo que hayas editado a mano)
function applyMove(e, rule) {
  if (!rule) return false;
  e.fam = e.fam || rule.fam;
  if (!e.bwUser && !e.bw) e.bw = rule.bw;
  if (!e.musUser) e.mus = { p: rule.p.split(','), s: rule.s ? rule.s.split(',') : [] };
  if (!e.met) e.met = MET.cali;
  return true;
}
// Peso corporal registrado en una fecha (el último registro anterior; si no hay, el primero posterior)
function bodyWeightAt(d, ts) {
  const list = d.body.filter(e => e.weight).sort((a, b) => a.date - b.date);
  if (!list.length) return 0;
  const before = list.filter(e => e.date <= ts + DAY);
  return (before.length ? before[before.length - 1] : list[0]).weight;
}
// Versión 2.3: reconoce movimientos de calistenia en ejercicios del catálogo o propios,
// completa los músculos de las dominadas y recalcula los kg (y calorías) de entrenos pasados.
function migrateV4(d) {
  const defs = Object.fromEntries(DEFAULT_EX_DATA.map(e => [e[0], exFromData(e)]));
  d.exercises.forEach(e => {
    const def = defs[e.name];
    if (def) { if (!e.musUser) e.mus = def.mus; if (!e.bwUser && def.bw) e.bw = def.bw; return; }
    applyMove(e, moveOf(e.name));
  });
  const byId = Object.fromEntries(d.exercises.map(e => [e.id, e]));
  d.history.forEach(h => h.exercises.forEach(x => {
    const ex = byId[x.exId];
    if (!ex || !ex.bw || x.bw || (x.kind !== 'w' && x.kind !== 'r')) return;
    x.bw = ex.bw;
    if (!h.bodyKg) h.bodyKg = bodyWeightAt(d, h.start);
    // Las calorías dependen del MET: pasa de pesas (3,5) o peso corporal general (3,0) a calistenia (3,8)
    if (x.kcal) {
      const old = x.kind === 'w' ? MET.weights : MET.bodyweight, k = x.kcal * (ex.met || MET.cali) / old;
      if (h.kcal != null) h.kcal = Math.round(h.kcal + k - x.kcal);
      x.kcal = Math.round(k);
    }
  }));
  if (d.active) d.active.exercises.forEach(x => { const ex = byId[x.exId]; if (ex && !x.bw) x.bw = ex.bw; });
  d.dataVer = 4;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch (e) { alert('No se pudo guardar: ' + e.message); }
}

const exById = id => db.exercises.find(e => e.id === id);
const exInfo = x => exById(x.exId) || { name: x.name || '(eliminado)', group: '', kind: x.kind || 'w', img: '' };

// Series del último entreno que incluyó este ejercicio
function lastSets(exId) {
  for (let k = db.history.length - 1; k >= 0; k--) {
    const e = db.history[k].exercises.find(x => x.exId === exId);
    if (e) return e.sets;
  }
  return [];
}
// Tipos de serie: el calentamiento no cuenta en kg, récords, músculos ni estimador (sí en calorías)
const SET_TYPES = { '': ['Normal', ''], w: ['Calentamiento', 'C'], f: ['Al fallo', 'F'], d: ['Drop set', 'D'] };
const isWork = s => s.t !== 'w';
const setTag = s => (s.t ? ' ' + SET_TYPES[s.t][1] : '') + (s.rpe ? ` @${s.rpe}` : '');

function setText(kind, s, x) {
  if (kind === 'c') {
    if (x && x.cardio === 'treadmill') return `${s.r} min · ${s.v || 0} km/h · ${s.g || 0}%`;
    const lv = x && cardioLevels(x)[s.l || 0];
    return `${s.r} min${lv ? ' · ' + lv[0].split(' (')[0] : ''}`;
  }
  if (kind === 'w') return x && x.bw ? `+${s.w} kg × ${s.r}` : `${s.w} kg × ${s.r}`;
  return kind === 't' ? `${s.r} s` : `${s.r} reps`;
}
// Kg levantados en una serie: % de peso corporal × tu peso + peso/lastre de la barra
const setLoad = (x, s, bodyKg) => (x.bw || 0) * (bodyKg || 0) + (x.kind === 'w' ? num(s.w) : 0);
const workoutVolume = h => h.exercises.reduce((v, x) => v + (x.kind === 'w' || x.kind === 'r'
  ? x.sets.reduce((a, s) => a + (isWork(s) ? setLoad(x, s, h.bodyKg) * s.r : 0), 0) : 0), 0);

// ---------- Perfil, metabolismo y calorías ----------
const cardioLevels = ex => CARDIO[ex.cardio] || CARDIO.other;
function profile() {
  const p = db.profile || {}, w = latestBody('weight');
  return { sex: p.sex, age: p.birthYear ? new Date().getFullYear() - p.birthYear : null, height: p.height, weight: w ? w.v : null };
}
const bodyWeight = () => profile().weight;
// Metabolismo basal en kcal/min (Harris-Benedict, la fórmula del Compendio).
// Sin sexo/edad/altura se usa el valor estándar 1 MET = 3,5 ml O2/kg/min.
function rmrPerMin() {
  const { sex, age, height: h, weight: w } = profile();
  if (!w) return null;
  if (sex && age && h) {
    const day = sex === 'm' ? 66.473 + 13.7516 * w + 5.0033 * h - 6.755 * age
      : 655.0955 + 9.5634 * w + 1.8496 * h - 4.6756 * age;
    return day / 1440;
  }
  return 3.5 * w / 200;
}
const profileComplete = () => { const p = profile(); return !!(p.sex && p.age && p.height && p.weight); };
// MET de la cinta según velocidad (km/h) e inclinación (%), ecuaciones ACSM.
// Por debajo de 7 km/h se usa la de caminar; desde 7 km/h, la de correr.
function treadmillMET(kmh, inc) {
  const S = kmh * 1000 / 60, G = inc / 100;
  const vo2 = kmh < 7 ? 0.1 * S + 1.8 * S * G + 3.5 : 0.2 * S + 0.9 * S * G + 3.5;
  return vo2 / 3.5;
}
const exMET = ex => ex.met || (ex.kind === 'w' ? MET.weights : ex.kind === 't' ? MET.core : ex.bw ? MET.cali : MET.bodyweight);
// Calorías de una serie: MET × metabolismo basal por minuto × duración.
// Duración = tiempo de la serie (3 s por repetición, mínimo 10 s) + el descanso que la sigue (máx. 5 min),
// porque los MET del Compendio para pesas/calistenia corresponden a sesiones con descansos incluidos.
function setKcal(ex, s, rest, rmr) {
  if (ex.kind === 'c') {
    const min = num(s.r);
    if (!min) return 0;
    const met = ex.cardio === 'treadmill' ? treadmillMET(num(s.v), num(s.g)) : (cardioLevels(ex)[+s.l || 0] || cardioLevels(ex)[0])[1];
    return met * rmr * min;
  }
  const active = ex.kind === 't' ? num(s.r) : Math.max(10, num(s.r) * 3);
  return exMET(ex) * rmr * (active + Math.min(rest || 0, 300)) / 60;
}
// Calorías y kg del entreno en curso (solo series marcadas)
function activeTotals() {
  const w = db.active, rmr = rmrPerMin(), bk = bodyWeight();
  let kcal = 0, vol = 0;
  const per = w.exercises.map(x => {
    const ex = exInfo(x);
    let k = 0;
    x.sets.forEach(s => {
      if (!s.done) return;
      if (rmr) k += setKcal(ex, s, x.rest, rmr);
      if ((ex.kind === 'w' || ex.kind === 'r') && isWork(s)) vol += setLoad(ex, s, bk) * num(s.r);
    });
    kcal += k;
    return k;
  });
  return { kcal, vol, per, rmr };
}
// Calorías de un entreno guardado (los antiguos, sin dato, se estiman con el perfil actual)
function histKcal(h) {
  if (h.kcal != null) return h.kcal;
  const rmr = rmrPerMin();
  if (!rmr) return 0;
  return h.exercises.reduce((t, x) => {
    const ex = { ...(exById(x.exId) || {}), kind: x.kind, cardio: x.cardio || (exById(x.exId) || {}).cardio };
    if (x.kind === 't' && ex.cardio) {
      // cardio de versiones anteriores (guardado en segundos, sin velocidad ni intensidad): nivel moderado
      const met = ex.cardio === 'treadmill' ? treadmillMET(6, 0) : (cardioLevels(ex)[1] || cardioLevels(ex)[0])[1];
      return t + met * rmr * x.sets.reduce((a, st) => a + st.r / 60, 0);
    }
    return t + x.sets.reduce((a, st) => a + setKcal(ex, st, db.settings.rest, rmr), 0);
  }, 0);
}

// ---------- Músculos trabajados por semana ----------
const musOf = ex => ex.mus && (ex.mus.p.length || ex.mus.s.length) ? ex.mus : { p: GROUP_MUSCLES[ex.group] || [], s: [] };
// Series y repeticiones por músculo: principal cuenta 1, secundario ½
function weekMuscles(weekOffset) {
  const from = startOfWeek(Date.now()) + weekOffset * 7 * DAY, to = from + 7 * DAY;
  const tot = emptyMuscles();
  db.history.forEach(h => { if (h.start >= from && h.start < to) addWorkoutMuscles(tot, h); });
  if (db.active && db.active.start >= from && db.active.start < to)
    db.active.exercises.forEach(x => { const ex = exInfo(x); x.sets.forEach(st => { if (st.done) addMuscles(tot, ex, ex.kind, st); }); });
  return { from, to, tot };
}
const emptyMuscles = () => Object.fromEntries(Object.keys(MUSCLES).map(k => [k, { sets: 0, reps: 0 }]));
function addMuscles(tot, ex, kind, s) {
  if (kind === 'c' || !isWork(s)) return;
  const m = musOf(ex), r = kind === 't' ? 0 : num(s.r);
  m.p.forEach(k => { if (tot[k]) { tot[k].sets += 1; tot[k].reps += r; } });
  m.s.forEach(k => { if (tot[k]) { tot[k].sets += 0.5; tot[k].reps += r / 2; } });
}
function addWorkoutMuscles(tot, h) {
  h.exercises.forEach(x => { const ex = exById(x.exId) || { group: '' }; x.sets.forEach(st => addMuscles(tot, ex, x.kind, st)); });
  return tot;
}
// Colores del informe: azul 1-4 series, violeta claro 5-8, morado 9 o más
const musColor = n => n <= 0 ? null : n < 5 ? '#3b82f6' : n < 9 ? '#c4b5fd' : '#9333ea';
const fser = n => (Math.round(n * 2) / 2).toLocaleString('es-ES');

// Dibujo del cuerpo (frontal o trasero) coloreado según las series de cada músculo
function bodySvg(side, tot, h = 260) {
  const zone = {};
  Object.entries(MUSCLES).forEach(([k, [, zones]]) => zones.forEach(z => { zone[z] = k; }));
  const H = side === 'front' ? 2000 : 2220;
  const polys = BODY[side].map(([z, pts]) => {
    const k = zone[z], c = k && musColor(tot[k].sets);
    const fill = c || (k ? '#2c2c2e' : '#1c1c1e');
    return pts.map(p => `<polygon points="${p}" fill="${fill}"${c ? ` style="filter:drop-shadow(0 0 18px ${c}88)"` : ''}/>`).join('');
  }).join('');
  return `<svg class="bodymap" viewBox="-20 -20 1040 ${H + 40}" style="height:${h}px">${polys}</svg>`;
}

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
      if (!isWork(s)) return;
      if (x.kind === 'w') {
        up('maxW', s.w, s, h.start);
        up('best', e1rm(s.w, s.r), s, h.start);
        top = Math.max(top, e1rm(s.w, s.r));
      } else top = Math.max(top, s.r);
      if (x.kind === 'w' || x.kind === 'r') vol += setLoad(x, s, h.bodyKg) * s.r;
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
  if (kind === 'c' || !isWork(s)) return null;
  const st = exStats(x.exId);
  if (!st.sessions.length) return null;  // primera vez que haces el ejercicio: nada con qué comparar
  const others = db.active.exercises.flatMap((y, ii) => y.exId === x.exId ? y.sets.filter((z, jj) => z.done && isWork(z) && !(ii === i && jj === j)) : []);
  const w = num(s.w), r = num(s.r);
  const best = (key, f) => Math.max(st[key] ? st[key].v : 0, ...others.map(f));
  if (kind === 'w') {
    if (w > best('maxW', z => num(z.w))) return `Peso máximo: ${w} kg`;
    if (e1rm(w, r) > best('best', z => e1rm(num(z.w), num(z.r))) + 0.05) return `Mejor serie: ${w} kg × ${r} (1RM est. ${r1(e1rm(w, r))} kg)`;
    return null;
  }
  return r > best('maxR', z => num(z.r)) ? `${r} ${kind === 't' ? 'seg' : 'reps'}` : null;
}

// Último récord conseguido (widget de inicio)
function lastPR() {
  for (let k = db.history.length - 1; k >= 0; k--) {
    const h = db.history[k];
    for (const x of h.exercises) {
      const s = x.sets.find(s => s.pr);
      if (s) return { name: x.name, text: setText(x.kind, s, x), date: h.start };
    }
  }
  return null;
}

// Semanas seguidas con al menos un entreno
function weekStreak() {
  const weeks = new Set(db.history.map(h => startOfWeek(h.start)));
  let w = startOfWeek(Date.now()), n = 0;
  if (!weeks.has(w)) w = startOfWeek(w - DAY);
  while (weeks.has(w)) { n++; w = startOfWeek(w - DAY); }
  return n;
}

function latestBody(key) {
  let best = null;
  db.body.forEach(e => { if (e[key] && (!best || e.date > best.date)) best = { v: e[key], date: e.date }; });
  return best;
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
  const W = 320, H = 130, P = 8, top = 18, bottom = 18;
  const ys = pts.map(p => p.y), lo = Math.min(...ys), hi = Math.max(...ys), span = hi - lo || 1;
  const x0 = pts[0].x, xs = pts[pts.length - 1].x - x0 || 1;
  const X = p => P + (p.x - x0) / xs * (W - 2 * P), Y = p => top + (1 - (p.y - lo) / span) * (H - top - bottom);
  const path = pts.map((p, k) => (k ? 'L' : 'M') + X(p).toFixed(1) + ' ' + Y(p).toFixed(1)).join(' ');
  const d = ts => new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">
    <path d="${path}" fill="none" stroke="var(--ac)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map(p => `<circle cx="${X(p).toFixed(1)}" cy="${Y(p).toFixed(1)}" r="3" fill="var(--bg)" stroke="var(--ac)" stroke-width="2"/>`).join('')}
    <text x="${P}" y="11" class="cl">máx ${r1(hi)} ${unit} · mín ${r1(lo)} ${unit}</text>
    <text x="${P}" y="${H - 3}" class="cl">${d(pts[0].x)}</text><text x="${W - P}" y="${H - 3}" class="cl" text-anchor="end">${d(pts[pts.length - 1].x)}</text>
  </svg>`;
}

// ---------- Vistas ----------
const NAV = [['home', 'grid', 'Inicio'], ['routines', 'dumbbell', 'Rutinas'], ['calendar', 'calendar', 'Calendario'], ['progress', 'chart', 'Progreso'], ['settings', 'sliders', 'Ajustes']];
$('#nav').innerHTML = NAV.map(([v, i, l]) => `<button data-a="nav" data-view="${v}" aria-label="${l}">${ic(i)}</button>`).join('');
$('#tskip').innerHTML = ic('x', 18);

function render() {
  const navView = view === 'workout' ? 'home' : view;
  document.querySelectorAll('nav button').forEach(b => {
    b.classList.toggle('on', b.dataset.view === navView);
    b.classList.toggle('live', b.dataset.view === 'home' && !!db.active);
  });
  const fn = { home: vHome, workout: vWorkout, routines: vRoutines, calendar: vCalendar, progress: vProgress, settings: vSettings }[view];
  $('#app').innerHTML = fn();
  renderTimer();
}

const header = (title, right = '', eyebrow = '') =>
  `<header class="top"><div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${title}</h1></div>${right}</header>`;

// ---------- Instalar como app ----------
let installEvt = null;  // evento de Chrome/Android para mostrar el diálogo de instalación
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
// Navegadores internos de otras apps (Instagram, WhatsApp, Claude...) que no permiten instalar
const inAppBrowser = /FBAN|FBAV|Instagram|Line\/|; wv\)|WhatsApp|Claude/i.test(navigator.userAgent);

function installCard() {
  if (isStandalone()) return '';
  let how;
  if (installEvt) how = `<button class="btn primary block" data-a="install">${ic('phone', 20)} Instalar app</button>`;
  else if (inAppBrowser) how = `<p class="small muted">Estás en el navegador interno de otra app y desde aquí no se puede instalar.
      Toca <b>⋮</b> o <b>···</b> y elige <b>"Abrir en ${isIOS ? 'Safari' : 'Chrome'}"</b>, o copia el enlace.</p>
      <button class="btn block" data-a="copyLink">${ic('copy', 20)} Copiar enlace</button>`;
  else if (isIOS) how = '<p class="small muted">En <b>Safari</b>: toca <b>Compartir</b> y elige <b>"Añadir a pantalla de inicio"</b>.</p>';
  else how = '<p class="small muted">En <b>Chrome</b>: menú <b>⋮</b> → <b>"Instalar aplicación"</b>.</p>';
  return `<div class="card"><div class="hrow"><div><b>Instala GymLog como una app</b><p class="small muted">Con su icono y a pantalla completa.</p></div>${ic('phone')}</div>${how}</div>`;
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (view !== 'workout') render(); });
window.addEventListener('appinstalled', () => { installEvt = null; if (view !== 'workout') render(); });

function updateBanner() {
  if (!updateInfo) return '';
  return `<button class="w banner" data-a="applyUpdate">${ic('download')}<div><b>Nueva versión ${esc(updateInfo.version)}</b><p>Toca para actualizar. Tus datos se conservan.</p></div>${ic('chevR')}</button>`;
}

// Puntos de los últimos 3 meses (widget calendario)
function miniCalendars() {
  const days = new Set(db.history.map(h => dayKey(h.start))), today = dayKey(Date.now()), now = new Date();
  return '<div class="mcal">' + [2, 1, 0].map(back => {
    const first = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const n = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate(), off = (first.getDay() + 6) % 7;
    let cells = '<i></i>'.repeat(off);
    for (let d = 1; d <= n; d++) {
      const k = dayKey(new Date(first.getFullYear(), first.getMonth(), d));
      cells += `<i class="dot${days.has(k) ? ' on' : ''}${k === today ? ' today' : ''}"></i>`;
    }
    return `<div><span class="ml">${first.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}</span><div class="mgrid">${cells}</div></div>`;
  }).join('') + '</div>';
}

function vHome() {
  const goal = db.settings.weekGoal || 3;
  const weekCount = db.history.filter(h => h.start >= startOfWeek(Date.now())).length;
  const bw = latestBody('weight'), last = db.history[db.history.length - 1], pr = lastPR(), streak = weekStreak();
  // Volumen de los últimos 7 días, día a día
  const today0 = startOfDay(Date.now());
  const perDay = Array.from({ length: 7 }, (_, k) => {
    const from = today0 - (6 - k) * DAY;
    return db.history.filter(h => h.start >= from && h.start < from + DAY).reduce((v, h) => v + workoutVolume(h), 0);
  });
  const vol7 = perDay.reduce((a, b) => a + b, 0), maxDay = Math.max(...perDay) || 1;
  const kcal7 = db.history.filter(h => h.start >= today0 - 6 * DAY).reduce((k, h) => k + histKcal(h), 0);
  const notifTip = ('Notification' in window && Notification.permission === 'default')
    ? `<button class="w banner" data-a="askNotif">${ic('bell')}<div><b>Avisos de descanso</b><p>Permite las notificaciones para saber cuándo acaba cada descanso.</p></div>${ic('chevR')}</button>` : '';
  const active = db.active ? `<button class="w wide live" data-a="go" data-id="workout" style="margin-bottom:12px">
      <div class="hrow"><div><small class="muted"><span class="pulse"></span>Entreno en curso</small><b style="display:block;font-size:20px;margin-top:4px">${esc(db.active.name)}</b>
      <small class="muted">${db.active.exercises.length} ejercicios · ${fmt((Date.now() - db.active.start) / 1000)}</small></div>
      <span class="round light">${ic('chevR')}</span></div></button>` : '';
  const today = cap(new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
  return header('Entrenar', `<button class="round" data-a="startEmpty" aria-label="Entreno libre">${ic('plus')}</button>`, today)
    + updateBanner() + installCard() + notifTip + active +
    `<div class="wgrid">
      <button class="w sq" data-a="go" data-id="calendar">${ring(weekCount, goal)}<span class="wico">${ic('chevR', 18)}</span>
        <div class="wfoot"><b>Esta semana</b><small>${weekCount} de ${goal} entrenos</small></div></button>
      <button class="w sq" data-a="goBody"><span class="wico">${ic('scale', 20)}</span>
        <div class="big">${bw ? `${bw.v}<small>kg</small>` : '—'}</div>
        <div class="wfoot"><b>Peso corporal</b><small>${bw ? agoText(bw.date) : 'Toca para registrar'}</small></div></button>
      <button class="w wide" data-a="go" data-id="calendar">${miniCalendars()}
        <div class="wrow">${last ? `<span class="round sm">${ic('dumbbell', 18)}</span><div><b>${esc(last.name)}</b><small>${dayName(last.start)} · ${fmt((last.end - last.start) / 1000)}</small></div>`
          : '<div><b>Sin entrenos todavía</b><small>Tus días entrenados se iluminarán aquí</small></div>'}</div></button>
      ${homeMuscles()}
      <div class="w wide"><div class="hrow"><div><b>Kg levantados</b><small class="muted" style="display:block">Últimos 7 días${kcal7 ? ` · ≈ ${fkg(kcal7)} kcal` : ''}</small></div>
        <div class="bars">${perDay.map((v, k) => `<i class="${v ? 'on' : ''}" style="height:${Math.max(4, v / maxDay * 34)}px" title="${k}"></i>`).join('')}</div>
        <div class="big sm">${fkg(vol7)}<small>kg</small></div></div></div>
      <div class="w sq" style="cursor:default"><span class="wico">${ic('flame', 20)}</span><div class="big">${streak}</div>
        <div class="wfoot"><b>Racha</b><small>${streak === 1 ? 'semana seguida' : 'semanas seguidas'}</small></div></div>
      <button class="w sq" data-a="go" data-id="progress"><span class="wico">${ic('trophy', 20)}</span><div></div>
        <div class="wfoot"><small>Último récord</small><b>${pr ? esc(pr.text) : 'Aún ninguno'}</b><small>${pr ? `${esc(pr.name)} · ${dayName(pr.date)}` : 'Supera tus marcas'}</small></div></button>
    </div>
    <div class="sec"><h2>Rutinas</h2><button class="link" data-a="go" data-id="routines">Ver todas</button></div>
    ${db.routines.map(r => routineCard(r, false)).join('') || `<button class="w wide banner" data-a="newRoutineGo">${ic('plus')}<div><b>Crea tu primera rutina</b><p>Guarda tus ejercicios, series y descansos.</p></div></button>`}`;
}

function homeMuscles() {
  const { tot } = weekMuscles(0);
  const top = Object.entries(tot).filter(([, v]) => v.sets > 0).sort((a, b) => b[1].sets - a[1].sets);
  return `<button class="w wide" data-a="goMuscles"><div class="hrow">
      <div class="bodies">${bodySvg('front', tot, 130)}${bodySvg('back', tot, 130)}</div>
      <div><b>Músculos esta semana</b>
        ${top.length ? top.slice(0, 4).map(([k, v]) => `<small><i class="dotc" style="background:${musColor(v.sets)}"></i>${MUSCLES[k][0]} · ${fser(v.sets)}</small>`).join('')
          : '<small>Entrena y se irán iluminando</small>'}</div></div></button>`;
}

function routineCard(r, editable) {
  const groups = [...new Set(r.items.map(it => exInfo(it).group).filter(Boolean))].slice(0, 3).join(' · ');
  return `<div class="w rt"><div class="rtinfo"><b>${esc(r.name)}</b><small>${r.items.length} ${r.items.length === 1 ? 'ejercicio' : 'ejercicios'}${groups ? ' · ' + esc(groups) : ''}</small></div>
    ${editable ? `<button class="round sm" data-a="editRoutine" data-id="${r.id}" aria-label="Editar">${ic('edit', 18)}</button>` : ''}
    <button class="round light" data-a="startRoutine" data-id="${r.id}" aria-label="Empezar">${ic('play', 20)}</button></div>`;
}

function vWorkout() {
  const w = db.active;
  if (!w) { view = 'home'; return vHome(); }
  return `<header class="top"><button class="round" data-a="go" data-id="home" aria-label="Inicio">${ic('back')}</button>
      <div class="wk-t"><input class="wk-name" data-f="wkName" value="${esc(w.name)}"><span id="elapsed">${fmt((Date.now() - w.start) / 1000)}</span></div>
      <button class="round" data-a="wkMenu" aria-label="Opciones">${ic('more')}</button></header>
    ${liveStats()}
    ${w.exercises.map(exCard).join('') || '<p class="muted center" style="margin:40px 0">Añade tu primer ejercicio</p>'}
    <button class="btn block" data-a="addEx">${ic('plus', 20)} Añadir ejercicio</button>
    <button class="btn primary block" data-a="finish">${ic('check', 20)} Terminar entrenamiento</button>`;
}

function liveStats() {
  const t = activeTotals();
  return `<div class="stats live3"><div><small>Calorías</small><b>${t.rmr ? '≈ ' + fkg(t.kcal) : '—'}</b></div>
    <div><small>Kg levantados</small><b>${fkg(t.vol)}</b></div>
    <div><small>Series</small><b>${db.active.exercises.reduce((n, x) => n + x.sets.filter(s => s.done).length, 0)}</b></div></div>
    ${t.rmr && profileComplete() ? '' : `<button class="w banner" data-a="goProfile">${ic('scale')}<div><b>${t.rmr ? 'Afina el cálculo de calorías' : 'Calorías sin calcular'}</b><p>${t.rmr ? 'Añade sexo, edad y altura en tu perfil.' : 'Registra tu peso en Progreso → Cuerpo.'}</p></div>${ic('chevR')}</button>`}`;
}

function exCard(x, i) {
  if (exInfo(x).kind === 'c') return cardioCard(x, i);
  const ex = exInfo(x), k = ex.kind, prev = lastSets(x.exId);
  const rows = x.sets.map((s, j) => {
    const p = prev[j];
    const phW = p && k === 'w' ? p.w : '';
    const phR = x.target || (p ? p.r : '');
    return `<div class="srow${s.done ? ' done' : ''}${s.t === 'w' ? ' wu' : ''}">
      <button class="setn" data-a="setMenu" data-i="${i}" data-j="${j}">${s.pr ? ic('trophy', 18) : s.t ? SET_TYPES[s.t][1] : j + 1}${s.rpe ? `<small class="rpe">@${s.rpe}</small>` : ''}</button>
      <span class="prev">${p ? setText(k, p, ex) : '—'}</span>
      ${k === 'w' ? `<input inputmode="decimal" data-f="w" data-i="${i}" data-j="${j}" value="${esc(s.w)}" placeholder="${esc(phW)}">` : ''}
      <input inputmode="numeric" data-f="r" data-i="${i}" data-j="${j}" value="${esc(s.r)}" placeholder="${esc(phR)}">
      <button class="chk" data-a="toggle" data-i="${i}" data-j="${j}" aria-label="Hecha">${ic('check', 20)}</button>
    </div>`;
  }).join('');
  return `<div class="card">
    <div class="ex-head"><button class="thumbbtn" data-a="viewEx" data-id="${x.exId}">${thumb(ex)}</button>
      <div class="ex-t"><b>${esc(ex.name)}</b><small>${esc(ex.group)}${ex.bw ? ` · ${Math.round(ex.bw * 100)}% peso corporal` : ''}${x.target ? ` · objetivo ${esc(x.target)} ${k === 't' ? 's' : 'reps'}` : ''}</small></div>
      <button class="round sm" data-a="exMenu" data-i="${i}" aria-label="Opciones">${ic('more', 18)}</button></div>
    <label class="rest">${ic('timer', 18)} Descanso <input inputmode="numeric" data-f="rest" data-i="${i}" value="${x.rest}"> s</label>
    ${suggestionBox(x, i)}
    <div class="sets${k === 'w' ? '' : ' nw'}"><div class="srow h"><span>Serie</span><span>Anterior</span>${k === 'w' ? `<span>${ex.bw ? '+kg' : 'kg'}</span>` : ''}<span>${k === 't' ? 'Seg' : 'Reps'}</span><span></span></div>${rows}</div>
    <button class="btn sm ghost" data-a="addSet" data-i="${i}">${ic('plus', 16)} Serie</button>
  </div>`;
}

// ---------- Sugerencia de progresión (doble progresión) ----------
// Mira las series de trabajo de la última sesión: si llegaste al tope del rango de repeticiones
// en todas (o el RPE fue bajo), propone subir peso; si no, repetir peso y sumar una repetición.
// Rango: el objetivo de la rutina (p. ej. "8-12") o, si no hay, 8-12 en pesas, 5-8 con lastre y hasta 15 sin lastre.
const fdec = v => r1(v).toLocaleString('es-ES');  // 72.5 → "72,5"
function parseRange(t) {
  const m = String(t || '').match(/(\d+)\s*[-–a]\s*(\d+)/);
  if (m) return { lo: +m[1], hi: +m[2] };
  const n = parseInt(t);
  return n ? { lo: n, hi: n } : null;
}
function suggestion(x) {
  const ex = exInfo(x), k = ex.kind;
  if (k === 'c') return null;
  const prev = lastSets(x.exId).filter(isWork);
  if (!prev.length) return null;
  const rpes = prev.filter(s => s.rpe).map(s => s.rpe), avg = rpes.length ? rpes.reduce((a, b) => a + b, 0) / rpes.length : 0;
  const hard = prev.some(s => s.t === 'f') || avg >= 9.5, easy = rpes.length && avg <= 7;
  const tgt = parseRange(x.target), minR = Math.min(...prev.map(s => s.r));
  if (k === 't') return { text: `Aguanta ${minR + 5} s`, why: `La última vez: ${minR} s en la serie más corta`, r: minR + 5 };
  if (k === 'r') {
    const hi = tgt ? tgt.hi : 15;
    if (!hard && minR >= hi) {
      const wv = db.exercises.find(e => e.kind === 'w' && e.id !== ex.id && famOf(e) === famOf(ex));
      return { text: wv ? `Pasa a «${wv.name}» con +2,5 kg` : 'Añade una serie o prueba una variante más difícil',
        why: `Ya haces ${minR}+ reps en todas las series` };
    }
    const goal = Math.min(minR + 1, hi);
    return { text: `Busca ${goal} reps por serie`, why: hard ? 'La última vez llegaste al límite: consolida' : `La última vez: mínimo ${minR} reps`, r: goal };
  }
  const topW = Math.max(...prev.map(s => s.w)), atTop = prev.filter(s => s.w === topW), minTop = Math.min(...atTop.map(s => s.r));
  const lo = tgt ? tgt.lo : ex.bw ? 5 : 8, hi = tgt ? tgt.hi : ex.bw ? 8 : 12;
  const inc = ex.met === MET.heavy ? 5 : 2.5, pre = ex.bw ? '+' : '';
  if (!hard && (minTop >= hi || easy)) {
    return { text: `Sube a ${pre}${fdec(topW + inc)} kg × ${lo}`, w: topW + inc, r: lo,
      why: minTop >= hi ? `Hiciste ${minTop}+ reps con ${pre}${fdec(topW)} kg en todas las series` : `RPE medio ${r1(avg)} la última vez: margen para subir` };
  }
  const goal = Math.min(minTop + 1, hi);
  return { text: `Repite ${pre}${fdec(topW)} kg y busca ${goal} reps`, w: topW, r: goal,
    why: hard ? 'La última vez llegaste al fallo o RPE 10: consolida antes de subir' : `Sube de peso cuando hagas ${hi} reps en todas las series` };
}
function suggestionBox(x, i) {
  if (x.sets.length && x.sets.every(s => s.done)) return '';
  const sg = suggestion(x);
  if (!sg) return '';
  return `<div class="sug">${ic('chart', 18)}<div><b>${esc(sg.text)}</b><small>${esc(sg.why)}</small></div>
    ${sg.r != null ? `<button class="btn sm" data-a="sugApply" data-i="${i}">Aplicar</button>` : ''}</div>`;
}

// Tarjeta de cardio: tramos con minutos + velocidad/inclinación (cinta) o intensidad
function cardioCard(x, i) {
  const ex = exInfo(x), prev = lastSets(x.exId), tm = ex.cardio === 'treadmill', lv = cardioLevels(ex);
  const rows = x.sets.map((s, j) => {
    const p = prev[j];
    const kc = profile().weight && s.done ? setKcal(ex, s, 0, rmrPerMin()) : 0;
    return `<div class="srow cr${tm ? ' tm' : ''}${s.done ? ' done' : ''}">
      <button class="setn" data-a="delSet" data-i="${i}" data-j="${j}">${j + 1}</button>
      <input inputmode="decimal" data-f="r" data-i="${i}" data-j="${j}" value="${esc(s.r)}" placeholder="${p ? p.r : 'min'}">
      ${tm ? `<input inputmode="decimal" data-f="v" data-i="${i}" data-j="${j}" value="${esc(s.v)}" placeholder="${p && p.v ? p.v : 'km/h'}">
        <input inputmode="decimal" data-f="g" data-i="${i}" data-j="${j}" value="${esc(s.g)}" placeholder="${p && p.g != null ? p.g : '%'}">`
        : `<select data-f="l" data-i="${i}" data-j="${j}">${lv.map((l, n) => `<option value="${n}"${String(s.l ?? 1) === String(n) ? ' selected' : ''}>${l[0].split(' (')[0]}</option>`).join('')}</select>`}
      <button class="chk" data-a="toggle" data-i="${i}" data-j="${j}" aria-label="Hecho">${ic('check', 20)}</button>
      ${kc ? `<span class="kc">≈ ${Math.round(kc)} kcal</span>` : ''}
    </div>`;
  }).join('');
  return `<div class="card">
    <div class="ex-head"><button class="thumbbtn" data-a="viewEx" data-id="${x.exId}">${thumb(ex)}</button>
      <div class="ex-t"><b>${esc(ex.name)}</b><small>Cardio · ${tm ? 'velocidad e inclinación' : 'intensidad'} por tramo</small></div>
      <button class="round sm" data-a="exMenu" data-i="${i}" aria-label="Opciones">${ic('more', 18)}</button></div>
    <div class="sets"><div class="srow cr h${tm ? ' tm' : ''}"><span>Tramo</span><span>Min</span>${tm ? '<span>km/h</span><span>Incl. %</span>' : '<span>Intensidad</span>'}<span></span></div>${rows}</div>
    <button class="btn sm ghost" data-a="addSet" data-i="${i}">${ic('plus', 16)} Tramo</button>
  </div>`;
}

function vRoutines() {
  if (draft) {
    return `<header class="top"><button class="round" data-a="rCancel" aria-label="Volver">${ic('back')}</button>
        <div class="wk-t"><b>${draft.id ? 'Editar rutina' : 'Nueva rutina'}</b></div>
        ${draft.id ? `<button class="round danger" data-a="rDelete" aria-label="Eliminar">${ic('trash')}</button>` : '<span style="width:46px"></span>'}</header>
      <label class="field">Nombre<input data-f="rName" value="${esc(draft.name)}" placeholder="Ej. Pierna, Torso A, Push..."></label>
      ${draft.items.map((it, i) => {
        const ex = exInfo(it);
        return `<div class="card">
          <div class="ex-head">${thumb(ex)}<div class="ex-t"><b>${esc(ex.name)}</b><small>${esc(ex.group)}</small></div>
            <button class="round sm" data-a="rMove" data-i="${i}" data-j="-1" aria-label="Subir">${ic('up', 18)}</button>
            <button class="round sm" data-a="rMove" data-i="${i}" data-j="1" aria-label="Bajar">${ic('down', 18)}</button>
            <button class="round sm danger" data-a="rDel" data-i="${i}" aria-label="Quitar">${ic('x', 18)}</button></div>
          <div class="row">
            <label class="field">Series<input inputmode="numeric" data-f="rSets" data-i="${i}" value="${it.sets}"></label>
            <label class="field">${ex.kind === 't' ? 'Segundos' : ex.kind === 'c' ? 'Minutos' : 'Reps'}<input data-f="rReps" data-i="${i}" value="${esc(it.reps)}" placeholder="8-12"></label>
            <label class="field">Descanso (s)<input inputmode="numeric" data-f="rRest" data-i="${i}" value="${it.rest}"></label>
          </div></div>`;
      }).join('')}
      <button class="btn block" data-a="rAddEx">${ic('plus', 20)} Añadir ejercicio</button>
      <button class="btn primary block" data-a="rSave">Guardar rutina</button>`;
  }
  const seg = `<div class="seg"><button class="${routTab === 'routines' ? 'on' : ''}" data-a="routTab" data-id="routines">${ic('dumbbell', 18)} Rutinas</button><button class="${routTab === 'exercises' ? 'on' : ''}" data-a="routTab" data-id="exercises">${ic('book', 18)} Ejercicios</button></div>`;
  if (routTab === 'exercises') return header('Ejercicios', `<button class="round" data-a="catAdd" aria-label="Catálogo">${ic('book')}</button>`) + seg + vExercises();
  return header('Rutinas', `<button class="round" data-a="newRoutine" aria-label="Nueva rutina">${ic('plus')}</button>`) + seg
    + (db.routines.map(r => routineCard(r, true)).join('') || '<p class="muted center" style="margin:40px 0">Todavía no hay rutinas.<br>Crea una con el botón +</p>');
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
const exRow = action => e => `<button class="li ili" data-a="${action}" data-id="${e.id}">${thumb(e)}<span>${esc(e.name)}<small>${KINDS[e.kind]}</small></span>${ic('chevR', 18)}</button>`;

function exList() {
  return grouped(filterEx(exQuery), exRow('exEdit')) || '<p class="muted">Sin resultados.</p>';
}

function vExercises() {
  const groups = [...new Set(db.exercises.map(e => e.group))];
  return `<div class="card"><h3>Nuevo ejercicio</h3>
      <input id="nxName" placeholder="Nombre">
      <div class="row" style="margin-top:10px">
        <input id="nxGroup" list="groups" placeholder="Grupo (ej. Pecho)">
        <select id="nxKind">${Object.entries(KINDS).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>
      </div>
      <datalist id="groups">${groups.map(g => `<option value="${esc(g)}">`).join('')}</datalist>
      <button class="btn primary block" data-a="addExercise">Añadir</button>
      <button class="btn block" data-a="catAdd">${ic('book', 20)} Catálogo con fotos (+800)</button>
    </div>
    <input data-f="exQ" placeholder="Buscar ejercicio..." value="${esc(exQuery)}">
    <div id="exList">${exList()}</div>`;
}

function histCard(h) {
  const sets = h.exercises.reduce((n, x) => n + x.sets.length, 0), vol = workoutVolume(h), kcal = histKcal(h);
  const det = openHist === h.id ? `<div class="hdet" style="margin-top:8px">
      ${h.exercises.map(x => `<div><b>${esc(x.name)}</b>${x.kcal ? `<span class="muted small" style="float:right">≈ ${Math.round(x.kcal)} kcal</span>` : ''}<div class="muted small">${x.sets.map(s => setText(x.kind, s, x) + setTag(s) + (s.pr ? ' ★' : '')).join(' · ')}</div></div>`).join('')}
      <div class="row" style="margin-top:8px"><button class="btn sm" data-a="share" data-id="${h.id}">${ic('upload', 16)} Compartir</button>
      <button class="btn sm ghost danger" data-a="hDel" data-id="${h.id}">${ic('trash', 16)} Eliminar</button></div></div>` : '';
  return `<div class="card"><button class="li ili" style="border:0;padding:0" data-a="hToggle" data-id="${h.id}">
    <span class="round sm">${ic('dumbbell', 18)}</span><span><b>${esc(h.name)}</b>
    <small>${fdate(h.start)} · ${fmt((h.end - h.start) / 1000)} · ${sets} series${vol ? ` · ${fkg(vol)} kg` : ''}${kcal ? ` · ≈ ${fkg(kcal)} kcal` : ''}</small></span></button>${det}</div>`;
}

function vCalendar() {
  const m = new Date(calMonth), y = m.getFullYear(), mo = m.getMonth();
  const off = (new Date(y, mo, 1).getDay() + 6) % 7, n = new Date(y, mo + 1, 0).getDate();
  const byDay = {};
  db.history.forEach(h => (byDay[dayKey(h.start)] ||= []).push(h));
  const today = dayKey(Date.now());
  let cells = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => `<span class="wd">${d}</span>`).join('') + '<span></span>'.repeat(off);
  for (let d = 1; d <= n; d++) {
    const k = dayKey(new Date(y, mo, d));
    cells += `<button class="cday${byDay[k] ? ' on' : ''}${k === today ? ' today' : ''}${k === calDay ? ' sel' : ''}" data-a="calDay" data-id="${k}">${d}</button>`;
  }
  const monthList = db.history.filter(h => { const d = new Date(h.start); return d.getFullYear() === y && d.getMonth() === mo; });
  const time = monthList.reduce((t, h) => t + (h.end - h.start), 0) / 1000, vol = monthList.reduce((v, h) => v + workoutVolume(h), 0);
  const list = calDay ? (byDay[calDay] || []) : monthList;
  const label = calDay ? cap(fdate(new Date(calDay + 'T12:00').getTime())) : 'Este mes';
  return header('Calendario') +
    `<div class="card"><div class="calhead"><button class="round sm" data-a="calMove" data-j="-1" aria-label="Mes anterior">${ic('chevL', 18)}</button>
      <b>${cap(m.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }))}</b>
      <button class="round sm" data-a="calMove" data-j="1" aria-label="Mes siguiente">${ic('chevR', 18)}</button></div>
      <div class="calgrid">${cells}</div></div>
    <div class="stats s4"><div><small>Entrenos</small><b>${monthList.length}</b></div><div><small>Tiempo</small><b>${Math.floor(time / 3600)}h ${Math.round(time % 3600 / 60)}m</b></div><div><small>Kg levantados</small><b>${vol >= 1e4 ? r1(vol / 1000) + ' t' : fkg(vol)}</b></div><div><small>Calorías</small><b>≈ ${fkg(monthList.reduce((k, h) => k + histKcal(h), 0))}</b></div></div>
    <div class="sec"><h2>${label}</h2>${calDay ? '<button class="link" data-a="calDay" data-id="">Ver el mes</button>' : ''}</div>
    ${[...list].reverse().map(histCard).join('') || '<p class="muted center">Sin entrenos.</p>'}`;
}

function vProgress() {
  return header('Progreso') +
    `<div class="seg"><button class="${progTab === 'records' ? 'on' : ''}" data-a="progTab" data-id="records">${ic('trophy', 18)} Récords</button><button class="${progTab === 'muscles' ? 'on' : ''}" data-a="progTab" data-id="muscles">${ic('grid', 18)} Músculos</button><button class="${progTab === 'body' ? 'on' : ''}" data-a="progTab" data-id="body">${ic('ruler', 18)} Cuerpo</button></div>
    ${progTab === 'records' ? vRecords() : progTab === 'muscles' ? vMuscles() : vBody()}`;
}

function vMuscles() {
  const { from, to, tot } = weekMuscles(musWeek);
  const d = ts => new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const label = musWeek === 0 ? 'Esta semana' : musWeek === -1 ? 'Semana pasada' : `Hace ${-musWeek} semanas`;
  const list = Object.entries(tot).sort((a, b) => b[1].sets - a[1].sets);
  const max = Math.max(12, ...list.map(([, v]) => v.sets));
  const done = list.filter(([, v]) => v.sets > 0), rest = list.filter(([, v]) => v.sets <= 0);
  return `<div class="card">
      <div class="calhead"><button class="round sm" data-a="musWeek" data-j="-1" aria-label="Semana anterior">${ic('chevL', 18)}</button>
        <div class="center"><b>${label}</b><small class="muted" style="display:block">${d(from)} – ${d(to - DAY)}</small></div>
        <button class="round sm" data-a="musWeek" data-j="1" aria-label="Semana siguiente" ${musWeek >= 0 ? 'disabled style="opacity:.3"' : ''}>${ic('chevR', 18)}</button></div>
      <div class="bodies big"><div>${bodySvg('front', tot, 300)}<small>Frente</small></div><div>${bodySvg('back', tot, 300)}<small>Espalda</small></div></div>
      <div class="legend"><span><i style="background:#3b82f6"></i>1-4 series</span><span><i style="background:#c4b5fd"></i>5-8</span><span><i style="background:#9333ea"></i>9 o más</span></div>
    </div>
    <div class="card">
      ${done.length ? done.map(([k, v]) => `<div class="mrow"><span>${MUSCLES[k][0]}</span>
          <div class="mbar"><i style="width:${Math.min(100, v.sets / max * 100)}%;background:${musColor(v.sets)}"></i></div>
          <span class="mval"><b>${fser(v.sets)}</b> series<small>${fkg(v.reps)} reps</small></span></div>`).join('')
        : '<p class="muted center">Sin series registradas esta semana.</p>'}
      ${rest.length && done.length ? `<p class="muted small" style="margin-top:12px">Sin trabajar: ${rest.map(([k]) => MUSCLES[k][0]).join(', ')}</p>` : ''}
    </div>
    ${muscleCharts(list)}
    <p class="muted small">El músculo principal de cada ejercicio cuenta 1 serie y los secundarios ½. Las series de calentamiento no cuentan. Puedes ajustar los músculos de cada ejercicio en Rutinas → Ejercicios.</p>`;
}

// Gráfica de barras sencilla en SVG
function barChart(vals, labels, colors, fmtV) {
  const W = 320, H = 150, P = 6, top = 18, bottom = 20, n = vals.length, bw = (W - 2 * P) / n;
  const max = Math.max(...vals, 0) || 1;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${vals.map((v, k) => {
    const h = Math.max(v ? 3 : 0, v / max * (H - top - bottom)), x = P + k * bw + bw * 0.18, y = H - bottom - h;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw * 0.64).toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${colors[k] || 'var(--dim)'}"/>
      ${v ? `<text x="${(x + bw * 0.32).toFixed(1)}" y="${(y - 5).toFixed(1)}" class="cl" text-anchor="middle">${fmtV(v)}</text>` : ''}
      <text x="${(x + bw * 0.32).toFixed(1)}" y="${H - 5}" class="cl" text-anchor="middle">${labels[k]}</text>`;
  }).join('')}</svg>`;
}
// Evolución de las últimas 8 semanas: series del músculo elegido, kg y calorías
function muscleCharts(list) {
  const weeks = Array.from({ length: 8 }, (_, k) => k - 7);
  const sel = musSel || (list[0] && list[0][1].sets > 0 ? list[0][0] : 'chest');
  const lab = weeks.map(w => { const d = new Date(startOfWeek(Date.now()) + w * 7 * DAY); return `${d.getDate()}/${d.getMonth() + 1}`; });
  const ser = weeks.map(w => weekMuscles(w).tot[sel].sets);
  const per = weeks.map(w => {
    const from = startOfWeek(Date.now()) + w * 7 * DAY, hs = db.history.filter(h => h.start >= from && h.start < from + 7 * DAY);
    return { kg: hs.reduce((a, h) => a + workoutVolume(h), 0), kcal: hs.reduce((a, h) => a + histKcal(h), 0) };
  });
  const k1 = v => v >= 1000 ? r1(v / 1000) + 'k' : Math.round(v);
  return `<div class="card"><h3>Evolución (8 semanas)</h3>
      <select data-f="musSel">${Object.entries(MUSCLES).map(([k, [n]]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${n}</option>`).join('')}</select>
      ${barChart(ser, lab, ser.map(musColor), fser)}
      <p class="muted small">Series por semana. Color según la escala del informe.</p></div>
    <div class="card"><h3>Kg levantados por semana</h3>${barChart(per.map(p => p.kg), lab, per.map(() => '#f5f5f7'), k1)}
      <h3 style="margin-top:16px">Calorías por semana</h3>${barChart(per.map(p => p.kcal), lab, per.map(() => '#8e8e93'), k1)}</div>`;
}

// ---------- Estimador de repeticiones / peso (fórmula de Epley sobre el peso total movido) ----------
const famOf = ex => ex.fam || FAMILY[ex.name] || ex.id;  // familia: mismo movimiento con o sin lastre
// Mejor serie del movimiento (incluye variantes con y sin lastre) → 1RM estimado en kg totales
function strengthModel(exId) {
  const ex = exById(exId);
  if (!ex || !(ex.kind === 'w' || (ex.kind === 'r' && ex.bw))) return null;
  const fam = famOf(ex), ids = new Set(db.exercises.filter(e => famOf(e) === fam).map(e => e.id));
  ids.add(exId);
  const curBW = bodyWeight() || 0;
  if (ex.bw && !curBW) return { needWeight: true };
  let best = null;
  db.history.forEach(h => h.exercises.forEach(x => {
    if (!ids.has(x.exId) || (x.kind !== 'w' && x.kind !== 'r')) return;
    const bwf = x.bw ?? (exById(x.exId) || {}).bw ?? 0, bk = h.bodyKg || curBW;
    x.sets.forEach(s => {
      if (!isWork(s)) return;
      const extra = x.kind === 'w' ? s.w : 0, load = bwf * bk + extra;
      if (load <= 0 || !s.r) return;
      const v = e1rm(load, s.r);
      if (!best || v > best.orm) best = { orm: v, load, reps: s.r, extra, bwLoad: bwf * bk, date: h.start, name: x.name };
    });
  }));
  return best && { ...best, base: (ex.bw || 0) * curBW, isBW: !!ex.bw };
}
// Repeticiones posibles con un peso total, y peso total para N repeticiones (inversa de Epley)
const repsAt = (orm, load) => load <= 0 ? null : load > orm * 1.001 ? 0 : load >= orm * 0.999 ? 1 : Math.max(1, Math.floor(30 * (orm / load - 1)));
const loadFor = (orm, reps) => reps <= 1 ? orm : orm / (1 + reps / 30);
const round25 = v => Math.round(v / 2.5) * 2.5;

function estimatorCard(exId) {
  const m = strengthModel(exId);
  if (!m) return '';
  if (m.needWeight) return '<p class="muted small" style="margin-top:12px">Registra tu peso en Progreso → Cuerpo para estimar repeticiones con lastre.</p>';
  const rows = [];
  if (m.isBW) {
    // Sin lastre y con lastre en saltos de 5 kg mientras salga al menos 1 repetición
    for (let extra = 0; rows.length < 8; extra += 5) {
      const r = repsAt(m.orm, m.base + extra);
      if (!r) break;
      rows.push([extra ? `+${extra} kg` : 'Sin lastre', r]);
    }
    if (!rows.length) rows.push(['Sin lastre', 0]);
  } else {
    [100, 95, 90, 85, 80, 75, 70, 60].forEach(p => {
      const w = round25(m.orm * p / 100);
      if (!rows.some(r => r[2] === w)) rows.push([`${w} kg`, repsAt(m.orm, w), w]);
    });
  }
  const bestTxt = m.isBW ? `${m.extra ? '+' + m.extra + ' kg' : 'sin lastre'} × ${m.reps}` : `${m.extra} kg × ${m.reps}`;
  return `<div class="est">
    <p class="small" style="margin:14px 0 4px"><b>Estimación de repeticiones</b></p>
    <p class="muted small">Basada en tu mejor serie: ${esc(m.name)} ${bestTxt} (${new Date(m.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})${m.isBW ? ` · peso movido ${fkg(m.load)} kg` : ''}.</p>
    <div class="estgrid">${rows.map(([l, r]) => `<div><small>${l}</small><b>${r}${r === 1 ? ' rep' : ' reps'}</b></div>`).join('')}</div>
    <div class="row" style="margin-top:6px">
      <label class="field">${m.isBW ? 'Con lastre (kg)' : 'Con peso (kg)'}<input inputmode="decimal" data-f="estKg" data-id="${exId}" placeholder="${m.isBW ? '20' : round25(m.orm * 0.8)}"></label>
      <label class="field">Para estas reps<input inputmode="numeric" data-f="estReps" data-id="${exId}" placeholder="5"></label>
    </div>
    <p class="small" id="estOut" style="min-height:20px"></p>
    <p class="muted small">Fórmula de Epley sobre el peso total que mueves${m.isBW ? ' (tu peso actual × % del ejercicio + lastre)' : ''}. Es más fiable entre 1 y 12 repeticiones; por encima de 15 es orientativo.</p>
  </div>`;
}

function vRecords() {
  // Ejercicios con historial, ordenados por la última vez que se hicieron
  const last = {};
  db.history.forEach(h => h.exercises.forEach(x => { last[x.exId] = { at: h.start, name: x.name, kind: x.kind }; }));
  const ids = Object.keys(last).sort((a, b) => last[b].at - last[a].at);
  if (!ids.length) return '<p class="muted center" style="margin:40px 0">Termina tu primer entrenamiento y aquí aparecerán tus mejores marcas.</p>';
  const ds = d => `<span class="muted small"> · ${new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' })}</span>`;
  return ids.map(id => {
    const ex = exById(id) || { name: last[id].name, kind: last[id].kind, group: '', img: '' };
    const st = exStats(id), k = st.kind;
    const unit = k === 't' ? 'seg' : k === 'c' ? 'min' : 'reps';
    const main = k === 'w'
      ? (st.maxW ? `${ex.bw ? '+' : ''}${st.maxW.v} kg${st.best && !ex.bw ? ` · 1RM est. ${r1(st.best.v)} kg` : ''}` : '—')
      : (st.maxR ? `${st.maxR.v} ${unit}` : '—');
    let det = '';
    if (openRec === id) {
      const rows = k === 'w' ? [
        ['Peso máximo', st.maxW && `${st.maxW.v} kg × ${st.maxW.r}`, st.maxW],
        ['Mejor serie (1RM est.)', st.best && `${st.best.w} kg × ${st.best.r} → ${r1(st.best.v)} kg`, st.best],
        ['Más repeticiones', st.maxR && `${st.maxR.r} reps con ${st.maxR.w} kg`, st.maxR],
        ['Más volumen en un día', st.maxVol && `${fkg(st.maxVol.v)} kg`, st.maxVol],
      ] : [[k === 't' || k === 'c' ? 'Más tiempo' : 'Más repeticiones', st.maxR && `${st.maxR.v} ${unit}`, st.maxR],
        ...(k === 'r' && st.maxVol ? [['Más kg en un día (con tu peso)', `${fkg(st.maxVol.v)} kg`, st.maxVol]] : [])];
      det = `<div class="hdet" style="margin-top:8px">${rows.filter(r => r[1]).map(r => `<div><span class="muted small">${r[0]}</span><br><b>${r[1]}</b>${ds(r[2].date)}</div>`).join('')}</div>
        <p class="muted small" style="margin-top:10px">${k === 'w' ? 'Evolución del 1RM estimado' : 'Evolución'} (mejor serie de cada día)</p>
        ${lineChart(st.sessions, k === 'w' ? 'kg' : k === 't' ? 's' : k === 'c' ? 'min' : 'reps')}
        ${estimatorCard(id)}`;
    }
    return `<div class="card"><button class="li ili" style="border:0;padding:0" data-a="recToggle" data-id="${id}">${thumb(ex)}<span><b>${esc(ex.name)}</b><small>${main} · ${st.sessions.length} ${st.sessions.length === 1 ? 'sesión' : 'sesiones'}</small></span>${ic(openRec === id ? 'down' : 'chevR', 18)}</button>${det}</div>`;
  }).join('');
}

function vBody() {
  const list = [...db.body].sort((a, b) => a.date - b.date), last = list[list.length - 1];
  const lastOf = key => { for (let k = list.length - 1; k >= 0; k--) if (list[k][key]) return list[k][key]; return null; };
  const h = db.profile.height || lastOf('height'), w = lastOf('weight');
  let summary = '';
  if (w) {
    const first = list.find(e => e.weight), diff = r1(w - first.weight);
    const bmi = h ? w / (h / 100) ** 2 : 0;
    const bmiTxt = bmi ? (bmi < 18.5 ? 'bajo peso' : bmi < 25 ? 'normal' : bmi < 30 ? 'sobrepeso' : 'obesidad') : '';
    summary = `<div class="stats">
      <div><small>Peso</small><b>${w} kg</b></div>
      <div><small>Cambio</small><b>${diff > 0 ? '+' : ''}${diff} kg</b></div>
      <div><small>IMC${bmiTxt ? ' · ' + bmiTxt : ''}</small><b>${bmi ? r1(bmi) : '—'}</b></div>
    </div><div class="card">${lineChart(list.filter(e => e.weight).map(e => ({ x: e.date, y: e.weight })), 'kg')}</div>`;
  }
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return `${profileCard()}${summary}
    <div class="card"><h3>Nuevo registro</h3>
      <label class="field">Fecha<input type="date" id="bDate" value="${today.toISOString().slice(0, 10)}"></label>
      <div class="grid2">${BODY_FORM.map(([k, l, u]) => `<label class="field">${l} (${u})<input inputmode="decimal" id="b_${k}" placeholder="${last && last[k] ? last[k] : ''}"></label>`).join('')}</div>
      <p class="muted small">Rellena solo lo que quieras medir.</p>
      <button class="btn primary block" data-a="bodySave">Guardar medidas</button>
    </div>
    ${list.length ? '<div class="sec"><h2>Registros</h2></div>' : ''}
    ${[...list].reverse().map((e, n, arr) => {
      const prev = arr[n + 1];
      const vals = BODY_FIELDS.filter(([k]) => e[k]).map(([k, l, u]) => {
        const d = prev && prev[k] ? r1(e[k] - prev[k]) : 0;
        return `${l} <b>${e[k]}${u === '%' ? '%' : ' ' + u}</b>${d ? ` <span class="muted">(${d > 0 ? '+' : ''}${d})</span>` : ''}`;
      }).join(' · ');
      return `<div class="card"><div class="ex-head"><div class="ex-t"><b>${fdate(e.date)}</b></div><button class="round sm danger" data-a="bodyDel" data-id="${e.id}" aria-label="Eliminar">${ic('trash', 18)}</button></div><p class="small">${vals}</p></div>`;
    }).join('')}`;
}

function profileCard() {
  const p = db.profile, pr = profile();
  const rmr = profileComplete() ? Math.round(rmrPerMin() * 1440) : null;
  return `<div class="card" id="profile"><h3>Perfil</h3>
    <div class="row">
      <label class="field">Sexo<select data-f="pSex"><option value="">—</option><option value="m"${p.sex === 'm' ? ' selected' : ''}>Hombre</option><option value="f"${p.sex === 'f' ? ' selected' : ''}>Mujer</option></select></label>
      <label class="field">Edad<input inputmode="numeric" data-f="pAge" value="${pr.age || ''}" placeholder="años"></label>
      <label class="field">Altura (cm)<input inputmode="numeric" data-f="pHeight" value="${p.height || ''}" placeholder="cm"></label>
    </div>
    <p class="muted small">${pr.weight ? `Peso: ${pr.weight} kg (último registro). ` : 'Registra tu peso abajo. '}${rmr ? `Metabolismo basal estimado: <b>${fkg(rmr)} kcal/día</b>.` : 'Se usa para calcular las calorías y los kg en ejercicios con tu peso corporal.'}</p>
  </div>`;
}

function vSettings() {
  const s = db.settings;
  const perm = 'Notification' in window ? { granted: 'Permitidas', denied: 'Bloqueadas en el navegador', default: 'Sin decidir' }[Notification.permission] : 'No disponibles';
  const sw = (f, v, l) => `<label class="setrow"><span>${l}</span><input type="checkbox" class="switch" data-f="${f}" ${v ? 'checked' : ''}></label>`;
  return header('Ajustes') + updateBanner() + installCard() +
    `<div class="card"><h3>Entrenamiento</h3>
      <label class="setrow"><span>Descanso por defecto (s)</span><input inputmode="numeric" data-f="sRest" value="${s.rest}"></label>
      <label class="setrow"><span>Objetivo semanal (entrenos)</span><input inputmode="numeric" data-f="sGoal" value="${s.weekGoal}"></label>
      ${sw('sAwake', s.awake, 'Mantener la pantalla encendida')}
    </div>
    <div class="card"><h3>Avisos de descanso</h3>
      ${sw('sSound', s.sound, 'Sonido')}
      ${sw('sVibrate', s.vibrate, 'Vibración')}
      ${sw('sNotify', s.notify, `Notificaciones <small class="muted">· ${perm}</small>`)}
      <button class="btn block" data-a="testAlarm">${ic('bell', 20)} Probar aviso (en 5 s)</button>
    </div>
    <div class="card"><h3>Actualizaciones</h3>
      <p class="muted small">Versión instalada: ${APP_VERSION}. Actualizar no borra tus datos.</p>
      <button class="btn block" data-a="checkUpdate">${ic('refresh', 20)} Buscar nuevas actualizaciones</button>
    </div>
    <div class="card"><h3>Copia de seguridad</h3>
      <p class="muted small">Tus datos se guardan solo en este móvil. Exporta de vez en cuando por si acaso.</p>
      <button class="btn block" data-a="export">${ic('download', 20)} Exportar datos</button>
      <label class="btn block">${ic('upload', 20)} Importar datos<input type="file" accept=".json,application/json" data-f="import" hidden></label>
      <button class="btn block ghost danger" data-a="reset">${ic('trash', 20)} Borrar todos los datos</button>
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
  const more = `<button class="btn block" data-a="catFromPick">${ic('book', 20)} Buscar en el catálogo con fotos (+800)</button>`;
  if (list.length) return grouped(list, exRow('pick')) + more;
  return `<p class="muted">Sin resultados.</p>${q.trim() ? `<button class="btn block" data-a="pickNew">${ic('plus', 20)} Crear «${esc(q.trim())}»</button>` : ''}${more}`;
}
function openPicker(cb) {
  showModal(`<div class="mhead"><input id="pickQ" data-f="pickQ" placeholder="Buscar ejercicio..." autocomplete="off"><button class="round sm" data-a="closeModal" aria-label="Cerrar">${ic('x', 18)}</button></div><div id="pickList">${pickList('')}</div>`);
  pickCb = cb;
}

// Editor de músculos de un ejercicio: cada músculo puede ser principal, secundario o nada
function openMuscleEditor(e) {
  const m = musOf(e);
  showModal(`<div class="ex-head"><div class="ex-t"><b>${esc(e.name)}</b><small>Músculos trabajados</small></div><button class="round sm" data-a="closeModal" aria-label="Cerrar">${ic('x', 18)}</button></div>
    <div style="margin-top:10px">${Object.entries(MUSCLES).map(([k, [name]], n) => {
      const st = m.p.includes(k) ? 2 : m.s.includes(k) ? 1 : 0;
      return `<div class="setrow"><span>${name}</span><div class="seg mini">${['—', 'Sec.', 'Princ.'].map((l, j) =>
        `<button class="${st === j ? 'on' : ''}" data-a="musSet" data-i="${n}" data-j="${j}" data-id="${e.id}">${l}</button>`).join('')}</div></div>`;
    }).join('')}</div>`);
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
  showModal(`<div class="mhead"><input id="catQ" data-f="catQ" placeholder="Buscar en inglés: curl, press, row..." autocomplete="off"><button class="round sm" data-a="closeModal" aria-label="Cerrar">${ic('x', 18)}</button></div>
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
  showModal(`<div class="ex-head"><div class="ex-t"><b>${esc(ex.name)}</b><small>${esc(ex.group)} · ${KINDS[ex.kind]}</small></div><button class="round sm" data-a="closeModal" aria-label="Cerrar">${ic('x', 18)}</button></div>
    ${ex.img ? `<img id="viewImg" class="bigimg" src="${imgUrl(ex.img)}" alt="" crossorigin="anonymous">` : '<p class="muted center" style="padding:30px 0">Este ejercicio no tiene foto.</p>'}
    ${ex.id && exById(ex.id) ? `<button class="btn block" data-a="catImg" data-id="${ex.id}">${ic('image', 20)} ${ex.img ? 'Cambiar foto' : 'Elegir foto del catálogo'}</button>` : ''}`);
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
  if (db.active) { alert('Ya tienes un entrenamiento en curso.'); view = 'workout'; render(); return; }
  db.active = { id: uid(), name, routineId: routineId || null, start: Date.now(), exercises, timer: null };
  save(); view = 'workout'; render(); scrollTo(0, 0); keepAwake();
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
  $('#ttime').textContent = over ? '¡A por ello!' : fmt(Math.ceil(rem));
  $('#tlabel').textContent = (over ? 'Ahora: ' : 'Siguiente: ') + t.label;
  $('#tarc').style.strokeDashoffset = (131.95 * (1 - (over ? 0 : rem / t.total))).toFixed(2);
  $('#tskip').innerHTML = ic(over ? 'check' : 'x', 18);
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
  notify('Descanso terminado', 'Siguiente: ' + label);
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

// ---------- Compartir entreno (imagen PNG generada en un canvas) ----------
const svgImage = svg => new Promise((ok, ko) => {
  const img = new Image();
  img.onload = () => ok(img); img.onerror = ko;
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
});
async function shareWorkout(h) {
  if (!h) return;
  toast('Generando imagen...');
  try { await document.fonts.ready; } catch (e) { }
  const W = 1080, H = 1350, P = 64, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d'), F = (w, s) => `${w} ${s}px Inter, system-ui, -apple-system, Roboto, sans-serif`;
  const rr = (x, y, w, hh, r, fill) => { g.beginPath(); g.roundRect(x, y, w, hh, r); g.fillStyle = fill; g.fill(); };
  const fit = (t, max) => { if (g.measureText(t).width <= max) return t; while (t.length && g.measureText(t + '…').width > max) t = t.slice(0, -1); return t + '…'; };
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // Cabecera
  g.fillStyle = '#8e8e93'; g.font = F(500, 30); g.fillText('GymLog', P, P + 30);
  g.textAlign = 'right'; g.fillText(cap(fdate(h.start)), W - P, P + 30); g.textAlign = 'left';
  g.fillStyle = '#f5f5f7'; g.font = F(700, 72); g.fillText(fit(h.name, W - 2 * P), P, P + 130);
  // Cifras
  const vol = workoutVolume(h), kcal = histKcal(h), sets = h.exercises.reduce((n, x) => n + x.sets.length, 0);
  const stats = [['Duración', fmt((h.end - h.start) / 1000)], ['Kg', fkg(vol)], ['Kcal', kcal ? '≈ ' + fkg(kcal) : '—'], ['Series', String(sets)]];
  const bw = (W - 2 * P - 3 * 20) / 4;
  stats.forEach(([l, v], k) => {
    const x = P + k * (bw + 20);
    rr(x, P + 175, bw, 130, 28, '#161616');
    g.fillStyle = '#8e8e93'; g.font = F(500, 26); g.fillText(l, x + 26, P + 222);
    g.fillStyle = '#f5f5f7'; g.font = F(700, 44); g.fillText(fit(v, bw - 40), x + 26, P + 280);
  });
  // Mapa muscular del entreno
  const tot = addWorkoutMuscles(emptyMuscles(), h), bh = 560, top = P + 350;
  const svgOf = side => bodySvg(side, tot, bh).replace('<svg class="bodymap"', `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(bh * 0.47)}" height="${bh}"`);
  try {
    const [fr, bk] = await Promise.all([svgImage(svgOf('front')), svgImage(svgOf('back'))]);
    g.drawImage(fr, W - P - 2 * bh * 0.47 - 10, top, bh * 0.47, bh);
    g.drawImage(bk, W - P - bh * 0.47, top, bh * 0.47, bh);
  } catch (e) { }
  // Lista de ejercicios
  const colW = W - 2 * P - 2 * bh * 0.47 - 40;
  let y = top + 30;
  for (const x of h.exercises) {
    if (y > H - 200) { g.fillStyle = '#8e8e93'; g.font = F(500, 26); g.fillText(`+ ${h.exercises.length - h.exercises.indexOf(x)} ejercicios más`, P, y); break; }
    g.fillStyle = '#f5f5f7'; g.font = F(600, 34); g.fillText(fit(x.name, colW), P, y);
    g.fillStyle = '#8e8e93'; g.font = F(400, 26);
    const work = x.sets.filter(isWork), txt = work.length > 3 ? `${work.length} series · mejor ${setText(x.kind, work.reduce((a, s) => (s.w * 100 + s.r > a.w * 100 + a.r ? s : a), work[0]), x)}`
      : work.map(s => setText(x.kind, s, x)).join(' · ');
    g.fillText(fit(txt, colW), P, y + 40);
    y += 100;
  }
  // Leyenda y pie
  [['#3b82f6', '1-4 series'], ['#c4b5fd', '5-8'], ['#9333ea', '9+']].forEach(([col, t], k) => {
    const x = W - P - 2 * bh * 0.47 + k * 190;
    g.fillStyle = col; g.beginPath(); g.arc(x + 10, top + bh + 50, 10, 0, 7); g.fill();
    g.fillStyle = '#8e8e93'; g.font = F(500, 24); g.fillText(t, x + 30, top + bh + 58);
  });
  g.fillStyle = '#48484a'; g.font = F(500, 24); g.fillText('Registrado con GymLog', P, H - P);
  const blob = await new Promise(ok => c.toBlob(ok, 'image/png'));
  const file = new File([blob], `gymlog-${dayKey(h.start)}.png`, { type: 'image/png' }), url = URL.createObjectURL(blob);
  const canShare = navigator.canShare && navigator.canShare({ files: [file] });
  shareFile = file;
  showModal(`<div class="ex-head"><div class="ex-t"><b>Compartir entreno</b><small>${esc(h.name)}</small></div><button class="round sm" data-a="closeModal" aria-label="Cerrar">${ic('x', 18)}</button></div>
    <img src="${url}" alt="" style="width:100%;border-radius:18px;margin:12px 0;border:1px solid var(--line)">
    ${canShare ? `<button class="btn primary block" data-a="shareSend">${ic('upload', 20)} Compartir</button>` : ''}
    <a class="btn block" href="${url}" download="${file.name}">${ic('download', 20)} Guardar imagen</a>`);
  document.getElementById('toast').hidden = true;
}
let shareFile = null;

// ---------- Actualizaciones ----------
// version.json (en GitHub) dice cuál es la última versión y qué archivos la forman.
// Si es distinta de APP_VERSION, se descargan esos archivos a la caché del service worker
// y se recarga. Los datos (localStorage) no se tocan.
const APP_CACHE = 'gymlog-app';
async function checkUpdate(manual) {
  let info;
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    info = await r.json();
  } catch (e) {
    if (manual) alert('No se pudo comprobar si hay actualizaciones. ¿Tienes conexión a internet?');
    return;
  }
  if (info.version === APP_VERSION) {
    updateInfo = null;
    if (manual) { toast(`Ya tienes la última versión (${APP_VERSION})`); render(); }
    return;
  }
  updateInfo = info;
  if (manual) applyUpdate(); else if (view !== 'workout') render();
}
async function applyUpdate() {
  if (!updateInfo) return;
  if (!confirm(`Hay una versión nueva (${updateInfo.version}). ¿Actualizar ahora?\n\nTus entrenos, rutinas y medidas no se borran.`)) return;
  toast('Descargando actualización...');
  try {
    const cache = await caches.open(APP_CACHE), t = Date.now();
    await Promise.all(updateInfo.files.map(async f => {
      const r = await fetch(f + (f.includes('?') ? '&' : '?') + 't=' + t, { cache: 'no-store' });
      if (!r.ok) throw new Error(f);
      await cache.put(new URL(f, location.href).href, r);
    }));
    const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
    if (reg) await reg.update().catch(() => { });
    location.reload();
  } catch (e) {
    alert('No se pudo descargar la actualización (' + e.message + '). Inténtalo de nuevo con conexión.');
  }
}

// ---------- Acciones (botones) ----------
const A = {
  nav(b) { view = b.dataset.view; draft = null; render(); scrollTo(0, 0); },
  go(b, i, j, id) { view = id; draft = null; render(); scrollTo(0, 0); },
  goBody() { view = 'progress'; progTab = 'body'; render(); scrollTo(0, 0); },
  goProfile() { A.goBody(); },
  goMuscles() { view = 'progress'; progTab = 'muscles'; musWeek = 0; render(); scrollTo(0, 0); },
  musWeek(b, i, j) { musWeek = Math.min(0, musWeek + j); render(); },
  musSet(b, i, j, id) {
    // Cambia un músculo de un ejercicio: j = 0 nada, 1 secundario, 2 principal
    const e = exById(id), k = Object.keys(MUSCLES)[i], m = musOf(e);
    e.mus = { p: m.p.filter(x => x !== k), s: m.s.filter(x => x !== k) };
    e.musUser = true;
    if (j === 2) e.mus.p.push(k); else if (j === 1) e.mus.s.push(k);
    save(); openMuscleEditor(e);
  },
  newRoutineGo() { view = 'routines'; routTab = 'routines'; A.newRoutine(); },
  routTab(b, i, j, id) { routTab = id; render(); },
  closeModal,
  sheet(b, i) { const f = sheetOpts[i][1]; closeModal(); f(); },
  pick(b, i, j, id) { const cb = pickCb; closeModal(); if (cb) cb(id); },
  pickNew() {
    const name = $('#pickQ').value.trim();
    const kind = confirm(`¿«${name}» usa peso (pesas, discos, máquina...)?`) ? 'w' : 'r';
    const e = { id: uid(), name, group: 'Otros', kind, img: '', mus: { p: [], s: [] }, bw: 0, met: 0, cardio: '' };
    applyMove(e, moveOf(name));
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
    try { await navigator.clipboard.writeText(url); toast('Enlace copiado'); }
    catch (e) { prompt('Copia este enlace:', url); }
  },
  checkUpdate() { checkUpdate(true); },
  applyUpdate,

  // Entreno
  startEmpty() { startWorkout('Entrenamiento libre', []); },
  startRoutine(b, i, j, id) {
    const r = db.routines.find(r => r.id === id);
    startWorkout(r.name, r.items.map(it => ({
      exId: it.exId, rest: it.rest, target: it.reps,
      sets: Array.from({ length: Math.max(1, it.sets) }, () => ({ w: '', r: '', v: '', g: '', l: '1', done: false })),
    })), r.id);
  },
  addEx() {
    openPicker(id => {
      const ex = exById(id);
      db.active.exercises.push({ exId: id, rest: ex.kind === 'c' ? 0 : db.settings.rest, target: '', sets: [{ w: '', r: '', v: '', g: '', l: '1', done: false }] });
      save(); render();
      scrollTo(0, document.body.scrollHeight);
    });
  },
  addSet(b, i) {
    const x = db.active.exercises[i], last = x.sets[x.sets.length - 1];
    x.sets.push({ w: last ? last.w : '', r: '', v: last ? last.v : '', g: last ? last.g : '', l: last ? last.l : '1', done: false });
    save(); render();
  },
  delSet(b, i, j) {
    if (!confirm(`¿Eliminar la serie ${j + 1}?`)) return;
    db.active.exercises[i].sets.splice(j, 1); save(); render();
  },
  // Menú de una serie: tipo, RPE o eliminar
  setMenu(b, i, j) {
    const s = db.active.exercises[i].sets[j];
    openSheet(`Serie ${j + 1}`, [
      ...Object.entries(SET_TYPES).map(([t, [name]]) => [(s.t || '') === t ? `✓ ${name}` : name, () => {
        s.t = t || undefined;
        if (!isWork(s)) s.pr = null;
        save(); render();
      }]),
      [s.rpe ? `RPE: ${s.rpe} (cambiar)` : 'Anotar RPE (esfuerzo)', () => openSheet('RPE · ¿cuánto te ha costado?', [
        ...[['10', 'máximo, al fallo'], ['9.5', 'quizá 1 más'], ['9', 'quedaba 1'], ['8.5', 'quedaban 1-2'], ['8', 'quedaban 2'], ['7', 'quedaban 3'], ['6', 'quedaban 4+']]
          .map(([v, d]) => [`${v.replace('.', ',')} · ${d}`, () => { s.rpe = +v; save(); render(); }]),
        ['Sin RPE', () => { delete s.rpe; save(); render(); }],
      ])],
      ['Eliminar serie', () => A.delSet(b, i, j), 'danger'],
    ]);
  },
  sugApply(b, i) {
    const x = db.active.exercises[i], sg = suggestion(x);
    if (!sg) return;
    x.sets.forEach(s => {
      if (s.done || !isWork(s)) return;
      if (sg.w != null) s.w = String(sg.w);
      if (sg.r != null) s.r = String(sg.r);
    });
    save(); render(); toast('Sugerencia aplicada a las series pendientes');
  },
  share(b, i, j, id) { shareWorkout(db.history.find(h => h.id === id)); },
  async shareSend() {
    try { await navigator.share({ files: [shareFile], title: 'Mi entreno en GymLog' }); }
    catch (e) { if (e.name !== 'AbortError') alert('No se pudo compartir: ' + e.message); }
  },
  toggle(b, i, j) {
    const x = db.active.exercises[i], s = x.sets[j];
    s.done = !s.done;
    if (s.done) {
      // Si dejas los campos vacíos, usa los valores sugeridos (anterior / objetivo)
      const p = lastSets(x.exId)[j];
      if (s.w === '' && p) s.w = String(p.w);
      if (s.r === '') s.r = String(parseInt(x.target) || (p && p.r) || '');
      if (s.v === '' && p && p.v != null) s.v = String(p.v);
      if (s.g === '' && p && p.g != null) s.g = String(p.g);
      s.pr = checkPR(i, j);
      if (s.pr) toast(`Nuevo récord · ${exInfo(x).name}: ${s.pr}`);
      if (x.rest > 0) startTimer(x.rest, nextLabel(i, j));
    } else s.pr = null;
    save(); render();
  },
  exMenu(b, i) {
    const list = db.active.exercises;
    openSheet(exInfo(list[i]).name, [
      ['Subir', () => { moveItem(list, i, -1); save(); render(); }],
      ['Bajar', () => { moveItem(list, i, 1); save(); render(); }],
      ['Eliminar ejercicio', () => { if (confirm('¿Quitar este ejercicio del entreno?')) { list.splice(i, 1); save(); render(); } }, 'danger'],
    ]);
  },
  wkMenu() {
    openSheet(db.active.name, [
      ['Guardar como rutina', () => A.saveAsRoutine()],
      ['Descartar entreno', () => A.discard(), 'danger'],
    ]);
  },
  finish() {
    const w = db.active;
    const totals = activeTotals();
    const exercises = w.exercises.map((x, k) => {
      const ex = exInfo(x);
      const sets = x.sets.filter(s => s.done).map(s => ex.kind === 'c'
        ? { r: num(s.r), ...(ex.cardio === 'treadmill' ? { v: num(s.v), g: num(s.g) } : { l: +s.l || 0 }) }
        : { w: num(s.w), r: num(s.r), ...(s.pr ? { pr: true } : {}), ...(s.t ? { t: s.t } : {}), ...(s.rpe ? { rpe: s.rpe } : {}) });
      return { exId: x.exId, name: ex.name, kind: ex.kind, bw: ex.bw || 0, cardio: ex.cardio || '', kcal: Math.round(totals.per[k] || 0), sets };
    }).filter(x => x.sets.length);
    if (!exercises.length) {
      if (confirm('No has completado ninguna serie. ¿Descartar el entrenamiento?')) { db.active = null; save(); releaseAwake(); view = 'home'; render(); }
      return;
    }
    const pending = w.exercises.reduce((n, x) => n + x.sets.filter(s => !s.done).length, 0);
    if (!confirm(pending ? `Hay ${pending} series sin marcar que no se guardarán. ¿Terminar?` : '¿Terminar y guardar el entrenamiento?')) return;
    db.history.push({ id: uid(), name: w.name, routineId: w.routineId, start: w.start, end: Date.now(), exercises,
      bodyKg: bodyWeight() || 0, kcal: totals.rmr ? Math.round(totals.kcal) : null });
    if (totals.rmr) setTimeout(() => toast(`Entreno guardado · ≈ ${fkg(totals.kcal)} kcal · ${fkg(totals.vol)} kg`), 300);
    db.active = null; save(); releaseAwake();
    openHist = db.history[db.history.length - 1].id;
    calDay = dayKey(w.start);
    calMonth = new Date(new Date(w.start).getFullYear(), new Date(w.start).getMonth(), 1).getTime();
    view = 'calendar'; render(); scrollTo(0, 0);
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
    toast('Rutina guardada');
  },
  discard() {
    if (!confirm('¿Descartar este entrenamiento? Se perderá lo registrado.')) return;
    db.active = null; save(); releaseAwake(); view = 'home'; render();
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
  rAddEx() { openPicker(id => { const k = exById(id).kind; draft.items.push({ exId: id, sets: k === 'c' ? 1 : 3, reps: k === 't' ? '30' : k === 'c' ? '20' : '10', rest: k === 'c' ? 0 : db.settings.rest }); render(); }); },
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
    const e = { id: uid(), name, group: $('#nxGroup').value.trim() || 'Otros', kind: $('#nxKind').value, img: '', mus: { p: [], s: [] }, bw: 0, met: 0, cardio: '' };
    applyMove(e, moveOf(name));
    db.exercises.push(e);
    save(); render();
  },
  exEdit(b, i, j, id) {
    const e = exById(id);
    openSheet(e.name, [
      [e.img ? 'Ver foto' : 'Añadir foto', () => e.img ? openViewer(e) : openCatalog({ type: 'img', exId: id })],
      ['Renombrar', () => { const n = prompt('Nuevo nombre', e.name); if (n && n.trim()) { e.name = n.trim(); save(); render(); } }],
      ['Cambiar grupo (' + e.group + ')', () => { const g = prompt('Grupo muscular', e.group); if (g && g.trim()) { e.group = g.trim(); save(); render(); } }],
      ['Tipo: ' + KINDS[e.kind], () => openSheet('Tipo de registro', Object.entries(KINDS).map(([k, l]) => [l, () => { e.kind = k; save(); render(); }]))],
      ['Músculos trabajados', () => openMuscleEditor(e)],
      [`Peso corporal: ${Math.round((e.bw || 0) * 100)}%`, () => {
        const v = prompt('¿Qué % de tu peso corporal mueves en este ejercicio? (dominadas 100, flexiones 64, 0 si no aplica)', Math.round((e.bw || 0) * 100));
        if (v !== null && !isNaN(parseFloat(v))) { e.bw = Math.max(0, Math.min(100, parseFloat(v))) / 100; e.bwUser = true; save(); render(); }
      }],
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
      save(); closeModal(); render(); toast('Foto actualizada');
      return;
    }
    const name = prompt('Nombre del ejercicio (puedes ponerlo en español)', c[1]);
    if (!name || !name.trim()) return;
    let e = db.exercises.find(e => norm(e.name) === norm(name.trim()));
    if (e) { if (!e.img) e.img = id; }
    else {
      e = { id: uid(), name: name.trim(), group: c[2], kind: c[4], img: id, mus: { p: c[5] ? c[5].split(',') : [], s: c[6] ? c[6].split(',') : [] }, bw: 0, met: 0, cardio: '' };
      // se reconoce por el nombre en inglés del catálogo o por el que le pongas
      applyMove(e, moveOf(c[1]) || moveOf(e.name));
      db.exercises.push(e);
    }
    save(); closeModal();
    if (mode.cb) mode.cb(e.id);
    else { render(); toast('Añadido: ' + e.name); }
  },

  // Calendario
  calMove(b, i, j) { const m = new Date(calMonth); calMonth = new Date(m.getFullYear(), m.getMonth() + j, 1).getTime(); calDay = null; render(); },
  calDay(b, i, j, id) { calDay = !id || calDay === id ? null : id; render(); },
  hToggle(b, i, j, id) { openHist = openHist === id ? null : id; render(); },
  hDel(b, i, j, id) {
    if (!confirm('¿Eliminar este entrenamiento del historial?')) return;
    db.history = db.history.filter(h => h.id !== id); save(); render();
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
    db.body.push(e); save(); render(); toast('Medidas guardadas');
  },
  bodyDel(b, i, j, id) {
    if (!confirm('¿Eliminar este registro?')) return;
    db.body = db.body.filter(e => e.id !== id); save(); render();
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
    localStorage.removeItem(KEY); db = load(); draft = null; view = 'home'; render();
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
    case 'w': case 'r': case 'v': case 'g': case 'l': w.exercises[i].sets[j][f] = v.trim(); break;
    case 'pSex': db.profile.sex = v; save(); render(); return;
    case 'musSel': musSel = v; render(); return;
    case 'pAge': db.profile.birthYear = parseInt(v) > 0 ? new Date().getFullYear() - parseInt(v) : null; break;
    case 'pHeight': db.profile.height = num(v) || null; break;
    case 'estKg': case 'estReps': {
      const m = strengthModel(el.dataset.id), out = $('#estOut');
      if (!m || m.needWeight || !v.trim()) { out.textContent = ''; return; }
      if (f === 'estKg') {
        const r = repsAt(m.orm, m.base + num(v));
        out.innerHTML = r ? `Con ${m.isBW ? '+' : ''}${num(v)} kg: <b>≈ ${r} ${r === 1 ? 'repetición' : 'repeticiones'}</b>` : 'Con ese peso: <b>probablemente ninguna repetición</b> todavía';
      } else {
        const reps = Math.max(1, parseInt(v) || 1), w = round25(loadFor(m.orm, reps) - m.base);
        out.innerHTML = m.isBW
          ? (w > 0 ? `Para ${reps} reps: <b>≈ +${w} kg de lastre</b>` : w === 0 ? `Para ${reps} reps: <b>sin lastre</b>` : `Para ${reps} reps: <b>aún no sin ayuda</b> (te faltan ≈ ${-w} kg de asistencia)`)
          : `Para ${reps} reps: <b>≈ ${w} kg</b>`;
      }
      return;
    }
    case 'rName': draft.name = v; return;
    case 'rSets': draft.items[i].sets = Math.max(1, parseInt(v) || 1); return;
    case 'rReps': draft.items[i].reps = v.trim(); return;
    case 'rRest': draft.items[i].rest = Math.max(0, parseInt(v) || 0); return;
    case 'exQ': exQuery = v; $('#exList').innerHTML = exList(); return;
    case 'pickQ': $('#pickList').innerHTML = pickList(v); return;
    case 'catQ': case 'catG': $('#catList').innerHTML = catList(); return;
    case 'sRest': db.settings.rest = Math.max(0, parseInt(v) || 0); break;
    case 'sGoal': db.settings.weekGoal = Math.max(1, parseInt(v) || 1); break;
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
        localStorage.setItem(KEY, JSON.stringify(d)); db = load(); view = 'home'; render();
        alert('Datos importados');
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
// Comprobación silenciosa de actualizaciones al abrir la app
if (navigator.onLine && location.protocol === 'https:') setTimeout(() => checkUpdate(false), 3000);
