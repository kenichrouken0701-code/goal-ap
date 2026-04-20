import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';

const TABS = ['1日', '1週間', '1ヵ月', '1年', 'マンダラ'];
const WEEK_DAYS = ['月', '火', '水', '木', '金', '土', '日'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const CIRCLE_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
const STORAGE_KEY = 'goal_layer_mobile_v1';

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function getThisYear() {
  return String(new Date().getFullYear());
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (d) =>
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

  return `${format(monday)}～${format(sunday)}`;
}

function generateInitialSchedule() {
  const hours = [];
  for (let i = 7; i <= 23; i += 1) hours.push(`${String(i).padStart(2, '0')}:00`);
  for (let i = 0; i <= 2; i += 1) hours.push(`${String(i).padStart(2, '0')}:00`);
  return hours.map((time) => ({ time, content: '' }));
}

function generateInitialWeekDays() {
  return WEEK_DAYS.map((day) => ({
    day,
    goal: '',
    task: '',
    rating: '',
    memo: '',
  }));
}

function generateInitialMonthsData() {
  return MONTHS.map((month) => ({
    month,
    goal: '',
    teamTarget: '',
    teamResult: '',
    theme: '',
    rating: '',
    reflection: '',
  }));
}

function generateInitialMandalaData() {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    goal: '',
    actions: Array(8).fill(''),
  }));
}

function getInitialState() {
  return {
    activeTab: '1日',
    day: {
      date: getToday(),
      goal: '',
      schedule: generateInitialSchedule(),
      achievement: '',
      goodThings: '',
      redo: '',
    },
    week: {
      range: getWeekRange(),
      goal: '',
      days: generateInitialWeekDays(),
      goodFlow: '',
      improvement: '',
      nextAction: '',
    },
    month: {
      year: getThisYear(),
      annualGoal: '',
      data: generateInitialMonthsData(),
    },
    year: {
      year: getThisYear(),
      idealState: '',
      goal: '',
      teamTarget: '',
      teamResult: '',
      achievement: '',
      goodPoints: '',
      improvement: '',
      nextAction: '',
    },
    mandala: {
      date: getToday(),
      centerGoal: '',
      subGoals: generateInitialMandalaData(),
      selectedIndex: null,
    },
  };
}

async function callGemini(systemText, userText) {
  if (typeof window === 'undefined') {
    return 'ブラウザ環境でのみ実行できます。';
  }

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return 'AI機能を使うには、VercelのEnvironment Variablesに NEXT_PUBLIC_GEMINI_API_KEY を追加してください。';
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemText}\n\n${userText}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('Gemini API error:', data);
      return `AI呼び出しに失敗しました。${data?.error?.message || '不明なエラーです。'}`;
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Gemini empty response:', data);
      return 'AIから返答を取得できませんでした。';
    }

    return text;
  } catch (error) {
    console.error('Gemini fetch error:', error);
    return 'AI通信中にエラーが発生しました。';
  }
}

