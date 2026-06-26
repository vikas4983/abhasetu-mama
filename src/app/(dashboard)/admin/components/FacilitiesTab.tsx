/**
 * @file        FacilitiesTab.tsx
 * @description Approve / reject stakeholder facility registrations
 * @module      admin/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { showToast } from "../../../../utils/toast";
import * as api from "../admin.api";

interface Facility {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Props {
  token: string;
}

export default function FacilitiesTab({ token }: Props) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filter, setFilter] = useState("pending");

  const load = () => {
    api.fetchFacilities(token, { status: filter }).then((d) => {
      if (d.facilities) setFacilities(d.facilities);
    });
  };

  useEffect(() => {
    load();
  }, [token, filter]);

  const setStatus = async (id: number, status: string) => {
    const res = await api.updateFacilityStatus(token, id, status);
    showToast(res.message || "Updated", res.status !== "success");
    load();
  };

  return (
    <div>
      <h2
        style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "12px" }}
      >
        Stakeholder facilities
      </h2>
      <label
        style={{ fontSize: "12px", marginBottom: "12px", display: "block" }}
      >
        Status filter
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ marginLeft: "8px", padding: "6px" }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>
      <table
        style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}
      >
        <caption className="sr-only">Registered facilities</caption>
        <thead>
          <tr
            style={{
              borderBottom: "2px solid var(--border-color)",
              textAlign: "left",
            }}
          >
            <th scope="col" style={{ padding: "8px" }}>
              Name
            </th>
            <th scope="col" style={{ padding: "8px" }}>
              Email
            </th>
            <th scope="col" style={{ padding: "8px" }}>
              Role
            </th>
            <th scope="col" style={{ padding: "8px" }}>
              Status
            </th>
            <th scope="col" style={{ padding: "8px" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {facilities.map((f) => (
            <tr
              key={f.id}
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <td style={{ padding: "8px" }}>{f.name}</td>
              <td style={{ padding: "8px" }}>{f.email}</td>
              <td style={{ padding: "8px" }}>{f.role}</td>
              <td style={{ padding: "8px" }}>{f.status}</td>
              <td style={{ padding: "8px" }}>
                {f.status === "pending" && (
                  <>
                    <button
                      type="button"
                      aria-label={`Approve ${f.name}`}
                      onClick={() => setStatus(f.id, "approved")}
                      style={iconBtn}
                    >
                      <Check size={16} color="#22c55e" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Reject ${f.name}`}
                      onClick={() => setStatus(f.id, "rejected")}
                      style={iconBtn}
                    >
                      <X size={16} color="#ef4444" />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  border: "none",
  background: "none",
  cursor: "pointer",
  marginRight: "8px",
};
