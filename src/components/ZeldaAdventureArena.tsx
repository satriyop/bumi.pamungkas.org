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
  Compass
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
  hearts: number;
  maxHearts: number;
  stamina: number;
  maxStamina: number;
  isAttacking: boolean;
  attackTimer: number;
  isBlocking: boolean;
  isAiming: boolean;
  aimPower: number;
  isDashing: boolean;
  dashTimer: number;
  invulnerableTimer: number;
  apples: number;
  meat: number;
  cookedMeat: number;
  arrows: number;
  rupees: number;
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
  type: 'slime' | 'bokoblin' | 'archer' | 'moblin' | 'guardian_boss';
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
  state: 'patrol' | 'chase' | 'attack' | 'hurt';
  patrolTarget: { x: number; y: number };
  laserChargeTimer?: number;
  targetAngle?: number;
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
  type: 'apple' | 'meat' | 'arrow' | 'rupee' | 'heart';
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

  // Player state
  const playerRef = useRef<Player>({
    x: 400,
    y: 400,
    vx: 0,
    vy: 0,
    facing: 0,
    hearts: 5,
    maxHearts: 5,
    stamina: 100,
    maxStamina: 100,
    isAttacking: false,
    attackTimer: 0,
    isBlocking: false,
    isAiming: false,
    aimPower: 0,
    isDashing: false,
    dashTimer: 0,
    invulnerableTimer: 0,
    apples: 3,
    meat: 1,
    cookedMeat: 0,
    arrows: 20,
    rupees: 50
  });

  // UI Mirror of Player
  const [hudStats, setHudStats] = useState({
    hearts: 5,
    maxHearts: 5,
    stamina: 100,
    apples: 3,
    cookedMeat: 0,
    arrows: 20,
    rupees: 50,
    bossHp: 0,
    bossMaxHp: 800,
    nearCampfire: false,
    message: null as string | null
  });

  // Entities
  const enemiesRef = useRef<Enemy[]>([]);
  const animalsRef = useRef<Animal[]>([]);
  const treesRef = useRef<TreeItem[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const dropsRef = useRef<DroppedItem[]>([]);

  // Input states
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Web Audio Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playSfx = useCallback((type: 'slash' | 'arrow' | 'parry' | 'hit' | 'laser' | 'cook' | 'boss_roar' | 'victory') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'slash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'arrow') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'parry') {
        // Bright bell chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046, ctx.currentTime);
        osc.frequency.setValueAtTime(1318, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'cook') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'victory') {
        // Grand fanfare
        const now = ctx.currentTime;
        [523, 659, 783, 1046].forEach((f, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(f, now + idx * 0.15);
          g.gain.setValueAtTime(0.3, now + idx * 0.15);
          g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.35);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + idx * 0.15);
          o.stop(now + idx * 0.15 + 0.35);
        });
      }
    } catch {
      // Audio fallback
    }
  }, [soundEnabled]);

  // Spawn initial world entities
  const initWorld = useCallback(() => {
    // 1. Trees
    const trees: TreeItem[] = [];
    for (let i = 0; i < 60; i++) {
      trees.push({
        id: `tree_${i}`,
        x: Math.random() * (WORLD_W - 200) + 100,
        y: Math.random() * (WORLD_H - 200) + 100,
        hasApples: Math.random() > 0.4
      });
    }
    treesRef.current = trees;

    // 2. Animals
    const animals: Animal[] = [];
    for (let i = 0; i < 15; i++) {
      animals.push({
        id: `animal_${i}`,
        type: i % 2 === 0 ? 'rabbit' : 'deer',
        x: Math.random() * 1000 + 200,
        y: Math.random() * 1000 + 200,
        vx: 0,
        vy: 0,
        hp: i % 2 === 0 ? 15 : 35,
        fleeTimer: 0
      });
    }
    animalsRef.current = animals;

    // 3. Enemies
    const enemies: Enemy[] = [];

    // Slimes in Plains (0..1200, 0..1200)
    for (let i = 0; i < 8; i++) {
      enemies.push({
        id: `slime_${i}`,
        type: 'slime',
        name: 'Slime Lembah',
        x: Math.random() * 800 + 200,
        y: Math.random() * 800 + 200,
        vx: 0,
        vy: 0,
        hp: 30,
        maxHp: 30,
        speed: 1.2,
        attackCooldown: 0,
        attackWindup: 0,
        isAttacking: false,
        state: 'patrol',
        patrolTarget: { x: Math.random() * 800 + 200, y: Math.random() * 800 + 200 }
      });
    }

    // Bokoblins & Archers in Forest (1200..2400, 0..1200)
    for (let i = 0; i < 6; i++) {
      enemies.push({
        id: `boko_${i}`,
        type: 'bokoblin',
        name: 'Bokoblin Scout',
        x: Math.random() * 900 + 1300,
        y: Math.random() * 900 + 200,
        vx: 0,
        vy: 0,
        hp: 55,
        maxHp: 55,
        speed: 1.8,
        attackCooldown: 0,
        attackWindup: 0,
        isAttacking: false,
        state: 'patrol',
        patrolTarget: { x: Math.random() * 900 + 1300, y: Math.random() * 900 + 200 }
      });
    }

    for (let i = 0; i < 5; i++) {
      enemies.push({
        id: `archer_${i}`,
        type: 'archer',
        name: 'Skeleton Archer',
        x: Math.random() * 800 + 1300,
        y: Math.random() * 800 + 300,
        vx: 0,
        vy: 0,
        hp: 60,
        maxHp: 60,
        speed: 1.5,
        attackCooldown: 0,
        attackWindup: 0,
        isAttacking: false,
        state: 'patrol',
        patrolTarget: { x: Math.random() * 800 + 1300, y: Math.random() * 800 + 300 }
      });
    }

    // Moblins in Canyon (1200..2000, 1200..2000)
    for (let i = 0; i < 4; i++) {
      enemies.push({
        id: `moblin_${i}`,
        type: 'moblin',
        name: 'Dark Moblin Berserker',
        x: Math.random() * 700 + 1300,
        y: Math.random() * 700 + 1300,
        vx: 0,
        vy: 0,
        hp: 160,
        maxHp: 160,
        speed: 1.4,
        attackCooldown: 0,
        attackWindup: 0,
        isAttacking: false,
        state: 'patrol',
        patrolTarget: { x: Math.random() * 700 + 1300, y: Math.random() * 700 + 1300 }
      });
    }

    // BOSS: Ancient Guardian Leviathan at Ancient Temple (2150, 2150)
    enemies.push({
      id: 'guardian_boss',
      type: 'guardian_boss',
      name: 'Ancient Guardian Leviathan (BOSS)',
      x: 2150,
      y: 2150,
      vx: 0,
      vy: 0,
      hp: 800,
      maxHp: 800,
      speed: 1.1,
      attackCooldown: 60,
      attackWindup: 0,
      isAttacking: false,
      state: 'patrol',
      patrolTarget: { x: 2150, y: 2150 },
      laserChargeTimer: 0,
      targetAngle: 0
    });

    enemiesRef.current = enemies;
    projectilesRef.current = [];
    particlesRef.current = [];
    dropsRef.current = [];

    // Reset player
    playerRef.current = {
      x: 450,
      y: 450,
      vx: 0,
      vy: 0,
      facing: 0,
      hearts: 5,
      maxHearts: 5,
      stamina: 100,
      maxStamina: 100,
      isAttacking: false,
      attackTimer: 0,
      isBlocking: false,
      isAiming: false,
      aimPower: 0,
      isDashing: false,
      dashTimer: 0,
      invulnerableTimer: 0,
      apples: 3,
      meat: 1,
      cookedMeat: 0,
      arrows: 25,
      rupees: 50
    };
  }, []);

  // Start game handler
  const handleStartGame = () => {
    initWorld();
    setGameState('playing');
    playSound?.('coin');
    playSfx('cook');
  };

  // Player action: Sword Slash
  const handleAttack = useCallback(() => {
    const p = playerRef.current;
    if (p.isAttacking || p.isDashing || p.isAiming) return;

    p.isAttacking = true;
    p.attackTimer = 16;
    playSfx('slash');

    // Create sword slash arc particles
    const arcDist = 48;
    const arcX = p.x + Math.cos(p.facing) * arcDist;
    const arcY = p.y + Math.sin(p.facing) * arcDist;

    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x: arcX + (Math.random() - 0.5) * 20,
        y: arcY + (Math.random() - 0.5) * 20,
        vx: Math.cos(p.facing + (Math.random() - 0.5)) * 4,
        vy: Math.sin(p.facing + (Math.random() - 0.5)) * 4,
        color: '#38bdf8',
        size: 3,
        life: 12,
        maxLife: 12
      });
    }

    // Check hit against enemies
    enemiesRef.current.forEach(enemy => {
      const dist = Math.hypot(enemy.x - p.x, enemy.y - p.y);
      if (dist < 70) {
        const angleToEnemy = Math.atan2(enemy.y - p.y, enemy.x - p.x);
        let angleDiff = Math.abs(angleToEnemy - p.facing);
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

        if (angleDiff < Math.PI / 2.2) {
          // Hit!
          const dmg = 30;
          enemy.hp -= dmg;
          enemy.state = 'hurt';
          enemy.vx += Math.cos(p.facing) * 5;
          enemy.vy += Math.sin(p.facing) * 5;
          playSfx('hit');

          // Blood / spark particles
          for (let k = 0; k < 6; k++) {
            particlesRef.current.push({
              x: enemy.x,
              y: enemy.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              color: '#f43f5e',
              size: 4,
              life: 14,
              maxLife: 14
            });
          }
        }
      }
    });

    // Check hit against trees (shake apples)
    treesRef.current.forEach(t => {
      const dist = Math.hypot(t.x - p.x, t.y - p.y);
      if (dist < 60 && t.hasApples) {
        t.hasApples = false;
        dropsRef.current.push({
          id: `apple_${Date.now()}`,
          type: 'apple',
          x: t.x + (Math.random() - 0.5) * 30,
          y: t.y + (Math.random() - 0.5) * 30,
          life: 600
        });
      }
    });

    // Check hit against animals (hunting)
    animalsRef.current.forEach(animal => {
      const dist = Math.hypot(animal.x - p.x, animal.y - p.y);
      if (dist < 60) {
        animal.hp -= 35;
        playSfx('hit');
      }
    });
  }, [playSfx]);

  // Player action: Shoot Bow & Arrow
  const handleShootArrow = useCallback(() => {
    const p = playerRef.current;
    if (p.arrows <= 0 || p.isDashing) return;

    p.arrows -= 1;
    playSfx('arrow');

    const arrowSpeed = 11;
    projectilesRef.current.push({
      id: `arrow_${Date.now()}_${Math.random()}`,
      x: p.x,
      y: p.y,
      vx: Math.cos(p.facing) * arrowSpeed,
      vy: Math.sin(p.facing) * arrowSpeed,
      fromPlayer: true,
      damage: 40,
      life: 80
    });
  }, [playSfx]);

  // Player action: Dash Roll
  const handleDash = useCallback(() => {
    const p = playerRef.current;
    if (p.isDashing || p.stamina < 25) return;

    p.stamina -= 25;
    p.isDashing = true;
    p.dashTimer = 14;
    p.invulnerableTimer = 18;

    // Dash burst velocity
    const dashSpeed = 9;
    p.vx = Math.cos(p.facing) * dashSpeed;
    p.vy = Math.sin(p.facing) * dashSpeed;

    for (let i = 0; i < 10; i++) {
      particlesRef.current.push({
        x: p.x,
        y: p.y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        color: '#10b981',
        size: 3,
        life: 12,
        maxLife: 12
      });
    }
  }, []);

  // Player action: Eat Food / Heal
  const handleEat = useCallback(() => {
    const p = playerRef.current;
    if (p.cookedMeat > 0 && p.hearts < p.maxHearts) {
      p.cookedMeat -= 1;
      p.hearts = Math.min(p.maxHearts, p.hearts + 3);
      playSfx('cook');
    } else if (p.apples > 0 && p.hearts < p.maxHearts) {
      p.apples -= 1;
      p.hearts = Math.min(p.maxHearts, p.hearts + 1);
      playSfx('cook');
    }
  }, [playSfx]);

  // Player action: Cook at Campfire
  const handleCook = useCallback(() => {
    const p = playerRef.current;
    if (p.meat > 0) {
      const cooked = p.meat;
      p.meat = 0;
      p.cookedMeat += cooked;
      playSfx('cook');
      playSound?.('coin');
    }
  }, [playSfx, playSound]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;

    const update = () => {
      const p = playerRef.current;
      const keys = keysRef.current;

      // 1. Player Movement
      const moveSpeed = p.isBlocking ? 1.6 : p.isDashing ? 8 : 3.4;
      let dx = 0;
      let dy = 0;

      if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
      if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
      if (keys['a'] || keys['A'] || keys['ArrowLeft']) dx -= 1;
      if (keys['d'] || keys['D'] || keys['ArrowRight']) dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      if (!p.isDashing) {
        p.vx = dx * moveSpeed;
        p.vy = dy * moveSpeed;
        if (dx !== 0 || dy !== 0) {
          p.facing = Math.atan2(dy, dx);
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      // World boundaries
      p.x = Math.max(40, Math.min(WORLD_W - 40, p.x));
      p.y = Math.max(40, Math.min(WORLD_H - 40, p.y));

      // Timers & Regeneration
      if (p.attackTimer > 0) {
        p.attackTimer--;
        if (p.attackTimer === 0) p.isAttacking = false;
      }
      if (p.dashTimer > 0) {
        p.dashTimer--;
        if (p.dashTimer === 0) p.isDashing = false;
      }
      if (p.invulnerableTimer > 0) p.invulnerableTimer--;

      // Stamina regen
      if (!p.isDashing && p.stamina < p.maxStamina) {
        p.stamina = Math.min(p.maxStamina, p.stamina + 0.5);
      }

      // 2. Update Animals (Rabbit / Deer)
      animalsRef.current.forEach((animal, idx) => {
        const dist = Math.hypot(animal.x - p.x, animal.y - p.y);
        if (dist < 180) {
          animal.fleeTimer = 40;
          const fleeAngle = Math.atan2(animal.y - p.y, animal.x - p.x);
          animal.vx = Math.cos(fleeAngle) * 3.5;
          animal.vy = Math.sin(fleeAngle) * 3.5;
        } else if (animal.fleeTimer > 0) {
          animal.fleeTimer--;
        } else {
          animal.vx *= 0.9;
          animal.vy *= 0.9;
          if (Math.random() < 0.02) {
            const randAng = Math.random() * Math.PI * 2;
            animal.vx = Math.cos(randAng) * 1.2;
            animal.vy = Math.sin(randAng) * 1.2;
          }
        }
        animal.x += animal.vx;
        animal.y += animal.vy;

        // Death & drop
        if (animal.hp <= 0) {
          dropsRef.current.push({
            id: `meat_${Date.now()}_${idx}`,
            type: 'meat',
            x: animal.x,
            y: animal.y,
            life: 800
          });
          animalsRef.current.splice(idx, 1);
        }
      });

      // 3. Update Enemies
      let bossCurrentHp = 0;
      let bossMaxHp = 800;

      enemiesRef.current.forEach((enemy, idx) => {
        if (enemy.type === 'guardian_boss') {
          bossCurrentHp = enemy.hp;
          bossMaxHp = enemy.maxHp;
        }

        const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        const angleToPlayer = Math.atan2(p.y - enemy.y, p.x - enemy.x);

        // State Machine
        if (enemy.type === 'guardian_boss') {
          // Boss AI
          if (dist < 800) {
            // Laser charge attack
            if (enemy.attackCooldown > 0) {
              enemy.attackCooldown--;
            } else {
              enemy.targetAngle = angleToPlayer;
              enemy.laserChargeTimer = (enemy.laserChargeTimer || 0) + 1;

              // Laser aiming particles
              if (enemy.laserChargeTimer % 6 === 0) {
                particlesRef.current.push({
                  x: enemy.x + Math.cos(angleToPlayer) * 30,
                  y: enemy.y + Math.sin(angleToPlayer) * 30,
                  vx: (Math.random() - 0.5) * 2,
                  vy: (Math.random() - 0.5) * 2,
                  color: '#ef4444',
                  size: 3,
                  life: 15,
                  maxLife: 15
                });
              }

              // Fire Laser Beam after 90 ticks (1.5s charge)
              if (enemy.laserChargeTimer >= 90) {
                playSfx('laser');
                projectilesRef.current.push({
                  id: `laser_${Date.now()}`,
                  x: enemy.x,
                  y: enemy.y,
                  vx: Math.cos(enemy.targetAngle) * 14,
                  vy: Math.sin(enemy.targetAngle) * 14,
                  fromPlayer: false,
                  isLaser: true,
                  damage: 35,
                  life: 60
                });
                enemy.laserChargeTimer = 0;
                enemy.attackCooldown = enemy.hp < 400 ? 55 : 90; // enrage when low HP
              }
            }
          }
        } else if (dist < 320) {
          // Standard Enemies Chase & Attack
          enemy.state = 'chase';
          if (enemy.type === 'archer') {
            // Archer keeps distance
            if (dist < 150) {
              enemy.vx = -Math.cos(angleToPlayer) * enemy.speed;
              enemy.vy = -Math.sin(angleToPlayer) * enemy.speed;
            } else {
              enemy.vx = 0;
              enemy.vy = 0;
            }

            // Shoot arrow every 90 ticks
            enemy.attackCooldown = (enemy.attackCooldown || 0) + 1;
            if (enemy.attackCooldown >= 90) {
              enemy.attackCooldown = 0;
              projectilesRef.current.push({
                id: `enemy_arrow_${Date.now()}_${idx}`,
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angleToPlayer) * 7,
                vy: Math.sin(angleToPlayer) * 7,
                fromPlayer: false,
                damage: 20,
                life: 70
              });
              playSfx('arrow');
            }
          } else {
            // Melee enemies run towards player
            enemy.vx = Math.cos(angleToPlayer) * enemy.speed;
            enemy.vy = Math.sin(angleToPlayer) * enemy.speed;

            // Melee attack hit
            if (dist < 42 && p.invulnerableTimer === 0) {
              if (p.isBlocking) {
                // Block / Parry
                playSfx('parry');
                enemy.vx = -Math.cos(angleToPlayer) * 6;
                enemy.vy = -Math.sin(angleToPlayer) * 6;
                p.stamina = Math.max(0, p.stamina - 15);
              } else {
                p.hearts -= 1;
                p.invulnerableTimer = 35;
                playSfx('hit');
                if (p.hearts <= 0) {
                  setGameState('gameover');
                }
              }
            }
          }
        } else {
          // Patrol wander
          enemy.state = 'patrol';
          const pDist = Math.hypot(enemy.patrolTarget.x - enemy.x, enemy.patrolTarget.y - enemy.y);
          if (pDist < 20 || Math.random() < 0.01) {
            enemy.patrolTarget = {
              x: enemy.x + (Math.random() - 0.5) * 300,
              y: enemy.y + (Math.random() - 0.5) * 300
            };
          }
          const pAngle = Math.atan2(enemy.patrolTarget.y - enemy.y, enemy.patrolTarget.x - enemy.x);
          enemy.vx = Math.cos(pAngle) * (enemy.speed * 0.5);
          enemy.vy = Math.sin(pAngle) * (enemy.speed * 0.5);
        }

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Enemy Death
        if (enemy.hp <= 0) {
          // Boss Defeated!
          if (enemy.type === 'guardian_boss') {
            setGameState('victory');
            playSfx('victory');
          }

          // Drops
          dropsRef.current.push({
            id: `drop_heart_${Date.now()}_${idx}`,
            type: Math.random() > 0.5 ? 'heart' : 'arrow',
            x: enemy.x,
            y: enemy.y,
            life: 800
          });
          dropsRef.current.push({
            id: `drop_rupee_${Date.now()}_${idx}`,
            type: 'rupee',
            x: enemy.x + 10,
            y: enemy.y + 10,
            life: 800
          });

          enemiesRef.current.splice(idx, 1);
        }
      });

      // 4. Update Projectiles
      projectilesRef.current.forEach((proj, pIdx) => {
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;

        // Player projectile hitting enemies
        if (proj.fromPlayer) {
          enemiesRef.current.forEach(enemy => {
            const d = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
            if (d < (enemy.type === 'guardian_boss' ? 55 : 30)) {
              enemy.hp -= proj.damage;
              proj.life = 0;
              playSfx('hit');
              for (let k = 0; k < 5; k++) {
                particlesRef.current.push({
                  x: enemy.x,
                  y: enemy.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  color: '#38bdf8',
                  size: 3,
                  life: 12,
                  maxLife: 12
                });
              }
            }
          });

          // Player arrow hitting animals
          animalsRef.current.forEach(animal => {
            const d = Math.hypot(animal.x - proj.x, animal.y - proj.y);
            if (d < 30) {
              animal.hp -= proj.damage;
              proj.life = 0;
              playSfx('hit');
            }
          });
        } else {
          // Enemy projectile hitting player
          const d = Math.hypot(p.x - proj.x, p.y - proj.y);
          if (d < 30 && p.invulnerableTimer === 0) {
            if (p.isBlocking) {
              // PARRY REFLECT!
              playSfx('parry');
              proj.fromPlayer = true;
              proj.vx = -proj.vx * 1.3;
              proj.vy = -proj.vy * 1.3;
              proj.damage *= 2;
              p.stamina = Math.max(0, p.stamina - 10);
            } else {
              p.hearts -= proj.isLaser ? 2 : 1;
              p.invulnerableTimer = 35;
              proj.life = 0;
              playSfx('hit');
              if (p.hearts <= 0) {
                setGameState('gameover');
              }
            }
          }
        }

        if (proj.life <= 0) {
          projectilesRef.current.splice(pIdx, 1);
        }
      });

      // 5. Update Dropped Items (Pickups)
      dropsRef.current.forEach((drop, dIdx) => {
        const d = Math.hypot(p.x - drop.x, p.y - drop.y);
        if (d < 40) {
          if (drop.type === 'apple') p.apples++;
          if (drop.type === 'meat') p.meat++;
          if (drop.type === 'arrow') p.arrows += 5;
          if (drop.type === 'rupee') p.rupees += 10;
          if (drop.type === 'heart') p.hearts = Math.min(p.maxHearts, p.hearts + 1);

          playSound?.('coin');
          dropsRef.current.splice(dIdx, 1);
        } else {
          drop.life--;
          if (drop.life <= 0) dropsRef.current.splice(dIdx, 1);
        }
      });

      // 6. Update Particles
      particlesRef.current.forEach((part, idx) => {
        part.x += part.vx;
        part.y += part.vy;
        part.life--;
        if (part.life <= 0) particlesRef.current.splice(idx, 1);
      });

      // Campfire proximity (at 500, 500)
      const distToCampfire = Math.hypot(p.x - 500, p.y - 500);
      const isNearCampfire = distToCampfire < 90;

      // Update React HUD stats
      setHudStats({
        hearts: p.hearts,
        maxHearts: p.maxHearts,
        stamina: Math.round(p.stamina),
        apples: p.apples,
        cookedMeat: p.cookedMeat,
        arrows: p.arrows,
        rupees: p.rupees,
        bossHp: bossCurrentHp,
        bossMaxHp: bossMaxHp,
        nearCampfire: isNearCampfire,
        message: isNearCampfire ? 'Tekan [E] / [Masak] untuk memanggang daging!' : null
      });

      // 7. RENDER TO CANVAS
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const viewW = canvas.width;
          const viewH = canvas.height;

          // Camera follow player
          const camX = Math.max(0, Math.min(WORLD_W - viewW, p.x - viewW / 2));
          const camY = Math.max(0, Math.min(WORLD_H - viewH, p.y - viewH / 2));

          ctx.save();
          ctx.translate(-camX, -camY);

          // Render Ground Biomes
          // Biome 1: Plains (Green)
          ctx.fillStyle = '#1e3a1e';
          ctx.fillRect(0, 0, 1200, 1200);

          // Biome 2: Forest (Darker Green)
          ctx.fillStyle = '#0f2918';
          ctx.fillRect(1200, 0, 1200, 1200);

          // Biome 3: Water Lake (Blue)
          ctx.fillStyle = '#0b2942';
          ctx.fillRect(0, 1200, 1200, 1200);

          // Biome 4: Canyon & Temple (Orange/Stone)
          ctx.fillStyle = '#2c1b18';
          ctx.fillRect(1200, 1200, 1200, 1200);

          // Ancient Shrine Floor at 2000..2400
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(2000, 2000, 400, 400);
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 4;
          ctx.strokeRect(2000, 2000, 400, 400);

          // Campfire at (500, 500)
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(500, 500, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(500, 500, 7, 0, Math.PI * 2);
          ctx.fill();

          // Trees
          treesRef.current.forEach(t => {
            ctx.fillStyle = '#14532d';
            ctx.beginPath();
            ctx.arc(t.x, t.y, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#166534';
            ctx.beginPath();
            ctx.arc(t.x - 4, t.y - 4, 18, 0, Math.PI * 2);
            ctx.fill();

            // Apples on tree
            if (t.hasApples) {
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(t.x - 8, t.y - 6, 4, 0, Math.PI * 2);
              ctx.arc(t.x + 8, t.y + 4, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Dropped Items
          dropsRef.current.forEach(item => {
            if (item.type === 'apple') {
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(item.x, item.y, 6, 0, Math.PI * 2);
              ctx.fill();
            } else if (item.type === 'meat') {
              ctx.fillStyle = '#f43f5e';
              ctx.fillRect(item.x - 5, item.y - 5, 10, 10);
            } else if (item.type === 'rupee') {
              ctx.fillStyle = '#10b981';
              ctx.beginPath();
              ctx.moveTo(item.x, item.y - 8);
              ctx.lineTo(item.x + 5, item.y);
              ctx.lineTo(item.x, item.y + 8);
              ctx.lineTo(item.x - 5, item.y);
              ctx.closePath();
              ctx.fill();
            } else if (item.type === 'heart') {
              ctx.fillStyle = '#e11d48';
              ctx.beginPath();
              ctx.arc(item.x, item.y, 7, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Animals
          animalsRef.current.forEach(a => {
            ctx.fillStyle = a.type === 'rabbit' ? '#f8fafc' : '#b45309';
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.type === 'rabbit' ? 8 : 14, 0, Math.PI * 2);
            ctx.fill();
          });

          // Enemies
          enemiesRef.current.forEach(e => {
            if (e.type === 'slime') {
              ctx.fillStyle = '#22c55e';
              ctx.beginPath();
              ctx.arc(e.x, e.y, 14, 0, Math.PI * 2);
              ctx.fill();
            } else if (e.type === 'bokoblin') {
              ctx.fillStyle = '#dc2626';
              ctx.beginPath();
              ctx.arc(e.x, e.y, 16, 0, Math.PI * 2);
              ctx.fill();
            } else if (e.type === 'archer') {
              ctx.fillStyle = '#94a3b8';
              ctx.beginPath();
              ctx.arc(e.x, e.y, 15, 0, Math.PI * 2);
              ctx.fill();
            } else if (e.type === 'moblin') {
              ctx.fillStyle = '#7c2d12';
              ctx.beginPath();
              ctx.arc(e.x, e.y, 22, 0, Math.PI * 2);
              ctx.fill();
            } else if (e.type === 'guardian_boss') {
              // Boss Body
              ctx.fillStyle = e.hp < 400 ? '#b91c1c' : '#0f172a';
              ctx.strokeStyle = '#06b6d4';
              ctx.lineWidth = 5;
              ctx.beginPath();
              ctx.arc(e.x, e.y, 45, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              // Glowing Eye
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(e.x, e.y, 14, 0, Math.PI * 2);
              ctx.fill();

              // Laser targeting line
              if (e.laserChargeTimer && e.laserChargeTimer > 0) {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 8]);
                ctx.beginPath();
                ctx.moveTo(e.x, e.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
                ctx.setLineDash([]);
              }
            }

            // Enemy HP Bar
            if (e.type !== 'guardian_boss') {
              ctx.fillStyle = '#000000';
              ctx.fillRect(e.x - 15, e.y - 25, 30, 4);
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(e.x - 15, e.y - 25, (e.hp / e.maxHp) * 30, 4);
            }
          });

          // Projectiles
          projectilesRef.current.forEach(proj => {
            if (proj.isLaser) {
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 8;
              ctx.beginPath();
              ctx.moveTo(proj.x, proj.y);
              ctx.lineTo(proj.x - proj.vx * 2, proj.y - proj.vy * 2);
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

          // Particles
          particlesRef.current.forEach(part => {
            ctx.fillStyle = part.color;
            ctx.beginPath();
            ctx.arc(part.x, part.y, part.size * (part.life / part.maxLife), 0, Math.PI * 2);
            ctx.fill();
          });

          // PLAYER
          if (p.invulnerableTimer % 4 < 2) {
            // Player Body (Champion's Tunic Blue)
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
            ctx.fill();

            // Head & Hair
            ctx.fillStyle = '#f59e0b'; // golden hair
            ctx.beginPath();
            ctx.arc(p.x, p.y - 4, 10, 0, Math.PI * 2);
            ctx.fill();

            // Sword or Shield in hand
            if (p.isBlocking) {
              // Shield
              ctx.fillStyle = '#3b82f6';
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 3;
              const shX = p.x + Math.cos(p.facing) * 18;
              const shY = p.y + Math.sin(p.facing) * 18;
              ctx.beginPath();
              ctx.arc(shX, shY, 12, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            } else if (p.isAttacking) {
              // Sword Slash Visual
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(p.x, p.y, 35, p.facing - 1, p.facing + 1);
              ctx.stroke();
            }

            // Stamina Wheel (Circular green gauge beside player)
            if (p.stamina < p.maxStamina) {
              const rad = 14;
              const pct = p.stamina / p.maxStamina;
              ctx.strokeStyle = 'rgba(0,0,0,0.6)';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(p.x + 22, p.y - 18, rad, 0, Math.PI * 2);
              ctx.stroke();

              ctx.strokeStyle = '#10b981';
              ctx.beginPath();
              ctx.arc(p.x + 22, p.y - 18, rad, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
              ctx.stroke();
            }
          }

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [gameState, playSfx, playSound]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;

      if (gameState === 'playing') {
        if (e.key === 'j' || e.key === 'J') {
          handleAttack();
        } else if (e.key === 'k' || e.key === 'K') {
          handleShootArrow();
        } else if (e.key === 'l' || e.key === 'L' || e.key === 'Shift') {
          playerRef.current.isBlocking = true;
        } else if (e.key === ' ') {
          e.preventDefault();
          handleDash();
        } else if (e.key === 'e' || e.key === 'E') {
          if (hudStats.nearCampfire) {
            handleCook();
          } else {
            handleEat();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
      if (e.key === 'l' || e.key === 'L' || e.key === 'Shift') {
        playerRef.current.isBlocking = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, handleAttack, handleShootArrow, handleDash, handleEat, handleCook, hudStats.nearCampfire]);

  return (
    <div className={`rounded-3xl p-4 sm:p-7 border transition-all ${
      isDarkMode 
        ? 'bg-[#061426] border-cyan-900/60 shadow-2xl text-white' 
        : 'bg-white border-cyan-200 shadow-xl text-slate-800'
    }`}>
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono-tech flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>ZELDA OPEN-WORLD RPG</span>
            </span>
            <span className="text-xs font-mono-tech font-bold text-slate-400">
              Peta Luas (2400 x 2400 px)
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-fun mt-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
            🗡️ Legenda Mas Bumi: Nafas Samudra
          </h3>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Jelajahi padang rumput, berburu, masak di api unggun, dan kalahkan monster hingga Boss Guardian!
          </p>
        </div>

        {/* Sound & Controls */}
        <div className="flex items-center gap-2 font-mono-tech">
          <button
            onClick={() => setSoundEnabled(s => !s)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Toggle Suara"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Main Game Stage Container */}
      <div className="py-4 relative select-none">
        {/* Top HUD Display */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 font-mono-tech">
          {/* Hearts & Stamina */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-2.5 px-4 rounded-2xl border border-cyan-500/30 shadow-md">
            {/* Hearts */}
            <div className="flex items-center gap-1">
              {Array.from({ length: hudStats.maxHearts }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 ${
                    i < hudStats.hearts
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Stamina Pill */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <Zap className="w-4 h-4 fill-emerald-400" />
              <span>{hudStats.stamina}%</span>
            </div>
          </div>

          {/* Inventory Counters */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 px-4 rounded-2xl border border-cyan-500/30 text-xs shadow-md">
            <span className="flex items-center gap-1 text-rose-300">
              <span>🍎</span> {hudStats.apples}
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <span>🥩</span> {hudStats.cookedMeat}
            </span>
            <span className="flex items-center gap-1 text-cyan-300">
              <span>🏹</span> {hudStats.arrows}
            </span>
            <span className="flex items-center gap-1 text-emerald-300 font-bold">
              <span>💎</span> {hudStats.rupees}
            </span>
          </div>
        </div>

        {/* Boss HP Bar (Visible when near Ancient Temple) */}
        {hudStats.bossHp > 0 && (
          <div className="mb-3 max-w-xl mx-auto bg-slate-950/90 p-3 rounded-2xl border-2 border-rose-500/50 shadow-xl shadow-rose-950/50 font-mono-tech animate-fade-in">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-rose-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>Ancient Guardian Leviathan (BOSS)</span>
              </span>
              <span className="text-white font-black">{hudStats.bossHp} / {hudStats.bossMaxHp} HP</span>
            </div>
            <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden border border-rose-500/40">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 transition-all duration-200"
                style={{ width: `${(hudStats.bossHp / hudStats.bossMaxHp) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Interactive Canvas */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] bg-slate-950">
          <canvas
            ref={canvasRef}
            width={850}
            height={520}
            className="w-full h-auto block cursor-crosshair"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              mousePosRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              };
            }}
          />

          {/* Mini-Radar Map (Top Right of Canvas) */}
          <div className="absolute top-4 right-4 w-28 h-28 rounded-2xl bg-slate-950/90 border-2 border-cyan-500/40 shadow-lg p-1.5 pointer-events-none">
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
              {/* Player Dot */}
              <div
                className="absolute w-2 h-2 rounded-full bg-cyan-400 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_6px_#38bdf8]"
                style={{
                  left: `${(playerRef.current.x / WORLD_W) * 100}%`,
                  top: `${(playerRef.current.y / WORLD_H) * 100}%`
                }}
              />
              {/* Boss Temple Marker */}
              <div
                className="absolute w-2.5 h-2.5 rounded-xs bg-rose-500 -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{
                  left: `${(2150 / WORLD_W) * 100}%`,
                  top: `${(2150 / WORLD_H) * 100}%`
                }}
                title="Kuil Boss"
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
              RADAR DUNIA
            </span>
          </div>

          {/* Screen Notifications / Prompts */}
          {hudStats.message && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-amber-500/90 text-slate-950 font-bold text-xs font-mono-tech shadow-lg animate-bounce pointer-events-none">
              {hudStats.message}
            </div>
          )}

          {/* Overlays: Intro / GameOver / Victory */}
          {gameState === 'intro' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.6)] mb-3 animate-pulse">
                <Sword className="w-8 h-8" />
              </div>
              <h4 className="text-3xl sm:text-4xl font-black font-fun text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                LEGENDA MAS BUMI: NAFAS SAMUDRA
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md font-sans leading-relaxed">
                Jelajahi peta dunia terbuka yang luas! Berburu hewan untuk makanan, masak di api unggun, kalahkan monster bertingkat, dan tantang Boss Kuno di kuil reruntuhan!
              </p>

              <div className="grid grid-cols-2 gap-3 my-5 text-xs text-left max-w-sm font-mono-tech bg-slate-900/80 p-3.5 rounded-2xl border border-cyan-500/30 text-slate-300">
                <div>⚔️ <strong>[J]</strong> Tebas Pedang</div>
                <div>🏹 <strong>[K]</strong> Panah</div>
                <div>🛡️ <strong>[L / Shift]</strong> Tangkis / Parry</div>
                <div>⚡ <strong>[Spasi]</strong> Dash Roll</div>
                <div>🍎 <strong>[E]</strong> Makan / Masak</div>
                <div>🧭 <strong>[WASD]</strong> Jalan</div>
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
                Jangan menyerah, pahlawan! Gunakan perisai untuk menangkis laser dan bawa banyak makanan daging panggang!
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
                Ancient Guardian Leviathan berhasil dikalahkan! Mas Bumi telah membuktikan keberanian dan ketangguhan sebagai Pahlawan Samudra sejati!
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

        {/* Mobile Virtual Controls */}
        <div className="pt-4 max-w-md mx-auto space-y-2 select-none font-mono-tech">
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <button
              onClick={handleAttack}
              className="p-3 rounded-2xl bg-cyan-600/90 active:bg-cyan-500 border border-cyan-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-cyan-600/30 cursor-pointer"
            >
              <Sword className="w-5 h-5" />
              <span>TEBAS</span>
            </button>
            <button
              onClick={handleShootArrow}
              className="p-3 rounded-2xl bg-indigo-600/90 active:bg-indigo-500 border border-indigo-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Crosshair className="w-5 h-5" />
              <span>PANAH</span>
            </button>
            <button
              onPointerDown={() => { playerRef.current.isBlocking = true; }}
              onPointerUp={() => { playerRef.current.isBlocking = false; }}
              className="p-3 rounded-2xl bg-blue-600/90 active:bg-blue-500 border border-blue-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Shield className="w-5 h-5" />
              <span>TANGKIS</span>
            </button>
            <button
              onClick={handleDash}
              className="p-3 rounded-2xl bg-emerald-600/90 active:bg-emerald-500 border border-emerald-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Zap className="w-5 h-5" />
              <span>DASH</span>
            </button>
            <button
              onClick={hudStats.nearCampfire ? handleCook : handleEat}
              className="p-3 rounded-2xl bg-amber-600/90 active:bg-amber-500 border border-amber-400 text-white font-bold flex flex-col items-center justify-center gap-1 shadow-md shadow-amber-600/30 cursor-pointer"
            >
              {hudStats.nearCampfire ? <Flame className="w-5 h-5" /> : <span>🍎</span>}
              <span>{hudStats.nearCampfire ? 'MASAK' : 'MAKAN'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
