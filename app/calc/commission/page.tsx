'use client';

import { useState, useMemo } from 'react';
import { Calculator, Info, Percent } from 'lucide-react';

type TransactionType = 'sale' | 'jeonse' | 'monthly';

export default function CommissionCalculatorPage() {
  const [transactionType, setTransactionType] = useState<TransactionType>('sale');
  const [transactionAmount, setTransactionAmount] = useState<number>(500000000);
  const [deposit, setDeposit] = useState<number>(50000000); // 월세 보증금
  const [monthlyRent, setMonthlyRent] = useState<number>(1000000); // 월세

  const calculate = useMemo(() => {
    let amount = transactionAmount;

    // 월세의 경우 환산보증금 계산: 보증금 + (월세 × 100)
    if (transactionType === 'monthly') {
      amount = deposit + (monthlyRent * 100);
    }

    // 중개보수 상한요율 (2021년 개정)
    let maxRate = 0;
    let limitAmount = 0;

    if (transactionType === 'sale') {
      // 매매
      if (amount < 50000000) {
        maxRate = 0.006;
        limitAmount = 250000;
      } else if (amount < 200000000) {
        maxRate = 0.005;
        limitAmount = 800000;
      } else if (amount < 900000000) {
        maxRate = 0.004;
      } else if (amount < 1200000000) {
        maxRate = 0.005;
      } else if (amount < 1500000000) {
        maxRate = 0.006;
      } else {
        maxRate = 0.007;
      }
    } else {
      // 전세/월세 (환산보증금)
      if (amount < 50000000) {
        maxRate = 0.005;
        limitAmount = 200000;
      } else if (amount < 100000000) {
        maxRate = 0.004;
        limitAmount = 300000;
      } else if (amount < 600000000) {
        maxRate = 0.003;
      } else if (amount < 1200000000) {
        maxRate = 0.004;
      } else if (amount < 1500000000) {
        maxRate = 0.005;
      } else {
        maxRate = 0.006;
      }
    }

    let commission = amount * maxRate;
    if (limitAmount > 0) {
      commission = Math.min(commission, limitAmount);
    }

    // 부가세 (일반과세자의 경우 10%)
    const vat = commission * 0.1;

    return {
      amount,
      maxRate: maxRate * 100,
      commission,
      vat,
      totalWithVat: commission + vat,
    };
  }, [transactionType, transactionAmount, deposit, monthlyRent]);

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
          <h1 className="text-2xl font-bold text-gray-900">중개수수료 계산기</h1>
        </div>
        <p className="text-sm text-gray-500">부동산 중개보수 상한액을 계산합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">거래 조건</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">거래 유형</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'sale', label: '매매' },
                { value: 'jeonse', label: '전세' },
                { value: 'monthly', label: '월세' },
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setTransactionType(type.value as TransactionType)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    transactionType === type.value
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {transactionType !== 'monthly' ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {transactionType === 'sale' ? '매매가' : '전세금'}
              </label>
              <input
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <div className="text-sm text-emerald-600 mt-1">{formatCurrency(transactionAmount)}</div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">보증금</label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <div className="text-sm text-emerald-600 mt-1">{formatCurrency(deposit)}</div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">월세</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <div className="text-sm text-emerald-600 mt-1">{formatCurrency(monthlyRent)}</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <div className="text-sm text-gray-600">환산보증금</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(calculate.amount)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  보증금 + (월세 × 100)
                </div>
              </div>
            </>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="text-sm text-emerald-700 mb-2">중개보수 상한액</div>
            <div className="text-3xl font-bold text-emerald-700 mb-4">
              {formatCurrency(calculate.commission)}
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <Percent size={14} />
              <span>상한요율: {calculate.maxRate.toFixed(2)}%</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">세부 내역</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">거래금액</span>
                <span className="font-semibold text-gray-900">{formatCurrency(calculate.amount)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <div className="text-gray-600">중개보수</div>
                  <div className="text-xs text-gray-500">상한요율 {calculate.maxRate.toFixed(2)}%</div>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(calculate.commission)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <div className="text-gray-600">부가세 (선택)</div>
                  <div className="text-xs text-gray-500">일반과세자 10%</div>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(calculate.vat)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-900 font-medium">부가세 포함 총액</span>
                <span className="font-bold text-emerald-600">{formatCurrency(calculate.totalWithVat)}</span>
              </div>
            </div>
          </div>

          {/* Rate Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">상한요율표</h3>
            <div className="text-sm">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-600 border-b border-gray-200">
                    <th className="pb-2">거래금액</th>
                    <th className="pb-2">매매</th>
                    <th className="pb-2">전월세</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 text-gray-700">5천만 미만</td>
                    <td className="py-2">0.6%</td>
                    <td className="py-2">0.5%</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">5천만~2억</td>
                    <td className="py-2">0.5%</td>
                    <td className="py-2">0.4%</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">2억~9억</td>
                    <td className="py-2">0.4%</td>
                    <td className="py-2">0.3%</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">9억 이상</td>
                    <td className="py-2">0.5~0.7%</td>
                    <td className="py-2">0.4~0.6%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">참고사항</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• 중개보수는 협의하여 상한요율 이하로 결정 가능</li>
                  <li>• 간이과세자는 부가세 별도 부과 불가</li>
                  <li>• 2021년 10월 개정 요율 기준</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
