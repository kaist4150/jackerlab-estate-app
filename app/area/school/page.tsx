'use client';

import { useState, useMemo } from 'react';
import { GraduationCap, Search, MapPin, Users, BookOpen } from 'lucide-react';

interface SchoolData {
  district: string;
  elementary: number;
  middle: number;
  high: number;
  totalStudents: number;
  avgStudentsPerClass: number;
  specialHighSchools: string[];
  topMiddleSchools: string[];
  note: string;
}

const SCHOOL_DATA: SchoolData[] = [
  {
    district: '강남구', elementary: 33, middle: 20, high: 16, totalStudents: 52800,
    avgStudentsPerClass: 26, specialHighSchools: ['휘문고', '중동고', '숙명여고', '진선여고'],
    topMiddleSchools: ['대청중', '대치중', '역삼중', '도곡중'],
    note: '대치동 학원가 중심, 전국 최고 학군',
  },
  {
    district: '서초구', elementary: 23, middle: 14, high: 11, totalStudents: 38500,
    avgStudentsPerClass: 25, specialHighSchools: ['서울고', '세화고', '세화여고', '상문고'],
    topMiddleSchools: ['서초중', '반포중', '잠원중', '원촌중'],
    note: '반포·서초동 학군, 강남 학군과 함께 양대 학군',
  },
  {
    district: '송파구', elementary: 30, middle: 16, high: 13, totalStudents: 46200,
    avgStudentsPerClass: 27, specialHighSchools: ['보인고', '잠실고', '잠신고', '방산고'],
    topMiddleSchools: ['잠실중', '신천중', '오금중', '가락중'],
    note: '잠실·문정 학군, 학원가 성장세',
  },
  {
    district: '양천구', elementary: 22, middle: 12, high: 10, totalStudents: 35800,
    avgStudentsPerClass: 28, specialHighSchools: ['목동고', '영훈고', '양정고', '진명여고'],
    topMiddleSchools: ['목운중', '목일중', '신목중', '월촌중'],
    note: '목동 학원가, 서울 서남부 최대 학군',
  },
  {
    district: '노원구', elementary: 28, middle: 16, high: 14, totalStudents: 41200,
    avgStudentsPerClass: 27, specialHighSchools: ['대진고', '청원고', '재현고'],
    topMiddleSchools: ['중계중', '상계중', '을지중'],
    note: '중계동 학원가, 강북 대표 학군',
  },
  {
    district: '마포구', elementary: 17, middle: 10, high: 8, totalStudents: 24300,
    avgStudentsPerClass: 24, specialHighSchools: ['서강고', '홍익부속고', '상암고'],
    topMiddleSchools: ['신수중', '서강중', '마포중'],
    note: '서강대·홍대 인접, 교육 인프라 양호',
  },
  {
    district: '용산구', elementary: 12, middle: 7, high: 6, totalStudents: 16800,
    avgStudentsPerClass: 23, specialHighSchools: ['용산고', '중경고', '배문고'],
    topMiddleSchools: ['용산중', '보광중', '한강중'],
    note: '국제학교·외국인학교 다수',
  },
  {
    district: '성동구', elementary: 14, middle: 8, high: 7, totalStudents: 22100,
    avgStudentsPerClass: 25, specialHighSchools: ['한양대부속고', '무학고'],
    topMiddleSchools: ['성수중', '옥수중', '금호중'],
    note: '성수·왕십리 신축 아파트와 함께 학군 성장',
  },
  {
    district: '광진구', elementary: 13, middle: 8, high: 7, totalStudents: 21500,
    avgStudentsPerClass: 26, specialHighSchools: ['건국대부속고', '광남고'],
    topMiddleSchools: ['광장중', '건국대부속중', '자양중'],
    note: '건국대·세종대 인접, 자양동 학군',
  },
  {
    district: '동작구', elementary: 15, middle: 9, high: 8, totalStudents: 24800,
    avgStudentsPerClass: 26, specialHighSchools: ['중앙대부속고', '보성고', '동작고'],
    topMiddleSchools: ['사당중', '흑석중', '노량진중'],
    note: '흑석·사당 학군, 중앙대 인접',
  },
  {
    district: '강동구', elementary: 18, middle: 11, high: 9, totalStudents: 30200,
    avgStudentsPerClass: 27, specialHighSchools: ['배재고', '한영고', '명일고'],
    topMiddleSchools: ['명일중', '고덕중', '한산중'],
    note: '고덕·강일 신도시 입주로 학교 신설 진행',
  },
  {
    district: '영등포구', elementary: 14, middle: 8, high: 7, totalStudents: 20500,
    avgStudentsPerClass: 25, specialHighSchools: ['여의도고', '영등포고'],
    topMiddleSchools: ['여의도중', '영중중'],
    note: '여의도 국제금융 특구 내 학교',
  },
];

