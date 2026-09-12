/**
 * 3D Objects & Parametric Generators Module
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 */
import * as THREE from 'three';
import { 
  createPBRMaterial, 
  createScreenTexture, 
  createPCBTexture, 
  createCarbonTexture,
  createWoodTexture 
} from './materials.js';

/**
 * 1. 스마트 기기 (스마트폰 & 모듈형 부품 분해도) 사물 생성
 */
export function createSmartDevice() {
  const root = new THREE.Group();
  root.name = "스마트폰 어셈블리";

  const W = 7.2;   // 폭 (cm 단위 환산)
  const H = 15.0;  // 높이
  const D = 0.8;   // 전체 두께

  // 1-1. 메인 알루미늄 유니바디 프레임
  const frameShape = new THREE.Shape();
  const radius = 0.8;
  const halfW = W / 2;
  const halfH = H / 2;

  frameShape.moveTo(-halfW + radius, -halfH);
  frameShape.lineTo(halfW - radius, -halfH);
  frameShape.absarc(halfW - radius, -halfH + radius, radius, -Math.PI / 2, 0, false);
  frameShape.lineTo(halfW, halfH - radius);
  frameShape.absarc(halfW - radius, halfH - radius, radius, 0, Math.PI / 2, false);
  frameShape.lineTo(-halfW + radius, halfH);
  frameShape.absarc(-halfW + radius, halfH - radius, radius, Math.PI / 2, Math.PI, false);
  frameShape.lineTo(-halfW, -halfH + radius);
  frameShape.absarc(-halfW + radius, -halfH + radius, radius, Math.PI, Math.PI * 1.5, false);

  const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
    depth: D * 0.4,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.1,
    bevelThickness: 0.1
  });
  frameGeo.center();

  const frameMat = createPBRMaterial('aluminum', { color: '#475569', metalness: 0.9, roughness: 0.2 });
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  frameMesh.userData = {
    name: '알루미늄 섀시 프레임',
    desc: 'CNC 밀링 가공된 7000 시리즈 초경량 알루미늄 본체 프레임',
    basePos: new THREE.Vector3(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 0, 0),
    partId: 'frame'
  };
  root.add(frameMesh);

  // 1-2. 내부 메인보드 (로직 보드 & 칩셋)
  const pcbGeo = new THREE.BoxGeometry(W * 0.85, H * 0.35, 0.08);
  const pcbMat = new THREE.MeshStandardMaterial({
    map: createPCBTexture(),
    metalness: 0.3,
    roughness: 0.4
  });
  const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
  pcbMesh.position.set(0, H * 0.22, 0);
  pcbMesh.castShadow = true;
  pcbMesh.userData = {
    name: 'A16 바이오닉 로직 보드',
    desc: '4nm 공정 옥타코어 SoC 칩셋 및 12GB LPDDR5X 메모리 탑재 기판',
    basePos: new THREE.Vector3(0, H * 0.22, 0),
    explodeOffset: new THREE.Vector3(0, 1.2, 1.8),
    partId: 'pcb'
  };
  root.add(pcbMesh);

  // 1-3. 고밀도 리튬이온 배터리 팩
  const batGeo = new THREE.BoxGeometry(W * 0.82, H * 0.48, 0.18);
  const batMat = createPBRMaterial('aluminum', { color: '#0f172a', roughness: 0.5, metalness: 0.2 });
  const batMesh = new THREE.Mesh(batGeo, batMat);
  batMesh.position.set(0, -H * 0.18, 0);
  batMesh.castShadow = true;
  batMesh.userData = {
    name: '4,800mAh 리튬폴리머 배터리',
    desc: '듀얼 셀 고속 충전 지원 초슬림 고밀도 배터리 셀',
    basePos: new THREE.Vector3(0, -H * 0.18, 0),
    explodeOffset: new THREE.Vector3(0, -1.2, 1.8),
    partId: 'battery'
  };
  root.add(batMesh);

  // 1-4. 트리플 광학 카메라 모듈
  const camGroup = new THREE.Group();
  const camBaseGeo = new THREE.BoxGeometry(2.4, 2.6, 0.35);
  const camBaseMat = createPBRMaterial('polymer', { color: '#09090b', roughness: 0.2 });
  const camBase = new THREE.Mesh(camBaseGeo, camBaseMat);
  camGroup.add(camBase);

  // 3개의 렌즈 링
  const lensPositions = [
    [-0.6, 0.6, 0.2],
    [-0.6, -0.6, 0.2],
    [0.6, 0.0, 0.2]
  ];
  const ringGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.15, 32);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = createPBRMaterial('chrome');
  const lensGlassMat = createPBRMaterial('glass', { color: '#0284c7', roughness: 0.02 });

  lensPositions.forEach(pos => {
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(...pos);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.16, 24).rotateX(Math.PI / 2), lensGlassMat);
    ring.add(glass);
    camGroup.add(ring);
  });

  camGroup.position.set(-W * 0.25, H * 0.3, -0.25);
  camGroup.userData = {
    name: '트리플 광학 카메라 시스템',
    desc: '50MP 메인 광각(OIS) + 48MP 초광각 + 12MP 잠망경 망원 렌즈 모듈',
    basePos: new THREE.Vector3(-W * 0.25, H * 0.3, -0.25),
    explodeOffset: new THREE.Vector3(-1.5, 1.2, -2.4),
    partId: 'camera'
  };
  root.add(camGroup);

  // 1-5. 전면 OLED 디스플레이 패널
  const screenGeo = new THREE.PlaneGeometry(W * 0.94, H * 0.95);
  const screenMat = new THREE.MeshStandardMaterial({
    map: createScreenTexture(),
    roughness: 0.1,
    metalness: 0.1
  });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, 0, D * 0.21);
  screenMesh.userData = {
    name: '120Hz Super Retina OLED 패널',
    desc: '피크 밝기 2,600nits 가변 주사율 AMOLED 고해상도 디스플레이',
    basePos: new THREE.Vector3(0, 0, D * 0.21),
    explodeOffset: new THREE.Vector3(0, 0, 3.2),
    partId: 'screen'
  };
  root.add(screenMesh);

  // 1-6. 전면 강화 사파이어 글래스 커버
  const frontGlassGeo = new THREE.BoxGeometry(W * 0.96, H * 0.97, 0.05);
  const frontGlassMat = createPBRMaterial('glass', {
    color: '#f0f9ff',
    opacity: 0.25,
    roughness: 0.02,
    transmission: 0.95
  });
  const frontGlassMesh = new THREE.Mesh(frontGlassGeo, frontGlassMat);
  frontGlassMesh.position.set(0, 0, D * 0.25);
  frontGlassMesh.userData = {
    name: '전면 세라믹 쉴드 강화유리',
    desc: '나노 스케일 세라믹 크리스탈이 융합된 9H 경도 전면 보호 글래스',
    basePos: new THREE.Vector3(0, 0, D * 0.25),
    explodeOffset: new THREE.Vector3(0, 0, 4.5),
    partId: 'frontGlass'
  };
  root.add(frontGlassMesh);

  // 1-7. 후면 무광 매트 글래스 커버
  const backGlassGeo = new THREE.BoxGeometry(W * 0.96, H * 0.97, 0.06);
  const backGlassMat = createPBRMaterial('polymer', {
    color: '#334155',
    metalness: 0.2,
    roughness: 0.35,
    clearcoat: 0.6
  });
  const backGlassMesh = new THREE.Mesh(backGlassGeo, backGlassMat);
  backGlassMesh.position.set(0, 0, -D * 0.22);
  backGlassMesh.userData = {
    name: '후면 매트 질감 백 글래스',
    desc: '지문 방지 나노 에칭 처리된 정밀 무광 백 패널',
    basePos: new THREE.Vector3(0, 0, -D * 0.22),
    explodeOffset: new THREE.Vector3(0, 0, -3.5),
    partId: 'backGlass'
  };
  root.add(backGlassMesh);

  return root;
}

