/**
 * ============================================================
 * 🤖 AI 챗봇 모듈 (ChatGPT API 연동)
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 * ============================================================
 * 
 * [API 키 설정 안내]
 * 아래 OPENAI_API_KEY 변수에 본인의 OpenAI API 키를 입력해 주세요.
 * 웹 화면 우측 상단의 ⚙️ 설정 아이콘을 눌러 직접 입력할 수도 있습니다.
 */

// ============================================================
// 🔑 OpenAI ChatGPT API 설정 (API 키 및 모델명)
// ============================================================
export const OPENAI_API_KEY = ""; // 여기에 OpenAI API 키 입력 (예: "sk-proj-...")
export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini"; // OpenAI 정식 유효 모델 ID (추천)
export let OPENAI_MODEL = "gpt-4o-mini"; // 활성 모델 ID

/**
 * 모델명 친화적 레이블 변환 (UI 뱃지 표시용)
 */
export function formatModelDisplayName(modelId) {
  if (!modelId) return 'GPT-4o Mini';
  const m = modelId.toLowerCase();
  if (m === 'gpt-4o-mini') return 'GPT-4o Mini';
  if (m === 'gpt-4o') return 'GPT-4o';
  if (m === 'o3-mini') return 'o3-mini';
  if (m === 'o1-mini') return 'o1-mini';
  if (m === 'gpt-4-turbo') return 'GPT-4 Turbo';
  if (m === 'gpt-3.5-turbo') return 'GPT-3.5 Turbo';
  return modelId;
}

/**
 * 유효한 모델 ID 조회 (UI 선택값 -> localStorage -> 기본값 순)
 */
export function getActiveModel() {
  const selectEl = document.getElementById('chat-model-select');
  const customEl = document.getElementById('chat-model-custom-input');
  if (selectEl) {
    if (selectEl.value === 'custom') {
      if (customEl && customEl.value.trim().length > 0) {
        return customEl.value.trim();
      }
    } else if (selectEl.value) {
      return selectEl.value;
    }
  }
  let savedModel = localStorage.getItem('realize3d_openai_model');
  if (savedModel && (savedModel.includes('5') || savedModel === 'GPT-5 Mini')) {
    savedModel = DEFAULT_OPENAI_MODEL;
    localStorage.setItem('realize3d_openai_model', DEFAULT_OPENAI_MODEL);
  }
  if (savedModel && savedModel.trim().length > 0) {
    return savedModel.trim();
  }
  if (OPENAI_MODEL && OPENAI_MODEL.trim().length > 0 && !OPENAI_MODEL.includes('5')) {
    return OPENAI_MODEL.trim();
  }
  return DEFAULT_OPENAI_MODEL;
}

/**
 * 활성 모델 저장 및 UI 뱃지 업데이트
 */
export function updateActiveModel(modelId, persist = true) {
  const trimmed = (modelId || '').trim() || DEFAULT_OPENAI_MODEL;
  OPENAI_MODEL = trimmed;
  if (persist) {
    localStorage.setItem('realize3d_openai_model', trimmed);
  }
  const badgeEl = document.getElementById('chat-model-badge');
  if (badgeEl) {
    badgeEl.innerText = formatModelDisplayName(trimmed);
  }
  const welcomeBadge = document.getElementById('welcome-model-badge');
  if (welcomeBadge) {
    welcomeBadge.innerText = formatModelDisplayName(trimmed);
  }
}

// 시스템 프롬프트 (3D 시뮬레이터 및 실물 크기 체감 쇼핑 특화)
const SYSTEM_PROMPT = `당신은 3D 사물 구현화 및 온라인 쇼핑/중고거래 실물 크기 체감 플랫폼 'Realize3D Studio'의 AI 전담 어시스턴트입니다.
사용자는 온라인 쇼핑이나 중고거래(당근마켓, 번개장터 등)에서 제품의 실물 크기, 치수(W, D, H mm), 모양, 착용감/수납 여부를 궁금해하는 사람들입니다.
항상 친절하고 전문적인 어조로 답변하며, 필요시 마우스(로지텍 G PRO X, 버티컬 마우스), 텀블러, 헤드폰, 미니백 등 3D 시뮬레이터에서 지원하는 사물들의 크기와 3D 뷰포트 활용 팁을 안내해 주세요.
한국어로 알기 쉽게 핵심 위주로 명확하게 답변하세요.`;

