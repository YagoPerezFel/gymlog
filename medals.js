'use strict';
// Medallas, experiencia y niveles de GymLog.
// Se carga antes de app.js; usa sus funciones (workoutVolume, famOf, histKcal...) solo cuando se llama.

// ---------- Niveles de las medallas ----------
// [nombre, colores del emblema: claro, medio, oscuro]
const TIERS = [
  ['Bronce', '#f6cfae', '#c27b4b', '#5e3018'],
  ['Plata', '#ffffff', '#b8c4dc', '#4f5c7a'],
  ['Oro', '#fff3b8', '#f2b937', '#7d500a'],
  ['Platino', '#e6fffb', '#73d6cc', '#21706b'],
  ['Diamante', '#ece6ff', '#8f7bff', '#33238f'],
  ['Maestro', '#ffe6b0', '#ff6a3d', '#7f1414'],
];

// ---------- Pictogramas para el centro de las medallas (trazos blancos, cuadrícula 24×24) ----------
const GLYPHS = {
  calendar: '<rect x="4" y="6" width="16" height="14" rx="3"/><path d="M4 11h16M9 4v4M15 4v4"/>',
  flame: '<path d="M12 21c-3.6 0-6-2.4-6-5.7 0-2.5 1.5-4.2 2.8-5.6.4 1.7 1.3 2.6 2.2 3-.3-3 .8-5.6 2.9-7.4.4 3 5.1 5.2 5.1 10 0 3.3-2.4 5.7-7 5.7z"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8" fill="#fff"/>',
  pullup: '<path d="M3 4h18M7 4l5 5 5-5M12 9v6M12 15l-3 5M12 15l3 5"/><circle cx="12" cy="7.4" r="1.6" fill="#fff"/>',
  dip: '<path d="M3 12h5M16 12h5M8 12l4-3 4 3M12 9v6M12 15l-2.5 5M12 15l2.5 5"/><circle cx="12" cy="5.6" r="1.8" fill="#fff"/>',
  pushup: '<path d="M2 20h20M5 16l12-4M14 13l1 7"/><circle cx="19.2" cy="10.8" r="1.8" fill="#fff"/>',
  muscleup: '<path d="M3 14h18M7 14l5-4 5 4M12 10V5M12 10l-3 8M12 10l3 8"/><circle cx="12" cy="3.4" r="1.7" fill="#fff"/>',
  handstand: '<path d="M5 21h14M9 21l3-5 3 5M12 16V7M12 7l-2.5-4M12 7l2.5-4"/><circle cx="12" cy="18.3" r="1.2" fill="#fff"/>',
  lever: '<path d="M3 4h18M9 4v5M9 9h12"/><circle cx="7" cy="9" r="1.8" fill="#fff"/>',
  lsit: '<path d="M4 20h4M16 20h4M8 20v-6M16 20v-6M12 5v9M12 14h8"/><circle cx="12" cy="3.4" r="1.7" fill="#fff"/>',
  plate: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 1v3M12 20v3"/>',
  barbell: '<path d="M2 12h20M5 7v10M8 8v8M16 8v8M19 7v10"/>',
  squat: '<path d="M3 5h18M6 3v4M18 3v4M9 5l3 4 3-4M12 9v3M12 12l-4 3 1 5M12 12l4 3-1 5"/>',
  deadlift: '<path d="M3 19h18M6 17v4M18 17v4M12 4v8M12 6l-3 6v7M12 6l3 6v7M12 12l-2 7M12 12l2 7"/><circle cx="12" cy="2.6" r="1.4" fill="#fff"/>',
  run: '<path d="M13 7l-3 5 4 3-2 6M10 12l-4-1M14 8l4 2.5"/><circle cx="15" cy="4" r="1.9" fill="#fff"/>',
  trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8"/>',
  weight: '<path d="M7 9h10l2 11H5zM9 9a3 3 0 0 1 6 0"/>',
  sun: '<circle cx="12" cy="13" r="4"/><path d="M12 3v3M4 13H1M23 13h-3M5.6 6.6l2 2M18.4 6.6l-2 2M3 20h18"/>',
  moon: '<path d="M19 15A8 8 0 1 1 10 4a6.5 6.5 0 0 0 9 11z"/>',
  double: '<path d="M4 8v8M7 6v12M7 12h4M11 6v12M14 8v8M17 12h3M17 6v12M20 8v8"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2.5"/>',
};

