/**
 * E-Commerce & Secondhand Trade Product Presets
 * 온라인 쇼핑 및 중고거래 대표 실물 사물 모듈
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 * 
 * 1 Unit = 10mm (1cm) 정밀 실물 척도
 */
import * as THREE from 'three';
import { createPBRMaterial } from './materials.js';

/**
 * 1. 500ml 스테인리스 보온 텀블러 (Tumbler)
 * 규격: 지름 7.2cm (72mm), 높이 22.5cm (225mm)
 */
export function createTumbler() {
  const root = new THREE.Group();
  root.name = '보온 텀블러 500ml';

  const radius = 3.6;
  const height = 22.5;

  // 본체 실린더
  const bodyGeo = new THREE.CylinderGeometry(radius, radius * 0.92, height * 0.85, 36);
  const bodyMat = createPBRMaterial('polymer', { color: '#0284c7', roughness: 0.35, metalness: 0.1 });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.set(0, (height * 0.85) / 2, 0);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  root.add(bodyMesh);

  // 상단 스크류 캡 & 뚜껑
  const capGeo = new THREE.CylinderGeometry(radius * 0.95, radius, height * 0.15, 36);
  const capMat = createPBRMaterial('aluminum', { color: '#1e293b', roughness: 0.2, metalness: 0.8 });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.set(0, height * 0.85 + (height * 0.15) / 2, 0);
  capMesh.castShadow = true;
  root.add(capMesh);

  // 음용구 팝업 링
  const lipGeo = new THREE.TorusGeometry(radius * 0.75, 0.25, 16, 32);
  lipGeo.rotateX(Math.PI / 2);
  const lipMat = createPBRMaterial('chrome');
  const lipMesh = new THREE.Mesh(lipGeo, lipMat);
  lipMesh.position.set(0, height + 0.2, 0);
  root.add(lipMesh);

  root.userData = {
    title: '500ml 슬림 스테인리스 텀블러',
    category: '생활/주방',
    dimensions: { w: 72, d: 72, h: 225 },
    sizeSummary: '지름 72mm x 높이 225mm',
    checkPoints: [
      '차량 컵홀더(보통 75~80mm)에 쏙 들어가는 표준 슬림 규격입니다.',
      '음료 캔(12.2cm)보다 약 1.8배 높으며, 스마트폰보다 세로로 약 7.5cm 더 깁니다.',
      '백팩 옆면 사이드 메쉬 포켓에 텀블러가 안정적으로 들어갑니다.'
    ]
  };

  return root;
}

/**
 * 2. 무선 노이즈캔슬링 오버이어 헤드폰 (Headphones)
 * 규격: 폭 17.5cm (175mm), 높이 19.5cm (195mm), 이어컵 깊이 8.0cm
 */
