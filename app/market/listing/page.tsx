'use client';

import { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Loader2, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SEOUL_DISTRICTS } from '@/lib/constants';
import { formatPrice } from '@/lib/format';

interface DistrictSummary {
  district: string;
  aptCount: number;
  aptAvgPrice: number;
  officetelCount: number;
  officetelAvgPrice: number;
  houseCount: number;
  houseAvgPrice: number;
  totalCount: number;
}

export default function MarketListingPage() {
  const [data, setData] = useState<DistrictSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [sortBy, setSortBy] = useState<'totalCount' | 'aptAvgPrice' | 'district'>('totalCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const targetDistricts = ['강남구', '서초구', '송파구', '마포구', '용산구', '강동구', '영등포구', '성동구'];

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        targetDistricts.map(async (district) => {
          const params = new URLSearchParams({
            district,
            year: selectedYear,
            month: selectedMonth,
          });

          const [aptRes, officetelRes, houseRes] = await Promise.all([
            fetch(`/api/trade/apartment?${params}`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch(`/api/trade/officetel?${params}`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
            fetch(`/api/trade/house?${params}`).then(r => r.json()).catch(() => ({ success: false, data: [] })),
          ]);

          const aptData = aptRes.success ? aptRes.data : [];
          const officetelData = officetelRes.success ? officetelRes.data : [];
          const houseData = houseRes.success ? houseRes.data : [];

          const avgPrice = (items: any[]) => {
            if (items.length === 0) return 0;
            return Math.round(items.reduce((sum: number, item: any) => sum + (item.price || 0), 0) / items.length);
          };

          return {
            district,
            aptCount: aptData.length,
            aptAvgPrice: avgPrice(aptData),
            officetelCount: officetelData.length,
            officetelAvgPrice: avgPrice(officetelData),
            houseCount: houseData.length,
            houseAvgPrice: avgPrice(houseData),
            totalCount: aptData.length + officetelData.length + houseData.length,
          };
        })
      );

      setData(results);
    } catch {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'district') comparison = a.district.localeCompare(b.district);
      else if (sortBy === 'totalCount') comparison = a.totalCount - b.totalCount;
      else if (sortBy === 'aptAvgPrice') comparison = a.aptAvgPrice - b.aptAvgPrice;
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [data, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const totalStats = useMemo(() => {
    if (data.length === 0) return null;
    const totalApt = data.reduce((sum, d) => sum + d.aptCount, 0);
    const totalOfficetel = data.reduce((sum, d) => sum + d.officetelCount, 0);
    const totalHouse = data.reduce((sum, d) => sum + d.houseCount, 0);
    return {
      total: totalApt + totalOfficetel + totalHouse,
      apt: totalApt,
      officetel: totalOfficetel,
      house: totalHouse,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">매물 현황</h1>
        </div>
        <p className="text-sm text-gray-500">서울 주요 구별 부동산 거래 현황을 한눈에 확인합니다</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}월</option>
            ))}
          </select>
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
          <span className="ml-3 text-gray-600">주요 구별 거래 데이터를 수집하는 중...</span>
        </div>
      )}

      {!loading && totalStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">총 거래 건수</div>
            <div className="text-xl font-bold text-gray-900">{totalStats.total.toLocaleString()}건</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">아파트</div>
            <div className="text-xl font-bold text-emerald-600">{totalStats.apt.toLocaleString()}건</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">오피스텔</div>
            <div className="text-xl font-bold text-blue-600">{totalStats.officetel.toLocaleString()}건</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">연립다세대</div>
            <div className="text-xl font-bold text-purple-600">{totalStats.house.toLocaleString()}건</div>
          </div>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
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
                  <th className="px-4 py-3 font-semibold text-right">아파트</th>
                  <th className="px-4 py-3 font-semibold text-right">아파트 평균가</th>
                  <th className="px-4 py-3 font-semibold text-right">오피스텔</th>
                  <th className="px-4 py-3 font-semibold text-right">연립다세대</th>
                  <th
                    className="px-4 py-3 font-semibold text-right cursor-pointer hover:text-emerald-600"
                    onClick={() => handleSort('totalCount')}
                  >
                    합계 {sortBy === 'totalCount' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedData.map((item) => (
                  <tr key={item.district} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.district}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">{item.aptCount}건</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <span className="font-semibold text-emerald-600">
                        {item.aptAvgPrice > 0 ? formatPrice(item.aptAvgPrice) : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">{item.officetelCount}건</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">{item.houseCount}건</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-gray-900">{item.totalCount}건</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 서울 주요 8개 구의 아파트, 오피스텔, 연립다세대 거래 건수를 집계합니다.</li>
          <li>• 실거래 신고 데이터 기준으로, 실제 매물 수와 다를 수 있습니다.</li>
          <li>• 평균가는 해당 월 매매 거래가의 평균입니다.</li>
        </ul>
      </div>
    </div>
  );
}
