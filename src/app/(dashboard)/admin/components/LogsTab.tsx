/**
 * @file        LogsTab.tsx
 * @description PHI-safe audit log viewer for administrators
 * @module      admin/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React, { useEffect, useState } from "react";
import * as api from "../admin.api";

interface LogEntry {
  id: string;
  timestamp: string;
  event: string;
  status: string;
}

interface Props {
  token: string;
}

export default function LogsTab({ token }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    api.fetchLogs(token).then((d) => setLogs(d.logs || []));
  }, [token]);

  return (
    <div>
      <h2
        style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "12px" }}
      >
        Audit logs
      </h2>
      <p
        style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          marginBottom: "12px",
        }}
      >
        Last 100 events. PHI fields are masked per OWASP logging guidelines.
      </p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          maxHeight: "480px",
          overflow: "auto",
        }}
      >
        {logs.map((log) => (
          <li
            key={log.id}
            style={{
              padding: "10px",
              borderBottom: "1px solid var(--border-color)",
              fontSize: "12px",
            }}
          >
            <time dateTime={log.timestamp}>
              {new Date(log.timestamp).toLocaleString("en-IN")}
            </time>
            <strong style={{ marginLeft: "8px" }}>{log.event}</strong>
            <span
              style={{
                marginLeft: "8px",
                color: log.status === "SUCCESS" ? "#22c55e" : "#f59e0b",
              }}
            >
              {log.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
