'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart3, MapPin, TrendingUp, TrendingDown, Building2, Calendar, Loader2, AlertCircle } from 'lucide-react';

interface PriceData {
  date: string;
  region: string;
  saleIndex: number;
  jeonseIndex: number;
  saleChange: number;
  jeonseChange: number;
}

interface AreaData {
  name: string;
  saleIndex: number;
  jeonseIndex: number;
  jeonseRatio: number;
  saleChange: number;
  jeonseChange: number;
}

const allRegions = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

export default function AreaComparePage() {
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['서울', '경기', '인천', '부산', '대구']);
  const [compareMetric, setCompareMetric] = useState<'index' | 'change' | 'ratio'>('index');

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        allRegions.map(async (region) => {
          const params = new URLSearchParams({ region, year });
          const response = await fetch(`/api/stats/price?${params}`);
          const result = await response.json();
          return { region, data: result.success ? result.data : [] };
        })
      );

      const processedData: AreaData[] = results.map(({ region, data }) => {
        if (data.length === 0) {
          return {
            name: region,
            saleIndex: 0,
            jeonseIndex: 0,
            jeonseRatio: 0,
            saleChange: 0,
            jeonseChange: 0,
          };
        }

        const latest = data[data.length - 1] as PriceData;
        const jeonseRatio = latest.saleIndex > 0
          ? (latest.jeonseIndex / latest.saleIndex) * 100
          : 0;

        return {
          name: region,
          saleIndex: Math.round(latest.saleIndex * 10) / 10,
          jeonseIndex: Math.round(latest.jeonseIndex * 10) / 10,
          jeonseRatio: Math.round(jeonseRatio * 10) / 10,
          saleChange: Math.round(latest.saleChange * 100) / 100,
          jeonseChange: Math.round(latest.jeonseChange * 100) / 100,
        };
      });

      setAreaData(processedData);
    } catch {
      setError('데이터를 불러오는데 실패했습니다.');
      setAreaData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [year]);

  const toggleArea = (name: string) => {
    if (selectedAreas.includes(name)) {
      if (selectedAreas.length > 1) {
        setSelectedAreas(selectedAreas.filter(a => a !== name));
      }
    } else {
      if (selectedAreas.length < 7) {
        setSelectedAreas([...selectedAreas, name]);
      }
    }
  };

  const selectedData = useMemo(() => {
    return areaData.filter(a => selectedAreas.includes(a.name));
  }, [areaData, selectedAreas]);

  const maxSaleIndex = Math.max(...selectedData.map(d => d.saleIndex), 100);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">지역 비교</h1>
        </div>
        <p className="text-sm text-gray-500">전국 시/도별 아파트 가격지수 비교 (한국부동산원 기준, 2021.06=100)</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">비교 지역 선택 (최대 7개):</span>
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
        <div className="flex flex-wrap gap-2 mt-3">
          {areaData.map(area => (
            <button
              key={area.name}
              onClick={() => toggleArea(area.name)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                selectedAreas.includes(area.name)
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500'
              }`}
            >
              {area.name}
            </button>
          ))}
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

      {!loading && !error && selectedData.length > 0 && (
        <>
          <div className="flex gap-2">
            {[
              { value: 'index', label: '지수 비교' },
              { value: 'change', label: '변동률 비교' },
              { value: 'ratio', label: '전세가율 비교' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setCompareMetric(tab.value as 'index' | 'change' | 'ratio')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  compareMetric === tab.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              {compareMetric === 'index' && '매매/전세 지수 비교'}
              {compareMetric === 'change' && '월간 변동률 비교 (%)'}
              {compareMetric === 'ratio' && '전세가율 비교 (%)'}
            </h2>

            <div className="space-y-4">
              {selectedData.map(area => (
                <div key={area.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 w-16">{area.name}</span>
                    {compareMetric === 'index' && (
                      <div className="flex-1 flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">매매지수</span>
                            <span className="font-semibold">{area.saleIndex}</span>
                          </div>
                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${(area.saleIndex / maxSaleIndex) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">전세지수</span>
                            <span className="font-semibold">{area.jeonseIndex}</span>
                          </div>
                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(area.jeonseIndex / maxSaleIndex) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {compareMetric === 'change' && (
                      <div className="flex-1 flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">매매</span>
                            <span className={`font-semibold ${area.saleChange >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              {area.saleChange >= 0 ? '+' : ''}{area.saleChange}%
                            </span>
                          </div>
                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex justify-center">
                            <div
                              className={`h-full ${area.saleChange >= 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(Math.abs(area.saleChange) * 20, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">전세</span>
                            <span className={`font-semibold ${area.jeonseChange >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              {area.jeonseChange >= 0 ? '+' : ''}{area.jeonseChange}%
                            </span>
                          </div>
                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex justify-center">
                            <div
                              className={`h-full ${area.jeonseChange >= 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(Math.abs(area.jeonseChange) * 20, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {compareMetric === 'ratio' && (
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">전세가율</span>
                          <span className={`font-semibold ${
                            area.jeonseRatio >= 70 ? 'text-red-600' :
                            area.jeonseRatio >= 60 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {area.jeonseRatio}%
                          </span>
                        </div>
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              area.jeonseRatio >= 70 ? 'bg-red-500' :
                              area.jeonseRatio >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(area.jeonseRatio, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="font-semibold text-gray-900">상세 비교</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-4 py-3 font-semibold">지역</th>
                    <th className="px-4 py-3 font-semibold text-right">매매지수</th>
                    <th className="px-4 py-3 font-semibold text-right">매매 변동</th>
                    <th className="px-4 py-3 font-semibold text-right">전세지수</th>
                    <th className="px-4 py-3 font-semibold text-right">전세 변동</th>
                    <th className="px-4 py-3 font-semibold text-right">전세가율</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedData.map(area => (
                    <tr key={area.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{area.name}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {area.saleIndex}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-0.5 ${
                          area.saleChange >= 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {area.saleChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {area.saleChange >= 0 ? '+' : ''}{area.saleChange}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {area.jeonseIndex}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-0.5 ${
                          area.jeonseChange >= 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {area.jeonseChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {area.jeonseChange >= 0 ? '+' : ''}{area.jeonseChange}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          area.jeonseRatio >= 70 ? 'bg-red-100 text-red-700' :
                          area.jeonseRatio >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {area.jeonseRatio}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-emerald-600 mb-1">
                <Building2 size={14} />
                <span>최고 매매지수</span>
              </div>
              <div className="text-lg font-bold text-emerald-700">
                {selectedData.reduce((max, a) => a.saleIndex > max.saleIndex ? a : max, selectedData[0])?.name}
              </div>
              <div className="text-sm text-emerald-600">
                {Math.max(...selectedData.map(a => a.saleIndex))}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
                <TrendingUp size={14} />
                <span>최고 상승률</span>
              </div>
              <div className="text-lg font-bold text-blue-700">
                {selectedData.reduce((max, a) => a.saleChange > max.saleChange ? a : max, selectedData[0])?.name}
              </div>
              <div className="text-sm text-blue-600">
                +{Math.max(...selectedData.map(a => a.saleChange))}%
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-purple-600 mb-1">
                <TrendingDown size={14} />
                <span>최저 전세가율</span>
              </div>
              <div className="text-lg font-bold text-purple-700">
                {selectedData.reduce((min, a) => a.jeonseRatio < min.jeonseRatio && a.jeonseRatio > 0 ? a : min, selectedData[0])?.name}
              </div>
              <div className="text-sm text-purple-600">
                {Math.min(...selectedData.filter(a => a.jeonseRatio > 0).map(a => a.jeonseRatio))}%
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-orange-600 mb-1">
                <BarChart3 size={14} />
                <span>비교 지역 수</span>
              </div>
              <div className="text-lg font-bold text-orange-700">
                {selectedData.length}개
              </div>
              <div className="text-sm text-orange-600">
                전체 {allRegions.length}개 중
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
