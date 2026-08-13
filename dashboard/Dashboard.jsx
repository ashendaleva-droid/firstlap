"use client";

import React, { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import {
  Home, Flag, Timer, BookOpen, User, ChevronRight, Trophy,
  Lock, CheckCircle2, Plus, X, Users as UsersIcon, Award,
  MessageSquare, Target, LogOut, UserPlus, History,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  FONT_DISPLAY, FONT_BODY, FONT_MONO, GRAD, BG, SURFACE, SURFACE_2, BORDER, TEXT, TEXT_DIM, TEAL, RED,
} from "@/lib/theme";
import {
  COURSES, TOTAL_LESSONS, LESSONS_PER_COURSE, ACHIEVEMENTS_CATALOG, QUIZ_QUESTIONS,
  getCurrentLessonInfo, getCourseAndLessonForGlobalIndex,
} from "@/lib/lessons";
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
const inputStyle = {
  background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 9,
  padding: "9px 11px", color: TEXT, fontSize: 13.5, flex: 1, outline: "none", fontFamily: FONT_BODY,
};

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
  const done = idx >= TOTAL_LESSONS;
  const info = getCurrentLessonInfo(idx);
  const pr = allTimePR(sessions);
  const lastSession = sessions[sessions.length - 1];

  return (
    <div className="pk-fadeup" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Привет, {pilot.name} 👋</div>
        <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 2 }}>№ {pilot.number}</div>
      </div>

      <Card style={{ background: GRAD, border: "none" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.85, textTransform: "uppercase" }}>Твой уровень</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{done ? "🏆 ВСЕ КУРСЫ ПРОЙДЕНЫ" : info.course.badge}</div>
        {!done && <div style={{ fontSize: 13, marginTop: 10, opacity: 0.9 }}>Занятие {info.lessonIndexInCourse + 1} / {LESSONS_PER_COURSE} · {info.course.title}</div>}
        <ProgressBar value={idx} max={TOTAL_LESSONS} light />
        <div style={{ fontSize: 11, marginTop: 6, opacity: 0.8 }}>Всего пройдено {idx} / {TOTAL_LESSONS} занятий</div>
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

      {!done && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>Следующая тренировка</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>Занятие №{info.lessonIndexInCourse + 1}</div>
              <div style={{ fontSize: 13, color: "#B9BEDD", marginTop: 2 }}>«{info.lesson.title}»</div>
            </div>
            <button onClick={() => setTab("training")} style={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 9, padding: "9px 12px", color: TEXT, cursor: "pointer" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </Card>
      )}

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
  const done = idx >= TOTAL_LESSONS;
  const info = getCurrentLessonInfo(idx);

  return (
    <div className="pk-fadeup" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionLabel>Моя тренировка</SectionLabel>
      {done ? (
        <Card style={{ textAlign: "center", padding: 28 }}>
          <div style={{ fontSize: 34 }}>🏆</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>Все курсы пройдены!</div>
          <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 6 }}>Ты прошёл «Юный пилот», Reverse и PRO. Ты готов к детскому турниру и Time Attack.</div>
        </Card>
      ) : (
        <Card>
          <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>Сегодня · {info.course.title}</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>Занятие №{info.lessonIndexInCourse + 1}</div>
          <div style={{ fontSize: 14, color: "#B9BEDD", marginTop: 2 }}>«{info.lesson.title}»</div>

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <Target size={14} color="#3B82F6" />
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: 0.5 }}>Цель</span>
          </div>
          <div style={{ fontSize: 14, marginTop: 4 }}>{info.lesson.goal}</div>

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <BookOpen size={14} color="#3B82F6" />
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: 0.5 }}>Сегодня изучаем</span>
          </div>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: "#D6D8EC" }}>
            {info.lesson.topics.map((t) => <li key={t}>{t}</li>)}
          </ul>

          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Flag size={14} color="#3B82F6" />
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: 0.5 }}>Практика</span>
          </div>
          <div style={{ fontSize: 14, marginTop: 4 }}>{info.lesson.practice}</div>
        </Card>
      )}
    </div>
  );
}

