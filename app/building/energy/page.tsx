'use client';

import { useState, useEffect, useMemo } from 'react';
import { Zap, Search, Loader2, AlertCircle, ArrowUpDown, BarChart3 } from 'lucide-react';
import { SEOUL_DISTRICTS, LAWD_CD } from '@/lib/constants';

interface EnergyItem {
  id: string;
  address: string;
  useYear: string;
  useMonth: string;
  elecUsage: string;
  gasUsage: string;
  heatUsage: string;
  totalEnergy: string;
}

interface DongItem {
  name: string;
  bjdongCd: string;
}

function formatNumber(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '-';
  return num.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

function parseNum(value: string): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

export default function BuildingEnergyPage() {
  const [data, setData] = useState<EnergyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDistrict, setSelectedDistrict] = useState('강남구');
  const [dongList, setDongList] = useState<DongItem[]>([]);
  const [dongLoading, setDongLoading] = useState(false);
  const [selectedDong, setSelectedDong] = useState('');
  const [bun, setBun] = useState('');
  const [ji, setJi] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [sortBy, setSortBy] = useState<'period' | 'elec' | 'gas' | 'total'>('period');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const fetchDongList = async () => {
      setDongLoading(true);
      setDongList([]);
      setSelectedDong('');

      try {
        const response = await fetch(`/api/address/dong?district=${encodeURIComponent(selectedDistrict)}`);
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          setDongList(result.data);
          setSelectedDong(result.data[0].bjdongCd);
        }
      } catch {
        // ignore
      } finally {
        setDongLoading(false);
      }
    };

    fetchDongList();
  }, [selectedDistrict]);

  const fetchData = async () => {
    if (!selectedDong) {
      setError('동을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const sigunguCd = LAWD_CD[selectedDistrict];
      const params = new URLSearchParams({
        sigunguCd,
        bjdongCd: selectedDong,
        bun: bun.padStart(4, '0'),
        ji: ji.padStart(4, '0'),
        year: selectedYear,
      });

      const response = await fetch(`/api/building/energy?${params}`);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchData();
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'period':
          cmp = (`${a.useYear}${a.useMonth}`).localeCompare(`${b.useYear}${b.useMonth}`);
          break;
        case 'elec':
          cmp = parseNum(a.elecUsage) - parseNum(b.elecUsage);
          break;
        case 'gas':
          cmp = parseNum(a.gasUsage) - parseNum(b.gasUsage);
          break;
        case 'total':
          cmp = parseNum(a.totalEnergy) - parseNum(b.totalEnergy);
          break;
      }
      return sortOrder === 'desc' ? -cmp : cmp;
    });
  }, [data, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    else { setSortBy(field); setSortOrder(field === 'period' ? 'asc' : 'desc'); }
  };

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const totalElec = data.reduce((sum, item) => sum + parseNum(item.elecUsage), 0);
    const totalGas = data.reduce((sum, item) => sum + parseNum(item.gasUsage), 0);
    const totalHeat = data.reduce((sum, item) => sum + parseNum(item.heatUsage), 0);
    const avgElec = totalElec / data.length;
    const avgGas = totalGas / data.length;
    return { count: data.length, totalElec, totalGas, totalHeat, avgElec, avgGas };
  }, [data]);

  const maxTotal = useMemo(() => Math.max(...data.map(d => parseNum(d.totalEnergy)), 1), [data]);

  const dongName = dongList.find(d => d.bjdongCd === selectedDong)?.name || '';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">건물 에너지 정보</h1>
        </div>
        <p className="text-sm text-gray-500">건물 에너지 사용량 정보를 조회합니다</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">구</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {SEOUL_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">동</label>
            <select
              value={selectedDong}
              onChange={(e) => setSelectedDong(e.target.value)}
              disabled={dongLoading || dongList.length === 0}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
            >
              {dongLoading ? (
                <option>불러오는 중...</option>
              ) : dongList.length === 0 ? (
                <option>동 목록 없음</option>
              ) : (
                dongList.map(d => (
                  <option key={d.bjdongCd} value={d.bjdongCd}>{d.name}</option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">연도</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">본번</label>
            <input
              type="text"
              value={bun}
              onChange={(e) => setBun(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="12"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">부번</label>
            <input
              type="text"
              value={ji}
              onChange={(e) => setJi(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchData}
              disabled={loading || dongLoading}
              className="w-full px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search size={18} />
              검색
            </button>
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">조회 건수</div>
              <div className="text-xl font-bold text-gray-900">{stats.count}건</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">총 전기사용량</div>
              <div className="text-xl font-bold text-yellow-600">{stats.totalElec.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} kWh</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">총 가스사용량</div>
              <div className="text-xl font-bold text-blue-600">{stats.totalGas.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} m³</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">월평균 전기</div>
              <div className="text-xl font-bold text-yellow-600">{stats.avgElec.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} kWh</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">월평균 가스</div>
              <div className="text-xl font-bold text-blue-600">{stats.avgGas.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} m³</div>
            </div>
          </div>

          {/* 간이 차트 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-emerald-600" />
              <h3 className="font-semibold text-gray-900">월별 에너지 사용 추이</h3>
              <span className="text-xs text-gray-400 ml-auto">
                {selectedDistrict} {dongName} {bun && `${bun}`}{ji && `-${ji}`} · {selectedYear}년
              </span>
            </div>
            <div className="space-y-2">
              {[...data].sort((a, b) => (`${a.useYear}${a.useMonth}`).localeCompare(`${b.useYear}${b.useMonth}`)).map((item) => {
                const total = parseNum(item.totalEnergy);
                const elec = parseNum(item.elecUsage);
                const gas = parseNum(item.gasUsage);
                const elecPct = maxTotal > 0 ? (elec / maxTotal) * 100 : 0;
                const gasPct = maxTotal > 0 ? (gas / maxTotal) * 100 : 0;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-14 text-right flex-shrink-0">
                      {item.useMonth}월
                    </span>
                    <div className="flex-1 flex h-5 bg-gray-50 rounded overflow-hidden">
                      <div className="bg-yellow-400 h-full" style={{ width: `${elecPct}%` }} title={`전기 ${formatNumber(item.elecUsage)} kWh`} />
                      <div className="bg-blue-400 h-full" style={{ width: `${gasPct}%` }} title={`가스 ${formatNumber(item.gasUsage)} m³`} />
                    </div>
                    <span className="text-xs text-gray-600 w-20 text-right flex-shrink-0">
                      {formatNumber(item.totalEnergy)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-400" /> 전기</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-400" /> 가스</div>
            </div>
          </div>
        </>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-4 py-3 font-semibold cursor-pointer hover:text-emerald-600" onClick={() => handleSort('period')}>
                    기간 {sortBy === 'period' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600" onClick={() => handleSort('elec')}>
                    전기 (kWh) {sortBy === 'elec' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600" onClick={() => handleSort('gas')}>
                    가스 (m³) {sortBy === 'gas' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600" onClick={() => handleSort('total')}>
                    합계 {sortBy === 'total' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="px-4 py-3 font-semibold w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.useYear}-{item.useMonth.padStart(2, '0')}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-yellow-700 font-medium">
                      {formatNumber(item.elecUsage)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-blue-700 font-medium">
                      {formatNumber(item.gasUsage)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-emerald-600">
                        {formatNumber(item.totalEnergy)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(parseNum(item.totalEnergy) / maxTotal) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-2">
            <Zap size={48} className="mx-auto" />
          </div>
          {searched ? (
            <>
              <p className="text-gray-500">조회 결과가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">검색 조건을 변경하여 다시 시도해보세요.</p>
            </>
          ) : (
            <>
              <p className="text-gray-500">검색 버튼을 눌러 에너지 정보를 조회하세요.</p>
              <p className="text-sm text-gray-400 mt-1">본번을 입력하면 더 정확한 결과를 확인할 수 있습니다.</p>
            </>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 건물 에너지 데이터는 국토교통부 건물에너지 정보 서비스에서 제공됩니다.</li>
          <li>• 구와 동을 선택한 후 검색 버튼을 눌러주세요.</li>
          <li>• 본번/부번을 입력하면 특정 건물을 조회할 수 있습니다.</li>
          <li>• 테이블 헤더를 클릭하면 정렬할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
