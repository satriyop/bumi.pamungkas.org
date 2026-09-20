import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Shield, 
  Sword, 
  Heart, 
  Sparkles, 
  Flame, 
  Crosshair, 
  Zap, 
  Volume2, 
  VolumeX, 
  Compass,
  Bomb,
  Wind,
  Sun,
  Moon
} from 'lucide-react';

// World dimensions
const WORLD_W = 2400;
const WORLD_H = 2400;

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: number; // angle in radians
  hearts: number; // in quarters (e.g. 20 = 5 full hearts)
  maxHearts: number;
  bonusHearts: number;
  stamina: number; // 0..100
  maxStamina: number;
  isAttacking: boolean;
  attackTimer: number;
  chargeTimer: number; // for Spin Attack
  isSpinAttacking: boolean;
  spinTimer: number;
  isBlocking: boolean;
  parryWindow: number; // frames where parry is active
  isAiming: boolean;
  isDashing: boolean;
  dashTimer: number;
  isGliding: boolean;
  invulnerableTimer: number;
  apples: number;
  meat: number;
  cookedMeals: { name: string; type: 'heal' | 'stamina' | 'attack'; bonus: number }[];
  arrows: number;
  rupees: number;
  korokSeeds: number;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fromPlayer: boolean;
  isLaser?: boolean;
  damage: number;
  life: number;
}

interface Enemy {
  id: string;
  type: 'chuchu' | 'bokoblin' | 'archer' | 'moblin' | 'guardian_stalker';
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  speed: number;
  attackCooldown: number;
  attackWindup: number;
  isAttacking: boolean;
  state: 'patrol' | 'chase' | 'attack' | 'stunned';
  patrolTarget: { x: number; y: number };
  laserChargeTimer?: number;
  targetAngle?: number;
  stunTimer?: number;
  legCycle?: number;
}

interface Animal {
  id: string;
  type: 'rabbit' | 'deer';
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  fleeTimer: number;
}

interface TreeItem {
  id: string;
  x: number;
  y: number;
  hasApples: boolean;
  chopped: boolean;
}

interface GrassTuft {
  id: string;
  x: number;
  y: number;
  cut: boolean;
  respawnTimer: number;
}

interface ClayPot {
  id: string;
  x: number;
  y: number;
  broken: boolean;
  respawnTimer: number;
}

interface KorokSpot {
  id: string;
  x: number;
  y: number;
  found: boolean;
  prompt: string;
  popupTimer: number;
}

interface RemoteBombItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pulseTimer: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface DroppedItem {
  id: string;
  type: 'green_rupee' | 'blue_rupee' | 'red_rupee' | 'apple' | 'meat' | 'arrow' | 'fairy' | 'ancient_core';
  x: number;
  y: number;
  life: number;
}

interface ZeldaAdventureArenaProps {
  isDarkMode?: boolean;
  playSound?: (type: 'swim' | 'coin' | 'hit' | 'tech') => void;
}

