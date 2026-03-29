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

// --- Helpers & Constants (Logic preserved exactly as requested) ---
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
  // --- Global State (Logic preserved exactly as requested) ---
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

  // --- LocalStorage Persistence (Logic preserved exactly as requested) ---
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

  // --- Handlers (Logic preserved exactly as requested) ---
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
    if (typeof window !== 'undefined' && window.confirm("現在の入力内容をすべて消去しますか？")) {
      localStorage.removeItem('goal_layer_data_v2');
      window.location.reload();
    }
  };

  // --- Summaries (Logic preserved exactly as requested) ---
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

  // --- Render Helpers (Logic preserved, Styles improved) ---
  const renderTabContent = () => {
    let summary = "";
    let content = null;

    switch (activeTab) {
      case '1日':
        summary = daySummary();
        content = (
          <div className="space-y-6">
            <section className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2 text-blue-600 mb-5">
                <Target size={22} strokeWidth={2.5} />
                <h3 className="font-black text-lg tracking-tight">基本情報</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">日付</label>
                  <input type="text" value={dayDate} onChange={(e) => setDayDate(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">1日の目標</label>
                  <textarea value={dayGoal} onChange={(e) => setDayGoal(e.target.value)} placeholder="今日一番達成したいことは？" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none h-28 resize-none transition-all font-medium leading-relaxed" />
                </div>
              </div>
            </section>

            <section className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2 text-orange-500 mb-5">
                <Clock size={22} strokeWidth={2.5} />
                <h3 className="font-black text-lg tracking-tight">タイムスケジュール</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {daySchedule.map((item, index) => (
                  <div key={item.time} className="flex items-center gap-4 py-2 border-b border-gray-50 group">
                    <span className="w-14 text-[11px] font-black text-gray-300 group-focus-within:text-orange-500 transition-colors">{item.time}</span>
                    <input type="text" value={item.content} onChange={(e) => handleDayScheduleChange(index, e.target.value)} className="flex-1 p-2 text-sm bg-transparent border-none focus:bg-orange-50 rounded-xl outline-none transition-all font-medium" placeholder="予定を入力..." />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2 text-green-600 mb-5">
                <Zap size={22} strokeWidth={2.5} />
                <h3 className="font-black text-lg tracking-tight">振り返り</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">達成度 (◎/○/△/×)</label>
                  <input type="text" value={dayAchievement} onChange={(e) => setDayAchievement(e.target.value)} placeholder="◎" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:bg-white focus:border-green-500 outline-none transition-all font-black text-center text-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">良かったこと</label>
                  <textarea value={dayGoodThings} onChange={(e) => setDayGoodThings(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:bg-white focus:border-green-500 outline-none h-24 resize-none transition-all font-medium leading-relaxed" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">やり直せるなら</label>
                  <textarea value={dayRedo} onChange={(e) => setDayRedo(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:bg-white focus:border-green-500 outline-none h-24 resize-none transition-all font-medium leading-relaxed" />
                </div>
              </div>
            </section>
          </div>
        );
        break;

      case '1週間':
        summary = weekSummary();
        content = (
          <div className="space-y-6">
            <section className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-5">
                <Calendar size={22} strokeWidth={2.5} />
                <h3 className="font-black text-lg tracking-tight">週間設定</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">期間</label>
                  <input type="text" value={weekRange} onChange={(e) => setWeekRange(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">今週の目標</label>
                  <textarea value={weekGoal} onChange={(e) => setWeekGoal(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-28 resize-none font-medium leading-relaxed" />
                </div>
              </div>
            </section>
            <section className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 text-orange-500 mb-5">
                <LayoutDashboard size={22} strokeWidth={2.5} />
                <h3 className="font-black text-lg tracking-tight">デイリーログ</h3>
              </div>
              <div className="flex gap-5 min-w-[900px] pb-4">
                {weekDays.map((d, idx) => (
                  <div key={d.day} className="flex-1 min-w-[160px] p-5 bg-gray-50 rounded-[2rem] space-y-4 border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="text-center font-black text-blue-600 border-b border-blue-100 pb-2 text-sm">{d.day}</div>
                    <input type="text" value={d.goal} onChange={(e) => handleWeekDayChange(idx, 'goal', e.target.value)} placeholder="目標" className="w-full p-3 text-[11px] border-none rounded-xl bg-white shadow-sm outline-none" />
                    <input type="text" value={d.task} onChange={(e) => handleWeekDayChange(idx, 'task', e.target.value)} placeholder="タスク" className="w-full p-3 text-[11px] border-none rounded-xl bg-white shadow-sm outline-none" />
                    <input type="text" value={d.rating} onChange={(e) => handleWeekDayChange(idx, 'rating', e.target.value)} placeholder="達成度" className="w-full p-3 text-[11px] border-none rounded-xl bg-white shadow-sm outline-none font-black text-center" />
                    <textarea value={d.memo} onChange={(e) => handleWeekDayChange(idx, 'memo', e.target.value)} placeholder="メモ" className="w-full p-3 text-[11px] border-none rounded-xl bg-white shadow-sm outline-none h-20 resize-none" />
                  </div>
                ))}
              </div>
            </section>
            <section className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-green-600 mb-5">
                <Zap size={22} strokeWidth={2.5} />
                <h3 className="font-black text-lg tracking-tight">振り返り</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <textarea value={weekGoodFlow} onChange={(e) => setWeekGoodFlow(e.target.value)} placeholder="良かった流れ" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-32 resize-none font-medium" />
                <textarea value={weekImprovement} onChange={(e) => setWeekImprovement(e.target.value)} placeholder="改善ポイント" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-32 resize-none font-medium" />
                <textarea value={weekNextAction} onChange={(e) => setWeekNextAction(e.target.value)} placeholder="来週のアクション" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-32 resize-none font-medium" />
              </div>
            </section>
          </div>
        );
        break;

      case '1ヵ月':
        summary = monthSummary();
        content = (
          <div className="space-y-6">
            <section className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-5">
                <Calendar size={22} strokeWidth={2.5} />
                <h3 className="font-black text-lg tracking-tight">年間概況</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" value={monthYear} onChange={(e) => setMonthYear(e.target.value)} placeholder="年" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium" />
                <textarea value={monthAnnualGoal} onChange={(e) => setMonthAnnualGoal(e.target.value)} placeholder="年間目標" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-28 resize-none font-medium" />
              </div>
            </section>
            <section className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600 mb-5">
                <LayoutDashboard size={22} strokeWidth={2.5} />
                <h3 className="font-black text-lg tracking-tight">月別ログ</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {monthsData.map((m, idx) => (
                  <div key={m.month} className="p-5 bg-gray-50 rounded-[2rem] space-y-3 border border-gray-100 hover:bg-white hover:shadow-lg transition-all">
                    <div className="text-center font-black text-purple-600 border-b border-purple-100 pb-2 mb-3 text-sm">{m.month}</div>
                    <input type="text" value={m.goal} onChange={(e) => handleMonthDataChange(idx, 'goal', e.target.value)} placeholder="目標" className="w-full p-2.5 text-[11px] border-none rounded-xl bg-white shadow-sm outline-none" />
                    <div className="flex gap-2">
                      <input type="text" value={m.teamTarget} onChange={(e) => handleMonthDataChange(idx, 'teamTarget', e.target.value)} placeholder="目" className="w-1/2 p-2.5 text-[11px] border-none rounded-xl bg-white shadow-sm outline-none" />
                      <input type="text" value={m.teamResult} onChange={(e) => handleMonthDataChange(idx, 'teamResult', e.target.value)} placeholder="結" className="w-1/2 p-2.5 text-[11px] border-none rounded-xl bg-white shadow-sm outline-none" />
                    </div>
                    <input type="text" value={m.theme} onChange={(e) => handleMonthDataChange(idx, 'theme', e.target.value)} placeholder="テーマ" className="w-full p-2.5 text-[11px] border-none rounded-xl bg-white shadow-sm outline-none" />
                    <input type="text" value={m.rating} onChange={(e) => handleMonthDataChange(idx, 'rating', e.target.value)} placeholder="達成度" className="w-full p-2.5 text-[11px] border-none rounded-xl bg-white shadow-sm outline-none font-black text-center" />
                    <textarea value={m.reflection} onChange={(e) => handleMonthDataChange(idx, 'reflection', e.target.value)} placeholder="振り返り" className="w-full p-2.5 text-[11px] border-none rounded-xl bg-white shadow-sm outline-none h-16 resize-none" />
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
          <div className="space-y-6">
            <section className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-5">
                <Target size={22} strokeWidth={2.5} />
                <h3 className="font-black text-lg tracking-tight">年間ビジョン</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <input type="text" value={yearVal} onChange={(e) => setYearVal(e.target.value)} placeholder="年" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium" />
                <textarea value={yearIdealState} onChange={(e) => setYearIdealState(e.target.value)} placeholder="どういう状態になりたいか" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-28 resize-none font-medium leading-relaxed" />
                <textarea value={yearGoal} onChange={(e) => setYearGoal(e.target.value)} placeholder="年間目標" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-28 resize-none font-medium leading-relaxed" />
                <div className="grid grid-cols-2 gap-6">
                  <input type="text" value={yearTeamTarget} onChange={(e) => setYearTeamTarget(e.target.value)} placeholder="チーム人数(目標)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium" />
                  <input type="text" value={yearTeamResult} onChange={(e) => setYearTeamResult(e.target.value)} placeholder="チーム人数(結果)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium" />
                </div>
              </div>
            </section>
            <section className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-green-600 mb-5">
                <Zap size={22} strokeWidth={2.5} />
                <h3 className="font-black text-lg tracking-tight">年間総括</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" value={yearAchievement} onChange={(e) => setYearAchievement(e.target.value)} placeholder="達成度" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-xl text-center" />
                <textarea value={yearGoodPoints} onChange={(e) => setYearGoodPoints(e.target.value)} placeholder="良かった点" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-32 resize-none font-medium" />
                <textarea value={yearImprovement} onChange={(e) => setYearImprovement(e.target.value)} placeholder="改善点" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-32 resize-none font-medium" />
                <textarea value={yearNextAction} onChange={(e) => setYearNextAction(e.target.value)} placeholder="来年のアクション" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-32 resize-none font-medium" />
              </div>
            </section>
          </div>
        );
        break;

      case 'マンダラ':
        summary = mandalaSummary();
        content = (
          <div className="space-y-6">
            <section className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-5">
                <Zap size={22} strokeWidth={2.5} />
                <h3 className="font-black text-lg tracking-tight">マンダラチャート設定</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" value={mandalaDate} onChange={(e) => setMandalaDate(e.target.value)} placeholder="作成日" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium" />
                <input type="text" value={mandalaCenterGoal} onChange={(e) => setMandalaCenterGoal(e.target.value)} placeholder="最終目標 (中央)" className="w-full p-4 bg-blue-50 border border-blue-200 rounded-2xl outline-none font-black text-blue-900 text-lg text-center" />
              </div>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mandalaSubGoals.map((sg, sgIdx) => (
                <div key={sgIdx} className="p-7 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center gap-4 border-b border-gray-50 pb-4 mb-5">
                    <span className="flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-full text-sm font-black shadow-lg shadow-blue-200">{CIRCLE_NUMBERS[sgIdx]}</span>
                    <input type="text" value={sg.goal} onChange={(e) => handleMandalaSubGoalChange(sgIdx, e.target.value)} placeholder={`中目標 ${sgIdx + 1}`} className="flex-1 p-1 text-xl font-black bg-transparent border-none outline-none focus:text-blue-600 transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {sg.actions.map((action, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-4 group">
                        <span className="text-[11px] font-black text-gray-200 group-focus-within:text-blue-400 transition-colors w-4">{aIdx + 1}</span>
                        <input type="text" value={action} onChange={(e) => handleMandalaActionChange(sgIdx, aIdx, e.target.value)} placeholder="アクションを入力..." className="flex-1 p-2.5 text-sm bg-gray-50 border border-transparent focus:border-blue-100 focus:bg-white rounded-xl outline-none transition-all font-medium" />
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
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">{content}</div>
        <div className="lg:w-[400px] w-full">
          <div className="lg:sticky lg:top-24 space-y-5">
            <div className="flex items-center justify-between px-3">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Info size={14} /> Preview & Copy
              </h3>
              <button 
                onClick={() => copyToClipboard(summary)} 
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200'}`}
              >
                {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} strokeWidth={3} />}
                {copied ? 'Copied' : 'Copy Summary'}
              </button>
            </div>
            <div className="bg-[#0f1113] text-gray-300 p-8 md:p-10 rounded-[3rem] shadow-2xl font-mono text-[13px] whitespace-pre-wrap border border-gray-800 min-h-[500px] max-h-[75vh] overflow-y-auto leading-[1.8] custom-scrollbar selection:bg-blue-500/30">
              {summary}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans text-gray-900 pb-24">
      <Head>
        <title>Goal Layer | 8-7シート</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 py-6 px-8 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-blue-200 shadow-2xl">
              <Target size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none mb-1">8-7シート</h1>
              <p className="text-[11px] font-black text-blue-600 tracking-[0.2em] uppercase opacity-70">Goal Layer System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={resetData} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300" title="Reset All Data">
              <Trash2 size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200"></div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Live Sync</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-10">
        <nav className="flex bg-gray-200/50 p-2 rounded-[2rem] mb-14 overflow-x-auto no-scrollbar shadow-inner border border-gray-100/50">
          {['1日', '1週間', '1ヵ月', '1年', 'マンダラ'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[100px] py-4 text-sm font-black rounded-[1.5rem] transition-all whitespace-nowrap flex items-center justify-center gap-2.5 ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-xl scale-[1.03] border border-gray-50'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
              }`}
            >
              {tab === '1日' && <Clock size={18} strokeWidth={2.5} />}
              {tab === '1週間' && <Calendar size={18} strokeWidth={2.5} />}
              {tab === '1ヵ月' && <LayoutDashboard size={18} strokeWidth={2.5} />}
              {tab === '1年' && <Target size={18} strokeWidth={2.5} />}
              {tab === 'マンダラ' && <Zap size={18} strokeWidth={2.5} />}
              {tab}
            </button>
          ))}
        </nav>

        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-50 rounded-full -mr-[20rem] -mt-[20rem] opacity-30 blur-[100px] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="mb-16 flex items-end justify-between border-b border-gray-100 pb-8">
              <div>
                <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">{activeTab}</h2>
                <p className="text-base font-bold text-gray-400 tracking-tight">Precision management for high-performance goals.</p>
              </div>
              <div className="hidden lg:block text-[12px] font-black text-gray-100 tracking-[0.8em] uppercase vertical-text opacity-50">Goal Layer System</div>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-8 py-16 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-gray-100 mt-16">
        <div className="flex items-center gap-3 opacity-20 grayscale">
          <Target size={20} strokeWidth={3} />
          <span className="text-[11px] font-black uppercase tracking-[0.4em]">Goal Layer v2.1</span>
        </div>
        <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] text-center">
          &copy; 2026 Goal Layer. Engineered for Excellence.
        </p>
        <div className="flex gap-5">
          <div className="w-2.5 h-2.5 bg-blue-100 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-blue-300 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
        </div>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e5e7eb; }
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          -webkit-font-smoothing: antialiased;
          background-color: #f9fafb;
        }

        .vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }

        input::placeholder, textarea::placeholder {
          color: #d1d5db;
          font-weight: 500;
        }

        input:focus, textarea:focus {
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.05);
        }
      `}</style>
    </div>
  );
}
