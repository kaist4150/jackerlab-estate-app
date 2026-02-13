'use client';

import { useState, useMemo } from 'react';
import { Train, Search, Hospital, ShoppingBag, TreePine, Building2, MapPin } from 'lucide-react';

interface InfraData {
  district: string;
  subwayStations: number;
  subwayLines: string[];
  hospitals: number;
  majorHospitals: string[];
  marts: number;
  parks: number;
  majorParks: string[];
  libraries: number;
  score: number; // 100점 만점 종합 인프라 점수
}

const INFRA_DATA: InfraData[] = [
  {
    district: '강남구', subwayStations: 14, subwayLines: ['2호선', '3호선', '7호선', '9호선', '분당선', 'GTX-A'],
    hospitals: 1850, majorHospitals: ['삼성서울병원', '강남세브란스', '차병원'],
    marts: 12, parks: 15, majorParks: ['양재시민의숲', '도곡공원', '대치공원'], libraries: 8, score: 95,
  },
  {
    district: '서초구', subwayStations: 11, subwayLines: ['2호선', '3호선', '4호선', '7호선', '9호선'],
    hospitals: 1420, majorHospitals: ['서울성모병원', '중앙대부속병원'],
    marts: 9, parks: 18, majorParks: ['우면산', '양재천', '서리풀공원', '몽마르뜨공원'], libraries: 7, score: 93,
  },
  {
    district: '송파구', subwayStations: 12, subwayLines: ['2호선', '3호선', '5호선', '8호선', '9호선'],
    hospitals: 1280, majorHospitals: ['서울아산병원', '한림대강동병원'],
    marts: 11, parks: 20, majorParks: ['올림픽공원', '석촌호수', '성내천'], libraries: 9, score: 92,
  },
  {
    district: '마포구', subwayStations: 15, subwayLines: ['2호선', '5호선', '6호선', '경의중앙선', '공항철도'],
    hospitals: 980, majorHospitals: ['이대목동병원', '마포구의료원'],
    marts: 8, parks: 12, majorParks: ['월드컵공원', '하늘공원', '난지한강공원'], libraries: 6, score: 90,
  },
  {
    district: '용산구', subwayStations: 10, subwayLines: ['1호선', '4호선', '6호선', '경의중앙선', 'GTX-A'],
    hospitals: 720, majorHospitals: ['순천향대병원', '용산구보건소'],
    marts: 6, parks: 10, majorParks: ['용산가족공원', '남산', '이태원부군당공원'], libraries: 5, score: 88,
  },
  {
    district: '영등포구', subwayStations: 11, subwayLines: ['1호선', '2호선', '5호선', '7호선', '9호선'],
    hospitals: 980, majorHospitals: ['여의도성모병원', '한강성심병원'],
    marts: 10, parks: 8, majorParks: ['여의도공원', '여의도한강공원', '영등포공원'], libraries: 6, score: 87,
  },
  {
    district: '성동구', subwayStations: 9, subwayLines: ['2호선', '3호선', '5호선', '분당선', '경의중앙선'],
    hospitals: 620, majorHospitals: ['한양대병원'],
    marts: 7, parks: 9, majorParks: ['서울숲', '응봉산', '살곶이공원'], libraries: 5, score: 86,
  },
  {
    district: '광진구', subwayStations: 7, subwayLines: ['2호선', '5호선', '7호선'],
    hospitals: 580, majorHospitals: ['건국대병원', '혜민병원'],
    marts: 6, parks: 8, majorParks: ['어린이대공원', '아차산', '뚝섬한강공원'], libraries: 5, score: 85,
  },
  {
    district: '동작구', subwayStations: 8, subwayLines: ['2호선', '4호선', '7호선', '9호선'],
    hospitals: 620, majorHospitals: ['중앙보훈병원', '보라매병원'],
    marts: 7, parks: 7, majorParks: ['보라매공원', '사당근린공원', '국립현충원'], libraries: 5, score: 84,
  },
  {
    district: '양천구', subwayStations: 7, subwayLines: ['2호선', '5호선', '9호선'],
    hospitals: 780, majorHospitals: ['이대목동병원'],
    marts: 8, parks: 10, majorParks: ['목동운동장', '파리공원', '신정공원'], libraries: 7, score: 83,
  },
  {
    district: '노원구', subwayStations: 9, subwayLines: ['4호선', '7호선'],
    hospitals: 650, majorHospitals: ['을지대노원병원', '인덕원정형외과'],
    marts: 8, parks: 12, majorParks: ['불암산', '수락산', '초안산'], libraries: 8, score: 80,
  },
  {
    district: '강동구', subwayStations: 8, subwayLines: ['5호선', '8호선', '9호선'],
    hospitals: 520, majorHospitals: ['강동경희대병원', '한림대강동병원'],
    marts: 7, parks: 11, majorParks: ['길동생태공원', '일자산', '암사생태공원'], libraries: 6, score: 82,
  },
];

