"use client";

import React, { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import {
  Home, Flag, Timer, BookOpen, User, ChevronRight, Trophy,
  Lock, CheckCircle2, Plus, X, Users as UsersIcon, Award,
  MessageSquare, Target, LogOut,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  FONT_DISPLAY, FONT_BODY, FONT_MONO, GRAD, BG, SURFACE, SURFACE_2, BORDER, TEXT, TEXT_DIM, TEAL, RED,
} from "@/lib/theme";
import { LESSONS_YOUNG_PILOT, ACHIEVEMENTS_CATALOG, QUIZ_QUESTIONS } from "@/lib/lessons";
import { DICTIONARY } from "@/lib/dictionary";

function fmtTime(ms) {
  if (ms == null) return "—";
  return (ms / 1000).toFixed(3);
}
function bestLap(session) {
  if (!session.laps.length) return null;
  return Math.min(...session.laps);
}
function avgLap(session) {
  if (!session.laps.length) return null;
  return session.laps.reduce((a, b) => a + b, 0) / session.laps.length;
}
function allTimePR(sessions) {
  const bests = sessions.map(bestLap).filter((x) => x != null);
  return bests.length ? Math.min(...bests) : null;
}

/* ============================================================ */

export default function Dashboard({ role, userName }) {
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT_BODY, color: TEXT }}>
      <TopBar role={role} userName={userName} />
      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", minHeight: "calc(100vh - 52px)" }}>
        {role === "PILOT" && <PilotApp />}
        {role === "COACH" && <CoachApp />}
        {role === "PARENT" && <ParentApp />}
      </div>
    </div>
  );
}

const ROLE_LABEL = { PILOT: "Пилот", COACH: "Тренер", PARENT: "Родитель" };

function TopBar({ role, userName }) {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", background: "#08090F", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ width: "100%", maxWidth: 480, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13, letterSpacing: 1.5 }}>ПЕРВЫЙ КРУГ</div>
          <div style={{ fontSize: 10.5, color: TEXT_DIM, marginTop: 1 }}>{userName} · {ROLE_LABEL[role]}</div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} style={{
          background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 9, padding: "7px 10px",
          color: TEXT_DIM, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11.5,
        }}>
          <LogOut size={13} /> Выйти
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: TEXT_DIM, textTransform: "uppercase", marginBottom: 10 }}>{children}</div>;
}
function Card({ children, style }) {
  return <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16, ...style }}>{children}</div>;
}
function ProgressBar({ value, max, light }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginTop: 8, height: 8, borderRadius: 4, background: light ? "rgba(255,255,255,0.25)" : SURFACE_2, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: light ? "#fff" : GRAD, transition: "width .4s ease" }} />
    </div>
  );
}
function StatBox({ label, value, accent, icon }) {
  return (
    <Card>
      <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 19, fontWeight: 700, marginTop: 4, color: accent || TEXT, display: "flex", alignItems: "center", gap: 5 }}>
        {icon}{value}
      </div>
    </Card>
  );
}
function Loading() {
  return <div style={{ padding: 40, color: TEXT_DIM, fontSize: 13 }}>Загрузка…</div>;
}

/* ============================================================
   PILOT
   ============================================================ */

function PilotApp() {
  const [tab, setTab] = useState("home");
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/pilot/me");
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!data) return <Loading />;

  return (
    <>
      <div className="pk-scroll" style={{ flex: 1, overflowY: "auto", paddingBottom: 84 }}>
        {tab === "home" && <PilotHome data={data} setTab={setTab} />}
        {tab === "training" && <PilotTraining data={data} />}
        {tab === "results" && <PilotResults data={data} />}
        {tab === "learn" && <PilotLearn data={data} reload={load} />}
        {tab === "profile" && <PilotProfile data={data} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { k: "home", label: "Главная", icon: Home },
    { k: "training", label: "Тренировки", icon: Flag },
    { k: "results", label: "Результаты", icon: Timer },
    { k: "learn", label: "Обучение", icon: BookOpen },
    { k: "profile", label: "Профиль", icon: User },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, width: "100%", maxWidth: 480, background: "rgba(10,11,20,0.92)", backdropFilter: "blur(10px)", borderTop: `1px solid ${BORDER}`, display: "flex" }}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = tab === it.k;
        return (
          <button key={it.k} onClick={() => setTab(it.k)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "10px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Icon size={19} color={active ? "#fff" : TEXT_DIM} strokeWidth={active ? 2.3 : 1.8} />
            <span style={{ fontSize: 10, color: active ? "#fff" : TEXT_DIM, fontWeight: active ? 700 : 500 }}>{it.label}</span>
            {active && <div style={{ width: 4, height: 4, borderRadius: 2, background: GRAD, marginTop: 1 }} />}
          </button>
        );
      })}
    </div>
  );
}

