/**
 * AI Similar Products Recommendation Module
 * AI 기반 유사 제품 추천 및 3D 동시 비교 연동 모듈
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 */
import { createCustomDimensionObject } from './dimensionRealizer.js';

export const RECOMMENDATION_CATALOG = {
  tumbler: [
    {
      id: 'rec_stanley',
      name: '스탠리 진공 클래식 보온병 591ml',
      brand: 'Stanley',
      category: '주방/텀블러',
      price: '38,000원',
      badge: '대용량 와이드형',
      dims: { w: 84, d: 84, h: 195 },
      shape: 'cylinder',
      color: '#166534', // 시그니처 해머톤 그린
      materialKey: 'aluminum',
      diffHighlight: '높이가 3.3cm 더 낮고, 둘레가 1cm 넓어 안정적인 거치',
      reason: '현재 텀블러보다 키가 낮아 책상에서 넘어질 위험이 적고 용량은 더 큽니다.'
    },
    {
      id: 'rec_thermos',
      name: '써모스 초경량 원터치 보틀 350ml',
      brand: 'Thermos',
      category: '주방/텀블러',
      price: '29,000원',
      badge: '초슬림 휴대형',
      dims: { w: 65, d: 65, h: 170 },
      shape: 'cylinder',
      color: '#ec4899', // 파스텔 핑크
      materialKey: 'polymer',
      diffHighlight: '지름 6.5cm로 모든 가방과 작은 주머니에 쏙 들어감',
      reason: '현재 텀블러보다 부피가 40% 작아 미니백이나 가벼운 외출에 최적화된 대안입니다.'
    },
    {
      id: 'rec_kinto',
      name: '킨토 트래블 텀블러 500ml',
      brand: 'Kinto',
      category: '주방/텀블러',
      price: '42,000원',
      badge: '미니멀 감성 디자인',
      dims: { w: 70, d: 70, h: 170 },
      shape: 'cylinder',
      color: '#f8fafc', // 매트 화이트
      materialKey: 'polymer',
      diffHighlight: '지름 7cm 표준 규격, 차량 컵홀더 100% 여유 수납',
      reason: '동일한 500ml 용량이면서도 콤팩트한 캡 구조로 실물 높이가 5.5cm 더 낮습니다.'
    }
  ],

  minibag: [
    {
      id: 'rec_bag_wide',
      name: '클래식 사각 레더 숄더백 M',
      brand: 'Atelier',
      category: '패션/잡화',
      price: '59,000원',
      badge: '수납력 1.5배 확장',
      dims: { w: 250, d: 85, h: 170 },
      shape: 'rounded',
      color: '#1c1917',
      materialKey: 'polymer',
      diffHighlight: '가로 3.5cm 더 넓어 다이어리/아이패드 미니 수납 가능',
      reason: '현재 미니백보다 폭이 넓어 장지갑이나 소형 태블릿을 함께 넣을 수 있습니다.'
    },
    {
      id: 'rec_bag_slim',
      name: '초슬림 스마트폰 폰케이스 파우치',
      brand: 'UrbanPouch',
      category: '패션/잡화',
      price: '24,000원',
      badge: '초경량 폰 전용',
      dims: { w: 120, d: 30, h: 185 },
      shape: 'rounded',
      color: '#9a3412',
      materialKey: 'polymer',
      diffHighlight: '부피 70% 감소, 스마트폰+카드 2장만 초간편 수납',
      reason: '무거운 가방 대신 폰과 카드만 가볍게 넣고 다닐 수 있는 초미니 대안입니다.'
    }
  ],

  headphones: [
    {
      id: 'rec_hp_compact',
      name: '콤팩트 접이식 블루투스 온이어 헤드폰',
      brand: 'SoundPro',
      category: '전자기기/음향',
      price: '89,000원',
      badge: '요다현상 ZERO 핏',
      dims: { w: 155, d: 65, h: 170 },
      shape: 'rounded',
      color: '#334155',
      materialKey: 'polymer',
      diffHighlight: '가로 폭이 2.5cm 좁아 머리에 썼을 때 옆으로 튀어나오지 않음',
      reason: '오버이어 헤드폰의 큰 부피가 부담스러운 분을 위한 슬림 온이어 모델입니다.'
    }
  ],

  general: [
    {
      id: 'rec_gen_box',
      name: '모듈러 수납 오거나이저 박스',
      brand: 'HomeDeco',
      category: '생활/수납',
      price: '15,900원',
      badge: '정리 수납형',
      dims: { w: 200, d: 150, h: 80 },
      shape: 'box',
      color: '#f1f5f9',
      materialKey: 'polymer',
      diffHighlight: '데스크/서랍 규격에 딱 맞는 20x15cm 표준 핏',
      reason: '책상 위나 서랍 속에 소품을 깔끔하게 정돈할 수 있는 표준 수납함입니다.'
    }
  ]
};

/**
 * 사물 데이터 기반 맞춤형 유사 상품 목록 추천
 */
export function getRecommendedProducts(currentProduct) {
  const cat = currentProduct?.category || '';
  const title = (currentProduct?.title || currentProduct?.name || '').toLowerCase();

  if (cat.includes('텀블러') || title.includes('텀블러') || title.includes('bottle')) {
    return RECOMMENDATION_CATALOG.tumbler;
  } else if (cat.includes('패션') || title.includes('가방') || title.includes('백')) {
    return RECOMMENDATION_CATALOG.minibag;
  } else if (cat.includes('음향') || title.includes('헤드폰') || title.includes('스피커')) {
    return RECOMMENDATION_CATALOG.headphones;
  }

  // 기본 매칭
  return [
    RECOMMENDATION_CATALOG.tumbler[0],
    RECOMMENDATION_CATALOG.minibag[0],
    RECOMMENDATION_CATALOG.headphones[0]
  ];
}

/**
 * 추천 상품 데이터로부터 3D 메쉬 생성
 */
export function createRecommendedMesh(recItem) {
  return createCustomDimensionObject({
    widthMm: recItem.dims.w,
    depthMm: recItem.dims.d,
    heightMm: recItem.dims.h,
    shape: recItem.shape,
    color: recItem.color,
    materialKey: recItem.materialKey,
    name: recItem.name
  });
}
