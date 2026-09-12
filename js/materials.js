/**
 * Materials & Procedural Textures Module
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 */
import * as THREE from 'three';

// 캔버스 기반 절차적 텍스처 캐시
const textureCache = new Map();

// Canvas roundRect 안전 폴리필
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r = 0) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

/**
 * 모바일 디바이스 화면용 UI 텍스처 생성
 */
export function createScreenTexture() {
  if (textureCache.has('screen')) return textureCache.get('screen');

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // 배경 (다크 그라데이션)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.5, '#1e1b4b');
  bgGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 1024);

  // 상단 상태바
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.fillText('10:46', 40, 60);

  // 상태바 아이콘 (배터리, 와이파이 시뮬레이션)
  ctx.fillStyle = '#10b981';
  ctx.fillRect(430, 44, 40, 18);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(470, 49, 4, 8);

  // 중앙 위젯: 3D 시뮬레이션 상태창
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.roundRect(40, 140, 432, 280, 24);
  ctx.fill();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Realize3D OS v2.5', 70, 195);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px sans-serif';
  ctx.fillText('사물 가상 구현 엔진 활성화됨', 70, 235);
  ctx.fillText('센서 캘리브레이션: 100% 정상', 70, 270);
  ctx.fillText('물리 가속도계: 9.81 m/s²', 70, 305);

  // 원형 링 게이지 그래픽
  ctx.beginPath();
  ctx.arc(380, 240, 45, 0, Math.PI * 1.5);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 10;
  ctx.stroke();

  // 하단 앱 그리드 아이콘들
  const icons = [
    { name: '시뮬레이션', color: '#3b82f6' },
    { name: '센서', color: '#10b981' },
    { name: '설계', color: '#f59e0b' },
    { name: '렌더', color: '#8b5cf6' },
    { name: '물리 엔진', color: '#ec4899' },
    { name: '분해도', color: '#06b6d4' },
    { name: 'CAD', color: '#64748b' },
    { name: '클라우드', color: '#14b8a6' }
  ];

  icons.forEach((icon, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const x = 55 + col * 105;
    const y = 490 + row * 125;

    ctx.fillStyle = icon.color;
    ctx.beginPath();
    ctx.roundRect(x, y, 70, 70, 18);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(icon.name, x + 35, y + 94);
  });

  // 하단 독 바
  ctx.textAlign = 'start';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(40, 880, 432, 90, 30);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set('screen', texture);
  return texture;
}

/**
 * 전자 회로 기판(PCB) 절차적 텍스처
 */
export function createPCBTexture() {
  if (textureCache.has('pcb')) return textureCache.get('pcb');

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // 녹색/다크블루 PCB 베이스
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(0, 0, 512, 512);

  // 금빛 구리 배선 라인들
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 20; i < 500; i += 30) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 20, 150);
    ctx.lineTo(i + 20, 350);
    ctx.lineTo(i + 60, 512);
  }
  ctx.stroke();

  // 칩 실장 구역
  ctx.fillStyle = '#18181b';
  ctx.fillRect(160, 160, 192, 192);

  // 칩 라벨
  ctx.fillStyle = '#e4e4e7';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('A16 REALIZER', 256, 250);
  ctx.font = '14px monospace';
  ctx.fillText('OCTA-CORE 4.2GHz', 256, 280);

  // 실버 솔더 패드들
  ctx.fillStyle = '#cbd5e1';
  for (let i = 0; i < 512; i += 24) {
    for (let j = 0; j < 512; j += 24) {
      if ((i < 150 || i > 360) || (j < 150 || j > 360)) {
        ctx.beginPath();
        ctx.arc(i, j, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set('pcb', texture);
  return texture;
}

/**
 * 카본 파이버(탄소섬유) 직조 텍스처
 */
export function createCarbonTexture() {
  if (textureCache.has('carbon')) return textureCache.get('carbon');

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, 0, 64, 64);

  ctx.fillStyle = '#292524';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillRect(32, 32, 32, 32);

  ctx.fillStyle = '#44403c';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillRect(32, 32, 16, 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  textureCache.set('carbon', texture);
  return texture;
}

/**
 * 원목 우드 그레인 절차적 텍스처
 */
export function createWoodTexture() {
  if (textureCache.has('wood')) return textureCache.get('wood');

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#d97706';
  ctx.fillRect(0, 0, 512, 512);

  for (let y = 0; y < 512; y += 4) {
    const alpha = 0.05 + Math.sin(y * 0.08) * 0.04;
    ctx.fillStyle = `rgba(120, 53, 15, ${alpha})`;
    ctx.fillRect(0, y, 512, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  textureCache.set('wood', texture);
  return texture;
}

/**
 * PBR 재질 프리셋 정의
 */
export const MaterialPresets = {
  aluminum: {
    name: '아노다이징 알루미늄',
    color: '#94a3b8',
    metalness: 0.85,
    roughness: 0.25,
    clearcoat: 0.1,
    transmission: 0,
    opacity: 1
  },
  chrome: {
    name: '유광 크롬',
    color: '#e2e8f0',
    metalness: 0.98,
    roughness: 0.05,
    clearcoat: 0.9,
    transmission: 0,
    opacity: 1
  },
  polymer: {
    name: '무광 테크 폴리머',
    color: '#1e293b',
    metalness: 0.1,
    roughness: 0.7,
    clearcoat: 0.0,
    transmission: 0,
    opacity: 1
  },
  glass: {
    name: '사파이어 글래스',
    color: '#e0f2fe',
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    opacity: 0.4,
    transparent: true,
    ior: 1.52
  },
  gold: {
    name: '골드 브래스',
    color: '#f59e0b',
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 0.3,
    transmission: 0,
    opacity: 1
  },
  carbon: {
    name: '카본 파이버',
    color: '#1f2937',
    metalness: 0.4,
    roughness: 0.35,
    clearcoat: 0.4,
    transmission: 0,
    opacity: 1
  },
  wood: {
    name: '내추럴 오크 원목',
    color: '#b45309',
    metalness: 0.05,
    roughness: 0.65,
    clearcoat: 0.05,
    transmission: 0,
    opacity: 1
  },
  cyber_neon: {
    name: '사이버 네온',
    color: '#06b6d4',
    metalness: 0.5,
    roughness: 0.2,
    emissive: '#0891b2',
    emissiveIntensity: 0.8,
    transmission: 0,
    opacity: 1
  }
};

/**
 * 프리셋 기반 Three.js PBR Material 인스턴스 생성
 */
export function createPBRMaterial(presetKey = 'aluminum', customProps = {}) {
  const preset = MaterialPresets[presetKey] || MaterialPresets.aluminum;
  const config = { ...preset, ...customProps };

  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.color),
    metalness: config.metalness ?? 0.5,
    roughness: config.roughness ?? 0.3,
    clearcoat: config.clearcoat ?? 0.0,
    clearcoatRoughness: 0.1,
    transmission: config.transmission ?? 0.0,
    opacity: config.opacity ?? 1.0,
    transparent: (config.opacity < 1.0) || (config.transmission > 0),
    wireframe: config.wireframe || false
  });

  if (config.emissive) {
    mat.emissive = new THREE.Color(config.emissive);
    mat.emissiveIntensity = config.emissiveIntensity || 0.5;
  }

  if (presetKey === 'carbon') {
    mat.map = createCarbonTexture();
  } else if (presetKey === 'wood') {
    mat.map = createWoodTexture();
  }

  return mat;
}
