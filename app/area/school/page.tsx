'use client';

import { useState, useMemo, useEffect } from 'react';
import { GraduationCap, Search, Users, BookOpen, Loader2, RefreshCw } from 'lucide-react';

interface SchoolData {
  district: string;
  elementary: number;
  middle: number;
  high: number;
  specialHigh: string[];
  autonomousHigh: string[];
}

export default function SchoolInfoPage() {
  const [data, setData] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'district' | 'total' | 'elementary'>('district');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/area/school');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'API 호출 실패');
      }
    } catch (e) {
      setError('네트워크 오류: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = data.filter(item => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return item.district.includes(term) ||
        item.specialHigh.some(s => s.toLowerCase().includes(term)) ||
        item.autonomousHigh.some(s => s.toLowerCase().includes(term));
    });

    if (sortBy === 'total') {
      result = [...result].sort((a, b) => (b.elementary + b.middle + b.high) - (a.elementary + a.middle + a.high));
    } else if (sortBy === 'elementary') {
      result = [...result].sort((a, b) => b.elementary - a.elementary);
    }
    return result;
  }, [data, searchTerm, sortBy]);

  const totalStats = useMemo(() => ({
    districts: data.length,
    totalSchools: data.reduce((a, b) => a + b.elementary + b.middle + b.high, 0),
    totalElem: data.reduce((a, b) => a + b.elementary, 0),
    totalMiddle: data.reduce((a, b) => a + b.middle, 0),
    totalHigh: data.reduce((a, b) => a + b.high, 0),
  }), [data]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">학군 정보</h1>
        </div>
        <p className="text-sm text-gray-500">서울시 25개 구별 학교 현황 (NEIS API 실시간 연동)</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="구 이름, 학교명 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="district">구 이름순</option>
            <option value="total">학교수 많은순</option>
            <option value="elementary">초등학교 많은순</option>
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 size={48} className="mx-auto text-emerald-500 mb-3 animate-spin" />
          <p className="text-gray-500">NEIS API에서 학교 정보를 불러오는 중...</p>
          <p className="text-xs text-gray-400 mt-1">초등·중·고등학교 전체 데이터를 집계합니다</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium mb-2">데이터 로드 실패</p>
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchData} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
            다시 시도
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">조회 지역</div>
              <div className="text-xl font-bold text-gray-900">{totalStats.districts}개 구</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">전체 학교</div>
              <div className="text-xl font-bold text-emerald-600">{totalStats.totalSchools.toLocaleString()}개</div>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <div className="text-sm text-blue-600 mb-1">초등학교</div>
              <div className="text-xl font-bold text-blue-700">{totalStats.totalElem.toLocaleString()}</div>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
              <div className="text-sm text-emerald-600 mb-1">중학교</div>
              <div className="text-xl font-bold text-emerald-700">{totalStats.totalMiddle.toLocaleString()}</div>
            </div>
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
              <div className="text-sm text-purple-600 mb-1">고등학교</div>
              <div className="text-xl font-bold text-purple-700">{totalStats.totalHigh.toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const total = item.elementary + item.middle + item.high;
              const maxTotal = Math.max(...data.map(d => d.elementary + d.middle + d.high));
              const barWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

              return (
                <div key={item.district} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{item.district}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Users size={14} />
                        총 {total}개 학교
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">{total}</div>
                      <div className="text-xs text-gray-400">학교</div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-blue-600 mb-0.5">초등학교</div>
                      <div className="text-lg font-bold text-blue-700">{item.elementary}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-emerald-600 mb-0.5">중학교</div>
                      <div className="text-lg font-bold text-emerald-700">{item.middle}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-purple-600 mb-0.5">고등학교</div>
                      <div className="text-lg font-bold text-purple-700">{item.high}</div>
                    </div>
                  </div>

                  {item.specialHigh.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <BookOpen size={12} />
                        특목고
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.specialHigh.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.autonomousHigh.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <BookOpen size={12} />
                        자율고
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.autonomousHigh.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">검색 조건에 맞는 학군 정보가 없습니다.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
