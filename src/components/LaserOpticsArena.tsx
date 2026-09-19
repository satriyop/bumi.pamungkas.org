import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Zap, 
  RotateCw, 
  Sparkles, 
  Trophy, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Info,
  Play
} from 'lucide-react';

// Direction vectors
type Direction = 'up' | 'down' | 'left' | 'right';

interface Emitter {
  x: number;
  y: number;
  dir: Direction;
  color: string;
}

interface Target {
  id: string;
  x: number;
  y: number;
  hit: boolean;
}

interface Mirror {
  id: string;
  x: number;
  y: number;
  type: '/' | '\\';
  rotatable: boolean;
}

interface Splitter {
  id: string;
  x: number;
  y: number;
  orientation: 'horizontal' | 'vertical'; // splits into 2 rays
}

interface Portal {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

interface Wall {
  x: number;
  y: number;
}

interface Level {
  id: number;
  title: string;
  subtitle: string;
  width: number;
  height: number;
  optimalMoves: number;
  emitter: Emitter;
  mirrors: Mirror[];
  splitters?: Splitter[];
  portals?: Portal[];
  walls?: Wall[];
  targets: Target[];
  hintText?: string;
}

const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Level 1: Pantulan Pertama 🪞',
    subtitle: 'Klik cermin untuk memutar sudutnya dan arahkan laser ke kristal biru!',
    width: 5,
    height: 5,
    optimalMoves: 1,
    emitter: { x: 0, y: 2, dir: 'right', color: '#06b6d4' },
    mirrors: [
      { id: 'm1', x: 2, y: 2, type: '\\', rotatable: true }
    ],
    targets: [
      { id: 't1', x: 2, y: 0, hit: false }
    ],
    hintText: 'Klik cermin di tengah sekali agar memantul 90° ke atas menuju kristal!'
  },
  {
    id: 2,
    title: 'Level 2: Jalur Zig-Zag ⚡',
    subtitle: 'Gunakan 2 cermin putar untuk membelokkan sinar meliuk menuju target.',
    width: 5,
    height: 5,
    optimalMoves: 2,
    emitter: { x: 0, y: 1, dir: 'right', color: '#06b6d4' },
    mirrors: [
      { id: 'm1', x: 3, y: 1, type: '/', rotatable: true },
      { id: 'm2', x: 3, y: 4, type: '/', rotatable: true }
    ],
    targets: [
      { id: 't1', x: 1, y: 4, hit: false }
    ],
    hintText: 'Cermin pertama harus memantulkan ke bawah, cermin kedua memantulkan ke kiri.'
  },
  {
    id: 3,
    title: 'Level 3: Menembus Karang 🧱',
    subtitle: 'Batu karang gelap menyerap laser! Pantulkan memutar mengelilingi penghalang.',
    width: 6,
    height: 6,
    optimalMoves: 3,
    emitter: { x: 0, y: 2, dir: 'right', color: '#06b6d4' },
    walls: [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 }
    ],
    mirrors: [
      { id: 'm1', x: 1, y: 2, type: '\\', rotatable: true },
      { id: 'm2', x: 1, y: 4, type: '/', rotatable: true },
      { id: 'm3', x: 4, y: 4, type: '\\', rotatable: true }
    ],
    targets: [
      { id: 't1', x: 4, y: 1, hit: false }
    ],
    hintText: 'Belokkan ke bawah sebelum karang, lurus ke kanan di bawah karang, lalu belok ke atas.'
  },
  {
    id: 4,
    title: 'Level 4: Prisma Pemecah Sinar 🔺',
    subtitle: 'Prisma membelah laser jadi 2 cabang! Nyalakan kedua kristal sekaligus.',
    width: 6,
    height: 6,
    optimalMoves: 2,
    emitter: { x: 0, y: 2, dir: 'right', color: '#06b6d4' },
    splitters: [
      { id: 's1', x: 2, y: 2, orientation: 'horizontal' } // passes straight & splits 90 deg up
    ],
    mirrors: [
      { id: 'm1', x: 2, y: 0, type: '/', rotatable: true },
      { id: 'm2', x: 5, y: 2, type: '/', rotatable: true }
    ],
    targets: [
      { id: 't1', x: 4, y: 0, hit: false },
      { id: 't2', x: 5, y: 5, hit: false }
    ],
    hintText: 'Satu cabang ke atas diarahkan ke kanan, cabang lurus diarahkan ke bawah.'
  },
  {
    id: 5,
    title: 'Level 5: Refleksi Ganda Berseberangan 💎',
    subtitle: 'Dua kristal berada di sudut berbeda. Susun cermin agar kedua sasaran terisi energi.',
    width: 6,
    height: 6,
    optimalMoves: 3,
    emitter: { x: 1, y: 0, dir: 'down', color: '#06b6d4' },
    splitters: [
      { id: 's1', x: 1, y: 3, orientation: 'vertical' }
    ],
    mirrors: [
      { id: 'm1', x: 4, y: 3, type: '/', rotatable: true },
      { id: 'm2', x: 1, y: 5, type: '\\', rotatable: true },
      { id: 'm3', x: 4, y: 5, type: '/', rotatable: true }
    ],
    walls: [
      { x: 3, y: 1 },
      { x: 3, y: 2 }
    ],
    targets: [
      { id: 't1', x: 4, y: 1, hit: false },
      { id: 't2', x: 5, y: 5, hit: false }
    ],
    hintText: 'Gunakan prisma untuk membagi sinar ke kanan dan lurus ke bawah.'
  },
  {
    id: 6,
    title: 'Level 6: Wormhole Teleportasi 🌀',
    subtitle: 'Laser yang masuk ke portal biru akan keluar dari portal oranye dengan arah yang sama!',
    width: 7,
    height: 7,
    optimalMoves: 3,
    emitter: { x: 0, y: 3, dir: 'right', color: '#06b6d4' },
    portals: [
      { id: 'p1', x1: 3, y1: 3, x2: 1, y2: 5, color: '#f59e0b' }
    ],
    mirrors: [
      { id: 'm1', x: 5, y: 5, type: '/', rotatable: true },
      { id: 'm2', x: 5, y: 1, type: '\\', rotatable: true },
      { id: 'm3', x: 2, y: 1, type: '/', rotatable: true }
    ],
    walls: [
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 4, y: 3 }
    ],
    targets: [
      { id: 't1', x: 2, y: 0, hit: false }
    ],
    hintText: 'Biarkan laser masuk ke portal di (3,3) lalu keluar di (1,5), lalu pantulkan menuju target atas.'
  },
  {
    id: 7,
    title: 'Level 7: Segitiga Tiga Kristal 👑',
    subtitle: 'Tantangan 3 kristal target! Atur 4 cermin putar untuk membagi dan memantulkan sinar.',
    width: 7,
    height: 7,
    optimalMoves: 4,
    emitter: { x: 0, y: 1, dir: 'right', color: '#06b6d4' },
    splitters: [
      { id: 's1', x: 3, y: 1, orientation: 'horizontal' },
      { id: 's2', x: 3, y: 4, orientation: 'vertical' }
    ],
    mirrors: [
      { id: 'm1', x: 5, y: 1, type: '/', rotatable: true },
      { id: 'm2', x: 5, y: 4, type: '\\', rotatable: true },
      { id: 'm3', x: 1, y: 4, type: '/', rotatable: true },
      { id: 'm4', x: 1, y: 6, type: '\\', rotatable: true }
    ],
    targets: [
      { id: 't1', x: 5, y: 0, hit: false },
      { id: 't2', x: 6, y: 4, hit: false },
      { id: 't3', x: 4, y: 6, hit: false }
    ],
    hintText: 'Dua splitter akan membagi sinar menjadi 3 jalur. Arahkan masing-masing ke kristalnya.'
  },
  {
    id: 8,
    title: 'Level 8: Benteng Batu Karang 🏰',
    subtitle: 'Banyak karang merintangi lintasan! Butuh kalkulasi presisi untuk meliukkan sinar.',
    width: 7,
    height: 7,
    optimalMoves: 4,
    emitter: { x: 3, y: 0, dir: 'down', color: '#06b6d4' },
    walls: [
      { x: 3, y: 2 },
      { x: 2, y: 4 },
      { x: 4, y: 4 },
      { x: 3, y: 5 }
    ],
    mirrors: [
      { id: 'm1', x: 3, y: 1, type: '/', rotatable: true },
      { id: 'm2', x: 1, y: 1, type: '\\', rotatable: true },
      { id: 'm3', x: 1, y: 5, type: '/', rotatable: true },
      { id: 'm4', x: 5, y: 1, type: '/', rotatable: true },
      { id: 'm5', x: 5, y: 5, type: '\\', rotatable: true }
    ],
    splitters: [
      { id: 's1', x: 3, y: 3, orientation: 'horizontal' }
    ],
    targets: [
      { id: 't1', x: 1, y: 6, hit: false },
      { id: 't2', x: 5, y: 6, hit: false }
    ],
    hintText: 'Bagi sinar di tengah ke kiri dan kanan, lalu pantulkan mengitari tembok karang.'
  },
  {
    id: 9,
    title: 'Level 9: Matriks Optik Grandmaster 🧠',
    subtitle: 'Ujian konsentrasi tingkat tinggi! 3 target, 1 portal wormhole, dan 5 cermin putar.',
    width: 8,
    height: 8,
    optimalMoves: 5,
    emitter: { x: 0, y: 2, dir: 'right', color: '#06b6d4' },
    portals: [
      { id: 'p1', x1: 4, y1: 2, x2: 2, y2: 6, color: '#ec4899' }
    ],
    splitters: [
      { id: 's1', x: 2, y: 2, orientation: 'horizontal' },
      { id: 's2', x: 5, y: 6, orientation: 'vertical' }
    ],
    mirrors: [
      { id: 'm1', x: 2, y: 0, type: '/', rotatable: true },
      { id: 'm2', x: 6, y: 0, type: '\\', rotatable: true },
      { id: 'm3', x: 6, y: 4, type: '/', rotatable: true },
      { id: 'm4', x: 5, y: 4, type: '\\', rotatable: true },
      { id: 'm5', x: 7, y: 6, type: '/', rotatable: true }
    ],
    walls: [
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 3, y: 5 },
      { x: 4, y: 5 }
    ],
    targets: [
      { id: 't1', x: 4, y: 0, hit: false },
      { id: 't2', x: 7, y: 4, hit: false },
      { id: 't3', x: 5, y: 7, hit: false }
    ],
    hintText: 'Sinar atas masuk ke target 1, sinar tengah masuk wormhole, lalu terbelah ke target 2 dan 3.'
  },
  {
    id: 10,
    title: 'Level 10: Mahkota Juara Black Marlin 🏆',
    subtitle: 'Tantangan pamungkas! Aktifkan 4 kristal piala untuk membuktikan kejeniusan taktismu!',
    width: 8,
    height: 8,
    optimalMoves: 6,
    emitter: { x: 0, y: 4, dir: 'right', color: '#06b6d4' },
    splitters: [
      { id: 's1', x: 2, y: 4, orientation: 'horizontal' },
      { id: 's2', x: 5, y: 4, orientation: 'horizontal' }
    ],
    mirrors: [
      { id: 'm1', x: 2, y: 1, type: '/', rotatable: true },
      { id: 'm2', x: 5, y: 1, type: '\\', rotatable: true },
      { id: 'm3', x: 2, y: 7, type: '\\', rotatable: true },
      { id: 'm4', x: 5, y: 7, type: '/', rotatable: true },
      { id: 'm5', x: 7, y: 4, type: '/', rotatable: true }
    ],
    walls: [
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 5 }
    ],
    targets: [
      { id: 't1', x: 3, y: 1, hit: false },
      { id: 't2', x: 4, y: 1, hit: false },
      { id: 't3', x: 3, y: 7, hit: false },
      { id: 't4', x: 7, y: 1, hit: false }
    ],
    hintText: 'Bagi laser secara simetris ke atas dan bawah untuk menyalakan ke-4 kristal juara!'
  }
];

