import { NextRequest, NextResponse } from 'next/server';

// 한국부동산원 청약홈 청약접수 경쟁률 조회 서비스 (odcloud)
const API_BASE_URL = 'https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1';

interface CompetitionData {
  id: string;
  name: string;
  region: string;
  supplyType: string;
  supplyCount: number;
  applicantCount: number;
  competitionRate: number;
  announceDate: string;
  houseManageNo: string;
  pblancNo: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const houseManageNo = searchParams.get('houseManageNo') || '';
  const pblancNo = searchParams.get('pblancNo') || '';
  const resideSecd = searchParams.get('resideSecd') || '';
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
    // APT 분양정보/경쟁률 조회
    const url = new URL(`${API_BASE_URL}/getAPTLttotPblancCmpet`);
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('page', page);
    url.searchParams.set('perPage', perPage);

    // 조건 파라미터
    if (houseManageNo) {
      url.searchParams.set('cond[HOUSE_MANAGE_NO::EQ]', houseManageNo);
    }
    if (pblancNo) {
      url.searchParams.set('cond[PBLANC_NO::EQ]', pblancNo);
    }
    if (resideSecd) {
      url.searchParams.set('cond[RESIDE_SECD::EQ]', resideSecd);
    }

    const response = await fetch(url.toString());
    const json = await response.json();

    // odcloud 응답 구조: { currentCount, data, matchCount, page, perPage, totalCount }
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

function parseJsonToItems(data: any[]): CompetitionData[] {
  return data.map((item, index) => {
    const supplyCount = parseInt(item.TOT_SUPLY_HSHLDCO) || parseInt(item.SUPLY_HSHLDCO) || 1;
    const applicantCount = parseInt(item.RCEPT_CNT) || 0;

    return {
      id: `comp-${index}`,
      name: item.HOUSE_NM || item.BSNS_MBY_NM || '',
      region: item.SUBSCRPT_AREA_CODE_NM || item.SIDO_NM || '',
      supplyType: item.HOUSE_SECD_NM || '일반',
      supplyCount,
      applicantCount,
      competitionRate: applicantCount > 0 && supplyCount > 0
        ? Math.round((applicantCount / supplyCount) * 100) / 100
        : 0,
      announceDate: item.RCRIT_PBLANC_DE || '',
      houseManageNo: item.HOUSE_MANAGE_NO || '',
      pblancNo: item.PBLANC_NO || '',
    };
  }).sort((a, b) => b.competitionRate - a.competitionRate);
}
