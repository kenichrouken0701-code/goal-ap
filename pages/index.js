import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";

/* ===============================
   Goal Layer / 8-7シート
   AI機能なし版
   スマホ最適化 / 下部にコピー欄
================================= */

const TABS = ["1日", "1週間", "1ヵ月", "1年", "マンダラ"];
const WEEK = ["月", "火", "水", "木", "金", "土", "日"];
const MONTHS = [
  "1月","2月","3月","4月","5月","6月",
  "7月","8月","9月","10月","11月","12月"
];
const STORAGE_KEY = "goal-layer-final-v1";
const NUMS = ["①","②","③","④","⑤","⑥","⑦","⑧"];

function today() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;
}

function thisYear() {
  return String(new Date().getFullYear());
}

function weekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);

  const mon = new Date(now);
  mon.setDate(diff);

  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const f = (d) =>
    `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}`;

  return `${f(mon)}～${f(sun)}`;
}

function makeSchedule() {
  const arr = [];
  for (let i=7;i<=23;i++) arr.push(`${String(i).padStart(2,"0")}:00`);
  for (let i=0;i<=2;i++) arr.push(`${String(i).padStart(2,"0")}:00`);
  return arr.map((t)=>({ time:t, content:"" }));
}

function makeWeek() {
  return WEEK.map((d)=>({
    day:d,
    goal:"",
    task:"",
    rate:"",
    memo:"",
  }));
}

function makeMonths() {
  return MONTHS.map((m)=>({
    month:m,
    goal:"",
    teamTarget:"",
    teamResult:"",
    theme:"",
    rate:"",
    memo:"",
  }));
}

function makeMandala() {
  return Array.from({ length:8 },(_,i)=>({
    id:i,
    goal:"",
    actions:Array(8).fill("")
  }));
}

function initData() {
  return {
    tab:"1日",

    day:{
      date:today(),
      goal:"",
      schedule:makeSchedule(),
      result:"",
      good:"",
      redo:"",
    },

    week:{
      range:weekRange(),
      goal:"",
      days:makeWeek(),
      good:"",
      improve:"",
      next:"",
    },

    month:{
      year:thisYear(),
      goal:"",
      list:makeMonths(),
    },

    year:{
      year:thisYear(),
      ideal:"",
      goal:"",
      target:"",
      result:"",
      score:"",
      good:"",
      improve:"",
      next:"",
    },

    mandala:{
      date:today(),
      center:"",
      list:makeMandala(),
      selected:null,
    },
  };
}

