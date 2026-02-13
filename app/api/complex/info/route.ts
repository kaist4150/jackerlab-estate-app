import { NextRequest, NextResponse } from 'next/server';

// 한국부동산원 공동주택 단지 식별정보 조회 서비스 (odcloud)
const API_BASE_URL = 'https://api.odcloud.kr/api/AptIdInfoSvc/v1';

interface ComplexInfo {
  id: string;
  complexPk: string;
  name: string;
  address: string;
  sido: string;
  sigungu: string;
  totalUnits: number;
  totalBuildings: number;
  approvalDate: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const complexPk = searchParams.get('complexPk') || '';
  const address = searchParams.get('address') || '';
  const sido = searchParams.get('sido') || '';
  const sigungu = searchParams.get('sigungu') || '';
  const name = searchParams.get('name') || '';
  const approvalDateStart = searchParams.get('approvalDateStart') || '';
  const approvalDateEnd = searchParams.get('approvalDateEnd') || '';
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
    // 공동주택 단지 기본정보 조회
    const url = new URL(`${API_BASE_URL}/getAptInfo`);
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('page', page);
    url.searchParams.set('perPage', perPage);

    // 조건 파라미터
    if (complexPk) {
      url.searchParams.set('cond[COMPLEX_PK::EQ]', complexPk);
    }
    if (address) {
      url.searchParams.set('cond[ADRES::LIKE]', address);
    } else if (sido) {
      // sido/sigungu로 주소 검색 조합
      const addrSearch = sigungu ? `${sido} ${sigungu}` : sido;
      url.searchParams.set('cond[ADRES::LIKE]', addrSearch);
    }
    if (name) {
      url.searchParams.set('cond[COMPLEX_NM::LIKE]', name);
    }
    if (approvalDateStart) {
      url.searchParams.set('cond[USEAPR_DT::GTE]', approvalDateStart);
    }
    if (approvalDateEnd) {
      url.searchParams.set('cond[USEAPR_DT::LTE]', approvalDateEnd);
    }

    const response = await fetch(url.toString());
    const json = await response.json();

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

function parseJsonToItems(data: any[]): ComplexInfo[] {
  return data.map((item, index) => {
    const addr = item.ADRES || '';
    const parts = addr.split(' ');
    return {
      id: `complex-${index}`,
      complexPk: item.COMPLEX_PK || '',
      name: item.COMPLEX_NM1 || item.COMPLEX_NM2 || item.COMPLEX_NM || '',
      address: addr,
      sido: parts[0] || '',
      sigungu: parts[1] || '',
      totalUnits: parseInt(item.UNIT_CNT) || parseInt(item.TOT_HSHLD_CNT) || 0,
      totalBuildings: parseInt(item.DONG_CNT) || parseInt(item.TOT_DONG_CNT) || 0,
      approvalDate: item.USEAPR_DT || '',
    };
  }).sort((a, b) => b.totalUnits - a.totalUnits);
}
