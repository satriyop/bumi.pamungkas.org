import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Waves, 
  Award, 
  Sparkles, 
  MapPin, 
  Trophy, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  ExternalLink, 
  Activity, 
  Sun, 
  Moon, 
  Check, 
  Star, 
  Flame, 
  Gamepad2, 
  Zap, 
  Calculator, 
  Flag, 
  Layers, 
  Volume2, 
  VolumeX, 
  ArrowUp,
  Clock,
  Thermometer,
  CloudSun,
  QrCode,
  Bot,
  Send,
  Sliders,
  Droplets,
  Wifi,
  Scan,
  Trash2,
  Calendar,
  BookOpen,
  CheckCircle2,
  Camera,
  Heart,
  Compass,
  Crown
} from 'lucide-react';
import { ChessMasterArena } from './components/ChessMasterArena';
import { LaserOpticsArena } from './components/LaserOpticsArena';
import { TetrisCyberArena } from './components/TetrisCyberArena';

// ==========================================
// BLACK MARLIN (IKAN MARLIN HITAM) GRAPHICS
// ==========================================
function BlackMarlinIcon({ className = "w-12 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bmBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="30%" stopColor="#1e3a8a" />
          <stop offset="65%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
        <linearGradient id="bmDorsalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      {/* Dorsal Sail Fin */}
      <path d="M40 22 Q58 2 68 8 Q72 16 78 22 Z" fill="url(#bmDorsalGrad)" stroke="#38bdf8" strokeWidth="0.8" />
      {/* Tail Fin (Crescent) */}
      <path d="M22 25 Q14 16 6 8 Q12 25 6 42 Q14 34 22 25 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
      {/* Torpedo Main Body */}
      <path d="M85 23 C76 14 55 12 36 17 Q24 21 22 25 Q24 29 36 33 C55 38 76 35 84 27 Z" fill="url(#bmBodyGrad)" stroke="#0284c7" strokeWidth="1" />
      {/* Neon Electric Stripes */}
      <line x1="42" y1="18" x2="40" y2="31" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
      <line x1="50" y1="17" x2="48" y2="33" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
      <line x1="58" y1="16" x2="56" y2="34" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
      <line x1="66" y1="16" x2="64" y2="33" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
      <line x1="74" y1="18" x2="72" y2="30" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
      {/* Rigid Pectoral Fin */}
      <path d="M60 27 Q52 38 42 40 Q52 32 62 27 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
      {/* Pelvic Fins */}
      <line x1="68" y1="32" x2="56" y2="44" stroke="#0284c7" strokeWidth="1.5" />
      {/* Spear / Sword Bill (Pointing Forward to the Right) */}
      <polygon points="84,23.5 118,24.5 85,26.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="0.5" />
      {/* Fierce Golden Eye */}
      <circle cx="76" cy="22" r="3" fill="#facc15" />
      <circle cx="76.5" cy="22" r="1.6" fill="#020617" />
      <circle cx="77" cy="21.5" r="0.6" fill="#ffffff" />
    </svg>
  );
}

