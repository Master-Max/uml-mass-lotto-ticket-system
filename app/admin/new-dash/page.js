"use client";

import { useEffect, useMemo, useState } from "react";

const ADMIN_TABLES = [
  {
    key: "commissions",
    label: "Commissions",
    endpoint: "/api/admin/commissions",
    idFields: ["CommissionID"],
    fields: [
      { name: "CommissionName", label: "Commission Name", type: "text", required: true },
      { name: "ReportingRegion", label: "Reporting Region", type: "text" },
    ],
  },
  {
    key: "agents",
    label: "Lotto Agents",
    endpoint: "/api/admin/agents",
    idFields: ["AgentID"],
    fields: [
      { name: "AgentName", label: "Agent Name", type: "text", required: true },
      { name: "Location", label: "Location", type: "text" },
    ],
  },
  {
    key: "games",
    label: "Games",
    endpoint: "/api/admin/games",
    idFields: ["GameID"],
    fields: [
      { name: "GameNumber", label: "Game Number", type: "number", required: true },
      { name: "GameName", label: "Game Name", type: "text", required: true },
      { name: "TicketValue", label: "Ticket Value", type: "number", required: true },
      { name: "PackNumber", label: "Pack Number", type: "number", required: true },
      { name: "ActiveGameStatus", label: "Active Game Status", type: "text" },
      { name: "CommissionID", label: "Commission ID", type: "number", required: true },
    ],
  },
  {
    key: "dispensers",
    label: "Dispensers",
    endpoint: "/api/admin/dispensers",
    idFields: ["DispenserID"],
    fields: [
      { name: "DispenserNumber", label: "Dispenser Number", type: "number", required: true },
      { name: "DispenserAssignment", label: "Dispenser Assignment", type: "text" },
      { name: "DispenserLayout", label: "Dispenser Layout", type: "text" },
      { name: "PositionStatus", label: "Position Status", type: "text", required: true },
    ],
  },
  {
    key: "dailySalesSummaries",
    label: "Daily Sales Summaries",
    endpoint: "/api/admin/daily-summaries",
    idFields: ["SummaryID"],
    fields: [
      { name: "SummaryDate", label: "Summary Date", type: "date", required: true },
      { name: "SalesDollarsByDispenser", label: "Sales Dollars By Dispenser", type: "decimal" },
      { name: "TotalTicketsSold", label: "Total Tickets Sold", type: "number", required: true },
      { name: "TotalOTCSales", label: "Total OTC Sales", type: "decimal", required: true },
      { name: "DailyControlSummary", label: "Daily Control Summary", type: "textarea" },
      { name: "CommissionID", label: "Commission ID", type: "number", required: true },
      { name: "AgentID", label: "Agent ID", type: "number", required: true },
    ],
  },
  {
    key: "dailyTicketCountRecords",
    label: "Daily Ticket Count Records",
    endpoint: "/api/admin/daily-ticket-count-records",
    idFields: ["RecordID"],
    fields: [
      { name: "RecordDate", label: "Record Date", type: "date", required: true },
      { name: "StartTicketNumber", label: "Start Ticket Number", type: "number", required: true },
      { name: "EndingTicketNumber", label: "Ending Ticket Number", type: "number", required: true },
      { name: "SoldOutStatus", label: "Sold Out Status", type: "text", required: true },
      { name: "TicketsSold", label: "Tickets Sold", type: "number", required: true },
      { name: "SummaryID", label: "Summary ID", type: "number", required: false },
      { name: "DispenserID", label: "Dispenser ID", type: "number", required: true },
      { name: "GameID", label: "Game ID", type: "number", required: true },
      { name: "AgentID", label: "Agent ID", type: "number", required: true },
    ],
  },
  {
    key: "assignedTo",
    label: "Assigned Games To Dispensers",
    endpoint: "/api/admin/assigned-to",
    idFields: ["GameID", "DispenserID"],
    fields: [
      { name: "GameID", label: "Game ID", type: "number", required: true },
      { name: "DispenserID", label: "Dispenser ID", type: "number", required: true },
      // { name: "stuff", label: "stuff", type: "text", required: false },
    ],
  },
];

function emptyForm(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.type === "date" ? new Date().toISOString().split("T")[0] : "";
    return acc;
  }, {});
}

