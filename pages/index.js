import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// --- Helpers ---
const generateInitialSchedule = () => {
  const hours = [];
  for (let i = 7; i <= 23; i++) hours.push(`${i}:00`);
  for (let i = 0; i <= 2; i++) hours.push(`${i}:00`);
  return hours.map(time => ({ time, content: '' }));
};

const generateInitialWeeklyDays = () => {
  const days = ['月', '火', '水', '木', '金', '土', '日'];
  return days.map(day => ({ day, goal: '', task: '', rating: '', memo: '' }));
};

const generateInitialMonthsData = () => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  return months.map(m => ({
    month: m,
    goal: '',
    teamTarget: '',
    teamResult: '',
    theme: '',
    rating: '',
    reflection: ''
  }));
};

const getToday = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
};

const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const sunday = new Date(now.setDate(diff + 6));
  const format = (d) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  return `${format(monday)}～${format(sunday)}`;
};

const getThisYear = () => new Date().getFullYear().toString();

export default function Home() {
  // --- Global State ---
  const [activeTab, setActiveTab] = useState('1日');
  const [copied, setCopied] = useState(false);

  // --- 1日 (Daily) State ---
  const [dayDate, setDayDate] = useState(getToday());
  const [dayGoal, setDayGoal] = useState('');
  const [daySchedule, setDaySchedule] = useState(generateInitialSchedule());
  const [dayAchievement, setDayAchievement] = useState('');
  const [dayGoodThings, setDayGoodThings] = useState('');
  const [dayRedo, setDayRedo] = useState('');

  // --- 1週間 (Weekly) State ---
  const [weekRange, setWeekRange] = useState(getWeekRange());
  const [weekGoal, setWeekGoal] = useState('');
  const [weekDays, setWeekDays] = useState(generateInitialWeeklyDays());
  const [weekGoodFlow, setWeekGoodFlow] = useState('');
  const [weekImprovement, setWeekImprovement] = useState('');
  const [weekNextAction, setWeekNextAction] = useState('');

  // --- 1ヵ月 (Monthly/Yearly Overview) State ---
  const [monthYear, setMonthYear] = useState(getThisYear());
  const [monthAnnualGoal, setMonthAnnualGoal] = useState('');
  const [monthsData, setMonthsData] = useState(generateInitialMonthsData());

  // --- 1年 (Yearly Life Design) State ---
  const [yearVal, setYearVal] = useState(getThisYear());
  const [yearIdealState, setYearIdealState] = useState('');
  const [yearGoal, setYearGoal] = useState('');
  const [yearTeamTarget, setYearTeamTarget] = useState('');
  const [yearTeamResult, setYearTeamResult] = useState('');
  const [yearAchievement, setYearAchievement] = useState('');
  const [yearGoodPoints, setYearGoodPoints] = useState('');
  const [yearImprovement, setYearImprovement] = useState('');
  const [yearNextAction, setYearNextAction] = useState('');

  // --- Handlers ---
  const handleDayScheduleChange = (index, value) => {
    const next = [...daySchedule];
    next[index].content = value;
    setDaySchedule(next);
  };

  const handleWeekDayChange = (index, field, value) => {
    const next = [...weekDays];
    next[index][field] = value;
    setWeekDays(next);
  };

  const handleMonthDataChange = (index, field, value) => {
    const next = [...monthsData];
    next[index][field] = value;
    setMonthsData(next);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Formatted Summaries ---
  const daySummary = () => {
    const scheduleText = daySchedule
      .filter(item => item.content.trim() !== '')
      .map(item => `${item.time} ${item.content}`)
      .join('\n');

    return `■日付\n${dayDate}\n\n■1日の目標\n${dayGoal}\n\n■タイムスケジュール\n${scheduleText}\n\n■振り返り\n【達成度】\n${dayAchievement}\n\n【良かったこと】\n${dayGoodThings}\n\n【今日1日やり直せるなら】\n${dayRedo}`;
  };

  const weekSummary = () => {
    const ratingsText = weekDays.map(d => `${d.day}：${d.rating}`).join('\n');
    return `■期間\n${weekRange}\n\n■今週の目標\n${weekGoal}\n\n■週間サマリー\n\n【達成状況】\n${ratingsText}\n\n【良かった流れ】\n${weekGoodFlow}\n\n【改善ポイント】\n${weekImprovement}\n\n【来週のアクション】\n${weekNextAction}`;
  };

  const monthSummary = () => {
    const summaryText = monthsData.map(m => `【${m.month}】
・目標：${m.goal}
・チーム人数：目標 ${m.teamTarget} / 結果 ${m.teamResult}
・テーマ：${m.theme}
・達成度：${m.rating}
・振り返り：${m.reflection}`).join('\n\n');

    return `■年\n${monthYear}\n\n■年間目標\n${monthAnnualGoal}\n\n■年間サマリー\n\n${summaryText}`;
  };

  const yearSummary = () => {
    return `■年\n${yearVal}\n\n■なりたい状態\n${yearIdealState}\n\n■年間目標\n${yearGoal}\n\n■チーム人数\n目標：${yearTeamTarget}\n結果：${yearTeamResult}\n\n■総括\n\n【達成度】\n${yearAchievement}\n\n【良かった点】\n${yearGoodPoints}\n\n【改善点】\n${yearImprovement}\n\n【来年のアクション】\n${yearNextAction}`;
  };

  // --- Render Helpers ---
  const renderTabContent = () => {
    if (activeTab === '1日') {
      return (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">基本情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">日付</label>
                  <input type="text" value={dayDate} onChange={(e) => setDayDate(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">1日の目標を設定する</label>
                  <textarea value={dayGoal} onChange={(e) => setDayGoal(e.target.value)} placeholder="今日一番達成したいことは？" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" />
                </div>
              </div>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">タイムスケジュール</h3>
              <div className="bg-gray-50 p-4 rounded-xl border space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {daySchedule.map((item, index) => (
                  <div key={item.time} className="flex items-center gap-3">
                    <span className="w-12 text-sm font-mono text-gray-400">{item.time}</span>
                    <input type="text" value={item.content} onChange={(e) => handleDayScheduleChange(index, e.target.value)} className="flex-1 p-2 border rounded bg-white text-sm outline-none focus:border-blue-500" placeholder="予定を入力" />
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">振り返り</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">達成度</label>
                  <input type="text" value={dayAchievement} onChange={(e) => setDayAchievement(e.target.value)} placeholder="◎ / ○ / △ / ×" className="w-full p-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">良かったこと</label>
                  <textarea value={dayGoodThings} onChange={(e) => setDayGoodThings(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">今日1日やり直せるなら</label>
                  <textarea value={dayRedo} onChange={(e) => setDayRedo(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" />
                </div>
              </div>
            </section>
          </div>
          <div className="lg:w-[400px] w-full">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Preview</h3>
                <button onClick={() => copyToClipboard(daySummary())} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'}`}>{copied ? 'Copied!' : 'Copy Summary'}</button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-6 rounded-2xl shadow-xl font-mono text-sm whitespace-pre-wrap border border-gray-700 min-h-[500px] leading-relaxed">{daySummary()}</div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === '1週間') {
      return (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">基本設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">期間</label>
                  <input type="text" value={weekRange} onChange={(e) => setWeekRange(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">今週の目標を設定する</label>
                  <textarea value={weekGoal} onChange={(e) => setWeekGoal(e.target.value)} placeholder="今週のメインテーマは？" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" />
                </div>
              </div>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">週間カレンダー</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {weekDays.map((d, idx) => (
                  <div key={d.day} className="p-4 bg-gray-50 border rounded-xl space-y-3">
                    <div className="text-center font-black text-blue-600 border-b pb-1 mb-2">{d.day}</div>
                    <div className="space-y-2">
                      <input type="text" value={d.goal} onChange={(e) => handleWeekDayChange(idx, 'goal', e.target.value)} placeholder="その日の目標" className="w-full p-2 text-xs border rounded bg-white outline-none" />
                      <input type="text" value={d.task} onChange={(e) => handleWeekDayChange(idx, 'task', e.target.value)} placeholder="最重要タスク" className="w-full p-2 text-xs border rounded bg-white outline-none" />
                      <input type="text" value={d.rating} onChange={(e) => handleWeekDayChange(idx, 'rating', e.target.value)} placeholder="達成度 (◎/○/△/×)" className="w-full p-2 text-xs border rounded bg-white outline-none" />
                      <textarea value={d.memo} onChange={(e) => handleWeekDayChange(idx, 'memo', e.target.value)} placeholder="一言メモ" className="w-full p-2 text-xs border rounded bg-white outline-none h-16 resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">振り返り・来週への展望</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">良かった流れ</label>
                  <textarea value={weekGoodFlow} onChange={(e) => setWeekGoodFlow(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">改善ポイント</label>
                  <textarea value={weekImprovement} onChange={(e) => setWeekImprovement(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">来週のアクション</label>
                  <textarea value={weekNextAction} onChange={(e) => setWeekNextAction(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" />
                </div>
              </div>
            </section>
          </div>
          <div className="lg:w-[400px] w-full">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Weekly Preview</h3>
                <button onClick={() => copyToClipboard(weekSummary())} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'}`}>{copied ? 'Copied!' : 'Copy Summary'}</button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-6 rounded-2xl shadow-xl font-mono text-sm whitespace-pre-wrap border border-gray-700 min-h-[500px] leading-relaxed">{weekSummary()}</div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === '1ヵ月') {
      return (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">年間概況設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">年</label>
                  <input type="text" value={monthYear} onChange={(e) => setMonthYear(e.target.value)} placeholder="YYYY" className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">年間目標</label>
                  <textarea value={monthAnnualGoal} onChange={(e) => setMonthAnnualGoal(e.target.value)} placeholder="今年のメインゴール" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" />
                </div>
              </div>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">月別カレンダー</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {monthsData.map((m, idx) => (
                  <div key={m.month} className="p-4 bg-gray-50 border rounded-xl space-y-2">
                    <div className="text-center font-black text-purple-600 border-b pb-1 mb-2">{m.month}</div>
                    <div className="space-y-1">
                      <input type="text" value={m.goal} onChange={(e) => handleMonthDataChange(idx, 'goal', e.target.value)} placeholder="月の目標" className="w-full p-1.5 text-[10px] border rounded bg-white outline-none" />
                      <div className="flex gap-1">
                        <input type="text" value={m.teamTarget} onChange={(e) => handleMonthDataChange(idx, 'teamTarget', e.target.value)} placeholder="人数(目)" className="w-1/2 p-1.5 text-[10px] border rounded bg-white outline-none" />
                        <input type="text" value={m.teamResult} onChange={(e) => handleMonthDataChange(idx, 'teamResult', e.target.value)} placeholder="人数(結)" className="w-1/2 p-1.5 text-[10px] border rounded bg-white outline-none" />
                      </div>
                      <input type="text" value={m.theme} onChange={(e) => handleMonthDataChange(idx, 'theme', e.target.value)} placeholder="テーマ" className="w-full p-1.5 text-[10px] border rounded bg-white outline-none" />
                      <input type="text" value={m.rating} onChange={(e) => handleMonthDataChange(idx, 'rating', e.target.value)} placeholder="達成度" className="w-full p-1.5 text-[10px] border rounded bg-white outline-none" />
                      <textarea value={m.reflection} onChange={(e) => handleMonthDataChange(idx, 'reflection', e.target.value)} placeholder="一言振り返り" className="w-full p-1.5 text-[10px] border rounded bg-white outline-none h-12 resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="lg:w-[400px] w-full">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Monthly Preview</h3>
                <button onClick={() => copyToClipboard(monthSummary())} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'}`}>{copied ? 'Copied!' : 'Copy Summary'}</button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-6 rounded-2xl shadow-xl font-mono text-sm whitespace-pre-wrap border border-gray-700 min-h-[500px] max-h-[70vh] overflow-y-auto leading-relaxed custom-scrollbar">{monthSummary()}</div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === '1年') {
      return (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">年間設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">年</label>
                  <input type="text" value={yearVal} onChange={(e) => setYearVal(e.target.value)} placeholder="YYYY" className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">どういう状態になりたいか</label>
                  <textarea value={yearIdealState} onChange={(e) => setYearIdealState(e.target.value)} placeholder="1年後の理想像を記述" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">年間目標</label>
                  <textarea value={yearGoal} onChange={(e) => setYearGoal(e.target.value)} placeholder="具体的に達成したい数値や状態" className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">チーム人数 (目標)</label>
                    <input type="text" value={yearTeamTarget} onChange={(e) => setYearTeamTarget(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">チーム人数 (結果)</label>
                    <input type="text" value={yearTeamResult} onChange={(e) => setYearTeamResult(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 outline-none" />
                  </div>
                </div>
              </div>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3">年間総括</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">達成度</label>
                  <input type="text" value={yearAchievement} onChange={(e) => setYearAchievement(e.target.value)} placeholder="◎ / ○ / △ / ×" className="w-full p-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">良かった点</label>
                  <textarea value={yearGoodPoints} onChange={(e) => setYearGoodPoints(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">改善点</label>
                  <textarea value={yearImprovement} onChange={(e) => setYearImprovement(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">来年のアクション</label>
                  <textarea value={yearNextAction} onChange={(e) => setYearNextAction(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" />
                </div>
              </div>
            </section>
          </div>
          <div className="lg:w-[400px] w-full">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Yearly Preview</h3>
                <button onClick={() => copyToClipboard(yearSummary())} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'}`}>{copied ? 'Copied!' : 'Copy Summary'}</button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-6 rounded-2xl shadow-xl font-mono text-sm whitespace-pre-wrap border border-gray-700 min-h-[500px] leading-relaxed">{yearSummary()}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="py-20 text-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed">
        {activeTab}のページ（準備中）
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <Head>
        <title>8-7シート (Goal Layer)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="bg-white border-b border-gray-200 py-6 px-4 text-center sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl md:text-2xl font-black tracking-tighter">
          8-7シート <span className="text-blue-600 font-medium text-sm md:text-base ml-1">Goal Layer</span>
        </h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex bg-gray-200 p-1 rounded-xl mb-10 overflow-x-auto no-scrollbar shadow-inner">
          {['1日', '1週間', '1ヵ月', '1年', 'マンダラ'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[80px] py-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
          <div className="mb-8 flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{activeTab}</h2>
            <div className="text-[10px] font-black text-gray-300 tracking-[0.3em] uppercase">Goal Management System</div>
          </div>
          {renderTabContent()}
        </div>
      </main>

      <footer className="text-center py-10 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        &copy; 2026 Goal Layer. Precision Management.
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
      `}</style>
    </div>
  );
}
