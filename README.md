# bumi.pamungkas.org — Web Pribadi Mas Bumi 🏊‍♂️

Website resmi untuk **Kun Bumi Pamungkas (Mas Bumi)** — Pelajar di MIM Basin Klaten, siswa Kumon, dan pecinta olahraga renang.

---

## 🌟 Fitur Utama
- **Profil Lengkap:** Mengenal Mas Bumi, tanggal lahir (5 Juni 2014), asal Klaten.
- **Hobi & Olahraga:** Fokus renang gaya bebas, dada, dan punggung.
- **Stopwatch Renang Interaktif:** Timer digital interaktif dengan pencatat putaran (laps) untuk sesi latihan renang.
- **Sekolah & Aktivitas:** MIM Basin Klaten dan pembelajaran harian Kumon.
- **Target & Misi:** Checklist target seru umur 12 tahun.
- **Keluarga:** Terhubung dengan keluarga besar di [pamungkas.org](https://pamungkas.org).

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Deployment:** Cloudflare Pages

---

## 💻 Cara Menjalankan di Lokal (Local Development)

```bash
# Masuk ke direktori
cd bumi.pamungkas.org

# Install dependencies
npm install

# Jalankan server lokal
npm run dev
```

Buka [http://localhost:3003](http://localhost:3003) di browser.

---

## 🚀 Panduan Deploy di Cloudflare Pages

1. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Pilih **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Pilih repository `satriyop/bumi.pamungkas.org`.
4. Konfigurasi build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Klik **Save and Deploy**.
6. Masuk ke tab **Custom domains**, lalu tambahkan: `bumi.pamungkas.org`.