function SessionCard({ s, isPR }) {
  const { course, lessonIndexInCourse } = getCourseAndLessonForGlobalIndex(s.lessonIndex);
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{course.title} · занятие №{lessonIndexInCourse + 1}</div>
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
      {[...sessions].reverse().map((s) => (
        <SessionCard key={s.id} s={s} isPR={pr != null && bestLap(s) === pr} />
      ))}
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

      {COURSES.map((course, ci) => {
        const courseStart = ci * LESSONS_PER_COURSE;
        const locked = idx < courseStart;
        return (
          <div key={course.code}>
            <SectionLabel>{course.badge}</SectionLabel>
            <div style={{ position: "relative", paddingLeft: 26, marginBottom: 8, opacity: locked ? 0.45 : 1 }}>
              <div style={{ position: "absolute", left: 9, top: 6, bottom: 6, width: 2, background: BORDER }} />
              {course.lessons.map((l, li) => {
                const globalIdx = courseStart + li;
                const done = globalIdx < idx;
                const current = globalIdx === idx;
                return (
                  <div key={li} style={{ position: "relative", marginBottom: 14 }}>
                    <div style={{
                      position: "absolute", left: -26, top: 2, width: 20, height: 20, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: done ? GRAD : current ? SURFACE_2 : SURFACE,
                      border: current ? "2px solid #3B82F6" : `2px solid ${BORDER}`, zIndex: 1,
                    }}>
                      {done ? <CheckCircle2 size={13} color="#fff" /> : locked ? <Lock size={10} color={TEXT_DIM} /> : <span style={{ fontSize: 10, color: current ? "#fff" : TEXT_DIM, fontWeight: 700 }}>{li + 1}</span>}
                    </div>
                    <Card style={{ opacity: done || current ? 1 : 0.6 }}>
                      <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>Занятие {li + 1}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{l.title}</div>
                      <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 3 }}>{l.goal}</div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <Card style={{ opacity: idx >= TOTAL_LESSONS ? 1 : 0.5, textAlign: "center" }}>
        <div style={{ fontSize: 26 }}>{idx >= TOTAL_LESSONS ? "🏆" : "🔒"}</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>Детский турнир и Time Attack</div>
        <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 3 }}>Открывается после прохождения PRO</div>
      </Card>
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
  const info = getCurrentLessonInfo(idx);
  const pr = allTimePR(sessions);
  const earnedCount = data.achievements.length;

  return (
    <div className="pk-fadeup" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ textAlign: "center", padding: 24 }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: GRAD, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800 }}>{pilot.name[0]}</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginTop: 10 }}>{pilot.name}</div>
        <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 2 }}>№ {String(pilot.number).padStart(2, "0")}</div>
        <div style={{ marginTop: 10, display: "inline-block", padding: "5px 12px", borderRadius: 20, background: SURFACE_2, fontSize: 12, fontWeight: 700 }}>
          {idx >= TOTAL_LESSONS ? "🏆 ВСЕ КУРСЫ ПРОЙДЕНЫ" : info.course.badge}
        </div>
      </Card>

      <SectionLabel>Статистика</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatBox label="Тренировок" value={sessions.length} />
        <StatBox label="Кругов всего" value={sessions.reduce((a, s) => a + s.laps.length, 0)} />
        <StatBox label="Лучший круг" value={fmtTime(pr)} accent={TEAL} />
        <StatBox label="Достижений" value={`${earnedCount} / ${ACHIEVEMENTS_CATALOG.length}`} />
      </div>

      <SectionLabel>Прогресс по курсам</SectionLabel>
      {COURSES.map((course, ci) => {
        const courseStart = ci * LESSONS_PER_COURSE;
        const courseProgress = Math.max(0, Math.min(LESSONS_PER_COURSE, idx - courseStart));
        return (
          <Card key={course.code}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              <span>{course.title}</span><span>{courseProgress} / {LESSONS_PER_COURSE}</span>
            </div>
            <ProgressBar value={courseProgress} max={LESSONS_PER_COURSE} />
          </Card>
        );
      })}
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
  const [view, setView] = useState("session"); // session | history | achievements

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
            <button key={p.id} onClick={() => { setSelectedId(p.id); setView("session"); }} style={{
              textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
              background: selectedId === p.id ? GRAD : SURFACE_2,
              border: `1px solid ${selectedId === p.id ? "transparent" : BORDER}`,
              color: selectedId === p.id ? "#fff" : TEXT, fontSize: 13.5, display: "flex", justifyContent: "space-between",
            }}>
              <span>№{p.number} · {p.name}</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>{p.lessonsCompleted}/{TOTAL_LESSONS}</span>
            </button>
          ))}
        </div>
      </Card>

      {selectedId && data && (
        <>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { k: "session", label: "Тренировка" },
              { k: "history", label: "История" },
              { k: "achievements", label: "Достижения" },
            ].map((t) => (
              <button key={t.k} onClick={() => setView(t.k)} style={{
                flex: 1, padding: "8px 6px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                border: `1px solid ${view === t.k ? "transparent" : BORDER}`,
                background: view === t.k ? GRAD : "transparent", color: view === t.k ? "#fff" : TEXT_DIM,
                fontSize: 12, fontWeight: 700,
              }}>{t.label}</button>
            ))}
          </div>

          {view === "session" && (
            <CoachSessionForm pilotId={selectedId} data={data} reload={() => loadPilotData(selectedId)} refreshList={loadPilots} />
          )}
          {view === "history" && <CoachHistory data={data} />}
          {view === "achievements" && (
            <CoachAchievements pilotId={selectedId} data={data} reload={() => loadPilotData(selectedId)} />
          )}
        </>
      )}
    </div>
  );
}

