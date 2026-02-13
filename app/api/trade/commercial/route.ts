import { NextRequest, NextResponse } from 'next/server';
import { LAWD_CD } from '@/lib/constants';
import { extractXmlItems, getXmlValue } from '@/lib/xml-parser';

// 국토교통부 상업/업무용 실거래 API
const SALE_API_URL = 'https://apis.data.go.kr/1613000/RTMSDataSvcNrgTrade/getRTMSDataSvcNrgTrade';

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

  try {
    const url = new URL(SALE_API_URL);
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('LAWD_CD', lawdCd);
    url.searchParams.set('DEAL_YMD', `${year}${month}`);
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('numOfRows', '1000');

    const response = await fetch(url.toString());
    const xmlText = await response.text();
    const xmlItems = extractXmlItems(xmlText);

    const items = parseSaleItems(xmlItems, district);

    return NextResponse.json({
      success: true,
      district, year, month,
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

function parseSaleItems(xmlItems: string[], district: string) {
  const items = xmlItems.map((itemXml, index) => {
    const priceStr = getXmlValue(itemXml, '거래금액', 'dealAmount').replace(/,/g, '');
    if (!priceStr) return null;

    const year = getXmlValue(itemXml, '년', 'dealYear');
    const month = getXmlValue(itemXml, '월', 'dealMonth');
    const day = getXmlValue(itemXml, '일', 'dealDay');

    return {
      id: `${district}-${index}`,
      name: getXmlValue(itemXml, '건물주용도', 'buildingUse') || '-',
      district,
      dong: getXmlValue(itemXml, '법정동', 'umdNm'),
      jibun: getXmlValue(itemXml, '지번', 'jibun'),
      buildingArea: parseFloat(getXmlValue(itemXml, '건물면적', 'bldgAr')) || 0,
      landArea: parseFloat(getXmlValue(itemXml, '대지면적', 'platAr')) || 0,
      price: parseInt(priceStr) || 0,
      date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      built: parseInt(getXmlValue(itemXml, '건축년도', 'buildYear')) || 0,
    };
  }).filter(Boolean);

  items.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return items;
}
