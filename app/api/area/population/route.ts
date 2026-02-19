import { NextRequest, NextResponse } from 'next/server';

// 행정안전부_행정동별(통반단위) 주민등록 인구 및 세대현황
const API_URL = 'https://apis.data.go.kr/1741000/admmPpltnHhStus/selectAdmmPpltnHhStus';

// 기본값: 서울시
const DEFAULT_CODE = '1100000000';

interface PopulationItem {
  district: string;
  population: number;
  households: number;
  popPerHousehold: number;
  malePopulation: number;
  femalePopulation: number;
  maleFemlRate: string;
  statsMonth: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // 기본값: 최근 월 (현재 달 -1)
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const defaultYm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const ym = searchParams.get('ym') || defaultYm;
  const admmCd = searchParams.get('admmCd') || DEFAULT_CODE;

  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured', message: 'DATA_GO_KR_API_KEY 환경변수를 설정해주세요.' },
      { status: 500 }
    );
  }

  try {
    const url = new URL(API_URL);
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('admmCd', admmCd);
    url.searchParams.set('srchFrYm', ym);
    url.searchParams.set('srchToYm', ym);
    url.searchParams.set('lv', '2');        // 시군구 단위
    url.searchParams.set('regSeCd', '1');   // 총 등록인구
    url.searchParams.set('type', 'JSON');
    url.searchParams.set('numOfRows', '100');
    url.searchParams.set('pageNo', '1');

    const response = await fetch(url.toString());
    const text = await response.text();

    if (text === 'Forbidden' || response.status === 403) {
      return NextResponse.json(
        { error: 'API not activated', message: 'API 키가 아직 활성화되지 않았습니다. 공공데이터포털 승인 후 최대 1시간 소요될 수 있습니다.' },
        { status: 503 }
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'Invalid response', message: '응답 파싱 실패: ' + text.substring(0, 200) },
        { status: 500 }
      );
    }

    // 응답 구조: { Response: { head: {...}, items: { item: [...] } } }
    const header = data?.Response?.head || data?.header || data?.response?.header;
    if (header?.resultCode && header.resultCode !== '0' && header.resultCode !== '00') {
      return NextResponse.json(
        { error: 'API error', message: header.resultMsg || 'API 오류' },
        { status: 500 }
      );
    }

    const items = data?.Response?.items?.item || data?.body?.items?.item || data?.items || [];
    const itemList = Array.isArray(items) ? items : [items];

    const result: PopulationItem[] = itemList
      .filter((item: Record<string, string>) => item.sggNm && item.sggNm.trim())
      .map((item: Record<string, string>) => ({
        district: item.sggNm?.trim() || '',
        population: parseInt(item.totNmprCnt?.replace(/,/g, '') || '0', 10),
        households: parseInt(item.hhCnt?.replace(/,/g, '') || '0', 10),
        popPerHousehold: parseFloat(item.hhNmpr || '0'),
        malePopulation: parseInt(item.maleNmprCnt?.replace(/,/g, '') || '0', 10),
        femalePopulation: parseInt(item.femlNmprCnt?.replace(/,/g, '') || '0', 10),
        maleFemlRate: item.maleFemlRate || '',
        statsMonth: item.statsYm || ym,
      }))
      .sort((a: PopulationItem, b: PopulationItem) => a.district.localeCompare(b.district, 'ko'));

    return NextResponse.json({
      success: true,
      data: result,
      statsMonth: ym,
      totalPopulation: result.reduce((s: number, d: PopulationItem) => s + d.population, 0),
      totalHouseholds: result.reduce((s: number, d: PopulationItem) => s + d.households, 0),
    });
  } catch (error) {
    console.error('Population API Error:', error);
    return NextResponse.json(
      { error: 'API request failed', message: String(error) },
      { status: 500 }
    );
  }
}
