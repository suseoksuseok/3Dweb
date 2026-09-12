/**
 * Smart Dimension Text Parser (쇼핑몰/판매글 치수 자동 추출기)
 * 3D시뮬레이션을 이용한 사물 구현화 - Realize3D Studio
 * 
 * 쿠팡, 네이버 스마트스토어, 당근마켓, 번개장터 상세페이지의 다양한 치수 문구를 자동 파싱합니다.
 * 예시:
 * - "22 x 15 x 8 cm"
 * - "220 * 150 * 80 mm"
 * - "가로 25cm, 세로 15cm, 높이 10cm"
 * - "폭 180mm x 깊이 120mm x 높이 65mm"
 * - "W 210 x D 140 x H 80"
 * - "지름 75mm x 높이 220mm"
 */

export function parseDimensionText(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  const text = rawText.trim().toLowerCase();

  // 기본 반환 객체 (mm 단위)
  let widthMm = 150;
  let depthMm = 100;
  let heightMm = 80;
  let shape = 'rounded';
  let unit = 'mm';

  // 1. 원통형(지름 x 높이) 패턴 검사: "지름 75mm 높이 220mm", "dia 7.5cm h 22cm"
  const cylPattern = /(?:지름|직경|dia|diameter|d)\s*[:=]?\s*([0-9.]+)\s*(cm|mm)?\D+(?:높이|h|height)\s*[:=]?\s*([0-9.]+)\s*(cm|mm)?/i;
  const cylMatch = text.match(cylPattern);
  if (cylMatch) {
    const diaVal = parseFloat(cylMatch[1]);
    const diaUnit = cylMatch[2] || (diaVal < 50 ? 'cm' : 'mm');
    const hVal = parseFloat(cylMatch[3]);
    const hUnit = cylMatch[4] || (hVal < 50 ? 'cm' : 'mm');

    const diaMm = diaUnit === 'cm' ? diaVal * 10 : diaVal;
    const finalHMm = hUnit === 'cm' ? hVal * 10 : hVal;

    return {
      widthMm: Math.round(diaMm),
      depthMm: Math.round(diaMm),
      heightMm: Math.round(finalHMm),
      shape: 'cylinder',
      detectedText: `지름 ${diaMm}mm x 높이 ${finalHMm}mm`,
      confidence: 'high'
    };
  }

  // 2. 명시적 키워드 패턴: "가로 25cm 세로 15cm 높이 10cm" or "w 250 d 150 h 100"
  const wMatch = text.match(/(?:가로|폭|width|w)\s*[:=]?\s*([0-9.]+)\s*(cm|mm)?/i);
  const dMatch = text.match(/(?:세로|깊이|depth|d|l|length|길이)\s*[:=]?\s*([0-9.]+)\s*(cm|mm)?/i);
  const hMatch = text.match(/(?:높이|height|h)\s*[:=]?\s*([0-9.]+)\s*(cm|mm)?/i);

  if (wMatch && (dMatch || hMatch)) {
    const parseVal = (m, fallback = 100) => {
      if (!m) return fallback;
      const v = parseFloat(m[1]);
      const u = m[2] || (v < 50 ? 'cm' : 'mm');
      return u === 'cm' ? v * 10 : v;
    };

    widthMm = parseVal(wMatch);
    depthMm = parseVal(dMatch, widthMm * 0.8);
    heightMm = parseVal(hMatch, widthMm * 0.5);

    return {
      widthMm: Math.round(widthMm),
      depthMm: Math.round(depthMm),
      heightMm: Math.round(heightMm),
      shape: 'rounded',
      detectedText: `${Math.round(widthMm)}mm x ${Math.round(depthMm)}mm x ${Math.round(heightMm)}mm`,
      confidence: 'high'
    };
  }

  // 3. 곱하기 기호 패턴: "220 x 140 x 85 mm", "22*15*8 cm", "250 X 150 X 90"
  const multPattern = /([0-9.]+)\s*(?:x|\*|×)\s*([0-9.]+)(?:\s*(?:x|\*|×)\s*([0-9.]+))?\s*(cm|mm)?/i;
  const multMatch = text.match(multPattern);

  if (multMatch) {
    const v1 = parseFloat(multMatch[1]);
    const v2 = parseFloat(multMatch[2]);
    const v3 = multMatch[3] ? parseFloat(multMatch[3]) : null;
    const explicitUnit = multMatch[4];

    // 단위 추론: 명시되어 있거나, 숫자가 50 미만이면 cm로 간주
    const isCm = explicitUnit === 'cm' || (!explicitUnit && Math.max(v1, v2, v3 || 0) < 60);

    const toMm = (val) => Math.round(isCm ? val * 10 : val);

    widthMm = toMm(v1);
    depthMm = toMm(v2);
    heightMm = v3 ? toMm(v3) : Math.round(widthMm * 0.5);

    return {
      widthMm,
      depthMm,
      heightMm,
      shape: 'rounded',
      detectedText: `${widthMm}mm x ${depthMm}mm x ${heightMm}mm (${isCm ? 'cm 단위 환산' : 'mm 단위'})`,
      confidence: 'medium'
    };
  }

  // 4. 일반 숫자 3개 연속 발견 시 ("210 140 80")
  const nums = text.match(/[0-9.]+/g);
  if (nums && nums.length >= 2) {
    const n1 = parseFloat(nums[0]);
    const n2 = parseFloat(nums[1]);
    const n3 = nums.length >= 3 ? parseFloat(nums[2]) : Math.round(n1 * 0.5);

    const isCm = text.includes('cm') || Math.max(n1, n2, n3) < 50;
    const toMm = (val) => Math.round(isCm ? val * 10 : val);

    return {
      widthMm: toMm(n1),
      depthMm: toMm(n2),
      heightMm: toMm(n3),
      shape: 'rounded',
      detectedText: `${toMm(n1)}mm x ${toMm(n2)}mm x ${toMm(n3)}mm`,
      confidence: 'low'
    };
  }

  return null;
}