// ---------- Estadísticas de todo el historial (se calculan una vez por pantalla) ----------
const isPull = x => ['pullup', 'chinup'].includes(famOfX(x));
const famOfX = x => famOf(exById(x.exId) || { name: x.name, id: x.exId });
function computeStats() {
  const st = { workouts: db.history.length, totalKg: 0, maxKgWorkout: 0, prs: 0, kcal: 0, tmKm: 0,
    maxPull: 0, maxDip: 0, maxPush: 0, maxMU: 0, pullLastre: 0, dipLastre: 0, holdHS: 0, holdFL: 0, holdLsit: 0,
    bench: 0, squat: 0, deadlift: 0, early: 0, night: 0, double: 0, marathon: 0 };
  const bwNow = bodyWeight() || 0, days = {};
  db.history.forEach(h => {
    const vol = workoutVolume(h), bk = h.bodyKg || bwNow;
    st.totalKg += vol; st.maxKgWorkout = Math.max(st.maxKgWorkout, vol); st.kcal += histKcal(h) || 0;
    const hr = new Date(h.start).getHours();
    if (hr < 7) st.early = 1;
    if (hr >= 22) st.night = 1;
    if (h.end - h.start >= 2 * 3600e3) st.marathon = 1;
    const dk = dayKey(h.start); days[dk] = (days[dk] || 0) + 1; if (days[dk] >= 2) st.double = 1;
    h.exercises.forEach(x => {
      const fam = famOfX(x), name = norm(x.name);
      x.sets.forEach(s => {
        if (!isWork(s)) return;
        if (s.pr) st.prs++;
        if (x.cardio === 'treadmill' && s.v) st.tmKm += s.v * s.r / 60;
        if (x.kind === 'r' || x.kind === 'w') {
          if (fam === 'pullup' || fam === 'chinup') { st.maxPull = Math.max(st.maxPull, s.r); if (x.kind === 'w' && bk) st.pullLastre = Math.max(st.pullLastre, s.w / bk * 100); }
          if (fam === 'dip') { st.maxDip = Math.max(st.maxDip, s.r); if (x.kind === 'w' && bk) st.dipLastre = Math.max(st.dipLastre, s.w / bk * 100); }
          if (fam === 'pushup') st.maxPush = Math.max(st.maxPush, s.r);
          if (fam === 'muscleup') st.maxMU = Math.max(st.maxMU, s.r);
          // fuerza relativa con barra (1RM estimado ÷ tu peso ese día)
          if (x.kind === 'w' && !x.bw && bk) {
            const ratio = e1rm(s.w, s.r) / bk;
            if (/press banca|bench press/.test(name)) st.bench = Math.max(st.bench, ratio);
            else if (/^sentadilla$|barbell squat|back squat|sentadilla trasera/.test(name)) st.squat = Math.max(st.squat, ratio);
            else if (/^peso muerto$|deadlift/.test(name) && !/rumano|romanian/.test(name)) st.deadlift = Math.max(st.deadlift, ratio);
          }
        }
        if (x.kind === 't') {
          if (/pino|handstand/.test(name)) st.holdHS = Math.max(st.holdHS, s.r);
          if (/front lever/.test(name)) st.holdFL = Math.max(st.holdFL, s.r);
          if (/l-sit|l sit/.test(name)) st.holdLsit = Math.max(st.holdLsit, s.r);
        }
      });
    });
  });
  // mejor racha de semanas seguidas y semanas con el objetivo cumplido
  const weeks = {};
  db.history.forEach(h => { const w = startOfWeek(h.start); weeks[w] = (weeks[w] || 0) + 1; });
  const ws = Object.keys(weeks).map(Number).sort((a, b) => a - b);
  let best = 0, cur = 0, prev = null;
  ws.forEach(w => { cur = prev !== null && Math.round((w - prev) / (7 * DAY)) === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = w; });
  st.bestStreak = best;
  st.goalWeeks = ws.filter(w => weeks[w] >= (db.settings.weekGoal || 3)).length;
  return st;
}

