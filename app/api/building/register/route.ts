import { NextRequest, NextResponse } from 'next/server';
import { extractXmlItems, getXmlValue } from '@/lib/xml-parser';

// 국토교통부 건축물대장 표제부 조회
const API_URL = 'https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sigunguCd = searchParams.get('sigunguCd') || '';
  const bjdongCd = searchParams.get('bjdongCd') || '';
  const bun = searchParams.get('bun') || '';
  const ji = searchParams.get('ji') || '';

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
    const url = new URL(API_URL);
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('sigunguCd', sigunguCd);
    url.searchParams.set('bjdongCd', bjdongCd);
    url.searchParams.set('platGbCd', '0');
    url.searchParams.set('bun', bun);
    url.searchParams.set('ji', ji);
    url.searchParams.set('numOfRows', '10');
    url.searchParams.set('pageNo', '1');

    const response = await fetch(url.toString());
    const xmlText = await response.text();
    const xmlItems = extractXmlItems(xmlText);

    const items = xmlItems.map((itemXml, index) => ({
      id: `building-${index}`,
      name: getXmlValue(itemXml, '건물명', 'bldNm'),
      mainPurpose: getXmlValue(itemXml, '주용도코드명', 'mainPurpsCdNm'),
      structure: getXmlValue(itemXml, '구조코드명', 'strctCdNm'),
      groundFloors: getXmlValue(itemXml, '지상층수', 'grndFlrCnt'),
      underFloors: getXmlValue(itemXml, '지하층수', 'ugrndFlrCnt'),
      totalArea: getXmlValue(itemXml, '연면적', 'totArea'),
      buildingArea: getXmlValue(itemXml, '건축면적', 'archArea'),
      landArea: getXmlValue(itemXml, '대지면적', 'platArea'),
      approvalDate: getXmlValue(itemXml, '사용승인일', 'useAprDay'),
      address: getXmlValue(itemXml, '대지위치', 'platPlc'),
    }));

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
