'use client';

import { useState, useEffect } from 'react';
import { Building, Search, MapPin, Users, Calendar, Loader2, AlertCircle } from 'lucide-react';

interface ComplexInfo {
  id: string;
  complexCode: string;
  name: string;
  address: string;
  sido: string;
  sigungu: string;
  dong: string;
  totalUnits: number;
  totalBuildings: number;
  builtYear: number;
  managementType: string;
}

const sidoList = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'];

export default function ComplexSearchPage() {
  const [data, setData] = useState<ComplexInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sido, setSido] = useState('서울특별시');
  const [sigungu, setSigungu] = useState('');
  const [searchName, setSearchName] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sido,
        ...(sigungu && { sigungu }),
        ...(searchName && { name: searchName }),
      });

      const response = await fetch(`/api/complex/info?${params}`);
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
  }, [sido, sigungu]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Building className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">아파트 단지 검색</h1>
        </div>
        <p className="text-sm text-gray-500">전국 공동주택 단지 정보를 검색하세요</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <select
              value={sido}
              onChange={(e) => setSido(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {sidoList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <input
            type="text"
            value={sigungu}
            onChange={(e) => setSigungu(e.target.value)}
            placeholder="시/군/구"
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-32"
          />

          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="단지명 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            검색
          </button>
        </form>
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

      {!loading && !error && (
        <>
          <div className="text-sm text-gray-600 mb-2">
            총 {data.length}개 단지 조회
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((complex) => (
              <div
                key={complex.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{complex.name}</h3>
                    <p className="text-sm text-gray-500">{complex.complexCode}</p>
                  </div>
                  {complex.managementType && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {complex.managementType}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-gray-600">{complex.address || `${complex.sido} ${complex.sigungu} ${complex.dong}`}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-gray-600">{complex.totalUnits.toLocaleString()}세대</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building size={14} className="text-gray-400" />
                      <span className="text-gray-600">{complex.totalBuildings}개동</span>
                    </div>
                  </div>
                  {complex.builtYear > 0 && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-gray-600">{complex.builtYear}년 준공</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {data.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Building className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">검색 조건에 맞는 단지가 없습니다</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
