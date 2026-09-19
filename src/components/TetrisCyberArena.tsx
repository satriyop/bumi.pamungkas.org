import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Zap, 
  Sparkles, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Package, 
  Layers
} from 'lucide-react';

const COLS = 10;
const ROWS = 20;

// Tetromino definitions with color and rotation matrices
type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

interface TetrominoDef {
  type: TetrominoType;
  color: string;
  glow: string;
  shapes: number[][][]; // 4 rotations
}

const TETROMINOES: Record<TetrominoType, TetrominoDef> = {
  I: {
    type: 'I',
    color: '#06b6d4', // cyan
    glow: 'rgba(6, 182, 212, 0.6)',
    shapes: [
      [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
      [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]],
    ]
  },
  J: {
    type: 'J',
    color: '#3b82f6', // blue
    glow: 'rgba(59, 130, 246, 0.6)',
    shapes: [
      [[1,0,0], [1,1,1], [0,0,0]],
      [[0,1,1], [0,1,0], [0,1,0]],
      [[0,0,0], [1,1,1], [0,0,1]],
      [[0,1,0], [0,1,0], [1,1,0]],
    ]
  },
  L: {
    type: 'L',
    color: '#f97316', // orange
    glow: 'rgba(249, 115, 22, 0.6)',
    shapes: [
      [[0,0,1], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,0], [0,1,1]],
      [[0,0,0], [1,1,1], [1,0,0]],
      [[1,1,0], [0,1,0], [0,1,0]],
    ]
  },
  O: {
    type: 'O',
    color: '#eab308', // yellow
    glow: 'rgba(234, 179, 8, 0.6)',
    shapes: [
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]],
    ]
  },
  S: {
    type: 'S',
    color: '#22c55e', // green
    glow: 'rgba(34, 197, 94, 0.6)',
    shapes: [
      [[0,1,1], [1,1,0], [0,0,0]],
      [[0,1,0], [0,1,1], [0,0,1]],
      [[0,0,0], [0,1,1], [1,1,0]],
      [[1,0,0], [1,1,0], [0,1,0]],
    ]
  },
  T: {
    type: 'T',
    color: '#a855f7', // purple
    glow: 'rgba(168, 85, 247, 0.6)',
    shapes: [
      [[0,1,0], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,1], [0,1,0]],
      [[0,1,0], [1,1,0], [0,1,0]],
    ]
  },
  Z: {
    type: 'Z',
    color: '#ef4444', // red
    glow: 'rgba(239, 68, 68, 0.6)',
    shapes: [
      [[1,1,0], [0,1,1], [0,0,0]],
      [[0,0,1], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,0], [0,1,1]],
      [[0,1,0], [1,1,0], [1,0,0]],
    ]
  }
};

const TETROMINO_KEYS: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

