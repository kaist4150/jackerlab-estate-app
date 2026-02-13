'use client';

import { useState, useEffect, useMemo } from 'react';
import { Building2, Search, Loader2, AlertCircle, MapPin, Zap, FileText } from 'lucide-react';
import { SEOUL_DISTRICTS, LAWD_CD } from '@/lib/constants';

interface BuildingRegisterItem {
  id: string;
  name: string;
  mainPurpose: string;
  structure: string;
  groundFloors: string;
  underFloors: string;
  totalArea: string;
  buildingArea: string;
  landArea: string;
  approvalDate: string;
  address: string;
}

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

function formatArea(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '-';
  return num.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) + ' ㎡';
}

function formatApprovalDate(value: string): string {
  if (!value || value.length !== 8) return value || '-';
  return `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`;
}

function formatNumber(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return '-';
  return num.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

export default function BuildingInfoPage() {
  const [registerData, setRegisterData] = useState<BuildingRegisterItem[]>([]);
  const [energyData, setEnergyData] = useState<EnergyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const [selectedDistrict, setSelectedDistrict] = useState('강남구');
  const [dongList, setDongList] = useState<DongItem[]>([]);
  const [dongLoading, setDongLoading] = useState(false);
  const [selectedDong, setSelectedDong] = useState('');
  const [bun, setBun] = useState('');
  const [ji, setJi] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

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
      const registerParams = new URLSearchParams({
        sigunguCd,
        bjdongCd: selectedDong,
        bun: bun.padStart(4, '0'),
        ji: ji.padStart(4, '0'),
      });

      const energyParams = new URLSearchParams({
        sigunguCd,
        bjdongCd: selectedDong,
        bun: bun.padStart(4, '0'),
        ji: ji.padStart(4, '0'),
        year: selectedYear,
      });

      const [registerRes, energyRes] = await Promise.all([
        fetch(`/api/building/register?${registerParams}`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
        fetch(`/api/building/energy?${energyParams}`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      setRegisterData(registerRes.success ? registerRes.data : []);
      setEnergyData(energyRes.success ? energyRes.data : []);

      if (!registerRes.success && !energyRes.success) {
        setError('건물 정보를 찾을 수 없습니다. 주소를 확인해주세요.');
      }
    } catch {
      setError('API 요청 중 오류가 발생했습니다.');
      setRegisterData([]);
      setEnergyData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchData();
  };

  const energyStats = useMemo(() => {
    if (energyData.length === 0) return null;
    const totalElec = energyData.reduce((sum, item) => sum + (parseFloat(item.elecUsage) || 0), 0);
    const totalGas = energyData.reduce((sum, item) => sum + (parseFloat(item.gasUsage) || 0), 0);
    return { count: energyData.length, totalElec, totalGas };
  }, [energyData]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">건물 통합 조회</h1>
        </div>
        <p className="text-sm text-gray-500">건축물대장 정보와 에너지 사용량을 한번에 조회합니다</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
            <label className="block text-xs text-gray-500 mb-1">본번</label>
            <input
              type="text"
              value={bun}
              onChange={(e) => setBun(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="826"
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
          <div>
            <label className="block text-xs text-gray-500 mb-1">에너지 연도</label>
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
          <span className="ml-3 text-gray-600">건물 정보를 조회하는 중...</span>
        </div>
      )}

      {/* Building Register Section */}
      {!loading && registerData.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-emerald-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">건축물대장</h2>
            <span className="text-sm text-gray-400">{registerData.length}건</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {registerData.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.name || '건물명 없음'}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin size={14} />
                      {item.address || '-'}
                    </div>
                  </div>
                  <Building2 className="text-emerald-500 flex-shrink-0" size={24} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">주용도</div>
                    <div className="text-sm font-medium text-gray-900">{item.mainPurpose || '-'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">구조</div>
                    <div className="text-sm font-medium text-gray-900">{item.structure || '-'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">지상층수</div>
                    <div className="text-sm font-medium text-gray-900">{item.groundFloors ? `${item.groundFloors}층` : '-'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">지하층수</div>
                    <div className="text-sm font-medium text-gray-900">{item.underFloors ? `${item.underFloors}층` : '-'}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="text-xs text-emerald-600 mb-1">연면적</div>
                    <div className="text-sm font-semibold text-emerald-700">{formatArea(item.totalArea)}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="text-xs text-emerald-600 mb-1">건축면적</div>
                    <div className="text-sm font-semibold text-emerald-700">{formatArea(item.buildingArea)}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="text-xs text-emerald-600 mb-1">대지면적</div>
                    <div className="text-sm font-semibold text-emerald-700">{formatArea(item.landArea)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">사용승인일</div>
                    <div className="text-sm font-medium text-gray-900">{formatApprovalDate(item.approvalDate)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Energy Section */}
      {!loading && energyData.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="text-emerald-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">에너지 사용량</h2>
            <span className="text-sm text-gray-400">{selectedYear}년</span>
          </div>

          {energyStats && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">조회 건수</div>
                <div className="text-xl font-bold text-gray-900">{energyStats.count}건</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">연간 전기사용량</div>
                <div className="text-xl font-bold text-emerald-600">{energyStats.totalElec.toLocaleString('ko-KR', { maximumFractionDigits: 2 })} kWh</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">연간 가스사용량</div>
                <div className="text-xl font-bold text-emerald-600">{energyStats.totalGas.toLocaleString('ko-KR', { maximumFractionDigits: 2 })} ㎥</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-4 py-3 font-semibold">기간</th>
                    <th className="px-4 py-3 font-semibold text-right">전기 (kWh)</th>
                    <th className="px-4 py-3 font-semibold text-right">가스 (㎥)</th>
                    <th className="px-4 py-3 font-semibold text-right">합계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {energyData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.useYear}-{item.useMonth.padStart(2, '0')}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {formatNumber(item.elecUsage)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {formatNumber(item.gasUsage)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-emerald-600">
                          {formatNumber(item.totalEnergy)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && searched && registerData.length === 0 && energyData.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">해당 주소의 건물 정보를 찾을 수 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">본번을 입력하면 더 정확한 결과를 확인할 수 있습니다.</p>
        </div>
      )}

      {!loading && !searched && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">검색 버튼을 눌러 건물 정보를 조회하세요.</p>
          <p className="text-sm text-gray-400 mt-1">본번을 입력하면 더 정확한 결과를 확인할 수 있습니다.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 건축물대장은 국토교통부 건축물대장정보 서비스에서 제공됩니다.</li>
          <li>• 에너지 사용량은 국토교통부 건물에너지 정보 서비스에서 제공됩니다.</li>
          <li>• 구와 동을 선택하고 본번을 입력한 후 검색 버튼을 눌러주세요.</li>
        </ul>
      </div>
    </div>
  );
}
