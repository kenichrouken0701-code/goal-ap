import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { 
  Calendar, 
  LayoutDashboard, 
  Target, 
  MessageSquare, 
  Sparkles, 
  History, 
  Plus, 
  Save, 
  RefreshCw, 
  Clock,
  ArrowRight,
  Zap,
  BarChart3,
  ListTodo,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

// --- Constants & Helpers ---
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

const PERIOD_LABELS = {
  day: '1日',
  week: '1週間',
  month: '1ヵ月',
  year: '1年',
  mandala: 'マンダラ'
};

const PERIOD_ICONS = {
  day: <Clock className="w-4 h-4" />,
  week: <Calendar className="w-4 h-4" />,
  month: <LayoutDashboard className="w-4 h-4" />,
  year: <Target className="w-4 h-4" />,
  mandala: <Zap className="w-4 h-4" />
};

const RATINGS = ['◎', '○', '△', '×'];
const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const getWeekRange = (baseDate = new Date()) => {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const formatDate = (d) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${formatDate(monday)}～${formatDate(sunday)}`;
};

const getTodayDisplayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

const generateInitialSchedule = () => {
  const blocks = [];
  for (let i = 7; i <= 23; i++) blocks.push({ time: `${i.toString().padStart(2, '0')}:00`, plan: '', actual: '', rating: '', memo: '' });
  for (let i = 0; i <= 2; i++) blocks.push({ time: `${i.toString().padStart(2, '0')}:00`, plan: '', actual: '', rating: '', memo: '' });
  return blocks;
};

const generateInitialWeeklyDays = () => WEEKDAYS.map(day => ({ day, goal: '', tasks: '', rating: '', memo: '' }));
const generateInitialMonthlyData = () => MONTHS.map(month => ({ month, goal: '', theme: '', rating: '', reflection: '', teamSizeTarget: '', teamSizeResult: '' }));
const generateInitialMandalaData = () => ({ centerGoal: '', subGoals: Array(8).fill(null).map(() => ({ goal: '', actions: Array(8).fill('') })) });

// --- Main Component ---
export default function Home() {
  const [activeTab, setActiveTab] = useState('day');
  const [entries, setEntries] = useState([]);
  const [currentGoal, setCurrentGoal] = useState('');
  const [currentTheme, setCurrentTheme] = useState('');
  const [currentWeekRange, setCurrentWeekRange] = useState(getWeekRange());
  const [currentDisplayDate, setCurrentDisplayDate] = useState(getTodayDisplayDate());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear().toString());
  const [currentReflection, setCurrentReflection] = useState('');
  const [currentGoodPoints, setCurrentGoodPoints] = useState('');
  const [currentRedoPoints, setCurrentRedoPoints] = useState('');
  const [currentOverallRating, setCurrentOverallRating] = useState('');
  const [achievementLevel, setAchievementLevel] = useState(0);
  const [currentSchedule, setCurrentSchedule] = useState(generateInitialSchedule());
  const [currentWeeklyDays, setCurrentWeeklyDays] = useState(generateInitialWeeklyDays());
  const [currentMonthlyData, setCurrentMonthlyData] = useState(generateInitialMonthlyData());
  const [currentIdealState, setCurrentIdealState] = useState('');
  const [currentTeamSizeTarget, setCurrentTeamSizeTarget] = useState('');
  const [currentTeamSizeResult, setCurrentTeamSizeResult] = useState('');
  const [currentKpis, setCurrentKpis] = useState([{ label: '売上', value: '' }, { label: '契約数', value: '' }]);
  const [currentMandalaData, setCurrentMandalaData] = useState(generateInitialMandalaData());
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [formattedSummary, setFormattedSummary] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('goal_layer_entries');
      if (saved) {
        try { setEntries(JSON.parse(saved)); } catch (e) { console.error('Failed to load entries', e); }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem('goal_layer_entries', JSON.stringify(entries));
    }
  }, [entries]);

  const filteredEntries = useMemo(() => entries.filter(e => e.period === activeTab).sort((a, b) => b.createdAt - a.createdAt), [entries, activeTab]);

  const handleSave = () => {
    if (!currentGoal.trim() && activeTab !== 'day') return;
    if (activeTab === 'day' && !currentGoal.trim() && currentSchedule.every(b => !b.plan && !b.actual)) return;

    let combinedReflection = currentReflection;
    if (activeTab === 'day') {
      combinedReflection = `【達成度】${currentOverallRating || '未設定'}\n【良かったこと】${currentGoodPoints}\n【今日1日やり直せるなら】${currentRedoPoints}`;
    }

    const newEntry = {
      id: crypto.randomUUID(),
      period: activeTab,
      date: new Date().toISOString(),
      goal: currentGoal,
      theme: ['week', 'month', 'year'].includes(activeTab) ? currentTheme : undefined,
      weekRange: activeTab === 'week' ? currentWeekRange : undefined,
      displayDate: ['day', 'mandala'].includes(activeTab) ? currentDisplayDate : undefined,
      year: ['month', 'year'].includes(activeTab) ? currentYear : undefined,
      idealState: activeTab === 'year' ? currentIdealState : undefined,
      teamSizeTarget: activeTab === 'year' ? currentTeamSizeTarget : undefined,
      teamSizeResult: activeTab === 'year' ? currentTeamSizeResult : undefined,
      kpis: activeTab === 'year' ? currentKpis : undefined,
      reflection: combinedReflection,
      achievementLevel,
      aiSuggestions: aiResponse || undefined,
      schedule: activeTab === 'day' ? currentSchedule : undefined,
      weeklyData: activeTab === 'week' ? currentWeeklyDays : undefined,
      monthlyData: activeTab === 'month' ? currentMonthlyData : undefined,
      mandalaData: activeTab === 'mandala' ? currentMandalaData : undefined,
      createdAt: Date.now()
    };

    setEntries([newEntry, ...entries]);
    resetForm();
  };

  const resetForm = () => {
    setCurrentGoal('');
    setCurrentTheme('');
    setCurrentDisplayDate(getTodayDisplayDate());
    setCurrentReflection('');
    setCurrentGoodPoints('');
    setCurrentRedoPoints('');
    setCurrentOverallRating('');
    setAchievementLevel(0);
    setAiResponse(null);
    setFormattedSummary(null);
    setCurrentIdealState('');
    setCurrentTeamSizeTarget('');
    setCurrentTeamSizeResult('');
    setCurrentKpis([{ label: '売上', value: '' }, { label: '契約数', value: '' }]);
    if (activeTab === 'day') setCurrentSchedule(generateInitialSchedule());
    if (activeTab === 'week') {
      setCurrentWeeklyDays(generateInitialWeeklyDays());
      setCurrentWeekRange(getWeekRange());
    }
    if (activeTab === 'month') {
      setCurrentMonthlyData(generateInitialMonthlyData());
      setCurrentYear(new Date().getFullYear().toString());
    }
    if (activeTab === 'mandala') setCurrentMandalaData(generateInitialMandalaData());
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && window.confirm('本当にこのタブの入力内容をリセットしますか？')) {
      resetForm();
    }
  };

  const updateWeeklyDay = (idx, field, value) => {
    const next = [...currentWeeklyDays];
    next[idx][field] = value;
    setCurrentWeeklyDays(next);
  };

  const updateMonthlyData = (idx, field, value) => {
    const next = [...currentMonthlyData];
    next[idx][field] = value;
    setCurrentMonthlyData(next);
  };

  const refineGoalWithAi = () => {
    if (!currentGoal.trim()) return;
    const prompt = `あなたは目標設定の専門コーチです。ユーザーの入力した目標を「具体的・測定可能・実行可能」に改善してください。\n\n目標：${currentGoal}`;
    const system = "あなたは目標設定の専門コーチです。改善後の目標、不足している要素、今すぐやるべき行動（3つ）を日本語で出力してください。";
    callAi(prompt, system);
  };

  const decomposeGoalWithAi = () => {
    if (!currentGoal.trim()) return;
    const prompt = `長期目標を短期行動に分解してください。\n\n目標：${currentGoal}`;
    const system = "長期目標を短期行動に分解してください。月ごとの目標、週ごとの行動、今日やること、を日本語で出力してください。";
    callAi(prompt, system);
  };

  const summarizeReflectionWithAi = () => {
    const isDayTab = activeTab === 'day';
    const reflectionContent = isDayTab 
      ? `良かったこと: ${currentGoodPoints}\n今日1日やり直せるなら: ${currentRedoPoints}`
      : currentReflection;
    if (!reflectionContent.trim()) return;
    const prompt = `あなたは振り返り分析の専門家です。入力内容から成果と課題を明確にしてください。\n\n振り返り内容：\n${reflectionContent}`;
    const system = "あなたは振り返り分析の専門家です。達成できたこと、うまくいかなかった原因、次の改善アクション（3つ）を日本語で出力してください。";
    callAi(prompt, system);
  };

  const analyzeYearlyResultsWithAi = () => {
    const prompt = `【年度】${currentYear}\n【なりたい状態】${currentIdealState}\n【チーム目標】${currentTeamSizeTarget}人\n【チーム結果】${currentTeamSizeResult}人\n【KPI】${currentKpis.map(k => `${k.label}: ${k.value}`).join(', ')}\n【振り返り】${currentReflection}`;
    const system = "あなたは経営・キャリアコンサルタントです。年間の数値を分析し、強みと来年度への課題を日本語で出力してください。";
    callAi(prompt, system);
  };

  const analyzeYearlyTrendsWithAi = () => {
    const dataText = currentMonthlyData.map(m => `${m.month}: 目標=${m.goal}, 達成度=${m.rating}`).join('\n');
    const prompt = `【年度】${currentYear}\n【12ヶ月のデータ】\n${dataText}`;
    const system = "12ヶ月の目標と達成度の推移から、ユーザーの行動パターンや季節ごとの傾向を分析し、日本語で出力してください。";
    callAi(prompt, system);
  };

  const generateNextYearPlanWithAi = () => {
    const dataText = currentMonthlyData.map(m => `${m.month}: 目標=${m.goal}, 達成度=${m.rating}`).join('\n');
    const prompt = `【今年度のデータ】\n${dataText}\n\nこれらを踏まえて来年度のプランを提案してください。`;
    const system = "今年の実績を踏まえ、来年度の飛躍に向けた4つのクォーター別戦略を日本語で提案してください。";
    callAi(prompt, system);
  };

  const optimizeScheduleWithAi = () => {
    const scheduleText = currentSchedule.filter(b => b.plan).map(b => `${b.time}: ${b.plan}`).join('\n');
    const prompt = `【今日の目標】${currentGoal}\n【現在の予定】\n${scheduleText}`;
    const system = "時間管理の専門家として、目標達成率を高めるためのスケジュール改善案（休憩の入れ方、集中時間の確保など）を日本語で提案してください。";
    callAi(prompt, system);
  };

  const extractFocusTasksWithAi = () => {
    const allTasks = currentSchedule.filter(b => b.plan).map(b => b.plan).join(', ');
    const prompt = `【目標】${currentGoal}\n【予定タスク】${allTasks}`;
    const system = "目標達成に最も寄与する「最優先タスク」を3つ絞り込み、その理由と実行のコツを日本語で出力してください。";
    callAi(prompt, system);
  };

  const analyzeScheduleWithAi = () => {
    const scheduleText = currentSchedule.filter(b => b.plan || b.actual).map(b => `${b.time} - 予定: ${b.plan}, 実績: ${b.actual}, 評価: ${b.rating}`).join('\n');
    const prompt = `【1日の記録】\n${scheduleText}`;
    const system = "1日の予定と実績の乖離を分析し、時間の使い方の癖と明日に向けた改善アドバイスを日本語で出力してください。";
    callAi(prompt, system);
  };

  const copyToClipboard = (text) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const callAi = async (prompt, systemInstruction, isSummary = false) => {
    setIsAiLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { systemInstruction }
      });
      if (isSummary) setFormattedSummary(response.text);
      else setAiResponse(response.text);
    } catch (error) {
      console.error('AI Error:', error);
      setAiResponse("AIの呼び出しに失敗しました。");
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateDaySummary = () => {
    const scheduleText = currentSchedule.filter(b => b.plan || b.actual).map(b => `${b.time} - 予定: ${b.plan || 'なし'}, 実績: ${b.actual || 'なし'}`).join('\n');
    const prompt = `【日付】${currentDisplayDate}\n【1日の目標】${currentGoal || '未入力'}\n【タイムスケジュール】\n${scheduleText || '未入力'}\n【振り返り】\n達成度：${currentOverallRating || '未入力'}\n良かったこと：${currentGoodPoints || '未入力'}\n今日1日やり直せるなら：${currentRedoPoints || '未入力'}`;
    const system = "あなたは優秀なアシスタントです。指定されたフォーマットに従って、1日のまとめを日本語で出力してください。入力が空の項目は省略してください。\n\n＜出力フォーマット＞\n■日付\n{YYYY/MM/DD}\n---\n■1日の目標\n{目標}\n---\n■タイムスケジュール\n{7:00〜2:00の範囲で整理}\n---\n■振り返り\n・達成度：{◎ / ○ / △ / ×}\n・良かったこと：{内容}\n・改善：{改善案}\n---";
    callAi(prompt, system, true);
  };

  const generateWeekSummary = () => {
    const dailyLogText = currentWeeklyDays.map(d => `【${d.day}】
・目標：${d.goal || '（未入力）'}
・最重要タスク：${d.tasks || '（未入力）'}
・達成度：${d.rating || '（未入力）'}
・メモ：${d.memo || '（未入力）'}`).join('\n\n');

    const prompt = `以下のデータに基づいて、1週間の振り返りサマリーを生成し、最後に「■デイリーログ」セクションとして提供されたデータをそのまま付加してください。

【期間】${currentWeekRange}
【今週の目標】${currentGoal || '未入力'}
【振り返り内容】${currentReflection || '未入力'}

【提供されたデイリーログデータ】
${dailyLogText}`;

    const system = `あなたは優秀なコーチです。ユーザーの1週間の活動を分析し、以下のフォーマットで出力してください。
「■デイリーログ」セクションは、提供されたデータを正確に転記し、指定の形式で出力してください。

＜出力フォーマット＞
■期間
{期間}

■今週の目標
{今週の目標}

■週間サマリー

【達成状況】
月：{達成度}
火：{達成度}
水：{達成度}
木：{達成度}
金：{達成度}
土：{達成度}
日：{達成度}

【良かった流れ】
{分析}

【改善ポイント】
{分析}

【来週のアクション】
{分析}

■デイリーログ

【月】
・目標：{goal}
・最重要タスク：{task}
・達成度：{rating}
・メモ：{memo}

【火】
・目標：{goal}
・最重要タスク：{task}
・達成度：{rating}
・メモ：{memo}

【水】
・目標：{goal}
・最重要タスク：{task}
・達成度：{rating}
・メモ：{memo}

【木】
・目標：{goal}
・最重要タスク：{task}
・達成度：{rating}
・メモ：{memo}

【金】
・目標：{goal}
・最重要タスク：{task}
・達成度：{rating}
・メモ：{memo}

【土】
・目標：{goal}
・最重要タスク：{task}
・達成度：{rating}
・メモ：{memo}

【日】
・目標：{goal}
・最重要タスク：{task}
・達成度：{rating}
・メモ：{memo}`;

    callAi(prompt, system, true);
  };

  const generateMandalaSummary = () => {
    const subGoalsText = currentMandalaData.subGoals.map((sg, i) => sg.goal ? `${i + 1}\n【中目標】\n${sg.goal}\n【行動】\n${sg.actions.filter(a => a).map(a => `・${a}`).join('\n') || '未入力'}` : '').filter(t => t).join('\n\n');
    const prompt = `【作成日】${currentDisplayDate}\n【最終目標（中央）】${currentMandalaData.centerGoal || '未入力'}\n【中目標（8要素）と各行動】\n${subGoalsText}`;
    const system = "あなたは思考整理と目標達成の専門コーチです。マンダラチャートのまとめを日本語で出力してください。\n\n＜出力フォーマット＞\n■作成日\n{YYYY/MM/DD}\n---\n■最終目標\n{目標}\n---\n■戦略（8要素）\n1. {中目標1}...\n---\n■行動プラン\n【{中目標1}】\n・{行動}...";
    callAi(prompt, system, true);
  };

  // --- Render ---
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px', backgroundColor: '#f8f9fa', color: '#111827', fontFamily: 'sans-serif' }}>
      <Head>
        <title>Goal Layer - 8-7シート</title>
      </Head>

      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(8px)', 
        borderBottom: '1px solid #e5e7eb', 
        padding: '16px' 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Target size={20} />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>8-7シート <span style={{ color: '#2563eb', fontWeight: 'normal', fontSize: '14px' }}>Goal Layer</span></h1>
          </div>
          <div style={{ flex: 1 }} />
          <button 
            onClick={() => setShowHistory(!showHistory)} 
            style={{ 
              padding: '8px', 
              backgroundColor: 'transparent', 
              border: 'none', 
              borderRadius: '50%', 
              cursor: 'pointer', 
              color: showHistory ? '#2563eb' : '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <History size={20} />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 16px' }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: '#f1f5f9', 
          padding: '4px', 
          borderRadius: '12px', 
          marginBottom: '24px', 
          maxWidth: '600px', 
          margin: '0 auto 32px auto' 
        }}>
          {Object.keys(PERIOD_LABELS).map((period) => (
            <button
              key={period}
              onClick={() => { setActiveTab(period); setAiResponse(null); setFormattedSummary(null); }}
              style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                padding: '10px 0', 
                borderRadius: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                border: 'none', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeTab === period ? '#ffffff' : 'transparent',
                color: activeTab === period ? '#2563eb' : '#64748b',
                boxShadow: activeTab === period ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {PERIOD_ICONS[period]}
              <span className="hidden sm-inline">{PERIOD_LABELS[period]}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!showHistory ? (
            <motion.div 
              key="editor" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
                
                {/* Left Side: Editor */}
                <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Goal Card */}
                  <section style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    {activeTab === 'day' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontWeight: 'bold' }}>
                          <Calendar size={18} color="#2563eb" /> 日付
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="text" 
                            value={currentDisplayDate} 
                            onChange={(e) => setCurrentDisplayDate(e.target.value)} 
                            style={{ 
                              fontSize: '14px', padding: '8px 12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', width: '120px', textAlign: 'center' 
                            }} 
                          />
                          <button onClick={() => setCurrentDisplayDate(getTodayDisplayDate())} style={{ padding: '8px', color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer' }}><RefreshCw size={16} /></button>
                        </div>
                      </div>
                    )}
                    {activeTab === 'week' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontWeight: 'bold' }}>
                          <Calendar size={18} color="#2563eb" /> 期間
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="text" 
                            value={currentWeekRange} 
                            onChange={(e) => setCurrentWeekRange(e.target.value)} 
                            style={{ 
                              fontSize: '14px', padding: '8px 12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', width: '220px', textAlign: 'center' 
                            }} 
                          />
                          <button onClick={() => setCurrentWeekRange(getWeekRange())} style={{ padding: '8px', color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer' }}><RefreshCw size={16} /></button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#374151', fontWeight: 'bold' }}>
                      <Target size={18} color="#2563eb" /> {PERIOD_LABELS[activeTab]}の目標
                    </div>
                    <textarea 
                      value={currentGoal} 
                      onChange={(e) => setCurrentGoal(e.target.value)} 
                      placeholder="何を達成したいですか？" 
                      style={{ 
                        width: '100%', minHeight: '90px', padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', fontSize: '15px', resize: 'none', boxSizing: 'border-box'
                      }} 
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
                      <button onClick={refineGoalWithAi} disabled={isAiLoading || !currentGoal} style={{ padding: '8px 16px', backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} /> AI目標改善
                      </button>
                      <button onClick={decomposeGoalWithAi} disabled={isAiLoading || !currentGoal} style={{ padding: '8px 16px', backgroundColor: '#faf5ff', color: '#9333ea', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ListTodo size={14} /> 行動に分解
                      </button>
                    </div>
                  </section>

                  {/* Dynamic Content Section */}
                  <section style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    {activeTab === 'day' && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                          <h2 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <Clock size={18} color="#f97316" /> タイムスケジュール
                          </h2>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={optimizeScheduleWithAi} disabled={isAiLoading} style={{ padding: '6px', backgroundColor: '#fff7ed', color: '#ea580c', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Zap size={16} /></button>
                            <button onClick={analyzeScheduleWithAi} disabled={isAiLoading} style={{ padding: '6px', backgroundColor: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><BarChart3 size={16} /></button>
                          </div>
                        </div>
                        <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
                          {currentSchedule.map((block, idx) => (
                            <div key={block.time} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 90px', gap: '8px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>{block.time}</div>
                              <input 
                                type="text" 
                                value={block.plan} 
                                onChange={(e) => { const n = [...currentSchedule]; n[idx].plan = e.target.value; setCurrentSchedule(n); }} 
                                placeholder="予定" 
                                style={{ padding: '8px', border: 'none', background: '#f9fafb', borderRadius: '6px', fontSize: '13px' }} 
                              />
                              <input 
                                type="text" 
                                value={block.actual} 
                                onChange={(e) => { const n = [...currentSchedule]; n[idx].actual = e.target.value; setCurrentSchedule(n); }} 
                                placeholder="実績" 
                                style={{ padding: '8px', border: 'none', background: '#f0f9ff', borderRadius: '6px', fontSize: '13px' }} 
                              />
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {RATINGS.map(r => (
                                  <button 
                                    key={r} 
                                    onClick={() => { const n = [...currentSchedule]; n[idx].rating = n[idx].rating === r ? '' : r; setCurrentSchedule(n); }}
                                    style={{ 
                                      width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', border: 'none',
                                      backgroundColor: block.rating === r ? '#2563eb' : '#eff6ff', 
                                      color: block.rating === r ? '#ffffff' : '#2563eb'
                                    }}
                                  >
                                    {r}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'week' && (
                      <div style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minWidth: '700px' }}>
                          {WEEKDAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '8px', color: '#64748b' }}>{d}</div>)}
                          {currentWeeklyDays.map((d, idx) => (
                            <div key={idx} style={{ padding: '8px', border: '1px solid #f3f4f6', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <textarea 
                                value={d.goal} 
                                onChange={(e) => updateWeeklyDay(idx, 'goal', e.target.value)} 
                                placeholder="目標" 
                                style={{ width: '100%', height: '60px', padding: '6px', border: 'none', background: '#f9fafb', borderRadius: '6px', fontSize: '11px', resize: 'none' }} 
                              />
                              <textarea 
                                value={d.tasks} 
                                onChange={(e) => updateWeeklyDay(idx, 'tasks', e.target.value)} 
                                placeholder="タスク" 
                                style={{ width: '100%', height: '60px', padding: '6px', border: 'none', background: '#f0f9ff', borderRadius: '6px', fontSize: '11px', resize: 'none' }} 
                              />
                              <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                                {RATINGS.map(r => (
                                  <button 
                                    key={r} 
                                    onClick={() => updateWeeklyDay(idx, 'rating', d.rating === r ? '' : r)}
                                    style={{ 
                                      flex: 1, padding: '4px 0', fontSize: '10px', borderRadius: '4px', cursor: 'pointer', border: 'none',
                                      backgroundColor: d.rating === r ? '#2563eb' : '#eff6ff', 
                                      color: d.rating === r ? '#ffffff' : '#2563eb'
                                    }}
                                  >
                                    {r}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'month' && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>12ヶ月俯瞰カレンダー</h2>
                          <div style={{ display: 'flex', gap: '8px' }}>
                             <input type="text" value={currentYear} onChange={e => setCurrentYear(e.target.value)} style={{ width: '60px', padding: '6px', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center', fontSize: '14px' }} />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                          {currentMonthlyData.map((m, idx) => (
                            <div key={m.month} style={{ padding: '12px', border: '1px solid #f3f4f6', borderRadius: '16px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#9333ea' }}>{m.month}</span>
                                <div style={{ display: 'flex', gap: '1px' }}>
                                  {RATINGS.map(r => <button key={r} onClick={() => updateMonthlyData(idx, 'rating', m.rating === r ? '' : r)} style={{ width: '16px', height: '16px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '3px', background: m.rating === r ? '#9333ea' : '#f5f3ff', color: m.rating === r ? '#fff' : '#9333ea' }}>{r}</button>)}
                                </div>
                              </div>
                              <textarea value={m.goal} onChange={e => updateMonthlyData(idx, 'goal', e.target.value)} placeholder="目標" style={{ width: '100%', height: '50px', padding: '6px', background: '#f9fafb', border: 'none', borderRadius: '6px', fontSize: '11px', resize: 'none' }} />
                              <input value={m.theme} onChange={e => updateMonthlyData(idx, 'theme', e.target.value)} placeholder="テーマ" style={{ width: '100%', padding: '6px', border: 'none', background: '#faf5ff', borderRadius: '6px', fontSize: '11px' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'year' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>年間ライフデザイン</h2>
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>1年後、どうありたいですか？</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                           <div>
                             <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>なりたい状態 (ビジョン)</label>
                             <textarea value={currentIdealState} onChange={e => setCurrentIdealState(e.target.value)} style={{ width: '100%', minHeight: '80px', padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', resize: 'none' }} />
                           </div>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                             <div>
                               <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>チーム/構成目標</label>
                               <input value={currentTeamSizeTarget} onChange={e => setCurrentTeamSizeTarget(e.target.value)} style={{ width: '100%', padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px' }} />
                             </div>
                             <div>
                               <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>現在の実績</label>
                               <input value={currentTeamSizeResult} onChange={e => setCurrentTeamSizeResult(e.target.value)} style={{ width: '100%', padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px' }} />
                             </div>
                           </div>
                           <div>
                              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>重要KPIチャート</label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {currentKpis.map((kpi, idx) => (
                                  <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                                    <input value={kpi.label} onChange={e => {const n=[...currentKpis]; n[idx].label=e.target.value; setCurrentKpis(n)}} style={{ flex: 1, padding: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
                                    <input value={kpi.value} onChange={e => {const n=[...currentKpis]; n[idx].value=e.target.value; setCurrentKpis(n)}} placeholder="数値" style={{ flex: 1, padding: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }} />
                                  </div>
                                ))}
                              </div>
                           </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'mandala' && (
                      <div style={{ overflowX: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', minWidth: '800px', backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '16px' }}>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(bIdx => (
                            <div key={bIdx} style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(3, 1fr)', 
                              gap: '4px', 
                              padding: '6px', 
                              backgroundColor: bIdx === 4 ? '#eff6ff' : '#ffffff', 
                              borderRadius: '10px',
                              border: bIdx === 4 ? '1px solid #3b82f6' : '1px solid #e2e8f0'
                            }}>
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(cIdx => {
                                if (bIdx === 4) {
                                  if (cIdx === 4) return <textarea key={cIdx} value={currentMandalaData.centerGoal} onChange={e => setCurrentMandalaData({...currentMandalaData, centerGoal: e.target.value})} placeholder="最終目標" style={{ width: '100%', aspectRatio: '1', padding: '4px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '4px', resize: 'none' }} />;
                                  const sIdx = cIdx < 4 ? cIdx : cIdx - 1;
                                  return <textarea key={cIdx} value={currentMandalaData.subGoals[sIdx].goal} onChange={e => { const n = [...currentMandalaData.subGoals]; n[sIdx].goal = e.target.value; setCurrentMandalaData({...currentMandalaData, subGoals: n}); }} placeholder={`目標${sIdx+1}`} style={{ width: '100%', aspectRatio: '1', padding: '4px', textAlign: 'center', fontSize: '9px', fontWeight: 'bold', border: 'none', background: '#fff', color: '#1e40af', borderRadius: '4px', resize: 'none' }} />;
                                }
                                const sIdx = bIdx < 4 ? bIdx : bIdx - 1;
                                if (cIdx === 4) return <div key={cIdx} style={{ width: '100%', aspectRatio: '1', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '9px', fontWeight: 'bold', background: '#dbeafe', color: '#1e40af', borderRadius: '4px', overflow: 'hidden', lineClamp: 3 }}>{currentMandalaData.subGoals[sIdx].goal || `目標${sIdx+1}`}</div>;
                                const aIdx = cIdx < 4 ? cIdx : cIdx - 1;
                                return <textarea key={cIdx} value={currentMandalaData.subGoals[sIdx].actions[aIdx]} onChange={e => { const n = [...currentMandalaData.subGoals]; n[sIdx].actions[aIdx] = e.target.value; setCurrentMandalaData({...currentMandalaData, subGoals: n}); }} placeholder="行動" style={{ width: '100%', aspectRatio: '1', padding: '4px', textAlign: 'center', fontSize: '8px', border: 'none', background: '#f8fafc', color: '#334155', borderRadius: '4px', resize: 'none' }} />;
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Reflection Card */}
                  <section style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#374151', fontWeight: 'bold' }}>
                      <MessageSquare size={18} color="#10b981" /> 振り返りと気づき
                    </div>
                    {activeTab === 'day' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {RATINGS.map(r => (
                            <button 
                              key={r} 
                              onClick={() => setCurrentOverallRating(currentOverallRating === r ? '' : r)}
                              style={{ 
                                flex: 1, padding: '12px 0', border: '2px solid', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                                borderColor: currentOverallRating === r ? '#2563eb' : '#f3f4f6',
                                backgroundColor: currentOverallRating === r ? '#2563eb' : '#ffffff',
                                color: currentOverallRating === r ? '#ffffff' : '#94a3b8'
                              }}
                            >
                              {r || 'なし'}
                            </button>
                          ))}
                        </div>
                        <textarea value={currentGoodPoints} onChange={e => setCurrentGoodPoints(e.target.value)} placeholder="今日良かったこと・成果" style={{ width: '100%', minHeight: '60px', padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', resize: 'none' }} />
                        <textarea value={currentRedoPoints} onChange={e => setCurrentRedoPoints(e.target.value)} placeholder="明日への改善点・やり直すなら" style={{ width: '100%', minHeight: '60px', padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', resize: 'none' }} />
                      </div>
                    ) : (
                      <textarea 
                        value={currentReflection} 
                        onChange={e => setCurrentReflection(e.target.value)} 
                        placeholder="今期間の総括、マインドの変化、次のアクション..." 
                        style={{ width: '100%', minHeight: '120px', padding: '16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', fontSize: '14px', resize: 'none' }} 
                      />
                    )}
                    <div style={{ marginTop: '16px' }}>
                      <button onClick={summarizeReflectionWithAi} disabled={isAiLoading || (!currentReflection && !currentGoodPoints)} style={{ padding: '8px 16px', backgroundColor: '#ecfdf5', color: '#10b981', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} /> AIで振り返りを整理
                      </button>
                    </div>
                  </section>

                  {/* Actions Footer */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <button 
                      onClick={() => { if(activeTab==='day') generateDaySummary(); if(activeTab==='week') generateWeekSummary(); if(activeTab==='mandala') generateMandalaSummary(); }}
                      disabled={isAiLoading}
                      style={{ padding: '16px', backgroundColor: '#ffffff', border: '2px solid #2563eb', color: '#2563eb', borderRadius: '16px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <FileText size={18} /> まとめ生成
                    </button>
                    <button 
                      onClick={handleReset}
                      style={{ padding: '16px', backgroundColor: '#ffffff', border: '2px solid #e5e7eb', color: '#6b7280', borderRadius: '16px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <RefreshCw size={18} /> クリア
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={!currentGoal.trim() && activeTab !== 'day'}
                      style={{ padding: '16px', backgroundColor: '#2563eb', border: 'none', color: '#ffffff', borderRadius: '16px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Save size={18} /> 保存する
                    </button>
                  </div>
                </div>

                {/* Right Side: AI Results */}
                <aside style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '90px', maxHeight: 'calc(100vh - 120px)' }}>
                  
                  {isAiLoading && (
                    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e5e7eb' }}>
                      <RefreshCw size={32} style={{ color: '#2563eb', animation: 'spin 2s linear infinite' }} />
                      <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>AI分析中...</p>
                    </div>
                  )}

                  {aiResponse && !isAiLoading && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: '#eff6ff', borderRadius: '20px', border: '1px solid #dbeafe', padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                          <Sparkles size={18} /> AIアドバイス
                        </h3>
                        <button onClick={() => copyToClipboard(aiResponse)} style={{ padding: '6px', backgroundColor: '#ffffff', border: 'none', borderRadius: '6px', color: '#2563eb', cursor: 'pointer' }}>
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#1e3a8a', maxHeight: '200px', overflowY: 'auto' }}>
                        <ReactMarkdown>{aiResponse}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}

                  {formattedSummary && !isAiLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '2px solid #111827', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                          <FileText size={18} /> コピー用まとめ
                        </h3>
                        <button 
                          onClick={() => copyToClipboard(formattedSummary)} 
                          style={{ 
                            padding: '6px 12px', backgroundColor: '#111827', border: 'none', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' 
                          }}
                        >
                          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? '完了' : 'コピー'}
                        </button>
                      </div>
                      <pre style={{ 
                        margin: 0, 
                        padding: '16px', 
                        backgroundColor: '#f9fafb', 
                        borderRadius: '12px', 
                        fontSize: '13px', 
                        lineHeight: '1.5', 
                        whiteSpace: 'pre-wrap', 
                        maxHeight: '400px', 
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        color: '#111827',
                        border: '1px solid #e5e7eb'
                      }}>
                        {formattedSummary}
                      </pre>
                    </motion.div>
                  )}

                  {!aiResponse && !formattedSummary && !isAiLoading && (
                    <div style={{ border: '2px dashed #e5e7eb', borderRadius: '20px', padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
                      <Sparkles size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                      <p style={{ fontSize: '13px' }}>AIの分析結果やコピー用の<br />まとめを表示します</p>
                    </div>
                  )}
                </aside>
              </div>
            </motion.div>
          ) : (
            <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={24} color="#2563eb" /> {PERIOD_LABELS[activeTab]}の記録一覧
              </h2>
              {filteredEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px', backgroundColor: '#ffffff', borderRadius: '24px', border: '2px dashed #e5e7eb', color: '#94a3b8' }}>
                  記録はまだありません
                </div>
              ) : (
                filteredEntries.map(entry => (
                  <div key={entry.id} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #e5e7eb', transition: 'all 0.2s', cursor: 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>
                        {entry.displayDate || entry.weekRange || new Date(entry.date).toLocaleDateString()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(entry.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: '4px 0 12px 0' }}>{entry.goal || "無題の目標"}</h3>
                    <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                      {entry.reflection}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        body { margin: 0; padding: 0; }
        .card { transition: all 0.2s ease-in-out; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @media (max-width: 640px) {
           .sm-inline { display: none; }
        }
      `}</style>
    </div>
  );
}
