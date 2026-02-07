'use client';

import { useState, useMemo } from 'react';
import { Calculator, Info, TrendingUp } from 'lucide-react';

export default function TransferTaxPage() {
  const [purchasePrice, setPurchasePrice] = useState<number>(500000000);
  const [salePrice, setSalePrice] = useState<number>(700000000);
  const [holdingPeriod, setHoldingPeriod] = useState<number>(3);
  const [isMultiHomeOwner, setIsMultiHomeOwner] = useState<boolean>(false);
  const [isAdjustedArea, setIsAdjustedArea] = useState<boolean>(true);
  const [expenses, setExpenses] = useState<number>(10000000);

  const calculate = useMemo(() => {
    const gain = salePrice - purchasePrice - expenses;

    if (gain <= 0) {
      return {
        gain: 0,
        basicDeduction: 0,
        taxableGain: 0,
        taxRate: 0,
        progressiveDeduction: 0,
        capitalGainsTax: 0,
        localTax: 0,
        totalTax: 0,
      };
    }

    // 기본공제 250만원
    const basicDeduction = 2500000;
    const taxableGain = Math.max(0, gain - basicDeduction);

    // 세율 결정
    let taxRate = 0;
    let progressiveDeduction = 0;

    if (isMultiHomeOwner && isAdjustedArea) {
      // 다주택자 조정대상지역: 기본세율 + 20%p (2주택), + 30%p (3주택 이상)
      taxRate = 0.65; // 최고세율 적용 가정
      progressiveDeduction = 0;
    } else if (holdingPeriod < 1) {
      // 1년 미만 보유: 70%
      taxRate = 0.70;
      progressiveDeduction = 0;
    } else if (holdingPeriod < 2) {
      // 1~2년 보유: 60%
      taxRate = 0.60;
      progressiveDeduction = 0;
    } else {
      // 2년 이상 보유: 기본세율 (누진세율)
      if (taxableGain <= 14000000) {
        taxRate = 0.06;
        progressiveDeduction = 0;
      } else if (taxableGain <= 50000000) {
        taxRate = 0.15;
        progressiveDeduction = 1260000;
      } else if (taxableGain <= 88000000) {
        taxRate = 0.24;
        progressiveDeduction = 5760000;
      } else if (taxableGain <= 150000000) {
        taxRate = 0.35;
        progressiveDeduction = 15440000;
      } else if (taxableGain <= 300000000) {
        taxRate = 0.38;
        progressiveDeduction = 19940000;
      } else if (taxableGain <= 500000000) {
        taxRate = 0.40;
        progressiveDeduction = 25940000;
      } else if (taxableGain <= 1000000000) {
        taxRate = 0.42;
        progressiveDeduction = 35940000;
      } else {
        taxRate = 0.45;
        progressiveDeduction = 65940000;
      }
    }

    const capitalGainsTax = taxableGain * taxRate - progressiveDeduction;
    const localTax = capitalGainsTax * 0.1; // 지방소득세 10%
    const totalTax = capitalGainsTax + localTax;

    return {
      gain,
      basicDeduction,
      taxableGain,
      taxRate: taxRate * 100,
      progressiveDeduction,
      capitalGainsTax: Math.max(0, capitalGainsTax),
      localTax: Math.max(0, localTax),
      totalTax: Math.max(0, totalTax),
    };
  }, [purchasePrice, salePrice, holdingPeriod, isMultiHomeOwner, isAdjustedArea, expenses]);

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
          <h1 className="text-2xl font-bold text-gray-900">양도소득세 계산기</h1>
        </div>
        <p className="text-sm text-gray-500">부동산 매도 시 양도소득세를 계산합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">양도 조건</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">취득가액 (매수가)</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <div className="text-sm text-emerald-600 mt-1">{formatCurrency(purchasePrice)}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">양도가액 (매도가)</label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <div className="text-sm text-emerald-600 mt-1">{formatCurrency(salePrice)}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">필요경비 (취득세, 중개수수료 등)</label>
            <input
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
            <div className="text-sm text-emerald-600 mt-1">{formatCurrency(expenses)}</div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">보유 기간</label>
            <select
              value={holdingPeriod}
              onChange={(e) => setHoldingPeriod(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value={0}>1년 미만</option>
              <option value={1}>1년 이상 ~ 2년 미만</option>
              <option value={2}>2년 이상</option>
              <option value={3}>3년 이상</option>
              <option value={5}>5년 이상</option>
              <option value={10}>10년 이상</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isMultiHomeOwner}
                onChange={(e) => setIsMultiHomeOwner(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">다주택자 (2주택 이상)</span>
            </label>
          </div>

          {isMultiHomeOwner && (
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
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="text-sm text-emerald-700 mb-2">총 납부 세금</div>
            <div className="text-3xl font-bold text-emerald-700 mb-4">
              {formatCurrency(calculate.totalTax)}
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <TrendingUp size={14} />
              <span>양도차익의 약 {calculate.gain > 0 ? ((calculate.totalTax / calculate.gain) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">계산 내역</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">양도차익</span>
                <span className="font-semibold text-gray-900">{formatCurrency(calculate.gain)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">기본공제</span>
                <span className="font-semibold text-gray-900">- {formatCurrency(calculate.basicDeduction)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">과세표준</span>
                <span className="font-semibold text-gray-900">{formatCurrency(calculate.taxableGain)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <div className="text-gray-600">양도소득세</div>
                  <div className="text-xs text-gray-500">세율: {calculate.taxRate.toFixed(0)}%</div>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(calculate.capitalGainsTax)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <div className="text-gray-600">지방소득세</div>
                  <div className="text-xs text-gray-500">양도소득세의 10%</div>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(calculate.localTax)}</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">참고사항</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• 1세대 1주택 비과세 요건 충족 시 양도소득세 면제</li>
                  <li>• 장기보유특별공제는 반영되지 않았습니다</li>
                  <li>• 정확한 세금은 세무사에게 문의하세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
