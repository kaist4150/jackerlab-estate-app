'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin, Building2, Users, Clock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

interface SubscriptionInfo {
  id: string;
  name: string;
  region: string;
  address: string;
  houseType: string;
  totalUnits: number;
  recruitDate: string;
  announceDate: string;
  contractStart: string;
  contractEnd: string;
  status: string;
}

const regions = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

export default function SubscriptionSchedulePage() {
  const [data, setData] = useState<SubscriptionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'ended'>('all');
  const [region, setRegion] = useState<string>('전체');
  const [houseType, setHouseType] = useState<string>('APT');

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        houseType,
        ...(region !== '전체' && { region }),
      });

      const response = await fetch(`/api/subscription/info?${params}`);
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
  }, [region, houseType]);

  const filteredData = useMemo(() => {
    if (filter === 'all') return data;
    return data.filter(item => {
      if (filter === 'upcoming') return item.status === '접수예정';
      if (filter === 'ongoing') return item.status === '접수중';
      if (filter === 'ended') return item.status === '마감';
      return true;
    });
  }, [data, filter]);

  const stats = useMemo(() => {
    const ongoing = data.filter(s => s.status === '접수중').length;
    const upcoming = data.filter(s => s.status === '접수예정').length;
    const totalUnits = data.reduce((sum, s) => sum + s.totalUnits, 0);
    return { ongoing, upcoming, totalUnits };
  }, [data]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '접수예정':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">예정</span>;
      case '접수중':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">진행중</span>;
      case '마감':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">마감</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const cleaned = dateStr.replace(/-/g, '');
    if (cleaned.length === 8) {
      const month = parseInt(cleaned.substring(4, 6));
      const day = parseInt(cleaned.substring(6, 8));
      return `${month}월 ${day}일`;
    }
    return dateStr;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">청약 일정</h1>
        </div>
        <p className="text-sm text-gray-500">전국 아파트 청약 일정을 확인하세요</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">상태:</span>
            <div className="flex gap-1">
              {[
                { value: 'all', label: '전체' },
                { value: 'ongoing', label: '진행중' },
                { value: 'upcoming', label: '예정' },
                { value: 'ended', label: '마감' },
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => setFilter(s.value as typeof filter)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filter === s.value
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-500" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-gray-500" />
            <select
              value={houseType}
              onChange={(e) => setHouseType(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="APT">아파트</option>
              <option value="OFFI">오피스텔</option>
              <option value="URBTY">도시형생활주택</option>
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

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="text-sm text-emerald-600 mb-1">진행중</div>
              <div className="text-2xl font-bold text-emerald-700">{stats.ongoing}건</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-sm text-blue-600 mb-1">예정</div>
              <div className="text-2xl font-bold text-blue-700">{stats.upcoming}건</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="text-sm text-purple-600 mb-1">총 공급세대</div>
              <div className="text-2xl font-bold text-purple-700">{stats.totalUnits.toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredData.map(sub => (
              <div
                key={sub.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(sub.status)}
                      <span className="text-xs text-gray-500">{sub.houseType}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{sub.name}</h3>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-gray-600">{sub.address || sub.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-gray-600">{sub.totalUnits.toLocaleString()}세대</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-600">
                      청약접수: {formatDate(sub.recruitDate)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500">당첨자 발표: </span>
                    <span className="text-gray-900 font-medium">{formatDate(sub.announceDate)}</span>
                  </div>
                  {sub.contractStart && (
                    <div className="text-sm">
                      <span className="text-gray-500">계약기간: </span>
                      <span className="text-gray-900">{formatDate(sub.contractStart)} ~ {formatDate(sub.contractEnd)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">조건에 맞는 청약 일정이 없습니다</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
