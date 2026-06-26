/**
 * @file        page.tsx
 * @description Compact stakeholder / facility login (admin, hospital, clinic, etc.)
 * @module      staff-login
 * @layer       page
 * @author      Platform Team
 * @created     2026-06-11
 * @modified    2026-06-26
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../providers/AuthProvider";
import { useLanguage } from "../../../providers/LanguageProvider";
import { ShieldCheck, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { showToast } from "../../../utils/toast";
import LogoLoader from "../../../components/common/LogoLoader";
import { STAKEHOLDER_CREDENTIALS } from "../../(dashboard)/admin/admin.credentials";

export default function StaffLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { loginWithJwt } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreds, setShowCreds] = useState(false);

  const prefill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setErrorMsg("");
    showToast(t("Credentials prefilled"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
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
        showToast(t("Welcome back!"));
        if (data.user.role === "admin" || data.user.role === "master_admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setErrorMsg(
          data.message || t("Invalid credentials or account pending approval."),
        );
      }
    } catch {
      setErrorMsg(t("Cannot reach backend. Start NestJS on port 3001."));
    } finally {
      setLoading(false);
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
      <LogoLoader isLoading={loading} type="login" />
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "28px 24px",
          borderRadius: "14px",
          border: "1px solid var(--border-color)",
          background: "var(--bg-card)",
          boxShadow: "var(--surface-shadow)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <ShieldCheck
            size={32}
            color="var(--accent-teal)"
            aria-hidden
            style={{ margin: "0 auto 8px" }}
          />
          <h1 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>
            Stakeholder suite
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              margin: "6px 0 0",
            }}
          >
            Hospitals, clinics, labs & administrators
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label style={labelStyle}>
            Email
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ ...labelStyle, marginTop: "12px" }}>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </label>
          {errorMsg && (
            <p
              role="alert"
              style={{ color: "#ef4444", fontSize: "12px", marginTop: "10px" }}
            >
              {errorMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "16px",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "var(--accent-teal)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <Loader2 size={18} className="spin" aria-hidden />
            ) : null}
            Sign in
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowCreds(!showCreds)}
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "8px",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "12px",
            color: "var(--accent-teal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          {showCreds ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Demo credentials
        </button>

        {showCreds && (
          <div
            style={{
              marginTop: "8px",
              maxHeight: "220px",
              overflow: "auto",
              fontSize: "11px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <caption className="sr-only">Demo login accounts</caption>
              <thead>
                <tr style={{ background: "var(--bg-secondary)" }}>
                  <th scope="col" style={thStyle}>
                    Role
                  </th>
                  <th scope="col" style={thStyle}>
                    Email
                  </th>
                  <th scope="col" style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {STAKEHOLDER_CREDENTIALS.map((c) => (
                  <tr
                    key={c.email}
                    style={{ borderTop: "1px solid var(--border-color)" }}
                  >
                    <td style={thStyle}>
                      {c.role}
                      <br />
                      <span
                        style={{
                          color:
                            c.status === "approved" ? "#22c55e" : "#f59e0b",
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={thStyle}>{c.email}</td>
                    <td style={thStyle}>
                      <button
                        type="button"
                        onClick={() => prefill(c.email, c.password)}
                        style={{
                          fontSize: "10px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--border-color)",
                          cursor: "pointer",
                        }}
                      >
                        Use
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "11px", marginTop: "16px" }}>
          <a href="/login" style={{ color: "var(--accent-teal)" }}>
            Citizen / ABHA login →
          </a>
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
  background: "var(--bg-secondary)",
};
const thStyle: React.CSSProperties = { padding: "6px", textAlign: "left" };
