'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, MapPin, Home, Loader2, AlertCircle } from 'lucide-react';

interface PriceData {
  date: string;
  region: string;
  saleIndex: number;
  jeonseIndex: number;
  saleChange: number;
  jeonseChange: number;
}

const regions = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

export default function JeonseTrendPage() {
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRegion, setSelectedRegion] = useState('서울');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        region: selectedRegion,
        year,
      });

      const response = await fetch(`/api/stats/price?${params}`);
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
  }, [selectedRegion, year]);

  const chartData = useMemo(() => {
    return data.map(d => ({
      month: d.date,
      price: d.jeonseIndex,
      change: d.jeonseChange,
    }));
  }, [data]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const prices = chartData.map(d => d.price);
    const changes = chartData.map(d => d.change);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const totalChange = changes.reduce((a, b) => a + b, 0);
    const latestPrice = prices[prices.length - 1];

    // 전세가율 계산 (전세 지수 / 매매 지수 * 100)
    const latestData = data[data.length - 1];
    const ratio = latestData ? (latestData.jeonseIndex / latestData.saleIndex * 100) : 0;

    return { maxPrice, minPrice, totalChange, latestPrice, ratio };
  }, [chartData, data]);

  const maxPrice = stats?.maxPrice || 100;
  const minPrice = stats?.minPrice || 0;
  const priceRange = maxPrice - minPrice || 1;

  const formatIndex = (idx: number) => idx.toFixed(1);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Home className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">전세가 추이</h1>
        </div>
        <p className="text-sm text-gray-500">지역별 아파트 전세가격 지수 변동 추이</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">지역:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{selectedRegion} 아파트 전세가격 지수</h2>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                  stats.totalChange >= 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {stats.totalChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{stats.totalChange >= 0 ? '+' : ''}{stats.totalChange.toFixed(2)}%</span>
                </div>
              </div>

              <div className="relative h-64">
                {chartData.length > 0 ? (
                  <svg viewBox="0 0 600 200" className="w-full h-full">
                    {[0, 1, 2, 3, 4].map(i => (
                      <line
                        key={i}
                        x1="50"
                        y1={20 + i * 40}
                        x2="580"
                        y2={20 + i * 40}
                        stroke="#e5e7eb"
                        strokeDasharray="4"
                      />
                    ))}

                    {[0, 1, 2, 3, 4].map(i => (
                      <text
                        key={i}
                        x="45"
                        y={25 + i * 40}
                        textAnchor="end"
                        fontSize="10"
                        fill="#6b7280"
                      >
                        {formatIndex(maxPrice - (priceRange * i / 4))}
                      </text>
                    ))}

                    <path
                      d={`${chartData.map((d, i) => {
                        const x = 60 + (i * (520 / Math.max(chartData.length - 1, 1)));
                        const y = 20 + ((maxPrice - d.price) / priceRange) * 160;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')} L ${60 + (520 / Math.max(chartData.length - 1, 1)) * (chartData.length - 1)} 180 L 60 180 Z`}
                      fill="rgba(59, 130, 246, 0.1)"
                    />

                    <path
                      d={chartData.map((d, i) => {
                        const x = 60 + (i * (520 / Math.max(chartData.length - 1, 1)));
                        const y = 20 + ((maxPrice - d.price) / priceRange) * 160;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />

                    {chartData.map((d, i) => {
                      const x = 60 + (i * (520 / Math.max(chartData.length - 1, 1)));
                      const y = 20 + ((maxPrice - d.price) / priceRange) * 160;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#3b82f6"
                        />
                      );
                    })}

                    {chartData.map((d, i) => {
                      if (chartData.length > 12 && i % Math.ceil(chartData.length / 6) !== 0) return null;
                      const x = 60 + (i * (520 / Math.max(chartData.length - 1, 1)));
                      return (
                        <text
                          key={i}
                          x={x}
                          y="195"
                          textAnchor="middle"
                          fontSize="10"
                          fill="#6b7280"
                        >
                          {d.month.length > 6 ? d.month.substring(4) : d.month}
                        </text>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    데이터가 없습니다
                  </div>
                )}
              </div>

              <div className="text-center text-sm text-gray-500 mt-2">
                한국부동산원 아파트 전세가격 지수 (2021.06 = 100)
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">월별 변동률</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {chartData.slice().reverse().map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-600">{item.month}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{formatIndex(item.price)}</span>
                      <span className={`text-xs font-semibold ${
                        item.change >= 0 ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">현재 지수</div>
              <div className="text-xl font-bold text-gray-900">
                {formatIndex(stats.latestPrice)}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">전세가율</div>
              <div className="text-xl font-bold text-blue-600">
                {stats.ratio.toFixed(1)}%
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">기간 내 최고</div>
              <div className="text-xl font-bold text-red-600">
                {formatIndex(stats.maxPrice)}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">누적 변동률</div>
              <div className={`text-xl font-bold ${stats.totalChange >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {stats.totalChange >= 0 ? '+' : ''}{stats.totalChange.toFixed(2)}%
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Home className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">해당 조건의 데이터가 없습니다</p>
        </div>
      )}
    </div>
  );
}
