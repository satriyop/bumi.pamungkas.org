import { useState, useEffect } from 'react';
import { 
  Waves, 
  Award, 
  BookOpen, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Trophy, 
  Timer, 
  CheckCircle2, 
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
  ShieldCheck 
} from 'lucide-react';

export default function App() {
  // Theme state: 'ocean' (day) or 'deepsea' (night neon)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Swimming Stopwatch State
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStroke, setSelectedStroke] = useState('Gaya Bebas 🏊‍♂️');
  const [savedLaps, setSavedLaps] = useState<{ stroke: string; time: number }[]>([]);

  // Interactive Missions / Targets
  const [missions, setMissions] = useState([
    { id: 1, text: 'Latihan renang rutin 50 meter gaya bebas tanpa henti', completed: true, category: 'Renang' },
    { id: 2, text: 'Selesaikan lembar kerja harian Kumon dengan konsisten', completed: true, category: 'Belajar' },
    { id: 3, text: 'Belajar rajin & berprestasi di MIM Basin Klaten', completed: true, category: 'Sekolah' },
    { id: 4, text: 'Terbitkan website pribadi keren di bumi.pamungkas.org', completed: true, category: 'Website' },
    { id: 5, text: 'Gowes sepeda keliling Klaten bareng teman di akhir pekan', completed: false, category: 'Olahraga' },
    { id: 6, text: 'Bantu orang tua di rumah dan selalu buat mereka tersenyum', completed: true, category: 'Keluarga' }
  ]);

  // Mini Quiz: Seberapa Kenal Mas Bumi?
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  const quizQuestions = [
    {
      q: 'Kapan hari ulang tahun Mas Bumi?',
      options: ['10 Januari 2013', '5 Juni 2014', '17 Agustus 2014'],
      correct: 1
    },
    {
      q: 'Di mana Mas Bumi bersekolah?',
      options: ['MIM Basin Klaten', 'SD Negeri 1 Solo', 'SMP Internasional'],
      correct: 0
    },
    {
      q: 'Apa olahraga favorit yang Mas Bumi tekuni?',
      options: ['Bermain Catur', 'Berenang (Swimming)', 'Lompat Tali'],
      correct: 1
    }
  ];

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCheckQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score += 1;
    });
    setQuizScore(score);
  };

  // Stopwatch timer interval
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
      setSavedLaps((prev) => [{ stroke: selectedStroke, time: seconds }, ...prev.slice(0, 4)]);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const toggleMission = (id: number) => {
    setMissions(missions.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const completedCount = missions.filter(m => m.completed).length;
  const progressPercent = Math.round((completedCount / missions.length) * 100);

  return (
    <div className={`min-h-screen transition-colors duration-500 selection:bg-cyan-400 selection:text-slate-900 ${
      isDarkMode 
        ? 'bg-[#0b1120] text-slate-100' 
        : 'bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#ecfeff] text-slate-800'
    }`}>

      {/* FLOATING AMBIENT GLOWS & BUBBLES */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-10 left-10 w-96 h-96 rounded-full blur-3xl opacity-40 animate-pulse-glow ${
          isDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-300/40'
        }`} />
        <div className={`absolute top-1/3 right-10 w-80 h-80 rounded-full blur-3xl opacity-30 animate-float-slow ${
          isDarkMode ? 'bg-blue-600/20' : 'bg-sky-400/30'
        }`} />
        <div className={`absolute bottom-20 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-35 animate-float ${
          isDarkMode ? 'bg-indigo-600/20' : 'bg-teal-300/30'
        }`} />
      </div>

      {/* TOP NAVBAR */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${
        isDarkMode 
          ? 'bg-[#0b1120]/80 border-slate-800/80 shadow-lg shadow-black/20' 
          : 'bg-white/70 border-sky-200/60 shadow-sm'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-400/40 group-hover:scale-105 group-hover:rotate-3 transition-all">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight block leading-tight font-fun">
                  Mas Bumi
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 uppercase tracking-wide">
                  12 th
                </span>
              </div>
              <span className="text-xs font-semibold text-cyan-500 tracking-wide block">
                bumi.pamungkas.org
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <a href="#tentang" className="hover:text-cyan-500 transition-colors">Tentang Mas Bumi</a>
            <a href="#hobi" className="hover:text-cyan-500 transition-colors">Renang & Olahraga</a>
            <a href="#stopwatch" className="hover:text-cyan-500 transition-colors">Stopwatch ⏱️</a>
            <a href="#sekolah" className="hover:text-cyan-500 transition-colors">MIM Basin & Kumon</a>
            <a href="#misi" className="hover:text-cyan-500 transition-colors">Misi Keren</a>
            <a href="#kuis" className="hover:text-cyan-500 transition-colors">Kuis Seru 🎮</a>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isDarkMode
                  ? 'bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-slate-700 border border-sky-200 hover:bg-sky-50 shadow-xs'
              }`}
              title="Ganti Mode Tampilan"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Siang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="hidden sm:inline">Malam</span>
                </>
              )}
            </button>

            <a 
              href="https://pamungkas.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                isDarkMode
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900'
                  : 'bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-200 shadow-xs'
              }`}
            >
              <span>Keluarga</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">

        {/* HERO SECTION */}
        <section id="tentang" className="relative">
          <div className={`rounded-3xl p-6 sm:p-10 border transition-all relative overflow-hidden backdrop-blur-md ${
            isDarkMode 
              ? 'bg-slate-900/80 border-slate-800 shadow-2xl shadow-cyan-950/50' 
              : 'bg-white/80 border-sky-200/80 shadow-xl shadow-sky-200/40'
          }`}>
            {/* Top decorative badge banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>WEBSITE RESMI KUN BUMI PAMUNGKAS</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Pelajar & Atlet Muda Klaten</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Profile Avatar Card with 3D-like float effect */}
              <div className="relative flex-shrink-0 animate-float">
                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-teal-400 p-1.5 shadow-2xl shadow-cyan-500/30">
                  <div className={`w-full h-full rounded-[22px] overflow-hidden flex flex-col items-center justify-center relative group select-none ${
                    isDarkMode ? 'bg-[#0f172a]' : 'bg-gradient-to-b from-slate-900 to-blue-950'
                  }`}>
                    {/* Animated water waves behind emoji */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                    <span className="text-7xl sm:text-8xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                      🏊‍♂️
                    </span>
                    <div className="absolute bottom-2.5 px-3 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 backdrop-blur-xs text-[11px] font-extrabold text-cyan-200">
                      🌊 Perenang Klaten
                    </div>
                  </div>
                </div>

                {/* Floating Badges around avatar */}
                <div className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white">
                  <Flame className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  <span>Semangat Juara!</span>
                </div>

                <div className="absolute -bottom-3 -right-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border-2 border-white">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>12 Tahun</span>
                </div>
              </div>

              {/* Bio & Intro Details */}
              <div className="text-center md:text-left space-y-4 flex-1">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight font-fun">
                  Halo Teman-Teman! Aku <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 bg-clip-text text-transparent drop-shadow-xs">
                    Kun Bumi Pamungkas
                  </span>
                </h1>

                <p className={`text-base sm:text-lg font-medium leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Biasa dipanggil <strong className="font-extrabold text-cyan-500">Mas Bumi</strong>. 
                  Aku anak yang gemar berenang, suka olahraga aktif, bersekolah di <strong className="font-bold underline decoration-cyan-400 decoration-2">MIM Basin Klaten</strong>, dan melatih ketekunan logika di <strong className="font-bold underline decoration-blue-400 decoration-2">Kumon</strong>!
                </p>

                {/* Key Facts Pill Grid */}
                <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-2">
                  <span className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-800/90 text-slate-200 border-slate-700' 
                      : 'bg-white text-slate-700 border-sky-100 shadow-xs'
                  }`}>
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    <span>Lahir: 5 Juni 2014</span>
                  </span>

                  <span className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-800/90 text-slate-200 border-slate-700' 
                      : 'bg-white text-slate-700 border-sky-100 shadow-xs'
                  }`}>
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>Klaten, Jawa Tengah</span>
                  </span>

                  <span className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-800/90 text-slate-200 border-slate-700' 
                      : 'bg-white text-slate-700 border-sky-100 shadow-xs'
                  }`}>
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>MIM Basin Klaten</span>
                  </span>

                  <span className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-800/90 text-slate-200 border-slate-700' 
                      : 'bg-white text-slate-700 border-sky-100 shadow-xs'
                  }`}>
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>Siswa Kumon</span>
                  </span>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
                  <a
                    href="#stopwatch"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Timer className="w-4 h-4" />
                    <span>Coba Stopwatch Renang</span>
                  </a>

                  <a
                    href="#kuis"
                    className={`inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl border transition-all hover:scale-105 cursor-pointer ${
                      isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
                        : 'bg-white hover:bg-sky-50 text-slate-700 border-sky-200 shadow-xs'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Tebak Kuis Mas Bumi</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION: HOBI & OLAHRAGA */}
        <section id="hobi" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-cyan-500 uppercase mb-1">
                <Waves className="w-4 h-4" />
                <span>DUNIA AIR & OLAHRAGA</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-fun">
                🏊‍♂️ Bakat, Hobi & Olahraga
              </h2>
            </div>
            <p className={`text-xs sm:text-sm max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Bagi Mas Bumi, bergerak aktif dan berenang bukan sekadar hobi, tapi cara melatih tubuh sehat, disiplin, dan pantang menyerah!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Renang */}
            <div className={`rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden group ${
              isDarkMode 
                ? 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/60 shadow-xl' 
                : 'bg-white/90 border-sky-100 hover:border-cyan-300 shadow-lg shadow-sky-100'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Waves className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-xl mb-2 font-fun">Berenang (Swimming)</h3>
              <p className={`text-sm leading-relaxed mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Hobi nomor satu Mas Bumi! Suka meluncur di lintasan kolam, melatih daya tahan paru-paru, dan menyempurnakan berbagai teknik gaya renang.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Gaya Bebas', 'Gaya Dada', 'Gaya Punggung', 'Gaya Kupu-kupu'].map(gaya => (
                  <span key={gaya} className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                    isDarkMode
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80'
                      : 'bg-cyan-50 text-cyan-800 border-cyan-200/70'
                  }`}>
                    {gaya}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 2: Olahraga Fisik */}
            <div className={`rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden group ${
              isDarkMode 
                ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 shadow-xl' 
                : 'bg-white/90 border-sky-100 hover:border-amber-300 shadow-lg shadow-sky-100'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-xl mb-2 font-fun">Olahraga & Gerak Aktif</h3>
              <p className={`text-sm leading-relaxed mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Selain di kolam renang, Mas Bumi gemar berlari, main bola bersama teman di sekolah MIM Basin, dan bersepeda keliling Klaten yang asri.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Lari Cepat 🏃', 'Bersepeda 🚴', 'Sepak Bola ⚽', 'Senam Pagi 🤸'].map(sport => (
                  <span key={sport} className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                    isDarkMode
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                      : 'bg-amber-50 text-amber-900 border-amber-200/70'
                  }`}>
                    {sport}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 3: Sportivitas & Mental */}
            <div className={`rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden group ${
              isDarkMode 
                ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/60 shadow-xl' 
                : 'bg-white/90 border-sky-100 hover:border-emerald-300 shadow-lg shadow-sky-100'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-xl mb-2 font-fun">Mental Juara & Sportif</h3>
              <p className={`text-sm leading-relaxed mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Olahraga mengajarkan arti kerja keras. Menang disyukuri dengan rendah hati, kalah jadi bahan pelajaran untuk bangkit lebih kuat lagi!
              </p>
              <div className="flex flex-wrap gap-2">
                {['Disiplin Tinggi', 'Pantang Menyerah', 'Menghormati Lawan'].map(val => (
                  <span key={val} className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                    isDarkMode
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200/70'
                  }`}>
                    {val}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: STOPWATCH INTERAKTIF MAS BUMI */}
        <section id="stopwatch" className="relative">
          <div className="bg-gradient-to-br from-[#061e38] via-[#0b2b4e] to-[#041527] rounded-3xl p-6 sm:p-10 text-white shadow-2xl shadow-cyan-950/60 border border-cyan-500/30 relative overflow-hidden">
            {/* Water splash ambient circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-md text-cyan-300 text-xs font-black tracking-wide">
                <Timer className="w-4 h-4 animate-spin" />
                <span>FITUR SPESIAL: STOPWATCH LATIHAN MAS BUMI</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-white font-fun">
                  ⏱️ Catat Waktu Renangmu!
                </h2>
                <p className="text-slate-300 text-sm mt-2">
                  Pilih gaya renang yang mau diuji, lalu tekan <strong>Mulai</strong> saat bersiap melompat ke air!
                </p>
              </div>

              {/* Stroke Selector Buttons */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {[
                  'Gaya Bebas 🏊‍♂️', 
                  'Gaya Dada 🐸', 
                  'Gaya Punggung 🌊', 
                  'Gaya Kupu-kupu 🦋'
                ].map((stroke) => (
                  <button
                    key={stroke}
                    onClick={() => setSelectedStroke(stroke)}
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

              {/* Large Timer Screen */}
              <div className="py-6 px-4 bg-black/40 rounded-3xl border border-cyan-500/30 backdrop-blur-md max-w-md mx-auto shadow-inner">
                <div className="text-6xl sm:text-7xl font-mono font-black tracking-widest text-cyan-300 drop-shadow-[0_0_35px_rgba(34,211,238,0.5)]">
                  {formatTime(seconds)}
                </div>
                <div className="text-xs text-cyan-200 mt-2 font-semibold">
                  Gaya Aktif: <span className="font-bold text-white bg-cyan-500/30 px-2 py-0.5 rounded-md">{selectedStroke}</span>
                </div>
              </div>

              {/* Stopwatch Action Controls */}
              <div className="flex flex-wrap justify-center items-center gap-3">
                {!isRunning ? (
                  <button
                    onClick={() => setIsRunning(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-7 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-cyan-500/40 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>Mulai Renang!</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsRunning(false)}
                    className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 px-7 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-amber-400/40 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Pause className="w-5 h-5 fill-slate-950" />
                    <span>Jeda / Istirahat</span>
                  </button>
                )}

                <button
                  onClick={handleLap}
                  disabled={seconds === 0}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white px-5 py-3.5 rounded-2xl font-bold text-sm border border-white/15 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>Catat Putaran (Lap)</span>
                </button>

                <button
                  onClick={resetTimer}
                  className="flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 px-5 py-3.5 rounded-2xl font-bold text-sm border border-rose-500/30 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Lap Records Table */}
              {savedLaps.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-left max-w-md mx-auto">
                  <div className="text-xs font-black text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Riwayat Catatan Waktu Mas Bumi:</span>
                  </div>
                  <div className="space-y-2 font-mono">
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

        {/* SECTION: SEKOLAH & KUMON */}
        <section id="sekolah" className="space-y-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-cyan-500 uppercase mb-1">
              <BookOpen className="w-4 h-4" />
              <span>TEMPAT MENUNTUT ILMU</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-fun">
              🏫 Belajar di MIM Basin & Kumon
            </h2>
            <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Belajar setiap hari dengan penuh rasa ingin tahu dan ketekunan untuk masa depan yang gemilang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MIM Basin Klaten */}
            <div className={`rounded-3xl p-6 sm:p-8 border transition-all duration-300 hover:shadow-xl relative overflow-hidden group ${
              isDarkMode 
                ? 'bg-slate-900/90 border-slate-800' 
                : 'bg-white/90 border-sky-100 shadow-md'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black mb-2 font-fun">
                MIM Basin Klaten
              </h3>
              <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-3 uppercase tracking-wide">
                Madrasah Ibtidaiyah Muhammadiyah Basin
              </p>
              <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Di MIM Basin Klaten, Mas Bumi mendapatkan bimbingan dari guru-guru hebat, belajar ilmu umum, nilai-nilai akhlak mulia, hafalan, serta bermain gembira bersama teman-teman seperjuangan.
              </p>
              <div className={`rounded-2xl p-3.5 border flex items-center gap-2.5 text-xs font-bold ${
                isDarkMode 
                  ? 'bg-indigo-950/50 border-indigo-800/60 text-indigo-300' 
                  : 'bg-indigo-50/80 border-indigo-100 text-indigo-900'
              }`}>
                <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>Basin, Kec. Kebonarum, Kab. Klaten, Jawa Tengah</span>
              </div>
            </div>

            {/* Kumon */}
            <div className={`rounded-3xl p-6 sm:p-8 border transition-all duration-300 hover:shadow-xl relative overflow-hidden group ${
              isDarkMode 
                ? 'bg-slate-900/90 border-slate-800' 
                : 'bg-white/90 border-sky-100 shadow-md'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black mb-2 font-fun">
                Metode Belajar Kumon
              </h3>
              <p className="text-xs font-bold text-cyan-500 dark:text-cyan-400 mb-3 uppercase tracking-wide">
                Belajar Mandiri & Logika Matematika
              </p>
              <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Kumon melatih Mas Bumi menyelesaikan tantangan lembar kerja harian secara mandiri. Membangun kebiasaan fokus, daya hitung kilat, dan rasa percaya diri menyelesaikan soal yang sulit.
              </p>
              <div className={`rounded-2xl p-3.5 border flex items-center gap-2.5 text-xs font-bold ${
                isDarkMode 
                  ? 'bg-cyan-950/50 border-cyan-800/60 text-cyan-300' 
                  : 'bg-cyan-50/80 border-cyan-100 text-cyan-900'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                <span>Disiplin Setiap Hari • Logika Cepat • Konsistensi Kuat</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: MISI & CHECKLIST PETUALANGAN (INTERAKTIF) */}
        <section id="misi" className={`rounded-3xl p-6 sm:p-8 border transition-all ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-800' 
            : 'bg-white/85 border-sky-200/80 shadow-lg shadow-sky-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-cyan-500 uppercase mb-1">
                <Star className="w-4 h-4 fill-cyan-500" />
                <span>INTERAKTIF CHECKLIST</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-fun">
                🎯 Misi Petualangan Mas Bumi (Umur 12 Tahun)
              </h2>
              <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Klik kotak untuk mencentang misi yang sudah dicapai!
              </p>
            </div>

            {/* Progress Counter Badge */}
            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
              <span className="text-2xl font-black text-cyan-500">{progressPercent}%</span>
              <span className="text-xs font-bold text-slate-500">
                {completedCount} dari {missions.length} Misi Selesai
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden mb-6 p-0.5 border border-slate-300/40 dark:border-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Mission Items */}
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
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${m.completed ? 'line-through opacity-80' : ''}`}>
                      {m.text}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/40 dark:bg-white/10 mt-1 inline-block">
                    {m.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: MINI GAME / KUIS TEBAK MAS BUMI */}
        <section id="kuis" className={`rounded-3xl p-6 sm:p-8 border transition-all ${
          isDarkMode 
            ? 'bg-gradient-to-br from-slate-900 to-indigo-950/60 border-slate-800' 
            : 'bg-gradient-to-br from-white via-sky-50 to-blue-50 border-sky-200 shadow-lg shadow-sky-100'
        }`}>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 text-xs font-black">
                <Sparkles className="w-4 h-4" />
                <span>MINI GAME INTERAKTIF</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-fun">
                🎮 Kuis: Seberapa Kenal Kamu dengan Mas Bumi?
              </h2>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Jawab 3 pertanyaan seru ini untuk menguji pengetahuanmu tentang Mas Bumi!
              </p>
            </div>

            <div className="space-y-4">
              {quizQuestions.map((item, qIdx) => (
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
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-md scale-102'
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

            <div className="text-center pt-2">
              <button
                onClick={handleCheckQuiz}
                disabled={Object.keys(answers).length < quizQuestions.length}
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-amber-400/30 transition-all hover:scale-105 cursor-pointer"
              >
                Cek Jawabanmu! 🎉
              </button>

              {quizScore !== null && (
                <div className="mt-4 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 animate-float text-center max-w-sm mx-auto">
                  <span className="text-2xl">🏆</span>
                  <h4 className="font-black text-base mt-1">
                    Skor: {quizScore} dari {quizQuestions.length} Benar!
                  </h4>
                  <p className="text-xs text-cyan-500 dark:text-cyan-300 mt-0.5">
                    {quizScore === 3 
                      ? 'Luar biasa! Kamu sahabat sejati Mas Bumi! 🌟' 
                      : 'Keren! Terus kenali Mas Bumi lebih dekat ya! 😊'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION: GALERI FOTO */}
        <section className={`rounded-3xl p-6 sm:p-8 border transition-all ${
          isDarkMode 
            ? 'bg-slate-900/80 border-slate-800' 
            : 'bg-white/85 border-sky-100 shadow-md'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-cyan-500 uppercase mb-1">
                <span>📸 DOKUMENTASI & KENANGAN</span>
              </div>
              <h3 className="text-2xl font-black font-fun">
                Galeri Foto & Momen Seru
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Ruang siap pakai untuk menampilkan foto Mas Bumi saat di kolam renang, di sekolah, atau berpetualang.
              </p>
            </div>
            <span className="text-xs font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 px-3.5 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-800">
              Siap Pasang Foto 🖼️
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="aspect-video bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-cyan-400/50 group hover:border-cyan-400 transition-colors">
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🏊‍♂️</span>
              <span className="text-xs font-black">Aksi di Kolam Renang</span>
              <span className="text-[11px] opacity-70">Latihan gaya renang Mas Bumi</span>
            </div>

            <div className="aspect-video bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-indigo-400/50 group hover:border-indigo-400 transition-colors">
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎒</span>
              <span className="text-xs font-black">Momen MIM Basin Klaten</span>
              <span className="text-[11px] opacity-70">Belajar & bermain bersama teman</span>
            </div>

            <div className="aspect-video bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-amber-400/50 group hover:border-amber-400 transition-colors">
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🏅</span>
              <span className="text-xs font-black">Prestasi & Semangat Olahraga</span>
              <span className="text-[11px] opacity-70">Medali, piala, dan petualangan</span>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className={`border-t mt-16 py-10 transition-colors ${
        isDarkMode 
          ? 'bg-[#070d19] border-slate-800/80 text-slate-400' 
          : 'bg-white border-sky-100 text-slate-600'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-bold">
              KB
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Kun Bumi Pamungkas (Mas Bumi)
              </p>
              <p className="text-[11px] text-slate-500">
                Klaten, Jawa Tengah • Lahir 5 Juni 2014
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            <a 
              href="https://pamungkas.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>pamungkas.org</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span>•</span>
            <a 
              href="https://github.com/satriyop/bumi.pamungkas.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-cyan-500 transition-colors flex items-center gap-1"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span>•</span>
            <span>Subdomain: bumi.pamungkas.org</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