function PilotHome({ data, setTab }) {
  const { pilot, sessions } = data;
  const idx = pilot.lessonsCompleted;
  const total = LESSONS_YOUNG_PILOT.length;
  const nextLesson = LESSONS_YOUNG_PILOT[Math.min(idx, total - 1)];
  const pr = allTimePR(sessions);
  const lastSession = sessions[sessions.length - 1];

  return (
    <div className="pk-fadeup" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Привет, {pilot.name} 👋</div>
        <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 2 }}>Курс «Юный пилот» · № {pilot.number}</div>
      </div>

      <Card style={{ background: GRAD, border: "none" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.85, textTransform: "uppercase" }}>Твой уровень</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>🟣 ЮНЫЙ ПИЛОТ</div>
        <div style={{ fontSize: 13, marginTop: 10, opacity: 0.9 }}>Занятие {Math.min(idx + 1, total)} / {total}</div>
        <ProgressBar value={idx} max={total} light />
      </Card>

      <div style={{ display: "flex", gap: 10 }}>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>Лучший круг</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700, marginTop: 4, color: pr ? TEAL : TEXT_DIM }}>
            {fmtTime(pr)}<span style={{ fontSize: 12, marginLeft: 3, color: TEXT_DIM }}>сек</span>
          </div>
          {pr && <div style={{ fontSize: 11, color: TEAL, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}><Trophy size={11} /> Личный рекорд</div>}
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>XP</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700, marginTop: 4 }}>{pilot.xp}</div>
          <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 4 }}>очков опыта</div>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>Следующая тренировка</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>Занятие №{Math.min(idx + 1, total)}</div>
            <div style={{ fontSize: 13, color: "#B9BEDD", marginTop: 2 }}>«{nextLesson.title}»</div>
          </div>
          <button onClick={() => setTab("training")} style={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 9, padding: "9px 12px", color: TEXT, cursor: "pointer" }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </Card>

      {lastSession?.task && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={16} color="#3B82F6" />
            <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600, textTransform: "uppercase" }}>Твоя цель</div>
          </div>
          <div style={{ fontSize: 14, marginTop: 6 }}>{lastSession.task}</div>
        </Card>
      )}
    </div>
  );
}

function PilotTraining({ data }) {
  const idx = data.pilot.lessonsCompleted;
  const total = LESSONS_YOUNG_PILOT.length;
  const done = idx >= total;
  const lesson = LESSONS_YOUNG_PILOT[Math.min(idx, total - 1)];

  return (
    <div className="pk-fadeup" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionLabel>Моя тренировка</SectionLabel>
      {done ? (
        <Card style={{ textAlign: "center", padding: 28 }}>
          <div style={{ fontSize: 34 }}>🎉</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>Курс завершён!</div>
          <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 6 }}>Ты получил звание «Юный пилот электрокартинга».</div>
        </Card>
      ) : (
        <Card>
          <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>Сегодня</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>Занятие №{idx + 1}</div>
          <div style={{ fontSize: 14, color: "#B9BEDD", marginTop: 2 }}>«{lesson.title}»</div>

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <Target size={14} color="#3B82F6" />
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: 0.5 }}>Цель</span>
          </div>
          <div style={{ fontSize: 14, marginTop: 4 }}>{lesson.goal}</div>

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <BookOpen size={14} color="#3B82F6" />
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: 0.5 }}>Сегодня изучаем</span>
          </div>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "#D6D8EC" }}>
            {lesson.topics.map((t) => <li key={t}>{t}</li>)}
          </ul>

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Flag size={14} color="#3B82F6" />
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: 0.5 }}>Практика</span>
          </div>
          <div style={{ fontSize: 14, marginTop: 4 }}>{lesson.practice}</div>
        </Card>
      )}
    </div>
  );
}

