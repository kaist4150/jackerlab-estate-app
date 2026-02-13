'use client';

import { useState, useEffect, useMemo } from 'react';
import { Building, Search, Calendar, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { SEOUL_DISTRICTS } from '@/lib/constants';
import { formatPrice } from '@/lib/format';
import TradeTab from '@/components/TradeTab';

interface SaleItem {
  id: string; name: string; district: string; dong: string; jibun: string;
  size: number; floor: number; price: number; date: string; built: number;
}

interface RentItem {
  id: string; name: string; district: string; dong: string; jibun: string;
  size: number; floor: number; deposit: number; monthlyRent: number;
  rentType: '전세' | '월세'; date: string; built: number;
}

export default function OfficetelTradePage() {
  const [data, setData] = useState<(SaleItem | RentItem)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tradeType, setTradeType] = useState<'sale' | 'rent'>('sale');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('강남구');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        district: selectedDistrict,
        year: selectedYear,
        month: selectedMonth,
        type: tradeType,
      });

      const response = await fetch(`/api/trade/officetel?${params}`);
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
  }, [selectedDistrict, selectedYear, selectedMonth, tradeType]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dong.includes(searchTerm)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortBy === 'price') {
        const aPrice = 'price' in a ? a.price : a.deposit;
        const bPrice = 'price' in b ? b.price : b.deposit;
        comparison = aPrice - bPrice;
      }
      else if (sortBy === 'size') comparison = a.size - b.size;
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [data, searchTerm, sortBy, sortOrder]);

  const handleSort = (field: 'date' | 'price' | 'size') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    const prices = filteredData.map(d => 'price' in d ? d.price : d.deposit);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { avg, max: Math.max(...prices), min: Math.min(...prices), count: filteredData.length };
  }, [filteredData]);

  const priceLabel = tradeType === 'rent' ? '보증금' : '거래가';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Building className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">오피스텔 실거래가</h1>
        </div>
        <p className="text-sm text-gray-500">국토교통부 실거래가 공개시스템 기준</p>
      </div>

      <div className="flex items-center gap-4">
        <TradeTab activeTab={tradeType} onTabChange={setTradeType} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {SEOUL_DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="오피스텔명, 동 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
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

      {!loading && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">조회 건수</div>
            <div className="text-xl font-bold text-gray-900">{stats.count}건</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">평균 {priceLabel}</div>
            <div className="text-xl font-bold text-emerald-600">{formatPrice(Math.round(stats.avg))}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">최고 {priceLabel}</div>
            <div className="text-xl font-bold text-red-500">{formatPrice(stats.max)}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">최저 {priceLabel}</div>
            <div className="text-xl font-bold text-blue-500">{formatPrice(stats.min)}</div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-4 py-3 font-semibold">오피스텔명</th>
                  <th className="px-4 py-3 font-semibold">위치</th>
                  <th className="px-4 py-3 font-semibold cursor-pointer hover:text-emerald-600" onClick={() => handleSort('size')}>
                    면적 {sortBy === 'size' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="px-4 py-3 font-semibold">층</th>
                  {tradeType === 'sale' ? (
                    <th className="px-4 py-3 font-semibold cursor-pointer hover:text-emerald-600 text-right" onClick={() => handleSort('price')}>
                      거래가 {sortBy === 'price' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                  ) : (
                    <>
                      <th className="px-4 py-3 font-semibold cursor-pointer hover:text-emerald-600 text-right" onClick={() => handleSort('price')}>
                        보증금 {sortBy === 'price' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="px-4 py-3 font-semibold text-right">월세</th>
                      <th className="px-4 py-3 font-semibold text-center">유형</th>
                    </>
                  )}
                  <th className="px-4 py-3 font-semibold cursor-pointer hover:text-emerald-600 text-right" onClick={() => handleSort('date')}>
                    계약일 {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.built}년 준공</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={14} />
                        {item.dong} {item.jibun}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.size.toFixed(2)}㎡</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.floor}층</td>
                    {tradeType === 'sale' && 'price' in item ? (
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-emerald-600">{formatPrice(item.price)}</span>
                      </td>
                    ) : 'deposit' in item ? (
                      <>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-emerald-600">{formatPrice(item.deposit)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium text-gray-700">
                            {item.monthlyRent > 0 ? formatPrice(item.monthlyRent) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.rentType === '전세' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {item.rentType}
                          </span>
                        </td>
                      </>
                    ) : null}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 text-sm text-gray-600">
                        <Calendar size={14} />
                        {item.date}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              {data.length === 0 ? '해당 기간 거래 내역이 없습니다.' : '검색 조건에 맞는 거래 내역이 없습니다.'}
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 실거래가 데이터는 국토교통부 실거래가 공개시스템에서 제공됩니다.</li>
          <li>• 실거래 신고 후 약 1~2주 후에 데이터가 공개됩니다.</li>
          <li>• 신고 후 취소된 거래는 포함되지 않을 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