function drawBlackMarlin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  vy: number,
  tailPhase: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Dynamic tilt when diving / surfacing
  const tilt = Math.max(-0.42, Math.min(0.42, vy * 0.055));
  ctx.rotate(tilt);

  // Subtle swimming tail wag
  const wag = Math.sin(tailPhase) * 2.8;

  // Ocean glow aura
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 14;

  // 1. DORSAL FIN (Sirip Layar Atas)
  ctx.beginPath();
  ctx.moveTo(-12, -6);
  ctx.quadraticCurveTo(4, -26, 12, -22);
  ctx.quadraticCurveTo(16, -14, 22, -6);
  ctx.lineTo(-24, -3);
  ctx.closePath();
  const dorsalGrad = ctx.createLinearGradient(0, -26, 0, 0);
  dorsalGrad.addColorStop(0, '#0c192c');
  dorsalGrad.addColorStop(0.5, '#0284c7');
  dorsalGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = dorsalGrad;
  ctx.fill();

  // Spiny dorsal rays
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2, -6); ctx.lineTo(8, -23);
  ctx.moveTo(-8, -5); ctx.lineTo(2, -19);
  ctx.moveTo(-16, -4); ctx.lineTo(-6, -14);
  ctx.stroke();

  // 2. TAIL FIN (Sirip Ekor Sabit Melengkung)
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.quadraticCurveTo(-32, -8, -42 + wag, -18);
  ctx.quadraticCurveTo(-35 + wag, 0, -42 + wag, 18);
  ctx.quadraticCurveTo(-32, 8, -26, 0);
  ctx.closePath();
  const tailGrad = ctx.createLinearGradient(-42, 0, -24, 0);
  tailGrad.addColorStop(0, '#0284c7');
  tailGrad.addColorStop(0.5, '#0369a1');
  tailGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = tailGrad;
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 3. MAIN TORPEDO BODY (Tubuh Black Marlin Hadap Depan)
  ctx.beginPath();
  ctx.moveTo(24, -2.5); // base of bill (top)
  ctx.bezierCurveTo(16, -10, 0, -11, -16, -7);
  ctx.quadraticCurveTo(-22, -4, -26, 0);
  ctx.quadraticCurveTo(-22, 4, -16, 7);
  ctx.bezierCurveTo(0, 11, 16, 9, 24, 2);
  ctx.closePath();

  // Body gradient: Midnight obsidian top to silver-white belly
  const bodyGrad = ctx.createLinearGradient(0, -11, 0, 11);
  bodyGrad.addColorStop(0, '#020617');
  bodyGrad.addColorStop(0.3, '#0c2340');
  bodyGrad.addColorStop(0.6, '#0284c7');
  bodyGrad.addColorStop(1, '#f0f9ff');
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 4. NEON ELECTRIC STRIPES (Garis Biru Neon Khas Marlin)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 1.6;
  for (let sx = -14; sx <= 14; sx += 6) {
    ctx.beginPath();
    ctx.moveTo(sx, -6);
    ctx.lineTo(sx - 1.5, 4);
    ctx.stroke();
  }

  // 5. PECTORAL FIN (Sirip Dada Kaku Khas Black Marlin)
  ctx.beginPath();
  ctx.moveTo(6, 2);
  ctx.quadraticCurveTo(0, 14, -8, 16);
  ctx.quadraticCurveTo(0, 8, 8, 2);
  ctx.closePath();
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 6. VENTRAL FINS (Sirip Perut Panjang Bawah)
  ctx.beginPath();
  ctx.moveTo(10, 5);
  ctx.lineTo(1, 17);
  ctx.moveTo(8, 5);
  ctx.lineTo(-1, 16);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 7. SWORD BILL / ROSTRUM (Moncong Pedang Hadap Depan Menghadap Kanan)
  ctx.beginPath();
  ctx.moveTo(24, -2.5);
  ctx.lineTo(52, -1); // Tip of the sword pointing right
  ctx.lineTo(24, 0.8);
  ctx.closePath();
  const billGrad = ctx.createLinearGradient(24, 0, 52, 0);
  billGrad.addColorStop(0, '#0f172a');
  billGrad.addColorStop(0.8, '#334155');
  billGrad.addColorStop(1, '#38bdf8'); // Glowing sharp tip
  ctx.fillStyle = billGrad;
  ctx.fill();

  // Sword highlight
  ctx.beginPath();
  ctx.moveTo(25, -2);
  ctx.lineTo(51, -1);
  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Lower jaw
  ctx.beginPath();
  ctx.moveTo(24, 2);
  ctx.lineTo(32, 0.8);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 8. FIERCE GOLDEN EYE
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#facc15';
  ctx.beginPath();
  ctx.arc(15, -2.5, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = '#facc15';
  ctx.fill();
  ctx.shadowBlur = 0;

  // Pupil
  ctx.beginPath();
  ctx.arc(15.6, -2.5, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = '#020617';
  ctx.fill();

  // Catchlight
  ctx.beginPath();
  ctx.arc(16.2, -3.1, 0.7, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // 9. GILL SLIT
  ctx.beginPath();
  ctx.arc(7, -1, 7, -0.4, 0.8);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 10. SPEED BUBBLE JET
  ctx.fillStyle = 'rgba(224, 242, 254, 0.65)';
  ctx.beginPath();
  ctx.arc(-46 + wag, -2, 2.2, 0, Math.PI * 2);
  ctx.arc(-53 + wag * 0.5, 3, 1.6, 0, Math.PI * 2);
  ctx.arc(-59, -1, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // 11. TEXT LABEL "BLACK MARLIN • BUMI"
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 5;
  ctx.fillText('⚡ BLACK MARLIN • BUMI', 0, -26);
  ctx.shadowBlur = 0;

  ctx.restore();
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default high-tech dark mode!

  // ==========================================
  // REAL-TIME HUD CLOCK & TELEMETRY
  // ==========================================
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // NATIVE SOUND SYNTHESIZER (Web Audio API)
  // ==========================================
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  const playSound = useCallback((type: 'swim' | 'coin' | 'hit' | 'tech') => {
    if (isSoundMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      if (type === 'swim') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'coin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'tech') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      // Ignore audio block
    }
  }, [isSoundMuted]);

  // ==========================================
  // FITUR CANGGIH 1: KALKULATOR TELEMETRI RENANG & ENERGI
  // ==========================================
  const [workoutDuration, setWorkoutDuration] = useState(45); // minutes
  const [bodyWeight, setBodyWeight] = useState(47); // 47 kg berat badan resmi Mas Bumi
  const [workoutStroke, setWorkoutStroke] = useState<'bebas' | 'dada' | 'punggung' | 'kupu'>('punggung');

  // Scientific MET (Metabolic Equivalent of Task) values for youth swimming
  const strokeMET = {
    bebas: 8.5,    // Freestyle (moderate-to-vigorous)
    dada: 8.0,     // Breaststroke
    punggung: 7.5, // Backstroke
    kupu: 11.5     // Butterfly (highest metabolic power)
  };

  // Calories = MET × Weight (kg) × Duration (hours)
  const caloriesBurned = Math.round(strokeMET[workoutStroke] * bodyWeight * (workoutDuration / 60));

  // Hydration = ~12 ml per kg per hour + 150ml baseline fluid recovery
  const waterNeededMl = Math.round(bodyWeight * 12 * (workoutDuration / 60) + 150);

  // Estimated 50m laps (approx 75s per lap including turnaround and rest intervals)
  const estimatedLaps = Math.round((workoutDuration * 60) / 75);

  // ==========================================
  // FITUR CANGGIH 2: "BUMIBOT" VIRTUAL AI ASISTEN INTERAKTIF
  // ==========================================
  interface ChatMsg {
    sender: 'user' | 'bot';
    text: string;
    time: string;
  }

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      sender: 'bot',
      text: 'Halo! Aku BumiBot 🤖, asisten digital pintar di bumi.pamungkas.org. Mau tanya apa tentang Mas Bumi?',
      time: 'Baru saja'
    }
  ]);
  const [inputChat, setInputChat] = useState('');

  const botResponses: { [key: string]: string } = {
    'siapa': 'Mas Bumi (Kun Bumi Pamungkas) adalah perenang muda berbakat asal Klaten, lahir 5 Juni 2014 (umur 12 tahun). Siswa MIM Basin Klaten & murid Kumon yang gemar berolahraga dan teknologi!',
    'sekolah': 'Mas Bumi bersekolah di Madrasah Ibtidaiyah Muhammadiyah (MIM) Basin di Kebonarum, Klaten. Sekolah yang hebat dengan guru ramah dan teman-teman kompak!',
    'renang': 'Hobi utama Mas Bumi adalah renang dengan spesialisasi Gaya Punggung (Backstroke)! Mas Bumi juga menguasai 4 gaya renang lengkap: Gaya Bebas, Gaya Dada, Gaya Punggung, dan Gaya Kupu-kupu 🏊‍♂️🌊!',
    'catur': 'Mas Bumi sangat hobi bermain Catur (Chess) ♟️! Bagi Mas Bumi, catur adalah olahraga otak yang melatih perhitungan beberapa langkah ke depan, kesabaran, taktik garpu kuda, skakmat, dan ketenangan berpikir strategis!',
    'hobi': 'Mas Bumi punya dua hobi unggulan yang seimbang: Renang di air (melatih fisik, stamina & 4 gaya renang dengan spesialisasi gaya punggung) 🏊‍♂️ serta Catur di darat (melatih daya taktik, strategi berpikir beberapa langkah ke depan, & fokus mental) ♟️!',
    'kupu': 'Gaya Kupu-kupu (Butterfly stroke) 🦋 adalah salah satu gaya renang paling hebat dan menantang yang dipelajari Mas Bumi! Gerakannya butuh kekuatan bahu yang tangguh, ayunan kedua tangan bersamaan ke depan, dan dolphin kick yang sangat kuat meluncur di air!',
    'kumon': 'Di Kumon, Mas Bumi melatih kemandirian, kecepatan berhitung, serta daya fokus logika matematika setiap hari tanpa bolong!',
    'klaten': 'Klaten adalah kota kelahiran Mas Bumi di Jawa Tengah yang terkenal dengan seribu mata air jernih (Umbul Ponggok, Umbul Sigedang), Candi Plaosan, dan semboyan Klaten BERSINAR!',
    'game': 'Ada 8 game seru di website ini! Ada game petualangan menyelam Black Marlin, balapan renang 50m, hitung kilat Kumon, tebak kartu memori, kuis multi-ronde, asah taktik catur ♟️, labirin laser optik 🔮, dan tetris cyber 🧱!'
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputChat;
    if (!query.trim()) return;

    playSound('tech');
    const userMsg: ChatMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputChat('');

    // Process Bot Response
    setTimeout(() => {
      playSound('coin');
      const lower = query.toLowerCase();
      let reply = 'Pertanyaan keren! Mas Bumi terus giat berlatih renang 4 gaya, asah strategi catur ♟️, serta tekun belajar di MIM Basin dan Kumon!';

      if (lower.includes('catur') || lower.includes('chess') || lower.includes('skak')) {
        reply = botResponses['catur'];
      } else if (lower.includes('kupu') || lower.includes('butterfly')) {
        reply = botResponses['kupu'];
      } else if (lower.includes('siapa') || lower.includes('nama') || lower.includes('profil') || lower.includes('umur')) {
        reply = botResponses['siapa'];
      } else if (lower.includes('sekolah') || lower.includes('mim') || lower.includes('basin')) {
        reply = botResponses['sekolah'];
      } else if (lower.includes('hobi')) {
        reply = botResponses['hobi'];
      } else if (lower.includes('renang') || lower.includes('gaya')) {
        reply = botResponses['renang'];
      } else if (lower.includes('kumon') || lower.includes('hitung') || lower.includes('matematika')) {
        reply = botResponses['kumon'];
      } else if (lower.includes('klaten') || lower.includes('umbul') || lower.includes('candi')) {
        reply = botResponses['klaten'];
      } else if (lower.includes('game') || lower.includes('main') || lower.includes('kuis')) {
        reply = botResponses['game'];
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 450);
  };

  const clearChat = () => {
    playSound('tech');
    setChatMessages([
      {
        sender: 'bot',
        text: 'Obrolan sudah dibersihkan! 🧹 Halo lagi! Mau tanya apa tentang Mas Bumi?',
        time: 'Baru saja'
      }
    ]);
  };

  // ==========================================
  // GAME TABS & ARCADE RUNNER
  // ==========================================
  const [activeGameTab, setActiveGameTab] = useState<'arcade' | 'swim' | 'math' | 'memory' | 'quiz' | 'chess' | 'laser' | 'tetris'>('arcade');

  useEffect(() => {
    const checkHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h.includes('catur') || h.includes('chess')) {
        setActiveGameTab('chess');
      } else if (h.includes('laser') || h.includes('optik')) {
        setActiveGameTab('laser');
      } else if (h.includes('tetris')) {
        setActiveGameTab('tetris');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [arcadeState, setArcadeState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [arcadeScore, setArcadeScore] = useState(0);
  const [arcadeHighScore, setArcadeHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('bumi_arcade_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  const gameStateRef = useRef({
    playerY: 150,
    playerVy: 0,
    obstacles: [] as { x: number; y: number; size: number; speed: number; emoji: string }[],
    coins: [] as { x: number; y: number; size: number; emoji: string; points: number }[],
    bubbles: [] as { x: number; y: number; r: number; speed: number; opacity: number }[],
    score: 0,
    distance: 0,
    gameSpeed: 3.5,
    lastObstacleSpawn: 0,
    lastCoinSpawn: 0,
    animationId: 0
  });

  const swimUp = useCallback(() => {
    if (arcadeState === 'playing') {
      gameStateRef.current.playerVy = -5.8;
      playSound('swim');
      for (let i = 0; i < 3; i++) {
        gameStateRef.current.bubbles.push({
          x: 80 - Math.random() * 15,
          y: gameStateRef.current.playerY + 15 + (Math.random() * 10 - 5),
          r: Math.random() * 4 + 2,
          speed: Math.random() * 2 + 1,
          opacity: 0.8
        });
      }
    }
  }, [arcadeState, playSound]);

  const startArcadeGame = () => {
    playSound('tech');
    gameStateRef.current = {
      playerY: 140,
      playerVy: 0,
      obstacles: [],
      coins: [],
      bubbles: [],
      score: 0,
      distance: 0,
      gameSpeed: 3.6,
      lastObstacleSpawn: Date.now(),
      lastCoinSpawn: Date.now(),
      animationId: 0
    };
    setArcadeScore(0);
    setArcadeState('playing');
  };

  useEffect(() => {
    if (arcadeState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    const obstacleEmojis = ['🪼', '🐡', '🪸', '🐙'];
    const coinItems = [
      { emoji: '🏅', points: 50 },
      { emoji: '⭐', points: 25 },
      { emoji: '📚', points: 100 }
    ];

    const loop = () => {
      if (!isRunning) return;
      const state = gameStateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      state.playerVy += 0.26;
      state.playerY += state.playerVy;

      if (state.playerY < 20) {
        state.playerY = 20;
        state.playerVy = 0;
      }
      if (state.playerY > height - 35) {
        state.playerY = height - 35;
        state.playerVy = 0;
      }

      state.distance += 1;
      if (state.distance % 8 === 0) {
        state.score += 1;
        setArcadeScore(state.score);
      }

      state.gameSpeed = 3.6 + Math.min(4, state.score * 0.005);

      const now = Date.now();
      if (now - state.lastObstacleSpawn > Math.max(1200, 2200 - state.score * 3)) {
        state.lastObstacleSpawn = now;
        const randomEmoji = obstacleEmojis[Math.floor(Math.random() * obstacleEmojis.length)];
        state.obstacles.push({
          x: width + 30,
          y: Math.random() * (height - 80) + 40,
          size: 32,
          speed: state.gameSpeed + (Math.random() * 1.5 - 0.5),
          emoji: randomEmoji
        });
      }

      if (now - state.lastCoinSpawn > 1600) {
        state.lastCoinSpawn = now;
        const randomItem = coinItems[Math.floor(Math.random() * coinItems.length)];
        state.coins.push({
          x: width + 20,
          y: Math.random() * (height - 90) + 45,
          size: 28,
          emoji: randomItem.emoji,
          points: randomItem.points
        });
      }

      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        obs.x -= obs.speed;

        const dx = 80 - obs.x;
        const dy = (state.playerY + 12) - obs.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 26) {
          playSound('hit');
          isRunning = false;
          setArcadeState('gameover');
          setArcadeHighScore((prevHigh) => {
            const finalHigh = Math.max(prevHigh, state.score);
            try {
              localStorage.setItem('bumi_arcade_highscore', finalHigh.toString());
            } catch {
              // ignore
            }
            return finalHigh;
          });
          return;
        }

        if (obs.x < -40) {
          state.obstacles.splice(i, 1);
        }
      }

      for (let i = state.coins.length - 1; i >= 0; i--) {
        const coin = state.coins[i];
        coin.x -= state.gameSpeed;

        const dx = 80 - coin.x;
        const dy = (state.playerY + 12) - coin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 28) {
          playSound('coin');
          state.score += coin.points;
          setArcadeScore(state.score);
          state.coins.splice(i, 1);
          continue;
        }

        if (coin.x < -40) {
          state.coins.splice(i, 1);
        }
      }

      if (Math.random() > 0.4) {
        state.bubbles.push({
          x: Math.random() * width,
          y: height + 10,
          r: Math.random() * 4 + 1.5,
          speed: Math.random() * 1.5 + 0.8,
          opacity: Math.random() * 0.5 + 0.2
        });
      }

      for (let i = state.bubbles.length - 1; i >= 0; i--) {
        const b = state.bubbles[i];
        b.y -= b.speed;
        b.x -= state.gameSpeed * 0.3;
        if (b.y < -10) {
          state.bubbles.splice(i, 1);
        }
      }

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.5, '#0369a1');
      grad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(width * 0.3, 0);
      ctx.lineTo(width * 0.55, height);
      ctx.lineTo(width * 0.65, height);
      ctx.lineTo(width * 0.45, 0);
      ctx.fill();

      for (const b of state.bubbles) {
        ctx.fillStyle = `rgba(224, 242, 254, ${b.opacity})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const c of state.coins) {
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.fillText(c.emoji, c.x, c.y);
        ctx.shadowBlur = 0;
      }

      for (const obs of state.obstacles) {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.fillText(obs.emoji, obs.x, obs.y);
        ctx.shadowBlur = 0;
      }

      // Draw Black Marlin Player facing forward (right)
      drawBlackMarlin(ctx, 80, state.playerY + 12, state.playerVy, Date.now() * 0.015);

      state.animationId = requestAnimationFrame(loop);
    };

    gameStateRef.current.animationId = requestAnimationFrame(loop);
    return () => {
      isRunning = false;
      cancelAnimationFrame(gameStateRef.current.animationId);
    };
  }, [arcadeState, playSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept space or arrows if user is typing in chat or any input
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Only intercept space & arrows when the arcade game tab is active
      if (activeGameTab !== 'arcade') {
        return;
      }

      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (arcadeState === 'playing') {
          swimUp();
        } else if (arcadeState === 'idle' || arcadeState === 'gameover') {
          startArcadeGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [arcadeState, swimUp, activeGameTab]);

  // ==========================================
  // GAME 2: BALAPAN RENANG 50 METER
  // ==========================================
  const [raceState, setRaceState] = useState<'idle' | 'racing' | 'finished'>('idle');
  const [bumiProgress, setBumiProgress] = useState(0);
  const [rivalProgress, setRivalProgress] = useState(0);
  const [raceWinner, setRaceWinner] = useState<string | null>(null);
  const [raceTimeMs, setRaceTimeMs] = useState(0);
  const [selectedRaceStroke, setSelectedRaceStroke] = useState('Gaya Bebas 🏊‍♂️');

  useEffect(() => {
    let raceInterval: NodeJS.Timeout | null = null;
    if (raceState === 'racing') {
      const startTime = Date.now();
      raceInterval = setInterval(() => {
        setRaceTimeMs(Date.now() - startTime);
        setRivalProgress((prev) => {
          const nextVal = prev + Math.random() * 2.8 + 1.2;
          return nextVal >= 100 ? 100 : nextVal;
        });
      }, 150);
    }
    return () => {
      if (raceInterval) clearInterval(raceInterval);
    };
  }, [raceState]);

  useEffect(() => {
    if (raceState === 'racing') {
      if (bumiProgress >= 100 && rivalProgress < 100) {
        setRaceWinner('Mas Bumi');
        setRaceState('finished');
      } else if (rivalProgress >= 100 && bumiProgress < 100) {
        setRaceWinner('Si Lumba-Lumba 🐬');
        setRaceState('finished');
      } else if (bumiProgress >= 100 && rivalProgress >= 100) {
        setRaceWinner(bumiProgress > rivalProgress ? 'Mas Bumi' : 'Si Lumba-Lumba 🐬');
        setRaceState('finished');
      }
    }
  }, [bumiProgress, rivalProgress, raceState]);

  const startRace = () => {
    playSound('tech');
    setBumiProgress(0);
    setRivalProgress(0);
    setRaceTimeMs(0);
    setRaceWinner(null);
    setRaceState('racing');
  };

  const paddleBumi = () => {
    if (raceState === 'racing') {
      playSound('swim');
      setBumiProgress((prev) => Math.min(100, prev + 5.5));
    }
  };

  const resetRace = () => {
    setRaceState('idle');
    setBumiProgress(0);
    setRivalProgress(0);
    setRaceTimeMs(0);
    setRaceWinner(null);
  };

  // ==========================================
  // GAME 3: TANTANGAN HITUNG KILAT KUMON
  // ==========================================
  const [mathState, setMathState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [mathTimeLeft, setMathTimeLeft] = useState(20);
  const [mathScore, setMathScore] = useState(0);
  const [mathStreak, setMathStreak] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<{ q: string; ans: number; options: number[] }>({
    q: '7 + 8',
    ans: 15,
    options: [14, 15, 16, 17]
  });

  const generateProblem = () => {
    const isMultiplication = Math.random() > 0.5;
    let n1: number, n2: number, ans: number, q: string;
    if (isMultiplication) {
      n1 = Math.floor(Math.random() * 8) + 2;
      n2 = Math.floor(Math.random() * 8) + 2;
      ans = n1 * n2;
      q = `${n1} × ${n2}`;
    } else {
      n1 = Math.floor(Math.random() * 40) + 10;
      n2 = Math.floor(Math.random() * 40) + 10;
      ans = n1 + n2;
      q = `${n1} + ${n2}`;
    }
    const wrong1 = ans + (Math.random() > 0.5 ? 2 : -2);
    const wrong2 = ans + (Math.random() > 0.5 ? 5 : -3);
    const wrong3 = ans + 10;
    const options = [ans, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);
    return { q, ans, options };
  };

  const startMathGame = () => {
    playSound('tech');
    setMathScore(0);
    setMathStreak(0);
    setMathTimeLeft(20);
    setCurrentProblem(generateProblem());
    setMathState('playing');
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (mathState === 'playing') {
      timer = setInterval(() => {
        setMathTimeLeft((prev) => {
          if (prev <= 1) {
            setMathState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mathState]);

  const handleMathAnswer = (chosen: number) => {
    if (mathState !== 'playing') return;
    if (chosen === currentProblem.ans) {
      playSound('coin');
      setMathScore((s) => s + 10 + mathStreak * 2);
      setMathStreak((st) => st + 1);
    } else {
      playSound('hit');
      setMathStreak(0);
    }
    setCurrentProblem(generateProblem());
  };

  // ==========================================
  // GAME 4: KUIS MULTI-RONDE MAS BUMI
  // ==========================================
  const quizRounds = [
    {
      roundName: 'Ronde 1: Fakta Mas Bumi 🏊‍♂️',
      desc: 'Pertanyaan seputar profil, sekolah, dan hobi Mas Bumi!',
      questions: [
        {
          q: 'Kapan hari ulang tahun Mas Bumi?',
          options: ['10 Januari 2013', '5 Juni 2014', '17 Agustus 2014'],
          correct: 1
        },
        {
          q: 'Di madrasah mana Mas Bumi menuntut ilmu?',
          options: ['MIM Basin Klaten', 'SD Bintang Kejora', 'SMP 1 Klaten'],
          correct: 0
        },
        {
          q: 'Selain olahraga renang di air, permainan asah taktik & strategi apa yang jadi hobi Mas Bumi?',
          options: ['Bermain Catur (Chess ♟️)', 'Main Kelereng', 'Lompat Tali'],
          correct: 0
        },
        {
          q: 'Apa nama metode belajar mandiri matematika yang Mas Bumi ikuti?',
          options: ['Kumon', 'Sempoa Tradisional', 'Les Tari'],
          correct: 0
        },
        {
          q: 'Kabupaten asal Mas Bumi yang terkenal indah dan asri adalah?',
          options: ['Klaten, Jawa Tengah', 'Surabaya', 'Denpasar'],
          correct: 0
        }
      ]
    },
    {
      roundName: 'Ronde 2: Jelajah Klaten & Umbul Renang 🌊',
      desc: 'Uji pengetahuan tentang kota Klaten dan mata air renang alaminya!',
      questions: [
        {
          q: 'Apa nama umbul jernih terkenal di Klaten yang bisa dipakai renang bareng ikan-ikan?',
          options: ['Umbul Ponggok', 'Pantai Parangtritis', 'Danau Toba'],
          correct: 0
        },
        {
          q: 'Candi kembar bersejarah yang sangat megah dan indah di Klaten adalah?',
          options: ['Candi Plaosan', 'Candi Borobudur', 'Menara Eiffel'],
          correct: 0
        },
        {
          q: 'Umbul di Klaten yang airnya sangat segar di bawah pepohonan rindang adalah?',
          options: ['Umbul Sigedang / Manten', 'Sungai Nil', 'Air Terjun Niagara'],
          correct: 0
        },
        {
          q: 'Waduk atau danau wisata yang terkenal di Klaten dengan pemandangan bukit adalah?',
          options: ['Rowo Jombor', 'Danau Singkarak', 'Telaga Sarangan'],
          correct: 0
        },
        {
          q: 'Apa semboyan kebanggaan kabupaten Klaten?',
          options: ['Klaten BERSINAR', 'Klaten Keren', 'Klaten Hebat'],
          correct: 0
        }
      ]
    },
    {
      roundName: 'Ronde 3: Dunia Renang & Olahraga Dunia 🏅',
      desc: 'Tantangan seputar ilmu renang dan olahraga internasional!',
      questions: [
        {
          q: 'Gaya renang apa yang tercepat di antara semua gaya renang?',
          options: ['Gaya Bebas (Freestyle)', 'Gaya Dada', 'Gaya Anjing'],
          correct: 0
        },
        {
          q: 'Berapa meter panjang lintasan kolam renang standar Olimpiade?',
          options: ['50 Meter', '25 Meter', '100 Meter'],
          correct: 0
        },
        {
          q: 'Gaya renang yang gerakannya mengepakkan kedua tangan seperti sayap disebut?',
          options: ['Gaya Kupu-kupu (Butterfly)', 'Gaya Punggung', 'Gaya Batu'],
          correct: 0
        },
        {
          q: 'Gaya renang yang posisi tubuh telentang menghadap langit adalah?',
          options: ['Gaya Punggung (Backstroke)', 'Gaya Dada', 'Gaya Menyelam'],
          correct: 0
        },
        {
          q: 'Apa yang wajib kita lakukan sebelum masuk dan melompat ke kolam renang?',
          options: ['Pemanasan & Peregangan Otot', 'Tidur Siang', 'Makan Berat'],
          correct: 0
        }
      ]
    }
  ];

  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const currentQuestions = quizRounds[currentRoundIdx].questions;

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    playSound('tech');
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCheckQuiz = () => {
    let score = 0;
    currentQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score += 1;
    });
    setQuizScore(score);
    if (score >= 3) {
      playSound('coin');
    }
  };

  const nextQuizRound = () => {
    playSound('tech');
    setCurrentRoundIdx((prev) => (prev + 1) % quizRounds.length);
    setAnswers({});
    setQuizScore(null);
  };

  // ==========================================
  // GAME 4: TEBAK KARTU MEMORI
  // ==========================================
  const initialCards = [
    { id: 1, symbol: '🏊‍♂️', name: 'Renang', matched: false },
    { id: 2, symbol: '🏊‍♂️', name: 'Renang', matched: false },
    { id: 3, symbol: '♟️', name: 'Catur', matched: false },
    { id: 4, symbol: '♟️', name: 'Catur', matched: false },
    { id: 5, symbol: '🏆', name: 'Piala', matched: false },
    { id: 6, symbol: '🏆', name: 'Piala', matched: false },
    { id: 7, symbol: '🧮', name: 'Kumon', matched: false },
    { id: 8, symbol: '🧮', name: 'Kumon', matched: false },
    { id: 9, symbol: '🏫', name: 'MIM Basin', matched: false },
    { id: 10, symbol: '🏫', name: 'MIM Basin', matched: false },
    { id: 11, symbol: '♞', name: 'Kuda Catur', matched: false },
    { id: 12, symbol: '♞', name: 'Kuda Catur', matched: false },
  ];

  const [memoryCards, setMemoryCards] = useState(() => 
    [...initialCards].sort(() => Math.random() - 0.5)
  );
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [isMemoryWon, setIsMemoryWon] = useState(false);

  const handleFlipCard = (index: number) => {
    if (flippedCards.length === 2 || memoryCards[index].matched || flippedCards.includes(index)) {
      return;
    }
    playSound('swim');
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const firstCard = memoryCards[newFlipped[0]];
      const secondCard = memoryCards[newFlipped[1]];

      if (firstCard.symbol === secondCard.symbol) {
        playSound('coin');
        setTimeout(() => {
          setMemoryCards((prev) => {
            const updated = prev.map((card, i) => 
              i === newFlipped[0] || i === newFlipped[1] ? { ...card, matched: true } : card
            );
            if (updated.every((c) => c.matched)) {
              setIsMemoryWon(true);
            }
            return updated;
          });
          setFlippedCards([]);
        }, 350);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 850);
      }
    }
  };

  const resetMemoryGame = () => {
    playSound('tech');
    setMemoryCards([...initialCards].sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMemoryMoves(0);
    setIsMemoryWon(false);
  };

  // ==========================================
  // STOPWATCH STATE
  // ==========================================
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStroke, setSelectedStroke] = useState('Gaya Bebas 🏊‍♂️');
  const [savedLaps, setSavedLaps] = useState<{ stroke: string; time: number }[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLap = () => {
    if (seconds > 0) {
      playSound('coin');
      setSavedLaps((prev) => [{ stroke: selectedStroke, time: seconds }, ...prev.slice(0, 4)]);
    }
  };

  const resetTimer = () => {
    playSound('tech');
    setIsRunning(false);
    setSeconds(0);
  };

  // ==========================================
  // MISI MAS BUMI CHECKLIST
  // ==========================================
  const [missions, setMissions] = useState([
    { id: 1, text: 'Latihan renang rutin 50 meter gaya bebas tanpa henti', completed: true, category: 'Renang' },
    { id: 2, text: 'Selesaikan lembar kerja harian Kumon dengan konsisten', completed: true, category: 'Belajar' },
    { id: 3, text: 'Belajar rajin & berprestasi di MIM Basin Klaten', completed: true, category: 'Sekolah' },
    { id: 4, text: 'Terbitkan website pribadi canggih di bumi.pamungkas.org', completed: true, category: 'Website' },
    { id: 5, text: 'Gowes sepeda santai keliling Klaten bareng teman', completed: false, category: 'Olahraga' },
    { id: 6, text: 'Bantu orang tua di rumah dan selalu buat mereka tersenyum', completed: true, category: 'Keluarga' },
    { id: 7, text: 'Latihan asah taktik catur ♟️ & analisis langkah skakmat', completed: true, category: 'Catur' }
  ]);

  const toggleMission = (id: number) => {
    playSound('coin');
    setMissions(missions.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const completedCount = missions.filter(m => m.completed).length;
  const progressPercent = Math.round((completedCount / missions.length) * 100);

  return (
    <div className={`min-h-screen transition-colors duration-500 selection:bg-cyan-400 selection:text-slate-900 ${
      isDarkMode 
        ? 'bg-[#060b14] text-slate-100' 
        : 'bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#ecfeff] text-slate-800'
    }`}>

      {/* AMBIENT GLOW EFFECTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-10 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-30 animate-pulse-glow ${
          isDarkMode ? 'bg-cyan-500' : 'bg-cyan-300'
        }`} />
        <div className={`absolute top-1/2 -right-10 w-[450px] h-[450px] rounded-full blur-[140px] opacity-25 animate-float-slow ${
          isDarkMode ? 'bg-blue-600' : 'bg-sky-400'
        }`} />
        <div className={`absolute -bottom-20 left-10 w-[400px] h-[400px] rounded-full blur-[140px] opacity-20 animate-float ${
          isDarkMode ? 'bg-purple-600' : 'bg-teal-300'
        }`} />
      </div>

      {/* TOP HIGH-TECH HUD TICKER */}
      <div className={`border-b text-[11px] font-mono-tech py-2 px-4 transition-colors z-50 relative backdrop-blur-md ${
        isDarkMode ? 'bg-slate-950/90 border-slate-800/80 text-cyan-400' : 'bg-sky-100/80 border-sky-200 text-sky-900'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              SYSTEM NODE: ONLINE
            </span>
            <span className="hidden sm:inline opacity-40">|</span>
            <span className="hidden sm:flex items-center gap-1.5 opacity-90">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime || '18:44:00 WIB'}</span>
            </span>
            <span className="hidden md:inline opacity-40">|</span>
            <span className="hidden md:flex items-center gap-1.5 opacity-90">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Suhu Kolam Klaten: 27.2°C • Ideal</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold">
            <span className="hidden sm:flex items-center gap-1 text-slate-400">
              <CloudSun className="w-3.5 h-3.5 text-amber-300" />
              <span>Klaten: Cerah Segar</span>
            </span>
            <span className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-400/40">
              <Wifi className="w-3 h-3" />
              <span>EDGE: CLOUDFLARE</span>
            </span>
          </div>
        </div>
      </div>

      {/* TOP NAVBAR */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors ${
        isDarkMode 
          ? 'bg-[#060b14]/85 border-slate-800/90 shadow-xl shadow-black/40' 
          : 'bg-white/80 border-sky-200/80 shadow-xs'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-400/40 group-hover:scale-105 group-hover:rotate-6 transition-all">
              <Waves className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight block leading-tight font-fun">
                  Mas Bumi
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-black bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 uppercase tracking-widest font-mono-tech">
                  v2.6
                </span>
              </div>
              <span className="text-[11px] font-bold text-cyan-500 tracking-wide block font-mono-tech">
                bumi.pamungkas.org
              </span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-4 text-xs font-bold uppercase tracking-wider font-mono-tech">
            <a href="#tentang" className="hover:text-cyan-400 transition-colors">Profil ID</a>
            <a href="#hobi" className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-cyan-400">
              <Waves className="w-3.5 h-3.5" />
              <span>Hobi & Renang</span>
            </a>
            <a href="#telemetri" className="hover:text-cyan-400 transition-colors">Telemetri</a>
            <a href="#target" className="hover:text-emerald-300 transition-colors text-emerald-400 font-bold flex items-center gap-1">
              <span>🎯 Target 50m</span>
            </a>
            <a href="#sekolah" className="hover:text-indigo-400 transition-colors flex items-center gap-1 text-indigo-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sekolah & Kumon</span>
            </a>
            <a href="#bumibot" className="hover:text-cyan-400 transition-colors text-amber-400 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" />
              <span>BumiBot AI</span>
            </a>
            <a 
              href="#games" 
              onClick={() => setActiveGameTab('tetris')}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-cyan-400"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>8 Game & Asah Otak 🕹️</span>
            </a>
            <a href="#galeri" className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-sky-400">
              <Camera className="w-3.5 h-3.5" />
              <span>Galeri Foto</span>
            </a>
            <a href="#stopwatch" className="hover:text-cyan-400 transition-colors">Stopwatch</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSound('tech');
                setIsSoundMuted(!isSoundMuted);
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isSoundMuted 
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60' 
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
              }`}
              title={isSoundMuted ? 'Nyalakan Suara Game' : 'Matikan Suara Game'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                playSound('tech');
                setIsDarkMode(!isDarkMode);
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                isDarkMode
                  ? 'bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-slate-700 border border-sky-200 hover:bg-sky-50 shadow-xs'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            <a 
              href="https://pamungkas.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-xs px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                isDarkMode
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900'
                  : 'bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-200 shadow-xs'
              }`}
            >
              <span>pamungkas.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">

        {/* HERO: FUTURISTIC BENTO GRID + DIGITAL ATHLETE ID */}
        <section id="tentang" className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Left Hero Card: Intro & Identity */}
            <div className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 border transition-all relative overflow-hidden backdrop-blur-xl flex flex-col justify-between ${
              isDarkMode 
                ? 'bg-slate-900/85 border-slate-800/90 shadow-2xl shadow-cyan-950/50' 
                : 'bg-white/85 border-sky-200/80 shadow-xl shadow-sky-200/40'
            }`}>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>PORTAL RESMI MAS BUMI</span>
                  </span>
                  <span className="text-[10px] font-mono-tech px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300">
                    STATUS: READY TO SWIM 🏊‍♂️
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight font-fun">
                  Kun Bumi Pamungkas <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                    Perenang Muda & Pelajar Klaten
                  </span>
                </h1>

                <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Biasa dipanggil <strong className="text-cyan-400 font-extrabold">Mas Bumi</strong> (12 tahun). 
                  Berfokus pada kecepatan di lintasan renang, ketajaman strategi di papan <strong className="text-amber-400">Catur (Chess ♟️)</strong>, kecepatan logika di <strong className="text-emerald-400">Kumon</strong>, dan menuntut ilmu penuh berkah di <strong className="text-indigo-400">MIM Basin Klaten</strong>.
                </p>

                {/* Quick Spec Pills with Original Colorful Icons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 font-mono-tech text-xs">
                  <div className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all ${
                    isDarkMode ? 'bg-cyan-950/40 border-cyan-800/60' : 'bg-cyan-50 border-cyan-200 shadow-xs'
                  }`}>
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">LAHIR</span>
                      <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>5 Juni 2014</strong>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all ${
                    isDarkMode ? 'bg-rose-950/40 border-rose-800/60' : 'bg-rose-50 border-rose-200 shadow-xs'
                  }`}>
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">ASAL</span>
                      <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Klaten, ID</strong>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all ${
                    isDarkMode ? 'bg-amber-950/40 border-amber-800/60' : 'bg-amber-50 border-amber-200 shadow-xs'
                  }`}>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">MADRASAH</span>
                      <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>MIM Basin</strong>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all ${
                    isDarkMode ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-emerald-50 border-emerald-200 shadow-xs'
                  }`}>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">KURSUS</span>
                      <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Siswa Kumon</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-6 mt-4 border-t border-white/10">
                <a
                  href="#games"
                  onClick={() => {
                    playSound('coin');
                    setActiveGameTab('tetris');
                  }}
                  className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Tetris Cyber 🧱</span>
                </a>

                <a
                  href="#games"
                  onClick={() => {
                    playSound('coin');
                    setActiveGameTab('laser');
                  }}
                  className="bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
                  <span>Labirin Laser Optik 🔮</span>
                </a>

                <a
                  href="#games"
                  onClick={() => {
                    playSound('coin');
                    setActiveGameTab('chess');
                  }}
                  className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>Taktik Catur ♟️</span>
                </a>

                <a
                  href="#target"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>🎯 Target 50m Sprint</span>
                </a>

                <a
                  href="#telemetri"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>Kalkulator Latihan Renang</span>
                </a>

                <a
                  href="#bumibot"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-amber-400/30 transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>Tanya BumiBot AI 🤖</span>
                </a>
              </div>
            </div>

            {/* Right Hero Card: 3D Holographic Swimmer Passport ID */}
            <div className="lg:col-span-5 flex flex-col">
              <div className={`h-full rounded-3xl p-6 border transition-all relative overflow-hidden backdrop-blur-xl scanline-effect flex flex-col justify-between ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-slate-900/95 via-[#0c182b] to-slate-900 border-cyan-500/40 shadow-2xl shadow-cyan-950/70' 
                  : 'bg-white/95 border-cyan-200 shadow-xl'
              }`}>
                {/* Holographic Header Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30">
                  <div className="flex items-center gap-2">
                    <Scan className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <div>
                      <span className="font-mono-tech font-black text-xs tracking-widest text-cyan-300 block">
                        ATHLETE DIGITAL PASS
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono-tech">ID: BMP-2014-KLATEN</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                {/* Athlete Visual Display */}
                <div className="py-6 flex items-center gap-5">
                  <div className="relative flex-shrink-0 animate-float">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 p-1 shadow-xl shadow-cyan-500/30">
                      <div className="w-full h-full rounded-[14px] bg-slate-950 flex flex-col items-center justify-center text-5xl">
                        🏊‍♂️
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border-2 border-slate-900">
                      <Sparkles className="w-3 h-3 fill-amber-950" />
                      <span>12 Tahun</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 inline-block font-mono-tech">
                      DIVISI: KU-12 RENANG
                    </span>
                    <h3 className="font-black text-xl font-fun">Mas Bumi</h3>
                    <p className="text-xs text-slate-300">
                      Spesialisasi: <strong className="text-cyan-300">Gaya Punggung (Backstroke 🌊)</strong>
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono-tech">
                      <MapPin className="w-3 h-3" />
                      <span>Klaten, Jawa Tengah</span>
                    </div>
                  </div>
                </div>

                {/* Holographic Specs & Barcode Footer */}
                <div className="pt-4 border-t border-cyan-500/30 space-y-3 font-mono-tech">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Berat & Postur:</span>
                    <span className="text-cyan-300 font-bold">47 kg (KU-12 Tangguh)</span>
                  </div>
                  <div className="space-y-1.5 pt-1 pb-1">
                    <div className="flex justify-between text-xs items-center">
                      <span className="text-slate-400">Target 50m Musim Ini:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded-lg flex justify-between items-center">
                        <span className="text-slate-300">Bebas:</span>
                        <span className="text-emerald-400 font-bold">31s</span>
                      </div>
                      <div className="bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded-lg flex justify-between items-center">
                        <span className="text-slate-300">Dada:</span>
                        <span className="text-emerald-400 font-bold">43s</span>
                      </div>
                      <div className="bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded-lg flex justify-between items-center">
                        <span className="text-slate-300">Punggung:</span>
                        <span className="text-cyan-300 font-bold">36s</span>
                      </div>
                      <div className="bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded-lg flex justify-between items-center">
                        <span className="text-slate-300">Kupu-kupu:</span>
                        <span className="text-emerald-400 font-bold">34s</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Kumon Level Status:</span>
                    <span className="text-cyan-300 font-bold">Consistent Daily Drill</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Hobi & Taktik:</span>
                    <span className="text-amber-300 font-bold">Renang & Catur ♟️</span>
                  </div>
                  
                  {/* Decorative Barcode */}
                  <div className="pt-2 flex items-center justify-between opacity-60">
                    <div className="h-6 w-full bg-[repeating-linear-gradient(90deg,#38bdf8,#38bdf8_2px,transparent_2px,transparent_5px)]" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION: HOBI & AKTIVITAS OLAHRAGA MAS BUMI                    */}
        {/* ============================================================== */}
        <section id="hobi" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-cyan-400 uppercase tracking-wider mb-1">
                <Waves className="w-4 h-4" />
                <span>AKTIVITAS & HOBI FAVORIT</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-fun">
                🏊‍♂️ Renang, Catur & Olahraga Mas Bumi
              </h2>
            </div>
            <p className={`text-xs sm:text-sm max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Air melatih ketangguhan fisik & kecepatan renang, sementara papan catur mengasah ketelitian strategi otak!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Renang */}
            <div className={`rounded-3xl p-6 sm:p-7 border transition-all hover:-translate-y-1 relative overflow-hidden group flex flex-col justify-between ${
              isDarkMode 
                ? 'bg-slate-900/85 border-cyan-800/40 shadow-xl shadow-cyan-950/30' 
                : 'bg-white/90 border-sky-100 shadow-md'
            }`}>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Waves className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl font-fun">Berenang (Swimming)</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Renang adalah hobi utamaku! Rasanya sangat seru bisa meluncur di air, melatih pernapasan, dan menguasai berbagai gaya renang dengan cepat.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-4 font-mono-tech">
                <span className="text-xs font-bold bg-cyan-400 text-slate-950 px-2.5 py-1 rounded-lg border border-cyan-300 shadow-sm shadow-cyan-400/30">Gaya Punggung 🌊 (Spesialis)</span>
                <span className="text-xs font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-400/30">Gaya Bebas</span>
                <span className="text-xs font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-400/30">Gaya Dada</span>
                <span className="text-xs font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-400/30">Gaya Kupu-kupu 🦋</span>
              </div>
            </div>

            {/* Card 2: Bermain Catur */}
            <div className={`rounded-3xl p-6 sm:p-7 border transition-all hover:-translate-y-1 relative overflow-hidden group flex flex-col justify-between ${
              isDarkMode 
                ? 'bg-slate-900/85 border-violet-800/40 shadow-xl shadow-purple-950/30' 
                : 'bg-white/90 border-purple-100 shadow-md'
            }`}>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Crown className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-bold text-xl font-fun">Bermain Catur (Chess ♟️)</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Catur adalah hobi asah otak favorit Mas Bumi! Melatih kesabaran, daya analisis beberapa langkah ke depan, kalkulasi taktik, dan ketenangan berpikir strategis.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-4 font-mono-tech">
                <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-400/30">Taktik Skakmat ♟️</span>
                <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-400/30">Langkah Kuda ♞</span>
                <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-400/30">Kalkulasi Logika 🧠</span>
                <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-400/30">Fokus & Sabar 👑</span>
              </div>
              <div className="pt-4 mt-2 border-t border-purple-500/20">
                <a
                  href="#games"
                  onClick={() => {
                    playSound('coin');
                    setActiveGameTab('chess');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-500/25 cursor-pointer font-sans hover:scale-[1.02]"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>Main Catur Sekarang! ➡️</span>
                </a>
              </div>
            </div>

            {/* Card 3: Olahraga Lainnya */}
            <div className={`rounded-3xl p-6 sm:p-7 border transition-all hover:-translate-y-1 relative overflow-hidden group flex flex-col justify-between ${
              isDarkMode 
                ? 'bg-slate-900/85 border-amber-800/40 shadow-xl shadow-amber-950/30' 
                : 'bg-white/90 border-amber-100 shadow-md'
            }`}>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl font-fun">Olahraga & Gerak Aktif</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Selain renang, Mas Bumi juga suka lari santai, main sepak bola kecil bersama teman di sekolah, senam ceria, dan bersepeda mengelilingi Klaten.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-4 font-mono-tech">
                <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/30">Lari Cepat</span>
                <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/30">Gowes Sepeda</span>
                <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/30">Sehat & Bugar</span>
              </div>
            </div>

            {/* Card 4: Sportivitas & Disiplin */}
            <div className={`rounded-3xl p-6 sm:p-7 border transition-all hover:-translate-y-1 relative overflow-hidden group flex flex-col justify-between ${
              isDarkMode 
                ? 'bg-slate-900/85 border-emerald-800/40 shadow-xl shadow-emerald-950/30' 
                : 'bg-white/90 border-emerald-100 shadow-md'
            }`}>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl font-fun">Sportivitas & Disiplin</h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Olahraga mengajarkan Mas Bumi untuk selalu disiplin waktu, sportif, saling menghargai teman, dan pantang menyerah saat menghadapi tantangan.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-4 font-mono-tech">
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-400/30">Disiplin</span>
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-400/30">Sportif</span>
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-400/30">Pantang Menyerah</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* FITUR CANGGIH 1: KALKULATOR TELEMETRI RENANG (INTERAKTIF)       */}
        {/* ============================================================== */}
        <section id="telemetri" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-cyan-400 uppercase tracking-wider mb-1">
                <Sliders className="w-4 h-4" />
                <span>TELEMETRY & WORKOUT CALCULATOR</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-fun">
                ⚡ Kalkulator Energi & Hidrasi Renang
              </h2>
            </div>
            <p className={`text-xs sm:text-sm max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Dihitung presisi berdasarkan <strong>berat badan ({bodyWeight} kg)</strong> Mas Bumi, durasi latihan, dan intensitas gaya renang menggunakan formula MET olahraga atlet muda!
            </p>
          </div>

          <div className={`rounded-3xl p-6 sm:p-8 border transition-all backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-slate-900/90 border-slate-800 shadow-2xl' 
              : 'bg-white/90 border-sky-200 shadow-lg'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Controls Column */}
              <div className="lg:col-span-6 space-y-5">
                {/* Control 1: Berat Badan Mas Bumi */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider font-mono-tech flex items-center gap-1.5">
                      <span>⚖️</span>
                      <span>Berat Badan Mas Bumi: <strong className="text-emerald-400 text-base">{bodyWeight} kg</strong></span>
                    </label>
                    <span className="text-xs text-slate-400 font-mono-tech">Rentang: 30 - 70 kg</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={70}
                    step={1}
                    value={bodyWeight}
                    onChange={(e) => {
                      playSound('tech');
                      setBodyWeight(parseInt(e.target.value, 10));
                    }}
                    className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  {/* Preset Berat Badan */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-mono-tech">Preset:</span>
                    {[40, 44, 47, 50, 53].map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          playSound('tech');
                          setBodyWeight(w);
                        }}
                        className={`text-[10px] font-mono-tech font-bold px-2.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                          bodyWeight === w
                            ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/80 shadow-xs shadow-emerald-500/20 scale-105'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {w === 47 ? `⭐ ${w} kg (Mas Bumi)` : `${w} kg`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control 2: Durasi Latihan */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider font-mono-tech">
                      Durasi Latihan: <strong className="text-cyan-400 text-base">{workoutDuration} Menit</strong>
                    </label>
                    <span className="text-xs text-slate-400 font-mono-tech">Maksimal: 120 Menit</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={120}
                    step={5}
                    value={workoutDuration}
                    onChange={(e) => {
                      playSound('tech');
                      setWorkoutDuration(parseInt(e.target.value, 10));
                    }}
                    className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Control 3: Gaya Renang */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider font-mono-tech block mb-2">
                    Pilih Gaya Renang Utama:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'bebas', name: 'Gaya Bebas 🏊‍♂️' },
                      { id: 'dada', name: 'Gaya Dada 🐸' },
                      { id: 'punggung', name: 'Gaya Punggung 🌊' },
                      { id: 'kupu', name: 'Gaya Kupu 🦋' }
                    ].map((stroke) => (
                      <button
                        key={stroke.id}
                        onClick={() => {
                          playSound('tech');
                          setWorkoutStroke(stroke.id as 'bebas' | 'dada' | 'punggung' | 'kupu');
                        }}
                        className={`text-xs font-bold p-3 rounded-2xl border transition-all cursor-pointer ${
                          workoutStroke === stroke.id
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg shadow-cyan-500/30 scale-102'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                        }`}
                      >
                        {stroke.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instant Output Telemetry Display */}
              <div className="lg:col-span-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-center space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                      <Flame className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono-tech font-bold text-amber-300 uppercase block">
                      Kalori Terbakar
                    </span>
                    <div className="text-3xl font-black font-mono-tech text-white">
                      {caloriesBurned} <span className="text-xs font-normal text-amber-300">kcal</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block pt-1">Beban {bodyWeight} kg</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-center space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center mx-auto mb-2">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono-tech font-bold text-cyan-300 uppercase block">
                      Kebutuhan Hidrasi
                    </span>
                    <div className="text-3xl font-black font-mono-tech text-white">
                      {waterNeededMl} <span className="text-xs font-normal text-cyan-300">ml</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block pt-1">Minum air putih segar</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-center space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                      <Waves className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono-tech font-bold text-emerald-300 uppercase block">
                      Estimasi Putaran
                    </span>
                    <div className="text-3xl font-black font-mono-tech text-white">
                      ~{estimatedLaps} <span className="text-xs font-normal text-emerald-300">Laps</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block pt-1">Lintasan 50 meter</span>
                  </div>

                </div>

                {/* Telemetry Live Formula Badge */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-mono-tech text-slate-300 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>MET Formula: <strong>{strokeMET[workoutStroke]} MET</strong> × <strong>{bodyWeight} kg</strong> × <strong>{(workoutDuration / 60).toFixed(2)} jam</strong></span>
                  </div>
                  <span className="text-cyan-400 font-bold">AKURASI ATLET AKTIF ✅</span>
                </div>

                {/* Food & Sport Equivalence Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 text-xs font-mono-tech flex items-center gap-2.5 text-amber-200">
                  <span className="text-xl">🍗</span>
                  <div>
                    <span className="text-amber-300 font-bold block">Ekuivalensi Energi Kalori:</span>
                    <span>
                      {caloriesBurned < 250 && `Energi ${caloriesBurned} kcal ini setara membakar 2 buah pisang cavendish 🍌🍌 pemulihan otot!`}
                      {caloriesBurned >= 250 && caloriesBurned < 380 && `Energi ${caloriesBurned} kcal ini setara membakar 1 porsi nasi putih + lauk ayam panggang 🍗🍚!`}
                      {caloriesBurned >= 380 && caloriesBurned < 500 && `Energi ${caloriesBurned} kcal ini setara membakar 1 mangkok bakso sapi kuah komplit gurih 🍲!`}
                      {caloriesBurned >= 500 && `Energi ${caloriesBurned} kcal ini setara membakar 1 porsi nasi goreng spesial telur komplit 🍳🍛!`}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION: TARGET SPRINT 50M MUSIM INI                          */}
        {/* ============================================================== */}
        <section id="target" className="space-y-6">
          <div className={`rounded-3xl p-6 sm:p-9 border-2 transition-all relative overflow-hidden shadow-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-[#071d37] via-[#0d284a] to-[#05162a] border-emerald-500/40 shadow-emerald-950/50' 
              : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 border-emerald-300 shadow-emerald-100'
          }`}>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 dark:border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 text-xs font-black font-mono-tech uppercase tracking-wider mb-2">
                    <Trophy className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>TARGET SPRINT 50M KU-12 RENANG</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black font-fun tracking-tight">
                    🎯 Target Waktu Sprint 50 Meter Mas Bumi
                  </h2>
                  <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Target waktu resmi musim ini untuk menembus batas kecepatan di kolam lintasan 50 meter!
                  </p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono-tech text-xs font-bold self-start md:self-auto">
                  🏊‍♂️ Spesialisasi: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Gaya Punggung 🌊</strong>
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-tech">
                {/* Bebas */}
                <div className={`p-5 rounded-2xl border transition-all hover:scale-102 space-y-2 ${
                  isDarkMode ? 'bg-slate-900/80 border-cyan-500/30 hover:border-cyan-400' : 'bg-white/90 border-cyan-200 shadow-md'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">Gaya Bebas 🏊‍♂️</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-black">50M</span>
                  </div>
                  <div className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    31 <span className="text-sm font-normal text-emerald-400">detik</span>
                  </div>
                  <p className={`text-[11px] font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Sprint kayuhan cepat dan pernapasan stabil.</p>
                </div>

                {/* Dada */}
                <div className={`p-5 rounded-2xl border transition-all hover:scale-102 space-y-2 ${
                  isDarkMode ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400' : 'bg-white/90 border-emerald-200 shadow-md'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">Gaya Dada 🐸</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-black">50M</span>
                  </div>
                  <div className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    43 <span className="text-sm font-normal text-emerald-400">detik</span>
                  </div>
                  <p className={`text-[11px] font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dorongan tendangan kaki kodok yang kuat & meluncur.</p>
                </div>

                {/* Punggung */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/90 via-blue-950/90 to-slate-900/90 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all space-y-2 relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[10px] bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black flex items-center gap-1 shadow-md">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>SPESIALIS ⭐</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-cyan-300 font-black uppercase">Gaya Punggung 🌊</span>
                  </div>
                  <div className="text-4xl font-black text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                    36 <span className="text-sm font-normal text-white">detik</span>
                  </div>
                  <p className="text-[11px] text-cyan-200 font-sans">Gaya andalan Mas Bumi dengan putaran bahu presisi!</p>
                </div>

                {/* Kupu-kupu */}
                <div className={`p-5 rounded-2xl border transition-all hover:scale-102 space-y-2 ${
                  isDarkMode ? 'bg-slate-900/80 border-purple-500/30 hover:border-purple-400' : 'bg-white/90 border-purple-200 shadow-md'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">Gaya Kupu 🦋</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-black">50M</span>
                  </div>
                  <div className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    34 <span className="text-sm font-normal text-emerald-400">detik</span>
                  </div>
                  <p className={`text-[11px] font-sans ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dolphin kick eksplosif dan ayunan tangan serentak.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION: SEKOLAH MIM BASIN & METODE BELAJAR KUMON              */}
        {/* ============================================================== */}
        <section id="sekolah" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-indigo-400 uppercase tracking-wider mb-1">
                <BookOpen className="w-4 h-4" />
                <span>PENDIDIKAN & ILMU PENGETAHUAN</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-fun">
                🎒 Sekolah & Belajar Mandiri
              </h2>
            </div>
            <p className={`text-xs sm:text-sm max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Keseimbangan antara prestasi olahraga renang dengan rajin menuntut ilmu dan mengasah logika berpikir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Card: MIM Basin Klaten */}
            <div className={`rounded-3xl p-6 sm:p-8 border transition-all relative overflow-hidden backdrop-blur-xl flex flex-col justify-between ${
              isDarkMode 
                ? 'bg-slate-900/85 border-slate-800 shadow-xl' 
                : 'bg-white/90 border-indigo-100 shadow-md'
            }`}>
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono-tech font-bold text-indigo-400 uppercase tracking-wider">
                    MADRASAH IBTIDAIYAH
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight font-fun mt-1">
                    MIM Basin Klaten
                  </h3>
                </div>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Di <strong className="text-indigo-400 font-bold">MIM Basin Klaten</strong>, Mas Bumi belajar berbagai ilmu pelajaran umum, agama, adab yang santun, dan karakter mulia. Bertemu bapak ibu guru yang ramah dan saling mendukung bersama teman-teman sekelas.
                </p>
              </div>

              <div className={`mt-6 rounded-2xl p-3.5 border flex items-center gap-2.5 text-xs font-semibold ${
                isDarkMode 
                  ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200' 
                  : 'bg-indigo-50 border-indigo-200 text-indigo-900'
              }`}>
                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Basin, Kebonarum, Klaten, Jawa Tengah</span>
              </div>
            </div>

            {/* Kumon Card */}
            <div className={`rounded-3xl p-6 sm:p-8 border transition-all relative overflow-hidden backdrop-blur-xl flex flex-col justify-between ${
              isDarkMode 
                ? 'bg-slate-900/85 border-slate-800 shadow-xl' 
                : 'bg-white/90 border-emerald-100 shadow-md'
            }`}>
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono-tech font-bold text-emerald-400 uppercase tracking-wider">
                    METODE BELAJAR MANDIRI
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight font-fun mt-1">
                    Metode Belajar Kumon
                  </h3>
                </div>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Mengikuti metode pembelajaran <strong className="text-emerald-400 font-bold">Kumon</strong> melatih Mas Bumi untuk belajar mandiri, konsisten menyelesaikan lembar kerja setiap hari, dan mengasah ketajaman hitungan serta daya fokus yang tinggi.
                </p>
              </div>

              <div className={`mt-6 rounded-2xl p-3.5 border flex items-center gap-2.5 text-xs font-semibold ${
                isDarkMode 
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Belajar Mandiri • Konsisten Setiap Hari • Pantang Menyerah</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* FITUR CANGGIH 2: "BUMIBOT" VIRTUAL AI CHAT ASSISTANT           */}
        {/* ============================================================== */}
        <section id="bumibot" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Bot className="w-4 h-4" />
                <span>INTERACTIVE AI COMPANION</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-fun">
                🤖 BumiBot — Asisten Virtual Mas Bumi
              </h2>
            </div>
            <p className={`text-xs sm:text-sm max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Tanyakan apa saja kepada robot cerdas Mas Bumi! Klik pertanyaan cepat atau ketik sendiri di bawah.
            </p>
          </div>

          <div className={`rounded-3xl border transition-all overflow-hidden backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-slate-900/90 border-slate-800 shadow-2xl' 
              : 'bg-white/90 border-sky-200 shadow-lg'
          }`}>
            {/* Bot Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block leading-tight">BumiBot v2.6 AI</span>
                  <span className="text-[10px] text-emerald-400 font-mono-tech flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ONLINE & READY TO ANSWER
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono-tech text-slate-400 hidden md:inline">
                  POWERED BY BUMI KNOWLEDGE CORE
                </span>
                <button
                  onClick={clearChat}
                  title="Hapus / Bersihkan Obrolan Chat"
                  className="text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl border border-white/10 hover:border-rose-400/30 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Obrolan</span>
                </button>
              </div>
            </div>

            {/* Chat Log Window */}
            <div className="p-4 sm:p-6 space-y-4 max-h-80 overflow-y-auto font-sans">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-xs'
                      : isDarkMode
                        ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-xs'
                        : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-tl-xs'
                  }`}>
                    <p>{msg.text}</p>
                    <span className="text-[9px] opacity-60 block text-right mt-1 font-mono-tech">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-3 border-t border-white/10 bg-white/5 flex flex-wrap gap-2">
              <span className="text-[10px] font-mono-tech text-slate-400 flex items-center gap-1 self-center mr-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Coba tanya:
              </span>
              {[
                'Siapa Mas Bumi?',
                'Mas Bumi suka main catur? ♟️',
                'Ceritain gaya kupu-kupu Mas Bumi! 🦋',
                'Gaya renang apa favoritnya?',
                'Sekolah di MIM Basin?',
                'Metode belajar Kumon?',
                'Wisata umbul di Klaten?',
                'Game apa yang ada di web?'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/10 transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ketik pertanyaan untuk BumiBot di sini..."
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className={`flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border focus:outline-hidden focus:border-cyan-400 ${
                  isDarkMode 
                    ? 'bg-slate-950/60 border-slate-800 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <button
                onClick={() => handleSendMessage()}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/30 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* ARENA 8 GAME & KUIS ARCADE MAS BUMI                           */}
        {/* ============================================================== */}
        <section id="games" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-rose-400 uppercase tracking-wider mb-1">
                <Gamepad2 className="w-4 h-4" />
                <span>ARCADE CENTER & GAMES</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-fun">
                🕹️ Arena 8 Game & Kuis Mas Bumi
              </h2>
            </div>
            <p className={`text-xs sm:text-sm max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Nikmati game aksi menyelam Black Marlin, balapan renang 50m, hitung kilat Kumon, tebak kartu, kuis multi-ronde, asah taktik catur ♟️, labirin laser optik 🔮, dan tetris cyber 🧱!
            </p>
          </div>

          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/40 dark:border-slate-700/60 max-w-fit">
            <button
              onClick={() => {
                playSound('tech');
                setActiveGameTab('arcade');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeGameTab === 'arcade'
                  ? 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white shadow-md scale-102'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>⚡ 1. Menyelam Black Marlin (Arcade)</span>
            </button>

            <button
              onClick={() => {
                playSound('tech');
                setActiveGameTab('swim');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeGameTab === 'swim'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Waves className="w-4 h-4" />
              <span>2. Balapan Renang 50M 🏊‍♂️</span>
            </button>

            <button
              onClick={() => {
                playSound('tech');
                setActiveGameTab('math');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeGameTab === 'math'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>3. Hitung Kilat Kumon ⚡</span>
            </button>

            <button
              onClick={() => {
                playSound('tech');
                setActiveGameTab('memory');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeGameTab === 'memory'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>4. Kartu Memori 🎴</span>
            </button>

            <button
              onClick={() => {
                playSound('tech');
                setActiveGameTab('quiz');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeGameTab === 'quiz'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>5. Kuis Multi-Ronde ❓</span>
            </button>

            <button
              onClick={() => {
                playSound('tech');
                setActiveGameTab('chess');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeGameTab === 'chess'
                  ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md scale-102'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>6. Taktik Catur ♟️</span>
            </button>

            <button
              onClick={() => {
                playSound('tech');
                setActiveGameTab('laser');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeGameTab === 'laser'
                  ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white shadow-md scale-102'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>7. Labirin Laser Optik 🔮</span>
            </button>

            <button
              onClick={() => {
                playSound('tech');
                setActiveGameTab('tetris');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeGameTab === 'tetris'
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md scale-102'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>8. Tetris Cyber 🧱</span>
            </button>
          </div>

          {/* TAB 1: ARCADE GAME */}
          {activeGameTab === 'arcade' && (
            <div className={`rounded-3xl p-6 sm:p-8 border transition-all ${
              isDarkMode 
                ? 'bg-[#06172d] border-cyan-800/80 shadow-2xl' 
                : 'bg-gradient-to-br from-white via-sky-50/80 to-blue-100/80 border-sky-300 shadow-xl'
            }`}>
              <div className="max-w-2xl mx-auto space-y-4 text-center">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-left">
                    <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-md font-mono-tech border border-cyan-500/40">
                      OCEAN SPRINT ARCADE
                    </span>
                    <h3 className="text-2xl font-black font-fun mt-1 flex items-center gap-2">
                      <span>⚡ Petualangan Menyelam Black Marlin Mas Bumi</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 font-mono-tech">
                    <div className="bg-black/20 px-3 py-1 rounded-xl border border-white/10 text-right">
                      <span className="text-[9px] uppercase block font-bold text-slate-400">Skor Tertinggi</span>
                      <span className="text-amber-400 font-black text-sm">🏆 {arcadeHighScore}</span>
                    </div>
                    <div className="bg-black/20 px-3 py-1 rounded-xl border border-white/10 text-right">
                      <span className="text-[9px] uppercase block font-bold text-slate-400">Skor Saat Ini</span>
                      <span className="text-cyan-300 font-black text-sm">{arcadeScore}</span>
                    </div>
                  </div>
                </div>

                <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Luncurkan <strong>Ikan Black Marlin</strong> hadap depan membelah samudra! Kumpulkan <strong>Medali 🏅</strong>, <strong>Bintang ⭐</strong>, dan <strong>Buku Kumon 📚</strong>! Hindari <strong>Ubur-ubur 🪼</strong>, <strong>Ikan Buntal 🐡</strong>, dan <strong>Karang 🪸</strong>!
                </p>

                <div className="relative rounded-2xl overflow-hidden border-4 border-sky-400 shadow-2xl bg-sky-950 select-none">
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={320}
                    onClick={swimUp}
                    className="w-full h-auto aspect-[2/1] block cursor-pointer"
                  />

                  {arcadeState === 'idle' && (
                    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white space-y-4">
                      <div className="flex flex-col items-center gap-2 animate-float">
                        <BlackMarlinIcon className="w-28 h-14 filter drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]" />
                        <span className="text-[10px] font-black tracking-widest text-cyan-300 font-mono-tech uppercase bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-400/40">
                          AVATAR: BLACK MARLIN (IKAN MARLIN HITAM) ⚡
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-2xl sm:text-3xl font-black font-fun text-cyan-300">
                          Siap Meluncur, Black Marlin Mas Bumi?
                        </h4>
                        <p className="text-xs text-slate-300 max-w-sm">
                          Ikan Black Marlin menghadap ke depan siap menembus arus laut! Tekan tombol <strong>SPASI</strong> di keyboard atau <strong>KLIK LAYAR</strong> untuk berenang ke atas!
                        </p>
                      </div>
                      <button
                        onClick={startArcadeGame}
                        className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base px-8 py-3.5 rounded-2xl shadow-xl shadow-cyan-500/40 transition-all hover:scale-105 cursor-pointer flex items-center gap-2 border-2 border-cyan-300/40"
                      >
                        <Play className="w-5 h-5 fill-white" />
                        <span>MULAI MELUNCUR SEKARANG!</span>
                      </button>
                    </div>
                  )}

                  {arcadeState === 'gameover' && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white space-y-4 animate-float">
                      <span className="text-5xl">💥🌊</span>
                      <div className="space-y-1">
                        <h4 className="text-2xl sm:text-3xl font-black font-fun text-rose-400">
                          Ups, Tersenggol Rintangan Laut!
                        </h4>
                        <p className="text-sm">
                          Skor Akhirmu: <strong className="font-mono-tech text-xl text-amber-300">{arcadeScore}</strong>
                        </p>
                        {arcadeScore >= arcadeHighScore && arcadeScore > 0 && (
                          <p className="text-xs text-emerald-400 font-bold animate-pulse font-mono-tech">
                            🎉 REKOR SKOR BARU TERCAPAI! LUAR BIASA!
                          </p>
                        )}
                      </div>
                      <button
                        onClick={startArcadeGame}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm px-7 py-3 rounded-2xl shadow-lg transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Luncurkan Black Marlin Lagi!</span>
                      </button>
                    </div>
                  )}
                </div>

                {arcadeState === 'playing' && (
                  <div className="pt-2">
                    <button
                      onClick={swimUp}
                      className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 active:scale-95 text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-cyan-500/30 transition-transform cursor-pointer flex items-center justify-center gap-2 border-2 border-white/40"
                    >
                      <ArrowUp className="w-6 h-6 stroke-[3]" />
                      <span>LUNCURKAN BLACK MARLIN KE ATAS! (SPASI / KLIK) ⚡</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BALAPAN RENANG 50 METER */}
          {activeGameTab === 'swim' && (
            <div className={`rounded-3xl p-6 sm:p-8 border transition-all ${
              isDarkMode 
                ? 'bg-[#09182d] border-cyan-800/60 shadow-2xl' 
                : 'bg-gradient-to-br from-white via-cyan-50/70 to-blue-100/60 border-cyan-200 shadow-xl'
            }`}>
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-500 bg-cyan-100 dark:bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-300 font-mono-tech">
                    VIRTUAL SWIMMING SPRINT
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black font-fun">
                    🏊‍♂️ Balapan Renang 50 Meter: Mas Bumi vs Si Lumba-Lumba!
                  </h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Tekan tombol <strong>"AYUN TANGAN! (KLIK CEPAT!)"</strong> secepat mungkin untuk membuat Mas Bumi meluncur kencang sampai garis finish!
                  </p>
                </div>

                <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-sky-600 via-blue-700 to-blue-800 text-white shadow-inner relative overflow-hidden border-2 border-sky-400">
                  <div className="flex justify-between items-center text-xs font-bold text-sky-200 mb-4 pb-2 border-b border-sky-400/50">
                    <span>START 🚩</span>
                    <span className="font-mono-tech text-cyan-200 font-black text-sm">
                      WAKTU: {(raceTimeMs / 1000).toFixed(1)}s
                    </span>
                    <span className="text-amber-300 flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5" />
                      FINISH (50m) 🏁
                    </span>
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs font-extrabold text-cyan-200">
                      <span>LINTASAN 1: Mas Bumi — Black Marlin ⚡ ({selectedRaceStroke})</span>
                      <span className="font-mono-tech">{Math.round(bumiProgress)}%</span>
                    </div>
                    <div className="h-10 bg-sky-900/60 rounded-xl relative flex items-center px-1 border border-cyan-400/40">
                      <div 
                        className="absolute transition-all duration-100 flex items-center gap-1.5"
                        style={{ left: `calc(${bumiProgress * 0.88}% + 4px)` }}
                      >
                        <BlackMarlinIcon className="w-9 h-4.5 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
                        <span className="text-[10px] font-black bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded-md font-mono-tech">
                          Bumi
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-extrabold text-amber-200">
                      <span>LINTASAN 2: Si Lumba-Lumba Kawan Klaten 🐬</span>
                      <span className="font-mono-tech">{Math.round(rivalProgress)}%</span>
                    </div>
                    <div className="h-10 bg-sky-900/60 rounded-xl relative flex items-center px-1 border border-amber-400/30">
                      <div 
                        className="absolute transition-all duration-150 flex items-center gap-1"
                        style={{ left: `calc(${rivalProgress * 0.88}% + 4px)` }}
                      >
                        <span className="text-2xl filter drop-shadow-md">
                          🐬
                        </span>
                        <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-md font-mono-tech">
                          Rival
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-4">
                  {raceState === 'idle' && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex flex-wrap justify-center gap-2">
                        {['Gaya Bebas 🏊‍♂️', 'Gaya Dada 🐸', 'Gaya Punggung 🌊', 'Gaya Kupu-kupu 🦋'].map((stroke) => (
                          <button
                            key={stroke}
                            onClick={() => setSelectedRaceStroke(stroke)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                              selectedRaceStroke === stroke
                                ? 'bg-cyan-500 text-white border-cyan-400 shadow-md scale-105'
                                : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
                            }`}
                          >
                            {stroke}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={startRace}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-black text-base shadow-xl shadow-cyan-500/40 transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
                      >
                        <Play className="w-5 h-5 fill-white" />
                        <span>SIAP? MULAI BALAPAN!</span>
                      </button>
                    </div>
                  )}

                  {raceState === 'racing' && (
                    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                      <button
                        onClick={paddleBumi}
                        className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 active:scale-95 hover:brightness-110 text-slate-950 py-5 px-6 rounded-2xl font-black text-xl shadow-2xl shadow-orange-500/50 transition-transform cursor-pointer flex items-center justify-center gap-3 border-4 border-white"
                      >
                        <Zap className="w-7 h-7 fill-slate-950 animate-bounce" />
                        <span>AYUN TANGAN! (KLIK CEPAT!)</span>
                      </button>
                    </div>
                  )}

                  {raceState === 'finished' && (
                    <div className="text-center space-y-4 animate-float">
                      <div className={`p-6 rounded-3xl border text-center max-w-md mx-auto ${
                        raceWinner === 'Mas Bumi'
                          ? 'bg-amber-400/20 border-amber-400 text-amber-900 dark:text-amber-200'
                          : 'bg-blue-500/20 border-blue-400 text-blue-900 dark:text-blue-200'
                      }`}>
                        <span className="text-5xl block mb-2">
                          {raceWinner === 'Mas Bumi' ? '🏆🥇' : '🥈🐬'}
                        </span>
                        <h4 className="text-2xl font-black font-fun">
                          {raceWinner === 'Mas Bumi' 
                            ? 'HORE! MAS BUMI MENANG JUARA 1!' 
                            : 'Lumba-Lumba Menyentuh Finish Duluan!'}
                        </h4>
                        <p className="text-xs sm:text-sm mt-1">
                          Catatan Waktu: <strong className="font-mono-tech text-base font-bold">{(raceTimeMs / 1000).toFixed(1)} detik</strong>
                        </p>
                      </div>

                      <button
                        onClick={resetRace}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-md hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Balapan Lagi!</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TANTANGAN HITUNG KILAT KUMON */}
          {activeGameTab === 'math' && (
            <div className={`rounded-3xl p-6 sm:p-8 border transition-all ${
              isDarkMode 
                ? 'bg-[#09221b] border-emerald-800/60 shadow-2xl' 
                : 'bg-gradient-to-br from-white via-emerald-50/70 to-teal-100/60 border-emerald-200 shadow-xl'
            }`}>
              <div className="max-w-xl mx-auto space-y-6 text-center">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300 font-mono-tech">
                    KUMON SPEED MATH CHALLENGE
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black font-fun">
                    ⚡ Tantangan Berhitung Kilat Kumon
                  </h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Asah kecepatan logika dan konsentrasi! Jawab sebanyak mungkin soal dalam 20 detik!
                  </p>
                </div>

                {mathState === 'idle' && (
                  <div className="py-8 space-y-4">
                    <div className="text-6xl animate-bounce">🧮</div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Waktu: <strong>20 Detik</strong> • Bonus Combo untuk jawaban beruntun!
                    </p>
                    <button
                      onClick={startMathGame}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-8 py-3.5 rounded-2xl font-black text-base shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 cursor-pointer inline-flex items-center gap-2"
                    >
                      <Zap className="w-5 h-5 fill-white" />
                      <span>Mulai Tes Hitung Kumon!</span>
                    </button>
                  </div>
                )}

                {mathState === 'playing' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-black/20 p-3.5 rounded-2xl border border-emerald-500/30 font-mono-tech">
                      <div className="text-left">
                        <span className="text-[10px] uppercase font-black text-emerald-400 block">Waktu Sisa</span>
                        <span className="text-2xl font-black text-amber-300">{mathTimeLeft}s</span>
                      </div>

                      <div>
                        {mathStreak > 1 && (
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-400 text-slate-950 animate-pulse flex items-center gap-1 font-sans">
                            <Flame className="w-3.5 h-3.5 fill-slate-950" />
                            <span>{mathStreak}x COMBO!</span>
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-black text-emerald-400 block">Skor Kamu</span>
                        <span className="text-2xl font-black text-emerald-300">{mathScore}</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/10 border border-emerald-400/40 backdrop-blur-md">
                      <span className="text-xs text-emerald-300 uppercase tracking-wider font-bold block mb-1 font-mono-tech">
                        Berapa Hasilnya?
                      </span>
                      <div className="text-5xl sm:text-6xl font-black font-mono-tech text-white drop-shadow-md">
                        {currentProblem.q} = ?
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {currentProblem.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleMathAnswer(opt)}
                          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white text-2xl font-mono-tech font-black py-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition-transform cursor-pointer border border-emerald-300"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {mathState === 'finished' && (
                  <div className="p-6 rounded-3xl bg-emerald-500/20 border border-emerald-400 space-y-4 animate-float">
                    <span className="text-5xl block">🎉🎖️</span>
                    <h4 className="text-2xl font-black font-fun">Waktu Habis! Hebat Banget!</h4>
                    <div className="text-4xl font-mono-tech font-black text-emerald-400">
                      Total Skor: {mathScore}
                    </div>
                    <button
                      onClick={startMathGame}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-md hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Main Lagi</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TEBAK KARTU MEMORI */}
          {activeGameTab === 'memory' && (
            <div className={`rounded-3xl p-6 sm:p-8 border transition-all ${
              isDarkMode 
                ? 'bg-[#18112e] border-indigo-800/60 shadow-2xl' 
                : 'bg-gradient-to-br from-white via-indigo-50/70 to-purple-50/60 border-indigo-200 shadow-xl'
            }`}>
              <div className="max-w-xl mx-auto space-y-6 text-center">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-500 bg-indigo-100 dark:bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-300 font-mono-tech">
                    GAME ASAH MEMORI & DAYA INGAT
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black font-fun">
                    🎴 Tebak & Cocokkan Pasangan Kartu Mas Bumi!
                  </h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Klik 2 kartu untuk membukanya. Temukan semua pasangan gambar yang sama!
                  </p>
                </div>

                <div className="flex justify-between items-center bg-black/20 p-3.5 rounded-2xl border border-indigo-500/30 max-w-sm mx-auto font-mono-tech">
                  <span className="text-xs font-bold text-indigo-300">
                    Langkah: <strong className="text-base text-white">{memoryMoves}</strong>
                  </span>
                  <button
                    onClick={resetMemoryGame}
                    className="text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer font-sans"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Acak Ulang</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                  {memoryCards.map((card, idx) => {
                    const isFlipped = flippedCards.includes(idx) || card.matched;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleFlipCard(idx)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-3xl font-bold transition-all duration-300 transform cursor-pointer border-2 select-none ${
                          isFlipped
                            ? card.matched
                              ? 'bg-emerald-500/30 border-emerald-400 text-white scale-95 shadow-md shadow-emerald-500/30'
                              : 'bg-indigo-600 border-indigo-300 text-white scale-102 shadow-lg shadow-indigo-500/40'
                            : 'bg-gradient-to-br from-slate-800 to-indigo-950 hover:from-slate-700 hover:to-indigo-900 border-indigo-500/40 text-indigo-300 hover:scale-105'
                        }`}
                      >
                        {isFlipped ? (
                          <div className="flex flex-col items-center">
                            <span>{card.symbol}</span>
                            <span className="text-[10px] font-black uppercase mt-1 opacity-90 font-mono-tech">{card.name}</span>
                          </div>
                        ) : (
                          <Sparkles className="w-7 h-7 text-indigo-400 opacity-60" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isMemoryWon && (
                  <div className="p-6 rounded-3xl bg-emerald-500/20 border border-emerald-400 space-y-3 animate-float max-w-sm mx-auto">
                    <span className="text-4xl block">🏆🎉</span>
                    <h4 className="text-xl font-black font-fun">Hebat Banget Mas Bumi!</h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-300">
                      Kamu berhasil mencocokkan semua kartu dalam <strong>{memoryMoves} langkah</strong>!
                    </p>
                    <button
                      onClick={resetMemoryGame}
                      className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition-all cursor-pointer"
                    >
                      Mainkan Lagi! 🔄
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: KUIS MULTI-RONDE */}
          {activeGameTab === 'quiz' && (
            <div className={`rounded-3xl p-6 sm:p-8 border transition-all ${
              isDarkMode 
                ? 'bg-gradient-to-br from-slate-900 to-indigo-950/60 border-slate-800' 
                : 'bg-gradient-to-br from-white via-amber-50/50 to-orange-50/50 border-amber-200 shadow-lg'
            }`}>
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black font-mono-tech">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{quizRounds[currentRoundIdx].roundName}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono-tech">
                      (Ronde {currentRoundIdx + 1} dari {quizRounds.length})
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black font-fun">
                    🧠 Kuis Tantangan Pengetahuan Mas Bumi
                  </h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {quizRounds[currentRoundIdx].desc}
                  </p>
                </div>

                <div className="space-y-4">
                  {currentQuestions.map((item, qIdx) => (
                    <div key={qIdx} className={`p-4 sm:p-5 rounded-2xl border ${
                      isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-sky-100 shadow-xs'
                    }`}>
                      <p className="font-extrabold text-sm sm:text-base mb-3 font-fun">
                        {qIdx + 1}. {item.q}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {item.options.map((opt, optIdx) => {
                          const isSelected = answers[qIdx] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(qIdx, optIdx)}
                              className={`text-xs font-bold p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black border-transparent shadow-md scale-102'
                                  : isDarkMode
                                    ? 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-2 space-y-3">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleCheckQuiz}
                      disabled={Object.keys(answers).length < currentQuestions.length}
                      className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 px-7 py-3 rounded-2xl font-black text-sm shadow-lg shadow-amber-400/30 transition-all hover:scale-105 cursor-pointer"
                    >
                      Cek Jawaban Ronde Ini! 🎉
                    </button>

                    <button
                      onClick={nextQuizRound}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 cursor-pointer inline-flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Ganti ke Ronde Soal Baru! ➡️</span>
                    </button>
                  </div>

                  {quizScore !== null && (
                    <div className="mt-4 p-5 rounded-2xl bg-amber-500/15 border border-amber-400/40 animate-float text-center max-w-sm mx-auto">
                      <span className="text-3xl">🏆🌟</span>
                      <h4 className="font-black text-lg mt-1 font-fun">
                        Skor: {quizScore} dari {currentQuestions.length} Benar!
                      </h4>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ARENA CATUR GRANDMASTER MAS BUMI */}
          {activeGameTab === 'chess' && (
            <ChessMasterArena isDarkMode={isDarkMode} playSound={playSound} />
          )}

          {/* TAB 7: LABIRIN LASER OPTIK MAS BUMI */}
          {activeGameTab === 'laser' && (
            <LaserOpticsArena isDarkMode={isDarkMode} playSound={playSound} />
          )}

          {/* TAB 8: TETRIS CYBER MATRIX MAS BUMI */}
          {activeGameTab === 'tetris' && (
            <TetrisCyberArena isDarkMode={isDarkMode} playSound={playSound} />
          )}
        </section>

        {/* SECTION: STOPWATCH INTERAKTIF */}
        <section id="stopwatch" className="relative">
          <div className="bg-gradient-to-br from-[#061e38] via-[#0b2b4e] to-[#041527] rounded-3xl p-6 sm:p-10 text-white shadow-2xl shadow-cyan-950/60 border border-cyan-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-md text-cyan-300 text-xs font-black tracking-wide font-mono-tech">
                <Timer className="w-4 h-4 animate-spin" />
                <span>STOPWATCH TELEMETRY</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white font-fun">
                  ⏱️ Catat Waktu Latihan Renang Mas Bumi
                </h2>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {[
                  'Gaya Bebas 🏊‍♂️', 
                  'Gaya Dada 🐸', 
                  'Gaya Punggung 🌊', 
                  'Gaya Kupu-kupu 🦋'
                ].map((stroke) => (
                  <button
                    key={stroke}
                    onClick={() => {
                      playSound('tech');
                      setSelectedStroke(stroke);
                    }}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      selectedStroke === stroke
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-105 border border-cyan-300'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/5'
                    }`}
                  >
                    {stroke}
                  </button>
                ))}
              </div>

              <div className="py-6 px-4 bg-black/40 rounded-3xl border border-cyan-500/30 backdrop-blur-md max-w-md mx-auto shadow-inner">
                <div className="text-6xl sm:text-7xl font-mono-tech font-black tracking-widest text-cyan-300 drop-shadow-[0_0_35px_rgba(34,211,238,0.5)]">
                  {formatTime(seconds)}
                </div>
                <div className="text-xs text-cyan-200 mt-2 font-semibold">
                  Gaya Aktif: <span className="font-bold text-white bg-cyan-500/30 px-2 py-0.5 rounded-md font-mono-tech">{selectedStroke}</span>
                </div>
              </div>

              {/* Target 50m Quick Reference */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-tech max-w-md mx-auto">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-slate-400 block">Target Bebas</span>
                  <span className="text-emerald-400 font-bold">31s</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-slate-400 block">Target Dada</span>
                  <span className="text-emerald-400 font-bold">43s</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-cyan-500/30 bg-cyan-950/30 text-center">
                  <span className="text-[10px] text-cyan-300 block font-bold">Punggung ⭐</span>
                  <span className="text-cyan-300 font-bold">36s</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-slate-400 block">Target Kupu</span>
                  <span className="text-emerald-400 font-bold">34s</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-3">
                {!isRunning ? (
                  <button
                    onClick={() => {
                      playSound('tech');
                      setIsRunning(true);
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-7 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-cyan-500/40 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>Mulai Timer</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      playSound('tech');
                      setIsRunning(false);
                    }}
                    className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 px-7 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-amber-400/40 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Pause className="w-5 h-5 fill-slate-950" />
                    <span>Jeda</span>
                  </button>
                )}

                <button
                  onClick={handleLap}
                  disabled={seconds === 0}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white px-5 py-3.5 rounded-2xl font-bold text-sm border border-white/15 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>Catat Lap</span>
                </button>

                <button
                  onClick={resetTimer}
                  className="flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 px-5 py-3.5 rounded-2xl font-bold text-sm border border-rose-500/30 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>

              {savedLaps.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-left max-w-md mx-auto">
                  <div className="text-xs font-black text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-1.5 font-mono-tech">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Riwayat Lap Mas Bumi:</span>
                  </div>
                  <div className="space-y-2 font-mono-tech">
                    {savedLaps.map((lap, i) => (
                      <div key={i} className="flex justify-between items-center text-xs py-1.5 px-2 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-slate-300">{lap.stroke}</span>
                        <span className="font-bold text-cyan-300 text-sm">{formatTime(lap.time)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION: MISI & CHECKLIST */}
        <section id="misi" className={`rounded-3xl p-6 sm:p-8 border transition-all ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-800' 
            : 'bg-white/85 border-sky-200/80 shadow-lg'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-cyan-400 uppercase mb-1">
                <Star className="w-4 h-4 fill-cyan-400" />
                <span>MISSION TRACKER</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-fun">
                🎯 Target & Petualangan Mas Bumi (12 Tahun)
              </h2>
            </div>

            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between font-mono-tech">
              <span className="text-2xl font-black text-cyan-400">{progressPercent}%</span>
              <span className="text-xs font-bold text-slate-500">
                {completedCount} / {missions.length} Selesai
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-6 p-0.5 border border-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {missions.map((m) => (
              <div
                key={m.id}
                onClick={() => toggleMission(m.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer select-none ${
                  m.completed
                    ? isDarkMode 
                      ? 'bg-cyan-950/30 border-cyan-800/80 text-slate-200' 
                      : 'bg-cyan-50/70 border-cyan-200 text-slate-800'
                    : isDarkMode
                      ? 'bg-slate-800/50 border-slate-700/80 text-slate-400 opacity-75 hover:opacity-100'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  m.completed 
                    ? 'bg-gradient-to-tr from-cyan-500 to-emerald-500 text-white shadow-xs' 
                    : 'border-2 border-slate-300 dark:border-slate-600'
                }`}>
                  {m.completed && <Check className="w-4 h-4 stroke-[3]" />}
                </div>

                <div className="flex-1">
                  <span className={`text-sm font-bold ${m.completed ? 'line-through opacity-80' : ''}`}>
                    {m.text}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/10 mt-1 inline-block font-mono-tech">
                    {m.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 5 Target & Adventure Cards with Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-white/10">
            {[
              { title: 'Latihan Renang Rutin', desc: 'Meningkatkan stamina & kecepatan semua gaya renang', icon: Waves, color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30' },
              { title: 'Asah Taktik Catur', desc: 'Latihan strategi papan catur, langkah kuda & skakmat ♟️', icon: Crown, color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' },
              { title: 'Naik Level Kumon', desc: 'Menyelesaikan lembar kerja harian tepat waktu', icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' },
              { title: 'Bikin Web Sendiri', desc: 'Punya web pribadi aktif di bumi.pamungkas.org', icon: Compass, color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
              { title: 'Membanggakan Orang Tua', desc: 'Rajin beribadah, belajar, dan selalu berbuat baik', icon: Heart, color: 'text-rose-400 bg-rose-500/20 border-rose-500/30' },
            ].map((target, idx) => {
              const Icon = target.icon;
              return (
                <div key={idx} className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-sky-100 shadow-xs'
                }`}>
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-xl ${target.color} border flex items-center justify-center font-bold`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-base font-fun">{target.title}</h4>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{target.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-cyan-400 text-xs font-bold font-mono-tech">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sedang Berjalan!</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION: RUANG GALERI & MOMEN SERU MAS BUMI                    */}
        {/* ============================================================== */}
        <section id="galeri" className={`rounded-3xl p-6 sm:p-8 border transition-all backdrop-blur-xl ${
          isDarkMode 
            ? 'bg-slate-900/85 border-slate-800 shadow-xl' 
            : 'bg-white/90 border-sky-100 shadow-md'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-cyan-400 uppercase mb-1">
                <Camera className="w-4 h-4" />
                <span>MOMENTS & ALBUM</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-fun">
                📸 Galeri & Momen Seru
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Mas Bumi bisa memajang foto saat berenang di umbul Klaten, kegiatan belajar di MIM Basin, atau bersama keluarga di sini!
              </p>
            </div>
            <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${
              isDarkMode 
                ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300' 
                : 'bg-sky-50 border-sky-200 text-sky-700'
            }`}>
              Siap Dimasuki Foto Asli 🖼️
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`aspect-video rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-dashed transition-all hover:scale-[1.02] cursor-pointer ${
              isDarkMode 
                ? 'bg-cyan-950/20 border-cyan-800/50 hover:border-cyan-400/80' 
                : 'bg-gradient-to-br from-cyan-50 to-sky-100 border-sky-300'
            }`}>
              <span className="text-4xl mb-2 animate-bounce">🏊‍♂️</span>
              <span className="text-xs font-bold font-mono-tech text-cyan-400">Momen Latihan Renang</span>
              <span className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-sky-700'}`}>
                Foto aksi Mas Bumi saat meluncur di kolam
              </span>
            </div>

            <div className={`aspect-video rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-dashed transition-all hover:scale-[1.02] cursor-pointer ${
              isDarkMode 
                ? 'bg-indigo-950/20 border-indigo-800/50 hover:border-indigo-400/80' 
                : 'bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-300'
            }`}>
              <span className="text-4xl mb-2 animate-bounce">🎒</span>
              <span className="text-xs font-bold font-mono-tech text-indigo-400">Kegiatan di MIM Basin</span>
              <span className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-indigo-700'}`}>
                Foto bersama guru & teman sekelas Klaten
              </span>
            </div>

            <div className={`aspect-video rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-dashed transition-all hover:scale-[1.02] cursor-pointer ${
              isDarkMode 
                ? 'bg-amber-950/20 border-amber-800/50 hover:border-amber-400/80' 
                : 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-300'
            }`}>
              <span className="text-4xl mb-2 animate-bounce">🏅</span>
              <span className="text-xs font-bold font-mono-tech text-amber-400">Prestasi & Olahraga</span>
              <span className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-amber-700'}`}>
                Foto piala, sertifikat, atau aktivitas gowes
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className={`border-t mt-16 py-10 transition-colors ${
        isDarkMode ? 'bg-[#040810] border-slate-800/80 text-slate-400' : 'bg-white border-sky-100 text-slate-600'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-bold font-mono-tech">
              KB
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>Kun Bumi Pamungkas (Mas Bumi)</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              </p>
              <p className="text-[11px] text-slate-500 font-mono-tech">
                Klaten, Jawa Tengah • 05-06-2014
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-semibold font-mono-tech text-xs">
            <a 
              href="https://pamungkas.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>pamungkas.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a 
              href="https://github.com/satriyop/bumi.pamungkas.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span className="text-cyan-500">bumi.pamungkas.org</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
