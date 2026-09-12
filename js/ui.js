/**
 * Pure JavaScript UI Architecture Module
 * 웹사이트 전체 레이아웃 및 돔 컴포넌트를 100% 자바스크립트로 동적 생성 및 마운트
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 */

export function buildAppLayout(rootElement) {
  if (typeof rootElement === 'string') {
    rootElement = document.querySelector(rootElement);
  }
  if (!rootElement) return;

  rootElement.innerHTML = `
    <!-- 1. 상단 글로벌 네비게이션 헤더 바 -->
    <header class="h-13 border-b border-white/5 bg-[#070b14]/95 backdrop-blur-md flex items-center justify-between px-4 z-30 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 via-cyan-600 to-emerald-500 flex items-center justify-center shadow-md shadow-blue-500/20">
          <i data-lucide="layers" class="w-4 h-4 text-white"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-bold text-sm tracking-tight text-white">3D시뮬레이션을 이용한 사물 구현화</h1>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">AI 실물 스펙 시뮬레이터</span>
          </div>
        </div>
      </div>

      <!-- 우측 헤더 유틸리티 -->
      <div class="flex items-center gap-2">
        <!-- 사물 프리셋 선택 드롭다운 버튼 -->
        <div class="relative">
          <button id="btn-toggle-presets" class="tool-btn py-1.5 px-3 text-xs" title="다른 사물 프리셋 고르기">
            <i data-lucide="package" class="w-3.5 h-3.5 text-cyan-400"></i>
            <span>사물 변경</span>
          </button>

          <!-- 프리셋 드롭다운 메뉴 -->
          <div id="preset-dropdown" class="hidden absolute right-0 top-full mt-2 w-64 bg-[#060a14]/98 rounded-xl p-2 z-50 border border-white/10 shadow-2xl space-y-1 backdrop-blur-xl">
            <div class="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">실물 사물 프리셋</div>
            <button class="preset-btn active w-full text-left p-2 rounded-lg hover:bg-white/5 text-xs flex items-center gap-2" data-preset="tumbler">
              <i data-lucide="flask-conical" class="w-3.5 h-3.5 text-blue-400"></i>
              <span>500ml 보온 텀블러</span>
            </button>
            <button class="preset-btn w-full text-left p-2 rounded-lg hover:bg-white/5 text-xs flex items-center gap-2" data-preset="headphones">
              <i data-lucide="headphones" class="w-3.5 h-3.5 text-purple-400"></i>
              <span>무선 오버이어 헤드폰</span>
            </button>
            <button class="preset-btn w-full text-left p-2 rounded-lg hover:bg-white/5 text-xs flex items-center gap-2" data-preset="minibag">
              <i data-lucide="briefcase" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>가죽 미니 크로스백</span>
            </button>
            <button class="preset-btn w-full text-left p-2 rounded-lg hover:bg-white/5 text-xs flex items-center gap-2" data-preset="gaming_mouse">
              <i data-lucide="mouse" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span>로지텍 G PRO X 마우스</span>
            </button>
            <button class="preset-btn w-full text-left p-2 rounded-lg hover:bg-white/5 text-xs flex items-center gap-2" data-preset="mouse">
              <i data-lucide="mouse-pointer-2" class="w-3.5 h-3.5 text-sky-400"></i>
              <span>버티컬 인체공학 마우스</span>
            </button>
            <button class="preset-btn w-full text-left p-2 rounded-lg hover:bg-white/5 text-xs flex items-center gap-2" data-preset="cube_clock">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-orange-400"></i>
              <span>큐브 무드등 탁상시계</span>
            </button>
            <div class="border-t border-white/5 my-1"></div>
            <button id="btn-open-ai-from-preset" class="w-full text-left p-2 rounded-lg hover:bg-blue-600/20 text-xs text-cyan-300 font-semibold flex items-center gap-2">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span>+ 사진으로 직접 분석하기</span>
            </button>
          </div>
        </div>

        <!-- 도움말 모달 -->
        <button id="btn-open-help" class="tool-btn p-1.5 text-slate-400 hover:text-white" title="이용 가이드">
          <i data-lucide="help-circle" class="w-4 h-4"></i>
        </button>

        <!-- FPS -->
        <div id="fps-badge" class="px-2 py-1 rounded bg-black/60 text-[10px] font-mono font-semibold text-emerald-400 border border-white/5">
          60 FPS
        </div>
      </div>
    </header>

    <!-- 2. 화면 중심: 메인 3D 시뮬레이션 뷰포트 영역 (중심 배치) -->
    <main id="viewport-container" class="flex-1 relative w-full h-full bg-[#03060d] overflow-hidden cursor-grab active:cursor-grabbing">

      <!-- ============================================================ -->
      <!-- [사용자 요청 1] 중심 위: 시뮬레이션 모드 설정 세그먼트 컨트롤 -->
      <!-- ============================================================ -->
      <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass-floating p-1 rounded-xl flex items-center gap-1 border border-white/10 shadow-2xl">
        <!-- 모드 1: 사물 한 개만 보기 -->
        <button id="mode-single" class="sim-mode-btn active" title="사물 한 개만 화면 중심에서 집중 관찰합니다">
          <i data-lucide="box" class="w-4 h-4"></i>
          <span>사물 한 개만 보기</span>
        </button>

        <!-- 모드 2: 다른 사물과 비교할 수 있는 모드 -->
        <button id="mode-compare" class="sim-mode-btn" title="다른 사물이나 추천 제품과 나란히/겹쳐서 3D 비교합니다">
          <i data-lucide="split" class="w-4 h-4"></i>
          <span>다른 사물과 비교하기</span>
        </button>
      </div>

      <!-- 비교 모드 선택 시 활성화되는 하위 컨트롤 바 (비교 옵션) -->
      <div id="compare-sub-bar" class="hidden absolute top-16 left-1/2 -translate-x-1/2 z-20 glass-floating px-4 py-2 rounded-xl flex items-center gap-3 border border-cyan-500/20 text-xs shadow-xl">
        <div class="flex items-center gap-1.5 border-r border-white/10 pr-3">
          <span class="text-slate-400 text-[11px]">비교 방식:</span>
          <button id="btn-comp-side" class="tool-btn active py-1 px-2.5 text-xs">
            <i data-lucide="columns" class="w-3.5 h-3.5"></i>
            <span>나란히 보기</span>
          </button>
          <button id="btn-comp-overlay" class="tool-btn py-1 px-2.5 text-xs" title="두 사물을 반투명하게 겹쳐서 실루엣을 대조합니다">
            <i data-lucide="layers" class="w-3.5 h-3.5"></i>
            <span>겹쳐보기 (Ghost)</span>
          </button>
        </div>

        <!-- 비교 대상 퀵 선택 -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400 text-[11px]">비교 대상:</span>
          <button class="comp-target-btn tool-btn active py-1 px-2 text-xs" data-target="recommend">
            <span>AI 추천 상품</span>
          </button>
          <button class="comp-target-btn tool-btn py-1 px-2 text-xs" data-target="card">
            <span>신용카드</span>
          </button>
          <button class="comp-target-btn tool-btn py-1 px-2 text-xs" data-target="can">
            <span>음료 캔</span>
          </button>
          <button class="comp-target-btn tool-btn py-1 px-2 text-xs" data-target="phone">
            <span>스마트폰</span>
          </button>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- [사용자 요청 2] 중심 밑: 사진과 동영상을 업로드 할 수 있는 버튼 -->
      <!-- ============================================================ -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <!-- 핵심 액션 버튼 -->
        <button id="btn-bottom-upload" class="btn-upload-glow px-6 py-3 rounded-full text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 cursor-pointer">
          <div class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <i data-lucide="camera" class="w-4 h-4 text-white"></i>
          </div>
          <span>사진 · 동영상 업로드하여 3D AI 분석</span>
          <i data-lucide="sparkles" class="w-4 h-4 text-cyan-200"></i>
        </button>

        <span class="text-[11px] text-slate-400 bg-black/80 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
          💡 사진을 올리면 AI가 크기, 모양, 재질을 자동 측정해 3D로 구현합니다
        </span>
      </div>

      <!-- 좌측 상단 카메라 퀵 시점 컨트롤 (중심 모드바 아래 독립 배치) -->
      <div class="absolute top-16 left-4 z-20 flex items-center gap-1 glass-floating p-1 rounded-xl border border-white/10 shadow-xl">
        <button class="camera-btn p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium px-2" data-view="isometric">ISO</button>
        <button class="camera-btn p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium px-2" data-view="front">정면</button>
        <button class="camera-btn p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium px-2" data-view="top">상단</button>
        <button class="camera-btn p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium px-2" data-view="reset" title="시점 리셋">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
        </button>
        <div class="h-4 w-[1px] bg-white/15 mx-1"></div>
        <label class="flex items-center gap-1 text-[11px] text-slate-300 px-1 cursor-pointer">
          <input type="checkbox" id="toggle-auto-rotate" class="rounded border-white/20 bg-slate-900 text-blue-500">
          <span>회전</span>
        </label>
      </div>

      <!-- 마우스 호버 부품 툴팁 -->
      <div id="part-tooltip" class="part-tag opacity-0"></div>

      <!-- 드롭존 오버레이 -->
      <div id="drop-zone" class="hidden absolute inset-0 z-50 bg-[#03060d]/90 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-blue-500 m-4 rounded-2xl">
        <i data-lucide="upload-cloud" class="w-16 h-16 text-blue-400 mb-4 animate-bounce"></i>
        <h3 class="text-xl font-bold text-white mb-1">사진이나 3D 모델 파일을 여기에 놓아주세요</h3>
        <p class="text-sm text-slate-400">AI 스펙 분석 및 3D 사물 구현화</p>
      </div>

    </main>

    <!-- ============================================================ -->
    <!-- [사용자 요청 3] 화면 오른쪽: 사물 정확한 스펙을 표로 보는 칸 -->
    <!-- (평소에는 닫혀있다가 버튼을 누르면 부드럽게 열리는 접이식 드로어) -->
    <!-- ============================================================ -->

    <!-- 우측 가장자리 플로팅 토글 탭 버튼 -->
    <button id="btn-toggle-specs" class="specs-drawer-toggle" title="사물의 정확한 스펙 표를 확인합니다">
      <i data-lucide="clipboard-list" class="w-4 h-4 text-cyan-400"></i>
      <span>정밀 스펙 표</span>
      <i data-lucide="chevron-left" class="w-3.5 h-3.5 text-slate-400"></i>
    </button>

    <!-- 우측 슬라이딩 스펙 표 드로어 (기본 상태: closed) -->
    <aside id="specs-drawer" class="specs-drawer closed p-5 flex flex-col">
      <!-- 드로어 상단 헤더 -->
      <div class="flex items-center justify-between border-b border-white/5 pb-3 mb-4 shrink-0">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <i data-lucide="table-2" class="w-3.5 h-3.5"></i>
          </div>
          <h3 class="text-sm font-bold text-white">사물 정밀 스펙 요약표</h3>
        </div>
        <button id="btn-close-specs" class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition" title="스펙 표 닫기">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- 스펙 표 내용 (스크롤 가능) -->
      <div class="flex-1 overflow-y-auto space-y-4 pr-1">
        
        <!-- 제품 기본 정보 카드 -->
        <div class="p-3 rounded-xl bg-[#070b16] border border-white/5 shadow-md">
          <div id="tbl-category" class="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">생활/주방</div>
          <h4 id="tbl-name" class="text-sm font-bold text-white mb-1">500ml 보온 텀블러</h4>
          <div id="tbl-summary-badge" class="text-[11px] font-mono text-cyan-300 font-semibold">지름 72mm x 높이 225mm</div>
        </div>

        <!-- 정밀 치수 및 물리 사양 표 (HTML Table) -->
        <div class="rounded-xl overflow-hidden border border-white/5 bg-[#03050c] shadow-lg">
          <table class="spec-table">
            <tbody>
              <tr>
                <th>가로 폭 (W)</th>
                <td id="tbl-w" class="text-blue-400">72 mm (7.2 cm)</td>
              </tr>
              <tr>
                <th>세로 깊이 (D)</th>
                <td id="tbl-d" class="text-cyan-400">72 mm (7.2 cm)</td>
              </tr>
              <tr>
                <th>전체 높이 (H)</th>
                <td id="tbl-h" class="text-emerald-400">225 mm (22.5 cm)</td>
              </tr>
              <tr>
                <th>기본 형상</th>
                <td id="tbl-shape" class="text-slate-200">원통형 (Cylinder)</td>
              </tr>
              <tr>
                <th>실측 체적</th>
                <td id="tbl-vol" class="text-amber-400">175.2 cm³</td>
              </tr>
              <tr>
                <th>실측 무게</th>
                <td id="tbl-weight" class="text-purple-400">60 g (초경량)</td>
              </tr>
              <tr>
                <th>표면 재질</th>
                <td id="tbl-mat" class="text-slate-300">매트 UV 코팅 &amp; 논슬립 그립</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 중고거래 안심 인증 카드 다운로드 버튼 -->
        <button id="btn-drawer-cert-card" class="w-full py-2.5 rounded-xl bg-orange-950/35 hover:bg-orange-900/50 text-orange-300 hover:text-white border border-orange-500/25 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-md">
          <i data-lucide="award" class="w-4 h-4 text-orange-400"></i>
          <span>당근마켓 크기 인증 카드 다운로드</span>
        </button>

      </div>
    </aside>

    <!-- [AI 사진/동영상 정밀 분석 모달] (중심 밑 버튼 클릭 시 팝업) -->
    <div id="ai-scan-modal" class="hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-[#060a14] max-w-xl w-full p-6 rounded-2xl border border-cyan-500/20 relative space-y-4 shadow-2xl">
        <button id="btn-close-ai-modal" class="absolute top-4 right-4 text-slate-400 hover:text-white">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <i data-lucide="camera" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">AI 사진/동영상 스펙 정밀 분석</h3>
            <p class="text-xs text-slate-400">업로드하신 사물의 실제 크기(W, D, H), 3D 곡면 형상, 재질을 정밀 분석해 시뮬레이션합니다.</p>
          </div>
        </div>

        <!-- 업로드 드롭존 (와이드 단일 영역) -->
        <div class="p-6 rounded-xl bg-[#020409] border border-cyan-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[200px]">
          <div class="scan-laser-line"></div>
          
          <!-- 이미지 미리보기 컨테이너 (업로드 시 표시) -->
          <div id="ai-preview-box" class="hidden mb-3 relative rounded-lg overflow-hidden border border-cyan-500/40 max-h-48 max-w-xs shadow-lg">
            <img id="ai-preview-img" src="" alt="업로드 이미지" class="object-contain max-h-48 w-auto">
          </div>

          <div id="ai-upload-prompt" class="flex flex-col items-center">
            <i data-lucide="upload-cloud" class="w-12 h-12 text-cyan-400 mb-2"></i>
            <span class="text-sm font-bold text-white mb-1">내 제품 사진 / 동영상 올리기</span>
            <p class="text-xs text-slate-400 mb-4">여기에 사진을 끌어다 놓거나 아래 버튼을 누르세요 (JPG, PNG, MP4)</p>
          </div>
          
          <div class="flex items-center gap-2 flex-wrap justify-center">
            <label class="py-2 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition">
              <i data-lucide="folder-open" class="w-3.5 h-3.5"></i>
              <span>내 기기에서 파일 선택</span>
              <input type="file" id="ai-media-upload-input" accept="image/*,video/*" class="hidden">
            </label>

            <!-- 내가 업로드한 마우스 사진 즉시 테스트 버튼 -->
            <button type="button" id="btn-test-uploaded-mouse" class="py-2 px-4 rounded-xl bg-[#0b1329] hover:bg-[#121e42] border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition">
              <i data-lucide="mouse" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span>업로드한 마우스 사진으로 분석</span>
            </button>
          </div>
        </div>

        <!-- 프로그레스 바 -->
        <div class="space-y-1 pt-1">
          <span id="ai-scan-progress-text" class="text-xs text-slate-400">사물 사진을 선택하시면 AI 정밀 분석이 시작됩니다.</span>
          <div class="w-full h-1.5 rounded-full bg-black/80 border border-white/5 overflow-hidden">
            <div id="ai-scan-bar" class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 w-0 transition-all duration-300"></div>
          </div>
        </div>

        <!-- AI 정밀 분석 결과 시트 (불필요한 형태 선택 칩 완전 제거) -->
        <div id="ai-result-sheet" class="hidden p-4 rounded-xl bg-[#040710] border border-cyan-500/30 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i>
              <h4 id="ai-res-name" class="text-sm font-bold text-white">로지텍 G PRO X SUPERLIGHT 2 무선 게이밍 마우스</h4>
            </div>
            <span id="ai-res-confidence" class="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">99.4% 일치</span>
          </div>
          
          <div class="p-3 rounded-lg bg-[#080d1a] border border-white/5 space-y-1">
            <div class="text-xs text-slate-400">실물 측정 규격 (W × D × H):</div>
            <div class="text-sm font-mono font-bold text-cyan-300" id="ai-res-size">63.5mm × 125.0mm × 40.0mm (60g)</div>
            <div class="text-[11px] text-slate-400 pt-1" id="ai-res-desc">초경량 인체공학 쉘, PRO X2 블랙 분할 그립 테이프, 100% PTFE 피트</div>
          </div>

          <button id="btn-apply-ai-3d" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
            <span>분석 결과로 3D 실물 즉시 구현하기</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 토스트 알림 -->
    <div id="toast" class="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#050813]/95 border border-blue-500/30 text-sm text-blue-300 shadow-xl backdrop-blur-md opacity-0 transition-opacity duration-300 pointer-events-none">
      알림
    </div>

    <!-- 도움말 가이드 모달 -->
    <div id="help-modal" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#060a14] max-w-md w-full p-6 rounded-2xl border border-white/10 relative space-y-3 text-xs shadow-2xl">
        <button id="btn-close-help" class="absolute top-4 right-4 text-slate-400 hover:text-white">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <i data-lucide="info" class="w-4 h-4 text-blue-400"></i>
          <span>화면 구성 및 조작 안내</span>
        </h3>
        <ul class="list-disc list-inside space-y-1.5 text-slate-300 leading-relaxed">
          <li><strong>화면 중심:</strong> 마우스 드래그로 360도 자유 회전 및 휠 줌을 통해 사물을 입체적으로 확인합니다.</li>
          <li><strong>중심 위:</strong> [사물 한 개만 보기] vs [다른 사물과 비교하기] 모드를 전환합니다.</li>
          <li><strong>중심 밑:</strong> [사진·동영상 업로드] 버튼으로 내 제품을 AI로 스캔해 3D로 만듭니다.</li>
          <li><strong>화면 오른쪽:</strong> [정밀 스펙 표] 탭을 누르면 사물의 크기와 수납 여부가 표로 정리되어 나타납니다.</li>
        </ul>
        <button id="btn-confirm-help" class="w-full py-2 rounded-xl bg-blue-700 hover:bg-blue-600 font-semibold text-white mt-2 transition shadow-md">
          확인했습니다
        </button>
      </div>
    </div>
  `;

  // Lucide 아이콘 렌더링
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
