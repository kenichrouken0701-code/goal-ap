import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';

const STORAGE_KEY = 'goal-layer-safe-v2';
const GAS_URL = "https://script.google.com/macros/s/AKfycbx_TaGeIVm0ZIznAY35Bx-Kl5xZ17HzcCB5k9gcYDGl1YIv9lOlsdEWMwvMFFcP-daJtw/exec";
const TABS = ['1日', '1週間', '1ヵ月', '1年', 'マンダラ'];
const WEEK_DAYS = ['月', '火', '水', '木', '金', '土', '日'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const CIRCLE_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];

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
    rate: '',
    memo: '',
  }));
}

function generateInitialMonths() {
  return MONTHS.map((month) => ({
    month,
    goal: '',
    teamTarget: '',
    teamResult: '',
    theme: '',
    rate: '',
    memo: '',
  }));
}

function generateInitialMandala() {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    goal: '',
    actions: Array(8).fill(''),
  }));
}

function getInitialState() {
  return {
    tab: '1日',
    day: {
      date: getToday(),
      goal: '',
      schedule: generateInitialSchedule(),
      result: '',
      good: '',
      redo: '',
    },
    week: {
      range: getWeekRange(),
      goal: '',
      days: generateInitialWeekDays(),
      good: '',
      improve: '',
      next: '',
    },
    month: {
      year: getThisYear(),
      goal: '',
      list: generateInitialMonths(),
    },
    year: {
      year: getThisYear(),
      ideal: '',
      goal: '',
      target: '',
      result: '',
      score: '',
      good: '',
      improve: '',
      next: '',
    },
    mandala: {
      date: getToday(),
      center: '',
      list: generateInitialMandala(),
    },
  };
}

function normalizeMandala(rawMandala, fallback) {
  const safe = rawMandala || {};
  const rawList = Array.isArray(safe.list) ? safe.list : [];
  const normalizedList = Array.from({ length: 8 }, (_, i) => {
    const item = rawList[i] || {};
    const rawActions = Array.isArray(item.actions) ? item.actions : [];
    return {
      id: i,
      goal: typeof item.goal === 'string' ? item.goal : '',
      actions: Array.from({ length: 8 }, (_, idx) =>
        typeof rawActions[idx] === 'string' ? rawActions[idx] : ''
      ),
    };
  });

  return {
    ...fallback,
    ...safe,
    date: typeof safe.date === 'string' ? safe.date : fallback.date,
    center: typeof safe.center === 'string' ? safe.center : fallback.center,
    list: normalizedList,
  };
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export default function Home() {
  const isMobile = useIsMobile();
  const [data, setData] = useState(getInitialState());
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const initial = getInitialState();

      if (raw) {
        const parsed = JSON.parse(raw);

        setData({
          ...initial,
          ...parsed,
          day: {
            ...initial.day,
            ...(parsed.day || {}),
            schedule:
              Array.isArray(parsed?.day?.schedule) && parsed.day.schedule.length > 0
                ? parsed.day.schedule.map((v) => ({
                    time: typeof v?.time === 'string' ? v.time : '',
                    content: typeof v?.content === 'string' ? v.content : '',
                  }))
                : initial.day.schedule,
          },
          week: {
            ...initial.week,
            ...(parsed.week || {}),
            days:
              Array.isArray(parsed?.week?.days) && parsed.week.days.length === 7
                ? parsed.week.days.map((v, i) => ({
                    day: typeof v?.day === 'string' ? v.day : WEEK_DAYS[i],
                    goal: typeof v?.goal === 'string' ? v.goal : '',
                    task: typeof v?.task === 'string' ? v.task : '',
                    rate: typeof v?.rate === 'string' ? v.rate : '',
                    memo: typeof v?.memo === 'string' ? v.memo : '',
                  }))
                : initial.week.days,
          },
          month: {
            ...initial.month,
            ...(parsed.month || {}),
            list:
              Array.isArray(parsed?.month?.list) && parsed.month.list.length === 12
                ? parsed.month.list.map((v, i) => ({
                    month: typeof v?.month === 'string' ? v.month : MONTHS[i],
                    goal: typeof v?.goal === 'string' ? v.goal : '',
                    teamTarget: typeof v?.teamTarget === 'string' ? v.teamTarget : '',
                    teamResult: typeof v?.teamResult === 'string' ? v.teamResult : '',
                    theme: typeof v?.theme === 'string' ? v.theme : '',
                    rate: typeof v?.rate === 'string' ? v.rate : '',
                    memo: typeof v?.memo === 'string' ? v.memo : '',
                  }))
                : initial.month.list,
          },
          year: {
            ...initial.year,
            ...(parsed.year || {}),
          },
          mandala: normalizeMandala(parsed.mandala, initial.mandala),
        });
      } else {
        setData(initial);
      }
    } catch (e) {
      console.error(e);
      setData(getInitialState());
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }, [data, loaded]);

  const setTab = (tab) => {
    setData((prev) => ({ ...prev, tab }));
    setCopied(false);
    setSaved(false);
  };

