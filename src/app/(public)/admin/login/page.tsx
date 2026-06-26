/**
 * @file        page.tsx
 * @description Compact admin console login with demo credential shortcuts
 * @module      admin/login
 * @layer       page
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../providers/AuthProvider";
import { useLanguage } from "../../../../providers/LanguageProvider";
import { ShieldCheck, Loader2 } from "lucide-react";
import { showToast } from "../../../../utils/toast";
import LogoLoader from "../../../../components/common/LogoLoader";
import { DEMO_DEFAULT_PASSWORD } from "../../../(dashboard)/admin/admin.credentials";

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { loginWithJwt } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsAuthenticating(true);
    try {
      const res = await fetch("/api/abdm/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        await loginWithJwt(data.token, {
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
        });
        showToast(t("Admin session authorized."));
        router.push("/admin");
      } else {
        setErrorMsg(data.message || t("Invalid administrator credentials."));
      }
    } catch {
      setErrorMsg(
        t("Backend unreachable. Run: cd backend && npm run start:dev"),
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "16px",
      }}
    >
      <LogoLoader isLoading={isAuthenticating} type="login" />
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          padding: "28px 24px",
          borderRadius: "14px",
          border: "1px solid var(--border-color)",
          background: "var(--bg-card)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <ShieldCheck size={28} color="var(--accent-teal)" aria-hidden />
          <h1
            style={{ fontSize: "1.1rem", fontWeight: 800, margin: "8px 0 4px" }}
          >
            Admin console
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            Audited access · OWASP hardened
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              style={inputStyle}
            />
          </label>
          <label style={{ ...labelStyle, marginTop: "10px" }}>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={inputStyle}
            />
          </label>
          {errorMsg && (
            <p role="alert" style={{ color: "#ef4444", fontSize: "12px" }}>
              {errorMsg}
            </p>
          )}
          <button type="submit" disabled={isAuthenticating} style={submitStyle}>
            {isAuthenticating ? (
              <Loader2 size={18} className="spin" aria-hidden />
            ) : null}
            Sign in
          </button>
        </form>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            marginTop: "14px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setEmail("admin@abhasetu.com");
              setPassword(DEMO_DEFAULT_PASSWORD);
            }}
            style={prefillBtn}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("master@abhasetu.com");
              setPassword(DEMO_DEFAULT_PASSWORD);
            }}
            style={prefillBtn}
          >
            Master
          </button>
        </div>
        <p
          style={{
            fontSize: "10px",
            color: "var(--text-secondary)",
            textAlign: "center",
            marginTop: "12px",
          }}
        >
          Password: <code>{DEMO_DEFAULT_PASSWORD}</code>
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "4px",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid var(--border-color)",
};
const submitStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "14px",
  padding: "11px",
  borderRadius: "10px",
  border: "none",
  background: "var(--accent-teal)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  gap: "8px",
};
const prefillBtn: React.CSSProperties = {
  padding: "8px",
  borderRadius: "8px",
  border: "1px solid var(--border-color)",
  background: "var(--bg-secondary)",
  fontSize: "11px",
  cursor: "pointer",
};
