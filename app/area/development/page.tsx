'use client';

import { useState, useMemo } from 'react';
import { Landmark, MapPin, Calendar, Search, CheckCircle2, Clock, Hammer } from 'lucide-react';

interface DevelopmentProject {
  id: string;
  name: string;
  district: string;
  category: '재개발' | '재건축' | 'GTX' | '신도시' | '교통' | '복합개발';
  status: '추진중' | '착공' | '완료예정' | '계획';
  description: string;
  expectedYear: string;
  scale: string;
}

const PROJECTS: DevelopmentProject[] = [
  {
    id: 'gtx-a', name: 'GTX-A 노선', district: '성남·동탄·삼성', category: 'GTX',
    status: '착공', description: '수서~동탄 구간 개통 완료. 삼성~킨텍스 구간 공사중',
    expectedYear: '2028', scale: '총연장 83.1km',
  },
  {
    id: 'gtx-b', name: 'GTX-B 노선', district: '송도·여의도·청량리', category: 'GTX',
    status: '추진중', description: '송도~마석 구간. 여의도·서울역·청량리 경유',
    expectedYear: '2030', scale: '총연장 80.1km',
  },
  {
    id: 'gtx-c', name: 'GTX-C 노선', district: '양주·삼성·수원', category: 'GTX',
    status: '착공', description: '덕정~수원 구간. 삼성역 환승',
    expectedYear: '2030', scale: '총연장 74.8km',
  },
  {
    id: 'yeongdeungpo', name: '영등포 쪽방촌 정비', district: '영등포구', category: '복합개발',
    status: '추진중', description: '영등포역 일대 쪽방촌을 주거·상업 복합단지로 개발',
    expectedYear: '2029', scale: '약 3만㎡ 부지',
  },
  {
    id: 'yongsan', name: '용산 정비창 개발', district: '용산구', category: '복합개발',
    status: '계획', description: '용산 정비창 부지 국제업무지구 조성. 랜드마크 복합단지',
    expectedYear: '2030이후', scale: '약 49만㎡',
  },
  {
    id: 'jamsil-mice', name: '잠실 MICE 복합단지', district: '송파구', category: '복합개발',
    status: '추진중', description: '잠실 스포츠·MICE 복합단지 조성. 제2롯데월드 인근',
    expectedYear: '2029', scale: '전시·컨벤션·호텔·업무',
  },
  {
    id: 'gangnam-hyundai', name: '삼성동 현대차 GBC', district: '강남구', category: '복합개발',
    status: '착공', description: '현대자동차 글로벌비즈니스센터. 105층 랜드마크',
    expectedYear: '2028', scale: '연면적 약 91만㎡',
  },
  {
    id: 'dongbuichon', name: '동부이촌동 재건축', district: '용산구', category: '재건축',
    status: '추진중', description: '한강맨션·왕궁·삼익아파트 등 재건축 추진',
    expectedYear: '2030이후', scale: '약 5,000세대',
  },
  {
    id: 'eunma', name: '은마아파트 재건축', district: '강남구', category: '재건축',
    status: '추진중', description: '대치동 은마아파트 재건축. 49층 규모 계획',
    expectedYear: '2030이후', scale: '약 4,424세대 → 5,808세대',
  },
  {
    id: 'apgujeong', name: '압구정 현대아파트 재건축', district: '강남구', category: '재건축',
    status: '추진중', description: '압구정 현대 1~14차 재건축 추진. 최고 50층',
    expectedYear: '2030이후', scale: '약 5,930세대',
  },
  {
    id: 'yeouido-sibum', name: '여의도 시범아파트 재건축', district: '영등포구', category: '재건축',
    status: '추진중', description: '여의도 시범아파트 재건축. 한강 조망 프리미엄',
    expectedYear: '2029', scale: '약 1,584세대',
  },
  {
    id: 'sadang-redevelop', name: '사당역 일대 재개발', district: '동작구', category: '재개발',
    status: '추진중', description: '사당1구역 등 역세권 재개발. 2·4호선 환승역',
    expectedYear: '2028', scale: '약 3,500세대',
  },
  {
    id: 'wirye', name: '위례신도시 추가분양', district: '송파·성남', category: '신도시',
    status: '착공', description: '위례신도시 잔여 택지 분양 및 트램 착공',
    expectedYear: '2027', scale: '위례선 트램 포함',
  },
  {
    id: 'magok', name: '마곡 MICE 복합단지', district: '강서구', category: '복합개발',
    status: '추진중', description: '마곡지구 내 전시·컨벤션 시설 조성',
    expectedYear: '2028', scale: '전시장·호텔·업무시설',
  },
  {
    id: 'sillim-line', name: '신림선 연장', district: '관악·서초', category: '교통',
    status: '계획', description: '신림선 서울대~서초 방면 연장 검토',
    expectedYear: '2030이후', scale: '경전철 연장',
  },
  {
    id: 'dongjak-line9', name: '9호선 4단계 연장', district: '강동·하남', category: '교통',
    status: '착공', description: '보훈병원~고덕·미사 연장. 강동구 수혜',
    expectedYear: '2028', scale: '약 5.3km, 3개역',
  },
];