// ---------- Catálogo de medallas ----------
// [id, categoría, nombre, título de Maestro, pictograma, umbrales de cada nivel, estadística, unidad]
const MEDAL_DEFS = [
  ['constancia', 'Constancia', 'Constancia', 'Maestro de la constancia', 'calendar', [1, 10, 25, 50, 100, 250], 'workouts', 'entrenos'],
  ['racha', 'Constancia', 'Racha imparable', 'Maestro de la racha', 'flame', [2, 4, 8, 12, 26, 52], 'bestStreak', 'semanas seguidas'],
  ['objetivo', 'Constancia', 'Objetivo cumplido', 'Maestro de la disciplina', 'target', [1, 4, 10, 20, 40, 75], 'goalWeeks', 'semanas con el objetivo'],
  ['dominadas', 'Calistenia', 'Dominadas', 'Maestro de las dominadas', 'pullup', [5, 8, 10, 12, 15, 20], 'maxPull', 'dominadas en una serie'],
  ['fondos', 'Calistenia', 'Fondos', 'Maestro de los fondos', 'dip', [5, 10, 15, 20, 25, 30], 'maxDip', 'fondos en una serie'],
  ['flexiones', 'Calistenia', 'Flexiones', 'Maestro de las flexiones', 'pushup', [10, 20, 30, 40, 50, 60], 'maxPush', 'flexiones en una serie'],
  ['muscleup', 'Calistenia', 'Muscle up', 'Maestro del muscle up', 'muscleup', [1, 2, 3, 5, 8, 10], 'maxMU', 'muscle ups en una serie'],
  ['pino', 'Calistenia', 'Pino', 'Maestro del pino', 'handstand', [5, 10, 20, 30, 45, 60], 'holdHS', 'segundos de pino'],
  ['frontlever', 'Calistenia', 'Front lever', 'Maestro del front lever', 'lever', [3, 5, 8, 10, 15, 20], 'holdFL', 'segundos de front lever'],
  ['lsit', 'Calistenia', 'L-sit', 'Maestro del L-sit', 'lsit', [5, 10, 15, 20, 30, 45], 'holdLsit', 'segundos de L-sit'],
  ['domlastre', 'Fuerza', 'Dominadas lastradas', 'Maestro de las dominadas lastradas', 'plate', [5, 10, 20, 30, 40, 50], 'pullLastre', '% de tu peso como lastre'],
  ['fonlastre', 'Fuerza', 'Fondos lastrados', 'Maestro de los fondos lastrados', 'plate', [10, 20, 30, 40, 60, 80], 'dipLastre', '% de tu peso como lastre'],
  ['banca', 'Fuerza', 'Press banca', 'Maestro del press banca', 'barbell', [0.5, 0.75, 1, 1.25, 1.5, 1.75], 'bench', '× tu peso (1RM est.)'],
  ['sentadilla', 'Fuerza', 'Sentadilla', 'Maestro de la sentadilla', 'squat', [0.75, 1, 1.25, 1.5, 2, 2.5], 'squat', '× tu peso (1RM est.)'],
  ['pesomuerto', 'Fuerza', 'Peso muerto', 'Maestro del peso muerto', 'deadlift', [1, 1.25, 1.5, 2, 2.5, 3], 'deadlift', '× tu peso (1RM est.)'],
  ['toneladas', 'Volumen', 'Toneladas', 'Maestro del hierro', 'weight', [10, 50, 100, 250, 500, 1000], 'totalKg', 'toneladas en total', 1000],
  ['sesion', 'Volumen', 'Sesión épica', 'Maestro del volumen', 'barbell', [2, 4, 6, 8, 10, 15], 'maxKgWorkout', 'toneladas en un entreno', 1000],
  ['records', 'Volumen', 'Rompe-récords', 'Maestro de los récords', 'trophy', [1, 10, 25, 50, 100, 200], 'prs', 'récords personales'],
  ['cinta', 'Cardio', 'Kilómetros en cinta', 'Maestro de la cinta', 'run', [5, 25, 50, 100, 250, 500], 'tmKm', 'km en cinta'],
  ['calorias', 'Cardio', 'Quemacalorías', 'Maestro del fuego', 'flame', [1000, 5000, 10000, 25000, 50000, 100000], 'kcal', 'kcal quemadas'],
];
// Secretas: un solo nivel, se ven como "???" hasta conseguirlas
const SECRET_DEFS = [
  ['madrugador', 'Madrugador', 'sun', 'early', 'Entrenar antes de las 7:00'],
  ['buho', 'Búho nocturno', 'moon', 'night', 'Entrenar a partir de las 22:00'],
  ['doble', 'Doble sesión', 'double', 'double', 'Dos entrenos el mismo día'],
  ['maraton', 'Maratón de hierro', 'clock', 'marathon', 'Un entreno de 2 horas o más'],
];

// Estado de todas las medallas: nivel conseguido (-1 = ninguno), valor actual y siguiente meta
function medalStates(st = computeStats()) {
  const list = MEDAL_DEFS.map(([id, cat, name, master, glyph, th, key, unit, div = 1]) => {
    const v = (st[key] || 0) / div;
    let tier = -1;
    th.forEach((t, k) => { if (v >= t) tier = k; });
    return { id, cat, name, master, glyph, th, unit, value: v, tier, next: th[tier + 1] };
  });
  SECRET_DEFS.forEach(([id, name, glyph, key, how]) => list.push({ id, cat: 'Secretas', name, glyph, secret: true, how, tier: st[key] ? 5 : -1, value: st[key] ? 1 : 0 }));
  return list;
}
const medalKey = list => Object.fromEntries(list.map(m => [m.id, m.tier]));

