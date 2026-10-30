'use strict';
// Datos fijos de GymLog: grupos musculares, ejercicios por defecto, niveles de cardio y mapa corporal.
// Fuentes:
//  - MET (gasto energético): 2024 Adult Compendium of Physical Activities (pacompendium.com)
//  - % de peso corporal: Ebben et al. 2011 (flexiones 64 %, declinadas 74 %, inclinadas 41 %, de rodillas 49 %);
//    dominadas/fondos/pino 100 %; resto estimado por masa de los segmentos corporales que se mueven.
//  - Mapa corporal: react-body-highlighter (licencia MIT, © 2020 GV79)

// ---------- Grupos musculares del informe ----------
// clave: [nombre, zonas del dibujo]
const MUSCLES = {
  chest: ['Pecho', ['chest']],
  back: ['Espalda (dorsales)', ['upper-back']],
  traps: ['Trapecio', ['trapezius', 'neck']],
  lowback: ['Lumbar', ['lower-back']],
  shoulders: ['Hombros', ['front-deltoids', 'back-deltoids']],
  biceps: ['Bíceps', ['biceps']],
  triceps: ['Tríceps', ['triceps']],
  forearms: ['Antebrazo', ['forearm']],
  abs: ['Abdomen', ['abs']],
  obliques: ['Oblicuos', ['obliques']],
  glutes: ['Glúteos', ['gluteal']],
  quads: ['Cuádriceps', ['quadriceps']],
  hams: ['Isquiotibiales', ['hamstring']],
  adductors: ['Aductores', ['adductor']],
  abductors: ['Abductores', ['abductors']],
  calves: ['Gemelos', ['calves', 'left-soleus', 'right-soleus']],
};
// Músculos por defecto según el grupo (ejercicios creados por el usuario sin músculos definidos)
const GROUP_MUSCLES = {
  'Pecho': ['chest'], 'Espalda': ['back'], 'Piernas': ['quads', 'glutes'], 'Hombros': ['shoulders'],
  'Bíceps': ['biceps'], 'Tríceps': ['triceps'], 'Core': ['abs'], 'Antebrazo': ['forearms'], 'Cuello': ['traps'],
};

// ---------- Valores MET (Compendio 2024) ----------
const MET = {
  weights: 3.5,     // 02054 Pesas, varios ejercicios, 8-15 reps
  heavy: 5.0,       // 02052 Pesas: sentadilla, peso muerto
  cali: 3.8,        // 02022 Calistenia (flexiones, dominadas, zancadas), esfuerzo moderado
  plyo: 7.5,        // 02020 Calistenia vigorosa (burpees, saltos)
  core: 2.8,        // 02024 Calistenia ligera (crunch, plancha)
  bodyweight: 3.0,  // 02056 Ejercicios con peso corporal, general
  warmup: 3.5,      // 02030 Calistenia ligera/moderada general (movilidad, calentamiento)
  stretch: 2.3,     // 02101 Estiramientos suaves
};

// ---------- Cardio: niveles de intensidad por máquina (Compendio 2024) ----------
// La cinta no usa niveles: se calcula con velocidad e inclinación (ecuaciones ACSM)
const CARDIO = {
  treadmill: null,
  bike: [['Suave (~60 W)', 5.0], ['Moderada (100-125 W)', 6.8], ['Intensa (150-200 W)', 10.3]],    // 01216, 01224, 01232
  row: [['Suave (<100 W)', 5.0], ['Moderada (100-149 W)', 7.5], ['Intensa (150-199 W)', 11.0]],     // 02071-02073
  ellip: [['Moderada', 5.0], ['Intensa', 9.0]],                                                     // 02048, 02049
  rope: [['Lenta (<100 saltos/min)', 8.3], ['Moderada (100-120)', 11.8], ['Rápida (120-160)', 12.3]], // 15552, 15551, 15550
  stair: [['General', 9.3]],                                                                        // 02065
  other: [['Suave', 3.5], ['Moderada', 5.0], ['Intensa', 7.5]],                                     // 02034, 02035, 02040 (circuito)
};