function CoachSessionForm({ pilotId, data, reload, refreshList }) {
  const { pilot } = data;
  const done = pilot.lessonsCompleted >= TOTAL_LESSONS;
  const info = done ? null : getCurrentLessonInfo(pilot.lessonsCompleted);

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

  if (done) {
    return <Card><div style={{ fontSize: 13.5 }}>🏆 Пилот {pilot.name} прошёл все три курса (Юный пилот, Reverse, PRO) — {TOTAL_LESSONS}/{TOTAL_LESSONS} занятий.</div></Card>;
  }

  return (
    <>
      <Card>
        <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>Текущее занятие · {pilot.name} · {info.course.title}</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3 }}>№{info.lessonIndexInCourse + 1} «{info.lesson.title}»</div>
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
  );
}

function CoachHistory({ data }) {
  const { sessions } = data;
  const pr = allTimePR(sessions);
  if (sessions.length === 0) return <Card><div style={{ fontSize: 13, color: TEXT_DIM }}>Пока нет тренировок.</div></Card>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <History size={14} color={TEXT_DIM} />
        <SectionLabel>История тренировок</SectionLabel>
      </div>
      {[...sessions].reverse().map((s) => (
        <SessionCard key={s.id} s={s} isPR={pr != null && bestLap(s) === pr} />
      ))}
    </div>
  );
}

