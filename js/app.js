/**
 * Main Application Controller
 * 온라인 쇼핑 & 중고거래 실물 크기 체감 및 AI 사물 구현화 플랫폼 (Realize3D)
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

import { buildAppLayout } from './ui.js';
import { StudioScene } from './scene.js';
import { 
  createTumbler, 
  createHeadphones, 
  createMiniBag, 
  createGamingMouse,
  createErgonomicMouse, 
  createCubeClock 
} from './shoppingItems.js';
import { createReferenceObject } from './references.js';
import { createCustomDimensionObject } from './dimensionRealizer.js';
import { parseDimensionText } from './smartParser.js';
import { evaluateAllFits } from './fitChecker.js';
import { SAMPLE_AI_PRESETS, analyzeMediaFile } from './aiVisionAnalyzer.js';
import { MultiComparisonEngine } from './multiComparison.js';
import { getRecommendedProducts, createRecommendedMesh } from './recommendations.js';
import { 
  createSmartDevice, 
  createPlanetaryGearbox, 
  createParametricChair, 
  createPhysicsArenaObjects 
} from './objects.js';
import { PhysicsEngine } from './physics.js';
import { MaterialPresets, createPBRMaterial } from './materials.js';
import { exportToSTL, captureScreenshot, generateCertificationCard, computeObjectMetrics } from './exporter.js';
import { initChatbot } from './chatbot.js';

class Realize3DApp {
  constructor() {
    this.viewportContainer = document.getElementById('viewport-container');
    this.studio = null;
    this.physics = null;
    this.multiStage = null;

    this.currentObject = null;
    this.activeReferenceObject = null;
    this.currentPresetKey = 'tumbler';
    this.currentReferenceKey = null;
    this.selectedPartMesh = null;
    this.explodeFactor = 0;
    this.viewMode = 'solid';
    this.clock = new THREE.Clock();

    // 성능 지표
    this.frameCount = 0;
    this.lastFpsTime = performance.now();
    this.fps = 60;

    // 레이캐스팅
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredMesh = null;

    // 파라메트릭 체어
    this.chairParams = {
      width: 4.8,
      depth: 4.5,
      seatHeight: 4.2,
      backHeight: 4.8,
      thickness: 0.4,
      materialKey: 'wood'
    };

    // 스펙 직접 입력 상태
    this.customSpecs = {
      widthMm: 210,
      depthMm: 140,
      heightMm: 70,
      shape: 'rounded',
      materialKey: 'polymer',
      color: '#0284c7',
      name: '맞춤 쇼핑 제품'
    };

    // AI 분석 대기/캐시
    this.currentAiResult = null;

    this.init();
  }

  init() {
    this.studio = new StudioScene(this.viewportContainer);
    this.physics = new PhysicsEngine();
    this.multiStage = new MultiComparisonEngine(this.studio);

    this.bindUI();
    // 초기 로드: 쇼핑/중고거래 대표 아이템인 텀블러를 슬롯 A에 장착
    this.loadObjectPreset('tumbler');

    this.setupInteractions();
    this.animate();
  }

  /**
   * 사물 프리셋 로드 (슬롯 A에 장착)
   */
  loadObjectPreset(presetKey) {
    this.currentPresetKey = presetKey;
    this.selectedPartMesh = null;
    this.explodeFactor = 0;

    // 기존 단일 사물 및 물리 해제
    this.physics.clearObjects();
    this.physics.isRunning = false;

    let newMesh = null;

    switch (presetKey) {
      case 'tumbler':
        newMesh = createTumbler();
        break;
      case 'headphones':
        newMesh = createHeadphones();
        break;
      case 'minibag':
        newMesh = createMiniBag();
        break;
      case 'gaming_mouse':
        newMesh = createGamingMouse();
        break;
      case 'mouse':
        newMesh = createErgonomicMouse();
        break;
      case 'cube_clock':
        newMesh = createCubeClock();
        break;
      case 'phone':
        newMesh = createSmartDevice();
        break;
      case 'gear':
        newMesh = createPlanetaryGearbox();
        break;
      case 'chair':
        newMesh = createParametricChair(this.chairParams);
        break;
      case 'physics':
        newMesh = createPhysicsArenaObjects();
        this.physics.registerSceneObjects(newMesh);
        this.physics.isRunning = true;
        this.setViewMode('physics');
        break;
    }

    if (newMesh) {
      this.currentObject = newMesh;
      this.multiStage.setSlotA(newMesh, newMesh.userData);
      this.studio.updateDimensionLines(newMesh);
      this.studio.focusOnObject(newMesh, 'isometric');
    }

    // 기준 사물이 켜져 있다면 위치 재정렬
    if (this.activeReferenceObject) {
      this.positionReferenceObject();
    }

    const metrics = computeObjectMetrics(this.currentObject);
    this.updateMetricsUI();
    this.updateRealScaleReport();
    this.updateSpecsTable(this.currentObject?.userData, metrics);
    this.updateRecommendationsUI();
    this.updateComparisonTabUI();
    this.syncPresetUIState(presetKey);

    const explodeSlider = document.getElementById('explode-slider');
    if (explodeSlider) explodeSlider.value = 0;
    const explodeVal = document.getElementById('explode-val');
    if (explodeVal) explodeVal.innerText = '0%';
  }

  /**
   * AI 분석 결과를 3D 실물로 구현하여 슬롯 A에 로드
   */
  applyAiAnalysisResult(detectedData) {
    this.currentAiResult = detectedData;
    this.currentPresetKey = 'ai_generated';

    const mesh = createCustomDimensionObject({
      widthMm: detectedData.widthMm,
      depthMm: detectedData.depthMm,
      heightMm: detectedData.heightMm,
      shape: detectedData.shape,
      color: detectedData.color,
      materialKey: detectedData.materialKey,
      name: detectedData.name
    });

    mesh.userData = {
      title: detectedData.name,
      category: 'AI 사진 분석 제품',
      dimensions: { w: detectedData.widthMm, d: detectedData.depthMm, h: detectedData.heightMm },
      sizeSummary: `${detectedData.widthMm}mm x ${detectedData.depthMm}mm x ${detectedData.heightMm}mm`,
      checkPoints: detectedData.analysisNotes || [
        `AI 비전 신뢰도 ${detectedData.confidence}% 로 치수 산출 완료`,
        `신용카드(8.5cm) 대비 약 ${(detectedData.widthMm / 85.6).toFixed(1)}배 크기`,
        `${detectedData.materialDesc}`
      ]
    };

    this.currentObject = mesh;
    this.multiStage.setSlotA(mesh, mesh.userData);
    this.studio.updateDimensionLines(mesh);
    this.studio.focusOnObject(mesh, 'isometric');

    if (this.activeReferenceObject) {
      this.positionReferenceObject();
    }

    const metrics = computeObjectMetrics(mesh);
    this.updateMetricsUI();
    this.updateRealScaleReport();
    this.updateSpecsTable(mesh.userData, metrics);
    this.updateRecommendationsUI();
    this.updateComparisonTabUI();
    this.syncPresetUIState('ai_generated');

    // 탭을 '실물체감'으로 이동
    const reportTab = document.querySelector('[data-tab="report"]');
    if (reportTab) reportTab.click();

    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerText = `✨ AI 분석 완료: "${detectedData.name}" 실물 3D 구현 성공!`;
      toast.classList.remove('opacity-0');
      setTimeout(() => toast.classList.add('opacity-0'), 3500);
    }
  }

  /**
   * 추천 상품을 비교 슬롯 B에 추가하여 동시 비교
   */
  addComparisonProductToSlotB(recItem) {
    const meshB = createRecommendedMesh(recItem);
    meshB.userData = {
      title: recItem.name,
      category: recItem.category,
      dimensions: recItem.dims,
      price: recItem.price,
      brand: recItem.brand,
      badge: recItem.badge
    };

    this.multiStage.setSlotB(meshB, meshB.userData);
    this.updateComparisonTabUI();

    // 뷰포트 상단 멀티 비교 바 노출
    const multiBar = document.getElementById('multi-compare-bar');
    if (multiBar) multiBar.classList.remove('hidden');

    // 비교 탭으로 자동 이동
    const compTab = document.querySelector('[data-tab="compare"]');
    if (compTab) compTab.click();

    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerText = `🔍 비교 슬롯 B에 "${recItem.name}" 추가됨! 나란히 비교가 시작됩니다.`;
      toast.classList.remove('opacity-0');
      setTimeout(() => toast.classList.add('opacity-0'), 3000);
    }
  }

  /**
   * AI 유사 상품 추천 리스트 렌더링
   */
  updateRecommendationsUI() {
    const container = document.getElementById('recommendations-list');
    if (!container || !this.currentObject) return;

    const list = getRecommendedProducts(this.currentObject.userData);
    container.innerHTML = '';

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/10 space-y-2 transition';
      card.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
              ${item.badge}
            </span>
            <h4 class="text-xs font-bold text-white mt-1 leading-snug">${item.name}</h4>
            <div class="text-[11px] text-slate-400">${item.brand} • ${item.price}</div>
          </div>
        </div>
        <p class="text-[11px] text-emerald-400 bg-emerald-950/30 p-1.5 rounded border border-emerald-500/20 leading-snug">
          💡 ${item.diffHighlight}
        </p>
        <button class="btn-compare-now w-full py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/60 text-blue-300 hover:text-white text-xs font-semibold border border-blue-500/30 flex items-center justify-center gap-1.5 transition">
          <i data-lucide="split" class="w-3.5 h-3.5"></i>
          <span>3D로 나란히 비교하기</span>
        </button>
      `;

      card.querySelector('.btn-compare-now').addEventListener('click', () => {
        this.addComparisonProductToSlotB(item);
      });

      container.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  /**
   * 두 사물 1:1 비교 분석 탭 UI 갱신
   */
  updateComparisonTabUI() {
    const diffContainer = document.getElementById('compare-diff-view');
    const emptyNotice = document.getElementById('compare-empty-notice');
    if (!diffContainer || !emptyNotice) return;

    const diff = this.multiStage.computeComparisonDiff();

    if (!diff) {
      diffContainer.classList.add('hidden');
      emptyNotice.classList.remove('hidden');
      return;
    }

    emptyNotice.classList.add('hidden');
    diffContainer.classList.remove('hidden');

    const titleA = document.getElementById('diff-title-a');
    const titleB = document.getElementById('diff-title-b');
    const sizeA = document.getElementById('diff-size-a');
    const sizeB = document.getElementById('diff-size-b');
    const volA = document.getElementById('diff-vol-a');
    const volB = document.getElementById('diff-vol-b');
    const summary = document.getElementById('diff-summary-text');
    const hDiffBadge = document.getElementById('diff-h-badge');

    if (titleA) titleA.innerText = diff.titleA;
    if (titleB) titleB.innerText = diff.titleB;
    if (sizeA) sizeA.innerText = diff.sizeA;
    if (sizeB) sizeB.innerText = diff.sizeB;
    if (volA) volA.innerText = diff.volA;
    if (volB) volB.innerText = diff.volB;

    if (summary) summary.innerText = diff.summaryText;

    if (hDiffBadge) {
      if (diff.hDiffMm > 0) {
        hDiffBadge.innerText = `+${diff.hDiffMm}mm (${diff.hDiffPercent}%)`;
        hDiffBadge.className = 'text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30';
      } else if (diff.hDiffMm < 0) {
        hDiffBadge.innerText = `${diff.hDiffMm}mm (${diff.hDiffPercent}%)`;
        hDiffBadge.className = 'text-[10px] px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30';
      } else {
        hDiffBadge.innerText = '동일 높이';
        hDiffBadge.className = 'text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      }
    }
  }

  /**
   * 사용자 직접 입력 치수 기반 3D 생성
   */
  generateFromCustomSpecs() {
    this.currentPresetKey = 'custom_spec';
    const newMesh = createCustomDimensionObject(this.customSpecs);

    this.currentObject = newMesh;
    this.multiStage.setSlotA(newMesh, newMesh.userData);
    this.studio.updateDimensionLines(newMesh);
    this.studio.focusOnObject(newMesh, 'isometric');

    if (this.activeReferenceObject) {
      this.positionReferenceObject();
    }

    const metrics = computeObjectMetrics(newMesh);
    this.updateMetricsUI();
    this.updateRealScaleReport();
    this.updateSpecsTable(newMesh.userData, metrics);
    this.updateRecommendationsUI();
    this.updateComparisonTabUI();
    this.syncPresetUIState('custom_spec');

    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerText = '입력하신 치수로 1:1 실물 3D 모델이 구현되었습니다!';
      toast.classList.remove('opacity-0');
      setTimeout(() => toast.classList.add('opacity-0'), 2500);
    }
  }

  /**
   * 일상 기준 사물 나란히 놓기 토글
   */
  toggleReference(refKey) {
    if (this.currentReferenceKey === refKey) {
      this.removeReferenceObject();
      return;
    }

    this.removeReferenceObject();
    this.currentReferenceKey = refKey;

    const refObj = createReferenceObject(refKey);
    this.activeReferenceObject = refObj;
    this.studio.scene.add(refObj);

    this.positionReferenceObject();

    document.querySelectorAll('.ref-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.ref === refKey);
    });

    const toast = document.getElementById('toast');
    if (toast && refObj.userData) {
      toast.innerText = `기준 사물 [${refObj.userData.name}] 을 나란히 배치했습니다.`;
      toast.classList.remove('opacity-0');
      setTimeout(() => toast.classList.add('opacity-0'), 2500);
    }
  }

  removeReferenceObject() {
    if (this.activeReferenceObject) {
      this.studio.scene.remove(this.activeReferenceObject);
      this.activeReferenceObject = null;
    }
    this.currentReferenceKey = null;
    document.querySelectorAll('.ref-btn').forEach(btn => btn.classList.remove('active'));
  }

  positionReferenceObject() {
    if (!this.activeReferenceObject || !this.currentObject) return;

    const objBox = new THREE.Box3().setFromObject(this.currentObject);
    const refBox = new THREE.Box3().setFromObject(this.activeReferenceObject);

    const refSize = new THREE.Vector3();
    refBox.getSize(refSize);

    // 대상 물체 오른쪽(X축)으로 3.0cm 간격을 두고 나란히 배치
    const posX = (objBox.max.x || 0) + (refSize.x / 2) + 3.0;
    this.activeReferenceObject.position.set(posX, 0, 0);

    const centerX = posX / 2;
    this.studio.controls.target.x = centerX * 0.4;
  }

  /**
   * 실물 체감 리포트 & 수납 판정(Fit Checker) UI 갱신
   */
  updateRealScaleReport() {
    if (!this.currentObject) return;
    const metrics = computeObjectMetrics(this.currentObject);
    const data = this.currentObject.userData;

    const titleEl = document.getElementById('report-title');
    const catEl = document.getElementById('report-category');
    const sizeSummaryEl = document.getElementById('report-size-summary');
    const pointsListEl = document.getElementById('report-checkpoints');
    const fitListEl = document.getElementById('report-fit-list');

    const wMm = Math.round(metrics.width * 10);
    const dMm = Math.round(metrics.depth * 10);
    const hMm = Math.round(metrics.height * 10);

    if (titleEl) titleEl.innerText = data.title || this.currentObject.name || '선택된 제품';
    if (catEl) catEl.innerText = data.category || '제품 실물 검증';
    if (sizeSummaryEl) {
      sizeSummaryEl.innerText = `${wMm}mm x ${dMm}mm x ${hMm}mm (${metrics.width} x ${metrics.depth} x ${metrics.height} cm)`;
    }

    // 1. 체크포인트 문장
    if (pointsListEl) {
      pointsListEl.innerHTML = '';
      const points = data.checkPoints || [
        `신용카드(가로 85.6mm) 대비 약 ${(wMm / 85.6).toFixed(1)}배 길이입니다.`,
        `스마트폰(높이 147.6mm) 대비 약 ${(hMm / 147.6).toFixed(1)}배 높이입니다.`,
        `355ml 음료 캔(높이 122mm)과 비교하여 실물 부피감을 가늠할 수 있습니다.`
      ];

      points.forEach(pt => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2 text-xs text-slate-300 leading-relaxed';
        li.innerHTML = `
          <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5"></i>
          <span>${pt}</span>
        `;
        pointsListEl.appendChild(li);
      });
    }

    // 2. 가상 수납 판정 (Fit Checker)
    if (fitListEl) {
      fitListEl.innerHTML = '';
      const fitResults = evaluateAllFits(wMm, dMm, hMm);

      fitResults.forEach(res => {
        const item = document.createElement('div');
        item.className = 'p-2.5 rounded-lg bg-slate-800/40 border border-white/5 space-y-1';
        item.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-white flex items-center gap-1.5">
              <i data-lucide="package" class="w-3.5 h-3.5 text-blue-400"></i>
              ${res.container.name}
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold border ${res.badgeClass}">
              ${res.statusText}
            </span>
          </div>
          <p class="text-[11px] text-slate-400 leading-snug">${res.reason}</p>
        `;
        fitListEl.appendChild(item);
      });
    }

    if (window.lucide) lucide.createIcons();
  }

  setExplode(factor) {
    this.explodeFactor = factor;
    if (!this.currentObject) return;

    this.currentObject.traverse((child) => {
      if (child.userData && child.userData.explodeOffset && child.userData.basePos) {
        child.position.copy(child.userData.basePos).addScaledVector(
          child.userData.explodeOffset,
          factor
        );
      }
    });

    this.studio.updateDimensionLines(this.currentObject);
    this.updateMetricsUI();
  }

  setViewMode(mode) {
    this.viewMode = mode;

    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const explodeBar = document.getElementById('explode-control-bar');
    const physicsBar = document.getElementById('physics-control-bar');

    if (explodeBar) explodeBar.classList.toggle('hidden', mode !== 'explode');
    if (physicsBar) physicsBar.classList.toggle('hidden', mode !== 'physics');

    if (!this.currentObject) return;

    if (mode === 'xray') {
      this.currentObject.traverse((child) => {
        if (child.isMesh && child.material) {
          child.userData.prevWireframe = child.material.wireframe;
          child.material.wireframe = true;
        }
      });
    } else {
      this.currentObject.traverse((child) => {
        if (child.isMesh && child.material && child.userData.prevWireframe !== undefined) {
          child.material.wireframe = false;
        }
      });
    }

    if (mode === 'explode' && this.explodeFactor === 0) {
      this.setExplode(0.5);
      const slider = document.getElementById('explode-slider');
      if (slider) slider.value = 50;
      const val = document.getElementById('explode-val');
      if (val) val.innerText = '50%';
    }
  }

  setupInteractions() {
    const tooltip = document.getElementById('part-tooltip');

    this.viewportContainer.addEventListener('mousemove', (e) => {
      const rect = this.viewportContainer.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!this.currentObject) return;

      this.raycaster.setFromCamera(this.mouse, this.studio.camera);
      const targets = [this.studio.scene];

      const intersects = this.raycaster.intersectObjects(targets, true);

      if (intersects.length > 0) {
        // 배경이나 그리드가 아닌 메쉬 선택
        const hit = intersects.find(i => i.object.isMesh && i.object !== this.studio.floor && i.object !== this.studio.grid)?.object;
        if (hit) {
          this.hoveredMesh = hit;

          if (tooltip) {
            const partName = hit.userData?.name || hit.name || '사물 컴포넌트';
            const partDesc = hit.userData?.desc || hit.userData?.sizeText || '클릭하여 세부 속성을 확인할 수 있습니다.';
            tooltip.innerHTML = `<div class="font-semibold text-blue-400">${partName}</div><div class="text-xs text-slate-300">${partDesc}</div>`;
            tooltip.style.left = `${e.clientX + 16}px`;
            tooltip.style.top = `${e.clientY + 16}px`;
            tooltip.style.opacity = '1';
          }
          return;
        }
      }

      this.hoveredMesh = null;
      if (tooltip) tooltip.style.opacity = '0';
    });

    this.viewportContainer.addEventListener('click', () => {
      if (this.hoveredMesh) {
        this.selectPart(this.hoveredMesh);
      }
    });
  }

  selectPart(mesh) {
    this.selectedPartMesh = mesh;
    const nameEl = document.getElementById('selected-part-name');
    const descEl = document.getElementById('selected-part-desc');
    const badge = document.getElementById('active-part-badge');

    if (nameEl) nameEl.innerText = mesh.userData?.name || mesh.name || '선택된 컴포넌트';
    if (descEl) descEl.innerText = mesh.userData?.desc || mesh.userData?.sizeText || 'PBR 재질 및 표면 특성 조절 가능';
    if (badge) badge.classList.remove('hidden');

    let targetMat = mesh.material;
    if (!targetMat && mesh.traverse) {
      mesh.traverse(c => {
        if (!targetMat && c.isMesh && c.material) {
          targetMat = Array.isArray(c.material) ? c.material[0] : c.material;
        }
      });
    } else if (Array.isArray(targetMat)) {
      targetMat = targetMat[0];
    }

    if (targetMat) {
      const colorInput = document.getElementById('mat-color');
      const roughInput = document.getElementById('mat-roughness');
      const metalInput = document.getElementById('mat-metalness');

      if (colorInput && targetMat.color) colorInput.value = '#' + targetMat.color.getHexString();
      if (roughInput && targetMat.roughness !== undefined) roughInput.value = Math.round(targetMat.roughness * 100);
      if (metalInput && targetMat.metalness !== undefined) metalInput.value = Math.round(targetMat.metalness * 100);
    }
  }

  loadCustomFile(file) {
    const filename = file.name.toLowerCase();
    const reader = new FileReader();

    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerText = `3D 모델 "${file.name}" 로드 중...`;
      toast.classList.remove('opacity-0');
    }

    reader.onload = (e) => {
      const contents = e.target.result;

      if (filename.endsWith('.glb') || filename.endsWith('.gltf')) {
        const loader = new GLTFLoader();
        loader.parse(contents, '', (gltf) => {
          this.setupLoadedCustomModel(gltf.scene, file.name);
        }, (err) => {
          alert('GLTF 파일 파싱 오류: ' + err.message);
        });
      } else if (filename.endsWith('.obj')) {
        const loader = new OBJLoader();
        const text = new TextDecoder().decode(contents);
        const obj = loader.parse(text);
        this.setupLoadedCustomModel(obj, file.name);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  setupLoadedCustomModel(object, name) {
    this.currentPresetKey = 'custom';
    this.currentObject = object;
    object.name = name;

    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 15 / (maxDim || 1);
    object.scale.setScalar(scaleFactor);

    box.setFromObject(object);
    const center = new THREE.Vector3();
    box.getCenter(center);
    object.position.sub(center);
    object.position.y += (size.y * scaleFactor) / 2;

    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.userData.name = child.name || '3D 메쉬 노드';
      }
    });

    this.multiStage.setSlotA(this.currentObject, { title: name, category: '사용자 3D 파일' });
    this.studio.updateDimensionLines(this.currentObject);
    this.studio.focusOnObject(this.currentObject, 'isometric');

    if (this.activeReferenceObject) {
      this.positionReferenceObject();
    }

    const metrics = computeObjectMetrics(this.currentObject);
    this.updateMetricsUI();
    this.updateRealScaleReport();
    this.updateSpecsTable(this.currentObject.userData, metrics);
    this.updateRecommendationsUI();
    this.updateComparisonTabUI();
    this.syncPresetUIState('custom');
  }

  updateMetricsUI() {
    if (!this.currentObject) return;
    const metrics = computeObjectMetrics(this.currentObject);

    const wEl = document.getElementById('metric-w');
    const hEl = document.getElementById('metric-h');
    const dEl = document.getElementById('metric-d');
    const volEl = document.getElementById('metric-vol');

    if (wEl) wEl.innerText = `${(metrics.width * 10).toFixed(0)} mm`;
    if (hEl) hEl.innerText = `${(metrics.height * 10).toFixed(0)} mm`;
    if (dEl) dEl.innerText = `${(metrics.depth * 10).toFixed(0)} mm`;
    if (volEl) volEl.innerText = `${metrics.volume.toFixed(1)} cm³`;
  }

  /**
   * 우측 접이식 스펙 표(table) 실시간 데이터 바인딩
   */
  updateSpecsTable(data, metrics) {
    if (!metrics) return;
    const wMm = Math.round(metrics.width * 10);
    const dMm = Math.round(metrics.depth * 10);
    const hMm = Math.round(metrics.height * 10);

    const nameEl = document.getElementById('tbl-name');
    const catEl = document.getElementById('tbl-category');
    const badgeEl = document.getElementById('tbl-summary-badge');
    const wEl = document.getElementById('tbl-w');
    const dEl = document.getElementById('tbl-d');
    const hEl = document.getElementById('tbl-h');
    const shapeEl = document.getElementById('tbl-shape');
    const volEl = document.getElementById('tbl-vol');
    const weightEl = document.getElementById('tbl-weight');
    const matEl = document.getElementById('tbl-mat');

    if (nameEl) nameEl.innerText = data?.title || this.currentObject?.name || '선택된 제품';
    if (catEl) catEl.innerText = data?.category || '실물 스펙';
    if (badgeEl) badgeEl.innerText = `가로 ${wMm}mm × 세로 ${dMm}mm × 높이 ${hMm}mm`;

    if (wEl) wEl.innerText = `${wMm} mm (${(wMm / 10).toFixed(1)} cm)`;
    if (dEl) dEl.innerText = `${dMm} mm (${(dMm / 10).toFixed(1)} cm)`;
    if (hEl) hEl.innerText = `${hMm} mm (${(hMm / 10).toFixed(1)} cm)`;

    let shapeText = '인체공학 곡면형';
    if (this.currentPresetKey === 'gaming_mouse' || this.currentPresetKey === 'mouse' || data?.shape === 'mouse') {
      shapeText = '인체공학 유선형 (Ergonomic)';
    } else if (this.currentPresetKey === 'tumbler' || (Math.abs(wMm - dMm) < 5 && wMm > 30)) {
      shapeText = '원통형 (Cylinder)';
    } else if (this.currentPresetKey === 'cube_clock' || (Math.abs(wMm - dMm) < 5 && Math.abs(wMm - hMm) < 5)) {
      shapeText = '정육면체 (Cube)';
    } else if (data?.dimensions?.shape) {
      shapeText = data.dimensions.shape;
    } else if (data?.shape) {
      shapeText = data.shape;
    }
    if (shapeEl) shapeEl.innerText = shapeText;

    if (volEl) volEl.innerText = `${metrics.volume.toFixed(1)} cm³`;

    // 실측 무게
    if (weightEl) {
      weightEl.innerText = data?.weight || `${Math.max(10, Math.round(metrics.volume * 0.35))} g`;
    }

    let matText = '일반 복합 소재';
    if (this.currentPresetKey === 'gaming_mouse' || this.currentPresetKey === 'mouse' || data?.shape === 'mouse') {
      matText = '매트 UV 코팅 & PRO X2 논슬립 그립';
    } else if (this.currentPresetKey === 'tumbler') {
      matText = '스테인리스 스틸 / 아노다이징';
    } else if (this.currentPresetKey === 'headphones') {
      matText = '무광 폴리카보네이트 & 인조가죽';
    } else if (this.currentPresetKey === 'minibag') {
      matText = '소가죽 & 황동 메탈';
    } else if (this.currentPresetKey === 'cube_clock') {
      matText = '내추럴 원목 우드 & LED';
    } else if (data?.materialDesc) {
      matText = data.materialDesc;
    }
    if (matEl) matEl.innerText = matText;
  }

  /**
   * 비교 모드에서 타겟 로드 (AI 추천 상품 or 일상 기준 사물)
   */
  loadDefaultCompareTarget(targetKey) {
    if (targetKey === 'recommend') {
      const recList = getRecommendedProducts(this.currentObject?.userData);
      if (recList && recList.length > 0) {
        this.addComparisonProductToSlotB(recList[0]);
      }
    } else if (['card', 'can', 'phone', 'pen', 'airpods'].includes(targetKey)) {
      const refMesh = createReferenceObject(targetKey);
      this.multiStage.setSlotB(refMesh, {
        title: refMesh.userData?.name || '기준 사물',
        category: '일상 기준 사물',
        dimensions: {
          w: Math.round(refMesh.userData?.realW_mm || 50),
          d: Math.round(refMesh.userData?.realD_mm || 50),
          h: Math.round(refMesh.userData?.realH_mm || 100)
        }
      });
      const toast = document.getElementById('toast');
      if (toast) {
        toast.innerText = `기준 사물 [${refMesh.userData?.name}] 과 1:1 비교를 시작합니다.`;
        toast.classList.remove('opacity-0');
        setTimeout(() => toast.classList.add('opacity-0'), 2500);
      }
    }
  }

  syncPresetUIState(presetKey) {
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === presetKey);
    });
  }

  bindUI() {
    // 1. 프리셋 드롭다운 메뉴 토글 & 선택
    const btnTogglePresets = document.getElementById('btn-toggle-presets');
    const presetDropdown = document.getElementById('preset-dropdown');
    if (btnTogglePresets && presetDropdown) {
      btnTogglePresets.addEventListener('click', (e) => {
        e.stopPropagation();
        presetDropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!presetDropdown.contains(e.target) && e.target !== btnTogglePresets) {
          presetDropdown.classList.add('hidden');
        }
      });
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadObjectPreset(btn.dataset.preset);
        if (presetDropdown) presetDropdown.classList.add('hidden');
      });
    });

    // 2. [사용자 요청 1] 중심 위: 시뮬레이션 모드 설정 세그먼트 컨트롤
    const btnModeSingle = document.getElementById('mode-single');
    const btnModeCompare = document.getElementById('mode-compare');
    const compareSubBar = document.getElementById('compare-sub-bar');

    if (btnModeSingle) {
      btnModeSingle.addEventListener('click', () => {
        btnModeSingle.classList.add('active');
        if (btnModeCompare) btnModeCompare.classList.remove('active');
        if (compareSubBar) compareSubBar.classList.add('hidden');

        // 슬롯 B 비우고 단일 사물 뷰로 복귀
        this.multiStage.clearSlot('B');
        this.removeReferenceObject();
        this.studio.focusOnObject(this.currentObject, 'isometric');

        const toast = document.getElementById('toast');
        if (toast) {
          toast.innerText = '🔍 [사물 한 개만 보기] 모드로 전환되었습니다.';
          toast.classList.remove('opacity-0');
          setTimeout(() => toast.classList.add('opacity-0'), 2200);
        }
      });
    }

    if (btnModeCompare) {
      btnModeCompare.addEventListener('click', () => {
        btnModeCompare.classList.add('active');
        if (btnModeSingle) btnModeSingle.classList.remove('active');
        if (compareSubBar) compareSubBar.classList.remove('hidden');

        // 슬롯 B가 비어있다면 AI 추천 상품을 기본 로드하여 즉시 비교 체험 제공
        if (!this.multiStage.slotB || !this.multiStage.slotB.mesh) {
          this.loadDefaultCompareTarget('recommend');
        }

        const toast = document.getElementById('toast');
        if (toast) {
          toast.innerText = '⚖️ [다른 사물과 비교하기] 모드: 나란히 배치하여 크기를 대조합니다.';
          toast.classList.remove('opacity-0');
          setTimeout(() => toast.classList.add('opacity-0'), 2500);
        }
      });
    }

    // 비교 서브바: 나란히 vs 겹쳐보기
    const btnCompareSide = document.getElementById('btn-comp-side');
    const btnCompareOverlay = document.getElementById('btn-comp-overlay');

    if (btnCompareSide) {
      btnCompareSide.addEventListener('click', () => {
        this.multiStage.setMode('side_by_side');
        btnCompareSide.classList.add('active');
        if (btnCompareOverlay) btnCompareOverlay.classList.remove('active');
        this.updateComparisonTabUI();
      });
    }

    if (btnCompareOverlay) {
      btnCompareOverlay.addEventListener('click', () => {
        this.multiStage.setMode('overlay');
        btnCompareOverlay.classList.add('active');
        if (btnCompareSide) btnCompareSide.classList.remove('active');
        this.updateComparisonTabUI();
      });
    }

    // 비교 서브바: 비교 대상 퀵 선택
    document.querySelectorAll('.comp-target-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.comp-target-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadDefaultCompareTarget(btn.dataset.target);
      });
    });

    // 3. [사용자 요청 2] 중심 밑: 사진과 동영상을 업로드 할 수 있는 버튼
    const btnBottomUpload = document.getElementById('btn-bottom-upload');
    if (btnBottomUpload) {
      btnBottomUpload.addEventListener('click', () => {
        const aiModal = document.getElementById('ai-scan-modal');
        if (aiModal) aiModal.classList.remove('hidden');
      });
    }

    // 4. [사용자 요청 3] 화면 오른쪽: 사물 정확한 스펙을 표로 보는 칸 (접이식 드로어)
    const specsDrawer = document.getElementById('specs-drawer');
    const btnToggleSpecs = document.getElementById('btn-toggle-specs');
    const btnCloseSpecs = document.getElementById('btn-close-specs');
    const btnDrawerCert = document.getElementById('btn-drawer-cert-card');

    if (btnToggleSpecs && specsDrawer) {
      btnToggleSpecs.addEventListener('click', () => {
        const isClosed = specsDrawer.classList.contains('closed');
        if (isClosed) {
          specsDrawer.classList.remove('closed');
          specsDrawer.classList.add('open');
        } else {
          specsDrawer.classList.add('closed');
          specsDrawer.classList.remove('open');
        }
      });
    }

    if (btnCloseSpecs && specsDrawer) {
      btnCloseSpecs.addEventListener('click', () => {
        specsDrawer.classList.add('closed');
        specsDrawer.classList.remove('open');
      });
    }

    if (btnDrawerCert) {
      btnDrawerCert.addEventListener('click', () => {
        if (!this.activeReferenceObject) {
          this.toggleReference('card');
        }

        setTimeout(() => {
          const metrics = computeObjectMetrics(this.currentObject);
          generateCertificationCard(
            this.studio.renderer,
            this.studio.scene,
            this.studio.camera,
            this.currentObject?.userData,
            metrics
          );

          const toast = document.getElementById('toast');
          if (toast) {
            toast.innerText = '🥕 당근마켓 크기 인증 카드가 저장되었습니다!';
            toast.classList.remove('opacity-0');
            setTimeout(() => toast.classList.add('opacity-0'), 3000);
          }
        }, 150);
      });
    }

    // 5. 기준 사물 나란히 비교 버튼들 (있는 경우)
    document.querySelectorAll('.ref-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleReference(btn.dataset.ref);
      });
    });

    // 6. 뷰 모드
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setViewMode(btn.dataset.mode);
      });
    });

    // 7. AI 사진/동영상 분석 모달 및 파일 업로드
    const aiModal = document.getElementById('ai-scan-modal');
    const btnOpenAiModal = document.getElementById('btn-open-ai-modal');
    const btnCloseAiModal = document.getElementById('btn-close-ai-modal');
    const aiFileInput = document.getElementById('ai-media-upload-input');
    const aiScanProgress = document.getElementById('ai-scan-progress-text');
    const aiScanBar = document.getElementById('ai-scan-bar');
    const aiResultSheet = document.getElementById('ai-result-sheet');
    const btnApplyAiResult = document.getElementById('btn-apply-ai-3d');

    if (btnOpenAiModal) {
      btnOpenAiModal.addEventListener('click', () => {
        if (aiModal) aiModal.classList.remove('hidden');
      });
    }

    if (btnCloseAiModal && aiModal) {
      btnCloseAiModal.addEventListener('click', () => {
        aiModal.classList.add('hidden');
      });
    }

    // 프리셋 메뉴 내 "+ 사진으로 직접 분석하기" 버튼
    const btnOpenAiPreset = document.getElementById('btn-open-ai-from-preset');
    if (btnOpenAiPreset) {
      btnOpenAiPreset.addEventListener('click', () => {
        if (aiModal) aiModal.classList.remove('hidden');
        if (presetDropdown) presetDropdown.classList.add('hidden');
      });
    }

    // 도움말 가이드 모달 바인딩
    const helpModal = document.getElementById('help-modal');
    const btnOpenHelp = document.getElementById('btn-open-help');
    const btnCloseHelp = document.getElementById('btn-close-help');
    const btnConfirmHelp = document.getElementById('btn-confirm-help');

    if (btnOpenHelp && helpModal) {
      btnOpenHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
    }
    if (btnCloseHelp && helpModal) {
      btnCloseHelp.addEventListener('click', () => helpModal.classList.add('hidden'));
    }
    if (btnConfirmHelp && helpModal) {
      btnConfirmHelp.addEventListener('click', () => helpModal.classList.add('hidden'));
    }

    // 1. 내가 업로드한 마우스 사진으로 즉시 분석 테스트 버튼
    const btnTestMouse = document.getElementById('btn-test-uploaded-mouse');
    const previewBox = document.getElementById('ai-preview-box');
    const previewImg = document.getElementById('ai-preview-img');
    const uploadPrompt = document.getElementById('ai-upload-prompt');

    if (btnTestMouse) {
      btnTestMouse.addEventListener('click', async () => {
        if (aiResultSheet) aiResultSheet.classList.add('hidden');
        if (previewBox && previewImg) {
          previewImg.src = 'media_1789179659497.jpg'; // 업로드된 사용자 마우스 사진
          previewBox.classList.remove('hidden');
          if (uploadPrompt) uploadPrompt.classList.add('hidden');
        }

        if (aiScanProgress) aiScanProgress.innerText = 'AI 비전 신경망 텐서 연산 중...';
        if (aiScanBar) aiScanBar.style.width = '30%';

        await new Promise(r => setTimeout(r, 450));
        if (aiScanBar) aiScanBar.style.width = '75%';
        if (aiScanProgress) aiScanProgress.innerText = '인체공학 곡면 및 1:1 실물 치수 역연산 중...';

        await new Promise(r => setTimeout(r, 450));
        if (aiScanBar) aiScanBar.style.width = '100%';
        if (aiScanProgress) aiScanProgress.innerText = '사물 윤곽 및 스펙 분석 완료!';

        this.renderAiResultSheet(SAMPLE_AI_PRESETS[0].detected);
      });
    }

    // 2. 파일 직접 선택 시 AI 분석
    if (aiFileInput) {
      aiFileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (aiResultSheet) aiResultSheet.classList.add('hidden');

          // 이미지 미리보기 표시
          if (previewBox && previewImg && file.type.startsWith('image')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              previewImg.src = ev.target.result;
              previewBox.classList.remove('hidden');
              if (uploadPrompt) uploadPrompt.classList.add('hidden');
            };
            reader.readAsDataURL(file);
          }

          const detected = await analyzeMediaFile(file, (msg, progress) => {
            if (aiScanProgress) aiScanProgress.innerText = msg;
            if (aiScanBar) aiScanBar.style.width = `${Math.round(progress * 100)}%`;
          });

          this.renderAiResultSheet(detected);
        }
      });
    }

    if (btnApplyAiResult) {
      btnApplyAiResult.addEventListener('click', () => {
        if (this.currentPendingAiResult) {
          this.applyAiAnalysisResult(this.currentPendingAiResult);
          if (aiModal) aiModal.classList.add('hidden');
        }
      });
    }

    // 6. 분해도 슬라이더
    const explodeSlider = document.getElementById('explode-slider');
    const explodeVal = document.getElementById('explode-val');
    if (explodeSlider) {
      explodeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        this.setExplode(val);
        if (explodeVal) explodeVal.innerText = `${e.target.value}%`;
      });
    }

    // 7. 물리 엔진 제어
    const playPhysBtn = document.getElementById('btn-physics-play');
    if (playPhysBtn) {
      playPhysBtn.addEventListener('click', () => {
        this.physics.isRunning = !this.physics.isRunning;
        playPhysBtn.innerHTML = this.physics.isRunning 
          ? '<i data-lucide="pause" class="w-4 h-4"></i> 일시정지' 
          : '<i data-lucide="play" class="w-4 h-4"></i> 시뮬레이션 시작';
        if (window.lucide) lucide.createIcons();
      });
    }

    const impulseBtn = document.getElementById('btn-physics-impulse');
    if (impulseBtn) {
      impulseBtn.addEventListener('click', () => {
        this.physics.applyImpulse(18.0);
      });
    }

    const resetPhysBtn = document.getElementById('btn-physics-reset');
    if (resetPhysBtn) {
      resetPhysBtn.addEventListener('click', () => {
        this.physics.reset();
      });
    }

    // 8. 카메라 뷰 프리셋
    document.querySelectorAll('.camera-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.studio.setCameraPreset(btn.dataset.view, this.currentObject);
      });
    });

    // 9. 토글 스위치들
    const autoRotateToggle = document.getElementById('toggle-auto-rotate');
    if (autoRotateToggle) {
      autoRotateToggle.addEventListener('change', (e) => {
        this.studio.controls.autoRotate = e.target.checked;
        this.studio.controls.autoRotateSpeed = 2.0;
      });
    }

    const dimensionsToggle = document.getElementById('toggle-dimensions');
    if (dimensionsToggle) {
      dimensionsToggle.addEventListener('change', (e) => {
        this.studio.toggleDimensions(e.target.checked);
      });
    }

    const gridToggle = document.getElementById('toggle-grid');
    if (gridToggle) {
      gridToggle.addEventListener('change', (e) => {
        this.studio.toggleGrid(e.target.checked);
      });
    }

    // 10. 스마트 치수 붙여넣기 파서 핸들러
    const smartInput = document.getElementById('smart-input-text');
    const btnSmartParse = document.getElementById('btn-smart-parse');
    
    const handleSmartParse = () => {
      const text = smartInput?.value;
      if (!text) return;
      const parsed = parseDimensionText(text);

      if (parsed) {
        this.customSpecs = {
          widthMm: parsed.widthMm,
          depthMm: parsed.depthMm,
          heightMm: parsed.heightMm,
          shape: parsed.shape,
          materialKey: 'polymer',
          color: '#0284c7',
          name: '스마트 파싱 제품'
        };

        const sw = document.getElementById('spec-w');
        const sd = document.getElementById('spec-d');
        const sh = document.getElementById('spec-h');
        const ss = document.getElementById('spec-shape');
        if (sw) sw.value = parsed.widthMm;
        if (sd) sd.value = parsed.depthMm;
        if (sh) sh.value = parsed.heightMm;
        if (ss) ss.value = parsed.shape;

        this.generateFromCustomSpecs();

        const reportTab = document.querySelector('[data-tab="report"]');
        if (reportTab) reportTab.click();

        const toast = document.getElementById('toast');
        if (toast) {
          toast.innerText = `스마트 인식 성공! (${parsed.detectedText})`;
          toast.classList.remove('opacity-0');
          setTimeout(() => toast.classList.add('opacity-0'), 3000);
        }
      } else {
        alert('치수 문구를 인식하지 못했습니다. "가로 25cm 세로 15cm 높이 10cm" 또는 "220x150x80" 형태로 입력해 주세요.');
      }
    };

    if (btnSmartParse) btnSmartParse.addEventListener('click', handleSmartParse);
    if (smartInput) {
      smartInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSmartParse();
      });
    }

    document.querySelectorAll('.smart-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (smartInput) smartInput.value = chip.dataset.sample;
        handleSmartParse();
      });
    });

    // 11. 스펙 직접 입력 폼 이벤트
    const btnBuildSpec = document.getElementById('btn-build-spec');
    if (btnBuildSpec) {
      btnBuildSpec.addEventListener('click', () => {
        const wVal = parseFloat(document.getElementById('spec-w')?.value || 200);
        const dVal = parseFloat(document.getElementById('spec-d')?.value || 140);
        const hVal = parseFloat(document.getElementById('spec-h')?.value || 80);
        const shapeVal = document.getElementById('spec-shape')?.value || 'rounded';
        const colorVal = document.getElementById('spec-color')?.value || '#0284c7';
        const nameVal = document.getElementById('spec-name')?.value || '맞춤 쇼핑 제품';

        this.customSpecs = {
          widthMm: wVal,
          depthMm: dVal,
          heightMm: hVal,
          shape: shapeVal,
          materialKey: 'polymer',
          color: colorVal,
          name: nameVal
        };

        this.generateFromCustomSpecs();
      });
    }

    // 12. 당근마켓/중고거래 안심 크기 인증 카드 다운로드
    const certBtn = document.getElementById('btn-generate-cert-card');
    if (certBtn) {
      certBtn.addEventListener('click', () => {
        if (!this.activeReferenceObject) {
          this.toggleReference('card');
        }

        setTimeout(() => {
          const metrics = computeObjectMetrics(this.currentObject);
          generateCertificationCard(
            this.studio.renderer,
            this.studio.scene,
            this.studio.camera,
            this.currentObject?.userData,
            metrics
          );

          const toast = document.getElementById('toast');
          if (toast) {
            toast.innerText = '🥕 중고거래 안심 크기 인증 카드가 저장되었습니다!';
            toast.classList.remove('opacity-0');
            setTimeout(() => toast.classList.add('opacity-0'), 3000);
          }
        }, 150);
      });
    }

    // 13. 파일 업로드 (일반 3D 파일)
    const fileInput = document.getElementById('file-upload-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.loadCustomFile(e.target.files[0]);
        }
      });
    }

    // 14. 스크린샷 캡처
    const shotBtn = document.getElementById('btn-capture-shot');
    if (shotBtn) {
      shotBtn.addEventListener('click', () => {
        captureScreenshot(
          this.studio.renderer,
          this.studio.scene,
          this.studio.camera,
          `Realize3D_${this.currentPresetKey}_${Date.now()}.png`
        );
        const toast = document.getElementById('toast');
        if (toast) {
          toast.innerText = '고해상도 3D 스크린샷이 저장되었습니다!';
          toast.classList.remove('opacity-0');
          setTimeout(() => toast.classList.add('opacity-0'), 2500);
        }
      });
    }

    // 15. 탭 전환
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabTarget = tab.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

        tab.classList.add('active');
        const content = document.getElementById(`tab-panel-${tabTarget}`);
        if (content) content.classList.remove('hidden');
      });
    });
  }

  renderAiResultSheet(detected) {
    this.currentPendingAiResult = detected;
    const sheet = document.getElementById('ai-result-sheet');
    if (!sheet) return;

    sheet.classList.remove('hidden');
    const nameEl = document.getElementById('ai-res-name');
    const sizeEl = document.getElementById('ai-res-size');
    const confEl = document.getElementById('ai-res-confidence');
    const descEl = document.getElementById('ai-res-desc');

    if (nameEl) nameEl.innerText = detected.name;
    if (sizeEl) sizeEl.innerText = `${detected.widthMm}mm × ${detected.depthMm}mm × ${detected.heightMm}mm (${detected.weight || '실측 규격'})`;
    if (confEl) confEl.innerText = `${detected.confidence}% 일치`;
    if (descEl) descEl.innerText = detected.materialDesc || '100% 수밀 인체공학 3D 메쉬';
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    if (this.currentPresetKey === 'gear' && this.currentObject && this.currentObject.userData?.updateMechanical) {
      this.currentObject.userData.updateMechanical(elapsedTime);
    }

    if (this.viewMode === 'physics' && this.physics && this.physics.isRunning) {
      this.physics.update(delta);
    }

    this.studio.render();

    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = now;

      const fpsBadge = document.getElementById('fps-badge');
      if (fpsBadge) fpsBadge.innerText = `${this.fps} FPS`;
    }
  }
}

function startApp() {
  if (window.__appStarted) return;
  window.__appStarted = true;
  buildAppLayout('#app');
  window.realize3D = new Realize3DApp();
  initChatbot();
  if (window.lucide) lucide.createIcons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
