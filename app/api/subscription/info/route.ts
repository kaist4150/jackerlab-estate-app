import { NextRequest, NextResponse } from 'next/server';

// 한국부동산원 청약홈 분양정보 조회 서비스
const API_URL = 'https://apis.data.go.kr/1613000/OpeningService/getOpeningInfo';

interface SubscriptionInfo {
  id: string;
  name: string;
  region: string;
  address: string;
  houseType: string;
  totalUnits: number;
  recruitDate: string;
  announceDate: string;
  contractStart: string;
  contractEnd: string;
  status: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get('region') || '';
  const houseType = searchParams.get('houseType') || 'APT';

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
    url.searchParams.set('numOfRows', '100');
    url.searchParams.set('pageNo', '1');
    if (region) {
      url.searchParams.set('sidoNm', region);
    }
    url.searchParams.set('houseTy', houseType);

    const response = await fetch(url.toString());
    const xmlText = await response.text();

    const items = parseXmlToItems(xmlText);

    return NextResponse.json({
      success: true,
      region: region || '전체',
      houseType,
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

function parseXmlToItems(xml: string): SubscriptionInfo[] {
  const items: SubscriptionInfo[] = [];
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

    const name = getValue('houseDtlSecdNm') || getValue('houseNm') || getValue('bsnsMbyNm');
    const region = getValue('sidoNm') || getValue('sido');
    const address = getValue('hssplyAdres') || getValue('adres');
    const houseType = getValue('houseTy') || getValue('houseSecd');
    const totalUnits = getValue('totSuplyHshldco') || getValue('totHshldco');
    const recruitDate = getValue('rceptBgnde') || getValue('rcritPblancDe');
    const announceDate = getValue('przwnerPresnatnDe') || getValue('winnerDe');
    const contractStart = getValue('cntrctCnclsBgnde') || getValue('contractBgn');
    const contractEnd = getValue('cntrctCnclsEndde') || getValue('contractEnd');

    if (name) {
      items.push({
        id: `sub-${index++}`,
        name,
        region,
        address,
        houseType,
        totalUnits: parseInt(totalUnits) || 0,
        recruitDate,
        announceDate,
        contractStart,
        contractEnd,
        status: getStatus(recruitDate, announceDate),
      });
    }
  }

  items.sort((a, b) => b.recruitDate.localeCompare(a.recruitDate));
  return items;
}

function getStatus(recruitDate: string, announceDate: string): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const recruit = recruitDate.replace(/-/g, '');
  const announce = announceDate.replace(/-/g, '');

  if (today < recruit) return '접수예정';
  if (today <= announce) return '접수중';
  return '마감';
}
