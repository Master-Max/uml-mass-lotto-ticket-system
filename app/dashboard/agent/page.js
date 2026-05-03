"use client";

import { useEffect, useState } from "react";

export default function AgentDashboard() {
  const [summaries, setSummaries] = useState([]);
  const [dispensers, setDispensers] = useState([]);

  const [dispenserForm, setDispenserForm] = useState({
    DispenserNumber: "",
    DispenserAssignment: "",
    DispenserLayout: "",
    PositionStatus: "Active",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [summaryRes, dispenserRes] = await Promise.all([
      fetch("/api/summaries"),
      fetch("/api/dispensers"),
    ]);

    if (summaryRes.ok) setSummaries(await summaryRes.json());
    if (dispenserRes.ok) setDispensers(await dispenserRes.json());
  }

  async function createDispenser() {
    const res = await fetch("/api/dispensers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...dispenserForm,
        DispenserNumber: Number(dispenserForm.DispenserNumber),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to create dispenser");
      return;
    }

    setDispenserForm({
      DispenserNumber: "",
      DispenserAssignment: "",
      DispenserLayout: "",
      PositionStatus: "Active",
    });

    loadData();
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Agent Dashboard</h1>

      <section className="border p-4 rounded mb-6">
        <h2 className="font-semibold mb-3">Create Dispenser</h2>

        <input
          className="border p-2 mb-2 w-full"
          placeholder="Dispenser Number"
          value={dispenserForm.DispenserNumber}
          onChange={(e) =>
            setDispenserForm({
              ...dispenserForm,
              DispenserNumber: e.target.value,
            })
          }
        />

        <input
          className="border p-2 mb-2 w-full"
          placeholder="Dispenser Assignment"
          value={dispenserForm.DispenserAssignment}
          onChange={(e) =>
            setDispenserForm({
              ...dispenserForm,
              DispenserAssignment: e.target.value,
            })
          }
        />

        <input
          className="border p-2 mb-2 w-full"
          placeholder="Dispenser Layout"
          value={dispenserForm.DispenserLayout}
          onChange={(e) =>
            setDispenserForm({
              ...dispenserForm,
              DispenserLayout: e.target.value,
            })
          }
        />

        <select
          className="border p-2 mb-2 w-full"
          value={dispenserForm.PositionStatus}
          onChange={(e) =>
            setDispenserForm({
              ...dispenserForm,
              PositionStatus: e.target.value,
            })
          }
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Empty">Empty</option>
        </select>

        <button
          onClick={createDispenser}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          Create Dispenser
        </button>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-3">Dispensers</h2>

        {dispensers.map((d) => (
          <div key={d.DispenserID} className="border p-3 mb-2 rounded">
            <p>Dispenser #{d.DispenserNumber}</p>
            <p>Assignment: {d.DispenserAssignment || "N/A"}</p>
            <p>Layout: {d.DispenserLayout || "N/A"}</p>
            <p>Status: {d.PositionStatus}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-semibold mb-3">Daily Summaries</h2>

        {summaries.map((s) => (
          <div key={s.SummaryID} className="border p-3 mb-2 rounded">
            <p>Date: {new Date(s.SummaryDate).toLocaleDateString()}</p>
            <p>Tickets Sold: {s.TotalTicketsSold}</p>
            <p>Sales: ${Number(s.TotalOTCSales).toFixed(2)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}