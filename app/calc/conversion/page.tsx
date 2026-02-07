'use client';

import { useState, useMemo } from 'react';
import { Calculator, Info, ArrowRightLeft, RefreshCw } from 'lucide-react';

type ConversionType = 'jeonse-to-monthly' | 'monthly-to-jeonse';

export default function ConversionCalculatorPage() {
  const [conversionType, setConversionType] = useState<ConversionType>('jeonse-to-monthly');
  const [jeonseAmount, setJeonseAmount] = useState<number>(300000000);
  const [deposit, setDeposit] = useState<number>(50000000);
  const [monthlyRent, setMonthlyRent] = useState<number>(1000000);
  const [conversionRate, setConversionRate] = useState<number>(5);

  const calculate = useMemo(() => {
    const monthlyRate = conversionRate / 100 / 12;

    if (conversionType === 'jeonse-to-monthly') {
      // 전세 → 월세 전환
      const depositDiff = jeonseAmount - deposit;
      const convertedMonthly = Math.round(depositDiff * monthlyRate);

      return {
        originalJeonse: jeonseAmount,
        newDeposit: deposit,
        convertedMonthly,
        depositDiff,
        annualRent: convertedMonthly * 12,
      };
    } else {
      // 월세 → 전세 전환
      const additionalDeposit = Math.round(monthlyRent / monthlyRate);
      const convertedJeonse = deposit + additionalDeposit;

      return {
        originalDeposit: deposit,
        originalMonthly: monthlyRent,
        additionalDeposit,
        convertedJeonse,
        annualRent: monthlyRent * 12,
      };
    }
  }, [conversionType, jeonseAmount, deposit, monthlyRent, conversionRate]);

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
          <h1 className="text-2xl font-bold text-gray-900">전월세 전환 계산기</h1>
        </div>
        <p className="text-sm text-gray-500">전세를 월세로, 월세를 전세로 전환 계산합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">전환 조건</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">전환 유형</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConversionType('jeonse-to-monthly')}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  conversionType === 'jeonse-to-monthly'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  전세 <ArrowRightLeft size={14} /> 월세
                </div>
              </button>
              <button
                onClick={() => setConversionType('monthly-to-jeonse')}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  conversionType === 'monthly-to-jeonse'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  월세 <ArrowRightLeft size={14} /> 전세
                </div>
              </button>
            </div>
          </div>

          {conversionType === 'jeonse-to-monthly' ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">현재 전세금</label>
                <input
                  type="number"
                  value={jeonseAmount}
                  onChange={(e) => setJeonseAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <div className="text-sm text-emerald-600 mt-1">{formatCurrency(jeonseAmount)}</div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">전환 후 보증금</label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <div className="text-sm text-emerald-600 mt-1">{formatCurrency(deposit)}</div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">현재 보증금</label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <div className="text-sm text-emerald-600 mt-1">{formatCurrency(deposit)}</div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">현재 월세</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <div className="text-sm text-emerald-600 mt-1">{formatCurrency(monthlyRent)}</div>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전환율 (연 %): {conversionRate}%
            </label>
            <input
              type="range"
              min="2"
              max="10"
              step="0.5"
              value={conversionRate}
              onChange={(e) => setConversionRate(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2%</span>
              <span>법정상한 {new Date().getFullYear() >= 2025 ? '5' : '5'}%</span>
              <span>10%</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {conversionType === 'jeonse-to-monthly' ? (
            <>
              {/* 전세 → 월세 결과 */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <div className="text-sm text-emerald-700 mb-2">전환 후 월세</div>
                <div className="text-3xl font-bold text-emerald-700 mb-4">
                  {formatCurrency(calculate.convertedMonthly ?? 0)}
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <RefreshCw size={14} />
                  <span>보증금 {formatCurrency(deposit)} 기준</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">전환 내역</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">현재 전세금</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(jeonseAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">전환 후 보증금</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(deposit)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">전환 대상 금액</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(calculate.depositDiff ?? 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">전환율</span>
                    <span className="font-semibold text-gray-900">연 {conversionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-900 font-medium">연간 월세 총액</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(calculate.annualRent ?? 0)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 월세 → 전세 결과 */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <div className="text-sm text-emerald-700 mb-2">전환 후 전세금</div>
                <div className="text-3xl font-bold text-emerald-700 mb-4">
                  {formatCurrency(calculate.convertedJeonse ?? 0)}
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <RefreshCw size={14} />
                  <span>월세 {formatCurrency(monthlyRent)} 전환 기준</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">전환 내역</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">현재 보증금</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(deposit)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">현재 월세</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(monthlyRent)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">전환율</span>
                    <span className="font-semibold text-gray-900">연 {conversionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">추가 보증금</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(calculate.additionalDeposit ?? 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-900 font-medium">절약 연간 월세</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(calculate.annualRent ?? 0)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">전월세 전환율 안내</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• 법정 전환율 상한: 기준금리 + 3.5%p</li>
                  <li>• 전환율은 임대인과 협의하여 결정</li>
                  <li>• 계약갱신청구권 사용 시 상한 적용</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