export default function SchoolInfoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'district' | 'students' | 'schools'>('district');

  const filtered = useMemo(() => {
    let result = SCHOOL_DATA.filter(item => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return item.district.includes(term) ||
          item.specialHighSchools.some(s => s.includes(term)) ||
          item.topMiddleSchools.some(s => s.includes(term));
      }
      return true;
    });

    if (sortBy === 'students') result.sort((a, b) => b.totalStudents - a.totalStudents);
    else if (sortBy === 'schools') result.sort((a, b) => (b.elementary + b.middle + b.high) - (a.elementary + a.middle + a.high));
    return result;
  }, [searchTerm, sortBy]);

  const totalStats = useMemo(() => ({
    districts: SCHOOL_DATA.length,
    totalSchools: SCHOOL_DATA.reduce((a, b) => a + b.elementary + b.middle + b.high, 0),
    totalStudents: SCHOOL_DATA.reduce((a, b) => a + b.totalStudents, 0),
  }), []);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">학군 정보</h1>
        </div>
        <p className="text-sm text-gray-500">서울시 주요 구별 학군 현황</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="구 이름, 학교명 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="district">구 이름순</option>
            <option value="students">학생수 많은순</option>
            <option value="schools">학교수 많은순</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">조회 지역</div>
          <div className="text-xl font-bold text-gray-900">{totalStats.districts}개 구</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">총 학교수</div>
          <div className="text-xl font-bold text-emerald-600">{totalStats.totalSchools.toLocaleString()}개</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">총 학생수</div>
          <div className="text-xl font-bold text-blue-600">{totalStats.totalStudents.toLocaleString()}명</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div key={item.district} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{item.district}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Users size={14} />
                  총 {item.totalStudents.toLocaleString()}명 · 학급당 평균 {item.avgStudentsPerClass}명
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                <div className="text-xs text-blue-600 mb-0.5">초등학교</div>
                <div className="text-lg font-bold text-blue-700">{item.elementary}</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                <div className="text-xs text-emerald-600 mb-0.5">중학교</div>
                <div className="text-lg font-bold text-emerald-700">{item.middle}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                <div className="text-xs text-purple-600 mb-0.5">고등학교</div>
                <div className="text-lg font-bold text-purple-700">{item.high}</div>
              </div>
            </div>

            {item.specialHighSchools.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <BookOpen size={12} />
                  주요 고등학교
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.specialHighSchools.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {item.topMiddleSchools.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <BookOpen size={12} />
                  주요 중학교
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.topMiddleSchools.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3">{item.note}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">검색 조건에 맞는 학군 정보가 없습니다.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 학교 수 및 학생 수는 참고용 데이터이며, 실제와 다를 수 있습니다.</li>
          <li>• 정확한 학교 정보는 학교알리미(schoolinfo.go.kr)에서 확인하세요.</li>
          <li>• 향후 NEIS API 연동으로 실시간 데이터를 제공할 예정입니다.</li>
        </ul>
      </div>
    </div>
  );
}
