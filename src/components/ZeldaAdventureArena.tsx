import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
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
  Moon,
  CloudRain,
  Mountain,
  RotateCw
} from 'lucide-react';

interface ZeldaAdventureArenaProps {
  isDarkMode?: boolean;
  playSound?: (type: 'swim' | 'coin' | 'hit' | 'tech') => void;
}

// Procedural 3D Terrain Height Function
function getTerrainHeight(x: number, z: number): number {
  let h = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 3 + Math.sin(x * 0.08) * 1.2;

  // Lake depression (x < -30 && z > 20)
  const distToLake = Math.hypot(x - (-50), z - 50);
  if (distToLake < 45) {
    h -= (1 - distToLake / 45) * 6;
  }

  // Canyon steep crags & cliffs (x > 30 && z > 30)
  if (x > 30 && z > 30) {
    h += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 6 + 4.5;
  }

  // Ancient Shrine plateau (x: 60..90, z: -90..-60)
  const distToShrine = Math.hypot(x - 75, z - (-75));
  if (distToShrine < 25) {
    h = 5.5 + Math.sin(distToShrine * 0.2) * 0.5;
  }

  return h;
}

interface UpdraftZone {
  x: number;
  z: number;
  radius: number;
  timer: number;
}

interface Arrow3D {
  mesh: THREE.Group;
  vx: number;
  vy: number;
  vz: number;
  life: number;
}

