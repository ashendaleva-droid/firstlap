"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BG, SURFACE, SURFACE_2, BORDER, TEXT, TEXT_DIM, GRAD, FONT_DISPLAY, RED } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (res?.error) {
      setError("Неверный email или пароль");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 22, letterSpacing: 1.5 }}>ПЕРВЫЙ КРУГ</div>
          <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 4 }}>Вход в личный кабинет</div>
        </div>

        <form onSubmit={submit} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="you@example.com" />
          </Field>
          <Field label="Пароль">
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
          </Field>

          {error && <div style={{ fontSize: 12.5, color: RED }}>{error}</div>}

          <button type="submit" disabled={loading} style={{
            marginTop: 6, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
            background: GRAD, color: "#fff", fontWeight: 700, fontSize: 14,
          }}>
            {loading ? "Входим…" : "Войти"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: TEXT_DIM }}>
          Нет аккаунта? <Link href="/register" style={{ color: "#3B82F6", fontWeight: 600, textDecoration: "none" }}>Зарегистрироваться</Link>
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
