import { NextRequest, NextResponse } from 'next/server';

// 한국부동산원 R-ONE 부동산통계 API
const API_URL = 'https://www.reb.or.kr/r-one/openapi/SttsApiTblData.do';

// 통계표 ID
const STAT_IDS = {
  SALE: 'A_2024_00178',    // (월) 지역별 매매지수_아파트
  JEONSE: 'A_2024_00182',  // (월) 지역별 전세지수_아파트
};

// 지역명 목록 (CLS_NM)
const REGION_NAMES = ['전국', '수도권', '서울', '경기', '인천', '지방', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

interface PriceData {
  date: string;
  region: string;
  saleIndex: number;
  jeonseIndex: number;
  saleChange: number;
  jeonseChange: number;
}

interface RoneApiItem {
  WRTTIME_IDTFR_ID: string;
  CLS_NM: string;
  DTA_VAL: number;
  WRTTIME_DESC: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get('region') || '서울';
  const year = searchParams.get('year') || new Date().getFullYear().toString();

  // R-ONE API Key (환경변수)
  const apiKey = process.env.RONE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured', message: 'RONE_API_KEY 환경변수를 설정해주세요.' },
      { status: 500 }
    );
  }

  if (!REGION_NAMES.includes(region)) {
    return NextResponse.json(
      { error: 'Invalid region', message: '유효하지 않은 지역입니다.' },
      { status: 400 }
    );
  }

  const startDate = `${year}01`;
  const endDate = `${year}12`;

  try {
    // 매매지수와 전세지수 동시 조회
    const [saleData, jeonseData] = await Promise.all([
      fetchStatData(apiKey, STAT_IDS.SALE, startDate, endDate, region),
      fetchStatData(apiKey, STAT_IDS.JEONSE, startDate, endDate, region),
    ]);

    // 데이터 병합
    const mergedData = mergeData(saleData, jeonseData, region);

    return NextResponse.json({
      success: true,
      region,
      year,
      count: mergedData.length,
      data: mergedData,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'API request failed', message: String(error) },
      { status: 500 }
    );
  }
}

async function fetchStatData(apiKey: string, statId: string, startDate: string, endDate: string, region: string): Promise<RoneApiItem[]> {
  const url = new URL(API_URL);
  url.searchParams.set('KEY', apiKey);
  url.searchParams.set('Type', 'json');
  url.searchParams.set('STATBL_ID', statId);
  url.searchParams.set('DTACYCLE_CD', 'MM');
  url.searchParams.set('START_WRTTIME', startDate);
  url.searchParams.set('END_WRTTIME', endDate);
  url.searchParams.set('pIndex', '1');
  url.searchParams.set('pSize', '500');

  const response = await fetch(url.toString());
  const json = await response.json();

  if (!json.SttsApiTblData || !json.SttsApiTblData[1]?.row) {
    return [];
  }

  // 해당 지역 데이터만 필터링
  return json.SttsApiTblData[1].row.filter((item: RoneApiItem) => item.CLS_NM === region);
}

function mergeData(saleData: RoneApiItem[], jeonseData: RoneApiItem[], region: string): PriceData[] {
  const result: PriceData[] = [];
  const saleMap = new Map(saleData.map(d => [d.WRTTIME_IDTFR_ID, d]));
  const jeonseMap = new Map(jeonseData.map(d => [d.WRTTIME_IDTFR_ID, d]));

  // 모든 날짜 수집
  const allDates = new Set([...saleMap.keys(), ...jeonseMap.keys()]);
  const sortedDates = Array.from(allDates).sort();

  let prevSale = 0;
  let prevJeonse = 0;

  for (const date of sortedDates) {
    const sale = saleMap.get(date);
    const jeonse = jeonseMap.get(date);

    const saleIndex = sale?.DTA_VAL || 0;
    const jeonseIndex = jeonse?.DTA_VAL || 0;

    // 변동률 계산 (전월 대비)
    const saleChange = prevSale > 0 ? ((saleIndex - prevSale) / prevSale) * 100 : 0;
    const jeonseChange = prevJeonse > 0 ? ((jeonseIndex - prevJeonse) / prevJeonse) * 100 : 0;

    result.push({
      date,
      region,
      saleIndex,
      jeonseIndex,
      saleChange,
      jeonseChange,
    });

    prevSale = saleIndex;
    prevJeonse = jeonseIndex;
  }

  return result;
}
