'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Calendar, MapPin, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';

interface MonthlyVolume {
  month: string;
  count: number;
}

interface RegionVolume {
  region: string;
  volumes: MonthlyVolume[];
  totalCount: number;
  avgCount: number;
  trend: number;
}

const seoulDistricts = [
  '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
  '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
  '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
];

export default function MarketVolumePage() {
  const [volumeData, setVolumeData] = useState<RegionVolume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('강남구');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const fetchVolumeData = async () => {
    setLoading(true);
    setError(null);

    try {
      const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
      const targetDistricts = ['강남구', '서초구', '송파구', '마포구', '용산구'];

      const results = await Promise.all(
        targetDistricts.map(async (district) => {
          const monthlyData = await Promise.all(
            months.slice(0, 6).map(async (month) => {
              try {
                const params = new URLSearchParams({
                  district,
                  year,
                  month,
                });
                const response = await fetch(`/api/trade/apartment?${params}`);
                const result = await response.json();
                return {
                  month: `${year}.${month}`,
                  count: result.success ? result.count : 0,
                };
              } catch {
                return { month: `${year}.${month}`, count: 0 };
              }
            })
          );

          const totalCount = monthlyData.reduce((sum, d) => sum + d.count, 0);
          const avgCount = Math.round(totalCount / monthlyData.length);
          const firstHalf = monthlyData.slice(0, 3).reduce((sum, d) => sum + d.count, 0);
          const secondHalf = monthlyData.slice(3, 6).reduce((sum, d) => sum + d.count, 0);
          const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

          return {
            region: district,
            volumes: monthlyData,
            totalCount,
            avgCount,
            trend: Math.round(trend * 10) / 10,
          };
        })
      );

      setVolumeData(results);
    } catch {
      setError('데이터를 불러오는데 실패했습니다.');
      setVolumeData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolumeData();
  }, [year]);

  const selectedData = useMemo(() => {
    return volumeData.find(d => d.region === selectedDistrict) || volumeData[0];
  }, [volumeData, selectedDistrict]);

  const chartData = selectedData?.volumes || [];
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  const totalVolume = volumeData.reduce((sum, d) => sum + d.totalCount, 0);
  const avgVolume = volumeData.length > 0
    ? Math.round(totalVolume / volumeData.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">거래량 추이</h1>
        </div>
        <p className="text-sm text-gray-500">서울시 구별 아파트 거래량 추이 (국토교통부 실거래가 기준)</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">지역:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {volumeData.map(d => (
                <option key={d.region} value={d.region}>{d.region}</option>
              ))}
            </select>
          </div>
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

      {!loading && !error && selectedData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="text-sm text-emerald-600 mb-1">총 거래량</div>
              <div className="text-2xl font-bold text-emerald-700">{selectedData.totalCount.toLocaleString()}건</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-sm text-blue-600 mb-1">월평균 거래량</div>
              <div className="text-2xl font-bold text-blue-700">{selectedData.avgCount.toLocaleString()}건</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="text-sm text-purple-600 mb-1">거래량 추세</div>
              <div className={`text-2xl font-bold flex items-center gap-1 ${
                selectedData.trend >= 0 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {selectedData.trend >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {selectedData.trend >= 0 ? '+' : ''}{selectedData.trend}%
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="text-sm text-orange-600 mb-1">조회 지역 수</div>
              <div className="text-2xl font-bold text-orange-700">{volumeData.length}개</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">{selectedDistrict} 월별 거래량</h2>
              <div className="h-64">
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
                        strokeDasharray="2"
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
                        {Math.round(maxCount - (maxCount * i / 4))}
                      </text>
                    ))}

                    {chartData.map((d, i) => {
                      const barWidth = 40;
                      const gap = (530 - barWidth * chartData.length) / (chartData.length + 1);
                      const x = 50 + gap + i * (barWidth + gap);
                      const height = (d.count / maxCount) * 160;
                      const y = 180 - height;

                      return (
                        <g key={i}>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={height}
                            fill="#10b981"
                            rx="4"
                          />
                          <text
                            x={x + barWidth / 2}
                            y={y - 5}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#374151"
                            fontWeight="bold"
                          >
                            {d.count}
                          </text>
                          <text
                            x={x + barWidth / 2}
                            y="195"
                            textAnchor="middle"
                            fontSize="10"
                            fill="#6b7280"
                          >
                            {d.month.substring(5)}월
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    데이터가 없습니다
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">지역별 거래량 비교</h2>
              <div className="space-y-3">
                {volumeData.map(region => (
                  <div
                    key={region.region}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedDistrict === region.region
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDistrict(region.region)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{region.region}</span>
                      <span className={`text-sm font-semibold flex items-center gap-1 ${
                        region.trend >= 0 ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {region.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {region.trend >= 0 ? '+' : ''}{region.trend}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{region.totalCount}건</span>
                      <span className="text-sm text-gray-500">월평균 {region.avgCount}건</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${(region.totalCount / Math.max(...volumeData.map(v => v.totalCount))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !error && volumeData.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BarChart3 className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">해당 조건의 데이터가 없습니다</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 거래량 데이터는 국토교통부 실거래가 공개시스템에서 제공됩니다.</li>
          <li>• 실거래 신고 후 약 1~2주 후에 데이터가 반영됩니다.</li>
          <li>• 추세는 전반기 대비 후반기 거래량 변동률입니다.</li>
        </ul>
      </div>
    </div>
  );
}