function PilotResults({ data }) {
  const sessions = data.sessions;
  const pr = allTimePR(sessions);
  const lastSession = sessions[sessions.length - 1];
  const chartData = sessions.map((s, i) => ({ i: i + 1, time: bestLap(s) / 1000 }));

  return (
    <div className="pk-fadeup" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionLabel>Мои круги</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatBox label="Личный рекорд" value={fmtTime(pr)} accent={TEAL} icon={<Trophy size={13} />} />
        <StatBox label="Последний круг" value={fmtTime(lastSession && bestLap(lastSession))} />
        <StatBox label="Тренировок" value={sessions.length} />
        <StatBox label="Всего кругов" value={sessions.reduce((a, s) => a + s.laps.length, 0)} />
      </div>

      {chartData.length > 1 && (
        <Card>
          <SectionLabel>График прогресса</SectionLabel>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={BORDER} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="i" stroke={TEXT_DIM} tick={{ fontSize: 10 }} />
                <YAxis stroke={TEXT_DIM} tick={{ fontSize: 10 }} domain={["dataMin - 0.3", "dataMax + 0.3"]} />
                <Tooltip contentStyle={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v.toFixed(3)} сек`, "Лучший круг"]} labelFormatter={(l) => `Тренировка ${l}`} />
                <Line type="monotone" dataKey="time" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3, fill: "#7C3AED" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <SectionLabel>История тренировок</SectionLabel>
      {sessions.length === 0 && <Card><div style={{ fontSize: 13, color: TEXT_DIM }}>Пока нет данных.</div></Card>}
      {[...sessions].reverse().map((s) => {
        const isPR = pr != null && bestLap(s) === pr;
        return (
          <Card key={s.id}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Тренировка №{s.lessonIndex + 1}</div>
              <div style={{ fontSize: 11, color: TEXT_DIM }}>{new Date(s.date).toLocaleDateString("ru-RU")}</div>
            </div>
            <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 2 }}>{s.laps.length} кругов</div>
            <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: TEXT_DIM }}>Лучший круг</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700, color: isPR ? TEAL : TEXT }}>{fmtTime(bestLap(s))}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: TEXT_DIM }}>Средний круг</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 700 }}>{fmtTime(avgLap(s))}</div>
              </div>
            </div>
            {isPR && <div style={{ marginTop: 8, fontSize: 12, color: TEAL, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><Trophy size={13} /> ЛИЧНЫЙ РЕКОРД</div>}
            {s.comment && (
              <div style={{ marginTop: 10, padding: 10, background: SURFACE_2, borderRadius: 10, fontSize: 12.5, color: "#D6D8EC" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                  <MessageSquare size={11} color={TEXT_DIM} />
                  <span style={{ fontSize: 10, color: TEXT_DIM, fontWeight: 700, textTransform: "uppercase" }}>Комментарий тренера</span>
                </div>
                {s.comment}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function PilotLearn({ data, reload }) {
  const [sub, setSub] = useState("path");
  return (
    <div className="pk-fadeup" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
        {[
          { k: "path", label: "Мой курс" },
          { k: "dict", label: "Словарь" },
          { k: "quiz", label: "Тесты" },
          { k: "ach", label: "Достижения" },
        ].map((t) => (
          <button key={t.k} onClick={() => setSub(t.k)} style={{ padding: "7px 13px", borderRadius: 20, border: `1px solid ${sub === t.k ? "transparent" : BORDER}`, background: sub === t.k ? GRAD : "transparent", color: sub === t.k ? "#fff" : TEXT_DIM, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>
      {sub === "path" && <PathOfPilot data={data} />}
      {sub === "dict" && <Dictionary />}
      {sub === "quiz" && <Quiz reload={reload} />}
      {sub === "ach" && <Achievements data={data} />}
    </div>
  );
}

function PathOfPilot({ data }) {
  const idx = data.pilot.lessonsCompleted;
  return (
    <>
      <Card style={{ background: GRAD, border: "none" }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>ПУТЬ ПИЛОТА</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>🟣 Юный пилот → 🔵 Reverse → 🟣 PRO → 🏆 Турнир → 🏁 Time Attack</div>
      </Card>
      <div style={{ position: "relative", paddingLeft: 26, marginTop: 4 }}>
        <div style={{ position: "absolute", left: 9, top: 6, bottom: 6, width: 2, background: BORDER }} />
        {LESSONS_YOUNG_PILOT.map((l, i) => {
          const done = i < idx;
          const current = i === idx;
          return (
            <div key={i} style={{ position: "relative", marginBottom: 14 }}>
              <div style={{ position: "absolute", left: -26, top: 2, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? GRAD : current ? SURFACE_2 : SURFACE, border: current ? "2px solid #3B82F6" : `2px solid ${BORDER}`, zIndex: 1 }}>
                {done ? <CheckCircle2 size={13} color="#fff" /> : <span style={{ fontSize: 10, color: current ? "#fff" : TEXT_DIM, fontWeight: 700 }}>{i + 1}</span>}
              </div>
              <Card style={{ opacity: done || current ? 1 : 0.55 }}>
                <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>Занятие {i + 1}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{l.title}</div>
                <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 3 }}>{l.goal}</div>
              </Card>
            </div>
          );
        })}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: -26, top: 2, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: idx >= 8 ? GRAD : SURFACE, border: `2px solid ${BORDER}`, zIndex: 1 }}>
            {idx >= 8 ? <Trophy size={12} color="#fff" /> : <Lock size={11} color={TEXT_DIM} />}
          </div>
          <Card style={{ opacity: idx >= 8 ? 1 : 0.5 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>🔵 PILOTING: REVERSE</div>
            <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 3 }}>Открывается после завершения «Юный пилот»</div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Dictionary() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {DICTIONARY.map((d) => (
        <Card key={d.term} style={{ cursor: "pointer" }}>
          <div onClick={() => setOpen(open === d.term ? null : d.term)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{d.term}</span>
            <ChevronRight size={15} color={TEXT_DIM} style={{ transform: open === d.term ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
          </div>
          {open === d.term && (
            <div className="pk-fadeup" style={{ marginTop: 10, fontSize: 13, color: "#D6D8EC", lineHeight: 1.6 }}>
              <div>{d.explanation}</div>
              <div style={{ marginTop: 8, padding: 9, background: SURFACE_2, borderRadius: 8, fontSize: 12.5 }}>
                <span style={{ color: TEXT_DIM, fontWeight: 700 }}>Пример: </span>{d.example}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function Quiz({ reload }) {
  const [qi, setQi] = useState(0);
  const [answered, setAnswered] = useState(null);
  const q = QUIZ_QUESTIONS[qi % QUIZ_QUESTIONS.length];

  const handleAnswer = async (opt) => {
    if (answered) return;
    setAnswered(opt);
    if (opt === q.correct) {
      await fetch("/api/quiz/xp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: 20 }) });
      reload();
    }
  };
  const next = () => { setAnswered(null); setQi((qi + 1) % QUIZ_QUESTIONS.length); };

  return (
    <Card>
      <SectionLabel>Тест {qi + 1} / {QUIZ_QUESTIONS.length}</SectionLabel>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt) => {
          const isCorrect = opt === q.correct;
          const show = answered != null;
          let bg = SURFACE_2, border = BORDER, color = TEXT;
          if (show && isCorrect) { bg = "rgba(34,211,166,0.15)"; border = TEAL; color = TEAL; }
          else if (show && opt === answered && !isCorrect) { bg = "rgba(245,87,108,0.15)"; border = RED; color = RED; }
          return (
            <button key={opt} onClick={() => handleAnswer(opt)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: answered ? "default" : "pointer", background: bg, border: `1px solid ${border}`, color, fontSize: 13.5 }}>{opt}</button>
          );
        })}
      </div>
      {answered && (
        <div className="pk-fadeup" style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: answered === q.correct ? TEAL : RED }}>
            {answered === q.correct ? "✅ Правильно! +20 XP" : "Правильный ответ: " + q.correct}
          </div>
          <button onClick={next} style={{ background: GRAD, border: "none", color: "#fff", borderRadius: 9, padding: "9px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12.5 }}>Далее</button>
        </div>
      )}
    </Card>
  );
}

function Achievements({ data }) {
  const earned = new Set(data.achievements);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {ACHIEVEMENTS_CATALOG.map((a) => {
        const has = earned.has(a.code);
        return (
          <Card key={a.code} style={{ opacity: has ? 1 : 0.4, textAlign: "center" }}>
            <div style={{ fontSize: 26 }}>{a.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{a.title}</div>
            <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 3 }}>{a.desc}</div>
            {!has && <Lock size={12} color={TEXT_DIM} style={{ marginTop: 6 }} />}
          </Card>
        );
      })}
    </div>
  );
}

function PilotProfile({ data }) {
  const { pilot, sessions } = data;
  const idx = pilot.lessonsCompleted;
  const total = LESSONS_YOUNG_PILOT.length;
  const pr = allTimePR(sessions);
  const earnedCount = data.achievements.length;

  return (
    <div className="pk-fadeup" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ textAlign: "center", padding: 24 }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: GRAD, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800 }}>{pilot.name[0]}</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginTop: 10 }}>{pilot.name}</div>
        <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 2 }}>№ {String(pilot.number).padStart(2, "0")}</div>
        <div style={{ marginTop: 10, display: "inline-block", padding: "5px 12px", borderRadius: 20, background: SURFACE_2, fontSize: 12, fontWeight: 700 }}>🟣 ЮНЫЙ ПИЛОТ</div>
      </Card>

      <SectionLabel>Статистика</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatBox label="Тренировок" value={sessions.length} />
        <StatBox label="Кругов всего" value={sessions.reduce((a, s) => a + s.laps.length, 0)} />
        <StatBox label="Лучший круг" value={fmtTime(pr)} accent={TEAL} />
        <StatBox label="Достижений" value={`${earnedCount} / ${ACHIEVEMENTS_CATALOG.length}`} />
      </div>

      <SectionLabel>Прогресс курса</SectionLabel>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
          <span>Юный пилот</span><span>{idx} / {total}</span>
        </div>
        <ProgressBar value={idx} max={total} />
      </Card>
    </div>
  );
}

/* ============================================================
   COACH
   ============================================================ */

function CoachApp() {
  const [pilots, setPilots] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(null);

  const loadPilots = useCallback(async () => {
    const res = await fetch("/api/coach/pilots");
    if (res.ok) setPilots(await res.json());
  }, []);
  useEffect(() => { loadPilots(); }, [loadPilots]);

  const loadPilotData = useCallback(async (id) => {
    const res = await fetch(`/api/pilot/me?pilotId=${id}`);
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => { if (selectedId) loadPilotData(selectedId); }, [selectedId, loadPilotData]);

  if (!pilots) return <Loading />;

  return (
    <div className="pk-fadeup" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, paddingBottom: 40 }}>
      <SectionLabel>Панель тренера</SectionLabel>

      <Card>
        <SectionLabel>Выберите пилота</SectionLabel>
        {pilots.length === 0 && <div style={{ fontSize: 13, color: TEXT_DIM }}>Пока нет зарегистрированных пилотов.</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {pilots.map((p) => (
            <button key={p.id} onClick={() => setSelectedId(p.id)} style={{
              textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
              background: selectedId === p.id ? GRAD : SURFACE_2,
              border: `1px solid ${selectedId === p.id ? "transparent" : BORDER}`,
              color: selectedId === p.id ? "#fff" : TEXT, fontSize: 13.5, display: "flex", justifyContent: "space-between",
            }}>
              <span>№{p.number} · {p.name}</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>{p.lessonsCompleted}/8</span>
            </button>
          ))}
        </div>
      </Card>

      {selectedId && data && <CoachSessionForm pilotId={selectedId} data={data} reload={() => loadPilotData(selectedId)} refreshList={loadPilots} />}
    </div>
  );
}

function CoachSessionForm({ pilotId, data, reload, refreshList }) {
  const { pilot } = data;
  const total = LESSONS_YOUNG_PILOT.length;
  const done = pilot.lessonsCompleted >= total;
  const lesson = LESSONS_YOUNG_PILOT[Math.min(pilot.lessonsCompleted, total - 1)];

  const [laps, setLaps] = useState([]);
  const [lapInput, setLapInput] = useState("");
  const [comment, setComment] = useState("");
  const [task, setTask] = useState("");
  const [saving, setSaving] = useState(false);

  const addLap = () => {
    const sec = parseFloat(lapInput.replace(",", "."));
    if (!isNaN(sec) && sec > 0) { setLaps([...laps, Math.round(sec * 1000)]); setLapInput(""); }
  };
  const removeLap = (i) => setLaps(laps.filter((_, j) => j !== i));

  const completeSession = async () => {
    if (laps.length === 0) return;
    setSaving(true);
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pilotId, laps, comment, task }),
    });
    setSaving(false);
    setLaps([]); setComment(""); setTask("");
    await reload();
    await refreshList();
  };

  return (
    <>
      {done ? (
        <Card><div style={{ fontSize: 13.5 }}>Курс «Юный пилот» завершён (8/8) для пилота {pilot.name}.</div></Card>
      ) : (
        <>
          <Card>
            <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>Текущее занятие · {pilot.name}</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>№{pilot.lessonsCompleted + 1} «{lesson.title}»</div>
          </Card>

          <Card>
            <SectionLabel>Внести круги (сек)</SectionLabel>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={lapInput} onChange={(e) => setLapInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLap()} placeholder="напр. 33.412" style={inputStyle} />
              <button onClick={addLap} style={{ background: GRAD, border: "none", color: "#fff", borderRadius: 9, padding: "9px 12px", cursor: "pointer" }}><Plus size={16} /></button>
            </div>
            {laps.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {laps.map((l, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: SURFACE_2, borderRadius: 8, padding: "5px 8px", fontFamily: FONT_MONO, fontSize: 12.5 }}>
                    {fmtTime(l)}
                    <X size={12} color={TEXT_DIM} style={{ cursor: "pointer" }} onClick={() => removeLap(i)} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <SectionLabel>Комментарий тренера</SectionLabel>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Например: сегодня хорошо работал с торможением…" style={{ ...inputStyle, width: "100%", minHeight: 64, resize: "vertical" }} />
          </Card>

          <Card>
            <SectionLabel>Задание к следующей тренировке</SectionLabel>
            <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Например: стабилизировать 5 кругов подряд" style={{ ...inputStyle, width: "100%" }} />
          </Card>

          <button onClick={completeSession} disabled={laps.length === 0 || saving} style={{
            padding: "13px", borderRadius: 12, border: "none", cursor: laps.length ? "pointer" : "not-allowed",
            background: laps.length ? GRAD : SURFACE_2, color: laps.length ? "#fff" : TEXT_DIM,
            fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <CheckCircle2 size={17} /> {saving ? "Сохраняем…" : "Завершить тренировку"}
          </button>
        </>
      )}
    </>
  );
}

const inputStyle = {
  background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 9,
  padding: "9px 11px", color: TEXT, fontSize: 13.5, flex: 1, outline: "none", fontFamily: FONT_BODY,
};

/* ============================================================
   PARENT
   ============================================================ */

function ParentApp() {
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/pilot/me");
      if (res.ok) setData(await res.json());
      else setNotFound(true);
    })();
  }, []);

  if (notFound) {
    return (
      <div style={{ padding: 16 }}>
        <Card><div style={{ fontSize: 13.5, color: TEXT_DIM }}>Ребёнок ещё не привязан к вашему аккаунту. Убедитесь, что при регистрации указан правильный email пилота.</div></Card>
      </div>
    );
  }
  if (!data) return <Loading />;

  const { pilot, sessions, achievements } = data;
  const total = LESSONS_YOUNG_PILOT.length;
  const pr = allTimePR(sessions);
  const lastSession = sessions[sessions.length - 1];

  return (
    <div className="pk-fadeup" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, paddingBottom: 40 }}>
      <SectionLabel>Мой ребёнок</SectionLabel>
      <Card style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{pilot.name[0]}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{pilot.name}</div>
          <div style={{ fontSize: 12, color: TEXT_DIM }}>🟣 Юный пилот · {pilot.lessonsCompleted}/{total} занятий</div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatBox label="Посещено" value={`${sessions.length} трен.`} />
        <StatBox label="Лучший круг" value={fmtTime(pr)} accent={TEAL} />
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
          <span>Прогресс курса</span><span>{pilot.lessonsCompleted}/{total}</span>
        </div>
        <ProgressBar value={pilot.lessonsCompleted} max={total} />
      </Card>

      <SectionLabel>Последний комментарий тренера</SectionLabel>
      <Card>
        {lastSession?.comment ? <div style={{ fontSize: 13.5, color: "#D6D8EC" }}>{lastSession.comment}</div> : <div style={{ fontSize: 13, color: TEXT_DIM }}>Комментариев пока нет.</div>}
      </Card>

      <SectionLabel>Достижения</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ACHIEVEMENTS_CATALOG.filter((a) => achievements.includes(a.code)).map((a) => (
          <div key={a.code} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "6px 12px", fontSize: 12.5 }}>{a.icon} {a.title}</div>
        ))}
        {achievements.length === 0 && <div style={{ fontSize: 13, color: TEXT_DIM }}>Пока нет достижений.</div>}
      </div>
    </div>
  );
}