function CoachAchievements({ pilotId, data, reload }) {
  const earned = new Set(data.achievements);
  const [awarding, setAwarding] = useState(null);

  const award = async (code) => {
    setAwarding(code);
    await fetch("/api/coach/award-achievement", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pilotId, code }),
    });
    setAwarding(null);
    await reload();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12, color: TEXT_DIM }}>Достижения выдаются автоматически, но некоторые (например «Стабильность») тренер может выдать вручную.</div>
      {ACHIEVEMENTS_CATALOG.map((a) => {
        const has = earned.has(a.code);
        return (
          <Card key={a.code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: has ? 1 : 0.75 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 22 }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: TEXT_DIM }}>{a.desc}</div>
              </div>
            </div>
            {has ? (
              <div style={{ fontSize: 11, color: TEAL, fontWeight: 700 }}>Получено</div>
            ) : (
              <button onClick={() => award(a.code)} disabled={awarding === a.code} style={{
                background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px",
                color: TEXT, fontSize: 11.5, cursor: "pointer", fontWeight: 600,
              }}>
                {awarding === a.code ? "…" : "Выдать"}
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ============================================================
   PARENT
   ============================================================ */

function ParentApp() {
  const [children, setChildren] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [childEmail, setChildEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  const loadChildren = useCallback(async () => {
    const res = await fetch("/api/parent/children");
    if (res.ok) {
      const list = await res.json();
      setChildren(list);
      if (list.length && !selectedId) setSelectedId(list[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { loadChildren(); }, [loadChildren]);

  const loadChildData = useCallback(async (id) => {
    const res = await fetch(`/api/pilot/me?pilotId=${id}`);
    if (res.ok) setData(await res.json());
  }, []);
  useEffect(() => { if (selectedId) loadChildData(selectedId); }, [selectedId, loadChildData]);

  const addChild = async () => {
    setAddError("");
    setAdding(true);
    const res = await fetch("/api/parent/link-child", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childEmail }),
    });
    const json = await res.json();
    setAdding(false);
    if (!res.ok) { setAddError(json.error || "Не удалось добавить"); return; }
    setChildEmail("");
    setShowAdd(false);
    await loadChildren();
  };

  if (!children) return <Loading />;

  return (
    <div className="pk-fadeup" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14, paddingBottom: 40 }}>
      <SectionLabel>Мои дети</SectionLabel>

      {children.length === 0 && (
        <Card><div style={{ fontSize: 13.5, color: TEXT_DIM }}>Пока нет привязанных детей. Добавьте ребёнка по его email ниже.</div></Card>
      )}

      {children.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {children.map((c) => (
            <button key={c.id} onClick={() => setSelectedId(c.id)} style={{
              flexShrink: 0, padding: "8px 14px", borderRadius: 20, cursor: "pointer",
              border: `1px solid ${selectedId === c.id ? "transparent" : BORDER}`,
              background: selectedId === c.id ? GRAD : SURFACE, color: selectedId === c.id ? "#fff" : TEXT,
              fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
            }}>
              № {c.number} · {c.name}
            </button>
          ))}
        </div>
      )}

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          background: SURFACE_2, border: `1px dashed ${BORDER}`, borderRadius: 12, padding: "11px",
          color: TEXT_DIM, cursor: "pointer", fontSize: 13, fontWeight: 600,
        }}>
          <UserPlus size={15} /> Добавить ребёнка
        </button>
      ) : (
        <Card>
          <SectionLabel>Email ребёнка (пилота)</SectionLabel>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={childEmail} onChange={(e) => setChildEmail(e.target.value)} placeholder="pilot@example.com" style={{ ...inputStyle, width: "100%" }} />
            <button onClick={addChild} disabled={adding || !childEmail} style={{ background: GRAD, border: "none", color: "#fff", borderRadius: 9, padding: "9px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12.5 }}>
              {adding ? "…" : "Добавить"}
            </button>
          </div>
          {addError && <div style={{ fontSize: 12, color: RED, marginTop: 8 }}>{addError}</div>}
          <button onClick={() => { setShowAdd(false); setAddError(""); }} style={{ marginTop: 10, background: "none", border: "none", color: TEXT_DIM, fontSize: 12, cursor: "pointer" }}>Отмена</button>
        </Card>
      )}

      {selectedId && data && <ParentChildDetail data={data} />}
    </div>
  );
}

function ParentChildDetail({ data }) {
  const { pilot, sessions, achievements } = data;
  const idx = pilot.lessonsCompleted;
  const info = getCurrentLessonInfo(idx);
  const pr = allTimePR(sessions);
  const lastSession = sessions[sessions.length - 1];
  const chartData = sessions.map((s, i) => ({ i: i + 1, time: bestLap(s) / 1000 }));

  return (
    <>
      <Card style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{pilot.name[0]}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{pilot.name}</div>
          <div style={{ fontSize: 12, color: TEXT_DIM }}>{idx >= TOTAL_LESSONS ? "🏆 Все курсы пройдены" : `${info.course.badge} · ${info.lessonIndexInCourse + 1}/${LESSONS_PER_COURSE}`}</div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatBox label="Посещено" value={`${sessions.length} трен.`} />
        <StatBox label="Лучший круг" value={fmtTime(pr)} accent={TEAL} />
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
          <span>Общий прогресс</span><span>{idx}/{TOTAL_LESSONS}</span>
        </div>
        <ProgressBar value={idx} max={TOTAL_LESSONS} />
      </Card>

      {chartData.length > 1 && (
        <Card>
          <SectionLabel>График прогресса</SectionLabel>
          <div style={{ height: 150 }}>
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

      <SectionLabel>Последний комментарий тренера</SectionLabel>
      <Card>
        {lastSession?.comment ? <div style={{ fontSize: 13.5, color: "#D6D8EC" }}>{lastSession.comment}</div> : <div style={{ fontSize: 13, color: TEXT_DIM }}>Комментариев пока нет.</div>}
      </Card>

      {lastSession?.task && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={16} color="#3B82F6" />
            <div style={{ fontSize: 11, color: TEXT_DIM, fontWeight: 600, textTransform: "uppercase" }}>Текущая цель</div>
          </div>
          <div style={{ fontSize: 14, marginTop: 6 }}>{lastSession.task}</div>
        </Card>
      )}

      <SectionLabel>История тренировок</SectionLabel>
      {sessions.length === 0 && <Card><div style={{ fontSize: 13, color: TEXT_DIM }}>Пока нет данных.</div></Card>}
      {[...sessions].reverse().slice(0, 5).map((s) => (
        <SessionCard key={s.id} s={s} isPR={pr != null && bestLap(s) === pr} />
      ))}

      <SectionLabel>Достижения</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ACHIEVEMENTS_CATALOG.filter((a) => achievements.includes(a.code)).map((a) => (
          <div key={a.code} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "6px 12px", fontSize: 12.5 }}>{a.icon} {a.title}</div>
        ))}
        {achievements.length === 0 && <div style={{ fontSize: 13, color: TEXT_DIM }}>Пока нет достижений.</div>}
      </div>
    </>
  );
}