// ---------- Ejercicios por defecto ----------
// [nombre, grupo, tipo, foto, músculos principales, secundarios, % peso corporal, MET, cardio]
// tipo: w = peso × reps (si tiene % peso corporal, el peso es lastre), r = solo reps, t = tiempo (seg), c = cardio (min)
const DEFAULT_EX_DATA = [
  ['Press banca', 'Pecho', 'w', 'Barbell_Bench_Press_-_Medium_Grip', 'chest', 'triceps,shoulders'],
  ['Press inclinado con mancuernas', 'Pecho', 'w', 'Incline_Dumbbell_Press', 'chest', 'shoulders,triceps'],
  ['Press declinado', 'Pecho', 'w', 'Decline_Barbell_Bench_Press', 'chest', 'triceps'],
  ['Aperturas con mancuernas', 'Pecho', 'w', 'Dumbbell_Flyes', 'chest', 'shoulders'],
  ['Cruce de poleas', 'Pecho', 'w', 'Cable_Crossover', 'chest', 'shoulders'],
  ['Fondos', 'Pecho', 'r', 'Dips_-_Chest_Version', 'chest,triceps', 'shoulders', 1, MET.cali],
  ['Flexiones', 'Pecho', 'r', 'Pushups', 'chest', 'triceps,shoulders', 0.64, MET.cali],
  ['Dominadas', 'Espalda', 'r', 'Pullups', 'back', 'biceps,forearms,shoulders,traps', 1, MET.cali],
  ['Jalón al pecho', 'Espalda', 'w', 'Wide-Grip_Lat_Pulldown', 'back', 'biceps'],
  ['Remo con barra', 'Espalda', 'w', 'Bent_Over_Barbell_Row', 'back', 'biceps,traps,lowback'],
  ['Remo con mancuerna', 'Espalda', 'w', 'One-Arm_Dumbbell_Row', 'back', 'biceps'],
  ['Remo en polea baja', 'Espalda', 'w', 'Seated_Cable_Rows', 'back', 'biceps,traps'],
  ['Peso muerto', 'Espalda', 'w', 'Barbell_Deadlift', 'hams,glutes,lowback', 'back,traps,forearms,quads', 0, MET.heavy],
  ['Pullover en polea', 'Espalda', 'w', 'Straight-Arm_Pulldown', 'back', 'chest,triceps'],
  ['Sentadilla', 'Piernas', 'w', 'Barbell_Squat', 'quads,glutes', 'hams,adductors,lowback', 0, MET.heavy],
  ['Prensa', 'Piernas', 'w', 'Leg_Press', 'quads,glutes', 'hams'],
  ['Zancadas', 'Piernas', 'w', 'Dumbbell_Lunges', 'quads,glutes', 'hams,adductors'],
  ['Sentadilla búlgara', 'Piernas', 'w', 'Split_Squat_with_Dumbbells', 'quads,glutes', 'hams,adductors'],
  ['Peso muerto rumano', 'Piernas', 'w', 'Romanian_Deadlift', 'hams,glutes', 'lowback', 0, MET.heavy],
  ['Extensión de cuádriceps', 'Piernas', 'w', 'Leg_Extensions', 'quads', ''],
  ['Curl femoral', 'Piernas', 'w', 'Lying_Leg_Curls', 'hams', 'calves'],
  ['Hip thrust', 'Piernas', 'w', 'Barbell_Hip_Thrust', 'glutes', 'hams'],
  ['Gemelos de pie', 'Piernas', 'w', 'Standing_Calf_Raises', 'calves', ''],
  ['Abductores en máquina', 'Piernas', 'w', 'Thigh_Abductor', 'abductors', 'glutes'],
  ['Press militar', 'Hombros', 'w', 'Standing_Military_Press', 'shoulders', 'triceps,traps'],
  ['Press con mancuernas sentado', 'Hombros', 'w', 'Seated_Dumbbell_Press', 'shoulders', 'triceps'],
  ['Elevaciones laterales', 'Hombros', 'w', 'Side_Lateral_Raise', 'shoulders', 'traps'],
  ['Pájaros', 'Hombros', 'w', 'Reverse_Flyes', 'shoulders', 'back,traps'],
  ['Face pull', 'Hombros', 'w', 'Face_Pull', 'shoulders', 'traps,back'],
  ['Curl con barra', 'Bíceps', 'w', 'Barbell_Curl', 'biceps', 'forearms'],
  ['Curl con mancuernas', 'Bíceps', 'w', 'Dumbbell_Bicep_Curl', 'biceps', 'forearms'],
  ['Curl martillo', 'Bíceps', 'w', 'Hammer_Curls', 'biceps', 'forearms'],
  ['Curl en polea', 'Bíceps', 'w', 'Standing_Biceps_Cable_Curl', 'biceps', 'forearms'],
  ['Press francés', 'Tríceps', 'w', 'EZ-Bar_Skullcrusher', 'triceps', ''],
  ['Extensión de tríceps en polea', 'Tríceps', 'w', 'Triceps_Pushdown', 'triceps', ''],
  ['Fondos en banco', 'Tríceps', 'r', 'Bench_Dips', 'triceps', 'chest,shoulders', 0.6, MET.cali],
  ['Plancha', 'Core', 't', 'Plank', 'abs', 'obliques,shoulders', 0, MET.core],
  ['Crunch', 'Core', 'r', 'Crunches', 'abs', '', 0, MET.core],
  ['Elevación de piernas', 'Core', 'r', 'Hanging_Leg_Raise', 'abs', 'obliques,forearms', 0, MET.cali],
  ['Rueda abdominal', 'Core', 'r', 'Ab_Roller', 'abs', 'obliques,back,shoulders', 0, MET.cali],
  ['Cinta', 'Cardio', 'c', 'Running_Treadmill', '', '', 0, 0, 'treadmill'],
  ['Bicicleta', 'Cardio', 'c', 'Bicycling_Stationary', '', '', 0, 0, 'bike'],
  ['Remo ergómetro', 'Cardio', 'c', 'Rowing_Stationary', '', '', 0, 0, 'row'],
  ['Comba', 'Cardio', 'c', 'Rope_Jumping', '', '', 0, 0, 'rope'],
  // Nuevos en la versión 0.3
  ['Elíptica', 'Cardio', 'c', '', '', '', 0, 0, 'ellip'],
  ['Escaladora', 'Cardio', 'c', '', '', '', 0, 0, 'stair'],
  // Calistenia — empuje
  ['Fondos con lastre', 'Calistenia', 'w', 'Dips_-_Chest_Version', 'chest,triceps', 'shoulders', 1, MET.cali],
  ['Fondos en anillas', 'Calistenia', 'r', 'Ring_Dips', 'chest,triceps', 'shoulders,abs', 1, MET.cali],
  ['Fondos en barra recta', 'Calistenia', 'r', 'Dips_-_Triceps_Version', 'triceps,chest', 'shoulders', 1, MET.cali],
  ['Flexiones diamante', 'Calistenia', 'r', 'Pushups_Close_and_Wide_Hand_Positions', 'triceps,chest', 'shoulders', 0.64, MET.cali],
  ['Flexiones declinadas', 'Calistenia', 'r', 'Decline_Push-Up', 'chest,shoulders', 'triceps', 0.74, MET.cali],
  ['Flexiones inclinadas', 'Calistenia', 'r', 'Incline_Push-Up', 'chest', 'triceps,shoulders', 0.41, MET.cali],
  ['Flexiones de rodillas', 'Calistenia', 'r', 'Pushups', 'chest', 'triceps,shoulders', 0.49, MET.cali],
  ['Flexiones con palmada', 'Calistenia', 'r', 'Plyo_Push-up', 'chest', 'triceps,shoulders', 0.64, MET.plyo],
  ['Flexiones arqueras', 'Calistenia', 'r', 'Push-Up_Wide', 'chest', 'triceps,shoulders', 0.64, MET.cali],
  ['Flexiones pseudo planche', 'Calistenia', 'r', 'Pushups', 'chest,shoulders', 'triceps,abs', 0.7, MET.cali],
  ['Flexiones con lastre', 'Calistenia', 'w', 'Pushups', 'chest', 'triceps,shoulders', 0.64, MET.cali],
  ['Pike push ups', 'Calistenia', 'r', '', 'shoulders', 'triceps,traps', 0.75, MET.cali],
  ['Pike push ups elevadas', 'Calistenia', 'r', '', 'shoulders', 'triceps,traps', 0.85, MET.cali],
  ['Flexiones en pino (HSPU)', 'Calistenia', 'r', 'Handstand_Push-Ups', 'shoulders,triceps', 'traps', 1, MET.cali],
  // Calistenia — tirón
  ['Dominadas con lastre', 'Calistenia', 'w', 'Pullups', 'back', 'biceps,forearms,shoulders,traps', 1, MET.cali],
  ['Dominadas supinas (chin ups)', 'Calistenia', 'r', 'Chin-Up', 'back,biceps', 'forearms,shoulders,traps', 1, MET.cali],
  ['Dominadas supinas con lastre', 'Calistenia', 'w', 'Chin-Up', 'back,biceps', 'forearms,shoulders,traps', 1, MET.cali],
  ['Dominadas agarre ancho', 'Calistenia', 'r', 'Wide-Grip_Rear_Pull-Up', 'back', 'biceps,forearms,shoulders,traps', 1, MET.cali],
  ['Dominadas arqueras', 'Calistenia', 'r', 'Pullups', 'back', 'biceps,forearms,shoulders,traps', 1, MET.cali],
  ['Dominadas negativas', 'Calistenia', 'r', 'Pullups', 'back', 'biceps,forearms,shoulders,traps', 1, MET.cali],
  ['Dominadas asistidas con banda', 'Calistenia', 'r', 'Band_Assisted_Pull-Up', 'back', 'biceps,forearms,shoulders,traps', 0.7, MET.cali],
  ['Muscle up', 'Calistenia', 'r', 'Muscle_Up', 'back,triceps', 'biceps,chest,shoulders,forearms,abs', 1, MET.cali],
  ['Remo invertido (australianas)', 'Calistenia', 'r', 'Inverted_Row', 'back', 'biceps,shoulders,traps', 0.6, MET.cali],
  // Calistenia — pierna
  ['Sentadilla con peso corporal', 'Calistenia', 'r', 'Bodyweight_Squat', 'quads,glutes', 'hams', 0.88, MET.cali],
  ['Sentadilla pistol', 'Calistenia', 'r', 'Kettlebell_Pistol_Squat', 'quads,glutes', 'hams,abs', 0.88, MET.cali],
  ['Sentadilla con salto', 'Calistenia', 'r', 'Freehand_Jump_Squat', 'quads,glutes', 'calves,hams', 0.88, MET.plyo],
  ['Zancadas con peso corporal', 'Calistenia', 'r', 'Bodyweight_Walking_Lunge', 'quads,glutes', 'hams,adductors', 0.88, MET.cali],
  ['Gemelos con peso corporal', 'Calistenia', 'r', 'Standing_Calf_Raises', 'calves', '', 0.97, MET.cali],
  ['Curl nórdico', 'Calistenia', 'r', 'Natural_Glute_Ham_Raise', 'hams', 'glutes,calves', 0.6, MET.cali],
  ['Burpees', 'Calistenia', 'r', '', 'quads,chest', 'shoulders,triceps,abs', 0, MET.plyo],
  // Calistenia — core y estáticos (tiempo)
  ['Toes to bar', 'Calistenia', 'r', 'Hanging_Leg_Raise', 'abs', 'obliques,forearms,back', 0, MET.cali],
  ['Dragon flag', 'Calistenia', 'r', '', 'abs', 'obliques,lowback', 0, MET.cali],
  ['L-sit', 'Calistenia', 't', '', 'abs', 'triceps,quads', 0, MET.cali],
  ['Hollow body', 'Calistenia', 't', '', 'abs', 'obliques', 0, MET.core],
  ['Front lever', 'Calistenia', 't', '', 'back', 'abs,shoulders', 0, MET.cali],
  ['Planche', 'Calistenia', 't', '', 'shoulders,chest', 'triceps,abs', 0, MET.cali],
  ['Pino (handstand)', 'Calistenia', 't', '', 'shoulders', 'triceps,traps,abs', 0, MET.cali],
  ['Colgado pasivo (dead hang)', 'Calistenia', 't', '', 'forearms', 'back', 0, MET.core],
  // Calentamiento y movilidad (v0.6): no cuentan en músculos, kg ni experiencia; sí en calorías
  ['Saltos de tijera (jumping jacks)', 'Calentamiento', 't', '', '', '', 0, MET.plyo],
  ['Skipping (rodillas al pecho)', 'Calentamiento', 't', '', '', '', 0, MET.plyo],
  ['Talones al glúteo', 'Calentamiento', 't', 'Single_Leg_Butt_Kick', '', '', 0, MET.plyo],
  ['Escaladores (mountain climbers)', 'Calentamiento', 't', 'Mountain_Climbers', '', '', 0, MET.plyo],
  ['Círculos de brazos', 'Calentamiento', 't', 'Arm_Circles', '', '', 0, MET.warmup],
  ['Círculos de hombros', 'Calentamiento', 't', 'Shoulder_Circles', '', '', 0, MET.warmup],
  ['Círculos de cadera', 'Calentamiento', 't', 'Standing_Hip_Circles', '', '', 0, MET.warmup],
  ['Círculos de rodillas', 'Calentamiento', 't', 'Knee_Circles', '', '', 0, MET.warmup],
  ['Círculos de muñecas', 'Calentamiento', 't', 'Wrist_Circles', '', '', 0, MET.warmup],
  ['Círculos de tobillos', 'Calentamiento', 't', 'Ankle_Circles', '', '', 0, MET.warmup],
  ['Rotaciones de tronco', 'Calentamiento', 't', 'Torso_Rotation', '', '', 0, MET.warmup],
  ['Inchworm (gusano)', 'Calentamiento', 'r', 'Inchworm', '', '', 0, MET.warmup],
  ['Estiramiento más grande del mundo', 'Calentamiento', 'r', 'Worlds_Greatest_Stretch', '', '', 0, MET.warmup],
  ['Gato-camello', 'Calentamiento', 'r', 'Cat_Stretch', '', '', 0, MET.warmup],
  ['Separaciones con banda (band pull-apart)', 'Calentamiento', 'r', 'Band_Pull_Apart', '', '', 0, MET.warmup],
  ['Retracciones escapulares en barra', 'Calentamiento', 'r', 'Scapular_Pull-Up', '', '', 0, MET.warmup],
  ['Puente de glúteo', 'Calentamiento', 'r', 'Butt_Lift_Bridge', '', '', 0, MET.warmup],
  ['Dead bug', 'Calentamiento', 'r', 'Dead_Bug', '', '', 0, MET.warmup],
  ['Superman', 'Calentamiento', 'r', 'Superman', '', '', 0, MET.warmup],
  ['Molinos (windmills)', 'Calentamiento', 'r', 'Windmills', '', '', 0, MET.warmup],
  // Estiramientos (v0.6), por tiempo
  ['Estiramiento de isquiotibiales', 'Estiramientos', 't', 'Hamstring_Stretch', '', '', 0, MET.stretch],
  ['Estiramiento de cuádriceps', 'Estiramientos', 't', 'Quad_Stretch', '', '', 0, MET.stretch],
  ['Estiramiento de flexores de cadera', 'Estiramientos', 't', 'Kneeling_Hip_Flexor', '', '', 0, MET.stretch],
  ['Estiramiento de glúteo', 'Estiramientos', 't', 'Lying_Glute', '', '', 0, MET.stretch],
  ['Estiramiento de aductores (mariposa)', 'Estiramientos', 't', 'Butterfly', '', '', 0, MET.stretch],
  ['Estiramiento de gemelos', 'Estiramientos', 't', 'Calf_Stretch_Hands_Against_Wall', '', '', 0, MET.stretch],
  ['Estiramiento de pecho', 'Estiramientos', 't', 'Dynamic_Chest_Stretch', '', '', 0, MET.stretch],
  ['Estiramiento de hombro', 'Estiramientos', 't', 'Shoulder_Stretch', '', '', 0, MET.stretch],
  ['Estiramiento de tríceps', 'Estiramientos', 't', 'Triceps_Stretch', '', '', 0, MET.stretch],
  ['Estiramiento de dorsales', 'Estiramientos', 't', 'Overhead_Lat', '', '', 0, MET.stretch],
  ['Estiramiento de espalda alta', 'Estiramientos', 't', 'Upper_Back_Stretch', '', '', 0, MET.stretch],
  ['Estiramiento de antebrazos y muñecas', 'Estiramientos', 't', 'Kneeling_Forearm_Stretch', '', '', 0, MET.stretch],
  ['Postura del niño', 'Estiramientos', 't', 'Childs_Pose', '', '', 0, MET.stretch],
  ['Torsión de columna', 'Estiramientos', 't', 'Spinal_Stretch', '', '', 0, MET.stretch],
  ['Estiramiento de cintilla iliotibial', 'Estiramientos', 't', 'IT_Band_and_Glute_Stretch', '', '', 0, MET.stretch],
  ['Estiramiento del corredor', 'Estiramientos', 't', 'Runners_Stretch', '', '', 0, MET.stretch],
  ['Tocar las puntas de los pies', 'Estiramientos', 't', 'Standing_Toe_Touches', '', '', 0, MET.stretch],
  ['Estiramiento de cuello', 'Estiramientos', 't', 'Chin_To_Chest_Stretch', '', '', 0, MET.stretch],
];
// Movimientos que comparten récord aunque sean ejercicios distintos (con y sin lastre),
// para estimar repeticiones con otros pesos a partir de cualquiera de ellos.
const FAMILY = {
  'Dominadas': 'pullup', 'Dominadas con lastre': 'pullup', 'Dominadas negativas': 'pullup',
  'Fondos': 'dip', 'Fondos con lastre': 'dip',
  'Flexiones': 'pushup', 'Flexiones con lastre': 'pushup',
  'Dominadas supinas (chin ups)': 'chinup', 'Dominadas supinas con lastre': 'chinup',
};
// Ejercicios por defecto añadidos en cada versión (para dárselos también a quien ya tenía datos)
const NEW_DEFAULTS = { 5: ['Dominadas supinas con lastre'],
  6: ['Saltos de tijera (jumping jacks)', 'Skipping (rodillas al pecho)', 'Talones al glúteo', 'Escaladores (mountain climbers)', 'Círculos de brazos', 'Círculos de hombros', 'Círculos de cadera', 'Círculos de rodillas', 'Círculos de muñecas', 'Círculos de tobillos', 'Rotaciones de tronco', 'Inchworm (gusano)', 'Estiramiento más grande del mundo', 'Gato-camello', 'Separaciones con banda (band pull-apart)', 'Retracciones escapulares en barra', 'Puente de glúteo', 'Dead bug', 'Superman', 'Molinos (windmills)', 'Estiramiento de isquiotibiales', 'Estiramiento de cuádriceps', 'Estiramiento de flexores de cadera', 'Estiramiento de glúteo', 'Estiramiento de aductores (mariposa)', 'Estiramiento de gemelos', 'Estiramiento de pecho', 'Estiramiento de hombro', 'Estiramiento de tríceps', 'Estiramiento de dorsales', 'Estiramiento de espalda alta', 'Estiramiento de antebrazos y muñecas', 'Postura del niño', 'Torsión de columna', 'Estiramiento de cintilla iliotibial', 'Estiramiento del corredor', 'Tocar las puntas de los pies', 'Estiramiento de cuello'] };