export default function Home() {
  const [data,setData] = useState(initData());
  const [copied,setCopied] = useState(false);
  const [mobile,setMobile] = useState(false);

  useEffect(()=>{
    if(typeof window==="undefined") return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved){
      try{
        setData(JSON.parse(saved));
      }catch(e){}
    }

    const resize = ()=> setMobile(window.innerWidth < 900);
    resize();
    window.addEventListener("resize",resize);

    return ()=>window.removeEventListener("resize",resize);
  },[]);

  useEffect(()=>{
    if(typeof window==="undefined") return;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
  },[data]);

  const tab = data.tab;

  const setTab = (v)=>setData(prev=>({ ...prev, tab:v }));

  const copy = async(text)=>{
    try{
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(()=>setCopied(false),1500);
    }catch(e){}
  };

  const reset = ()=>{
    if(!confirm(`${tab}をリセットしますか？`)) return;

    const base = initData();

    setData(prev=>{
      if(tab==="1日") return { ...prev, day:base.day };
      if(tab==="1週間") return { ...prev, week:base.week };
      if(tab==="1ヵ月") return { ...prev, month:base.month };
      if(tab==="1年") return { ...prev, year:base.year };
      return { ...prev, mandala:base.mandala };
    });
  };

  /* =========================
      SUMMARY
  ========================= */

  const summary = useMemo(()=>{

    if(tab==="1日"){
      const sch = data.day.schedule
        .filter(v=>v.content.trim())
        .map(v=>`${v.time} ${v.content}`)
        .join("\n");

      return `■日付
${data.day.date}

■1日の目標
${data.day.goal}

■タイムスケジュール
${sch}

■振り返り
達成度：${data.day.result}

良かったこと
${data.day.good}

やり直せるなら
${data.day.redo}`;
    }

    if(tab==="1週間"){
      const logs = data.week.days.map(v=>`【${v.day}】
目標:${v.goal}
タスク:${v.task}
達成度:${v.rate}
メモ:${v.memo}`).join("\n\n");

      return `■期間
${data.week.range}

■週間目標
${data.week.goal}

■デイリーログ
${logs}

■良かった流れ
${data.week.good}

■改善点
${data.week.improve}

■来週の行動
${data.week.next}`;
    }

    if(tab==="1ヵ月"){
      const txt = data.month.list.map(v=>`【${v.month}】
目標:${v.goal}
人数 目標:${v.teamTarget} 結果:${v.teamResult}
テーマ:${v.theme}
達成:${v.rate}
振り返り:${v.memo}`).join("\n\n");

      return `■年
${data.month.year}

■年間目標
${data.month.goal}

${txt}`;
    }

    if(tab==="1年"){
      return `■年
${data.year.year}

■なりたい状態
${data.year.ideal}

■年間目標
${data.year.goal}

■人数
目標:${data.year.target}
結果:${data.year.result}

■達成度
${data.year.score}

■良かった点
${data.year.good}

■改善点
${data.year.improve}

■来年行動
${data.year.next}`;
    }

    const txt = data.mandala.list.map((v,i)=>`${NUMS[i]} ${v.goal}`).join("\n");

    return `■作成日
${data.mandala.date}

■最終目標
${data.mandala.center}

■中目標
${txt}`;
  },[data,tab]);

  /* =========================
      UI STYLE
  ========================= */

  const card = {
    background:"#ffffff",
    border:"1px solid #e5e7eb",
    borderRadius:20,
    padding:mobile ? 14 : 22,
    boxShadow:"0 10px 30px rgba(0,0,0,0.05)",
    marginBottom:16
  };

  const input = {
    width:"100%",
    padding:"12px",
    border:"1px solid #d1d5db",
    borderRadius:12,
    background:"#fff",
    fontSize:14,
    outline:"none",
    boxSizing:"border-box"
  };

  const textarea = {
    ...input,
    minHeight:90,
    resize:"vertical"
  };

  /* =========================
      CONTENT
  ========================= */

  const renderContent = ()=>{

    if(tab==="1日"){
      return (
        <>
          <div style={card}>
            <h3>基本情報</h3>
            <input style={input}
              value={data.day.date}
              onChange={e=>setData({
                ...data,
                day:{ ...data.day, date:e.target.value }
              })}
            />
            <div style={{ height:10 }} />
            <textarea style={textarea}
              placeholder="1日の目標"
              value={data.day.goal}
              onChange={e=>setData({
                ...data,
                day:{ ...data.day, goal:e.target.value }
              })}
            />
          </div>

          <div style={card}>
            <h3>タイムスケジュール</h3>

            <div style={{ maxHeight:360, overflowY:"auto" }}>
              {data.day.schedule.map((v,i)=>(
                <div key={i}
                  style={{
                    display:"flex",
                    gap:8,
                    marginBottom:8
                  }}>
                  <div style={{
                    width:58,
                    fontSize:12,
                    fontWeight:"bold",
                    color:"#64748b",
                    paddingTop:12
                  }}>
                    {v.time}
                  </div>

                  <input
                    style={input}
                    value={v.content}
                    onChange={e=>{
                      const next=[...data.day.schedule];
                      next[i].content=e.target.value;
                      setData({
                        ...data,
                        day:{ ...data.day, schedule:next }
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <h3>振り返り</h3>

            <input style={input}
              placeholder="達成度"
              value={data.day.result}
              onChange={e=>setData({
                ...data,
                day:{ ...data.day, result:e.target.value }
              })}
            />

            <div style={{ height:10 }} />

            <textarea style={textarea}
              placeholder="良かったこと"
              value={data.day.good}
              onChange={e=>setData({
                ...data,
                day:{ ...data.day, good:e.target.value }
              })}
            />

            <div style={{ height:10 }} />

            <textarea style={textarea}
              placeholder="やり直せるなら"
              value={data.day.redo}
              onChange={e=>setData({
                ...data,
                day:{ ...data.day, redo:e.target.value }
              })}
            />
          </div>
        </>
      );
    }

    if(tab==="1週間"){
      return (
        <>
          <div style={card}>
            <h3>週間設定</h3>

            <input style={input}
              value={data.week.range}
              onChange={e=>setData({
                ...data,
                week:{ ...data.week, range:e.target.value }
              })}
            />

            <div style={{ height:10 }} />

            <textarea style={textarea}
              placeholder="週間目標"
              value={data.week.goal}
              onChange={e=>setData({
                ...data,
                week:{ ...data.week, goal:e.target.value }
              })}
            />
          </div>

          <div style={card}>
            <h3>デイリーログ</h3>

            <div style={{
              overflowX:"auto",
              display:"flex",
              gap:10
            }}>
              {data.week.days.map((v,i)=>(
                <div key={i}
                  style={{
                    minWidth:170,
                    background:"#f8fafc",
                    border:"1px solid #e5e7eb",
                    borderRadius:16,
                    padding:10
                  }}>
                  <b>{v.day}</b>

                  <div style={{ height:8 }} />

                  <input style={input}
                    placeholder="目標"
                    value={v.goal}
                    onChange={e=>{
                      const next=[...data.week.days];
                      next[i].goal=e.target.value;
                      setData({
                        ...data,
                        week:{ ...data.week, days:next }
                      });
                    }}
                  />

                  <div style={{ height:8 }} />

                  <input style={input}
                    placeholder="タスク"
                    value={v.task}
                    onChange={e=>{
                      const next=[...data.week.days];
                      next[i].task=e.target.value;
                      setData({
                        ...data,
                        week:{ ...data.week, days:next }
                      });
                    }}
                  />

                  <div style={{ height:8 }} />

                  <input style={input}
                    placeholder="達成度"
                    value={v.rate}
                    onChange={e=>{
                      const next=[...data.week.days];
                      next[i].rate=e.target.value;
                      setData({
                        ...data,
                        week:{ ...data.week, days:next }
                      });
                    }}
                  />

                  <div style={{ height:8 }} />

                  <textarea style={textarea}
                    placeholder="メモ"
                    value={v.memo}
                    onChange={e=>{
                      const next=[...data.week.days];
                      next[i].memo=e.target.value;
                      setData({
                        ...data,
                        week:{ ...data.week, days:next }
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }

    if(tab==="1ヵ月"){
      return (
        <div style={card}>
          <h3>月別管理</h3>

          <div style={{
            display:"grid",
            gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr",
            gap:12
          }}>
            {data.month.list.map((v,i)=>(
              <div key={i}
                style={{
                  background:"#f8fafc",
                  borderRadius:16,
                  padding:12,
                  border:"1px solid #e5e7eb"
                }}>
                <b>{v.month}</b>

                <div style={{ height:8 }} />

                <input style={input}
                  placeholder="目標"
                  value={v.goal}
                  onChange={e=>{
                    const next=[...data.month.list];
                    next[i].goal=e.target.value;
                    setData({
                      ...data,
                      month:{ ...data.month, list:next }
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if(tab==="1年"){
      return (
        <div style={card}>
          <h3>1年管理</h3>

          <textarea style={textarea}
            placeholder="なりたい状態"
            value={data.year.ideal}
            onChange={e=>setData({
              ...data,
              year:{ ...data.year, ideal:e.target.value }
            })}
          />

          <div style={{ height:10 }} />

          <textarea style={textarea}
            placeholder="年間目標"
            value={data.year.goal}
            onChange={e=>setData({
              ...data,
              year:{ ...data.year, goal:e.target.value }
            })}
          />
        </div>
      );
    }

    return (
      <>
        <div style={card}>
          <h3>マンダラチャート</h3>

          <input style={input}
            placeholder="最終目標"
            value={data.mandala.center}
            onChange={e=>setData({
              ...data,
              mandala:{ ...data.mandala, center:e.target.value }
            })}
          />

          <div style={{ height:14 }} />

          <div style={{
            display:"grid",
            gridTemplateColumns:"1fr 1fr",
            gap:10
          }}>
            {data.mandala.list.map((v,i)=>(
              <textarea
                key={i}
                style={textarea}
                placeholder={`${NUMS[i]} 中目標`}
                value={v.goal}
                onChange={e=>{
                  const next=[...data.mandala.list];
                  next[i].goal=e.target.value;
                  setData({
                    ...data,
                    mandala:{ ...data.mandala, list:next }
                  });
                }}
              />
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(180deg,#eff6ff,#f8fafc,#ffffff)",
      paddingBottom:100,
      fontFamily:"sans-serif"
    }}>
      <Head>
        <title>Goal Layer | 8-7シート</title>
      </Head>

      <div style={{
        position:"sticky",
        top:0,
        zIndex:10,
        backdropFilter:"blur(10px)",
        background:"rgba(255,255,255,0.8)",
        borderBottom:"1px solid #e5e7eb",
        padding:"16px"
      }}>
        <h1 style={{
          margin:0,
          fontSize:24,
          fontWeight:900
        }}>
          8-7シート
          <span style={{
            color:"#2563eb",
            fontSize:12,
            marginLeft:8
          }}>
            Goal Layer
          </span>
        </h1>
      </div>

      <div style={{
        maxWidth:1200,
        margin:"0 auto",
        padding:mobile ? 12 : 20
      }}>

        <div style={{
          display:"flex",
          gap:8,
          overflowX:"auto",
          marginBottom:16
        }}>
          {TABS.map(v=>(
            <button
              key={v}
              onClick={()=>setTab(v)}
              style={{
                padding:"12px 16px",
                border:"none",
                borderRadius:14,
                fontWeight:"bold",
                cursor:"pointer",
                whiteSpace:"nowrap",
                background:tab===v ? "#2563eb" : "#ffffff",
                color:tab===v ? "#fff" : "#111827",
                boxShadow:"0 4px 12px rgba(0,0,0,0.08)"
              }}>
              {v}
            </button>
          ))}
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns: mobile ? "1fr" : "1.5fr 1fr",
          gap:18
        }}>

          <div>{renderContent()}</div>

          {!mobile && (
            <div>
              <div style={card}>
                <h3>Preview & Copy</h3>

                <div style={{
                  display:"flex",
                  gap:8,
                  marginBottom:12
                }}>
                  <button onClick={reset}
                    style={{
                      flex:1,
                      padding:"12px",
                      border:"none",
                      borderRadius:12,
                      background:"#fee2e2",
                      color:"#dc2626",
                      fontWeight:"bold",
                      cursor:"pointer"
                    }}>
                    リセット
                  </button>

                  <button onClick={()=>copy(summary)}
                    style={{
                      flex:1,
                      padding:"12px",
                      border:"none",
                      borderRadius:12,
                      background:"#2563eb",
                      color:"#fff",
                      fontWeight:"bold",
                      cursor:"pointer"
                    }}>
                    {copied ? "コピー完了" : "コピー"}
                  </button>
                </div>

                <div style={{
                  whiteSpace:"pre-wrap",
                  fontFamily:"monospace",
                  background:"#f8fafc",
                  padding:16,
                  borderRadius:16,
                  minHeight:400,
                  border:"1px solid #e5e7eb"
                }}>
                  {summary}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* スマホは下に表示 */}
        {mobile && (
          <div style={{ marginTop:16 }}>
            <div style={card}>
              <h3>Preview & Copy</h3>

              <div style={{
                display:"flex",
                gap:8,
                marginBottom:12
              }}>
                <button onClick={reset}
                  style={{
                    flex:1,
                    padding:"12px",
                    border:"none",
                    borderRadius:12,
                    background:"#fee2e2",
                    color:"#dc2626",
                    fontWeight:"bold"
                  }}>
                  リセット
                </button>

                <button onClick={()=>copy(summary)}
                  style={{
                    flex:1,
                    padding:"12px",
                    border:"none",
                    borderRadius:12,
                    background:"#2563eb",
                    color:"#fff",
                    fontWeight:"bold"
                  }}>
                  {copied ? "コピー完了" : "コピー"}
                </button>
              </div>

              <div style={{
                whiteSpace:"pre-wrap",
                fontFamily:"monospace",
                background:"#f8fafc",
                padding:16,
                borderRadius:16,
                minHeight:260,
                border:"1px solid #e5e7eb"
              }}>
                {summary}
              </div>
            </div>
          </div>
        )}

      </div>

      <footer style={{
        textAlign:"center",
        padding:"40px 20px",
        color:"#94a3b8",
        fontSize:12
      }}>
        © 2026 Goal Layer. All rights reserved.
      </footer>
    </div>
  );
}
