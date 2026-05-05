"use client";

import { useEffect, useState } from "react";

const COMMISSION_ID = 1;

function optionalNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

export default function CommissionDashboard() {
  const [agents, setAgents] = useState([]);
  const [games, setGames] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [ticketRecords, setTicketRecords] = useState([]);
  const [selectedSummaryDate, setSelectedSummaryDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const filteredSummaries = summaries.filter((summary) => {
    const summaryDate = new Date(summary.SummaryDate).toLocaleDateString("en-CA", {
      timeZone: "America/New_York",
    });

    return summaryDate === selectedSummaryDate;
  });

  const filteredTicketRecords = ticketRecords.filter((record) => {
    const recordDate = new Date(record.RecordDate).toLocaleDateString("en-CA", {
      timeZone: "America/New_York",
    });

    return recordDate === selectedSummaryDate;
  });

  const ticketRecordsByAgent = filteredTicketRecords.reduce((groups, record) => {
    const agentId = record.AgentID || "unknown";

    if (!groups[agentId]) {
      groups[agentId] = [];
    }

    groups[agentId].push(record);

    return groups;
  }, {});

  const [agentForm, setAgentForm] = useState({
    AgentName: "",
    Location: "",
  });

  const [gameForm, setGameForm] = useState({
    GameNumber: "",
    GameName: "",
    TicketValue: "",
    PackNumber: "",
    ActiveGameStatus: "Active",
  });

  const [editingGameID, setEditingGameID] = useState(null);

  async function loadDashboardData() {
    const [agentsRes, gamesRes, summariesRes, recordsRes] = await Promise.all([
      fetch("/api/admin/agents"),
      fetch("/api/admin/games"),
      fetch("/api/admin/daily-summaries"),
      fetch("/api/admin/daily-ticket-count-records"),
    ]);

    if (agentsRes.ok) {
      const data = await agentsRes.json();
      setAgents(data.filter((agent) => agent.CommissionID === COMMISSION_ID));
    }

    if (gamesRes.ok) {
      const data = await gamesRes.json();
      setGames(data.filter((game) => game.CommissionID === COMMISSION_ID));
    }

    if (summariesRes.ok) {
      const data = await summariesRes.json();
      setSummaries(
        data.filter((summary) => summary.CommissionID === COMMISSION_ID)
      );
    }

    if (recordsRes.ok) {
      const data = await recordsRes.json();
      setTicketRecords(
        data.filter((record) => record.agent?.CommissionID === COMMISSION_ID)
      );
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function createAgent() {
    const res = await fetch("/api/admin/agents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        AgentName: agentForm.AgentName,
        Location: agentForm.Location || null,
        CommissionID: COMMISSION_ID,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error || "Failed to create agent");
      return;
    }

    setAgentForm({
      AgentName: "",
      Location: "",
    });

    loadDashboardData();
  }

  // async function runDailyReportForAgent(agent) {
  //   const res = await fetch("/api/admin/run-daily-summary", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       AgentID: agent.AgentID,
  //       CommissionID: COMMISSION_ID,
  //     }),
  //   });

  //   const data = await res.json().catch(() => null);

  //   if (!res.ok) {
  //     alert(data?.error || "Failed to run daily report");
  //     return;
  //   }

  //   alert(`Daily report created for ${agent.AgentName}`);
  //   loadDashboardData();
  // }

  async function runDailyReportForAgent(agent, summaryDate = selectedSummaryDate) {
  const res = await fetch("/api/admin/daily-summaries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      AgentID: agent.AgentID,
      CommissionID: COMMISSION_ID,
      SummaryDate: summaryDate,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    alert(
      data?.error ||
        `Failed to create summary for ${agent.AgentName} on ${summaryDate}`
    );
    return;
  }

  alert(`Summary created for ${agent.AgentName} on ${summaryDate}`);
  await loadDashboardData();
}

  async function createGame() {
    const res = await fetch("/api/admin/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        GameNumber: Number(gameForm.GameNumber),
        GameName: gameForm.GameName,
        TicketValue: Number(gameForm.TicketValue),
        PackNumber: Number(gameForm.PackNumber),
        ActiveGameStatus: gameForm.ActiveGameStatus || null,
        CommissionID: COMMISSION_ID,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error || "Failed to create game");
      return;
    }

    setGameForm({
      GameNumber: "",
      GameName: "",
      TicketValue: "",
      PackNumber: "",
      ActiveGameStatus: "Active",
    });

    loadDashboardData();
  }

  function startEditGame(game) {
    setEditingGameID(game.GameID);

    setGameForm({
      GameNumber: game.GameNumber ?? "",
      GameName: game.GameName ?? "",
      TicketValue: game.TicketValue ?? "",
      PackNumber: game.PackNumber ?? "",
      ActiveGameStatus: game.ActiveGameStatus || "Active",
    });
  }

  function resetGameForm() {
    setEditingGameID(null);

    setGameForm({
      GameNumber: "",
      GameName: "",
      TicketValue: "",
      PackNumber: "",
      ActiveGameStatus: "Active",
    });
  }

  async function saveGame() {
    const method = editingGameID ? "PUT" : "POST";

    const res = await fetch("/api/admin/games", {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(editingGameID ? { GameID: editingGameID } : {}),
        GameNumber: Number(gameForm.GameNumber),
        GameName: gameForm.GameName,
        TicketValue: Number(gameForm.TicketValue),
        PackNumber: Number(gameForm.PackNumber),
        ActiveGameStatus: gameForm.ActiveGameStatus || null,
        CommissionID: COMMISSION_ID,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error || "Failed to save game");
      return;
    }

    resetGameForm();
    loadDashboardData();
  }

  async function deleteGame(game) {
    const confirmed = window.confirm(
      `Delete ${game.GameNumber} - ${game.GameName}?`
    );

    if (!confirmed) return;

    const res = await fetch("/api/admin/games", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        GameID: game.GameID,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(
        data?.error ||
          "Failed to delete game. It may be linked to dispensers or ticket records."
      );
      return;
    }

    loadDashboardData();
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Commission Dashboard</h1>
        <p className="text-gray-600">
          View commission data, create agents, and run daily reports.
        </p>
      </div>

      <section className="border rounded-lg p-4 bg-white shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Agent</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Agent Name
            </label>
            <input
              className="border p-2 w-full rounded"
              value={agentForm.AgentName}
              onChange={(e) =>
                setAgentForm({
                  ...agentForm,
                  AgentName: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Location
            </label>
            <input
              className="border p-2 w-full rounded"
              value={agentForm.Location}
              onChange={(e) =>
                setAgentForm({
                  ...agentForm,
                  Location: e.target.value,
                })
              }
            />
          </div>
        </div>

        <button
          onClick={createAgent}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Agent
        </button>
      </section>

      <section className="border rounded-lg p-4 bg-white shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Agents</h2>

        {agents.length === 0 ? (
          <p className="text-gray-500">No agents found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map((agent) => (
              <div
                key={agent.AgentID}
                className="border rounded p-3 bg-gray-50"
              >
                <p className="font-semibold">{agent.AgentName}</p>
                <p className="text-sm text-gray-600">
                  Location: {agent.Location || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Agent ID: {agent.AgentID}
                </p>

                {/* <button
                  onClick={() => runDailyReportForAgent(agent)}
                  className="mt-3 bg-purple-600 text-white px-3 py-2 rounded text-sm"
                >
                  Run Daily Report
                </button> */}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border rounded-lg p-4 bg-white shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold">Run Daily Summaries</h2>
            <p className="text-sm text-gray-500">
              Generate summaries for the selected date.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="border px-3 py-2 rounded"
              onClick={() => {
                const date = new Date(`${selectedSummaryDate}T12:00:00`);
                date.setDate(date.getDate() - 1);
                setSelectedSummaryDate(date.toISOString().split("T")[0]);
              }}
            >
              Previous Day
            </button>

            <input
              type="date"
              className="border p-2 rounded"
              value={selectedSummaryDate}
              onChange={(e) => setSelectedSummaryDate(e.target.value)}
            />

            <button
              className="border px-3 py-2 rounded"
              onClick={() => {
                const date = new Date(`${selectedSummaryDate}T12:00:00`);
                date.setDate(date.getDate() + 1);
                setSelectedSummaryDate(date.toISOString().split("T")[0]);
              }}
            >
              Next Day
            </button>
          </div>
        </div>

        {agents.length === 0 ? (
          <p className="text-gray-500">No agents found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map((agent) => (
              <div key={agent.AgentID} className="border rounded p-3 bg-gray-50">
                <p className="font-semibold">{agent.AgentName}</p>
                <p className="text-sm text-gray-600">
                  Agent ID: {agent.AgentID}
                </p>

                <button
                   onClick={() => runDailyReportForAgent(agent, selectedSummaryDate)}
                  className="mt-3 bg-purple-600 text-white px-3 py-2 rounded text-sm"
                >
                  Run Summary for {selectedSummaryDate}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border rounded-lg p-4 bg-white shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold">Daily Summaries</h2>

          <div className="flex items-center gap-2">
            <button
              className="border px-3 py-2 rounded"
              onClick={() => {
                const date = new Date(`${selectedSummaryDate}T12:00:00`);
                date.setDate(date.getDate() - 1);
                setSelectedSummaryDate(date.toISOString().split("T")[0]);
              }}
            >
              Previous Day
            </button>

            <input
              type="date"
              className="border p-2 rounded"
              value={selectedSummaryDate}
              onChange={(e) => setSelectedSummaryDate(e.target.value)}
            />

            <button
              className="border px-3 py-2 rounded"
              onClick={() => {
                const date = new Date(`${selectedSummaryDate}T12:00:00`);
                date.setDate(date.getDate() + 1);
                setSelectedSummaryDate(date.toISOString().split("T")[0]);
              }}
            >
              Next Day
            </button>
          </div>
        </div>

        {filteredSummaries.length === 0 ? (
          <p className="text-gray-500">
            No daily summaries found for {selectedSummaryDate}.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredSummaries.map((summary) => (
              <details
                key={summary.SummaryID}
                className="border rounded p-3 bg-gray-50"
              >
                <summary className="cursor-pointer font-medium">
                  {new Date(summary.SummaryDate).toLocaleDateString("en-US", {
                    timeZone: "America/New_York",
                  })}{" "}
                  — Agent #{summary.AgentID}
                </summary>

                <div className="mt-3 text-sm space-y-1">
                  <p>Total Tickets Sold: {summary.TotalTicketsSold}</p>
                  <p>
                    Total OTC Sales: $
                    {Number(summary.TotalOTCSales || 0).toFixed(2)}
                  </p>
                  <p>
                    Sales By Dispenser: $
                    {Number(summary.SalesDollarsByDispenser || 0).toFixed(2)}
                  </p>

                  {summary.DailyControlSummary && (
                    <p className="text-gray-600">
                      {summary.DailyControlSummary}
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="border rounded-lg p-4 bg-white shadow-sm  mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Daily Ticket Count Records</h2>

          <p className="text-sm text-gray-500">
            Showing records for {selectedSummaryDate}
          </p>
        </div>

        {filteredTicketRecords.length === 0 ? (
          <p className="text-gray-500">
            No ticket count records found for {selectedSummaryDate}.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(ticketRecordsByAgent).map(([agentId, records]) => {
              const agentName =
                records[0]?.agent?.AgentName || `Agent #${agentId}`;

              return (
                <div key={agentId} className="border rounded p-3 bg-gray-50">
                  <p className="font-semibold mb-2">
                    {agentName} — {records.length} record
                    {records.length === 1 ? "" : "s"}
                  </p>

                  <div className="space-y-3">
                    {records.map((record) => (
                      <details
                        key={record.RecordID}
                        className="border rounded p-3 bg-white"
                      >
                        <summary className="cursor-pointer font-medium">
                          Record #{record.RecordID} — Dispenser{" "}
                          {record.dispenser?.DispenserNumber ||
                            record.DispenserID}
                        </summary>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <p>
                            Date:{" "}
                            {record.RecordDate
                              ? new Date(record.RecordDate).toLocaleDateString(
                                  "en-US",
                                  { timeZone: "America/New_York" }
                                )
                              : "N/A"}
                          </p>

                          <p>
                            Dispenser:{" "}
                            {record.dispenser?.DispenserNumber || "N/A"}
                          </p>

                          <p>
                            Game:{" "}
                            {record.game
                              ? `${record.game.GameNumber} - ${record.game.GameName}`
                              : "N/A"}
                          </p>

                          <p>
                            Start Ticket: {record.StartTicketNumber ?? "N/A"}
                          </p>

                          <p>
                            Ending Ticket: {record.EndingTicketNumber ?? "N/A"}
                          </p>

                          <p>
                            Tickets Sold: {record.TicketsSold ?? "N/A"}
                          </p>

                          <p>
                            Sold Out Status: {record.SoldOutStatus || "N/A"}
                          </p>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CREATE NEW GAME */}
      <section className="border rounded-lg p-4 bg-white shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Game</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Game Number</label>
            <input
              className="border p-2 w-full rounded"
              type="number"
              value={gameForm.GameNumber}
              onChange={(e) =>
                setGameForm({ ...gameForm, GameNumber: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Game Name</label>
            <input
              className="border p-2 w-full rounded"
              value={gameForm.GameName}
              onChange={(e) =>
                setGameForm({ ...gameForm, GameName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ticket Value</label>
            <input
              className="border p-2 w-full rounded"
              type="number"
              value={gameForm.TicketValue}
              onChange={(e) =>
                setGameForm({ ...gameForm, TicketValue: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pack Number</label>
            <input
              className="border p-2 w-full rounded"
              type="number"
              value={gameForm.PackNumber}
              onChange={(e) =>
                setGameForm({ ...gameForm, PackNumber: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="border p-2 w-full rounded"
              value={gameForm.ActiveGameStatus}
              onChange={(e) =>
                setGameForm({ ...gameForm, ActiveGameStatus: e.target.value })
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Sold Out">Sold Out</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={saveGame}
            className={`text-white px-4 py-2 rounded ${
              editingGameID ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            {editingGameID ? "Save Game Changes" : "Create Game"}
          </button>

          {editingGameID && (
            <button
              onClick={resetGameForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      {/* GAMES */}
      <section className="border rounded-lg p-4 bg-white shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Games</h2>

        {games.length === 0 ? (
          <p className="text-gray-500">No games found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Game Number</th>
                  <th className="border p-2 text-left">Game Name</th>
                  <th className="border p-2 text-left">Ticket Value</th>
                  <th className="border p-2 text-left">Pack Number</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {games.map((game) => (
                  <tr key={game.GameID}>
                    <td className="border p-2">{game.GameNumber}</td>
                    <td className="border p-2">{game.GameName}</td>
                    <td className="border p-2">${game.TicketValue}</td>
                    <td className="border p-2">{game.PackNumber}</td>
                    <td className="border p-2">
                      {game.ActiveGameStatus || "N/A"}
                    </td>
                    <td className="border p-2 whitespace-nowrap">
                    <button
                      onClick={() => startEditGame(game)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteGame(game)}
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

    </main>
  );
}