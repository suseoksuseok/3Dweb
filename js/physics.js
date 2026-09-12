/**
 * Physics Simulation Engine Module
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 */
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class PhysicsEngine {
  constructor() {
    this.world = null;
    this.bodies = [];
    this.meshes = [];
    this.gravityValue = -9.82;
    this.isRunning = false;
    this.timeStep = 1 / 60;
    this.initWorld();
  }

  initWorld() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, this.gravityValue, 0)
    });

    // 기본 접촉 재질
    const defaultMaterial = new CANNON.Material('default');
    const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0.4,
        restitution: 0.6 // 탄성 (바운스)
      }
    );
    this.world.defaultContactMaterial = defaultContactMaterial;

    // 무한 바닥 평면 물리 바디 추가
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
      material: defaultMaterial
    });
    // X축 -90도 회전하여 Y축 상향 노멀 평면 생성
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    groundBody.position.set(0, 0, 0);
    this.world.addBody(groundBody);
    this.groundBody = groundBody;
  }

  /**
   * 중력 모드 설정 (지구, 달, 화성, 무중력 등)
   */
  setGravity(type = 'earth') {
    switch (type) {
      case 'earth':
        this.gravityValue = -9.82;
        break;
      case 'moon':
        this.gravityValue = -1.62;
        break;
      case 'mars':
        this.gravityValue = -3.71;
        break;
      case 'zero':
        this.gravityValue = 0;
        break;
      case 'heavy':
        this.gravityValue = -25.0;
        break;
      default:
        this.gravityValue = -9.82;
    }
    if (this.world) {
      this.world.gravity.set(0, this.gravityValue, 0);
    }
  }

  /**
   * Three.js 그룹/객체에서 물리 바디 등록
   */
  registerSceneObjects(rootObject) {
    this.clearObjects();

    rootObject.traverse((child) => {
      if (child.isMesh && child.userData && child.userData.isPhysics) {
        this.addMeshBody(child);
      }
    });
  }

  addMeshBody(mesh) {
    const data = mesh.userData;
    let shape;

    if (data.type === 'box') {
      const [sx, sy, sz] = data.size || [1, 1, 1];
      shape = new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2));
    } else if (data.type === 'sphere') {
      shape = new CANNON.Sphere(data.radius || 0.5);
    } else {
      shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    }

    const body = new CANNON.Body({
      mass: data.mass ?? 1.0,
      shape: shape,
      position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z)
    });

    body.quaternion.set(
      mesh.quaternion.x,
      mesh.quaternion.y,
      mesh.quaternion.z,
      mesh.quaternion.w
    );

    // 감쇠 (Damping)
    body.linearDamping = 0.1;
    body.angularDamping = 0.2;

    this.world.addBody(body);
    this.bodies.push(body);
    this.meshes.push(mesh);
  }

  /**
   * 첫 번째 도미노 또는 중앙 물체에 충격파 가하기
   */
  applyImpulse(strength = 12.0) {
    if (this.bodies.length === 0) return;

    // 첫 번째 도미노나 물체에 충격
    const firstBody = this.bodies[0];
    if (firstBody) {
      const impulse = new CANNON.Vec3(strength, strength * 0.2, 0);
      const point = new CANNON.Vec3(
        firstBody.position.x,
        firstBody.position.y + 0.8,
        firstBody.position.z
      );
      firstBody.applyImpulse(impulse, point);
      firstBody.wakeUp();
    }

    // 또는 무작위 외력 가하기
    for (let i = 1; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      if (Math.random() > 0.6) {
        const randImpulse = new CANNON.Vec3(
          (Math.random() - 0.5) * 4,
          Math.random() * 3,
          (Math.random() - 0.5) * 4
        );
        b.applyImpulse(randImpulse, b.position);
        b.wakeUp();
      }
    }
  }

  /**
   * 물리 엔진 루프 스텝
   */
  update(delta) {
    if (!this.isRunning || !this.world) return;

    // 고정 시간 단계로 안정적인 시뮬레이션
    const dt = Math.min(delta, 0.1);
    this.world.step(this.timeStep, dt, 3);

    // Three.js 메쉬 위치 및 회전 동기화
    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i];
      const mesh = this.meshes[i];

      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    }
  }

  /**
   * 원래 위치로 리셋
   */
  reset() {
    for (let i = 0; i < this.bodies.length; i++) {
      const body = this.bodies[i];
      const mesh = this.meshes[i];

      if (mesh.userData && mesh.userData.initialPos) {
        const p = mesh.userData.initialPos;
        body.position.set(p.x, p.y, p.z);
        body.quaternion.set(0, 0, 0, 1);
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);

        mesh.position.copy(p);
        mesh.rotation.set(0, 0, 0);
      }
    }
  }

  clearObjects() {
    for (const body of this.bodies) {
      this.world.removeBody(body);
    }
    this.bodies = [];
    this.meshes = [];
  }
}