// ---------- Experiencia y nivel ----------
// XP = kg levantados en cada entreno (incluye tu peso corporal en calistenia).
// Del nivel 1 al 2 hacen falta 2.000 kg; cada nivel siguiente pide un 10 % más.
const XP_BASE = 2000, XP_GROWTH = 1.10;
const xpForLevel = n => Math.round(XP_BASE * XP_GROWTH ** (n - 1));
const totalXP = () => db.history.reduce((a, h) => a + workoutVolume(h), 0);
function levelInfo(xp = totalXP()) {
  let lv = 1, rest = xp;
  while (lv < 100 && rest >= xpForLevel(lv)) { rest -= xpForLevel(lv); lv++; }
  return { level: lv, into: rest, need: xpForLevel(lv), xp };
}
// Títulos por nivel (se desbloquean al alcanzarlo)
const LEVEL_TITLES = [[1, 'Novato'], [3, 'Aprendiz'], [5, 'Constante'], [8, 'Guerrero'], [12, 'Veterano'], [16, 'Campeón'],
  [20, 'Élite'], [25, 'Titán'], [30, 'Leyenda'], [40, 'Mito'], [50, 'Inmortal']];
const levelTitle = lv => LEVEL_TITLES.filter(([n]) => lv >= n).pop()[1];
// Todos los títulos disponibles: los de nivel + los de medallas en Maestro + las secretas
function unlockedTitles(lv, medals) {
  return [...LEVEL_TITLES.filter(([n]) => lv >= n).map(([, t]) => t),
    ...medals.filter(m => !m.secret && m.tier === 5).map(m => m.master),
    ...medals.filter(m => m.secret && m.tier >= 0).map(m => m.name)];
}

// ---------- Dibujo de una medalla (SVG) ----------
// Escudo hexagonal con degradado del nivel; desde Oro gana alas, desde Diamante destellos y en Maestro corona y llamas.
function medalSvg(m, size = 72) {
  const t = Math.max(0, m.tier), [, c1, c2, c3] = TIERS[t], locked = m.tier < 0, id = `md-${m.id}-${t}-${Math.random().toString(36).slice(2, 6)}`;
  const wing = (k, s) => `<path d="M${50 - s} 30 C${50 - s - 26} ${26 - k} ${50 - s - 34} ${52 - k} ${50 - s - 22} ${70} L${50 - s} 58Z" fill="url(#${id}w)" stroke="${c3}" stroke-width="1.5"/>
    <path d="M${50 + s} 30 C${50 + s + 26} ${26 - k} ${50 + s + 34} ${52 - k} ${50 + s + 22} ${70} L${50 + s} 58Z" fill="url(#${id}w)" stroke="${c3}" stroke-width="1.5"/>`;
  return `<svg class="medal${locked ? ' locked' : ''}" viewBox="0 0 100 100" width="${size}" height="${size}">
    <defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient>
      <linearGradient id="${id}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    ${t >= 5 && !locked ? `<path d="M30 22 L36 4 L44 18 L50 0 L56 18 L64 4 L70 22Z" fill="url(#${id}g)" stroke="${c3}" stroke-width="1.5"/>` : ''}
    ${t >= 2 && !locked ? wing(t * 3, 22 + (t >= 4 ? 2 : 0)) : ''}
    ${t >= 4 && !locked ? `<path d="M50 96 L44 84 L56 84Z" fill="${c2}"/><circle cx="18" cy="20" r="2.2" fill="${c1}"/><circle cx="84" cy="16" r="1.8" fill="${c1}"/>` : ''}
    <polygon points="50,10 84,28 84,64 50,92 16,64 16,28" fill="url(#${id}g)" stroke="${c3}" stroke-width="2"/>
    <polygon points="50,20 75,33 75,60 50,80 25,60 25,33" fill="#141a2e" stroke="${c1}" stroke-opacity=".6" stroke-width="1.2"/>
    <g transform="translate(32 32) scale(1.5)" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${m.secret && locked ? '<path d="M9 9a3 3 0 1 1 4 2.8c-.7.3-1 .8-1 1.5v.7M12 17.5v.5"/>' : GLYPHS[m.glyph] || ''}</g>
  </svg>`;
}

// ---------- Barra de experiencia (su aspecto cambia con el estilo) ----------
function xpBar(li, big) {
  const pct = Math.min(100, li.into / li.need * 100);
  return `<div class="xpw${big ? ' big' : ''}"><span class="lvl">${theme() === 'kingdom' ? 'LV' : 'Nivel'} <b>${li.level}</b></span>
    <div class="xp"><i style="width:${pct.toFixed(1)}%"></i></div>${big ? `<small>${fkg(li.into)} / ${fkg(li.need)} kg para el nivel ${li.level + 1}</small>` : ''}</div>`;
}