function normalizeValue(value, type) {
  if (value === "") return null;

  if (type === "number") return Number(value);
  if (type === "decimal") return Number(value);
  if (type === "date") return new Date(value).toISOString();

  return value;
}

function formatValue(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string" && value.includes("T") && !Number.isNaN(Date.parse(value))) {
    return value.split("T")[0];
  }

  return String(value);
}

function CrudSection({ table }) {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(() => emptyForm(table.fields));
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(editingRecord);

  // const displayFields = useMemo(() => {
  //   return [...table.idFields, ...table.fields.map((field) => field.name)];
  // }, [table]);

  const displayFields = useMemo(() => {
    return [
      ...new Set([
        ...table.idFields,
        ...table.fields.map((field) => field.name),
      ]),
    ];
  }, [table]);
  
  async function loadRecords() {
    setLoading(true);

    const res = await fetch(table.endpoint);

    if (!res.ok) {
      console.error(await res.text());
      alert(`Failed to load ${table.label}`);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setRecords(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function updateForm(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm(table.fields));
    setEditingRecord(null);
  }

  function startEdit(record) {
    setEditingRecord(record);

    const nextForm = {};

    table.fields.forEach((field) => {
      const value = record[field.name];

      if (field.type === "date" && value) {
        nextForm[field.name] = String(value).split("T")[0];
      } else {
        nextForm[field.name] = value ?? "";
      }
    });

    setForm(nextForm);
  }

  function buildPayload() {
    const payload = {};

    if (editingRecord) {
      table.idFields.forEach((idField) => {
        payload[idField] = editingRecord[idField];
      });
    }

    table.fields.forEach((field) => {
      payload[field.name] = normalizeValue(form[field.name], field.type);
    });

    return payload;
  }

  async function saveRecord() {
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(table.endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error || `Failed to save ${table.label}`);
      return;
    }

    resetForm();
    loadRecords();
  }

  async function deleteRecord(record) {
    const confirmed = window.confirm(`Delete this ${table.label} record?`);

    if (!confirmed) return;

    const payload = {};

    table.idFields.forEach((idField) => {
      payload[idField] = record[idField];
    });

    const res = await fetch(table.endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error || `Failed to delete ${table.label}. It may be used by related records.`);
      return;
    }

    loadRecords();
  }

  return (
    <section className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{table.label}</h2>

        <button
          onClick={loadRecords}
          className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {table.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required && <span className="text-red-600"> *</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                className="border p-2 w-full rounded"
                value={form[field.name] ?? ""}
                onChange={(e) => updateForm(field.name, e.target.value)}
              />
            ) : (
              <input
                className="border p-2 w-full rounded"
                type={field.type === "decimal" ? "number" : field.type}
                step={field.type === "decimal" ? "0.01" : undefined}
                value={form[field.name] ?? ""}
                onChange={(e) => updateForm(field.name, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mb-5">
        <button
          onClick={saveRecord}
          className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
        >
          {isEditing ? `Update ${table.label}` : `Create ${table.label}`}
        </button>

        {isEditing && (
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-gray-500">No records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                {displayFields.map((field, keyIndex) => (
                  <th key={`head-${keyIndex}-${field}`} className="border p-2 text-left whitespace-nowrap">
                    {field}
                  </th>
                ))}
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={table.idFields.map((id) => record[id]).join("-") || index}>
                  {displayFields.map((field, index) => (
                    <td key={`body-${index}-${field}`} className="border p-2 whitespace-nowrap">
                    {/* <td key={field} className="border p-2 whitespace-nowrap"> */}
                      {formatValue(record[field])}
                    </td>
                  ))}

                  <td className="border p-2 whitespace-nowrap">
                    <button
                      onClick={() => startEdit(record)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteRecord(record)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  async function runDailySummary() {
    const res = await fetch("/api/admin/run-daily-summary", {
      method: "POST",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error || "Failed to run daily summary");
      return;
    }

    alert("Daily sales summary created!");
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage all database tables from one page.
          </p>
        </div>

        <button
          onClick={runDailySummary}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Run Daily Sales Summary
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {ADMIN_TABLES.map((table) => (
          <CrudSection key={table.key} table={table} />
        ))}
      </div>
    </main>
  );
}