// 대화 기록 (최근 맥락 유지)
let chatConversation = [];

/**
 * 유효한 API 키 조회 (상단 상수 -> 전역 변수 -> 로컬스토리지 순)
 */
export function getActiveApiKey() {
  const inputEl = document.getElementById('chat-api-key-input');
  if (inputEl && inputEl.value && inputEl.value.trim().length > 0) {
    return inputEl.value.trim();
  }
  if (OPENAI_API_KEY && OPENAI_API_KEY.trim().length > 0 && !OPENAI_API_KEY.includes('YOUR_')) {
    return OPENAI_API_KEY.trim();
  }
  if (window.OPENAI_API_KEY && window.OPENAI_API_KEY.trim().length > 0) {
    return window.OPENAI_API_KEY.trim();
  }
  const savedKey = localStorage.getItem('realize3d_openai_key');
  if (savedKey && savedKey.trim().length > 0) {
    return savedKey.trim();
  }
  return '';
}

/**
 * API 키 로컬 저장
 */
export function saveApiKey(newKey) {
  const trimmed = (newKey || '').trim();
  window.OPENAI_API_KEY = trimmed;
  if (trimmed) {
    localStorage.setItem('realize3d_openai_key', trimmed);
  } else {
    localStorage.removeItem('realize3d_openai_key');
  }
}

/**
 * 텍스트 내 마크다운 간단 변환 (볼드, 인라인코드, 줄바꿈 등)
 */
function formatMessageContent(rawText) {
  if (!rawText) return '';
  let escaped = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 코드 블록
  escaped = escaped.replace(/```([\s\S]*?)```/g, '<pre class="bg-black/40 p-2 rounded my-1 text-xs font-mono overflow-x-auto text-cyan-200"><code>$1</code></pre>');
  // 인라인 코드
  escaped = escaped.replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-xs text-cyan-300 font-mono">$1</code>');
  // 볼드체 **text**
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  // 불릿 포인트
  escaped = escaped.replace(/^\s*[-*]\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>');
  // 줄바꿈
  escaped = escaped.replace(/\n/g, '<br>');

  return escaped;
}

/**
 * 현재 시각 문자열 (오전/오후 H:MM)
 */
function getCurrentTimeFormatted() {
  const d = new Date();
  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? '오후' : '오전';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${ampm} ${hours}:${mins}`;
}

/**
 * 챗봇 창 스크롤 최하단 이동
 */
function scrollToBottom() {
  const msgContainer = document.getElementById('chat-messages-container');
  if (msgContainer) {
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
}

/**
 * 사용자 메시지 말풍선 추가
 */
export function appendUserBubble(text) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const timeStr = getCurrentTimeFormatted();
  const bubbleHtml = `
    <div class="chat-message-row user flex justify-end items-end gap-1.5 mb-3 group animate-slide-up">
      <span class="text-[10px] text-slate-500 pb-0.5 shrink-0 select-none">${timeStr}</span>
      <div class="max-w-[78%] bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-none shadow-md shadow-blue-500/10 leading-relaxed break-words">
        ${formatMessageContent(text)}
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', bubbleHtml);
  scrollToBottom();
}

/**
 * 어시스턴트(봇) 메시지 말풍선 추가
 */
export function appendBotBubble(text, isError = false) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const timeStr = getCurrentTimeFormatted();
  const bgClass = isError 
    ? 'bg-rose-950/40 border-rose-500/30 text-rose-200' 
    : 'bg-[#0b1329] border-white/10 text-slate-200';
  const iconColor = isError ? 'text-rose-400' : 'text-cyan-400';

  const bubbleHtml = `
    <div class="chat-message-row bot flex items-start gap-2 mb-3 group animate-slide-up">
      <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-900 to-[#121c38] border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
        <i data-lucide="bot" class="w-3.5 h-3.5 ${iconColor}"></i>
      </div>
      <div class="flex flex-col max-w-[80%]">
        <div class="text-[10px] font-semibold text-slate-400 mb-0.5 flex items-center gap-1.5">
          <span>AI 어시스턴트</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-mono">${OPENAI_MODEL}</span>
        </div>
        <div class="border ${bgClass} text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-md leading-relaxed break-words">
          ${formatMessageContent(text)}
        </div>
        <span class="text-[9px] text-slate-500 pt-1 pl-1 select-none">${timeStr}</span>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', bubbleHtml);
  if (window.lucide) window.lucide.createIcons();
  scrollToBottom();
}

/**
 * 응답 대기 중 타이핑 인디케이터 표시
 */
export function showTypingIndicator() {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  hideTypingIndicator(); // 기존 중복 제거

  const indicatorHtml = `
    <div id="chat-typing-indicator" class="chat-message-row bot flex items-start gap-2 mb-3 animate-pulse">
      <div class="w-7 h-7 rounded-full bg-[#0b1329] border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
        <i data-lucide="bot" class="w-3.5 h-3.5 text-cyan-400"></i>
      </div>
      <div class="bg-[#0b1329] border border-white/10 px-3.5 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
        <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
        <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
        <span class="text-[11px] text-slate-400 ml-1 font-sans">답변 생성 중...</span>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', indicatorHtml);
  if (window.lucide) window.lucide.createIcons();
  scrollToBottom();
}

