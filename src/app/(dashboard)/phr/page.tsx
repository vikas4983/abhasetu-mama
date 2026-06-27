/**
 * @file        page.tsx
 * @description PHR enrollment, login, profile, consent PIN, and health locker management
 * @module      phr
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

"use client";

import React, { useCallback, useState } from "react";
import type { AxiosResponse } from "axios";
import { phrService, type PhrApiResponse } from "../../../lib/api/services/phr.service";

type TabId = "enroll" | "login" | "profile" | "pin" | "locker";

const TABS: { id: TabId; label: string }[] = [
  { id: "enroll", label: "Enrollment" },
  { id: "login", label: "Login" },
  { id: "profile", label: "Profile" },
  { id: "pin", label: "Consent PIN" },
  { id: "locker", label: "Locker & Consent" },
];

export default function PhrPage() {
  const [tab, setTab] = useState<TabId>("login");
  const [xToken, setXToken] = useState("");
  const [txnId, setTxnId] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("123456");
  const [abhaAddress, setAbhaAddress] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [consents, setConsents] = useState<unknown>(null);
  const [lockers, setLockers] = useState<unknown>(null);

  const run = useCallback(
    async (fn: () => Promise<AxiosResponse<PhrApiResponse>>) => {
      setLoading(true);
      setMessage("");
      try {
        const res = await fn();
        const data = res.data;
        if (data.txnId) setTxnId(String(data.txnId));
        if (data.token) setXToken(String(data.token));
        if (data.data) setProfile(data.data as Record<string, unknown>);
        if (data.consents) setConsents(data.consents);
        if (data.lockers) setLockers(data.lockers);
        setMessage(data.message ? String(data.message) : "Success");
        return data;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Request failed";
        setMessage(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return (
    <main style={{ padding: "24px", maxWidth: "960px" }} aria-busy={loading}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
        Personal Health Records (PHR)
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
        ABDM PHR Web V3 — enrollment, ABHA login, profile, consent PIN, and
        HIECM health locker.
      </p>

      <nav
        aria-label="PHR sections"
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border:
                tab === t.id
                  ? "2px solid var(--primary)"
                  : "1px solid var(--border-color)",
              background:
                tab === t.id ? "var(--primary-light, #eef2ff)" : "transparent",
              fontWeight: tab === t.id ? 700 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {message && (
        <p
          role="status"
          style={{
            marginBottom: "12px",
            padding: "10px",
            borderRadius: "6px",
            background: "var(--surface-secondary)",
          }}
        >
          {message}
        </p>
      )}

      {tab === "enroll" && (
        <section aria-labelledby="enroll-heading">
          <h2
            id="enroll-heading"
            style={{ fontSize: "1.1rem", marginBottom: "12px" }}
          >
            PHR Enrollment
          </h2>
          <label
            htmlFor="enroll-mobile"
            style={{ display: "block", marginBottom: "6px" }}
          >
            Mobile number
          </label>
          <input
            id="enroll-mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => run(() => phrService.enrollmentRequestOtp(mobile))}
            >
              Request OTP
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => run(() => phrService.enrollmentVerify(txnId, otp))}
            >
              Verify OTP
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                run(() => phrService.enrollmentSuggestion(txnId, xToken))
              }
            >
              Get address suggestions
            </button>
          </div>
          <label
            htmlFor="enroll-address"
            style={{ display: "block", marginTop: "16px", marginBottom: "6px" }}
          >
            ABHA address to enroll
          </label>
          <input
            id="enroll-address"
            value={abhaAddress}
            onChange={(e) => setAbhaAddress(e.target.value)}
            style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
          />
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              run(() => phrService.enrollmentEnrol(txnId, abhaAddress, xToken))
            }
          >
            Enroll ABHA address
          </button>
        </section>
      )}

      {tab === "login" && (
        <section aria-labelledby="login-heading">
          <h2
            id="login-heading"
            style={{ fontSize: "1.1rem", marginBottom: "12px" }}
          >
            PHR ABHA Login
          </h2>
          <label
            htmlFor="login-address"
            style={{ display: "block", marginBottom: "6px" }}
          >
            ABHA address
          </label>
          <input
            id="login-address"
            value={abhaAddress}
            onChange={(e) => setAbhaAddress(e.target.value)}
            style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => run(() => phrService.loginAbhaSearch(abhaAddress))}
            >
              Search ABHA
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => run(() => phrService.loginAbhaRequestOtp(txnId))}
            >
              Request OTP
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                run(() => phrService.loginAbhaVerify(txnId, otp, abhaAddress))
              }
            >
              Verify &amp; Login
            </button>
          </div>
          <p
            style={{
              marginTop: "12px",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            Session token (X-Token):{" "}
            {xToken ? `${xToken.slice(0, 24)}…` : "Not logged in"}
          </p>
        </section>
      )}

      {tab === "profile" && (
        <section aria-labelledby="profile-heading">
          <h2
            id="profile-heading"
            style={{ fontSize: "1.1rem", marginBottom: "12px" }}
          >
            PHR Profile
          </h2>
          <label
            htmlFor="profile-token"
            style={{ display: "block", marginBottom: "6px" }}
          >
            X-Token (session)
          </label>
          <input
            id="profile-token"
            value={xToken}
            onChange={(e) => setXToken(e.target.value)}
            style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={loading || !xToken}
              onClick={() => run(() => phrService.getProfile(xToken))}
            >
              Fetch profile
            </button>
            <button
              type="button"
              disabled={loading || !xToken}
              onClick={() => run(() => phrService.getPhrCard(xToken))}
            >
              Download PHR card
            </button>
            <button
              type="button"
              disabled={loading || !xToken}
              onClick={() => run(() => phrService.getQrCode(xToken))}
            >
              Get QR code
            </button>
          </div>
          {profile && (
            <pre
              style={{
                marginTop: "16px",
                fontSize: "12px",
                overflow: "auto",
                padding: "12px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
              }}
            >
              {JSON.stringify(profile, null, 2)}
            </pre>
          )}
        </section>
      )}

      {tab === "pin" && (
        <section aria-labelledby="pin-heading">
          <h2
            id="pin-heading"
            style={{ fontSize: "1.1rem", marginBottom: "12px" }}
          >
            Consent PIN
          </h2>
          <label
            htmlFor="pin-token"
            style={{ display: "block", marginBottom: "6px" }}
          >
            X-Token
          </label>
          <input
            id="pin-token"
            value={xToken}
            onChange={(e) => setXToken(e.target.value)}
            style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
          />
          <label
            htmlFor="pin-value"
            style={{ display: "block", marginBottom: "6px" }}
          >
            PIN (4–6 digits)
          </label>
          <input
            id="pin-value"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={loading || !xToken}
              onClick={() => run(() => phrService.createPin(xToken, pin))}
            >
              Create PIN
            </button>
            <button
              type="button"
              disabled={loading || !xToken}
              onClick={() => run(() => phrService.verifyPin(xToken, pin))}
            >
              Verify PIN
            </button>
            <button
              type="button"
              disabled={loading || !xToken}
              onClick={() => run(() => phrService.forgotPinGenerateOtp(xToken))}
            >
              Forgot PIN — OTP
            </button>
            <button
              type="button"
              disabled={loading || !xToken}
              onClick={() =>
                run(() => phrService.forgotPinValidateOtp(xToken, txnId, otp))
              }
            >
              Validate recovery OTP
            </button>
          </div>
        </section>
      )}

      {tab === "locker" && (
        <section aria-labelledby="locker-heading">
          <h2
            id="locker-heading"
            style={{ fontSize: "1.1rem", marginBottom: "12px" }}
          >
            Health Locker &amp; Consent
          </h2>
          <label
            htmlFor="locker-token"
            style={{ display: "block", marginBottom: "6px" }}
          >
            X-Token
          </label>
          <input
            id="locker-token"
            value={xToken}
            onChange={(e) => setXToken(e.target.value)}
            style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={loading || !xToken}
              onClick={() => run(() => phrService.listLockers(xToken))}
            >
              List lockers
            </button>
            <button
              type="button"
              disabled={loading || !xToken}
              onClick={() => run(() => phrService.listConsents(xToken))}
            >
              List consents
            </button>
          </div>
          {(lockers != null || consents != null) && (
            <pre
              style={{
                marginTop: "16px",
                fontSize: "12px",
                overflow: "auto",
                padding: "12px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
              }}
            >
              {JSON.stringify({ lockers, consents }, null, 2)}
            </pre>
          )}
        </section>
      )}
    </main>
  );
}
