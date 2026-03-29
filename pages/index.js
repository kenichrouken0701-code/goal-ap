import React, { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [activeTab, setActiveTab] = useState('1日');

  const tabs = [
    { id: '1日', label: '1日' },
    { id: '1週間', label: '1週間' },
    { id: '1ヵ月', label: '1ヵ月' },
    { id: '1年', label: '1年' },
    { id: 'マンダラ', label: 'マンダラ' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case '1日':
        return <div className="py-20 text-gray-600">1日のページ</div>;
      case '1週間':
        return <div className="py-20 text-gray-600">1週間のページ</div>;
      case '1ヵ月':
        return <div className="py-20 text-gray-600">1ヵ月のページ</div>;
      case '1年':
        return <div className="py-20 text-gray-600">1年のページ</div>;
      case 'マンダラ':
        return <div className="py-20 text-gray-600">マンダラチャートのページ</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Head>
        <title>8-7シート (Goal Layer)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-4 text-center sticky top-0 z-10">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          8-7シート <span className="text-blue-600 font-medium text-sm md:text-base ml-1">Goal Layer</span>
        </h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex bg-gray-200 p-1 rounded-xl mb-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[80px] py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center p-6 md:p-12">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{activeTab}</h2>
          <div className="border-t border-gray-50 pt-4">
            {renderContent()}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