// Sinónimos para el buscador (español e inglés) según el movimiento
const FAM_ALIASES = {
  pullup: 'dominada pull up ups pullup pullups', chinup: 'dominada supina chin up ups chinup chinups',
  dip: 'fondo dip dips', benchdip: 'fondo banco bench dip dips', pushup: 'flexion push up ups pushup pushups',
  muscleup: 'muscle up', hspu: 'pino handstand push up hspu', pike: 'pike push up', invrow: 'remo invertido australianas inverted row',
  pistol: 'pistol squat sentadilla',
};
const WEIGHTED_ALIASES = 'lastre lastrado lastrada lastrados lastradas con peso weighted';

// Reconocimiento de movimientos de calistenia por el nombre (español o inglés), para ejercicios
// del catálogo o creados por ti: % de peso corporal, músculos y familia (para el estimador).
// El orden importa: gana la primera regla que encaje. Máquinas, poleas y barras no entran.
const MOVES = [
  [/machine|m[aá]quina|pulldown|jal[oó]n|cable|polea|barbell|smith|leverage|squat|sentadilla|crunch|stretch|estiramiento|throw|hip flexion/i, null],
  [/band.?assisted|asistid/i, { fam: 'pullup', bw: 0.7, p: 'back', s: 'biceps,forearms,shoulders,traps' }],
  [/muscle.?up/i, { fam: 'muscleup', bw: 1, p: 'back,triceps', s: 'biceps,chest,shoulders,forearms,abs' }],
  [/chin.?ups?\b|\bchins?\b|dominadas? supinas?/i, { fam: 'chinup', bw: 1, p: 'back,biceps', s: 'forearms,shoulders,traps' }],
  [/pull.?ups?\b|\bpullups?\b|dominad/i, { fam: 'pullup', bw: 1, p: 'back', s: 'biceps,forearms,shoulders,traps' }],
  [/bench.?dips?\b|fondos? en banco/i, { fam: 'benchdip', bw: 0.6, p: 'triceps', s: 'chest,shoulders' }],
  [/\bdips?\b|\bfondos?\b/i, { fam: 'dip', bw: 1, p: 'chest,triceps', s: 'shoulders' }],
  [/handstand.?push|\bhspu\b|flexi[oó]n(es)? en pino/i, { fam: 'hspu', bw: 1, p: 'shoulders,triceps', s: 'traps' }],
  [/pike.?push|pike.?ups?\b|flexi[oó]n(es)? pike/i, { fam: 'pike', bw: 0.75, p: 'shoulders', s: 'triceps,traps' }],
  [/inverted.?row|australian|remo invertido/i, { fam: 'invrow', bw: 0.6, p: 'back', s: 'biceps,shoulders,traps' }],
  [/(knee|rodilla).*(push|flexi)|(push.?ups?|flexiones|flexión).*(knee|rodilla)/i, { fam: 'pushup', bw: 0.49, p: 'chest', s: 'triceps,shoulders' }],
  [/incline.?push|flexiones inclinad/i, { fam: 'pushup', bw: 0.41, p: 'chest', s: 'triceps,shoulders' }],
  [/decline.?push|feet.?elevated|flexiones declinad/i, { fam: 'pushup', bw: 0.74, p: 'chest,shoulders', s: 'triceps' }],
  [/push.?ups?\b|\bpushups?\b|\bflexiones\b|\bflexión\b/i, { fam: 'pushup', bw: 0.64, p: 'chest', s: 'triceps,shoulders,abs' }],
  [/\bpistol\b/i, { fam: 'pistol', bw: 0.88, p: 'quads,glutes', s: 'hams,abs' }],
];
// Devuelve la regla que corresponde al nombre, o null
function moveOf(name) {
  for (const [re, rule] of MOVES) if (re.test(name)) return rule;
  return null;
}

