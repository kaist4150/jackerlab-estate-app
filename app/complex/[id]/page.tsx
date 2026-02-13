'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building, MapPin, Users, Calendar, ArrowLeft, Loader2, AlertCircle,
  TrendingUp, TrendingDown, BarChart3,
} from 'lucide-react';
import { formatPrice } from '@/lib/format';

interface TradeItem {
  id: string;
  name: string;
  dong: string;
  size: number;
  floor: number;
  price: number;
  date: string;
  built: number;
}

interface RentItem {
  id: string;
  name: string;
  dong: string;
  size: number;
  floor: number;
  deposit: number;
  monthlyRent: number;
  rentType: string;
  date: string;
  built: number;
}

// 주소에서 구 이름 추출 (예: "서울특별시 강남구 역삼동 123" → "강남구")
function extractDistrict(address: string): string | null {
  const match = address.match(/([가-힣]+구)/);
  return match ? match[1] : null;
}

export default function ComplexDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const complexId = params.id as string;
  const name = searchParams.get('name') || '';
  const address = searchParams.get('address') || '';
  const units = parseInt(searchParams.get('units') || '0');
  const buildings = parseInt(searchParams.get('buildings') || '0');
  const built = parseInt(searchParams.get('built') || '0');

  const district = extractDistrict(address);

  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [rents, setRents] = useState<RentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sale' | 'rent'>('sale');

  useEffect(() => {
    if (!district || !name) return;

    const fetchTrades = async () => {
      setLoading(true);
      setError(null);

      try {
        const now = new Date();
        const months: { year: string; month: string }[] = [];
        for (let i = 0; i < 3; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push({
            year: d.getFullYear().toString(),
            month: String(d.getMonth() + 1).padStart(2, '0'),
          });
        }

        const [saleResults, rentResults] = await Promise.all([
          Promise.all(months.map(({ year, month }) =>
            fetch(`/api/trade/apartment?district=${encodeURIComponent(district)}&year=${year}&month=${month}&type=sale`)
              .then(r => r.json()).catch(() => ({ success: false, data: [] }))
          )),
          Promise.all(months.map(({ year, month }) =>
            fetch(`/api/trade/apartment?district=${encodeURIComponent(district)}&year=${year}&month=${month}&type=rent`)
              .then(r => r.json()).catch(() => ({ success: false, data: [] }))
          )),
        ]);

        const allSales = saleResults
          .filter(r => r.success)
          .flatMap(r => r.data)
          .filter((item: TradeItem) => item.name === name)
          .sort((a: TradeItem, b: TradeItem) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const allRents = rentResults
          .filter(r => r.success)
          .flatMap(r => r.data)
          .filter((item: RentItem) => item.name === name)
          .sort((a: RentItem, b: RentItem) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setTrades(allSales);
        setRents(allRents);
      } catch {
        setError('거래 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [district, name]);

  const saleStats = useMemo(() => {
    if (trades.length === 0) return null;
    const prices = trades.map(t => t.price);
    return {
      count: trades.length,
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      max: Math.max(...prices),
      min: Math.min(...prices),
    };
  }, [trades]);

  const rentStats = useMemo(() => {
    if (rents.length === 0) return null;
    const jeonse = rents.filter(r => r.rentType === '전세');
    const wolse = rents.filter(r => r.rentType === '월세');
    const avgDeposit = jeonse.length > 0
      ? Math.round(jeonse.reduce((a, b) => a + b.deposit, 0) / jeonse.length)
      : 0;
    return {
      total: rents.length,
      jeonseCount: jeonse.length,
      wolseCount: wolse.length,
      avgDeposit,
    };
  }, [rents]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/complex/search"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          단지 목록으로
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Building className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">{name || '단지 상세'}</h1>
        </div>
        {address && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} />
            {address}
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Users size={14} />
            총 세대수
          </div>
          <div className="text-xl font-bold text-gray-900">{units > 0 ? `${units.toLocaleString()}세대` : '-'}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Building size={14} />
            총 동수
          </div>
          <div className="text-xl font-bold text-gray-900">{buildings > 0 ? `${buildings}개동` : '-'}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Calendar size={14} />
            준공년도
          </div>
          <div className="text-xl font-bold text-gray-900">{built > 0 ? `${built}년` : '-'}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <MapPin size={14} />
            소재지
          </div>
          <div className="text-xl font-bold text-gray-900">{district || '-'}</div>
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('sale')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'sale'
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          매매 ({trades.length}건)
        </button>
        <button
          onClick={() => setActiveTab('rent')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'rent'
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          전월세 ({rents.length}건)
        </button>
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
          <span className="ml-3 text-gray-600">최근 3개월 거래 데이터를 조회하는 중...</span>
        </div>
      )}

      {/* Sale Tab */}
      {!loading && activeTab === 'sale' && (
        <>
          {saleStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">거래 건수</div>
                <div className="text-xl font-bold text-gray-900">{saleStats.count}건</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">평균 거래가</div>
                <div className="text-xl font-bold text-emerald-600">{formatPrice(saleStats.avg)}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                  <TrendingUp size={14} className="text-red-400" />
                  최고가
                </div>
                <div className="text-xl font-bold text-red-500">{formatPrice(saleStats.max)}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                  <TrendingDown size={14} className="text-blue-400" />
                  최저가
                </div>
                <div className="text-xl font-bold text-blue-500">{formatPrice(saleStats.min)}</div>
              </div>
            </div>
          )}

          {trades.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="px-4 py-3 font-semibold">계약일</th>
                      <th className="px-4 py-3 font-semibold text-right">전용면적</th>
                      <th className="px-4 py-3 font-semibold text-right">층</th>
                      <th className="px-4 py-3 font-semibold text-right">거래가</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {trades.map((item, idx) => (
                      <tr key={`${item.id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">{item.size}㎡</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">{item.floor}층</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-emerald-600">{formatPrice(item.price)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <BarChart3 size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">최근 3개월 매매 거래 내역이 없습니다.</p>
            </div>
          )}
        </>
      )}

      {/* Rent Tab */}
      {!loading && activeTab === 'rent' && (
        <>
          {rentStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">총 거래</div>
                <div className="text-xl font-bold text-gray-900">{rentStats.total}건</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">전세</div>
                <div className="text-xl font-bold text-blue-600">{rentStats.jeonseCount}건</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-1">월세</div>
                <div className="text-xl font-bold text-purple-600">{rentStats.wolseCount}건</div>
              </div>
              {rentStats.avgDeposit > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-sm text-gray-500 mb-1">평균 전세가</div>
                  <div className="text-xl font-bold text-emerald-600">{formatPrice(rentStats.avgDeposit)}</div>
                </div>
              )}
            </div>
          )}

          {rents.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm text-gray-600">
                      <th className="px-4 py-3 font-semibold">계약일</th>
                      <th className="px-4 py-3 font-semibold text-right">전용면적</th>
                      <th className="px-4 py-3 font-semibold text-right">층</th>
                      <th className="px-4 py-3 font-semibold text-right">보증금</th>
                      <th className="px-4 py-3 font-semibold text-right">월세</th>
                      <th className="px-4 py-3 font-semibold text-center">유형</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rents.map((item, idx) => (
                      <tr key={`${item.id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">{item.size}㎡</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">{item.floor}층</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-emerald-600">{formatPrice(item.deposit)}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">
                          {item.monthlyRent > 0 ? `${item.monthlyRent.toLocaleString()}만` : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.rentType === '전세' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {item.rentType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <BarChart3 size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">최근 3개월 전월세 거래 내역이 없습니다.</p>
            </div>
          )}
        </>
      )}

      {!district && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            주소에서 구 정보를 추출할 수 없어 거래 내역을 조회할 수 없습니다.
            서울시 소재 단지만 거래 이력을 지원합니다.
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 최근 3개월간의 실거래 신고 데이터를 기반으로 합니다.</li>
          <li>• 동일 단지명으로 필터링하므로, 일부 데이터가 누락될 수 있습니다.</li>
          <li>• 서울시 소재 단지만 거래 이력 조회가 가능합니다.</li>
        </ul>
      </div>
    </div>
  );
}
