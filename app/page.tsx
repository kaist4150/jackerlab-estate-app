'use client';

import Link from 'next/link';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calculator,
  FileText,
  ArrowRight,
  BarChart3,
  Home,
  Percent,
} from 'lucide-react';

// 샘플 데이터 - 실제로는 API에서 가져옴
const marketSummary = {
  seoulAptPrice: 12.5, // 억원
  seoulAptChange: 0.12, // 전주 대비 %
  nationAptPrice: 5.8,
  nationAptChange: -0.05,
  jeonseRate: 62.3, // 전세가율 %
  jeonseRateChange: -0.8,
  transactionCount: 4523, // 이번 달 거래량
  transactionChange: 15.2, // 전월 대비 %
};

const recentTransactions = [
  { name: '래미안 원베일리', area: '서초구', size: '84㎡', price: '35억 2,000만', date: '2025.02.03' },
  { name: '아크로리버파크', area: '반포동', size: '112㎡', price: '52억', date: '2025.02.02' },
  { name: '잠실엘스', area: '송파구', size: '59㎡', price: '19억 5,000만', date: '2025.02.01' },
  { name: '은마아파트', area: '대치동', size: '76㎡', price: '25억 3,000만', date: '2025.02.01' },
  { name: '파크리오', area: '잠실동', size: '84㎡', price: '23억 8,000만', date: '2025.01.31' },
];

const hotAreas = [
  { name: '강남구', change: 0.35, avgPrice: 18.2 },
  { name: '서초구', change: 0.28, avgPrice: 16.8 },
  { name: '송파구', change: 0.22, avgPrice: 14.5 },
  { name: '용산구', change: 0.18, avgPrice: 15.3 },
  { name: '마포구', change: 0.15, avgPrice: 11.2 },
];

const upcomingSubscriptions = [
  { name: '래미안 원페를라', location: '서울 서초구', date: '2025.02.15', units: 2990 },
  { name: '힐스테이트 둔촌', location: '서울 강동구', date: '2025.02.20', units: 1865 },
  { name: '디에이치 퍼스티어', location: '경기 성남시', date: '2025.02.25', units: 1420 },
];

const quickLinks = [
  { label: '아파트 실거래가', path: '/trade/apartment', icon: Building2, color: 'bg-blue-500' },
  { label: '가격 추이', path: '/trend/sale', icon: TrendingUp, color: 'bg-emerald-500' },
  { label: '청약 일정', path: '/subscription/schedule', icon: FileText, color: 'bg-purple-500' },
  { label: '대출 계산기', path: '/calc/loan', icon: Calculator, color: 'bg-orange-500' },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">부동산 대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">실시간 부동산 시장 현황</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              href={link.path}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className={`${link.color} p-2.5 rounded-lg`}>
                <Icon className="text-white" size={20} />
              </div>
              <span className="font-medium text-gray-900">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Market Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Building2 size={16} />
            <span>서울 아파트 평균</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{marketSummary.seoulAptPrice}억</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${marketSummary.seoulAptChange >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
            {marketSummary.seoulAptChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{marketSummary.seoulAptChange >= 0 ? '+' : ''}{marketSummary.seoulAptChange}%</span>
            <span className="text-gray-400">전주 대비</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Home size={16} />
            <span>전국 아파트 평균</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{marketSummary.nationAptPrice}억</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${marketSummary.nationAptChange >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
            {marketSummary.nationAptChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{marketSummary.nationAptChange >= 0 ? '+' : ''}{marketSummary.nationAptChange}%</span>
            <span className="text-gray-400">전주 대비</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Percent size={16} />
            <span>서울 전세가율</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{marketSummary.jeonseRate}%</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${marketSummary.jeonseRateChange >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
            {marketSummary.jeonseRateChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{marketSummary.jeonseRateChange >= 0 ? '+' : ''}{marketSummary.jeonseRateChange}%p</span>
            <span className="text-gray-400">전월 대비</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <BarChart3 size={16} />
            <span>이번 달 거래량</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{marketSummary.transactionCount.toLocaleString()}건</div>
          <div className={`flex items-center gap-1 text-sm mt-1 ${marketSummary.transactionChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {marketSummary.transactionChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{marketSummary.transactionChange >= 0 ? '+' : ''}{marketSummary.transactionChange}%</span>
            <span className="text-gray-400">전월 대비</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">최근 실거래</h2>
            <Link href="/trade/apartment" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              더보기 <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">아파트</th>
                  <th className="pb-3 font-medium">위치</th>
                  <th className="pb-3 font-medium">면적</th>
                  <th className="pb-3 font-medium text-right">거래가</th>
                  <th className="pb-3 font-medium text-right">날짜</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-medium text-gray-900">{tx.name}</td>
                    <td className="py-3 text-gray-600">{tx.area}</td>
                    <td className="py-3 text-gray-600">{tx.size}</td>
                    <td className="py-3 text-right font-semibold text-emerald-600">{tx.price}</td>
                    <td className="py-3 text-right text-gray-500">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hot Areas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">상승률 TOP 5</h2>
            <span className="text-xs text-gray-500">전주 대비</span>
          </div>
          <div className="space-y-3">
            {hotAreas.map((area, idx) => (
              <div key={area.name} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                  idx === 1 ? 'bg-gray-100 text-gray-600' :
                  idx === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{area.name}</span>
                    <span className="text-red-500 font-semibold">+{area.change}%</span>
                  </div>
                  <div className="text-xs text-gray-500">평균 {area.avgPrice}억</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Subscriptions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">다가오는 청약</h2>
          <Link href="/subscription/schedule" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            전체 일정 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingSubscriptions.map((sub) => (
            <div key={sub.name} className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-1">{sub.name}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                <MapPin size={14} />
                {sub.location}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600 font-medium">{sub.date}</span>
                <span className="text-gray-500">{sub.units.toLocaleString()}세대</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <h3 className="font-semibold text-emerald-900 mb-2">데이터 안내</h3>
        <p className="text-sm text-emerald-800">
          부동산 실거래가 데이터는 국토교통부 실거래가 공개시스템을 기반으로 제공됩니다.
          시세 및 통계 데이터는 참고용이며, 실제 거래 시 반드시 공인중개사와 상담하시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
