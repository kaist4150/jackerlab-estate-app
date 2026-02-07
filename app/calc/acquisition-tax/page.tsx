'use client';

import { useState, useMemo } from 'react';
import { Calculator, Home, Info } from 'lucide-react';

type PropertyType = 'apartment' | 'house' | 'land';
type AcquisitionType = 'sale' | 'gift' | 'inheritance';

export default function AcquisitionTaxPage() {
  const [propertyValue, setPropertyValue] = useState<number>(500000000); // 5억
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [acquisitionType, setAcquisitionType] = useState<AcquisitionType>('sale');
  const [isFirstHome, setIsFirstHome] = useState<boolean>(true);
  const [homeCount, setHomeCount] = useState<number>(0);
  const [isAdjustedArea, setIsAdjustedArea] = useState<boolean>(true); // 조정대상지역

  const calculate = useMemo(() => {
    const value = propertyValue;
    let taxRate = 0;
    let localEducationTax = 0;
    let ruralSpecialTax = 0;

    // 취득세율 계산 (2024년 기준)
    if (acquisitionType === 'sale') {
      // 매매
      if (propertyType === 'apartment' || propertyType === 'house') {
        if (homeCount === 0) {
          // 무주택자 (1주택 취득)
          if (value <= 600000000) {
            taxRate = 0.01; // 1%
          } else if (value <= 900000000) {
            taxRate = 0.01 + (value - 600000000) / 300000000 * 0.02; // 1~3%
          } else {
            taxRate = 0.03; // 3%
          }
        } else if (homeCount === 1) {
          // 1주택자 (2주택 취득)
          if (isAdjustedArea) {
            taxRate = 0.08; // 조정대상지역 8%
          } else {
            if (value <= 600000000) taxRate = 0.01;
            else if (value <= 900000000) taxRate = 0.02;
            else taxRate = 0.03;
          }
        } else if (homeCount === 2) {
          // 2주택자 (3주택 취득)
          taxRate = isAdjustedArea ? 0.12 : 0.08;
        } else {
          // 3주택 이상 (4주택 이상 취득)
          taxRate = isAdjustedArea ? 0.12 : 0.12;
        }
      } else {
        // 토지
        taxRate = 0.04; // 4%
      }
    } else if (acquisitionType === 'gift') {
      // 증여
      taxRate = 0.035; // 3.5%
      if (homeCount >= 2 && (propertyType === 'apartment' || propertyType === 'house')) {
        taxRate = 0.12; // 다주택자 12%
      }
    } else {
      // 상속
      taxRate = 0.028; // 2.8%
      if (homeCount >= 2 && (propertyType === 'apartment' || propertyType === 'house')) {
        taxRate = 0.028; // 상속은 중과 없음
      }
    }

    const acquisitionTax = value * taxRate;

    // 지방교육세: 취득세의 10%
    localEducationTax = acquisitionTax * 0.1;

    // 농어촌특별세: 취득세액 × 10% (취득세 중과 시)
    if (taxRate > 0.03) {
      ruralSpecialTax = (acquisitionTax - value * 0.03) * 0.2;
    }

    const totalTax = acquisitionTax + localEducationTax + ruralSpecialTax;

    return {
      taxRate: taxRate * 100,
      acquisitionTax,
      localEducationTax,
      ruralSpecialTax,
      totalTax,
    };
  }, [propertyValue, propertyType, acquisitionType, isFirstHome, homeCount, isAdjustedArea]);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000000) {
      const eok = Math.floor(amount / 100000000);
      const man = Math.floor((amount % 100000000) / 10000);
      return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
    } else if (amount >= 10000) {
      return `${Math.floor(amount / 10000).toLocaleString()}만원`;
    }
    return `${Math.round(amount).toLocaleString()}원`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">취득세 계산기</h1>
        </div>
        <p className="text-sm text-gray-500">부동산 취득세와 부가세를 계산합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">취득 조건</h2>

          {/* Property Value */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">취득가액</label>
            <input
              type="number"
              value={propertyValue}
              onChange={(e) => setPropertyValue(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <div className="text-sm text-emerald-600 mt-1">{formatCurrency(propertyValue)}</div>
          </div>

          {/* Property Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">부동산 종류</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'apartment', label: '아파트/주택' },
                { value: 'house', label: '다가구/다세대' },
                { value: 'land', label: '토지' },
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setPropertyType(type.value as PropertyType)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    propertyType === type.value
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Acquisition Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">취득 방법</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'sale', label: '매매' },
                { value: 'gift', label: '증여' },
                { value: 'inheritance', label: '상속' },
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setAcquisitionType(type.value as AcquisitionType)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    acquisitionType === type.value
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {(propertyType === 'apartment' || propertyType === 'house') && (
            <>
              {/* Home Count */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">보유 주택 수 (취득 전)</label>
                <select
                  value={homeCount}
                  onChange={(e) => setHomeCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={0}>무주택 (첫 주택 취득)</option>
                  <option value={1}>1주택 보유 (2주택 취득)</option>
                  <option value={2}>2주택 보유 (3주택 취득)</option>
                  <option value={3}>3주택 이상 보유</option>
                </select>
              </div>

              {/* Adjusted Area */}
              {homeCount > 0 && (
                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAdjustedArea}
                      onChange={(e) => setIsAdjustedArea(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">조정대상지역 (서울, 세종 등)</span>
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="text-sm text-emerald-700 mb-2">총 납부 세금</div>
            <div className="text-3xl font-bold text-emerald-700 mb-4">
              {formatCurrency(calculate.totalTax)}
            </div>
            <div className="text-sm text-emerald-600">
              취득가액의 약 {((calculate.totalTax / propertyValue) * 100).toFixed(2)}%
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">세금 내역</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <div className="font-medium text-gray-900">취득세</div>
                  <div className="text-xs text-gray-500">세율: {calculate.taxRate.toFixed(1)}%</div>
                </div>
                <div className="text-right font-semibold text-gray-900">
                  {formatCurrency(calculate.acquisitionTax)}
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <div className="font-medium text-gray-900">지방교육세</div>
                  <div className="text-xs text-gray-500">취득세의 10%</div>
                </div>
                <div className="text-right font-semibold text-gray-900">
                  {formatCurrency(calculate.localEducationTax)}
                </div>
              </div>
              {calculate.ruralSpecialTax > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-gray-900">농어촌특별세</div>
                    <div className="text-xs text-gray-500">중과분의 20%</div>
                  </div>
                  <div className="text-right font-semibold text-gray-900">
                    {formatCurrency(calculate.ruralSpecialTax)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">참고사항</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• 생애최초 주택구입 감면, 신혼부부 감면 등 특례는 반영되지 않았습니다.</li>
                  <li>• 조정대상지역은 시기에 따라 변동될 수 있습니다.</li>
                  <li>• 정확한 세금은 세무사 또는 관할 구청에 문의하세요.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
