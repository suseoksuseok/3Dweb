/**
 * Virtual Fit Checker (실생활 수납 & 휴대 가상 판정기)
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 * 
 * 소비자가 사려는 물건이 백팩, 차량 컵홀더, 바지 주머니, 택배 박스에 쏙 들어가는지 자동 판정합니다.
 */

export const CONTAINERS = {
  cupholder: {
    id: 'cupholder',
    name: '차량 표준 컵홀더',
    icon: 'cup-soda',
    maxDia: 78,
    maxH: 260,
    type: 'cylinder',
    desc: '국내 대다수 차량의 표준 콘솔 컵홀더 규격 (지름 75~78mm)'
  },
  backpack_side: {
    id: 'backpack_side',
    name: '백팩 사이드 메쉬 포켓',
    icon: 'bag',
    maxDia: 88,
    maxH: 250,
    type: 'cylinder',
    desc: '일반 백팩 측면 탄성 텀블러/우산 주머니'
  },
  backpack_main: {
    id: 'backpack_main',
    name: '일반 데일리 백팩 수납칸',
    icon: 'backpack',
    maxW: 280,
    maxD: 140,
    maxH: 420,
    type: 'box',
    desc: '15인치 노트북 수납 가능한 20L 표준 데일리 백팩'
  },
  pocket: {
    id: 'pocket',
    name: '바지 / 코트 주머니',
    icon: 'pocket',
    maxW: 140,
    maxD: 28,
    maxH: 160,
    type: 'box',
    desc: '성인 청바지 뒷주머니 및 외투 포켓'
  },
  tote: {
    id: 'tote',
    name: '미니 토트백 / 에코백',
    icon: 'shopping-bag',
    maxW: 260,
    maxD: 100,
    maxH: 230,
    type: 'box',
    desc: '출퇴근/외출용 미니 토트백 내부 수납공간'
  },
  post_1: {
    id: 'post_1',
    name: '우체국 택배 1호 박스',
    icon: 'package',
    maxW: 220,
    maxD: 190,
    maxH: 90,
    type: 'box',
    desc: '중고거래 소형 소품용 택배 상자'
  },
  post_2: {
    id: 'post_2',
    name: '우체국 택배 2호 박스',
    icon: 'package',
    maxW: 270,
    maxD: 180,
    maxH: 150,
    type: 'box',
    desc: '중고거래 가장 많이 쓰는 표준 상자'
  },
  post_3: {
    id: 'post_3',
    name: '우체국 택배 3호 박스',
    icon: 'package',
    maxW: 340,
    maxD: 250,
    maxH: 210,
    type: 'box',
    desc: '신발, 가방, 전자기기용 중대형 상자'
  }
};

/**
 * 물체 치수(W, D, H in mm)를 전달받아 각 수납처별 판정 결과를 산출
 */
export function evaluateAllFits(wMm, dMm, hMm) {
  const results = [];
  const dims = [wMm, dMm, hMm].sort((a, b) => a - b);
  const minDim = dims[0]; // 두께
  const midDim = dims[1]; // 폭
  const maxDim = dims[2]; // 길이/높이

  // 1. 차량 컵홀더 판정
  const cupDia = Math.max(wMm, dMm);
  if (cupDia <= 75) {
    results.push({
      container: CONTAINERS.cupholder,
      status: 'fit',
      statusText: '여유 수납 가능',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      reason: `바닥 지름(${cupDia}mm)이 컵홀더(78mm)보다 넉넉하여 흔들림 없이 쏙 들어갑니다.`
    });
  } else if (cupDia <= 80) {
    results.push({
      container: CONTAINERS.cupholder,
      status: 'tight',
      statusText: '타이트하게 수납',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      reason: `지름(${cupDia}mm)이 컵홀더에 꽉 끼며 들어갈 수 있습니다.`
    });
  } else {
    results.push({
      container: CONTAINERS.cupholder,
      status: 'no',
      statusText: '수납 불가 (초과)',
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      reason: `폭(${cupDia}mm)이 차량 컵홀더(78mm)보다 커서 꽂을 수 없습니다.`
    });
  }

  // 2. 바지 주머니 판정
  if (midDim <= 130 && minDim <= 25 && maxDim <= 165) {
    results.push({
      container: CONTAINERS.pocket,
      status: 'fit',
      statusText: '주머니 쏙 수납',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      reason: '두께가 얇아 바지 뒷주머니나 외투 안주머니에 가볍게 들어갑니다.'
    });
  } else {
    results.push({
      container: CONTAINERS.pocket,
      status: 'no',
      statusText: '주머니 휴대 어려움',
      badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      reason: '주머니에 넣기엔 부피가 커서 가방 휴대를 권장합니다.'
    });
  }

  // 3. 백팩 메인 수납칸 판정
  const bp = CONTAINERS.backpack_main;
  if (midDim <= bp.maxW && minDim <= bp.maxD && maxDim <= bp.maxH) {
    results.push({
      container: bp,
      status: 'fit',
      statusText: '백팩 수납 여유',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      reason: '일반 백팩 메인 공간에 책, 노트북과 함께 충분히 들어갑니다.'
    });
  } else {
    results.push({
      container: bp,
      status: 'no',
      statusText: '백팩 수납 불가',
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      reason: '백팩 규격을 초과하여 별도 운반이 필요합니다.'
    });
  }

  // 4. 우체국 택배 박스 판정 (가장 작은 적합 상자 찾기)
  let bestBox = null;
  [CONTAINERS.post_1, CONTAINERS.post_2, CONTAINERS.post_3].forEach(box => {
    const boxDims = [box.maxW, box.maxD, box.maxH].sort((a, b) => a - b);
    if (!bestBox && minDim <= boxDims[0] && midDim <= boxDims[1] && maxDim <= boxDims[2]) {
      bestBox = box;
    }
  });

  if (bestBox) {
    results.push({
      container: bestBox,
      status: 'fit',
      statusText: `${bestBox.name} 추천`,
      badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      reason: `중고거래 발송 시 완충재와 함께 ${bestBox.name}에 안전하게 포장됩니다.`
    });
  } else {
    results.push({
      container: CONTAINERS.post_3,
      status: 'tight',
      statusText: '우체국 4호 이상 대형 상자 필요',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      reason: '부피가 큰 편이므로 4호(41x31x28cm) 이상의 대형 상자가 필요합니다.'
    });
  }

  return results;
}
