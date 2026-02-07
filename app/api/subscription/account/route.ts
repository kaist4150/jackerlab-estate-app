import { NextRequest, NextResponse } from 'next/server';

// 한국부동산원 청약홈 청약통장 통계 조회 서비스 (odcloud)
const API_BASE_URL = 'https://api.odcloud.kr/api/ApplyhomeBnkbStatSvc/v1';

interface AccountStats {
  date: string;
  region: string;
  depositType: string;
  totalAccounts: number;
  newAccounts: number;
  canceledAccounts: number;
  balance: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearMonth = searchParams.get('yearMonth') || '';
  const areaCode = searchParams.get('areaCode') || '';
  const depositItem = searchParams.get('depositItem') || '';
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
    // 청약통장 전체 가입현황 조회
    const url = new URL(`${API_BASE_URL}/getBnkbAcnutAllStat`);
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('page', page);
    url.searchParams.set('perPage', perPage);

    // 조건 파라미터 (YYYYMM 형식)
    if (yearMonth) {
      url.searchParams.set('cond[DELNG_OCCRRNC_YM::EQ]', yearMonth);
    }
    if (areaCode) {
      // 100:수도권, 400:대전/충청, 700:부산/영남, 900:광주/호남
      url.searchParams.set('cond[SUBSCRPT_AREA_CODE::EQ]', areaCode);
    }
    if (depositItem) {
      // 01~04 예금종목코드
      url.searchParams.set('cond[DPST_ITEM::EQ]', depositItem);
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

// 지역코드 매핑
const AREA_CODE_MAP: Record<string, string> = {
  '100': '수도권',
  '400': '대전/충청',
  '700': '부산/영남',
  '900': '광주/호남',
};

// 예금종목 매핑
const DEPOSIT_TYPE_MAP: Record<string, string> = {
  '01': '청약저축',
  '02': '청약예금',
  '03': '청약부금',
  '04': '주택청약종합저축',
};

function parseJsonToItems(data: any[]): AccountStats[] {
  return data.map((item) => ({
    date: item.DELNG_OCCRRNC_YM || '',
    region: AREA_CODE_MAP[item.SUBSCRPT_AREA_CODE] || item.SUBSCRPT_AREA_CODE || '전국',
    depositType: DEPOSIT_TYPE_MAP[item.DPST_ITEM] || item.DPST_ITEM || '',
    totalAccounts: parseInt(item.ACNUT_CNT) || 0,
    newAccounts: parseInt(item.SBSCRB_CNT) || 0,
    canceledAccounts: parseInt(item.CNCL_CNT) || 0,
    balance: parseInt(item.BLNC_AMT) || 0,
  })).sort((a, b) => b.date.localeCompare(a.date));
}
