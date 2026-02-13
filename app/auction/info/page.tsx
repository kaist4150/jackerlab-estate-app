'use client';

import { useState, useMemo } from 'react';
import { Gavel, MapPin, Calendar, Search, ExternalLink, TrendingDown, Building2, Home } from 'lucide-react';

interface AuctionItem {
  id: string;
  caseNo: string;
  court: string;
  propertyType: '아파트' | '다세대' | '오피스텔' | '상가' | '토지' | '단독주택';
  address: string;
  district: string;
  appraisalPrice: number;
  minimumPrice: number;
  bidRate: number;
  auctionDate: string;
  status: '진행중' | '낙찰' | '유찰' | '취소';
  bidCount: number;
  area: number;
  floor?: string;
  note: string;
}

const AUCTION_DATA: AuctionItem[] = [
  {
    id: 'a1', caseNo: '2025타경12345', court: '서울중앙지방법원', propertyType: '아파트',
    address: '서울특별시 강남구 대치동 은마아파트', district: '강남구',
    appraisalPrice: 280000, minimumPrice: 224000, bidRate: 80,
    auctionDate: '2026-02-20', status: '진행중', bidCount: 0, area: 76.79, floor: '8층',
    note: '1회 유찰, 감정가 대비 80%',
  },
  {
    id: 'a2', caseNo: '2025타경11234', court: '서울중앙지방법원', propertyType: '아파트',
    address: '서울특별시 송파구 잠실동 리센츠', district: '송파구',
    appraisalPrice: 320000, minimumPrice: 320000, bidRate: 100,
    auctionDate: '2026-02-18', status: '진행중', bidCount: 0, area: 84.97, floor: '15층',
    note: '신건, 감정가 그대로',
  },
  {
    id: 'a3', caseNo: '2025타경10987', court: '서울중앙지방법원', propertyType: '오피스텔',
    address: '서울특별시 마포구 상암동 상암디지털큐브', district: '마포구',
    appraisalPrice: 35000, minimumPrice: 22400, bidRate: 64,
    auctionDate: '2026-02-15', status: '진행중', bidCount: 0, area: 33.5,
    note: '2회 유찰, 투자 관심 물건',
  },
  {
    id: 'a4', caseNo: '2025타경09876', court: '서울남부지방법원', propertyType: '상가',
    address: '서울특별시 영등포구 여의도동 상가', district: '영등포구',
    appraisalPrice: 85000, minimumPrice: 54400, bidRate: 64,
    auctionDate: '2026-02-13', status: '진행중', bidCount: 0, area: 45.2,
    note: '2회 유찰, 역세권 상가',
  },
  {
    id: 'a5', caseNo: '2025타경08765', court: '수원지방법원', propertyType: '아파트',
    address: '경기도 수원시 영통구 매탄동 래미안', district: '영통구',
    appraisalPrice: 95000, minimumPrice: 76000, bidRate: 80,
    auctionDate: '2026-02-25', status: '진행중', bidCount: 0, area: 59.96, floor: '12층',
    note: '1회 유찰, 역세권',
  },
  {
    id: 'a6', caseNo: '2025타경07654', court: '서울중앙지방법원', propertyType: '다세대',
    address: '서울특별시 관악구 봉천동 빌라', district: '관악구',
    appraisalPrice: 28000, minimumPrice: 17920, bidRate: 64,
    auctionDate: '2026-02-10', status: '낙찰', bidCount: 5, area: 42.3, floor: '3층',
    note: '2회 유찰 후 낙찰, 낙찰가 2억 1,000만',
  },
  {
    id: 'a7', caseNo: '2025타경06543', court: '인천지방법원', propertyType: '아파트',
    address: '인천광역시 연수구 송도동 더샵', district: '연수구',
    appraisalPrice: 78000, minimumPrice: 62400, bidRate: 80,
    auctionDate: '2026-03-05', status: '진행중', bidCount: 0, area: 84.99, floor: '22층',
    note: '1회 유찰, 송도 신도시',
  },
  {
    id: 'a8', caseNo: '2025타경05432', court: '서울동부지방법원', propertyType: '단독주택',
    address: '서울특별시 성북구 성북동 단독주택', district: '성북구',
    appraisalPrice: 150000, minimumPrice: 96000, bidRate: 64,
    auctionDate: '2026-02-28', status: '진행중', bidCount: 0, area: 198.5,
    note: '2회 유찰, 대지 120㎡',
  },
  {
    id: 'a9', caseNo: '2025타경04321', court: '서울중앙지방법원', propertyType: '토지',
    address: '경기도 용인시 처인구 양지면 토지', district: '처인구',
    appraisalPrice: 42000, minimumPrice: 26880, bidRate: 64,
    auctionDate: '2026-03-10', status: '진행중', bidCount: 0, area: 330,
    note: '2회 유찰, 계획관리지역',
  },
  {
    id: 'a10', caseNo: '2024타경99876', court: '서울서부지방법원', propertyType: '아파트',
    address: '서울특별시 은평구 응암동 녹번역 e편한세상', district: '은평구',
    appraisalPrice: 82000, minimumPrice: 65600, bidRate: 80,
    auctionDate: '2026-01-28', status: '유찰', bidCount: 0, area: 59.99, floor: '5층',
    note: '1회 유찰, 다음 경매 예정',
  },
];

