'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trophy, MapPin, TrendingUp, Users, Loader2, AlertCircle } from 'lucide-react';

interface CompetitionData {
  id: string;
  name: string;
  region: string;
  supplyType: string;
  supplyCount: number;
  applicantCount: number;
  competitionRate: number;
  announceDate: string;
}

const regions = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

export default function SubscriptionCompetitionPage() {
  const [data, setData] = useState<CompetitionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [region, setRegion] = useState('전체');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        year,
        ...(region !== '전체' && { region }),
      });

      const response = await fetch(`/api/subscription/competition?${params}`);
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
  }, [region, year]);

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const rates = data.map(d => d.competitionRate);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    const max = Math.max(...rates);
    const totalApplicants = data.reduce((sum, d) => sum + d.applicantCount, 0);
    return { avg, max, count: data.length, totalApplicants };
  }, [data]);

  const formatRate = (rate: number) => {
    return rate.toFixed(1) + ':1';
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">청약 경쟁률</h1>
        </div>
        <p className="text-sm text-gray-500">전국 아파트 청약 경쟁률 현황</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">조회 건수</div>
              <div className="text-xl font-bold text-gray-900">{stats.count}건</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">평균 경쟁률</div>
              <div className="text-xl font-bold text-emerald-600">{formatRate(stats.avg)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">최고 경쟁률</div>
              <div className="text-xl font-bold text-red-500">{formatRate(stats.max)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">총 신청자</div>
              <div className="text-xl font-bold text-blue-500">{stats.totalApplicants.toLocaleString()}명</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-4 py-3 font-semibold">단지명</th>
                  <th className="px-4 py-3 font-semibold">지역</th>
                  <th className="px-4 py-3 font-semibold">공급유형</th>
                  <th className="px-4 py-3 font-semibold text-right">공급</th>
                  <th className="px-4 py-3 font-semibold text-right">신청</th>
                  <th className="px-4 py-3 font-semibold text-right">경쟁률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={14} />
                        {item.region}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.supplyType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.supplyCount}세대</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.applicantCount.toLocaleString()}명</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp size={14} className={item.competitionRate > 100 ? 'text-red-500' : 'text-emerald-500'} />
                        <span className={`font-semibold ${item.competitionRate > 100 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {formatRate(item.competitionRate)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                조회된 경쟁률 데이터가 없습니다.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
