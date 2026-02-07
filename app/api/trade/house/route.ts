import { NextRequest, NextResponse } from 'next/server';

// 국토교통부 연립다세대 매매 실거래 API
const API_URL = 'https://apis.data.go.kr/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade';

// 서울시 구별 법정동 코드
const LAWD_CD: Record<string, string> = {
  '강남구': '11680',
  '강동구': '11740',
  '강북구': '11305',
  '강서구': '11500',
  '관악구': '11620',
  '광진구': '11215',
  '구로구': '11530',
  '금천구': '11545',
  '노원구': '11350',
  '도봉구': '11320',
  '동대문구': '11230',
  '동작구': '11590',
  '마포구': '11440',
  '서대문구': '11410',
  '서초구': '11650',
  '성동구': '11200',
  '성북구': '11290',
  '송파구': '11710',
  '양천구': '11470',
  '영등포구': '11560',
  '용산구': '11170',
  '은평구': '11380',
  '종로구': '11110',
  '중구': '11140',
  '중랑구': '11260',
};

interface HouseTrade {
  id: string;
  name: string;
  district: string;
  dong: string;
  jibun: string;
  size: number;
  floor: number;
  price: number;
  date: string;
  built: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const district = searchParams.get('district') || '강남구';
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const month = searchParams.get('month') || String(new Date().getMonth() + 1).padStart(2, '0');

  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured', message: 'DATA_GO_KR_API_KEY 환경변수를 설정해주세요.' },
      { status: 500 }
    );
  }

  const lawdCd = LAWD_CD[district];
  if (!lawdCd) {
    return NextResponse.json(
      { error: 'Invalid district', message: '유효하지 않은 구 이름입니다.' },
      { status: 400 }
    );
  }

  const dealYmd = `${year}${month}`;

  try {
    const url = new URL(API_URL);
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('LAWD_CD', lawdCd);
    url.searchParams.set('DEAL_YMD', dealYmd);
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('numOfRows', '1000');

    const response = await fetch(url.toString());
    const xmlText = await response.text();

    const items = parseXmlToItems(xmlText, district);

    return NextResponse.json({
      success: true,
      district,
      year,
      month,
      count: items.length,
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

function parseXmlToItems(xml: string, district: string): HouseTrade[] {
  const items: HouseTrade[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let index = 0;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const getValue = (tag: string): string => {
      const tagRegex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
      const m = itemXml.match(tagRegex);
      return m ? m[1].trim() : '';
    };

    const name = getValue('연립다세대') || getValue('mhouseNm');
    const dong = getValue('법정동') || getValue('umdNm');
    const jibun = getValue('지번') || getValue('jibun');
    const sizeStr = getValue('전용면적') || getValue('excluUseAr');
    const floorStr = getValue('층') || getValue('floor');
    const priceStr = (getValue('거래금액') || getValue('dealAmount')).replace(/,/g, '');
    const yearVal = getValue('년') || getValue('dealYear');
    const monthVal = getValue('월') || getValue('dealMonth');
    const dayVal = getValue('일') || getValue('dealDay');
    const builtStr = getValue('건축년도') || getValue('buildYear');

    if (name && priceStr) {
      items.push({
        id: `${district}-${index++}`,
        name,
        district,
        dong,
        jibun,
        size: parseFloat(sizeStr) || 0,
        floor: parseInt(floorStr) || 0,
        price: parseInt(priceStr) || 0,
        date: `${yearVal}-${monthVal.padStart(2, '0')}-${dayVal.padStart(2, '0')}`,
        built: parseInt(builtStr) || 0,
      });
    }
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return items;
}
