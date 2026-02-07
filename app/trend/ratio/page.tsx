'use client';

import { useState, useEffect, useMemo } from 'react';
import { Percent, Calendar, MapPin, AlertTriangle, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';

interface PriceData {
  date: string;
  region: string;
  saleIndex: number;
  jeonseIndex: number;
  saleChange: number;
  jeonseChange: number;
}

interface RegionRatioData {
  name: string;
  ratios: { month: string; ratio: number }[];
  currentRatio: number;
  change: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function RatioTrendPage() {
  const [regionDataList, setRegionDataList] = useState<RegionRatioData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('서울');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const formatMonth = (dateStr: string) => {
    if (dateStr.length === 6) {
      return `${dateStr.substring(0, 4)}.${dateStr.substring(4)}`;
    }
    return dateStr;
  };

  const fetchAllRegionsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const targetRegions = ['서울', '경기', '인천', '부산', '대구'];
      const results = await Promise.all(
        targetRegions.map(async (region) => {
          const params = new URLSearchParams({ region, year });
          const response = await fetch(`/api/stats/price?${params}`);
          const result = await response.json();
          return { region, data: result.success ? result.data : [] };
        })
      );

      const processedData: RegionRatioData[] = results.map(({ region, data }) => {
        const ratios = data.map((d: PriceData) => ({
          month: formatMonth(d.date),
          ratio: d.saleIndex > 0 ? (d.jeonseIndex / d.saleIndex) * 100 : 0,
        }));

        const currentRatio = ratios.length > 0 ? ratios[ratios.length - 1].ratio : 0;
        const firstRatio = ratios.length > 0 ? ratios[0].ratio : 0;
        const change = currentRatio - firstRatio;

        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        if (currentRatio >= 70) riskLevel = 'high';
        else if (currentRatio >= 60) riskLevel = 'medium';

        return {
          name: region,
          ratios,
          currentRatio: Math.round(currentRatio * 10) / 10,
          change: Math.round(change * 10) / 10,
          riskLevel,
        };
      });

      setRegionDataList(processedData);
    } catch {
      setError('데이터를 불러오는데 실패했습니다.');
      setRegionDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRegionsData();
  }, [year]);

  const regionData = useMemo(() => {
    return regionDataList.find(r => r.name === selectedRegion) || regionDataList[0];
  }, [selectedRegion, regionDataList]);

  const chartData = useMemo(() => {
    return regionData?.ratios || [];
  }, [regionData]);

  const maxRatio = Math.max(...(chartData.length > 0 ? chartData.map(d => d.ratio) : [75]), 75);
  const minRatio = Math.min(...(chartData.length > 0 ? chartData.map(d => d.ratio) : [50]), 50);
  const ratioRange = maxRatio - minRatio || 1;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return { bg: 'bg-green-100', text: 'text-green-700', label: '안정' };
      case 'medium': return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '주의' };
      case 'high': return { bg: 'bg-red-100', text: 'text-red-700', label: '경계' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', label: '-' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Percent className="text-purple-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">전세가율 추이</h1>
        </div>
        <p className="text-sm text-gray-500">지역별 아파트 전세가율 변동 추이 (한국부동산원 기준)</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-yellow-900">전세가율 안내</h3>
            <p className="text-sm text-yellow-800 mt-1">
              전세가율이 70%를 넘으면 깡통전세 위험이 있습니다.
              전세 계약 전 반드시 시세를 확인하시고, 전세보증보험 가입을 권장합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">지역:</span>
            <div className="flex gap-1 flex-wrap">
              {regionDataList.map(region => (
                <button
                  key={region.name}
                  onClick={() => setSelectedRegion(region.name)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    selectedRegion === region.name
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
          <Loader2 className="animate-spin text-purple-600" size={32} />
          <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
        </div>
      )}

      {!loading && !error && regionData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{selectedRegion} 전세가율</h2>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                  regionData.change >= 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {regionData.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{regionData.change >= 0 ? '+' : ''}{regionData.change}%p</span>
                </div>
              </div>

              <div className="relative h-64">
                {chartData.length > 0 ? (
                  <svg viewBox="0 0 600 200" className="w-full h-full">
                    {maxRatio >= 70 && (
                      <rect
                        x="50"
                        y={20 + ((maxRatio - Math.min(maxRatio, 100)) / ratioRange) * 160}
                        width="530"
                        height={((Math.min(maxRatio, 100) - 70) / ratioRange) * 160}
                        fill="rgba(239, 68, 68, 0.1)"
                      />
                    )}

                    {70 >= minRatio && 70 <= maxRatio && (
                      <>
                        <line
                          x1="50"
                          y1={20 + ((maxRatio - 70) / ratioRange) * 160}
                          x2="580"
                          y2={20 + ((maxRatio - 70) / ratioRange) * 160}
                          stroke="#ef4444"
                          strokeDasharray="4"
                          strokeWidth="1"
                        />
                        <text
                          x="585"
                          y={25 + ((maxRatio - 70) / ratioRange) * 160}
                          fontSize="10"
                          fill="#ef4444"
                        >
                          경계 70%
                        </text>
                      </>
                    )}

                    {60 >= minRatio && 60 <= maxRatio && (
                      <>
                        <line
                          x1="50"
                          y1={20 + ((maxRatio - 60) / ratioRange) * 160}
                          x2="580"
                          y2={20 + ((maxRatio - 60) / ratioRange) * 160}
                          stroke="#f59e0b"
                          strokeDasharray="4"
                          strokeWidth="1"
                        />
                        <text
                          x="585"
                          y={25 + ((maxRatio - 60) / ratioRange) * 160}
                          fontSize="10"
                          fill="#f59e0b"
                        >
                          주의 60%
                        </text>
                      </>
                    )}

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
                        {(maxRatio - (ratioRange * i / 4)).toFixed(0)}%
                      </text>
                    ))}

                    <path
                      d={`${chartData.map((d, i) => {
                        const x = 60 + (i * (520 / Math.max(chartData.length - 1, 1)));
                        const y = 20 + ((maxRatio - d.ratio) / ratioRange) * 160;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')} L ${60 + (520 / Math.max(chartData.length - 1, 1)) * (chartData.length - 1)} 180 L 60 180 Z`}
                      fill="rgba(147, 51, 234, 0.1)"
                    />

                    <path
                      d={chartData.map((d, i) => {
                        const x = 60 + (i * (520 / Math.max(chartData.length - 1, 1)));
                        const y = 20 + ((maxRatio - d.ratio) / ratioRange) * 160;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#9333ea"
                      strokeWidth="2"
                    />

                    {chartData.map((d, i) => {
                      const x = 60 + (i * (520 / Math.max(chartData.length - 1, 1)));
                      const y = 20 + ((maxRatio - d.ratio) / ratioRange) * 160;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#9333ea"
                        />
                      );
                    })}

                    {chartData.map((d, i) => {
                      if (chartData.length > 6 && i % Math.ceil(chartData.length / 6) !== 0) return null;
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
                          {d.month}
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
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">지역별 전세가율</h2>
              <div className="space-y-3">
                {regionDataList.map(region => {
                  const risk = getRiskColor(region.riskLevel);
                  return (
                    <div
                      key={region.name}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedRegion === region.name
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRegion(region.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{region.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${risk.bg} ${risk.text}`}>
                          {risk.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">{region.currentRatio}%</span>
                        <span className={`text-sm font-semibold ${
                          region.change >= 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {region.change >= 0 ? '+' : ''}{region.change}%p
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            region.currentRatio >= 70 ? 'bg-red-500' :
                            region.currentRatio >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(region.currentRatio, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">현재 전세가율</div>
              <div className="text-xl font-bold text-gray-900">{regionData.currentRatio}%</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">연간 변동</div>
              <div className={`text-xl font-bold ${regionData.change >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {regionData.change >= 0 ? '+' : ''}{regionData.change}%p
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">기간 내 최고</div>
              <div className="text-xl font-bold text-red-600">
                {chartData.length > 0 ? Math.max(...chartData.map(d => d.ratio)).toFixed(1) : '-'}%
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">기간 내 최저</div>
              <div className="text-xl font-bold text-blue-600">
                {chartData.length > 0 ? Math.min(...chartData.map(d => d.ratio)).toFixed(1) : '-'}%
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !error && regionDataList.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Percent className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">해당 조건의 데이터가 없습니다</p>
        </div>
      )}
    </div>
  );
}