export const ZeldaAdventureArena: React.FC<ZeldaAdventureArenaProps> = ({ isDarkMode = true, playSound }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'victory'>('intro');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Time of day (0..1: 0 = dawn, 0.25 = noon, 0.5 = sunset, 0.75 = night)
  const timeOfDayRef = useRef(0.25);
  const [currentTimePhase, setCurrentTimePhase] = useState<'Pagi' | 'Siang' | 'Senja' | 'Malam'>('Siang');

  // Flurry Rush (Bullet Time) State
  const flurryRushTimerRef = useRef(0);
  const [flurryActive, setFlurryActive] = useState(false);

  // Cooking Modal State
  const [cookingModal, setCookingModal] = useState<{
    isOpen: boolean;
    stage: 'cooking' | 'ready';
    dishName: string;
    dishDesc: string;
    icon: string;
  } | null>(null);

  // Player state (Master Link / Mas Bumi)
  const playerRef = useRef<Player>({
    x: 520,
    y: 520,
    vx: 0,
    vy: 0,
    facing: 0,
    hearts: 20, // 5 full hearts (4 quarters each)
    maxHearts: 20,
    bonusHearts: 0,
    stamina: 100,
    maxStamina: 100,
    isAttacking: false,
    attackTimer: 0,
    chargeTimer: 0,
    isSpinAttacking: false,
    spinTimer: 0,
    isBlocking: false,
    parryWindow: 0,
    isAiming: false,
    isDashing: false,
    dashTimer: 0,
    isGliding: false,
    invulnerableTimer: 0,
    apples: 5,
    meat: 2,
    cookedMeals: [
      { name: 'Hearty Meat Skewer', type: 'heal', bonus: 8 }
    ],
    arrows: 25,
    rupees: 100,
    korokSeeds: 0
  });

  // UI Mirror of Player
  const [hudStats, setHudStats] = useState({
    hearts: 20,
    maxHearts: 20,
    bonusHearts: 0,
    stamina: 100,
    apples: 5,
    meat: 2,
    mealsCount: 1,
    arrows: 25,
    rupees: 100,
    korokSeeds: 0,
    bossHp: 0,
    bossMaxHp: 800,
    nearCampfire: false,
    nearCookingPot: false,
    nearKorok: null as KorokSpot | null,
    hasBombActive: false,
    message: null as string | null
  });

  // Entities
  const enemiesRef = useRef<Enemy[]>([]);
  const animalsRef = useRef<Animal[]>([]);
  const treesRef = useRef<TreeItem[]>([]);
  const grassRef = useRef<GrassTuft[]>([]);
  const potsRef = useRef<ClayPot[]>([]);
  const koroksRef = useRef<KorokSpot[]>([]);
  const activeBombRef = useRef<RemoteBombItem | null>(null);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const dropsRef = useRef<DroppedItem[]>([]);

  // Input states
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const touchDpadRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Web Audio Synthesizer for Authentic Zelda Sfx
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playZeldaSfx = useCallback((type: 
    'slash' | 'spin' | 'arrow' | 'parry' | 'hit' | 'flurry_warp' | 
    'bomb_drop' | 'bomb_explode' | 'guardian_beep' | 'guardian_laser' | 
    'cook_jingle' | 'cook_success' | 'secret_chime' | 'korok_yahaha' | 
    'rupee_get' | 'fairy_heal' | 'glide_wind' | 'victory'
  ) => {
    if (!soundEnabled) return;
    try {
      if (playSound) {
        if (type === 'rupee_get') playSound('coin');
        else if (type === 'hit') playSound('hit');
        else if (type === 'secret_chime') playSound('tech');
      }

      const ctx = getAudioCtx();
      const now = ctx.currentTime;

      if (type === 'slash') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'spin') {
        // 360 degree wind whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.35);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'arrow') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'parry') {
        // Metallic clink + bright bell
        [1760, 2200, 880].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
        });
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'flurry_warp') {
        // Bullet time slow-down pitch drop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.4);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'bomb_drop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'bomb_explode') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'guardian_beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'guardian_laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'secret_chime') {
        // Authentic 8-note rising Zelda secret sound!
        // G5, G#5, A5, A#5, B5, C6, C#6, D6
        const notes = [784, 830, 880, 932, 988, 1046, 1108, 1174];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.25, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.2);
        });
      } else if (type === 'korok_yahaha') {
        // Two cute high chimes + chirp
        [1318, 1568].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.25, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.18);
        });
      } else if (type === 'cook_jingle') {
        // Zelda cooking pot bouncy marimba
        const cookNotes = [523, 659, 587, 783, 659];
        cookNotes.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.12);
          gain.gain.setValueAtTime(0.25, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.15);
        });
      } else if (type === 'cook_success') {
        // Item discovery fanfare (Da-na-na-NAAAA!)
        const fanfare = [523, 659, 783, 1046];
        fanfare.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const t = now + i * 0.15;
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + (i === 3 ? 0.6 : 0.2));
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + (i === 3 ? 0.6 : 0.2));
        });
      } else if (type === 'rupee_get') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(1600, now + 0.05);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'fairy_heal') {
        [880, 1100, 1320, 1760].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = now + i * 0.08;
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.25);
        });
      } else if (type === 'glide_wind') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'victory') {
        // Grand fanfare
        [523, 659, 783, 1046, 1318].forEach((f, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          const t = now + idx * 0.16;
          o.frequency.setValueAtTime(f, t);
          g.gain.setValueAtTime(0.35, t);
          g.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(t);
          o.stop(t + 0.45);
        });
      }
    } catch {
      // Audio fallback
    }
  }, [soundEnabled, getAudioCtx]);

  // Initialize Zelda World (Biome, Enemies, Items, Koroks, Pots, Grass)
  const initWorld = useCallback(() => {
    // 1. Trees
    const trees: TreeItem[] = [];
    for (let i = 0; i < 70; i++) {
      trees.push({
        id: `tree_${i}`,
        x: Math.random() * (WORLD_W - 240) + 120,
        y: Math.random() * (WORLD_H - 240) + 120,
        hasApples: Math.random() > 0.35,
        chopped: false
      });
    }
    treesRef.current = trees;

    // 2. Interactive Grass Tufts (Rumput Ilalang yang bisa ditebas)
    const grass: GrassTuft[] = [];
    for (let i = 0; i < 120; i++) {
      grass.push({
        id: `grass_${i}`,
        x: Math.random() * (WORLD_W - 200) + 100,
        y: Math.random() * (WORLD_H - 200) + 100,
        cut: false,
        respawnTimer: 0
      });
    }
    grassRef.current = grass;

    // 3. Ceramic Clay Pots (Kendi Tanah Liat di Kuil & Perkemahan)
    const pots: ClayPot[] = [];
    const potLocations = [
      { x: 530, y: 470 }, { x: 550, y: 475 }, { x: 470, y: 530 },
      { x: 2040, y: 2040 }, { x: 2070, y: 2040 }, { x: 2320, y: 2050 },
      { x: 2050, y: 2330 }, { x: 2330, y: 2330 }, { x: 1350, y: 550 },
      { x: 1380, y: 570 }, { x: 600, y: 1450 }
    ];
    potLocations.forEach((pos, idx) => {
      pots.push({
        id: `pot_${idx}`,
        x: pos.x,
        y: pos.y,
        broken: false,
        respawnTimer: 0
      });
    });
    potsRef.current = pots;

    // 4. Hidden Korok Puzzle Locations ("Yahaha! You found me!")
    const koroks: KorokSpot[] = [
      { id: 'korok_1', x: 280, y: 280, found: false, prompt: '🌿 Angkat Batu Mencurigakan', popupTimer: 0 },
      { id: 'korok_2', x: 1750, y: 350, found: false, prompt: '🌸 Periksa Lingkaran Bunga Hutan', popupTimer: 0 },
      { id: 'korok_3', x: 450, y: 1850, found: false, prompt: '💧 Selam Mata Air Danau Klaten', popupTimer: 0 },
      { id: 'korok_4', x: 1850, y: 1550, found: false, prompt: '⛰️ Daki Puncak Ngarai Bebatuan', popupTimer: 0 }
    ];
    koroksRef.current = koroks;

    // 5. Animals (Deer & Rabbits)
    const animals: Animal[] = [];
    for (let i = 0; i < 18; i++) {
      animals.push({
        id: `animal_${i}`,
        type: i % 2 === 0 ? 'rabbit' : 'deer',
        x: Math.random() * 1100 + 150,
        y: Math.random() * 1100 + 150,
        vx: 0,
        vy: 0,
        hp: i % 2 === 0 ? 15 : 35,
        fleeTimer: 0
      });
    }
    animalsRef.current = animals;

    // 6. Enemies (Chuchu, Bokoblin, Archer, Moblin, Guardian Stalker)
    const enemies: Enemy[] = [];

    // Chuchu Slimes (Plains)
    for (let i = 0; i < 7; i++) {
      enemies.push({
        id: `chuchu_${i}`,
        type: 'chuchu',
        name: 'Chuchu Hijau',
        x: Math.random() * 800 + 200,
        y: Math.random() * 800 + 200,
        vx: 0,
        vy: 0,
        hp: 25,
        maxHp: 25,
        speed: 1.1,
        attackCooldown: 0,
        attackWindup: 0,
        isAttacking: false,
        state: 'patrol',
        patrolTarget: { x: Math.random() * 800 + 200, y: Math.random() * 800 + 200 }
      });
    }

    // Bokoblin Scouts in Forest
    for (let i = 0; i < 6; i++) {
      enemies.push({
        id: `boko_${i}`,
        type: 'bokoblin',
        name: 'Bokoblin Merah',
        x: Math.random() * 800 + 1300,
        y: Math.random() * 800 + 200,
        vx: 0,
        vy: 0,
        hp: 50,
        maxHp: 50,
        speed: 1.8,
        attackCooldown: 0,
        attackWindup: 0,
        isAttacking: false,
        state: 'patrol',
        patrolTarget: { x: Math.random() * 800 + 1300, y: Math.random() * 800 + 200 }
      });
    }

    // Skeleton Archers
    for (let i = 0; i < 5; i++) {
      enemies.push({
        id: `archer_${i}`,
        type: 'archer',
        name: 'Skeleton Archer',
        x: Math.random() * 800 + 1300,
        y: Math.random() * 800 + 300,
        vx: 0,
        vy: 0,
        hp: 45,
        maxHp: 45,
        speed: 1.4,
        attackCooldown: 0,
        attackWindup: 0,
        isAttacking: false,
        state: 'patrol',
        patrolTarget: { x: Math.random() * 800 + 1300, y: Math.random() * 800 + 300 }
      });
    }

    // Moblin Berserker in Canyon
    for (let i = 0; i < 4; i++) {
      enemies.push({
        id: `moblin_${i}`,
        type: 'moblin',
        name: 'Moblin Berserker',
        x: Math.random() * 800 + 1300,
        y: Math.random() * 800 + 1300,
        vx: 0,
        vy: 0,
        hp: 130,
        maxHp: 130,
        speed: 1.5,
        attackCooldown: 0,
        attackWindup: 0,
        isAttacking: false,
        state: 'patrol',
        patrolTarget: { x: Math.random() * 800 + 1300, y: Math.random() * 800 + 1300 }
      });
    }

    // ANCIENT GUARDIAN STALKER (BOSS UTAMA DI KUIL KUNO)
    enemies.push({
      id: 'guardian_boss',
      type: 'guardian_stalker',
      name: 'Ancient Guardian Leviathan',
      x: 2180,
      y: 2180,
      vx: 0,
      vy: 0,
      hp: 800,
      maxHp: 800,
      speed: 1.6,
      attackCooldown: 0,
      attackWindup: 0,
      isAttacking: false,
      state: 'patrol',
      patrolTarget: { x: 2180, y: 2180 },
      laserChargeTimer: 0,
      targetAngle: 0,
      stunTimer: 0,
      legCycle: 0
    });

    enemiesRef.current = enemies;
    projectilesRef.current = [];
    particlesRef.current = [];
    dropsRef.current = [];
    activeBombRef.current = null;
  }, []);

  // Start / Restart Game
  const handleStartGame = () => {
    playerRef.current = {
      x: 520,
      y: 520,
      vx: 0,
      vy: 0,
      facing: 0,
      hearts: 20,
      maxHearts: 20,
      bonusHearts: 0,
      stamina: 100,
      maxStamina: 100,
      isAttacking: false,
      attackTimer: 0,
      chargeTimer: 0,
      isSpinAttacking: false,
      spinTimer: 0,
      isBlocking: false,
      parryWindow: 0,
      isAiming: false,
      isDashing: false,
      dashTimer: 0,
      isGliding: false,
      invulnerableTimer: 0,
      apples: 5,
      meat: 2,
      cookedMeals: [
        { name: 'Hearty Meat Skewer', type: 'heal', bonus: 8 }
      ],
      arrows: 25,
      rupees: 100,
      korokSeeds: 0
    };
    initWorld();
    setGameState('playing');
    playZeldaSfx('secret_chime');
  };

  // Combat Handlers
  const handleAttack = () => {
    const p = playerRef.current;
    if (p.isAttacking || p.isDashing || p.isGliding) return;

    p.isAttacking = true;
    p.attackTimer = 16;
    playZeldaSfx('slash');

    // Check hit against grass, pots, enemies, animals
    checkPlayerMeleeHits(p, false);
  };

  // Spin Attack (Tebasan Putar 360 derajat)
  const handleSpinAttack = () => {
    const p = playerRef.current;
    if (p.stamina < 25) return;
    p.stamina = Math.max(0, p.stamina - 25);
    p.isSpinAttacking = true;
    p.spinTimer = 22;
    playZeldaSfx('spin');

    // 360 degree hit
    checkPlayerMeleeHits(p, true);
  };

  // Melee Hit Detection
  const checkPlayerMeleeHits = (p: Player, isSpin: boolean) => {
    const hitRadius = isSpin ? 75 : 55;
    const hitDamage = isSpin ? 45 : 24;

    // Cut Grass
    grassRef.current.forEach(g => {
      if (!g.cut) {
        const d = Math.hypot(g.x - p.x, g.y - p.y);
        if (d < hitRadius) {
          g.cut = true;
          g.respawnTimer = 600; // 10 seconds
          // Grass drop: rupee, arrows, or fairy!
          const roll = Math.random();
          if (roll < 0.35) {
            dropsRef.current.push({
              id: `drop_${Date.now()}_${Math.random()}`,
              type: roll < 0.2 ? 'green_rupee' : roll < 0.32 ? 'blue_rupee' : 'red_rupee',
              x: g.x,
              y: g.y,
              life: 400
            });
          } else if (roll > 0.94) {
            // Rare Healing Fairy!
            dropsRef.current.push({
              id: `fairy_${Date.now()}`,
              type: 'fairy',
              x: g.x,
              y: g.y,
              life: 500
            });
          }
        }
      }
    });

    // Smash Clay Pots
    potsRef.current.forEach(pot => {
      if (!pot.broken) {
        const d = Math.hypot(pot.x - p.x, pot.y - p.y);
        if (d < hitRadius) {
          pot.broken = true;
          pot.respawnTimer = 800;
          playZeldaSfx('hit');
          // Spawn clay particles
          for (let k = 0; k < 8; k++) {
            particlesRef.current.push({
              x: pot.x,
              y: pot.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: '#d97706',
              size: 4,
              life: 25,
              maxLife: 25
            });
          }
          // Drop rupees / arrows
          dropsRef.current.push({
            id: `potdrop_${Date.now()}_${Math.random()}`,
            type: Math.random() > 0.5 ? 'blue_rupee' : 'arrow',
            x: pot.x,
            y: pot.y,
            life: 450
          });
        }
      }
    });

    // Hit Enemies
    enemiesRef.current.forEach(e => {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      let canHit = false;
      if (isSpin) {
        canHit = d < hitRadius + 20;
      } else {
        const angleToEnemy = Math.atan2(e.y - p.y, e.x - p.x);
        let diff = Math.abs(angleToEnemy - p.facing);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        canHit = d < hitRadius + 15 && diff < 1.1;
      }

      if (canHit) {
        e.hp -= hitDamage;
        playZeldaSfx('hit');

        // Knockback
        const pushAngle = Math.atan2(e.y - p.y, e.x - p.x);
        e.vx += Math.cos(pushAngle) * (isSpin ? 7 : 4);
        e.vy += Math.sin(pushAngle) * (isSpin ? 7 : 4);

        // Blood / Spark Particles
        for (let k = 0; k < 6; k++) {
          particlesRef.current.push({
            x: e.x,
            y: e.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            color: '#38bdf8',
            size: 3,
            life: 20,
            maxLife: 20
          });
        }
      }
    });

    // Hit Animals (Hunting)
    animalsRef.current.forEach(a => {
      const d = Math.hypot(a.x - p.x, a.y - p.y);
      if (d < hitRadius) {
        a.hp -= hitDamage;
        playZeldaSfx('hit');
        if (a.hp <= 0) {
          dropsRef.current.push({
            id: `meat_${Date.now()}`,
            type: 'meat',
            x: a.x,
            y: a.y,
            life: 600
          });
        }
      }
    });
  };

  // Shoot Bow & Arrow
  const handleShootArrow = () => {
    const p = playerRef.current;
    if (p.arrows <= 0 || p.isGliding) return;

    p.arrows--;
    playZeldaSfx('arrow');

    const speed = 12;
    projectilesRef.current.push({
      id: `arrow_${Date.now()}_${Math.random()}`,
      x: p.x + Math.cos(p.facing) * 16,
      y: p.y + Math.sin(p.facing) * 16,
      vx: Math.cos(p.facing) * speed,
      vy: Math.sin(p.facing) * speed,
      fromPlayer: true,
      damage: 32,
      life: 70
    });
  };

  // Dash / Dodge Roll (with Flurry Rush Trigger!)
  const handleDash = () => {
    const p = playerRef.current;
    if (p.isDashing || p.stamina < 15 || p.isGliding) return;

    p.stamina = Math.max(0, p.stamina - 15);
    p.isDashing = true;
    p.dashTimer = 16;
    p.invulnerableTimer = 16;
    playZeldaSfx('slash');

    // Move in facing direction
    p.vx = Math.cos(p.facing) * 9;
    p.vy = Math.sin(p.facing) * 9;

    // Check if dodging during enemy attack windup => TRIGGER FLURRY RUSH!
    const nearAttackingEnemy = enemiesRef.current.some(e => {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      return d < 120 && (e.attackWindup > 0 || (e.laserChargeTimer && e.laserChargeTimer > 0));
    });

    if (nearAttackingEnemy && flurryRushTimerRef.current <= 0) {
      flurryRushTimerRef.current = 90; // 1.5s real-time
      setFlurryActive(true);
      playZeldaSfx('flurry_warp');
      setHudStats(prev => ({ ...prev, message: '⚡ FLURRY RUSH! TEKAN TEBAS SECEPATNYA!' }));
    }
  };

  // Shield Parry
  const handleShieldDown = () => {
    const p = playerRef.current;
    p.isBlocking = true;
    p.parryWindow = 14; // First 14 frames count as a Perfect Parry!
  };

  const handleShieldUp = () => {
    const p = playerRef.current;
    p.isBlocking = false;
    p.parryWindow = 0;
  };

  // Sheikah Rune: Remote Bomb (Bom Biru Kuno)
  const handleRemoteBomb = () => {
    const p = playerRef.current;
    if (activeBombRef.current) {
      // Detonate active bomb
      const b = activeBombRef.current;
      playZeldaSfx('bomb_explode');

      // Blue shockwave particles
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2;
        particlesRef.current.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(ang) * 6,
          vy: Math.sin(ang) * 6,
          color: '#38bdf8',
          size: 6,
          life: 30,
          maxLife: 30
        });
      }

      // Damage enemies & knock back
      enemiesRef.current.forEach(e => {
        const d = Math.hypot(e.x - b.x, e.y - b.y);
        if (d < 110) {
          e.hp -= 65;
          const ang = Math.atan2(e.y - b.y, e.x - b.x);
          e.vx += Math.cos(ang) * 9;
          e.vy += Math.sin(ang) * 9;
        }
      });

      // Break pots & cut grass
      potsRef.current.forEach(pot => {
        if (!pot.broken && Math.hypot(pot.x - b.x, pot.y - b.y) < 100) {
          pot.broken = true;
          pot.respawnTimer = 800;
        }
      });
      grassRef.current.forEach(g => {
        if (!g.cut && Math.hypot(g.x - b.x, g.y - b.y) < 100) {
          g.cut = true;
          g.respawnTimer = 600;
        }
      });

      activeBombRef.current = null;
      setHudStats(prev => ({ ...prev, hasBombActive: false }));
    } else {
      // Place new bomb
      activeBombRef.current = {
        x: p.x + Math.cos(p.facing) * 20,
        y: p.y + Math.sin(p.facing) * 20,
        vx: Math.cos(p.facing) * 3,
        vy: Math.sin(p.facing) * 3,
        pulseTimer: 0
      };
      playZeldaSfx('bomb_drop');
      setHudStats(prev => ({ ...prev, hasBombActive: true }));
    }
  };

  // Paraglider (Parasut Layang)
  const toggleParaglider = () => {
    const p = playerRef.current;
    if (p.isGliding) {
      p.isGliding = false;
    } else if (p.stamina > 15) {
      p.isGliding = true;
      playZeldaSfx('glide_wind');
    }
  };

  // Korok Discovery
  const handleInteractKorok = () => {
    const p = playerRef.current;
    const spot = koroksRef.current.find(k => !k.found && Math.hypot(k.x - p.x, k.y - p.y) < 70);
    if (spot) {
      spot.found = true;
      spot.popupTimer = 180; // 3 seconds
      p.korokSeeds++;
      playZeldaSfx('secret_chime');
      setTimeout(() => playZeldaSfx('korok_yahaha'), 400);
      setHudStats(prev => ({
        ...prev,
        korokSeeds: p.korokSeeds,
        message: '🍃 YAHAHA! You found me! (+1 Korok Seed)'
      }));
    }
  };

  // Zelda Cooking Pot System
  const handleOpenCooking = () => {
    const p = playerRef.current;
    if (p.meat < 1 && p.apples < 1) {
      setHudStats(prev => ({ ...prev, message: 'Bahan makanan tidak cukup! Cari apel di pohon atau berburu daging.' }));
      return;
    }

    // Determine recipe
    let dishName = 'Baked Apple';
    let dishDesc = 'Apel panggang manis yang memulihkan 2 Hati!';
    let icon = '🍎';
    let bonusHeal = 8; // 2 hearts

    if (p.meat >= 1 && p.apples >= 1) {
      p.meat--;
      p.apples--;
      dishName = 'Hearty Steamed Meat';
      dishDesc = 'Daging lezat dipadukan apel hutan! Memulihkan semua Hati + bonus 1 Hati emas!';
      icon = '🥩';
      bonusHeal = 24;
      p.bonusHearts = Math.min(4, p.bonusHearts + 4);
    } else if (p.meat >= 1) {
      p.meat--;
      dishName = 'Seared Prime Steak';
      dishDesc = 'Steak daging bakar gurih! Memulihkan 4 Hati!';
      icon = '🍖';
      bonusHeal = 16;
    } else {
      p.apples--;
      dishName = 'Simmered Fruit';
      dishDesc = 'Rebusan buah manis yang memulihkan 2 Hati dan Stamina penuh!';
      icon = '🍎';
      bonusHeal = 8;
      p.stamina = p.maxStamina;
    }

    p.cookedMeals.push({ name: dishName, type: 'heal', bonus: bonusHeal });

    // Open cooking animation modal
    setCookingModal({
      isOpen: true,
      stage: 'cooking',
      dishName,
      dishDesc,
      icon
    });
    playZeldaSfx('cook_jingle');

    setTimeout(() => {
      setCookingModal(prev => prev ? { ...prev, stage: 'ready' } : null);
      playZeldaSfx('cook_success');
    }, 1200);
  };

  // Eat cooked meal from pouch
  const handleEatMeal = () => {
    const p = playerRef.current;
    if (p.cookedMeals.length > 0) {
      const meal = p.cookedMeals.pop()!;
      p.hearts = Math.min(p.maxHearts, p.hearts + meal.bonus);
      playZeldaSfx('fairy_heal');
      setHudStats(prev => ({
        ...prev,
        hearts: p.hearts,
        mealsCount: p.cookedMeals.length,
        message: `Makan ${meal.name}! Hati terisi kembali ❤️`
      }));
    } else if (p.apples > 0) {
      p.apples--;
      p.hearts = Math.min(p.maxHearts, p.hearts + 4);
      playZeldaSfx('rupee_get');
      setHudStats(prev => ({
        ...prev,
        hearts: p.hearts,
        apples: p.apples,
        message: 'Makan Apel Segar (+1 Hati)'
      }));
    }
  };

  // Main Game Loop (60 FPS Canvas Engine)
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;

    const update = () => {
      const p = playerRef.current;
      const isBulletTime = flurryRushTimerRef.current > 0;
      const timeScale = isBulletTime ? 0.2 : 1.0;

      // Update time of day (1 full cycle every 4 minutes = 14400 frames)
      timeOfDayRef.current = (timeOfDayRef.current + 0.0001) % 1;
      const tod = timeOfDayRef.current;
      if (tod < 0.2) setCurrentTimePhase('Pagi');
      else if (tod < 0.5) setCurrentTimePhase('Siang');
      else if (tod < 0.75) setCurrentTimePhase('Senja');
      else setCurrentTimePhase('Malam');

      // Update Flurry Rush Timer
      if (flurryRushTimerRef.current > 0) {
        flurryRushTimerRef.current--;
        if (flurryRushTimerRef.current <= 0) {
          setFlurryActive(false);
        }
      }

      // --- PLAYER CONTROLS & PHYSICS ---
      let mx = 0;
      let my = 0;

      if (keysRef.current['w'] || keysRef.current['W'] || keysRef.current['ArrowUp']) my -= 1;
      if (keysRef.current['s'] || keysRef.current['S'] || keysRef.current['ArrowDown']) my += 1;
      if (keysRef.current['a'] || keysRef.current['A'] || keysRef.current['ArrowLeft']) mx -= 1;
      if (keysRef.current['d'] || keysRef.current['D'] || keysRef.current['ArrowRight']) mx += 1;

      // Virtual D-pad input
      if (touchDpadRef.current.dx !== 0 || touchDpadRef.current.dy !== 0) {
        mx = touchDpadRef.current.dx;
        my = touchDpadRef.current.dy;
      }

      // Paragliding mechanics
      if (p.isGliding) {
        p.stamina -= 0.35;
        if (p.stamina <= 0) {
          p.isGliding = false;
        }
      } else if (!p.isDashing && !p.isSpinAttacking && p.stamina < p.maxStamina) {
        p.stamina = Math.min(p.maxStamina, p.stamina + 0.5);
      }

      if (mx !== 0 || my !== 0) {
        const moveSpeed = p.isGliding ? 4.8 : p.isBlocking ? 1.5 : 3.2;
        const mag = Math.hypot(mx, my);
        p.vx = (mx / mag) * moveSpeed;
        p.vy = (my / mag) * moveSpeed;
        p.facing = Math.atan2(my, mx);

        // Wind particles during glide
        if (p.isGliding && Math.random() > 0.5) {
          particlesRef.current.push({
            x: p.x - p.vx * 2 + (Math.random() - 0.5) * 10,
            y: p.y - p.vy * 2 + (Math.random() - 0.5) * 10,
            vx: -p.vx * 0.4,
            vy: -p.vy * 0.4,
            color: '#e2e8f0',
            size: 3,
            life: 18,
            maxLife: 18
          });
        }
      } else {
        p.vx *= 0.75;
        p.vy *= 0.75;
      }

      // Attack & Timers
      if (p.isAttacking) {
        p.attackTimer--;
        if (p.attackTimer <= 0) p.isAttacking = false;
      }
      if (p.isSpinAttacking) {
        p.spinTimer--;
        if (p.spinTimer <= 0) p.isSpinAttacking = false;
      }
      if (p.isDashing) {
        p.dashTimer--;
        if (p.dashTimer <= 0) p.isDashing = false;
      }
      if (p.invulnerableTimer > 0) p.invulnerableTimer--;
      if (p.parryWindow > 0) p.parryWindow--;

      // Move player with world bounds
      p.x = Math.max(40, Math.min(WORLD_W - 40, p.x + p.vx));
      p.y = Math.max(40, Math.min(WORLD_H - 40, p.y + p.vy));

      // --- REMOTE BOMB PHYSICS ---
      if (activeBombRef.current) {
        const b = activeBombRef.current;
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.94;
        b.vy *= 0.94;
        b.pulseTimer++;
      }

      // --- ANIMALS AI ---
      animalsRef.current.forEach(a => {
        const distToPlayer = Math.hypot(a.x - p.x, a.y - p.y);
        if (distToPlayer < 140 || a.fleeTimer > 0) {
          // Flee from player
          const angle = Math.atan2(a.y - p.y, a.x - p.x);
          a.vx = Math.cos(angle) * (a.type === 'rabbit' ? 3.5 : 2.8) * timeScale;
          a.vy = Math.sin(angle) * (a.type === 'rabbit' ? 3.5 : 2.8) * timeScale;
          if (distToPlayer < 140) a.fleeTimer = 60;
          else a.fleeTimer--;
        } else {
          // Wander gently
          if (Math.random() < 0.02) {
            const wanderAng = Math.random() * Math.PI * 2;
            a.vx = Math.cos(wanderAng) * 0.8 * timeScale;
            a.vy = Math.sin(wanderAng) * 0.8 * timeScale;
          }
        }
        a.x = Math.max(100, Math.min(WORLD_W - 100, a.x + a.vx));
        a.y = Math.max(100, Math.min(WORLD_H - 100, a.y + a.vy));
      });

      // Filter dead animals
      animalsRef.current = animalsRef.current.filter(a => a.hp > 0);

      // --- ENEMIES AI & GUARDIAN STALKER ---
      let currentBossHp = 0;
      let currentBossMaxHp = 800;

      enemiesRef.current.forEach(e => {
        if (e.type === 'guardian_stalker') {
          currentBossHp = e.hp;
          currentBossMaxHp = e.maxHp;
        }

        // Stunned check
        if (e.stunTimer && e.stunTimer > 0) {
          e.stunTimer -= timeScale;
          e.vx = 0;
          e.vy = 0;
          return;
        }

        const dist = Math.hypot(p.x - e.x, p.y - e.y);

        if (e.type === 'guardian_stalker') {
          // Guardian Stalker AI with authentic lock-on laser
          e.legCycle = (e.legCycle || 0) + 0.08 * timeScale;
          const seePlayerDist = 550;

          if (dist < seePlayerDist) {
            e.state = 'attack';
            e.targetAngle = Math.atan2(p.y - e.y, p.x - e.x);

            // Guardian repositions to optimal distance (~280px)
            if (dist > 300) {
              e.vx = Math.cos(e.targetAngle) * e.speed * timeScale;
              e.vy = Math.sin(e.targetAngle) * e.speed * timeScale;
            } else if (dist < 180) {
              e.vx = -Math.cos(e.targetAngle) * e.speed * timeScale;
              e.vy = -Math.sin(e.targetAngle) * e.speed * timeScale;
            } else {
              e.vx = 0;
              e.vy = 0;
            }

            // Laser Charge Sequence
            e.laserChargeTimer = (e.laserChargeTimer || 0) + 1 * timeScale;

            // Beep sounds accelerating
            if (e.laserChargeTimer % 20 < 1) {
              playZeldaSfx('guardian_beep');
            }

            // Fire laser at 110 frames
            if (e.laserChargeTimer >= 110) {
              e.laserChargeTimer = 0;
              playZeldaSfx('guardian_laser');

              const laserSpeed = 16;
              const angle = Math.atan2(p.y - e.y, p.x - e.x);
              projectilesRef.current.push({
                id: `guardian_laser_${Date.now()}`,
                x: e.x + Math.cos(angle) * 35,
                y: e.y + Math.sin(angle) * 35,
                vx: Math.cos(angle) * laserSpeed,
                vy: Math.sin(angle) * laserSpeed,
                fromPlayer: false,
                isLaser: true,
                damage: 32, // 8 hearts!
                life: 90
              });
            }
          } else {
            e.state = 'patrol';
            e.laserChargeTimer = 0;
            e.vx = 0;
            e.vy = 0;
          }
        } else if (e.type === 'archer') {
          // Skeleton Archer
          if (dist < 380) {
            e.state = 'chase';
            const ang = Math.atan2(p.y - e.y, p.x - e.x);
            if (dist < 200) {
              e.vx = -Math.cos(ang) * e.speed * timeScale;
              e.vy = -Math.sin(ang) * e.speed * timeScale;
            } else {
              e.vx = 0;
              e.vy = 0;
            }

            e.attackCooldown -= timeScale;
            if (e.attackCooldown <= 0) {
              e.attackCooldown = 90;
              playZeldaSfx('arrow');
              const spd = 9;
              projectilesRef.current.push({
                id: `skel_arrow_${Date.now()}_${Math.random()}`,
                x: e.x,
                y: e.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                fromPlayer: false,
                damage: 8,
                life: 60
              });
            }
          } else {
            e.state = 'patrol';
            e.vx *= 0.9;
            e.vy *= 0.9;
          }
        } else {
          // Bokoblin, Chuchu, Moblin Melee
          if (dist < 320) {
            e.state = 'chase';
            const ang = Math.atan2(p.y - e.y, p.x - e.x);
            e.vx = Math.cos(ang) * e.speed * timeScale;
            e.vy = Math.sin(ang) * e.speed * timeScale;

            if (dist < 40 && e.attackCooldown <= 0) {
              e.attackWindup = 25;
              e.attackCooldown = 75;
            }
          } else {
            e.state = 'patrol';
            e.vx *= 0.9;
            e.vy *= 0.9;
          }

          if (e.attackWindup > 0) {
            e.attackWindup -= timeScale;
            if (e.attackWindup <= 0 && dist < 45) {
              // Deal melee damage to player unless blocked
              if (p.isBlocking) {
                playZeldaSfx('parry');
                p.stamina = Math.max(0, p.stamina - 15);
              } else if (p.invulnerableTimer <= 0) {
                p.hearts -= (e.type === 'moblin' ? 12 : 6);
                p.invulnerableTimer = 35;
                playZeldaSfx('hit');
              }
            }
          }
        }

        e.x += e.vx;
        e.y += e.vy;
      });

      // Filter dead enemies & spawn drops
      enemiesRef.current = enemiesRef.current.filter(e => {
        if (e.hp <= 0) {
          playZeldaSfx('hit');
          if (e.type === 'guardian_stalker') {
            playZeldaSfx('victory');
            setGameState('victory');
            dropsRef.current.push({
              id: `core_${Date.now()}`,
              type: 'ancient_core',
              x: e.x,
              y: e.y,
              life: 2000
            });
          } else {
            // Drop rupees
            dropsRef.current.push({
              id: `drop_rupee_${Date.now()}_${Math.random()}`,
              type: e.type === 'moblin' ? 'red_rupee' : 'blue_rupee',
              x: e.x,
              y: e.y,
              life: 500
            });
          }
          return false;
        }
        return true;
      });

      // --- PROJECTILES LOGIC & PERFECT PARRY ---
      projectilesRef.current.forEach(proj => {
        proj.x += proj.vx * timeScale;
        proj.y += proj.vy * timeScale;
        proj.life -= timeScale;

        // Check collision with Player
        if (!proj.fromPlayer) {
          const distP = Math.hypot(proj.x - p.x, proj.y - p.y);
          if (distP < 25) {
            // PERFECT PARRY CHECK!
            if (p.isBlocking && p.parryWindow > 0) {
              // REFLECT LASER OR ARROW 180 DEGREES!
              playZeldaSfx('parry');
              proj.fromPlayer = true;
              proj.vx = -proj.vx * 1.5;
              proj.vy = -proj.vy * 1.5;
              proj.damage *= 2;
              p.invulnerableTimer = 25;

              // Spark particles
              for (let k = 0; k < 12; k++) {
                particlesRef.current.push({
                  x: p.x,
                  y: p.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  color: '#fbbf24',
                  size: 4,
                  life: 25,
                  maxLife: 25
                });
              }
              setHudStats(prev => ({ ...prev, message: '✨ PERFECT PARRY! LASER TERPANTUL!' }));
            } else if (p.isBlocking) {
              // Normal block
              playZeldaSfx('parry');
              p.stamina = Math.max(0, p.stamina - 20);
              proj.life = 0;
            } else if (p.invulnerableTimer <= 0) {
              p.hearts -= proj.damage;
              p.invulnerableTimer = 35;
              playZeldaSfx('hit');
              proj.life = 0;
            }
          }
        } else {
          // Player's projectile hits enemies
          enemiesRef.current.forEach(e => {
            const distE = Math.hypot(proj.x - e.x, proj.y - e.y);
            if (distE < (e.type === 'guardian_stalker' ? 50 : 25)) {
              e.hp -= proj.damage;
              playZeldaSfx('hit');
              proj.life = 0;

              // If deflected laser hits Guardian eye => STUN GUARDIAN!
              if (proj.isLaser && e.type === 'guardian_stalker') {
                e.stunTimer = 180; // 3 seconds stun
                setHudStats(prev => ({ ...prev, message: '💥 MATA GUARDIAN HANCUR! GUARDIAN TERLUMPUHKAN!' }));
              }
            }
          });
        }
      });

      projectilesRef.current = projectilesRef.current.filter(p => p.life > 0);

      // --- DROPPED ITEMS PICKUP ---
      dropsRef.current.forEach(item => {
        item.life--;
        const dist = Math.hypot(item.x - p.x, item.y - p.y);
        if (dist < 32) {
          if (item.type === 'green_rupee') {
            p.rupees += 1;
            playZeldaSfx('rupee_get');
          } else if (item.type === 'blue_rupee') {
            p.rupees += 5;
            playZeldaSfx('rupee_get');
          } else if (item.type === 'red_rupee') {
            p.rupees += 20;
            playZeldaSfx('rupee_get');
          } else if (item.type === 'apple') {
            p.apples += 1;
            playZeldaSfx('rupee_get');
          } else if (item.type === 'meat') {
            p.meat += 1;
            playZeldaSfx('rupee_get');
          } else if (item.type === 'arrow') {
            p.arrows += 5;
            playZeldaSfx('rupee_get');
          } else if (item.type === 'ancient_core') {
            p.rupees += 500;
            playZeldaSfx('cook_success');
          } else if (item.type === 'fairy') {
            p.hearts = Math.min(p.maxHearts, p.hearts + 12); // Heal 3 hearts
            playZeldaSfx('fairy_heal');
          }
          item.life = 0;
        }
      });

      dropsRef.current = dropsRef.current.filter(i => i.life > 0);

      // Check Game Over
      if (p.hearts <= 0) {
        setGameState('gameover');
        playZeldaSfx('hit');
      }

      // Check Proximity to Campfire & Korok
      const distToCampfire = Math.hypot(p.x - 500, p.y - 500);
      const nearCamp = distToCampfire < 90;
      const nearPot = distToCampfire < 75;

      const nearKorokSpot = koroksRef.current.find(k => !k.found && Math.hypot(k.x - p.x, k.y - p.y) < 65) || null;

      // Update HUD stats
      setHudStats({
        hearts: p.hearts,
        maxHearts: p.maxHearts,
        bonusHearts: p.bonusHearts,
        stamina: Math.round(p.stamina),
        apples: p.apples,
        meat: p.meat,
        mealsCount: p.cookedMeals.length,
        arrows: p.arrows,
        rupees: p.rupees,
        korokSeeds: p.korokSeeds,
        bossHp: currentBossHp,
        bossMaxHp: currentBossMaxHp,
        nearCampfire: nearCamp,
        nearCookingPot: nearPot,
        nearKorok: nearKorokSpot,
        hasBombActive: activeBombRef.current !== null,
        message: null
      });

      // --- RENDER CANVAS SCENE ---
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Camera tracking centered on player
          const camX = Math.max(0, Math.min(WORLD_W - canvas.width, p.x - canvas.width / 2));
          const camY = Math.max(0, Math.min(WORLD_H - canvas.height, p.y - canvas.height / 2));

          ctx.save();
          ctx.translate(-camX, -camY);

          // 1. BIOME TERRAIN TILES
          // Biome 1: Hyrule Central Plains (Vibrant Green)
          ctx.fillStyle = '#1e3e1e';
          ctx.fillRect(0, 0, 1200, 1200);

          // Biome 2: Faron Woods / Deep Forest (Dark Emerald)
          ctx.fillStyle = '#0f2918';
          ctx.fillRect(1200, 0, 1200, 1200);

          // Biome 3: Lake Klaten & Springs (Azure Blue)
          ctx.fillStyle = '#0c3559';
          ctx.fillRect(0, 1200, 1200, 1200);

          // Biome 4: Eldin Canyon (Warm Terracotta Stone)
          ctx.fillStyle = '#2c1b18';
          ctx.fillRect(1200, 1200, 1200, 1200);

          // Ancient Shrine Floor & Ancient Sheikah Runes (2000..2400)
          ctx.fillStyle = '#131b2e';
          ctx.fillRect(2000, 2000, 400, 400);
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 4;
          ctx.strokeRect(2000, 2000, 400, 400);

          // Glowing Sheikah eye symbol at center of Shrine
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(2200, 2200, 80, 0, Math.PI * 2);
          ctx.stroke();

          // 2. TALL GRASS TUFTS (Rumput Ilalang)
          grassRef.current.forEach(g => {
            if (!g.cut) {
              ctx.fillStyle = '#4ade80';
              ctx.beginPath();
              ctx.moveTo(g.x - 6, g.y + 4);
              ctx.lineTo(g.x - 2, g.y - 8);
              ctx.lineTo(g.x + 2, g.y + 4);
              ctx.lineTo(g.x + 6, g.y - 7);
              ctx.lineTo(g.x + 8, g.y + 4);
              ctx.fill();
            }
          });

          // 3. CLAY POTS (Kendi Tanah Liat)
          potsRef.current.forEach(pot => {
            if (!pot.broken) {
              ctx.fillStyle = '#b45309';
              ctx.beginPath();
              ctx.arc(pot.x, pot.y, 8, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#f59e0b';
              ctx.fillRect(pot.x - 4, pot.y - 11, 8, 3);
            }
          });

          // 4. KOROK PUZZLES
          koroksRef.current.forEach(k => {
            if (!k.found) {
              // Sparkling rock or flower
              ctx.fillStyle = '#e2e8f0';
              ctx.beginPath();
              ctx.arc(k.x, k.y, 9, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#22c55e';
              ctx.lineWidth = 2;
              ctx.stroke();
            } else if (k.popupTimer > 0) {
              k.popupTimer--;
              // Korok with cute leaf face!
              ctx.fillStyle = '#84cc16';
              ctx.beginPath();
              ctx.arc(k.x, k.y - 15, 12, 0, Math.PI * 2);
              ctx.fill();
              // Leaf face mask
              ctx.fillStyle = '#15803d';
              ctx.beginPath();
              ctx.arc(k.x, k.y - 15, 8, 0, Math.PI * 2);
              ctx.fill();
              // Text "Yahaha!"
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 11px sans-serif';
              ctx.fillText('Yahaha!', k.x - 18, k.y - 32);
            }
          });

          // 5. CAMPFIRE & COOKING POT (at 500, 500)
          // Fire pit stones
          ctx.fillStyle = '#475569';
          for (let s = 0; s < 8; s++) {
            const sang = (s / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(500 + Math.cos(sang) * 18, 500 + Math.sin(sang) * 18, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          // Flames
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(500, 500, 14 + Math.sin(Date.now() * 0.01) * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(500, 500, 7, 0, Math.PI * 2);
          ctx.fill();

          // Black Iron Cooking Pot tripod
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(500, 492, 10, 0, Math.PI);
          ctx.fill();

          // 6. TREES
          treesRef.current.forEach(t => {
            // Tree shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath();
            ctx.ellipse(t.x + 8, t.y + 16, 26, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tree Trunk
            ctx.fillStyle = '#78350f';
            ctx.fillRect(t.x - 5, t.y - 6, 10, 20);

            // Foliage
            ctx.fillStyle = '#14532d';
            ctx.beginPath();
            ctx.arc(t.x, t.y - 12, 26, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#166534';
            ctx.beginPath();
            ctx.arc(t.x - 5, t.y - 16, 18, 0, Math.PI * 2);
            ctx.fill();

            // Apples on tree
            if (t.hasApples) {
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(t.x - 9, t.y - 16, 4, 0, Math.PI * 2);
              ctx.arc(t.x + 9, t.y - 10, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // 7. REMOTE BOMB (Sheikah Bomb)
          if (activeBombRef.current) {
            const b = activeBombRef.current;
            const pulse = Math.sin(b.pulseTimer * 0.15) * 3;
            // Glowing blue orb
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(b.x, b.y, 10 + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Sheikah eye rune on bomb
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // 8. DROPPED ITEMS
          dropsRef.current.forEach(item => {
            if (item.type === 'green_rupee') {
              ctx.fillStyle = '#22c55e';
              drawRupee(ctx, item.x, item.y);
            } else if (item.type === 'blue_rupee') {
              ctx.fillStyle = '#3b82f6';
              drawRupee(ctx, item.x, item.y);
            } else if (item.type === 'red_rupee') {
              ctx.fillStyle = '#ef4444';
              drawRupee(ctx, item.x, item.y);
            } else if (item.type === 'apple') {
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(item.x, item.y, 6, 0, Math.PI * 2);
              ctx.fill();
            } else if (item.type === 'meat') {
              ctx.fillStyle = '#f43f5e';
              ctx.fillRect(item.x - 5, item.y - 5, 10, 10);
            } else if (item.type === 'arrow') {
              ctx.strokeStyle = '#e2e8f0';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(item.x - 6, item.y);
              ctx.lineTo(item.x + 6, item.y);
              ctx.stroke();
            } else if (item.type === 'fairy') {
              // Glowing pink fairy with fluttering wings
              const flap = Math.sin(Date.now() * 0.02) * 5;
              ctx.fillStyle = 'rgba(244, 114, 182, 0.7)';
              ctx.beginPath();
              ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.ellipse(item.x - 6, item.y + flap, 5, 2, -0.4, 0, Math.PI * 2);
              ctx.ellipse(item.x + 6, item.y + flap, 5, 2, 0.4, 0, Math.PI * 2);
              ctx.fill();
            } else if (item.type === 'ancient_core') {
              ctx.fillStyle = '#06b6d4';
              ctx.beginPath();
              ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // 9. ANIMALS
          animalsRef.current.forEach(a => {
            ctx.fillStyle = a.type === 'rabbit' ? '#f8fafc' : '#b45309';
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.type === 'rabbit' ? 8 : 14, 0, Math.PI * 2);
            ctx.fill();
          });

          // 10. ENEMIES & AUTHENTIC GUARDIAN STALKER
          enemiesRef.current.forEach(e => {
            if (e.type === 'guardian_stalker') {
              // GUARDIAN LEGS (6 segmented ancient mechanical legs)
              const legAngStep = (Math.PI * 2) / 6;
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = 4;
              for (let l = 0; l < 6; l++) {
                const baseAng = l * legAngStep;
                const legWiggle = Math.sin((e.legCycle || 0) + l) * 12;
                const jointX = e.x + Math.cos(baseAng) * 32;
                const jointY = e.y + Math.sin(baseAng) * 32;
                const footX = e.x + Math.cos(baseAng) * (52 + legWiggle);
                const footY = e.y + Math.sin(baseAng) * (52 + legWiggle);

                ctx.beginPath();
                ctx.moveTo(e.x, e.y);
                ctx.lineTo(jointX, jointY);
                ctx.lineTo(footX, footY);
                ctx.stroke();
              }

              // Ancient Body Dome (Sheikah Ancient Armor)
              ctx.fillStyle = e.hp < 300 ? '#7f1d1d' : '#1e293b';
              ctx.strokeStyle = '#06b6d4';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(e.x, e.y, 38, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              // Ancient Head Dome (Rotates towards player)
              const headX = e.x + Math.cos(e.targetAngle || 0) * 10;
              const headY = e.y + Math.sin(e.targetAngle || 0) * 10;
              ctx.fillStyle = '#0f172a';
              ctx.beginPath();
              ctx.arc(headX, headY, 20, 0, Math.PI * 2);
              ctx.fill();

              // EYE: GLOWING RED WHEN TARGETING!
              const isTargeting = (e.laserChargeTimer || 0) > 0;
              ctx.fillStyle = isTargeting ? '#ef4444' : '#06b6d4';
              ctx.beginPath();
              ctx.arc(headX, headY, 9, 0, Math.PI * 2);
              ctx.fill();

              // RED LASER BEAM TARGETING LINE & LOCK-ON CROSSHAIR!
              if (isTargeting) {
                // Laser line to player
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 6]);
                ctx.beginPath();
                ctx.moveTo(headX, headY);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Target lock-on crosshair on player
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
                ctx.moveTo(p.x - 24, p.y);
                ctx.lineTo(p.x + 24, p.y);
                ctx.moveTo(p.x, p.y - 24);
                ctx.lineTo(p.x, p.y + 24);
                ctx.stroke();
              }
            } else if (e.type === 'chuchu') {
              // Bouncy jelly slime with big cartoon eyes
              ctx.fillStyle = '#22c55e';
              ctx.beginPath();
              ctx.arc(e.x, e.y, 13, 0, Math.PI * 2);
              ctx.fill();
              // Eyes
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(e.x - 4, e.y - 3, 3.5, 0, Math.PI * 2);
              ctx.arc(e.x + 4, e.y - 3, 3.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#000000';
              ctx.beginPath();
              ctx.arc(e.x - 4, e.y - 3, 1.5, 0, Math.PI * 2);
              ctx.arc(e.x + 4, e.y - 3, 1.5, 0, Math.PI * 2);
              ctx.fill();
            } else if (e.type === 'bokoblin') {
              // Red Bokoblin with pointy horn
              ctx.fillStyle = '#dc2626';
              ctx.beginPath();
              ctx.arc(e.x, e.y, 16, 0, Math.PI * 2);
              ctx.fill();
              // Horn
              ctx.fillStyle = '#fef08a';
              ctx.beginPath();
              ctx.moveTo(e.x - 3, e.y - 14);
              ctx.lineTo(e.x, e.y - 24);
              ctx.lineTo(e.x + 3, e.y - 14);
              ctx.fill();
            } else if (e.type === 'archer') {
              ctx.fillStyle = '#94a3b8';
              ctx.beginPath();
              ctx.arc(e.x, e.y, 15, 0, Math.PI * 2);
              ctx.fill();
            } else if (e.type === 'moblin') {
              ctx.fillStyle = '#7c2d12';
              ctx.beginPath();
              ctx.arc(e.x, e.y, 24, 0, Math.PI * 2);
              ctx.fill();
            }

            // Enemy HP bar (except Boss which has big HUD bar)
            if (e.type !== 'guardian_stalker') {
              ctx.fillStyle = '#000000';
              ctx.fillRect(e.x - 15, e.y - 26, 30, 4);
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(e.x - 15, e.y - 26, (e.hp / e.maxHp) * 30, 4);
            }
          });

          // 11. PROJECTILES
          projectilesRef.current.forEach(proj => {
            if (proj.isLaser) {
              // Blinding blue/red laser beam
              ctx.strokeStyle = proj.fromPlayer ? '#38bdf8' : '#ef4444';
              ctx.lineWidth = 9;
              ctx.beginPath();
              ctx.moveTo(proj.x, proj.y);
              ctx.lineTo(proj.x - proj.vx * 3, proj.y - proj.vy * 3);
              ctx.stroke();
            } else {
              ctx.strokeStyle = proj.fromPlayer ? '#38bdf8' : '#e2e8f0';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(proj.x, proj.y);
              ctx.lineTo(proj.x - proj.vx * 1.5, proj.y - proj.vy * 1.5);
              ctx.stroke();
            }
          });

          // 12. PARTICLES
          particlesRef.current.forEach(part => {
            ctx.fillStyle = part.color;
            ctx.beginPath();
            ctx.arc(part.x, part.y, part.size * (part.life / part.maxLife), 0, Math.PI * 2);
            ctx.fill();
          });

          // 13. PLAYER (LINK / MAS BUMI - CHAMPION'S TUNIC & MASTER SWORD)
          if (p.invulnerableTimer % 4 < 2) {
            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(p.x, p.y + 12, 14, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // PARAGLIDER (Parasut Layang)
            if (p.isGliding) {
              ctx.fillStyle = '#78350f'; // Wooden struts
              ctx.fillRect(p.x - 30, p.y - 35, 60, 4);
              ctx.fillStyle = '#d97706'; // Sail cloth
              ctx.beginPath();
              ctx.moveTo(p.x - 30, p.y - 35);
              ctx.lineTo(p.x, p.y - 48);
              ctx.lineTo(p.x + 30, p.y - 35);
              ctx.closePath();
              ctx.fill();
            }

            // Champion's Tunic Body (Iconic Azure Blue)
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
            ctx.fill();

            // White Champion embroidery cross on chest
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(p.x - 6, p.y - 4);
            ctx.lineTo(p.x + 6, p.y + 4);
            ctx.moveTo(p.x + 6, p.y - 4);
            ctx.lineTo(p.x - 6, p.y + 4);
            ctx.stroke();

            // Blonde / Light Brown Link Hair
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(p.x, p.y - 5, 10, 0, Math.PI * 2);
            ctx.fill();

            // HYLIAN SHIELD (Blue with Golden Triforce & Red Crest)
            if (p.isBlocking) {
              const shX = p.x + Math.cos(p.facing) * 19;
              const shY = p.y + Math.sin(p.facing) * 19;

              // Shield base
              ctx.fillStyle = '#1d4ed8';
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(shX, shY, 13, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              // Gold Triforce at top of shield
              ctx.fillStyle = '#facc15';
              ctx.beginPath();
              ctx.moveTo(shX, shY - 8);
              ctx.lineTo(shX + 5, shY - 1);
              ctx.lineTo(shX - 5, shY - 1);
              ctx.closePath();
              ctx.fill();
            } else if (p.isSpinAttacking) {
              // 360 SPIN ATTACK CYCLONE!
              ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
              ctx.lineWidth = 6;
              ctx.beginPath();
              ctx.arc(p.x, p.y, 55, 0, Math.PI * 2);
              ctx.stroke();
            } else if (p.isAttacking) {
              // Normal Sword Slash arc
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(p.x, p.y, 40, p.facing - 1.1, p.facing + 1.1);
              ctx.stroke();
            }

            // ZELDA CIRCULAR STAMINA WHEEL (Next to Link)
            if (p.stamina < p.maxStamina) {
              const rad = 14;
              const pct = p.stamina / p.maxStamina;
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(p.x + 24, p.y - 20, rad, 0, Math.PI * 2);
              ctx.stroke();

              // Green wheel turning flashing red when low
              const isLow = pct < 0.25;
              ctx.strokeStyle = isLow ? (Date.now() % 300 < 150 ? '#ef4444' : '#f59e0b') : '#10b981';
              ctx.beginPath();
              ctx.arc(p.x + 24, p.y - 20, rad, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
              ctx.stroke();
            }
          }

          // 14. DAY / NIGHT LIGHTING OVERLAY
          const nightTint = Math.sin(timeOfDayRef.current * Math.PI * 2);
          if (nightTint > 0.2) {
            // Night Darkness
            ctx.fillStyle = `rgba(10, 15, 35, ${Math.min(0.65, (nightTint - 0.2) * 1.1)})`;
            ctx.fillRect(camX, camY, canvas.width, canvas.height);

            // Light circle around Player (Torch / Sheikah Glow)
            const gradient = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, 140);
            gradient.addColorStop(0, 'rgba(255, 237, 213, 0.35)');
            gradient.addColorStop(1, 'rgba(10, 15, 35, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 140, 0, Math.PI * 2);
            ctx.fill();
          }

          // 15. FLURRY RUSH BULLET TIME CYAN VIGNETTE
          if (isBulletTime) {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
            ctx.lineWidth = 14;
            ctx.strokeRect(camX, camY, canvas.width, canvas.height);
          }

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [gameState, playZeldaSfx]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;

      if (gameState === 'playing') {
        if (e.key === 'j' || e.key === 'J') {
          handleAttack();
        } else if (e.key === 'k' || e.key === 'K') {
          handleShootArrow();
        } else if (e.key === 'l' || e.key === 'L') {
          handleShieldDown();
        } else if (e.key === ' ' || e.key === 'Shift') {
          e.preventDefault();
          handleDash();
        } else if (e.key === 'q' || e.key === 'Q') {
          handleRemoteBomb();
        } else if (e.key === 'g' || e.key === 'G') {
          toggleParaglider();
        } else if (e.key === 'e' || e.key === 'E') {
          if (hudStats.nearCookingPot) {
            handleOpenCooking();
          } else if (hudStats.nearKorok) {
            handleInteractKorok();
          } else {
            handleEatMeal();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
      if (e.key === 'l' || e.key === 'L') {
        handleShieldUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  // Helper function to draw rupee polygon
  const drawRupee = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x + 5, y - 2);
    ctx.lineTo(x + 5, y + 2);
    ctx.lineTo(x, y + 8);
    ctx.lineTo(x - 5, y + 2);
    ctx.lineTo(x - 5, y - 2);
    ctx.closePath();
    ctx.fill();
  };

  // Render Zelda Hearts (Quarters logic)
  const renderZeldaHearts = () => {
    const totalHearts = Math.ceil(hudStats.maxHearts / 4);
    const hearts = [];

    for (let i = 0; i < totalHearts; i++) {
      const remainingQuarters = Math.max(0, Math.min(4, hudStats.hearts - i * 4));
      const fillPct = remainingQuarters / 4;

      hearts.push(
        <div key={i} className="relative w-5 h-5 flex items-center justify-center">
          {/* Heart Container Outline */}
          <Heart className="w-5 h-5 text-slate-700 dark:text-slate-800 fill-slate-800/80" />
          {/* Filled Heart */}
          <div 
            className="absolute inset-0 overflow-hidden flex items-center"
            style={{ width: `${fillPct * 100}%` }}
          >
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]" />
          </div>
        </div>
      );
    }
    return hearts;
  };

  return (
    <div className={`rounded-3xl p-4 sm:p-6 border transition-all ${
      isDarkMode 
        ? 'bg-[#040d1a] border-cyan-800/80 shadow-2xl text-slate-100' 
        : 'bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 border-sky-300 shadow-xl text-slate-800'
    }`}>
      <div className="space-y-4">
        {/* TOP BAR: SHEIKAH SLATE HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-xs font-mono-tech shadow-lg">
          {/* Left: Hearts & Time */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {renderZeldaHearts()}
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-cyan-400/30 text-cyan-300">
              {currentTimePhase === 'Malam' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span>{currentTimePhase}</span>
            </div>
          </div>

          {/* Right: Rupees, Korok, Arrows, Meals */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
              <span>💎</span>
              <span>{hudStats.rupees}</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
              <span>🍃</span>
              <span>{hudStats.korokSeeds}</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-sky-950/80 border border-sky-500/40 text-sky-300 font-bold">
              <span>🏹</span>
              <span>{hudStats.arrows}</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold">
              <span>🍱</span>
              <span>{hudStats.mealsCount}</span>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' 
                  : 'bg-rose-500/20 border-rose-400/50 text-rose-300'
              }`}
              title={soundEnabled ? 'Matikan Suara Zelda' : 'Nyalakan Suara Zelda'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* BOSS HEALTH BAR (Ancient Guardian Leviathan) */}
        {hudStats.bossHp > 0 && (
          <div className="p-3 rounded-2xl bg-slate-950/90 border-2 border-rose-500/70 shadow-lg space-y-1 animate-pulse">
            <div className="flex items-center justify-between text-xs font-mono-tech font-bold text-rose-300">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rose-500" />
                <span>ANCIENT GUARDIAN LEVIATHAN (KUIL KUNO)</span>
              </span>
              <span>{Math.round((hudStats.bossHp / hudStats.bossMaxHp) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-rose-500/40">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 transition-all duration-200"
                style={{ width: `${(hudStats.bossHp / hudStats.bossMaxHp) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* INTERACTIVE CANVAS */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] bg-slate-950">
          <canvas
            ref={canvasRef}
            width={850}
            height={520}
            className="w-full h-auto block cursor-crosshair"
          />

          {/* Mini-Radar Map (Top Right of Canvas) */}
          <div className="absolute top-4 right-4 w-28 h-28 rounded-2xl bg-slate-950/90 border-2 border-cyan-500/40 shadow-lg p-1.5 pointer-events-none">
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
              {/* Player Dot */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_6px_#38bdf8]"
                style={{
                  left: `${(playerRef.current.x / WORLD_W) * 100}%`,
                  top: `${(playerRef.current.y / WORLD_H) * 100}%`
                }}
              />
              {/* Boss Temple Marker */}
              <div
                className="absolute w-3 h-3 rounded-xs bg-rose-500 -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{
                  left: `${(2180 / WORLD_W) * 100}%`,
                  top: `${(2180 / WORLD_H) * 100}%`
                }}
              />
              {/* Campfire Marker */}
              <div
                className="absolute w-2 h-2 rounded-full bg-amber-400 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${(500 / WORLD_W) * 100}%`,
                  top: `${(500 / WORLD_H) * 100}%`
                }}
              />
            </div>
            <span className="text-[9px] font-mono-tech font-bold text-cyan-300 block text-center mt-0.5">
              RADAR HYRULE
            </span>
          </div>

          {/* Flurry Rush Bullet Time Banner */}
          {flurryActive && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-cyan-500/90 text-slate-950 font-black text-xs font-mono-tech shadow-xl animate-pulse pointer-events-none flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>FLURRY RUSH! TEKAN TEBAS SECEPATNYA!</span>
            </div>
          )}

          {/* Screen Notifications / Prompts */}
          {hudStats.message && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-amber-500/95 text-slate-950 font-bold text-xs font-mono-tech shadow-lg animate-bounce pointer-events-none">
              {hudStats.message}
            </div>
          )}

          {/* Context Action Prompt (Masak / Angkat Batu) */}
          {hudStats.nearCookingPot && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-400 text-amber-300 font-bold text-xs font-mono-tech shadow-lg animate-pulse flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Tekan [E] untuk Memasak di Panci!</span>
            </div>
          )}
          {hudStats.nearKorok && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/90 border border-emerald-400 text-emerald-300 font-bold text-xs font-mono-tech shadow-lg animate-pulse flex items-center gap-2">
              <span>🍃</span>
              <span>{hudStats.nearKorok.prompt} [E]</span>
            </div>
          )}

          {/* COOKING MODAL (Authentic Zelda Cooking Animation) */}
          {cookingModal && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center">
              {cookingModal.stage === 'cooking' ? (
                <div className="space-y-4 animate-bounce">
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                    🍲
                  </div>
                  <h4 className="text-xl font-black font-fun text-amber-300">
                    Memasak di Panci Kuno...
                  </h4>
                  <p className="text-xs text-slate-300 font-mono-tech">
                    Bahan-bahan melompat gembira di dalam panci!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-sm p-6 rounded-3xl bg-slate-900 border-2 border-amber-400 shadow-2xl animate-scale-in">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg">
                    {cookingModal.icon}
                  </div>
                  <h4 className="text-2xl font-black font-fun text-amber-300">
                    {cookingModal.dishName}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {cookingModal.dishDesc}
                  </p>
                  <button
                    onClick={() => setCookingModal(null)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs font-mono-tech cursor-pointer hover:scale-105 transition-all"
                  >
                    SIMPAN KE TAS MAKANAN 🎒
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OVERLAYS: INTRO / GAMEOVER / VICTORY */}
          {gameState === 'intro' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.6)] mb-3 animate-pulse">
                <Sword className="w-8 h-8" />
              </div>
              <h4 className="text-3xl sm:text-4xl font-black font-fun text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                LEGENDA MAS BUMI: BREATH OF KLATEN
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md font-sans leading-relaxed">
                Petualangan open-world otentik ala The Legend of Zelda! Jelajahi padang savana, tebas rumput untuk menemukan Rupee & Peri, gunakan Paraglider, ledakkan Bom Sheikah, tangkis laser Guardian dengan Perfect Parry, dan temukan Korok rahasia!
              </p>

              <div className="grid grid-cols-2 gap-2.5 my-5 text-xs text-left max-w-md font-mono-tech bg-slate-900/80 p-4 rounded-2xl border border-cyan-500/30 text-slate-300">
                <div>⚔️ <strong>[J]</strong> Tebas / Spin Attack</div>
                <div>🏹 <strong>[K]</strong> Busur & Panah</div>
                <div>🛡️ <strong>[L]</strong> Perisai / Perfect Parry</div>
                <div>⚡ <strong>[Spasi]</strong> Dash & Flurry Rush</div>
                <div>💣 <strong>[Q]</strong> Bom Biru Sheikah</div>
                <div>🪂 <strong>[G]</strong> Paraglider Layang</div>
                <div>🍲 <strong>[E]</strong> Masak / Makan / Korok</div>
                <div>🧭 <strong>[WASD]</strong> Jalan Eksplorasi</div>
              </div>

              <button
                onClick={handleStartGame}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-500/40 transition-all hover:scale-105 cursor-pointer font-mono-tech flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>MULAI PETUALANGAN! 🚀</span>
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-rose-500 text-white flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-bounce">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <h4 className="text-3xl font-black font-fun text-rose-400">
                KAMU GUGUR DALAM TUGAS!
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs font-sans">
                Gunakan perisai untuk memantulkan laser Guardian dan bawa banyak makanan daging panggang!
              </p>
              <button
                onClick={handleStartGame}
                className="mt-5 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-xs shadow-xl cursor-pointer font-mono-tech flex items-center gap-2 hover:scale-105 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>BANGKIT KEMBALI 🔄</span>
              </button>
            </div>
          )}

          {gameState === 'victory' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(251,191,36,0.8)] animate-bounce">
                <Trophy className="w-10 h-10 fill-current" />
              </div>
              <h4 className="text-3xl sm:text-4xl font-black font-fun text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                SELAMAT MAS BUMI! 🏆👑
              </h4>
              <p className="text-sm text-slate-200 mt-2 max-w-md font-sans leading-relaxed">
                Ancient Guardian Leviathan berhasil dikalahkan! Mas Bumi telah membuktikan keberanian dan ketangguhan sebagai Pahlawan sejati!
              </p>
              <button
                onClick={handleStartGame}
                className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-xl cursor-pointer font-mono-tech flex items-center gap-2 hover:scale-105 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>JELAJAHI DUNIA LAGI 🗺️</span>
              </button>
            </div>
          )}
        </div>

        {/* MOBILE VIRTUAL CONTROLS */}
        <div className="pt-2 max-w-xl mx-auto space-y-3 select-none font-mono-tech">
          {/* Action Buttons Row */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-xs">
            <button
              onClick={handleAttack}
              className="p-2.5 rounded-2xl bg-cyan-600/90 active:bg-cyan-500 border border-cyan-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-cyan-600/30 cursor-pointer"
            >
              <Sword className="w-4 h-4" />
              <span>TEBAS</span>
            </button>

            <button
              onClick={handleSpinAttack}
              className="p-2.5 rounded-2xl bg-teal-600/90 active:bg-teal-500 border border-teal-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-teal-600/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>SPIN</span>
            </button>

            <button
              onClick={handleShootArrow}
              className="p-2.5 rounded-2xl bg-indigo-600/90 active:bg-indigo-500 border border-indigo-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Crosshair className="w-4 h-4" />
              <span>PANAH</span>
            </button>

            <button
              onPointerDown={handleShieldDown}
              onPointerUp={handleShieldUp}
              className="p-2.5 rounded-2xl bg-blue-600/90 active:bg-blue-500 border border-blue-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>PARRY</span>
            </button>

            <button
              onClick={handleDash}
              className="p-2.5 rounded-2xl bg-emerald-600/90 active:bg-emerald-500 border border-emerald-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>DASH</span>
            </button>

            <button
              onClick={handleRemoteBomb}
              className={`p-2.5 rounded-2xl border text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer transition-all ${
                hudStats.hasBombActive 
                  ? 'bg-rose-600 border-rose-400 shadow-rose-600/40 animate-pulse' 
                  : 'bg-sky-600 border-sky-400 shadow-sky-600/30'
              }`}
            >
              <Bomb className="w-4 h-4" />
              <span>{hudStats.hasBombActive ? 'LEDAKKAN' : 'BOM'}</span>
            </button>

            <button
              onClick={toggleParaglider}
              className="p-2.5 rounded-2xl bg-amber-600/90 active:bg-amber-500 border border-amber-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-amber-600/30 cursor-pointer"
            >
              <Wind className="w-4 h-4" />
              <span>LAYANG</span>
            </button>
          </div>

          {/* D-Pad Navigation & Contextual Button */}
          <div className="flex items-center justify-between gap-4 pt-1">
            {/* Virtual D-Pad */}
            <div className="grid grid-cols-3 gap-1.5 w-36">
              <div />
              <button
                onPointerDown={() => { touchDpadRef.current = { dx: 0, dy: -1 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="p-3 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-600 text-white flex items-center justify-center"
              >
                ▲
              </button>
              <div />
              <button
                onPointerDown={() => { touchDpadRef.current = { dx: -1, dy: 0 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="p-3 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-600 text-white flex items-center justify-center"
              >
                ◀
              </button>
              <div className="flex items-center justify-center text-[10px] text-slate-500">
                <Compass className="w-4 h-4" />
              </div>
              <button
                onPointerDown={() => { touchDpadRef.current = { dx: 1, dy: 0 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="p-3 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-600 text-white flex items-center justify-center"
              >
                ▶
              </button>
              <div />
              <button
                onPointerDown={() => { touchDpadRef.current = { dx: 0, dy: 1 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="p-3 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-600 text-white flex items-center justify-center"
              >
                ▼
              </button>
              <div />
            </div>

            {/* Contextual Action Button (Masak / Angkat Batu / Makan) */}
            <div className="flex-1 max-w-xs">
              <button
                onClick={hudStats.nearCookingPot ? handleOpenCooking : hudStats.nearKorok ? handleInteractKorok : handleEatMeal}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-98 transition-all"
              >
                {hudStats.nearCookingPot ? (
                  <>
                    <Flame className="w-4 h-4 text-orange-950" />
                    <span>MASAK DI PANCI 🍲</span>
                  </>
                ) : hudStats.nearKorok ? (
                  <>
                    <span>🍃</span>
                    <span>PERIKSA RAHASIA KOROK</span>
                  </>
                ) : (
                  <>
                    <span>🍱</span>
                    <span>MAKAN BEKAL 🍎</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