export function createHeadphones() {
  const root = new THREE.Group();
  root.name = '무선 오버이어 헤드폰';

  // 2-1. 헤드밴드 아치
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-8.0, 8.0, 0),
    new THREE.Vector3(-6.5, 16.5, 0),
    new THREE.Vector3(0, 19.5, 0),
    new THREE.Vector3(6.5, 16.5, 0),
    new THREE.Vector3(8.0, 8.0, 0)
  ]);
  const bandGeo = new THREE.TubeGeometry(curve, 32, 0.8, 16, false);
  const bandMat = createPBRMaterial('polymer', { color: '#0f172a', roughness: 0.4 });
  const bandMesh = new THREE.Mesh(bandGeo, bandMat);
  bandMesh.castShadow = true;
  root.add(bandMesh);

  // 헤드밴드 가죽 쿠션 패드
  const padGeo = new THREE.BoxGeometry(9.0, 0.8, 2.5);
  const padMat = createPBRMaterial('polymer', { color: '#18181b', roughness: 0.6 });
  const padMesh = new THREE.Mesh(padGeo, padMat);
  padMesh.position.set(0, 18.8, 0);
  root.add(padMesh);

  // 2-2. 좌우 이어컵 어셈블리
  const earCupMat = createPBRMaterial('aluminum', { color: '#64748b', metalness: 0.8, roughness: 0.2 });
  const cushionMat = createPBRMaterial('polymer', { color: '#09090b', roughness: 0.8 });

  [-7.8, 7.8].forEach((xPos, idx) => {
    const cupGroup = new THREE.Group();
    cupGroup.position.set(xPos, 8.0, 0);
    cupGroup.rotation.z = idx === 0 ? 0.15 : -0.15;

    // 외측 캔 (알루미늄)
    const outCupGeo = new THREE.CylinderGeometry(3.8, 3.6, 2.4, 32);
    outCupGeo.rotateZ(Math.PI / 2);
    const outCup = new THREE.Mesh(outCupGeo, earCupMat);
    outCup.castShadow = true;
    cupGroup.add(outCup);

    // 내측 메모리폼 이어쿠션
    const inCushGeo = new THREE.TorusGeometry(3.4, 0.9, 16, 32);
    inCushGeo.rotateY(Math.PI / 2);
    const inCush = new THREE.Mesh(inCushGeo, cushionMat);
    inCush.position.x = idx === 0 ? 1.0 : -1.0;
    cupGroup.add(inCush);

    root.add(cupGroup);
  });

  root.userData = {
    title: '무선 노이즈캔슬링 오버이어 헤드폰',
    category: '음향/전자기기',
    dimensions: { w: 175, d: 80, h: 195 },
    sizeSummary: '175mm x 80mm x 195mm',
    checkPoints: [
      '성인 남녀 착용 시 귀 전체를 감싸는 풀사이즈(Over-ear) 규격입니다.',
      'A4 용지 세로(29.7cm)의 약 2/3 크기이며, 접었을 때 가방 파우치에 컴팩트하게 수납됩니다.',
      '신용카드 가로(8.5cm)보다 이어컵 폭이 살짝 더 큰 넉넉한 차음성 핏입니다.'
    ]
  };

  return root;
}

/**
 * 3. 미니 가죽 크로스백 (Mini Leather Crossbody Bag)
 * 규격: 가로 21.0cm (210mm), 세로 6.5cm (65mm), 높이 14.5cm (145mm)
 */
export function createMiniBag() {
  const root = new THREE.Group();
  root.name = '미니 가죽 크로스백';

  const W = 21.0;
  const H = 14.5;
  const D = 6.5;

  // 가방 본체 (부드러운 사각)
  const bagGeo = new THREE.BoxGeometry(W, H, D);
  const bagMat = createPBRMaterial('polymer', { color: '#451a03', roughness: 0.5, clearcoat: 0.3 });
  const bagMesh = new THREE.Mesh(bagGeo, bagMat);
  bagMesh.position.set(0, H / 2, 0);
  bagMesh.castShadow = true;
  root.add(bagMesh);

  // 상단 플랩(덮개)
  const flapGeo = new THREE.BoxGeometry(W * 1.02, H * 0.65, D * 1.04);
  const flapMat = createPBRMaterial('polymer', { color: '#271202', roughness: 0.45, clearcoat: 0.4 });
  const flapMesh = new THREE.Mesh(flapGeo, flapMat);
  flapMesh.position.set(0, H * 0.72, 0.1);
  flapMesh.castShadow = true;
  root.add(flapMesh);

  // 골드 버클 장식
  const buckleGeo = new THREE.BoxGeometry(2.8, 2.2, 0.8);
  const buckleMat = createPBRMaterial('gold', { metalness: 0.95, roughness: 0.15 });
  const buckleMesh = new THREE.Mesh(buckleGeo, buckleMat);
  buckleMesh.position.set(0, H * 0.45, D / 2 + 0.45);
  root.add(buckleMesh);

  // 상단 스트랩 체인 고리
  const ringGeo = new THREE.TorusGeometry(0.9, 0.25, 12, 24);
  [-W * 0.45, W * 0.45].forEach(rx => {
    const rMesh = new THREE.Mesh(ringGeo, buckleMat);
    rMesh.position.set(rx, H + 0.4, 0);
    root.add(rMesh);
  });

  root.userData = {
    title: '클래식 가죽 미니 크로스백',
    category: '패션/잡화',
    dimensions: { w: 210, d: 65, h: 145 },
    sizeSummary: '210mm x 65mm x 145mm',
    checkPoints: [
      '스마트폰(아이폰 Pro Max 16cm 기준)이 가로로 여유 있게 쏙 들어갑니다.',
      '신용카드 가로(8.5cm)의 약 2.4배 길이로, 지갑, 차키, 쿠션 팩트가 한 번에 수납되는 실용적 크기입니다.',
      '우체국 1호 또는 2호 박스로 중고거래 택배 발송에 딱 적합합니다.'
    ]
  };

  return root;
}

