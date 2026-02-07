'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Wallet, Info } from 'lucide-react';

type RepaymentType = 'equal-principal-interest' | 'equal-principal' | 'bullet';

export default function LoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<number>(300000000); // 3억
  const [interestRate, setInterestRate] = useState<number>(4.5);
  const [loanTerm, setLoanTerm] = useState<number>(30); // 30년
  const [repaymentType, setRepaymentType] = useState<RepaymentType>('equal-principal-interest');
  const [gracePeriod, setGracePeriod] = useState<number>(0);

  const calculate = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTerm * 12;
    const graceMonths = gracePeriod * 12;
    const repaymentMonths = totalMonths - graceMonths;

    let schedule: { month: number; principal: number; interest: number; total: number; balance: number }[] = [];
    let totalInterest = 0;
    let monthlyPayment = 0;
    let balance = principal;

    if (repaymentType === 'equal-principal-interest') {
      // 원리금균등상환
      if (monthlyRate === 0) {
        monthlyPayment = principal / repaymentMonths;
      } else {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
          (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
      }

      // 거치기간
      for (let i = 1; i <= graceMonths; i++) {
        const interest = balance * monthlyRate;
        totalInterest += interest;
        schedule.push({ month: i, principal: 0, interest, total: interest, balance });
      }

      // 상환기간
      for (let i = graceMonths + 1; i <= totalMonths; i++) {
        const interest = balance * monthlyRate;
        const principalPayment = monthlyPayment - interest;
        balance -= principalPayment;
        totalInterest += interest;
        schedule.push({ month: i, principal: principalPayment, interest, total: monthlyPayment, balance: Math.max(0, balance) });
      }
    } else if (repaymentType === 'equal-principal') {
      // 원금균등상환
      const monthlyPrincipal = principal / repaymentMonths;

      // 거치기간
      for (let i = 1; i <= graceMonths; i++) {
        const interest = balance * monthlyRate;
        totalInterest += interest;
        schedule.push({ month: i, principal: 0, interest, total: interest, balance });
      }

      // 상환기간
      for (let i = graceMonths + 1; i <= totalMonths; i++) {
        const interest = balance * monthlyRate;
        balance -= monthlyPrincipal;
        totalInterest += interest;
        schedule.push({ month: i, principal: monthlyPrincipal, interest, total: monthlyPrincipal + interest, balance: Math.max(0, balance) });
      }

      monthlyPayment = schedule[graceMonths]?.total || 0;
    } else {
      // 만기일시상환
      for (let i = 1; i <= totalMonths; i++) {
        const interest = balance * monthlyRate;
        totalInterest += interest;
        if (i === totalMonths) {
          schedule.push({ month: i, principal: balance, interest, total: balance + interest, balance: 0 });
        } else {
          schedule.push({ month: i, principal: 0, interest, total: interest, balance });
        }
      }
      monthlyPayment = principal * monthlyRate;
    }

    return {
      monthlyPayment,
      totalInterest,
      totalPayment: principal + totalInterest,
      schedule: schedule.slice(0, 60), // 처음 5년만
    };
  }, [loanAmount, interestRate, loanTerm, repaymentType, gracePeriod]);

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

  const presetAmounts = [
    { label: '1억', value: 100000000 },
    { label: '2억', value: 200000000 },
    { label: '3억', value: 300000000 },
    { label: '5억', value: 500000000 },
    { label: '10억', value: 1000000000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">대출 계산기</h1>
        </div>
        <p className="text-sm text-gray-500">주택담보대출 상환 계획을 계산합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">대출 조건</h2>

            {/* Loan Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">대출 금액</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <div className="text-sm text-emerald-600 mt-1">{formatCurrency(loanAmount)}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {presetAmounts.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setLoanAmount(value)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      loanAmount === value
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연 이자율: {interestRate}%
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span>10%</span>
              </div>
            </div>

            {/* Loan Term */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">대출 기간</label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {[10, 15, 20, 25, 30, 35, 40].map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>
            </div>

            {/* Grace Period */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">거치 기간</label>
              <select
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                {[0, 1, 2, 3, 5].map(year => (
                  <option key={year} value={year}>{year === 0 ? '없음' : `${year}년`}</option>
                ))}
              </select>
            </div>

            {/* Repayment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상환 방식</label>
              <div className="space-y-2">
                {[
                  { value: 'equal-principal-interest', label: '원리금균등', desc: '매월 동일한 금액 상환' },
                  { value: 'equal-principal', label: '원금균등', desc: '원금을 균등하게 상환' },
                  { value: 'bullet', label: '만기일시', desc: '만기에 원금 일시 상환' },
                ].map(type => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      repaymentType === type.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="repaymentType"
                      value={type.value}
                      checked={repaymentType === type.value}
                      onChange={(e) => setRepaymentType(e.target.value as RepaymentType)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-emerald-700 text-sm mb-2">
                <Wallet size={16} />
                <span>월 상환금</span>
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {formatCurrency(calculate.monthlyPayment)}
              </div>
              {repaymentType === 'equal-principal' && (
                <div className="text-xs text-emerald-600 mt-1">첫 달 기준, 점차 감소</div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-blue-700 text-sm mb-2">
                <TrendingUp size={16} />
                <span>총 이자</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(calculate.totalInterest)}
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-purple-700 text-sm mb-2">
                <Calculator size={16} />
                <span>총 상환액</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {formatCurrency(calculate.totalPayment)}
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">상환 스케줄 (처음 5년)</h2>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="px-4 py-3 font-semibold">회차</th>
                    <th className="px-4 py-3 font-semibold text-right">원금</th>
                    <th className="px-4 py-3 font-semibold text-right">이자</th>
                    <th className="px-4 py-3 font-semibold text-right">상환액</th>
                    <th className="px-4 py-3 font-semibold text-right">잔액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {calculate.schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">{row.month}회</td>
                      <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(row.principal)}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(row.interest)}</td>
                      <td className="px-4 py-2 text-right font-medium text-emerald-600">{formatCurrency(row.total)}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
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
                  <li>• 실제 대출 금리는 개인 신용도, 담보 가치에 따라 달라집니다.</li>
                  <li>• 중도상환수수료, 인지세 등 부대비용은 포함되지 않았습니다.</li>
                  <li>• 정확한 상환 계획은 금융기관에 문의하세요.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