const saveNow = async () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    if (data.tab !== 'マンダラ') {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          sheetName: data.tab,
          payload: {
            title:
              data.tab === '1日'
                ? data.day.date
                : data.tab === '1週間'
                ? data.week.range
                : data.tab === '1ヶ月'
                ? data.month.year
                : data.year.year,
            content: currentSummary,
            memo: `${data.tab}の記録`,
          },
        }),
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  } catch (e) {
    console.error(e);
  }
};

  const resetCurrentTab = () => {
    if (typeof window !== 'undefined' && !window.confirm(`${data.tab}の入力内容をリセットしますか？`)) {
      return;
    }

    const initial = getInitialState();

    setData((prev) => {
      if (prev.tab === '1日') return { ...prev, day: initial.day };
      if (prev.tab === '1週間') return { ...prev, week: initial.week };
      if (prev.tab === '1ヵ月') return { ...prev, month: initial.month };
      if (prev.tab === '1年') return { ...prev, year: initial.year };
      return { ...prev, mandala: initial.mandala };
    });

    setCopied(false);
    setSaved(false);
  };

  const copySummary = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const setTodayToDay = () => {
    setData((prev) => ({ ...prev, day: { ...prev.day, date: getToday() } }));
  };

  const setCurrentWeek = () => {
    setData((prev) => ({ ...prev, week: { ...prev.week, range: getWeekRange() } }));
  };

  const setCurrentYearToMonth = () => {
    setData((prev) => ({ ...prev, month: { ...prev.month, year: getThisYear() } }));
  };

  const setCurrentYearToYear = () => {
    setData((prev) => ({ ...prev, year: { ...prev.year, year: getThisYear() } }));
  };

  const setTodayToMandala = () => {
    setData((prev) => ({ ...prev, mandala: { ...prev.mandala, date: getToday() } }));
  };

  const updateDayField = (field, value) => {
    setData((prev) => ({
      ...prev,
      day: { ...prev.day, [field]: value },
    }));
  };

  const updateDaySchedule = (index, value) => {
    setData((prev) => {
      const next = [...prev.day.schedule];
      next[index] = { ...next[index], content: value };
      return {
        ...prev,
        day: { ...prev.day, schedule: next },
      };
    });
  };

  const updateWeekField = (field, value) => {
    setData((prev) => ({
      ...prev,
      week: { ...prev.week, [field]: value },
    }));
  };

  const updateWeekDay = (index, field, value) => {
    setData((prev) => {
      const next = [...prev.week.days];
      next[index] = { ...next[index], [field]: value };
      return {
        ...prev,
        week: { ...prev.week, days: next },
      };
    });
  };

  const updateMonthField = (field, value) => {
    setData((prev) => ({
      ...prev,
      month: { ...prev.month, [field]: value },
    }));
  };

  const updateMonthItem = (index, field, value) => {
    setData((prev) => {
      const next = [...prev.month.list];
      next[index] = { ...next[index], [field]: value };
      return {
        ...prev,
        month: { ...prev.month, list: next },
      };
    });
  };

  const updateYearField = (field, value) => {
    setData((prev) => ({
      ...prev,
      year: { ...prev.year, [field]: value },
    }));
  };

  const updateMandalaField = (field, value) => {
    setData((prev) => ({
      ...prev,
      mandala: { ...prev.mandala, [field]: value },
    }));
  };

  const updateMandalaGoal = (index, value) => {
    setData((prev) => {
      const next = [...prev.mandala.list];
      next[index] = { ...next[index], goal: value };
      return {
        ...prev,
        mandala: { ...prev.mandala, list: next },
      };
    });
  };

  const updateMandalaAction = (goalIndex, actionIndex, value) => {
    setData((prev) => {
      const next = [...prev.mandala.list];
      const actions = [...next[goalIndex].actions];
      actions[actionIndex] = value;
      next[goalIndex] = { ...next[goalIndex], actions };
      return {
        ...prev,
        mandala: { ...prev.mandala, list: next },
      };
    });
  };

  const daySummary = useMemo(() => {
    const scheduleText = data.day.schedule
      .filter((v) => v.content.trim() !== '')
      .map((v) => `${v.time} ${v.content}`)
      .join('\n');

    return `■日付
${data.day.date}

■1日の目標
${data.day.goal}

■タイムスケジュール
${scheduleText}

■振り返り
【達成度】
${data.day.result}

【良かったこと】
${data.day.good}

【今日1日やり直せるなら】
${data.day.redo}`;
  }, [data.day]);

  const weekSummary = useMemo(() => {
    const dailyText = data.week.days
      .map(
        (v) => `【${v.day}】
・目標：${v.goal}
・最重要タスク：${v.task}
・達成度：${v.rate}
・メモ：${v.memo}`
      )
      .join('\n\n');

    const rateText = data.week.days.map((v) => `${v.day}：${v.rate}`).join('\n');

    return `■期間
${data.week.range}

■今週の目標
${data.week.goal}

■週間サマリー

【達成状況】
${rateText}

【良かった流れ】
${data.week.good}

【改善ポイント】
${data.week.improve}

【来週のアクション】
${data.week.next}

■デイリーログ

${dailyText}`;
  }, [data.week]);

  const monthSummary = useMemo(() => {
    const text = data.month.list
      .map(
        (v) => `【${v.month}】
・目標：${v.goal}
・チーム人数：目標 ${v.teamTarget} / 結果 ${v.teamResult}
・テーマ：${v.theme}
・達成度：${v.rate}
・振り返り：${v.memo}`
      )
      .join('\n\n');

    return `■年
${data.month.year}

■年間目標
${data.month.goal}

■年間サマリー

${text}`;
  }, [data.month]);

  const yearSummary = useMemo(() => {
    return `■年
${data.year.year}

■なりたい状態
${data.year.ideal}

■年間目標
${data.year.goal}

■チーム人数
目標：${data.year.target}
結果：${data.year.result}

■総括

【達成度】
${data.year.score}

【良かった点】
${data.year.good}

【改善点】
${data.year.improve}

【来年のアクション】
${data.year.next}`;
  }, [data.year]);

  const mandalaSummary = useMemo(() => {
    const goals = data.mandala.list
      .map((v, i) => `${CIRCLE_NUMBERS[i]} ${v.goal}`)
      .join('\n');

    const actions = data.mandala.list
      .map((v, i) => {
        const actionText = v.actions
          .filter((a) => a.trim() !== '')
          .map((a) => `・${a}`)
          .join('\n');
        return `【${CIRCLE_NUMBERS[i]} ${v.goal}】
${actionText || '（未入力）'}`;
      })
      .join('\n\n');

    return `■作成日
${data.mandala.date}

■最終目標
${data.mandala.center}

■中目標
${goals}

■行動プラン

${actions}`;
  }, [data.mandala]);

  const currentSummary = useMemo(() => {
    if (data.tab === '1日') return daySummary;
    if (data.tab === '1週間') return weekSummary;
    if (data.tab === '1ヵ月') return monthSummary;
    if (data.tab === '1年') return yearSummary;
    return mandalaSummary;
  }, [data.tab, daySummary, weekSummary, monthSummary, yearSummary, mandalaSummary]);

  const card = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: isMobile ? 16 : 22,
    padding: isMobile ? 14 : 22,
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
    marginBottom: 16,
  };

  const input = {
    width: '100%',
    padding: isMobile ? '11px 12px' : '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 12,
    background: '#ffffff',
    fontSize: isMobile ? 13 : 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const textarea = {
    ...input,
    minHeight: 90,
    resize: 'vertical',
  };

  const buttonBase = {
    border: 'none',
    borderRadius: 12,
    padding: isMobile ? '12px 12px' : '12px 16px',
    fontWeight: 800,
    cursor: 'pointer',
  };

  const renderDay = () => (
    <>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 10 }}>
          <h3 style={{ margin: 0 }}>基本情報</h3>
          <button onClick={setTodayToDay} style={{ ...buttonBase, background: '#eff6ff', color: '#2563eb' }}>
            今日の日付を入れる
          </button>
        </div>

        <div style={{ height: 12 }} />

        <label style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>日付</label>
        <div style={{ height: 6 }} />
        <input
          style={input}
          value={data.day.date}
          onChange={(e) => updateDayField('date', e.target.value)}
        />

        <div style={{ height: 12 }} />

        <label style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>1日の目標を設定する</label>
        <div style={{ height: 6 }} />
        <textarea
          style={textarea}
          value={data.day.goal}
          onChange={(e) => updateDayField('goal', e.target.value)}
        />
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>タイムスケジュール</h3>
        <div style={{ maxHeight: isMobile ? 300 : 400, overflowY: 'auto', paddingRight: 4 }}>
          {data.day.schedule.map((v, i) => (
            <div
              key={v.time}
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 8,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: isMobile ? 48 : 58,
                  fontSize: isMobile ? 11 : 12,
                  fontWeight: 800,
                  color: '#64748b',
                  flexShrink: 0,
                }}
              >
                {v.time}
              </div>

              <input
                style={input}
                value={v.content}
                onChange={(e) => updateDaySchedule(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>振り返り</h3>

        <input
          style={input}
          placeholder="達成度"
          value={data.day.result}
          onChange={(e) => updateDayField('result', e.target.value)}
        />

        <div style={{ height: 10 }} />

        <textarea
          style={textarea}
          placeholder="良かったこと"
          value={data.day.good}
          onChange={(e) => updateDayField('good', e.target.value)}
        />

        <div style={{ height: 10 }} />

        <textarea
          style={textarea}
          placeholder="今日1日やり直せるなら"
          value={data.day.redo}
          onChange={(e) => updateDayField('redo', e.target.value)}
        />
      </div>
    </>
  );

  const renderWeek = () => (
    <>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 10 }}>
          <h3 style={{ margin: 0 }}>週間設定</h3>
          <button onClick={setCurrentWeek} style={{ ...buttonBase, background: '#eff6ff', color: '#2563eb' }}>
            今週を自動入力
          </button>
        </div>

        <div style={{ height: 12 }} />

        <input
          style={input}
          value={data.week.range}
          onChange={(e) => updateWeekField('range', e.target.value)}
        />

        <div style={{ height: 10 }} />

        <textarea
          style={textarea}
          placeholder="1週間の目標を設定する"
          value={data.week.goal}
          onChange={(e) => updateWeekField('goal', e.target.value)}
        />
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>デイリーログ</h3>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', gap: 10, minWidth: isMobile ? 720 : 860 }}>
            {data.week.days.map((v, i) => (
              <div
                key={v.day}
                style={{
                  minWidth: isMobile ? 160 : 0,
                  flex: 1,
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>{v.day}</div>

                <input
                  style={input}
                  placeholder="目標"
                  value={v.goal}
                  onChange={(e) => updateWeekDay(i, 'goal', e.target.value)}
                />

                <div style={{ height: 8 }} />

                <input
                  style={input}
                  placeholder="最重要タスク"
                  value={v.task}
                  onChange={(e) => updateWeekDay(i, 'task', e.target.value)}
                />

                <div style={{ height: 8 }} />

                <input
                  style={input}
                  placeholder="達成度"
                  value={v.rate}
                  onChange={(e) => updateWeekDay(i, 'rate', e.target.value)}
                />

                <div style={{ height: 8 }} />

                <textarea
                  style={textarea}
                  placeholder="メモ"
                  value={v.memo}
                  onChange={(e) => updateWeekDay(i, 'memo', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>週間振り返り</h3>

        <textarea
          style={textarea}
          placeholder="良かった流れ"
          value={data.week.good}
          onChange={(e) => updateWeekField('good', e.target.value)}
        />

        <div style={{ height: 10 }} />

        <textarea
          style={textarea}
          placeholder="改善ポイント"
          value={data.week.improve}
          onChange={(e) => updateWeekField('improve', e.target.value)}
        />

        <div style={{ height: 10 }} />

        <textarea
          style={textarea}
          placeholder="来週のアクション"
          value={data.week.next}
          onChange={(e) => updateWeekField('next', e.target.value)}
        />
      </div>
    </>
  );

  const renderMonth = () => (
    <>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 10 }}>
          <h3 style={{ margin: 0 }}>年間設定</h3>
          <button onClick={setCurrentYearToMonth} style={{ ...buttonBase, background: '#eff6ff', color: '#2563eb' }}>
            今年を自動入力
          </button>
        </div>

        <div style={{ height: 12 }} />

        <input
          style={input}
          value={data.month.year}
          onChange={(e) => updateMonthField('year', e.target.value)}
          placeholder="年"
        />

        <div style={{ height: 10 }} />

        <textarea
          style={textarea}
          placeholder="年間目標"
          value={data.month.goal}
          onChange={(e) => updateMonthField('goal', e.target.value)}
        />
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>1月〜12月</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {data.month.list.map((v, i) => (
            <div
              key={v.month}
              style={{
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: 16,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 8 }}>{v.month}</div>

              <input
                style={input}
                placeholder="月の目標"
                value={v.goal}
                onChange={(e) => updateMonthItem(i, 'goal', e.target.value)}
              />

              <div style={{ height: 8 }} />

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                <input
                  style={input}
                  placeholder="人数 目標"
                  value={v.teamTarget}
                  onChange={(e) => updateMonthItem(i, 'teamTarget', e.target.value)}
                />
                <input
                  style={input}
                  placeholder="人数 結果"
                  value={v.teamResult}
                  onChange={(e) => updateMonthItem(i, 'teamResult', e.target.value)}
                />
              </div>

              <div style={{ height: 8 }} />

              <input
                style={input}
                placeholder="テーマ"
                value={v.theme}
                onChange={(e) => updateMonthItem(i, 'theme', e.target.value)}
              />

              <div style={{ height: 8 }} />

              <input
                style={input}
                placeholder="達成度"
                value={v.rate}
                onChange={(e) => updateMonthItem(i, 'rate', e.target.value)}
              />

              <div style={{ height: 8 }} />

              <textarea
                style={textarea}
                placeholder="一言振り返り"
                value={v.memo}
                onChange={(e) => updateMonthItem(i, 'memo', e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderYear = () => (
    <>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 10 }}>
          <h3 style={{ margin: 0 }}>1年の設計</h3>
          <button onClick={setCurrentYearToYear} style={{ ...buttonBase, background: '#eff6ff', color: '#2563eb' }}>
            今年を自動入力
          </button>
        </div>

        <div style={{ height: 12 }} />

        <input
          style={input}
          value={data.year.year}
          onChange={(e) => updateYearField('year', e.target.value)}
          placeholder="年"
        />

        <div style={{ height: 10 }} />

        <textarea
          style={textarea}
          placeholder="どういう状態になりたいか"
          value={data.year.ideal}
          onChange={(e) => updateYearField('ideal', e.target.value)}
        />

        <div style={{ height: 10 }} />

        <textarea
          style={textarea}
          placeholder="年間目標"
          value={data.year.goal}
          onChange={(e) => updateYearField('goal', e.target.value)}
        />

        <div style={{ height: 10 }} />

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
          <input
            style={input}
            placeholder="チーム人数（目標）"
            value={data.year.target}
            onChange={(e) => updateYearField('target', e.target.value)}
          />
          <input
            style={input}
            placeholder="チーム人数（結果）"
            value={data.year.result}
            onChange={(e) => updateYearField('result', e.target.value)}
          />
        </div>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>総括</h3>

        <input
          style={input}
          placeholder="達成度"
          value={data.year.score}
          onChange={(e) => updateYearField('score', e.target.value)}
        />

        <div style={{ height: 10 }} />

        <textarea
          style={textarea}
          placeholder="良かった点"
          value={data.year.good}
          onChange={(e) => updateYearField('good', e.target.value)}
        />

        <div style={{ height: 10 }} />

        <textarea
          style={textarea}
          placeholder="改善点"
          value={data.year.improve}
          onChange={(e) => updateYearField('improve', e.target.value)}
        />

        <div style={{ height: 10 }} />

        <textarea
          style={textarea}
          placeholder="来年のアクション"
          value={data.year.next}
          onChange={(e) => updateYearField('next', e.target.value)}
        />
      </div>
    </>
  );

  const renderMandala = () => {
    const blockOrder = [
      [0, 1, 2],
      [7, 'center', 3],
      [6, 5, 4],
    ];

    const miniCellStyle = (highlight) => ({
      background: highlight ? '#dbeafe' : '#ffffff',
      border: highlight ? '2px solid #2563eb' : '1px solid #e5e7eb',
      borderRadius: 10,
      minHeight: isMobile ? 54 : 64,
      padding: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: isMobile ? 10 : 11,
      fontWeight: highlight ? 800 : 600,
      color: '#111827',
      boxSizing: 'border-box',
      overflow: 'hidden',
      wordBreak: 'break-word',
    });

    const renderMiniGrid = (item, index) => {
      if (item === 'center') {
        return (
          <div
            key={`center-${index}`}
            style={{
              ...miniCellStyle(true),
              minHeight: isMobile ? 110 : 140,
              gridColumn: isMobile ? '1 / -1' : 'auto',
            }}
          >
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: 10, color: '#2563eb', marginBottom: 4 }}>最終目標</div>
              <textarea
                value={data.mandala.center}
                onChange={(e) => updateMandalaField('center', e.target.value)}
                placeholder="最終目標"
                style={{
                  width: '100%',
                  minHeight: isMobile ? 60 : 80,
                  border: 'none',
                  background: 'transparent',
                  resize: 'none',
                  outline: 'none',
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: isMobile ? 13 : 14,
                  color: '#111827',
                }}
              />
            </div>
          </div>
        );
      }

      const goal = data.mandala.list[item];

      return (
        <div
          key={item}
          style={{
            background: '#ffffff',
            border: '1px solid #dbe4f0',
            borderRadius: 18,
            padding: 8,
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.04)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, color: '#2563eb', marginBottom: 6 }}>
            {CIRCLE_NUMBERS[item]}
          </div>

          <textarea
            value={goal.goal}
            onChange={(e) => updateMandalaGoal(item, e.target.value)}
            placeholder="中目標"
            style={{
              width: '100%',
              minHeight: 52,
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: 8,
              marginBottom: 8,
              resize: 'none',
              outline: 'none',
              fontWeight: 700,
              boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              goal.actions[0],
              goal.actions[1],
              goal.actions[2],
              goal.actions[7],
              goal.goal || '中目標',
              goal.actions[3],
              goal.actions[6],
              goal.actions[5],
              goal.actions[4],
            ].map((text, idx) => (
              <div key={idx} style={miniCellStyle(idx === 4)}>
                {text || (idx === 4 ? '中目標' : '')}
              </div>
            ))}
          </div>

          <div style={{ height: 10 }} />

          <div style={{ display: 'grid', gap: 6 }}>
            {goal.actions.map((action, actionIndex) => (
              <input
                key={actionIndex}
                style={input}
                placeholder={`アクション${actionIndex + 1}`}
                value={action}
                onChange={(e) => updateMandalaAction(item, actionIndex, e.target.value)}
              />
            ))}
          </div>
        </div>
      );
    };

    return (
      <>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 10 }}>
            <h3 style={{ margin: 0 }}>マンダラ設定</h3>
            <button onClick={setTodayToMandala} style={{ ...buttonBase, background: '#eff6ff', color: '#2563eb' }}>
              今日の日付を入れる
            </button>
          </div>

          <div style={{ height: 12 }} />

          <input
            style={input}
            value={data.mandala.date}
            onChange={(e) => updateMandalaField('date', e.target.value)}
            placeholder="作成日"
          />
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>9×9 マンダラチャート</h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {blockOrder.flat().map((item, index) => renderMiniGrid(item, index))}
          </div>
        </div>
      </>
    );
  };

  const renderLeft = () => {
    if (data.tab === '1日') return renderDay();
    if (data.tab === '1週間') return renderWeek();
    if (data.tab === '1ヵ月') return renderMonth();
    if (data.tab === '1年') return renderYear();
    return renderMandala();
  };

  const previewArea = (
    <div style={card}>
      <h3 style={{ marginTop: 0 }}>Preview & Copy</h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <button
          onClick={saveNow}
          style={{ ...buttonBase, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}
        >
          {saved ? '保存しました' : '保存'}
        </button>

        <button
          onClick={resetCurrentTab}
          style={{ ...buttonBase, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
        >
          リセット
        </button>

        <button
          onClick={() => copySummary(currentSummary)}
          style={{ ...buttonBase, background: '#2563eb', color: '#ffffff' }}
        >
          {copied ? 'コピー完了' : 'コピー'}
        </button>
      </div>

      <div
        style={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          background: '#f8fafc',
          padding: isMobile ? 14 : 16,
          borderRadius: 16,
          minHeight: isMobile ? 260 : 420,
          border: '1px solid #e5e7eb',
          lineHeight: 1.7,
          fontSize: isMobile ? 12 : 13,
          overflowWrap: 'anywhere',
        }}
      >
        {currentSummary}
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 40%, #ffffff 100%)',
        paddingBottom: 100,
        fontFamily: 'sans-serif',
        color: '#111827',
      }}
    >
      <Head>
        <title>Goal Layer | 8-7シート</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.82)',
          borderBottom: '1px solid #e5e7eb',
          padding: isMobile ? 14 : 16,
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 900 }}>
            8-7シート
            <span style={{ color: '#2563eb', fontSize: isMobile ? 11 : 12, marginLeft: 8 }}>
              Goal Layer
            </span>
          </h1>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: isMobile ? 12 : 20,
        }}
      >
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16 }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              style={{
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                padding: isMobile ? '11px 14px' : '12px 18px',
                borderRadius: 14,
                fontWeight: 900,
                background: data.tab === tab ? '#2563eb' : '#ffffff',
                color: data.tab === tab ? '#ffffff' : '#0f172a',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.55fr 1fr',
            gap: 18,
            alignItems: 'start',
          }}
        >
          <div>{renderLeft()}</div>

          {!isMobile && <div>{previewArea}</div>}
        </div>

        {isMobile && <div style={{ marginTop: 18 }}>{previewArea}</div>}
      </div>

      <footer
        style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#94a3b8',
          fontSize: 12,
        }}
      >
        © 2026 Goal Layer. All rights reserved.
      </footer>
    </div>
  );
}
