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
  RotateCw,
  Target,
  Map as MapIcon,
  MapPin,
  X
} from 'lucide-react';

interface ZeldaAdventureArenaProps {
  isDarkMode?: boolean;
  playSound?: (type: 'swim' | 'coin' | 'hit' | 'tech') => void;
}

// Procedural Canvas Texture Generators for AAA WebGL Visuals (0ms Network Load)
function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 0, 256, 256);
    // Blades of grass
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const len = 3 + Math.random() * 6;
      const g = Math.floor(140 + Math.random() * 85);
      ctx.strokeStyle = `rgb(28, ${g}, 60)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 4, y - len);
      ctx.stroke();
    }
    // Wildflower dots
    for (let f = 0; f < 25; f++) {
      const fx = Math.random() * 256;
      const fy = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.4 ? '#fef08a' : '#ffffff';
      ctx.beginPath();
      ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  return tex;
}

function createSheikahRuneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#09131d';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 8;
    for (let i = 0; i < 8; i++) {
      const y = 32 * i + 16;
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(80, y);
      ctx.lineTo(120, y + 14);
      ctx.lineTo(240, y + 14);
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(80, y, 3.5, 0, Math.PI * 2);
      ctx.arc(200, y + 14, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 4);
  return tex;
}

function createLinkFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(0, 0, 128, 128);

    // Left eye (Anime / Hylian style)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(38, 56, 11, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(40, 57, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(40, 57, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(38, 53, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(90, 56, 11, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(88, 57, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(88, 57, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(86, 53, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(26, 40);
    ctx.quadraticCurveTo(38, 34, 50, 40);
    ctx.moveTo(78, 40);
    ctx.quadraticCurveTo(90, 34, 102, 40);
    ctx.stroke();

    // Confident smile
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(64, 86, 10, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

function createHylianShieldTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 256, 320);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 244, 308);

    // Golden Triforce
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(128, 48);
    ctx.lineTo(98, 92);
    ctx.lineTo(158, 92);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(98, 92);
    ctx.lineTo(68, 136);
    ctx.lineTo(128, 136);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(158, 92);
    ctx.lineTo(128, 136);
    ctx.lineTo(188, 136);
    ctx.closePath();
    ctx.fill();

    // Red Loftwing Crest
    ctx.fillStyle = '#dc2626';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(128, 165);
    ctx.quadraticCurveTo(55, 155, 40, 210);
    ctx.quadraticCurveTo(90, 220, 128, 260);
    ctx.quadraticCurveTo(166, 220, 216, 210);
    ctx.quadraticCurveTo(201, 155, 128, 165);
    ctx.closePath();
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

// Procedural Canvas Sky Dome Gradient (Hyrule Blue to Warm Atmospheric Horizon)
function createSkyDomeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#1e3a8a');    // Deep royal azure zenith
    grad.addColorStop(0.35, '#0284c7'); // Hylian sky cyan
    grad.addColorStop(0.7, '#38bdf8');  // Soft horizon cyan
    grad.addColorStop(0.9, '#bae6fd');  // Atmospheric haze
    grad.addColorStop(1.0, '#fef08a');  // Warm golden sun glow
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 512);
  }
  return new THREE.CanvasTexture(canvas);
}

// Procedural Canvas Radiant Sun Billboard with Golden Corona Glow
function createSunTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(254, 240, 138, 0.95)');
    grad.addColorStop(0.55, 'rgba(251, 191, 36, 0.45)');
    grad.addColorStop(1, 'rgba(251, 146, 60, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  return new THREE.CanvasTexture(canvas);
}

// Procedural 3D Cumulus Cloud Cluster (Zelda Stylized Puffy Clouds)
function createCloudCluster(): THREE.Group {
  const group = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.95,
    metalness: 0.02,
    transparent: true,
    opacity: 0.92
  });
  const puffGeo = new THREE.DodecahedronGeometry(1, 1);
  const puffs = [
    { x: 0, y: 0, z: 0, sx: 7, sy: 3.8, sz: 6 },
    { x: 4.5, y: -0.6, z: 1.2, sx: 5.2, sy: 3.2, sz: 4.5 },
    { x: -4.5, y: -0.8, z: -1.2, sx: 5.5, sy: 3.4, sz: 4.8 },
    { x: 2.2, y: 1.6, z: -0.6, sx: 4.4, sy: 3.0, sz: 4.0 },
    { x: -2.8, y: 1.4, z: 0.8, sx: 4.6, sy: 3.2, sz: 4.2 },
    { x: 6.8, y: -1.2, z: 0.6, sx: 3.6, sy: 2.4, sz: 3.2 }
  ];
  puffs.forEach(p => {
    const puff = new THREE.Mesh(puffGeo, cloudMat);
    puff.position.set(p.x, p.y, p.z);
    puff.scale.set(p.sx, p.sy, p.sz);
    group.add(puff);
  });
  return group;
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

export type TraditionalWeapon = 'master_sword' | 'keris_mataram' | 'mandau_dayak' | 'celurit_madura' | 'badik_bugis';

export interface WeaponInfo {
  id: TraditionalWeapon;
  name: string;
  tribe: string;
  region: string;
  icon: string;
  damage: number;
  description: string;
  color: string;
  sparkleColor: string;
}

export const NUSANTARA_WEAPONS: Record<TraditionalWeapon, WeaponInfo> = {
  master_sword: {
    id: 'master_sword',
    name: 'Master Sword',
    tribe: 'Wangsa Hyrule',
    region: 'Kuil Waktu (Central Plains)',
    icon: '🗡️',
    damage: 25,
    description: 'Pedang legendaris penyegel kegelapan. Bersinar saat dekat Malice (Dmg: 55).',
    color: '#38bdf8',
    sparkleColor: '#00f0ff'
  },
  keris_mataram: {
    id: 'keris_mataram',
    name: 'Keris Kyai Surya Luk 7',
    tribe: 'Wangsa Mataram Kuno',
    region: 'Lembah Candi Mataram (Jawa)',
    icon: '⚡',
    damage: 42,
    description: 'Keris pusaka pamor emas berlekuk 7 sakral. Menyalurkan percikan petir spiritual.',
    color: '#fbbf24',
    sparkleColor: '#f59e0b'
  },
  mandau_dayak: {
    id: 'mandau_dayak',
    name: 'Mandau Taring Rimba',
    tribe: 'Suku Dayak Penjaga Rimba',
    region: 'Tebing Karst & Hutan Rimba (Kalimantan)',
    icon: '🦅',
    damage: 48,
    description: 'Pedang pusaka berukir bulu Enggang & gagang tanduk rusa. Tebasan rimba mematikan.',
    color: '#22c55e',
    sparkleColor: '#4ade80'
  },
  celurit_madura: {
    id: 'celurit_madura',
    name: 'Celurit Sakera Bulan Sabit',
    tribe: 'Suku Ksatria Savana Madura',
    region: 'Savana Merah Cadas (Madura)',
    icon: '🌙',
    damage: 52,
    description: 'Bilah lengkung baja tempa legendaris. Sangat efektif memutus kaki Guardian (+15 crit)!',
    color: '#ef4444',
    sparkleColor: '#f87171'
  },
  badik_bugis: {
    id: 'badik_bugis',
    name: 'Badik Gecong Naga Laut',
    tribe: 'Suku Bahari Bajo-Bugis',
    region: 'Danau Klaten & Pesisir Phinisi (Sulawesi)',
    icon: '🌊',
    damage: 36,
    description: 'Senjata tikam lincah pelaut ulung Phinisi. Serangan ekstra cepat & gesit!',
    color: '#a855f7',
    sparkleColor: '#c084fc'
  }
};

export interface TribalNpc {
  id: string;
  name: string;
  title: string;
  tribe: string;
  x: number;
  z: number;
  color: string;
  icon: string;
  weaponTaught: string;
  greeting: string;
  dialogue: string;
  giftType: 'rupees' | 'arrows' | 'meat' | 'apples' | 'heal';
  giftAmount: number;
  giftText: string;
}

export const NUSANTARA_NPCS: TribalNpc[] = [
  {
    id: 'empu_supo',
    name: 'Empu Supo',
    title: 'Begawan Keris Mataram Kuno',
    tribe: 'Wangsa Mataram Kuno',
    x: 70,
    z: -68,
    color: '#fbbf24',
    icon: '⚡',
    weaponTaught: 'Keris Kyai Surya Luk 7',
    greeting: 'Sugeng rawuh, Mas Bumi sang Ksatria Agung!',
    dialogue: 'Keris Kyai Surya Luk 7 kutempa dengan bilah lekuk 7 berpamor emas sakral. Percikan petir spiritualnya mampu menembus perisai dan merontokkan kegelapan musuh!',
    giftType: 'rupees',
    giftAmount: 50,
    giftText: '+50 Rupee Emas Mataram'
  },
  {
    id: 'panglima_burung',
    name: 'Panglima Burung',
    title: 'Ksatria Agung Penjaga Rimba',
    tribe: 'Suku Dayak',
    x: -42,
    z: -52,
    color: '#22c55e',
    icon: '🦅',
    weaponTaught: 'Mandau Taring Rimba',
    greeting: 'Adil Ka\' Talino, Bacuramin Ka\' Saruga! Selamat datang di Rimba, Mas Bumi!',
    dialogue: 'Mandau Taring Rimba ini bersemayam roh pelindung rimba Kalimantan. Ayunkan tebasannya dengan ketegasan elang Enggang untuk membelah pertahanan lawan!',
    giftType: 'arrows',
    giftAmount: 15,
    giftText: '+15 Anak Panah Rotan Rimba'
  },
  {
    id: 'pak_sakera',
    name: 'Pak Sakera',
    title: 'Pendekar Ksatria Madura',
    tribe: 'Suku Ksatria Madura',
    x: 42,
    z: -17,
    color: '#ef4444',
    icon: '🌙',
    weaponTaught: 'Celurit Sakera Bulan Sabit',
    greeting: 'Salam settong dhere! Berani sekali kau menjelajah savana ini, Mas Bumi!',
    dialogue: 'Bilah Celurit Bulan Sabit ini kutempa dari baja pilihan. Jika kau berhadapan dengan robot Guardian Stalker, gunakan sabit ini untuk mengait dan memutus kaki-kaki bajanya!',
    giftType: 'meat',
    giftAmount: 3,
    giftText: '+3 Daging Segar Karapan'
  },
  {
    id: 'daeng_matowa',
    name: 'Daeng Matowa',
    title: 'Nahkoda Ulung Phinisi',
    tribe: 'Suku Bahari Bugis-Bajo',
    x: -44,
    z: 39,
    color: '#38bdf8',
    icon: '🌊',
    weaponTaught: 'Badik Gecong Naga Laut',
    greeting: 'Kurru sumange! Selamat berlabuh di Danau Klaten, Kapten Mas Bumi!',
    dialogue: 'Pelaut Bugis menaklukkan samudra dengan perahu Phinisi dan Badik Gecong. Senjata tikam ini sangat ringan dan cepat, memungkinkanmu menusuk secepat deburan ombak laut!',
    giftType: 'apples',
    giftAmount: 5,
    giftText: '+5 Buah Apel Manis Pesisir'
  },
  {
    id: 'tuha_balugu',
    name: 'Tuha Balugu',
    title: 'Ksatria Megalitikum Nias',
    tribe: 'Suku Megalitikum Nias',
    x: 62,
    z: -44,
    color: '#eab308',
    icon: '🗿',
    weaponTaught: 'Tradisi Lompat Batu Hombo',
    greeting: 'Ya’ahowu! Gagah perkasa dirimu melangkah di tanah batu leluhur kami, Mas Bumi!',
    dialogue: 'Batu Hombo setinggi 2.2 meter adalah ujian kehormatan ksatria sejati. Berlarilah kencang dan lompati batu keramat ini ke langit Hyrule tanpa rasa gentar!',
    giftType: 'heal',
    giftAmount: 20,
    giftText: 'Pemulihan Hati & Stamina Penuh (Berkah Leluhur)'
  }
];

function createNameplateSprite(name: string, title: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 512, 140);

    // Background pill shape
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 108, 28);
    ctx.fill();

    // Border glow
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Star icon
    ctx.fillStyle = color;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐', 64, 78);

    // Character Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(name, 104, 64);

    // Subtitle / Tribe Title
    ctx.fillStyle = color;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(title, 104, 100);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.2, 0.88, 1);
  return sprite;
}

export interface TribalCodexData {
  id: string;
  regionName: string;
  island: string;
  tribe: string;
  hero: string;
  weapon: string;
  traditionalHouse: string;
  cultureTradition: string;
  philosophy: string;
  funFact: string;
  color: string;
  icon: string;
  mapPos: { x: number; z: number };
}

export const NUSANTARA_CODEX: Record<string, TribalCodexData> = {
  mataram: {
    id: 'mataram',
    regionName: 'Lembah Mataram Kuno',
    island: 'Pulau Jawa (Jawa Tengah & DI Yogyakarta)',
    tribe: 'Wangsa Mataram Kuno',
    hero: 'Empu Supo',
    weapon: 'Keris Kyai Surya Luk 7 (Pusaka Pamor Emas)',
    traditionalHouse: 'Rumah Joglo & Candi Batu Bertingkat',
    cultureTradition: 'Penempaan Pusaka Keris Berdoa & Seni Gamelan Ageng',
    philosophy: 'Memayu Hayuning Bawana (Menjaga keselarasan dan kedamaian alam semesta)',
    funFact: 'Keris diakui UNESCO sebagai Warisan Kemanusiaan Non-Bendawi Dunia asli Indonesia sejak 2005.',
    color: '#fbbf24',
    icon: '⚡',
    mapPos: { x: 70, z: -68 }
  },
  dayak: {
    id: 'dayak',
    regionName: 'Tebing Karst & Hutan Rimba Belian',
    island: 'Pulau Kalimantan (Borneo)',
    tribe: 'Suku Dayak Penjaga Rimba',
    hero: 'Panglima Burung',
    weapon: 'Mandau Taring Rimba & Sumpit Sipet Beracun',
    traditionalHouse: 'Rumah Betang (Rumah Panggung Panjang Kayu Ulin)',
    cultureTradition: 'Upacara Adat Belian & Tari Perang Kancet Papatai',
    philosophy: 'Adil Ka\' Talino, Bacuramin Ka\' Saruga, Basengat Ka\' Jubata (Adil pada sesama, bercermin ke surga, bernapas pada Tuhan)',
    funFact: 'Kayu Ulin yang digunakan untuk tiang Totem Belian dan rumah Dayak adalah kayu besi yang semakin keras jika terendam air!',
    color: '#22c55e',
    icon: '🦅',
    mapPos: { x: -42, z: -52 }
  },
  madura: {
    id: 'madura',
    regionName: 'Savana Merah Karapan Sakera',
    island: 'Pulau Madura (Jawa Timur)',
    tribe: 'Suku Ksatria Madura',
    hero: 'Pak Sakera',
    weapon: 'Celurit Sakera Bulan Sabit',
    traditionalHouse: 'Rumah Adat Tanean Lanjhan (Deretan Halaman Bersama)',
    cultureTradition: 'Karapan Sapi Ksatria & Seni Bela Diri Pencak Silat',
    philosophy: 'Rampak Naong Bringin Korong (Rukun, damai, dan saling mengayomi)',
    funFact: 'Celurit memiliki bilah berbentuk lengkung bulan sabit yang didesain aerodinamis untuk tebasan cepat dan tangguh.',
    color: '#ef4444',
    icon: '🌙',
    mapPos: { x: 42, z: -17 }
  },
  bugis: {
    id: 'bugis',
    regionName: 'Pesisir Phinisi & Danau Klaten',
    island: 'Pulau Sulawesi (Sulawesi Selatan)',
    tribe: 'Suku Bahari Bajo-Bugis',
    hero: 'Daeng Matowa',
    weapon: 'Badik Gecong Naga Laut (Senjata Tikam Kilat)',
    traditionalHouse: 'Rumah Adat Bola Saoraja & Perahu Layar Phinisi',
    cultureTradition: 'Pelayaran Mengarungi Samudra Nusantara dengan Phinisi & Tari Paduppa',
    philosophy: 'Siri\' Na Pacce (Menjunjung tinggi kehormatan, harga diri, dan solidaritas persaudaraan)',
    funFact: 'Kapal Phinisi dibuat oleh tangan-tangan ahli Bugis tanpa menggunakan paku besi sebatang pun dan telah mengarungi samudra sampai ke Madagaskar!',
    color: '#38bdf8',
    icon: '🌊',
    mapPos: { x: -44, z: 39 }
  },
  nias: {
    id: 'nias',
    regionName: 'Perbukitan Megalitikum Nias',
    island: 'Kepulauan Nias (Sumatera Utara)',
    tribe: 'Suku Megalitikum Nias (Ono Niha)',
    hero: 'Tuha Balugu',
    weapon: 'Pedang Balatu & Zirah Pelindung Baru Oholu',
    traditionalHouse: 'Omo Sebua (Rumah Panggung Megalitikum Tahan Gempa)',
    cultureTradition: 'Tradisi Fahombo (Melompati Tugu Batu Hombo setinggi 2 meter)',
    philosophy: 'Yaa’ahowu (Semoga selalu dalam lindungan dan keberkahan kedamaian)',
    funFact: 'Tradisi Fahombo melompati batu setinggi 2.2 meter adalah ujian kesiapan para pemuda Nias menjadi ksatria pembela desa.',
    color: '#eab308',
    icon: '🗿',
    mapPos: { x: 62, z: -44 }
  }
};

export const ZeldaAdventureArena: React.FC<ZeldaAdventureArenaProps> = ({ isDarkMode = true, playSound }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'victory'>('intro');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Traditional Nusantara Weapons State
  const [activeWeapon, setActiveWeapon] = useState<TraditionalWeapon>('master_sword');
  const activeWeaponRef = useRef<TraditionalWeapon>('master_sword');
  const weaponMeshesRef = useRef<{ [key in TraditionalWeapon]?: THREE.Group }>({});

  // Traditional Nusantara Heroes & Dialogue State
  const [tribalDialogNpc, setTribalDialogNpc] = useState<TribalNpc | null>(null);
  const [claimedGifts, setClaimedGifts] = useState<{ [npcId: string]: boolean }>({});
  const nearNpcRef = useRef<TribalNpc | null>(null);

  // Sheikah Slate World Map & Nusantara Codex Modal State
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedMapRegionId, setSelectedMapRegionId] = useState<string>('mataram');

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

  // Master Sword Awakening & Guardian Parry Mechanics
  const [isSwordAwakened, setIsSwordAwakened] = useState(false);
  const [noiseDisplay, setNoiseDisplay] = useState(1);
  const guardianChargeTimerRef = useRef(0);
  const guardianPlasmaRef = useRef<{ 
    active: boolean; 
    mesh: THREE.Group; 
    vx: number; 
    vy: number; 
    vz: number; 
    isReflected: boolean; 
    life: number 
  } | null>(null);
  const parryFlashTimerRef = useRef(0);
  const treeFoliageRefs = useRef<THREE.Mesh[]>([]);

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

  // Z-Targeting Lock-On State
  const targetLockRef = useRef<'bokoblin' | 'guardian' | null>(null);
  const [targetLocked, setTargetLocked] = useState(false);

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
    isTargetLocked: false,
    lockedTargetName: null as string | null,
    currentZone: 'Dataran Kuil Kuno',
    nearNpc: null as TribalNpc | null,
    message: null as string | null,
    playerX: 0,
    playerZ: 0,
    playerRotY: 0
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
    'guardian_panic' | 'surf_slide' | 'thunder' | 'target_lock' | 'target_unlock' | 'jump' | 'splash'
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
      } else if (type === 'target_lock') {
        [880, 1320].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.24, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.2);
        });
      } else if (type === 'target_unlock') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1040, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'jump') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.linearRampToValueAtTime(480, now + 0.15);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'splash') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(85, now + 0.18);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
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
    targetLockRef.current = null;
    setTargetLocked(false);
    setGameState('playing');
    playZeldaSfx('secret_chime');
  };

  // Player Actions: Jump & Target Lock
  const handleJump = () => {
    const p = playerStatsRef.current;
    if (p.isClimbing) {
      p.isClimbing = false;
      p.vy = 8.5;
      p.vx = -Math.sin(p.rotY) * 0.45;
      p.vz = -Math.cos(p.rotY) * 0.45;
      playZeldaSfx('jump');
      setHudStats(prev => ({ ...prev, message: '🦘 Melompat dari Tebing!' }));
    } else {
      const groundY = getTerrainHeight(p.x, p.z);
      if (Math.abs(p.y - groundY) < 0.45) {
        // Authentic Zelda Backflip if target locked and moving backward
        if (targetLockRef.current && (keysRef.current['s'] || keysRef.current['S'] || keysRef.current['KeyS'] || keysRef.current['ArrowDown'] || touchDpadRef.current.dy > 0)) {
          p.vy = 11;
          p.vx = -Math.sin(p.rotY) * 0.65;
          p.vz = -Math.cos(p.rotY) * 0.65;
          playZeldaSfx('jump');
          setHudStats(prev => ({ ...prev, message: '🤸 Salto Mundur (Backflip)!' }));
        } else {
          p.vy = 10;
          playZeldaSfx('jump');
          setHudStats(prev => ({ ...prev, message: '🦘 Melompat!' }));
        }
      } else if (p.y - groundY > 1.2 && !p.isGliding) {
        toggleParaglider();
      }
    }
  };

  const toggleTargetLock = () => {
    const p = playerStatsRef.current;
    if (targetLockRef.current !== null) {
      targetLockRef.current = null;
      setTargetLocked(false);
      playZeldaSfx('target_unlock');
      setHudStats(prev => ({ ...prev, isTargetLocked: false, lockedTargetName: null, message: '🔓 Kunci target dilepas' }));
    } else {
      const bDist = Math.hypot(p.x - bokoStatsRef.current.x, p.z - bokoStatsRef.current.z);
      const gDist = Math.hypot(p.x - 75, p.z - (-75));

      if (bokoStatsRef.current.hp > 0 && bDist < 35) {
        targetLockRef.current = 'bokoblin';
        setTargetLocked(true);
        playZeldaSfx('target_lock');
        setHudStats(prev => ({ ...prev, isTargetLocked: true, lockedTargetName: 'Bokoblin Merah', message: '🎯 KUNCI TARGET: Bokoblin Merah!' }));
      } else if (gDist < 80) {
        targetLockRef.current = 'guardian';
        setTargetLocked(true);
        playZeldaSfx('target_lock');
        setHudStats(prev => ({ ...prev, isTargetLocked: true, lockedTargetName: 'Guardian Stalker', message: '🎯 KUNCI TARGET: Ancient Guardian Stalker!' }));
      } else {
        setHudStats(prev => ({ ...prev, message: 'Tidak ada musuh dalam jangkauan untuk dikunci.' }));
      }
    }
  };

  // Time of Day Fast-Switch
  const setDayPhase = (phase: 'Pagi' | 'Siang' | 'Senja' | 'Malam') => {
    setCurrentTimePhase(phase);
    if (phase === 'Siang') {
      timeOfDayRef.current = 0.35;
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color('#38bdf8');
        sceneRef.current.fog = new THREE.FogExp2('#38bdf8', 0.007);
      }
    } else if (phase === 'Senja') {
      timeOfDayRef.current = 0.68;
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color('#ea580c');
        sceneRef.current.fog = new THREE.FogExp2('#ea580c', 0.009);
      }
    } else if (phase === 'Malam') {
      timeOfDayRef.current = 0.88;
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color('#0f172a');
        sceneRef.current.fog = new THREE.FogExp2('#0f172a', 0.012);
      }
    } else {
      timeOfDayRef.current = 0.15;
    }
  };

  // Equip Traditional Weapon
  const equipWeapon = (weapon: TraditionalWeapon) => {
    setActiveWeapon(weapon);
    activeWeaponRef.current = weapon;
    
    // Toggle 3D mesh visibility
    const meshes = weaponMeshesRef.current;
    if (meshes) {
      (Object.keys(meshes) as TraditionalWeapon[]).forEach(k => {
        if (meshes[k]) {
          meshes[k]!.visible = (k === weapon);
        }
      });
    }

    const wInfo = NUSANTARA_WEAPONS[weapon];
    playZeldaSfx('slash');
    setHudStats(prev => ({
      ...prev,
      message: `⚔️ PUSAKA DIPASANG: ${wInfo.name} (${wInfo.tribe}) | Dmg: ${wInfo.damage}`
    }));
  };

  // Talk to Tribal NPC & Claim Friendship Gift
  const handleTalkToNpc = (npc: TribalNpc) => {
    setTribalDialogNpc(npc);
    playZeldaSfx('secret_chime');
  };

  const handleClaimGift = (npc: TribalNpc) => {
    if (claimedGifts[npc.id]) return;
    const p = playerStatsRef.current;
    if (npc.giftType === 'rupees') {
      p.rupees += npc.giftAmount;
      playZeldaSfx('rupee_get');
    } else if (npc.giftType === 'arrows') {
      p.arrows += npc.giftAmount;
      playZeldaSfx('rupee_get');
    } else if (npc.giftType === 'meat') {
      p.meat += npc.giftAmount;
      playZeldaSfx('cook_success');
    } else if (npc.giftType === 'apples') {
      p.apples += npc.giftAmount;
      playZeldaSfx('cook_success');
    } else if (npc.giftType === 'heal') {
      p.hearts = p.maxHearts;
      p.stamina = p.maxStamina;
      playZeldaSfx('fairy_heal');
    }

    setClaimedGifts(prev => ({ ...prev, [npc.id]: true }));
    setHudStats(prev => ({
      ...prev,
      rupees: p.rupees,
      arrows: p.arrows,
      meat: p.meat,
      apples: p.apples,
      hearts: p.hearts,
      stamina: Math.round(p.stamina),
      message: `🎁 Menerima ${npc.giftText} dari ${npc.name}!`
    }));
  };

  // Sheikah Fast-Travel / Teleportation
  const handleTeleportTo = (x: number, z: number, regionName: string) => {
    const p = playerStatsRef.current;
    p.x = x;
    p.z = z;
    p.vx = 0;
    p.vy = 0;
    p.vz = 0;
    p.y = getTerrainHeight(x, z);
    setIsMapOpen(false);
    playZeldaSfx('fairy_heal');
    setHudStats(prev => ({
      ...prev,
      playerX: x,
      playerZ: z,
      message: `⚡ TELEPORTASI SHEIKAH: Tiba di ${regionName}!`
    }));
  };

  // Player Actions
  const handleAttack = () => {
    const p = playerStatsRef.current;
    if (p.isAttacking || p.isDashing || p.isGliding || p.isClimbing) return;
    const weapon = activeWeaponRef.current;
    p.isAttacking = true;
    p.attackTimer = (weapon === 'badik_bugis') ? 11 : 16;
    playZeldaSfx('slash');

    let swordDmg = NUSANTARA_WEAPONS[weapon].damage;
    if (weapon === 'master_sword' && isSwordAwakened) {
      swordDmg = 55;
    }

    // Check hit on Bokoblin
    const b = bokoStatsRef.current;
    if (b.hp > 0) {
      const distToBoko = Math.hypot(p.x - b.x, p.z - b.z);
      if (distToBoko < 3.4) {
        b.hp = Math.max(0, b.hp - swordDmg);
        playZeldaSfx('hit');
        // Knockback Bokoblin
        const ang = Math.atan2(b.x - p.x, b.z - p.z);
        b.x += Math.sin(ang) * 2;
        b.z += Math.cos(ang) * 2;
        if (b.hp <= 0) {
          p.rupees += 20;
          p.meat += 1;
          playZeldaSfx('rupee_get');
          setHudStats(prev => ({ ...prev, message: `🎉 BOKOBLIN KALAH DITEBAS ${NUSANTARA_WEAPONS[weapon].name.toUpperCase()}! (+20 Rupee)` }));
        }
      }
    }

    // Check melee strike on Guardian Stalker
    const distToG = Math.hypot(p.x - 75, p.z - (-75));
    if (distToG < 6.5) {
      const legIdx = guardianLegsHpRef.current.findIndex(hp => hp > 0);
      if (legIdx !== -1) {
        const guardianDmg = weapon === 'celurit_madura' ? (swordDmg + 15) : swordDmg;
        guardianLegsHpRef.current[legIdx] = Math.max(0, guardianLegsHpRef.current[legIdx] - guardianDmg);
        playZeldaSfx('hit');
        if (guardianLegsHpRef.current[legIdx] <= 0) {
          playZeldaSfx('bomb_explode');
          p.rupees += 30;
          setHudStats(prev => ({ ...prev, message: `⚔️ KAKI GUARDIAN PUTUS DITEBAS ${NUSANTARA_WEAPONS[weapon].name.toUpperCase()}! (+30 Rupee)` }));
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

    const weapon = activeWeaponRef.current;
    const spinDmg = NUSANTARA_WEAPONS[weapon].damage + 20;

    const b = bokoStatsRef.current;
    if (b.hp > 0 && Math.hypot(p.x - b.x, p.z - b.z) < 4.5) {
      b.hp = Math.max(0, b.hp - spinDmg);
      playZeldaSfx('hit');
      if (b.hp <= 0) {
        p.rupees += 20;
        p.meat += 1;
        playZeldaSfx('rupee_get');
        setHudStats(prev => ({ ...prev, message: `🌪️ PUTARAN MAUT ${NUSANTARA_WEAPONS[weapon].name.toUpperCase()} MENGALAHKAN BOKOBLIN! (+20 Rupee)` }));
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

    // 4b. Procedural Hyrule Sky Dome & Radiant Sun Billboard
    const skyGeo = new THREE.SphereGeometry(340, 32, 16);
    const skyTex = createSkyDomeTexture();
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, depthWrite: false });
    const skyDomeMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyDomeMesh);

    const sunBillboardTex = createSunTexture();
    const sunBillboardGeo = new THREE.PlaneGeometry(54, 54);
    const sunBillboardMat = new THREE.MeshBasicMaterial({
      map: sunBillboardTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sunBillboardMesh = new THREE.Mesh(sunBillboardGeo, sunBillboardMat);
    sunBillboardMesh.position.set(75, 145, 65);
    sunBillboardMesh.lookAt(0, 0, 0);
    scene.add(sunBillboardMesh);

    // 4c. 12 3D Cumulus Clouds Drifting Across Hyrule
    const cloudsList: THREE.Group[] = [];
    for (let c = 0; c < 12; c++) {
      const cloud = createCloudCluster();
      cloud.position.set(
        (Math.random() - 0.5) * 320,
        38 + Math.random() * 26,
        (Math.random() - 0.5) * 320
      );
      scene.add(cloud);
      cloudsList.push(cloud);
    }

    // 4d. 120 Floating Spora Emas & Kunang-kunang Malam (Sunset Fireflies)
    const sporeCount = 120;
    const sporeGeo = new THREE.BufferGeometry();
    const sporePositions = new Float32Array(sporeCount * 3);
    for (let s = 0; s < sporeCount * 3; s += 3) {
      sporePositions[s] = (Math.random() - 0.5) * 180;
      sporePositions[s + 1] = 1 + Math.random() * 14;
      sporePositions[s + 2] = (Math.random() - 0.5) * 180;
    }
    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePositions, 3));
    const sporeMat = new THREE.PointsMaterial({
      color: '#fef08a',
      size: 0.55,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const sporeParticles = new THREE.Points(sporeGeo, sporeMat);
    scene.add(sporeParticles);

    // 5. 3D Procedural Terrain & Canvas Textures
    const grassTex = createGrassTexture();
    const sheikahRuneTex = createSheikahRuneTexture();
    const faceTex = createLinkFaceTexture();
    const shieldTex = createHylianShieldTexture();

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
        colors.push(0.9, 0.85, 0.65);
      } else if (vx > 30 && vz > 30) {
        colors.push(0.72, 0.42, 0.28);
      } else if (Math.hypot(vx - 75, vz - (-75)) < 25) {
        colors.push(0.16, 0.2, 0.28);
      } else {
        const g = 0.62 + Math.sin(vx * 0.1) * 0.08;
        colors.push(0.25, g, 0.28);
      }
    }
    terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.05
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
    const waterGeo = new THREE.CircleGeometry(42, 48);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.1,
      metalness: 0.35,
      transparent: true,
      opacity: 0.8
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(-50, -1.2, 50);
    scene.add(waterMesh);

    // Lake Shoreline Foam Ring
    const foamGeo = new THREE.RingGeometry(40.5, 42.5, 48);
    foamGeo.rotateX(-Math.PI / 2);
    const foamMat = new THREE.MeshBasicMaterial({
      color: '#ecfeff',
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const foamMesh = new THREE.Mesh(foamGeo, foamMat);
    foamMesh.position.set(-50, -1.18, 50);
    scene.add(foamMesh);

    // 9. 3D Ancient Shrine (Reruntuhan Kuil Kuno)
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(75, 5.5, -75);

    const pillarMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 });
    const runeMat = new THREE.MeshStandardMaterial({
      map: sheikahRuneTex,
      color: '#06b6d4',
      emissive: '#06b6d4',
      emissiveIntensity: 0.9,
      roughness: 0.3
    });

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

    // 3D Sheikah Target Lock Reticle
    const reticleGroup = new THREE.Group();
    const reticleMat = new THREE.MeshStandardMaterial({
      color: '#facc15',
      emissive: '#facc15',
      emissiveIntensity: 1.5,
      roughness: 0.2
    });
    const reticleCone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.65, 3), reticleMat);
    reticleCone.rotateX(Math.PI);
    reticleGroup.add(reticleCone);

    const reticleRing = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 8, 24), reticleMat);
    reticleRing.rotateX(Math.PI / 2);
    reticleGroup.add(reticleRing);

    reticleGroup.visible = false;
    scene.add(reticleGroup);
    const targetReticleMesh = reticleGroup;

    // Particle pool for footstep dust and splashes
    const dustCount = 20;
    const dustGeo = new THREE.DodecahedronGeometry(0.14);
    const dustMat = new THREE.MeshStandardMaterial({
      color: '#d4d4d8',
      transparent: true,
      opacity: 0.7,
      roughness: 0.9
    });
    const dustMeshes: { mesh: THREE.Mesh; vy: number; life: number }[] = [];
    for (let d = 0; d < dustCount; d++) {
      const dm = new THREE.Mesh(dustGeo, dustMat.clone());
      dm.visible = false;
      scene.add(dm);
      dustMeshes.push({ mesh: dm, vy: 0, life: 0 });
    }
    let dustSpawnIndex = 0;
    let stepTimer = 0;

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

    treeFoliageRefs.current = [];
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
      treeFoliageRefs.current.push(foliage);

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

    // 11b. 3D Campfire Smoke Plume Particle Pool
    const smokeCount = 10;
    const smokeGeo = new THREE.DodecahedronGeometry(0.32, 1);
    const smokeMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      transparent: true,
      opacity: 0.35,
      roughness: 0.95
    });
    const smokeParticles: { mesh: THREE.Mesh; vy: number; vx: number; vz: number; life: number; maxLife: number }[] = [];
    for (let sm = 0; sm < smokeCount; sm++) {
      const sMesh = new THREE.Mesh(smokeGeo, smokeMat.clone());
      sMesh.position.set(8, 2.0, 8);
      sMesh.visible = false;
      scene.add(sMesh);
      smokeParticles.push({ mesh: sMesh, vy: 0.04, vx: 0, vz: 0, life: 0, maxLife: 70 });
    }
    let smokeSpawnTimer = 0;

    // 11c. The Iconic Hylian Cucco (Ayam Hylian Legendaris)
    const cuccoGroup = new THREE.Group();
    cuccoGroup.position.set(5.5, getTerrainHeight(5.5, 6), 6);

    const cuccoWhiteMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.6 });
    const cuccoRedMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.4 });
    const cuccoYellowMat = new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.5 });

    const cuccoBody = new THREE.Mesh(new THREE.DodecahedronGeometry(0.34, 1), cuccoWhiteMat);
    cuccoBody.position.y = 0.36;
    cuccoBody.castShadow = true;
    cuccoGroup.add(cuccoBody);

    const cuccoHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), cuccoWhiteMat);
    cuccoHead.position.set(0, 0.56, 0.22);
    cuccoGroup.add(cuccoHead);

    const cuccoComb = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 3), cuccoRedMat);
    cuccoComb.position.set(0, 0.72, 0.2);
    cuccoGroup.add(cuccoComb);

    const cuccoBeak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 4), cuccoYellowMat);
    cuccoBeak.position.set(0, 0.54, 0.36);
    cuccoBeak.rotation.x = Math.PI / 2;
    cuccoGroup.add(cuccoBeak);

    const cuccoWingGeo = new THREE.BoxGeometry(0.05, 0.22, 0.32);
    const cuccoWingL = new THREE.Mesh(cuccoWingGeo, cuccoWhiteMat);
    cuccoWingL.position.set(-0.24, 0.38, 0.02);
    cuccoGroup.add(cuccoWingL);

    const cuccoWingR = new THREE.Mesh(cuccoWingGeo, cuccoWhiteMat);
    cuccoWingR.position.set(0.24, 0.38, 0.02);
    cuccoGroup.add(cuccoWingR);

    const footGeo = new THREE.BoxGeometry(0.08, 0.04, 0.12);
    const footL = new THREE.Mesh(footGeo, cuccoYellowMat);
    footL.position.set(-0.12, 0.04, 0.02);
    cuccoGroup.add(footL);
    const footR = new THREE.Mesh(footGeo, cuccoYellowMat);
    footR.position.set(0.12, 0.04, 0.02);
    cuccoGroup.add(footR);
    scene.add(cuccoGroup);

    // 11d. Fluttering Hylian Butterflies (Summerwing Butterflies)
    const butterflyList: { group: THREE.Group; wingL: THREE.Mesh; wingR: THREE.Mesh; ox: number; oz: number; phase: number }[] = [];
    const bColors = ['#38bdf8', '#f97316', '#a855f7', '#facc15'];
    for (let b = 0; b < 4; b++) {
      const bGroup = new THREE.Group();
      const ox = (b === 0 ? -12 : b === 1 ? 16 : b === 2 ? -40 : 25);
      const oz = (b === 0 ? -10 : b === 1 ? 14 : b === 2 ? 40 : -20);
      bGroup.position.set(ox, getTerrainHeight(ox, oz) + 1.2, oz);

      const bWingMat = new THREE.MeshBasicMaterial({ color: bColors[b], side: THREE.DoubleSide });
      const bWingGeo = new THREE.PlaneGeometry(0.16, 0.14);

      const bWingL = new THREE.Mesh(bWingGeo, bWingMat);
      bWingL.position.x = -0.08;
      bGroup.add(bWingL);

      const bWingR = new THREE.Mesh(bWingGeo, bWingMat);
      bWingR.position.x = 0.08;
      bGroup.add(bWingR);

      scene.add(bGroup);
      butterflyList.push({ group: bGroup, wingL: bWingL, wingR: bWingR, ox, oz, phase: b * 1.5 });
    }

    // 11e. Secret Korok Pinwheel on Mountain Cliff
    const korokPinwheelGroup = new THREE.Group();
    const kpX = 66;
    const kpZ = -66;
    korokPinwheelGroup.position.set(kpX, getTerrainHeight(kpX, kpZ), kpZ);

    const kPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 2.2, 6),
      new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 })
    );
    kPost.position.y = 1.1;
    korokPinwheelGroup.add(kPost);

    const pinwheelCenter = new THREE.Group();
    pinwheelCenter.position.set(0, 2.2, 0.08);

    const bladeGeo = new THREE.ConeGeometry(0.12, 0.35, 3);
    const bladeColors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e'];
    for (let bl = 0; bl < 4; bl++) {
      const blMat = new THREE.MeshBasicMaterial({ color: bladeColors[bl] });
      const bMesh = new THREE.Mesh(bladeGeo, blMat);
      bMesh.rotation.z = (bl / 4) * Math.PI * 2;
      bMesh.position.set(Math.cos(bMesh.rotation.z) * 0.15, Math.sin(bMesh.rotation.z) * 0.15, 0);
      pinwheelCenter.add(bMesh);
    }
    korokPinwheelGroup.add(pinwheelCenter);
    scene.add(korokPinwheelGroup);
    let korokFound = false;

    // 11f. INDONESIAN TRIBAL LANDMARKS
    // A. Dayak Totem Belian & Talawang War Shield (Tebing Karst & Rimba)
    const dayakTotemGroup = new THREE.Group();
    const dtX = -45;
    const dtZ = -55;
    dayakTotemGroup.position.set(dtX, getTerrainHeight(dtX, dtZ), dtZ);

    const ironwoodMat = new THREE.MeshStandardMaterial({ color: '#3b200b', roughness: 0.85 });
    const dayakRedMat = new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.6 });
    const dayakGoldMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.7, roughness: 0.3 });
    const dayakBlackMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.9 });

    // Tall carved Dayak Totem Pole (Kayu Ulin / Belian)
    const totemPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 7.5, 8), ironwoodMat);
    totemPillar.position.y = 3.75;
    totemPillar.castShadow = true;
    dayakTotemGroup.add(totemPillar);

    // Carved masks / faces on totem pole (3 tiers)
    for (let f = 0; f < 3; f++) {
      const faceGroup = new THREE.Group();
      faceGroup.position.set(0, 2.2 + f * 2.0, 0);

      const faceCarving = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 0.85), dayakRedMat);
      faceGroup.add(faceCarving);

      const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.18, 0.5), dayakGoldMat);
      eyes.position.set(0, 0.1, 0.2);
      faceGroup.add(eyes);

      const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.92), dayakBlackMat);
      mouth.position.set(0, -0.18, 0.2);
      faceGroup.add(mouth);

      dayakTotemGroup.add(faceGroup);
    }

    // Burung Enggang (Hornbill) Crown Totem at Top
    const enggangHead = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 5), dayakBlackMat);
    enggangHead.position.set(0, 7.8, 0.2);
    enggangHead.rotation.x = Math.PI / 3;
    dayakTotemGroup.add(enggangHead);

    const enggangBeak = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.1, 4), dayakGoldMat);
    enggangBeak.position.set(0, 8.1, 0.9);
    enggangBeak.rotation.x = Math.PI / 2.2;
    dayakTotemGroup.add(enggangBeak);

    // Talawang Shield (Perisai Perang Dayak) leaning against the base
    const talawangGroup = new THREE.Group();
    talawangGroup.position.set(0.7, 1.3, 0.5);
    talawangGroup.rotation.set(-0.2, 0.3, -0.15);

    const talawangBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.4, 0.08), ironwoodMat);
    talawangGroup.add(talawangBody);

    const talTop = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.7, 4), ironwoodMat);
    talTop.position.y = 1.45;
    talawangGroup.add(talTop);

    const talBottom = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.7, 4), ironwoodMat);
    talBottom.position.y = -1.45;
    talBottom.rotation.z = Math.PI;
    talawangGroup.add(talBottom);

    const talBoss = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.06, 6, 12), dayakGoldMat);
    talBoss.position.set(0, 0, 0.06);
    talawangGroup.add(talBoss);

    const talRedSpur = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 4), dayakRedMat);
    talRedSpur.position.set(0, 0.5, 0.06);
    talawangGroup.add(talRedSpur);

    dayakTotemGroup.add(talawangGroup);
    scene.add(dayakTotemGroup);

    // B. Perahu Sandeq Phinisi Bajo-Bugis (Tepian Danau Klaten)
    const bugisBoatGroup = new THREE.Group();
    bugisBoatGroup.position.set(-48, -0.95, 42);

    const teakMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.7 });
    const bambooMat = new THREE.MeshStandardMaterial({ color: '#fef08a', roughness: 0.5 });
    const sailMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    const flagMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6 });

    // Sleek canoe hull (Badan Sandeq)
    const boatHull = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 6.2), teakMat);
    boatHull.position.y = 0.35;
    bugisBoatGroup.add(boatHull);

    // Sharp curved bow
    const boatBow = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.8, 4), teakMat);
    boatBow.position.set(0, 0.65, 3.8);
    boatBow.rotation.x = Math.PI / 3.5;
    bugisBoatGroup.add(boatBow);

    // Sharp stern
    const boatStern = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 4), teakMat);
    boatStern.position.set(0, 0.55, -3.6);
    boatStern.rotation.x = -Math.PI / 3.8;
    bugisBoatGroup.add(boatStern);

    // Cadik / Outriggers (Bambu Katir kiri & kanan)
    [-1.9, 1.9].forEach(sideX => {
      const cadikFloat = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.2, 8), bambooMat);
      cadikFloat.rotation.x = Math.PI / 2;
      cadikFloat.position.set(sideX, 0.15, 0.2);
      bugisBoatGroup.add(cadikFloat);

      const boomFront = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, Math.abs(sideX), 6), bambooMat);
      boomFront.position.set(sideX * 0.5, 0.45, 1.5);
      boomFront.rotation.z = Math.PI / 2;
      bugisBoatGroup.add(boomFront);

      const boomRear = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, Math.abs(sideX), 6), bambooMat);
      boomRear.position.set(sideX * 0.5, 0.45, -1.5);
      boomRear.rotation.z = Math.PI / 2;
      bugisBoatGroup.add(boomRear);
    });

    // Mast
    const boatMast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 5.5, 6), teakMat);
    boatMast.position.set(0, 2.9, 0.4);
    boatMast.rotation.x = -0.08;
    bugisBoatGroup.add(boatMast);

    // Triangular Somba/Tanja Sail
    const sailShape = new THREE.Shape();
    sailShape.moveTo(0, 0);
    sailShape.lineTo(2.4, 1.6);
    sailShape.lineTo(0.1, 4.4);
    sailShape.closePath();
    const sailGeo = new THREE.ShapeGeometry(sailShape);
    const sailMesh = new THREE.Mesh(sailGeo, sailMat);
    sailMesh.position.set(0.02, 1.0, -0.6);
    sailMesh.rotation.y = Math.PI / 8;
    bugisBoatGroup.add(sailMesh);

    // Red pennant flag
    const boatFlag = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.7, 3), flagMat);
    boatFlag.position.set(0, 5.6, 0.3);
    boatFlag.rotation.z = Math.PI / 2;
    bugisBoatGroup.add(boatFlag);

    scene.add(bugisBoatGroup);

    // C. Kemah & Gapura Ksatria Karapan Madura (Savana Merah)
    const maduraGroup = new THREE.Group();
    const madX = 45;
    const madZ = -20;
    maduraGroup.position.set(madX, getTerrainHeight(madX, madZ), madZ);

    const maduraRedMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6 });
    const maduraWhiteMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: '#3f1f0a', roughness: 0.8 });
    const gongBronzeMat = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.85, roughness: 0.25 });

    // Traditional Gapura Pillars
    [-2.2, 2.2].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.2, 0.45), darkWoodMat);
      pillar.position.set(px, 2.1, 0);
      pillar.castShadow = true;
      maduraGroup.add(pillar);

      const bracket = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 4), maduraRedMat);
      bracket.position.set(px, 4.2, 0);
      maduraGroup.add(bracket);
    });

    // Gapura Arch / Crossbeam
    const archBeam = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.45, 0.45), darkWoodMat);
    archBeam.position.set(0, 4.3, 0);
    maduraGroup.add(archBeam);

    const archCrown = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 4), maduraRedMat);
    archCrown.position.set(0, 4.9, 0);
    maduraGroup.add(archCrown);

    // Striped Sakera Banners (Merah-Putih)
    [-3.0, 3.0].forEach(bx => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 5.5, 6), bambooMat);
      pole.position.set(bx, 2.75, 0.5);
      maduraGroup.add(pole);

      for (let s = 0; s < 4; s++) {
        const stripeMat = (s % 2 === 0) ? maduraRedMat : maduraWhiteMat;
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.4, 0.03), stripeMat);
        stripe.position.set(bx + 0.45, 4.8 - s * 0.42, 0.5);
        maduraGroup.add(stripe);
      }
    });

    // Ceremonial Gong Karapan Sapi
    const gongPillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), darkWoodMat);
    gongPillarL.position.set(-0.9, 1.1, -1.8);
    maduraGroup.add(gongPillarL);

    const gongPillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), darkWoodMat);
    gongPillarR.position.set(0.9, 1.1, -1.8);
    maduraGroup.add(gongPillarR);

    const gongBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 6), darkWoodMat);
    gongBeam.rotation.z = Math.PI / 2;
    gongBeam.position.set(0, 2.1, -1.8);
    maduraGroup.add(gongBeam);

    const gongPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.1, 16), gongBronzeMat);
    gongPlate.rotation.x = Math.PI / 2;
    gongPlate.position.set(0, 1.2, -1.8);
    maduraGroup.add(gongPlate);

    const gongBoss = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), gongBronzeMat);
    gongBoss.position.set(0, 1.2, -1.72);
    maduraGroup.add(gongBoss);

    scene.add(maduraGroup);

    // D. Monumen Batu Megalitikum Nias (Batu Hombo untuk Lompat Batu)
    const niasGroup = new THREE.Group();
    const niasX = 65;
    const niasZ = -48;
    niasGroup.position.set(niasX, getTerrainHeight(niasX, niasZ), niasZ);

    const megalithStoneMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.95 });
    const mossStoneMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.9 });
    const goldReliefMat = new THREE.MeshStandardMaterial({ color: '#ca8a04', metalness: 0.6, roughness: 0.4 });

    // Base stone foundation
    const niasBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 2.4), megalithStoneMat);
    niasBase.position.y = 0.3;
    niasBase.castShadow = true;
    niasGroup.add(niasBase);

    // Stepped pyramid jumping stone (Batu Hombo)
    const niasMid = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 1.8), mossStoneMat);
    niasMid.position.y = 1.2;
    niasMid.castShadow = true;
    niasGroup.add(niasMid);

    const niasTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.3), megalithStoneMat);
    niasTop.position.y = 2.15;
    niasTop.castShadow = true;
    niasGroup.add(niasTop);

    // Front takeoff stone footing
    const takeoffStep = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.8), megalithStoneMat);
    takeoffStep.position.set(0, 0.2, 1.8);
    niasGroup.add(takeoffStep);

    // Two Flanking Megalithic Menhirs (Gomo Ancestor Monoliths)
    [-2.6, 2.6].forEach(mx => {
      const menhir = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 3.8, 6), mossStoneMat);
      menhir.position.set(mx, 1.9, 0);
      menhir.rotation.y = Math.PI / 6;
      menhir.castShadow = true;
      niasGroup.add(menhir);

      const menhirFace = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.1), goldReliefMat);
      menhirFace.position.set(mx, 2.7, 0.35);
      niasGroup.add(menhirFace);
    });

    scene.add(niasGroup);

    // 11g. TOKOH ADAT NUSANTARA (5 HEROIC TRIBAL NPCS WITH OVERHEAD 3D NAMEPLATES)
    const npcsList: { group: THREE.Group; npc: TribalNpc }[] = [];

    NUSANTARA_NPCS.forEach(npc => {
      const npcY = getTerrainHeight(npc.x, npc.z);
      const npcGroup = new THREE.Group();
      npcGroup.position.set(npc.x, npcY, npc.z);

      const skinMatNpc = new THREE.MeshStandardMaterial({ color: '#fed7aa', roughness: 0.55 });
      const darkHairMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 });

      // Torso & Clothing
      let tunicColor = '#334155';
      if (npc.id === 'empu_supo') tunicColor = '#0f172a'; // Beskap Hitam
      else if (npc.id === 'panglima_burung') tunicColor = '#78350f'; // Rompi Kulit Kayu Ta'a
      else if (npc.id === 'pak_sakera') tunicColor = '#dc2626'; // Kaos Sakera Merah
      else if (npc.id === 'daeng_matowa') tunicColor = '#1e3a8a'; // Jas Tutu' Bahari
      else if (npc.id === 'tuha_balugu') tunicColor = '#ca8a04'; // Baju Zirah Emas Baru Oholu

      const npcTorso = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.9, 0.44),
        new THREE.MeshStandardMaterial({ color: tunicColor, roughness: 0.7 })
      );
      npcTorso.position.y = 1.15;
      npcTorso.castShadow = true;
      npcGroup.add(npcTorso);

      // Pants / Lower Wrap
      let pantsColor = '#1e293b';
      if (npc.id === 'empu_supo') pantsColor = '#92400e'; // Batik Jarik Cokelat
      else if (npc.id === 'pak_sakera') pantsColor = '#0f172a'; // Celana Gombor Hitam
      else if (npc.id === 'daeng_matowa') pantsColor = '#f59e0b'; // Sarung Sutra Lipaq Sabbe
      else if (npc.id === 'tuha_balugu') pantsColor = '#b45309';

      const legL = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.75, 0.28),
        new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 })
      );
      legL.position.set(-0.2, 0.38, 0);
      legL.castShadow = true;
      npcGroup.add(legL);

      const legR = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.75, 0.28),
        new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 })
      );
      legR.position.set(0.2, 0.38, 0);
      legR.castShadow = true;
      npcGroup.add(legR);

      // Arms
      const armL = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.65, 0.22),
        new THREE.MeshStandardMaterial({ color: tunicColor, roughness: 0.7 })
      );
      armL.position.set(-0.48, 1.1, 0);
      npcGroup.add(armL);

      const armR = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.65, 0.22),
        new THREE.MeshStandardMaterial({ color: tunicColor, roughness: 0.7 })
      );
      armR.position.set(0.48, 1.1, 0);
      npcGroup.add(armR);

      // Head
      const npcHead = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), skinMatNpc);
      npcHead.position.y = 1.82;
      npcHead.castShadow = true;
      npcGroup.add(npcHead);

      // Distinctive Headgear & Cultural Accessories
      if (npc.id === 'empu_supo') {
        // Blangkon Jawa (Curved cap with mondholan bun behind)
        const blangkon = new THREE.Mesh(
          new THREE.CylinderGeometry(0.27, 0.28, 0.16, 12),
          new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.8 })
        );
        blangkon.position.set(0, 1.95, 0);
        npcGroup.add(blangkon);

        const mondholan = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 8, 8),
          new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.8 })
        );
        mondholan.position.set(0, 1.9, -0.25);
        npcGroup.add(mondholan);

        // Gold Smithing Tongs in Hand
        const tongs = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.7, 0.06),
          new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.9, roughness: 0.2 })
        );
        tongs.position.set(0.55, 0.9, 0.2);
        tongs.rotation.x = Math.PI / 4;
        npcGroup.add(tongs);
      } else if (npc.id === 'panglima_burung') {
        // Dayak Lawung Headband
        const headband = new THREE.Mesh(
          new THREE.TorusGeometry(0.26, 0.04, 6, 16),
          new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6 })
        );
        headband.position.set(0, 1.88, 0);
        headband.rotation.x = Math.PI / 2;
        npcGroup.add(headband);

        // Enggang Feather Plumes
        const featherMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.5 });
        const featherTipMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.7 });

        [-0.08, 0.08].forEach(fx => {
          const plume = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.65, 4), featherMat);
          plume.position.set(fx, 2.25, -0.05);
          plume.rotation.set(-0.2, 0, fx * 1.5);
          npcGroup.add(plume);

          const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2, 4), featherTipMat);
          tip.position.set(fx, 2.5, -0.05);
          tip.rotation.set(-0.2, 0, fx * 1.5);
          npcGroup.add(tip);
        });

        // Dayak Sipet Blowpipe held in hand
        const sipet = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 2.0, 8),
          new THREE.MeshStandardMaterial({ color: '#3b200b', roughness: 0.85 })
        );
        sipet.position.set(-0.55, 1.0, 0.2);
        npcGroup.add(sipet);
      } else if (npc.id === 'pak_sakera') {
        // Madurese Udeng
        const udeng = new THREE.Mesh(
          new THREE.CylinderGeometry(0.27, 0.29, 0.14, 10),
          new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 })
        );
        udeng.position.set(0, 1.95, 0);
        npcGroup.add(udeng);

        const udengKnot = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.25, 4),
          new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 })
        );
        udengKnot.position.set(0, 2.05, -0.22);
        udengKnot.rotation.x = -Math.PI / 3;
        npcGroup.add(udengKnot);

        // White stripes on red shirt (Pesa'an)
        for (let st = 0; st < 3; st++) {
          const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(0.74, 0.1, 0.46),
            new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7 })
          );
          stripe.position.set(0, 0.85 + st * 0.26, 0);
          npcGroup.add(stripe);
        }

        // Madurese Mustache
        const mustache = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.05, 0.06),
          darkHairMat
        );
        mustache.position.set(0, 1.76, 0.25);
        npcGroup.add(mustache);
      } else if (npc.id === 'daeng_matowa') {
        // Bugis Passapu Headgear
        const passapu = new THREE.Mesh(
          new THREE.ConeGeometry(0.3, 0.4, 4),
          new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6 })
        );
        passapu.position.set(0, 2.05, 0.02);
        passapu.rotation.y = Math.PI / 4;
        npcGroup.add(passapu);

        const goldTrim = new THREE.Mesh(
          new THREE.TorusGeometry(0.26, 0.035, 6, 16),
          new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.8, roughness: 0.2 })
        );
        goldTrim.position.set(0, 1.88, 0);
        goldTrim.rotation.x = Math.PI / 2;
        npcGroup.add(goldTrim);

        // Sailor Brass Telescope in Hand
        const scope = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.06, 0.65, 8),
          new THREE.MeshStandardMaterial({ color: '#eab308', metalness: 0.9, roughness: 0.2 })
        );
        scope.position.set(0.55, 1.0, 0.2);
        scope.rotation.x = Math.PI / 3;
        npcGroup.add(scope);
      } else if (npc.id === 'tuha_balugu') {
        // Nias Golden Warrior Crown
        const crown = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.28, 0.18, 8),
          new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.8, roughness: 0.2 })
        );
        crown.position.set(0, 1.96, 0);
        npcGroup.add(crown);

        // Kalabubu Torc Ring around Neck
        const kalabubu = new THREE.Mesh(
          new THREE.TorusGeometry(0.24, 0.06, 8, 16),
          new THREE.MeshStandardMaterial({ color: '#ca8a04', metalness: 0.7, roughness: 0.3 })
        );
        kalabubu.position.set(0, 1.58, 0);
        kalabubu.rotation.x = Math.PI / 2;
        npcGroup.add(kalabubu);
      }

      // OVERHEAD 3D BILLBOARD NAMEPLATE (Always facing camera)
      const nameplate = createNameplateSprite(npc.name, `${npc.icon} ${npc.title}`, npc.color);
      nameplate.position.set(0, 2.55, 0);
      npcGroup.add(nameplate);

      scene.add(npcGroup);
      npcsList.push({ group: npcGroup, npc });
    });

    // 12. 3D PLAYER MODEL (Link / Mas Bumi)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, getTerrainHeight(0, 0), 0);

    const tunicMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.6 });
    const baldricMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.9, 0.46), tunicMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    playerGroup.add(torso);

    // Leather baldric sash across chest
    const baldric = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.92, 0.48), baldricMat);
    baldric.position.set(0, 1.15, 0);
    baldric.rotation.z = Math.PI / 4;
    playerGroup.add(baldric);

    const skinMat = new THREE.MeshStandardMaterial({ color: '#fed7aa', roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.4 });
    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.4 });

    // 6-sided materials for head: right, left, top, bottom, front, back
    const headMaterials = [
      skinMat, // right
      skinMat, // left
      hairMat, // top
      skinMat, // bottom
      faceMat, // front (Anime Hylian face with expressive eyes)
      hairMat  // back
    ];
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), headMaterials);
    head.position.y = 1.8;
    head.castShadow = true;
    playerGroup.add(head);

    // Pointed Hylian Elf Ears
    const earGeo = new THREE.ConeGeometry(0.08, 0.28, 4);
    const earLeft = new THREE.Mesh(earGeo, skinMat);
    earLeft.position.set(-0.28, 1.82, -0.05);
    earLeft.rotation.set(0, 0, Math.PI / 2.6);
    playerGroup.add(earLeft);

    const earRight = new THREE.Mesh(earGeo, skinMat);
    earRight.position.set(0.28, 1.82, -0.05);
    earRight.rotation.set(0, 0, -Math.PI / 2.6);
    playerGroup.add(earRight);

    // Blonde bangs & swept ponytail
    const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.18), hairMat);
    bangs.position.set(0, 2.02, 0.2);
    playerGroup.add(bangs);

    const ponytail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 4), hairMat);
    ponytail.position.set(0, 1.85, -0.32);
    ponytail.rotation.x = -Math.PI / 3.5;
    playerGroup.add(ponytail);

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

    // Sheikah Slate 3D Tablet on Left Hip
    const slateGroup = new THREE.Group();
    slateGroup.position.set(-0.43, 0.98, 0.04);
    slateGroup.rotation.z = -0.15;
    const slateCasing = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.22, 0.05),
      new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8, metalness: 0.2 })
    );
    slateGroup.add(slateCasing);
    const slateScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, 0.16),
      new THREE.MeshBasicMaterial({ color: '#06b6d4' })
    );
    slateScreen.position.set(-0.061, 0, 0);
    slateScreen.rotation.y = -Math.PI / 2;
    slateGroup.add(slateScreen);
    const slateEyeRing = new THREE.Mesh(
      new THREE.RingGeometry(0.015, 0.03, 12),
      new THREE.MeshBasicMaterial({ color: '#22d3ee', side: THREE.DoubleSide })
    );
    slateEyeRing.position.set(-0.062, 0, 0);
    slateEyeRing.rotation.y = -Math.PI / 2;
    slateGroup.add(slateEyeRing);
    playerGroup.add(slateGroup);

    // Master Sword Back Scabbard (Diagonal sheath across back)
    const scabbardGroup = new THREE.Group();
    scabbardGroup.position.set(0.08, 1.25, -0.26);
    scabbardGroup.rotation.z = Math.PI / 5;
    const scabbardSheath = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 1.35, 0.06),
      new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.4, metalness: 0.5 })
    );
    scabbardGroup.add(scabbardSheath);
    const scabbardGoldLocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.18, 0.08),
      new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.2, metalness: 0.85 })
    );
    scabbardGoldLocket.position.y = 0.55;
    scabbardGroup.add(scabbardGoldLocket);
    playerGroup.add(scabbardGroup);

    // Archer Quiver with Blue Fletched Arrows on Back
    const quiverGroup = new THREE.Group();
    quiverGroup.position.set(-0.16, 1.25, -0.25);
    quiverGroup.rotation.z = -Math.PI / 6;
    const quiverBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.07, 0.85, 8),
      new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.8 })
    );
    quiverGroup.add(quiverBody);

    const arrowShaftMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.6 });
    const arrowFletchMat = new THREE.MeshBasicMaterial({ color: '#0284c7' });
    for (let a = 0; a < 4; a++) {
      const aAng = (a / 4) * Math.PI * 2;
      const arrowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 4), arrowShaftMat);
      arrowShaft.position.set(Math.cos(aAng) * 0.035, 0.48, Math.sin(aAng) * 0.035);
      quiverGroup.add(arrowShaft);

      const arrowFletch = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.01), arrowFletchMat);
      arrowFletch.position.set(Math.cos(aAng) * 0.035, 0.62, Math.sin(aAng) * 0.035);
      quiverGroup.add(arrowFletch);
    }
    playerGroup.add(quiverGroup);

    // Leather Forearm Bracers on Link
    const bracerMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.7 });
    const bracerL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.28, 8), bracerMat);
    bracerL.position.set(-0.45, 1.05, 0.02);
    playerGroup.add(bracerL);
    const bracerR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.28, 8), bracerMat);
    bracerR.position.set(0.45, 1.05, 0.02);
    playerGroup.add(bracerR);

    // 3D WEAPONS ARSENAL (HYLIAN & NUSANTARA TRADITIONAL WEAPONS)
    const swordGroup = new THREE.Group();
    swordGroup.position.set(0.45, 1.1, 0.2);

    // 1. MASTER SWORD 3D WITH RUNES & WINGED CROSSGUARD
    const masterSwordGroup = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      emissive: '#38bdf8',
      emissiveIntensity: 0.7,
      metalness: 0.95,
      roughness: 0.15
    });
    const hiltMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', metalness: 0.7, roughness: 0.3 });
    const guardMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.85, roughness: 0.2 });

    const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.45, 0.035), bladeMat);
    swordBlade.position.y = 0.82;
    swordBlade.castShadow = true;
    masterSwordGroup.add(swordBlade);

    // Golden Triforce ricasso crest
    const ricasso = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 3), guardMat);
    ricasso.position.set(0, 0.18, 0.025);
    ricasso.rotateZ(Math.PI);
    masterSwordGroup.add(ricasso);

    // Winged crossguard
    const swordGuard = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.09, 0.12), hiltMat);
    swordGuard.position.y = 0.1;
    masterSwordGroup.add(swordGuard);

    const wingL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 3), hiltMat);
    wingL.position.set(-0.22, 0.16, 0);
    wingL.rotation.z = Math.PI / 4;
    masterSwordGroup.add(wingL);

    const wingR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 3), hiltMat);
    wingR.position.set(0.22, 0.16, 0);
    wingR.rotation.z = -Math.PI / 4;
    masterSwordGroup.add(wingR);

    // Grip & pommel gem
    const swordHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), hiltMat);
    swordHilt.position.y = -0.1;
    masterSwordGroup.add(swordHilt);

    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), guardMat);
    pommel.position.y = -0.28;
    masterSwordGroup.add(pommel);

    swordGroup.add(masterSwordGroup);

    // 2. KERIS PUSAKA MATARAM KUNO (LUK 7 KYAI SURYA)
    const kerisGroup = new THREE.Group();
    const kerisBladeMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      emissive: '#eab308',
      emissiveIntensity: 0.35,
      metalness: 0.95,
      roughness: 0.2
    });
    const kerisGoldMat = new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      emissive: '#d97706',
      emissiveIntensity: 0.25,
      metalness: 0.9,
      roughness: 0.15
    });
    const kerisWoodMat = new THREE.MeshStandardMaterial({
      color: '#451a03',
      roughness: 0.7
    });

    // 7 Waves (Luk 7)
    const lukCount = 7;
    const segHeight = 0.16;
    for (let i = 0; i < lukCount; i++) {
      const yPos = 0.25 + i * segHeight;
      const offset = Math.sin((i / lukCount) * Math.PI * 3.5) * 0.07;
      const width = 0.10 - (i * 0.009);
      const seg = new THREE.Mesh(new THREE.BoxGeometry(width, segHeight + 0.03, 0.03), kerisBladeMat);
      seg.position.set(offset, yPos, 0);
      seg.rotation.z = Math.cos((i / lukCount) * Math.PI * 3.5) * 0.22;
      seg.castShadow = true;
      kerisGroup.add(seg);

      const pamor = new THREE.Mesh(new THREE.BoxGeometry(0.02, segHeight, 0.035), kerisGoldMat);
      pamor.position.set(offset, yPos, 0);
      pamor.rotation.z = seg.rotation.z;
      kerisGroup.add(pamor);
    }

    // Pointed tip
    const kerisTip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 4), kerisBladeMat);
    kerisTip.position.set(Math.sin(Math.PI * 3.5) * 0.07, 0.25 + lukCount * segHeight + 0.06, 0);
    kerisGroup.add(kerisTip);

    // Gandik & Kembang Kacang
    const gandik = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 4), kerisGoldMat);
    gandik.position.set(-0.08, 0.2, 0);
    gandik.rotation.z = -Math.PI / 4;
    kerisGroup.add(gandik);

    // Ganja
    const ganja = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.05), kerisGoldMat);
    ganja.position.set(-0.02, 0.14, 0);
    ganja.rotation.z = -0.1;
    kerisGroup.add(ganja);

    // Mendak
    const mendak = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8), kerisGoldMat);
    mendak.position.y = 0.09;
    kerisGroup.add(mendak);

    // Hulu Keris / Ukiran Deder
    const dederTop = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.16, 6), kerisWoodMat);
    dederTop.position.set(0, 0.0, 0);
    kerisGroup.add(dederTop);

    const dederGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.16, 6), kerisWoodMat);
    dederGrip.position.set(0.03, -0.14, 0);
    dederGrip.rotation.z = -0.25;
    kerisGroup.add(dederGrip);

    const dederHead = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), kerisWoodMat);
    dederHead.position.set(0.06, -0.22, 0);
    kerisGroup.add(dederHead);

    kerisGroup.visible = false;
    swordGroup.add(kerisGroup);

    // 3. MANDAU DAYAK PENJAGA RIMBA
    const mandauGroup = new THREE.Group();
    const mandauSteelMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.95,
      roughness: 0.18
    });
    const mandauBrassMat = new THREE.MeshStandardMaterial({
      color: '#ca8a04',
      metalness: 0.85,
      roughness: 0.25
    });
    const mandauBoneMat = new THREE.MeshStandardMaterial({
      color: '#fef3c7',
      roughness: 0.5
    });
    const mandauTuftMat = new THREE.MeshStandardMaterial({
      color: '#dc2626',
      roughness: 0.8
    });

    const bladeLower = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.65, 0.03), mandauSteelMat);
    bladeLower.position.set(0, 0.45, 0);
    mandauGroup.add(bladeLower);

    const bladeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.65, 0.03), mandauSteelMat);
    bladeUpper.position.set(0.03, 1.0, 0);
    bladeUpper.rotation.z = -0.06;
    mandauGroup.add(bladeUpper);

    const bladeTip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.32, 4), mandauSteelMat);
    bladeTip.position.set(0.07, 1.4, 0);
    bladeTip.rotation.z = -0.3;
    mandauGroup.add(bladeTip);

    // Brass inlays
    for (let k = 0; k < 5; k++) {
      const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.035, 6), mandauBrassMat);
      dot.rotation.x = Math.PI / 2;
      dot.position.set(-0.03 + k * 0.005, 0.5 + k * 0.15, 0);
      mandauGroup.add(dot);
    }

    const simpai = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.08, 8), mandauBrassMat);
    simpai.position.y = 0.12;
    mandauGroup.add(simpai);

    const hiltBone = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.3, 6), mandauBoneMat);
    hiltBone.position.set(0, -0.06, 0);
    mandauGroup.add(hiltBone);

    const enggangBeakHilt = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 4), mandauBoneMat);
    enggangBeakHilt.position.set(-0.06, -0.22, 0);
    enggangBeakHilt.rotation.z = Math.PI / 3;
    mandauGroup.add(enggangBeakHilt);

    const tuft1 = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.25, 4), mandauTuftMat);
    tuft1.position.set(-0.14, -0.26, 0);
    tuft1.rotation.z = Math.PI / 2.2;
    mandauGroup.add(tuft1);

    const tuft2 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.2, 4), mandauTuftMat);
    tuft2.position.set(-0.04, -0.28, 0.03);
    tuft2.rotation.z = Math.PI / 1.8;
    mandauGroup.add(tuft2);

    mandauGroup.visible = false;
    swordGroup.add(mandauGroup);

    // 4. CELURIT SAKERA MADURA
    const celuritGroup = new THREE.Group();
    const celuritSteelMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      metalness: 0.95,
      roughness: 0.15
    });
    const celuritRingMat = new THREE.MeshStandardMaterial({
      color: '#eab308',
      metalness: 0.9,
      roughness: 0.2
    });
    const celuritWoodMat = new THREE.MeshStandardMaterial({
      color: '#291807',
      roughness: 0.65
    });

    const cSegments = 8;
    const cRadius = 0.55;
    const cStartAng = 0.2;
    const cEndAng = Math.PI * 0.9;
    for (let s = 0; s < cSegments; s++) {
      const t = s / (cSegments - 1);
      const ang = cStartAng + t * (cEndAng - cStartAng);
      const x1 = Math.cos(ang) * cRadius - cRadius * 0.5;
      const y1 = Math.sin(ang) * cRadius + 0.35;
      const w = 0.13 - t * 0.07;
      const seg = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, 0.03), celuritSteelMat);
      seg.position.set(x1, y1, 0);
      seg.rotation.z = -ang + Math.PI / 2;
      seg.castShadow = true;
      celuritGroup.add(seg);
    }

    const hookTip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 4), celuritSteelMat);
    const tipAng = cEndAng + 0.15;
    hookTip.position.set(Math.cos(tipAng) * cRadius - cRadius * 0.5, Math.sin(tipAng) * cRadius + 0.35, 0);
    hookTip.rotation.z = -tipAng + Math.PI;
    celuritGroup.add(hookTip);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.09, 8), celuritRingMat);
    collar.position.set(-cRadius * 0.5 + Math.cos(cStartAng) * cRadius - 0.03, 0.18, 0);
    celuritGroup.add(collar);

    const celuritHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.32, 8), celuritWoodMat);
    celuritHandle.position.set(-0.35, 0.0, 0);
    celuritHandle.rotation.z = 0.3;
    celuritGroup.add(celuritHandle);

    for (let r = 0; r < 3; r++) {
      const hRing = new THREE.Mesh(new THREE.TorusGeometry(0.043, 0.007, 6, 12), celuritRingMat);
      hRing.position.set(-0.35 + (r - 1) * 0.07 * Math.sin(0.3), 0.0 - (r - 1) * 0.07 * Math.cos(0.3), 0);
      hRing.rotation.x = Math.PI / 2;
      celuritGroup.add(hRing);
    }

    const pommelHook = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.015, 6, 12, 0, Math.PI * 1.3), celuritSteelMat);
    pommelHook.position.set(-0.35 - 0.16 * Math.sin(0.3), -0.16 * Math.cos(0.3), 0);
    celuritGroup.add(pommelHook);

    celuritGroup.visible = false;
    swordGroup.add(celuritGroup);

    // 5. BADIK GECONG BAJO-BUGIS
    const badikGroup = new THREE.Group();
    const badikSteelMat = new THREE.MeshStandardMaterial({
      color: '#475569',
      metalness: 0.95,
      roughness: 0.2,
      emissive: '#a855f7',
      emissiveIntensity: 0.25
    });
    const badikSilverMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.9,
      roughness: 0.25
    });
    const badikWoodMat = new THREE.MeshStandardMaterial({
      color: '#92400e',
      roughness: 0.5
    });

    const badikBlade = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.85, 0.025), badikSteelMat);
    badikBlade.position.set(0, 0.5, 0);
    badikGroup.add(badikBlade);

    const badikPoint = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 4), badikSteelMat);
    badikPoint.position.set(0.015, 0.98, 0);
    badikPoint.rotation.z = -0.1;
    badikGroup.add(badikPoint);

    const badikPamor = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.75, 0.03), badikSilverMat);
    badikPamor.position.set(0, 0.5, 0);
    badikGroup.add(badikPamor);

    const kilin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.08, 8), badikSilverMat);
    kilin.position.y = 0.12;
    badikGroup.add(kilin);

    const pappiBase = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.15, 8), badikWoodMat);
    pappiBase.position.set(0, 0.01, 0);
    badikGroup.add(pappiBase);

    const pappiGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.22, 8), badikWoodMat);
    pappiGrip.position.set(-0.09, -0.12, 0);
    pappiGrip.rotation.z = Math.PI / 3.2;
    badikGroup.add(pappiGrip);

    const pappiCap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), badikSilverMat);
    pappiCap.position.set(-0.19, -0.18, 0);
    badikGroup.add(pappiCap);

    badikGroup.visible = false;
    swordGroup.add(badikGroup);

    // Register weapons in ref for instant switching
    weaponMeshesRef.current = {
      master_sword: masterSwordGroup,
      keris_mataram: kerisGroup,
      mandau_dayak: mandauGroup,
      celurit_madura: celuritGroup,
      badik_bugis: badikGroup,
    };
    const initWeapon = activeWeaponRef.current;
    (Object.keys(weaponMeshesRef.current) as TraditionalWeapon[]).forEach((wKey) => {
      const g = weaponMeshesRef.current[wKey];
      if (g) g.visible = (wKey === initWeapon);
    });

    playerGroup.add(swordGroup);

    // Luminous Sword Slash Arc Trail Ribbon Mesh
    const swordTrailGeo = new THREE.RingGeometry(1.2, 1.9, 24, 1, -Math.PI * 0.4, Math.PI * 0.8);
    const swordTrailMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const swordTrailMesh = new THREE.Mesh(swordTrailGeo, swordTrailMat);
    swordTrailMesh.rotation.x = Math.PI / 2;
    swordTrailMesh.position.y = 1.1;
    playerGroup.add(swordTrailMesh);

    // HYLIAN SHIELD 3D WITH EMBOSSED CREST
    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(-0.45, 1.1, 0.1);

    const shieldFrontMat = new THREE.MeshStandardMaterial({
      map: shieldTex,
      metalness: 0.5,
      roughness: 0.35
    });
    const shieldBackMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.8 });

    const shieldMaterials = [
      shieldBackMat,
      shieldBackMat,
      shieldBackMat,
      shieldBackMat,
      shieldFrontMat,
      shieldBackMat
    ];

    const shieldBody = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.9, 0.09), shieldMaterials);
    shieldBody.castShadow = true;
    shieldGroup.add(shieldBody);

    const rimMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.2 });
    const rimTop = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.11), rimMat);
    rimTop.position.y = 0.44;
    shieldGroup.add(rimTop);

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

    // 13. 3D BOKOBLIN ENEMY WITH SPIKED BOKO CLUB
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

    // Pointed goblin ears
    const bokoEarGeo = new THREE.ConeGeometry(0.12, 0.4, 4);
    const bokoEarL = new THREE.Mesh(bokoEarGeo, bokoMat);
    bokoEarL.position.set(-0.55, 0.85, 0);
    bokoEarL.rotation.z = Math.PI / 2.5;
    bokoGroup.add(bokoEarL);

    const bokoEarR = new THREE.Mesh(bokoEarGeo, bokoMat);
    bokoEarR.position.set(0.55, 0.85, 0);
    bokoEarR.rotation.z = -Math.PI / 2.5;
    bokoGroup.add(bokoEarR);

    // Spiked wooden Boko Club
    const bokoClubGroup = new THREE.Group();
    bokoClubGroup.position.set(0.6, 0.6, 0.3);

    const woodMat = new THREE.MeshStandardMaterial({ color: '#5c2b0c', roughness: 0.9 });
    const spikeMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.4 });

    const clubHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.4, 6), woodMat);
    clubHandle.rotation.x = Math.PI / 4;
    bokoClubGroup.add(clubHandle);

    for (let sp = 0; sp < 4; sp++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 4), spikeMat);
      const spAng = (sp / 4) * Math.PI * 2;
      spike.position.set(Math.cos(spAng) * 0.18, 0.5 + (sp % 2) * 0.2, Math.sin(spAng) * 0.18);
      spike.rotation.z = Math.cos(spAng) * 1.2;
      bokoClubGroup.add(spike);
    }
    bokoGroup.add(bokoClubGroup);

    scene.add(bokoGroup);
    bokoStatsRef.current.mesh = bokoGroup;

    // 14. 3D ANCIENT GUARDIAN STALKER WITH SHEIKAH GLYPHS
    const guardianGroup = new THREE.Group();
    guardianGroup.position.set(75, 5.5, -75);

    const guardianChassisMat = new THREE.MeshStandardMaterial({
      map: sheikahRuneTex,
      color: '#334155',
      roughness: 0.6,
      metalness: 0.4
    });
    const eyeMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#ef4444', emissiveIntensity: 1.5 });

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

    // Red targeting reticle dot on Link's chest
    const laserDotGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const laserDotMat = new THREE.MeshBasicMaterial({ color: '#ff0000' });
    const laserDotMesh = new THREE.Mesh(laserDotGeo, laserDotMat);
    laserDotMesh.visible = false;
    scene.add(laserDotMesh);

    // Guardian High-Speed Plasma Cannon Blast
    const plasmaGroup = new THREE.Group();
    const plasmaCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 16, 16),
      new THREE.MeshBasicMaterial({ color: '#ffffff' })
    );
    plasmaGroup.add(plasmaCore);
    const plasmaAura = new THREE.Mesh(
      new THREE.SphereGeometry(0.82, 16, 16),
      new THREE.MeshBasicMaterial({
        color: '#ef4444',
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      })
    );
    plasmaGroup.add(plasmaAura);
    const plasmaLight = new THREE.PointLight('#ef4444', 3.5, 14);
    plasmaGroup.add(plasmaLight);
    plasmaGroup.visible = false;
    scene.add(plasmaGroup);

    // Parry Shockwave Flash Ring
    const parryRingGeo = new THREE.RingGeometry(0.3, 2.8, 32);
    parryRingGeo.rotateX(-Math.PI / 2);
    const parryRingMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const parryShockwaveMesh = new THREE.Mesh(parryRingGeo, parryRingMat);
    parryShockwaveMesh.visible = false;
    scene.add(parryShockwaveMesh);

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

      if (keysRef.current['w'] || keysRef.current['W'] || keysRef.current['KeyW'] || keysRef.current['ArrowUp']) moveForward += 1;
      if (keysRef.current['s'] || keysRef.current['S'] || keysRef.current['KeyS'] || keysRef.current['ArrowDown']) moveForward -= 1;
      if (keysRef.current['d'] || keysRef.current['D'] || keysRef.current['KeyD'] || keysRef.current['ArrowRight']) moveRight += 1;
      if (keysRef.current['a'] || keysRef.current['A'] || keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) moveRight -= 1;

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

      // Move player relative to camera yaw or locked target (W: Maju ke depan)
      if ((moveForward !== 0 || moveRight !== 0) && !p.isClimbing && !p.isSurfing) {
        const spd = (p.isGliding ? 0.45 : p.isBlocking ? 0.12 : 0.28) * timeScale;
        const inputAngle = Math.atan2(moveRight, moveForward);

        if (targetLockRef.current) {
          // Strafe orbiting relative to target (W moves towards target)
          const strafeAngle = p.rotY - inputAngle;
          p.vx = Math.sin(strafeAngle) * spd;
          p.vz = Math.cos(strafeAngle) * spd;
        } else {
          // W moves forward into the distance away from camera
          const moveAngle = camOrbitRef.current.yaw + Math.PI - inputAngle;
          p.vx = Math.sin(moveAngle) * spd;
          p.vz = Math.cos(moveAngle) * spd;
          p.rotY = moveAngle;
        }

        p.runCycle += 0.25 * timeScale;
        legLeft.rotation.x = Math.sin(p.runCycle) * 0.7;
        legRight.rotation.x = -Math.sin(p.runCycle) * 0.7;

        // Emit footstep dust or water splash
        stepTimer++;
        if (stepTimer % 7 === 0) {
          const slot = dustMeshes[dustSpawnIndex];
          dustSpawnIndex = (dustSpawnIndex + 1) % dustCount;
          slot.mesh.visible = true;
          slot.mesh.position.set(p.x + (Math.random() - 0.5) * 0.4, p.y + 0.1, p.z + (Math.random() - 0.5) * 0.4);
          slot.mesh.scale.set(1, 1, 1);
          slot.vy = 0.04;
          slot.life = 20;

          // Water splash check (Danau Klaten)
          if (p.y < 0.2 && Math.hypot(p.x - (-50), p.z - 50) < 42) {
            (slot.mesh.material as THREE.MeshStandardMaterial).color.set('#38bdf8');
            if (stepTimer % 14 === 0) playZeldaSfx('splash');
          } else {
            (slot.mesh.material as THREE.MeshStandardMaterial).color.set('#d4d4d8');
          }
        }
      } else if (!p.isSurfing) {
        p.vx *= 0.8;
        p.vz *= 0.8;
        legLeft.rotation.x = 0;
        legRight.rotation.x = 0;
      }

      // Animate active dust particles
      dustMeshes.forEach(slot => {
        if (slot.life > 0) {
          slot.life--;
          slot.mesh.position.y += slot.vy;
          slot.mesh.scale.multiplyScalar(0.93);
          (slot.mesh.material as THREE.MeshStandardMaterial).opacity = slot.life / 20;
          if (slot.life <= 0) slot.mesh.visible = false;
        }
      });

      // Animate lake foam ring
      foamMesh.scale.setScalar(1.0 + Math.sin(Date.now() * 0.003) * 0.015);

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
          // Bokoblin attacks Link with Boko Club
          b.attackCooldown -= timeScale;
          if (b.attackCooldown <= 0) {
            b.attackCooldown = 75;
            bokoClubGroup.rotation.x = -Math.PI / 2.2;
            setTimeout(() => { if (bokoClubGroup) bokoClubGroup.rotation.x = Math.PI / 4; }, 220);

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

      // Sword Attack Animation & Luminous Trail
      if (p.isAttacking) {
        p.attackTimer--;
        swordGroup.rotation.z = Math.sin((16 - p.attackTimer) * 0.4) * 1.8;
        swordGroup.rotation.x = Math.cos((16 - p.attackTimer) * 0.4) * 1.2;

        swordTrailMesh.material.opacity = (p.attackTimer / 16) * 0.85;
        swordTrailMesh.rotation.z = -(16 - p.attackTimer) * 0.3;

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
          swordTrailMesh.material.opacity = 0;
        }
      } else if (p.isSpinAttacking) {
        p.spinTimer--;
        playerGroup.rotation.y += 0.6;
        swordGroup.rotation.z = 1.5;

        swordTrailMesh.material.opacity = (p.spinTimer / 22) * 0.95;
        swordTrailMesh.rotation.z += 0.45;
        swordTrailMesh.scale.set(1.4, 1.4, 1.4);

        if (p.spinTimer <= 0) {
          p.isSpinAttacking = false;
          swordGroup.rotation.set(0, 0, 0);
          swordTrailMesh.material.opacity = 0;
          swordTrailMesh.scale.set(1, 1, 1);
        }
      } else {
        swordTrailMesh.material.opacity = 0;
      }

      // Shield Guard Pose
      if (p.isBlocking && !p.isSurfing) {
        shieldGroup.position.set(-0.2, 1.1, 0.45);
        shieldGroup.rotation.y = 0.5;
      }

      // Living World Wind & Cloud Physics
      const nowSec = Date.now() * 0.002;
      treeFoliageRefs.current.forEach((foliage, idx) => {
        foliage.rotation.z = Math.sin(nowSec + idx * 0.8) * 0.06;
        foliage.rotation.x = Math.cos(nowSec * 0.8 + idx) * 0.04;
      });

      // Drift Clouds across Hyrule
      cloudsList.forEach(cloud => {
        cloud.position.x += 0.035 * timeScale;
        if (cloud.position.x > 180) cloud.position.x = -180;
      });

      // Floating Ambient Spores & Fireflies
      const sPos = sporeGeo.attributes.position.array as Float32Array;
      for (let s = 0; s < sPos.length; s += 3) {
        sPos[s] += Math.sin(nowSec + s) * 0.02 + 0.015;
        sPos[s + 1] += Math.sin(nowSec * 1.5 + s) * 0.015;
        if (sPos[s] > 90) sPos[s] = -90;
      }
      sporeGeo.attributes.position.needsUpdate = true;

      // Billowing Campfire Smoke Plume
      smokeSpawnTimer++;
      if (smokeSpawnTimer % 8 === 0) {
        const inactiveSmoke = smokeParticles.find(sm => sm.life <= 0);
        if (inactiveSmoke) {
          inactiveSmoke.mesh.position.set(8 + (Math.random() - 0.5) * 0.35, 1.9, 8 + (Math.random() - 0.5) * 0.35);
          inactiveSmoke.mesh.scale.set(0.7, 0.7, 0.7);
          inactiveSmoke.life = inactiveSmoke.maxLife;
          inactiveSmoke.mesh.visible = true;
          inactiveSmoke.vx = (Math.random() - 0.5) * 0.012 + 0.01;
          inactiveSmoke.vz = (Math.random() - 0.5) * 0.012;
          inactiveSmoke.vy = 0.042 + Math.random() * 0.02;
        }
      }

      smokeParticles.forEach(sp => {
        if (sp.life > 0) {
          sp.life -= timeScale;
          sp.mesh.position.x += sp.vx * timeScale;
          sp.mesh.position.y += sp.vy * timeScale;
          sp.mesh.position.z += sp.vz * timeScale;
          sp.mesh.scale.multiplyScalar(1.018);
          (sp.mesh.material as THREE.MeshStandardMaterial).opacity = (sp.life / sp.maxLife) * 0.35;
          if (sp.life <= 0) sp.mesh.visible = false;
        }
      });

      // The Iconic Hylian Cucco AI (Ayam Hylian)
      const cuccoDistToPlayer = Math.hypot(p.x - cuccoGroup.position.x, p.z - cuccoGroup.position.z);
      if (cuccoDistToPlayer < 2.8) {
        cuccoWingL.rotation.z = Math.sin(Date.now() * 0.03) * 0.7;
        cuccoWingR.rotation.z = -Math.sin(Date.now() * 0.03) * 0.7;
        const fleeAng = Math.atan2(cuccoGroup.position.x - p.x, cuccoGroup.position.z - p.z);
        cuccoGroup.position.x += Math.sin(fleeAng) * 0.12 * timeScale;
        cuccoGroup.position.z += Math.cos(fleeAng) * 0.12 * timeScale;
        cuccoGroup.position.y = getTerrainHeight(cuccoGroup.position.x, cuccoGroup.position.z) + Math.abs(Math.sin(Date.now() * 0.02)) * 0.25;
        cuccoGroup.rotation.y = fleeAng;
        if (Math.random() < 0.025) {
          playZeldaSfx('jump');
          setHudStats(prev => ({ ...prev, message: '🐔 KOK-KOKOK! Ayam Cucco Hylian Terkejut!' }));
        }
      } else {
        cuccoWingL.rotation.z = 0;
        cuccoWingR.rotation.z = 0;
        cuccoHead.rotation.x = Math.sin(nowSec * 2.5) * 0.25;
        cuccoGroup.position.y = getTerrainHeight(cuccoGroup.position.x, cuccoGroup.position.z);
      }

      // Fluttering Summerwing Butterflies
      butterflyList.forEach((b, idx) => {
        const bTime = nowSec * 3.5 + b.phase;
        b.group.position.x = b.ox + Math.sin(bTime * 0.4) * 3.5;
        b.group.position.z = b.oz + Math.cos(bTime * 0.4) * 3.5;
        b.group.position.y = getTerrainHeight(b.group.position.x, b.group.position.z) + 1.1 + Math.sin(bTime) * 0.4;
        b.group.rotation.y = bTime * 0.4 + Math.PI / 2;
        const flap = Math.sin(Date.now() * 0.025 + idx) * 0.85;
        b.wingL.rotation.y = flap;
        b.wingR.rotation.y = -flap;
      });

      // Secret Korok Pinwheel Spin & Puzzle
      pinwheelCenter.rotation.z += 0.08 * timeScale;
      const distToKorokPinwheel = Math.hypot(p.x - kpX, p.z - kpZ);
      if (distToKorokPinwheel < 3.2 && !korokFound) {
        korokFound = true;
        p.korokSeeds += 1;
        p.rupees += 25;
        playZeldaSfx('korok_yahaha');
        setHudStats(prev => ({
          ...prev,
          korokSeeds: p.korokSeeds,
          rupees: p.rupees,
          message: '🍃 YAHAHA! Kamu menemukan Korok rahasia! (+1 Korok Seed & 25 Rupee)'
        }));
      }

      // Link Idle Breathing Animation
      if (!p.isAttacking && !p.isSpinAttacking && p.vx === 0 && p.vz === 0) {
        torso.scale.y = 1.0 + Math.sin(Date.now() * 0.003) * 0.02;
        head.position.y = 1.8 + Math.sin(Date.now() * 0.003) * 0.015;
      } else {
        torso.scale.y = 1.0;
        head.position.y = 1.8;
      }

      // Master Sword Sacred Awakening & Nusantara Weapon Trail Colors
      const distToBoko = Math.hypot(p.x - bokoStatsRef.current.x, p.z - bokoStatsRef.current.z);
      const distToGuardian = Math.hypot(p.x - guardianGroup.position.x, p.z - guardianGroup.position.z);
      const isNearMalice = (distToGuardian < 70 || (bokoStatsRef.current.hp > 0 && distToBoko < 38));

      const currW = activeWeaponRef.current;
      if (currW === 'master_sword') {
        if (isNearMalice) {
          bladeMat.emissive.set('#00f0ff');
          bladeMat.emissiveIntensity = 2.4 + Math.sin(Date.now() * 0.009) * 0.8;
          swordTrailMat.color.set('#00f0ff');
          setIsSwordAwakened(true);
        } else {
          bladeMat.emissive.set('#38bdf8');
          bladeMat.emissiveIntensity = 0.5;
          swordTrailMat.color.set('#38bdf8');
          setIsSwordAwakened(false);
        }
      } else {
        swordTrailMat.color.set(NUSANTARA_WEAPONS[currW].color);
        setIsSwordAwakened(false);
      }

      // Acoustic noise calculation (BotW sound meter)
      const pSpeed = Math.hypot(p.vx, p.vz);
      let noiseLvl = 1;
      if (p.isAttacking || p.isSpinAttacking) noiseLvl = 4;
      else if (pSpeed > 0.3) noiseLvl = 3;
      else if (pSpeed > 0.05) noiseLvl = 2;
      else if (p.isGliding) noiseLvl = 2;
      else noiseLvl = 1;
      if (Math.random() < 0.1) setNoiseDisplay(noiseLvl);

      // Guardian AI & Laser Targeting
      guardianTimer += 0.05 * timeScale;
      legPoles.forEach((leg, idx) => {
        if (leg.visible) {
          leg.rotation.x = Math.sin(guardianTimer + idx) * 0.35;
        }
      });

      if (distToGuardian < 75) {
        eyeTurret.lookAt(p.x, p.y + 1.2, p.z);
        laserBeamMesh.visible = true;
        laserDotMesh.visible = true;
        laserDotMesh.position.set(p.x, p.y + 1.1 + Math.sin(Date.now() * 0.02) * 0.03, p.z);

        const gPos = new THREE.Vector3();
        eyeLens.getWorldPosition(gPos);
        const pPos = new THREE.Vector3(p.x, p.y + 1.2, p.z);

        const mid = gPos.clone().add(pPos).multiplyScalar(0.5);
        laserBeamMesh.position.copy(mid);
        laserBeamMesh.lookAt(pPos);
        laserBeamMesh.scale.set(1, 1, gPos.distanceTo(pPos));

        // Charge up laser
        guardianChargeTimerRef.current += 1 * timeScale;
        const charge = guardianChargeTimerRef.current;

        // Audio cues accelerating
        if (charge < 80) {
          if (Math.floor(charge) % 25 === 0) playZeldaSfx('guardian_beep');
        } else if (charge < 115) {
          if (Math.floor(charge) % 9 === 0) playZeldaSfx('guardian_beep');
        }

        (eyeLens.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2 + (charge / 115) * 3.5;

        // FIRE PLASMA CANNON
        if (charge >= 115 && (!guardianPlasmaRef.current || !guardianPlasmaRef.current.active)) {
          guardianChargeTimerRef.current = 0;
          playZeldaSfx('guardian_laser');

          const dir = pPos.clone().sub(gPos).normalize();
          plasmaGroup.position.copy(gPos);
          plasmaGroup.visible = true;
          guardianPlasmaRef.current = {
            active: true,
            mesh: plasmaGroup,
            vx: dir.x * 1.65,
            vy: dir.y * 1.65,
            vz: dir.z * 1.65,
            isReflected: false,
            life: 140
          };
        }
      } else {
        laserBeamMesh.visible = false;
        laserDotMesh.visible = false;
        guardianChargeTimerRef.current = 0;
      }

      // Update Plasma Cannon & Shield Parry Collision
      if (guardianPlasmaRef.current && guardianPlasmaRef.current.active) {
        const plasma = guardianPlasmaRef.current;
        plasma.mesh.position.x += plasma.vx * timeScale;
        plasma.mesh.position.y += plasma.vy * timeScale;
        plasma.mesh.position.z += plasma.vz * timeScale;
        plasma.life -= timeScale;

        // Check Link Collision
        const distToLink = Math.hypot(plasma.mesh.position.x - p.x, plasma.mesh.position.z - p.z);
        if (distToLink < 1.4 && !plasma.isReflected && Math.abs(plasma.mesh.position.y - (p.y + 1.1)) < 1.6) {
          if (p.isBlocking) {
            // PERFECT SHIELD PARRY REFLECTION!
            playZeldaSfx('parry');
            plasma.vx = -plasma.vx * 1.8;
            plasma.vy = -plasma.vy * 1.8;
            plasma.vz = -plasma.vz * 1.8;
            plasma.isReflected = true;
            (plasmaAura.material as THREE.MeshBasicMaterial).color.set('#00f0ff');
            plasmaLight.color.set('#00f0ff');

            parryShockwaveMesh.position.set(p.x, p.y + 1.1, p.z);
            parryShockwaveMesh.scale.set(1, 1, 1);
            parryShockwaveMesh.visible = true;
            parryFlashTimerRef.current = 15;
            setHudStats(prev => ({ ...prev, message: '🛡️ PARRY SEMPURNA! Laser Dipantulkan Balik!' }));
          } else {
            // Direct hit on Link
            playZeldaSfx('bomb_explode');
            p.hearts = Math.max(0, p.hearts - 3);
            p.vy = 5;
            plasma.active = false;
            plasma.mesh.visible = false;
            setHudStats(prev => ({ ...prev, message: '💥 Terkena Tembakan Laser Guardian!' }));
          }
        }

        // Check Reflected Hit on Guardian
        if (plasma.isReflected) {
          const gDist = Math.hypot(plasma.mesh.position.x - guardianGroup.position.x, plasma.mesh.position.z - guardianGroup.position.z);
          if (gDist < 4.2) {
            plasma.active = false;
            plasma.mesh.visible = false;
            playZeldaSfx('bomb_explode');
            playZeldaSfx('guardian_panic');

            const legIdx = guardianLegsHpRef.current.findIndex(hp => hp > 0);
            if (legIdx !== -1) {
              guardianLegsHpRef.current[legIdx] = 0;
              legPoles[legIdx].visible = false;
            }
            p.rupees += 50;
            p.arrows += 5;
            setHudStats(prev => ({ ...prev, message: '🎯 KENA MATA GUARDIAN! Kaki Rontok & Dapat 50 Rupee!' }));
          }
        }

        if (plasma.life <= 0) {
          plasma.active = false;
          plasma.mesh.visible = false;
        }
      }

      // Parry shockwave animation
      if (parryFlashTimerRef.current > 0) {
        parryFlashTimerRef.current--;
        parryShockwaveMesh.scale.multiplyScalar(1.15);
        (parryShockwaveMesh.material as THREE.MeshBasicMaterial).opacity = parryFlashTimerRef.current / 15;
        if (parryFlashTimerRef.current <= 0) parryShockwaveMesh.visible = false;
      }

      // Target Lock Reticle Update & Camera Framing
      if (targetLockRef.current === 'bokoblin' && bokoStatsRef.current.hp <= 0) {
        targetLockRef.current = null;
        setTargetLocked(false);
      }

      if (targetLockRef.current) {
        let tX = 0, tY = 0, tZ = 0;
        if (targetLockRef.current === 'bokoblin') {
          tX = bokoStatsRef.current.x;
          tY = bokoStatsRef.current.y + 2.4;
          tZ = bokoStatsRef.current.z;
        } else {
          tX = 75;
          tY = 11;
          tZ = -75;
        }

        targetReticleMesh.visible = true;
        targetReticleMesh.position.set(tX, tY + Math.sin(Date.now() * 0.008) * 0.25, tZ);
        targetReticleMesh.rotation.y += 0.05;

        // Auto-face locked target
        const angToTarget = Math.atan2(tX - p.x, tZ - p.z);
        p.rotY = angToTarget;

        // Lock-on dynamic combat camera framing
        const camDist = 11;
        const targetCamX = p.x - Math.sin(angToTarget) * camDist;
        const targetCamY = p.y + 3.2;
        const targetCamZ = p.z - Math.cos(angToTarget) * camDist;

        camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
        camera.lookAt((p.x + tX) * 0.5, p.y + 1.6, (p.z + tZ) * 0.5);
      } else {
        targetReticleMesh.visible = false;

        // 3D Third-Person Camera Free Orbit
        const camYaw = camOrbitRef.current.yaw;
        const camPitch = camOrbitRef.current.pitch;
        const camDist = camOrbitRef.current.dist;

        const targetCamX = p.x + Math.sin(camYaw) * Math.cos(camPitch) * camDist;
        const targetCamY = p.y + 1.8 + Math.sin(camPitch) * camDist;
        const targetCamZ = p.z + Math.cos(camYaw) * Math.cos(camPitch) * camDist;

        camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
        camera.lookAt(p.x, p.y + 1.4, p.z);
      }

      fireLight.intensity = 3.0 + Math.sin(Date.now() * 0.02) * 0.8;

      // Gently bob the Bugis Boat on the lake surface
      bugisBoatGroup.position.y = -0.95 + Math.sin(Date.now() * 0.002) * 0.06;
      bugisBoatGroup.rotation.z = Math.sin(Date.now() * 0.0018) * 0.025;
      bugisBoatGroup.rotation.x = Math.cos(Date.now() * 0.0012) * 0.015;

      // Indonesian Regional Territory Sensor
      let zoneName = 'Dataran Kuil Mataram Kuno';
      if (Math.hypot(p.x - (-45), p.z - (-55)) < 18) {
        zoneName = 'Hutan Rimba Suku Dayak';
      } else if (Math.hypot(p.x - (-48), p.z - 42) < 22) {
        zoneName = 'Pesisir Phinisi Suku Bajo-Bugis';
      } else if (Math.hypot(p.x - 45, p.z - (-20)) < 18) {
        zoneName = 'Savana Ksatria Sakera Madura';
      } else if (Math.hypot(p.x - 65, p.z - (-48)) < 18) {
        zoneName = 'Tinggi Megalitikum Batu Hombo Nias';
      }

      // Indonesian Tribal NPCs Animation & Proximity Detection
      let foundNearNpc: TribalNpc | null = null;
      let closestNpcDist = 999;

      npcsList.forEach(({ group: nGroup, npc }) => {
        const d = Math.hypot(p.x - npc.x, p.z - npc.z);
        if (d < 14) {
          const lookAng = Math.atan2(p.x - npc.x, p.z - npc.z);
          nGroup.rotation.y = lookAng;
        }
        if (d < 4.0 && d < closestNpcDist) {
          closestNpcDist = d;
          foundNearNpc = npc;
        }
      });

      nearNpcRef.current = foundNearNpc;

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
        currentZone: zoneName,
        nearNpc: foundNearNpc,
        nearCookingPot: Math.hypot(p.x - 8, p.z - 8) < 4.5,
        playerX: p.x,
        playerZ: p.z,
        playerRotY: p.rotY
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
      grassTex.dispose();
      sheikahRuneTex.dispose();
      faceTex.dispose();
      shieldTex.dispose();
      skyTex.dispose();
      sunBillboardTex.dispose();
      renderer.dispose();
    };
  }, [playZeldaSfx]);

  // Keyboard Event Listeners (Bound once cleanly with zero lag)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.code) keysRef.current[e.code] = true;

      if (e.key === 'm' || e.key === 'M') {
        setIsMapOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsMapOpen(false);
      } else if (e.key === 'j' || e.key === 'J') {
        handleAttack();
      } else if (e.key === 'k' || e.key === 'K') {
        handleShootArrow();
      } else if (e.key === 'l' || e.key === 'L') {
        handleShieldDown();
      } else if (e.key === 'z' || e.key === 'Z') {
        toggleTargetLock();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleJump();
      } else if (e.key === 'Shift') {
        e.preventDefault();
        handleDash();
      } else if (e.key === 'q' || e.key === 'Q') {
        handleRemoteBomb();
      } else if (e.key === 'g' || e.key === 'G') {
        toggleParaglider();
      } else if (e.key === 'r' || e.key === 'R') {
        toggleShieldSurfing();
      } else if (e.key === 'e' || e.key === 'E') {
        if (nearNpcRef.current) {
          handleTalkToNpc(nearNpcRef.current);
        } else if (hudStats.nearCookingPot) {
          handleOpenCooking();
        } else {
          handleEatMeal();
        }
      } else if (e.key === '1') {
        equipWeapon('master_sword');
      } else if (e.key === '2') {
        equipWeapon('keris_mataram');
      } else if (e.key === '3') {
        equipWeapon('mandau_dayak');
      } else if (e.key === '4') {
        equipWeapon('celurit_madura');
      } else if (e.key === '5') {
        equipWeapon('badik_bugis');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
      if (e.code) keysRef.current[e.code] = false;
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

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
              <span>{NUSANTARA_WEAPONS[activeWeapon].icon}</span>
              <span className="hidden sm:inline">{NUSANTARA_WEAPONS[activeWeapon].name}</span>
              <span className="text-[10px] text-amber-400 font-mono">Dmg {NUSANTARA_WEAPONS[activeWeapon].damage}</span>
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

          {/* SHEIKAH SLATE RADAR & ENVIRONMENTAL SENSOR (Top Right) */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-none z-20">
            {/* Circular BotW Radar Minimap with Sheikah Slate Frame */}
            <div 
              onPointerDown={(e) => { e.preventDefault(); setIsMapOpen(true); }}
              className="group relative w-28 h-28 rounded-full bg-slate-950/90 border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center overflow-hidden pointer-events-auto cursor-pointer hover:border-cyan-300 hover:scale-105 active:scale-95 transition-all"
              title="Buka Peta Atlas Keberagaman Nusantara [M]"
            >
              {/* Radar Grid Rings */}
              <div className="absolute inset-2 rounded-full border border-cyan-500/20" />
              <div className="absolute inset-6 rounded-full border border-cyan-500/30" />
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-500/20" />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-500/20" />

              {/* Rotating Compass Outer Ring */}
              <div 
                className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
                style={{ transform: `rotate(${-hudStats.playerRotY}rad)` }}
              >
                <span className="absolute top-1 text-[9px] font-bold text-cyan-300 font-mono-tech">N</span>
                <span className="absolute right-1 text-[8px] font-bold text-slate-400 font-mono-tech">E</span>
                <span className="absolute bottom-1 text-[8px] font-bold text-slate-400 font-mono-tech">S</span>
                <span className="absolute left-1 text-[8px] font-bold text-slate-400 font-mono-tech">W</span>

                {/* Lake Klaten marker */}
                <div className="absolute top-16 left-3 w-5 h-5 rounded-full bg-sky-500/40 border border-sky-400/60" title="Danau Klaten" />
                
                {/* Campfire marker */}
                <div className="absolute top-12 right-12 w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Api Unggun" />

                {/* Bokoblin radar blip */}
                {bokoStatsRef.current.hp > 0 && (
                  <div className="absolute top-6 right-8 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]" title="Bokoblin" />
                )}

                {/* Guardian Stalker radar blip (flashing red alert eye) */}
                <div className="absolute bottom-5 right-5 w-3.5 h-3.5 rounded-full bg-red-600 border border-amber-300 animate-ping" title="Guardian" />
                <div className="absolute bottom-5 right-5 w-3.5 h-3.5 rounded-full bg-red-600 border border-amber-300 flex items-center justify-center text-[7px] font-black text-white" title="Guardian">👁️</div>
              </div>

              {/* Center Link Player Marker (Blue Triangle Arrow) */}
              <div className="relative z-10 w-4 h-4 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-cyan-300 drop-shadow-[0_0_6px_#22d3ee]" />
              </div>

              {/* Hover / Tap Map overlay pill badge */}
              <div className="absolute inset-0 bg-cyan-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-[8px] font-mono-tech font-bold text-slate-950 shadow">
                  [M] BUKA PETA
                </span>
              </div>
            </div>

            {/* Quick Map Button pill right under radar */}
            <button
              onPointerDown={(e) => { e.preventDefault(); setIsMapOpen(true); }}
              className="px-2.5 py-1 rounded-xl bg-slate-950/90 border border-cyan-400/60 hover:border-cyan-300 text-cyan-300 hover:text-white text-[10px] font-mono-tech font-bold shadow-lg flex items-center gap-1.5 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
              title="Buka Peta Atlas Nusantara [M]"
            >
              <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>[M] PETA ATLAS 🗺️</span>
            </button>

            {/* Environmental Sensors: Noise Meter & Thermometer & Quick Time Switcher */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-500/30 text-[10px] font-mono-tech text-cyan-300 shadow-md pointer-events-auto">
              {/* Noise sensor waveform */}
              <div className="flex items-end gap-0.5 h-3.5 pr-1 border-r border-slate-700" title="Sensor Kebisingan Suara (BotW)">
                <div className={`w-1 rounded-full bg-cyan-400 transition-all ${noiseDisplay >= 1 ? 'h-1.5' : 'h-0.5'}`} />
                <div className={`w-1 rounded-full bg-cyan-400 transition-all ${noiseDisplay >= 2 ? 'h-3' : 'h-0.5'}`} />
                <div className={`w-1 rounded-full bg-cyan-400 transition-all ${noiseDisplay >= 3 ? 'h-3.5' : 'h-0.5'}`} />
                <div className={`w-1 rounded-full bg-cyan-400 transition-all ${noiseDisplay >= 4 ? 'h-4 bg-amber-400' : 'h-0.5'}`} />
              </div>

              {/* Thermometer */}
              <div className="flex items-center gap-1 pr-1 border-r border-slate-700" title="Suhu Udara">
                <span className="text-xs">🌡️</span>
                <span className="font-bold text-slate-200">24°C</span>
              </div>

              {/* Quick Time of Day buttons */}
              <div className="flex items-center gap-1">
                <button
                  onPointerDown={(e) => { e.preventDefault(); setDayPhase('Siang'); }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${currentTimePhase === 'Siang' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Waktu Siang"
                >
                  ☀️
                </button>
                <button
                  onPointerDown={(e) => { e.preventDefault(); setDayPhase('Senja'); }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${currentTimePhase === 'Senja' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Waktu Senja"
                >
                  🌅
                </button>
                <button
                  onPointerDown={(e) => { e.preventDefault(); setDayPhase('Malam'); }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${currentTimePhase === 'Malam' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Waktu Malam"
                >
                  🌙
                </button>
              </div>
            </div>

            {/* Indonesian Regional Territory Sensor Badge */}
            <div className="px-2.5 py-1 rounded-xl bg-slate-950/90 border border-amber-500/40 text-[10px] font-mono-tech text-amber-300 shadow-md flex items-center gap-1.5 pointer-events-auto">
              <span>📍</span>
              <span className="font-bold">{hudStats.currentZone}</span>
            </div>
          </div>

          {/* BotW Circular Dynamic Stamina Wheel */}
          {hudStats.stamina < 100 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ml-14 pointer-events-none z-30 flex flex-col items-center drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]">
              <svg className="w-14 h-14 -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="28"
                  cy="28"
                  r="21"
                  className="stroke-slate-900/80 fill-none"
                  strokeWidth="5"
                />
                {/* Progress Ring */}
                <circle
                  cx="28"
                  cy="28"
                  r="21"
                  className={`fill-none transition-all duration-75 ${
                    hudStats.stamina < 25 
                      ? 'stroke-rose-500 animate-pulse drop-shadow-[0_0_8px_#f43f5e]' 
                      : 'stroke-emerald-400 drop-shadow-[0_0_8px_#34d399]'
                  }`}
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 21}
                  strokeDashoffset={(2 * Math.PI * 21) * (1 - hudStats.stamina / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className={`text-[10px] font-mono-tech font-bold -mt-1 ${hudStats.stamina < 25 ? 'text-rose-400 animate-ping' : 'text-emerald-300'}`}>
                {hudStats.stamina}%
              </span>
            </div>
          )}

          {/* Master Sword Awakened Sacred Banner */}
          {isSwordAwakened && (
            <div className="absolute top-16 left-4 px-3.5 py-1.5 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-bold text-xs font-mono-tech shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse flex items-center gap-2 pointer-events-none z-20">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              <span>🗡️ MASTER SWORD BANGKIT! (+55 Kekuatan Suci)</span>
            </div>
          )}

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
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full bg-cyan-500/90 text-slate-950 font-black text-xs font-mono-tech shadow-xl animate-pulse pointer-events-none flex items-center gap-2 z-20">
              <Zap className="w-4 h-4" />
              <span>3D FLURRY RUSH! TEKAN TEBAS SECEPATNYA!</span>
            </div>
          )}

          {/* Target Lock Banner */}
          {hudStats.isTargetLocked && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs font-mono-tech shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse flex items-center gap-2 pointer-events-none z-20">
              <Target className="w-4 h-4 text-slate-950 animate-spin" />
              <span>🎯 TARGET TERKUNCI: {hudStats.lockedTargetName?.toUpperCase()}!</span>
            </div>
          )}

          {/* Screen Notifications */}
          {hudStats.message && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-amber-500/95 text-slate-950 font-bold text-xs font-mono-tech shadow-lg animate-bounce pointer-events-none z-20">
              {hudStats.message}
            </div>
          )}

          {/* Context Action Prompt (Masak) */}
          {hudStats.nearCookingPot && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-400 text-amber-300 font-bold text-xs font-mono-tech shadow-lg animate-pulse flex items-center gap-2 pointer-events-none z-20">
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
            <button
              onPointerDown={(e) => { e.preventDefault(); setIsMapOpen(true); }}
              className="px-3.5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 active:from-cyan-500 active:to-blue-500 border border-cyan-300 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] active:scale-90 transition-all flex items-center gap-1.5 text-xs font-mono-tech font-bold cursor-pointer touch-none"
              title="Buka Peta Atlas Keberagaman Budaya Nusantara [M]"
            >
              <MapIcon className="w-4 h-4 text-cyan-200" />
              <span>PETA 🗺️</span>
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

          {/* FLOATING NPC PROMPT WHEN NEAR TRIBAL HERO */}
          {hudStats.nearNpc && !tribalDialogNpc && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleTalkToNpc(hudStats.nearNpc!);
                }}
                className="px-4 py-2.5 rounded-2xl bg-slate-950/90 border-2 font-mono-tech text-xs font-bold shadow-2xl flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all animate-bounce select-none"
                style={{
                  borderColor: hudStats.nearNpc.color,
                  boxShadow: `0 0 25px ${hudStats.nearNpc.color}60`,
                  color: hudStats.nearNpc.color
                }}
              >
                <span className="text-base">{hudStats.nearNpc.icon}</span>
                <span className="text-white font-black">
                  [E] BICARA DENGAN {hudStats.nearNpc.name.toUpperCase()}
                </span>
                <span className="text-[10px] opacity-80">({hudStats.nearNpc.tribe})</span>
              </button>
            </div>
          )}

          {/* TRIBAL HERO DIALOGUE MODAL */}
          {tribalDialogNpc && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4 text-center">
              <div
                className="space-y-3.5 max-w-md w-full p-6 rounded-3xl bg-slate-900/95 border-2 shadow-2xl animate-scale-in"
                style={{
                  borderColor: tribalDialogNpc.color,
                  boxShadow: `0 0 35px ${tribalDialogNpc.color}40`
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div className="flex items-center gap-3 text-left">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border"
                      style={{
                        backgroundColor: `${tribalDialogNpc.color}25`,
                        borderColor: tribalDialogNpc.color
                      }}
                    >
                      {tribalDialogNpc.icon}
                    </div>
                    <div>
                      <div
                        className="text-[11px] font-mono-tech font-bold uppercase tracking-wider"
                        style={{ color: tribalDialogNpc.color }}
                      >
                        {tribalDialogNpc.title}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black font-fun text-white">
                        {tribalDialogNpc.name}
                      </h3>
                      <div className="text-[10px] text-slate-400 font-mono-tech">
                        📍 {tribalDialogNpc.tribe}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-left space-y-2">
                  <p className="text-xs font-bold italic text-amber-200">
                    "{tribalDialogNpc.greeting}"
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {tribalDialogNpc.dialogue}
                  </p>
                </div>

                {/* Weapon Lore Box */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono-tech">
                  <span className="text-slate-400">Pusaka Kebanggaan:</span>
                  <span className="font-bold" style={{ color: tribalDialogNpc.color }}>
                    {tribalDialogNpc.weaponTaught}
                  </span>
                </div>

                {/* Gift Claiming Button */}
                {!claimedGifts[tribalDialogNpc.id] ? (
                  <button
                    onPointerDown={() => handleClaimGift(tribalDialogNpc)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs font-mono-tech cursor-pointer hover:scale-105 transition-all active:scale-95 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                  >
                    <span>🎁</span>
                    <span>KLAIM HADIAH: {tribalDialogNpc.giftText}</span>
                  </button>
                ) : (
                  <div className="py-2.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono-tech font-bold flex items-center justify-center gap-1.5">
                    <span>✅</span>
                    <span>Hadiah Persahabatan Telah Diterima!</span>
                  </div>
                )}

                <button
                  onPointerDown={() => setTribalDialogNpc(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs font-mono-tech cursor-pointer transition-all"
                >
                  KEMBALI BERTUALANG 🗺️
                </button>
              </div>
            </div>
          )}

          {/* SHEIKAH SLATE WORLD MAP & TRIBAL DIVERSITY CODEX MODAL [M] */}
          {isMapOpen && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col p-3 sm:p-5 text-slate-100 overflow-y-auto animate-fade-in font-sans">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-cyan-500/40 pb-3 mb-3 shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                    👁️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-xl font-black font-fun text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300">
                        PETA ATLAS KEBERAGAMAN SUKU NUSANTARA
                      </h3>
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-400/50 text-[10px] font-mono-tech text-cyan-300">
                        SHEIKAH SLATE CARTOGRAPHY
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono-tech text-cyan-200/80 mt-0.5">
                      <span>📍 Koordinat: X: {Math.round(hudStats.playerX)} | Z: {Math.round(hudStats.playerZ)}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-amber-300 font-bold">{hudStats.currentZone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onPointerDown={() => setIsMapOpen(false)}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 text-slate-300 hover:text-white text-xs font-mono-tech flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                    title="Tutup Peta [Esc / M]"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">TUTUP [ESC]</span>
                  </button>
                </div>
              </div>

              {/* Quick Region Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none shrink-0">
                <span className="text-[10px] font-mono-tech text-cyan-400 font-bold uppercase tracking-wider pr-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" /> Suku:
                </span>
                {Object.values(NUSANTARA_CODEX).map((codex) => {
                  const isSelected = selectedMapRegionId === codex.id;
                  return (
                    <button
                      key={codex.id}
                      onPointerDown={() => setSelectedMapRegionId(codex.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono-tech font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
                        isSelected
                          ? 'border-cyan-300 bg-cyan-950/80 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105 ring-1 ring-cyan-400'
                          : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{codex.icon}</span>
                      <span>{codex.tribe.replace(/^(Suku|Wangsa) /, '')}</span>
                    </button>
                  );
                })}
              </div>

              {/* Split Body: Map Canvas (Left/Top) + Cultural Codex Card (Right/Bottom) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 flex-1 min-h-0 overflow-y-auto">
                {/* LEFT: Sheikah Topographic Map Container (7 cols on lg) */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="relative w-full aspect-square max-h-[380px] sm:max-h-[440px] rounded-3xl bg-gradient-to-br from-slate-950 via-cyan-950/30 to-slate-950 border-2 border-cyan-500/50 shadow-[inset_0_0_40px_rgba(6,182,212,0.2)] overflow-hidden select-none">
                    {/* Topographic Background Grid & Radar Rings */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0891b212_1px,transparent_1px),linear-gradient(to_bottom,#0891b212_1px,transparent_1px)] bg-[size:20px_20px]" />
                    
                    {/* Concentric Sheikah Radar Range Rings */}
                    <div className="absolute inset-10 rounded-full border border-cyan-500/20 pointer-events-none" />
                    <div className="absolute inset-24 rounded-full border border-cyan-500/25 pointer-events-none" />
                    <div className="absolute inset-36 rounded-full border border-cyan-500/20 pointer-events-none" />

                    {/* Cardinal Compass Markers */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-500/40 text-[9px] font-mono-tech text-cyan-300 font-black">
                      UTARA (N)
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-500/40 text-[9px] font-mono-tech text-slate-400 font-black">
                      SELATAN (S)
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-500/40 text-[9px] font-mono-tech text-slate-400 font-black">
                      TIMUR (E)
                    </div>
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-500/40 text-[9px] font-mono-tech text-slate-400 font-black">
                      BARAT (W)
                    </div>

                    {/* Geographic Territorial Zones */}
                    {/* 1. Lembah Mataram (Amber Aura) */}
                    <div 
                      className="absolute rounded-3xl border border-amber-500/30 bg-amber-500/10 transition-all pointer-events-none"
                      style={{
                        left: `${((60 + 80) / 160) * 100}%`,
                        top: `${((-75 + 80) / 160) * 100}%`,
                        width: '20%',
                        height: '18%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <span className="absolute bottom-1 right-2 text-[8px] font-mono-tech text-amber-300/70 font-bold">Mataram</span>
                    </div>

                    {/* 2. Dayak Karst Rainforest (Green Aura) */}
                    <div 
                      className="absolute rounded-3xl border border-emerald-500/30 bg-emerald-500/10 transition-all pointer-events-none"
                      style={{
                        left: `${((-42 + 80) / 160) * 100}%`,
                        top: `${((-52 + 80) / 160) * 100}%`,
                        width: '22%',
                        height: '20%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <span className="absolute top-1 left-2 text-[8px] font-mono-tech text-emerald-300/70 font-bold">Rimba Dayak</span>
                    </div>

                    {/* 3. Madura Savana (Red Aura) */}
                    <div 
                      className="absolute rounded-3xl border border-rose-500/30 bg-rose-500/10 transition-all pointer-events-none"
                      style={{
                        left: `${((42 + 80) / 160) * 100}%`,
                        top: `${((-17 + 80) / 160) * 100}%`,
                        width: '18%',
                        height: '18%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <span className="absolute bottom-1 left-2 text-[8px] font-mono-tech text-rose-300/70 font-bold">Savana Sakera</span>
                    </div>

                    {/* 4. Bugis Danau Klaten (Blue Water Lake Shape) */}
                    <div 
                      className="absolute rounded-full border border-sky-400/50 bg-sky-500/25 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all pointer-events-none"
                      style={{
                        left: `${((-44 + 80) / 160) * 100}%`,
                        top: `${((39 + 80) / 160) * 100}%`,
                        width: '26%',
                        height: '26%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono-tech text-sky-200/80 font-bold text-center">
                        Danau Klaten<br/>(Phinisi Bajo)
                      </span>
                    </div>

                    {/* 5. Nias Megalith Highlands (Yellow Aura) */}
                    <div 
                      className="absolute rounded-3xl border border-yellow-500/30 bg-yellow-500/10 transition-all pointer-events-none"
                      style={{
                        left: `${((62 + 80) / 160) * 100}%`,
                        top: `${((-44 + 80) / 160) * 100}%`,
                        width: '18%',
                        height: '18%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <span className="absolute top-1 right-2 text-[8px] font-mono-tech text-yellow-300/70 font-bold">Megalit Nias</span>
                    </div>

                    {/* Landmark Pins: Cooking Pot, Bokoblin, Guardian */}
                    {/* Cooking pot & campfire pin */}
                    <div 
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
                      style={{
                        left: `${((8 + 80) / 160) * 100}%`,
                        top: `${((8 + 80) / 160) * 100}%`
                      }}
                      title="Panci Masak Tradisional"
                    >
                      <span className="text-xs filter drop-shadow">🍲</span>
                      <span className="text-[7px] font-mono-tech text-amber-300 bg-slate-950/80 px-1 rounded">Dapur Api</span>
                    </div>

                    {/* Bokoblin camp pin */}
                    {hudStats.bokoHp > 0 && (
                      <div 
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
                        style={{
                          left: `${((25 + 80) / 160) * 100}%`,
                          top: `${((-25 + 80) / 160) * 100}%`
                        }}
                        title="Musuh Bokoblin Merah"
                      >
                        <span className="text-xs filter drop-shadow">👹</span>
                        <span className="text-[7px] font-mono-tech text-rose-400 bg-slate-950/80 px-1 rounded">Bokoblin</span>
                      </div>
                    )}

                    {/* Guardian Stalker & Kuil Kuno Shrine */}
                    <div 
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
                      style={{
                        left: `${((75 + 80) / 160) * 100}%`,
                        top: `${((-75 + 80) / 160) * 100}%`
                      }}
                      title="Ancient Guardian & Kuil Kuno"
                    >
                      <span className="text-xs filter drop-shadow animate-pulse">🏛️</span>
                      <span className="text-[7px] font-mono-tech text-cyan-300 bg-slate-950/80 px-1 rounded">Kuil Kuno</span>
                    </div>

                    {/* Korok Pinwheel */}
                    <div 
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
                      style={{
                        left: `${((-6 + 80) / 160) * 100}%`,
                        top: `${((16 + 80) / 160) * 100}%`
                      }}
                      title="Kincir Angin Korok"
                    >
                      <span className="text-xs filter drop-shadow">🍃</span>
                      <span className="text-[7px] font-mono-tech text-emerald-300 bg-slate-950/80 px-1 rounded">Korok</span>
                    </div>

                    {/* Interactive 5 Tribal Territory Pins */}
                    {Object.values(NUSANTARA_CODEX).map((codex) => {
                      const isSelected = selectedMapRegionId === codex.id;
                      const pinLeft = ((codex.mapPos.x + 80) / 160) * 100;
                      const pinTop = ((codex.mapPos.z + 80) / 160) * 100;

                      return (
                        <button
                          key={codex.id}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            setSelectedMapRegionId(codex.id);
                          }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20 transition-all ${
                            isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                          }`}
                          style={{
                            left: `${pinLeft}%`,
                            top: `${pinTop}%`
                          }}
                        >
                          {/* Pulsing Beacon Halo */}
                          <div
                            className={`w-8 h-8 rounded-full absolute -top-1 animate-ping opacity-60 pointer-events-none`}
                            style={{ backgroundColor: codex.color }}
                          />
                          {/* Pin Icon Bubble */}
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-2xl flex items-center justify-center text-sm sm:text-base border-2 shadow-lg transition-all ${
                              isSelected
                                ? 'ring-2 ring-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.8)]'
                                : 'opacity-90 hover:opacity-100'
                            }`}
                            style={{
                              backgroundColor: `${codex.color}35`,
                              borderColor: codex.color,
                              color: codex.color
                            }}
                          >
                            {codex.icon}
                          </div>
                          {/* Pin Label */}
                          <span 
                            className={`text-[8px] sm:text-[9px] font-mono-tech font-black px-1.5 py-0.5 rounded-md mt-0.5 shadow whitespace-nowrap ${
                              isSelected
                                ? 'bg-white text-slate-950 ring-1 ring-cyan-400'
                                : 'bg-slate-950/90 text-slate-200 border border-slate-700'
                            }`}
                          >
                            {codex.hero}
                          </span>
                        </button>
                      );
                    })}

                    {/* LIVE PLAYER MARKER ("Peta Mengikuti" - Realtime Position & Direction Cone) */}
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-40 transition-all duration-75"
                      style={{
                        left: `${Math.max(4, Math.min(96, ((hudStats.playerX + 80) / 160) * 100))}%`,
                        top: `${Math.max(4, Math.min(96, ((hudStats.playerZ + 80) / 160) * 100))}%`
                      }}
                    >
                      {/* Direction Cone pointing along player's yaw */}
                      <div 
                        className="w-8 h-8 flex items-center justify-center transition-transform duration-75"
                        style={{
                          transform: `rotate(${180 - (hudStats.playerRotY * 180) / Math.PI}deg)`
                        }}
                      >
                        {/* Direction Arrow */}
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[13px] border-b-cyan-300 drop-shadow-[0_0_10px_#22d3ee] -mt-2" />
                      </div>

                      {/* Glowing Player Dot with Radar Ping */}
                      <div className="relative -mt-4 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping absolute opacity-80" />
                        <div className="w-3.5 h-3.5 rounded-full bg-cyan-300 border-2 border-white shadow-[0_0_12px_#38bdf8]" />
                      </div>

                      {/* Floating Link Label */}
                      <div className="mt-1 px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-400 text-[8px] font-mono-tech font-black text-cyan-200 shadow-md whitespace-nowrap">
                        🟢 LINK (KAMU)
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono-tech text-slate-400 px-1">
                    <span>💡 Tip: Tekan pin suku untuk melihat budaya & teleportasi Sheikah</span>
                    <span className="text-cyan-400 font-bold">Arena: 160m × 160m</span>
                  </div>
                </div>

                {/* RIGHT: Tribal Cultural Codex Card & Sheikah Teleporter (5 cols on lg) */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  {(() => {
                    const currentCodex = NUSANTARA_CODEX[selectedMapRegionId] || NUSANTARA_CODEX.mataram;
                    return (
                      <div 
                        className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border-2 shadow-2xl flex flex-col justify-between h-full space-y-3.5 animate-scale-in"
                        style={{
                          borderColor: currentCodex.color,
                          boxShadow: `0 0 30px ${currentCodex.color}30`
                        }}
                      >
                        {/* Card Header */}
                        <div>
                          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                            <div 
                              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border shrink-0"
                              style={{
                                backgroundColor: `${currentCodex.color}25`,
                                borderColor: currentCodex.color
                              }}
                            >
                              {currentCodex.icon}
                            </div>
                            <div>
                              <span 
                                className="text-[10px] font-mono-tech font-bold uppercase tracking-wider block"
                                style={{ color: currentCodex.color }}
                              >
                                {currentCodex.island}
                              </span>
                              <h4 className="text-lg sm:text-xl font-black font-fun text-white leading-tight">
                                {currentCodex.tribe}
                              </h4>
                              <span className="text-[11px] text-amber-300 font-mono-tech font-bold">
                                Tokoh Ksatria: {currentCodex.hero}
                              </span>
                            </div>
                          </div>

                          {/* Codex Cultural Details Content */}
                          <div className="space-y-2.5 mt-3 text-xs">
                            {/* Weapon info */}
                            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                              <span className="text-base">🗡️</span>
                              <div>
                                <span className="font-bold text-slate-400 block text-[10px] uppercase font-mono-tech">Senjata Pusaka:</span>
                                <span className="font-bold" style={{ color: currentCodex.color }}>
                                  {currentCodex.weapon}
                                </span>
                              </div>
                            </div>

                            {/* Traditional House */}
                            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                              <span className="text-base">🏛️</span>
                              <div>
                                <span className="font-bold text-slate-400 block text-[10px] uppercase font-mono-tech">Arsitektur Rumah Adat:</span>
                                <span className="text-slate-200">
                                  {currentCodex.traditionalHouse}
                                </span>
                              </div>
                            </div>

                            {/* Culture & Sacred Traditions */}
                            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                              <span className="text-base">🎭</span>
                              <div>
                                <span className="font-bold text-slate-400 block text-[10px] uppercase font-mono-tech">Upacara & Tradisi Sakral:</span>
                                <span className="text-slate-200 leading-relaxed">
                                  {currentCodex.cultureTradition}
                                </span>
                              </div>
                            </div>

                            {/* Ancestral Philosophy */}
                            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                              <span className="text-base">📜</span>
                              <div>
                                <span className="font-bold text-slate-400 block text-[10px] uppercase font-mono-tech">Filosofi Luhur:</span>
                                <span className="italic font-serif text-amber-200">
                                  "{currentCodex.philosophy}"
                                </span>
                              </div>
                            </div>

                            {/* Fun Fact */}
                            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2">
                              <span className="text-base">💡</span>
                              <div>
                                <span className="font-bold text-cyan-300 block text-[10px] uppercase font-mono-tech">Fakta Menarik Nusantara:</span>
                                <span className="text-cyan-100 text-[11px] leading-relaxed">
                                  {currentCodex.funFact}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sheikah Fast-Travel / Teleportation Action */}
                        <div className="pt-2">
                          <button
                            onPointerDown={(e) => {
                              e.preventDefault();
                              handleTeleportTo(currentCodex.mapPos.x, currentCodex.mapPos.z, currentCodex.regionName);
                            }}
                            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs font-mono-tech shadow-xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Zap className="w-4 h-4 text-yellow-300 animate-bounce" />
                            <span>⚡ TELEPORTASI SHEIKAH KE {currentCodex.tribe.toUpperCase()}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
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
                Pengalaman Zelda: Breath of the Wild paling nyata dengan tombol responsif! Memanjat tebing & pohon, meluncur di perisai (*Shield Surfing*), kunci target Z-Targeting, tembak panah 3D nyata, ledakkan bom Sheikah 3D, potong 6 kaki robot Guardian, nikmati musik piano ambient BOTW dan cuaca dinamis!
              </p>

              <div className="grid grid-cols-2 gap-2.5 my-5 text-xs text-left max-w-md font-mono-tech bg-slate-900/80 p-4 rounded-2xl border border-cyan-500/30 text-slate-300">
                <div>⚔️ <strong>[J]</strong> Tebas / Potong Kaki</div>
                <div>🏹 <strong>[K]</strong> Panah 3D Nyata</div>
                <div>🛡️ <strong>[L]</strong> Perisai / Parry 3D</div>
                <div>🎯 <strong>[Z]</strong> Kunci Target (Lock-On)</div>
                <div>🦘 <strong>[Spasi]</strong> Lompat / Panjat</div>
                <div>⚡ <strong>[Shift]</strong> Dash & Flurry 3D</div>
                <div>🏂 <strong>[R]</strong> Shield Surfing</div>
                <div>🪂 <strong>[G]</strong> Paraglider / Updraft</div>
                <div>💣 <strong>[Q]</strong> Bom Sheikah 3D</div>
                <div>🍲 <strong>[E]</strong> Masak / Bicara</div>
                <div className="col-span-2 text-cyan-300 font-bold border-t border-cyan-500/30 pt-1.5 mt-0.5">
                  🗺️ <strong>[M]</strong> Peta Atlas Nusantara & Teleportasi Suku 🇮🇩
                </div>
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
          {/* PUSAKA NUSANTARA (SENJATA SUKU ADAT 3D) SELECTOR STRIP */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🇮🇩</span>
                <span className="text-[11px] font-black text-amber-300 tracking-wider">
                  PUSAKA NUSANTARA (SENJATA SUKU 3D):
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-amber-200/70 font-mono hidden xs:inline">
                Pencet 1-5 di Keyboard / Tap Kartu
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
              {(Object.keys(NUSANTARA_WEAPONS) as TraditionalWeapon[]).map((wKey, idx) => {
                const w = NUSANTARA_WEAPONS[wKey];
                const isSelected = activeWeapon === wKey;
                return (
                  <button
                    key={wKey}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      equipWeapon(wKey);
                    }}
                    className={`p-1.5 sm:p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer touch-none select-none active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-1 ring-amber-300'
                        : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full text-[9px] font-bold text-slate-400">
                      <span className={`px-1 rounded ${isSelected ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'}`}>
                        {idx + 1}
                      </span>
                      <span className="text-amber-300 text-[9px] sm:text-[10px] font-mono">{w.damage}🗡️</span>
                    </div>
                    <div className="text-lg sm:text-2xl my-0.5 filter drop-shadow">
                      {w.icon}
                    </div>
                    <div className="text-[8.5px] sm:text-[10px] font-bold truncate max-w-full leading-tight">
                      {wKey === 'master_sword' ? 'Master' : wKey.replace(/_.*$/, '').toUpperCase()}
                    </div>
                    <div className="text-[7px] sm:text-[8px] text-slate-400 truncate max-w-full hidden sm:block">
                      {w.tribe.replace(/^(Suku|Wangsa) /, '')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons Row (10 Ergonomic Zero-Latency Buttons in 5-Column Grid) */}
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
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
              onPointerDown={(e) => { e.preventDefault(); handleJump(); }}
              className="p-2.5 rounded-2xl bg-emerald-600 active:bg-emerald-400 border border-emerald-300 text-white font-black flex flex-col items-center justify-center gap-1 shadow-md shadow-emerald-600/40 cursor-pointer active:scale-90 transition-all touch-none"
            >
              <Mountain className="w-5 h-5" />
              <span>LOMPAT</span>
            </button>

            <button
              onPointerDown={(e) => { e.preventDefault(); toggleTargetLock(); }}
              className={`p-2.5 rounded-2xl border font-black flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer active:scale-90 transition-all touch-none ${
                targetLocked
                  ? 'bg-amber-400 active:bg-amber-300 border-yellow-200 text-slate-950 shadow-amber-400/80 animate-pulse'
                  : 'bg-slate-800 active:bg-amber-600 border-amber-500/40 text-amber-300 active:text-white shadow-amber-500/30'
              }`}
            >
              <Target className="w-5 h-5" />
              <span>{targetLocked ? 'KUNCI' : 'LOCK'}</span>
            </button>

            <button
              onPointerDown={(e) => { e.preventDefault(); handleDash(); }}
              className="p-2.5 rounded-2xl bg-emerald-700 active:bg-emerald-500 border border-emerald-400 text-white font-black flex flex-col items-center justify-center gap-1 shadow-md shadow-emerald-700/40 cursor-pointer active:scale-90 transition-all touch-none"
            >
              <Zap className="w-5 h-5" />
              <span>DASH</span>
            </button>

            <button
              onPointerDown={(e) => { e.preventDefault(); toggleShieldSurfing(); }}
              className={`p-2.5 rounded-2xl border text-white font-black flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer active:scale-90 transition-all touch-none ${
                hudStats.isSurfing
                  ? 'bg-sky-400 active:bg-sky-300 border-sky-100 text-slate-950 shadow-sky-400/70 animate-pulse'
                  : 'bg-sky-600 active:bg-sky-400 border-sky-300 shadow-sky-600/40'
              }`}
            >
              <Shield className="w-5 h-5" />
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

          {/* Quick Guide Indicator */}
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-[11px] font-mono-tech text-cyan-200 shadow-md">
            <div className="flex items-center gap-1.5 font-bold flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/30 text-cyan-300 border border-cyan-400/50">W</span>
              <span className="text-slate-100">: MAJU ▲</span>
              <span className="text-slate-600">|</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">S</span>
              <span className="text-slate-100">: MUNDUR ▼</span>
              <span className="text-slate-600">|</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">A</span>
              <span className="text-slate-400">: Kiri ◀</span>
              <span className="text-slate-600">|</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">D</span>
              <span className="text-slate-400">: Kanan ▶</span>
            </div>
            <div className="text-[10px] text-amber-300 font-bold hidden sm:block">
              ⚔️ [1-5] Ganti Pusaka | 🎯 [Z] Kunci | 🗺️ [M] Peta Atlas | 🤸 S+Spasi Salto
            </div>
          </div>

          {/* D-Pad Navigation & Contextual Button */}
          <div className="flex items-center justify-between gap-4 pt-1">
            {/* D-Pad with Complete Pointer Safety & Clear W, A, S, D Labels */}
            <div className="grid grid-cols-3 gap-1.5 w-44 touch-none">
              <div />
              <button
                onPointerDown={(e) => { e.preventDefault(); touchDpadRef.current = { dx: 0, dy: -1 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerLeave={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerCancel={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="py-2 px-1 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-600 active:border-cyan-400 text-white font-black flex flex-col items-center justify-center shadow-md active:scale-90 transition-all touch-none select-none cursor-pointer"
                title="W : Maju ke Depan"
              >
                <span className="text-sm font-extrabold text-cyan-300 leading-tight">W</span>
                <span className="text-[8px] font-bold text-slate-200 tracking-tighter">MAJU ▲</span>
              </button>
              <div />
              <button
                onPointerDown={(e) => { e.preventDefault(); touchDpadRef.current = { dx: -1, dy: 0 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerLeave={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerCancel={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="py-2 px-1 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-600 active:border-cyan-400 text-white font-black flex flex-col items-center justify-center shadow-md active:scale-90 transition-all touch-none select-none cursor-pointer"
                title="A : Belok Kiri"
              >
                <span className="text-sm font-extrabold text-cyan-300 leading-tight">A</span>
                <span className="text-[8px] font-bold text-slate-200 tracking-tighter">◀ KIRI</span>
              </button>
              <div className="flex flex-col items-center justify-center text-[10px] text-slate-400">
                <Compass className="w-5 h-5 text-cyan-400" />
                <span className="text-[8px] font-bold font-mono-tech mt-0.5 text-cyan-300">WASD</span>
              </div>
              <button
                onPointerDown={(e) => { e.preventDefault(); touchDpadRef.current = { dx: 1, dy: 0 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerLeave={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerCancel={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="py-2 px-1 rounded-xl bg-slate-800 active:bg-cyan-600 border border-slate-600 active:border-cyan-400 text-white font-black flex flex-col items-center justify-center shadow-md active:scale-90 transition-all touch-none select-none cursor-pointer"
                title="D : Belok Kanan"
              >
                <span className="text-sm font-extrabold text-cyan-300 leading-tight">D</span>
                <span className="text-[8px] font-bold text-slate-200 tracking-tighter">KANAN ▶</span>
              </button>
              <div />
              <button
                onPointerDown={(e) => { e.preventDefault(); touchDpadRef.current = { dx: 0, dy: 1 }; }}
                onPointerUp={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerLeave={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                onPointerCancel={() => { touchDpadRef.current = { dx: 0, dy: 0 }; }}
                className="py-2 px-1 rounded-xl bg-slate-800 active:bg-emerald-600 border border-slate-600 active:border-emerald-400 text-white font-black flex flex-col items-center justify-center shadow-md active:scale-90 transition-all touch-none select-none cursor-pointer"
                title="S : Mundur"
              >
                <span className="text-sm font-extrabold text-emerald-300 leading-tight">S</span>
                <span className="text-[8px] font-bold text-slate-200 tracking-tighter">▼ MUNDUR</span>
              </button>
              <div />
            </div>

            {/* Contextual Action Button (Bicara Tokoh / Masak di Panci / Makan Bekal) */}
            <div className="flex-1 max-w-xs">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  if (hudStats.nearNpc) handleTalkToNpc(hudStats.nearNpc);
                  else if (hudStats.nearCookingPot) handleOpenCooking();
                  else handleEatMeal();
                }}
                className={`w-full py-4 px-4 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all touch-none ${
                  hudStats.nearNpc
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-amber-400/50 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 active:from-amber-400 active:to-yellow-400 text-slate-950 shadow-amber-500/40'
                }`}
              >
                {hudStats.nearNpc ? (
                  <>
                    <span className="text-base">{hudStats.nearNpc.icon}</span>
                    <span className="truncate">BICARA: {hudStats.nearNpc.name.toUpperCase()} 💬</span>
                  </>
                ) : hudStats.nearCookingPot ? (
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