/**
 * 타이핑 인디케이터 제거
 */
export function hideTypingIndicator() {
  const indicator = document.getElementById('chat-typing-indicator');
  if (indicator) indicator.remove();
}

/**
 * OpenAI ChatGPT API 호출 (선택된 모델: gpt-4o-mini 등)
 */
export async function callChatGPT(promptText) {
  const apiKey = getActiveApiKey();
  const activeModel = getActiveModel();

  // API 키 미설정 시 안내
  if (!apiKey) {
    const keyInput = document.getElementById('chat-api-key-input');
    if (keyInput) {
      keyInput.focus();
      keyInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-500/30');
      setTimeout(() => keyInput.classList.remove('border-rose-500', 'ring-2', 'ring-rose-500/30'), 2500);
    }
    appendBotBubble(`⚠️ **OpenAI API 키를 입력해 주세요.**\n\n채팅창 상단의 **'OpenAI API 키 직접 입력'** 칸에 키(예: \`sk-proj-...\`)를 넣으신 후 다시 질문해 주세요.`, true);
    return;
  }

  // 대화 기록에 사용자 메시지 추가
  chatConversation.push({ role: 'user', content: promptText });
  if (chatConversation.length > 10) {
    chatConversation = chatConversation.slice(-10); // 최근 10개 유지
  }

  showTypingIndicator();

  try {
    const isReasoningModel = activeModel.startsWith('o1') || activeModel.startsWith('o3');
    const payload = {
      model: activeModel,
      messages: [
        { role: isReasoningModel ? 'developer' : 'system', content: SYSTEM_PROMPT },
        ...chatConversation
      ]
    };
    if (!isReasoningModel) {
      payload.temperature = 0.7;
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    hideTypingIndicator();

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      let errMsg = `API 호출 오류 (${res.status})`;

      const errMessage = (errData?.error?.message || '').toLowerCase();
      const errCode = (errData?.error?.code || '').toLowerCase();

      if (res.status === 401) {
        errMsg = `인증 실패 (401): API 키가 올바르지 않습니다. 키를 다시 확인해 주세요.`;
      } else if (res.status === 404 || (res.status === 400 && (errMessage.includes('model') || errCode.includes('model')))) {
        errMsg = `잘못된 모델 ID (${res.status}): 요청하신 모델 [${activeModel}]은 OpenAI API에서 지원하지 않거나 유효하지 않습니다.\n\n` +
          `💡 **해결 방법**: OpenAI 정식 모델인 **\`gpt-4o-mini\`**(추천) 또는 \`gpt-4o\`를 선택해 주세요. 채팅창 상단의 '모델 선택' 드롭다운에서 바로 변경하실 수 있습니다.`;
      } else if (errData && errData.error && errData.error.message) {
        errMsg = `${errMsg}: ${errData.error.message}`;
      }

      appendBotBubble(`❌ **ChatGPT API 호출에 실패했습니다.**\n\n${errMsg}`, true);
      return;
    }

    const data = await res.json();
    const botReply = data.choices && data.choices[0] && data.choices[0].message 
      ? data.choices[0].message.content 
      : '응답을 파싱할 수 없습니다.';

    // 대화 기록에 봇 응답 추가
    chatConversation.push({ role: 'assistant', content: botReply });

    // 말풍선 출력
    appendBotBubble(botReply);

  } catch (err) {
    hideTypingIndicator();
    console.error('ChatGPT API Error:', err);
    appendBotBubble(`❌ **네트워크 오류 또는 요청 차단이 발생했습니다.**\n\n세부 내용: ${err.message || err}`, true);
  }
}