/**
 * 2. 기계 유성 기어 조립체 (Planetary Gear Assembly)
 */
export function createPlanetaryGearbox() {
  const root = new THREE.Group();
  root.name = "유성 기어 기계 조립체";

  // 치수 정의
  const module = 0.25;
  const sunTeeth = 16;
  const planetTeeth = 12;
  const ringTeeth = sunTeeth + 2 * planetTeeth; // 40
  const sunRadius = (sunTeeth * module);
  const planetRadius = (planetTeeth * module);
  const ringRadius = (ringTeeth * module);
  const orbitalRadius = sunRadius + planetRadius;
  const thickness = 1.0;

  // 기어 치형 메쉬 헬퍼 생성기
  function makeGearGeometry(radius, teeth, thick, innerHoleRadius = 0) {
    const shape = new THREE.Shape();
    const totalPoints = teeth * 2;
    for (let i = 0; i < totalPoints; i++) {
      const angle = (i / totalPoints) * Math.PI * 2;
      const isTip = (i % 2 === 1);
      const r = isTip ? radius + 0.3 : radius - 0.2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    if (innerHoleRadius > 0) {
      const hole = new THREE.Path();
      hole.absarc(0, 0, innerHoleRadius, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thick,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05
    });
    geo.center();
    return geo;
  }

  // 2-1. 선 기어 (Sun Gear - 중앙)
  const sunGeo = makeGearGeometry(sunRadius, sunTeeth, thickness, 0.6);
  const sunMat = createPBRMaterial('gold', { metalness: 0.9, roughness: 0.2 });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.castShadow = true;
  sunMesh.userData = {
    name: '중앙 구동 선 기어 (Sun Gear)',
    desc: '입력 샤프트와 직결되어 동력을 3개의 유성 기어로 분배하는 핵심 기어 (Z=16)',
    basePos: new THREE.Vector3(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 0, 3.5),
    partId: 'sunGear',
    gearRatio: 1.0
  };
  root.add(sunMesh);

  // 2-2. 3개의 유성 기어 (Planet Gears)
  const planetGroup = new THREE.Group();
  planetGroup.name = "유성 기어 군 (Planet Gears)";
  const planetGeo = makeGearGeometry(planetRadius, planetTeeth, thickness, 0.4);
  const planetMat = createPBRMaterial('chrome', { metalness: 0.85, roughness: 0.25 });

  const planets = [];
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const px = Math.cos(angle) * orbitalRadius;
    const py = Math.sin(angle) * orbitalRadius;

    const pMesh = new THREE.Mesh(planetGeo, planetMat);
    pMesh.position.set(px, py, 0);
    pMesh.castShadow = true;
    pMesh.userData = {
      name: `유성 기어 #${i + 1}`,
      desc: `선 기어와 링 기어 사이에서 공전 및 자전하며 감속 토크를 생성 (Z=12)`,
      angleOffset: angle,
      initialPos: new THREE.Vector3(px, py, 0),
      partId: `planet_${i}`
    };
    planetGroup.add(pMesh);
    planets.push(pMesh);
  }

  planetGroup.userData = {
    name: '3중 유성 기어 어셈블리',
    desc: '캐리어 핀에 지지되어 120도 등간격 배치된 유성 기어 세트',
    basePos: new THREE.Vector3(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 0, 1.8),
    partId: 'planetGroup'
  };
  root.add(planetGroup);

  // 2-3. 캐리어 플레이트 (Carrier Base)
  const carrierShape = new THREE.Shape();
  carrierShape.absarc(0, 0, orbitalRadius + 0.8, 0, Math.PI * 2);
  const carrierGeo = new THREE.ExtrudeGeometry(carrierShape, {
    depth: 0.4,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.05,
    bevelThickness: 0.05
  });
  carrierGeo.center();
  const carrierMat = createPBRMaterial('aluminum', { color: '#3b82f6', metalness: 0.7, roughness: 0.3 });
  const carrierMesh = new THREE.Mesh(carrierGeo, carrierMat);
  carrierMesh.position.set(0, 0, -thickness * 0.8);
  carrierMesh.userData = {
    name: '유성 기어 캐리어 (Carrier Plate)',
    desc: '유성 기어의 자전축을 일체화하여 최종 감속 회전 토크를 출력하는 회전 플레이트',
    basePos: new THREE.Vector3(0, 0, -thickness * 0.8),
    explodeOffset: new THREE.Vector3(0, 0, -2.2),
    partId: 'carrier'
  };
  root.add(carrierMesh);

  // 2-4. 외부 링 기어 (Outer Ring Gear)
  const ringOuterRadius = ringRadius + 1.2;
  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, ringOuterRadius, 0, Math.PI * 2);
  const ringHole = new THREE.Path();
  ringHole.absarc(0, 0, ringRadius - 0.2, 0, Math.PI * 2, true);
  ringShape.holes.push(ringHole);

  const ringGeo = new THREE.ExtrudeGeometry(ringShape, {
    depth: thickness * 1.3,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.05,
    bevelThickness: 0.05
  });
  ringGeo.center();
  const ringMat = createPBRMaterial('carbon', { color: '#27272a', roughness: 0.4 });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.userData = {
    name: '외륜 링 기어 하우징 (Ring Gear)',
    desc: '고정되어 반작용 지지력을 제공하는 내치 기어 하우징 (Z=40)',
    basePos: new THREE.Vector3(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, 0, -4.5),
    partId: 'ringGear'
  };
  root.add(ringMesh);

  // 동역학 애니메이션 업데이트 함수를 객체에 바인딩
  root.userData.updateMechanical = (time) => {
    const sunSpeed = 1.8;
    sunMesh.rotation.z = time * sunSpeed;
    
    // 유성 기어 공전 및 자전 (링 기어 고정 시 기어비)
    const carrierSpeed = sunSpeed * (sunTeeth / (sunTeeth + ringTeeth));
    planetGroup.rotation.z = time * carrierSpeed;

    planets.forEach((p) => {
      // 자전 속도 = -(선기어 - 캐리어) * (선기어잇수 / 유성기어잇수)
      const relativeSpin = -(sunSpeed - carrierSpeed) * (sunTeeth / planetTeeth);
      p.rotation.z = time * relativeSpin;
    });

    carrierMesh.rotation.z = time * carrierSpeed;
  };

  return root;
}

