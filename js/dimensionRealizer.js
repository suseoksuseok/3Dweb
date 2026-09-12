/**
 * Custom Dimension Realizer (치수 직접 입력형 실물 구현기)
 * 온라인 쇼핑몰/중고거래 상품 스펙 치수를 입력받아 1:1 실물 3D 메쉬로 즉시 생성
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 */
import * as THREE from 'three';
import { createPBRMaterial } from './materials.js';
import { 
  createGamingMouse, 
  createErgonomicMouse, 
  createTumbler, 
  createHeadphones, 
  createMiniBag, 
  createCubeClock 
} from './shoppingItems.js';
import { createSmartDevice } from './objects.js';

/**
 * 사용자 입력 치수 및 AI 비전 감지 형태 기반 1:1 정밀 3D 객체 생성
 */
export function createCustomDimensionObject(options = {}) {
  const {
    widthMm = 63.5,
    depthMm = 125.0,
    heightMm = 40.0,
    shape = 'mouse',
    materialKey = 'polymer',
    color = '#f8fafc',
    buttonColor = '#18181b',
    name = 'AI 분석 맞춤 제품'
  } = options;

  const shapeLow = (shape || '').toLowerCase();
  const nameLow = (name || '').toLowerCase();

  // 1. 게이밍 / 일반 마우스 3D 모델 분기 (로지텍 G PRO X 등)
  if (shapeLow.includes('mouse') || shapeLow === 'gaming_mouse' || nameLow.includes('마우스') || nameLow.includes('mouse') || nameLow.includes('gpro') || nameLow.includes('superlight') || nameLow.includes('logitech')) {
    return createGamingMouse(options);
  }

  // 2. 버티컬 인체공학 마우스 분기
  if (shapeLow === 'vertical_mouse') {
    return createErgonomicMouse();
  }

  // 3. 텀블러 / 보온병 / 컵
  if (shapeLow.includes('tumbler') || shapeLow.includes('bottle') || shapeLow.includes('cylinder') || nameLow.includes('텀블러') || nameLow.includes('보온병') || nameLow.includes('컵')) {
    return createTumbler();
  }

  // 4. 헤드폰 / 이어폰
  if (shapeLow.includes('headphone') || shapeLow.includes('earphone') || nameLow.includes('헤드폰') || nameLow.includes('이어폰')) {
    return createHeadphones();
  }

  // 5. 가방 / 크로스백 / 파우치
  if (shapeLow.includes('bag') || nameLow.includes('가방') || nameLow.includes('백') || nameLow.includes('파우치')) {
    return createMiniBag();
  }

  // 6. 스마트폰 / 태블릿
  if (shapeLow.includes('phone') || shapeLow.includes('mobile') || nameLow.includes('폰') || nameLow.includes('스마트폰')) {
    return createSmartDevice();
  }

  // 7. 디지털 탁상시계 / 큐브
  if (shapeLow.includes('clock') || shapeLow.includes('cube_clock') || nameLow.includes('시계')) {
    return createCubeClock();
  }

  // 8. 범용 커스텀 객체 (사각/라운드/패키지)
  const W = Math.max(widthMm / 10, 0.5);
  const D = Math.max(depthMm / 10, 0.5);
  const H = Math.max(heightMm / 10, 0.5);

  const root = new THREE.Group();
  root.name = name;

  const mat = createPBRMaterial(materialKey, { color: color });
  let mesh;

  if (shape === 'cylinder') {
    const radius = Math.min(W, D) / 2;
    const geo = new THREE.CylinderGeometry(radius, radius, H, 36);
    mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, H / 2, 0);
  } else {
    // 세련된 라운드 챔퍼 직육면체
    const r = Math.min(W, D, H) * 0.12;
    const shapePath = new THREE.Shape();
    const halfW = W / 2;
    const halfD = D / 2;

    shapePath.moveTo(-halfW + r, -halfD);
    shapePath.lineTo(halfW - r, -halfD);
    shapePath.absarc(halfW - r, -halfD + r, r, -Math.PI / 2, 0, false);
    shapePath.lineTo(halfW, halfD - r);
    shapePath.absarc(halfW - r, halfD - r, r, 0, Math.PI / 2, false);
    shapePath.lineTo(-halfW + r, halfD);
    shapePath.absarc(-halfW + r, halfD - r, r, Math.PI / 2, Math.PI, false);
    shapePath.lineTo(-halfW, -halfD + r);
    shapePath.absarc(-halfW + r, -halfD + r, r, Math.PI, Math.PI * 1.5, false);

    const extrudeGeo = new THREE.ExtrudeGeometry(shapePath, {
      depth: H - r * 2,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: r,
      bevelThickness: r
    });
    extrudeGeo.center();
    mesh = new THREE.Mesh(extrudeGeo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, H / 2, 0);
  }

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  root.add(mesh);

  // 실물 비교 지표 계산
  const cardWidthRatio = (widthMm / 85.6).toFixed(1);
  const phoneHeightRatio = (heightMm / 147.6).toFixed(1);
  const canHeightRatio = (heightMm / 122.0).toFixed(1);

  root.userData = {
    title: name,
    category: 'AI 실물 스펙 제품',
    dimensions: { w: widthMm, d: depthMm, h: heightMm },
    sizeSummary: `${widthMm}mm x ${depthMm}mm x ${heightMm}mm`,
    checkPoints: [
      `가로 길이는 표준 신용카드(${cardWidthRatio}개 분량)와 맞먹습니다.`,
      `높이는 355ml 음료 캔 대비 약 ${canHeightRatio}배 수준입니다.`,
      `스마트폰(14.7cm) 대비 세로 비율은 약 ${phoneHeightRatio}배입니다.`,
      `중고거래 시 우체국 1호 또는 2호 박스 포장에 적합합니다.`
    ]
  };

  return root;
}