const exFromData = ([name, group, kind, img, p, s, bw, met, cardio]) => ({
  name, group, kind, img: img || '',
  mus: { p: p ? p.split(',') : [], s: s ? s.split(',') : [] },
  bw: bw || 0, met: met || 0, cardio: cardio || '',
});

// ---------- Mapa corporal (polígonos SVG, vista frontal 1000×2000 y trasera 1000×2220) ----------
const BODY = {"front": [["chest", ["518 416 510 551 580 580 678 555 706 473 620 416", "298 465 314 555 408 580 482 551 478 420 376 420"]], ["obliques", ["686 633 673 571 588 596 600 641 604 833 657 788 665 698", "339 784 331 718 310 633 322 571 408 592 392 633 392 837"]], ["abs", ["563 592 580 641 584 780 584 927 563 984 551 1041 514 1078 510 845 506 673 510 571", "437 588 486 571 490 673 486 845 482 1073 445 1037 408 914 408 784 412 645"]], ["biceps", ["167 682 180 714 229 661 290 539 278 494 204 559", "714 494 702 547 763 661 816 718 829 690 788 555"]], ["triceps", ["694 555 694 616 759 727 776 702 755 673", "224 694 298 555 298 608 229 731"]], ["neck", ["555 237 506 335 506 392 616 400 706 449 694 367 633 351 584 306", "290 449 302 371 363 351 412 302 445 245 490 339 486 392 380 396"]], ["front-deltoids", ["784 531 796 478 792 412 759 380 710 363 722 429 714 473", "282 473 212 531 200 478 204 408 245 371 286 371 269 433"]], ["head", ["424 29 400 118 420 196 461 233 498 253 547 224 576 192 592 102 571 24 498 0"]], ["abductors", ["527 1102 543 1249 600 1102 620 1000 649 943 600 927 567 1045", "478 1106 449 1253 420 1159 404 1131 396 1073 380 1024 347 939 396 922 416 992 437 1053"]], ["quadriceps", ["347 988 371 1082 371 1278 343 1371 310 1327 294 1200 282 1114 294 1008 322 947", "633 1057 645 1000 669 947 702 1012 710 1118 682 1331 653 1376 624 1286 620 1114", "388 1294 384 1122 412 1184 445 1294 429 1351 400 1461 363 1465 355 1400", "596 1457 555 1290 608 1139 612 1302 641 1396 629 1465", "327 1384 265 1457 257 1367 257 1273 269 1143 294 1335", "718 1131 739 1241 739 1404 727 1457 665 1384 702 1335"]], ["knees", ["339 1400 347 1433 355 1473 363 1510 351 1567 298 1567 273 1527 273 1473 302 1441", "657 1400 722 1478 722 1522 698 1571 649 1567 629 1510"]], ["calves", ["714 1604 735 1535 767 1612 796 1678 784 1878 796 1955 747 1955", "249 1947 278 1649 282 1604 261 1543 249 1576 224 1616 208 1678 220 1882 208 1955", "727 1951 698 1592 653 1584 641 1624 641 1653 657 1771", "355 1584 359 1624 359 1669 351 1722 351 1767 322 1820 306 1873 269 1947 273 1878 282 1804 286 1755 290 1698 298 1641 302 1588"]], ["forearm", ["61 886 102 751 147 702 163 743 192 735 45 976 0 1000", "845 698 833 735 800 731 951 984 1000 1004 935 894 898 763", "776 722 776 776 804 841 853 898 922 1012 947 996", "69 1012 135 906 188 841 216 771 212 718 49 988"]]], "back": [["head", ["506 0 460 9 409 55 404 128 451 200 557 200 591 136 596 47 557 13"]], ["trapezius", ["447 217 477 217 472 383 477 647 383 532 353 409 311 366 391 332 438 272", "523 217 557 217 566 272 609 328 689 366 647 404 617 532 523 647 532 383"]], ["back-deltoids", ["294 370 230 391 174 443 183 536 243 494 272 464", "711 370 783 396 826 447 817 536 749 489 723 451"]], ["upper-back", ["311 387 281 489 285 553 340 753 472 711 472 664 366 540 336 413", "689 387 719 494 715 562 660 753 528 711 528 664 634 545 664 417"]], ["triceps", ["268 498 179 557 145 723 166 817 217 638 268 557", "736 502 821 557 860 732 834 821 779 630 732 557", "268 583 268 685 230 753 191 774 226 655", "728 583 770 647 804 774 766 753 728 689"]], ["lower-back", ["477 728 345 770 353 834 494 1021 468 830", "523 728 655 770 647 834 506 1021 532 838"]], ["forearm", ["864 757 911 834 932 940 1000 1064 962 1043 881 894 843 838", "136 757 89 838 68 936 0 1064 38 1043 123 885 157 830", "813 796 774 779 791 847 911 1038 932 1089 945 1047", "187 796 221 779 209 843 94 1030 68 1085 51 1047"]], ["gluteal", ["447 996 302 1085 298 1187 315 1260 472 1213 494 1149", "553 991 511 1145 523 1209 681 1260 698 1191 694 1085"]], ["adductor", ["481 1230 447 1230 413 1255 451 1443 485 1357 489 1294", "519 1226 557 1234 591 1260 549 1443 519 1362 511 1294"]], ["hamstring", ["289 1221 311 1294 366 1260 353 1353 345 1502 294 1583 289 1468 277 1413 272 1315", "715 1217 694 1289 638 1260 655 1366 664 1502 711 1583 715 1477 728 1421 736 1319", "387 1255 443 1460 404 1668 362 1528 370 1353", "617 1255 634 1362 643 1532 600 1668 562 1464"]], ["knees", ["345 1532 311 1591 336 1664 374 1626", "664 1536 630 1630 668 1664 694 1591"]], ["calves", ["294 1604 285 1672 247 1796 238 1928 255 1970 285 1932 298 1800 319 1711 319 1668", "374 1651 353 1677 332 1719 311 1804 302 1919 340 2000 387 1906 391 1689", "630 1651 613 1685 617 1906 664 1996 706 1919 689 1796 668 1702", "706 1604 723 1685 757 1791 766 1928 745 1966 723 1936 706 1796 681 1681"]], ["left-soleus", ["285 1957 302 1957 336 2017 306 2200 285 2136 268 1983"]], ["right-soleus", ["698 1957 719 1957 736 1983 719 2132 702 2196 672 2021"]]]};
