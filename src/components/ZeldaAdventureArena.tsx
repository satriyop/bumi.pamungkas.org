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
  Moon
} from 'lucide-react';

interface ZeldaAdventureArenaProps {
  isDarkMode?: boolean;
  playSound?: (type: 'swim' | 'coin' | 'hit' | 'tech') => void;
}

// Procedural 3D Terrain Height Function
function getTerrainHeight(x: number, z: number): number {
  // Center plains
  let h = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 3 + Math.sin(x * 0.08) * 1.2;

  // Lake depression (x < -30 && z > 20)
  const distToLake = Math.hypot(x - (-50), z - 50);
  if (distToLake < 45) {
    h -= (1 - distToLake / 45) * 6;
  }

  // Canyon crags (x > 30 && z > 30)
  if (x > 30 && z > 30) {
    h += Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5 + 3;
  }

  // Ancient Shrine plateau (x: 60..90, z: -90..-60)
  const distToShrine = Math.hypot(x - 75, z - (-75));
  if (distToShrine < 25) {
    h = 4.5 + Math.sin(distToShrine * 0.2) * 0.5;
  }

  return h;
}

export const ZeldaAdventureArena: React.FC<ZeldaAdventureArenaProps> = ({ isDarkMode = true, playSound }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'victory'>('intro');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Time of Day (Pagi, Siang, Senja, Malam)
  const timeOfDayRef = useRef(0.25); // 0.25 = noon
  const [currentTimePhase, setCurrentTimePhase] = useState<'Pagi' | 'Siang' | 'Senja' | 'Malam'>('Siang');

  // Flurry Rush (Bullet Time)
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

  // Player Stats Ref
  const playerStatsRef = useRef({
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vz: 0,
    rotY: 0,
    hearts: 20, // 5 hearts * 4 quarters
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
    invulnerableTimer: 0,
    runCycle: 0,
    apples: 5,
    meat: 2,
    cookedMeals: [{ name: 'Hearty Meat Skewer', type: 'heal', bonus: 8 }],
    arrows: 25,
    rupees: 100,
    korokSeeds: 0
  });

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
    nearCampfire: false,
    nearCookingPot: false,
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

  // Keys & Input
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const touchDpadRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Web Audio Synthesizer
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
      invulnerableTimer: 0,
      runCycle: 0,
      apples: 5,
      meat: 2,
      cookedMeals: [{ name: 'Hearty Meat Skewer', type: 'heal', bonus: 8 }],
      arrows: 25,
      rupees: 100,
      korokSeeds: 0
    };
    setGameState('playing');
    playZeldaSfx('secret_chime');
  };

  // Player Actions
  const handleAttack = () => {
    const p = playerStatsRef.current;
    if (p.isAttacking || p.isDashing || p.isGliding) return;
    p.isAttacking = true;
    p.attackTimer = 16;
    playZeldaSfx('slash');
  };

  const handleSpinAttack = () => {
    const p = playerStatsRef.current;
    if (p.stamina < 25) return;
    p.stamina = Math.max(0, p.stamina - 25);
    p.isSpinAttacking = true;
    p.spinTimer = 22;
    playZeldaSfx('spin');
  };

  const handleShootArrow = () => {
    const p = playerStatsRef.current;
    if (p.arrows <= 0 || p.isGliding) return;
    p.arrows--;
    playZeldaSfx('arrow');
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
    if (p.isDashing || p.stamina < 15 || p.isGliding) return;
    p.stamina = Math.max(0, p.stamina - 15);
    p.isDashing = true;
    p.dashTimer = 16;
    p.invulnerableTimer = 16;
    playZeldaSfx('slash');

    // Trigger Flurry Rush
    flurryRushTimerRef.current = 90;
    setFlurryActive(true);
    playZeldaSfx('flurry_warp');
  };

  const toggleParaglider = () => {
    const p = playerStatsRef.current;
    if (p.isGliding) {
      p.isGliding = false;
    } else if (p.stamina > 15) {
      p.isGliding = true;
      playZeldaSfx('glide_wind');
    }
  };

  const handleRemoteBomb = () => {
    playZeldaSfx('bomb_explode');
    setHudStats(prev => ({ ...prev, message: '💥 Bom Sheikah Meledak!' }));
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
    scene.background = new THREE.Color('#38bdf8');
    scene.fog = new THREE.FogExp2('#38bdf8', 0.008);

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

      // Vertex color blending based on biome & height
      if (vy < -1.0) {
        // Sand near water
        colors.push(0.85, 0.8, 0.6);
      } else if (vx > 30 && vz > 30) {
        // Canyon terracotta
        colors.push(0.65, 0.35, 0.25);
      } else if (Math.hypot(vx - 75, vz - (-75)) < 25) {
        // Shrine dark slate
        colors.push(0.12, 0.16, 0.24);
      } else {
        // Vibrant Hyrule Green Plains & Hills
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

    // 6. 3D Water Surface (Lake Klaten)
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

    // 7. 3D Ancient Shrine (Reruntuhan Kuil Kuno)
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(75, 4.5, -75);

    // Stone pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 });
    const runeMat = new THREE.MeshStandardMaterial({ color: '#06b6d4', emissive: '#06b6d4', emissiveIntensity: 0.8 });

    for (let p = 0; p < 6; p++) {
      const pAng = (p / 6) * Math.PI * 2;
      const pilMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 9, 2), pillarMat);
      pilMesh.position.set(Math.cos(pAng) * 16, 4.5, Math.sin(pAng) * 16);
      pilMesh.castShadow = true;
      shrineGroup.add(pilMesh);

      // Glowing rune stripe
      const runeMesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1, 2.1), runeMat);
      runeMesh.position.set(Math.cos(pAng) * 16, 6.5, Math.sin(pAng) * 16);
      shrineGroup.add(runeMesh);
    }
    scene.add(shrineGroup);

    // 8. 3D Trees with Apples
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

      // Hanging apples
      const app1 = new THREE.Mesh(appleGeo, appleMat);
      app1.position.set(1.2, 3.8, 1.2);
      tree.add(app1);

      const app2 = new THREE.Mesh(appleGeo, appleMat);
      app2.position.set(-1.2, 4.0, -1.0);
      tree.add(app2);

      scene.add(tree);
    });

    // 9. 3D Campfire & Tripod Cooking Pot
    const campGroup = new THREE.Group();
    campGroup.position.set(8, getTerrainHeight(8, 8), 8);

    // Stone ring
    const stoneGeo = new THREE.DodecahedronGeometry(0.35);
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#64748b' });
    for (let s = 0; s < 8; s++) {
      const sa = (s / 8) * Math.PI * 2;
      const st = new THREE.Mesh(stoneGeo, stoneMat);
      st.position.set(Math.cos(sa) * 1.2, 0.2, Math.sin(sa) * 1.2);
      campGroup.add(st);
    }

    // Fire light
    const fireLight = new THREE.PointLight('#f97316', 3.5, 18);
    fireLight.position.set(0, 1.2, 0);
    campGroup.add(fireLight);

    // Flame cone
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

    // Cast-iron Cooking Pot on tripod
    const potGeo = new THREE.CylinderGeometry(0.7, 0.5, 0.6, 12);
    const potMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4, metalness: 0.8 });
    const potMesh = new THREE.Mesh(potGeo, potMat);
    potMesh.position.y = 1.3;
    campGroup.add(potMesh);
    scene.add(campGroup);

    // 10. 3D PLAYER MODEL (Link / Mas Bumi in Champion's Tunic)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, getTerrainHeight(0, 0), 0);

    // Torso (Champion's Tunic Blue)
    const tunicMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.6 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.9, 0.45), tunicMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    playerGroup.add(torso);

    // Head & Hair
    const skinMat = new THREE.MeshStandardMaterial({ color: '#fed7aa', roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.5 });

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), skinMat);
    head.position.y = 1.8;
    head.castShadow = true;
    playerGroup.add(head);

    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.35, 0.52), hairMat);
    hair.position.y = 1.95;
    playerGroup.add(hair);

    // Legs & Boots
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

    // MASTER SWORD 3D (Right Hand)
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

    // HYLIAN SHIELD 3D (Left Hand / Back)
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

    // PARAGLIDER 3D (Mounted to Link)
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

    // 11. 3D ANCIENT GUARDIAN STALKER BOSS
    const guardianGroup = new THREE.Group();
    guardianGroup.position.set(75, 4.5, -75);

    // Guardian Dome Chassis
    const guardianChassisMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7, metalness: 0.4 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#ef4444', emissiveIntensity: 1.2 });

    const guardianDome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65), guardianChassisMat);
    guardianDome.position.y = 1.2;
    guardianDome.castShadow = true;
    guardianGroup.add(guardianDome);

    // Rotating Guardian Eye Turret
    const eyeTurret = new THREE.Group();
    eyeTurret.position.set(0, 2.2, 0);

    const eyeHead = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2), guardianChassisMat);
    eyeTurret.add(eyeHead);

    const eyeLens = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), eyeMat);
    eyeLens.position.set(0, 0, 1.1);
    eyeTurret.add(eyeLens);

    guardianGroup.add(eyeTurret);

    // 3D Laser Targeting Line
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

    // 6 Segmented Guardian Legs
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

    // 12. 3D BOKOBLIN & CHUCHU ENEMIES
    const bokoGroup = new THREE.Group();
    bokoGroup.position.set(25, getTerrainHeight(25, -25), -25);
    const bokoMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.7 });
    const bokoBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.6), bokoMat);
    bokoBody.position.y = 0.6;
    bokoBody.castShadow = true;
    bokoGroup.add(bokoBody);
    scene.add(bokoGroup);

    // Mouse / Touch Drag Orbit Listeners
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

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 13. MAIN 3D ANIMATION & GAME LOOP
    let animId: number;
    let guardianTimer = 0;

    const animate = () => {
      const p = playerStatsRef.current;
      const isBulletTime = flurryRushTimerRef.current > 0;
      const timeScale = isBulletTime ? 0.2 : 1.0;

      // Update time of day
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

      // Move player relative to camera yaw
      if (moveForward !== 0 || moveRight !== 0) {
        const inputAngle = Math.atan2(moveRight, moveForward);
        const moveAngle = camOrbitRef.current.yaw + inputAngle;

        const spd = (p.isGliding ? 0.45 : p.isBlocking ? 0.12 : 0.28) * timeScale;
        p.vx = Math.sin(moveAngle) * spd;
        p.vz = Math.cos(moveAngle) * spd;
        p.rotY = moveAngle;

        p.runCycle += 0.25 * timeScale;
        legLeft.rotation.x = Math.sin(p.runCycle) * 0.7;
        legRight.rotation.x = -Math.sin(p.runCycle) * 0.7;
      } else {
        p.vx *= 0.8;
        p.vz *= 0.8;
        legLeft.rotation.x = 0;
        legRight.rotation.x = 0;
      }

      // Paragliding stamina consumption
      if (p.isGliding) {
        p.stamina -= 0.35;
        if (p.stamina <= 0) p.isGliding = false;
        paragliderGroup.visible = true;
      } else {
        paragliderGroup.visible = false;
        if (!p.isDashing && !p.isSpinAttacking && p.stamina < p.maxStamina) {
          p.stamina = Math.min(p.maxStamina, p.stamina + 0.4);
        }
      }

      // Update Player Position
      p.x += p.vx;
      p.z += p.vz;
      p.y = getTerrainHeight(p.x, p.z) + (p.isGliding ? 2.5 : 0);

      playerGroup.position.set(p.x, p.y, p.z);
      playerGroup.rotation.y = p.rotY;

      // Sword Attack Animation
      if (p.isAttacking) {
        p.attackTimer--;
        swordGroup.rotation.z = Math.sin((16 - p.attackTimer) * 0.4) * 1.8;
        swordGroup.rotation.x = Math.cos((16 - p.attackTimer) * 0.4) * 1.2;
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
      if (p.isBlocking) {
        shieldGroup.position.set(-0.2, 1.1, 0.45);
        shieldGroup.rotation.y = 0.5;
      } else {
        shieldGroup.position.set(-0.45, 1.1, 0.1);
        shieldGroup.rotation.y = 0;
      }

      // --- GUARDIAN AI & 3D LASER LOCK-ON ---
      guardianTimer += 0.05 * timeScale;
      legPoles.forEach((leg, idx) => {
        leg.rotation.x = Math.sin(guardianTimer + idx) * 0.35;
      });

      const distToGuardian = Math.hypot(p.x - guardianGroup.position.x, p.z - guardianGroup.position.z);
      if (distToGuardian < 70) {
        // Aim head at player
        eyeTurret.lookAt(p.x, p.y + 1.2, p.z);

        // Laser Beam Active
        laserBeamMesh.visible = true;
        const gPos = new THREE.Vector3();
        eyeLens.getWorldPosition(gPos);
        const pPos = new THREE.Vector3(p.x, p.y + 1.2, p.z);

        const mid = gPos.clone().add(pPos).multiplyScalar(0.5);
        laserBeamMesh.position.copy(mid);
        laserBeamMesh.lookAt(pPos);
        laserBeamMesh.scale.set(1, 1, gPos.distanceTo(pPos));

        // Periodic Beep
        if (Math.random() < 0.04) {
          playZeldaSfx('guardian_beep');
        }
      } else {
        laserBeamMesh.visible = false;
      }

      // --- 3D THIRD-PERSON CAMERA FOLLOW ---
      const camYaw = camOrbitRef.current.yaw;
      const camPitch = camOrbitRef.current.pitch;
      const camDist = camOrbitRef.current.dist;

      const targetCamX = p.x + Math.sin(camYaw) * Math.cos(camPitch) * camDist;
      const targetCamY = p.y + 1.8 + Math.sin(camPitch) * camDist;
      const targetCamZ = p.z + Math.cos(camYaw) * Math.cos(camPitch) * camDist;

      camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
      camera.lookAt(p.x, p.y + 1.4, p.z);

      // Flickering campfire light
      fireLight.intensity = 3.0 + Math.sin(Date.now() * 0.02) * 0.8;

      // Update HUD Mirror
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

  // Render Zelda Hearts
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
    <div className={`rounded-3xl p-4 sm:p-6 border transition-all ${
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
              <span>{currentTimePhase} (3D)</span>
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

        {/* 3D WEBGL CANVAS CONTAINER */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)] bg-slate-950">
          <div 
            ref={mountRef} 
            className="w-full h-[520px] block cursor-grab active:cursor-grabbing select-none"
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
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-400 text-amber-300 font-bold text-xs font-mono-tech shadow-lg animate-pulse flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Tekan [E] untuk Memasak di Panci 3D!</span>
            </div>
          )}

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
                LEGENDA MAS BUMI 3D: NAFAS SAMUDRA
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md font-sans leading-relaxed">
                Dunia 3D nyata orang ketiga (*Third-Person 3D*) ala Zelda: Breath of the Wild! Geser mouse/layar untuk memutar kamera 3D, berlari di perbukitan, tebas pedang Master 3D, gunakan Paraglider melayang, dan tantang Ancient Guardian Stalker 3D dengan laser lock-on!
              </p>

              <div className="grid grid-cols-2 gap-2.5 my-5 text-xs text-left max-w-md font-mono-tech bg-slate-900/80 p-4 rounded-2xl border border-cyan-500/30 text-slate-300">
                <div>⚔️ <strong>[J]</strong> Tebas / Spin 3D</div>
                <div>🏹 <strong>[K]</strong> Panah 3D</div>
                <div>🛡️ <strong>[L]</strong> Perisai / Parry 3D</div>
                <div>⚡ <strong>[Spasi]</strong> Dash & Flurry 3D</div>
                <div>💣 <strong>[Q]</strong> Bom Sheikah 3D</div>
                <div>🪂 <strong>[G]</strong> Paraglider Layang</div>
                <div>🍲 <strong>[E]</strong> Masak / Makan</div>
                <div>🖱️ <strong>[Geser Layar]</strong> Kamera 360°</div>
              </div>

              <button
                onClick={handleStartGame}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-500/40 transition-all hover:scale-105 cursor-pointer font-mono-tech flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>MULAI PETUALANGAN 3D! 🚀</span>
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
                Ancient Guardian Stalker 3D berhasil dikalahkan! Mas Bumi telah membuktikan keberanian dan ketangguhan sebagai Pahlawan sejati!
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

        {/* MOBILE TOUCH CONTROLS */}
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
              className="p-2.5 rounded-2xl bg-sky-600 active:bg-sky-500 border border-sky-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-sky-600/30 cursor-pointer"
            >
              <Bomb className="w-4 h-4" />
              <span>BOM 3D</span>
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

            <div className="flex-1 max-w-xs">
              <button
                onClick={hudStats.nearCookingPot ? handleOpenCooking : handleEatMeal}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-98 transition-all"
              >
                {hudStats.nearCookingPot ? (
                  <>
                    <Flame className="w-4 h-4 text-orange-950" />
                    <span>MASAK DI PANCI 3D 🍲</span>
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
