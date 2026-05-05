"use client";

import { act, useEffect, useState } from "react";
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
  const [ticketRecords, setTicketRecords] = useState([]);
  const [selectedReportDate, setSelectedReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSummaryDate, setSelectedSummaryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [reportFilter, setReportFilter] = useState("complete");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  
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

  const summariesForSelectedDate = summaries.filter((summary) => {
    const summaryDate = new Date(summary.SummaryDate).toLocaleDateString("en-CA", {
      timeZone: "America/New_York",
    });

    return summaryDate === selectedSummaryDate;
  });

  const selectedSummary = summariesForSelectedDate[0];

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
    const [agentRes, summaryRes, dispenserRes, gameRes, ticketRes] = await Promise.all([
      fetch(`/api/agents/${id}`),
      fetch(`/api/summaries?agentId=${id}`),
      fetch(`/api/dispensers?agentId=${id}`),
      fetch(`/api/games`),
      fetch(`/api/ticket-counts/${id}`)
    ]);

    if (agentRes.ok) setAgent(await agentRes.json());
    if (summaryRes.ok) setSummaries(await summaryRes.json());
    if (dispenserRes.ok) setDispensers(await dispenserRes.json());
    if (gameRes.ok) setGames( await gameRes.json());
    if (ticketRes.ok) setTicketRecords( await ticketRes.json());
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

  function formatDateInput(date) {
    return date.toISOString().split("T")[0];
  }

  function changeSummaryDate(days) {
    const currentDate = new Date(`${selectedSummaryDate}T12:00:00`);
    currentDate.setDate(currentDate.getDate() + days);
    setSelectedSummaryDate(currentDate.toISOString().split("T")[0]);
  }

  function changeReportDate(days) {
    const currentDate = new Date(selectedReportDate);
    currentDate.setDate(currentDate.getDate() + days);
    setSelectedReportDate(formatDateInput(currentDate));
    setExpandedReportId(null);
  }

  function isSameReportDate(recordDate, selectedDate) {
    return new Date(recordDate).toISOString().split("T")[0] === selectedDate;
  }

  const reportsForSelectedDate = ticketRecords.filter((record) =>
    isSameReportDate(record.RecordDate, selectedReportDate)
  );

  // function isCompleteReport(record) {
  //   return (
  //     record.RecordDate &&
  //     record.StartTicketNumber !== null &&
  //     record.EndingTicketNumber !== null &&
  //     record.SoldOutStatus &&
  //     record.TicketsSold !== null &&
  //     record.DispenserID &&
  //     record.GameID &&
  //     record.AgentID
  //   );
  // }

  function getReportStatus(record) {
    if (record.isFake) return "todo";

    const hasRequiredFields =
      record.RecordDate &&
      record.StartTicketNumber !== null &&
      record.EndingTicketNumber !== null &&
      record.TicketsSold !== null &&
      record.DispenserID &&
      record.GameID &&
      record.AgentID;

    if (!hasRequiredFields) return "started";

    return "complete";
  }

  function getReportsForDate() {
    const realReports = ticketRecords.filter((record) =>
      isSameReportDate(record.RecordDate, selectedReportDate)
    );

    const todoReports = dispensers
      .filter((dispenser) => {
        return !realReports.some(
          (record) => record.DispenserID === dispenser.DispenserID
        );
      })
      .map((dispenser) => ({
        isFake: true,
        RecordID: `todo-${dispenser.DispenserID}`,
        RecordDate: selectedReportDate,
        StartTicketNumber: "",
        EndingTicketNumber: "",
        SoldOutStatus: "Started",
        TicketsSold: "",
        SummaryID: "",
        DispenserID: dispenser.DispenserID,
        GameID: dispenser.GameID || "",
        AgentID: Number(agentId),
        dispenser,
        game: dispenser.game || null,
      }));

    if (reportFilter === "todo") {
      return todoReports;
    }

    const allReports = [...realReports];

    if (reportFilter === "complete") {
      return allReports.filter((r) => getReportStatus(r) === "complete");
    }

    if (reportFilter === "started") {
      return allReports.filter((r) => getReportStatus(r) === "started");
    }

    return allReports;
  }

  const filteredReports = getReportsForDate();
  console.log(filteredReports)

  function openReportModal(report) {
    setActiveReport({
      ...report,
      RecordDate: report.RecordDate
        ? new Date(report.RecordDate).toISOString().split("T")[0]
        : selectedReportDate,

      StartTicketNumber: report.StartTicketNumber ?? "",
      EndingTicketNumber: report.EndingTicketNumber ?? "",
      TicketsSold: report.TicketsSold ?? "",
      SoldOutStatus: report.SoldOutStatus ?? "",
      SummaryID: report.SummaryID ?? "",
      GameID: report.GameID ?? "",
    });

    setReportModalOpen(true);
  }

  function calculateTicketsSold (startNum, endNum){
    if(!!startNum && !!endNum){
      return(Number(startNum)-Number(endNum))
    }else{
      return(null)
    }
  }

  async function saveReport() {
    const isCreate = activeReport.isFake;

    // console.log(activeReport.StartTicketNumber)
    // console.log(!!activeReport.StartTicketNumber)
    // console.log(activeReport.EndingTicketNumber)
    // console.log(!!activeReport.EndingTicketNumber)
    console.log(activeReport.DispenserID)

    const res = await fetch("/api/ticket-counts", {
      method: isCreate ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        RecordID: activeReport.RecordID,
        RecordDate: activeReport.RecordDate,
        StartTicketNumber: activeReport.StartTicketNumber? Number(activeReport.StartTicketNumber) : null,
        EndingTicketNumber: activeReport.EndingTicketNumber? Number(activeReport.EndingTicketNumber) : null,
        SoldOutStatus: activeReport.SoldOutStatus,
        TicketsSold: calculateTicketsSold(activeReport.StartTicketNumber, activeReport.EndingTicketNumber),
        SummaryID: activeReport.SummaryID || null,
        DispenserID: Number(activeReport.DispenserID),
        GameID: Number(activeReport.GameID),
        AgentID: Number(agentId),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to save report");
      return;
    }

    setReportModalOpen(false);
    setActiveReport(null);
    loadData(agentId);
  }

  return (
    <div className="p-6">

      {/* Agent Identifiaction Header */}
      <div className="flex gap-4">
        <h1 className="text-xl font-bold">
          {agent ? agent.AgentName : "Agent Dashboard"}
        </h1>

        <p className="text-sm text-gray-600 align-bottom">
          {"Location: " + agent?.Location || "No location listed"}
        </p>

        {agent?.commission && (
          <p className="text-sm text-gray-600">
            Commission: {agent.commission.CommissionName}
          </p>
        )}
      </div>

      {/* Reports and Daily Summaries */}
      <div>
        {/* AGENT DATA */}
        <section className="border p-4 rounded mb-6 w-full">
          <h2 className="font-semibold mb-3">Agent Data</h2>
          <div className="flex justify-start p-2">
            <h3 className="m-2">Total Assigned Dispensers: {dispensers.length}</h3>
            <h3 className="m-2">Total Prior Daily Summaries: {summaries.length}</h3>
          </div>
        </section>

        {/* REPORTS */}
        <section className="border p-4 rounded mb-6 w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <h2 className="font-semibold">Daily Summary</h2>

              <div className="flex items-center gap-2">
                <button
                  className="border px-3 py-2 rounded"
                  onClick={() => changeSummaryDate(-1)}
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
                  onClick={() => changeSummaryDate(1)}
                >
                  Next Day
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Showing summary for {selectedReportDate}
            </p>
          </div>

          {!selectedSummary ? (
            <div className="border p-4 rounded text-gray-500">
              No daily summary found for {selectedSummaryDate}..
            </div>
          ) : (
            <details className="border p-4 rounded bg-white shadow-sm">
              <summary className="cursor-pointer list-none">
                <div className="grid grid-cols-3 gap-4">
                  <p>
                    Date:{" "}
                    {new Date(selectedSummary.SummaryDate).toLocaleDateString(
                      "en-US",
                      { timeZone: "America/New_York" }
                    )}
                  </p>

                  <p>Tickets Sold: {selectedSummary.TotalTicketsSold}</p>

                  <p>
                    Sales: ${Number(selectedSummary.TotalOTCSales).toFixed(2)}
                  </p>
                </div>

                <p className="mt-2 text-sm text-blue-600">
                  Click to expand summary details
                </p>
              </summary>

              <div className="border-t mt-4 pt-4 text-sm space-y-2">
                <p>
                  <span className="font-medium">Summary ID:</span>{" "}
                  {selectedSummary.SummaryID}
                </p>

                <p>
                  <span className="font-medium">Sales by Dispenser:</span> $
                  {Number(selectedSummary.SalesDollarsByDispenser || 0).toFixed(2)}
                </p>

                <p>
                  <span className="font-medium">Total OTC Sales:</span> $
                  {Number(selectedSummary.TotalOTCSales || 0).toFixed(2)}
                </p>

                <p>
                  <span className="font-medium">Total Tickets Sold:</span>{" "}
                  {selectedSummary.TotalTicketsSold}
                </p>

                {selectedSummary.commission && (
                  <p>
                    <span className="font-medium">Commission:</span>{" "}
                    {selectedSummary.commission.CommissionName}
                  </p>
                )}

                {selectedSummary.agent && (
                  <p>
                    <span className="font-medium">Agent:</span>{" "}
                    {selectedSummary.agent.AgentName}
                  </p>
                )}

                {selectedSummary.DailyControlSummary && (
                  <div className="border rounded p-3 bg-gray-50 mt-3">
                    <p className="font-medium mb-1">Daily Control Summary</p>
                    <p className="text-gray-600">
                      {selectedSummary.DailyControlSummary}
                    </p>
                  </div>
                )}

                {selectedSummary.ticketCountRecords?.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Linked Ticket Count Records</p>

                    <div className="space-y-2">
                      {selectedSummary.ticketCountRecords.map((record) => (
                        <div
                          key={record.RecordID}
                          className="border rounded p-3 bg-gray-50"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <p>Record #{record.RecordID}</p>
                            <p>Dispenser #{record.DispenserID}</p>
                            <p>Game #{record.GameID}</p>
                            <p>Tickets Sold: {record.TicketsSold ?? "N/A"}</p>
                            <p>Start: {record.StartTicketNumber ?? "N/A"}</p>
                            <p>End: {record.EndingTicketNumber ?? "N/A"}</p>
                            <p>Status: {record.SoldOutStatus || "N/A"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          )}
        </section>
      </div>

      {/* DAILY TICKET REPORTS */}
      <div>
        {/* <section className="border p-4 rounded mb-6">
          <h2 className="font-semibold mb-3">Today's Reports</h2>
          {ticketRecords.length}
          {JSON.stringify(ticketRecords[0])}
        </section> */}
        <section className="border p-4 rounded mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Daily Ticket Reports</h2>
            <div className="flex gap-4">
              <p className="text-sm text-gray-500">
                {reportsForSelectedDate.length} report
                {reportsForSelectedDate.length === 1 ? "" : "s"} completed or started
              </p>
              <p className="text-sm text-gray-500">
                {dispensers.length - reportsForSelectedDate.length} report
                {dispensers.length - reportsForSelectedDate.length === 1 ? "" : "s"} todo
              </p>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => changeReportDate(-1)}
                className="border px-3 py-2 rounded hover:bg-gray-100"
              >
                Previous Day
              </button>

              <input
                type="date"
                className="border px-3 py-2 rounded"
                value={selectedReportDate}
                onChange={(e) => {
                  setSelectedReportDate(e.target.value);
                  setExpandedReportId(null);
                }}
              />

              <button
                onClick={() => changeReportDate(1)}
                className="border px-3 py-2 rounded hover:bg-gray-100"
              >
                Next Day
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setReportFilter("complete")}
                className={`border px-3 py-2 rounded ${
                  reportFilter === "complete" ? "bg-blue-600 text-white" : ""
                }`}
              >
                Complete Reports
              </button>

              <button
                onClick={() => setReportFilter("started")}
                className={`border px-3 py-2 rounded ${
                  reportFilter === "started" ? "bg-blue-600 text-white" : ""
                }`}
              >
                Started Reports
              </button>

              <button
                onClick={() => setReportFilter("todo")}
                className={`border px-3 py-2 rounded ${
                  reportFilter === "todo" ? "bg-blue-600 text-white" : ""
                }`}
              >
                ToDo Reports
              </button>
            </div>

          </div>
            
            
            <p className="text-sm text-gray-500 mb-3">
              {filteredReports.length} report{filteredReports.length === 1 ? "" : "s"} found
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredReports.map((record) => {
              const status = getReportStatus(record);
              const isComplete = status === "complete";

              return (
                <div key={record.RecordID} className="border rounded p-3 bg-white shadow-sm">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold">
                        {record.isFake
                          ? "ToDo Report"
                          : `Report D-${record.dispenser?.DispenserNumber}`}
                      </p>

                      <p className="text-sm text-gray-600">
                        Dispenser #{record.dispenser?.DispenserNumber || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        status === "complete"
                          ? "bg-green-100 text-green-700"
                          : status === "started"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {status === "complete"
                        ? "Complete"
                        : status === "started"
                        ? "Started"
                        : "To Do"}
                    </span>
                  </div>

                  <div className="mt-3 text-sm space-y-1">
                    <p>
                      Game:{" "}
                      {record.game
                        ? `${record.game.GameNumber} - ${record.game.GameName}`
                        : "N/A"}
                    </p>

                    <p>
                      Date:{" "}
                      {(() => {
                        const dateStr = record.recordDate || selectedReportDate; // "2026-05-04"
                        const [year, month, day] = dateStr.split("-");

                        const localDate = new Date(year, month - 1, day); // LOCAL time

                        return localDate.toLocaleDateString("en-US", {
                          timeZone: "America/New_York",
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        }).replace(/\//g, "-");
                      })()}
                    </p>
                    {/* <p>Test: {record.RecordDate}</p>
                    <p>Test2: {selectedReportDate}</p> */}
                  </div>

                  {isComplete && (
                    <div className="border-t mt-3 pt-3 text-sm space-y-1">
                      <p className="font-medium">Completed Report Details</p>

                      <p>Start Ticket: {record.StartTicketNumber}</p>
                      <p>Ending Ticket: {record.EndingTicketNumber}</p>
                      <p>Tickets Sold: {record.TicketsSold}</p>

                      {record.game && (
                        <>
                          <p>Ticket Value: ${record.game.TicketValue}</p>
                          <p>
                            Estimated Sales: $
                            {(Number(record.TicketsSold) * Number(record.game.TicketValue)).toFixed(2)}
                          </p>
                          <p>Pack Number: {record.game.PackNumber}</p>
                        </>
                      )}

                      <p>Sold Out Status: {record.SoldOutStatus || "N/A"}</p>

                      {record.summary && (
                        <p>Linked Summary: #{record.summary.SummaryID}</p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => openReportModal(record)}
                    className="mt-3 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-500"
                  >
                    {record.isFake ? "Create Report" : "Update Report"}
                  </button>
                </div>
              );
            })}
            </div>
        </section>
      </div>

      {/* Dispenser Functions  */}
      <div className="flex gap-8">
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
              {visibleDispensers.map((d) => {
                const latestRecord = ticketRecords
                  .filter((r) => r.DispenserID === d.DispenserID)
                  .sort((a, b) => new Date(b.RecordDate) - new Date(a.RecordDate))[0];

                return (
                  <div
                    key={d.DispenserID}
                    className="border p-4 rounded bg-white shadow-sm flex flex-col justify-between"
                  >
                    {/* HEADER */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">
                        Dispenser #{d.DispenserNumber}
                      </h3>

                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          d.PositionStatus === "Active"
                            ? "bg-green-100 text-green-700"
                            : d.PositionStatus === "Inactive"
                            ? "bg-gray-200 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {d.PositionStatus}
                      </span>
                    </div>

                    {/* BASIC INFO */}
                    <div className="text-sm space-y-1 mb-3">
                      <p>
                        <span className="font-medium">Assignment:</span>{" "}
                        {d.DispenserAssignment || "N/A"}
                      </p>

                      <p>
                        <span className="font-medium">Layout:</span>{" "}
                        {d.DispenserLayout || "N/A"}
                      </p>
                    </div>

                    {/* GAME INFO */}
                    <div className="border-t pt-2 mt-2 text-sm space-y-1">
                      <p className="font-medium">Game</p>

                      {d.game ? (
                        <>
                          <p>
                            #{d.game.GameNumber} - {d.game.GameName}
                          </p>
                          <p>Value: ${d.game.TicketValue}</p>
                          <p>Pack: {d.game.PackNumber}</p>
                        </>
                      ) : (
                        <p className="text-gray-500">No game assigned</p>
                      )}
                    </div>

                    {/* LATEST REPORT */}
                    <div className="border-t pt-2 mt-2 text-sm">
                      <p className="font-medium">Latest Activity</p>

                      {latestRecord ? (
                        <>
                          <p>
                            {new Date(latestRecord.RecordDate).toLocaleDateString()}
                          </p>
                          <p>Sold: {latestRecord.TicketsSold ?? "N/A"}</p>
                          <p>
                            Tickets: {latestRecord.StartTicketNumber ?? "-"} →{" "}
                            {latestRecord.EndingTicketNumber ?? "-"}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500">No records yet</p>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2 mt-4">
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
                );
              })}
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
      </div>

      {reportModalOpen && activeReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-lg">
            <h2 className="font-semibold text-lg mb-4">
              {activeReport.isFake ? "Create Report" : "Update Report"}
            </h2>

            <input
              type="date"
              className="border p-2 mb-2 w-full"
              value={activeReport.RecordDate}
              onChange={(e) =>
                setActiveReport({ ...activeReport, RecordDate: e.target.value })
              }
            />

            <input
              className="border p-2 mb-2 w-full"
              placeholder="Start Ticket Number"
              value={activeReport.StartTicketNumber}
              onChange={(e) =>
                setActiveReport({
                  ...activeReport,
                  StartTicketNumber: e.target.value,
                })
              }
            />

            <input
              className="border p-2 mb-2 w-full"
              placeholder="Ending Ticket Number"
              value={activeReport.EndingTicketNumber}
              onChange={(e) =>
                setActiveReport({
                  ...activeReport,
                  EndingTicketNumber: e.target.value,
                })
              }
            />

            {/* <input
              className="border p-2 mb-2 w-full"
              placeholder="Tickets Sold"
              value={activeReport.TicketsSold}
              onChange={(e) =>
                setActiveReport({
                  ...activeReport,
                  TicketsSold: e.target.value,
                })
              }
            /> */}

            {/* <select
              className="border p-2 mb-2 w-full"
              value={activeReport.SoldOutStatus}
              onChange={(e) =>
                setActiveReport({
                  ...activeReport,
                  SoldOutStatus: e.target.value,
                })
              }
            >
              <option value="Started">Started</option>
              <option value="Complete">Complete</option>
              <option value="Sold Out">Sold Out</option>
            </select> */}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setReportModalOpen(false);
                  setActiveReport(null);
                }}
                className="border px-3 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={saveReport}
                className="bg-green-600 text-white px-3 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}