import { NextResponse } from 'next/server';

const NEIS_API_URL = 'https://open.neis.go.kr/hub/schoolInfo';
const SEOUL_CODE = 'B10';

interface DistrictSchoolData {
  district: string;
  elementary: number;
  middle: number;
  high: number;
  specialHigh: string[];    // 특목고
  autonomousHigh: string[]; // 자율고
}

async function fetchSchools(key: string, schoolKind: string): Promise<Record<string, { count: number; names?: string[]; types?: Record<string, string> }>> {
  const districts: Record<string, { count: number; names: string[]; types: Record<string, string> }> = {};
  let page = 1;
  let total = 0;

  do {
    const url = new URL(NEIS_API_URL);
    url.searchParams.set('KEY', key);
    url.searchParams.set('Type', 'json');
    url.searchParams.set('pIndex', String(page));
    url.searchParams.set('pSize', '1000');
    url.searchParams.set('ATPT_OFCDC_SC_CODE', SEOUL_CODE);
    url.searchParams.set('SCHUL_KND_SC_NM', schoolKind);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!data.schoolInfo) break;

    total = data.schoolInfo[0].head[0].list_total_count;
    const rows = data.schoolInfo[1].row;

    for (const r of rows) {
      const addr: string = r.ORG_RDNMA || '';
      const parts = addr.split(/\s+/);
      const gu = parts.length >= 2 ? parts[1] : '';
      if (!gu || !gu.endsWith('구')) continue;

      if (!districts[gu]) {
        districts[gu] = { count: 0, names: [], types: {} };
      }
      districts[gu].count++;

      if (schoolKind === '고등학교') {
        const hsType = (r.HS_SC_NM || '').trim();
        const name = r.SCHUL_NM || '';
        if (hsType && hsType !== '일반고') {
          districts[gu].names.push(name);
          districts[gu].types[name] = hsType;
        }
      }
    }

    page++;
  } while ((page - 1) * 1000 < total);

  return districts;
}

export async function GET() {
  const apiKey = process.env.NEIS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured', message: 'NEIS_API_KEY 환경변수를 설정해주세요.' },
      { status: 500 }
    );
  }

  try {
    const [elemData, middleData, highData] = await Promise.all([
      fetchSchools(apiKey, '초등학교'),
      fetchSchools(apiKey, '중학교'),
      fetchSchools(apiKey, '고등학교'),
    ]);

    const allDistricts = new Set([
      ...Object.keys(elemData),
      ...Object.keys(middleData),
      ...Object.keys(highData),
    ]);

    const result: DistrictSchoolData[] = Array.from(allDistricts)
      .sort()
      .map(gu => {
        const highInfo = highData[gu] || { count: 0, names: [], types: {} };
        const specialHigh = highInfo.names?.filter(n => highInfo.types?.[n] === '특목고') || [];
        const autonomousHigh = highInfo.names?.filter(n => highInfo.types?.[n] === '자율고') || [];

        return {
          district: gu,
          elementary: elemData[gu]?.count || 0,
          middle: middleData[gu]?.count || 0,
          high: highInfo.count,
          specialHigh,
          autonomousHigh,
        };
      });

    return NextResponse.json({
      success: true,
      data: result,
      totalSchools: result.reduce((s, d) => s + d.elementary + d.middle + d.high, 0),
    });
  } catch (error) {
    console.error('NEIS API Error:', error);
    return NextResponse.json(
      { error: 'API request failed', message: String(error) },
      { status: 500 }
    );
  }
}
