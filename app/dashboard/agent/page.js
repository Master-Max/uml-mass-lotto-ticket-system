"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AgentDashboard() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get("id");

  const [agent, setAgent] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [dispensers, setDispensers] = useState([]);
  const [games, setGames] = useState([]);
  const [summaryIndex, setSummaryIndex] = useState(0);
  const [editingDispenserId, setEditingDispenserId] = useState(null);
  const [dispenserIndex, setDispenserIndex] = useState(0);

  const DISPENSERS_PER_PAGE = 3;

  const visibleDispensers = dispensers.slice(
    dispenserIndex,
    dispenserIndex + DISPENSERS_PER_PAGE
  );

  const [dispenserForm, setDispenserForm] = useState({
    DispenserNumber: "",
    DispenserAssignment: "",
    DispenserLayout: "",
    PositionStatus: "Active",
    GameID: "",
  });

  useEffect(() => {
    if (agentId) {
      loadData(agentId);
    }
  }, [agentId]);

  useEffect(() => {
    setSummaryIndex(0);
  }, [summaries]);

  useEffect(() => {
    setDispenserIndex(0);
  }, [dispensers]);

  async function loadData(id) {
    const [agentRes, summaryRes, dispenserRes, gameRes] = await Promise.all([
      fetch(`/api/agents/${id}`),
      fetch(`/api/summaries?agentId=${id}`),
      fetch(`/api/dispensers?agentId=${id}`),
      fetch(`/api/games`)
    ]);

    if (agentRes.ok) setAgent(await agentRes.json());
    if (summaryRes.ok) setSummaries(await summaryRes.json());
    if (dispenserRes.ok) setDispensers(await dispenserRes.json());
    if (gameRes.ok) setGames( await gameRes.json());
  }

  function resetDispenserForm() {
    setDispenserForm({
      DispenserNumber: "",
      DispenserAssignment: "",
      DispenserLayout: "",
      PositionStatus: "Active",
      GameID: "",
    });

    setEditingDispenserId(null);
  }

  

  async function createDispenser() {
    if (!agentId) {
      alert("Missing agent ID");
      return;
    }

    const res = await fetch("/api/dispensers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...dispenserForm,
        DispenserNumber: Number(dispenserForm.DispenserNumber),
        GameID: Number(dispenserForm.GameID),
        AgentID: Number(agentId),
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

    loadData(agentId);
  }

  function startEditDispenser(dispenser) {
      setEditingDispenserId(dispenser.DispenserID);

      setDispenserForm({
        DispenserNumber: dispenser.DispenserNumber || "",
        DispenserAssignment: dispenser.DispenserAssignment || "",
        DispenserLayout: dispenser.DispenserLayout || "",
        PositionStatus: dispenser.PositionStatus || "Active",
        GameID: dispenser.GameID || "",
      });
    }

  async function updateDispenser() {
    const res = await fetch("/api/dispensers", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        DispenserID: editingDispenserId,
        ...dispenserForm,
        DispenserNumber: Number(dispenserForm.DispenserNumber),
        GameID: dispenserForm.GameID || null,
        AgentID: Number(agentId),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to update dispenser");
      return;
    }

    resetDispenserForm();
    loadData(agentId);
  }

  async function deleteDispenser(dispenserId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this dispenser?"
    );

    if (!confirmed) return;

    const res = await fetch("/api/dispensers", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        DispenserID: dispenserId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete dispenser");
      return;
    }

    loadData(agentId);
  }

  if (!agentId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Missing Agent ID</h1>
        <p className="text-gray-600">
          Use a URL like <code>/dashboard/agent?id=1</code>
        </p>
      </div>
    );
  }

  function generateGameOptions() {
    return [
      <option key="empty" value="">
        Select a game
      </option>,
      ...games.map((game) => (
        <option key={game.GameID} value={game.GameID}>
          {game.GameNumber} - {game.GameName} (${game.TicketValue})
        </option>
      )),
    ];
  }

  return (
    <div className="p-6">
      <div className="flex gap-4">
        <h1 className="text-xl font-bold">
          {agent ? agent.AgentName : "Agent Dashboard"}
        </h1>

        <p className="text-sm text-gray-600 align-bottom">
          {agent?.Location || "No location listed"}
        </p>

        {agent?.commission && (
          <p className="text-sm text-gray-600">
            Commission: {agent.commission.CommissionName}
          </p>
        )}
      </div>


      <header>
        <section className="border p-4 rounded mb-6 w-full">
          <h2 className="font-semibold mb-3">Reports</h2>
          <div className="flex justify-start p-2">
            <h3 className="m-2">Total Assigned Dispensers: {dispensers.length}</h3>
            <h3 className="m-2">Total Prior Daily Summaries: {summaries.length}</h3>
          </div>
        </section>

        <section className="border p-4 rounded mb-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Daily Summaries</h2>

            {summaries.length > 0 && (
              <p className="text-sm text-gray-500">
                {summaryIndex + 1} of {summaries.length}
              </p>
            )}
          </div>

          {summaries.length === 0 ? (
            <div className="border p-4 rounded text-gray-500">
              No daily summaries found.
            </div>
          ) : (
            <div className="border p-4 rounded bg-white shadow-sm">
              <div className="grid grid-cols-3">
                <p>
                  Date:{" "}
                  {new Date(summaries[summaryIndex].SummaryDate).toLocaleDateString()}
                </p>

                <p>Tickets Sold: {summaries[summaryIndex].TotalTicketsSold}</p>

                <p>
                  Sales: ${Number(summaries[summaryIndex].TotalOTCSales).toFixed(2)}
                </p>
              </div>

              {summaries[summaryIndex].DailyControlSummary && (
                <p className="mt-2 text-sm text-gray-600">
                  {summaries[summaryIndex].DailyControlSummary}
                </p>
              )}

              <div className="flex justify-between mt-4">
                <button
                  className="border px-3 py-2 rounded disabled:opacity-50"
                  disabled={summaries.length <= 1}
                  onClick={() =>
                    setSummaryIndex((current) =>
                      current === 0 ? summaries.length - 1 : current - 1
                    )
                  }
                >
                  Previous
                </button>

                <button
                  className="border px-3 py-2 rounded disabled:opacity-50"
                  disabled={summaries.length <= 1}
                  onClick={() =>
                    setSummaryIndex((current) =>
                      current === summaries.length - 1 ? 0 : current + 1
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </header>

      <main className="flex gap-8">
        {/* CREATE DISPENSER CARD */}
        <section className="border p-4 rounded mb-6 grid justify-center w-fit">
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

          <select
            className="border p-2 mb-2 w-full"
            value={dispenserForm.GameID}
            onChange={(e) =>
              setDispenserForm({
                ...dispenserForm,
                GameID: e.target.value,
              })
            }
          >
            {generateGameOptions()}
            {/* <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Empty">Empty</option> */}
          </select>

          <div className="flex gap-2">
            {editingDispenserId ? (
              <>
                <button
                  onClick={updateDispenser}
                  className="bg-green-600 text-white px-3 py-2 rounded hover:cursor-pointer hover:bg-green-500"
                >
                  Save Changes
                </button>

                <button
                  onClick={resetDispenserForm}
                  className="bg-gray-500 text-white px-3 py-2 rounded hover:cursor-pointer hover:bg-gray-400"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={createDispenser}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:cursor-pointer hover:bg-blue-500"
              >
                Create Dispenser
              </button>
            )}
          </div>
        </section>
        
        {/* VIEW DISPENSERS CARDS */}
        <section className="border p-4 rounded mb-6 w-full">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Dispensers</h2>

            {dispensers.length > 0 && (
              <p className="text-sm text-gray-500">
                {Math.floor(dispenserIndex / DISPENSERS_PER_PAGE) + 1} of{" "}
                {Math.ceil(dispensers.length / DISPENSERS_PER_PAGE)}
              </p>
            )}
          </div>

          {dispensers.length === 0 ? (
            <div className="text-gray-500">No dispensers found.</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {visibleDispensers.map((d) => (
                  <div key={d.DispenserID} className="border p-3 rounded">
                    <p>Dispenser #{d.DispenserNumber}</p>
                    <p>Assignment: {d.DispenserAssignment || "N/A"}</p>
                    <p>Layout: {d.DispenserLayout || "N/A"}</p>
                    <p>Status: {d.PositionStatus}</p>
                    <p>
                      Game:{" "}
                      {d.game
                        ? `${d.game.GameNumber} - ${d.game.GameName}`
                        : "N/A"}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => startEditDispenser(d)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-400"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteDispenser(d.DispenserID)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-4">
                <button
                  className="border px-3 py-2 rounded disabled:opacity-50"
                  disabled={dispensers.length <= DISPENSERS_PER_PAGE}
                  onClick={() =>
                    setDispenserIndex((current) =>
                      current - DISPENSERS_PER_PAGE < 0
                        ? Math.max(
                            0,
                            dispensers.length - DISPENSERS_PER_PAGE
                          )
                        : current - DISPENSERS_PER_PAGE
                    )
                  }
                >
                  Previous
                </button>

                <button
                  className="border px-3 py-2 rounded disabled:opacity-50"
                  disabled={dispensers.length <= DISPENSERS_PER_PAGE}
                  onClick={() =>
                    setDispenserIndex((current) =>
                      current + DISPENSERS_PER_PAGE >= dispensers.length
                        ? 0
                        : current + DISPENSERS_PER_PAGE
                    )
                  }
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </main>


    </div>
  );
}