export default function Home() {
  const [state, setState] = useState(getInitialState());
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('load error', e);
    } finally {
      setLoaded(true);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!loaded || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const activeTab = state.activeTab;

  const setActiveTab = (tab) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
    setAiText('');
    setCopied(false);
  };

  const updateDay = (field, value) => {
    setState((prev) => ({
      ...prev,
      day: { ...prev.day, [field]: value },
    }));
  };

  const updateDaySchedule = (index, value) => {
    setState((prev) => {
      const next = [...prev.day.schedule];
      next[index] = { ...next[index], content: value };
      return {
        ...prev,
        day: { ...prev.day, schedule: next },
      };
    });
  };

  const updateWeek = (field, value) => {
    setState((prev) => ({
      ...prev,
      week: { ...prev.week, [field]: value },
    }));
  };

  const updateWeekDay = (index, field, value) => {
    setState((prev) => {
      const next = [...prev.week.days];
      next[index] = { ...next[index], [field]: value };
      return {
        ...prev,
        week: { ...prev.week, days: next },
      };
    });
  };

  const updateMonth = (field, value) => {
    setState((prev) => ({
      ...prev,
      month: { ...prev.month, [field]: value },
    }));
  };

  const updateMonthItem = (index, field, value) => {
    setState((prev) => {
      const next = [...prev.month.data];
      next[index] = { ...next[index], [field]: value };
      return {
        ...prev,
        month: { ...prev.month, data: next },
      };
    });
  };

  const updateYear = (field, value) => {
    setState((prev) => ({
      ...prev,
      year: { ...prev.year, [field]: value },
    }));
  };

  const updateMandala = (field, value) => {
    setState((prev) => ({
      ...prev,
      mandala: { ...prev.mandala, [field]: value },
    }));
  };

  const updateMandalaGoal = (index, value) => {
    setState((prev) => {
      const next = [...prev.mandala.subGoals];
      next[index] = { ...next[index], goal: value };
      return {
        ...prev,
        mandala: { ...prev.mandala, subGoals: next },
      };
    });
  };

  const updateMandalaAction = (goalIndex, actionIndex, value) => {
    setState((prev) => {
      const next = [...prev.mandala.subGoals];
      const nextActions = [...next[goalIndex].actions];
      nextActions[actionIndex] = value;
      next[goalIndex] = { ...next[goalIndex], actions: nextActions };
      return {
        ...prev,
        mandala: { ...prev.mandala, subGoals: next },
      };
    });
  };

  const resetCurrentTab = () => {
    if (typeof window !== 'undefined' && !window.confirm(`${activeTab}タブの内容をリセットしますか？`)) {
      return;
    }

    const initial = getInitialState();
    setAiText('');
    setCopied(false);

    setState((prev) => {
      switch (prev.activeTab) {
        case '1日':
          return { ...prev, day: initial.day };
        case '1週間':
          return { ...prev, week: initial.week };
        case '1ヵ月':
          return { ...prev, month: initial.month };
        case '1年':
          return { ...prev, year: initial.year };
        case 'マンダラ':
          return { ...prev, mandala: initial.mandala };
        default:
          return prev;
      }
    });
  };

  const copyText = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('copy error', e);
    }
  };

  const daySummary = useMemo(() => {
    const scheduleText = state.day.schedule
      .filter((item) => item.content.trim() !== '')
      .map((item) => `${item.time} ${item.content}`)
      .join('\n');

    return `■日付
${state.day.date}

■1日の目標
${state.day.goal}

■タイムスケジュール
${scheduleText}

■振り返り
【達成度】
${state.day.achievement}

【良かったこと】
${state.day.goodThings}

【今日1日やり直せるなら】
${state.day.redo}`;
  }, [state.day]);

  const weekSummary = useMemo(() => {
    const ratingsText = state.week.days.map((d) => `${d.day}：${d.rating}`).join('\n');

    const dailyLogText = state.week.days
      .map(
        (d) => `【${d.day}】
・目標：${d.goal}
・最重要タスク：${d.task}
・達成度：${d.rating}
・メモ：${d.memo}`
      )
      .join('\n\n');

    return `■期間
${state.week.range}

■今週の目標
${state.week.goal}

■週間サマリー

【達成状況】
${ratingsText}

【良かった流れ】
${state.week.goodFlow}

【改善ポイント】
${state.week.improvement}

【来週のアクション】
${state.week.nextAction}

■デイリーログ

${dailyLogText}`;
  }, [state.week]);

  const monthSummary = useMemo(() => {
    const text = state.month.data
      .map(
        (m) => `【${m.month}】
・目標：${m.goal}
・チーム人数：目標 ${m.teamTarget} / 結果 ${m.teamResult}
・テーマ：${m.theme}
・達成度：${m.rating}
・振り返り：${m.reflection}`
      )
      .join('\n\n');

    return `■年
${state.month.year}

■年間目標
${state.month.annualGoal}

■年間サマリー

${text}`;
  }, [state.month]);

  const yearSummary = useMemo(() => {
    return `■年
${state.year.year}

■なりたい状態
${state.year.idealState}

■年間目標
${state.year.goal}

■チーム人数
目標：${state.year.teamTarget}
結果：${state.year.teamResult}

■総括

【達成度】
${state.year.achievement}

【良かった点】
${state.year.goodPoints}

【改善点】
${state.year.improvement}

【来年のアクション】
${state.year.nextAction}`;
  }, [state.year]);

  const mandalaSummary = useMemo(() => {
    const strategyText = state.mandala.subGoals
      .map((sg, i) => `${CIRCLE_NUMBERS[i]} ${sg.goal}`)
      .join('\n');

    const actionPlanText = state.mandala.subGoals
      .map((sg, i) => {
        const actions = sg.actions
          .filter((a) => a.trim() !== '')
          .map((a) => `・${a}`)
          .join('\n');
        return `【${CIRCLE_NUMBERS[i]} ${sg.goal}】
${actions || '（未入力）'}`;
      })
      .join('\n\n');

    return `■作成日
${state.mandala.date}

■最終目標
${state.mandala.centerGoal}

■中目標
${strategyText}

■行動プラン

${actionPlanText}`;
  }, [state.mandala]);

  const currentSummary = useMemo(() => {
    switch (activeTab) {
      case '1日':
        return daySummary;
      case '1週間':
        return weekSummary;
      case '1ヵ月':
        return monthSummary;
      case '1年':
        return yearSummary;
      case 'マンダラ':
        return mandalaSummary;
      default:
        return '';
    }
  }, [activeTab, daySummary, weekSummary, monthSummary, yearSummary, mandalaSummary]);

  const handleAI = async () => {
    setAiLoading(true);
    setAiText('');

    try {
      let systemText = '';
      let userText = '';

      if (activeTab === '1日') {
        systemText =
          'あなたは優秀なアシスタントです。入力された1日の内容を整理し、改善ポイントと簡潔なまとめを日本語で出力してください。';
        userText = daySummary;
      } else if (activeTab === '1週間') {
        systemText =
          'あなたは優秀なコーチです。1週間の記録を分析し、良かった流れ、改善ポイント、来週のアクションを日本語でわかりやすく出力してください。';
        userText = weekSummary;
      } else if (activeTab === '1ヵ月') {
        systemText =
          'あなたは優秀な振り返りコーチです。1年の12ヶ月ログを見て、全体傾向と改善ポイントを日本語で簡潔にまとめてください。';
        userText = monthSummary;
      } else if (activeTab === '1年') {
        systemText =
          'あなたは優秀なビジネスコーチです。1年の目標と結果から、総括と来年の改善アクションを日本語で出力してください。';
        userText = yearSummary;
      } else {
        systemText =
          'あなたは思考整理コーチです。マンダラチャートの内容を見て、重要な戦略ポイントと今すぐやるべきことを日本語で簡潔にまとめてください。';
        userText = mandalaSummary;
      }

      const result = await callGemini(systemText, userText);
      setAiText(result);
    } catch (e) {
      console.error(e);
      setAiText('AI処理でエラーが発生しました。');
    } finally {
      setAiLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#111827',
      fontFamily: 'sans-serif',
      paddingBottom: 48,
    },
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: isMobile ? '14px 14px' : '18px 20px',
    },
    container: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: isMobile ? 12 : 20,
    },
    title: {
      margin: 0,
      fontSize: isMobile ? 20 : 24,
      fontWeight: 900,
      letterSpacing: '-0.4px',
      lineHeight: 1.2,
    },
    subtitle: {
      color: '#2563eb',
      fontSize: isMobile ? 11 : 12,
      fontWeight: 700,
      marginLeft: 8,
    },
    tabsWrap: {
      display: 'flex',
      gap: 8,
      backgroundColor: '#f1f5f9',
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      padding: 6,
      overflowX: 'auto',
      marginBottom: 16,
      WebkitOverflowScrolling: 'touch',
    },
    tabButton: (active) => ({
      border: 'none',
      cursor: 'pointer',
      minWidth: isMobile ? 74 : 88,
      whiteSpace: 'nowrap',
      padding: isMobile ? '10px 12px' : '12px 14px',
      borderRadius: 10,
      backgroundColor: active ? '#ffffff' : 'transparent',
      color: active ? '#2563eb' : '#64748b',
      fontWeight: 700,
      fontSize: isMobile ? 13 : 14,
      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
      flex: isMobile ? '0 0 auto' : 1,
    }),
    shellCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 18 : 24,
      boxShadow: '0 6px 18px rgba(15,23,42,0.05)',
      padding: isMobile ? 14 : 24,
    },
    shellTitle: {
      margin: '0 0 18px 0',
      fontSize: isMobile ? 20 : 24,
      fontWeight: 900,
      color: '#111827',
      borderBottom: '2px solid #f1f5f9',
      paddingBottom: 10,
    },
    twoCol: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.4fr) minmax(300px, 0.9fr)',
      gap: isMobile ? 18 : 24,
    },
    leftCol: {
      minWidth: 0,
      order: 1,
    },
    rightCol: {
      minWidth: 0,
      order: isMobile ? 0 : 1,
    },
    section: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 14 : 18,
      padding: isMobile ? 14 : 20,
      marginBottom: 14,
    },
    sectionTitle: {
      margin: '0 0 14px 0',
      fontWeight: 800,
      fontSize: isMobile ? 15 : 16,
      color: '#111827',
    },
    label: {
      display: 'block',
      fontSize: 12,
      color: '#64748b',
      marginBottom: 6,
      fontWeight: 700,
    },
    input: {
      width: '100%',
      padding: isMobile ? '11px 12px' : '12px 14px',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      backgroundColor: '#ffffff',
      color: '#111827',
      outline: 'none',
      fontSize: isMobile ? 13 : 14,
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: isMobile ? '11px 12px' : '12px 14px',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      backgroundColor: '#ffffff',
      color: '#111827',
      outline: 'none',
      fontSize: isMobile ? 13 : 14,
      minHeight: 90,
      resize: 'vertical',
      boxSizing: 'border-box',
    },
    summaryCard: {
      backgroundColor: '#ffffff',
      color: '#111827',
      padding: isMobile ? 14 : 20,
      borderRadius: isMobile ? 14 : 18,
      border: '1px solid #e5e7eb',
      fontFamily: 'monospace',
      fontSize: isMobile ? 12 : 13,
      lineHeight: 1.6,
      whiteSpace: 'pre-wrap',
      minHeight: isMobile ? 220 : 280,
      overflowWrap: 'anywhere',
      boxSizing: 'border-box',
    },
    buttonRow: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 12,
      justifyContent: isMobile ? 'stretch' : 'flex-start',
    },
    btnPrimary: {
      padding: isMobile ? '10px 12px' : '11px 16px',
      borderRadius: 10,
      border: 'none',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontWeight: 700,
      cursor: 'pointer',
      flex: isMobile ? 1 : 'none',
    },
    btnGhost: {
      padding: isMobile ? '10px 12px' : '11px 16px',
      borderRadius: 10,
      border: '1px solid #cbd5e1',
      backgroundColor: '#ffffff',
      color: '#334155',
      fontWeight: 700,
      cursor: 'pointer',
      flex: isMobile ? 1 : 'none',
    },
    btnDanger: {
      padding: isMobile ? '10px 12px' : '11px 16px',
      borderRadius: 10,
      border: '1px solid #fecaca',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      fontWeight: 700,
      cursor: 'pointer',
      flex: isMobile ? 1 : 'none',
    },
  };

  const renderDay = () => (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>基本情報</h3>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={styles.label}>日付</label>
            <input
              type="text"
              value={state.day.date}
              onChange={(e) => updateDay('date', e.target.value)}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>1日の目標を設定する</label>
            <textarea
              value={state.day.goal}
              onChange={(e) => updateDay('goal', e.target.value)}
              style={styles.textarea}
            />
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>タイムスケジュール</h3>
        <div style={{ maxHeight: isMobile ? 320 : 400, overflowY: 'auto', paddingRight: 4 }}>
          {state.day.schedule.map((item, index) => (
            <div
              key={item.time}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 0',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span
                style={{
                  width: isMobile ? 46 : 56,
                  fontSize: isMobile ? 11 : 12,
                  fontWeight: 700,
                  color: '#94a3b8',
                  flexShrink: 0,
                }}
              >
                {item.time}
              </span>
              <input
                type="text"
                value={item.content}
                onChange={(e) => updateDaySchedule(index, e.target.value)}
                style={{ ...styles.input, padding: isMobile ? '8px 10px' : '9px 12px', backgroundColor: '#f8fafc' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>振り返り</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <input
            type="text"
            value={state.day.achievement}
            onChange={(e) => updateDay('achievement', e.target.value)}
            placeholder="達成度（◎ / ○ / △ / ×）"
            style={styles.input}
          />
          <textarea
            value={state.day.goodThings}
            onChange={(e) => updateDay('goodThings', e.target.value)}
            placeholder="良かったこと"
            style={styles.textarea}
          />
          <textarea
            value={state.day.redo}
            onChange={(e) => updateDay('redo', e.target.value)}
            placeholder="今日1日やり直せるなら"
            style={styles.textarea}
          />
        </div>
      </div>
    </div>
  );

  const renderWeek = () => (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>週間設定</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <input
            type="text"
            value={state.week.range}
            onChange={(e) => updateWeek('range', e.target.value)}
            style={styles.input}
          />
          <textarea
            value={state.week.goal}
            onChange={(e) => updateWeek('goal', e.target.value)}
            placeholder="1週間の目標を設定する"
            style={styles.textarea}
          />
        </div>
      </div>

      <div style={{ ...styles.section, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <h3 style={styles.sectionTitle}>デイリーログ</h3>
        <div style={{ display: 'flex', gap: 10, minWidth: isMobile ? 700 : 840 }}>
          {state.week.days.map((d, idx) => (
            <div
              key={d.day}
              style={{
                flex: 1,
                minWidth: isMobile ? 150 : 0,
                padding: 12,
                backgroundColor: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  fontWeight: 800,
                  color: '#111827',
                  marginBottom: 10,
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: 6,
                  fontSize: isMobile ? 13 : 14,
                }}
              >
                {d.day}
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <input
                  type="text"
                  value={d.goal}
                  onChange={(e) => updateWeekDay(idx, 'goal', e.target.value)}
                  placeholder="その日の目標"
                  style={{ ...styles.input, fontSize: 12, padding: '8px 10px' }}
                />
                <input
                  type="text"
                  value={d.task}
                  onChange={(e) => updateWeekDay(idx, 'task', e.target.value)}
                  placeholder="最重要タスク"
                  style={{ ...styles.input, fontSize: 12, padding: '8px 10px' }}
                />
                <input
                  type="text"
                  value={d.rating}
                  onChange={(e) => updateWeekDay(idx, 'rating', e.target.value)}
                  placeholder="達成度"
                  style={{ ...styles.input, fontSize: 12, padding: '8px 10px' }}
                />
                <textarea
                  value={d.memo}
                  onChange={(e) => updateWeekDay(idx, 'memo', e.target.value)}
                  placeholder="一言メモ"
                  style={{ ...styles.textarea, fontSize: 12, padding: '8px 10px', minHeight: 70 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>振り返り</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <textarea
            value={state.week.goodFlow}
            onChange={(e) => updateWeek('goodFlow', e.target.value)}
            placeholder="良かった流れ"
            style={styles.textarea}
          />
          <textarea
            value={state.week.improvement}
            onChange={(e) => updateWeek('improvement', e.target.value)}
            placeholder="改善ポイント"
            style={styles.textarea}
          />
          <textarea
            value={state.week.nextAction}
            onChange={(e) => updateWeek('nextAction', e.target.value)}
            placeholder="来週のアクション"
            style={styles.textarea}
          />
        </div>
      </div>
    </div>
  );

  const renderMonth = () => (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>年間概況</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <input
            type="text"
            value={state.month.year}
            onChange={(e) => updateMonth('year', e.target.value)}
            placeholder="年"
            style={styles.input}
          />
          <textarea
            value={state.month.annualGoal}
            onChange={(e) => updateMonth('annualGoal', e.target.value)}
            placeholder="年間目標"
            style={styles.textarea}
          />
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>月別ログ</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10,
          }}
        >
          {state.month.data.map((m, idx) => (
            <div
              key={m.month}
              style={{
                padding: isMobile ? 10 : 12,
                backgroundColor: '#f8fafc',
                borderRadius: 14,
                border: '1px solid #e5e7eb',
                display: 'grid',
                gap: 6,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ textAlign: 'center', fontWeight: 800, color: '#111827', fontSize: isMobile ? 13 : 14 }}>
                {m.month}
              </div>
              <input
                type="text"
                value={m.goal}
                onChange={(e) => updateMonthItem(idx, 'goal', e.target.value)}
                placeholder="月の目標"
                style={{ ...styles.input, fontSize: 12, padding: '7px 9px' }}
              />
              <div style={{ display: 'flex', gap: 6, flexDirection: isMobile ? 'column' : 'row' }}>
                <input
                  type="text"
                  value={m.teamTarget}
                  onChange={(e) => updateMonthItem(idx, 'teamTarget', e.target.value)}
                  placeholder="目標"
                  style={{ ...styles.input, fontSize: 12, padding: '7px 9px' }}
                />
                <input
                  type="text"
                  value={m.teamResult}
                  onChange={(e) => updateMonthItem(idx, 'teamResult', e.target.value)}
                  placeholder="結果"
                  style={{ ...styles.input, fontSize: 12, padding: '7px 9px' }}
                />
              </div>
              <input
                type="text"
                value={m.theme}
                onChange={(e) => updateMonthItem(idx, 'theme', e.target.value)}
                placeholder="テーマ"
                style={{ ...styles.input, fontSize: 12, padding: '7px 9px' }}
              />
              <input
                type="text"
                value={m.rating}
                onChange={(e) => updateMonthItem(idx, 'rating', e.target.value)}
                placeholder="達成度"
                style={{ ...styles.input, fontSize: 12, padding: '7px 9px' }}
              />
              <textarea
                value={m.reflection}
                onChange={(e) => updateMonthItem(idx, 'reflection', e.target.value)}
                placeholder="一言振り返り"
                style={{ ...styles.textarea, fontSize: 12, padding: '7px 9px', minHeight: 60 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderYear = () => (
    <div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>年間ビジョン</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <input
            type="text"
            value={state.year.year}
            onChange={(e) => updateYear('year', e.target.value)}
            placeholder="年"
            style={styles.input}
          />
          <textarea
            value={state.year.idealState}
            onChange={(e) => updateYear('idealState', e.target.value)}
            placeholder="どういう状態になりたいか"
            style={styles.textarea}
          />
          <textarea
            value={state.year.goal}
            onChange={(e) => updateYear('goal', e.target.value)}
            placeholder="年間目標"
            style={styles.textarea}
          />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
            <input
              type="text"
              value={state.year.teamTarget}
              onChange={(e) => updateYear('teamTarget', e.target.value)}
              placeholder="チーム人数（目標）"
              style={styles.input}
            />
            <input
              type="text"
              value={state.year.teamResult}
              onChange={(e) => updateYear('teamResult', e.target.value)}
              placeholder="チーム人数（結果）"
              style={styles.input}
            />
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>年間総括</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <input
            type="text"
            value={state.year.achievement}
            onChange={(e) => updateYear('achievement', e.target.value)}
            placeholder="達成度"
            style={styles.input}
          />
          <textarea
            value={state.year.goodPoints}
            onChange={(e) => updateYear('goodPoints', e.target.value)}
            placeholder="良かった点"
            style={styles.textarea}
          />
          <textarea
            value={state.year.improvement}
            onChange={(e) => updateYear('improvement', e.target.value)}
            placeholder="改善点"
            style={styles.textarea}
          />
          <textarea
            value={state.year.nextAction}
            onChange={(e) => updateYear('nextAction', e.target.value)}
            placeholder="来年のアクション"
            style={styles.textarea}
          />
        </div>
      </div>
    </div>
  );

  const renderMandala = () => {
    const gridMapping = [0, 1, 2, 7, 'center', 3, 6, 5, 4];
    const selected = state.mandala.selectedIndex;

    return (
      <div>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>マンダラチャート設定</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={styles.label}>作成日</label>
              <input
                type="text"
                value={state.mandala.date}
                onChange={(e) => updateMandala('date', e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: 8,
            maxWidth: isMobile ? '100%' : 620,
            width: '100%',
            margin: '0 auto 20px auto',
          }}
        >
          {gridMapping.map((item, index) => {
            if (isMobile && item === 'center') {
              return (
                <div
                  key={`center-${index}`}
                  style={{
                    gridColumn: '1 / -1',
                    backgroundColor: '#eff6ff',
                    border: '2px solid #2563eb',
                    borderRadius: 12,
                    padding: 10,
                    minHeight: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <label style={{ ...styles.label, color: '#2563eb', textAlign: 'center', fontSize: 10 }}>
                    最終目標
                  </label>
                  <textarea
                    value={state.mandala.centerGoal}
                    onChange={(e) => updateMandala('centerGoal', e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: 60,
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: 14,
                      resize: 'none',
                      outline: 'none',
                      color: '#111827',
                    }}
                  />
                </div>
              );
            }

            if (item === 'center') {
              return (
                <div
                  key="center"
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '2px solid #2563eb',
                    borderRadius: 12,
                    padding: 10,
                    minHeight: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <label style={{ ...styles.label, color: '#2563eb', textAlign: 'center', fontSize: 10 }}>
                    最終目標
                  </label>
                  <textarea
                    value={state.mandala.centerGoal}
                    onChange={(e) => updateMandala('centerGoal', e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: 72,
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: 14,
                      resize: 'none',
                      outline: 'none',
                      color: '#111827',
                    }}
                  />
                </div>
              );
            }

            const sg = state.mandala.subGoals[item];
            const isSelected = state.mandala.selectedIndex === item;

            return (
              <div
                key={item}
                onClick={() => updateMandala('selectedIndex', item)}
                style={{
                  backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
                  border: isSelected ? '2px solid #6366f1' : '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: 10,
                  minHeight: isMobile ? 100 : 120,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, marginBottom: 4 }}>
                  {CIRCLE_NUMBERS[item]}
                </div>
                <textarea
                  value={sg.goal}
                  onChange={(e) => updateMandalaGoal(item, e.target.value)}
                  placeholder="中目標"
                  style={{
                    width: '100%',
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: 12,
                    resize: 'none',
                    outline: 'none',
                    textAlign: 'center',
                    color: '#111827',
                  }}
                />
              </div>
            );
          })}
        </div>

        {selected !== null && (
          <div style={{ ...styles.section, border: '2px solid #6366f1' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 10,
                marginBottom: 14,
              }}
            >
              <h3 style={{ margin: 0, fontWeight: 800, color: '#111827', fontSize: isMobile ? 15 : 16 }}>
                {CIRCLE_NUMBERS[selected]} {state.mandala.subGoals[selected].goal || '（中目標未入力）'} のアクション
              </h3>
              <button
                onClick={() => updateMandala('selectedIndex', null)}
                style={{ ...styles.btnGhost, padding: '8px 12px', width: isMobile ? '100%' : 'auto' }}
              >
                閉じる
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {state.mandala.subGoals[selected].actions.map((action, aIdx) => (
                <div key={aIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 22, fontSize: 12, color: '#94a3b8', fontWeight: 800 }}>{aIdx + 1}</span>
                  <input
                    type="text"
                    value={action}
                    onChange={(e) => updateMandalaAction(selected, aIdx, e.target.value)}
                    placeholder="アクション"
                    style={styles.input}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentLeft = () => {
    switch (activeTab) {
      case '1日':
        return renderDay();
      case '1週間':
        return renderWeek();
      case '1ヵ月':
        return renderMonth();
      case '1年':
        return renderYear();
      case 'マンダラ':
        return renderMandala();
      default:
        return null;
    }
  };

  return (
    <div style={styles.page}>
      <Head>
        <title>Goal Layer | 8-7シート</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header style={styles.header}>
        <div style={{ ...styles.container, padding: 0 }}>
          <h1 style={styles.title}>
            8-7シート
            <span style={styles.subtitle}>Goal Layer</span>
          </h1>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.tabsWrap}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={styles.tabButton(activeTab === tab)}>
              {tab}
            </button>
          ))}
        </div>

        <div style={styles.shellCard}>
          <h2 style={styles.shellTitle}>{activeTab}</h2>

          <div style={styles.twoCol}>
            <div style={styles.leftCol}>{renderCurrentLeft()}</div>

            <div style={styles.rightCol}>
              <div style={styles.section}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'center',
                    flexDirection: 'column',
                    marginBottom: 12,
                    gap: 10,
                  }}
                >
                  <h3 style={{ ...styles.sectionTitle, margin: 0 }}>Preview & Copy</h3>

                  <div style={{ ...styles.buttonRow, width: '100%' }}>
                    <button onClick={resetCurrentTab} style={styles.btnDanger}>
                      リセット
                    </button>
                    <button onClick={() => copyText(currentSummary)} style={styles.btnGhost}>
                      {copied ? 'コピー完了' : 'コピー'}
                    </button>
                    <button onClick={handleAI} style={styles.btnPrimary} disabled={aiLoading}>
                      {aiLoading ? 'AI実行中...' : 'AIで整理'}
                    </button>
                  </div>
                </div>

                <div style={styles.summaryCard}>{currentSummary}</div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>AIコメント</h3>
                <div
                  style={{
                    ...styles.summaryCard,
                    minHeight: isMobile ? 180 : 220,
                    backgroundColor: '#f8fafc',
                  }}
                >
                  {aiText || 'ここにAIの整理結果が表示されます。'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: '28px 14px',
          color: '#94a3b8',
          fontSize: 12,
        }}
      >
        © 2026 Goal Layer. All rights reserved.
      </footer>
    </div>
  );
}
