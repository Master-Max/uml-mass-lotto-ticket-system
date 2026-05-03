"use client";

import { useEffect, useState } from "react";

export default function TicketEntry() {
  const [dispensers, setDispensers] = useState([]);

  const [form, setForm] = useState({
    DispenserID: "",
    StartTicketNumber: "",
    EndingTicketNumber: "",
  });

  useEffect(() => {
    async function loadDispensers() {
      const res = await fetch("/api/dispensers");

      if (!res.ok) {
        console.error(await res.text());
        return;
      }

      setDispensers(await res.json());
    }

    loadDispensers();
  }, []);

  async function submit() {
    if (!form.DispenserID || !form.StartTicketNumber || !form.EndingTicketNumber) {
      alert("Please fill out all fields");
      return;
    }

    const ticketsSold =
      Number(form.EndingTicketNumber) - Number(form.StartTicketNumber);

    const res = await fetch("/api/ticket-counts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        DispenserID: Number(form.DispenserID),
        StartTicketNumber: Number(form.StartTicketNumber),
        EndingTicketNumber: Number(form.EndingTicketNumber),
        TicketsSold: ticketsSold,
        AgentID: 1,
        SummaryID: 1,
        RecordDate: new Date(),
        SoldOutStatus: "NO",
      }),
    });

    if (!res.ok) {
      console.error(await res.text());
      alert("Failed to submit");
      return;
    }

    alert("Submitted!");

    setForm({
      DispenserID: "",
      StartTicketNumber: "",
      EndingTicketNumber: "",
    });
  }

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-bold mb-4">Daily Ticket Entry</h1>

      <select
        className="border p-2 mb-2 w-full"
        value={form.DispenserID}
        onChange={(e) => setForm({ ...form, DispenserID: e.target.value })}
      >
        <option value="">Select Dispenser</option>

        {dispensers.map((d) => (
          <option key={d.DispenserID} value={d.DispenserID}>
            Dispenser #{d.DispenserNumber} — {d.PositionStatus}
          </option>
        ))}
      </select>

      <input
        className="border p-2 mb-2 w-full"
        placeholder="Start #"
        value={form.StartTicketNumber}
        onChange={(e) =>
          setForm({ ...form, StartTicketNumber: e.target.value })
        }
      />

      <input
        className="border p-2 mb-2 w-full"
        placeholder="End #"
        value={form.EndingTicketNumber}
        onChange={(e) =>
          setForm({ ...form, EndingTicketNumber: e.target.value })
        }
      />

      <button
        onClick={submit}
        className="bg-green-600 text-white px-3 py-2 mt-3 w-full"
      >
        Submit
      </button>
    </div>
  );
}