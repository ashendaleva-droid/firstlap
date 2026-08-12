"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BG, SURFACE, SURFACE_2, BORDER, TEXT, TEXT_DIM, GRAD, FONT_DISPLAY, RED } from "@/lib/theme";

const ROLES = [
  { value: "PILOT", label: "Пилот", desc: "Ребёнок, который тренируется" },
  { value: "PARENT", label: "Родитель", desc: "Слежу за прогрессом ребёнка" },
  { value: "COACH", label: "Тренер", desc: "Провожу тренировки" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "PILOT", childEmail: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось зарегистрироваться");
        setLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", { redirect: false, email: form.email, password: form.password });
      setLoading(false);
      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Ошибка сети. Попробуйте ещё раз.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 22, letterSpacing: 1.5 }}>ПЕРВЫЙ КРУГ</div>
          <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 4 }}>Регистрация</div>
        </div>

        <form onSubmit={submit} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Роль">
            <div style={{ display: "flex", gap: 8 }}>
              {ROLES.map((r) => (
                <button type="button" key={r.value} onClick={() => setForm({ ...form, role: r.value })} style={{
                  flex: 1, padding: "9px 6px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                  border: `1px solid ${form.role === r.value ? "transparent" : BORDER}`,
                  background: form.role === r.value ? GRAD : SURFACE_2,
                  color: form.role === r.value ? "#fff" : TEXT_DIM, fontSize: 12.5, fontWeight: 700,
                }}>
                  {r.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 5 }}>
              {ROLES.find((r) => r.value === form.role)?.desc}
            </div>
          </Field>

          <Field label="Имя">
            <input required value={form.name} onChange={set("name")} style={inputStyle} placeholder="Как к вам обращаться" />
          </Field>
          <Field label="Email">
            <input type="email" required value={form.email} onChange={set("email")} style={inputStyle} placeholder="you@example.com" />
          </Field>
          <Field label="Пароль">
            <input type="password" required minLength={6} value={form.password} onChange={set("password")} style={inputStyle} placeholder="минимум 6 символов" />
          </Field>

          {form.role === "PARENT" && (
            <Field label="Email вашего ребёнка (пилота)">
              <input type="email" value={form.childEmail} onChange={set("childEmail")} style={inputStyle} placeholder="ребёнок должен быть уже зарегистрирован" />
            </Field>
          )}

          {error && <div style={{ fontSize: 12.5, color: RED }}>{error}</div>}

          <button type="submit" disabled={loading} style={{
            marginTop: 6, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
            background: GRAD, color: "#fff", fontWeight: 700, fontSize: 14,
          }}>
            {loading ? "Создаём аккаунт…" : "Зарегистрироваться"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: TEXT_DIM }}>
          Уже есть аккаунт? <Link href="/login" style={{ color: "#3B82F6", fontWeight: 600, textDecoration: "none" }}>Войти</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: TEXT_DIM, fontWeight: 600, marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 9,
  padding: "10px 12px", color: TEXT, fontSize: 14,
};