export default function InfraPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'subway' | 'hospital' | 'park'>('score');

  const filtered = useMemo(() => {
    let result = INFRA_DATA.filter(item => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return item.district.includes(term) ||
          item.subwayLines.some(l => l.includes(term)) ||
          item.majorHospitals.some(h => h.includes(term)) ||
          item.majorParks.some(p => p.includes(term));
      }
      return true;
    });

    switch (sortBy) {
      case 'score': result.sort((a, b) => b.score - a.score); break;
      case 'subway': result.sort((a, b) => b.subwayStations - a.subwayStations); break;
      case 'hospital': result.sort((a, b) => b.hospitals - a.hospitals); break;
      case 'park': result.sort((a, b) => b.parks - a.parks); break;
    }
    return result;
  }, [searchTerm, sortBy]);

  const ScoreBar = ({ score }: { score: number }) => {
    const color = score >= 90 ? 'bg-emerald-500' : score >= 85 ? 'bg-blue-500' : score >= 80 ? 'bg-yellow-500' : 'bg-gray-400';
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-sm font-bold text-gray-700 w-8">{score}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Train className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">주변 인프라</h1>
        </div>
        <p className="text-sm text-gray-500">서울시 구별 생활 인프라 현황</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="구 이름, 지하철 노선, 병원, 공원 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="score">인프라 점수순</option>
            <option value="subway">지하철역 많은순</option>
            <option value="hospital">의료시설 많은순</option>
            <option value="park">공원 많은순</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div key={item.district} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-500" />
                  <h3 className="font-bold text-gray-900 text-lg">{item.district}</h3>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">인프라 점수</div>
                <div className={`text-xl font-bold ${item.score >= 90 ? 'text-emerald-600' : item.score >= 85 ? 'text-blue-600' : 'text-yellow-600'}`}>
                  {item.score}점
                </div>
              </div>
            </div>

            <div className="mb-3">
              <ScoreBar score={item.score} />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-blue-50 rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-xs text-blue-600 mb-0.5">
                  <Train size={12} />
                  지하철역
                </div>
                <div className="text-lg font-bold text-blue-700">{item.subwayStations}개</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-xs text-red-600 mb-0.5">
                  <Hospital size={12} />
                  의료시설
                </div>
                <div className="text-lg font-bold text-red-700">{item.hospitals.toLocaleString()}개</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-xs text-emerald-600 mb-0.5">
                  <TreePine size={12} />
                  공원
                </div>
                <div className="text-lg font-bold text-emerald-700">{item.parks}개</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-2.5">
                <div className="flex items-center gap-1 text-xs text-purple-600 mb-0.5">
                  <ShoppingBag size={12} />
                  대형마트
                </div>
                <div className="text-lg font-bold text-purple-700">{item.marts}개</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-gray-500">지하철: </span>
                <span className="text-gray-700">{item.subwayLines.join(', ')}</span>
              </div>
              {item.majorHospitals.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">주요 병원: </span>
                  <span className="text-gray-700">{item.majorHospitals.join(', ')}</span>
                </div>
              )}
              {item.majorParks.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">주요 공원: </span>
                  <span className="text-gray-700">{item.majorParks.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">검색 조건에 맞는 인프라 정보가 없습니다.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">안내</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 인프라 점수는 지하철, 의료, 공원, 상업시설 등을 종합한 참고 지표입니다.</li>
          <li>• 데이터는 참고용이며 실제 현황과 차이가 있을 수 있습니다.</li>
          <li>• 향후 공공데이터 API 연동으로 실시간 데이터를 제공할 예정입니다.</li>
        </ul>
      </div>
    </div>
  );
}
