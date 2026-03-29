import React, { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const tabs = ['1日', '1週間', '1ヵ月', '1年', 'マンダラ'];
  const [activeTab, setActiveTab] = useState('1日');

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <Head>
        <title>Simple Tabs</title>
      </Head>

      <div className="max-w-2xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{activeTab}</h2>
          <p className="text-gray-500">
            {activeTab}のコンテンツを表示しています。
          </p>
        </div>
      </div>
    </div>
  );
}
