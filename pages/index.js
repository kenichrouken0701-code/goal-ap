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

  // --- AI Actions ---
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

    const prompt = `【期間】${currentWeekRange}
【今週の目標】${currentGoal || '未入力'}
【振り返り内容】
${currentReflection || '未入力'}

【日別データ】
${dailyLogText}`;

    const system = `あなたは優秀なコーチです。1週間の振り返りを分析し、指定のフォーマットで出力してください。
入力が空の項目も省略せず、デイリーログまで含めて出力してください。

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

  return (
    <div className="min-h-screen pb-20 bg-[#f8f9fa]">
      <Head>
        <title>Goal Layer - 8-7シート</title>
      </Head>

      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Target className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">8-7シート <span className="text-blue-600 font-normal text-sm ml-1">Goal Layer</span></h1>
          </div>
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <History className={`w-5 h-5 ${showHistory ? 'text-blue-600' : 'text-gray-500'}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8 max-w-3xl mx-auto">
          {Object.keys(PERIOD_LABELS).map((period) => (
            <button
              key={period}
              onClick={() => { setActiveTab(period); setAiResponse(null); setFormattedSummary(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === period ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {PERIOD_ICONS[period]}
              {PERIOD_LABELS[period]}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!showHistory ? (
            <motion.div key="editor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 w-full space-y-6">
                {/* Goal Section */}
                <section className="card p-6">
                  {activeTab === 'day' && (
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <h2 className="font-semibold">日付</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" value={currentDisplayDate} onChange={(e) => setCurrentDisplayDate(e.target.value)} className="text-sm font-mono p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none w-[120px] text-center" />
                        <button onClick={() => setCurrentDisplayDate(getTodayDisplayDate())} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><RefreshCw className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                  {activeTab === 'week' && (
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <h2 className="font-semibold">期間</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" value={currentWeekRange} onChange={(e) => setCurrentWeekRange(e.target.value)} className="text-sm font-mono p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none w-[200px] text-center" />
                        <button onClick={() => setCurrentWeekRange(getWeekRange())} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><RefreshCw className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <Target className="w-5 h-5 text-blue-500" />
                    <h2 className="font-semibold">{PERIOD_LABELS[activeTab]}の目標</h2>
                  </div>
                  <textarea value={currentGoal} onChange={(e) => setCurrentGoal(e.target.value)} placeholder="具体的に何を達成したいですか？" className="w-full min-h-[80px] p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" />
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button onClick={refineGoalWithAi} disabled={isAiLoading || !currentGoal} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50 transition-colors">
                      <Sparkles className="w-4 h-4" /> AIで目標を改善
                    </button>
                    <button onClick={decomposeGoalWithAi} disabled={isAiLoading || !currentGoal} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 disabled:opacity-50 transition-colors">
                      <ListTodo className="w-4 h-4" /> 行動に分解
                    </button>
                  </div>
                </section>

                {/* Year Tab Content */}
                {activeTab === 'year' && (
                  <section className="card p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold flex items-center gap-2"><Target className="w-5 h-5 text-blue-500" /> 年間ライフデザイン</h2>
                      <div className="flex items-center gap-2">
                        <input type="text" value={currentYear} onChange={e => setCurrentYear(e.target.value)} className="w-20 p-2 bg-gray-50 border border-gray-200 rounded-lg text-center font-mono" />
                        <span className="text-sm text-gray-500">年</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">なりたい状態（ビジョン）</label>
                        <textarea value={currentIdealState} onChange={e => setCurrentIdealState(e.target.value)} placeholder="1年後、どんな自分になっていたいですか？" className="w-full min-h-[80px] p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">チーム目標（人数）</label>
                          <input type="text" value={currentTeamSizeTarget} onChange={e => setCurrentTeamSizeTarget(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">チーム実績</label>
                          <input type="text" value={currentTeamSizeResult} onChange={e => setCurrentTeamSizeResult(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">重要KPI</label>
                        {currentKpis.map((kpi, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input type="text" value={kpi.label} onChange={e => { const n = [...currentKpis]; n[idx].label = e.target.value; setCurrentKpis(n); }} className="w-1/3 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs" />
                            <input type="text" value={kpi.value} onChange={e => { const n = [...currentKpis]; n[idx].value = e.target.value; setCurrentKpis(n); }} placeholder="数値" className="w-2/3 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs" />
                          </div>
                        ))}
                      </div>
                      <button onClick={analyzeYearlyResultsWithAi} disabled={isAiLoading} className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                        <BarChart3 className="w-4 h-4" /> 年間結果を分析
                      </button>
                    </div>
                  </section>
                )}

                {/* Month Tab Content */}
                {activeTab === 'month' && (
                  <section className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-semibold flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-purple-500" /> 年間カレンダー (12ヶ月俯瞰)</h2>
                      <div className="flex gap-2">
                        <button onClick={analyzeYearlyTrendsWithAi} disabled={isAiLoading} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors" title="年間分析"><BarChart3 className="w-4 h-4" /></button>
                        <button onClick={generateNextYearPlanWithAi} disabled={isAiLoading} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="来年プラン生成"><ArrowRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {currentMonthlyData.map((m, idx) => (
                        <div key={m.month} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-purple-200 transition-colors space-y-2">
                          <div className="flex justify-between items-center border-b border-gray-50 pb-1">
                            <span className="text-xs font-bold text-purple-600">{m.month}</span>
                            <div className="flex gap-0.5">
                              {RATINGS.map(r => <button key={r} onClick={() => updateMonthlyData(idx, 'rating', m.rating === r ? '' : r)} className={`w-3.5 h-3.5 flex items-center justify-center rounded text-[7px] ${m.rating === r ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{r}</button>)}
                            </div>
                          </div>
                          <textarea value={m.goal} onChange={e => updateMonthlyData(idx, 'goal', e.target.value)} placeholder="目標" className="w-full text-[10px] p-1 bg-gray-50 rounded outline-none h-10 resize-none" />
                          <input type="text" value={m.theme} onChange={e => updateMonthlyData(idx, 'theme', e.target.value)} placeholder="テーマ" className="w-full text-[10px] p-1 bg-purple-50/30 rounded outline-none" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Day Schedule */}
                {activeTab === 'day' && (
                  <section className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <h2 className="font-semibold">タイムスケジュール</h2>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={optimizeScheduleWithAi} disabled={isAiLoading} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors" title="最適化"><Zap className="w-4 h-4" /></button>
                        <button onClick={extractFocusTasksWithAi} disabled={isAiLoading} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="重要タスク"><ListTodo className="w-4 h-4" /></button>
                        <button onClick={analyzeScheduleWithAi} disabled={isAiLoading} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="分析"><BarChart3 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                      {currentSchedule.map((block, idx) => (
                        <div key={block.time} className="grid grid-cols-[60px_1fr_1fr_80px] gap-2 items-center py-2 border-b border-gray-50">
                          <div className="text-xs font-mono text-gray-400">{block.time}</div>
                          <input type="text" value={block.plan} onChange={(e) => { const n = [...currentSchedule]; n[idx].plan = e.target.value; setCurrentSchedule(n); }} placeholder="予定" className="text-sm p-2 bg-gray-50 rounded-lg outline-none" />
                          <input type="text" value={block.actual} onChange={(e) => { const n = [...currentSchedule]; n[idx].actual = e.target.value; setCurrentSchedule(n); }} placeholder="実績" className="text-sm p-2 bg-blue-50/30 rounded-lg outline-none" />
                          <div className="flex gap-0.5">
                            {RATINGS.map(r => (
                              <button key={r} onClick={() => { const n = [...currentSchedule]; n[idx].rating = n[idx].rating === r ? '' : r; setCurrentSchedule(n); }} className={`w-4 h-4 flex items-center justify-center rounded text-[8px] ${block.rating === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{r}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Week Data */}
                {activeTab === 'week' && (
                  <section className="card p-6 overflow-x-auto">
                    <div className="grid grid-cols-7 gap-2 min-w-[600px]">
                      {WEEKDAYS.map(d => <div key={d} className="text-center py-2 bg-gray-50 rounded text-xs font-bold">{d}</div>)}
                      {currentWeeklyDays.map((d, idx) => (
                        <div key={idx} className="space-y-2 p-2 bg-white border border-gray-100 rounded shadow-sm">
                          <textarea value={d.goal} onChange={(e) => updateWeeklyDay(idx, 'goal', e.target.value)} placeholder="目標" className="w-full text-[10px] p-1 bg-gray-50 rounded outline-none h-10 resize-none" />
                          <textarea value={d.tasks} onChange={(e) => updateWeeklyDay(idx, 'tasks', e.target.value)} placeholder="最重要タスク" className="w-full text-[10px] p-1 bg-blue-50/30 rounded outline-none h-10 resize-none" />
                          <div className="flex justify-between gap-0.5">
                            {RATINGS.map(r => <button key={r} onClick={() => updateWeeklyDay(idx, 'rating', d.rating === r ? '' : r)} className={`flex-1 h-4 text-[8px] rounded ${d.rating === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{r}</button>)}
                          </div>
                          <textarea value={d.memo} onChange={(e) => updateWeeklyDay(idx, 'memo', e.target.value)} placeholder="メモ" className="w-full text-[10px] p-1 bg-gray-50 rounded outline-none h-10 resize-none" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Mandala Chart */}
                {activeTab === 'mandala' && (
                  <section className="card p-4 overflow-x-auto">
                    <div className="grid grid-cols-3 gap-2 min-w-[600px]">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(bIdx => (
                        <div key={bIdx} className={`grid grid-cols-3 gap-1 p-1 rounded-lg ${bIdx === 4 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(cIdx => {
                            if (bIdx === 4) {
                              if (cIdx === 4) return <textarea key={cIdx} value={currentMandalaData.centerGoal} onChange={e => setCurrentMandalaData({...currentMandalaData, centerGoal: e.target.value})} placeholder="最終目標" className="w-full aspect-square p-1 text-[8px] font-bold text-center bg-blue-600 text-white rounded outline-none resize-none" />;
                              const sIdx = cIdx < 4 ? cIdx : cIdx - 1;
                              return <textarea key={cIdx} value={currentMandalaData.subGoals[sIdx].goal} onChange={e => { const n = [...currentMandalaData.subGoals]; n[sIdx].goal = e.target.value; setCurrentMandalaData({...currentMandalaData, subGoals: n}); }} placeholder={`中目標${sIdx+1}`} className="w-full aspect-square p-1 text-[7px] font-bold text-center bg-white border border-blue-200 rounded outline-none resize-none" />;
                            }
                            const sIdx = bIdx < 4 ? bIdx : bIdx - 1;
                            if (cIdx === 4) return <div key={cIdx} className="w-full aspect-square p-1 text-[7px] font-bold text-center bg-blue-100 text-blue-800 rounded flex items-center justify-center break-all">{currentMandalaData.subGoals[sIdx].goal || `中目標${sIdx+1}`}</div>;
                            const aIdx = cIdx < 4 ? cIdx : cIdx - 1;
                            return <textarea key={cIdx} value={currentMandalaData.subGoals[sIdx].actions[aIdx]} onChange={e => { const n = [...currentMandalaData.subGoals]; n[sIdx].actions[aIdx] = e.target.value; setCurrentMandalaData({...currentMandalaData, subGoals: n}); }} placeholder="行動" className="w-full aspect-square p-1 text-[6px] text-center bg-white border border-gray-200 rounded outline-none resize-none" />;
                          })}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Reflection Section */}
                <section className="card p-6">
                  <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                    <h2 className="font-semibold">振り返り</h2>
                  </div>
                  {activeTab === 'day' ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        {RATINGS.map(r => <button key={r} onClick={() => setCurrentOverallRating(currentOverallRating === r ? '' : r)} className={`flex-1 py-2 rounded-xl border-2 transition-all font-bold ${currentOverallRating === r ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-400'}`}>{r || 'なし'}</button>)}
                      </div>
                      <textarea value={currentGoodPoints} onChange={e => setCurrentGoodPoints(e.target.value)} placeholder="良かったこと" className="w-full min-h-[60px] p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm resize-none" />
                      <textarea value={currentRedoPoints} onChange={e => setCurrentRedoPoints(e.target.value)} placeholder="今日1日やり直せるなら" className="w-full min-h-[60px] p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm resize-none" />
                      <button onClick={summarizeReflectionWithAi} disabled={isAiLoading || (!currentGoodPoints && !currentRedoPoints)} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 disabled:opacity-50 transition-colors">
                        <Sparkles className="w-4 h-4" /> AIで振り返りを要約
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <textarea value={currentReflection} onChange={e => setCurrentReflection(e.target.value)} placeholder="気づきや成果、課題" className="w-full min-h-[100px] p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none" />
                      <button onClick={summarizeReflectionWithAi} disabled={isAiLoading || !currentReflection} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 disabled:opacity-50 transition-colors">
                        <Sparkles className="w-4 h-4" /> AIで振り返りを要約
                      </button>
                    </div>
                  )}
                </section>

                <div className="grid grid-cols-3 gap-4">
                  <button onClick={() => { if(activeTab==='day') generateDaySummary(); if(activeTab==='week') generateWeekSummary(); if(activeTab==='mandala') generateMandalaSummary(); }} disabled={isAiLoading} className="py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-2xl font-bold hover:bg-blue-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" /> まとめを生成
                  </button>
                  <button onClick={handleReset} className="py-4 bg-white border-2 border-gray-300 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5" /> リセット
                  </button>
                  <button onClick={handleSave} disabled={!currentGoal.trim() && activeTab !== 'day'} className="py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> 保存する
                  </button>
                </div>
              </div>

              {/* Right Column: AI Output */}
              <div className="lg:w-[400px] w-full space-y-6 lg:sticky lg:top-24 h-fit">
                {isAiLoading && (
                  <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                    <p className="text-sm text-gray-500">AI思考中...</p>
                  </div>
                )}

                {aiResponse && !isAiLoading && (
                  <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-blue-900 flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-600" /> AIアドバイス</h3>
                      <button onClick={() => copyToClipboard(aiResponse)} className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="prose prose-blue prose-sm max-w-none text-blue-800"><ReactMarkdown>{aiResponse}</ReactMarkdown></div>
                  </motion.section>
                )}

                {formattedSummary && !isAiLoading && (
                  <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 text-gray-100 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> まとめ（コピー用）</h3>
                      <button onClick={() => copyToClipboard(formattedSummary)} className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors">
                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} {copied ? '完了' : 'コピー'}
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-800/50 p-4 rounded-xl border border-gray-700 overflow-x-auto max-h-[500px]">{formattedSummary}</pre>
                  </motion.section>
                )}

                {!aiResponse && !formattedSummary && !isAiLoading && (
                  <div className="hidden lg:flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-2xl text-gray-300">
                    <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">生成結果がここに表示されます</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><History className="w-5 h-5 text-blue-600" /> {PERIOD_LABELS[activeTab]}の履歴</h2>
              {filteredEntries.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">記録がありません</div>
              ) : (
                filteredEntries.map(entry => (
                  <div key={entry.id} className="card p-6 hover:border-blue-200 transition-colors">
                    <div className="text-xs text-gray-400 mb-2">{entry.displayDate || entry.weekRange || new Date(entry.date).toLocaleDateString()}</div>
                    <h3 className="font-bold text-gray-800 mb-2">{entry.goal || "無題の目標"}</h3>
                    <p className="text-sm text-gray-600 italic">&ldquo;{entry.reflection}&rdquo;</p>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
