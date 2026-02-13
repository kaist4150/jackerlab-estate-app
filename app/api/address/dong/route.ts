import { NextRequest, NextResponse } from 'next/server';
import { LAWD_CD } from '@/lib/constants';

// 행정안전부 법정동코드 조회 API
const API_URL = 'https://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList';

export async function GET(request: NextRequest) {
  const district = request.nextUrl.searchParams.get('district') || '강남구';

  const apiKey = process.env.DATA_GO_KR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  const sigunguCd = LAWD_CD[district];
  if (!sigunguCd) {
    return NextResponse.json(
      { error: 'Invalid district' },
      { status: 400 }
    );
  }

  try {
    const url = new URL(API_URL);
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('locatadd_nm', `서울특별시 ${district}`);
    url.searchParams.set('type', 'json');
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('numOfRows', '100');

    const response = await fetch(url.toString());
    const json = await response.json();

    const rows = json?.StanReginCd?.[1]?.row || [];

    const dongList = rows
      .filter((row: any) => {
        const code = row.region_cd || '';
        // 10자리 코드 중 뒤 5자리가 00000이 아닌 것 (동 단위)
        return code.length === 10 && code.substring(5) !== '00000';
      })
      .map((row: any) => ({
        name: row.locallow_nm || row.locatadd_nm?.split(' ').pop() || '',
        bjdongCd: (row.region_cd || '').substring(5),
      }))
      .filter((d: any) => d.name && d.bjdongCd);

    // 중복 제거
    const unique = dongList.filter(
      (d: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.bjdongCd === d.bjdongCd) === i
    );

    return NextResponse.json({
      success: true,
      sigunguCd,
      district,
      data: unique,
    });
  } catch (error) {
    console.error('법정동코드 API Error:', error);
    return NextResponse.json(
      { error: 'API request failed', message: String(error) },
      { status: 500 }
    );
  }
}