/**
 * 3. 파라메트릭 모던 가구 (Parametric Chair)
 */
export function createParametricChair(params = {}) {
  const {
    width = 4.8,       // 의자 좌판 폭
    depth = 4.5,       // 좌판 깊이
    seatHeight = 4.2,  // 좌판 높이
    backHeight = 4.8,  // 등받이 높이
    thickness = 0.4,   // 프레임 두께
    materialKey = 'wood'
  } = params;

  const root = new THREE.Group();
  root.name = "파라메트릭 체어";

  const chairMat = createPBRMaterial(materialKey);
  const metalMat = createPBRMaterial('aluminum', { color: '#1e293b', metalness: 0.9, roughness: 0.2 });

  // 3-1. 좌판 (Seat Cushion)
  const seatGeo = new THREE.BoxGeometry(width, thickness, depth);
  const seatMesh = new THREE.Mesh(seatGeo, chairMat);
  seatMesh.position.set(0, seatHeight, 0);
  seatMesh.castShadow = true;
  seatMesh.receiveShadow = true;
  seatMesh.userData = {
    name: '인체공학 성형 좌판',
    desc: '체압 분산 곡면 설계된 고탄성 쿠션 및 베이스 플레이트',
    basePos: new THREE.Vector3(0, seatHeight, 0),
    explodeOffset: new THREE.Vector3(0, 1.5, 0),
    partId: 'chairSeat'
  };
  root.add(seatMesh);

  // 3-2. 등받이 (Backrest)
  const backGeo = new THREE.BoxGeometry(width * 0.92, backHeight, thickness);
  const backMesh = new THREE.Mesh(backGeo, chairMat);
  backMesh.position.set(0, seatHeight + backHeight / 2 + 0.4, -depth / 2 + thickness / 2);
  backMesh.rotation.x = 0.12; // 뒤로 살짝 젖힘
  backMesh.castShadow = true;
  backMesh.userData = {
    name: '럼버 서포트 등받이 패널',
    desc: '척추 지지 각도(105도)로 기울어진 인체공학 백레스트',
    basePos: new THREE.Vector3(0, seatHeight + backHeight / 2 + 0.4, -depth / 2 + thickness / 2),
    explodeOffset: new THREE.Vector3(0, 1.8, -2.0),
    partId: 'chairBack'
  };
  root.add(backMesh);

  // 3-3. 4개 스틸 레그 (Legs)
  const legPositions = [
    [-width * 0.42, -depth * 0.4],
    [width * 0.42, -depth * 0.4],
    [-width * 0.42, depth * 0.4],
    [width * 0.42, depth * 0.4]
  ];

  const legGeo = new THREE.CylinderGeometry(0.12, 0.18, seatHeight, 16);
  const legsGroup = new THREE.Group();
  legsGroup.name = "다리 프레임 세트";

  legPositions.forEach(([lx, lz], idx) => {
    const leg = new THREE.Mesh(legGeo, metalMat);
    leg.position.set(lx, seatHeight / 2, lz);
    // 바깥쪽으로 약간 기울임
    leg.rotation.z = (lx > 0 ? -0.06 : 0.06);
    leg.rotation.x = (lz > 0 ? 0.06 : -0.06);
    leg.castShadow = true;
    legsGroup.add(leg);
  });

  legsGroup.userData = {
    name: '테이퍼드 스틸 4점 지지 레그',
    desc: '정전기 분체 도장된 고강도 튜브 스틸 레그 어셈블리',
    basePos: new THREE.Vector3(0, 0, 0),
    explodeOffset: new THREE.Vector3(0, -2.0, 0),
    partId: 'chairLegs'
  };
  root.add(legsGroup);

  return root;
}

