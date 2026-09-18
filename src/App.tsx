import { useState, useEffect } from 'react';
import { 
  Waves, 
  Award, 
  BookOpen, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Heart, 
  Trophy, 
  Timer, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw, 
  ExternalLink, 
  Activity,
  Compass
} from 'lucide-react';

export default function App() {
  // Interactive Swimming Stopwatch State
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedStroke, setSelectedStroke] = useState('Gaya Bebas');
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
      setSavedLaps((prev) => [{ stroke: selectedStroke, time: seconds }, ...prev.slice(0, 4)]);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-cyan-50/40 to-blue-50/50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sky-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-200 group-hover:scale-105 transition-transform">
              <Waves className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-800 tracking-tight block leading-tight">
                Mas Bumi
              </span>
              <span className="text-xs font-semibold text-cyan-600 tracking-wide">
                bumi.pamungkas.org
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#tentang" className="hover:text-cyan-600 transition-colors">Tentang Aku</a>
            <a href="#hobi" className="hover:text-cyan-600 transition-colors">Renang & Olahraga</a>
            <a href="#sekolah" className="hover:text-cyan-600 transition-colors">Sekolah & Kumon</a>
            <a href="#stopwatch" className="hover:text-cyan-600 transition-colors">Stopwatch Renang</a>
            <a href="#target" className="hover:text-cyan-600 transition-colors">Target Mas Bumi</a>
          </nav>

          <a 
            href="https://pamungkas.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs bg-sky-100 hover:bg-sky-200 text-sky-800 px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5 border border-sky-200/60"
          >
            <span>Keluarga Pamungkas</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
        
        {/* HERO SECTION */}
        <section id="tentang" className="relative">
          <div className="bg-gradient-to-br from-white via-cyan-50/50 to-blue-100/60 rounded-3xl p-6 sm:p-10 border border-sky-100/80 shadow-xl shadow-sky-100/50 relative overflow-hidden">
            {/* Background water ripple glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-200/30 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              
              {/* Profile Avatar / Badge */}
              <div className="relative flex-shrink-0">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500 p-1.5 shadow-xl shadow-cyan-200">
                  <div className="w-full h-full rounded-[22px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-white relative group">
                    <span className="text-6xl sm:text-7xl select-none transform group-hover:scale-110 transition-transform">
                      🏊‍♂️
                    </span>
                    <span className="absolute bottom-2 text-xs font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-sky-200">
                      Mas Bumi
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-3 -right-3 bg-amber-400 text-amber-950 text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-white">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
                  <span>12 Tahun</span>
                </div>
              </div>

              {/* Text / Introduction */}
              <div className="text-center md:text-left space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  SELAMAT DATANG DI WEBSITE PRIBADIKU!
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Halo! Aku <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Kun Bumi</span> Pamungkas
                </h1>

                <p className="text-lg text-slate-600 font-medium">
                  Biasa dipanggil <strong className="text-slate-900 font-bold">Mas Bumi</strong>. Aku suka berenang, gemar berolahraga, bersekolah di <strong className="text-slate-900">MIM Basin Klaten</strong>, dan belajar mandiri di <strong className="text-slate-900">Kumon</strong>!
                </p>

                {/* Key Facts Pill Grid */}
                <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-3.5 py-2 rounded-xl text-slate-700 shadow-xs border border-slate-100">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    5 Juni 2014 (12 Tahun)
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-3.5 py-2 rounded-xl text-slate-700 shadow-xs border border-slate-100">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    Klaten, Jawa Tengah
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-3.5 py-2 rounded-xl text-slate-700 shadow-xs border border-slate-100">
                    <Award className="w-4 h-4 text-amber-500" />
                    MIM Basin Klaten
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white px-3.5 py-2 rounded-xl text-slate-700 shadow-xs border border-slate-100">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    Siswa Kumon
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION: HOBI & OLAHRAGA */}
        <section id="hobi" className="space-y-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold tracking-wider text-cyan-600 uppercase">Aktivitas Favorit</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center md:justify-start gap-2.5">
              <span>🏊‍♂️ Renang & Olahraga</span>
            </h2>
            <p className="text-slate-600 text-sm mt-1">Air dan olahraga bikin tubuh sehat, kuat, dan pikiran selalu segar!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Renang */}
            <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Waves className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Berenang (Swimming)</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Renang adalah hobi utamaku! Rasanya seru bisa meluncur di air, melatih pernapasan, dan mencoba berbagai gaya renang.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs font-semibold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg">Gaya Bebas</span>
                <span className="text-xs font-semibold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg">Gaya Dada</span>
                <span className="text-xs font-semibold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg">Gaya Punggung</span>
              </div>
            </div>

            {/* Card 2: Olahraga Lainnya */}
            <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Olahraga & Gerak Aktif</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Selain berenang, aku juga suka olahraga lari, sepak bola kecil bareng teman di sekolah, senam, dan bersepeda santai di Klaten.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs font-semibold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg">Lari Cepat</span>
                <span className="text-xs font-semibold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg">Bersepeda</span>
                <span className="text-xs font-semibold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg">Sehat & Bugar</span>
              </div>
            </div>

            {/* Card 3: Semangat Pantang Menyerah */}
            <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Sportivitas & Disiplin</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Olahraga mengajarkan Mas Bumi untuk selalu tepat waktu, menghargai teman bermain, dan tidak mudah putus asa saat menghadapi tantangan.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg">Disiplin</span>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg">Sportif</span>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg">Kuat</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: STOPWATCH INTERAKTIF MAS BUMI */}
        <section id="stopwatch" className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-cyan-300 text-xs font-bold">
              <Timer className="w-4 h-4" />
              <span>FITUR KHUSUS LATIHAN RENANG</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                ⏱️ Stopwatch Latihan Renang Mas Bumi
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                Gunakan stopwatch ini saat Mas Bumi latihan renang atau latihan fisik!
              </p>
            </div>

            {/* Stroke Selector */}
            <div className="flex flex-wrap justify-center gap-2">
              {['Gaya Bebas', 'Gaya Dada', 'Gaya Punggung', 'Gaya Kupu-kupu'].map((stroke) => (
                <button
                  key={stroke}
                  onClick={() => setSelectedStroke(stroke)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    selectedStroke === stroke
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/40 scale-105'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {stroke}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="py-4">
              <div className="text-6xl sm:text-7xl font-mono font-black tracking-wider text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">
                {formatTime(seconds)}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                Pilihan saat ini: <span className="text-cyan-300 font-bold">{selectedStroke}</span>
              </p>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-3">
              {!isRunning ? (
                <button
                  onClick={() => setIsRunning(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Mulai
                </button>
              ) : (
                <button
                  onClick={() => setIsRunning(false)}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all hover:scale-105 cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-slate-950" />
                  Jeda
                </button>
              )}

              <button
                onClick={handleLap}
                disabled={seconds === 0}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer"
              >
                Catat Putaran
              </button>

              <button
                onClick={resetTimer}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-rose-500/30 text-white px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {/* Lap Records */}
            {savedLaps.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-left">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Catatan Waktu Terakhir:
                </div>
                <div className="space-y-1.5 font-mono text-sm">
                  {savedLaps.map((lap, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                      <span className="text-cyan-300">{lap.stroke}</span>
                      <span className="font-bold text-white">{formatTime(lap.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION: SEKOLAH & KUMON */}
        <section id="sekolah" className="space-y-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold tracking-wider text-cyan-600 uppercase">Pendidikan & Pembelajaran</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center md:justify-start gap-2.5">
              <span>🏫 Belajar di MIM Basin & Kumon</span>
            </h2>
            <p className="text-slate-600 text-sm mt-1">Belajar tekun setiap hari untuk meraih cita-cita masa depan yang tinggi!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Madrasah Ibtidaiyah Muhammadiyah (MIM) Basin
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Di <strong>MIM Basin Klaten</strong>, Mas Bumi belajar berbagai ilmu pelajaran umum, agama, dan karakter yang baik. Bertemu bapak ibu guru yang ramah dan bermain riang bersama teman-teman sekelas.
              </p>
              <div className="bg-indigo-50/70 rounded-xl p-3 border border-indigo-100 flex items-center gap-2 text-indigo-900 text-xs font-semibold">
                <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Basin, Kebonarum, Klaten, Jawa Tengah</span>
              </div>
            </div>

            {/* Kumon Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-sky-100 shadow-md space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Metode Belajar Kumon
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Mengikuti metode pembelajaran <strong>Kumon</strong> melatih Mas Bumi untuk belajar mandiri, konsisten mengerjakan lembar kerja setiap hari, dan mengasah ketajaman hitungan serta daya fokus.
              </p>
              <div className="bg-cyan-50/70 rounded-xl p-3 border border-cyan-100 flex items-center gap-2 text-cyan-900 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span>Belajar Mandiri • Konsisten Setiap Hari • Pantang Menyerah</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: TARGET & PRESTASI MAS BUMI */}
        <section id="target" className="space-y-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold tracking-wider text-cyan-600 uppercase">Misi Keren</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center md:justify-start gap-2.5">
              <span>🎯 Target & Petualangan Mas Bumi</span>
            </h2>
            <p className="text-slate-600 text-sm mt-1">Daftar target yang ingin dicapai Mas Bumi umur 12 tahun!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Latihan Renang Rutin', desc: 'Meningkatkan stamina & kecepatan semua gaya renang', icon: Waves, color: 'text-cyan-600 bg-cyan-50' },
              { title: 'Naik Level Kumon', desc: 'Menyelesaikan lembar kerja harian tepat waktu', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
              { title: 'Bikin Web Sendiri', desc: 'Punya web pribadi aktif di bumi.pamungkas.org', icon: Compass, color: 'text-blue-600 bg-blue-50' },
              { title: 'Membanggakan Orang Tua', desc: 'Rajin beribadah, belajar, dan berbuat baik', icon: Heart, color: 'text-rose-600 bg-rose-50' },
            ].map((target, idx) => {
              const Icon = target.icon;
              return (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-xl ${target.color} flex items-center justify-center font-bold`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{target.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{target.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-cyan-700 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sedang Berjalan!</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION: RUANG FOTO MAS BUMI (Siap Pasang Foto Asli) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📸 Galeri & Momen Seru</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Mas Bumi bisa memajang foto saat berenang, kegiatan di MIM Basin Klaten, atau bersama keluarga di sini!
              </p>
            </div>
            <span className="text-xs font-semibold bg-sky-50 text-sky-700 px-3 py-1.5 rounded-full border border-sky-100">
              Siap Dimasuki Foto Asli 🖼️
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="aspect-video bg-gradient-to-br from-cyan-100 to-sky-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-sky-300">
              <span className="text-4xl mb-2">🏊‍♂️</span>
              <span className="text-xs font-bold text-sky-900">Momen Latihan Renang</span>
              <span className="text-[11px] text-sky-700">Foto Mas Bumi saat berenang</span>
            </div>

            <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-indigo-300">
              <span className="text-4xl mb-2">🎒</span>
              <span className="text-xs font-bold text-indigo-900">Kegiatan di MIM Basin</span>
              <span className="text-[11px] text-indigo-700">Foto bersama teman & sekolah</span>
            </div>

            <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-amber-300">
              <span className="text-4xl mb-2">🏅</span>
              <span className="text-xs font-bold text-amber-900">Prestasi & Olahraga</span>
              <span className="text-[11px] text-amber-700">Foto piala, sertifikat, atau aktivitas</span>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-sky-100 mt-16 py-8 text-slate-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Kun Bumi Pamungkas</span>
            <span>•</span>
            <span>Klaten, Jawa Tengah</span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://pamungkas.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-cyan-700 hover:text-cyan-900 font-semibold flex items-center gap-1"
            >
              <span>pamungkas.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span>Domain: bumi.pamungkas.org</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
