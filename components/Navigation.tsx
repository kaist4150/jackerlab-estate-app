'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Building2,
  TrendingUp,
  MapPin,
  Calculator,
  FileText,
  BarChart3,
  Landmark,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  {
    label: '홈',
    path: '/',
    icon: Home,
  },
  {
    label: '실거래가',
    icon: Building2,
    children: [
      { label: '아파트', path: '/trade/apartment' },
      { label: '오피스텔', path: '/trade/officetel' },
      { label: '연립다세대', path: '/trade/house' },
      { label: '단독/다가구', path: '/trade/detached' },
      { label: '토지', path: '/trade/land' },
      { label: '상업/업무용', path: '/trade/commercial' },
      { label: '공장/창고', path: '/trade/factory' },
    ],
  },
  {
    label: '시세/현황',
    icon: BarChart3,
    children: [
      { label: '지역별 시세', path: '/market/price' },
      { label: '매물 현황', path: '/market/listing' },
      { label: '거래량 추이', path: '/market/volume' },
    ],
  },
  {
    label: '가격 추이',
    icon: TrendingUp,
    children: [
      { label: '매매가 추이', path: '/trend/sale' },
      { label: '전세가 추이', path: '/trend/jeonse' },
      { label: '전세가율', path: '/trend/ratio' },
    ],
  },
  {
    label: '부동산 정보',
    icon: Landmark,
    children: [
      { label: '아파트 단지 검색', path: '/complex/search' },
      { label: '건물 통합 조회', path: '/building/info' },
    ],
  },
  {
    label: '지역 정보',
    icon: MapPin,
    children: [
      { label: '지역 비교', path: '/area/compare' },
      { label: '인구/세대', path: '/area/population' },
      { label: '학군 정보', path: '/area/school' },
    ],
  },
  {
    label: '청약 정보',
    icon: FileText,
    children: [
      { label: '청약 일정', path: '/subscription/schedule' },
      { label: '청약 경쟁률', path: '/subscription/competition' },
      { label: '청약통장 현황', path: '/subscription/account' },
    ],
  },
  {
    label: '계산기',
    icon: Calculator,
    children: [
      { label: '대출 계산기', path: '/calc/loan' },
      { label: '취득세 계산기', path: '/calc/acquisition-tax' },
      { label: '양도세 계산기', path: '/calc/transfer-tax' },
      { label: '중개 수수료', path: '/calc/commission' },
      { label: '전월세 전환', path: '/calc/conversion' },
    ],
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['실거래가', '시세/현황', '가격 추이', '부동산 정보', '지역 정보', '청약 정보', '계산기']);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => pathname === path;
  const isChildActive = (children?: { path: string }[]) =>
    children?.some((child) => pathname === child.path);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center px-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Link href="/" className="ml-3 flex items-center gap-2">
          <Building2 className="text-emerald-600" size={24} />
          <span className="font-bold text-gray-900">Estate</span>
        </Link>
      </header>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <Building2 className="text-emerald-600" size={28} />
              <span className="text-xl font-bold text-gray-900">Estate</span>
            </Link>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.includes(item.label);
                const active = item.path ? isActive(item.path) : isChildActive(item.children);

                return (
                  <li key={item.label}>
                    {hasChildren ? (
                      <>
                        <button
                          onClick={() => toggleExpanded(item.label)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="flex-1 text-left font-medium">{item.label}</span>
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                        {isExpanded && (
                          <ul className="mt-1 ml-4 space-y-1">
                            {item.children.map((child) => (
                              <li key={child.path}>
                                <Link
                                  href={child.path}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive(child.path)
                                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.path!}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          active
                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              &copy; 2025 JackerLab Estate
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