/**
 * 4. 물리 역학 시뮬레이션 사물 군 (Physics Arena Objects)
 */
export function createPhysicsArenaObjects() {
  const root = new THREE.Group();
  root.name = "물리 역학 시뮬레이션 랩";

  // 색상 팔레트
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  // 4-1. 도미노 체인 (12개 연속 배치)
  const dominoGroup = new THREE.Group();
  dominoGroup.name = "도미노 연쇄 충돌 열";
  const dominoGeo = new THREE.BoxGeometry(0.4, 2.2, 1.0);

  for (let i = 0; i < 10; i++) {
    const dMat = createPBRMaterial('aluminum', {
      color: colors[i % colors.length],
      metalness: 0.3,
      roughness: 0.3
    });
    const dMesh = new THREE.Mesh(dominoGeo, dMat);
    dMesh.position.set(-6 + i * 1.3, 1.1, 0);
    dMesh.castShadow = true;
    dMesh.userData = {
      isPhysics: true,
      type: 'box',
      mass: 0.8,
      size: [0.4, 2.2, 1.0],
      initialPos: new THREE.Vector3(-6 + i * 1.3, 1.1, 0),
      partId: `domino_${i}`,
      name: `도미노 블록 #${i + 1}`
    };
    dominoGroup.add(dMesh);
  }
  root.add(dominoGroup);

  // 4-2. 타워 적층 큐브 블록들 (Pyramid Tower)
  const cubeGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
  const towerGroup = new THREE.Group();
  towerGroup.name = "적층 큐브 타워";

  const towerLevels = [
    { count: 3, y: 0.5, zOff: 4 },
    { count: 2, y: 1.5, zOff: 4 },
    { count: 1, y: 2.5, zOff: 4 }
  ];

  towerLevels.forEach((lvl, lIdx) => {
    for (let c = 0; c < lvl.count; c++) {
      const x = (c - (lvl.count - 1) / 2) * 1.1 + 4;
      const cMat = createPBRMaterial('polymer', {
        color: colors[(lIdx + c) % colors.length],
        roughness: 0.2
      });
      const cMesh = new THREE.Mesh(cubeGeo, cMat);
      cMesh.position.set(x, lvl.y, lvl.zOff);
      cMesh.castShadow = true;
      cMesh.userData = {
        isPhysics: true,
        type: 'box',
        mass: 1.2,
        size: [1.0, 1.0, 1.0],
        initialPos: new THREE.Vector3(x, lvl.y, lvl.zOff),
        partId: `cube_${lIdx}_${c}`,
        name: `구조 큐브 L${lIdx + 1}-${c + 1}`
      };
      towerGroup.add(cMesh);
    }
  });
  root.add(towerGroup);

  // 4-3. 튕기는 반발력 구체들 (Bouncing Spheres)
  const sphereGeo = new THREE.SphereGeometry(0.7, 32, 32);
  for (let s = 0; s < 3; s++) {
    const sMat = createPBRMaterial('chrome', {
      color: colors[s + 2],
      metalness: 0.9,
      roughness: 0.1
    });
    const sMesh = new THREE.Mesh(sphereGeo, sMat);
    const startX = -2 + s * 2.2;
    const startY = 7 + s * 2;
    const startZ = -3;
    sMesh.position.set(startX, startY, startZ);
    sMesh.castShadow = true;
    sMesh.userData = {
      isPhysics: true,
      type: 'sphere',
      radius: 0.7,
      mass: 2.5,
      initialPos: new THREE.Vector3(startX, startY, startZ),
      partId: `sphere_${s}`,
      name: `역학 구체 (탄성체) #${s + 1}`
    };
    root.add(sMesh);
  }

  return root;
}
