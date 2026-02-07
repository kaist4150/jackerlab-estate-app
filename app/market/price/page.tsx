'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, MapPin, Building2, Loader2, AlertCircle, Calendar } from 'lucide-react';

interface PriceData {
  date: string;
  region: string;
  saleIndex: number;
  jeonseIndex: number;
  saleChange: number;
  jeonseChange: number;
}

interface MarketData {
  region: string;
  saleIndex: number;
  saleChange: number;
  jeonseIndex: number;
  jeonseChange: number;
  jeonseRatio: number;
}

const regions = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

export default function MarketPricePage() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [sortBy, setSortBy] = useState<'saleIndex' | 'saleChange' | 'jeonseRatio'>('saleIndex');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        regions.map(async (region) => {
          const params = new URLSearchParams({ region, year });
          const response = await fetch(`/api/stats/price?${params}`);
          const result = await response.json();
          return { region, data: result.success ? result.data : [] };
        })
      );

      const processedData: MarketData[] = results.map(({ region, data }) => {
        if (data.length === 0) {
          return {
            region,
            saleIndex: 0,
            saleChange: 0,
            jeonseIndex: 0,
            jeonseChange: 0,
            jeonseRatio: 0,
          };
        }

        const latest = data[data.length - 1] as PriceData;
        const jeonseRatio = latest.saleIndex > 0
          ? (latest.jeonseIndex / latest.saleIndex) * 100
          : 0;

        return {
          region,
          saleIndex: Math.round(latest.saleIndex * 10) / 10,
          saleChange: Math.round(latest.saleChange * 100) / 100,
          jeonseIndex: Math.round(latest.jeonseIndex * 10) / 10,
          jeonseChange: Math.round(latest.jeonseChange * 100) / 100,
          jeonseRatio: Math.round(jeonseRatio * 10) / 10,
        };
      });

      setMarketData(processedData);
    } catch {
      setError('데이터를 불러오는데 실패했습니다.');
      setMarketData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [year]);

  const sortedData = useMemo(() => {
    return [...marketData].sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      return (a[sortBy] - b[sortBy]) * multiplier;
    });
  }, [marketData, sortBy, sortOrder]);

  const seoulData = marketData.find(d => d.region === '서울');

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">시세 현황</h1>
        </div>
        <p className="text-sm text-gray-500">전국 시/도별 아파트 가격지수 현황 (한국부동산원 기준, 2021.06=100)</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">오류 발생</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
          <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
        </div>
      )}

      {!loading && !error && seoulData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-emerald-600 mb-1">
                <Building2 size={14} />
                <span>서울 매매지수</span>
              </div>
              <div className="text-2xl font-bold text-emerald-700">{seoulData.saleIndex}</div>
              <div className={`flex items-center gap-1 text-sm mt-1 ${
                seoulData.saleChange >= 0 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {seoulData.saleChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{seoulData.saleChange >= 0 ? '+' : ''}{seoulData.saleChange}%</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
                <Building2 size={14} />
                <span>서울 전세지수</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">{seoulData.jeonseIndex}</div>
              <div className={`flex items-center gap-1 text-sm mt-1 ${
                seoulData.jeonseChange >= 0 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {seoulData.jeonseChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{seoulData.jeonseChange >= 0 ? '+' : ''}{seoulData.jeonseChange}%</span>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-purple-600 mb-1">
                <TrendingUp size={14} />
                <span>서울 전세가율</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">{seoulData.jeonseRatio}%</div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-orange-600 mb-1">
                <MapPin size={14} />
                <span>조회 지역 수</span>
              </div>
              <div className="text-2xl font-bold text-orange-700">{marketData.length}개</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="font-semibold text-gray-900">시/도별 가격지수 현황</span>
              <span className="text-sm text-gray-500 ml-2">(기준: 2021.06=100)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-4 py-3 font-semibold">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        지역
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600"
                      onClick={() => handleSort('saleIndex')}
                    >
                      매매지수 {sortBy === 'saleIndex' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th
                      className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600"
                      onClick={() => handleSort('saleChange')}
                    >
                      매매 변동 {sortBy === 'saleChange' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="px-4 py-3 font-semibold text-right">전세지수</th>
                    <th className="px-4 py-3 font-semibold text-right">전세 변동</th>
                    <th
                      className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600"
                      onClick={() => handleSort('jeonseRatio')}
                    >
                      전세가율 {sortBy === 'jeonseRatio' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedData.map((data) => (
                    <tr key={data.region} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{data.region}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {data.saleIndex}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-0.5 ${
                          data.saleChange >= 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {data.saleChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {data.saleChange >= 0 ? '+' : ''}{data.saleChange}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {data.jeonseIndex}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-0.5 ${
                          data.jeonseChange >= 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {data.jeonseChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {data.jeonseChange >= 0 ? '+' : ''}{data.jeonseChange}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          data.jeonseRatio >= 70 ? 'bg-red-100 text-red-700' :
                          data.jeonseRatio >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {data.jeonseRatio}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-2">전세가율 안내</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-gray-600">60% 미만 - 안정</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-gray-600">60~70% - 주의</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-gray-600">70% 이상 - 경계</span>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !error && marketData.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <TrendingUp className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">해당 조건의 데이터가 없습니다</p>
        </div>
      )}
    </div>
  );
}