const CATEGORIES = ['전체', '재개발', '재건축', 'GTX', '신도시', '교통', '복합개발'] as const;
const STATUSES = ['전체', '계획', '추진중', '착공', '완료예정'] as const;

export default function DevelopmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedStatus, setSelectedStatus] = useState<string>('전체');

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter(p => {
      if (searchTerm && !p.name.includes(searchTerm) && !p.district.includes(searchTerm) && !p.description.includes(searchTerm)) {
        return false;
      }
      if (selectedCategory !== '전체' && p.category !== selectedCategory) return false;
      if (selectedStatus !== '전체' && p.status !== selectedStatus) return false;
      return true;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  const stats = useMemo(() => ({
    total: PROJECTS.length,
    construction: PROJECTS.filter(p => p.status === '착공').length,
    inProgress: PROJECTS.filter(p => p.status === '추진중').length,
    planned: PROJECTS.filter(p => p.status === '계획').length,
  }), []);

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      '착공': 'bg-green-100 text-green-700',
      '추진중': 'bg-yellow-100 text-yellow-700',
      '완료예정': 'bg-blue-100 text-blue-700',
      '계획': 'bg-gray-100 text-gray-600',
    };
    const icons: Record<string, React.ReactNode> = {
      '착공': <Hammer size={12} />,
      '추진중': <Clock size={12} />,
      '완료예정': <CheckCircle2 size={12} />,
      '계획': <Clock size={12} />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const CategoryBadge = ({ category }: { category: string }) => {
    const styles: Record<string, string> = {
      '재개발': 'bg-orange-100 text-orange-700',
      '재건축': 'bg-red-100 text-red-700',
      'GTX': 'bg-purple-100 text-purple-700',
      '신도시': 'bg-emerald-100 text-emerald-700',
      '교통': 'bg-cyan-100 text-cyan-700',
      '복합개발': 'bg-indigo-100 text-indigo-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[category] || 'bg-gray-100 text-gray-600'}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Landmark className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">개발 호재</h1>
        </div>
        <p className="text-sm text-gray-500">서울 및 수도권 주요 개발사업 현황</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="프로젝트명, 지역 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === '전체' ? '전체 유형' : c}</option>
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
          <div className="text-sm text-gray-500 mb-1">전체 사업</div>
          <div className="text-xl font-bold text-gray-900">{stats.total}건</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">착공</div>
          <div className="text-xl font-bold text-green-600">{stats.construction}건</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">추진중</div>
          <div className="text-xl font-bold text-yellow-600">{stats.inProgress}건</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">계획 단계</div>
          <div className="text-xl font-bold text-gray-500">{stats.planned}건</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{project.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin size={14} />
                  {project.district}
                </div>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CategoryBadge category={project.category} />
                <span className="text-xs text-gray-400">{project.scale}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar size={14} />
                {project.expectedYear}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Landmark size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">검색 조건에 맞는 개발사업이 없습니다.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 개발사업 정보는 공공 발표 자료를 기반으로 정리한 것입니다.</li>
          <li>• 사업 일정 및 규모는 변경될 수 있으며, 투자 참고 자료로만 활용하세요.</li>
          <li>• 정확한 사업 진행 현황은 해당 지자체 및 사업 시행자를 통해 확인하세요.</li>
        </ul>
      </div>
    </div>
  );
}
