import { NextRequest, NextResponse } from 'next/server';

// 한국부동산원 주간아파트시세 API
// API 목록에서 확인 필요 - 여러 엔드포인트 시도
const API_ENDPOINTS = [
  'https://apis.data.go.kr/1613000/AptPriceSvc/getAptPriceSvc',
  'https://apis.data.go.kr/B552555/lrsrClhapSvc/lrsrClhaAll',
];

export async function GET(request: NextRequest) {
  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  const results: { endpoint: string; status: string; data?: string }[] = [];

  for (const endpoint of API_ENDPOINTS) {
    try {
      const url = new URL(endpoint);
      url.searchParams.set('serviceKey', apiKey);
      url.searchParams.set('pageNo', '1');
      url.searchParams.set('numOfRows', '10');

      const response = await fetch(url.toString());
      const text = await response.text();

      results.push({
        endpoint,
        status: response.ok ? 'success' : `error: ${response.status}`,
        data: text.substring(0, 500),
      });
    } catch (error) {
      results.push({
        endpoint,
        status: `failed: ${String(error)}`,
      });
    }
  }

  return NextResponse.json({ results });
}