// 7-Bag Randomizer
function generateBag(): TetrominoType[] {
  const bag = [...TETROMINO_KEYS];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

interface Piece {
  type: TetrominoType;
  x: number;
  y: number;
  rotation: number;
}

interface TetrisCyberArenaProps {
  isDarkMode?: boolean;
  playSound?: (type: 'swim' | 'coin' | 'hit' | 'tech') => void;
}

export const TetrisCyberArena: React.FC<TetrisCyberArenaProps> = ({ isDarkMode = true, playSound }) => {
  // Game Grid: null = empty, string = color of locked block
  const [grid, setGrid] = useState<(string | null)[][]>(() => 
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(1);
  const [comboMessage, setComboMessage] = useState<string | null>(null);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('bumi_tetris_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Bags & Queues
  const bagRef = useRef<TetrominoType[]>([]);
  const getNextFromBag = useCallback((): TetrominoType => {
    if (bagRef.current.length === 0) {
      bagRef.current = generateBag();
    }
    return bagRef.current.pop()!;
  }, []);

  const [nextPieces, setNextPieces] = useState<TetrominoType[]>([]);
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);

  // Audio synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playTone = useCallback((freq: number, type: OscillatorType = 'sine', duration = 0.1) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }, []);

  // Collision Check
  const checkCollision = useCallback((piece: Piece, testGrid: (string | null)[][], offsetX = 0, offsetY = 0, rot = piece.rotation): boolean => {
    const shape = TETROMINOES[piece.type].shapes[rot];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const newX = piece.x + c + offsetX;
          const newY = piece.y + r + offsetY;

          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }
          if (newY >= 0 && testGrid[newY][newX] !== null) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Spawn New Piece
  const spawnPiece = useCallback((typeToSpawn?: TetrominoType) => {
    let nextType = typeToSpawn;
    let newQueue = [...nextPieces];

    if (!nextType) {
      if (newQueue.length < 3) {
        newQueue = [...newQueue, getNextFromBag(), getNextFromBag(), getNextFromBag()];
      }
      nextType = newQueue.shift()!;
      newQueue.push(getNextFromBag());
      setNextPieces(newQueue);
    }

    const startX = Math.floor((COLS - TETROMINOES[nextType].shapes[0][0].length) / 2);
    const newPiece: Piece = {
      type: nextType,
      x: startX,
      y: 0,
      rotation: 0
    };

    // Check immediate gameover
    if (checkCollision(newPiece, grid)) {
      setGameState('gameover');
      playSound?.('hit');
      playTone(180, 'sawtooth', 0.5);
      return;
    }

    setCurrentPiece(newPiece);
    setCanHold(true);
  }, [nextPieces, getNextFromBag, checkCollision, grid, playSound, playTone]);

  // Lock Piece into Grid & Clear Lines
  const lockPiece = useCallback((piece: Piece) => {
    const shape = TETROMINOES[piece.type].shapes[piece.rotation];
    const newGrid = grid.map(row => [...row]);

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const gridY = piece.y + r;
          const gridX = piece.x + c;
          if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            newGrid[gridY][gridX] = TETROMINOES[piece.type].color;
          }
        }
      }
    }

    playTone(220, 'triangle', 0.08);

    // Line Clearing
    let lines = 0;
    const filteredGrid = newGrid.filter(row => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) lines++;
      return !isFull;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(null));
    }

    if (lines > 0) {
      // Score calculation
      const baseScores = [0, 100, 300, 500, 800];
      const points = (baseScores[lines] || 100) * level;
      setScore(s => {
        const newScore = s + points;
        if (newScore > highScore) {
          setHighScore(newScore);
          try {
            localStorage.setItem('bumi_tetris_highscore', newScore.toString());
          } catch {
            // ignore
          }
        }
        return newScore;
      });

      setLinesCleared(l => {
        const updatedLines = l + lines;
        const newLvl = Math.floor(updatedLines / 10) + 1;
        if (newLvl > level) {
          setLevel(newLvl);
          playSound?.('coin');
          playTone(880, 'triangle', 0.4);
        }
        return updatedLines;
      });

      if (lines === 4) {
        setComboMessage('🔥 TETRIS COMBO! +800 🔥');
        playSound?.('coin');
        playTone(660, 'sine', 0.15);
        setTimeout(() => playTone(880, 'sine', 0.3), 120);
      } else if (lines === 3) {
        setComboMessage('⚡ TRIPLE LINE! ⚡');
        playTone(550, 'sine', 0.15);
      } else if (lines === 2) {
        setComboMessage('✨ DOUBLE CLEAR! ✨');
        playTone(440, 'sine', 0.12);
      } else {
        setComboMessage('Line Clear!');
        playTone(392, 'sine', 0.1);
      }
      setTimeout(() => setComboMessage(null), 1800);
    }

    setGrid(filteredGrid);
    spawnPiece();
  }, [grid, level, highScore, spawnPiece, playTone, playSound]);

  // Movement: Move Left / Right
  const moveHorizontally = useCallback((dir: -1 | 1) => {
    if (!currentPiece || gameState !== 'playing') return;
    if (!checkCollision(currentPiece, grid, dir, 0)) {
      setCurrentPiece(p => p ? { ...p, x: p.x + dir } : null);
      playTone(300, 'sine', 0.04);
    }
  }, [currentPiece, gameState, grid, checkCollision, playTone]);

  // Movement: Rotate
  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    const nextRot = (currentPiece.rotation + 1) % 4;
    
    // Standard rotation or wall kick attempts
    const kickOffsets = [0, -1, 1, -2, 2];
    for (const offset of kickOffsets) {
      if (!checkCollision(currentPiece, grid, offset, 0, nextRot)) {
        setCurrentPiece(p => p ? { ...p, x: p.x + offset, rotation: nextRot } : null);
        playTone(480, 'sine', 0.05);
        return;
      }
    }
  }, [currentPiece, gameState, grid, checkCollision, playTone]);

  // Movement: Soft Drop
  const softDrop = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    if (!checkCollision(currentPiece, grid, 0, 1)) {
      setCurrentPiece(p => p ? { ...p, y: p.y + 1 } : null);
      setScore(s => s + 1);
    } else {
      lockPiece(currentPiece);
    }
  }, [currentPiece, gameState, grid, checkCollision, lockPiece]);

  // Movement: Hard Drop
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;
    let dropDistance = 0;
    while (!checkCollision(currentPiece, grid, 0, dropDistance + 1)) {
      dropDistance++;
    }
    const droppedPiece = { ...currentPiece, y: currentPiece.y + dropDistance };
    setScore(s => s + dropDistance * 2);
    playSound?.('tech');
    playTone(520, 'square', 0.06);
    lockPiece(droppedPiece);
  }, [currentPiece, gameState, grid, checkCollision, lockPiece, playSound, playTone]);

  // Hold Piece
  const handleHold = useCallback(() => {
    if (!currentPiece || !canHold || gameState !== 'playing') return;
    const currentType = currentPiece.type;
    if (holdPiece === null) {
      setHoldPiece(currentType);
      spawnPiece();
    } else {
      const nextType = holdPiece;
      setHoldPiece(currentType);
      spawnPiece(nextType);
    }
    setCanHold(false);
    playTone(350, 'sine', 0.08);
  }, [currentPiece, canHold, gameState, holdPiece, spawnPiece, playTone]);

  // Calculate Ghost Piece Y
  const ghostY = React.useMemo(() => {
    if (!currentPiece) return 0;
    let dist = 0;
    while (!checkCollision(currentPiece, grid, 0, dist + 1)) {
      dist++;
    }
    return currentPiece.y + dist;
  }, [currentPiece, grid, checkCollision]);

  // Start / Restart Game
  const startGame = useCallback(() => {
    bagRef.current = generateBag();
    const initialQueue = [getNextFromBag(), getNextFromBag(), getNextFromBag()];
    setNextPieces(initialQueue);
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setScore(0);
    setLinesCleared(0);
    setLevel(1);
    setHoldPiece(null);
    setCanHold(true);
    setComboMessage(null);
    setGameState('playing');
    playSound?.('coin');

    // Spawn first piece
    const firstType = initialQueue.shift()!;
    initialQueue.push(getNextFromBag());
    setNextPieces(initialQueue);

    const startX = Math.floor((COLS - TETROMINOES[firstType].shapes[0][0].length) / 2);
    setCurrentPiece({
      type: firstType,
      x: startX,
      y: 0,
      rotation: 0
    });
  }, [getNextFromBag, playSound]);

  // Game Loop Tick
  useEffect(() => {
    if (gameState !== 'playing') return;
    const speedMs = Math.max(120, 800 - (level - 1) * 65);
    const interval = setInterval(() => {
      softDrop();
    }, speedMs);
    return () => clearInterval(interval);
  }, [gameState, level, softDrop]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') {
        if (e.key === ' ' || e.key === 'Enter') {
          if (gameState === 'idle' || gameState === 'gameover') {
            startGame();
          }
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveHorizontally(-1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveHorizontally(1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          rotatePiece();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          softDrop();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          e.preventDefault();
          handleHold();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setGameState(g => g === 'playing' ? 'paused' : 'playing');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, moveHorizontally, rotatePiece, softDrop, hardDrop, handleHold, startGame]);

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
              <span>NEON BLOCK MATRIX</span>
            </span>
            <span className="text-xs font-mono-tech font-bold text-slate-400">
              Level {level}
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-fun mt-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300">
            🕹️ Tetris Cyber Matrix Mas Bumi
          </h3>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Susun balok neon, bersihkan baris, dan raih kombo spektakuler!
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono-tech">
          <div className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <span className="text-[10px] text-slate-400 block font-bold">SKOR</span>
            <span className="text-xl font-black text-cyan-300">{score}</span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] text-amber-400 block font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" /> REKOR
            </span>
            <span className="text-xl font-black text-amber-300">{highScore}</span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <span className="text-[10px] text-purple-300 block font-bold flex items-center gap-1">
              <Layers className="w-3 h-3" /> BARIS
            </span>
            <span className="text-xl font-black text-purple-300">{linesCleared}</span>
          </div>
        </div>
      </div>

      {/* Main Arena Display */}
      <div className="py-6 flex flex-col lg:flex-row items-center justify-center gap-6 select-none">
        {/* Left Side: Hold Piece & Controls Info */}
        <div className="w-full lg:w-48 space-y-4 font-mono-tech flex flex-row lg:flex-col justify-between items-center lg:items-stretch">
          {/* Hold Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex-1 lg:flex-initial w-full text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simpan (Hold)</span>
            </div>
            <div className="w-20 h-20 mx-auto rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center">
              {holdPiece ? (
                <div
                  className="grid gap-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${TETROMINOES[holdPiece].shapes[0][0].length}, 16px)`
                  }}
                >
                  {TETROMINOES[holdPiece].shapes[0].map((row, r) =>
                    row.map((val, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`w-4 h-4 rounded-xs ${
                          val ? 'border border-white/40' : 'opacity-0'
                        }`}
                        style={{
                          backgroundColor: val ? TETROMINOES[holdPiece].color : 'transparent',
                          boxShadow: val ? `0 0 8px ${TETROMINOES[holdPiece].glow}` : 'none'
                        }}
                      />
                    ))
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-slate-600 font-sans">Kosong (C)</span>
              )}
            </div>
          </div>

          {/* Controls Legend (Desktop) */}
          <div className="hidden lg:block p-3.5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 text-[11px] space-y-1.5 text-slate-300">
            <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1 font-sans">
              <Zap className="w-3 h-3" /> Tombol Keyboard:
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">⬅️ / ➡️</span>
              <span>Geser</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">⬆️</span>
              <span>Putar</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">⬇️</span>
              <span>Turun</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Spasi</span>
              <span>Jatuh Kilat</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">C / Shift</span>
              <span>Simpan (Hold)</span>
            </div>
          </div>
        </div>

        {/* Center: The Tetris Matrix */}
        <div className="relative p-3 rounded-3xl bg-slate-950 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
          {/* Combo Alert Message */}
          {comboMessage && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs font-fun shadow-lg shadow-amber-500/40 animate-bounce whitespace-nowrap">
              {comboMessage}
            </div>
          )}

          {/* Grid Render */}
          <div
            className="grid gap-[2px] bg-slate-900/80 rounded-2xl p-1.5 border border-slate-800"
            style={{
              gridTemplateColumns: `repeat(${COLS}, 26px)`,
              gridTemplateRows: `repeat(${ROWS}, 26px)`
            }}
          >
            {grid.map((row, r) =>
              row.map((cellColor, c) => {
                // Check if current piece occupies this cell
                let isCurrent = false;
                let isGhost = false;
                let currentColor = cellColor;

                if (currentPiece && gameState === 'playing') {
                  const shape = TETROMINOES[currentPiece.type].shapes[currentPiece.rotation];
                  const pr = r - currentPiece.y;
                  const pc = c - currentPiece.x;
                  if (pr >= 0 && pr < shape.length && pc >= 0 && pc < shape[pr].length && shape[pr][pc]) {
                    isCurrent = true;
                    currentColor = TETROMINOES[currentPiece.type].color;
                  }

                  // Ghost piece
                  const gr = r - ghostY;
                  if (!isCurrent && gr >= 0 && gr < shape.length && pc >= 0 && pc < shape[gr].length && shape[gr][pc]) {
                    isGhost = true;
                    currentColor = TETROMINOES[currentPiece.type].color;
                  }
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-[26px] h-[26px] rounded-xs transition-colors duration-75 relative ${
                      isCurrent
                        ? 'border border-white/50 z-10 shadow-[0_0_10px_currentColor]'
                        : isGhost
                        ? 'border border-dashed border-cyan-400/40 bg-cyan-500/10'
                        : cellColor
                        ? 'border border-white/30 shadow-[0_0_6px_currentColor]'
                        : 'bg-slate-950/60 border border-slate-900/80'
                    }`}
                    style={{
                      backgroundColor: isCurrent ? currentColor! : cellColor || (isGhost ? 'rgba(6,182,212,0.1)' : undefined)
                    }}
                  />
                );
              })
            )}
          </div>

          {/* Overlays for Idle / Paused / Game Over */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] mb-3 animate-pulse">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <h4 className="text-2xl font-black font-fun text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300">
                TETRIS CYBER MATRIX
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mb-5 font-sans">
                Asah kecepatan berpikir dan ketajaman spasial Mas Bumi dalam menata balok neon!
              </p>
              <button
                onClick={startGame}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-500/40 transition-all hover:scale-105 cursor-pointer font-mono-tech flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>MULAI MAIN 🚀</span>
              </button>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center mb-3">
                <Pause className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black font-fun text-amber-300">GAME DIJEDA</h4>
              <button
                onClick={() => setGameState('playing')}
                className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-mono-tech cursor-pointer"
              >
                LANJUTKAN ▶️
              </button>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)] mb-3 animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-black font-fun text-rose-400">
                GAME OVER!
              </h4>
              <div className="my-3 space-y-1 font-mono-tech text-xs">
                <div className="text-slate-300">Skor Akhir: <strong className="text-cyan-300 text-base">{score}</strong></div>
                <div className="text-slate-400">Total Baris: <strong className="text-white">{linesCleared}</strong> (Level {level})</div>
                {score >= highScore && score > 0 && (
                  <div className="text-amber-300 font-bold mt-1">🎉 REKOR SKOR BARU! 🎉</div>
                )}
              </div>
              <button
                onClick={startGame}
                className="mt-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-xs shadow-xl shadow-rose-500/40 transition-all hover:scale-105 cursor-pointer font-mono-tech flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>MAIN LAGI 🔄</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Next Pieces Queue */}
        <div className="w-full lg:w-48 space-y-4 font-mono-tech flex flex-row lg:flex-col justify-between items-center lg:items-stretch">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex-1 lg:flex-initial w-full text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Berikutnya</span>
            </div>
            <div className="space-y-3">
              {nextPieces.slice(0, 3).map((type, idx) => (
                <div
                  key={idx}
                  className="w-20 h-14 mx-auto rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center"
                >
                  <div
                    className="grid gap-0.5"
                    style={{
                      gridTemplateColumns: `repeat(${TETROMINOES[type].shapes[0][0].length}, 13px)`
                    }}
                  >
                    {TETROMINOES[type].shapes[0].map((row, r) =>
                      row.map((val, c) => (
                        <div
                          key={`${r}-${c}`}
                          className={`w-3 h-3 rounded-xs ${
                            val ? 'border border-white/40' : 'opacity-0'
                          }`}
                          style={{
                            backgroundColor: val ? TETROMINOES[type].color : 'transparent',
                            boxShadow: val ? `0 0 6px ${TETROMINOES[type].glow}` : 'none'
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Touch Controls */}
      <div className="pt-2 pb-4 max-w-sm mx-auto space-y-2 select-none font-mono-tech">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleHold}
            disabled={gameState !== 'playing' || !canHold}
            className="py-3 rounded-2xl bg-slate-800/90 active:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 flex flex-col items-center justify-center gap-1 disabled:opacity-30 cursor-pointer"
          >
            <Package className="w-4 h-4 text-cyan-400" />
            <span>HOLD</span>
          </button>
          <button
            onClick={rotatePiece}
            disabled={gameState !== 'playing'}
            className="py-3 rounded-2xl bg-indigo-600/80 active:bg-indigo-500 border border-indigo-500 text-xs font-bold text-white flex flex-col items-center justify-center gap-1 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <RotateCw className="w-4 h-4 text-amber-300" />
            <span>PUTAR</span>
          </button>
          <button
            onClick={hardDrop}
            disabled={gameState !== 'playing'}
            className="py-3 rounded-2xl bg-rose-600/80 active:bg-rose-500 border border-rose-500 text-xs font-bold text-white flex flex-col items-center justify-center gap-1 shadow-md shadow-rose-600/30 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>HARD DROP</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => moveHorizontally(-1)}
            disabled={gameState !== 'playing'}
            className="py-3.5 rounded-2xl bg-slate-800/90 active:bg-slate-700 border border-slate-700 text-sm font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
          </button>
          <button
            onClick={softDrop}
            disabled={gameState !== 'playing'}
            className="py-3.5 rounded-2xl bg-slate-800/90 active:bg-slate-700 border border-slate-700 text-sm font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowDown className="w-5 h-5 text-cyan-400" />
          </button>
          <button
            onClick={() => moveHorizontally(1)}
            disabled={gameState !== 'playing'}
            className="py-3.5 rounded-2xl bg-slate-800/90 active:bg-slate-700 border border-slate-700 text-sm font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
