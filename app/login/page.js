"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");

  useEffect(() => {
    async function loadAgents() {
      const res = await fetch("/api/admin/agents");

      if (!res.ok) return;

      const data = await res.json();
      setAgents(data);

      if (data.length > 0) {
        setSelectedAgentId(String(data[0].AgentID));
      }
    }

    loadAgents();
  }, []);

  function loginCommission() {
    router.push("/dashboard/commission");
  }

  function loginAgent() {
    if (!selectedAgentId) {
      alert("Please select an agent.");
      return;
    }

    router.push(`/dashboard/agent?id=${selectedAgentId}`);
  }

  return (
    <div className="p-10 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6">Mass Lotto Login</h1>

      <button
        onClick={loginCommission}
        className="bg-blue-600 text-white px-4 py-2 w-full mb-4 rounded"
      >
        Login as Commission
      </button>

      <div className="border rounded p-4">
        <label className="block text-sm font-medium mb-2 text-left">
          Select Agent
        </label>

        <select
          className="border p-2 w-full rounded mb-4"
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
        >
          {agents.length === 0 ? (
            <option value="">No agents found</option>
          ) : (
            agents.map((agent) => (
              <option key={agent.AgentID} value={agent.AgentID}>
                {agent.AgentName} — ID #{agent.AgentID}
              </option>
            ))
          )}
        </select>

        <button
          onClick={loginAgent}
          className="bg-green-600 text-white px-4 py-2 w-full rounded"
        >
          Login as Agent
        </button>
      </div>
    </div>
  );
}