/**
 * 4. 인체공학 버티컬 마우스 (Ergonomic Vertical Mouse)
 * 규격: 가로 7.5cm (75mm), 세로 12.0cm (120mm), 높이 7.8cm (78mm)
 */
export function createErgonomicMouse() {
  const root = new THREE.Group();
  root.name = '버티컬 인체공학 마우스';

  const W = 7.5;
  const L = 12.0;
  const H = 7.8;

  // 본체 형태
  const mouseGeo = new THREE.ConeGeometry(W * 0.6, H, 24);
  mouseGeo.rotateZ(-0.25); // 57도 인체공학 경사각
  mouseGeo.scale(1.0, 1.0, L / W);
  const mouseMat = createPBRMaterial('polymer', { color: '#1e293b', roughness: 0.35 });
  const mouseMesh = new THREE.Mesh(mouseGeo, mouseMat);
  mouseMesh.position.set(0, H / 2, 0);
  mouseMesh.castShadow = true;
  root.add(mouseMesh);

  // 엄지 받침대 (Thumb rest)
  const restGeo = new THREE.BoxGeometry(2.2, 0.4, 7.0);
  const restMat = createPBRMaterial('polymer', { color: '#0f172a', roughness: 0.7 });
  const restMesh = new THREE.Mesh(restGeo, restMat);
  restMesh.position.set(-W * 0.38, 0.8, 0);
  root.add(restMesh);

  // 메탈 스크롤 휠
  const wheelGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 24);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = createPBRMaterial('aluminum', { metalness: 0.9, roughness: 0.1 });
  const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
  wheelMesh.position.set(1.5, H * 0.65, -1.8);
  root.add(wheelMesh);

  root.userData = {
    title: '57도 그립 인체공학 버티컬 무선 마우스',
    category: '컴퓨터/디지털',
    dimensions: { w: 75, d: 120, h: 78 },
    sizeSummary: '75mm x 120mm x 78mm',
    checkPoints: [
      '성인 손바닥(18cm)으로 감쌌을 때 손목 꺾임 없이 손바닥 안쪽에 꽉 차는 풀 그립감입니다.',
      '일반 납작한 마우스(높이 3~4cm)보다 높이가 2배 높아 책상 서랍/파우치 수납 시 높이를 확인하세요.',
      '신용카드 길이(8.5cm)와 폭이 거의 비슷하며, 마우스패드 위에서 안정적인 접지 면적을 제공합니다.'
    ]
  };

  return root;
}

/**
 * 5. 인테리어 큐브 디지털 탁상시계 (Cube Ambient Clock)
 * 규격: 가로 12.0cm, 세로 12.0cm, 높이 12.0cm (120 x 120 x 120 mm)
 */
export function createCubeClock() {
  const root = new THREE.Group();
  root.name = '큐브 무드등 탁상시계';

  const size = 12.0;
  const cubeGeo = new THREE.BoxGeometry(size, size, size);
  const cubeMat = createPBRMaterial('wood', { color: '#78350f', roughness: 0.6 });
  const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
  cubeMesh.position.set(0, size / 2, 0);
  cubeMesh.castShadow = true;
  root.add(cubeMesh);

  // 전면 디지털 LED 시간 텍스처 (절차적 생성)
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 96px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('10:48', 256, 260);
  ctx.font = '36px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('24.5°C  |  52% RH', 256, 340);

  const ledTex = new THREE.CanvasTexture(canvas);
  const ledGeo = new THREE.PlaneGeometry(size * 0.95, size * 0.95);
  const ledMat = new THREE.MeshBasicMaterial({
    map: ledTex,
    transparent: true,
    opacity: 0.9
  });
  const ledMesh = new THREE.Mesh(ledGeo, ledMat);
  ledMesh.position.set(0, size / 2, size / 2 + 0.05);
  root.add(ledMesh);

  root.userData = {
    title: '원목 큐브 LED 디지털 탁상시계',
    category: '가구/인테리어',
    dimensions: { w: 120, d: 120, h: 120 },
    sizeSummary: '120mm x 120mm x 120mm 정육면체',
    checkPoints: [
      '음료수 캔(높이 12.2cm)과 높이가 완전히 동일한 콤팩트한 큐브형 소품입니다.',
      '침대 협탁이나 모니터 받침대 옆에 두었을 때 시야를 가리지 않는 최적의 인테리어 크기입니다.',
      '신용카드 가로(8.5cm)보다 각 모서리가 3.5cm 더 넓어 묵직하고 안정적인 거치감을 줍니다.'
    ]
  };

  return root;
}