interface LaserSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

interface LaserOpticsArenaProps {
  isDarkMode?: boolean;
  playSound?: (type: 'swim' | 'coin' | 'hit' | 'tech') => void;
}

export const LaserOpticsArena: React.FC<LaserOpticsArenaProps> = ({ isDarkMode = true, playSound }) => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const currentLevel = LEVELS[currentLevelIndex];

  // Dynamic state for mirrors in current level
  const [mirrors, setMirrors] = useState<Mirror[]>(() => 
    currentLevel.mirrors.map(m => ({ ...m }))
  );
  const [movesCount, setMovesCount] = useState(0);
  const [history, setHistory] = useState<Mirror[][]>([]);
  const [showHint, setShowHint] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [levelStars, setLevelStars] = useState<{ [lvl: number]: number }>({});
  const [laserPulse, setLaserPulse] = useState(0);

  // Audio synthesizer for custom laser sounds
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playCustomBeep = useCallback((freq: number, type: OscillatorType = 'sine', duration: number = 0.15) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }, []);

  // Update mirrors when level changes
  useEffect(() => {
    setMirrors(currentLevel.mirrors.map(m => ({ ...m })));
    setMovesCount(0);
    setHistory([]);
    setShowHint(false);
    setIsWon(false);
  }, [currentLevelIndex, currentLevel]);

  // Subtle continuous pulse effect for lasers
  useEffect(() => {
    const timer = setInterval(() => {
      setLaserPulse(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Ray-Tracing Simulation
  const { laserSegments, hitTargetIds } = useMemo(() => {
    const segments: LaserSegment[] = [];
    const hitTargets = new Set<string>();

    const dirOffsets: Record<Direction, { dx: number; dy: number }> = {
      up: { dx: 0, dy: -1 },
      down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 },
      right: { dx: 1, dy: 0 }
    };

    interface Ray {
      x: number;
      y: number;
      dir: Direction;
      color: string;
      dist: number;
    }

    const raysToTrace: Ray[] = [
      {
        x: currentLevel.emitter.x,
        y: currentLevel.emitter.y,
        dir: currentLevel.emitter.dir,
        color: currentLevel.emitter.color,
        dist: 0
      }
    ];

    const visitedRays = new Set<string>();
    const maxSteps = 200;
    let steps = 0;

    while (raysToTrace.length > 0 && steps < maxSteps) {
      steps++;
      const current = raysToTrace.shift()!;
      const rayKey = `${current.x},${current.y},${current.dir}`;

      if (visitedRays.has(rayKey)) continue;
      visitedRays.add(rayKey);

      const { dx, dy } = dirOffsets[current.dir];
      let currX = current.x;
      let currY = current.y;

      let stopped = false;

      while (!stopped) {
        const nextX = currX + dx;
        const nextY = currY + dy;

        // Check boundaries
        if (nextX < 0 || nextX >= currentLevel.width || nextY < 0 || nextY >= currentLevel.height) {
          // Draw beam to boundary
          segments.push({
            x1: currX,
            y1: currY,
            x2: nextX,
            y2: nextY,
            color: current.color
          });
          stopped = true;
          break;
        }

        // Draw beam to next cell
        segments.push({
          x1: currX,
          y1: currY,
          x2: nextX,
          y2: nextY,
          color: current.color
        });

        currX = nextX;
        currY = nextY;

        // Check Wall hit
        if (currentLevel.walls?.some(w => w.x === currX && w.y === currY)) {
          stopped = true;
          break;
        }

        // Check Target hit
        const target = currentLevel.targets.find(t => t.x === currX && t.y === currY);
        if (target) {
          hitTargets.add(target.id);
        }

        // Check Mirror hit
        const mirror = mirrors.find(m => m.x === currX && m.y === currY);
        if (mirror) {
          stopped = true;
          let nextDir: Direction | null = null;
          if (mirror.type === '/') {
            if (current.dir === 'right') nextDir = 'up';
            else if (current.dir === 'left') nextDir = 'down';
            else if (current.dir === 'up') nextDir = 'right';
            else if (current.dir === 'down') nextDir = 'left';
          } else if (mirror.type === '\\') {
            if (current.dir === 'right') nextDir = 'down';
            else if (current.dir === 'left') nextDir = 'up';
            else if (current.dir === 'up') nextDir = 'left';
            else if (current.dir === 'down') nextDir = 'right';
          }

          if (nextDir) {
            raysToTrace.push({
              x: currX,
              y: currY,
              dir: nextDir,
              color: current.color,
              dist: current.dist + 1
            });
          }
          break;
        }

        // Check Splitter hit
        const splitter = currentLevel.splitters?.find(s => s.x === currX && s.y === currY);
        if (splitter) {
          stopped = true;
          // Continues straight
          raysToTrace.push({
            x: currX,
            y: currY,
            dir: current.dir,
            color: current.color,
            dist: current.dist + 1
          });
          // Splits 90 degrees
          let splitDir: Direction = 'up';
          if (splitter.orientation === 'horizontal') {
            splitDir = current.dir === 'right' || current.dir === 'left' ? 'up' : 'right';
          } else {
            splitDir = current.dir === 'up' || current.dir === 'down' ? 'right' : 'down';
          }
          raysToTrace.push({
            x: currX,
            y: currY,
            dir: splitDir,
            color: '#f43f5e', // split branch color
            dist: current.dist + 1
          });
          break;
        }

        // Check Portal hit
        const portal = currentLevel.portals?.find(
          p => (p.x1 === currX && p.y1 === currY) || (p.x2 === currX && p.y2 === currY)
        );
        if (portal) {
          stopped = true;
          const isAtEntrance = portal.x1 === currX && portal.y1 === currY;
          const outX = isAtEntrance ? portal.x2 : portal.x1;
          const outY = isAtEntrance ? portal.y2 : portal.y1;

          raysToTrace.push({
            x: outX,
            y: outY,
            dir: current.dir,
            color: portal.color,
            dist: current.dist + 1
          });
          break;
        }
      }
    }

    return { laserSegments: segments, hitTargetIds: hitTargets };
  }, [currentLevel, mirrors]);

  // Check Win Condition
  useEffect(() => {
    const allHit = currentLevel.targets.every(t => hitTargetIds.has(t.id));
    if (allHit && !isWon) {
      setIsWon(true);
      playSound?.('coin');
      playCustomBeep(880, 'triangle', 0.4);
      setTimeout(() => playCustomBeep(1174, 'triangle', 0.6), 200);

      // Calculate Stars
      let stars = 1;
      if (movesCount <= currentLevel.optimalMoves) {
        stars = 3;
      } else if (movesCount <= currentLevel.optimalMoves + 3) {
        stars = 2;
      }
      setLevelStars(prev => ({
        ...prev,
        [currentLevel.id]: Math.max(prev[currentLevel.id] || 0, stars)
      }));
    }
  }, [hitTargetIds, currentLevel, isWon, movesCount, playSound, playCustomBeep]);

  // Handle Rotate Mirror
  const handleRotateMirror = (mirrorId: string) => {
    if (isWon) return;

    setHistory(prev => [...prev, mirrors.map(m => ({ ...m }))]);
    setMirrors(prev =>
      prev.map(m => {
        if (m.id === mirrorId && m.rotatable) {
          return { ...m, type: m.type === '/' ? '\\' : '/' };
        }
        return m;
      })
    );
    setMovesCount(c => c + 1);
    playSound?.('tech');
    playCustomBeep(520, 'sine', 0.08);
  };

  // Undo Move
  const handleUndo = () => {
    if (history.length === 0 || isWon) return;
    const previous = history[history.length - 1];
    setMirrors(previous);
    setHistory(prev => prev.slice(0, -1));
    setMovesCount(c => Math.max(0, c - 1));
    playSound?.('coin');
    playCustomBeep(330, 'sine', 0.1);
  };

  // Reset Level
  const handleReset = () => {
    setMirrors(currentLevel.mirrors.map(m => ({ ...m })));
    setMovesCount(0);
    setHistory([]);
    setIsWon(false);
    setShowHint(false);
    playSound?.('tech');
  };

  // Next Level
  const handleNextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(i => i + 1);
      playSound?.('coin');
    }
  };

  const cellSize = 54; // cell dimension in px

  return (
    <div className={`rounded-3xl p-4 sm:p-7 border transition-all ${
      isDarkMode 
        ? 'bg-[#050f1e] border-cyan-900/60 shadow-2xl text-white' 
        : 'bg-white border-cyan-200 shadow-xl text-slate-800'
    }`}>
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono-tech flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>CYBER OPTICS LAB</span>
            </span>
            <span className="text-xs font-mono-tech font-bold text-slate-400">
              Level {currentLevel.id} dari {LEVELS.length}
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-fun mt-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300">
            {currentLevel.title}
          </h3>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {currentLevel.subtitle}
          </p>
        </div>

        {/* Level Controls & Stars */}
        <div className="flex flex-wrap items-center gap-2 font-mono-tech">
          <div className="flex items-center bg-cyan-950/60 border border-cyan-500/40 rounded-xl p-1.5 gap-1">
            <button
              onClick={() => setCurrentLevelIndex(i => Math.max(0, i - 1))}
              disabled={currentLevelIndex === 0}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-cyan-300 cursor-pointer"
              title="Level Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black px-2 text-cyan-300">
              Lvl {currentLevel.id}
            </span>
            <button
              onClick={() => setCurrentLevelIndex(i => Math.min(LEVELS.length - 1, i + 1))}
              disabled={currentLevelIndex === LEVELS.length - 1}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-cyan-300 cursor-pointer"
              title="Level Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Langkah:</span>
            <span className="text-base font-black text-cyan-300">{movesCount}</span>
            <span className="text-[10px] text-slate-400">/ optimal {currentLevel.optimalMoves}</span>
          </div>

          {/* Stars for this level */}
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
            {[1, 2, 3].map(s => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  (levelStars[currentLevel.id] || 0) >= s
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="py-6 flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* Interactive Grid Board */}
        <div className="relative p-4 rounded-3xl bg-slate-950/80 border-2 border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] select-none">
          {/* SVG Ray Overlay */}
          <svg
            className="absolute top-4 left-4 pointer-events-none z-10"
            width={currentLevel.width * cellSize}
            height={currentLevel.height * cellSize}
          >
            <defs>
              <filter id="neonGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="neonGlowRose" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Laser Beams */}
            {laserSegments.map((seg, idx) => {
              const x1 = seg.x1 * cellSize + cellSize / 2;
              const y1 = seg.y1 * cellSize + cellSize / 2;
              const x2 = seg.x2 * cellSize + cellSize / 2;
              const y2 = seg.y2 * cellSize + cellSize / 2;

              return (
                <g key={idx}>
                  {/* Outer glow line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={seg.color}
                    strokeWidth="6"
                    strokeOpacity="0.4"
                    filter={seg.color === '#f43f5e' ? 'url(#neonGlowRose)' : 'url(#neonGlowCyan)'}
                  />
                  {/* Core bright beam */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Animated pulse dash */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={seg.color}
                    strokeWidth="3"
                    strokeDasharray="6 12"
                    strokeDashoffset={-laserPulse * 0.8}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>

          {/* Grid Cells */}
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${currentLevel.width}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${currentLevel.height}, ${cellSize}px)`
            }}
          >
            {Array.from({ length: currentLevel.height }).map((_, r) =>
              Array.from({ length: currentLevel.width }).map((_, c) => {
                const mirror = mirrors.find(m => m.x === c && m.y === r);
                const wall = currentLevel.walls?.find(w => w.x === c && w.y === r);
                const target = currentLevel.targets.find(t => t.x === c && t.y === r);
                const splitter = currentLevel.splitters?.find(s => s.x === c && s.y === r);
                const isEmitter = currentLevel.emitter.x === c && currentLevel.emitter.y === r;
                const portal = currentLevel.portals?.find(
                  p => (p.x1 === c && p.y1 === r) || (p.x2 === c && p.y2 === r)
                );

                const isTargetHit = target && hitTargetIds.has(target.id);

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative rounded-xl flex items-center justify-center transition-all ${
                      wall
                        ? 'bg-slate-900 border border-slate-700 shadow-inner'
                        : isEmitter
                        ? 'bg-gradient-to-br from-cyan-600/30 to-blue-600/20 border-2 border-cyan-400'
                        : mirror
                        ? 'bg-slate-800/90 hover:bg-slate-700/90 border border-indigo-400/50 cursor-pointer group active:scale-95 shadow-md shadow-indigo-950/50'
                        : splitter
                        ? 'bg-purple-950/60 border border-purple-500/50'
                        : portal
                        ? 'bg-amber-950/40 border border-amber-500/50'
                        : 'bg-slate-900/40 border border-slate-800/60'
                    }`}
                    onClick={() => {
                      if (mirror) handleRotateMirror(mirror.id);
                    }}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {/* Wall */}
                    {wall && (
                      <div className="w-full h-full rounded-lg bg-slate-800/80 flex items-center justify-center">
                        <span className="text-slate-500 text-xs font-black">🧱</span>
                      </div>
                    )}

                    {/* Emitter */}
                    {isEmitter && (
                      <div className="z-20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_15px_#06b6d4] animate-pulse">
                          <Zap className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                    )}

                    {/* Target Crystal */}
                    {target && (
                      <div className="z-20 flex flex-col items-center justify-center">
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isTargetHit
                              ? 'bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 shadow-[0_0_20px_#10b981] scale-110 animate-bounce'
                              : 'bg-slate-800/90 border border-cyan-500/40 text-cyan-400'
                          }`}
                        >
                          <Trophy className={`w-5 h-5 ${isTargetHit ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-[9px] font-mono-tech font-bold text-cyan-300 mt-0.5">
                          {isTargetHit ? 'ON ✅' : 'OFF'}
                        </span>
                      </div>
                    )}

                    {/* Rotatable Mirror */}
                    {mirror && (
                      <div className="z-20 flex flex-col items-center justify-center relative w-full h-full">
                        {/* Mirror Plate Visual */}
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <div
                            className={`w-7 h-1.5 rounded-full bg-gradient-to-r from-indigo-200 via-sky-300 to-indigo-200 shadow-[0_0_10px_rgba(125,211,252,0.8)] transition-transform duration-200 ${
                              mirror.type === '/' ? '-rotate-45' : 'rotate-45'
                            }`}
                          />
                        </div>
                        <span className="absolute bottom-1 right-1 text-[9px] text-cyan-400 group-hover:scale-125 transition-transform">
                          <RotateCw className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    )}

                    {/* Beam Splitter / Prism */}
                    {splitter && (
                      <div className="z-20 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/30 border border-purple-400 flex items-center justify-center text-[10px] font-bold text-purple-300 shadow-[0_0_10px_#a855f7]">
                          🔺
                        </div>
                      </div>
                    )}

                    {/* Portal */}
                    {portal && (
                      <div className="z-20 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center text-xs animate-spin font-bold text-amber-300 shadow-[0_0_12px_#f59e0b]">
                          🌀
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Victory Overlay Modal */}
          {isWon && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.8)] mb-3 animate-bounce">
                <Trophy className="w-8 h-8 fill-current" />
              </div>
              <h4 className="text-2xl sm:text-3xl font-black font-fun text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                LEVEL SELESAI! 🎉
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs">
                Luar biasa Mas Bumi! Semua kristal energi berhasil dialiri sinar laser neon!
              </p>

              {/* Star Rating Display */}
              <div className="flex items-center gap-2 my-4">
                {[1, 2, 3].map(s => {
                  const starsAchieved = levelStars[currentLevel.id] || 3;
                  return (
                    <Star
                      key={s}
                      className={`w-8 h-8 transition-transform duration-300 ${
                        s <= starsAchieved
                          ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                          : 'text-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="text-xs font-mono-tech text-cyan-300 mb-5">
                Total Langkah: <strong className="text-white text-sm">{movesCount}</strong> (Optimal: {currentLevel.optimalMoves})
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer font-mono-tech"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Main Ulang</span>
                </button>
                {currentLevelIndex < LEVELS.length - 1 ? (
                  <button
                    onClick={handleNextLevel}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/30 cursor-pointer font-mono-tech hover:scale-105"
                  >
                    <span>Lanjut Level {currentLevel.id + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs flex items-center gap-1.5 font-mono-tech">
                    <Sparkles className="w-4 h-4" />
                    <span>SEMUA LEVEL TAMAT! 🏆</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel: Rules, Actions & Level Select */}
        <div className="w-full lg:w-80 space-y-4 font-sans">
          {/* Actions Bar */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleUndo}
              disabled={history.length === 0 || isWon}
              className="py-2.5 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Undo ({history.length})</span>
            </button>

            <button
              onClick={handleReset}
              className="py-2.5 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => setShowHint(h => !h)}
              className="py-2.5 px-3 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-bold text-purple-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-purple-400" />
              <span>Petunjuk</span>
            </button>
          </div>

          {/* Hint Card */}
          {showHint && currentLevel.hintText && (
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200 space-y-1 animate-fade-in font-mono-tech">
              <div className="font-bold flex items-center gap-1 text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tips Taktik Optik:</span>
              </div>
              <p className="leading-relaxed">{currentLevel.hintText}</p>
            </div>
          )}

          {/* Guide / Legend Card */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-cyan-500/20 space-y-3 text-xs">
            <h5 className="font-black text-cyan-300 uppercase tracking-wider font-mono-tech flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              <span>Petunjuk Komponen:</span>
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/50">
                <span className="w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950 text-[10px] font-black">⚡</span>
                <span>Laser Emitter</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/50">
                <span className="w-4 h-4 rounded bg-indigo-500 text-white flex items-center justify-center text-[10px]">🪞</span>
                <span>Cermin Putar</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/50">
                <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px]">💎</span>
                <span>Kristal Target</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/50">
                <span className="w-4 h-4 rounded bg-purple-600 text-white flex items-center justify-center text-[10px]">🔺</span>
                <span>Prisma Pemecah</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/50">
                <span className="w-4 h-4 rounded bg-amber-500 text-white flex items-center justify-center text-[10px]">🌀</span>
                <span>Portal Wormhole</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/50">
                <span className="w-4 h-4 rounded bg-slate-700 text-white flex items-center justify-center text-[10px]">🧱</span>
                <span>Batu Penyerap</span>
              </div>
            </div>
          </div>

          {/* Level Quick Select Grid */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-cyan-500/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono-tech">
              <span className="font-bold text-slate-300">Pilih Level Cepat:</span>
              <span className="text-cyan-400 font-black">
                {Object.keys(levelStars).length}/{LEVELS.length} Selesai
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {LEVELS.map(lvl => {
                const stars = levelStars[lvl.id] || 0;
                const isSelected = lvl.id === currentLevel.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setCurrentLevelIndex(lvl.id - 1)}
                    className={`p-2 rounded-xl text-xs font-black font-mono-tech flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30 scale-105 border border-white/40'
                        : stars > 0
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                        : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:bg-slate-700/60'
                    }`}
                  >
                    <span>{lvl.id}</span>
                    <div className="flex items-center gap-0.5">
                      {stars > 0 ? (
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