const PROPERTY_TYPES = ['전체', '아파트', '다세대', '오피스텔', '상가', '토지', '단독주택'] as const;
const STATUSES = ['전체', '진행중', '낙찰', '유찰'] as const;

function formatPrice(price: number): string {
  if (price >= 10000) {
    const eok = Math.floor(price / 10000);
    const man = price % 10000;
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만` : `${eok}억`;
  }
  return `${price.toLocaleString()}만`;
}

export default function AuctionInfoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('전체');
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');

  const filtered = useMemo(() => {
    return AUCTION_DATA.filter(item => {
      if (searchTerm && !item.address.includes(searchTerm) && !item.caseNo.includes(searchTerm)) return false;
      if (selectedType !== '전체' && item.propertyType !== selectedType) return false;
      if (selectedStatus !== '전체' && item.status !== selectedStatus) return false;
      return true;
    });
  }, [searchTerm, selectedType, selectedStatus]);

  const stats = useMemo(() => ({
    total: AUCTION_DATA.length,
    active: AUCTION_DATA.filter(i => i.status === '진행중').length,
    sold: AUCTION_DATA.filter(i => i.status === '낙찰').length,
    failed: AUCTION_DATA.filter(i => i.status === '유찰').length,
  }), []);

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      '진행중': 'bg-green-100 text-green-700',
      '낙찰': 'bg-blue-100 text-blue-700',
      '유찰': 'bg-yellow-100 text-yellow-700',
      '취소': 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === '아파트' || type === '오피스텔') return <Building2 size={14} className="text-gray-400" />;
    if (type === '단독주택' || type === '다세대') return <Home size={14} className="text-gray-400" />;
    return <MapPin size={14} className="text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Gavel className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">경매 정보</h1>
        </div>
        <p className="text-sm text-gray-500">부동산 경매 물건 정보 (샘플 데이터)</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="주소, 사건번호 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {PROPERTY_TYPES.map(t => (
              <option key={t} value={t}>{t === '전체' ? '전체 유형' : t}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s === '전체' ? '전체 상태' : s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">전체 물건</div>
          <div className="text-xl font-bold text-gray-900">{stats.total}건</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">진행중</div>
          <div className="text-xl font-bold text-green-600">{stats.active}건</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">낙찰</div>
          <div className="text-xl font-bold text-blue-600">{stats.sold}건</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">유찰</div>
          <div className="text-xl font-bold text-yellow-600">{stats.failed}건</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400 font-mono">{item.caseNo}</span>
                  <StatusBadge status={item.status} />
                </div>
                <h3 className="font-bold text-gray-900">{item.address}</h3>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-3">
              <div className="flex items-center gap-2">
                <TypeIcon type={item.propertyType} />
                <span className="text-gray-600">{item.propertyType}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">{item.area}㎡</span>
                {item.floor && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-600">{item.floor}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-600">경매일: {item.auctionDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">감정가</div>
                <div className="text-sm font-semibold text-gray-900">{formatPrice(item.appraisalPrice)}</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="flex items-center gap-1 text-xs text-emerald-600 mb-1">
                  <TrendingDown size={12} />
                  최저가 ({item.bidRate}%)
                </div>
                <div className="text-sm font-bold text-emerald-700">{formatPrice(item.minimumPrice)}</div>
              </div>
            </div>

            {item.note && (
              <p className="text-xs text-gray-400 mt-3">{item.note}</p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Gavel size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">검색 조건에 맞는 경매 물건이 없습니다.</p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ExternalLink className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">실제 경매 정보 확인</h3>
            <p className="text-sm text-amber-800 mb-2">
              위 데이터는 샘플입니다. 실제 경매 물건은 대법원 경매정보 사이트에서 확인하세요.
            </p>
            <a
              href="https://www.courtauction.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-900 underline"
            >
              대법원 경매정보 바로가기
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">경매 용어 안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>감정가</strong>: 법원이 감정인을 통해 평가한 부동산 시세</li>
          <li>• <strong>최저가</strong>: 입찰 가능한 최소 금액 (유찰 시 20~30% 하락)</li>
          <li>• <strong>유찰</strong>: 입찰자가 없거나 최저가 미만으로 경매 불성립</li>
          <li>• <strong>낙찰</strong>: 최고가 입찰자에게 매각 결정</li>
        </ul>
      </div>
    </div>
  );
}
