'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Loader2, AlertCircle, MapPin, Building2 } from 'lucide-react';
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

export default function BuildingRegisterPage() {
  const [data, setData] = useState<BuildingRegisterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDistrict, setSelectedDistrict] = useState('강남구');
  const [dongList, setDongList] = useState<DongItem[]>([]);
  const [dongLoading, setDongLoading] = useState(false);
  const [selectedDong, setSelectedDong] = useState('');
  const [bun, setBun] = useState('');
  const [ji, setJi] = useState('');

  // 구 변경 시 동 목록 조회
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
        // 동 목록 조회 실패 시 무시
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

    try {
      const sigunguCd = LAWD_CD[selectedDistrict];
      const params = new URLSearchParams({
        sigunguCd,
        bjdongCd: selectedDong,
        bun: bun.padStart(4, '0'),
        ji: ji.padStart(4, '0'),
      });

      const response = await fetch(`/api/building/register?${params}`);
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

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">건축물대장 정보</h1>
        </div>
        <p className="text-sm text-gray-500">건축물대장 표제부 정보를 조회합니다</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map((item) => (
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
      )}

      {!loading && !error && data.length === 0 && selectedDong && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-2">
            <FileText size={48} className="mx-auto" />
          </div>
          <p className="text-gray-500">검색 버튼을 눌러 건축물대장을 조회하세요.</p>
          <p className="text-sm text-gray-400 mt-1">본번을 입력하면 더 정확한 결과를 확인할 수 있습니다.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 건축물대장 데이터는 국토교통부 건축물대장정보 서비스에서 제공됩니다.</li>
          <li>• 구와 동을 선택한 후 검색 버튼을 눌러주세요.</li>
          <li>• 본번/부번을 입력하면 특정 건물을 조회할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
