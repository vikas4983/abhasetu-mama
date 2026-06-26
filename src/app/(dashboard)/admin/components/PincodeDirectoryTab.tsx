/**
 * @file        PincodeDirectoryTab.tsx
 * @description CRUD + CSV import for India Post pincode directory
 * @module      admin/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Download, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { showToast } from "../../../../utils/toast";
import * as api from "../admin.api";

interface Row {
  id: number;
  office_name: string;
  pincode: string;
  district: string | null;
  state_name: string;
  delivery: string | null;
}

interface Props {
  token: string;
}

export default function PincodeDirectoryTab({ token }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    office_name: "",
    pincode: "",
    district: "",
    state_name: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchPincodeDirectory(token, {
        page,
        limit: 25,
        search,
        state: stateFilter,
      });
      if (data.status === "success") {
        setRows(data.rows || []);
        setTotal(data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [token, page, search, stateFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleImport = async () => {
    if (
      !confirm(
        "Import ~165k rows from pincode_directory.csv? This may take a few minutes.",
      )
    )
      return;
    setImporting(true);
    try {
      const data = await api.importPincodeCsv(token);
      showToast(data.message || "Import finished", data.status !== "success");
      if (data.status === "success") load();
    } finally {
      setImporting(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createPincodeRow(token, form);
    if (res.status === "success") {
      showToast("Post office added");
      setShowAdd(false);
      setForm({ office_name: "", pincode: "", district: "", state_name: "" });
      load();
    } else {
      showToast(res.message || "Failed", true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this post office record?")) return;
    await api.deletePincodeRow(token, id);
    load();
  };

  const totalPages = Math.max(1, Math.ceil(total / 25));

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <h2
          style={{ flex: 1, fontSize: "1.25rem", fontWeight: 800, margin: 0 }}
        >
          Pincode directory
        </h2>
        <button
          type="button"
          onClick={handleImport}
          disabled={importing}
          style={btnStyle}
        >
          <Download size={16} aria-hidden />{" "}
          {importing ? "Importing…" : "Import CSV"}
        </button>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          style={btnStyle}
        >
          <Plus size={16} aria-hidden /> Add
        </button>
        <button
          type="button"
          onClick={load}
          style={btnStyle}
          aria-label="Refresh list"
        >
          <RefreshCw size={16} aria-hidden />
        </button>
      </div>

      <p
        style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          marginBottom: "12px",
        }}
      >
        Source: <code>pincode_directory.csv</code> at project root. Total
        records: {total.toLocaleString("en-IN")}
      </p>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <label style={{ flex: 1, minWidth: "200px" }}>
          <span className="sr-only">Search office or pincode</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          >
            <Search size={16} aria-hidden />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search office / pincode"
              style={{
                border: "none",
                background: "transparent",
                flex: 1,
                outline: "none",
                color: "inherit",
              }}
            />
          </div>
        </label>
        <input
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value);
            setPage(1);
          }}
          placeholder="Filter state"
          aria-label="Filter by state"
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
          }}
        />
      </div>

      {showAdd && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleAdd}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "8px",
            marginBottom: "16px",
            padding: "12px",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
          }}
        >
          {(["office_name", "pincode", "district", "state_name"] as const).map(
            (f) => (
              <label key={f}>
                <span style={{ fontSize: "11px", fontWeight: 600 }}>
                  {f.replace("_", " ")}
                </span>
                <input
                  required={
                    f === "office_name" || f === "pincode" || f === "state_name"
                  }
                  value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  style={inputStyle}
                />
              </label>
            ),
          )}
          <button
            type="submit"
            style={{
              ...btnStyle,
              background: "var(--accent-teal)",
              color: "#fff",
              alignSelf: "end",
            }}
          >
            Save
          </button>
        </motion.form>
      )}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <caption className="sr-only">Pincode directory post offices</caption>
          <thead>
            <tr
              style={{
                textAlign: "left",
                borderBottom: "2px solid var(--border-color)",
              }}
            >
              <th scope="col" style={thStyle}>
                Pincode
              </th>
              <th scope="col" style={thStyle}>
                Office
              </th>
              <th scope="col" style={thStyle}>
                District
              </th>
              <th scope="col" style={thStyle}>
                State
              </th>
              <th scope="col" style={thStyle}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Loading…</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <td style={tdStyle}>{r.pincode}</td>
                  <td style={tdStyle}>{r.office_name}</td>
                  <td style={tdStyle}>{r.district || "—"}</td>
                  <td style={tdStyle}>{r.state_name}</td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      aria-label={`Delete ${r.office_name}`}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#ef4444",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <nav
        aria-label="Pagination"
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "12px",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          style={btnStyle}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          style={btnStyle}
        >
          Next
        </button>
      </nav>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid var(--border-color)",
  background: "var(--bg-secondary)",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid var(--border-color)",
  marginTop: "4px",
};
const thStyle: React.CSSProperties = { padding: "8px" };
const tdStyle: React.CSSProperties = { padding: "8px" };
