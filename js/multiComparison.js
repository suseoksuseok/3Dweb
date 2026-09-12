/**
 * Multi-Object 3D Comparison Engine (다중 사물 동시 3D 시뮬레이션 및 비교 엔진)
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 * 
 * 슬롯 A(기준 상품)와 슬롯 B(비교 상품)를 3D 뷰포트에 동시에 띄워
 * 나란히 보기(Side-by-side) 및 겹쳐보기(Ghost Overlay)로 정밀 비교합니다.
 */
import * as THREE from 'three';
import { computeObjectMetrics } from './exporter.js';

export class MultiComparisonEngine {
  constructor(studioScene) {
    this.scene = studioScene.scene;
    this.controls = studioScene.controls;

    this.slotA = null; // { mesh, data, metrics }
    this.slotB = null; // { mesh, data, metrics }

    this.mode = 'side_by_side'; // 'side_by_side' | 'overlay'
    this.groupA = new THREE.Group();
    this.groupB = new THREE.Group();

    this.groupA.name = "MultiStage_SlotA";
    this.groupB.name = "MultiStage_SlotB";

    this.scene.add(this.groupA);
    this.scene.add(this.groupB);
  }

  setSlotA(mesh, data) {
    this.clearSlot('A');
    if (!mesh) return;

    this.slotA = {
      mesh: mesh,
      data: data || mesh.userData || {},
      metrics: computeObjectMetrics(mesh)
    };

    this.groupA.add(mesh);
    this.updateLayout();
  }

  setSlotB(mesh, data) {
    this.clearSlot('B');
    if (!mesh) return;

    this.slotB = {
      mesh: mesh,
      data: data || mesh.userData || {},
      metrics: computeObjectMetrics(mesh)
    };

    this.groupB.add(mesh);
    this.updateLayout();
  }

  clearSlot(slot) {
    if (slot === 'A' && this.slotA) {
      this.groupA.remove(this.slotA.mesh);
      this.slotA = null;
    } else if (slot === 'B' && this.slotB) {
      this.groupB.remove(this.slotB.mesh);
      this.slotB = null;
    }
    this.updateLayout();
  }

  setMode(mode) {
    this.mode = mode;
    this.updateLayout();
  }

  /**
   * 나란히 보기 vs 겹쳐보기 배치 및 재질 업데이트
   */
  updateLayout() {
    if (!this.slotA && !this.slotB) return;

    if (this.mode === 'overlay' && this.slotA && this.slotB) {
      // 1. 겹쳐보기 모드: 두 사물을 같은 원점 (0, 0, 0)에 겹쳐서 실루엣 비교
      this.groupA.position.set(0, 0, 0);
      this.groupB.position.set(0, 0, 0);

      this.applyGhostMaterial(this.slotA.mesh, '#38bdf8', 0.55); // 시안 블루 고스트
      this.applyGhostMaterial(this.slotB.mesh, '#fb923c', 0.55); // 오렌지 고스트

      this.controls.target.set(0, (this.slotA.metrics.height + this.slotB.metrics.height) / 4, 0);
    } else {
      // 2. 나란히 보기 모드 (Side-by-Side)
      this.restoreOriginalMaterial(this.slotA?.mesh);
      this.restoreOriginalMaterial(this.slotB?.mesh);

      if (this.slotA && this.slotB) {
        const halfWidthA = this.slotA.metrics.width / 2;
        const halfWidthB = this.slotB.metrics.width / 2;
        const spacing = 4.0; // 4cm 간격

        this.groupA.position.set(-halfWidthA - spacing / 2, 0, 0);
        this.groupB.position.set(halfWidthB + spacing / 2, 0, 0);

        this.controls.target.set(0, Math.max(this.slotA.metrics.height, this.slotB.metrics.height) / 2, 0);
      } else if (this.slotA) {
        this.groupA.position.set(0, 0, 0);
        this.controls.target.set(0, this.slotA.metrics.height / 2, 0);
      } else if (this.slotB) {
        this.groupB.position.set(0, 0, 0);
        this.controls.target.set(0, this.slotB.metrics.height / 2, 0);
      }
    }
  }

  applyGhostMaterial(mesh, colorHex, opacity) {
    if (!mesh) return;
    mesh.traverse(child => {
      if (child.isMesh && child.material) {
        if (!child.userData.savedMaterial) {
          child.userData.savedMaterial = child.material;
        }
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex),
          transparent: true,
          opacity: opacity,
          roughness: 0.2,
          metalness: 0.1,
          depthWrite: false
        });
      }
    });
  }

  restoreOriginalMaterial(mesh) {
    if (!mesh) return;
    mesh.traverse(child => {
      if (child.isMesh && child.userData.savedMaterial) {
        child.material = child.userData.savedMaterial;
        delete child.userData.savedMaterial;
      }
    });
  }

  /**
   * 두 사물 간의 정밀 치수 및 부피 비교 분석 결과 산출
   */
  computeComparisonDiff() {
    if (!this.slotA || !this.slotB) return null;

    const mA = this.slotA.metrics;
    const mB = this.slotB.metrics;

    const wDiffMm = Math.round((mB.width - mA.width) * 10);
    const dDiffMm = Math.round((mB.depth - mA.depth) * 10);
    const hDiffMm = Math.round((mB.height - mA.height) * 10);

    const hDiffPercent = Math.round(((mB.height - mA.height) / (mA.height || 1)) * 100);
    const volRatio = (mB.volume / (mA.volume || 1)).toFixed(2);

    let summaryText = '';
    if (hDiffMm > 10) {
      summaryText = `상품 B가 상품 A보다 키(높이)가 ${Math.abs(hDiffMm)}mm (${Math.abs(hDiffPercent)}%) 더 큽니다.`;
    } else if (hDiffMm < -10) {
      summaryText = `상품 B가 상품 A보다 키(높이)가 ${Math.abs(hDiffMm)}mm (${Math.abs(hDiffPercent)}%) 더 낮고 컴팩트합니다.`;
    } else {
      summaryText = '두 상품의 전체 높이가 거의 동일(±1cm 이내)합니다.';
    }

    return {
      titleA: this.slotA.data.title || this.slotA.data.name || '기준 상품 A',
      titleB: this.slotB.data.title || this.slotB.data.name || '비교 상품 B',
      sizeA: `${Math.round(mA.width * 10)} x ${Math.round(mA.depth * 10)} x ${Math.round(mA.height * 10)} mm`,
      sizeB: `${Math.round(mB.width * 10)} x ${Math.round(mB.depth * 10)} x ${Math.round(mB.height * 10)} mm`,
      volA: `${mA.volume.toFixed(1)} cm³`,
      volB: `${mB.volume.toFixed(1)} cm³`,
      wDiffMm,
      dDiffMm,
      hDiffMm,
      hDiffPercent,
      volRatio,
      summaryText
    };
  }
}