/**
 * 챗봇 UI 이벤트 리스너 및 초기화
 */
export function initChatbot() {
  const toggleBtn = document.getElementById('btn-toggle-chatbot');
  const chatWindow = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('btn-close-chatbot');
  const sendBtn = document.getElementById('btn-chat-send');
  const inputEl = document.getElementById('chat-input');
  const saveKeyBtn = document.getElementById('btn-save-chat-key');
  const keyInputEl = document.getElementById('chat-api-key-input');
  const toggleKeyVisibilityBtn = document.getElementById('btn-toggle-key-visibility');
  const statusTag = document.getElementById('chat-api-status-tag');
  const rememberCheckbox = document.getElementById('chat-remember-key');
  const badgeDot = document.getElementById('chat-badge-dot');
  const modelSelectEl = document.getElementById('chat-model-select');
  const customModelInputEl = document.getElementById('chat-model-custom-input');

  if (!toggleBtn || !chatWindow) return;

  // 상태 뱃지 업데이트 함수
  const updateStatusBadge = (key) => {
    const k = (key || '').trim();
    if (!statusTag) return;
    if (k.length > 5) {
      statusTag.innerText = '✅ 키 적용됨';
      statusTag.className = 'text-[9px] px-2 py-0.5 rounded-full font-mono transition-all bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    } else {
      statusTag.innerText = '⚠️ 키 미입력';
      statusTag.className = 'text-[9px] px-2 py-0.5 rounded-full font-mono transition-all bg-amber-500/15 text-amber-300 border border-amber-500/30';
    }
  };

  // 초기 키 불러오기 & 뱃지 갱신
  const initialKey = getActiveApiKey();
  if (keyInputEl && initialKey) {
    keyInputEl.value = initialKey;
  }
  updateStatusBadge(initialKey);

  // 초기 모델 설정 및 UI 동기화
  const initialModel = getActiveModel();
  if (modelSelectEl) {
    const standardModels = ['gpt-4o-mini', 'gpt-4o', 'o3-mini', 'o1-mini'];
    if (standardModels.includes(initialModel)) {
      modelSelectEl.value = initialModel;
      if (customModelInputEl) customModelInputEl.classList.add('hidden');
    } else {
      modelSelectEl.value = 'custom';
      if (customModelInputEl) {
        customModelInputEl.classList.remove('hidden');
        customModelInputEl.value = initialModel;
      }
    }
    updateActiveModel(initialModel, false);

    modelSelectEl.addEventListener('change', () => {
      if (modelSelectEl.value === 'custom') {
        if (customModelInputEl) {
          customModelInputEl.classList.remove('hidden');
          customModelInputEl.focus();
          const curVal = customModelInputEl.value.trim() || DEFAULT_OPENAI_MODEL;
          updateActiveModel(curVal, true);
        }
      } else {
        if (customModelInputEl) customModelInputEl.classList.add('hidden');
        updateActiveModel(modelSelectEl.value, true);
      }
    });
  }

  if (customModelInputEl) {
    customModelInputEl.addEventListener('input', () => {
      const val = customModelInputEl.value.trim();
      if (val) {
        updateActiveModel(val, true);
      }
    });
  }

  // 실시간 입력 감지 (타이핑하는 즉시 대화에 반영)
  if (keyInputEl) {
    keyInputEl.addEventListener('input', () => {
      const currentVal = keyInputEl.value.trim();
      window.OPENAI_API_KEY = currentVal;
      updateStatusBadge(currentVal);
      if (rememberCheckbox && rememberCheckbox.checked) {
        saveApiKey(currentVal);
      }
    });

    // 엔터키 입력 시 적용
    keyInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (saveKeyBtn) saveKeyBtn.click();
      }
    });
  }

  // [적용] 버튼 클릭 시 동작
  if (saveKeyBtn && keyInputEl) {
    saveKeyBtn.addEventListener('click', () => {
      const val = keyInputEl.value.trim();
      window.OPENAI_API_KEY = val;
      if (rememberCheckbox && rememberCheckbox.checked) {
        saveApiKey(val);
      } else {
        localStorage.removeItem('realize3d_openai_key');
      }
      updateStatusBadge(val);

      if (val) {
        saveKeyBtn.innerHTML = '<i data-lucide="check-check" class="w-3.5 h-3.5"></i> <span>완료!</span>';
        if (window.lucide) lucide.createIcons();
        setTimeout(() => {
          saveKeyBtn.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5"></i> <span>적용</span>';
          if (window.lucide) lucide.createIcons();
        }, 1500);
        appendBotBubble(`✅ **설정이 성공적으로 적용되었습니다!**\n- 적용 모델: \`${formatModelDisplayName(getActiveModel())}\`\n이제 질문을 남겨주시면 AI가 즉시 답변해 드립니다.`);
        if (inputEl) inputEl.focus();
      } else {
        appendBotBubble('ℹ️ API 키 입력칸이 비어 있습니다. 사용하실 OpenAI 키를 입력해 주세요.', true);
      }
    });
  }

  // 비밀번호 보기 / 숨기기 눈 모양 토글 버튼
  if (toggleKeyVisibilityBtn && keyInputEl) {
    toggleKeyVisibilityBtn.addEventListener('click', () => {
      const isPass = keyInputEl.type === 'password';
      keyInputEl.type = isPass ? 'text' : 'password';
      toggleKeyVisibilityBtn.innerHTML = isPass 
        ? '<i data-lucide="eye-off" class="w-3.5 h-3.5 text-cyan-400"></i>' 
        : '<i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400"></i>';
      if (window.lucide) lucide.createIcons();
    });
  }

  // 1. 챗봇 열기 / 닫기 토글
  const toggleChat = (forceOpen) => {
    const isCurrentlyOpen = !chatWindow.classList.contains('hidden');
    const shouldOpen = forceOpen !== undefined ? forceOpen : !isCurrentlyOpen;

    if (shouldOpen) {
      chatWindow.classList.remove('hidden');
      toggleBtn.classList.add('active');
      if (badgeDot) badgeDot.classList.add('hidden'); // 미확인 알림 해제
      scrollToBottom();
      // 만약 키가 아직 비어있다면 바로 키 입력창으로 포커스 안내
      if (keyInputEl && !keyInputEl.value) {
        keyInputEl.focus();
      } else if (inputEl) {
        inputEl.focus();
      }
    } else {
      chatWindow.classList.add('hidden');
      toggleBtn.classList.remove('active');
    }
  };

  toggleBtn.addEventListener('click', () => toggleChat());
  if (closeBtn) closeBtn.addEventListener('click', () => toggleChat(false));

  // 2. 메시지 전송 처리
  const handleSend = () => {
    if (!inputEl) return;
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    appendUserBubble(text);
    callChatGPT(text);
  };

  if (sendBtn) sendBtn.addEventListener('click', handleSend);

  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  // 3. 빠른 질문 칩 클릭
  document.querySelectorAll('.chat-quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt || chip.innerText.trim();
      appendUserBubble(prompt);
      callChatGPT(prompt);
    });
  });
}
