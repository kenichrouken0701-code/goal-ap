import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Calendar, 
  Clock, 
  Target, 
  LayoutDashboard, 
  Zap, 
  Copy, 
  Check, 
  ChevronRight,
  Save,
  Trash2,
  Info
} from 'lucide-react';

// --- Helpers & Constants ---
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

const generateInitialMandalaData = () => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    goal: '',
    actions: Array(8).fill('')
  }));
};

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
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

const CIRCLE_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

export default function Home() {
  // --- Global State ---
  const [activeTab, setActiveTab] = useState('1日');
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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

  // --- 1ヵ月 (Monthly) State ---
  const [monthYear, setMonthYear] = useState(getThisYear());
  const [monthAnnualGoal, setMonthAnnualGoal] = useState('');
  const [monthsData, setMonthsData] = useState(generateInitialMonthsData());

  // --- 1年 (Yearly) State ---
  const [yearVal, setYearVal] = useState(getThisYear());
  const [yearIdealState, setYearIdealState] = useState('');
  const [yearGoal, setYearGoal] = useState('');
  const [yearTeamTarget, setYearTeamTarget] = useState('');
  const [yearTeamResult, setYearTeamResult] = useState('');
  const [yearAchievement, setYearAchievement] = useState('');
  const [yearGoodPoints, setYearGoodPoints] = useState('');
  const [yearImprovement, setYearImprovement] = useState('');
  const [yearNextAction, setYearNextAction] = useState('');

  // --- マンダラ (Mandala) State ---
  const [mandalaDate, setMandalaDate] = useState(getToday());
  const [mandalaCenterGoal, setMandalaCenterGoal] = useState('');
  const [mandalaSubGoals, setMandalaSubGoals] = useState(generateInitialMandalaData());

  // --- LocalStorage Persistence ---
  useEffect(() => {
    const savedData = localStorage.getItem('goal_layer_data_v2');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.day) {
          setDayDate(parsed.day.date || getToday());
          setDayGoal(parsed.day.goal || '');
          setDaySchedule(parsed.day.schedule || generateInitialSchedule());
          setDayAchievement(parsed.day.achievement || '');
          setDayGoodThings(parsed.day.goodThings || '');
          setDayRedo(parsed.day.redo || '');
        }
        if (parsed.week) {
          setWeekRange(parsed.week.range || getWeekRange());
          setWeekGoal(parsed.week.goal || '');
          setWeekDays(parsed.week.days || generateInitialWeeklyDays());
          setWeekGoodFlow(parsed.week.goodFlow || '');
          setWeekImprovement(parsed.week.improvement || '');
          setWeekNextAction(parsed.week.nextAction || '');
        }
        if (parsed.month) {
          setMonthYear(parsed.month.year || getThisYear());
          setMonthAnnualGoal(parsed.month.annualGoal || '');
          setMonthsData(parsed.month.data || generateInitialMonthsData());
        }
        if (parsed.year) {
          setYearVal(parsed.year.val || getThisYear());
          setYearIdealState(parsed.year.idealState || '');
          setYearGoal(parsed.year.goal || '');
          setYearTeamTarget(parsed.year.teamTarget || '');
          setYearTeamResult(parsed.year.teamResult || '');
          setYearAchievement(parsed.year.achievement || '');
          setYearGoodPoints(parsed.year.goodPoints || '');
          setYearImprovement(parsed.year.improvement || '');
          setYearNextAction(parsed.year.nextAction || '');
        }
        if (parsed.mandala) {
          setMandalaDate(parsed.mandala.date || getToday());
          setMandalaCenterGoal(parsed.mandala.centerGoal || '');
          setMandalaSubGoals(parsed.mandala.subGoals || generateInitialMandalaData());
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const dataToSave = {
      day: { date: dayDate, goal: dayGoal, schedule: daySchedule, achievement: dayAchievement, goodThings: dayGoodThings, redo: dayRedo },
      week: { range: weekRange, goal: weekGoal, days: weekDays, goodFlow: weekGoodFlow, improvement: weekImprovement, nextAction: weekNextAction },
      month: { year: monthYear, annualGoal: monthAnnualGoal, data: monthsData },
      year: { val: yearVal, idealState: yearIdealState, goal: yearGoal, teamTarget: yearTeamTarget, teamResult: yearTeamResult, achievement: yearAchievement, goodPoints: yearGoodPoints, improvement: yearImprovement, nextAction: yearNextAction },
      mandala: { date: mandalaDate, centerGoal: mandalaCenterGoal, subGoals: mandalaSubGoals }
    };
    localStorage.setItem('goal_layer_data_v2', JSON.stringify(dataToSave));
  }, [
    isLoaded, dayDate, dayGoal, daySchedule, dayAchievement, dayGoodThings, dayRedo,
    weekRange, weekGoal, weekDays, weekGoodFlow, weekImprovement, weekNextAction,
    monthYear, monthAnnualGoal, monthsData,
    yearVal, yearIdealState, yearGoal, yearTeamTarget, yearTeamResult, yearAchievement, yearGoodPoints, yearImprovement, yearNextAction,
    mandalaDate, mandalaCenterGoal, mandalaSubGoals
  ]);

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

  const handleMandalaSubGoalChange = (index, value) => {
    const next = [...mandalaSubGoals];
    next[index].goal = value;
    setMandalaSubGoals(next);
  };

  const handleMandalaActionChange = (subGoalIdx, actionIdx, value) => {
    const next = [...mandalaSubGoals];
    next[subGoalIdx].actions[actionIdx] = value;
    setMandalaSubGoals(next);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetData = () => {
    if (window.confirm("現在の入力内容をすべて消去しますか？")) {
      localStorage.removeItem('goal_layer_data_v2');
      window.location.reload();
    }
  };

  // --- Summaries ---
  const daySummary = () => {
    const scheduleText = daySchedule.filter(i => i.content.trim() !== '').map(i => `${i.time} ${i.content}`).join('\n');
    return `■日付\n${dayDate}\n\n■1日の目標\n${dayGoal}\n\n■タイムスケジュール\n${scheduleText}\n\n■振り返り\n【達成度】\n${dayAchievement}\n\n【良かったこと】\n${dayGoodThings}\n\n【今日1日やり直せるなら】\n${dayRedo}`;
  };

  const weekSummary = () => {
    const ratingsText = weekDays.map(d => `${d.day}：${d.rating}`).join('\n');
    return `■期間\n${weekRange}\n\n■今週の目標\n${weekGoal}\n\n■週間サマリー\n\n【達成状況】\n${ratingsText}\n\n【良かった流れ】\n${weekGoodFlow}\n\n【改善ポイント】\n${weekImprovement}\n\n【来週のアクション】\n${weekNextAction}`;
  };

  const monthSummary = () => {
    const summaryText = monthsData.map(m => `【${m.month}】\n・目標：${m.goal}\n・チーム人数：目標 ${m.teamTarget} / 結果 ${m.teamResult}\n・テーマ：${m.theme}\n・達成度：${m.rating}\n・振り返り：${m.reflection}`).join('\n\n');
    return `■年\n${monthYear}\n\n■年間目標\n${monthAnnualGoal}\n\n■年間サマリー\n\n${summaryText}`;
  };

  const yearSummary = () => {
    return `■年\n${yearVal}\n\n■なりたい状態\n${yearIdealState}\n\n■年間目標\n${yearGoal}\n\n■チーム人数\n目標：${yearTeamTarget}\n結果：${yearTeamResult}\n\n■総括\n\n【達成度】\n${yearAchievement}\n\n【良かった点】\n${yearGoodPoints}\n\n【改善点】\n${yearImprovement}\n\n【来年のアクション】\n${yearNextAction}`;
  };

  const mandalaSummary = () => {
    const strategyText = mandalaSubGoals.map((sg, i) => `${CIRCLE_NUMBERS[i]} ${sg.goal}`).join('\n');
    const actionPlanText = mandalaSubGoals.map((sg, i) => `【${CIRCLE_NUMBERS[i]}】\n${sg.actions.filter(a => a.trim() !== '').map(a => `・${a}`).join('\n') || '（未入力）'}`).join('\n\n');
    return `■作成日\n${mandalaDate}\n\n■最終目標\n${mandalaCenterGoal}\n\n■戦略（中目標）\n\n${strategyText}\n\n■行動プラン\n\n${actionPlanText}`;
  };

  // --- Render Helpers ---
  const renderTabContent = () => {
    let summary = "";
    let content = null;

    switch (activeTab) {
      case '1日':
        summary = daySummary();
        content = (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Target size={20} />
                <h3 className="font-bold">基本情報</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">日付</label>
                  <input type="text" value={dayDate} onChange={(e) => setDayDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">1日の目標</label>
                  <textarea value={dayGoal} onChange={(e) => setDayGoal(e.target.value)} placeholder="今日一番達成したいことは？" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all" />
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <Clock size={20} />
                <h3 className="font-bold">タイムスケジュール</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {daySchedule.map((item, index) => (
                  <div key={item.time} className="flex items-center gap-3 py-1 border-b border-gray-50">
                    <span className="w-12 text-xs font-mono text-gray-400">{item.time}</span>
                    <input type="text" value={item.content} onChange={(e) => handleDayScheduleChange(index, e.target.value)} className="flex-1 p-2 text-sm bg-transparent border-none focus:bg-blue-50 rounded-lg outline-none transition-all" placeholder="..." />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Zap size={20} />
                <h3 className="font-bold">振り返り</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">達成度 (◎/○/△/×)</label>
                  <input type="text" value={dayAchievement} onChange={(e) => setDayAchievement(e.target.value)} placeholder="◎" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">良かったこと</label>
                  <textarea value={dayGoodThings} onChange={(e) => setDayGoodThings(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">やり直せるなら</label>
                  <textarea value={dayRedo} onChange={(e) => setDayRedo(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none transition-all" />
                </div>
              </div>
            </section>
          </div>
        );
        break;

      case '1週間':
        summary = weekSummary();
        content = (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Calendar size={20} />
                <h3 className="font-bold">週間設定</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">期間</label>
                  <input type="text" value={weekRange} onChange={(e) => setWeekRange(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">今週の目標</label>
                  <textarea value={weekGoal} onChange={(e) => setWeekGoal(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none" />
                </div>
              </div>
            </section>
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <LayoutDashboard size={20} />
                <h3 className="font-bold">デイリーログ</h3>
              </div>
              <div className="flex gap-4 min-w-[800px] pb-2">
                {weekDays.map((d, idx) => (
                  <div key={d.day} className="flex-1 min-w-[150px] p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-100">
                    <div className="text-center font-black text-blue-600 border-b border-blue-100 pb-1">{d.day}</div>
                    <input type="text" value={d.goal} onChange={(e) => handleWeekDayChange(idx, 'goal', e.target.value)} placeholder="目標" className="w-full p-2 text-[10px] border rounded-lg bg-white outline-none" />
                    <input type="text" value={d.task} onChange={(e) => handleWeekDayChange(idx, 'task', e.target.value)} placeholder="タスク" className="w-full p-2 text-[10px] border rounded-lg bg-white outline-none" />
                    <input type="text" value={d.rating} onChange={(e) => handleWeekDayChange(idx, 'rating', e.target.value)} placeholder="達成度" className="w-full p-2 text-[10px] border rounded-lg bg-white outline-none" />
                    <textarea value={d.memo} onChange={(e) => handleWeekDayChange(idx, 'memo', e.target.value)} placeholder="メモ" className="w-full p-2 text-[10px] border rounded-lg bg-white outline-none h-16 resize-none" />
                  </div>
                ))}
              </div>
            </section>
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Zap size={20} />
                <h3 className="font-bold">振り返り</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <textarea value={weekGoodFlow} onChange={(e) => setWeekGoodFlow(e.target.value)} placeholder="良かった流れ" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none" />
                <textarea value={weekImprovement} onChange={(e) => setWeekImprovement(e.target.value)} placeholder="改善ポイント" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none" />
                <textarea value={weekNextAction} onChange={(e) => setWeekNextAction(e.target.value)} placeholder="来週のアクション" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none" />
              </div>
            </section>
          </div>
        );
        break;

      case '1ヵ月':
        summary = monthSummary();
        content = (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Calendar size={20} />
                <h3 className="font-bold">年間概況</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={monthYear} onChange={(e) => setMonthYear(e.target.value)} placeholder="年" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                <textarea value={monthAnnualGoal} onChange={(e) => setMonthAnnualGoal(e.target.value)} placeholder="年間目標" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none" />
              </div>
            </section>
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <LayoutDashboard size={20} />
                <h3 className="font-bold">月別ログ</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {monthsData.map((m, idx) => (
                  <div key={m.month} className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
                    <div className="text-center font-black text-purple-600 border-b border-purple-100 pb-1 mb-2">{m.month}</div>
                    <input type="text" value={m.goal} onChange={(e) => handleMonthDataChange(idx, 'goal', e.target.value)} placeholder="目標" className="w-full p-2 text-[10px] border rounded-lg bg-white outline-none" />
                    <div className="flex gap-1">
                      <input type="text" value={m.teamTarget} onChange={(e) => handleMonthDataChange(idx, 'teamTarget', e.target.value)} placeholder="目" className="w-1/2 p-2 text-[10px] border rounded-lg bg-white outline-none" />
                      <input type="text" value={m.teamResult} onChange={(e) => handleMonthDataChange(idx, 'teamResult', e.target.value)} placeholder="結" className="w-1/2 p-2 text-[10px] border rounded-lg bg-white outline-none" />
                    </div>
                    <input type="text" value={m.theme} onChange={(e) => handleMonthDataChange(idx, 'theme', e.target.value)} placeholder="テーマ" className="w-full p-2 text-[10px] border rounded-lg bg-white outline-none" />
                    <input type="text" value={m.rating} onChange={(e) => handleMonthDataChange(idx, 'rating', e.target.value)} placeholder="達成度" className="w-full p-2 text-[10px] border rounded-lg bg-white outline-none" />
                    <textarea value={m.reflection} onChange={(e) => handleMonthDataChange(idx, 'reflection', e.target.value)} placeholder="振り返り" className="w-full p-2 text-[10px] border rounded-lg bg-white outline-none h-12 resize-none" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
        break;

      case '1年':
        summary = yearSummary();
        content = (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Target size={20} />
                <h3 className="font-bold">年間ビジョン</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <input type="text" value={yearVal} onChange={(e) => setYearVal(e.target.value)} placeholder="年" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                <textarea value={yearIdealState} onChange={(e) => setYearIdealState(e.target.value)} placeholder="どういう状態になりたいか" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none" />
                <textarea value={yearGoal} onChange={(e) => setYearGoal(e.target.value)} placeholder="年間目標" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={yearTeamTarget} onChange={(e) => setYearTeamTarget(e.target.value)} placeholder="チーム人数(目標)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                  <input type="text" value={yearTeamResult} onChange={(e) => setYearTeamResult(e.target.value)} placeholder="チーム人数(結果)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
              </div>
            </section>
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Zap size={20} />
                <h3 className="font-bold">年間総括</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={yearAchievement} onChange={(e) => setYearAchievement(e.target.value)} placeholder="達成度" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                <textarea value={yearGoodPoints} onChange={(e) => setYearGoodPoints(e.target.value)} placeholder="良かった点" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none" />
                <textarea value={yearImprovement} onChange={(e) => setYearImprovement(e.target.value)} placeholder="改善点" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none" />
                <textarea value={yearNextAction} onChange={(e) => setYearNextAction(e.target.value)} placeholder="来年のアクション" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-24 resize-none" />
              </div>
            </section>
          </div>
        );
        break;

      case 'マンダラ':
        summary = mandalaSummary();
        content = (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Zap size={20} />
                <h3 className="font-bold">マンダラチャート設定</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={mandalaDate} onChange={(e) => setMandalaDate(e.target.value)} placeholder="作成日" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                <input type="text" value={mandalaCenterGoal} onChange={(e) => setMandalaCenterGoal(e.target.value)} placeholder="最終目標 (中央)" className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl outline-none font-bold text-blue-900" />
              </div>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mandalaSubGoals.map((sg, sgIdx) => (
                <div key={sgIdx} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-black">{CIRCLE_NUMBERS[sgIdx]}</span>
                    <input type="text" value={sg.goal} onChange={(e) => handleMandalaSubGoalChange(sgIdx, e.target.value)} placeholder={`中目標 ${sgIdx + 1}`} className="flex-1 p-1 text-lg font-black bg-transparent border-none outline-none focus:text-blue-600 transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {sg.actions.map((action, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-3 group">
                        <span className="text-[10px] font-bold text-gray-300 group-focus-within:text-blue-400 transition-colors">{aIdx + 1}</span>
                        <input type="text" value={action} onChange={(e) => handleMandalaActionChange(sgIdx, aIdx, e.target.value)} placeholder="アクション" className="flex-1 p-2 text-sm bg-gray-50 border border-transparent focus:border-blue-100 focus:bg-white rounded-xl outline-none transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        );
        break;
    }

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">{content}</div>
        <div className="lg:w-[380px] w-full">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Info size={14} /> Preview & Copy
              </h3>
              <button 
                onClick={() => copyToClipboard(summary)} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            </div>
            <div className="bg-[#1a1c1e] text-gray-300 p-8 rounded-[2rem] shadow-2xl font-mono text-sm whitespace-pre-wrap border border-gray-800 min-h-[500px] max-h-[70vh] overflow-y-auto leading-relaxed custom-scrollbar">
              {summary}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans text-gray-900 pb-20">
      <Head>
        <title>Goal Layer | 8-7シート</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-5 px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-blue-200 shadow-lg">
              <Target size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter leading-none">8-7シート</h1>
              <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Goal Layer System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetData} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Reset All Data">
              <Trash2 size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Auto-saving</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex bg-gray-100/50 p-1.5 rounded-[1.5rem] mb-12 overflow-x-auto no-scrollbar shadow-inner border border-gray-100">
          {['1日', '1週間', '1ヵ月', '1年', 'マンダラ'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[90px] py-3.5 text-sm font-bold rounded-2xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-md scale-[1.02]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === '1日' && <Clock size={16} />}
              {tab === '1週間' && <Calendar size={16} />}
              {tab === '1ヵ月' && <LayoutDashboard size={16} />}
              {tab === '1年' && <Target size={16} />}
              {tab === 'マンダラ' && <Zap size={16} />}
              {tab}
            </button>
          ))}
        </nav>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="mb-12 flex items-end justify-between border-b border-gray-100 pb-6">
              <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-1">{activeTab}</h2>
                <p className="text-sm font-medium text-gray-400">Manage your goals with precision and clarity.</p>
              </div>
              <div className="hidden sm:block text-[10px] font-black text-gray-200 tracking-[0.5em] uppercase vertical-text">Goal Layer</div>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 mt-12">
        <div className="flex items-center gap-2 opacity-30 grayscale">
          <Target size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Goal Layer v2.0</span>
        </div>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] text-center">
          &copy; 2026 Goal Layer. Precision Management for High Achievers.
        </p>
        <div className="flex gap-4">
          <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          -webkit-font-smoothing: antialiased;
        }

        .vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
