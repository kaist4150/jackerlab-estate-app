import { NextRequest, NextResponse } from 'next/server';

// 한국부동산원 청약홈 분양정보 조회 서비스 (odcloud)
const API_BASE_URL = 'https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1';

interface SubscriptionSchedule {
  id: string;
  name: string;
  region: string;
  houseType: string;
  totalSupply: number;
  announcementDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  winnerAnnouncementDate: string;
  contractStartDate: string;
  contractEndDate: string;
  houseManageNo: string;
  pblancNo: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const houseName = searchParams.get('houseName') || '';
  const areaCode = searchParams.get('areaCode') || '';
  const announceDateStart = searchParams.get('announceDateStart') || '';
  const announceDateEnd = searchParams.get('announceDateEnd') || '';
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
    // APT 분양정보 상세조회
    const url = new URL(`${API_BASE_URL}/getAPTLttotPblancDetail`);
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('page', page);
    url.searchParams.set('perPage', perPage);

    // 조건 파라미터
    if (houseName) {
      url.searchParams.set('cond[HOUSE_NM::LIKE]', houseName);
    }
    if (areaCode) {
      url.searchParams.set('cond[SUBSCRPT_AREA_CODE::EQ]', areaCode);
    }
    if (announceDateStart) {
      url.searchParams.set('cond[RCRIT_PBLANC_DE::GTE]', announceDateStart);
    }
    if (announceDateEnd) {
      url.searchParams.set('cond[RCRIT_PBLANC_DE::LTE]', announceDateEnd);
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

function parseJsonToItems(data: any[]): SubscriptionSchedule[] {
  return data.map((item, index) => ({
    id: `schedule-${index}`,
    name: item.HOUSE_NM || '',
    region: item.SUBSCRPT_AREA_CODE_NM || item.HSSPLY_ADRES || '',
    houseType: item.HOUSE_SECD_NM || item.HOUSE_DTL_SECD_NM || '',
    totalSupply: parseInt(item.TOT_SUPLY_HSHLDCO) || 0,
    announcementDate: item.RCRIT_PBLANC_DE || '',
    subscriptionStartDate: item.RCEPT_BGNDE || '',
    subscriptionEndDate: item.RCEPT_ENDDE || '',
    winnerAnnouncementDate: item.PRZWNER_PRESNATN_DE || '',
    contractStartDate: item.CNTRCT_CNCLS_BGNDE || '',
    contractEndDate: item.CNTRCT_CNCLS_ENDDE || '',
    houseManageNo: item.HOUSE_MANAGE_NO || '',
    pblancNo: item.PBLANC_NO || '',
  })).sort((a, b) => {
    // 최근 공고일 순 정렬
    return b.announcementDate.localeCompare(a.announcementDate);
  });
}
