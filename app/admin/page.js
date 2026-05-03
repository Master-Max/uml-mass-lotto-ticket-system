"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [commissions, setCommissions] = useState([]);
  const [agents, setAgents] = useState([]);

  const [commissionForm, setCommissionForm] = useState({
    CommissionName: "",
    ReportingRegion: "",
  });

  const [agentForm, setAgentForm] = useState({
    AgentName: "",
    Location: "",
  });

  const [editingCommissionID, setEditingCommissionID] = useState(null);
  const [editingAgentID, setEditingAgentID] = useState(null);

  const [summaryForm, setSummaryForm] = useState({
    SummaryDate: new Date().toISOString().split("T")[0],
    TotalTicketsSold: "",
    TotalOTCSales: "",
    SalesDollarsByDispenser: "",
    DailyControlSummary: "",
    AgentID: "",
    CommissionID: "",
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    const [commissionRes, agentRes] = await Promise.all([
      fetch("/api/admin/commissions"),
      fetch("/api/admin/agents"),
    ]);

    if (commissionRes.ok) {
      setCommissions(await commissionRes.json());
    }

    if (agentRes.ok) {
      setAgents(await agentRes.json());
    }
  }

  async function saveCommission() {
    const method = editingCommissionID ? "PUT" : "POST";

    const res = await fetch("/api/admin/commissions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        CommissionID: editingCommissionID,
        ...commissionForm,
      }),
    });

    if (!res.ok) {
      alert("Failed to save commission");
      console.error(await res.text());
      return;
    }

    setCommissionForm({ CommissionName: "", ReportingRegion: "" });
    setEditingCommissionID(null);
    loadAdminData();
  }

  async function deleteCommission(CommissionID) {
    const res = await fetch("/api/admin/commissions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ CommissionID }),
    });

    if (!res.ok) {
      alert("Failed to delete commission. It may be used by games or summaries.");
      console.error(await res.text());
      return;
    }

    loadAdminData();
  }

  function editCommission(c) {
    setEditingCommissionID(c.CommissionID);
    setCommissionForm({
      CommissionName: c.CommissionName,
      ReportingRegion: c.ReportingRegion || "",
    });
  }

  async function saveAgent() {
    const method = editingAgentID ? "PUT" : "POST";

    const res = await fetch("/api/admin/agents", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        AgentID: editingAgentID,
        ...agentForm,
      }),
    });

    if (!res.ok) {
      alert("Failed to save agent");
      console.error(await res.text());
      return;
    }

    setAgentForm({ AgentName: "", Location: "" });
    setEditingAgentID(null);
    loadAdminData();
  }

  async function deleteAgent(AgentID) {
    const res = await fetch("/api/admin/agents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ AgentID }),
    });

    if (!res.ok) {
      alert("Failed to delete agent. It may be used by summaries or ticket records.");
      console.error(await res.text());
      return;
    }

    loadAdminData();
  }

  function editAgent(a) {
    setEditingAgentID(a.AgentID);
    setAgentForm({
      AgentName: a.AgentName,
      Location: a.Location || "",
    });
  }

  async function runDailySummary() {
    const res = await fetch("/api/admin/run-daily-summary", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to run summary");
      return;
    }

    alert("Daily sales summary created!");
  }

  async function createDailySummary() {
    const res = await fetch("/api/admin/daily-summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...summaryForm,
        TotalTicketsSold: Number(summaryForm.TotalTicketsSold),
        TotalOTCSales: Number(summaryForm.TotalOTCSales),
        SalesDollarsByDispenser: Number(summaryForm.SalesDollarsByDispenser),
        AgentID: Number(summaryForm.AgentID),
        CommissionID: Number(summaryForm.CommissionID),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to create daily summary");
      return;
    }

    alert("Daily summary created!");

    setSummaryForm({
      SummaryDate: new Date().toISOString().split("T")[0],
      TotalTicketsSold: "",
      TotalOTCSales: "",
      SalesDollarsByDispenser: "",
      DailyControlSummary: "",
      AgentID: "",
      CommissionID: "",
    });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <button
        onClick={runDailySummary}
        className="bg-purple-600 text-white px-4 py-2 rounded mb-8"
      >
        Run Daily Sales Summary
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Commissions</h2>

          <input
            className="border p-2 mb-2 w-full"
            placeholder="Commission Name"
            value={commissionForm.CommissionName}
            onChange={(e) =>
              setCommissionForm({
                ...commissionForm,
                CommissionName: e.target.value,
              })
            }
          />

          <input
            className="border p-2 mb-2 w-full"
            placeholder="Reporting Region"
            value={commissionForm.ReportingRegion}
            onChange={(e) =>
              setCommissionForm({
                ...commissionForm,
                ReportingRegion: e.target.value,
              })
            }
          />

          <button
            onClick={saveCommission}
            className="bg-blue-600 text-white px-3 py-2 rounded mr-2"
          >
            {editingCommissionID ? "Update Commission" : "Create Commission"}
          </button>

          {editingCommissionID && (
            <button
              onClick={() => {
                setEditingCommissionID(null);
                setCommissionForm({ CommissionName: "", ReportingRegion: "" });
              }}
              className="bg-gray-500 text-white px-3 py-2 rounded"
            >
              Cancel
            </button>
          )}

          <div className="mt-4">
            {commissions.map((c) => (
              <div key={c.CommissionID} className="border p-3 mb-2 rounded">
                <p className="font-semibold">{c.CommissionName}</p>
                <p>{c.ReportingRegion}</p>

                <button
                  onClick={() => editCommission(c)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 mt-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteCommission(c.CommissionID)}
                  className="bg-red-600 text-white px-2 py-1 rounded mt-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Lotto Agents</h2>

          <input
            className="border p-2 mb-2 w-full"
            placeholder="Agent Name"
            value={agentForm.AgentName}
            onChange={(e) =>
              setAgentForm({ ...agentForm, AgentName: e.target.value })
            }
          />

          <input
            className="border p-2 mb-2 w-full"
            placeholder="Location"
            value={agentForm.Location}
            onChange={(e) =>
              setAgentForm({ ...agentForm, Location: e.target.value })
            }
          />

          <button
            onClick={saveAgent}
            className="bg-blue-600 text-white px-3 py-2 rounded mr-2"
          >
            {editingAgentID ? "Update Agent" : "Create Agent"}
          </button>

          {editingAgentID && (
            <button
              onClick={() => {
                setEditingAgentID(null);
                setAgentForm({ AgentName: "", Location: "" });
              }}
              className="bg-gray-500 text-white px-3 py-2 rounded"
            >
              Cancel
            </button>
          )}

          <div className="mt-4">
            {agents.map((a) => (
              <div key={a.AgentID} className="border p-3 mb-2 rounded">
                <p className="font-semibold">{a.AgentName}</p>
                <p>{a.Location}</p>

                <button
                  onClick={() => editAgent(a)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 mt-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteAgent(a.AgentID)}
                  className="bg-red-600 text-white px-2 py-1 rounded mt-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        
      <section className="mt-8 border p-4 rounded">
        <h2 className="text-xl font-semibold mb-3">Create Daily Sales Summary</h2>

        <input
          className="border p-2 mb-2 w-full"
          type="date"
          value={summaryForm.SummaryDate}
          onChange={(e) =>
            setSummaryForm({ ...summaryForm, SummaryDate: e.target.value })
          }
        />

        <select
          className="border p-2 mb-2 w-full"
          value={summaryForm.AgentID}
          onChange={(e) =>
            setSummaryForm({ ...summaryForm, AgentID: e.target.value })
          }
        >
          <option value="">Select Agent</option>
          {agents.map((agent) => (
            <option key={agent.AgentID} value={agent.AgentID}>
              {agent.AgentName}
            </option>
          ))}
        </select>

        <select
          className="border p-2 mb-2 w-full"
          value={summaryForm.CommissionID}
          onChange={(e) =>
            setSummaryForm({ ...summaryForm, CommissionID: e.target.value })
          }
        >
          <option value="">Select Commission</option>
          {commissions.map((commission) => (
            <option key={commission.CommissionID} value={commission.CommissionID}>
              {commission.CommissionName}
            </option>
          ))}
        </select>

        <input
          className="border p-2 mb-2 w-full"
          placeholder="Total Tickets Sold"
          value={summaryForm.TotalTicketsSold}
          onChange={(e) =>
            setSummaryForm({ ...summaryForm, TotalTicketsSold: e.target.value })
          }
        />

        <input
          className="border p-2 mb-2 w-full"
          placeholder="Total OTC Sales"
          value={summaryForm.TotalOTCSales}
          onChange={(e) =>
            setSummaryForm({ ...summaryForm, TotalOTCSales: e.target.value })
          }
        />

        <input
          className="border p-2 mb-2 w-full"
          placeholder="Sales Dollars By Dispenser"
          value={summaryForm.SalesDollarsByDispenser}
          onChange={(e) =>
            setSummaryForm({
              ...summaryForm,
              SalesDollarsByDispenser: e.target.value,
            })
          }
        />

        <textarea
          className="border p-2 mb-2 w-full"
          placeholder="Daily Control Summary"
          value={summaryForm.DailyControlSummary}
          onChange={(e) =>
            setSummaryForm({ ...summaryForm, DailyControlSummary: e.target.value })
          }
        />

        <button
          onClick={createDailySummary}
          className="bg-green-600 text-white px-3 py-2 rounded"
        >
          Create Daily Summary
        </button>
      </section>
      </div>
    </div>
  );
}