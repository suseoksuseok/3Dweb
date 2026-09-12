/**
 * Three.js Scene, Camera, Lighting & Helpers Module
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class StudioScene {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.grid = null;
    this.floor = null;
    this.dimensionLines = null;
    this.lights = {};
    this.targetCameraPos = null;
    this.showDimensions = true;

    this.init();
  }

  init() {
    // 1. 씬 생성
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#03060d');

    // 미세 안개 효과
    this.scene.fog = new THREE.FogExp2('#03060d', 0.008);

    // 2. 카메라 설정 (뷰포트 컨테이너 크기 기반, 가드 포함)
    let width = this.container.clientWidth || window.innerWidth;
    let height = this.container.clientHeight;
    if (!height || height < 200) {
      height = window.innerHeight - 56;
    }
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.position.set(22, 18, 26);

    // 3. 렌더러 설정
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. 마우스 오빗 컨트롤러
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // 바닥 아래로 내려가지 않도록 제한
    this.controls.minDistance = 2;
    this.controls.maxDistance = 200;
    this.controls.target.set(0, 11, 0);

    // 5. 스튜디오 조명 구성
    this.setupLighting();

    // 6. 바닥 대형 그리드 및 섀도우 플레인
    this.setupFloor();

    // 7. 실시간 리사이즈 옵저버 및 다중 리사이즈 가드
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.onResize();
      });
      this.resizeObserver.observe(this.container);
    }
    window.addEventListener('resize', () => this.onResize());

    // 초기 돔 마운트 및 flexbox 렌더링 완료 시점 안전 리사이즈
    requestAnimationFrame(() => this.onResize());
    setTimeout(() => this.onResize(), 80);
    setTimeout(() => this.onResize(), 300);
  }

  setupLighting() {
    // 앰비언트 광원
    const ambient = new THREE.AmbientLight('#ffffff', 0.8);
    this.scene.add(ambient);
    this.lights.ambient = ambient;

    // 주 조명 (Key Light - 부드러운 그림자)
    const keyLight = new THREE.DirectionalLight('#ffffff', 2.0);
    keyLight.position.set(15, 25, 15);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);
    this.lights.key = keyLight;

    // 보조 채움광 (Fill Light - 쿨 톤)
    const fillLight = new THREE.DirectionalLight('#93c5fd', 1.0);
    fillLight.position.set(-15, 12, -10);
    this.scene.add(fillLight);
    this.lights.fill = fillLight;

    // 림 하이라이트광 (Rim Light)
    const rimLight = new THREE.DirectionalLight('#38bdf8', 1.2);
    rimLight.position.set(0, 15, -20);
    this.scene.add(rimLight);
    this.lights.rim = rimLight;
  }

  setupFloor() {
    // 테크니컬 대형 바닥 그리드 (넓고 웅장한 시뮬레이션 가상 룸 구현)
    this.grid = new THREE.GridHelper(60, 60, '#2563eb', '#0d1629');
    this.grid.position.y = 0;
    this.scene.add(this.grid);

    // 센터 서클 가이드 링
    const ringGeo = new THREE.RingGeometry(14, 14.12, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#1d4ed8', side: THREE.DoubleSide, opacity: 0.35, transparent: true });
    this.guideRing = new THREE.Mesh(ringGeo, ringMat);
    this.guideRing.rotation.x = -Math.PI / 2;
    this.guideRing.position.y = 0.005;
    this.scene.add(this.guideRing);

    // 그림자 캡처 전용 섀도우 플레인 (120 x 120)
    const floorGeo = new THREE.PlaneGeometry(120, 120);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -0.01;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
  }

  /**
   * 조명 환경 프리셋 변경
   */
  setLightingPreset(preset = 'studio') {
    switch (preset) {
      case 'studio':
        this.scene.background.set('#03060d');
        this.scene.fog.color.set('#03060d');
        this.lights.ambient.color.set('#ffffff');
        this.lights.ambient.intensity = 0.8;
        this.lights.key.color.set('#ffffff');
        this.lights.key.intensity = 2.0;
        this.lights.fill.color.set('#93c5fd');
        break;
      case 'tech_lab':
        this.scene.background.set('#030712');
        this.scene.fog.color.set('#030712');
        this.lights.ambient.color.set('#38bdf8');
        this.lights.ambient.intensity = 0.6;
        this.lights.key.color.set('#e0f2fe');
        this.lights.key.intensity = 2.4;
        this.lights.fill.color.set('#0284c7');
        break;
      case 'sunset':
        this.scene.background.set('#1c1917');
        this.scene.fog.color.set('#1c1917');
        this.lights.ambient.color.set('#fed7aa');
        this.lights.ambient.intensity = 0.7;
        this.lights.key.color.set('#fb923c');
        this.lights.key.intensity = 2.2;
        this.lights.fill.color.set('#f43f5e');
        break;
      case 'cyber_neon':
        this.scene.background.set('#020617');
        this.scene.fog.color.set('#020617');
        this.lights.ambient.color.set('#4c1d95');
        this.lights.ambient.intensity = 0.9;
        this.lights.key.color.set('#06b6d4');
        this.lights.key.intensity = 2.5;
        this.lights.fill.color.set('#ec4899');
        break;
    }
  }

  /**
   * 치수 측정선 바운딩 박스 업데이트
   */
  updateDimensionLines(targetObject) {
    if (this.dimensionLines) {
      this.scene.remove(this.dimensionLines);
      this.dimensionLines = null;
    }

    if (!this.showDimensions || !targetObject) return;

    const box = new THREE.Box3().setFromObject(targetObject);
    if (box.isEmpty()) return;

    const helper = new THREE.Box3Helper(box, new THREE.Color('#38bdf8'));
    this.dimensionLines = helper;
    this.scene.add(this.dimensionLines);
  }

  toggleDimensions(visible) {
    this.showDimensions = visible;
    if (this.dimensionLines) {
      this.dimensionLines.visible = visible;
    }
  }

  toggleGrid(visible) {
    if (this.grid) this.grid.visible = visible;
    if (this.floor) this.floor.visible = visible;
  }

  toggleShadows(enabled) {
    this.renderer.shadowMap.enabled = enabled;
    this.lights.key.castShadow = enabled;
  }

  /**
   * 사물의 크기를 분석하여 화면 중심에서 시원하고 입체감 있게 꽉 차도록 카메라 자동 프레이밍
   */
  focusOnObject(targetObject, preset = 'isometric') {
    if (!targetObject) return;
    const box = new THREE.Box3().setFromObject(targetObject);
    if (box.isEmpty()) return;

    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    // 사물의 3D 중심점을 정확히 오빗 회전축으로 설정
    this.controls.target.copy(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    // 화면 높이의 약 60%를 채우도록 시뮬레이션 최적 거리 계산
    let dist = Math.abs((maxDim / 2) / Math.tan(fov / 2)) * 1.5;
    dist = Math.max(dist, 16); // 최소 거리 보장

    let newPos;
    switch (preset) {
      case 'front':
        newPos = new THREE.Vector3(center.x, center.y, center.z + dist);
        break;
      case 'top':
        newPos = new THREE.Vector3(center.x, center.y + dist * 1.15, center.z + 0.001);
        break;
      case 'side':
        newPos = new THREE.Vector3(center.x + dist, center.y, center.z);
        break;
      case 'isometric':
      case 'reset':
      default:
        newPos = new THREE.Vector3(
          center.x + dist * 0.72,
          center.y + dist * 0.55,
          center.z + dist * 0.72
        );
        break;
    }

    this.targetCameraPos = newPos;
  }

  /**
   * 카메라 시점 프리셋 이동
   */
  setCameraPreset(viewName, targetObject = null) {
    if (targetObject) {
      this.focusOnObject(targetObject, viewName);
      return;
    }

    const target = this.controls.target;
    let newPos;

    switch (viewName) {
      case 'isometric':
        newPos = new THREE.Vector3(target.x + 22, target.y + 18, target.z + 24);
        break;
      case 'front':
        newPos = new THREE.Vector3(target.x, target.y, target.z + 28);
        break;
      case 'top':
        newPos = new THREE.Vector3(target.x, target.y + 32, target.z + 0.001);
        break;
      case 'side':
        newPos = new THREE.Vector3(target.x + 28, target.y, target.z);
        break;
      case 'reset':
      default:
        newPos = new THREE.Vector3(target.x + 22, target.y + 18, target.z + 24);
        break;
    }

    this.targetCameraPos = newPos;
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height || width < 20 || height < 20) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render() {
    // 부드러운 카메라 프리셋 보간 이동
    if (this.targetCameraPos) {
      this.camera.position.lerp(this.targetCameraPos, 0.08);
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.05) {
        this.camera.position.copy(this.targetCameraPos);
        this.targetCameraPos = null;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
