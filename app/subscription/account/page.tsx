'use client';

import { useState, useEffect, useMemo } from 'react';
import { Wallet, MapPin, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';

interface AccountStats {
  date: string;
  region: string;
  totalAccounts: number;
  newAccounts: number;
  canceledAccounts: number;
  avgBalance: number;
}

const regions = ['전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

export default function SubscriptionAccountPage() {
  const [data, setData] = useState<AccountStats[]>([]);
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

      const response = await fetch(`/api/subscription/account?${params}`);
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
    const latest = data[0];
    const totalNew = data.reduce((sum, d) => sum + d.newAccounts, 0);
    const totalCanceled = data.reduce((sum, d) => sum + d.canceledAccounts, 0);
    return {
      totalAccounts: latest?.totalAccounts || 0,
      avgBalance: latest?.avgBalance || 0,
      totalNew,
      totalCanceled,
    };
  }, [data]);

  const formatNumber = (num: number) => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1) + '억';
    }
    if (num >= 10000) {
      return (num / 10000).toFixed(0) + '만';
    }
    return num.toLocaleString();
  };

  const formatMoney = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(0) + '만원';
    }
    return num.toLocaleString() + '원';
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">청약통장 현황</h1>
        </div>
        <p className="text-sm text-gray-500">전국 청약통장 가입 현황</p>
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
              <div className="text-sm text-gray-500 mb-1">총 가입자 수</div>
              <div className="text-xl font-bold text-gray-900">{formatNumber(stats.totalAccounts)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">평균 잔액</div>
              <div className="text-xl font-bold text-emerald-600">{formatMoney(stats.avgBalance)}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-1 text-sm text-emerald-600 mb-1">
                <TrendingUp size={14} />
                신규 가입
              </div>
              <div className="text-xl font-bold text-emerald-700">{formatNumber(stats.totalNew)}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-1 text-sm text-red-600 mb-1">
                <TrendingDown size={14} />
                해지
              </div>
              <div className="text-xl font-bold text-red-700">{formatNumber(stats.totalCanceled)}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-4 py-3 font-semibold">기준월</th>
                  <th className="px-4 py-3 font-semibold">지역</th>
                  <th className="px-4 py-3 font-semibold text-right">총 가입자</th>
                  <th className="px-4 py-3 font-semibold text-right">신규 가입</th>
                  <th className="px-4 py-3 font-semibold text-right">해지</th>
                  <th className="px-4 py-3 font-semibold text-right">평균 잔액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.region}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(item.totalAccounts)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-600">{formatNumber(item.newAccounts)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-red-500">{formatNumber(item.canceledAccounts)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatMoney(item.avgBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                조회된 데이터가 없습니다.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
