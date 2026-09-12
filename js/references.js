/**
 * Everyday Reference Scale Objects (일상 기준 비교 사물 모듈)
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 * 
 * 모든 규격은 1 Unit = 10mm (1cm) 기준으로 정밀 물리 제작되었습니다.
 */
import * as THREE from 'three';
import { createPBRMaterial } from './materials.js';

// 신용카드 텍스처
function createCreditCardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 320);
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(0.5, '#0f172a');
  grad.addColorStop(1, '#334155');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 320);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 24px Inter, sans-serif';
  ctx.fillText('STANDARD CARD', 36, 60);

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(40, 95, 75, 55, 8);
  else ctx.rect(40, 95, 75, 55);
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('5421  8820  1092  4401', 40, 205);

  ctx.font = '14px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('VALID THRU 08/30', 40, 245);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('HONG GILDONG', 40, 280);

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(420, 260, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.beginPath();
  ctx.arc(455, 260, 28, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// 355ml 음료수 캔 텍스처
function createSodaCanTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, 180);
  ctx.bezierCurveTo(150, 120, 350, 260, 512, 180);
  ctx.lineTo(512, 240);
  ctx.bezierCurveTo(350, 320, 150, 180, 0, 240);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 900 68px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CLASSIC', 256, 220);

  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('355 ml (12 fl oz)', 256, 320);
  ctx.font = '18px sans-serif';
  ctx.fillText('기준 척도 음료수 캔 (높이 12.2cm)', 256, 360);

  return new THREE.CanvasTexture(canvas);
}

// 스타벅스 그란데 컵 텍스처
function createCoffeeCupTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  // 중앙 녹색 로고 원
  ctx.fillStyle = '#00704a';
  ctx.beginPath();
  ctx.arc(256, 256, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COFFEE', 256, 240);
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('GRANDE 473ml', 256, 285);

  return new THREE.CanvasTexture(canvas);
}

// 대한민국 여권 표지 텍스처
function createPassportTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 350;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  // 신여권 네이비 블루
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, 350, 500);

  // 금박 텍스트 및 국장
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('대한민국 여권', 175, 80);
  ctx.font = '16px serif';
  ctx.fillText('REPUBLIC OF KOREA', 175, 110);
  ctx.fillText('PASSPORT', 175, 135);

  // 국장 심볼 원형
  ctx.beginPath();
  ctx.arc(175, 270, 55, 0, Math.PI * 2);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = 'bold 18px serif';
  ctx.fillText('KOREA', 175, 276);

  return new THREE.CanvasTexture(canvas);
}

// 손바닥 가이드 텍스처
function createHandTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 768);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';

  ctx.beginPath();
  ctx.moveTo(200, 740);
  ctx.lineTo(312, 740);
  ctx.lineTo(340, 500);
  ctx.lineTo(360, 360);
  ctx.lineTo(330, 350);
  ctx.lineTo(315, 460);
  ctx.lineTo(300, 310);
  ctx.lineTo(270, 305);
  ctx.lineTo(260, 440);
  ctx.lineTo(240, 250);
  ctx.lineTo(210, 250);
  ctx.lineTo(200, 440);
  ctx.lineTo(180, 290);
  ctx.lineTo(150, 300);
  ctx.lineTo(155, 490);
  ctx.lineTo(90, 520);
  ctx.lineTo(80, 560);
  ctx.lineTo(160, 620);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('성인 손바닥 표준 (180mm)', 256, 180);

  return new THREE.CanvasTexture(canvas);
}

/**
 * 기준 사물 3D 모델 팩토리
 */