/**
 * 6. 로지텍 G PRO X SUPERLIGHT 2 무선 게이밍 마우스
 * 사용자 업로드 실물 사진(화이트 본체 + 블랙 PRO X2 그립 테이프 + 텍스처 휠 + G 로고) 100% 완벽 재현
 * 100% 수밀(Watertight) 매니폴드 솔리드 곡면 메쉬로 깨짐, 틈새, 폴리곤 교차 관통 현상 원천 차단
 * 실물 정밀 규격: 가로 63.5mm × 세로 125.0mm × 높이 40.0mm, 무게 60g
 */
export function createGamingMouse(options = {}) {
  const {
    widthMm = 63.5,
    depthMm = 125.0,
    heightMm = 40.0,
    color = '#f8fafc',
    name = '로지텍 G PRO X SUPERLIGHT 2 무선 게이밍 마우스'
  } = options;

  const W = widthMm / 10; // 6.35 cm
  const L = depthMm / 10; // 12.5 cm
  const H = heightMm / 10; // 4.0 cm

  const root = new THREE.Group();
  root.name = name;

  // 1. 100% 수밀(Watertight) 3D 인체공학 곡면 솔리드 메쉬 생성
  const slices = 56; // Z축 단면 분할수
  const rings = 48;  // 단면 둘레 분할수
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= slices; i++) {
    const t = i / slices; // 0 (전면 노즈) ~ 1 (후면 팜)
    const z = -L / 2 + t * L;

    // 양 끝(t=0, t=1)은 0으로 완벽히 수렴하여 닫힌 솔리드 형성
    let wProfile;
    if (t <= 0 || t >= 1) {
      wProfile = 0;
    } else {
      const baseW = Math.sin(Math.PI * Math.pow(t, 0.85));
      const waist = 1.0 - 0.08 * Math.sin(Math.PI * 2 * t);
      wProfile = (W / 2) * Math.sqrt(Math.max(0, baseW)) * waist;
    }

    // 바닥 라인 (평평한 바닥면 형성, 전면/후면 팁에서 둥글게 상승)
    let botY = 0;
    if (t <= 0 || t >= 1) {
      botY = 0.20;
    } else if (t < 0.10) {
      botY = 0.20 * Math.pow(1 - (t / 0.10), 2);
    } else if (t > 0.90) {
      botY = 0.20 * Math.pow((t - 0.90) / 0.10, 2);
    }

    // 상단 척추 라인 높이 프로파일 (전면 노즈부터 후면 팜까지 매끄럽게 연결)
    let spineY;
    if (t <= 0) {
      spineY = 0.20;
    } else if (t < 0.15) {
      // 노즈 끝에서 클릭 버튼 시작 지점까지 부드러운 둥근 캡
      const p = t / 0.15;
      spineY = 0.20 + 1.25 * Math.sin(p * (Math.PI / 2));
    } else if (t < 0.45) {
      // 전면 클릭 버튼 완만한 경사 상승
      const p = (t - 0.15) / 0.30;
      spineY = 1.45 + 1.25 * Math.sin(p * (Math.PI / 2));
    } else if (t < 0.70) {
      // 팜 레스트 최고점(H = 4.0cm) 도달
      const p = (t - 0.45) / 0.25;
      spineY = 2.70 + (H - 2.70) * Math.sin(p * (Math.PI / 2));
    } else if (t < 1.0) {
      // 팜 레스트에서 후면 바닥으로 자연스러운 호를 그리며 하강
      const p = (t - 0.70) / 0.30;
      spineY = 0.20 + (H - 0.20) * Math.cos(p * (Math.PI / 2));
    } else {
      spineY = 0.20;
    }

    for (let j = 0; j <= rings; j++) {
      let x, y;

      if (j <= rings / 2) {
        // [상단 쉘 (0 ~ PI)]
        const u = j / (rings / 2); // 0 (좌측) -> 0.5 (중앙 꼭대기) -> 1.0 (우측)
        const rad = u * Math.PI;
        x = -wProfile * Math.cos(rad);
        const dome = Math.pow(Math.sin(rad), 0.72);
        y = botY + (spineY - botY) * dome;
        
        vertices.push(x, y, z);
        // CanvasTexture의 flipY 특성 및 Z축 방향성에 맞추어 V = 1 - t 로 매핑
        // t = 0 (전면) -> V = 1.0 (캔버스 상단: 클릭 버튼)
        // t = 1 (후면) -> V = 0.0 (캔버스 하단: G 로고)
        uvs.push(u, 1.0 - t);
      } else {
        // [하단 베이스 (PI ~ 2*PI)]
        const u = (j - rings / 2) / (rings / 2);
        const rad = u * Math.PI;
        x = wProfile * Math.cos(rad);
        y = botY;
        
        vertices.push(x, y, z);
        uvs.push(0.5, 0.02); // 하단 베이스는 어두운 베이스 영역 매핑
      }
    }
  }

  // 솔리드 삼각 메쉬 인덱스 생성
  for (let i = 0; i < slices; i++) {
    for (let j = 0; j < rings; j++) {
      const a = i * (rings + 1) + j;
      const b = (i + 1) * (rings + 1) + j;
      const c = (i + 1) * (rings + 1) + (j + 1);
      const d = i * (rings + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const shellGeo = new THREE.BufferGeometry();
  shellGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  shellGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  shellGeo.setIndex(indices);
  shellGeo.computeVertexNormals();

  // 2. 실물 사진과 100% 동일한 고해상도 텍스처 아틀라스 생성 (2048x2048)
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  // 베이스: 매트 화이트 본체 컬러
  ctx.fillStyle = color || '#f8fafc';
  ctx.fillRect(0, 0, 2048, 2048);

  // 전면 좌/우 분할 블랙 그립 버튼 (사진 속 PRO X2 텍스처 그립 테이프 완벽 재현)
  // 전면(상단) Y = 40 ~ 780 영역
  const btnTop = 40;
  const btnBottom = 780;
  const btnHeight = btnBottom - btnTop;

  // 좌측 버튼 영역 (U: 80 ~ 955)
  ctx.fillStyle = '#141416';
  ctx.beginPath();
  ctx.roundRect(80, btnTop, 875, btnHeight, [35, 20, 25, 35]);
  ctx.fill();

  // 우측 버튼 영역 (U: 1093 ~ 1968)
  ctx.beginPath();
  ctx.roundRect(1093, btnTop, 875, btnHeight, [20, 35, 35, 25]);
  ctx.fill();

  // 미끄럼 방지 미세 텍스처 입자 (그립 테이프 질감)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let py = btnTop + 10; py < btnBottom - 10; py += 14) {
    for (let px = 100; px < 940; px += 14) {
      if ((px + py) % 28 === 0) ctx.fillRect(px, py, 3, 3);
    }
    for (let px = 1110; px < 1950; px += 14) {
      if ((px + py) % 28 === 0) ctx.fillRect(px, py, 3, 3);
    }
  }

  // 좌측 버튼 마킹: 모서리 '+' 및 세로 'PRO X2'
  ctx.fillStyle = 'rgba(240, 240, 245, 0.95)';
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText('+', 180, btnBottom - 50);

  ctx.save();
  ctx.translate(900, (btnTop + btnBottom) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '900 48px Inter, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PRO X2', 0, 0);
  ctx.restore();

  // 우측 버튼 마킹: 모서리 '+' 및 세로 'PRO X2'
  ctx.fillText('+', 1840, btnBottom - 50);

  ctx.save();
  ctx.translate(1148, (btnTop + btnBottom) / 2);
  ctx.rotate(Math.PI / 2);
  ctx.font = '900 48px Inter, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PRO X2', 0, 0);
  ctx.restore();

  // 스크롤 휠 오목 슬롯 홈 (블랙 홈)
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.roundRect(975, 230, 98, 390, 24);
  ctx.fill();

  // 중앙 LED 배터리/프로필 인디케이터 도트
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(1024, 850, 10, 0, Math.PI * 2);
  ctx.fill();

  // 후면 팜 레스트 로지텍 'G' 볼드 로고 (사진 속 정품 각인)
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 62;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(1024, 1420, 155, -0.38, Math.PI * 1.38);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1024, 1420);
  ctx.lineTo(1175, 1420);
  ctx.stroke();

  // 최하단 텍스처 영역 (베이스 컬러)
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 1980, 2048, 68);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  const shellMat = new THREE.MeshPhysicalMaterial({
    map: tex,
    roughness: 0.35,
    metalness: 0.05,
    clearcoat: 0.2,
    clearcoatRoughness: 0.15
  });
  const shellMesh = new THREE.Mesh(shellGeo, shellMat);
  shellMesh.castShadow = true;
  shellMesh.receiveShadow = true;
  root.add(shellMesh);

  // 3. 중앙 스크롤 휠 (널링 고무 타이어 + 알루미늄 메탈 림)
  const wheelGroup = new THREE.Group();
  const tireGeo = new THREE.CylinderGeometry(0.60, 0.60, 0.38, 32);
  tireGeo.rotateZ(Math.PI / 2);
  const tireMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.95 });
  const tireMesh = new THREE.Mesh(tireGeo, tireMat);
  wheelGroup.add(tireMesh);

  const rimGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.40, 24);
  rimGeo.rotateZ(Math.PI / 2);
  const rimMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.92, roughness: 0.15 });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  wheelGroup.add(rimMesh);

  // 휠 위치: 전면 텍스처 슬롯(-L * 0.24)에 완벽 일치
  wheelGroup.position.set(0, 2.22, -L * 0.24);
  root.add(wheelGroup);

  // 4. 좌측 엄지 사이드 버튼 (Forward / Back) - 곡면에 일치하는 캡슐 버튼
  const sideMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.35 });
  
  const side1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.50, 16, 16), sideMat);
  side1.rotation.x = Math.PI / 2;
  side1.position.set(-W * 0.47, 1.70, -0.45);
  root.add(side1);

  const side2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.50, 16, 16), sideMat);
  side2.rotation.x = Math.PI / 2;
  side2.position.set(-W * 0.47, 1.70, 0.55);
  root.add(side2);

  // 5. 하단 순백색 100% PTFE 제로애디티브 글라이드 피트 & 센서
  const ptfeMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.12, metalness: 0.05 });
  
  // 전면 라운드 와이드 피트
  const frontSkate = new THREE.Mesh(new THREE.BoxGeometry(W * 0.65, 0.03, 1.4), ptfeMat);
  frontSkate.position.set(0, 0.015, -L * 0.36);
  root.add(frontSkate);

  // 후면 말발굽형 와이드 피트
  const rearSkate = new THREE.Mesh(new THREE.BoxGeometry(W * 0.70, 0.03, 1.6), ptfeMat);
  rearSkate.position.set(0, 0.015, L * 0.36);
  root.add(rearSkate);

  // 센서 링 피트
  const sensorRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.10, 16, 24), ptfeMat);
  sensorRing.rotation.x = Math.PI / 2;
  sensorRing.position.set(0, 0.015, 0);
  root.add(sensorRing);

  // HERO 센서 옵티컬 렌즈
  const lensGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.04, 16);
  const lensMat = new THREE.MeshBasicMaterial({ color: '#0284c7' });
  const lensMesh = new THREE.Mesh(lensGeo, lensMat);
  lensMesh.position.set(0, 0.025, 0);
  root.add(lensMesh);

  // 기본 3/4 뷰 각도 설정
  root.rotation.y = Math.PI * 0.82;

  root.userData = {
    title: name,
    category: 'PC주변기기/게이밍 마우스',
    dimensions: { w: widthMm, d: depthMm, h: heightMm },
    sizeSummary: `${widthMm}mm x ${depthMm}mm x ${heightMm}mm`,
    weight: '60g (초경량)',
    materialDesc: '인체공학 초경량 60g 쉘, PRO X2 논슬립 그립 테이프, 100% PTFE 피트',
    checkPoints: [
      '실물 1:1 e스포츠 규격: 가로 63.5mm × 세로 125.0mm × 높이 40.0mm',
      '표준 성인 손 크기(F10~F11) 클로/팜 그립에 최적화된 유선형 인체공학 쉘',
      '355ml 음료 캔(12.2cm) 및 신용카드(8.5cm) 대비 실물 크기 1:1 정밀 매핑',
      'HERO 2 32,000 DPI 초정밀 센서 및 제로 애디티브 PTFE 무저항 글라이드'
    ]
  };

  return root;
}

