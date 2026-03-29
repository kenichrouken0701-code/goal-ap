import React, { useState, useEffect } from 'react';
import Head from 'next/head';

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
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem('goal_layer_v6_storage');
      if (savedData) {
        try {
          const p = JSON.parse(savedData);
          if (p.activeTab) setActiveTab(p.activeTab);
          if (p.day) {
            setDayDate(p.day.date || getToday());
            setDayGoal(p.day.goal || '');
            setDaySchedule(p.day.schedule || generateInitialSchedule());
            setDayAchievement(p.day.achievement || '');
            setDayGoodThings(p.day.goodThings || '');
            setDayRedo(p.day.redo || '');
          }
          if (p.week) {
            setWeekRange(p.week.range || getWeekRange());
            setWeekGoal(p.week.goal || '');
            setWeekDays(p.week.days || generateInitialWeeklyDays());
            setWeekGoodFlow(p.week.goodFlow || '');
            setWeekImprovement(p.week.improvement || '');
            setWeekNextAction(p.week.nextAction || '');
          }
          if (p.month) {
            setMonthYear(p.month.year || getThisYear());
            setMonthAnnualGoal(p.month.annualGoal || '');
            setMonthsData(p.month.data || generateInitialMonthsData());
          }
          if (p.year) {
            setYearVal(p.year.val || getThisYear());
            setYearIdealState(p.year.idealState || '');
            setYearGoal(p.year.goal || '');
            setYearTeamTarget(p.year.teamTarget || '');
            setYearTeamResult(p.year.teamResult || '');
            setYearAchievement(p.year.achievement || '');
            setYearGoodPoints(p.year.goodPoints || '');
            setYearImprovement(p.year.improvement || '');
            setYearNextAction(p.year.nextAction || '');
          }
          if (p.mandala) {
            setMandalaDate(p.mandala.date || getToday());
            setMandalaCenterGoal(p.mandala.centerGoal || '');
            setMandalaSubGoals(p.mandala.subGoals || generateInitialMandalaData());
          }
        } catch (e) { console.error("Load Error", e); }
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    const data = {
      activeTab,
      day: { date: dayDate, goal: dayGoal, schedule: daySchedule, achievement: dayAchievement, goodThings: dayGoodThings, redo: dayRedo },
      week: { range: weekRange, goal: weekGoal, days: weekDays, goodFlow: weekGoodFlow, improvement: weekImprovement, nextAction: weekNextAction },
      month: { year: monthYear, annualGoal: monthAnnualGoal, data: monthsData },
      year: { val: yearVal, idealState: yearIdealState, goal: yearGoal, teamTarget: yearTeamTarget, teamResult: yearTeamResult, achievement: yearAchievement, goodPoints: yearGoodPoints, improvement: yearImprovement, nextAction: yearNextAction },
      mandala: { date: mandalaDate, centerGoal: mandalaCenterGoal, subGoals: mandalaSubGoals }
    };
    localStorage.setItem('goal_layer_v6_storage', JSON.stringify(data));
  }, [
    isLoaded, activeTab, dayDate, dayGoal, daySchedule, dayAchievement, dayGoodThings, dayRedo,
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
    if (typeof window !== "undefined") {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- Reset Handler ---
  const resetTabContent = () => {
    if (typeof window !== "undefined" && window.confirm(`${activeTab}タブの入力内容をリセットしますか？`)) {
      switch (activeTab) {
        case '1日':
          setDayDate(getToday());
          setDayGoal('');
          setDaySchedule(generateInitialSchedule());
          setDayAchievement('');
          setDayGoodThings('');
          setDayRedo('');
          break;
        case '1週間':
          setWeekRange(getWeekRange());
          setWeekGoal('');
          setWeekDays(generateInitialWeeklyDays());
          setWeekGoodFlow('');
          setWeekImprovement('');
          setWeekNextAction('');
          break;
        case '1ヵ月':
          setMonthYear(getThisYear());
          setMonthAnnualGoal('');
          setMonthsData(generateInitialMonthsData());
          break;
        case '1年':
          setYearVal(getThisYear());
          setYearIdealState('');
          setYearGoal('');
          setYearTeamTarget('');
          setYearTeamResult('');
          setYearAchievement('');
          setYearGoodPoints('');
          setYearImprovement('');
          setYearNextAction('');
          break;
        case 'マンダラ':
          setMandalaDate(getToday());
          setMandalaCenterGoal('');
          setMandalaSubGoals(generateInitialMandalaData());
          break;
      }
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>基本情報</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>日付</label>
                  <input type="text" value={dayDate} onChange={(e) => setDayDate(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>1日の目標</label>
                  <textarea value={dayGoal} onChange={(e) => setDayGoal(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px', resize: 'none' }} />
                </div>
              </div>
            </section>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>タイムスケジュール</h3>
              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                {daySchedule.map((item, index) => (
                  <div key={item.time} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0', borderBottom: '1px solid #f9f9f9' }}>
                    <span style={{ width: '50px', fontSize: '12px', color: '#aaa' }}>{item.time}</span>
                    <input type="text" value={item.content} onChange={(e) => handleDayScheduleChange(index, e.target.value)} style={{ flex: 1, padding: '8px', border: 'none', backgroundColor: '#fcfcfc', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            </section>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>振り返り</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" value={dayAchievement} onChange={(e) => setDayAchievement(e.target.value)} placeholder="達成度 (◎/○/△/×)" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                <textarea value={dayGoodThings} onChange={(e) => setDayGoodThings(e.target.value)} placeholder="良かったこと" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px', resize: 'none' }} />
                <textarea value={dayRedo} onChange={(e) => setDayRedo(e.target.value)} placeholder="今日1日やり直せるなら" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px', resize: 'none' }} />
              </div>
            </section>
          </div>
        );
        break;

      case '1週間':
        summary = weekSummary();
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>週間設定</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <input type="text" value={weekRange} onChange={(e) => setWeekRange(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                <textarea value={weekGoal} onChange={(e) => setWeekGoal(e.target.value)} placeholder="今週の目標" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px', resize: 'none' }} />
              </div>
            </section>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee', overflowX: 'auto' }}>
              <h3 style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>デイリーログ</h3>
              <div style={{ display: 'flex', gap: '12px', minWidth: '800px' }}>
                {weekDays.map((d, idx) => (
                  <div key={d.day} style={{ flex: 1, padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>{d.day}</div>
                    <input type="text" value={d.goal} onChange={(e) => handleWeekDayChange(idx, 'goal', e.target.value)} placeholder="目標" style={{ fontSize: '11px', padding: '6px', border: '1px solid #eee' }} />
                    <input type="text" value={d.task} onChange={(e) => handleWeekDayChange(idx, 'task', e.target.value)} placeholder="タスク" style={{ fontSize: '11px', padding: '6px', border: '1px solid #eee' }} />
                    <input type="text" value={d.rating} onChange={(e) => handleWeekDayChange(idx, 'rating', e.target.value)} placeholder="達成度" style={{ fontSize: '11px', padding: '6px', border: '1px solid #eee' }} />
                    <textarea value={d.memo} onChange={(e) => handleWeekDayChange(idx, 'memo', e.target.value)} placeholder="メモ" style={{ fontSize: '11px', padding: '6px', border: '1px solid #eee', height: '60px' }} />
                  </div>
                ))}
              </div>
            </section>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>振り返り</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <textarea value={weekGoodFlow} onChange={(e) => setWeekGoodFlow(e.target.value)} placeholder="良かった流れ" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px' }} />
                <textarea value={weekImprovement} onChange={(e) => setWeekImprovement(e.target.value)} placeholder="改善ポイント" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px' }} />
                <textarea value={weekNextAction} onChange={(e) => setWeekNextAction(e.target.value)} placeholder="来週のアクション" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px' }} />
              </div>
            </section>
          </div>
        );
        break;

      case '1ヵ月':
        summary = monthSummary();
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>年間概況</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <input type="text" value={monthYear} onChange={(e) => setMonthYear(e.target.value)} placeholder="年" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                <textarea value={monthAnnualGoal} onChange={(e) => setMonthAnnualGoal(e.target.value)} placeholder="年間目標" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px' }} />
              </div>
            </section>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>月別ログ</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {monthsData.map((m, idx) => (
                  <div key={m.month} style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{m.month}</div>
                    <input type="text" value={m.goal} onChange={(e) => handleMonthDataChange(idx, 'goal', e.target.value)} placeholder="目標" style={{ fontSize: '10px', padding: '4px' }} />
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input type="text" value={m.teamTarget} onChange={(e) => handleMonthDataChange(idx, 'teamTarget', e.target.value)} placeholder="目" style={{ fontSize: '10px', padding: '4px', width: '50%' }} />
                      <input type="text" value={m.teamResult} onChange={(e) => handleMonthDataChange(idx, 'teamResult', e.target.value)} placeholder="結" style={{ fontSize: '10px', padding: '4px', width: '50%' }} />
                    </div>
                    <input type="text" value={m.theme} onChange={(e) => handleMonthDataChange(idx, 'theme', e.target.value)} placeholder="テーマ" style={{ fontSize: '10px', padding: '4px' }} />
                    <input type="text" value={m.rating} onChange={(e) => handleMonthDataChange(idx, 'rating', e.target.value)} placeholder="達成度" style={{ fontSize: '10px', padding: '4px' }} />
                    <textarea value={m.reflection} onChange={(e) => handleMonthDataChange(idx, 'reflection', e.target.value)} placeholder="振り返り" style={{ fontSize: '10px', padding: '4px', height: '40px' }} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>年間ビジョン</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <input type="text" value={yearVal} onChange={(e) => setYearVal(e.target.value)} placeholder="年" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                <textarea value={yearIdealState} onChange={(e) => setYearIdealState(e.target.value)} placeholder="どういう状態になりたいか" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px' }} />
                <textarea value={yearGoal} onChange={(e) => setYearGoal(e.target.value)} placeholder="年間目標" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px' }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" value={yearTeamTarget} onChange={(e) => setYearTeamTarget(e.target.value)} placeholder="チーム人数(目標)" style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                  <input type="text" value={yearTeamResult} onChange={(e) => setYearTeamResult(e.target.value)} placeholder="チーム人数(結果)" style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                </div>
              </div>
            </section>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>年間総括</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <input type="text" value={yearAchievement} onChange={(e) => setYearAchievement(e.target.value)} placeholder="達成度" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                <textarea value={yearGoodPoints} onChange={(e) => setYearGoodPoints(e.target.value)} placeholder="良かった点" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px' }} />
                <textarea value={yearImprovement} onChange={(e) => setYearImprovement(e.target.value)} placeholder="改善点" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px' }} />
                <textarea value={yearNextAction} onChange={(e) => setYearNextAction(e.target.value)} placeholder="来年のアクション" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', height: '80px' }} />
              </div>
            </section>
          </div>
        );
        break;

      case 'マンダラ':
        summary = mandalaSummary();
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
              <h3 style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>マンダラチャート設定</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input type="text" value={mandalaDate} onChange={(e) => setMandalaDate(e.target.value)} placeholder="作成日" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }} />
                <input type="text" value={mandalaCenterGoal} onChange={(e) => setMandalaCenterGoal(e.target.value)} placeholder="最終目標 (中央)" style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f0f7ff', fontWeight: 'bold' }} />
              </div>
            </section>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {mandalaSubGoals.map((sg, sgIdx) => (
                <div key={sgIdx} style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                    <span style={{ backgroundColor: '#0066ff', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{CIRCLE_NUMBERS[sgIdx]}</span>
                    <input type="text" value={sg.goal} onChange={(e) => handleMandalaSubGoalChange(sgIdx, e.target.value)} placeholder={`中目標 ${sgIdx + 1}`} style={{ flex: 1, border: 'none', fontWeight: 'bold', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sg.actions.map((action, aIdx) => (
                      <div key={aIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '10px', color: '#ccc' }}>{aIdx + 1}</span>
                        <input type="text" value={action} onChange={(e) => handleMandalaActionChange(sgIdx, aIdx, e.target.value)} placeholder="アクション" style={{ flex: 1, padding: '4px', fontSize: '12px', border: '1px solid #f0f0f0', borderRadius: '4px' }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        break;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ flex: 1 }}>{content}</div>
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>Preview & Copy</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={resetTabContent} 
                style={{ padding: '10px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
              >
                Reset Tab
              </button>
              <button 
                onClick={() => copyToClipboard(summary)} 
                style={{ padding: '10px 20px', backgroundColor: copied ? '#28a745' : '#0066ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', color: '#ccc', padding: '24px', borderRadius: '16px', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', minHeight: '300px' }}>
            {summary}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', color: '#333', paddingBottom: '64px', fontFamily: 'sans-serif' }}>
      <Head>
        <title>Goal Layer | 8-7シート</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #eee', padding: '20px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>8-7シート <span style={{ color: '#0066ff', fontSize: '12px', fontWeight: 'bold' }}>Goal Layer</span></h1>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <nav style={{ display: 'flex', backgroundColor: '#eee', padding: '4px', borderRadius: '12px', marginBottom: '32px', overflowX: 'auto' }}>
          {['1日', '1週間', '1ヵ月', '1年', 'マンダラ'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                minWidth: '80px',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#0066ff' : '#666',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '24px', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}>{activeTab}</h2>
          {renderTabContent()}
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '40px', color: '#ccc', fontSize: '12px' }}>
        &copy; 2026 Goal Layer. All rights reserved.
      </footer>

      <style jsx global>{`
        body { margin: 0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
      `}</style>
    </div>
  );
}