export function createReferenceObject(type = 'card') {
  const group = new THREE.Group();
  group.name = `기준사물_${type}`;

  switch (type) {
    // 1. 신용카드 (85.6 x 54.0 x 0.76 mm)
    case 'card': {
      const W = 8.56;
      const H = 5.40;
      const D = 0.08;

      const cardGeo = new THREE.BoxGeometry(W, H, D);
      const cardMat = new THREE.MeshStandardMaterial({
        map: createCreditCardTexture(),
        roughness: 0.25,
        metalness: 0.1
      });
      const mesh = new THREE.Mesh(cardGeo, cardMat);
      mesh.position.set(0, H / 2, 0);
      mesh.castShadow = true;
      group.add(mesh);

      group.userData = {
        name: '표준 신용카드',
        desc: '국제 표준 규격: 85.6mm x 54.0mm (지갑/주머니 척도)',
        sizeText: '85.6 x 54.0 x 0.76 mm',
        type: 'card'
      };
      break;
    }

    // 2. 국민 모나미 153 볼펜 (길이 145mm, 지름 8.5mm)
    case 'pen': {
      const length = 14.5;
      const radius = 0.42;

      // 6각 화이트 바디
      const bodyGeo = new THREE.CylinderGeometry(radius, radius, length * 0.75, 6);
      const bodyMat = createPBRMaterial('polymer', { color: '#f8fafc', roughness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(0, length / 2, 0);
      group.add(body);

      // 블랙 프론트 원뿔 팁
      const tipGeo = new THREE.ConeGeometry(radius, length * 0.15, 16);
      const tipMat = createPBRMaterial('polymer', { color: '#09090b', roughness: 0.3 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.rotation.x = Math.PI;
      tip.position.set(0, (length * 0.15) / 2, 0);
      group.add(tip);

      // 블랙 클릭 노크 버튼
      const knockGeo = new THREE.CylinderGeometry(radius * 0.8, radius * 0.8, length * 0.1, 16);
      const knock = new THREE.Mesh(knockGeo, tipMat);
      knock.position.set(0, length - (length * 0.1) / 2, 0);
      group.add(knock);

      group.userData = {
        name: '모나미 153 볼펜',
        desc: '국민 표준 볼펜: 길이 14.5cm, 지름 8.5mm (필통/가방 수납 척도)',
        sizeText: '길이 145mm (Ø 8.5mm)',
        type: 'pen'
      };
      break;
    }

    // 3. 스타벅스 그란데 컵 (높이 155mm, 상단 지름 90mm)
    case 'starbucks': {
      const topR = 4.5;
      const botR = 3.0;
      const H = 15.5;

      const cupGeo = new THREE.CylinderGeometry(topR, botR, H, 32);
      const cupMat = new THREE.MeshStandardMaterial({
        map: createCoffeeCupTexture(),
        roughness: 0.4
      });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.set(0, H / 2, 0);
      cup.castShadow = true;
      group.add(cup);

      // 플라스틱 뚜껑
      const lidGeo = new THREE.CylinderGeometry(topR * 1.02, topR, 1.2, 32);
      const lidMat = createPBRMaterial('polymer', { color: '#ffffff', roughness: 0.1 });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.set(0, H + 0.6, 0);
      group.add(lid);

      group.userData = {
        name: '스타벅스 그란데 컵 (473ml)',
        desc: '카페 테이크아웃 표준 컵: 높이 15.5cm, 상단 지름 9cm (텀블러/차량 컵홀더 척도)',
        sizeText: 'Ø 90mm x 높이 155mm',
        type: 'starbucks'
      };
      break;
    }

    // 4. 에어팟 프로 케이스 (60.6 x 45.2 x 21.7 mm)
    case 'airpods': {
      const W = 6.06;
      const H = 4.52;
      const D = 2.17;

      const caseGeo = new THREE.BoxGeometry(W, H, D);
      const caseMat = createPBRMaterial('polymer', { color: '#ffffff', roughness: 0.05, clearcoat: 0.9 });
      const mesh = new THREE.Mesh(caseGeo, caseMat);
      mesh.position.set(0, H / 2, 0);
      mesh.castShadow = true;
      group.add(mesh);

      // 힌지 금속 라인
      const hingeGeo = new THREE.BoxGeometry(W * 0.35, 0.4, 0.1);
      const hingeMat = createPBRMaterial('chrome');
      const hinge = new THREE.Mesh(hingeGeo, hingeMat);
      hinge.position.set(0, H * 0.7, -D / 2 - 0.05);
      group.add(hinge);

      group.userData = {
        name: '에어팟 프로 케이스',
        desc: '무선 이어폰 표준 케이스: 60.6 x 45.2 x 21.7 mm (주머니 쏙 콤팩트 척도)',
        sizeText: '60.6 x 45.2 x 21.7 mm',
        type: 'airpods'
      };
      break;
    }

    // 5. 대한민국 여권 (125 x 88 x 4 mm)
    case 'passport': {
      const W = 8.8;
      const H = 12.5;
      const D = 0.4;

      const passGeo = new THREE.BoxGeometry(W, H, D);
      const passMat = new THREE.MeshStandardMaterial({
        map: createPassportTexture(),
        roughness: 0.3
      });
      const mesh = new THREE.Mesh(passGeo, passMat);
      mesh.position.set(0, H / 2, 0);
      mesh.castShadow = true;
      group.add(mesh);

      group.userData = {
        name: '대한민국 여권',
        desc: '표준 여권 규격: 125 x 88 mm (여행 가방/파우치 수납 척도)',
        sizeText: '88 x 125 x 4 mm',
        type: 'passport'
      };
      break;
    }

    // 6. 355ml 음료수 캔
    case 'can': {
      const radius = 3.3;
      const height = 12.2;

      const canGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
      const canBodyMat = new THREE.MeshStandardMaterial({
        map: createSodaCanTexture(),
        roughness: 0.2,
        metalness: 0.5
      });
      const topMat = createPBRMaterial('aluminum', { metalness: 0.9, roughness: 0.15 });

      const mesh = new THREE.Mesh(canGeo, [canBodyMat, topMat, topMat]);
      mesh.position.set(0, height / 2, 0);
      mesh.castShadow = true;
      group.add(mesh);

      const tabGeo = new THREE.BoxGeometry(1.2, 0.05, 2.0);
      const tabMesh = new THREE.Mesh(tabGeo, topMat);
      tabMesh.position.set(0, height + 0.05, 0.6);
      group.add(tabMesh);

      group.userData = {
        name: '355ml 탄산음료 캔',
        desc: '편의점 표준 음료 캔: 지름 66mm, 높이 122mm',
        sizeText: 'Ø 66 x 122 mm',
        type: 'can'
      };
      break;
    }

    // 7. 스마트폰 (6.1인치 스마트폰)
    case 'phone': {
      const W = 7.16;
      const H = 14.76;
      const D = 0.78;

      const phoneGeo = new THREE.BoxGeometry(W, H, D);
      const phoneMat = createPBRMaterial('polymer', { color: '#0f172a', roughness: 0.1, metalness: 0.3 });
      const mesh = new THREE.Mesh(phoneGeo, phoneMat);
      mesh.position.set(0, H / 2, 0);
      mesh.castShadow = true;

      const screenGeo = new THREE.PlaneGeometry(W * 0.92, H * 0.94);
      const screenMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.05 });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, 0, D / 2 + 0.01);
      mesh.add(screen);

      group.add(mesh);

      group.userData = {
        name: '스마트폰 (6.1인치)',
        desc: '스마트폰 표준 치수: 71.6 x 147.6 x 7.8 mm (가방/주머니 비교)',
        sizeText: '71.6 x 147.6 x 7.8 mm',
        type: 'phone'
      };
      break;
    }

    // 8. 성인 손바닥 실루엣
    case 'hand': {
      const W = 8.5;
      const H = 18.0;

      const planeGeo = new THREE.PlaneGeometry(W, H);
      const handMat = new THREE.MeshBasicMaterial({
        map: createHandTexture(),
        transparent: true,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(planeGeo, handMat);
      mesh.position.set(0, H / 2, 0);
      group.add(mesh);

      group.userData = {
        name: '성인 손바닥 실루엣',
        desc: '성인 남녀 평균 손 크기: 길이 180mm, 폭 85mm (한 손 그립 체감)',
        sizeText: '85 x 180 mm',
        type: 'hand'
      };
      break;
    }

    // 9. 우체국 택배 2호 박스
    case 'box_post': {
      const W = 27.0;
      const D = 18.0;
      const H = 15.0;

      const boxGeo = new THREE.BoxGeometry(W, H, D);
      const boxMat = createPBRMaterial('wood', { color: '#b45309', roughness: 0.85 });
      const mesh = new THREE.Mesh(boxGeo, boxMat);
      mesh.position.set(0, H / 2, 0);
      mesh.castShadow = true;
      group.add(mesh);

      const tapeGeo = new THREE.BoxGeometry(W * 1.01, 0.05, 5.0);
      const tapeMat = new THREE.MeshStandardMaterial({ color: '#fef08a', opacity: 0.8, transparent: true });
      const tape = new THREE.Mesh(tapeGeo, tapeMat);
      tape.position.set(0, H / 2 + 0.01, 0);
      mesh.add(tape);

      group.userData = {
        name: '우체국 택배 2호 박스',
        desc: '중고거래 표준 박스: 270 x 180 x 150 mm',
        sizeText: '270 x 180 x 150 mm',
        type: 'box_post'
      };
      break;
    }
  }

  return group;
}
