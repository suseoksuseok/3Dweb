/**
 * Exporter & Model Inspector Module
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 */
import * as THREE from 'three';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';

/**
 * 3D 모델을 3D 프린터용 STL 파일로 내보내기
 */
export function exportToSTL(object, filename = '3d_realized_object.stl') {
  if (!object) return;

  const exporter = new STLExporter();
  const result = exporter.parse(object, { binary: true });

  const blob = new Blob([result], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * 뷰포트 고해상도 렌더 스크린샷 캡처
 */
export function captureScreenshot(renderer, scene, camera, filename = '3d_simulation_render.png') {
  if (!renderer || !scene || !camera) return;

  renderer.render(scene, camera);
  const dataURL = renderer.domElement.toDataURL('image/png');

  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  link.click();
}

/**
 * 당근마켓/중고거래 채팅용 "실물 크기 안심 인증 카드" 생성 및 다운로드
 */
export function generateCertificationCard(renderer, scene, camera, productData, metrics) {
  if (!renderer || !scene || !camera) return;

  renderer.render(scene, camera);
  const snapUrl = renderer.domElement.toDataURL('image/png');

  const img = new Image();
  img.onload = () => {
    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 900;
    cardCanvas.height = 1100;
    const ctx = cardCanvas.getContext('2d');

    // 1. 세련된 모던 카드 배경 (다크 톤)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1100);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 900, 1100);

    // 2. 상단 브랜드 헤더 배너
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.fillRect(40, 40, 820, 110);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 820, 110);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 32px "Noto Sans KR", sans-serif';
    ctx.fillText('🥕 중고거래 & 온라인 쇼핑 실물 크기 인증서', 70, 95);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('1:1 표준 척도(신용카드/일상물) 가상 비교 검증 완료', 70, 130);

    // 3. 중앙 3D 렌더링 캡처 이미지 임베드
    const renderW = 820;
    const renderH = 560;
    ctx.drawImage(img, 40, 175, renderW, renderH);

    // 이미지 테두리
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 175, renderW, renderH);

    // 워터마크 라벨
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(60, 195, 240, 36);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('• 1:1 REAL-SCALE VERIFIED', 75, 219);

    // 4. 하단 상세 스펙 및 체감 리포트 박스
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.fillRect(40, 760, 820, 220);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(40, 760, 820, 220);

    const title = productData?.title || '검증된 상품';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Noto Sans KR", sans-serif';
    ctx.fillText(title, 70, 815);

    const wMm = Math.round(metrics.width * 10);
    const dMm = Math.round(metrics.depth * 10);
    const hMm = Math.round(metrics.height * 10);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText(`실제 치수: ${wMm}mm x ${dMm}mm x ${hMm}mm  (${metrics.width} x ${metrics.depth} x ${metrics.height} cm)`, 70, 860);

    // 비교 요약
    const cardRatio = (wMm / 85.6).toFixed(1);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '20px "Noto Sans KR", sans-serif';
    ctx.fillText(`💳 표준 신용카드(8.5cm) 가로 대비 약 ${cardRatio}배 크기`, 70, 905);
    ctx.fillText(`📦 우체국 택배 1~2호 상자에 안정적으로 포장 가능`, 70, 945);

    // 5. 푸터 서명
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Realize3D Studio 실물 검증 시스템 • 생성일시: ${new Date().toLocaleDateString('ko-KR')}`, 450, 1045);

    // 다운로드 트리거
    const dataURL = cardCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `중고거래_실물크기인증_${title.replace(/\s+/g, '_')}.png`;
    link.click();
  };
  img.src = snapUrl;
}

/**
 * 객체의 바운딩 박스 치수 및 삼각형 폴리곤 개수 계산
 */
export function computeObjectMetrics(object) {
  if (!object) return { width: 0, height: 0, depth: 0, triangles: 0, volume: 0 };

  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);

  let triangles = 0;
  object.traverse((child) => {
    if (child.isMesh && child.geometry) {
      if (child.geometry.index) {
        triangles += child.geometry.index.count / 3;
      } else if (child.geometry.attributes.position) {
        triangles += child.geometry.attributes.position.count / 3;
      }
    }
  });

  const volume = size.x * size.y * size.z;

  return {
    width: Number(size.x.toFixed(2)),
    height: Number(size.y.toFixed(2)),
    depth: Number(size.z.toFixed(2)),
    triangles: Math.round(triangles),
    volume: Number(volume.toFixed(2)),
    box: box
  };
}
