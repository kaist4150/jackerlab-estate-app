import { NextRequest, NextResponse } from 'next/server';

// 한국부동산원 전국지가변동률조사 마이크로데이터 조회 서비스 (odcloud)
const API_BASE_URL = 'https://api.odcloud.kr/api/LfrMasterSvc/v1';

interface LandPriceData {
  id: string;
  yearMonth: string;
  regionCode: string;
  landCategory: string;
  landUse: string;
  sampleNo: string;
}

// 현재 연월 계산 (YYYYMM 형식)
function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // yearMonth 또는 year 파라미터 지원 (프론트엔드 호환)
  let yearMonth = searchParams.get('yearMonth');
  if (!yearMonth) {
    const year = searchParams.get('year');
    if (year) {
      // year만 있으면 현재 월 또는 12월 사용
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      yearMonth = `${year}${currentMonth}`;
    } else {
      yearMonth = getCurrentYearMonth();
    }
  }
  const regionCode = searchParams.get('regionCode') || searchParams.get('region') || '';
  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('perPage') || '100';

  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured', message: 'DATA_GO_KR_API_KEY 환경변수를 설정해주세요.' },
      { status: 500 }
    );
  }

  try {
    // 전국지가변동률 마이크로데이터 조회
    const url = new URL(`${API_BASE_URL}/getLfrMicro`);
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('page', page);
    url.searchParams.set('perPage', perPage);

    // 조건 파라미터
    if (yearMonth) {
      url.searchParams.set('cond[YM::EQ]', yearMonth);
    }
    if (regionCode) {
      url.searchParams.set('cond[REG::EQ]', regionCode);
    }

    const response = await fetch(url.toString());
    const json = await response.json();

    // odcloud 응답 구조
    const items = parseJsonToItems(json.data || []);

    return NextResponse.json({
      success: true,
      totalCount: json.totalCount || 0,
      currentCount: json.currentCount || items.length,
      page: parseInt(page),
      perPage: parseInt(perPage),
      yearMonth,
      regionCode: regionCode || '전체',
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

function parseJsonToItems(data: any[]): LandPriceData[] {
  return data.map((item, index) => ({
    id: `land-${index}`,
    yearMonth: item.YM || '',
    regionCode: item.REG || '',
    landCategory: item.LAND_CATE || '',
    landUse: item.LAND_USE || '',
    sampleNo: item.SMPL_NO || '',
  }));
}
