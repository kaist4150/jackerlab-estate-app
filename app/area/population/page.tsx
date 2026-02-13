'use client';

import { useState, useMemo } from 'react';
import { Users, TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';

interface DistrictPopulation {
  district: string;
  population: number;
  households: number;
  popPerHousehold: number;
  area: number; // km²
  popDensity: number; // 명/km²
  change: number; // 전년 대비 증감률 %
}

// 서울시 구별 인구/세대 데이터 (2024년 기준, 서울열린데이터광장 출처)
const POPULATION_DATA: DistrictPopulation[] = [
  { district: '강남구', population: 527770, households: 232814, popPerHousehold: 2.27, area: 39.5, popDensity: 13361, change: -0.3 },
  { district: '강동구', population: 425851, households: 182654, popPerHousehold: 2.33, area: 24.6, popDensity: 17311, change: 0.2 },
  { district: '강북구', population: 295036, households: 143526, popPerHousehold: 2.06, area: 23.6, popDensity: 12501, change: -1.2 },
  { district: '강서구', population: 563589, households: 248930, popPerHousehold: 2.26, area: 41.4, popDensity: 13613, change: -0.5 },
  { district: '관악구', population: 484600, households: 263127, popPerHousehold: 1.84, area: 29.7, popDensity: 16316, change: -0.8 },
  { district: '광진구', population: 340424, households: 162413, popPerHousehold: 2.10, area: 17.1, popDensity: 19908, change: -0.4 },
  { district: '구로구', population: 394834, households: 179810, popPerHousehold: 2.20, area: 20.1, popDensity: 19643, change: -0.6 },
  { district: '금천구', population: 228886, households: 116785, popPerHousehold: 1.96, area: 13.0, popDensity: 17607, change: -0.3 },
  { district: '노원구', population: 497579, households: 206780, popPerHousehold: 2.41, area: 35.4, popDensity: 14056, change: -1.0 },
  { district: '도봉구', population: 307756, households: 131754, popPerHousehold: 2.34, area: 20.7, popDensity: 14867, change: -1.1 },
  { district: '동대문구', population: 339912, households: 165107, popPerHousehold: 2.06, area: 14.2, popDensity: 23937, change: -0.7 },
  { district: '동작구', population: 382969, households: 177382, popPerHousehold: 2.16, area: 16.4, popDensity: 23352, change: -0.5 },
  { district: '마포구', population: 362064, households: 174316, popPerHousehold: 2.08, area: 23.8, popDensity: 15213, change: 0.1 },
  { district: '서대문구', population: 306811, households: 146955, popPerHousehold: 2.09, area: 17.6, popDensity: 17432, change: -0.6 },
  { district: '서초구', population: 408762, households: 172445, popPerHousehold: 2.37, area: 47.0, popDensity: 8697, change: 0.0 },
  { district: '성동구', population: 293757, households: 133975, popPerHousehold: 2.19, area: 16.9, popDensity: 17382, change: 0.3 },
  { district: '성북구', population: 418838, households: 193164, popPerHousehold: 2.17, area: 24.6, popDensity: 17026, change: -0.8 },
  { district: '송파구', population: 651862, households: 275949, popPerHousehold: 2.36, area: 33.9, popDensity: 19229, change: -0.2 },
  { district: '양천구', population: 441957, households: 179587, popPerHousehold: 2.46, area: 17.4, popDensity: 25400, change: -0.7 },
  { district: '영등포구', population: 367563, households: 176638, popPerHousehold: 2.08, area: 24.6, popDensity: 14941, change: -0.1 },
  { district: '용산구', population: 222116, households: 107536, popPerHousehold: 2.07, area: 21.9, popDensity: 10142, change: 0.2 },
  { district: '은평구', population: 459791, households: 200478, popPerHousehold: 2.29, area: 29.7, popDensity: 15479, change: -0.5 },
  { district: '종로구', population: 143718, households: 72414, popPerHousehold: 1.98, area: 23.9, popDensity: 6014, change: -0.4 },
  { district: '중구', population: 121834, households: 60949, popPerHousehold: 2.00, area: 9.96, popDensity: 12232, change: -0.2 },
  { district: '중랑구', population: 383048, households: 172882, popPerHousehold: 2.22, area: 18.5, popDensity: 20706, change: -0.9 },
];

type SortField = 'district' | 'population' | 'households' | 'popDensity' | 'change';

export default function PopulationPage() {
  const [sortBy, setSortBy] = useState<SortField>('population');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    let result = [...POPULATION_DATA];

    if (searchTerm) {
      result = result.filter(d => d.district.includes(searchTerm));
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'district') comparison = a.district.localeCompare(b.district);
      else comparison = (a[sortBy] as number) - (b[sortBy] as number);
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [sortBy, sortOrder, searchTerm]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const totalStats = useMemo(() => {
    const totalPop = POPULATION_DATA.reduce((sum, d) => sum + d.population, 0);
    const totalHouseholds = POPULATION_DATA.reduce((sum, d) => sum + d.households, 0);
    const maxPop = Math.max(...POPULATION_DATA.map(d => d.population));
    const minPop = Math.min(...POPULATION_DATA.map(d => d.population));
    return { totalPop, totalHouseholds, maxPop, minPop };
  }, []);

  const ChangeIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp size={14} className="text-red-500" />;
    if (value < 0) return <TrendingDown size={14} className="text-blue-500" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">인구/세대 현황</h1>
        </div>
        <p className="text-sm text-gray-500">서울시 구별 인구 및 세대 현황 (2024년 기준)</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="구 이름 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">서울시 총 인구</div>
          <div className="text-xl font-bold text-gray-900">{totalStats.totalPop.toLocaleString()}명</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">서울시 총 세대</div>
          <div className="text-xl font-bold text-emerald-600">{totalStats.totalHouseholds.toLocaleString()}세대</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">최다 인구 구</div>
          <div className="text-xl font-bold text-red-500">
            {POPULATION_DATA.find(d => d.population === totalStats.maxPop)?.district}
          </div>
          <div className="text-xs text-gray-400">{totalStats.maxPop.toLocaleString()}명</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">최소 인구 구</div>
          <div className="text-xl font-bold text-blue-500">
            {POPULATION_DATA.find(d => d.population === totalStats.minPop)?.district}
          </div>
          <div className="text-xs text-gray-400">{totalStats.minPop.toLocaleString()}명</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-600">
                <th
                  className="px-4 py-3 font-semibold cursor-pointer hover:text-emerald-600"
                  onClick={() => handleSort('district')}
                >
                  구 {sortBy === 'district' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600"
                  onClick={() => handleSort('population')}
                >
                  인구 {sortBy === 'population' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600"
                  onClick={() => handleSort('households')}
                >
                  세대수 {sortBy === 'households' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-4 py-3 font-semibold text-right">세대당 인구</th>
                <th
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600"
                  onClick={() => handleSort('popDensity')}
                >
                  인구밀도 {sortBy === 'popDensity' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600"
                  onClick={() => handleSort('change')}
                >
                  전년대비 {sortBy === 'change' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr key={item.district} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.district}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {item.population.toLocaleString()}명
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {item.households.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {item.popPerHousehold.toFixed(2)}명
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">
                    {item.popDensity.toLocaleString()}명/㎢
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ChangeIcon value={item.change} />
                      <span className={`text-sm font-medium ${
                        item.change > 0 ? 'text-red-500' : item.change < 0 ? 'text-blue-500' : 'text-gray-500'
                      }`}>
                        {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 인구 데이터는 서울열린데이터광장 주민등록인구 통계 기준입니다.</li>
          <li>• 2024년 기준 데이터이며, 실시간 변동 사항은 반영되지 않습니다.</li>
          <li>• 인구밀도는 행정구역 면적 기준으로 산출됩니다.</li>
        </ul>
      </div>
    </div>
  );
}
