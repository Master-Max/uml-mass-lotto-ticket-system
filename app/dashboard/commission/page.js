"use client";

import { useEffect, useState } from "react";

export default function CommissionDashboard() {
  const [games, setGames] = useState([]);
  const [editingGameID, setEditingGameID] = useState(null);

  const [form, setForm] = useState({
    GameName: "",
    GameNumber: "",
    TicketValue: "",
    PackNumber: "",
  });

  useEffect(() => {
    async function loadGames() {
      const res = await fetch("/api/games");

      if (!res.ok) {
        console.error("GET /api/games failed:", await res.text());
        return;
      }

      const data = await res.json();
      setGames(data);
    }

    loadGames();
  }, []);

  function resetForm() {
    setForm({
      GameName: "",
      GameNumber: "",
      TicketValue: "",
      PackNumber: "",
    });
    setEditingGameID(null);
  }

  async function addGame() {
    const res = await fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        CommissionID: 1,
      }),
    });

    if (!res.ok) {
      console.error("POST /api/games failed:", await res.text());
      return;
    }

    const newGame = await res.json();
    setGames([...games, newGame]);
    resetForm();
  }

  function startEdit(game) {
    setEditingGameID(game.GameID);
    setForm({
      GameName: game.GameName,
      GameNumber: game.GameNumber,
      TicketValue: game.TicketValue,
      PackNumber: game.PackNumber,
    });
  }

  async function saveEdit() {
    const res = await fetch("/api/games", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        GameID: editingGameID,
        ...form,
      }),
    });

    if (!res.ok) {
      console.error("PUT /api/games failed:", await res.text());
      return;
    }

    const updatedGame = await res.json();

    setGames(
      games.map((game) =>
        game.GameID === updatedGame.GameID ? updatedGame : game
      )
    );

    resetForm();
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Commission Dashboard</h1>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">
          {editingGameID ? "Edit Game" : "Create Game"}
        </h2>
        <div className="grid grid-cols-4 w-[60vw]">
          <p>Game Name</p>
          <p>Game Number</p>
          <p>Ticket Value</p>
          <p>Pack Number</p>
          <input
            className="border p-2 mr-2 mb-2"
            placeholder="Game Name"
            value={form.GameName}
            onChange={(e) => setForm({ ...form, GameName: e.target.value })}
          />

          <input
            className="border p-2 mr-2 mb-2"
            placeholder="Game Number"
            value={form.GameNumber}
            onChange={(e) =>
              setForm({ ...form, GameNumber: Number(e.target.value) })
            }
          />

          <input
            className="border p-2 mr-2 mb-2"
            placeholder="Ticket Value"
            value={form.TicketValue}
            onChange={(e) =>
              setForm({ ...form, TicketValue: Number(e.target.value) })
            }
          />

          <input
            className="border p-2 mr-2 mb-2"
            placeholder="Pack Number"
            value={form.PackNumber}
            onChange={(e) =>
              setForm({ ...form, PackNumber: Number(e.target.value) })
            }
          />


        </div>
        

        <div>
          {editingGameID ? (
            <>
              <button
                onClick={saveEdit}
                className="bg-green-600 text-white px-3 py-1 mt-2 mr-2"
              >
                Save Changes
              </button>

              <button
                onClick={resetForm}
                className="bg-gray-500 text-white px-3 py-1 mt-2"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={addGame}
              className="bg-blue-500 text-white px-3 py-1 mt-2"
            >
              Add Game
            </button>
          )}
        </div>
      </div>

      <ul>
        {games.map((g) => (
          <li key={g.GameID} className="mb-2">
            {g.GameName} (${g.TicketValue}){" "}
            <button
              onClick={() => startEdit(g)}
              className="bg-yellow-500 text-white px-2 py-1 ml-2"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}