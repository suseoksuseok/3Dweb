# 3D시뮬레이션을 이용한 사물 구현화 (Realize3D Studio)

> **현실 사물의 디지털 트윈 시뮬레이션 및 파라메트릭 인터랙티브 3D 플랫폼**

본 프로젝트는 웹 브라우저 상에서 다양한 실제 사물을 고해상도 3D로 시각화하고, 부품별 분해도(Exploded View), 파라메트릭 치수 실시간 변형, PBR 재질 시뮬레이션 및 물리 법칙(중력, 충돌, 반발력)을 통해 현실 사물처럼 가상으로 구현·검증할 수 있는 인터랙티브 웹 애플리케이션입니다.

---

## 🌟 주요 기능 (Key Features)

### 1. 사물 구현화 프리셋 (Object Realization)
- **스마트 기기 어셈블리 (Smart Device)**
  - 알루미늄 섀시, 120Hz OLED 디스플레이 패널, A16 로직 보드(PCB 절차적 텍스처), 4,800mAh 리튬 배터리, 트리플 광학 카메라, 세라믹 쉴드 강화유리
  - **부품 전개 분해도 (Exploded View)**: 0% ~ 100% 슬라이더 조작으로 모든 내부 부품이 Z축으로 부드럽게 분해/조립
- **정밀 유성 기어 조립체 (Planetary Gearbox)**
  - 선 기어(Sun Gear), 3중 유성 기어(Planet Gears), 외륜 링 기어(Ring Gear), 캐리어 플레이트
  - **실시간 기계적 연동 회전**: 실제 기어비($Z_{sun}=16$, $Z_{planet}=12$, $Z_{ring}=40$)에 맞춰 동역학 회전 시뮬레이션
- **파라메트릭 모던 가구 (Parametric Chair)**
  - 좌판 폭, 깊이, 높이, 등받이 각도 및 다리 프레임 두께를 슬라이더로 실시간 조절 시 **3D 메쉬 형상이 동적으로 재계산**되어 즉시 변형
- **물리 역학 시뮬레이션 랩 (Physics Dynamics)**
  - 10개 연속 도미노 체인, 적층 큐브 타워, 튕기는 탄성 구체
  - **지구(9.8m/s²), 달(1.6m/s²), 화성(3.7m/s²), 무중력(Zero-G)** 등 중력 환경 변경 및 충격파(Impact) 발사 지원
- **사용자 3D 모델 불러오기 (Custom 3D Import)**
  - 사용자가 보유한 `.glb`, `.gltf`, `.obj` 파일을 드래그 앤 드롭 또는 파일 선택으로 즉시 웹 뷰어에 로드하고 재질 변경 및 계측 가능

### 2. PBR 재질 및 표면 렌더링 (Materials & Shading)
- 원클릭 재질 프리셋: 아노다이징 알루미늄, 유광 크롬, 사파이어 글래스, 골드 브래스, 카본 파이버, 내추럴 오크 원목, 무광 테크 폴리머, 사이버 네온
- 커스텀 파라미터 튜닝: 기본 색상(Base Color), 거칠기(Roughness), 금속성(Metalness), 투명도(Opacity), 발광(Emissive)

### 3. 스튜디오 환경 & 계측 도구 (Studio & Inspection)
- 스튜디오 조명 프리셋: 스튜디오 웜, 테크니컬 랩 쿨, 석양 글로우, 사이버 네온
- 카메라 퀵 프리셋: 아이소메트릭(ISO), 정면, 상단, 측면, 초기화
- 턴테이블 자동 회전, 3D 실시간 바운딩 박스 치수선(Dimensions Guide), 바닥 그리드 토글
- 사물 체적(cm³), 가로/세로/높이(mm), 삼각형 폴리곤 수 실시간 산출
- 뷰포트 마우스 호버 시 실시간 부품 명칭 및 스펙 툴팁 표시
- 3D 프린터용 **STL 파일 내보내기** 및 **고해상도 PNG 스크린샷 캡처**

---

## 🚀 실행 방법 (How to Run)

### 방법 1: 배치 파일 더블 클릭 (가장 간편)
폴더 내 `run.bat` 파일을 더블 클릭하면 자동으로 로컬 서버가 구동되고 브라우저가 열립니다.

### 방법 2: 파이썬 커맨드로 실행
터미널(PowerShell 또는 CMD)에서 다음 명령어를 입력합니다:
```bash
cd C:\Users\Administrator\.gemini\antigravity\scratch\3d-object-simulator
python server.py
```
실행 후 브라우저에서 `http://localhost:8080` 으로 접속합니다.

---

## 📁 디렉터리 구조 (Project Structure)

```
3d-object-simulator/
├── index.html            # 메인 웹 페이지 (Tailwind CSS, 레이아웃)
├── server.py             # 로컬 파이썬 웹 서버 (CORS & MIME 핸들링)
├── run.bat               # 원클릭 실행 스크립트
├── css/
│   └── style.css         # 글래스모피즘, 다크 CAD 테마 스타일시트
├── js/
│   ├── app.js            # 메인 컨트롤러 및 이벤트 바인딩
│   ├── scene.js          # Three.js 씬, 카메라, 조명, 뷰 제어
│   ├── objects.js        # 사물 모델링 (스마트폰, 유성기어, 파라메트릭 가구, 물리랩)
│   ├── materials.js      # PBR 재질 및 절차적 텍스처(PCB, 화면, 카본, 원목)
│   ├── physics.js        # Cannon-es 기반 물리 동역학 엔진
│   └── exporter.js       # STL 파일 내보내기 및 렌더 캡처
└── README.md             # 프로젝트 설명서
```
