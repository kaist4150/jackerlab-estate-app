'use client';

import { useState, useEffect, useMemo } from 'react';
import { Mountain, MapPin, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';

interface LandPriceData {
  date: string;
  region: string;
  changeRate: number;
  cumulativeRate: number;
  landType: string;
}

const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

export default function LandPriceChangePage() {
  const [data, setData] = useState<LandPriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [region, setRegion] = useState('서울');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        region,
        year,
      });

      const response = await fetch(`/api/land/price-change?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || '데이터를 불러오는데 실패했습니다.');
        setData([]);
      }
    } catch {
      setError('API 요청 중 오류가 발생했습니다.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [region, year]);

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const rates = data.map(d => d.changeRate);
    const avgChange = rates.reduce((a, b) => a + b, 0) / rates.length;
    const latest = data[data.length - 1];
    const maxChange = Math.max(...rates);
    const minChange = Math.min(...rates);
    return {
      avgChange,
      cumulativeRate: latest?.cumulativeRate || 0,
      maxChange,
      minChange,
    };
  }, [data]);

  const formatRate = (rate: number) => {
    const prefix = rate > 0 ? '+' : '';
    return prefix + rate.toFixed(2) + '%';
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Mountain className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">지가 변동률</h1>
        </div>
        <p className="text-sm text-gray-500">전국 지가 변동률 조회</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
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

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">누적 변동률</div>
              <div className={`text-xl font-bold ${stats.cumulativeRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                {formatRate(stats.cumulativeRate)}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">평균 월간 변동률</div>
              <div className={`text-xl font-bold ${stats.avgChange >= 0 ? 'text-emerald-600' : 'text-blue-500'}`}>
                {formatRate(stats.avgChange)}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-1 text-sm text-red-600 mb-1">
                <TrendingUp size={14} />
                최대 상승
              </div>
              <div className="text-xl font-bold text-red-700">{formatRate(stats.maxChange)}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-1 text-sm text-blue-600 mb-1">
                <TrendingDown size={14} />
                최대 하락
              </div>
              <div className="text-xl font-bold text-blue-700">{formatRate(stats.minChange)}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-4 py-3 font-semibold">기준월</th>
                  <th className="px-4 py-3 font-semibold">지역</th>
                  <th className="px-4 py-3 font-semibold">토지유형</th>
                  <th className="px-4 py-3 font-semibold text-right">월간 변동률</th>
                  <th className="px-4 py-3 font-semibold text-right">누적 변동률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.region}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.landType}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${item.changeRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                        {formatRate(item.changeRate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${item.cumulativeRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                        {formatRate(item.cumulativeRate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                조회된 데이터가 없습니다.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