export const ZeldaAdventureArena: React.FC<ZeldaAdventureArenaProps> = ({ isDarkMode = true, playSound }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'victory'>('intro');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Time & Weather
  const timeOfDayRef = useRef(0.25);
  const [currentTimePhase, setCurrentTimePhase] = useState<'Pagi' | 'Siang' | 'Senja' | 'Malam'>('Siang');
  const [currentWeather, setCurrentWeather] = useState<'Cerah' | 'Hujan' | 'Badai Petir'>('Cerah');
  const weatherTimerRef = useRef(0);

  // Flurry Rush (Bullet Time)
  const flurryRushTimerRef = useRef(0);
  const [flurryActive, setFlurryActive] = useState(false);

  // Updraft zones
  const updraftsRef = useRef<UpdraftZone[]>([]);

  // 3D Arrows & 3D Bomb references in scene
  const arrows3DRef = useRef<Arrow3D[]>([]);
  const activeBomb3DRef = useRef<{ mesh: THREE.Mesh; vx: number; vz: number; timer: number } | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Cooking Modal State
  const [cookingModal, setCookingModal] = useState<{
    isOpen: boolean;
    stage: 'cooking' | 'ready';
    dishName: string;
    dishDesc: string;
    icon: string;
  } | null>(null);

  // Player Stats Ref
  const playerStatsRef = useRef({
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    rotY: 0,
    hearts: 20,
    maxHearts: 20,
    bonusHearts: 0,
    stamina: 100,
    maxStamina: 100,
    isAttacking: false,
    attackTimer: 0,
    isSpinAttacking: false,
    spinTimer: 0,
    isBlocking: false,
    parryWindow: 0,
    isDashing: false,
    dashTimer: 0,
    isGliding: false,
    isClimbing: false,
    isSurfing: false,
    invulnerableTimer: 0,
    runCycle: 0,
    apples: 5,
    meat: 2,
    cookedMeals: [{ name: 'Hearty Meat Skewer', type: 'heal', bonus: 8 }],
    arrows: 25,
    rupees: 100,
    korokSeeds: 0
  });

  // Bokoblin Enemy 3D State
  const bokoStatsRef = useRef({
    x: 25,
    y: getTerrainHeight(25, -25),
    z: -25,
    hp: 60,
    maxHp: 60,
    attackCooldown: 0,
    isAttacking: false,
    mesh: null as THREE.Group | null
  });

  // Guardian Legs HP (6 legs)
  const guardianLegsHpRef = useRef<number[]>([60, 60, 60, 60, 60, 60]);

  // UI Mirror
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
    bossHp: 800,
    bossMaxHp: 800,
    bokoHp: 60,
    legsRemaining: 6,
    nearCampfire: false,
    nearCookingPot: false,
    isClimbing: false,
    isSurfing: false,
    hasBombActive: false,
    message: null as string | null
  });

  // Camera Orbit Controls
  const camOrbitRef = useRef({
    yaw: 0,
    pitch: 0.35,
    dist: 12,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
  });

  // Input states
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const touchDpadRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Audio Synthesizer
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
    'rupee_get' | 'fairy_heal' | 'glide_wind' | 'victory' | 'botw_piano' | 
    'guardian_panic' | 'surf_slide' | 'thunder'
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
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(850, now + 0.15);
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
        [1760, 2200, 880].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.35, now);
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
      } else if (type === 'botw_piano') {
        const pianoChords = [
          [370, 440, 554],
          [392, 493, 587],
          [440, 554, 659],
          [293, 370, 440]
        ];
        const chord = pianoChords[Math.floor(Math.random() * pianoChords.length)];
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.18);
          gain.gain.setValueAtTime(0.15, now + idx * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 1.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.18);
          osc.stop(now + idx * 0.18 + 1.8);
        });
      } else if (type === 'guardian_panic') {
        [1046, 1174, 1318, 1568, 1760].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.12, now + idx * 0.06);
          gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.06 + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.08);
        });
      } else if (type === 'surf_slide') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'thunder') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 1.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      } else if (type === 'victory') {
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
  }, [soundEnabled, getAudioCtx, playSound]);

  // Start / Restart Game
  const handleStartGame = () => {
    playerStatsRef.current = {
      x: 0,
      y: getTerrainHeight(0, 0),
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      rotY: 0,
      hearts: 20,
      maxHearts: 20,
      bonusHearts: 0,
      stamina: 100,
      maxStamina: 100,
      isAttacking: false,
      attackTimer: 0,
      isSpinAttacking: false,
      spinTimer: 0,
      isBlocking: false,
      parryWindow: 0,
      isDashing: false,
      dashTimer: 0,
      isGliding: false,
      isClimbing: false,
      isSurfing: false,
      invulnerableTimer: 0,
      runCycle: 0,
      apples: 5,
      meat: 2,
      cookedMeals: [{ name: 'Hearty Meat Skewer', type: 'heal', bonus: 8 }],
      arrows: 25,
      rupees: 100,
      korokSeeds: 0
    };
    bokoStatsRef.current.hp = 60;
    guardianLegsHpRef.current = [60, 60, 60, 60, 60, 60];
    setGameState('playing');
    playZeldaSfx('secret_chime');
  };

  // Player Actions
  const handleAttack = () => {
    const p = playerStatsRef.current;
    if (p.isAttacking || p.isDashing || p.isGliding || p.isClimbing) return;
    p.isAttacking = true;
    p.attackTimer = 16;
    playZeldaSfx('slash');

    // Check hit on Bokoblin
    const b = bokoStatsRef.current;
    if (b.hp > 0) {
      const distToBoko = Math.hypot(p.x - b.x, p.z - b.z);
      if (distToBoko < 3.2) {
        b.hp = Math.max(0, b.hp - 25);
        playZeldaSfx('hit');
        // Knockback Bokoblin
        const ang = Math.atan2(b.x - p.x, b.z - p.z);
        b.x += Math.sin(ang) * 2;
        b.z += Math.cos(ang) * 2;
        if (b.hp <= 0) {
          p.rupees += 20;
          p.meat += 1;
          playZeldaSfx('rupee_get');
          setHudStats(prev => ({ ...prev, message: '🎉 BOKOBLIN KALAH! (+20 Rupee & Daging Segar)' }));
        }
      }
    }
  };

  const handleSpinAttack = () => {
    const p = playerStatsRef.current;
    if (p.stamina < 25 || p.isClimbing) return;
    p.stamina = Math.max(0, p.stamina - 25);
    p.isSpinAttacking = true;
    p.spinTimer = 22;
    playZeldaSfx('spin');

    const b = bokoStatsRef.current;
    if (b.hp > 0 && Math.hypot(p.x - b.x, p.z - b.z) < 4.5) {
      b.hp = Math.max(0, b.hp - 45);
      playZeldaSfx('hit');
      if (b.hp <= 0) {
        p.rupees += 20;
        p.meat += 1;
        playZeldaSfx('rupee_get');
      }
    }
  };

  // Real 3D Arrow Shooting
  const handleShootArrow = () => {
    const p = playerStatsRef.current;
    if (p.arrows <= 0 || p.isClimbing) return;
    p.arrows--;
    playZeldaSfx('arrow');

    // Spawn 3D Arrow mesh in scene
    if (sceneRef.current) {
      const arrowGroup = new THREE.Group();
      arrowGroup.position.set(p.x, p.y + 1.2, p.z);

      const shaftMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
      const tipMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#38bdf8', emissiveIntensity: 0.8 });

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), shaftMat);
      shaft.rotateX(Math.PI / 2);
      arrowGroup.add(shaft);

      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 6), tipMat);
      tip.position.z = 0.65;
      tip.rotateX(Math.PI / 2);
      arrowGroup.add(tip);

      const arrowSpeed = 1.6;
      const arrowVx = Math.sin(p.rotY) * arrowSpeed;
      const arrowVz = Math.cos(p.rotY) * arrowSpeed;

      arrowGroup.rotation.y = p.rotY;
      sceneRef.current.add(arrowGroup);

      arrows3DRef.current.push({
        mesh: arrowGroup,
        vx: arrowVx,
        vy: 0.1,
        vz: arrowVz,
        life: 120
      });
    }
  };

  const handleShieldDown = () => {
    const p = playerStatsRef.current;
    p.isBlocking = true;
    p.parryWindow = 14;
  };

  const handleShieldUp = () => {
    const p = playerStatsRef.current;
    p.isBlocking = false;
    p.parryWindow = 0;
  };

  const handleDash = () => {
    const p = playerStatsRef.current;
    if (p.isDashing || p.stamina < 15 || p.isGliding || p.isClimbing) return;
    p.stamina = Math.max(0, p.stamina - 15);
    p.isDashing = true;
    p.dashTimer = 16;
    p.invulnerableTimer = 16;
    playZeldaSfx('slash');

    flurryRushTimerRef.current = 90;
    setFlurryActive(true);
    playZeldaSfx('flurry_warp');
  };

  const toggleShieldSurfing = () => {
    const p = playerStatsRef.current;
    if (p.isSurfing) {
      p.isSurfing = false;
    } else if (p.stamina > 15 && !p.isClimbing) {
      p.isSurfing = true;
      playZeldaSfx('surf_slide');
      setHudStats(prev => ({ ...prev, message: '🏂 SHIELD SURFING! Meluncur di perisai Hylian!' }));
    }
  };

  const toggleParaglider = () => {
    const p = playerStatsRef.current;
    if (p.isGliding) {
      p.isGliding = false;
    } else if (p.stamina > 15) {
      p.isGliding = true;
      p.isClimbing = false;
      p.isSurfing = false;
      playZeldaSfx('glide_wind');

      const inUpdraft = updraftsRef.current.some(u => Math.hypot(p.x - u.x, p.z - u.z) < u.radius);
      if (inUpdraft) {
        p.vy = 16;
        playZeldaSfx('flurry_warp');
        setHudStats(prev => ({ ...prev, message: '🔥 ANGIN PANAS UPDRAFT! TERBANG MEMBUBUNG TINGGI!' }));
      }
    }
  };

  // Real 3D Sheikah Bomb Drop & Detonate
  const handleRemoteBomb = () => {
    const p = playerStatsRef.current;
    if (activeBomb3DRef.current) {
      // Detonate active bomb!
      playZeldaSfx('bomb_explode');
      const b = activeBomb3DRef.current;

      if (sceneRef.current) {
        sceneRef.current.remove(b.mesh);
      }

      // Check damage to Bokoblin & Guardian
      const bokoDist = Math.hypot(b.mesh.position.x - bokoStatsRef.current.x, b.mesh.position.z - bokoStatsRef.current.z);
      if (bokoDist < 8) {
        bokoStatsRef.current.hp = Math.max(0, bokoStatsRef.current.hp - 50);
        playZeldaSfx('hit');
      }

      // Create updraft zone
      updraftsRef.current.push({
        x: b.mesh.position.x,
        z: b.mesh.position.z,
        radius: 8,
        timer: 450
      });

      activeBomb3DRef.current = null;
      setHudStats(prev => ({ ...prev, hasBombActive: false, message: '💥 BOM MELEDAK! Updraft angin panas tercipta!' }));
    } else {
      // Spawn new 3D Sheikah Bomb
      playZeldaSfx('bomb_drop');
      if (sceneRef.current) {
        const bombGeo = new THREE.SphereGeometry(0.65, 16, 16);
        const bombMat = new THREE.MeshStandardMaterial({
          color: '#0284c7',
          emissive: '#38bdf8',
          emissiveIntensity: 0.9,
          roughness: 0.2
        });
        const bombMesh = new THREE.Mesh(bombGeo, bombMat);
        bombMesh.position.set(p.x, p.y + 0.6, p.z);
        sceneRef.current.add(bombMesh);

        activeBomb3DRef.current = {
          mesh: bombMesh,
          vx: Math.sin(p.rotY) * 0.4,
          vz: Math.cos(p.rotY) * 0.4,
          timer: 0
        };
        setHudStats(prev => ({ ...prev, hasBombActive: true, message: '💣 Bom diletakkan! Tekan lagi untuk meledakkan!' }));
      }
    }
  };

  // Turn Camera Left / Right (For touch users)
  const turnCamera = (dir: number) => {
    camOrbitRef.current.yaw += dir * 0.35;
  };

  const handleOpenCooking = () => {
    const p = playerStatsRef.current;
    if (p.meat < 1 && p.apples < 1) {
      setHudStats(prev => ({ ...prev, message: 'Bahan tidak cukup! Cari apel atau berburu daging.' }));
      return;
    }

    let dishName = 'Baked Apple';
    let dishDesc = 'Apel panggang manis yang memulihkan 2 Hati!';
    let icon = '🍎';
    let bonusHeal = 8;

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

  const handleEatMeal = () => {
    const p = playerStatsRef.current;
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

  // --- THREE.JS 3D SCENE SETUP & ENGINE ---
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#38bdf8');
    scene.fog = new THREE.FogExp2('#38bdf8', 0.007);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 800);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.8);
    sunLight.position.set(60, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);

    // 5. 3D Procedural Terrain
    const terrainGeo = new THREE.PlaneGeometry(280, 280, 80, 80);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    const colors: number[] = [];

    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const vy = getTerrainHeight(vx, vz);
      posAttr.setY(i, vy);

      if (vy < -1.0) {
        colors.push(0.85, 0.8, 0.6);
      } else if (vx > 30 && vz > 30) {
        colors.push(0.65, 0.35, 0.25);
      } else if (Math.hypot(vx - 75, vz - (-75)) < 25) {
        colors.push(0.12, 0.16, 0.24);
      } else {
        const g = 0.55 + Math.sin(vx * 0.1) * 0.1;
        colors.push(0.18, g, 0.22);
      }
    }
    terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.1
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // 6. 3D Instanced Swaying Grass
    const grassCount = 180;
    const grassBladeGeo = new THREE.ConeGeometry(0.15, 0.9, 4);
    const grassBladeMat = new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 0.7 });
    const instancedGrass = new THREE.InstancedMesh(grassBladeGeo, grassBladeMat, grassCount);

    const dummy = new THREE.Object3D();
    for (let g = 0; g < grassCount; g++) {
      const gx = (Math.random() - 0.5) * 200;
      const gz = (Math.random() - 0.5) * 200;
      const gy = getTerrainHeight(gx, gz);
      dummy.position.set(gx, gy + 0.45, gz);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();
      instancedGrass.setMatrixAt(g, dummy.matrix);
    }
    scene.add(instancedGrass);

    // 7. 3D Rain Particle System
    const rainCount = 600;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let r = 0; r < rainCount * 3; r += 3) {
      rainPositions[r] = (Math.random() - 0.5) * 160;
      rainPositions[r + 1] = Math.random() * 40;
      rainPositions[r + 2] = (Math.random() - 0.5) * 160;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: '#93c5fd',
      size: 0.35,
      transparent: true,
      opacity: 0.7
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    rainParticles.visible = false;
    scene.add(rainParticles);

    // 8. 3D Water Surface (Lake Klaten)
    const waterGeo = new THREE.CircleGeometry(42, 32);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.75
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(-50, -1.2, 50);
    scene.add(waterMesh);

    // 9. 3D Ancient Shrine (Reruntuhan Kuil Kuno)
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(75, 5.5, -75);

    const pillarMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 });
    const runeMat = new THREE.MeshStandardMaterial({ color: '#06b6d4', emissive: '#06b6d4', emissiveIntensity: 0.8 });

    for (let p = 0; p < 6; p++) {
      const pAng = (p / 6) * Math.PI * 2;
      const pilMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 9, 2), pillarMat);
      pilMesh.position.set(Math.cos(pAng) * 16, 4.5, Math.sin(pAng) * 16);
      pilMesh.castShadow = true;
      shrineGroup.add(pilMesh);

      const runeMesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1, 2.1), runeMat);
      runeMesh.position.set(Math.cos(pAng) * 16, 6.5, Math.sin(pAng) * 16);
      shrineGroup.add(runeMesh);
    }
    scene.add(shrineGroup);

    // 10. 3D Trees with Apples
    const treeTrunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 3.5, 8);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
    const treeFoliageGeo = new THREE.DodecahedronGeometry(2.5);
    const treeFoliageMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.7 });
    const appleGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const appleMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.3 });

    const treeLocations = [
      { x: -15, z: -20 }, { x: 20, z: -15 }, { x: -35, z: -40 },
      { x: 10, z: 25 }, { x: -25, z: 15 }, { x: 45, z: -10 },
      { x: -65, z: -20 }, { x: 30, z: -50 }, { x: -10, z: 45 },
      { x: 55, z: 10 }, { x: -45, z: -65 }, { x: 60, z: 50 }
    ];

    treeLocations.forEach(loc => {
      const ty = getTerrainHeight(loc.x, loc.z);
      const tree = new THREE.Group();
      tree.position.set(loc.x, ty, loc.z);

      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
      trunk.position.y = 1.75;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(treeFoliageGeo, treeFoliageMat);
      foliage.position.y = 4.2;
      foliage.castShadow = true;
      tree.add(foliage);

      const app1 = new THREE.Mesh(appleGeo, appleMat);
      app1.position.set(1.2, 3.8, 1.2);
      tree.add(app1);

      const app2 = new THREE.Mesh(appleGeo, appleMat);
      app2.position.set(-1.2, 4.0, -1.0);
      tree.add(app2);

      scene.add(tree);
    });

    // 11. 3D Campfire & Tripod Cooking Pot
    const campGroup = new THREE.Group();
    campGroup.position.set(8, getTerrainHeight(8, 8), 8);

    const stoneGeo = new THREE.DodecahedronGeometry(0.35);
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#64748b' });
    for (let s = 0; s < 8; s++) {
      const sa = (s / 8) * Math.PI * 2;
      const st = new THREE.Mesh(stoneGeo, stoneMat);
      st.position.set(Math.cos(sa) * 1.2, 0.2, Math.sin(sa) * 1.2);
      campGroup.add(st);
    }

    const fireLight = new THREE.PointLight('#f97316', 3.5, 18);
    fireLight.position.set(0, 1.2, 0);
    campGroup.add(fireLight);

    const flameGeo = new THREE.ConeGeometry(0.5, 1.4, 8);
    const flameMat = new THREE.MeshStandardMaterial({
      color: '#f97316',
      emissive: '#fef08a',
      emissiveIntensity: 1.0,
      roughness: 0.1
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.y = 0.7;
    campGroup.add(flameMesh);

    const potGeo = new THREE.CylinderGeometry(0.7, 0.5, 0.6, 12);
    const potMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4, metalness: 0.8 });
    const potMesh = new THREE.Mesh(potGeo, potMat);
    potMesh.position.y = 1.3;
    campGroup.add(potMesh);
    scene.add(campGroup);

    // 12. 3D PLAYER MODEL (Link / Mas Bumi)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, getTerrainHeight(0, 0), 0);

    const tunicMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.6 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.9, 0.45), tunicMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    playerGroup.add(torso);

    const skinMat = new THREE.MeshStandardMaterial({ color: '#fed7aa', roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.5 });

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), skinMat);
    head.position.y = 1.8;
    head.castShadow = true;
    playerGroup.add(head);

    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.35, 0.52), hairMat);
    hair.position.y = 1.95;
    playerGroup.add(hair);

    const pantsMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.8 });
    const bootMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.7 });

    const legLeft = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.28), pantsMat);
    legLeft.position.set(-0.2, 0.45, 0);
    legLeft.castShadow = true;
    playerGroup.add(legLeft);

    const legRight = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.28), pantsMat);
    legRight.position.set(0.2, 0.45, 0);
    legRight.castShadow = true;
    playerGroup.add(legRight);

    const bootLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.35), bootMat);
    bootLeft.position.set(-0.2, 0.12, 0.04);
    bootLeft.castShadow = true;
    playerGroup.add(bootLeft);

    const bootRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.35), bootMat);
    bootRight.position.set(0.2, 0.12, 0.04);
    bootRight.castShadow = true;
    playerGroup.add(bootRight);

    // MASTER SWORD 3D
    const swordGroup = new THREE.Group();
    swordGroup.position.set(0.45, 1.1, 0.2);

    const bladeMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      emissive: '#38bdf8',
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.2
    });
    const hiltMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', metalness: 0.7 });
    const guardMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8 });

    const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.04), bladeMat);
    swordBlade.position.y = 0.8;
    swordBlade.castShadow = true;
    swordGroup.add(swordBlade);

    const swordGuard = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.1), guardMat);
    swordGuard.position.y = 0.1;
    swordGroup.add(swordGuard);

    const swordHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), hiltMat);
    swordHilt.position.y = -0.1;
    swordGroup.add(swordHilt);

    playerGroup.add(swordGroup);

    // HYLIAN SHIELD 3D
    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(-0.45, 1.1, 0.1);

    const shieldMat = new THREE.MeshStandardMaterial({ color: '#1d4ed8', metalness: 0.5, roughness: 0.4 });
    const triforceMat = new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#facc15', emissiveIntensity: 0.4 });

    const shieldBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.08), shieldMat);
    shieldBody.castShadow = true;
    shieldGroup.add(shieldBody);

    const triforceBadge = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 3), triforceMat);
    triforceBadge.position.set(0, 0.15, 0.05);
    triforceBadge.rotateZ(Math.PI);
    shieldGroup.add(triforceBadge);

    playerGroup.add(shieldGroup);

    // PARAGLIDER 3D
    const paragliderGroup = new THREE.Group();
    paragliderGroup.position.set(0, 2.3, 0);

    const gliderSailMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.7 });
    const gliderBarMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });

    const gliderSail = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 1.4), gliderSailMat);
    paragliderGroup.add(gliderSail);

    const gliderBar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 6), gliderBarMat);
    gliderBar.rotateZ(Math.PI / 2);
    paragliderGroup.add(gliderBar);

    paragliderGroup.visible = false;
    playerGroup.add(paragliderGroup);

    scene.add(playerGroup);

    // 13. 3D BOKOBLIN ENEMY
    const bokoGroup = new THREE.Group();
    bokoGroup.position.set(25, getTerrainHeight(25, -25), -25);
    const bokoMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.7 });
    const bokoBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.65), bokoMat);
    bokoBody.position.y = 0.55;
    bokoBody.castShadow = true;
    bokoGroup.add(bokoBody);

    const hornMat = new THREE.MeshStandardMaterial({ color: '#fef08a' });
    const bokoHorn = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 4), hornMat);
    bokoHorn.position.y = 1.3;
    bokoGroup.add(bokoHorn);

    scene.add(bokoGroup);
    bokoStatsRef.current.mesh = bokoGroup;

    // 14. 3D ANCIENT GUARDIAN STALKER
    const guardianGroup = new THREE.Group();
    guardianGroup.position.set(75, 5.5, -75);

    const guardianChassisMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7, metalness: 0.4 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#ef4444', emissiveIntensity: 1.2 });

    const guardianDome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65), guardianChassisMat);
    guardianDome.position.y = 1.2;
    guardianDome.castShadow = true;
    guardianGroup.add(guardianDome);

    const eyeTurret = new THREE.Group();
    eyeTurret.position.set(0, 2.2, 0);

    const eyeHead = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2), guardianChassisMat);
    eyeTurret.add(eyeHead);

    const eyeLens = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), eyeMat);
    eyeLens.position.set(0, 0, 1.1);
    eyeTurret.add(eyeLens);

    guardianGroup.add(eyeTurret);

    const laserLineGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
    laserLineGeo.rotateX(Math.PI / 2);
    const laserLineMat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      emissive: '#ef4444',
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.9
    });
    const laserBeamMesh = new THREE.Mesh(laserLineGeo, laserLineMat);
    laserBeamMesh.visible = false;
    scene.add(laserBeamMesh);

    const legPoles: THREE.Mesh[] = [];
    const legPoleGeo = new THREE.CylinderGeometry(0.18, 0.25, 4.2, 6);
    const legPoleMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.8 });

    for (let l = 0; l < 6; l++) {
      const la = (l / 6) * Math.PI * 2;
      const leg = new THREE.Mesh(legPoleGeo, legPoleMat);
      leg.position.set(Math.cos(la) * 2.8, 1.5, Math.sin(la) * 2.8);
      leg.rotation.z = Math.cos(la) * 0.4;
      leg.rotation.x = Math.sin(la) * 0.4;
      leg.castShadow = true;
      guardianGroup.add(leg);
      legPoles.push(leg);
    }

    scene.add(guardianGroup);

    // Pointer Events for 3D Camera Orbit
    const onPointerDown = (e: PointerEvent) => {
      camOrbitRef.current.isDragging = true;
      camOrbitRef.current.lastMouseX = e.clientX;
      camOrbitRef.current.lastMouseY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!camOrbitRef.current.isDragging) return;
      const dx = e.clientX - camOrbitRef.current.lastMouseX;
      const dy = e.clientY - camOrbitRef.current.lastMouseY;
      camOrbitRef.current.lastMouseX = e.clientX;
      camOrbitRef.current.lastMouseY = e.clientY;

      camOrbitRef.current.yaw -= dx * 0.008;
      camOrbitRef.current.pitch = Math.max(0.1, Math.min(1.2, camOrbitRef.current.pitch + dy * 0.006));
    };

    const onPointerUp = () => {
      camOrbitRef.current.isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 15. MAIN 3D ANIMATION & GAME LOOP
    let animId: number;
    let guardianTimer = 0;
    let botwPianoTimer = 0;

    const animate = () => {
      const p = playerStatsRef.current;
      const isBulletTime = flurryRushTimerRef.current > 0;
      const timeScale = isBulletTime ? 0.2 : 1.0;

      // Update time of day
      timeOfDayRef.current = (timeOfDayRef.current + 0.00008) % 1;
      const tod = timeOfDayRef.current;
      if (tod < 0.2) setCurrentTimePhase('Pagi');
      else if (tod < 0.5) setCurrentTimePhase('Siang');
      else if (tod < 0.75) setCurrentTimePhase('Senja');
      else setCurrentTimePhase('Malam');

      // Update Weather Cycle
      weatherTimerRef.current += 1;
      if (weatherTimerRef.current % 1800 === 0) {
        const roll = Math.random();
        if (roll < 0.6) {
          setCurrentWeather('Cerah');
          rainParticles.visible = false;
          scene.background = new THREE.Color('#38bdf8');
          scene.fog = new THREE.FogExp2('#38bdf8', 0.007);
        } else if (roll < 0.85) {
          setCurrentWeather('Hujan');
          rainParticles.visible = true;
          scene.background = new THREE.Color('#64748b');
          scene.fog = new THREE.FogExp2('#64748b', 0.012);
        } else {
          setCurrentWeather('Badai Petir');
          rainParticles.visible = true;
          scene.background = new THREE.Color('#334155');
          scene.fog = new THREE.FogExp2('#334155', 0.015);
        }
      }

      // Rain animation
      if (rainParticles.visible) {
        const positions = rainParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.8;
          if (positions[i] < 0) positions[i] = 40;
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;

        if (currentWeather === 'Badai Petir' && Math.random() < 0.006) {
          ambientLight.intensity = 3.5;
          playZeldaSfx('thunder');
          setTimeout(() => { ambientLight.intensity = 0.65; }, 80);
        }
      }

      // Flurry Rush Timer
      if (flurryRushTimerRef.current > 0) {
        flurryRushTimerRef.current--;
        if (flurryRushTimerRef.current <= 0) {
          setFlurryActive(false);
        }
      }

      // Ambient BOTW Piano melody
      botwPianoTimer++;
      if (botwPianoTimer > 400 && Math.random() < 0.008) {
        botwPianoTimer = 0;
        playZeldaSfx('botw_piano');
      }

      // Update Updraft zones
      updraftsRef.current.forEach(u => { u.timer -= timeScale; });
      updraftsRef.current = updraftsRef.current.filter(u => u.timer > 0);

      // Input directions
      let moveForward = 0;
      let moveRight = 0;

      if (keysRef.current['w'] || keysRef.current['W'] || keysRef.current['ArrowUp']) moveForward += 1;
      if (keysRef.current['s'] || keysRef.current['S'] || keysRef.current['ArrowDown']) moveForward -= 1;
      if (keysRef.current['d'] || keysRef.current['D'] || keysRef.current['ArrowRight']) moveRight += 1;
      if (keysRef.current['a'] || keysRef.current['A'] || keysRef.current['ArrowLeft']) moveRight -= 1;

      if (touchDpadRef.current.dx !== 0 || touchDpadRef.current.dy !== 0) {
        moveRight = touchDpadRef.current.dx;
        moveForward = -touchDpadRef.current.dy;
      }

      // Climbing Detection
      const nextX = p.x + Math.sin(p.rotY) * 1.5;
      const nextZ = p.z + Math.cos(p.rotY) * 1.5;
      const heightDiff = getTerrainHeight(nextX, nextZ) - p.y;

      if (heightDiff > 2.0 && moveForward > 0 && p.stamina > 5) {
        p.isClimbing = true;
        p.isGliding = false;
        p.isSurfing = false;
        p.stamina -= 0.35;
        p.y += 0.12 * timeScale;
      } else if (p.isClimbing) {
        if (p.stamina <= 0 || moveForward === 0) {
          p.isClimbing = false;
        }
      }

      // Shield Surfing
      if (p.isSurfing) {
        p.stamina -= 0.2;
        if (p.stamina <= 0) p.isSurfing = false;

        shieldGroup.position.set(0, 0.05, 0);
        shieldGroup.rotation.x = Math.PI / 2;
        p.vx = Math.sin(p.rotY) * 0.55;
        p.vz = Math.cos(p.rotY) * 0.55;
      } else if (!p.isBlocking) {
        shieldGroup.position.set(-0.45, 1.1, 0.1);
        shieldGroup.rotation.set(0, 0, 0);
      }

      // Move player relative to camera yaw
      if ((moveForward !== 0 || moveRight !== 0) && !p.isClimbing && !p.isSurfing) {
        const inputAngle = Math.atan2(moveRight, moveForward);
        const moveAngle = camOrbitRef.current.yaw + inputAngle;

        const spd = (p.isGliding ? 0.45 : p.isBlocking ? 0.12 : 0.28) * timeScale;
        p.vx = Math.sin(moveAngle) * spd;
        p.vz = Math.cos(moveAngle) * spd;
        p.rotY = moveAngle;

        p.runCycle += 0.25 * timeScale;
        legLeft.rotation.x = Math.sin(p.runCycle) * 0.7;
        legRight.rotation.x = -Math.sin(p.runCycle) * 0.7;
      } else if (!p.isSurfing) {
        p.vx *= 0.8;
        p.vz *= 0.8;
        legLeft.rotation.x = 0;
        legRight.rotation.x = 0;
      }

      // Paraglider
      if (p.isGliding) {
        p.stamina -= 0.35;
        if (p.stamina <= 0) p.isGliding = false;
        paragliderGroup.visible = true;
      } else {
        paragliderGroup.visible = false;
        if (!p.isDashing && !p.isSpinAttacking && !p.isClimbing && !p.isSurfing && p.stamina < p.maxStamina) {
          p.stamina = Math.min(p.maxStamina, p.stamina + 0.4);
        }
      }

      // Player Position & Gravity
      p.x += p.vx;
      p.z += p.vz;
      p.y += p.vy * timeScale;

      const groundY = getTerrainHeight(p.x, p.z) + (p.isGliding ? 2.5 : 0);
      if (p.y < groundY && !p.isClimbing) {
        p.y = groundY;
        p.vy = 0;
      } else if (p.y > groundY) {
        p.vy -= 0.5 * timeScale;
      }

      playerGroup.position.set(p.x, p.y, p.z);
      playerGroup.rotation.y = p.rotY;

      // 3D Arrows Update & Collision
      arrows3DRef.current.forEach(arrow => {
        arrow.mesh.position.x += arrow.vx * timeScale;
        arrow.mesh.position.y += arrow.vy * timeScale;
        arrow.mesh.position.z += arrow.vz * timeScale;
        arrow.vy -= 0.015 * timeScale; // Ballistic gravity
        arrow.life -= timeScale;

        // Collision with Bokoblin
        const b = bokoStatsRef.current;
        if (b.hp > 0 && Math.hypot(arrow.mesh.position.x - b.x, arrow.mesh.position.z - b.z) < 1.8) {
          b.hp = Math.max(0, b.hp - 35);
          playZeldaSfx('hit');
          arrow.life = 0;
          if (b.hp <= 0) {
            p.rupees += 20;
            p.meat += 1;
            playZeldaSfx('rupee_get');
          }
        }

        // Collision with Guardian
        const gDist = Math.hypot(arrow.mesh.position.x - guardianGroup.position.x, arrow.mesh.position.z - guardianGroup.position.z);
        if (gDist < 3.5) {
          playZeldaSfx('hit');
          arrow.life = 0;
        }

        if (arrow.life <= 0) {
          scene.remove(arrow.mesh);
        }
      });
      arrows3DRef.current = arrows3DRef.current.filter(a => a.life > 0);

      // 3D Bomb Update
      if (activeBomb3DRef.current) {
        const bomb = activeBomb3DRef.current;
        bomb.mesh.position.x += bomb.vx * timeScale;
        bomb.mesh.position.z += bomb.vz * timeScale;
        bomb.mesh.position.y = getTerrainHeight(bomb.mesh.position.x, bomb.mesh.position.z) + 0.6;
        bomb.vx *= 0.96;
        bomb.vz *= 0.96;
        bomb.timer++;

        const s = 1.0 + Math.sin(bomb.timer * 0.2) * 0.15;
        bomb.mesh.scale.set(s, s, s);
      }

      // 3D Bokoblin AI (Chases Link in 3D)
      const b = bokoStatsRef.current;
      if (b.hp > 0 && b.mesh) {
        b.mesh.visible = true;
        const distToPlayer = Math.hypot(p.x - b.x, p.z - b.z);
        if (distToPlayer < 28 && distToPlayer > 1.8) {
          const ang = Math.atan2(p.x - b.x, p.z - b.z);
          b.x += Math.sin(ang) * 0.14 * timeScale;
          b.z += Math.cos(ang) * 0.14 * timeScale;
          b.y = getTerrainHeight(b.x, b.z);
          b.mesh.position.set(b.x, b.y, b.z);
          b.mesh.rotation.y = ang;
        } else if (distToPlayer <= 1.8) {
          // Bokoblin attacks Link
          b.attackCooldown -= timeScale;
          if (b.attackCooldown <= 0) {
            b.attackCooldown = 75;
            if (p.isBlocking) {
              playZeldaSfx('parry');
              p.stamina = Math.max(0, p.stamina - 15);
            } else if (p.invulnerableTimer <= 0) {
              p.hearts = Math.max(0, p.hearts - 4);
              p.invulnerableTimer = 35;
              playZeldaSfx('hit');
              if (p.hearts <= 0) setGameState('gameover');
            }
          }
        }
      } else if (b.mesh) {
        b.mesh.visible = false;
      }

      // Sword Attack Animation
      if (p.isAttacking) {
        p.attackTimer--;
        swordGroup.rotation.z = Math.sin((16 - p.attackTimer) * 0.4) * 1.8;
        swordGroup.rotation.x = Math.cos((16 - p.attackTimer) * 0.4) * 1.2;

        const distToG = Math.hypot(p.x - guardianGroup.position.x, p.z - guardianGroup.position.z);
        if (distToG < 6.5) {
          const legIdx = Math.floor(Math.random() * 6);
          if (guardianLegsHpRef.current[legIdx] > 0) {
            guardianLegsHpRef.current[legIdx] -= 25;
            playZeldaSfx('hit');
            if (guardianLegsHpRef.current[legIdx] <= 0) {
              legPoles[legIdx].visible = false;
              playZeldaSfx('bomb_explode');
              p.rupees += 35;
              setHudStats(prev => ({
                ...prev,
                message: '💥 KAKI GUARDIAN PUTUS! Robot kuno melambat! (+35 Rupee)'
              }));
            }
          }
        }

        if (p.attackTimer <= 0) {
          p.isAttacking = false;
          swordGroup.rotation.set(0, 0, 0);
        }
      } else if (p.isSpinAttacking) {
        p.spinTimer--;
        playerGroup.rotation.y += 0.6;
        swordGroup.rotation.z = 1.5;
        if (p.spinTimer <= 0) {
          p.isSpinAttacking = false;
          swordGroup.rotation.set(0, 0, 0);
        }
      }

      // Shield Guard Pose
      if (p.isBlocking && !p.isSurfing) {
        shieldGroup.position.set(-0.2, 1.1, 0.45);
        shieldGroup.rotation.y = 0.5;
      }

      // Guardian AI & Laser
      guardianTimer += 0.05 * timeScale;
      legPoles.forEach((leg, idx) => {
        if (leg.visible) {
          leg.rotation.x = Math.sin(guardianTimer + idx) * 0.35;
        }
      });

      const distToGuardian = Math.hypot(p.x - guardianGroup.position.x, p.z - guardianGroup.position.z);
      if (distToGuardian < 75) {
        eyeTurret.lookAt(p.x, p.y + 1.2, p.z);
        laserBeamMesh.visible = true;

        const gPos = new THREE.Vector3();
        eyeLens.getWorldPosition(gPos);
        const pPos = new THREE.Vector3(p.x, p.y + 1.2, p.z);

        const mid = gPos.clone().add(pPos).multiplyScalar(0.5);
        laserBeamMesh.position.copy(mid);
        laserBeamMesh.lookAt(pPos);
        laserBeamMesh.scale.set(1, 1, gPos.distanceTo(pPos));

        if (Math.random() < 0.05) {
          playZeldaSfx('guardian_panic');
        }
        if (Math.random() < 0.04) {
          playZeldaSfx('guardian_beep');
        }
      } else {
        laserBeamMesh.visible = false;
      }

      // 3D Third-Person Camera Follow
      const camYaw = camOrbitRef.current.yaw;
      const camPitch = camOrbitRef.current.pitch;
      const camDist = camOrbitRef.current.dist;

      const targetCamX = p.x + Math.sin(camYaw) * Math.cos(camPitch) * camDist;
      const targetCamY = p.y + 1.8 + Math.sin(camPitch) * camDist;
      const targetCamZ = p.z + Math.cos(camYaw) * Math.cos(camPitch) * camDist;

      camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
      camera.lookAt(p.x, p.y + 1.4, p.z);

      fireLight.intensity = 3.0 + Math.sin(Date.now() * 0.02) * 0.8;

      // Update HUD
      const remainingLegs = guardianLegsHpRef.current.filter(hp => hp > 0).length;
      setHudStats(prev => ({
        ...prev,
        hearts: p.hearts,
        stamina: Math.round(p.stamina),
        apples: p.apples,
        meat: p.meat,
        mealsCount: p.cookedMeals.length,
        arrows: p.arrows,
        rupees: p.rupees,
        korokSeeds: p.korokSeeds,
        bokoHp: bokoStatsRef.current.hp,
        legsRemaining: remainingLegs,
        isClimbing: p.isClimbing,
        isSurfing: p.isSurfing,
        nearCookingPot: Math.hypot(p.x - 8, p.z - 8) < 4.5
      }));

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [playZeldaSfx]);

  // Keyboard Event Listeners (Bound once cleanly with zero lag)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;

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
      } else if (e.key === 'r' || e.key === 'R') {
        toggleShieldSurfing();
      } else if (e.key === 'e' || e.key === 'E') {
        if (hudStats.nearCookingPot) {
          handleOpenCooking();
        } else {
          handleEatMeal();
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
  }, [hudStats.nearCookingPot]);

  const renderZeldaHearts = () => {
    const totalHearts = Math.ceil(hudStats.maxHearts / 4);
    const hearts = [];

    for (let i = 0; i < totalHearts; i++) {
      const remainingQuarters = Math.max(0, Math.min(4, hudStats.hearts - i * 4));
      const fillPct = remainingQuarters / 4;

      hearts.push(
        <div key={i} className="relative w-5 h-5 flex items-center justify-center">
          <Heart className="w-5 h-5 text-slate-700 dark:text-slate-800 fill-slate-800/80" />
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
    <div className={`rounded-3xl p-4 sm:p-6 border transition-all select-none touch-none ${
      isDarkMode 
        ? 'bg-[#040d1a] border-cyan-800/80 shadow-2xl text-slate-100' 
        : 'bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 border-sky-300 shadow-xl text-slate-800'
    }`}>
      <div className="space-y-4">
        {/* TOP BAR: SHEIKAH SLATE HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-xs font-mono-tech shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {renderZeldaHearts()}
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-cyan-400/30 text-cyan-300">
              {currentTimePhase === 'Malam' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span>{currentTimePhase}</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-sky-400/30 text-sky-300">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>{currentWeather}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
              <span>💎</span>
              <span>{hudStats.rupees}</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
              <span>🍃</span>
              <span>{hudStats.korokSeeds}</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold">
              <span>🤖 Kaki: {hudStats.legsRemaining}/6</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-sky-950/80 border border-sky-500/40 text-sky-300 font-bold">
              <span>🏹 {hudStats.arrows}</span>
            </div>

            <button
              onPointerDown={() => setSoundEnabled(!soundEnabled)}
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

        {/* 3D WEBGL CANVAS CONTAINER */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)] bg-slate-950 touch-none">
          <div 
            ref={mountRef} 
            className="w-full h-[520px] block cursor-grab active:cursor-grabbing select-none touch-none"
          />

          {/* 3D Mini-Compass / Radar (Top Right) */}
          <div className="absolute top-4 right-4 w-28 h-28 rounded-2xl bg-slate-950/90 border-2 border-cyan-500/40 shadow-lg p-2 pointer-events-none text-center">
            <div className="relative w-full h-16 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
              <Compass className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
            <span className="text-[9px] font-mono-tech font-bold text-cyan-300 block mt-1">
              KOMPAS 3D
            </span>
          </div>

          {/* Status Badges: Climbing & Surfing */}
          {hudStats.isClimbing && (
            <div className="absolute top-4 left-4 px-4 py-1.5 rounded-xl bg-emerald-600/90 text-white font-black text-xs font-mono-tech shadow-xl animate-pulse flex items-center gap-2 pointer-events-none">
              <Mountain className="w-4 h-4" />
              <span>MEMANJAT TEBING / POHON!</span>
            </div>
          )}
          {hudStats.isSurfing && (
            <div className="absolute top-4 left-4 px-4 py-1.5 rounded-xl bg-blue-600/90 text-white font-black text-xs font-mono-tech shadow-xl animate-pulse flex items-center gap-2 pointer-events-none">
              <Shield className="w-4 h-4" />
              <span>SHIELD SURFING!</span>
            </div>
          )}

          {/* Flurry Rush Bullet Time Banner */}
          {flurryActive && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-cyan-500/90 text-slate-950 font-black text-xs font-mono-tech shadow-xl animate-pulse pointer-events-none flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>3D FLURRY RUSH! TEKAN TEBAS SECEPATNYA!</span>
            </div>
          )}

          {/* Screen Notifications */}
          {hudStats.message && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-amber-500/95 text-slate-950 font-bold text-xs font-mono-tech shadow-lg animate-bounce pointer-events-none">
              {hudStats.message}
            </div>
          )}

          {/* Context Action Prompt (Masak) */}
          {hudStats.nearCookingPot && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-400 text-amber-300 font-bold text-xs font-mono-tech shadow-lg animate-pulse flex items-center gap-2 pointer-events-none">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Tekan [E] untuk Memasak di Panci 3D!</span>
            </div>
          )}

          {/* Quick Camera Rotate Buttons on Canvas (Left & Right) */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <button
              onPointerDown={(e) => { e.preventDefault(); turnCamera(1); }}
              className="p-3 rounded-2xl bg-slate-900/80 active:bg-cyan-600 border border-cyan-400/50 text-cyan-300 active:text-white shadow-lg active:scale-90 transition-all flex items-center gap-1 text-xs font-mono-tech cursor-pointer touch-none"
              title="Putar Kamera Kiri"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Putar ◀</span>
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); turnCamera(-1); }}
              className="p-3 rounded-2xl bg-slate-900/80 active:bg-cyan-600 border border-cyan-400/50 text-cyan-300 active:text-white shadow-lg active:scale-90 transition-all flex items-center gap-1 text-xs font-mono-tech cursor-pointer touch-none"
              title="Putar Kamera Kanan"
            >
              <span>Putar ▶</span>
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* COOKING MODAL */}
          {cookingModal && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center">
              {cookingModal.stage === 'cooking' ? (
                <div className="space-y-4 animate-bounce">
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                    🍲
                  </div>
                  <h4 className="text-xl font-black font-fun text-amber-300">
                    Memasak di Panci Kuno 3D...
                  </h4>
                  <p className="text-xs text-slate-300 font-mono-tech">
                    Bahan-bahan melompat di atas kobaran api unggun!
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
                    onPointerDown={() => setCookingModal(null)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs font-mono-tech cursor-pointer hover:scale-105 transition-all active:scale-95"
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
                LEGENDA MAS BUMI 3D: NEXT-GEN EDITION
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md font-sans leading-relaxed">
                Pengalaman Zelda: Breath of the Wild paling nyata dengan tombol responsif! Memanjat tebing & pohon, meluncur di perisai (*Shield Surfing*), tembak panah 3D nyata, ledakkan bom Sheikah 3D, potong 6 kaki robot Guardian, nikmati musik piano ambient BOTW dan cuaca dinamis!
              </p>

              <div className="grid grid-cols-2 gap-2.5 my-5 text-xs text-left max-w-md font-mono-tech bg-slate-900/80 p-4 rounded-2xl border border-cyan-500/30 text-slate-300">
                <div>⚔️ <strong>[J]</strong> Tebas / Potong Kaki</div>
                <div>🏹 <strong>[K]</strong> Panah 3D Nyata</div>
                <div>🛡️ <strong>[L]</strong> Perisai / Parry 3D</div>
                <div>⚡ <strong>[Spasi]</strong> Dash & Flurry 3D</div>
                <div>🧗 <strong>[W di Tebing]</strong> Panjat Tebing</div>
                <div>🏂 <strong>[R]</strong> Shield Surfing</div>
                <div>🪂 <strong>[G]</strong> Paraglider / Updraft</div>
                <div>💣 <strong>[Q]</strong> Bom Sheikah 3D</div>
              </div>

              <button
                onPointerDown={handleStartGame}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer font-mono-tech flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>MULAI PETUALANGAN NEXT-GEN! 🚀</span>
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
                Gunakan perisai untuk memantulkan laser Guardian dan bawa banyak bekal makanan daging panggang!
              </p>
              <button
                onPointerDown={handleStartGame}
                className="mt-5 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-xs shadow-xl cursor-pointer font-mono-tech flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
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
                Ancient Guardian Stalker 3D berhasil dilumpuhkan dan dikalahkan! Mas Bumi telah membuktikan diri sebagai Pahlawan sejati!
              </p>
              <button
                onPointerDown={handleStartGame}
                className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-xl cursor-pointer font-mono-tech flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>JELAJAHI DUNIA LAGI 🗺️</span>
              </button>
            </div>
          )}
        </div>

        {/* MOBILE TOUCH CONTROLS - ZERO LATENCY POINTER DOWN */}
        <div className="pt-2 max-w-xl mx-auto space-y-3 select-none touch-none font-mono-tech">
          {/* Action Buttons Row */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
            <button
              onPointerDown={(e) => { e.preventDefault(); handleAttack(); }}
              className="p-2.5 rounded-2xl bg-cyan-600 active:bg-cyan-400 border border-cyan-300 text-white font-black flex flex-col items-center justify-center gap-1 shadow-md shadow-cyan-600/40 cursor-pointer active:scale-90 transition-all touch-none"
            >
              <Sword className="w-5 h-5" />
              <span>TEBAS</span>
            </button>

            <button
              onPointerDown={(e) => { e.preventDefault(); handleSpinAttack(); }}
              className="p-2.5 rounded-2xl bg-teal-600 active:bg-teal-400 border border-teal-300 text-white font-black flex flex-col items-center justify-center gap-1 shadow-md shadow-teal-600/40 cursor-pointer active:scale-90 transition-all touch-none"
            >
              <Sparkles className="w-5 h-5" />
              <span>SPIN</span>
            </button>

            <button
              onPointerDown={(e) => { e.preventDefault(); handleShootArrow(); }}
              className="p-2.5 rounded-2xl bg-indigo-600 active:bg-indigo-400 border border-indigo-300 text-white font-black flex flex-col items-center justify-center gap-1 shadow-md shadow-indigo-600/40 cursor-pointer active:scale-90 transition-all touch-none"
            >
              <Crosshair className="w-5 h-5" />
              <span>PANAH</span>
            </button>

            <button
              onPointerDown={(e) => { e.preventDefault(); handleShieldDown(); }}
              onPointerUp={(e) => { e.preventDefault(); handleShieldUp(); }}
              onPointerLeave={handleShieldUp}
              onPointerCancel={handleShieldUp}
              className="p-2.5 rounded-2xl bg-blue-600 active:bg-blue-400 border border-blue-300 text-white font-black flex flex-col items-center justify-center gap-1 shadow-md shadow-blue-600/40 cursor-pointer active:scale-90 transition-all touch-none"
            >
              <Shield className="w-5 h-5" />
              <span>PARRY</span>
            </button>

            <button
              onPointerDown={(e) => { e.preventDefault(); handleDash(); }}
              className="p-2.5 rounded-2xl bg-emerald-600 active:bg-emerald-400 border border-emerald-300 text-white font-black flex flex-col items-center justify-center gap-1 shadow-md shadow-emerald-600/40 cursor-pointer active:scale-90 transition-all touch-none"
            >
              <Zap className="w-5 h-5" />
              <span>DASH</span>
            </button>

            <button
              onPointerDown={(e) => { e.preventDefault(); toggleShieldSurfing(); }}
              className="p-2.5 rounded-2xl bg-sky-600 active:bg-sky-400 border border-sky-300 text-white font-black flex flex-col items-center justify-center gap-1 shadow-md shadow-sky-600/40 cursor-pointer active:scale-90 transition-all touch-none"
            >
              <Mountain className="w-5 h-5" />
              <span>SURF</span>
            </button>

            <button
              onPointerDown={(e) => { e.preventDefault(); handleRemoteBomb(); }}
              className={`p-2.5 rounded-2xl border text-white font-black flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer active:scale-90 transition-all touch-none ${
                hudStats.hasBombActive 
                  ? 'bg-rose-600 active:bg-rose-400 border-rose-300 shadow-rose-600/50 animate-pulse' 
                  : 'bg-rose-600 active:bg-rose-400 border-rose-300 shadow-rose-600/40'
              }`}
            >
              <Bomb className="w-5 h-5" />
              <span>{hudStats.hasBombActive ? 'LEDAK' : 'BOM 3D'}</span>
            </button>

            <button
              onPointerDown={(e) => { e.preventDefault(); toggleParaglider(); }}
              className="p-2.5 rounded-2xl bg-amber-600 active:bg-amber-400 border border-amber-300 text-white font-black flex flex-col items-center justify-center gap-1 shadow-md shadow-amber-600/40 cursor-pointer active:scale-90 transition-all touch-none"
            >
              <Wind className="w-5 h-5" />
              <span>LAYANG</span>
            </button>
          </div>

          {/* D-Pad Navigation & Contextual Button */}
          <div className="flex items-center justify-between gap-4 pt-1">
            {/* D-Pad with Complete Pointer Safety */}
            <div className="grid grid-cols-3 gap-1.5 w-36 touch-none">
              <div />
              <button
                onPointerDown={(e) => { e.preventDefault(); touchDpadRef.current = { dx: 0, dy: -1 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerLeave={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerCancel={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="p-3.5 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-600 active:border-cyan-400 text-white font-black flex items-center justify-center shadow-md active:scale-90 transition-all touch-none"
              >
                ▲
              </button>
              <div />
              <button
                onPointerDown={(e) => { e.preventDefault(); touchDpadRef.current = { dx: -1, dy: 0 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerLeave={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerCancel={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="p-3.5 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-600 active:border-cyan-400 text-white font-black flex items-center justify-center shadow-md active:scale-90 transition-all touch-none"
              >
                ◀
              </button>
              <div className="flex items-center justify-center text-[10px] text-slate-500">
                <Compass className="w-5 h-5 text-cyan-400" />
              </div>
              <button
                onPointerDown={(e) => { e.preventDefault(); touchDpadRef.current = { dx: 1, dy: 0 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerLeave={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerCancel={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="p-3.5 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-600 active:border-cyan-400 text-white font-black flex items-center justify-center shadow-md active:scale-90 transition-all touch-none"
              >
                ▶
              </button>
              <div />
              <button
                onPointerDown={(e) => { e.preventDefault(); touchDpadRef.current = { dx: 0, dy: 1 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerLeave={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerCancel={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="p-3.5 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-600 active:border-cyan-400 text-white font-black flex items-center justify-center shadow-md active:scale-90 transition-all touch-none"
              >
                ▼
              </button>
              <div />
            </div>

            {/* Contextual Action Button (Masak di Panci / Makan Bekal) */}
            <div className="flex-1 max-w-xs">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  if (hudStats.nearCookingPot) handleOpenCooking();
                  else handleEatMeal();
                }}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 active:from-amber-400 active:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all touch-none"
              >
                {hudStats.nearCookingPot ? (
                  <>
                    <Flame className="w-5 h-5 text-orange-950" />
                    <span>MASAK DI PANCI 3D 🍲</span>
                  </>
                ) : (
                  <>
                    <span className="text-base">🍱</span>
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
