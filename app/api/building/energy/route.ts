import { NextRequest, NextResponse } from 'next/server';
import { extractXmlItems, getXmlValue } from '@/lib/xml-parser';

// 국토교통부 건물에너지 사용량 조회
const ELEC_URL = 'https://apis.data.go.kr/1613000/BldEngyHubService/getBeElctyUsgInfo';
const GAS_URL = 'https://apis.data.go.kr/1613000/BldEngyHubService/getBeGasUsgInfo';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sigunguCd = searchParams.get('sigunguCd') || '';
  const bjdongCd = searchParams.get('bjdongCd') || '';
  const bun = searchParams.get('bun') || '';
  const ji = searchParams.get('ji') || '';
  const year = searchParams.get('year') || new Date().getFullYear().toString();

  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured', message: 'DATA_GO_KR_API_KEY 환경변수를 설정해주세요.' },
      { status: 500 }
    );
  }

  if (!sigunguCd || !bjdongCd) {
    return NextResponse.json(
      { error: 'Missing parameters', message: '시군구코드와 법정동코드는 필수입니다.' },
      { status: 400 }
    );
  }

  try {
    // 선택한 연도의 1~12월 조회 (전기 + 가스)
    const months = Array.from({ length: 12 }, (_, i) =>
      `${year}${String(i + 1).padStart(2, '0')}`
    );

    const makeUrl = (baseUrl: string, useYm: string) => {
      const url = new URL(baseUrl);
      url.searchParams.set('serviceKey', apiKey);
      url.searchParams.set('sigunguCd', sigunguCd);
      url.searchParams.set('bjdongCd', bjdongCd);
      url.searchParams.set('bun', bun);
      url.searchParams.set('ji', ji);
      url.searchParams.set('useYm', useYm);
      url.searchParams.set('numOfRows', '1');
      url.searchParams.set('pageNo', '1');
      return url.toString();
    };

    // 12개월 전기/가스 동시 조회
    const requests = months.flatMap(ym => [
      fetch(makeUrl(ELEC_URL, ym)).then(r => r.text()).then(xml => ({ type: 'elec', ym, xml })),
      fetch(makeUrl(GAS_URL, ym)).then(r => r.text()).then(xml => ({ type: 'gas', ym, xml })),
    ]);

    const results = await Promise.all(requests);

    const dataMap = new Map<string, { elec: string; gas: string; addr: string }>();

    for (const { type, ym, xml } of results) {
      const items = extractXmlItems(xml);
      if (items.length === 0) continue;

      const usage = getXmlValue(items[0], 'useQty');
      const addr = getXmlValue(items[0], 'platPlc');

      if (!dataMap.has(ym)) {
        dataMap.set(ym, { elec: '0', gas: '0', addr: '' });
      }
      const entry = dataMap.get(ym)!;
      if (type === 'elec') {
        entry.elec = usage || '0';
        if (addr) entry.addr = addr;
      } else {
        entry.gas = usage || '0';
        if (addr) entry.addr = addr;
      }
    }

    const items = Array.from(dataMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ym, entry], index) => {
        const elec = parseFloat(entry.elec) || 0;
        const gas = parseFloat(entry.gas) || 0;
        return {
          id: `energy-${index}`,
          address: entry.addr,
          useYear: ym.substring(0, 4),
          useMonth: ym.substring(4, 6),
          elecUsage: entry.elec,
          gasUsage: entry.gas,
          heatUsage: '0',
          totalEnergy: (elec + gas).toFixed(2),
        };
      });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'API request failed', message: String(error) },
      { status: 500 }
    );
  }
}
