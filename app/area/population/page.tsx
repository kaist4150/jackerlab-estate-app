'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, TrendingUp, TrendingDown, Minus, Search, Loader2, RefreshCw, MapPin } from 'lucide-react';

interface DistrictPopulation {
  district: string;
  population: number;
  households: number;
  popPerHousehold: number;
  malePopulation: number;
  femalePopulation: number;
  statsMonth: string;
}

const REGIONS = [
  { code: '1100000000', name: '서울특별시' },
  { code: '2600000000', name: '부산광역시' },
  { code: '2700000000', name: '대구광역시' },
  { code: '2800000000', name: '인천광역시' },
  { code: '2900000000', name: '광주광역시' },
  { code: '3000000000', name: '대전광역시' },
  { code: '3100000000', name: '울산광역시' },
  { code: '3600000000', name: '세종특별자치시' },
  { code: '4100000000', name: '경기도' },
  { code: '5100000000', name: '강원특별자치도' },
  { code: '4300000000', name: '충청북도' },
  { code: '4400000000', name: '충청남도' },
  { code: '5200000000', name: '전북특별자치도' },
  { code: '4600000000', name: '전라남도' },
  { code: '4700000000', name: '경상북도' },
  { code: '4800000000', name: '경상남도' },
  { code: '5000000000', name: '제주특별자치도' },
] as const;

type SortField = 'district' | 'population' | 'households' | 'malePopulation' | 'femalePopulation';

export default function PopulationPage() {
  const [data, setData] = useState<DistrictPopulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statsMonth, setStatsMonth] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('1100000000');
  const [sortBy, setSortBy] = useState<SortField>('population');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  const fetchData = useCallback(async (regionCode?: string) => {
    setLoading(true);
    setError('');
    const code = regionCode || selectedRegion;
    try {
      const res = await fetch(`/api/area/population?admmCd=${code}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setStatsMonth(json.statsMonth || '');
      } else {
        setError(json.message || 'API 호출 실패');
      }
    } catch (e) {
      setError('네트워크 오류: ' + String(e));
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRegionChange = (code: string) => {
    setSelectedRegion(code);
    setSearchTerm('');
    fetchData(code);
  };

  const regionName = REGIONS.find(r => r.code === selectedRegion)?.name || '';

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchTerm) result = result.filter(d => d.district.includes(searchTerm));
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'district') comparison = a.district.localeCompare(b.district, 'ko');
      else comparison = (a[sortBy] as number) - (b[sortBy] as number);
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    return result;
  }, [data, sortBy, sortOrder, searchTerm]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const totalStats = useMemo(() => {
    if (data.length === 0) return { totalPop: 0, totalHouseholds: 0, maxPop: 0, minPop: 0, totalMale: 0, totalFemale: 0 };
    return {
      totalPop: data.reduce((s, d) => s + d.population, 0),
      totalHouseholds: data.reduce((s, d) => s + d.households, 0),
      maxPop: Math.max(...data.map(d => d.population)),
      minPop: Math.min(...data.map(d => d.population)),
      totalMale: data.reduce((s, d) => s + d.malePopulation, 0),
      totalFemale: data.reduce((s, d) => s + d.femalePopulation, 0),
    };
  }, [data]);

  const formatMonth = (ym: string) => {
    if (!ym || ym.length < 6) return ym;
    return `${ym.substring(0, 4)}년 ${parseInt(ym.substring(4, 6))}월`;
  };

  const ChangeIcon = ({ male, female }: { male: number; female: number }) => {
    if (male > female) return <TrendingUp size={14} className="text-blue-500" />;
    if (male < female) return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">인구/세대 현황</h1>
        </div>
        <p className="text-sm text-gray-500">
          {regionName} 시군구별 인구 및 세대 현황
          {statsMonth && <span className="ml-1">({formatMonth(statsMonth)} 기준)</span>}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-emerald-600" />
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
            >
              {REGIONS.map(r => (
                <option key={r.code} value={r.code}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="시군구 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {(['table', 'chart'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === m ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {m === 'table' ? '테이블' : '차트'}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 size={48} className="mx-auto text-emerald-500 mb-3 animate-spin" />
          <p className="text-gray-500">{regionName} 인구 데이터를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium mb-2">데이터 로드 실패</p>
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => fetchData()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
            다시 시도
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">{regionName} 총 인구</div>
              <div className="text-xl font-bold text-gray-900">{totalStats.totalPop.toLocaleString()}명</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">총 세대수</div>
              <div className="text-xl font-bold text-emerald-600">{totalStats.totalHouseholds.toLocaleString()}세대</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">최다 인구</div>
              <div className="text-xl font-bold text-red-500">{data.find(d => d.population === totalStats.maxPop)?.district}</div>
              <div className="text-xs text-gray-400">{totalStats.maxPop.toLocaleString()}명</div>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <div className="text-sm text-blue-600 mb-1">남성 인구</div>
              <div className="text-xl font-bold text-blue-700">{totalStats.totalMale.toLocaleString()}</div>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <div className="text-sm text-red-500 mb-1">여성 인구</div>
              <div className="text-xl font-bold text-red-600">{totalStats.totalFemale.toLocaleString()}</div>
            </div>
          </div>

          {viewMode === 'chart' ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">시군구별 인구 분포</h3>
              <div className="space-y-2">
                {filteredData.map((item) => (
                  <div key={item.district} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium text-gray-700 text-right shrink-0">{item.district}</div>
                    <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${totalStats.maxPop > 0 ? (item.population / totalStats.maxPop) * 100 : 0}%` }}
                      />
                      <span className="absolute inset-0 flex items-center pl-2 text-xs font-medium text-gray-700">
                        {item.population.toLocaleString()}명
                      </span>
                    </div>
                    <div className="w-20 text-xs text-right text-gray-500">
                      {item.households.toLocaleString()}세대
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="px-4 py-3 font-semibold cursor-pointer hover:text-emerald-600" onClick={() => handleSort('district')}>
                        시군구 {sortBy === 'district' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600" onClick={() => handleSort('population')}>
                        총 인구 {sortBy === 'population' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600" onClick={() => handleSort('households')}>
                        세대수 {sortBy === 'households' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-right">세대당 인구</th>
                      <th className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600" onClick={() => handleSort('malePopulation')}>
                        남성 {sortBy === 'malePopulation' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600" onClick={() => handleSort('femalePopulation')}>
                        여성 {sortBy === 'femalePopulation' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-center">성비</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.map((item) => (
                      <tr key={item.district} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.district}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">{item.population.toLocaleString()}명</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">{item.households.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">{item.popPerHousehold.toFixed(2)}명</td>
                        <td className="px-4 py-3 text-right text-sm text-blue-600">{item.malePopulation.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm text-red-500">{item.femalePopulation.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <ChangeIcon male={item.malePopulation} female={item.femalePopulation} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredData.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">검색 조건에 맞는 데이터가 없습니다.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
