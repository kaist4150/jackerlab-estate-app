'use client';

interface TradeTabProps {
  activeTab: 'sale' | 'rent';
  onTabChange: (tab: 'sale' | 'rent') => void;
}

export default function TradeTab({ activeTab, onTabChange }: TradeTabProps) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
      <button
        onClick={() => onTabChange('sale')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'sale'
            ? 'bg-white text-emerald-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        매매
      </button>
      <button
        onClick={() => onTabChange('rent')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'rent'
            ? 'bg-white text-emerald-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        전월세
      </button>
    </div>
  );
}
